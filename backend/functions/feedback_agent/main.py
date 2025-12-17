"""
Cloud Function: feedback_agent
Pub/Sub Trigger: Subscribes to navigo-feedback-complete topic (or can be HTTP triggered for manual feedback)
Purpose: Processes service feedback and validates predictions using Gemini 2.5 Flash
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
FEEDBACK_TOPIC_NAME = "navigo-feedback-complete"

# BigQuery configuration
DATASET_ID = "telemetry"
TABLE_ID = "feedback_cases"

# System prompt for Feedback Agent
SYSTEM_PROMPT = """You are a Feedback Agent for NaviGo. You MUST use ONLY the Gemini 2.5 Flash model (gemini-2.5-flash) to analyze service feedback and validate prediction accuracy.

CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. You will receive post-service telemetry data, technician notes, and customer rating
2. Compare post-service data with the original prediction/issue
3. Analyze if the issue was resolved, recurring, or incorrectly predicted
4. Calculate CEI (Customer Effort Index) based on actual service experience
5. DO NOT HALLUCINATE - Only use the data provided
6. Return EXACTLY the JSON format specified below - no extra fields, no markdown

VALIDATION LABEL LOGIC:
- "Correct": The original prediction matched reality
  - Post-service telemetry shows the issue is resolved
  - No recurrence of the original anomaly
  - Technician notes confirm the predicted issue was found and fixed
- "Recurring": The issue returned after service
  - Post-service telemetry shows the same anomaly type appearing again
  - Issue was fixed but came back
  - Indicates incomplete fix or underlying problem
- "Incorrect": The original prediction was wrong
  - Post-service telemetry shows no sign of the predicted issue
  - Technician notes indicate different issue found
  - Original prediction did not match actual problem

CEI (Customer Effort Index) SCORING (1.0 to 5.0):
Calculate based on:
- Service completion time (faster = higher CEI)
- Customer rating (if provided: 5 stars = 5.0, 4 stars = 4.0, etc.)
- Issue resolution (resolved = higher CEI, recurring = lower CEI)
- Service complexity (simple fix = higher CEI, complex = lower CEI)
- 1.0 = Very difficult, customer had to put in significant effort
- 2.0-3.0 = Somewhat difficult, moderate effort required
- 4.0-4.5 = Easy, minimal effort required
- 5.0 = Very easy, no effort required, seamless experience

RECOMMENDED RETRAIN LOGIC:
- recommended_retrain = true if:
  - validation_label = "Incorrect" (prediction was wrong)
  - validation_label = "Recurring" (issue came back, model may need adjustment)
- recommended_retrain = false if:
  - validation_label = "Correct" (prediction was accurate)

ANALYSIS APPROACH:
1. Compare post_service_telemetry with original anomaly type
2. Check if original anomaly values (temperature, RPM, etc.) are now normal
3. Look for new anomalies in post-service data
4. Consider technician_notes for additional context
5. Factor in customer_rating if provided
6. Calculate CEI based on overall service experience

INPUT FORMAT (you will receive):
{
  "vehicle_id": "string",
  "booking_id": "string",
  "technician_notes": "string | null",
  "post_service_telemetry": [array of telemetry events after service],
  "customer_rating": int | null (1-5 scale)
}

OUTPUT FORMAT (you MUST return EXACTLY this JSON structure):
{
  "vehicle_id": "string (MUST match input vehicle_id exactly)",
  "cei_score": float (1.0 to 5.0, calculate based on service experience)",
  "validation_label": "Correct" | "Recurring" | "Incorrect" (exact strings, case-sensitive)",
  "recommended_retrain": boolean (true if Incorrect or Recurring, false if Correct)
}

CRITICAL RULES - FOLLOW EXACTLY:
1. Use ONLY Gemini 2.5 Flash model (gemini-2.5-flash)
2. Return ONLY valid JSON - no markdown, no code blocks, no explanations
3. cei_score MUST be between 1.0 and 5.0 (inclusive)
4. validation_label MUST be exactly "Correct", "Recurring", or "Incorrect" (case-sensitive)
5. recommended_retrain MUST be a boolean (true or false)
6. vehicle_id MUST exactly match input vehicle_id
7. DO NOT add any fields not in the output schema
8. Analyze ACTUAL post_service_telemetry data, not assumptions
9. Use technician_notes and customer_rating to inform CEI calculation
10. Base validation_label on actual comparison of pre-service vs post-service data

