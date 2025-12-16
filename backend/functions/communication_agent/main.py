"""
Cloud Function: communication_agent
Pub/Sub Trigger: Subscribes to navigo-communication-trigger topic
Purpose: Makes actual voice calls to customers using Twilio
"""

import json
import os
import uuid
from datetime import datetime, timezone
from google.cloud import pubsub_v1, firestore
import functions_framework

# Twilio imports
try:
    from twilio.rest import Client
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False
    print("Twilio not available - voice calls disabled")

# Project configuration
PROJECT_ID = os.getenv("PROJECT_ID", "navigo-27206")
LOCATION = os.getenv("LOCATION", "us-central1")

# Pub/Sub configuration
COMMUNICATION_TOPIC_NAME = "navigo-communication-complete"

# Twilio configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
TWILIO_CALLBACK_URL = os.getenv("TWILIO_CALLBACK_URL", 
    f"https://us-central1-navigo-27206.cloudfunctions.net/twilio_webhook")


@functions_framework.cloud_event
def communication_agent(cloud_event):
    """
    Pub/Sub triggered function that:
    1. Receives engagement result event
    2. Fetches customer phone number from vehicles collection
    3. Initiates Twilio voice call
    4. Stores call initiation in communication_cases
    5. Publishes to navigo-communication-complete when call ends
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
        
        engagement_id = message_data.get("engagement_id")
        vehicle_id = message_data.get("vehicle_id")
        case_id = message_data.get("case_id")
        
        if not engagement_id or not vehicle_id:
            print("Missing engagement_id or vehicle_id in message")
            return {"status": "error", "error": "Missing required fields"}
        
        # 2. Fetch engagement case to get context
        db = firestore.Client()
        engagement_ref = db.collection("engagement_cases").document(engagement_id)
        engagement_doc = engagement_ref.get()
        
        if not engagement_doc.exists:
            print(f"Engagement case {engagement_id} not found")
            return {"status": "error", "error": "Engagement case not found"}
        
        engagement_data = engagement_doc.to_dict()
        
        # 3. Fetch vehicle data to get customer phone and name
        vehicle_ref = db.collection("vehicles").document(vehicle_id)
        vehicle_doc = vehicle_ref.get()
        
        if not vehicle_doc.exists:
            print(f"Vehicle {vehicle_id} not found")
            return {"status": "error", "error": "Vehicle not found"}
        
        vehicle_data = vehicle_doc.to_dict()
        customer_phone = vehicle_data.get("owner_phone") or vehicle_data.get("phone")
        customer_name = vehicle_data.get("owner_name") or vehicle_data.get("name") or "Customer"
        
        if not customer_phone:
            print(f"Customer phone not found for vehicle {vehicle_id}")
            # Fallback: Don't make call, just log and continue
            return {
                "status": "skipped",
                "message": "Customer phone number not available",
                "engagement_id": engagement_id
            }
        
        # Ensure phone number is in E.164 format
        if not customer_phone.startswith("+"):
            # Assume Indian number if no country code
            if customer_phone.startswith("0"):
                customer_phone = "+91" + customer_phone[1:]
            elif len(customer_phone) == 10:
                customer_phone = "+91" + customer_phone
            else:
                customer_phone = "+" + customer_phone
        
        # 4. Initialize Twilio client
        if not TWILIO_AVAILABLE or not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
            print("Twilio not configured - skipping voice call")
            return {
                "status": "skipped",
                "message": "Twilio not configured",
                "engagement_id": engagement_id
            }
        
        twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        # 5. Prepare callback URL for Twilio webhook
        gather_url = f"{TWILIO_CALLBACK_URL}/gather"
        status_url = f"{TWILIO_CALLBACK_URL}/status"
        
        # 6. Create communication case ID
        communication_id = f"comm_{uuid.uuid4().hex[:10]}"
        
        # 7. Store communication case in Firestore (before call)
        communication_data = {
            "communication_id": communication_id,
            "engagement_id": engagement_id,
            "case_id": case_id,
            "vehicle_id": vehicle_id,
            "customer_phone": customer_phone,
            "customer_name": customer_name,
            "call_status": "initiating",
            "conversation_stage": "pending",
            "conversation_transcript": [],
            "outcome": None,
            "booking_id": None,
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP
        }
        
        db.collection("communication_cases").document(communication_id).set(communication_data)
        print(f"Created communication case {communication_id} for vehicle {vehicle_id}")
        
        # 8. Initiate Twilio voice call
        try:
            call = twilio_client.calls.create(
                to=customer_phone,
                from_=TWILIO_PHONE_NUMBER,
                url=gather_url,
                method='POST',
                status_callback=status_url,
                status_callback_event=['initiated', 'ringing', 'answered', 'completed'],
                status_callback_method='POST'
            )
            
            call_sid = call.sid
            print(f"Initiated Twilio call {call_sid} to {customer_phone}")
            
            # 9. Update communication case with call SID
            db.collection("communication_cases").document(communication_id).update({
                "call_sid": call_sid,
                "call_status": "initiated",
                "updated_at": firestore.SERVER_TIMESTAMP
            })
            
            # 10. Store call context in Firestore for webhook access
            # Webhook will need: engagement_id, vehicle_id, communication_id, etc.
            call_context = {
                "communication_id": communication_id,
                "engagement_id": engagement_id,
                "case_id": case_id,
                "vehicle_id": vehicle_id,
                "customer_phone": customer_phone,
                "customer_name": customer_name,
                "engagement_data": engagement_data,
                "created_at": firestore.SERVER_TIMESTAMP
            }
            
            # Store in a temporary collection for webhook lookup
            db.collection("call_contexts").document(call_sid).set(call_context)
            
            return {
                "status": "success",
                "communication_id": communication_id,
                "call_sid": call_sid,
                "message": f"Call initiated to {customer_phone}"
            }
            
        except Exception as e:
            print(f"Error initiating Twilio call: {str(e)}")
            # Update communication case with error
            db.collection("communication_cases").document(communication_id).update({
                "call_status": "failed",
                "error": str(e),
                "updated_at": firestore.SERVER_TIMESTAMP
            })
            
            return {
                "status": "error",
                "error": f"Failed to initiate call: {str(e)}",
                "communication_id": communication_id
            }
        
    except Exception as e:
        print(f"Error in communication_agent: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "error": str(e)}

