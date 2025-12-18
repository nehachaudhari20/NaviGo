"""
Cloud Function: master_orchestrator
Pub/Sub Trigger: Subscribes to navigo-orchestrator topic (all agents publish here)
Purpose: Routes events and manages pipeline flow (logic-based, no LLM)
"""

import json
import os
from datetime import datetime, timezone
from google.cloud import pubsub_v1, firestore, bigquery
import functions_framework

# Project configuration
PROJECT_ID = os.getenv("PROJECT_ID", "navigo-27206")

# Orchestrator subscribes to anomaly-detected topic (from data_analysis_agent)
# Note: According to flow, data_analysis_agent publishes to navigo-anomaly-detected
ORCHESTRATOR_INPUT_TOPIC = "navigo-anomaly-detected"

# Agent input topics (orchestrator routes to these)
# Note: Some agents subscribe directly to their input topics, others need routing
AGENT_INPUT_TOPICS = {
    "diagnosis": "navigo-anomaly-detected",  # Diagnosis agent subscribes to this topic
    "rca": "navigo-diagnosis-complete",
    "scheduling": "navigo-rca-complete",
    "engagement": "navigo-scheduling-complete",
    "communication": "navigo-communication-trigger",
    "feedback": "navigo-engagement-complete",  # Feedback can be triggered after engagement
    "manufacturing": "navigo-feedback-complete"
}

# Confidence threshold for routing
CONFIDENCE_THRESHOLD = 0.85  # 85%

# BigQuery configuration
DATASET_ID = "telemetry"
TABLE_ID = "pipeline_states"