EXAMPLE INPUT:
{
  "vehicle_id": "MH-07-AB-1234",
  "booking_id": "booking_a3f9k2m1",
  "technician_notes": "Replaced coolant pump. System tested and working normally.",
  "post_service_telemetry": [
    {"engine_coolant_temp_c": 85.0, "engine_rpm": 2500, ...},
    {"engine_coolant_temp_c": 87.0, "engine_rpm": 2400, ...}
  ],
  "customer_rating": 5
}

EXAMPLE OUTPUT (Correct - issue resolved):
{
  "vehicle_id": "MH-07-AB-1234",
  "cei_score": 4.8,
  "validation_label": "Correct",
  "recommended_retrain": false
}

EXAMPLE OUTPUT (Recurring - issue came back):
{
  "vehicle_id": "MH-07-AB-1234",
  "cei_score": 2.5,
  "validation_label": "Recurring",
  "recommended_retrain": true
}

REMEMBER: Return ONLY the JSON object, analyze ACTUAL telemetry data, compare pre vs post service, calculate CEI dynamically."""


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
def feedback_agent(cloud_event):
    """
    Pub/Sub triggered function that:
    1. Receives feedback event (booking_id, technician_notes, customer_rating)
    2. Fetches original anomaly case to compare with post-service data
    3. Fetches post-service telemetry data
    4. Uses Gemini 2.5 Flash to validate predictions and calculate CEI
    5. Stores feedback result and publishes to Pub/Sub
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
        
        booking_id = message_data.get("booking_id")
        vehicle_id = message_data.get("vehicle_id")
        technician_notes = message_data.get("technician_notes")
        customer_rating = message_data.get("customer_rating")
        post_service_telemetry = message_data.get("post_service_telemetry", [])
        
        if not booking_id or not vehicle_id:
            print("Missing booking_id or vehicle_id in message")
            return {"status": "error", "error": "Missing required fields"}
        
        # 2. Check for existing feedback to prevent duplicate processing
        db = firestore.Client()
        
        # Check if feedback already exists for this booking_id (prevent duplicate feedback)
        existing_feedback = list(db.collection("feedback_cases")
            .where("booking_id", "==", booking_id)
            .limit(1).stream())
        
        if existing_feedback:
            existing_feedback_id = existing_feedback[0].id
            print(f"Feedback already exists for booking {booking_id} - feedback_id: {existing_feedback_id}. Skipping.")
            return {"status": "skipped", "message": "Feedback already exists", "feedback_id": existing_feedback_id}
        
        # 3. Fetch booking to get case_id
        booking_ref = db.collection("bookings").document(booking_id)
        booking_doc = booking_ref.get()
        
        if not booking_doc.exists:
            print(f"Booking {booking_id} not found")
            return {"status": "error", "error": "Booking not found"}
        
        booking_data = booking_doc.to_dict()
        case_id = booking_data.get("case_id")
        
        # Check if booking status is already feedback_complete (prevent processing if already completed)
        booking_status = booking_data.get("status", "")
        if booking_status == "feedback_complete":
            print(f"Booking {booking_id} status is feedback_complete - feedback already processed. Skipping.")
            return {"status": "skipped", "message": "Feedback already completed"}
        
        # 4. Fetch original anomaly case to get original anomaly type
        case_ref = db.collection("anomaly_cases").document(case_id)
        case_doc = case_ref.get()
        
        if not case_doc.exists:
            print(f"Anomaly case {case_id} not found")
            return {"status": "error", "error": "Anomaly case not found"}
        
        case_data = case_doc.to_dict()
        original_anomaly_type = case_data.get("anomaly_type")
        
        # 5. If post_service_telemetry not provided, fetch recent telemetry events
        if not post_service_telemetry:
            # Fetch last 10 telemetry events after booking date
            booking_date = booking_data.get("created_at")
            if booking_date:
                telemetry_ref = db.collection("telemetry_events")
                query = telemetry_ref.where("vehicle_id", "==", vehicle_id)\
                                     .order_by("timestamp_utc", direction=firestore.Query.DESCENDING)\
                                     .limit(10)
                events_docs = list(query.stream())
                post_service_telemetry = [doc.to_dict() for doc in events_docs]
        
        # 6. Prepare input for Gemini
        input_data = {
            "vehicle_id": vehicle_id,
            "booking_id": booking_id,
            "technician_notes": technician_notes,
            "post_service_telemetry": post_service_telemetry,
            "customer_rating": customer_rating
        }
        
        # 7. Initialize Vertex AI and call Gemini 2.5 Flash
        # Validate PROJECT_ID and LOCATION before initialization
        if not PROJECT_ID or " " in PROJECT_ID or "=" in PROJECT_ID:
            raise ValueError(f"Invalid PROJECT_ID: '{PROJECT_ID}'. Must be a single word without spaces or equals signs.")
        if not LOCATION or " " in LOCATION or "=" in LOCATION:
            raise ValueError(f"Invalid LOCATION: '{LOCATION}'. Must be a single word without spaces or equals signs.")
        
        print(f"Initializing Vertex AI with project={PROJECT_ID}, location={LOCATION}")
        vertexai.init(project=PROJECT_ID, location=LOCATION)
        model = GenerativeModel("gemini-2.5-flash")
        
        # Add original anomaly context to prompt
        prompt = f"{SYSTEM_PROMPT}\n\nOriginal anomaly type: {original_anomaly_type}\n\nAnalyze this service feedback:\n{json.dumps(input_data, default=str, indent=2)}\n\nReturn ONLY the JSON response matching the output format specified above."
        
        # Add longer random delay (0-10 seconds) to spread out concurrent requests and reduce rate limiting
        jitter = random.uniform(0, 10)
        print(f"Adding {jitter:.2f}s jitter delay to spread out requests...")
        time.sleep(jitter)
        
        # Additional check: Before calling Gemini, verify no duplicate feedback was created during jitter delay
        quick_check = list(db.collection("feedback_cases")
            .where("booking_id", "==", booking_id)
            .limit(1).stream())
        
        if quick_check:
            existing_feedback_id = quick_check[0].id
            print(f"Skipping Gemini call for booking {booking_id} - duplicate feedback {existing_feedback_id} detected after jitter delay")
            return {"status": "skipped", "message": "Duplicate detected after jitter", "feedback_id": existing_feedback_id}
        
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
        
        # 8. Parse Gemini response
        try:
            result = extract_json_from_response(response_text)
        except Exception as e:
            print(f"Error parsing Gemini response: {e}")
            print(f"Response text: {response_text}")
            raise ValueError(f"Invalid JSON response from Gemini: {e}")
        
        # 9. Validate result matches schema
        if result.get("vehicle_id") != vehicle_id:
            result["vehicle_id"] = vehicle_id
        
        feedback_id = f"feedback_{uuid.uuid4().hex[:10]}"
        
        # 10. Prepare feedback data for Firestore
        feedback_data = {
            "feedback_id": feedback_id,
            "booking_id": booking_id,
            "case_id": case_id,
            "vehicle_id": vehicle_id,
            "cei_score": float(result.get("cei_score", 3.0)),
            "validation_label": result.get("validation_label"),
            "recommended_retrain": bool(result.get("recommended_retrain", False)),
            "technician_notes": technician_notes,
            "customer_rating": customer_rating,
            "status": "completed",
            "created_at": firestore.SERVER_TIMESTAMP
        }
        
        # Final check: Don't create duplicate feedback if one was created while we were processing
        existing_final = list(db.collection("feedback_cases")
            .where("booking_id", "==", booking_id)
            .limit(1).stream())
        
        if existing_final:
            existing_feedback_id = existing_final[0].id
            existing_feedback_data = existing_final[0].to_dict()
            existing_created_at = existing_feedback_data.get("created_at")
            
            # Check if the existing feedback is very recent (within last 30 seconds)
            try:
                from datetime import timezone
                if isinstance(existing_created_at, datetime):
                    existing_dt = existing_created_at
                    if existing_dt.tzinfo is None:
                        existing_dt = existing_dt.replace(tzinfo=timezone.utc)
                    time_diff = (datetime.now(timezone.utc) - existing_dt).total_seconds()
                    if time_diff < 30:  # Only skip if very recent (within 30 seconds)
                        print(f"Duplicate feedback detected - feedback {existing_feedback_id} created {time_diff:.1f}s ago. Skipping.")
                        return {"status": "skipped", "message": "Duplicate feedback detected", "feedback_id": existing_feedback_id}
                    else:
                        print(f"Existing feedback {existing_feedback_id} is {time_diff:.1f}s old - allowing new feedback creation")
                elif existing_created_at is firestore.SERVER_TIMESTAMP or (hasattr(existing_created_at, "__class__") and "Sentinel" in str(type(existing_created_at))):
                    # Sentinel means just created - skip
                    print(f"Duplicate feedback detected - feedback {existing_feedback_id} was just created. Skipping.")
                    return {"status": "skipped", "message": "Duplicate feedback detected", "feedback_id": existing_feedback_id}
            except:
                # If timestamp check fails, skip to be safe
                print(f"Duplicate feedback detected - feedback {existing_feedback_id} exists (timestamp check failed). Skipping.")
                return {"status": "skipped", "message": "Duplicate feedback detected", "feedback_id": existing_feedback_id}
        
        # 11. Store in Firestore
        db.collection("feedback_cases").document(feedback_id).set(feedback_data)
        print(f"Created feedback case {feedback_id} for vehicle {vehicle_id}")
        
        # 12. Update booking status
        booking_ref.update({"status": "feedback_complete"})
        
        # 13. Prepare BigQuery row and sync (non-blocking - don't fail if BigQuery fails)
        try:
            bq_row = prepare_bigquery_row(feedback_data)
            bq_client = bigquery.Client()
            table_ref = bq_client.dataset(DATASET_ID).table(TABLE_ID)
            errors = bq_client.insert_rows_json(table_ref, [bq_row])
            
            if errors:
                print(f"BigQuery insert errors: {errors}")
            else:
                print(f"Synced feedback case {feedback_id} to BigQuery")
        except Exception as bq_error:
            # Don't fail the entire function if BigQuery fails (table might not exist yet)
            print(f"BigQuery sync failed (non-blocking): {str(bq_error)}. Continuing with Pub/Sub publish...")
        
        # 14. Publish to Pub/Sub
        publisher = pubsub_v1.PublisherClient()
        topic_path = publisher.topic_path(PROJECT_ID, FEEDBACK_TOPIC_NAME)
        
        pubsub_message = {
            "feedback_id": feedback_id,
            "booking_id": booking_id,
            "case_id": case_id,
            "vehicle_id": vehicle_id,
            "cei_score": result.get("cei_score"),
            "validation_label": result.get("validation_label"),
            "recommended_retrain": result.get("recommended_retrain")
        }
        
        message_bytes = json.dumps(pubsub_message).encode("utf-8")
        future = publisher.publish(topic_path, message_bytes)
        message_id = future.result()
        print(f"Published feedback case {feedback_id} to {FEEDBACK_TOPIC_NAME}: {message_id}")
        
        return {"status": "success", "feedback_id": feedback_id}
        
    except Exception as e:
        print(f"Error in feedback_agent: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "error": str(e)}


def prepare_bigquery_row(feedback_data: dict) -> dict:
    """Prepare feedback case data for BigQuery insertion."""
    bq_row = {}
    
    field_mapping = {
        "feedback_id": "feedback_id",
        "booking_id": "booking_id",
        "case_id": "case_id",
        "vehicle_id": "vehicle_id",
        "cei_score": "cei_score",
        "validation_label": "validation_label",
        "recommended_retrain": "recommended_retrain",
        "technician_notes": "technician_notes",
        "customer_rating": "customer_rating",
        "status": "status",
        "created_at": "created_at"
    }
    
    for key, bq_key in field_mapping.items():
        if key not in feedback_data:
            continue
        
        value = feedback_data[key]
        
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

