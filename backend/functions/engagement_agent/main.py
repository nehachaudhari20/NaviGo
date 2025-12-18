"""
Cloud Function: engagement_agent
Pub/Sub Trigger: Subscribes to navigo-scheduling-complete topic
Purpose: Generates customer engagement scripts using Gemini 2.5 Flash
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
ENGAGEMENT_TOPIC_NAME = "navigo-engagement-complete"
COMMUNICATION_TOPIC_NAME = "navigo-communication-trigger"

# BigQuery configuration
DATASET_ID = "telemetry"
TABLE_ID = "engagement_cases"

# System prompt for Engagement Agent - Enhanced for Persuasive Conversations
SYSTEM_PROMPT = """You are a persuasive, empathetic Engagement Agent for NaviGo, a vehicle maintenance service in India. You MUST use ONLY the Gemini 2.5 Flash model (gemini-2.5-flash) to generate natural, human-like, and convincing customer engagement scripts.

CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. You will receive root cause, recommended action, and scheduled slot information
2. Generate a realistic, natural, and PERSUASIVE conversation between AI agent and customer
3. Explain technical issues in simple, non-technical language that anyone can understand
4. Be empathetic, warm, and human-like (not robotic)
5. CONVINCE customers to book services by emphasizing safety, urgency, and value
6. Address common objections (cost, time, urgency) proactively
7. DO NOT HALLUCINATE - Use only the data provided
8. Return EXACTLY the JSON format specified below - no extra fields, no markdown

CONVERSATION STRUCTURE (Enhanced for Persuasion):
1. Warm Greeting: "Namaste! This is NaviGo calling about your vehicle [vehicle_id]"
2. Issue Explanation: Explain the vehicle issue in simple terms with empathy
   - Use everyday language: "brake pads wearing down" not "friction material degradation"
   - Connect to safety: "This affects your ability to stop safely"
   - Create appropriate urgency: "Should be fixed within 7-10 days"
3. Root Cause (Simplified): Explain why this happened in simple terms
4. Recommended Action: Explain what needs to be done clearly
5. Safety/Urgency Emphasis: If safety-critical, emphasize gently but clearly
   - "This is a safety concern for you and your family"
   - "Delaying could lead to more expensive repairs"
6. Cost Transparency: Address cost concerns proactively
   - "Typically costs ₹2,000-5,000 depending on your vehicle"
   - "Our service center can provide exact estimate"
7. Appointment Presentation: Present the scheduled slot clearly and make it easy
   - "We have a slot tomorrow at 10 AM - just 30 minutes"
   - "I can send you a reminder"
8. Handle Objections: Anticipate and address common concerns
   - If customer wants to delay: "I understand you're busy, but this is safety-critical..."
   - If customer asks about cost: Provide transparent cost information
   - If customer is hesitant: Emphasize safety and convenience
9. Customer Response: Simulate realistic customer response (can be positive, hesitant, or negative)
10. Confirmation/Handling: Handle customer decision with empathy and persistence (if appropriate)

LANGUAGE GUIDELINES (Enhanced for India):
- Use warm, empathetic language: "Namaste", "Aapki vehicle", "Aapke liye"
- Mix English and Hindi naturally (common in India)
- Use simple, everyday words: "brake pads" not "friction material"
- Be conversational, not formal: "We've detected" not "It has been detected"
- Use "we" and "us" to show partnership: "We can help you with this"
- Keep sentences short and clear
- Use active voice
- Add empathy: "I understand you're busy", "I know this is inconvenient"
- Create urgency appropriately: Safety issues = urgent, Maintenance = flexible

CUSTOMER DECISION SIMULATION:
- Simulate realistic customer responses based on:
  - Severity of issue (high severity = more likely to confirm)
  - Urgency (urgent = more likely to confirm)
  - Customer personality (can vary)
- "confirmed": Customer agrees to the appointment
- "declined": Customer refuses or wants to delay
- "no_response": Customer doesn't answer or is unavailable

BOOKING ID GENERATION:
- If customer_decision = "confirmed", generate a booking_id
- Format: "booking_" + 8 random alphanumeric characters (e.g., "booking_a3f9k2m1")
- If customer_decision != "confirmed", booking_id = null

