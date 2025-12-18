"""
Cloud Function: data_analysis_agent
Pub/Sub Trigger: Subscribes to navigo-telemetry topic
Purpose: Detects anomalies in telemetry data using Gemini 2.5 Flash
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
ANOMALY_TOPIC_NAME = "navigo-anomaly-detected"

# BigQuery configuration
DATASET_ID = "telemetry"
TABLE_ID = "anomaly_cases"

# System prompt for Data Analysis Agent
SYSTEM_PROMPT = """You are a Data Analysis Agent for NaviGo, a predictive vehicle maintenance system. 
You MUST use ONLY the Gemini 2.5 Flash model (gemini-2.5-flash) to analyze vehicle telemetry data.

CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. You will receive telemetry events as a JSON array
2. Analyze EACH event in the time-series window
3. Look for patterns, spikes, drops, or abnormal values
4. DO NOT HALLUCINATE - Only use the data provided
5. Return EXACTLY the JSON format specified below

ANOMALY DETECTION RULES (apply these rules to the ACTUAL data values):
- Engine Coolant Temperature: Normal range 80-100°C. Anomaly if >110°C (thermal_overheat)
- Engine Oil Temperature: Normal range 90-120°C. Anomaly if >130°C (oil_overheat)
- Engine RPM: Normal range 600-4000 RPM. Anomaly if >6500 RPM (rpm_spike) or <500 RPM when vehicle moving (speed_kmph > 5) (rpm_stall)
- Battery SOC: Normal range 20-100%. Anomaly if <10% (low_charge)
- Battery SOH: Normal range 80-100%. Anomaly if <70% (battery_degradation)
- DTC Codes: ANY DTC code present (non-empty array) = anomaly (dtc_fault)
- Speed Patterns: Sudden drops to 0 while previous speed > 10 kmph = anomaly (speed_anomaly)
- GPS: Invalid coordinates (lat outside -90 to 90, lon outside -180 to 180) or sudden jumps > 1km = anomaly (gps_anomaly)

SEVERITY SCORING (calculate based on ACTUAL deviation from normal):
- 0.0 = No anomaly detected
- 0.1-0.3 = Minor issue (slightly outside normal range)
- 0.4-0.6 = Moderate issue (moderately outside normal range)
- 0.7-0.8 = Serious issue (significantly outside normal range)
- 0.9-1.0 = Critical issue (extremely outside normal range or multiple anomalies)

ANOMALY TYPES (use EXACTLY these strings - no variations):
- "thermal_overheat" - Engine coolant temperature > 110°C
- "battery_degradation" - Battery SOH < 70%
- "rpm_spike" - Engine RPM > 6500
- "rpm_stall" - Engine RPM < 500 when vehicle moving
- "dtc_fault" - DTC codes array is not empty
- "low_charge" - Battery SOC < 10%
- "oil_overheat" - Engine oil temperature > 130°C
- "speed_anomaly" - Sudden speed drop to 0 from > 10 kmph
- "gps_anomaly" - Invalid GPS coordinates or sudden large jumps

OUTPUT FORMAT (you MUST return EXACTLY this JSON structure - no extra fields):
{
  "vehicle_id": "string (MUST match input vehicle_id exactly)",
  "anomaly_detected": boolean (true if ANY anomaly found, false otherwise),
  "anomaly_type": "string | null" (use EXACT anomaly type from list above, or null if no anomaly),
  "severity_score": float (0.0 to 1.0, or null if no anomaly),
  "telemetry_window": [] (array of input events - return EXACTLY as received, do not modify)
}

CRITICAL RULES - FOLLOW EXACTLY:
1. Use ONLY Gemini 2.5 Flash model (gemini-2.5-flash)
2. Return ONLY valid JSON - no markdown, no code blocks, no explanations outside JSON
3. If anomaly_detected=false, then anomaly_type MUST be null and severity_score MUST be null
4. If anomaly_detected=true, then anomaly_type MUST be a valid string from the list above
5. severity_score MUST be between 0.0 and 1.0 (inclusive) - calculate based on actual deviation
6. vehicle_id MUST exactly match the input vehicle_id
7. telemetry_window MUST contain all input events EXACTLY as received (preserve the array structure)
8. DO NOT add any fields not in the output schema
9. DO NOT modify the structure of telemetry_window events
10. If multiple anomalies detected, choose the one with highest severity_score
11. DO NOT use hard-coded values - analyze the ACTUAL data provided
12. DO NOT assume values - if a field is null/optional, check if it exists before analyzing

