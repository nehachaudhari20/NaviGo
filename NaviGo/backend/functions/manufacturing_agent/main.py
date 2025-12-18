"""
Cloud Function: manufacturing_agent
Pub/Sub Trigger: Subscribes to navigo-feedback-complete topic
Purpose: Generates CAPA insights for manufacturing using Gemini 2.5 Flash
"""

import json
import os
import uuid
import re
from datetime import datetime
from google.cloud import pubsub_v1, firestore, bigquery
import functions_framework
import vertexai
from vertexai.preview.generative_models import GenerativeModel

# Vertex AI configuration
PROJECT_ID = os.getenv("PROJECT_ID", "navigo-27206")
LOCATION = os.getenv("LOCATION", "us-central1")

# Pub/Sub configuration
MANUFACTURING_TOPIC_NAME = "navigo-manufacturing-complete"

# BigQuery configuration
DATASET_ID = "telemetry"
TABLE_ID = "manufacturing_cases"

# System prompt for Manufacturing Agent
SYSTEM_PROMPT = """You are a Manufacturing Agent for NaviGo. You MUST use ONLY the Gemini 2.5 Flash model (gemini-2.5-flash) to generate CAPA (Corrective and Preventive Actions) insights for vehicle manufacturers.

CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. You will receive root cause, CEI score, and recurrence count for a vehicle issue
2. Analyze if this indicates a manufacturing quality problem
3. Generate specific, actionable CAPA recommendations
4. Assess severity based on recurrence and impact
5. DO NOT HALLUCINATE - Base insights on the ACTUAL data provided
6. Return EXACTLY the JSON format specified below - no extra fields, no markdown

ISSUE SUMMARY:
- Summarize the root cause in a clear, concise manner
- Focus on the manufacturing/design aspect
- Format: "[Component/System] issue: [Brief description]"
- Example: "Coolant pump failure: Premature wear due to material quality"

CAPA RECOMMENDATION FORMAT:
- Be specific and actionable
- Include: What to change, How to change it, When to implement
- Focus on one of these areas:
  - Design improvements (component specifications, tolerances)
  - Manufacturing process (assembly procedures, quality checks)
  - Supplier quality (material specifications, vendor selection)
  - Testing procedures (pre-delivery checks, validation tests)
- Format: "[Action]: [Specific change] to [Component/Process] to [Expected outcome]"
- Example: "Update design specification: Increase coolant pump bearing tolerance from ±0.1mm to ±0.05mm to improve durability and prevent premature failure"

SEVERITY CLASSIFICATION (based on ACTUAL recurrence_count and cei_score):
- "High": 
  - recurrence_count >= 3 (issue occurred 3+ times)
  - OR cei_score < 2.5 (very difficult for customers)
  - OR both conditions indicate systemic manufacturing issue
- "Medium":
  - recurrence_count = 2 (issue occurred twice)
  - OR cei_score 2.5-3.5 (moderate difficulty)
  - Indicates potential quality issue
- "Low":
  - recurrence_count = 1 (single occurrence)
  - AND cei_score > 3.5 (relatively easy to resolve)
  - May be isolated incident

RECURRENCE CLUSTER SIZE:
- This represents how many vehicles in the fleet have experienced the same issue
- For MVP, use recurrence_count as proxy (same vehicle recurring = potential fleet-wide issue)
- If recurrence_count >= 2, set recurrence_cluster_size = recurrence_count * 10 (estimate)
- If recurrence_count = 1, set recurrence_cluster_size = 1
- This helps identify if issue affects multiple vehicles (manufacturing batch problem)

ANALYSIS APPROACH:
1. Review root_cause to identify if it's manufacturing-related
2. Check recurrence_count (same vehicle) - high recurrence = potential manufacturing defect
3. Check fleet_recurrence_count - high fleet recurrence = manufacturing batch issue affecting multiple vehicles
4. Check component_recurrence_count - component-specific issues may indicate supplier or design problem
5. Consider cei_score - low CEI = significant customer impact
6. Determine if issue is:
   - Design flaw (component specification issue) - indicated by high component_recurrence_count
   - Manufacturing defect (assembly or quality control issue) - indicated by high fleet_recurrence_count
   - Supplier issue (material or component quality) - indicated by component issues across fleet
7. Generate specific CAPA recommendation addressing the root cause
8. Calculate recurrence_cluster_size based on fleet data - use fleet_recurrence_count as primary indicator

INPUT FORMAT (you will receive):
{
  "vehicle_id": "string",
  "root_cause": "string (detailed root cause from RCA agent)",
  "cei_score": float (1.0 to 5.0),
  "recurrence_count": int (how many times this issue occurred for this vehicle),
  "fleet_recurrence_count": int (how many vehicles in fleet have this issue),
  "component_recurrence_count": int (how many vehicles have issues with this component),
  "component": "string (component name)"
}

OUTPUT FORMAT (you MUST return EXACTLY this JSON structure):
{
  "vehicle_id": "string (MUST match input vehicle_id exactly)",
  "issue": "string (concise summary of the manufacturing/design issue)",
  "capa_recommendation": "string (specific, actionable CAPA recommendation)",
  "severity": "Low" | "Medium" | "High" (exact strings, case-sensitive)",
  "recurrence_cluster_size": int (estimated number of similar cases, minimum 1)
}

CRITICAL RULES - FOLLOW EXACTLY:
1. Use ONLY Gemini 2.5 Flash model (gemini-2.5-flash)
2. Return ONLY valid JSON - no markdown, no code blocks, no explanations
3. issue MUST be a concise summary focusing on manufacturing/design aspect
4. capa_recommendation MUST be specific and actionable
5. severity MUST be exactly "Low", "Medium", or "High" (case-sensitive)
6. recurrence_cluster_size MUST be a positive integer (minimum 1)
7. vehicle_id MUST exactly match input vehicle_id
8. DO NOT add any fields not in the output schema
9. Base severity on ACTUAL recurrence_count and cei_score values
10. CAPA recommendation should address the root cause at manufacturing/design level

EXAMPLE INPUT:
{
  "vehicle_id": "MH-07-AB-1234",
  "root_cause": "Coolant pump failure causing insufficient coolant circulation, leading to engine overheating",
  "cei_score": 2.5,
  "recurrence_count": 2
}

EXAMPLE OUTPUT:
{
  "vehicle_id": "MH-07-AB-1234",
  "issue": "Coolant pump failure: Premature bearing wear causing insufficient circulation",
  "capa_recommendation": "Update supplier specification: Require coolant pump bearings to meet ISO 9001 quality standards with minimum 50,000-hour MTBF. Implement batch testing for all incoming pumps to validate durability before assembly.",
  "severity": "Medium",
  "recurrence_cluster_size": 20
}

REMEMBER: Return ONLY the JSON object, focus on manufacturing/design aspects, generate specific CAPA recommendations, calculate severity dynamically."""


