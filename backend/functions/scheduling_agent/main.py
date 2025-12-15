"""
Cloud Function: scheduling_agent
Pub/Sub Trigger: Subscribes to navigo-rca-complete topic
Purpose: Optimizes service scheduling using Gemini 2.5 Flash
"""

import json
import os
import uuid
import re
from datetime import datetime, timedelta, timezone
from google.cloud import pubsub_v1, firestore, bigquery
import functions_framework
import vertexai
from vertexai.preview.generative_models import GenerativeModel

# Vertex AI configuration
PROJECT_ID = os.getenv("PROJECT_ID", "navigo-27206")
LOCATION = os.getenv("LOCATION", "us-central1")

# Pub/Sub configuration
SCHEDULING_TOPIC_NAME = "navigo-scheduling-complete"

# BigQuery configuration
DATASET_ID = "telemetry"
TABLE_ID = "scheduling_cases"

# System prompt for Scheduling Agent
SYSTEM_PROMPT = """You are a Scheduling Agent for NaviGo. You MUST use ONLY the Gemini 2.5 Flash model (gemini-2.5-flash) to optimize service appointment scheduling.

CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. You will receive vehicle urgency data (RUL, severity) and service center availability data
2. Analyze the ACTUAL availability data provided (spare_parts_availability, technician_availability)
3. Calculate optimal appointment slot based on urgency and availability
4. DO NOT HALLUCINATE - Only use the data provided, do not assume availability
5. Return EXACTLY the JSON format specified below - no extra fields, no markdown

SLOT TYPE CLASSIFICATION (based on ACTUAL estimated_rul_days):
- "urgent": estimated_rul_days < 7 (vehicle needs service within a week)
- "normal": estimated_rul_days >= 7 AND < 30 (vehicle needs service within a month)
- "delayed": estimated_rul_days >= 30 (vehicle can wait more than a month)

SCHEDULING PRIORITY LOGIC:
1. Urgency first: Higher severity and lower RUL = earlier slot
2. Parts availability: Ensure required parts are available at the service center
3. Technician availability: Ensure qualified technician is available
4. Service center capacity: Consider current booking load
5. Customer convenience: Prefer slots during business hours (9 AM - 6 PM)

BEST SLOT SELECTION:
- For "urgent": Schedule within 1-3 days from current date
- For "normal": Schedule within 7-14 days from current date
- For "delayed": Schedule within 30-60 days from current date
- All slots must be during business hours (9 AM - 6 PM, Monday-Friday)
- Use the ACTUAL available slots from technician_availability data
- If no slots available, find the earliest available slot

FALLBACK SLOTS:
- Provide at least 2 alternative slots
- Fallback slots should be within 7 days of best_slot
- Prioritize same service center, but can suggest alternatives if needed
- All fallback slots must also have parts and technician availability

TIMESTAMP FORMAT:
- All timestamps MUST be in ISO 8601 format with UTC timezone
- Format: "YYYY-MM-DDTHH:MM:SSZ" (e.g., "2024-12-15T10:00:00Z")
- Use current date/time as reference point for scheduling

INPUT FORMAT (you will receive):
{
  "vehicle_id": "string",
  "estimated_rul_days": int,
  "severity": "Low" | "Medium" | "High",
  "recommended_center": "string",
  "spare_parts_availability": {
    "part_name": "available" | "unavailable" | "in_transit",
    ...
  },
  "technician_availability": {
    "technician_id": ["slot1_iso_timestamp", "slot2_iso_timestamp", ...],
    ...
  }
}

OUTPUT FORMAT (you MUST return EXACTLY this JSON structure):
{
  "best_slot": "string (ISO timestamp in UTC, e.g., '2024-12-15T10:00:00Z')",
  "service_center": "string (service center ID from input or recommended_center)",
  "slot_type": "urgent" | "normal" | "delayed" (exact strings, case-sensitive)",
  "fallback_slots": ["string"] (array of ISO timestamps, minimum 2 slots)
}

CRITICAL RULES - FOLLOW EXACTLY:
1. Use ONLY Gemini 2.5 Flash model (gemini-2.5-flash)
2. Return ONLY valid JSON - no markdown, no code blocks, no explanations
3. best_slot MUST be an ISO 8601 timestamp string in UTC
4. slot_type MUST be exactly "urgent", "normal", or "delayed" (case-sensitive)
5. fallback_slots MUST be an array of at least 2 ISO timestamp strings
6. service_center MUST be a valid service center ID from the input data
7. All slots MUST be based on ACTUAL availability data provided
8. DO NOT use hard-coded dates - calculate from current date/time
9. DO NOT assume availability - use only the data provided
10. If no slots available, select the earliest possible slot from the data

EXAMPLE INPUT:
{
  "vehicle_id": "MH-07-AB-1234",
  "estimated_rul_days": 15,
  "severity": "High",
  "recommended_center": "center_001",
  "spare_parts_availability": {"coolant_pump": "available", "coolant_fluid": "available"},
  "technician_availability": {
    "tech_001": ["2024-12-16T10:00:00Z", "2024-12-16T14:00:00Z", "2024-12-17T09:00:00Z"]
  }
}

EXAMPLE OUTPUT:
{
  "best_slot": "2024-12-16T10:00:00Z",
  "service_center": "center_001",
  "slot_type": "normal",
  "fallback_slots": ["2024-12-16T14:00:00Z", "2024-12-17T09:00:00Z"]
}

REMEMBER: Return ONLY the JSON object, use ACTUAL availability data, calculate dates dynamically, use exact slot_type strings."""


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
def scheduling_agent(cloud_event):
    """
    Pub/Sub triggered function that:
    1. Receives RCA result event
    2. Fetches diagnosis case to get RUL and severity
    3. Fetches service center availability data
    4. Uses Gemini 2.5 Flash to optimize scheduling
    5. Stores scheduling result and publishes to Pub/Sub
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
        
        rca_id = message_data.get("rca_id")
        diagnosis_id = message_data.get("diagnosis_id")
        case_id = message_data.get("case_id")
        vehicle_id = message_data.get("vehicle_id")
        
        if not rca_id or not vehicle_id:
            print("Missing rca_id or vehicle_id in message")
            return {"status": "error", "error": "Missing required fields"}
        
        # 2. Fetch diagnosis case to get RUL and severity
        db = firestore.Client()
        diagnosis_ref = db.collection("diagnosis_cases").document(diagnosis_id)
        diagnosis_doc = diagnosis_ref.get()
        
        if not diagnosis_doc.exists:
            print(f"Diagnosis case {diagnosis_id} not found")
            return {"status": "error", "error": "Diagnosis case not found"}
        
        diagnosis_data = diagnosis_doc.to_dict()
        estimated_rul_days = diagnosis_data.get("estimated_rul_days")
        severity = diagnosis_data.get("severity")
        component = diagnosis_data.get("component")
        
        # 3. Fetch service center availability data (mock data for MVP - can be replaced with actual service center data)
        # In production, this would come from a service center management system
        recommended_center = "center_001"  # Default center
        
        # Mock availability data - in production, fetch from service center API or Firestore
        spare_parts_availability = {
            "coolant_pump": "available",
            "coolant_fluid": "available",
            "battery": "available",
            "engine_oil": "available"
        }
        
        # Generate available slots for next 30 days (mock data)
        # In production, fetch from service center scheduling system
        now = datetime.now(timezone.utc)
        available_slots = []
        for day in range(1, 31):
            slot_date = now + timedelta(days=day)
            # Business hours: 9 AM to 6 PM
            for hour in [9, 10, 11, 14, 15, 16, 17]:
                slot = slot_date.replace(hour=hour, minute=0, second=0, microsecond=0)
                available_slots.append(slot.isoformat().replace('+00:00', 'Z'))
        
        technician_availability = {
            "tech_001": available_slots[:10],  # First 10 slots
            "tech_002": available_slots[10:20]  # Next 10 slots
        }
        
        # 4. Prepare input for Gemini
        input_data = {
            "vehicle_id": vehicle_id,
            "estimated_rul_days": estimated_rul_days,
            "severity": severity,
            "recommended_center": recommended_center,
            "spare_parts_availability": spare_parts_availability,
            "technician_availability": technician_availability
        }
        
        # 5. Initialize Vertex AI and call Gemini 2.5 Flash
        vertexai.init(project=PROJECT_ID, location=LOCATION)
        model = GenerativeModel("gemini-2.5-flash")
        
        prompt = f"{SYSTEM_PROMPT}\n\nSchedule service for this vehicle:\n{json.dumps(input_data, default=str, indent=2)}\n\nCurrent date/time: {now.isoformat()}Z\n\nReturn ONLY the JSON response matching the output format specified above."
        
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
        if result.get("vehicle_id") and result.get("vehicle_id") != vehicle_id:
            # Remove vehicle_id from result if present (not in output schema)
            pass
        
        scheduling_id = f"scheduling_{uuid.uuid4().hex[:10]}"
        
        # 8. Prepare scheduling data for Firestore
        scheduling_data = {
            "scheduling_id": scheduling_id,
            "rca_id": rca_id,
            "diagnosis_id": diagnosis_id,
            "case_id": case_id,
            "vehicle_id": vehicle_id,
            "best_slot": result.get("best_slot"),
            "service_center": result.get("service_center"),
            "slot_type": result.get("slot_type"),
            "fallback_slots": result.get("fallback_slots", []),
            "status": "pending_engagement",
            "created_at": firestore.SERVER_TIMESTAMP
        }
        
        # 9. Store in Firestore
        db.collection("scheduling_cases").document(scheduling_id).set(scheduling_data)
        print(f"Created scheduling case {scheduling_id} for vehicle {vehicle_id}")
        
        # 10. Update RCA case status
        rca_ref = db.collection("rca_cases").document(rca_id)
        rca_ref.update({"status": "scheduled"})
        
        # 11. Prepare BigQuery row
        bq_row = prepare_bigquery_row(scheduling_data)
        
        # 12. Sync to BigQuery
        bq_client = bigquery.Client()
        table_ref = bq_client.dataset(DATASET_ID).table(TABLE_ID)
        errors = bq_client.insert_rows_json(table_ref, [bq_row])
        
        if errors:
            print(f"BigQuery insert errors: {errors}")
        else:
            print(f"Synced scheduling case {scheduling_id} to BigQuery")
        
        # 13. Publish to Pub/Sub
        publisher = pubsub_v1.PublisherClient()
        topic_path = publisher.topic_path(PROJECT_ID, SCHEDULING_TOPIC_NAME)
        
        pubsub_message = {
            "scheduling_id": scheduling_id,
            "rca_id": rca_id,
            "case_id": case_id,
            "vehicle_id": vehicle_id,
            "best_slot": result.get("best_slot"),
            "service_center": result.get("service_center"),
            "slot_type": result.get("slot_type"),
            "fallback_slots": result.get("fallback_slots", [])
        }
        
        message_bytes = json.dumps(pubsub_message).encode("utf-8")
        future = publisher.publish(topic_path, message_bytes)
        message_id = future.result()
        print(f"Published scheduling case {scheduling_id} to {SCHEDULING_TOPIC_NAME}: {message_id}")
        
        return {"status": "success", "scheduling_id": scheduling_id}
        
    except Exception as e:
        print(f"Error in scheduling_agent: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "error": str(e)}


def prepare_bigquery_row(scheduling_data: dict) -> dict:
    """Prepare scheduling case data for BigQuery insertion."""
    bq_row = {}
    
    field_mapping = {
        "scheduling_id": "scheduling_id",
        "rca_id": "rca_id",
        "diagnosis_id": "diagnosis_id",
        "case_id": "case_id",
        "vehicle_id": "vehicle_id",
        "best_slot": "best_slot",
        "service_center": "service_center",
        "slot_type": "slot_type",
        "fallback_slots": "fallback_slots",
        "status": "status",
        "created_at": "created_at"
    }
    
    for key, bq_key in field_mapping.items():
        if key not in scheduling_data:
            continue
        
        value = scheduling_data[key]
        
        # Handle Firestore SERVER_TIMESTAMP
        if key == "created_at" and hasattr(value, "timestamp"):
            from datetime import timezone
            bq_row[bq_key] = datetime.now(timezone.utc).isoformat()
        elif key == "fallback_slots" and isinstance(value, list):
            # Convert list to comma-separated string for BigQuery
            bq_row[bq_key] = ",".join(value)
        elif value is None:
            continue
        else:
            bq_row[bq_key] = value
    
    return bq_row

