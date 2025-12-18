# Twilio Integration Flow - Detailed Analysis

## Overview
This document explains how Twilio is integrated into the NaviGo system, which agent uses it, and the complete flow.

---

## **Which Agent Uses Twilio?**

### Primary Agent: `communication_agent`
- **Location**: `agents/communication/agent.py` (class: `VoiceCommunicationAgent`)
- **Purpose**: Makes actual voice calls to customers
- **Status**: ✅ Code complete, needs Cloud Function wrapper

### Secondary Agent: `sms_agent` (Optional)
- **Location**: `agents/communication/sms_agent.py`
- **Purpose**: Sends SMS notifications
- **Status**: ✅ Code complete, can be integrated later

---

## **Complete Twilio Call Flow**

### Step-by-Step Flow:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. ENGAGEMENT AGENT COMPLETES                                    │
│    - Generates conversation script                               │
│    - Stores in engagement_cases collection                      │
│    - Publishes to: navigo-communication-trigger                │
│    - Message includes:                                          │
│      * engagement_id                                            │
│      * vehicle_id                                               │
│      * customer_phone (+919876543210)                           │
│      * customer_name                                            │
│      * root_cause                                               │
│      * recommended_action                                       │
│      * best_slot (appointment time)                             │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. COMMUNICATION AGENT (Cloud Function)                         │
│    - Subscribes to: navigo-communication-trigger               │
│    - Fetches engagement data from engagement_cases              │
│    - Initializes VoiceCommunicationAgent                        │
│    - Calls: make_voice_call(                                    │
│        to_phone_number="+919876543210",                        │
│        customer_name="Rajesh",                                 │
│        callback_url="https://.../twilio_webhook/gather"        │
│      )                                                          │
│    - Stores call initiation in communication_cases              │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. TWILIO INITIATES CALL                                        │
│    - Twilio calls customer's phone: +919876543210              │
│    - Customer's phone rings                                     │
│    - When customer answers, Twilio requests TwiML from:         │
│      callback_url = /twilio_webhook/gather                      │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. WEBHOOK: /twilio_webhook/gather (First Request)              │
│    - Receives: CallSid, From, To, CallStatus                   │
│    - Generates TwiML greeting using:                            │
│      generate_twiml_greeting(customer_name, gather_url)         │
│    - TwiML includes:                                            │
│      * Greeting message: "Hello Rajesh! This is NaviGo..."     │
│      * Gather verb: Listens for customer response              │
│      * Speech recognition enabled                              │
│      * DTMF (keypad) input enabled                             │
│    - Returns TwiML XML to Twilio                                │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. CUSTOMER RESPONDS                                            │
│    - Customer says: "Yes, I have time"                          │
│    - OR presses: 1 (for yes)                                    │
│    - Twilio processes speech/DTMF                              │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. WEBHOOK: /twilio_webhook/gather (Second Request)             │
│    - Receives: CallSid, SpeechResult="yes", Digits="1"         │
│    - Stores customer response in conversation state             │
│    - Generates TwiML explanation using:                         │
│      generate_twiml_defect_explanation(                         │
│        defect, gather_url, user_tone                           │
│      )                                                          │
│    - TwiML includes:                                            │
│      * Defect explanation in simple language                    │
│      * "Would you like to schedule? Press 1 for yes..."        │
│      * Gather verb for next response                            │
│    - Returns TwiML XML to Twilio                                │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. CUSTOMER ASKS QUESTION                                       │
│    - Customer says: "How much will it cost?"                    │
│    - Twilio processes speech                                    │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. WEBHOOK: /twilio_webhook/gather (Third Request)              │
│    - Receives: CallSid, SpeechResult="how much will it cost"   │
│    - Detects question intent                                    │
│    - Generates answer using:                                    │
│      handle_user_question(question, defect)                     │
│    - Generates TwiML using:                                      │
│      generate_twiml_question_response(                         │
│        question, defect, gather_url                             │
│      )                                                          │
│    - TwiML includes:                                            │
│      * Answer to customer's question                            │
│      * "Would you like to schedule?"                            │
│      * Gather verb for next response                            │
│    - Returns TwiML XML to Twilio                                │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. CUSTOMER CONFIRMS APPOINTMENT                                │
│    - Customer says: "Yes, please schedule it"                   │
│    - OR presses: 1                                              │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 10. WEBHOOK: /twilio_webhook/gather (Fourth Request)            │
│     - Receives: CallSid, SpeechResult="yes", Digits="1"        │
│     - Updates booking in bookings collection                    │
│     - Generates confirmation TwiML using:                        │
│       generate_twiml_schedule_confirmation(                      │
│         booking_details, sms_url                                │
│       )                                                          │
│     - TwiML includes:                                            │
│       * Confirmation message                                    │
│       * Appointment details                                     │
│       * "You'll receive SMS confirmation"                       │
│     - Sends SMS confirmation via Twilio                        │
│     - Returns TwiML XML to Twilio                                │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 11. CALL ENDS                                                    │
│     - Customer hangs up                                          │
│     - Twilio sends status callback to:                          │
│       /twilio_webhook/status                                    │
│     - Webhook receives: CallStatus="completed"                  │
│     - Stores final call status in communication_cases            │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 12. COMMUNICATION AGENT COMPLETES                               │
│     - Stores complete conversation transcript                   │
│     - Updates communication_cases with:                         │
│       * outcome: "confirmed" | "declined" | "no_response"       │
│       * conversation_transcript                                  │
│       * call_duration                                           │
│       * booking_id (if confirmed)                               │
│     - Publishes to: navigo-communication-complete              │
└─────────────────────────────────────────────────────────────────┘
```

---

## **Webhook Endpoints Required**

### 1. `/twilio_webhook/gather` (Main Conversation Handler)
**Method**: POST  
**Purpose**: Handles all customer responses during call

**Request Parameters** (from Twilio):
```python
{
    "CallSid": "CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "From": "+919876543210",  # Customer's number
    "To": "+1234567890",      # Twilio number
    "CallStatus": "in-progress",
    "SpeechResult": "yes",     # If customer spoke
    "Digits": "1",             # If customer pressed keypad
    "Confidence": "0.95"       # Speech recognition confidence
}
```

**Response**: TwiML XML string
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather input="speech dtmf" timeout="5" action="/twilio_webhook/gather" method="POST">
        <Say voice="Polly.Aditi" language="en-IN">
            Hello Rajesh! This is NaviGo calling about your vehicle...
        </Say>
    </Gather>
    <Say voice="Polly.Aditi" language="en-IN">
        I'll send you the details via SMS. Thank you!
    </Say>
</Response>
```