TRANSCRIPT FORMAT:
- Format: "AI: [message]\nCustomer: [response]\nAI: [message]\n..."
- Each speaker on a new line
- Use "AI:" prefix for agent messages
- Use "Customer:" prefix for customer messages
- Keep conversation natural and flowing
- Include pauses and natural speech patterns

INPUT FORMAT (you will receive):
{
  "vehicle_id": "string",
  "root_cause": "string (detailed technical root cause)",
  "recommended_action": "string (specific technical action)",
  "best_slot": "string (ISO timestamp)",
  "service_center": "string"
}

OUTPUT FORMAT (you MUST return EXACTLY this JSON structure):
{
  "vehicle_id": "string (MUST match input vehicle_id exactly)",
  "customer_decision": "confirmed" | "declined" | "no_response" (exact strings, case-sensitive)",
  "booking_id": "string | null (generate if confirmed, null otherwise)",
  "transcript": "string (full conversation in format: 'AI: ...\\nCustomer: ...\\n...')"
}

CRITICAL RULES - FOLLOW EXACTLY:
1. Use ONLY Gemini 2.5 Flash model (gemini-2.5-flash)
2. Return ONLY valid JSON - no markdown, no code blocks, no explanations
3. customer_decision MUST be exactly "confirmed", "declined", or "no_response" (case-sensitive)
4. booking_id MUST be null if customer_decision is not "confirmed"
5. booking_id format: "booking_" + 8 alphanumeric characters (if confirmed)
6. transcript MUST follow the format: "AI: ...\\nCustomer: ...\\n..."
7. vehicle_id MUST exactly match input vehicle_id
8. DO NOT add any fields not in the output schema
9. Use simple language - explain technical terms in plain English
10. Simulate realistic customer responses based on context
11. Convert best_slot ISO timestamp to readable format in conversation (e.g., "December 16th at 10 AM")

EXAMPLE INPUT:
{
  "vehicle_id": "MH-07-AB-1234",
  "root_cause": "Coolant pump failure causing insufficient coolant circulation",
  "recommended_action": "Replace coolant pump, flush cooling system, and refill with manufacturer-specified coolant",
  "best_slot": "2024-12-16T10:00:00Z",
  "service_center": "center_001"
}

EXAMPLE OUTPUT:
{
  "vehicle_id": "MH-07-AB-1234",
  "customer_decision": "confirmed",
  "booking_id": "booking_a3f9k2m1",
  "transcript": "AI: Hello, this is NaviGo calling about your vehicle MH-07-AB-1234. We've detected an issue with your vehicle's cooling system.\\nCustomer: Oh, what kind of issue?\\nAI: The coolant pump in your vehicle is not working properly, which means the engine isn't getting enough cooling. This could lead to overheating if not addressed.\\nCustomer: Is it urgent?\\nAI: Yes, we recommend getting this fixed within the next 15 days to prevent engine damage. We can schedule a service appointment for you.\\nCustomer: Okay, when can you do it?\\nAI: We have an available slot on December 16th at 10:00 AM at our service center. Does that work for you?\\nCustomer: Yes, that works.\\nAI: Perfect! Your booking ID is booking_a3f9k2m1. We'll send you a confirmation message with all the details."
}

