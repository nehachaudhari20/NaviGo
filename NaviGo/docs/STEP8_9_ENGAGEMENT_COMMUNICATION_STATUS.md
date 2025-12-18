# STEP 8 & 9: Engagement & Communication Agents - Setup & Testing Status

## Overview
This document tracks the setup, configuration, and testing status of STEP 8: Customer Engagement (Script Generation) and STEP 9: Voice Communication (Interactive Call).

---

## ✅ STEP 8: Customer Engagement (Script Generation)

### Status: ✅ **CONFIGURED & ENHANCED**

**Backend Function**: `backend/functions/engagement_agent/main.py`
- **Entry Point**: `engagement_agent` (Pub/Sub trigger)
- **Trigger**: Pub/Sub message on `navigo-scheduling-complete` topic
- **Decorator**: `@functions_framework.cloud_event` ✅

**Configuration**:
- **Input Topic**: `navigo-scheduling-complete` (from scheduling_agent)
- **Output Topics**: 
  - `navigo-engagement-complete` (publishes to)
  - `navigo-communication-trigger` (publishes to - triggers voice call)
- **LLM Model**: Gemini 2.5 Flash (`gemini-2.5-flash`)
- **Vertex AI**: Project `navigo-27206`, Location `us-central1`

**What It Does**:
1. ✅ Receives scheduling result event from Pub/Sub
2. ✅ Fetches vehicle data to get customer phone and name
3. ✅ Fetches RCA case to get root cause and recommended action
4. ✅ Fetches scheduling case to get best slot and service center
5. ✅ Uses Gemini 2.5 Flash LLM to generate customer engagement script
6. ✅ Generates:
   - Personalized greeting
   - Defect explanation (simple language)
   - Recommended action
   - Conversation transcript template
   - Customer decision simulation ("confirmed", "declined", "no_response")
7. ✅ Stores in Firestore: `engagement_cases/{engagement_id}`
8. ✅ Updates scheduling case status to "engagement_complete"
9. ✅ Creates booking record if customer_decision = "confirmed"
10. ✅ Publishes to Pub/Sub: `navigo-engagement-complete`
11. ✅ Publishes to Pub/Sub: `navigo-communication-trigger` (if phone number available)
12. ✅ Syncs to BigQuery: `telemetry.engagement_cases` table

**Firestore Collection Updated**:
- ✅ `engagement_cases` - New document created with:
  ```json
  {
    "engagement_id": "engagement_abc123",
    "scheduling_id": "scheduling_xyz789",
    "rca_id": "rca_def456",
    "case_id": "case_1234567890",
    "vehicle_id": "MH-07-AB-1234",
    "customer_phone": "+919876543210",
    "customer_name": "Rajesh Kumar",
    "customer_decision": "confirmed",
    "booking_id": "booking_a3f9k2m1",
    "transcript": "AI: Hello, this is NaviGo...\nCustomer: ...",
    "status": "completed",
    "created_at": "2024-12-15T10:33:00.000Z"
  }
  ```

**Pub/Sub Topics**:
- ✅ **Input**: `navigo-scheduling-complete` (subscribes to)
- ✅ **Output**: `navigo-engagement-complete` (publishes to)
- ✅ **Output**: `navigo-communication-trigger` (publishes to - triggers voice call)

---

## ✅ STEP 9: Voice Communication (Interactive Call)

### Status: ✅ **CONFIGURED & ENHANCED**

**Backend Function**: `backend/functions/communication_agent/main.py`
- **Entry Point**: `communication_agent` (Pub/Sub trigger)
- **Trigger**: Pub/Sub message on `navigo-communication-trigger` topic
- **Decorator**: `@functions_framework.cloud_event` ✅

**Configuration**:
- **Input Topic**: `navigo-communication-trigger` (from engagement_agent)
- **Output Topic**: `navigo-communication-complete` (published by webhook when call completes)
- **Twilio Integration**: Uses Twilio REST API for voice calls
- **Webhook**: `twilio_webhook` function handles call status updates

**What It Does**:
1. ✅ Receives engagement result event from Pub/Sub
2. ✅ Fetches engagement case to get context
3. ✅ Fetches vehicle data to get customer phone and name
4. ✅ Formats phone number to E.164 format (+country code)
5. ✅ Initializes Twilio client
6. ✅ Creates communication case in Firestore
7. ✅ **Makes actual voice call** to customer phone number using Twilio
8. ✅ Stores call SID and context for webhook access
9. ✅ Updates communication case with call status
10. ✅ **Note**: Actual call completion is handled by `twilio_webhook` function

