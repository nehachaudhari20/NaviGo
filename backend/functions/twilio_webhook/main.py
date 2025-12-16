"""
Cloud Function: twilio_webhook
HTTP Trigger: Handles Twilio callbacks (gather input, status updates)
Purpose: Generates dynamic TwiML responses using Gemini 2.5 Flash and manages conversation state
"""

import json
import os
from datetime import datetime, timezone
from google.cloud import firestore, pubsub_v1
from flask import Request, Response
import functions_framework

# Vertex AI imports
import vertexai
from vertexai.preview.generative_models import GenerativeModel

# Twilio imports
try:
    from twilio.twiml.voice_response import VoiceResponse, Gather
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False
    print("Twilio not available")

# Project configuration
PROJECT_ID = os.getenv("PROJECT_ID", "navigo-27206")
LOCATION = os.getenv("LOCATION", "us-central1")

# Pub/Sub configuration
COMMUNICATION_TOPIC_NAME = "navigo-communication-complete"

# System prompt for Gemini to generate TwiML conversation
SYSTEM_PROMPT = """You are a voice assistant for NaviGo, a vehicle maintenance service. You are making a phone call to inform a customer about their vehicle issue and help them schedule service.

CRITICAL RULES:
1. You MUST use ONLY the Gemini 2.5 Flash model (gemini-2.5-flash) to generate natural, conversational responses
2. Keep responses SHORT (under 30 words) - this is a voice call, not text
3. Use simple, clear language - avoid technical jargon
4. Be empathetic and professional
5. Use Indian English naturally (e.g., "We'll fix this for you", "No worries")
6. For voice calls, speak naturally as if you're talking to a friend

CONVERSATION FLOW:
1. Greeting: "Hello [name], this is NaviGo calling about your vehicle [vehicle_id]"
2. Check availability: "Do you have a moment to discuss an important matter?"
3. Explain issue: Briefly explain the problem in simple terms
4. Recommend action: Suggest scheduling service
5. Handle questions: Answer customer questions concisely
6. Confirm booking: If customer agrees, confirm the appointment details

OUTPUT FORMAT:
You must return ONLY a JSON object with this exact structure:
{
  "message": "The text to speak to the customer",
  "next_stage": "greeting|explanation|scheduling|questions|completed",
  "needs_input": true/false,
  "is_question": true/false
}

DO NOT include any markdown, code blocks, or explanations. Return ONLY the JSON object.

REMEMBER: Keep messages SHORT for voice calls. Be natural and conversational."""


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
        import re
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        raise


@functions_framework.http
def twilio_webhook(request: Request):
    """
    HTTP endpoint for Twilio callbacks
    Handles:
    - /gather: User input (speech/DTMF)
    - /status: Call status updates
    """
    
    try:
        # Get request path
        path = request.path.strip('/')
        
        # Route to appropriate handler
        if path == 'gather' or 'gather' in path:
            return handle_gather(request)
        elif path == 'status' or 'status' in path:
            return handle_status(request)
        else:
            # Default: initial call (greeting)
            return handle_initial_call(request)
            
    except Exception as e:
        print(f"Error in twilio_webhook: {str(e)}")
        import traceback
        traceback.print_exc()
        return generate_error_response(str(e))


