"""
Cloud Function: diagnosis_agent
Pub/Sub Trigger: Subscribes to navigo-anomaly-detected topic
Purpose: Diagnoses component failures using Gemini 2.5 Flash
"""

import json
import os
import uuid
import re
import time
import random
from datetime import datetime
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
DIAGNOSIS_TOPIC_NAME = "navigo-diagnosis-complete"

# BigQuery configuration
DATASET_ID = "telemetry"
TABLE_ID = "diagnosis_cases"

# System prompt for Diagnosis Agent
SYSTEM_PROMPT = """You are a Diagnosis Agent for NaviGo. You MUST use ONLY the Gemini 2.5 Flash model (gemini-2.5-flash) to diagnose vehicle component failures.

CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. You will receive anomaly detection results and telemetry window data
2. Analyze the ACTUAL anomaly type and severity score provided
3. Identify the specific component that is failing based on the anomaly type
4. DO NOT HALLUCINATE - Only use the data provided, do not assume or invent values
5. Return EXACTLY the JSON format specified below - no extra fields, no markdown

COMPONENT MAPPING (map anomaly_type to component - use EXACTLY these strings):
- "thermal_overheat" → "engine_coolant_system"
- "oil_overheat" → "engine_oil_system"
- "battery_degradation" → "battery"
- "low_charge" → "battery"
- "rpm_spike" → "engine"
- "rpm_stall" → "engine"
- "dtc_fault" → Analyze DTC codes to determine component (P0xxx = engine, P1xxx = transmission, etc.)
- "speed_anomaly" → "transmission" or "brake_system" (analyze context)
- "gps_anomaly" → "gps_system"

FAILURE PROBABILITY CALCULATION (based on ACTUAL severity_score):
- If severity_score is null or 0.0: failure_probability = 0.0
- If severity_score 0.1-0.3: failure_probability = 0.2-0.4 (low risk)
- If severity_score 0.4-0.6: failure_probability = 0.5-0.7 (moderate risk)
- If severity_score 0.7-0.8: failure_probability = 0.75-0.85 (high risk)
- If severity_score 0.9-1.0: failure_probability = 0.9-1.0 (critical risk)

RUL (Remaining Useful Life) ESTIMATION (in days, based on ACTUAL data):
- Calculate based on severity_score and anomaly_type
- Higher severity = lower RUL
- Critical issues (severity > 0.8): RUL = 1-7 days
- Serious issues (severity 0.7-0.8): RUL = 7-30 days
- Moderate issues (severity 0.4-0.6): RUL = 30-90 days
- Low issues (severity < 0.4): RUL = 90-180 days
- RUL MUST be a positive integer (minimum 1 day)

SEVERITY CLASSIFICATION (based on failure_probability):
- "Low": failure_probability < 0.3
- "Medium": failure_probability >= 0.3 AND < 0.7
- "High": failure_probability >= 0.7

INPUT FORMAT (you will receive):
{
  "vehicle_id": "string",
  "anomaly_detected": boolean,
  "anomaly_type": "string | null",
  "severity_score": float | null,
  "telemetry_window": [array of telemetry events]
}

OUTPUT FORMAT (you MUST return EXACTLY this JSON structure):
{
  "vehicle_id": "string (MUST match input vehicle_id exactly)",
  "component": "string (use EXACT component name from mapping above)",
  "failure_probability": float (0.0 to 1.0, calculate from severity_score),
  "estimated_rul_days": int (positive integer, calculate from severity and anomaly type),
  "severity": "Low" | "Medium" | "High" (based on failure_probability),
  "context_window": [] (array of input telemetry_window events - return EXACTLY as received)
}

CRITICAL RULES - FOLLOW EXACTLY:
1. Use ONLY Gemini 2.5 Flash model (gemini-2.5-flash)
2. Return ONLY valid JSON - no markdown, no code blocks, no explanations
3. component MUST be one of the exact strings from the mapping above
4. failure_probability MUST be between 0.0 and 1.0 (inclusive)
5. estimated_rul_days MUST be a positive integer (minimum 1)
6. severity MUST be exactly "Low", "Medium", or "High" (case-sensitive)
7. vehicle_id MUST exactly match input vehicle_id
8. context_window MUST contain all input telemetry_window events EXACTLY as received
9. DO NOT add any fields not in the output schema
10. DO NOT use hard-coded values - calculate based on ACTUAL input data
11. If anomaly_detected=false, set failure_probability=0.0, estimated_rul_days=180, severity="Low"

EXAMPLE INPUT:
{
  "vehicle_id": "MH-07-AB-1234",
  "anomaly_detected": true,
  "anomaly_type": "thermal_overheat",
  "severity_score": 0.75,
  "telemetry_window": [...]
}

EXAMPLE OUTPUT:
{
  "vehicle_id": "MH-07-AB-1234",
  "component": "engine_coolant_system",
  "failure_probability": 0.8,
  "estimated_rul_days": 15,
  "severity": "High",
  "context_window": [...]
}

REMEMBER: Return ONLY the JSON object, analyze ACTUAL data, use exact component names, calculate dynamically."""


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
def diagnosis_agent(cloud_event):
    """
    Pub/Sub triggered function that:
    1. Receives anomaly detection event
    2. Fetches anomaly case and telemetry window from Firestore
    3. Uses Gemini 2.5 Flash to diagnose component failure
    4. Stores diagnosis result and publishes to Pub/Sub
    """
    
    try:
        # 1. Parse Pub/Sub message
        # For 2nd gen Cloud Functions, cloud_event.data can be:
        # - A string (JSON string)
        # - A dict (already parsed)
        # - Base64 encoded in a "message" wrapper (legacy format)
        
        message_data = None
        
        if isinstance(cloud_event.data, str):
            try:
                message_data = json.loads(cloud_event.data)
            except json.JSONDecodeError:
                # Might be base64 encoded
                try:
                    import base64
                    decoded = base64.b64decode(cloud_event.data).decode("utf-8")
                    message_data = json.loads(decoded)
                except:
                    print(f"Failed to parse cloud_event.data as JSON or base64: {cloud_event.data[:100]}")
                    raise
        elif isinstance(cloud_event.data, dict):
            message_data = cloud_event.data
        else:
            message_data = cloud_event.data
        
        # Handle legacy Pub/Sub message format (wrapped in "message" object)
        if isinstance(message_data, dict) and "message" in message_data and "data" in message_data["message"]:
            import base64
            try:
                decoded = base64.b64decode(message_data["message"]["data"]).decode("utf-8")
                if decoded:  # Only parse if decoded string is not empty
                    message_data = json.loads(decoded)
            except Exception as e:
                print(f"Error decoding base64 message data: {e}")
                # Try to use message_data as-is if decoding fails
                pass
        
        case_id = message_data.get("case_id")
        vehicle_id = message_data.get("vehicle_id")
        anomaly_type = message_data.get("anomaly_type")
        severity_score = message_data.get("severity_score")
        
        if not case_id or not vehicle_id:
            print("Missing case_id or vehicle_id in message")
            return {"status": "error", "error": "Missing required fields"}
        
        # 2. Check for existing diagnosis to prevent duplicate processing
        db = firestore.Client()
        
        # Check if diagnosis already exists for this case_id (prevent duplicate diagnosis)
        existing_diagnosis = list(db.collection("diagnosis_cases")
            .where("case_id", "==", case_id)
            .limit(1).stream())
        
        if existing_diagnosis:
            existing_diagnosis_id = existing_diagnosis[0].id
            print(f"Diagnosis already exists for case {case_id} - diagnosis_id: {existing_diagnosis_id}. Skipping.")
            return {"status": "skipped", "message": "Diagnosis already exists", "diagnosis_id": existing_diagnosis_id}
        
        # 3. Fetch anomaly case from Firestore
        case_ref = db.collection("anomaly_cases").document(case_id)
        case_doc = case_ref.get()
        
        if not case_doc.exists:
            print(f"Anomaly case {case_id} not found")
            return {"status": "error", "error": "Case not found"}
        
        case_data = case_doc.to_dict()
        
        # Check if case status is already beyond diagnosis (prevent processing if already diagnosed)
        case_status = case_data.get("status", "")
        if case_status in ["diagnosed", "scheduled", "engaged", "completed"]:
            print(f"Case {case_id} status is {case_status} - diagnosis already completed. Skipping.")
            return {"status": "skipped", "message": f"Case already {case_status}"}
        
        # 4. Fetch telemetry window using event IDs stored in case
        telemetry_event_ids = case_data.get("telemetry_event_ids", [])
        telemetry_window = []
        
        if telemetry_event_ids:
            for event_id in telemetry_event_ids:
                event_doc = db.collection("telemetry_events").document(event_id).get()
                if event_doc.exists:
                    event_data = event_doc.to_dict()
                    # Convert Firestore SERVER_TIMESTAMP if present
                    if "created_at" in event_data and hasattr(event_data["created_at"], "timestamp"):
                        event_data["created_at"] = datetime.now().isoformat()
                    telemetry_window.append(event_data)
        
        # 5. Prepare input for Gemini
        input_data = {
            "vehicle_id": vehicle_id,
            "anomaly_detected": case_data.get("anomaly_detected", True),
            "anomaly_type": anomaly_type or case_data.get("anomaly_type"),
            "severity_score": severity_score if severity_score is not None else case_data.get("severity_score"),
            "telemetry_window": telemetry_window
        }
        
        # 6. Initialize Vertex AI and call Gemini 2.5 Flash
        # Validate PROJECT_ID and LOCATION before initialization
        if not PROJECT_ID or " " in PROJECT_ID or "=" in PROJECT_ID:
            raise ValueError(f"Invalid PROJECT_ID: '{PROJECT_ID}'. Must be a single word without spaces or equals signs.")
        if not LOCATION or " " in LOCATION or "=" in LOCATION:
            raise ValueError(f"Invalid LOCATION: '{LOCATION}'. Must be a single word without spaces or equals signs.")
        
        print(f"Initializing Vertex AI with project={PROJECT_ID}, location={LOCATION}")
        vertexai.init(project=PROJECT_ID, location=LOCATION)
        model = GenerativeModel("gemini-2.5-flash")
        
        prompt = f"{SYSTEM_PROMPT}\n\nAnalyze this anomaly data:\n{json.dumps(input_data, default=str, indent=2)}\n\nReturn ONLY the JSON response matching the output format specified above."
        
        # Add longer random delay (0-10 seconds) to spread out concurrent requests and reduce rate limiting
        jitter = random.uniform(0, 10)
        print(f"Adding {jitter:.2f}s jitter delay to spread out requests...")
        time.sleep(jitter)
        
        # Additional check: Before calling Gemini, verify no duplicate diagnosis was created during jitter delay
        quick_check = list(db.collection("diagnosis_cases")
            .where("case_id", "==", case_id)
            .limit(1).stream())
        
        if quick_check:
            existing_diagnosis_id = quick_check[0].id
            print(f"Skipping Gemini call for case {case_id} - duplicate diagnosis {existing_diagnosis_id} detected after jitter delay")
            return {"status": "skipped", "message": "Duplicate detected after jitter", "diagnosis_id": existing_diagnosis_id}
        
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
        
        # 7. Parse Gemini response
        try:
            result = extract_json_from_response(response_text)
        except Exception as e:
            print(f"Error parsing Gemini response: {e}")
            print(f"Response text: {response_text}")
            raise ValueError(f"Invalid JSON response from Gemini: {e}")
        
        # 8. Validate result matches schema
        if result.get("vehicle_id") != vehicle_id:
            result["vehicle_id"] = vehicle_id
        
        diagnosis_id = f"diagnosis_{uuid.uuid4().hex[:10]}"
        
        # 9. Prepare diagnosis data for Firestore
        diagnosis_data = {
            "diagnosis_id": diagnosis_id,
            "case_id": case_id,
            "vehicle_id": vehicle_id,
            "component": result.get("component"),
            "failure_probability": float(result.get("failure_probability", 0.0)),
            "estimated_rul_days": int(result.get("estimated_rul_days", 180)),
            "severity": result.get("severity"),
            "status": "pending_rca",
            "created_at": firestore.SERVER_TIMESTAMP
        }
        
        # Store context_window event IDs
        context_event_ids = [e.get("event_id", "") for e in telemetry_window]
        diagnosis_data["context_event_ids"] = context_event_ids
        
        # Final check: Don't create duplicate diagnosis if one was created while we were processing
        existing_final = list(db.collection("diagnosis_cases")
            .where("case_id", "==", case_id)
            .limit(1).stream())
        
        if existing_final:
            existing_diagnosis_id = existing_final[0].id
            existing_diagnosis_data = existing_final[0].to_dict()
            existing_created_at = existing_diagnosis_data.get("created_at")
            
            # Check if the existing diagnosis is very recent (within last 30 seconds)
            try:
                from datetime import timezone
                if isinstance(existing_created_at, datetime):
                    existing_dt = existing_created_at
                    if existing_dt.tzinfo is None:
                        existing_dt = existing_dt.replace(tzinfo=timezone.utc)
                    time_diff = (datetime.now(timezone.utc) - existing_dt).total_seconds()
                    if time_diff < 30:  # Only skip if very recent (within 30 seconds)
                        print(f"Duplicate diagnosis detected - diagnosis {existing_diagnosis_id} created {time_diff:.1f}s ago. Skipping.")
                        return {"status": "skipped", "message": "Duplicate diagnosis detected", "diagnosis_id": existing_diagnosis_id}
                    else:
                        print(f"Existing diagnosis {existing_diagnosis_id} is {time_diff:.1f}s old - allowing new diagnosis creation")
                elif existing_created_at is firestore.SERVER_TIMESTAMP or (hasattr(existing_created_at, "__class__") and "Sentinel" in str(type(existing_created_at))):
                    # Sentinel means just created - skip
                    print(f"Duplicate diagnosis detected - diagnosis {existing_diagnosis_id} was just created. Skipping.")
                    return {"status": "skipped", "message": "Duplicate diagnosis detected", "diagnosis_id": existing_diagnosis_id}
            except:
                # If timestamp check fails, skip to be safe
                print(f"Duplicate diagnosis detected - diagnosis {existing_diagnosis_id} exists (timestamp check failed). Skipping.")
                return {"status": "skipped", "message": "Duplicate diagnosis detected", "diagnosis_id": existing_diagnosis_id}
        
        # 10. Store in Firestore
        db.collection("diagnosis_cases").document(diagnosis_id).set(diagnosis_data)
        print(f"Created diagnosis case {diagnosis_id} for vehicle {vehicle_id}")
        
        # 11. Update anomaly case status
        case_ref.update({"status": "diagnosed"})
        
        # 12. Prepare BigQuery row and sync (non-blocking - don't fail if BigQuery fails)
        try:
            bq_row = prepare_bigquery_row(diagnosis_data)
            bq_client = bigquery.Client()
            table_ref = bq_client.dataset(DATASET_ID).table(TABLE_ID)
            errors = bq_client.insert_rows_json(table_ref, [bq_row])
            
            if errors:
                print(f"BigQuery insert errors: {errors}")
            else:
                print(f"Synced diagnosis case {diagnosis_id} to BigQuery")
        except Exception as bq_error:
            # Don't fail the entire function if BigQuery fails (table might not exist yet)
            print(f"BigQuery sync failed (non-blocking): {str(bq_error)}. Continuing with Pub/Sub publish...")
        
        # 14. Publish to Pub/Sub
        publisher = pubsub_v1.PublisherClient()
        topic_path = publisher.topic_path(PROJECT_ID, DIAGNOSIS_TOPIC_NAME)
        
        pubsub_message = {
            "diagnosis_id": diagnosis_id,
            "case_id": case_id,
            "vehicle_id": vehicle_id,
            "component": result.get("component"),
            "failure_probability": result.get("failure_probability"),
            "estimated_rul_days": result.get("estimated_rul_days"),
            "severity": result.get("severity")
        }
        
        message_bytes = json.dumps(pubsub_message).encode("utf-8")
        future = publisher.publish(topic_path, message_bytes)
        message_id = future.result()
        print(f"Published diagnosis case {diagnosis_id} to {DIAGNOSIS_TOPIC_NAME}: {message_id}")
        
        return {"status": "success", "diagnosis_id": diagnosis_id}
        
    except Exception as e:
        print(f"Error in diagnosis_agent: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "error": str(e)}


def prepare_bigquery_row(diagnosis_data: dict) -> dict:
    """Prepare diagnosis case data for BigQuery insertion."""
    bq_row = {}
    
    field_mapping = {
        "diagnosis_id": "diagnosis_id",
        "case_id": "case_id",
        "vehicle_id": "vehicle_id",
        "component": "component",
        "failure_probability": "failure_probability",
        "estimated_rul_days": "estimated_rul_days",
        "severity": "severity",
        "status": "status",
        "created_at": "created_at"
    }
    
    for key, bq_key in field_mapping.items():
        if key not in diagnosis_data:
            continue
        
        value = diagnosis_data[key]
        
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
        elif value is None:
            continue
        else:
            bq_row[bq_key] = value
    
    return bq_row