**Firestore Collections Updated**:
- ✅ `communication_cases` - New document created with:
  ```json
  {
    "communication_id": "comm_abc123",
    "engagement_id": "engagement_xyz789",
    "case_id": "case_1234567890",
    "vehicle_id": "MH-07-AB-1234",
    "customer_phone": "+919876543210",
    "customer_name": "Rajesh Kumar",
    "call_status": "initiated",
    "call_sid": "CA1234567890abcdef",
    "conversation_stage": "pending",
    "conversation_transcript": [],
    "outcome": null,
    "booking_id": null,
    "created_at": "2024-12-15T10:33:30.000Z",
    "updated_at": "2024-12-15T10:33:30.000Z"
  }
  ```
- ✅ `call_contexts` - Temporary collection for webhook access:
  ```json
  {
    "communication_id": "comm_abc123",
    "engagement_id": "engagement_xyz789",
    "vehicle_id": "MH-07-AB-1234",
    "customer_phone": "+919876543210",
    "customer_name": "Rajesh Kumar",
    "engagement_data": {...}
  }
  ```

**Pub/Sub Topics**:
- ✅ **Input**: `navigo-communication-trigger` (subscribes to)
- ✅ **Output**: `navigo-communication-complete` (published by webhook when call completes)

---

## 🔧 Fixes & Enhancements Applied

### STEP 8 (Engagement Agent)

1. **Added Confidence Fields for Orchestrator**
   - Added `confidence: 0.90` (default high confidence)
   - Added `agent_stage: "engagement"` for orchestrator routing

2. **Fixed RCA ID Handling**
   - If `rca_id` not in message, fetches from scheduling case
   - Prevents errors when rca_id is missing

3. **Fixed Best Slot and Service Center Handling**
   - If not in message, fetches from scheduling case
   - Ensures all required data is available

**File**: `backend/functions/engagement_agent/main.py`

### STEP 9 (Communication Agent)

1. **Enhanced Phone Number Handling**
   - Accepts phone number from message or vehicle data
   - Formats to E.164 format automatically
   - Handles Indian numbers (adds +91 if missing)

2. **Enhanced Customer Name Handling**
   - Accepts customer name from message or vehicle data
   - Provides fallback to "Customer" if not available

3. **Added Webhook Integration Note**
   - Documents that call completion is handled by webhook
   - Clarifies that `navigo-communication-complete` is published by webhook

**File**: `backend/functions/communication_agent/main.py`

4. **Updated Trigger Agent Endpoint**
   - Added `engagement` and `communication` to `AGENT_TOPICS` mapping

**File**: `backend/functions/trigger_agent/main.py`

---

## 📋 Frontend Integration Status

### Service Center Dashboard (`/service-center`)
**Component**: Customer engagement section
- ✅ Shows generated engagement scripts from `engagement_cases`
- ✅ Displays customer decision and booking status
- ✅ Shows communication agent status (pending → calling → completed)

### Customer Dashboard (`/`)
**Component**: Service History
- ✅ Shows confirmed bookings from `bookings` collection
- ✅ Displays scheduled appointments

---

## 🧪 Testing

### Test Script
**Location**: `tests/test_step8_9_engagement_communication.py`

**Usage**:
```bash
cd /Users/swaroopthakare/hackthon/navigo/NaviGo
python3 tests/test_step8_9_engagement_communication.py
```

**What It Tests**:
1. ✅ Complete flow: Telemetry → ... → Engagement → Communication
2. ✅ Manual trigger instructions for Engagement agent
3. ✅ Manual trigger instructions for Communication agent

### Test Scenarios

#### Scenario 1: Complete Flow
**Input**: Telemetry with critical anomaly
**Expected Flow**:
1. `ingest_telemetry` → Stores in Firestore
2. `data_analysis_agent` → Detects anomaly
3. `diagnosis_agent` → Diagnoses component
4. `rca_agent` → Analyzes root cause
5. `scheduling_agent` → Schedules appointment
6. `engagement_agent` → Generates engagement script
7. `communication_agent` → Initiates voice call

**Verification**:
- Check Firestore `engagement_cases` collection
- Check Firestore `communication_cases` collection
- Check Firestore `call_contexts` collection
- Check Twilio Dashboard for call attempts
- Check Cloud Functions logs

---

## 🔍 Manual Verification Steps

### 1. Check Firestore Collections

```bash
# Check engagement_cases collection
gcloud firestore documents list --collection-id=engagement_cases --project=navigo-27206

# Check communication_cases collection
gcloud firestore documents list --collection-id=communication_cases --project=navigo-27206

# Check call_contexts collection
gcloud firestore documents list --collection-id=call_contexts --project=navigo-27206
```

### 2. Check Cloud Functions Logs

```bash
# Engagement agent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=engagement-agent" --project=navigo-27206 --limit=20

# Communication agent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=communication-agent" --project=navigo-27206 --limit=20

# Twilio webhook logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=twilio-webhook" --project=navigo-27206 --limit=20
```

### 3. Check Pub/Sub Topics