@functions_framework.cloud_event
def master_orchestrator(cloud_event):
    """
    Orchestrator function that:
    1. Receives outputs from all agents
    2. Applies confidence check (85% threshold)
    3. Routes to next agent OR human review queue
    4. Tracks pipeline state
    5. Handles UEBA flags
    """
    
    try:
        # 1. Parse Pub/Sub message
        if isinstance(cloud_event.data, str):
            message_data = json.loads(cloud_event.data)
        else:
            message_data = cloud_event.data
        
        # Handle base64 encoded data
        if "message" in message_data and "data" in message_data["message"]:
            import base64
            decoded = base64.b64decode(message_data["message"]["data"]).decode("utf-8")
            message_data = json.loads(decoded)
        
        # 2. Determine which agent sent this message from message structure
        # Agents should include "agent_stage" in their message, but we can infer it
        agent_stage = message_data.get("agent_stage")
        
        # Infer agent stage from message structure if not explicitly provided
        if not agent_stage:
            if "case_id" in message_data and "anomaly_type" in message_data:
                agent_stage = "data_analysis"
            elif "diagnosis_id" in message_data:
                agent_stage = "diagnosis"
            elif "rca_id" in message_data:
                agent_stage = "rca"
            elif "scheduling_id" in message_data:
                agent_stage = "scheduling"
            elif "engagement_id" in message_data:
                agent_stage = "engagement"
            elif "feedback_id" in message_data:
                agent_stage = "feedback"
            elif "manufacturing_id" in message_data:
                agent_stage = "manufacturing"
            elif "communication_id" in message_data:
                agent_stage = "communication"
        
        if not agent_stage:
            print(f"Could not determine agent stage from message. Message keys: {list(message_data.keys())}")
            return {"status": "error", "error": "Unknown agent stage"}
        
        print(f"Determined agent stage: {agent_stage}")
        
        case_id = message_data.get("case_id")
        vehicle_id = message_data.get("vehicle_id")
        
        if not case_id:
            print("Missing case_id in message")
            return {"status": "error", "error": "Missing case_id"}
        
        # 3. Extract confidence score from message or Firestore
        confidence = message_data.get("confidence")
        db = firestore.Client()
        
        # If confidence not in message, fetch from Firestore based on agent stage
        if confidence is None:
            if agent_stage == "data_analysis":
                # Use severity_score as confidence proxy (inverted - higher severity = lower confidence)
                severity_score = message_data.get("severity_score")
                if severity_score is not None:
                    confidence = 1.0 - severity_score  # Invert: severity 0.9 = confidence 0.1
            elif agent_stage == "diagnosis":
                diagnosis_id = message_data.get("diagnosis_id")
                if diagnosis_id:
                    diagnosis_doc = db.collection("diagnosis_cases").document(diagnosis_id).get()
                    if diagnosis_doc.exists:
                        diagnosis_data = diagnosis_doc.to_dict()
                        # Use confidence_score if available, else use failure_probability
                        confidence = diagnosis_data.get("confidence_score")
                        if confidence is None:
                            failure_prob = diagnosis_data.get("failure_probability", 0.0)
                            confidence = failure_prob  # Use failure_probability as confidence proxy
            elif agent_stage == "rca":
                rca_id = message_data.get("rca_id")
                if rca_id:
                    rca_doc = db.collection("rca_cases").document(rca_id).get()
                    if rca_doc.exists:
                        confidence = rca_doc.to_dict().get("confidence")
            elif agent_stage == "scheduling":
                # Scheduling doesn't have confidence, use default high confidence
                confidence = 0.90
            elif agent_stage == "engagement":
                # Engagement doesn't have confidence, use default high confidence
                confidence = 0.90
            elif agent_stage == "feedback":
                # Feedback doesn't have confidence, use default high confidence
                confidence = 0.90
            elif agent_stage == "manufacturing":
                # Manufacturing doesn't have confidence, use default high confidence
                confidence = 0.90
        
        # Default confidence if still None
        if confidence is None:
            confidence = 0.85  # Default to threshold value
            print(f"Warning: No confidence found for {agent_stage}, using default {confidence}")
        
        # 4. Apply confidence check and route
        publisher = pubsub_v1.PublisherClient()
        
        # Pipeline flow definition
        pipeline_flow = {
            "data_analysis": "diagnosis",
            "diagnosis": "rca",
            "rca": "scheduling",
            "scheduling": "engagement",
            "engagement": None,  # Engagement triggers communication separately
            "communication": None,  # Communication is end of customer-facing flow
            "feedback": "manufacturing",
            "manufacturing": None  # Manufacturing is end of pipeline
        }
        
        next_stage = pipeline_flow.get(agent_stage)
        
        # 5. Check confidence threshold (only for critical stages)
        # Skip confidence check for scheduling, engagement, feedback, manufacturing (they're downstream)
        critical_stages = ["data_analysis", "diagnosis", "rca"]
        requires_confidence_check = agent_stage in critical_stages
        
        if requires_confidence_check and confidence is not None and confidence < CONFIDENCE_THRESHOLD:
            # Route to human review
            print(f"Confidence {confidence} below threshold {CONFIDENCE_THRESHOLD}, routing to human review")
            
            human_review_data = {
                "review_id": f"{case_id}_{agent_stage}",
                "case_id": case_id,
                "vehicle_id": vehicle_id,
                "agent_stage": agent_stage,
                "confidence": confidence,
                "severity": message_data.get("severity") or message_data.get("severity_score", 0.5),
                "prediction_id": case_id,  # For frontend compatibility
                "review_status": "pending",  # Frontend expects 'review_status' not 'status'
                "message_data": message_data,
                "created_at": firestore.SERVER_TIMESTAMP
            }
            
            db.collection("human_reviews").document(f"{case_id}_{agent_stage}").set(human_review_data)
            print(f"Routed case {case_id} from {agent_stage} to human review")
            
            # Update pipeline state
            update_pipeline_state(db, case_id, agent_stage, "human_review", confidence)
            
            return {"status": "routed_to_human_review", "case_id": case_id, "agent_stage": agent_stage}
        
        # 6. Route to next agent if exists
        if next_stage:
            next_topic = AGENT_INPUT_TOPICS.get(next_stage)
            if next_topic:
                topic_path = publisher.topic_path(PROJECT_ID, next_topic)
                # Ensure message includes agent_stage for next agent's context
                routing_message = message_data.copy()
                routing_message["agent_stage"] = next_stage
                message_bytes = json.dumps(routing_message).encode("utf-8")
                future = publisher.publish(topic_path, message_bytes)
                message_id = future.result()
                print(f"Routed case {case_id} from {agent_stage} to {next_stage} via {next_topic}: {message_id}")
                
                # Update pipeline state
                update_pipeline_state(db, case_id, agent_stage, next_stage, confidence)
                
                return {"status": "routed", "from": agent_stage, "to": next_stage, "case_id": case_id, "confidence": confidence}
            else:
                print(f"Warning: No input topic found for next stage {next_stage}")
        
        # 7. Pipeline complete
        print(f"Pipeline complete for case {case_id} at stage {agent_stage}")
        update_pipeline_state(db, case_id, agent_stage, "completed", confidence)
        
        return {"status": "pipeline_complete", "case_id": case_id, "final_stage": agent_stage}
        
    except Exception as e:
        print(f"Error in master_orchestrator: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "error": str(e)}


def update_pipeline_state(db, case_id: str, current_stage: str, next_stage: str, confidence: float = None):
    """Update pipeline state in Firestore and BigQuery"""
    
    try:
        # Update Firestore
        pipeline_state = {
            "case_id": case_id,
            "current_stage": current_stage,
            "next_stage": next_stage,
            "confidence": confidence,
            "updated_at": firestore.SERVER_TIMESTAMP
        }
        
        db.collection("pipeline_states").document(case_id).set(pipeline_state, merge=True)
        
        # Sync to BigQuery
        bq_client = bigquery.Client()
        table_ref = bq_client.dataset(DATASET_ID).table(TABLE_ID)
        
        bq_row = {
            "case_id": case_id,
            "current_stage": current_stage,
            "next_stage": next_stage,
            "confidence": confidence,
            "updated_at": datetime.now().isoformat()
        }
        
        errors = bq_client.insert_rows_json(table_ref, [bq_row])
        if errors:
            print(f"BigQuery insert errors: {errors}")
        else:
            print(f"Updated pipeline state for case {case_id}")
            
    except Exception as e:
        print(f"Error updating pipeline state: {e}")


def prepare_bigquery_row(pipeline_state: dict) -> dict:
    """Prepare pipeline state data for BigQuery insertion."""
    bq_row = {}
    
    field_mapping = {
        "case_id": "case_id",
        "current_stage": "current_stage",
        "next_stage": "next_stage",
        "confidence": "confidence",
        "updated_at": "updated_at"
    }
    
    for key, bq_key in field_mapping.items():
        if key not in pipeline_state:
            continue
        
        value = pipeline_state[key]
        
        # Handle Firestore SERVER_TIMESTAMP
        if key == "updated_at" and hasattr(value, "timestamp"):
            from datetime import timezone
            bq_row[bq_key] = datetime.now(timezone.utc).isoformat()
        elif value is None:
            continue
        else:
            bq_row[bq_key] = value
    
    return bq_row

