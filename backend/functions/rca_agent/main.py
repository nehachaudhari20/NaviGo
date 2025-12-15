"""
Cloud Function: rca_agent
Pub/Sub Trigger: Subscribes to navigo-diagnosis-complete topic
Purpose: Performs root cause analysis using Gemini 2.5 Flash
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
RCA_TOPIC_NAME = "navigo-rca-complete"

# BigQuery configuration
DATASET_ID = "telemetry"
TABLE_ID = "rca_cases"

# System prompt for RCA Agent
SYSTEM_PROMPT = """You are an RCA (Root Cause Analysis) Agent for NaviGo. You MUST use ONLY the Gemini 2.5 Flash model (gemini-2.5-flash) to identify root causes of vehicle component failures.

CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. You will receive diagnosis results (component, failure_probability, RUL, severity) and telemetry context
2. Analyze the ACTUAL component and telemetry data to identify root cause
3. DO NOT HALLUCINATE - Base root cause on the ACTUAL data provided
4. Return EXACTLY the JSON format specified below - no extra fields, no markdown

ROOT CAUSE ANALYSIS APPROACH:
1. Look at the component that is failing
2. Analyze telemetry patterns in context_window (temperature trends, RPM patterns, etc.)
3. Identify the underlying cause (not just the symptom)
4. Root cause should be specific, technical, and actionable
5. Examples: "Coolant pump failure causing insufficient circulation", "Battery cell degradation due to excessive discharge cycles", "Transmission fluid leak from worn seal"

CONFIDENCE SCORING (0.0 to 1.0):
- Calculate based on:
  - Data quality: How complete is the telemetry data? (0.0-0.3 weight)
  - Pattern clarity: How clear is the failure pattern? (0.0-0.4 weight)
  - Component specificity: How specific can you be about the root cause? (0.0-0.3 weight)
- High confidence (0.8-1.0): Clear pattern, complete data, specific cause identified
- Medium confidence (0.5-0.7): Some uncertainty, partial data, general cause
- Low confidence (0.0-0.4): Unclear pattern, incomplete data, speculative cause

CAPA TYPE CLASSIFICATION:
- "Corrective": Action to fix the CURRENT issue (repair, replace, adjust)
  - Examples: "Replace failed coolant pump", "Repair transmission seal leak"
- "Preventive": Action to PREVENT FUTURE occurrences (process change, design improvement, maintenance schedule)
  - Examples: "Implement regular coolant pump inspection schedule", "Update design to improve seal durability"

RECOMMENDED ACTION FORMAT:
- Be specific and actionable
- Include what to do, how to do it, and when
- Format: "[Action verb] [component/part] [method/reason]"
- Examples: "Replace coolant pump and flush system", "Recharge battery and check charging system", "Repair transmission seal and refill fluid"

INPUT FORMAT (you will receive):
{
  "vehicle_id": "string",
  "component": "string",
  "failure_probability": float,
  "estimated_rul_days": int,
  "severity": "Low" | "Medium" | "High",
  "context_window": [array of telemetry events]
}

OUTPUT FORMAT (you MUST return EXACTLY this JSON structure):
{
  "vehicle_id": "string (MUST match input vehicle_id exactly)",
  "root_cause": "string (detailed, specific root cause explanation based on ACTUAL data)",
  "confidence": float (0.0 to 1.0, calculate based on data quality and pattern clarity),
  "recommended_action": "string (specific, actionable recommendation)",
  "capa_type": "Corrective" | "Preventive" (exact strings, case-sensitive)
}

CRITICAL RULES - FOLLOW EXACTLY:
1. Use ONLY Gemini 2.5 Flash model (gemini-2.5-flash)
2. Return ONLY valid JSON - no markdown, no code blocks, no explanations
3. root_cause MUST be based on ACTUAL telemetry data, not assumptions
4. confidence MUST be between 0.0 and 1.0 (inclusive)
5. recommended_action MUST be specific and actionable
6. capa_type MUST be exactly "Corrective" or "Preventive" (case-sensitive)
7. vehicle_id MUST exactly match input vehicle_id
8. DO NOT add any fields not in the output schema
9. DO NOT use hard-coded root causes - analyze ACTUAL data
10. Root cause should explain WHY the component is failing, not just WHAT is failing

