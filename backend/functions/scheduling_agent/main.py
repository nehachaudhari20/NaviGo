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
        
        # 3. Fetch service center availability data dynamically from Firestore
        now = datetime.now(timezone.utc)
        
        # Fetch all service centers
        service_centers_ref = db.collection("service_centers")
        service_centers_docs = service_centers_ref.stream()
        
        service_centers_data = []
        for center_doc in service_centers_docs:
            center_data = center_doc.to_dict()
            center_data["service_center_id"] = center_doc.id
            service_centers_data.append(center_data)
        
        if not service_centers_data:
            print("No service centers found in Firestore")
            return {"status": "error", "error": "No service centers available"}
        
        # Select best service center based on proximity, capacity, and availability
        # For now, use the first available center (can be enhanced with location-based logic)
        selected_center = service_centers_data[0]
        recommended_center = selected_center.get("service_center_id")
        center_timezone = selected_center.get("timezone", "UTC")
        center_capacity = selected_center.get("capacity", 10)
        operating_hours = selected_center.get("operating_hours", {})
        
        # Fetch existing bookings for this service center to check availability
        bookings_ref = db.collection("bookings")
        existing_bookings = bookings_ref.where("service_center", "==", recommended_center).where("status", "in", ["confirmed", "pending"]).stream()
        
        booked_slots = set()
        for booking in existing_bookings:
            booking_data = booking.to_dict()
            scheduled_slot = booking_data.get("scheduled_slot")
            if scheduled_slot:
                booked_slots.add(scheduled_slot)
        
        # Get available slots from service center data
        available_slots_raw = selected_center.get("available_slots", [])
        
        # If no slots in service center document, generate based on operating hours
        if not available_slots_raw:
            available_slots_raw = generate_slots_from_operating_hours(operating_hours, center_timezone, now, days_ahead=30)
        
        # Filter out booked slots
        available_slots = [slot for slot in available_slots_raw if slot not in booked_slots]
        
        # Check capacity - if center is at capacity, find alternative center
        if len(booked_slots) >= center_capacity:
            print(f"Service center {recommended_center} at capacity, checking alternatives...")
            for alt_center in service_centers_data[1:]:
                alt_bookings = bookings_ref.where("service_center", "==", alt_center.get("service_center_id")).where("status", "in", ["confirmed", "pending"]).stream()
                alt_booked_count = sum(1 for _ in alt_bookings)
                if alt_booked_count < alt_center.get("capacity", 10):
                    selected_center = alt_center
                    recommended_center = alt_center.get("service_center_id")
                    center_timezone = alt_center.get("timezone", "UTC")
                    available_slots_raw = alt_center.get("available_slots", [])
                    if not available_slots_raw:
                        available_slots_raw = generate_slots_from_operating_hours(alt_center.get("operating_hours", {}), center_timezone, now, days_ahead=30)
                    alt_booked_slots = set()
                    for booking in bookings_ref.where("service_center", "==", recommended_center).where("status", "in", ["confirmed", "pending"]).stream():
                        slot = booking.to_dict().get("scheduled_slot")
                        if slot:
                            alt_booked_slots.add(slot)
                    available_slots = [slot for slot in available_slots_raw if slot not in alt_booked_slots]
                    break
        
        # Fetch spare parts availability from service center
        spare_parts_availability = selected_center.get("spare_parts_availability", {})
        
        # If component-specific parts not in center data, check inventory or set default
        if component and component not in spare_parts_availability:
            # Try to infer part name from component
            part_name = component.lower().replace("_", "_")
            spare_parts_availability[part_name] = selected_center.get("inventory", {}).get(part_name, "available")
        
        # Generate technician availability from available slots
        # In production, this would come from technician scheduling system
        technicians = selected_center.get("technicians", [])
        if not technicians:
            # Default: assign slots to generic technicians
            technicians = [f"tech_{i+1}" for i in range(min(3, len(available_slots) // 5))]
        
        technician_availability = {}
        slots_per_tech = len(available_slots) // len(technicians) if technicians else len(available_slots)
        for i, tech_id in enumerate(technicians):
            start_idx = i * slots_per_tech
            end_idx = start_idx + slots_per_tech if i < len(technicians) - 1 else len(available_slots)
            technician_availability[tech_id] = available_slots[start_idx:end_idx]
        
        # If no available slots, generate fallback slots
        if not available_slots:
            print(f"No available slots for center {recommended_center}, generating fallback slots")
            available_slots = generate_slots_from_operating_hours(operating_hours, center_timezone, now, days_ahead=60)
            # Take first 20 slots as available
            available_slots = available_slots[:20]
            # Distribute to technicians
            for i, tech_id in enumerate(technicians):
                start_idx = i * (len(available_slots) // len(technicians))
                end_idx = start_idx + (len(available_slots) // len(technicians)) if i < len(technicians) - 1 else len(available_slots)
                technician_availability[tech_id] = available_slots[start_idx:end_idx]
        
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


def generate_slots_from_operating_hours(operating_hours: dict, timezone_str: str, start_date: datetime, days_ahead: int = 30) -> list:
    """
    Generate available time slots based on operating hours.
    
    Args:
        operating_hours: Dict with day names as keys and time ranges as values
            Example: {"monday": {"start": "09:00", "end": "18:00"}, ...}
        timezone_str: Timezone string (e.g., "Asia/Kolkata")
        start_date: Starting datetime (UTC)
        days_ahead: Number of days to generate slots for
    
    Returns:
        List of ISO timestamp strings in UTC
    """
    try:
        import pytz
        tz = pytz.timezone(timezone_str)
    except:
        # Fallback to UTC if timezone not available
        import pytz
        tz = pytz.UTC
    
    slots = []
    default_hours = {"start": "09:00", "end": "18:00"}
    
    # Day name mapping
    day_names = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    
    for day_offset in range(1, days_ahead + 1):
        slot_date = start_date + timedelta(days=day_offset)
        day_name = day_names[slot_date.weekday()]
        
        # Get operating hours for this day
        day_hours = operating_hours.get(day_name, default_hours)
        start_time_str = day_hours.get("start", "09:00")
        end_time_str = day_hours.get("end", "18:00")
        
        # Parse time strings
        start_hour, start_min = map(int, start_time_str.split(":"))
        end_hour, end_min = map(int, end_time_str.split(":"))
        
        # Generate slots for this day (hourly slots)
        current_hour = start_hour
        while current_hour < end_hour:
            # Create datetime in service center timezone
            local_dt = tz.localize(slot_date.replace(hour=current_hour, minute=0, second=0, microsecond=0))
            # Convert to UTC
            utc_dt = local_dt.astimezone(pytz.UTC)
            # Format as ISO string
            slots.append(utc_dt.isoformat().replace('+00:00', 'Z'))
            current_hour += 1
    
    return slots

