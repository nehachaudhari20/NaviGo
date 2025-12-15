"""
Cloud Function: feedback_agent
Pub/Sub Trigger: Subscribes to navigo-feedback-complete topic (or can be HTTP triggered for manual feedback)
Purpose: Processes service feedback and validates predictions using Gemini 2.5 Flash
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
        if isinstance(cloud_event.data, str):
            message_data = json.loads(cloud_event.data)
        else:
            message_data = cloud_event.data
        
        # Handle base64 encoded data
        if "message" in message_data and "data" in message_data["message"]:
            import base64
            decoded = base64.b64decode(message_data["message"]["data"]).decode("utf-8")
            message_data = json.loads(decoded)
        
        booking_id = message_data.get("booking_id")
        vehicle_id = message_data.get("vehicle_id")
        technician_notes = message_data.get("technician_notes")
        customer_rating = message_data.get("customer_rating")
        post_service_telemetry = message_data.get("post_service_telemetry", [])
        
        if not booking_id or not vehicle_id:
            print("Missing booking_id or vehicle_id in message")
            return {"status": "error", "error": "Missing required fields"}
        
        # 2. Fetch booking to get case_id
        db = firestore.Client()
        booking_ref = db.collection("bookings").document(booking_id)
        booking_doc = booking_ref.get()
        
        if not booking_doc.exists:
            print(f"Booking {booking_id} not found")
            return {"status": "error", "error": "Booking not found"}
        
        booking_data = booking_doc.to_dict()
        case_id = booking_data.get("case_id")
        
        # 3. Fetch original anomaly case to get original anomaly type
        case_ref = db.collection("anomaly_cases").document(case_id)
        case_doc = case_ref.get()
        
        if not case_doc.exists:
            print(f"Anomaly case {case_id} not found")
            return {"status": "error", "error": "Anomaly case not found"}
        
        case_data = case_doc.to_dict()
        original_anomaly_type = case_data.get("anomaly_type")
        
        # 4. If post_service_telemetry not provided, fetch recent telemetry events
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
        
        # 5. Prepare input for Gemini
        input_data = {
            "vehicle_id": vehicle_id,
            "booking_id": booking_id,
            "technician_notes": technician_notes,
            "post_service_telemetry": post_service_telemetry,
            "customer_rating": customer_rating
        }
        
        # 6. Initialize Vertex AI and call Gemini 2.5 Flash
        vertexai.init(project=PROJECT_ID, location=LOCATION)
        model = GenerativeModel("gemini-2.5-flash")
        
        # Add original anomaly context to prompt
        prompt = f"{SYSTEM_PROMPT}\n\nOriginal anomaly type: {original_anomaly_type}\n\nAnalyze this service feedback:\n{json.dumps(input_data, default=str, indent=2)}\n\nReturn ONLY the JSON response matching the output format specified above."
        
        response = model.generate_content(prompt)
        response_text = response.text
        
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
        
        feedback_id = f"feedback_{uuid.uuid4().hex[:10]}"
        
        # 9. Prepare feedback data for Firestore
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
        
        # 10. Store in Firestore
        db.collection("feedback_cases").document(feedback_id).set(feedback_data)
        print(f"Created feedback case {feedback_id} for vehicle {vehicle_id}")
        
        # 11. Update booking status
        booking_ref.update({"status": "feedback_complete"})
        
        # 12. Prepare BigQuery row
        bq_row = prepare_bigquery_row(feedback_data)
        
        # 13. Sync to BigQuery
        bq_client = bigquery.Client()
        table_ref = bq_client.dataset(DATASET_ID).table(TABLE_ID)
        errors = bq_client.insert_rows_json(table_ref, [bq_row])
        
        if errors:
            print(f"BigQuery insert errors: {errors}")
        else:
            print(f"Synced feedback case {feedback_id} to BigQuery")
        
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
        
        # Handle Firestore SERVER_TIMESTAMP
        if key == "created_at" and hasattr(value, "timestamp"):
            from datetime import timezone
            bq_row[bq_key] = datetime.now(timezone.utc).isoformat()
        elif value is None:
            continue
        else:
            bq_row[bq_key] = value
    
    return bq_row