**Logic Flow**:
1. Check if this is first call (no SpeechResult/Digits) → Send greeting
2. If SpeechResult/Digits exists → Process customer response
3. Determine conversation stage (greeting → explanation → questions → scheduling)
4. Generate appropriate TwiML response
5. Store conversation state in Firestore

### 2. `/twilio_webhook/status` (Call Status Tracker)
**Method**: POST  
**Purpose**: Tracks call status changes

**Request Parameters** (from Twilio):
```python
{
    "CallSid": "CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "CallStatus": "completed",  # initiated, ringing, answered, completed
    "CallDuration": "120",      # seconds
    "From": "+919876543210",
    "To": "+1234567890"
}
```

**Response**: 200 OK (no TwiML needed)

**Logic Flow**:
1. Update `communication_cases` with call status
2. If status is "completed", calculate call duration
3. Store final call metrics

---

## **Conversation State Management**

### Firestore Document Structure:
```
communication_cases/{communication_id}
{
    "engagement_id": "eng_xxx",
    "vehicle_id": "MH-12-AB-1234",
    "customer_phone": "+919876543210",
    "customer_name": "Rajesh",
    "call_sid": "CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "call_status": "in-progress",  # initiated, ringing, in-progress, completed
    "conversation_stage": "explanation",  # greeting, explanation, questions, scheduling, completed
    "conversation_transcript": [
        {
            "speaker": "agent",
            "message": "Hello Rajesh! This is NaviGo...",
            "timestamp": "2024-12-15T10:30:00Z"
        },
        {
            "speaker": "customer",
            "message": "Yes, I have time",
            "timestamp": "2024-12-15T10:30:05Z"
        }
    ],
    "user_responses": [
        {
            "intent": "affirmative",
            "tone": "friendly",
            "timestamp": "2024-12-15T10:30:05Z"
        }
    ],
    "outcome": null,  # confirmed, declined, no_response
    "booking_id": null,  # Set when confirmed
    "created_at": "2024-12-15T10:29:00Z",
    "updated_at": "2024-12-15T10:31:00Z"
}
```