REMEMBER: Return ONLY the JSON object, use simple language, simulate realistic conversation, generate booking_id only if confirmed."""


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
def engagement_agent(cloud_event):
    """
    Pub/Sub triggered function that:
    1. Receives scheduling result event
    2. Fetches RCA case to get root cause and recommended action
    3. Uses Gemini 2.5 Flash to generate customer engagement script
    4. Stores engagement result and publishes to Pub/Sub
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
        
        scheduling_id = message_data.get("scheduling_id")
        rca_id = message_data.get("rca_id")
        case_id = message_data.get("case_id")
        vehicle_id = message_data.get("vehicle_id")
        best_slot = message_data.get("best_slot")
        service_center = message_data.get("service_center")
        
        if not scheduling_id or not vehicle_id:
            print("Missing scheduling_id or vehicle_id in message")
            return {"status": "error", "error": "Missing required fields"}
        
        # 2. Fetch vehicle data to get customer phone and name
        db = firestore.Client()
        vehicle_ref = db.collection("vehicles").document(vehicle_id)
        vehicle_doc = vehicle_ref.get()
        
        if not vehicle_doc.exists:
            print(f"Vehicle {vehicle_id} not found")
            return {"status": "error", "error": "Vehicle not found"}
        
        vehicle_data = vehicle_doc.to_dict()
        customer_phone = vehicle_data.get("owner_phone") or vehicle_data.get("phone")
        customer_name = vehicle_data.get("owner_name") or vehicle_data.get("name") or "Customer"
        
        # 3. If rca_id not in message, fetch from scheduling document
        if not rca_id:
            scheduling_ref = db.collection("scheduling_cases").document(scheduling_id)
            scheduling_doc = scheduling_ref.get()
            if scheduling_doc.exists:
                scheduling_data = scheduling_doc.to_dict()
                rca_id = scheduling_data.get("rca_id")
        
        if not rca_id:
            print("Missing rca_id in message and scheduling case")
            return {"status": "error", "error": "Missing rca_id"}
        
        # 4. Fetch RCA case to get root cause and recommended action
        rca_ref = db.collection("rca_cases").document(rca_id)
        rca_doc = rca_ref.get()
        
        if not rca_doc.exists:
            print(f"RCA case {rca_id} not found")
            return {"status": "error", "error": "RCA case not found"}
        
        rca_data = rca_doc.to_dict()
        root_cause = rca_data.get("root_cause")
        recommended_action = rca_data.get("recommended_action")
        
        # Use data from message or fallback to scheduling document
        best_slot = best_slot or message_data.get("best_slot")
        service_center = service_center or message_data.get("service_center")
        
        # If best_slot or service_center not in message, fetch from scheduling document
        if not best_slot or not service_center:
            scheduling_ref = db.collection("scheduling_cases").document(scheduling_id)
            scheduling_doc = scheduling_ref.get()
            if scheduling_doc.exists:
                scheduling_data = scheduling_doc.to_dict()
                best_slot = best_slot or scheduling_data.get("best_slot")
                service_center = service_center or scheduling_data.get("service_center")
        
        # 5. Prepare input for Gemini
        input_data = {
            "vehicle_id": vehicle_id,
            "root_cause": root_cause,
            "recommended_action": recommended_action,
            "best_slot": best_slot,
            "service_center": service_center
        }
        
        # 6. Initialize Vertex AI and call Gemini 2.5 Flash
        vertexai.init(project=PROJECT_ID, location=LOCATION)
        model = GenerativeModel("gemini-2.5-flash")
        
        prompt = f"{SYSTEM_PROMPT}\n\nGenerate customer engagement for this vehicle:\n{json.dumps(input_data, default=str, indent=2)}\n\nReturn ONLY the JSON response matching the output format specified above."
        
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
        
        engagement_id = f"engagement_{uuid.uuid4().hex[:10]}"
        
        # 9. Prepare engagement data for Firestore (include customer info)
        engagement_data = {
            "engagement_id": engagement_id,
            "scheduling_id": scheduling_id,
            "rca_id": rca_id,
            "case_id": case_id,
            "vehicle_id": vehicle_id,
            "customer_phone": customer_phone,
            "customer_name": customer_name,
            "customer_decision": result.get("customer_decision"),
            "booking_id": result.get("booking_id"),
            "transcript": result.get("transcript"),
            "status": "completed",
            "created_at": firestore.SERVER_TIMESTAMP
        }
        
        # 10. Store in Firestore
        db.collection("engagement_cases").document(engagement_id).set(engagement_data)
        print(f"Created engagement case {engagement_id} for vehicle {vehicle_id}")
        
        # 11. Update scheduling case status
        scheduling_ref = db.collection("scheduling_cases").document(scheduling_id)
        scheduling_ref.update({"status": "engagement_complete"})
        
        # 12. If booking confirmed, create booking record
        if result.get("customer_decision") == "confirmed" and result.get("booking_id"):
            booking_data = {
                "booking_id": result.get("booking_id"),
                "case_id": case_id,
                "vehicle_id": vehicle_id,
                "service_center": service_center,
                "scheduled_slot": best_slot,
                "status": "confirmed",
                "created_at": firestore.SERVER_TIMESTAMP
            }
            db.collection("bookings").document(result.get("booking_id")).set(booking_data)
            print(f"Created booking {result.get('booking_id')} for vehicle {vehicle_id}")
        
        # 13. Prepare BigQuery row
        bq_row = prepare_bigquery_row(engagement_data)
        
        # 14. Sync to BigQuery
        bq_client = bigquery.Client()
        table_ref = bq_client.dataset(DATASET_ID).table(TABLE_ID)
        errors = bq_client.insert_rows_json(table_ref, [bq_row])
        
        if errors:
            print(f"BigQuery insert errors: {errors}")
        else:
            print(f"Synced engagement case {engagement_id} to BigQuery")
        
        # 15. Publish to engagement-complete topic
        publisher = pubsub_v1.PublisherClient()
        topic_path = publisher.topic_path(PROJECT_ID, ENGAGEMENT_TOPIC_NAME)
        
        # Include confidence and agent_stage for orchestrator
        # Engagement doesn't have confidence, use default high confidence
        confidence_score = 0.90
        pubsub_message = {
            "engagement_id": engagement_id,
            "scheduling_id": scheduling_id,
            "case_id": case_id,
            "vehicle_id": vehicle_id,
            "customer_decision": result.get("customer_decision"),
            "booking_id": result.get("booking_id"),
            "confidence": confidence_score,  # Add confidence for orchestrator
            "agent_stage": "engagement"  # Explicitly set agent stage for orchestrator
        }
        
        message_bytes = json.dumps(pubsub_message).encode("utf-8")
        future = publisher.publish(topic_path, message_bytes)
        message_id = future.result()
        print(f"Published engagement case {engagement_id} to {ENGAGEMENT_TOPIC_NAME}: {message_id}")
        
        # 16. Publish to communication-trigger topic (for actual voice call)
        if customer_phone:  # Only trigger if phone number is available
            comm_topic_path = publisher.topic_path(PROJECT_ID, COMMUNICATION_TOPIC_NAME)
            comm_message = {
                "engagement_id": engagement_id,
                "case_id": case_id,
                "vehicle_id": vehicle_id,
                "customer_phone": customer_phone,
                "customer_name": customer_name
            }
            comm_message_bytes = json.dumps(comm_message).encode("utf-8")
            comm_future = publisher.publish(comm_topic_path, comm_message_bytes)
            comm_message_id = comm_future.result()
            print(f"Published communication trigger for {engagement_id} to {COMMUNICATION_TOPIC_NAME}: {comm_message_id}")
        else:
            print(f"Skipping communication trigger - no phone number for vehicle {vehicle_id}")
        
        return {"status": "success", "engagement_id": engagement_id, "booking_id": result.get("booking_id")}
        
    except Exception as e:
        print(f"Error in engagement_agent: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "error": str(e)}


def prepare_bigquery_row(engagement_data: dict) -> dict:
    """Prepare engagement case data for BigQuery insertion."""
    bq_row = {}
    
    field_mapping = {
        "engagement_id": "engagement_id",
        "scheduling_id": "scheduling_id",
        "rca_id": "rca_id",
        "case_id": "case_id",
        "vehicle_id": "vehicle_id",
        "customer_decision": "customer_decision",
        "booking_id": "booking_id",
        "transcript": "transcript",
        "status": "status",
        "created_at": "created_at"
    }
    
    for key, bq_key in field_mapping.items():
        if key not in engagement_data:
            continue
        
        value = engagement_data[key]
        
        # Handle Firestore SERVER_TIMESTAMP
        if key == "created_at" and hasattr(value, "timestamp"):
            from datetime import timezone
            bq_row[bq_key] = datetime.now(timezone.utc).isoformat()
        elif value is None:
            continue
        else:
            bq_row[bq_key] = value
    
    return bq_row