EXAMPLE INPUT:
{
  "vehicle_id": "MH-07-AB-1234",
  "component": "engine_coolant_system",
  "failure_probability": 0.8,
  "estimated_rul_days": 15,
  "severity": "High",
  "context_window": [events showing rising coolant temp over time]
}

EXAMPLE OUTPUT:
{
  "vehicle_id": "MH-07-AB-1234",
  "root_cause": "Coolant pump failure causing insufficient coolant circulation, leading to engine overheating. Telemetry shows gradual temperature rise from 85°C to 115°C over 30 minutes with no corresponding increase in coolant flow.",
  "confidence": 0.92,
  "recommended_action": "Replace coolant pump, flush cooling system, and refill with manufacturer-specified coolant",
  "capa_type": "Corrective"
}

REMEMBER: Return ONLY the JSON object, analyze ACTUAL telemetry data, be specific about root cause, calculate confidence dynamically."""


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
def rca_agent(cloud_event):
    """
    Pub/Sub triggered function that:
    1. Receives diagnosis result event
    2. Fetches diagnosis case and telemetry context from Firestore
    3. Uses Gemini 2.5 Flash to perform root cause analysis
    4. Stores RCA result and publishes to Pub/Sub
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
        
        diagnosis_id = message_data.get("diagnosis_id")
        case_id = message_data.get("case_id")
        vehicle_id = message_data.get("vehicle_id")
        component = message_data.get("component")
        failure_probability = message_data.get("failure_probability")
        estimated_rul_days = message_data.get("estimated_rul_days")
        severity = message_data.get("severity")
        
        if not diagnosis_id or not vehicle_id:
            print("Missing diagnosis_id or vehicle_id in message")
            return {"status": "error", "error": "Missing required fields"}
        
        # 2. Fetch diagnosis case from Firestore
        db = firestore.Client()
        diagnosis_ref = db.collection("diagnosis_cases").document(diagnosis_id)
        diagnosis_doc = diagnosis_ref.get()
        
        if not diagnosis_doc.exists:
            print(f"Diagnosis case {diagnosis_id} not found")
            return {"status": "error", "error": "Diagnosis case not found"}
        
        diagnosis_data = diagnosis_doc.to_dict()
        
        # Use data from message or fallback to diagnosis document
        component = component or diagnosis_data.get("component")
        failure_probability = failure_probability if failure_probability is not None else diagnosis_data.get("failure_probability")
        estimated_rul_days = estimated_rul_days if estimated_rul_days is not None else diagnosis_data.get("estimated_rul_days")
        severity = severity or diagnosis_data.get("severity")
        
        # 3. Fetch context window using event IDs stored in diagnosis
        context_event_ids = diagnosis_data.get("context_event_ids", [])
        context_window = []
        
        if context_event_ids:
            for event_id in context_event_ids:
                event_doc = db.collection("telemetry_events").document(event_id).get()
                if event_doc.exists:
                    event_data = event_doc.to_dict()
                    # Convert Firestore SERVER_TIMESTAMP if present
                    if "created_at" in event_data and hasattr(event_data["created_at"], "timestamp"):
                        event_data["created_at"] = datetime.now().isoformat()
                    context_window.append(event_data)
        
        # 4. Prepare input for Gemini
        input_data = {
            "vehicle_id": vehicle_id,
            "component": component,
            "failure_probability": failure_probability,
            "estimated_rul_days": estimated_rul_days,
            "severity": severity,
            "context_window": context_window
        }
        
        # 5. Initialize Vertex AI and call Gemini 2.5 Flash
        vertexai.init(project=PROJECT_ID, location=LOCATION)
        model = GenerativeModel("gemini-2.5-flash")
        
        prompt = f"{SYSTEM_PROMPT}\n\nAnalyze this diagnosis data:\n{json.dumps(input_data, default=str, indent=2)}\n\nReturn ONLY the JSON response matching the output format specified above."
        
        response = model.generate_content(prompt)
        response_text = response.text
        
        # 6. Parse Gemini response
        try:
            result = extract_json_from_response(response_text)
        except Exception as e:
            print(f"Error parsing Gemini response: {e}")
            print(f"Response text: {response_text}")
            raise ValueError(f"Invalid JSON response from Gemini: {e}")
        
        # 7. Validate result matches schema
        if result.get("vehicle_id") != vehicle_id:
            result["vehicle_id"] = vehicle_id
        
        rca_id = f"rca_{uuid.uuid4().hex[:10]}"
        
        # 8. Prepare RCA data for Firestore
        rca_data = {
            "rca_id": rca_id,
            "diagnosis_id": diagnosis_id,
            "case_id": case_id,
            "vehicle_id": vehicle_id,
            "root_cause": result.get("root_cause"),
            "confidence": float(result.get("confidence", 0.0)),
            "recommended_action": result.get("recommended_action"),
            "capa_type": result.get("capa_type"),
            "status": "pending_scheduling",
            "created_at": firestore.SERVER_TIMESTAMP
        }
        
        # 9. Store in Firestore
        db.collection("rca_cases").document(rca_id).set(rca_data)
        print(f"Created RCA case {rca_id} for vehicle {vehicle_id}")
        
        # 10. Update diagnosis case status
        diagnosis_ref.update({"status": "rca_complete"})
        
        # 11. Prepare BigQuery row
        bq_row = prepare_bigquery_row(rca_data)
        
        # 12. Sync to BigQuery
        bq_client = bigquery.Client()
        table_ref = bq_client.dataset(DATASET_ID).table(TABLE_ID)
        errors = bq_client.insert_rows_json(table_ref, [bq_row])
        
        if errors:
            print(f"BigQuery insert errors: {errors}")
        else:
            print(f"Synced RCA case {rca_id} to BigQuery")
        
        # 13. Publish to Pub/Sub
        publisher = pubsub_v1.PublisherClient()
        topic_path = publisher.topic_path(PROJECT_ID, RCA_TOPIC_NAME)
        
        pubsub_message = {
            "rca_id": rca_id,
            "diagnosis_id": diagnosis_id,
            "case_id": case_id,
            "vehicle_id": vehicle_id,
            "root_cause": result.get("root_cause"),
            "confidence": result.get("confidence"),
            "recommended_action": result.get("recommended_action"),
            "capa_type": result.get("capa_type")
        }
        
        message_bytes = json.dumps(pubsub_message).encode("utf-8")
        future = publisher.publish(topic_path, message_bytes)
        message_id = future.result()
        print(f"Published RCA case {rca_id} to {RCA_TOPIC_NAME}: {message_id}")
        
        return {"status": "success", "rca_id": rca_id}
        
    except Exception as e:
        print(f"Error in rca_agent: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "error": str(e)}


def prepare_bigquery_row(rca_data: dict) -> dict:
    """Prepare RCA case data for BigQuery insertion."""
    bq_row = {}
    
    field_mapping = {
        "rca_id": "rca_id",
        "diagnosis_id": "diagnosis_id",
        "case_id": "case_id",
        "vehicle_id": "vehicle_id",
        "root_cause": "root_cause",
        "confidence": "confidence",
        "recommended_action": "recommended_action",
        "capa_type": "capa_type",
        "status": "status",
        "created_at": "created_at"
    }
    
    for key, bq_key in field_mapping.items():
        if key not in rca_data:
            continue
        
        value = rca_data[key]
        
        # Handle Firestore SERVER_TIMESTAMP
        if key == "created_at" and hasattr(value, "timestamp"):
            from datetime import timezone
            bq_row[bq_key] = datetime.now(timezone.utc).isoformat()
        elif value is None:
            continue
        else:
            bq_row[bq_key] = value
    
    return bq_row