def extract_json_from_response(text: str) -> dict:
    """Extract JSON from Gemini response (handles markdown code blocks)"""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        raise


@functions_framework.cloud_event
def manufacturing_agent(cloud_event):
    """
    Pub/Sub triggered function that:
    1. Receives feedback result event
    2. Fetches RCA case to get root cause
    3. Calculates recurrence count for the vehicle
    4. Uses Gemini 2.5 Flash to generate CAPA insights
    5. Stores manufacturing result and publishes to Pub/Sub
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
        
        feedback_id = message_data.get("feedback_id")
        case_id = message_data.get("case_id")
        vehicle_id = message_data.get("vehicle_id")
        cei_score = message_data.get("cei_score")
        
        if not feedback_id or not vehicle_id:
            print("Missing feedback_id or vehicle_id in message")
            return {"status": "error", "error": "Missing required fields"}
        
        # 2. Fetch feedback case to get CEI score
        db = firestore.Client()
        feedback_ref = db.collection("feedback_cases").document(feedback_id)
        feedback_doc = feedback_ref.get()
        
        if not feedback_doc.exists:
            print(f"Feedback case {feedback_id} not found")
            return {"status": "error", "error": "Feedback case not found"}
        
        feedback_data = feedback_doc.to_dict()
        cei_score = cei_score if cei_score is not None else feedback_data.get("cei_score")
        
        # 3. Fetch RCA case to get root cause
        case_ref = db.collection("anomaly_cases").document(case_id)
        case_doc = case_ref.get()
        
        if not case_doc.exists:
            print(f"Anomaly case {case_id} not found")
            return {"status": "error", "error": "Anomaly case not found"}
        
        # Get all cases for this vehicle to calculate recurrence (same vehicle)
        all_cases_query = db.collection("anomaly_cases").where("vehicle_id", "==", vehicle_id).stream()
        all_cases = list(all_cases_query)
        
        # Count how many times this specific anomaly type occurred for this vehicle
        current_case_data = case_doc.to_dict()
        anomaly_type = current_case_data.get("anomaly_type")
        component = current_case_data.get("component")  # Try from anomaly case first
        
        recurrence_count = 0
        for case in all_cases:
            case_data = case.to_dict()
            if case_data.get("anomaly_type") == anomaly_type:
                recurrence_count += 1
        
        # 4. Fetch RCA case to get root cause and component
        # First try to get case_id from feedback if not in message
        if not case_id:
            case_id = feedback_data.get("case_id")
        
        if not case_id:
            print("Missing case_id in message and feedback case")
            return {"status": "error", "error": "Missing case_id"}
        
        # Find RCA case linked to this case_id
        rca_query = db.collection("rca_cases").where("case_id", "==", case_id).limit(1).stream()
        rca_cases = list(rca_query)
        
        if not rca_cases:
            print(f"RCA case for case_id {case_id} not found")
            return {"status": "error", "error": "RCA case not found"}
        
        rca_data = rca_cases[0].to_dict()
        root_cause = rca_data.get("root_cause")
        
        # Get component from diagnosis case if available (more reliable than anomaly case)
        diagnosis_id = rca_data.get("diagnosis_id")
        if diagnosis_id:
            diagnosis_ref = db.collection("diagnosis_cases").document(diagnosis_id)
            diagnosis_doc = diagnosis_ref.get()
            if diagnosis_doc.exists:
                diagnosis_data = diagnosis_doc.to_dict()
                component = diagnosis_data.get("component") or component  # Use diagnosis component if available
        
        # Calculate fleet-wide recurrence (across all vehicles) for better CAPA insights
        # This helps identify if it's a manufacturing batch issue
        fleet_recurrence_query = db.collection("anomaly_cases").where("anomaly_type", "==", anomaly_type).stream()
        fleet_cases = list(fleet_recurrence_query)
        fleet_recurrence_count = len(fleet_cases)
        
        # Also check for similar issues by component across fleet
        component_recurrence_count = 0
        if component:
            component_cases_query = db.collection("anomaly_cases").where("component", "==", component).stream()
            component_cases = list(component_cases_query)
            component_recurrence_count = len(component_cases)
        
        # Use the higher of fleet or component recurrence for cluster size estimation
        estimated_cluster_size = max(fleet_recurrence_count, component_recurrence_count, recurrence_count)
        
        # 5. Check for existing similar manufacturing cases to avoid duplicate CAPA
        existing_manufacturing_query = db.collection("manufacturing_cases").where("case_id", "==", case_id).limit(1).stream()
        existing_manufacturing = list(existing_manufacturing_query)
        
        if existing_manufacturing:
            print(f"Manufacturing case already exists for case_id {case_id}, skipping")
            existing_data = existing_manufacturing[0].to_dict()
            return {
                "status": "skipped",
                "message": "Manufacturing case already exists",
                "manufacturing_id": existing_data.get("manufacturing_id")
            }
        
        # 6. Prepare input for Gemini (include fleet-wide data for better insights)
        input_data = {
            "vehicle_id": vehicle_id,
            "root_cause": root_cause,
            "cei_score": cei_score,
            "recurrence_count": recurrence_count,
            "fleet_recurrence_count": fleet_recurrence_count,
            "component_recurrence_count": component_recurrence_count,
            "component": component
        }
        
        # 8. Initialize Vertex AI and call Gemini 2.5 Flash
        vertexai.init(project=PROJECT_ID, location=LOCATION)
        model = GenerativeModel("gemini-2.5-flash")
        
        prompt = f"{SYSTEM_PROMPT}\n\nGenerate CAPA insights for this issue:\n{json.dumps(input_data, default=str, indent=2)}\n\nReturn ONLY the JSON response matching the output format specified above."
        
        response = model.generate_content(prompt)
        response_text = response.text
        
        # 9. Parse Gemini response
        try:
            result = extract_json_from_response(response_text)
        except Exception as e:
            print(f"Error parsing Gemini response: {e}")
            print(f"Response text: {response_text}")
            raise ValueError(f"Invalid JSON response from Gemini: {e}")
        
        # 10. Validate result matches schema
        if result.get("vehicle_id") != vehicle_id:
            result["vehicle_id"] = vehicle_id
        
        manufacturing_id = f"manufacturing_{uuid.uuid4().hex[:10]}"
        
        # 11. Calculate recurrence_cluster_size based on fleet data
        # Use Gemini's estimate if provided, otherwise use calculated fleet recurrence
        recurrence_cluster_size = int(result.get("recurrence_cluster_size", estimated_cluster_size))
        if recurrence_cluster_size < 1:
            recurrence_cluster_size = max(1, estimated_cluster_size)
        
        # 12. Prepare manufacturing data for Firestore
        manufacturing_data = {
            "manufacturing_id": manufacturing_id,
            "feedback_id": feedback_id,
            "case_id": case_id,
            "vehicle_id": vehicle_id,
            "issue": result.get("issue"),
            "capa_recommendation": result.get("capa_recommendation"),
            "severity": result.get("severity"),
            "recurrence_cluster_size": recurrence_cluster_size,
            "recurrence_count": recurrence_count,
            "fleet_recurrence_count": fleet_recurrence_count,
            "component_recurrence_count": component_recurrence_count,
            "cei_score": cei_score,
            "status": "completed",
            "created_at": firestore.SERVER_TIMESTAMP
        }
        
        # 13. Store in Firestore
        db.collection("manufacturing_cases").document(manufacturing_id).set(manufacturing_data)
        print(f"Created manufacturing case {manufacturing_id} for vehicle {vehicle_id}")
        
        # 14. Update feedback case status
        feedback_ref.update({"status": "manufacturing_complete"})
        
        # 15. Prepare BigQuery row
        bq_row = prepare_bigquery_row(manufacturing_data)
        
        # 16. Sync to BigQuery
        bq_client = bigquery.Client()
        table_ref = bq_client.dataset(DATASET_ID).table(TABLE_ID)
        errors = bq_client.insert_rows_json(table_ref, [bq_row])
        
        if errors:
            print(f"BigQuery insert errors: {errors}")
        else:
            print(f"Synced manufacturing case {manufacturing_id} to BigQuery")
        
        # 17. Publish to Pub/Sub
        publisher = pubsub_v1.PublisherClient()
        topic_path = publisher.topic_path(PROJECT_ID, MANUFACTURING_TOPIC_NAME)
        
        # Include confidence and agent_stage for orchestrator
        # Manufacturing doesn't have confidence, use default high confidence
        confidence_score = 0.90
        pubsub_message = {
            "manufacturing_id": manufacturing_id,
            "feedback_id": feedback_id,
            "case_id": case_id,
            "vehicle_id": vehicle_id,
            "issue": result.get("issue"),
            "capa_recommendation": result.get("capa_recommendation"),
            "severity": result.get("severity"),
            "recurrence_cluster_size": recurrence_cluster_size,
            "confidence": confidence_score,  # Add confidence for orchestrator
            "agent_stage": "manufacturing"  # Explicitly set agent stage for orchestrator
        }
        
        message_bytes = json.dumps(pubsub_message).encode("utf-8")
        future = publisher.publish(topic_path, message_bytes)
        message_id = future.result()
        print(f"Published manufacturing case {manufacturing_id} to {MANUFACTURING_TOPIC_NAME}: {message_id}")
        
        return {"status": "success", "manufacturing_id": manufacturing_id}
        
    except Exception as e:
        print(f"Error in manufacturing_agent: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "error": str(e)}


def prepare_bigquery_row(manufacturing_data: dict) -> dict:
    """Prepare manufacturing case data for BigQuery insertion."""
    bq_row = {}
    
    field_mapping = {
        "manufacturing_id": "manufacturing_id",
        "feedback_id": "feedback_id",
        "case_id": "case_id",
        "vehicle_id": "vehicle_id",
        "issue": "issue",
        "capa_recommendation": "capa_recommendation",
        "severity": "severity",
        "recurrence_cluster_size": "recurrence_cluster_size",
        "recurrence_count": "recurrence_count",
        "cei_score": "cei_score",
        "status": "status",
        "created_at": "created_at"
    }
    
    for key, bq_key in field_mapping.items():
        if key not in manufacturing_data:
            continue
        
        value = manufacturing_data[key]
        
        # Handle Firestore SERVER_TIMESTAMP
        if key == "created_at" and hasattr(value, "timestamp"):
            from datetime import timezone
            bq_row[bq_key] = datetime.now(timezone.utc).isoformat()
        elif value is None:
            continue
        else:
            bq_row[bq_key] = value
    
    return bq_row

