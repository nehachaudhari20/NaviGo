"""
Cloud Function: scheduling_agent
Pub/Sub Trigger: Subscribes to navigo-rca-complete topic
Purpose: Optimizes service scheduling using Gemini 2.5 Flash
"""

import json
import os
import uuid
import re
import time
import random
from datetime import datetime, timedelta, timezone
from google.cloud import pubsub_v1, firestore, bigquery
import functions_framework
import vertexai
from vertexai.preview.generative_models import GenerativeModel
from google.api_core import exceptions

# Vertex AI configuration
# Read and validate environment variables
PROJECT_ID_RAW = os.getenv("PROJECT_ID", "navigo-27206")
LOCATION_RAW = os.getenv("LOCATION", "us-central1")

# Clean and validate - remove any extra text that might have been concatenated
PROJECT_ID = PROJECT_ID_RAW.strip().split()[0]  # Take only first word (in case "LOCATION=..." was appended)
LOCATION = LOCATION_RAW.strip().split()[0]  # Take only first word

# Additional validation - ensure PROJECT_ID doesn't contain "LOCATION"
if "LOCATION" in PROJECT_ID.upper():
    # Extract just the project ID part
    PROJECT_ID = PROJECT_ID.split("LOCATION")[0].strip()
if "=" in PROJECT_ID:
    # If there's an equals sign, take only the part before it
    PROJECT_ID = PROJECT_ID.split("=")[0].strip()