---

## **TwiML Generation Methods**

### Available Methods in `VoiceCommunicationAgent`:

1. **`generate_twiml_greeting(customer_name, gather_url)`**
   - Creates initial greeting
   - Asks if customer has time
   - Returns TwiML XML

2. **`generate_twiml_defect_explanation(defect, gather_url, user_tone)`**
   - Explains vehicle defect in simple language
   - Asks if customer wants to schedule
   - Returns TwiML XML

3. **`generate_twiml_question_response(question, defect, gather_url)`**
   - Answers customer questions
   - Handles: cost, urgency, safety, timeline
   - Returns TwiML XML

4. **`generate_twiml_schedule_confirmation(booking_details, sms_url)`**
   - Confirms appointment booking
   - Provides appointment details
   - Sends SMS confirmation
   - Returns TwiML XML

---

## **Environment Variables**

### Required in Cloud Functions:
```bash
# Twilio Credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Webhook URLs (Cloud Function URLs)
TWILIO_CALLBACK_URL=https://us-central1-navigo-27206.cloudfunctions.net/twilio_webhook

# GCP Configuration
PROJECT_ID=navigo-27206
LOCATION=us-central1
```

---

## **Integration with Engagement Agent**

### Current Flow:
```
engagement_agent → navigo-engagement-complete → (nothing)
```

### New Flow:
```
engagement_agent → navigo-engagement-complete → master_orchestrator
                                                      ↓
                                              (confidence check)
                                                      ↓
                                              navigo-communication-trigger
                                                      ↓
                                              communication_agent
```

### Engagement Agent Changes:
```python
# After storing engagement_case, publish to communication topic:
pubsub_message = {
    "engagement_id": engagement_id,
    "case_id": case_id,
    "vehicle_id": vehicle_id,
    "customer_phone": "+919876543210",  # NEW: Add phone number
    "customer_name": "Rajesh",           # NEW: Add customer name
    "transcript_template": result.get("transcript"),
    "root_cause": root_cause,
    "recommended_action": recommended_action,
    "best_slot": best_slot,
    "service_center": service_center
}

# Publish to communication topic (instead of engagement-complete)
communication_topic_path = publisher.topic_path(PROJECT_ID, "navigo-communication-trigger")
publisher.publish(communication_topic_path, json.dumps(pubsub_message).encode())
```

---

## **Error Handling**

### Scenarios to Handle:

1. **Twilio Not Configured**:
   - Check if `TWILIO_ACCOUNT_SID` exists
   - Fallback to SMS notification
   - Log error

2. **Call Fails**:
   - Customer doesn't answer
   - Customer busy
   - Invalid phone number
   - Handle in status callback
   - Retry logic (optional)

3. **Webhook Timeout**:
   - Twilio expects response within 3 seconds
   - Use async processing if needed
   - Return default TwiML if processing takes too long

4. **Customer Hangs Up**:
   - Detect in status callback
   - Store partial conversation
   - Mark outcome as "no_response"

---

## **Testing Strategy**

### Unit Tests:
- Test TwiML generation methods
- Test conversation state management
- Mock Twilio API calls

### Integration Tests:
- Test webhook endpoints with Twilio simulator
- Test full conversation flow
- Test error scenarios

### Manual Tests:
- Make actual test calls
- Verify conversation flow
- Check SMS confirmations

---

## **Summary**

- **Agent Using Twilio**: `communication_agent` (via `VoiceCommunicationAgent` class)
- **Trigger**: After `engagement_agent` completes
- **Flow**: Engagement → Communication Agent → Twilio Call → Webhooks → Conversation → Confirmation
- **Webhooks**: `/twilio_webhook/gather` (conversation) and `/twilio_webhook/status` (status tracking)
- **Storage**: `communication_cases` collection in Firestore
- **Output**: Publishes to `navigo-communication-complete` when done

---

**Last Updated**: 2024-12-15  
**Status**: Ready for Implementation