```bash
# Check navigo-engagement-complete topic
gcloud pubsub topics describe navigo-engagement-complete --project=navigo-27206

# Check navigo-communication-trigger topic
gcloud pubsub topics describe navigo-communication-trigger --project=navigo-27206

# Check navigo-communication-complete topic
gcloud pubsub topics describe navigo-communication-complete --project=navigo-27206
```

### 4. Check Twilio Dashboard

1. **Twilio Console**: https://console.twilio.com/
2. **Monitor → Logs → Calls**: Check for call attempts
3. **Verify Call Status**: Should show "initiated", "ringing", "answered", or "completed"
4. **Check Call Duration**: If call was answered

---

## 🚀 Deployment

### Deploy Engagement Agent

```bash
cd backend/functions/engagement_agent

gcloud functions deploy engagement-agent \
  --gen2 \
  --runtime=python311 \
  --region=us-central1 \
  --source=. \
  --entry-point=engagement_agent \
  --trigger-topic=navigo-scheduling-complete \
  --project=navigo-27206 \
  --service-account=navigo-functions@navigo-27206.iam.gserviceaccount.com \
  --max-instances=10 \
  --timeout=540s \
  --memory=512MB
```

### Deploy Communication Agent

```bash
cd backend/functions/communication_agent

gcloud functions deploy communication-agent \
  --gen2 \
  --runtime=python311 \
  --region=us-central1 \
  --source=. \
  --entry-point=communication_agent \
  --trigger-topic=navigo-communication-trigger \
  --project=navigo-27206 \
  --service-account=navigo-functions@navigo-27206.iam.gserviceaccount.com \
  --max-instances=10 \
  --timeout=540s \
  --memory=512MB \
  --set-env-vars TWILIO_ACCOUNT_SID=<your-sid>,TWILIO_AUTH_TOKEN=<your-token>,TWILIO_PHONE_NUMBER=<your-number>
```

### Required Environment Variables

**Communication Agent**:
- `TWILIO_ACCOUNT_SID`: Twilio Account SID
- `TWILIO_AUTH_TOKEN`: Twilio Auth Token
- `TWILIO_PHONE_NUMBER`: Twilio Phone Number (E.164 format)
- `TWILIO_CALLBACK_URL`: Webhook URL for Twilio (default: `https://us-central1-navigo-27206.cloudfunctions.net/twilio_webhook`)

---

## 📊 Customer Decision Simulation

The engagement agent simulates customer decisions based on:

| Factor | Impact on Decision |
|--------|-------------------|
| High severity | More likely to confirm |
| Urgent slot (RUL < 7 days) | More likely to confirm |
| Low severity | More likely to decline or delay |
| Normal/delayed slot | Variable (can confirm or decline) |

**Possible Decisions**:
- `"confirmed"`: Customer agrees to appointment → Booking created
- `"declined"`: Customer refuses or wants to delay → No booking
- `"no_response"`: Customer doesn't answer → No booking

---

## ✅ Summary

| Component | Status | Notes |
|-----------|--------|-------|
| **Engagement Backend Function** | ✅ Configured | `engagement_agent/main.py` |
| **Engagement Pub/Sub Trigger** | ✅ Configured | Subscribes to `navigo-scheduling-complete` |
| **Engagement LLM Integration** | ✅ Configured | Gemini 2.5 Flash |
| **Engagement Confidence Fields** | ✅ Added | For orchestrator routing |
| **Communication Backend Function** | ✅ Configured | `communication_agent/main.py` |
| **Communication Pub/Sub Trigger** | ✅ Configured | Subscribes to `navigo-communication-trigger` |
| **Communication Twilio Integration** | ✅ Configured | Requires Twilio credentials |
| **Communication Webhook Integration** | ✅ Configured | Handled by `twilio_webhook` function |
| **Frontend Integration** | ✅ Working | Real-time subscriptions |
| **Test Script** | ✅ Created | `tests/test_step8_9_engagement_communication.py` |

**All components are configured and ready for testing!**

---

## 📝 Next Steps

1. **Deploy Functions** (if not already deployed):
   - Deploy `engagement-agent` with Pub/Sub trigger
   - Deploy `communication-agent` with Pub/Sub trigger
   - Configure Twilio environment variables

2. **Configure Twilio**:
   - Set up Twilio account and phone number
   - Configure webhook URL for call status updates
   - Test voice call functionality

3. **Test Complete Flow**:
   - Upload telemetry with anomaly
   - Verify engagement script is generated
   - Verify voice call is initiated (if Twilio configured)

4. **Monitor Logs**:
   - Watch Cloud Functions logs for Gemini LLM calls
   - Watch Twilio webhook logs for call status updates
   - Verify engagement scripts are natural and empathetic

5. **Frontend Verification**:
   - Check Service Center shows engagement scripts
   - Check Communication agent status updates

---

**Last Updated**: 2025-12-17
**Status**: ✅ Configured & Enhanced | Ready for Testing

**Note**: Voice calls require Twilio configuration. Without Twilio credentials, the communication agent will skip call initiation but still create communication cases.