def handle_initial_call(request: Request) -> Response:
    """Handle initial Twilio call - generate greeting"""
    
    try:
        call_sid = request.form.get('CallSid')
        if not call_sid:
            return generate_error_response("Missing CallSid")
        
        # Fetch call context
        db = firestore.Client()
        context_ref = db.collection("call_contexts").document(call_sid)
        context_doc = context_ref.get()
        
        if not context_doc.exists:
            return generate_error_response("Call context not found")
        
        context_data = context_doc.to_dict()
        customer_name = context_data.get("customer_name", "Customer")
        vehicle_id = context_data.get("vehicle_id")
        engagement_data = context_data.get("engagement_data", {})
        
        # Generate greeting using Gemini
        vertexai.init(project=PROJECT_ID, location=LOCATION)
        model = GenerativeModel("gemini-2.5-flash")
        
        prompt = f"""{SYSTEM_PROMPT}

Generate the initial greeting for this call:
- Customer Name: {customer_name}
- Vehicle ID: {vehicle_id}
- Issue: {engagement_data.get('transcript', 'Vehicle maintenance issue')}

Return ONLY the JSON response with greeting message and next_stage="explanation"."""
        
        response = model.generate_content(prompt)
        result = extract_json_from_response(response.text)
        
        # Generate TwiML
        twiml_response = VoiceResponse()
        twiml_response.say(result.get("message", f"Hello {customer_name}, this is NaviGo calling about your vehicle."), 
                          voice='Polly.Aditi', language='en-IN')
        
        # Gather user response
        gather_url = f"{request.url_root}gather"
        gather = Gather(
            input='speech dtmf',
            timeout=5,
            num_digits=1,
            action=gather_url,
            method='POST',
            speech_timeout='auto'
        )
        gather.say("Do you have a moment to discuss an important matter about your vehicle?", 
                  voice='Polly.Aditi', language='en-IN')
        twiml_response.append(gather)
        
        # Update communication case
        communication_id = context_data.get("communication_id")
        if communication_id:
            db.collection("communication_cases").document(communication_id).update({
                "conversation_stage": "greeting",
                "updated_at": firestore.SERVER_TIMESTAMP
            })
        
        return Response(str(twiml_response), mimetype='text/xml')
        
    except Exception as e:
        print(f"Error in handle_initial_call: {str(e)}")
        return generate_error_response(str(e))