EXAMPLE INPUT:
{
  "telemetry_window": [
    {
      "event_id": "evt_123",
      "vehicle_id": "MH-07-AB-1234",
      "timestamp_utc": "2024-12-15T10:30:45.123Z",
      "gps_lat": 19.0760,
      "gps_lon": 72.8777,
      "speed_kmph": 60.5,
      "odometer_km": 45230.5,
      "engine_rpm": 2500,
      "engine_coolant_temp_c": 115.0,
      "battery_soc_pct": 85.0,
      "battery_soh_pct": 92.0,
      "dtc_codes": []
    }
  ]
}

EXAMPLE OUTPUT (anomaly detected):
{
  "vehicle_id": "MH-07-AB-1234",
  "anomaly_detected": true,
  "anomaly_type": "thermal_overheat",
  "severity_score": 0.75,
  "telemetry_window": [{"event_id": "evt_123", "vehicle_id": "MH-07-AB-1234", ...}]
}

EXAMPLE OUTPUT (no anomaly):
{
  "vehicle_id": "MH-07-AB-1234",
  "anomaly_detected": false,
  "anomaly_type": null,
  "severity_score": null,
  "telemetry_window": [{"event_id": "evt_123", "vehicle_id": "MH-07-AB-1234", ...}]
}

REMEMBER: 
- Return ONLY the JSON object, nothing else
- No markdown, no code blocks, no explanations
- Analyze ACTUAL data values, not assumptions
- Preserve telemetry_window exactly as received"""


def extract_json_from_response(text: str) -> dict:
    """Extract JSON from Gemini response (handles markdown code blocks)"""
    # Remove markdown code blocks if present
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    
    # Try to parse JSON
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to find JSON object in text
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        raise


@functions_framework.cloud_event
def data_analysis_agent(cloud_event):
    """
    Pub/Sub triggered function that:
    1. Receives telemetry ingestion event
    2. Fetches telemetry window from Firestore
    3. Uses Gemini 2.5 Flash to detect anomalies
    4. If anomaly detected: stores case and publishes to Pub/Sub
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
        
        event_id = message_data.get("event_id")
        vehicle_id = message_data.get("vehicle_id")
        
        if not vehicle_id:
            print("Missing vehicle_id in message")
            return {"status": "error", "error": "Missing vehicle_id"}
        
        # 2. EARLY DUPLICATE CHECK - Exit immediately if duplicate found (before any heavy processing)
        # This reduces resource usage and prevents unnecessary function executions
        db = firestore.Client()
        
        # Single efficient query: Check for ANY active case for this vehicle
        # Active = status beyond pending_diagnosis OR very recent pending_diagnosis (within 30 seconds)
        from datetime import timezone
        
        # First check: Any case with status beyond pending_diagnosis (diagnosis already started)
        active_cases = list(db.collection("anomaly_cases")
            .where("vehicle_id", "==", vehicle_id)
            .where("status", "in", ["diagnosing", "diagnosed", "scheduled", "engaged", "completed"])
            .limit(1).stream())
        
        if active_cases:
            # Diagnosis has started - exit immediately
            return {"status": "skipped", "message": "Active case exists", "case_id": active_cases[0].id}
        
        # Second check: Very recent pending_diagnosis cases (within 30 seconds)
        # This prevents processing multiple telemetry events for the same anomaly
        recent_cases = list(db.collection("anomaly_cases")
            .where("vehicle_id", "==", vehicle_id)
            .where("status", "==", "pending_diagnosis")
            .order_by("created_at", direction=firestore.Query.DESCENDING)
            .limit(1).stream())
        
        if recent_cases:
            case_doc = recent_cases[0]
            case_data = case_doc.to_dict()
            created_at = case_data.get("created_at")
            
            # Check timestamp
            try:
                if isinstance(created_at, datetime):
                    created_dt = created_at
                    if created_dt.tzinfo is None:
                        created_dt = created_dt.replace(tzinfo=timezone.utc)
                    time_diff = (datetime.now(timezone.utc) - created_dt).total_seconds()
                    if time_diff < 30:  # Skip if case created within last 30 seconds
                        return {"status": "skipped", "message": "Recent case exists", "case_id": case_doc.id, "age_seconds": time_diff}
            except:
                # If timestamp unparseable, assume recent and skip
                return {"status": "skipped", "message": "Case exists (timestamp unparseable)", "case_id": case_doc.id}
        
        # 3. Fetch telemetry window from Firestore (last 10 events for this vehicle)
        telemetry_ref = db.collection("telemetry_events")
        query = telemetry_ref.where("vehicle_id", "==", vehicle_id)\
                             .order_by("timestamp_utc", direction=firestore.Query.DESCENDING)\
                             .limit(10)
        
        events_docs = list(query.stream())
        if not events_docs:
            print(f"No telemetry events found for vehicle {vehicle_id}")
            return {"status": "success", "anomaly_detected": False, "message": "No events found"}
        
        # 4. Convert Firestore documents to dict format for Gemini
        telemetry_window = []
        for doc in reversed(events_docs):  # Reverse to get chronological order
            doc_data = doc.to_dict()
            # Convert Firestore SERVER_TIMESTAMP if present
            if "created_at" in doc_data and hasattr(doc_data["created_at"], "timestamp"):
                doc_data["created_at"] = datetime.now().isoformat()
            # Ensure all fields are JSON serializable
            telemetry_window.append(doc_data)
        
        # 5. Prepare input for Gemini
        input_data = {
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
        
        prompt = f"{SYSTEM_PROMPT}\n\nAnalyze this telemetry data:\n{json.dumps(input_data, default=str, indent=2)}\n\nReturn ONLY the JSON response matching the output format specified above."
        
        # Add longer random delay (0-10 seconds) to spread out concurrent requests and reduce rate limiting
        # This helps when multiple telemetry events arrive simultaneously
        # Increased from 0-5s to 0-10s to better handle high traffic
        jitter = random.uniform(0, 10)
        print(f"Adding {jitter:.2f}s jitter delay to spread out requests...")
        time.sleep(jitter)
        
        # Additional check: Before calling Gemini, verify no duplicate case was created during jitter delay
        # This prevents wasting Gemini API calls on duplicates
        quick_check = list(db.collection("anomaly_cases")
            .where("vehicle_id", "==", vehicle_id)
            .where("status", "==", "pending_diagnosis")
            .limit(1).stream())
        
        if quick_check:
            case_doc = quick_check[0]
            case_data = case_doc.to_dict()
            created_at = case_data.get("created_at")
            # If it's a Sentinel, it was just created - skip Gemini call
            if created_at is firestore.SERVER_TIMESTAMP or (hasattr(created_at, "__class__") and "Sentinel" in str(type(created_at))):
                print(f"Skipping Gemini call for vehicle {vehicle_id} - duplicate case {case_doc.id} detected after jitter delay")
                return {"status": "skipped", "message": "Duplicate detected after jitter", "case_id": case_doc.id}
        
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
        vehicle_id_result = result.get("vehicle_id")
        if vehicle_id_result != vehicle_id:
            print(f"Warning: vehicle_id mismatch. Expected {vehicle_id}, got {vehicle_id_result}")
            result["vehicle_id"] = vehicle_id  # Fix it
        
        anomaly_detected = result.get("anomaly_detected", False)
        anomaly_type = result.get("anomaly_type")
        severity_score = result.get("severity_score")
        
        # Validate: if no anomaly, type and score must be null
        if not anomaly_detected:
            if anomaly_type is not None or severity_score is not None:
                print("Warning: anomaly_detected=false but type/score not null. Fixing...")
                result["anomaly_type"] = None
                result["severity_score"] = None
        
        # 9. If anomaly detected, create case and publish
        if anomaly_detected:
            case_id = f"case_{uuid.uuid4().hex[:10]}"
            
            # Prepare case data for Firestore
            case_data = {
                "case_id": case_id,
                "vehicle_id": vehicle_id,
                "anomaly_detected": True,
                "anomaly_type": anomaly_type,
                "severity_score": float(severity_score) if severity_score is not None else None,
                "status": "pending_diagnosis",
                "created_at": firestore.SERVER_TIMESTAMP
            }
            
            # Store telemetry_window as reference (store event IDs)
            telemetry_event_ids = [e.get("event_id", "") for e in telemetry_window]
            case_data["telemetry_event_ids"] = telemetry_event_ids
            
            # Final check: Don't create duplicate case if one was created while we were processing
            # (race condition protection - check again right before creating)
            # Only check for pending_diagnosis cases (not diagnosing, as diagnosis may have started)
            existing_recent = list(db.collection("anomaly_cases")
                .where("vehicle_id", "==", vehicle_id)
                .where("status", "==", "pending_diagnosis")
                .limit(1).stream())
            
            if existing_recent:
                existing_case_id = existing_recent[0].id
                existing_case_data = existing_recent[0].to_dict()
                existing_created_at = existing_case_data.get("created_at")
                
                # Check if the existing case is very recent (within last 30 seconds)
                # If it's older, allow creating a new case (new anomaly detected)
                try:
                    from datetime import timezone
                    if isinstance(existing_created_at, datetime):
                        existing_dt = existing_created_at
                        if existing_dt.tzinfo is None:
                            existing_dt = existing_dt.replace(tzinfo=timezone.utc)
                        time_diff = (datetime.now(timezone.utc) - existing_dt).total_seconds()
                        if time_diff < 30:  # Only skip if very recent (within 30 seconds)
                            print(f"Duplicate case detected - case {existing_case_id} created {time_diff:.1f}s ago. Skipping.")
                            return {"status": "skipped", "message": "Duplicate case detected", "case_id": existing_case_id}
                        else:
                            print(f"Existing case {existing_case_id} is {time_diff:.1f}s old - allowing new case creation (new anomaly)")
                    elif existing_created_at is firestore.SERVER_TIMESTAMP or (hasattr(existing_created_at, "__class__") and "Sentinel" in str(type(existing_created_at))):
                        # Sentinel means just created - skip
                        print(f"Duplicate case detected - case {existing_case_id} was just created. Skipping.")
                        return {"status": "skipped", "message": "Duplicate case detected", "case_id": existing_case_id}
                except:
                    # If timestamp check fails, skip to be safe
                    print(f"Duplicate case detected - case {existing_case_id} exists (timestamp check failed). Skipping.")
                    return {"status": "skipped", "message": "Duplicate case detected", "case_id": existing_case_id}
            
            # 10. Store in Firestore
            db.collection("anomaly_cases").document(case_id).set(case_data)
            print(f"Created anomaly case {case_id} for vehicle {vehicle_id}")
            
            # 11. Prepare BigQuery row
            bq_row = prepare_bigquery_row(case_data)
            
            # 12. Sync to BigQuery
            bq_client = bigquery.Client()
            table_ref = bq_client.dataset(DATASET_ID).table(TABLE_ID)
            errors = bq_client.insert_rows_json(table_ref, [bq_row])
            
            if errors:
                print(f"BigQuery insert errors: {errors}")
            else:
                print(f"Synced anomaly case {case_id} to BigQuery")
            
            # 13. Publish to Pub/Sub
            publisher = pubsub_v1.PublisherClient()
            topic_path = publisher.topic_path(PROJECT_ID, ANOMALY_TOPIC_NAME)
            
            # Include agent_stage and confidence for orchestrator
            confidence_score = 1.0 - severity_score  # Invert: lower severity = higher confidence
            pubsub_message = {
                "case_id": case_id,
                "vehicle_id": vehicle_id,
                "anomaly_type": anomaly_type,
                "severity_score": severity_score,
                "confidence": confidence_score,  # Add confidence for orchestrator
                "agent_stage": "data_analysis",  # Explicitly set agent stage
                "severity": "High" if severity_score > 0.7 else "Medium" if severity_score > 0.4 else "Low"
            }
            
            message_bytes = json.dumps(pubsub_message).encode("utf-8")
            future = publisher.publish(topic_path, message_bytes)
            message_id = future.result()
            print(f"Published anomaly case {case_id} to {ANOMALY_TOPIC_NAME}: {message_id}")
            
            return {"status": "success", "case_id": case_id, "anomaly_detected": True}
        else:
            print(f"No anomaly detected for vehicle {vehicle_id}")
            return {"status": "success", "anomaly_detected": False}
        
    except Exception as e:
        print(f"Error in data_analysis_agent: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "error": str(e)}


def prepare_bigquery_row(case_data: dict) -> dict:
    """Prepare anomaly case data for BigQuery insertion."""
    bq_row = {}
    
    field_mapping = {
        "case_id": "case_id",
        "vehicle_id": "vehicle_id",
        "anomaly_detected": "anomaly_detected",
        "anomaly_type": "anomaly_type",
        "severity_score": "severity_score",
        "status": "status",
        "created_at": "created_at"
    }
    
    for key, bq_key in field_mapping.items():
        if key not in case_data:
            continue
            
        value = case_data[key]
        
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

