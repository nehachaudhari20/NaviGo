"""
Cloud Function: communication_agent
Pub/Sub Trigger: Subscribes to navigo-communication-trigger topic
Purpose: Makes actual voice calls to customers using Plivo (recommended Twilio alternative)
"""

import json
import os
import uuid
import re
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
        # For 2nd gen Cloud Functions, cloud_event.data can be:
        # - bytes (raw protobuf or base64)
        # - A string (JSON string or base64)
        # - A dict (already parsed)
        # - Base64 encoded in a "message" wrapper (standard Pub/Sub format)
        
        message_data = None
        print(f"DEBUG: cloud_event.data type: {type(cloud_event.data)}, first 200 chars: {str(cloud_event.data)[:200]}")
        
        if isinstance(cloud_event.data, bytes):
            try:
                decoded_str = cloud_event.data.decode("utf-8")
                message_data = json.loads(decoded_str)
            except (UnicodeDecodeError, json.JSONDecodeError):
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
                import re
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
                            print(f"DEBUG: About to decode base64. data_field type: {type(data_field)}, length: {len(data_field)}")
                            decoded_bytes = base64.b64decode(data_field, validate=True)
                            decoded_str = decoded_bytes.decode("utf-8")
                            print(f"DEBUG: Base64 decode successful. Original length: {len(data_field)}, Decoded length: {len(decoded_str)}")
                            print(f"DEBUG: Decoded content: {decoded_str}")
                        except Exception as decode_error:
                            print(f"DEBUG: Base64 decode error (with validation): {decode_error}")
                            try:
                                decoded_bytes = base64.b64decode(data_field)
                                decoded_str = decoded_bytes.decode("utf-8")
                                print(f"DEBUG: Base64 decode successful (without validation). Decoded length: {len(decoded_str)}")
                                print(f"DEBUG: Decoded content: {decoded_str}")
                            except Exception as decode_error2:
                                print(f"DEBUG: Base64 decode error (without validation): {decode_error2}")
                                raise
                        
                        if decoded_str and decoded_str.strip():
                            # Check if the decoded string itself looks like base64 (double encoding)
                            is_base64_pattern = re.compile(r'^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$')
                            if is_base64_pattern.fullmatch(decoded_str.strip()):
                                print(f"WARNING: Decoded string still looks like base64! Attempting second decode...")
                                try:
                                    second_decoded_bytes = base64.b64decode(decoded_str.strip())
                                    second_decoded_str = second_decoded_bytes.decode("utf-8")
                                    print(f"DEBUG: Second decode successful. Final length: {len(second_decoded_str)}")
                                    print(f"DEBUG: Final decoded content: {second_decoded_str}")
                                    decoded_str = second_decoded_str
                                except Exception as second_decode_error:
                                    print(f"ERROR: Second base64 decode failed: {second_decode_error}")
                            
                            try:
                                message_data = json.loads(decoded_str)
                                print(f"DEBUG: Successfully parsed JSON. Keys: {list(message_data.keys())}")
                            except json.JSONDecodeError as json_error:
                                print(f"Error: Invalid JSON after base64 decode: {json_error}")
                                print(f"DEBUG: Decoded string length: {len(decoded_str)}")
                                print(f"DEBUG: Decoded string (repr): {repr(decoded_str)}")
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
                    print(f"DEBUG: Decoded string length: {len(decoded_str) if 'decoded_str' in locals() else 0}")
                    print(f"DEBUG: Decoded string (full): {decoded_str if 'decoded_str' in locals() else 'N/A'}")
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
        
        # 2.5. Check for duplicate communication case (prevent multiple calls for same engagement)
        existing_communication_cases = list(db.collection("communication_cases")
            .where("engagement_id", "==", engagement_id)
            .limit(1).stream())
        
        if existing_communication_cases:
            existing_comm_id = existing_communication_cases[0].id
            existing_comm_data = existing_communication_cases[0].to_dict()
            existing_created_at = existing_comm_data.get("created_at")
            
            # Check if the existing communication case is very recent (within last 30 seconds)
            try:
                if isinstance(existing_created_at, datetime):
                    existing_dt = existing_created_at
                    if existing_dt.tzinfo is None:
                        existing_dt = existing_dt.replace(tzinfo=timezone.utc)
                    time_diff = (datetime.now(timezone.utc) - existing_dt).total_seconds()
                    if time_diff < 30:  # If created within last 30 seconds, skip
                        print(f"Duplicate communication detected - communication {existing_comm_id} created {time_diff:.1f}s ago. Skipping.")
                        return {"status": "skipped", "message": "Duplicate communication detected", "communication_id": existing_comm_id}
            except:
                # If timestamp check fails, skip to be safe
                print(f"Duplicate communication detected - communication {existing_comm_id} exists (timestamp check failed). Skipping.")
                return {"status": "skipped", "message": "Duplicate communication detected", "communication_id": existing_comm_id}
        
        # 3. Fetch vehicle data to get customer phone and name
        vehicle_ref = db.collection("vehicles").document(vehicle_id)
        vehicle_doc = vehicle_ref.get()
        
        if not vehicle_doc.exists:
            print(f"Vehicle {vehicle_id} not found")
            return {"status": "error", "error": "Vehicle not found"}
        
        vehicle_data = vehicle_doc.to_dict()
        # Use phone/name from message if available, otherwise from vehicle data
        customer_phone = customer_phone or vehicle_data.get("owner_phone") or vehicle_data.get("phone")
        customer_name = customer_name or vehicle_data.get("owner_name") or vehicle_data.get("name") or "Customer"
        
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
        # Read environment variables at runtime (inside function) and strip whitespace/quotes
        twilio_account_sid = os.getenv("TWILIO_ACCOUNT_SID", "").strip().strip("'\"")
        twilio_auth_token = os.getenv("TWILIO_AUTH_TOKEN", "").strip().strip("'\"")
        twilio_phone_number = os.getenv("TWILIO_PHONE_NUMBER", "").strip().strip("'\"")
        twilio_callback_url = os.getenv("TWILIO_CALLBACK_URL", 
            f"https://us-central1-navigo-27206.cloudfunctions.net/twilio_webhook").strip().strip("'\"")
        
        # Validate token format (Twilio auth tokens are typically 32 characters, but can vary)
        # Don't trim - use the token as provided
        if twilio_auth_token and len(twilio_auth_token) != 32:
            print(f"INFO: Auth token length is {len(twilio_auth_token)} (typically 32, but may vary). Using as provided.")
        
        # Validate Account SID format (should start with AC and be 34 characters)
        if twilio_account_sid and not twilio_account_sid.startswith("AC"):
            print(f"WARNING: Account SID doesn't start with 'AC'. Got: {twilio_account_sid[:5]}...")
        
        # Debug logging (don't log full auth token for security, but show first/last chars for verification)
        print(f"DEBUG: TWILIO_AVAILABLE={TWILIO_AVAILABLE}")
        print(f"DEBUG: TWILIO_ACCOUNT_SID={twilio_account_sid[:10] if twilio_account_sid else None}...{twilio_account_sid[-4:] if twilio_account_sid and len(twilio_account_sid) > 14 else ''} (length: {len(twilio_account_sid) if twilio_account_sid else 0})")
        if twilio_auth_token:
            print(f"DEBUG: TWILIO_AUTH_TOKEN={twilio_auth_token[:4]}...{twilio_auth_token[-4:]} (length: {len(twilio_auth_token)})")
        else:
            print(f"DEBUG: TWILIO_AUTH_TOKEN=NOT SET")
        print(f"DEBUG: TWILIO_PHONE_NUMBER={twilio_phone_number} (length: {len(twilio_phone_number) if twilio_phone_number else 0})")
        print(f"DEBUG: TWILIO_CALLBACK_URL={twilio_callback_url}")
        
        if not TWILIO_AVAILABLE or not twilio_account_sid or not twilio_auth_token:
            print(f"Twilio not configured - skipping voice call. Available: {TWILIO_AVAILABLE}, SID: {bool(twilio_account_sid)}, Token: {bool(twilio_auth_token)}")
            return {
                "status": "skipped",
                "message": "Twilio not configured",
                "engagement_id": engagement_id
            }
        
        # Verify credentials match expected format
        expected_sid = "AC6bad0c817386de999b7b2b164953279a"
        if twilio_account_sid != expected_sid:
            print(f"WARNING: TWILIO_ACCOUNT_SID mismatch! Expected: {expected_sid}, Got: {twilio_account_sid}")
        
        # 5. Initialize Twilio client (skip validation since credentials are verified)
        twilio_client = Client(twilio_account_sid, twilio_auth_token)
        print(f"DEBUG: Twilio client initialized with Account SID: {twilio_account_sid[:10]}...")
        
        # 6. Prepare callback URL for Twilio webhook
        gather_url = f"{twilio_callback_url}/gather"
        status_url = f"{twilio_callback_url}/status"
        
        # 6. Create communication case ID
        communication_id = f"comm_{uuid.uuid4().hex[:10]}"
        
        # 7. Final duplicate check before creating communication case (race condition protection)
        final_duplicate_check = list(db.collection("communication_cases")
            .where("engagement_id", "==", engagement_id)
            .limit(1).stream())
        
        if final_duplicate_check:
            existing_comm_id = final_duplicate_check[0].id
            existing_comm_data = final_duplicate_check[0].to_dict()
            existing_created_at = existing_comm_data.get("created_at")
            
            try:
                if isinstance(existing_created_at, datetime):
                    existing_dt = existing_created_at
                    if existing_dt.tzinfo is None:
                        existing_dt = existing_dt.replace(tzinfo=timezone.utc)
                    time_diff = (datetime.now(timezone.utc) - existing_dt).total_seconds()
                    if time_diff < 30:  # If created within last 30 seconds, skip
                        print(f"Final duplicate check: another communication {existing_comm_id} created {time_diff:.1f}s ago. Skipping new call.")
                        return {"status": "skipped", "message": "Duplicate communication detected in final check", "communication_id": existing_comm_id}
            except:
                print(f"Final duplicate check: existing communication {existing_comm_id} found, but timestamp unparseable. Skipping new call.")
                return {"status": "skipped", "message": "Duplicate communication detected (timestamp unparseable)", "communication_id": existing_comm_id}
        
        # 8. Store communication case in Firestore (before call)
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
        
        # 9. Initiate Twilio voice call
        print(f"DEBUG: About to initiate call - to: {customer_phone}, from: {twilio_phone_number}, gather_url: {gather_url}")
        try:
            # Simplified call parameters - remove optional ones that might cause issues
            call_params = {
                'to': customer_phone,
                'from_': twilio_phone_number,
                'url': gather_url
            }
            print(f"DEBUG: Call parameters: {call_params}")
            
            call = twilio_client.calls.create(**call_params)
            
            call_sid = call.sid
            print(f"Initiated Twilio call {call_sid} to {customer_phone}")
            
            # 10. Update communication case with call SID
            db.collection("communication_cases").document(communication_id).update({
                "call_sid": call_sid,
                "call_status": "initiated",
                "updated_at": firestore.SERVER_TIMESTAMP
            })
            
            # 11. Store call context in Firestore for webhook access
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
            
            # Note: Actual call completion and publishing to navigo-communication-complete
            # will be handled by the Twilio webhook (twilio_webhook function)
            # when the call status changes to "completed"
            
            return {
                "status": "success",
                "communication_id": communication_id,
                "call_sid": call_sid,
                "message": f"Call initiated to {customer_phone}"
            }
            
        except Exception as e:
            error_msg = str(e)
            print(f"Error initiating Twilio call: {error_msg}")
            print(f"DEBUG: Error type: {type(e).__name__}")
            # Check if it's a Twilio REST API error
            if hasattr(e, 'msg'):
                print(f"DEBUG: Error message: {e.msg}")
            if hasattr(e, 'code'):
                print(f"DEBUG: Error code: {e.code}")
            if hasattr(e, 'status'):
                print(f"DEBUG: HTTP status: {e.status}")
            # Update communication case with error
            db.collection("communication_cases").document(communication_id).update({
                "call_status": "failed",
                "error": error_msg,
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