def handle_gather(request: Request) -> Response:
    """Handle user input from Twilio Gather"""
    
    try:
        call_sid = request.form.get('CallSid')
        speech_result = request.form.get('SpeechResult', '').strip()
        digits = request.form.get('Digits', '').strip()
        
        user_input = speech_result if speech_result else (digits if digits else "")
        
        if not call_sid:
            return generate_error_response("Missing CallSid")
        
        # Fetch call context
        db = firestore.Client()
        context_ref = db.collection("call_contexts").document(call_sid)
        context_doc = context_ref.get()
        
        if not context_doc.exists:
            return generate_error_response("Call context not found")
        
        context_data = context_doc.to_dict()
        communication_id = context_data.get("communication_id")
        customer_name = context_data.get("customer_name", "Customer")
        vehicle_id = context_data.get("vehicle_id")
        engagement_data = context_data.get("engagement_data", {})
        
        # Fetch current communication case
        comm_ref = db.collection("communication_cases").document(communication_id)
        comm_doc = comm_ref.get()
        comm_data = comm_doc.to_dict() if comm_doc.exists else {}
        current_stage = comm_data.get("conversation_stage", "greeting")
        transcript = comm_data.get("conversation_transcript", [])
        
        # Add user input to transcript
        transcript.append({
            "speaker": "customer",
            "message": user_input,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        # Use Gemini to generate response
        vertexai.init(project=PROJECT_ID, location=LOCATION)
        model = GenerativeModel("gemini-2.5-flash")
        
        # Build conversation history
        history_text = "\n".join([f"{msg.get('speaker', 'unknown')}: {msg.get('message', '')}" 
                                  for msg in transcript[-5:]])  # Last 5 messages
        
        prompt = f"""{SYSTEM_PROMPT}

Current conversation stage: {current_stage}
Conversation history:
{history_text}

Customer just said: "{user_input}"

Vehicle context:
- Vehicle ID: {vehicle_id}
- Issue: {engagement_data.get('transcript', 'Vehicle maintenance issue')}
- Recommended action: {engagement_data.get('recommended_action', 'Schedule service')}

Generate the next response. If customer agrees to schedule, set next_stage="scheduling". 
If customer asks questions, set next_stage="questions". If customer declines, set next_stage="completed".

Return ONLY the JSON response."""
        
        response = model.generate_content(prompt)
        result = extract_json_from_response(response.text)
        
        agent_message = result.get("message", "Thank you for your time.")
        next_stage = result.get("next_stage", "completed")
        
        # Add agent response to transcript
        transcript.append({
            "speaker": "agent",
            "message": agent_message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        # Generate TwiML
        twiml_response = VoiceResponse()
        twiml_response.say(agent_message, voice='Polly.Aditi', language='en-IN')
        
        # If not completed, gather next input
        if next_stage != "completed":
            gather_url = f"{request.url_root}gather"
            gather = Gather(
                input='speech dtmf',
                timeout=5,
                action=gather_url,
                method='POST',
                speech_timeout='auto'
            )
            if next_stage == "scheduling":
                gather.say("Would you like to confirm this appointment?", 
                          voice='Polly.Aditi', language='en-IN')
            else:
                gather.say("How can I help you further?", 
                          voice='Polly.Aditi', language='en-IN')
            twiml_response.append(gather)
        else:
            # Call completed
            twiml_response.say("Thank you for your time. Have a great day!", 
                              voice='Polly.Aditi', language='en-IN')
            twiml_response.hangup()
        
        # Update communication case
        outcome = "confirmed" if next_stage == "scheduling" and "yes" in user_input.lower() else \
                  "declined" if "no" in user_input.lower() else None
        
        update_data = {
            "conversation_stage": next_stage,
            "conversation_transcript": transcript,
            "outcome": outcome,
            "updated_at": firestore.SERVER_TIMESTAMP
        }
        
        if outcome == "confirmed" and engagement_data.get("booking_id"):
            update_data["booking_id"] = engagement_data.get("booking_id")
        
        db.collection("communication_cases").document(communication_id).update(update_data)
        
        # If call completed, publish to Pub/Sub
        if next_stage == "completed":
            publisher = pubsub_v1.PublisherClient()
            topic_path = publisher.topic_path(PROJECT_ID, COMMUNICATION_TOPIC_NAME)
            
            pubsub_message = {
                "communication_id": communication_id,
                "engagement_id": context_data.get("engagement_id"),
                "case_id": context_data.get("case_id"),
                "vehicle_id": vehicle_id,
                "outcome": outcome,
                "booking_id": update_data.get("booking_id")
            }
            
            message_bytes = json.dumps(pubsub_message).encode("utf-8")
            publisher.publish(topic_path, message_bytes)
            print(f"Published communication completion to {COMMUNICATION_TOPIC_NAME}")
        
        return Response(str(twiml_response), mimetype='text/xml')
        
    except Exception as e:
        print(f"Error in handle_gather: {str(e)}")
        return generate_error_response(str(e))


def handle_status(request: Request) -> Response:
    """Handle Twilio call status updates"""
    
    try:
        call_sid = request.form.get('CallSid')
        call_status = request.form.get('CallStatus')
        call_duration = request.form.get('CallDuration', '0')
        
        if not call_sid:
            return Response("OK", status=200)
        
        # Update communication case with call status
        db = firestore.Client()
        
        # Find communication case by call_sid
        comm_cases = db.collection("communication_cases").where("call_sid", "==", call_sid).limit(1).stream()
        
        for comm_case in comm_cases:
            update_data = {
                "call_status": call_status,
                "updated_at": firestore.SERVER_TIMESTAMP
            }
            
            if call_status == "completed" and call_duration:
                update_data["call_duration_seconds"] = int(call_duration)
            
            comm_case.reference.update(update_data)
            print(f"Updated call status for {call_sid}: {call_status}")
            break
        
        return Response("OK", status=200)
        
    except Exception as e:
        print(f"Error in handle_status: {str(e)}")
        return Response("OK", status=200)  # Always return OK to Twilio


def generate_error_response(error_message: str) -> Response:
    """Generate error TwiML response"""
    response = VoiceResponse()
    response.say("We're sorry, we encountered a technical issue. Please contact our support team. Goodbye.", 
                 voice='Polly.Aditi', language='en-IN')
    response.hangup()
    return Response(str(response), mimetype='text/xml')