# Debug logging (will be visible in Cloud Logs)
print(f"DEBUG: PROJECT_ID_RAW={PROJECT_ID_RAW}, PROJECT_ID={PROJECT_ID}")
print(f"DEBUG: LOCATION_RAW={LOCATION_RAW}, LOCATION={LOCATION}")

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
        # For 2nd gen Cloud Functions, cloud_event.data can be:
        # - A string (JSON string)
        # - Bytes (raw message data, often base64 encoded)
        # - A dict (already parsed)
        # - Base64 encoded in a "message" wrapper (legacy format)
        
        # Debug: Log the type of data we receive
        print(f"DEBUG: cloud_event.data type: {type(cloud_event.data)}, first 200 chars: {str(cloud_event.data)[:200]}")
        
        message_data = None
        
        # Handle bytes first (common in 2nd gen functions)
        if isinstance(cloud_event.data, bytes):
            try:
                decoded_str = cloud_event.data.decode("utf-8")
                message_data = json.loads(decoded_str)
            except (UnicodeDecodeError, json.JSONDecodeError):
                # Try base64 decode
                try:
                    import base64
                    decoded = base64.b64decode(cloud_event.data).decode("utf-8")
                    if decoded:
                        message_data = json.loads(decoded)
                except Exception as e:
                    print(f"Failed to parse cloud_event.data (bytes): {e}")
                    raise
        elif isinstance(cloud_event.data, str):
            try:
                message_data = json.loads(cloud_event.data)
            except json.JSONDecodeError:
                # Might be base64 encoded string
                try:
                    import base64
                    decoded = base64.b64decode(cloud_event.data).decode("utf-8")
                    if decoded:
                        message_data = json.loads(decoded)
                except Exception as e:
                    print(f"Failed to parse cloud_event.data (string): {e}")
                    raise
        elif isinstance(cloud_event.data, dict):
            message_data = cloud_event.data
        else:
            message_data = cloud_event.data
        
        # Handle Pub/Sub message format (wrapped in "message" object with base64 "data")
        # This is the standard format for Pub/Sub messages in 2nd gen Cloud Functions
        if isinstance(message_data, dict):
            if "message" in message_data and "data" in message_data["message"]:
                import base64
                try:
                    data_field = message_data["message"]["data"]
                    print(f"DEBUG: data_field type: {type(data_field)}, length: {len(str(data_field))}")
                    # Check if data is a string (base64 encoded)
                    if isinstance(data_field, str) and data_field.strip():
                        # Decode base64 - handle padding issues
                        # Add padding if needed (base64 strings must be multiple of 4)
                        padding = len(data_field) % 4
                        if padding:
                            data_field += '=' * (4 - padding)
                        
                        # Decode base64
                        decoded_str = None
                        try:
                            # Decode base64 string
                            print(f"DEBUG: About to decode base64. data_field type: {type(data_field)}, length: {len(data_field)}")
                            decoded_bytes = base64.b64decode(data_field, validate=True)
                            print(f"DEBUG: Base64 decode to bytes successful. Bytes length: {len(decoded_bytes)}")
                            decoded_str = decoded_bytes.decode("utf-8")
                            print(f"DEBUG: Bytes to string decode successful. String length: {len(decoded_str)}")
                            print(f"DEBUG: Decoded content (first 500 chars): {decoded_str[:500]}")
                            print(f"DEBUG: Decoded content (full): {decoded_str}")
                            
                            # Verify it's not still base64 (check if it starts with base64-like pattern)
                            if decoded_str.strip().startswith('ew0K') or decoded_str.strip().startswith('eyJ'):
                                print(f"WARNING: Decoded string still looks like base64! Attempting second decode...")
                                # Try decoding again (double-encoded case)
                                try:
                                    decoded_bytes2 = base64.b64decode(decoded_str.strip())
                                    decoded_str = decoded_bytes2.decode("utf-8")
                                    print(f"DEBUG: Second decode successful. Final length: {len(decoded_str)}")
                                    print(f"DEBUG: Final decoded content: {decoded_str}")
                                except:
                                    print(f"DEBUG: Second decode failed, using first decode result")
                        except Exception as decode_error:
                            print(f"DEBUG: Base64 decode error (with validation): {decode_error}")
                            import traceback
                            traceback.print_exc()
                            # Try without validation
                            try:
                                decoded_bytes = base64.b64decode(data_field)
                                decoded_str = decoded_bytes.decode("utf-8")
                                print(f"DEBUG: Base64 decode successful (without validation). Decoded length: {len(decoded_str)}")
                                print(f"DEBUG: Decoded content: {decoded_str}")
                            except Exception as decode_error2:
                                print(f"DEBUG: Base64 decode error (without validation): {decode_error2}")
                                import traceback
                                traceback.print_exc()
                                raise
                        
                        # Parse JSON from decoded string
                        if decoded_str and decoded_str.strip():
                            try:
                                message_data = json.loads(decoded_str)
                                print(f"DEBUG: Successfully parsed JSON. Keys: {list(message_data.keys())}")
                            except json.JSONDecodeError as json_error:
                                print(f"Error: Invalid JSON after base64 decode: {json_error}")
                                print(f"DEBUG: Decoded string length: {len(decoded_str)}")
                                print(f"DEBUG: Decoded string (repr, first 500): {repr(decoded_str[:500])}")
                                print(f"DEBUG: Decoded string (full repr): {repr(decoded_str)}")
                                raise
                        else:
                            print(f"DEBUG: Decoded string is empty or None. decoded_str={decoded_str}")
                            raise ValueError("Decoded string is empty")
                    elif isinstance(data_field, bytes):
                        decoded_str = data_field.decode("utf-8")
                        if decoded_str and decoded_str.strip():
                            message_data = json.loads(decoded_str)
                except base64.binascii.Error as e:
                    print(f"Error: Invalid base64 data: {e}")
                    print(f"DEBUG: data_field type: {type(data_field)}, length: {len(str(data_field))}, first 200 chars: {str(data_field)[:200]}")
                    raise
                except json.JSONDecodeError as e:
                    print(f"Error: Invalid JSON after base64 decode: {e}")
                    if 'decoded_str' in locals() and decoded_str:
                        print(f"DEBUG: Decoded string length: {len(decoded_str)}")
                        print(f"DEBUG: Decoded string (full): {decoded_str}")
                    else:
                        print(f"DEBUG: decoded_str not available or empty")
                    raise
                except Exception as e:
                    print(f"Error decoding base64 message data: {e}")
                    import traceback
                    traceback.print_exc()
                    raise
        
        # Final validation - ensure message_data is a dict
        if not isinstance(message_data, dict):
            print(f"message_data is not a dict: {type(message_data)}, value: {str(message_data)[:200]}")
            return {"status": "error", "error": f"Invalid message format: expected dict, got {type(message_data).__name__}"}
        
        if not message_data:
            print(f"message_data is empty dict")
            return {"status": "error", "error": "Invalid or empty message data"}
        
        rca_id = message_data.get("rca_id")
        diagnosis_id = message_data.get("diagnosis_id")
        case_id = message_data.get("case_id")
        vehicle_id = message_data.get("vehicle_id")
        
        if not rca_id or not vehicle_id:
            print("Missing rca_id or vehicle_id in message")
            return {"status": "error", "error": "Missing required fields"}
        
        # 2. Check for existing scheduling to prevent duplicate processing
        db = firestore.Client()
        
        # Check if scheduling already exists for this rca_id (prevent duplicate scheduling)
        existing_scheduling = list(db.collection("scheduling_cases")
            .where("rca_id", "==", rca_id)
            .limit(1).stream())
        
        if existing_scheduling:
            existing_scheduling_id = existing_scheduling[0].id
            print(f"Scheduling already exists for RCA {rca_id} - scheduling_id: {existing_scheduling_id}. Skipping.")
            return {"status": "skipped", "message": "Scheduling already exists", "scheduling_id": existing_scheduling_id}
        
        # 3. Fetch diagnosis case to get RUL and severity
        diagnosis_ref = db.collection("diagnosis_cases").document(diagnosis_id)
        diagnosis_doc = diagnosis_ref.get()
        
        if not diagnosis_doc.exists:
            print(f"Diagnosis case {diagnosis_id} not found")
            return {"status": "error", "error": "Diagnosis case not found"}
        
        diagnosis_data = diagnosis_doc.to_dict()
        estimated_rul_days = diagnosis_data.get("estimated_rul_days")
        severity = diagnosis_data.get("severity")
        component = diagnosis_data.get("component")
        
        # 4. Fetch service center availability data dynamically from Firestore
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
        # Validate PROJECT_ID and LOCATION before initialization
        if not PROJECT_ID or " " in PROJECT_ID or "=" in PROJECT_ID:
            raise ValueError(f"Invalid PROJECT_ID: '{PROJECT_ID}'. Must be a single word without spaces or equals signs.")
        if not LOCATION or " " in LOCATION or "=" in LOCATION:
            raise ValueError(f"Invalid LOCATION: '{LOCATION}'. Must be a single word without spaces or equals signs.")
        
        print(f"Initializing Vertex AI with project={PROJECT_ID}, location={LOCATION}")
        vertexai.init(project=PROJECT_ID, location=LOCATION)
        model = GenerativeModel("gemini-2.5-flash")
        
        prompt = f"{SYSTEM_PROMPT}\n\nSchedule service for this vehicle:\n{json.dumps(input_data, default=str, indent=2)}\n\nCurrent date/time: {now.isoformat()}Z\n\nReturn ONLY the JSON response matching the output format specified above."
        
        # Add longer random delay (0-10 seconds) to spread out concurrent requests and reduce rate limiting
        jitter = random.uniform(0, 10)
        print(f"Adding {jitter:.2f}s jitter delay to spread out requests...")
        time.sleep(jitter)
        
        # Additional check: Before calling Gemini, verify no duplicate scheduling was created during jitter delay
        quick_check = list(db.collection("scheduling_cases")
            .where("rca_id", "==", rca_id)
            .limit(1).stream())
        
        if quick_check:
            existing_scheduling_id = quick_check[0].id
            print(f"Skipping Gemini call for RCA {rca_id} - duplicate scheduling {existing_scheduling_id} detected after jitter delay")
            return {"status": "skipped", "message": "Duplicate detected after jitter", "scheduling_id": existing_scheduling_id}
        
        # Call Gemini with retry logic for rate limiting (429 errors)
        max_retries = 5
        retry_delay = 2  # Start with 2 seconds
        response = None
        response_text = None
        
        for attempt in range(max_retries):
            try:
                response = model.generate_content(prompt)
                response_text = response.text
                break  # Success, exit retry loop
            except exceptions.ResourceExhausted as e:
                if attempt < max_retries - 1:
                    # Exponential backoff with jitter: 2s, 4s, 8s, 16s, 32s
                    wait_time = retry_delay * (2 ** attempt) + random.uniform(0, 1)
                    print(f"Rate limit hit (429), retrying in {wait_time:.2f}s (attempt {attempt + 1}/{max_retries})...")
                    time.sleep(wait_time)
                else:
                    # Last attempt failed
                    print(f"Rate limit error after {max_retries} attempts: {str(e)}")
                    raise
            except Exception as e:
                # For other errors, don't retry
                print(f"Error calling Gemini: {str(e)}")
                raise
        
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
        
        # Final check: Don't create duplicate scheduling if one was created while we were processing
        existing_final = list(db.collection("scheduling_cases")
            .where("rca_id", "==", rca_id)
            .limit(1).stream())
        
        if existing_final:
            existing_scheduling_id = existing_final[0].id
            existing_scheduling_data = existing_final[0].to_dict()
            existing_created_at = existing_scheduling_data.get("created_at")
            
            # Check if the existing scheduling is very recent (within last 30 seconds)
            try:
                if isinstance(existing_created_at, datetime):
                    existing_dt = existing_created_at
                    if existing_dt.tzinfo is None:
                        existing_dt = existing_dt.replace(tzinfo=timezone.utc)
                    time_diff = (datetime.now(timezone.utc) - existing_dt).total_seconds()
                    if time_diff < 30:  # Only skip if very recent (within 30 seconds)
                        print(f"Duplicate scheduling detected - scheduling {existing_scheduling_id} created {time_diff:.1f}s ago. Skipping.")
                        return {"status": "skipped", "message": "Duplicate scheduling detected", "scheduling_id": existing_scheduling_id}
                    else:
                        print(f"Existing scheduling {existing_scheduling_id} is {time_diff:.1f}s old - allowing new scheduling creation")
                elif existing_created_at is firestore.SERVER_TIMESTAMP or (hasattr(existing_created_at, "__class__") and "Sentinel" in str(type(existing_created_at))):
                    # Sentinel means just created - skip
                    print(f"Duplicate scheduling detected - scheduling {existing_scheduling_id} was just created. Skipping.")
                    return {"status": "skipped", "message": "Duplicate scheduling detected", "scheduling_id": existing_scheduling_id}
            except:
                # If timestamp check fails, skip to be safe
                print(f"Duplicate scheduling detected - scheduling {existing_scheduling_id} exists (timestamp check failed). Skipping.")
                return {"status": "skipped", "message": "Duplicate scheduling detected", "scheduling_id": existing_scheduling_id}
        
        # 9. Store in Firestore
        db.collection("scheduling_cases").document(scheduling_id).set(scheduling_data)
        print(f"Created scheduling case {scheduling_id} for vehicle {vehicle_id}")
        
        # 10. Update RCA case status
        rca_ref = db.collection("rca_cases").document(rca_id)
        rca_ref.update({"status": "scheduled"})
        
        # 11. Prepare BigQuery row and sync (non-blocking - don't fail if BigQuery fails)
        try:
            bq_row = prepare_bigquery_row(scheduling_data)
            bq_client = bigquery.Client()
            table_ref = bq_client.dataset(DATASET_ID).table(TABLE_ID)
            errors = bq_client.insert_rows_json(table_ref, [bq_row])
            
            if errors:
                print(f"BigQuery insert errors: {errors}")
            else:
                print(f"Synced scheduling case {scheduling_id} to BigQuery")
        except Exception as bq_error:
            # Don't fail the entire function if BigQuery fails (table might not exist yet)
            print(f"BigQuery sync failed (non-blocking): {str(bq_error)}. Continuing with Pub/Sub publish...")
        
        # 12. Publish to Pub/Sub
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
        
        # Handle Firestore SERVER_TIMESTAMP (Sentinel object)
        if key == "created_at":
            # Check if it's a SERVER_TIMESTAMP Sentinel object
            if value is firestore.SERVER_TIMESTAMP or (hasattr(value, "__class__") and "Sentinel" in str(type(value))):
                from datetime import datetime, timezone
                bq_row[bq_key] = datetime.now(timezone.utc).isoformat()
            elif hasattr(value, "timestamp"):
                # Already a timestamp object
                from datetime import timezone
                bq_row[bq_key] = datetime.now(timezone.utc).isoformat()
            elif value is None:
                # Skip None values
                continue
            else:
                # Already a string or datetime
                bq_row[bq_key] = value
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
            # Ensure slot_date is naive (no timezone) before localize
            slot_date_naive = slot_date.replace(tzinfo=None) if slot_date.tzinfo else slot_date
            slot_datetime = slot_date_naive.replace(hour=current_hour, minute=0, second=0, microsecond=0)
            local_dt = tz.localize(slot_datetime)
            # Convert to UTC
            utc_dt = local_dt.astimezone(pytz.UTC)
            # Format as ISO string
            slots.append(utc_dt.isoformat().replace('+00:00', 'Z'))
            current_hour += 1
    
    return slots

