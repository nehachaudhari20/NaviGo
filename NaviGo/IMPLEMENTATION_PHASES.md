# NaviGo Backend Implementation - Phase-Wise Plan

## Overview
This document outlines the phase-wise implementation plan based on `BACKEND_REVIEW_AND_FRONTEND_INTEGRATION.md`. Each phase builds upon the previous one and can be tested independently.

---

## **PHASE 1: Master Orchestrator Integration** 🔴 Critical
**Priority**: HIGHEST  
**Estimated Time**: 2-3 hours  
**Dependencies**: None

### Objective
Fix the critical issue where agents bypass the orchestrator. All agents should publish to orchestrator first, then orchestrator routes based on confidence.

### Tasks
1. **Update all agents to publish to orchestrator**:
   - [ ] `data_analysis_agent/main.py` - Change publish target from `navigo-anomaly-detected` to `navigo-orchestrator`
   - [ ] `diagnosis_agent/main.py` - Change publish target from `navigo-diagnosis-complete` to `navigo-orchestrator`
   - [ ] `rca_agent/main.py` - Change publish target from `navigo-rca-complete` to `navigo-orchestrator`
   - [ ] `scheduling_agent/main.py` - Change publish target from `navigo-scheduling-complete` to `navigo-orchestrator`
   - [ ] `engagement_agent/main.py` - Change publish target from `navigo-engagement-complete` to `navigo-orchestrator`
   - [ ] `feedback_agent/main.py` - Change publish target from `navigo-feedback-complete` to `navigo-orchestrator`
   - [ ] `manufacturing_agent/main.py` - Change publish target from `navigo-manufacturing-complete` to `navigo-orchestrator`

2. **Update orchestrator to route correctly**:
   - [ ] Update `master_orchestrator/main.py` to:
     - Identify which agent completed (from message metadata)
     - Apply confidence check (85% threshold)
     - Route to next agent's topic if confidence >= 85%
     - Route to `human_reviews` collection if confidence < 85%
     - Update `pipeline_states` collection

3. **Create Pub/Sub topic**:
   - [ ] Create `navigo-orchestrator` topic in GCP

4. **Testing**:
   - [ ] Test orchestrator routing with high confidence (>= 85%)
   - [ ] Test orchestrator routing with low confidence (< 85%)
   - [ ] Verify pipeline_states collection updates

### Files to Modify
- `backend/functions/data_analysis_agent/main.py`
- `backend/functions/diagnosis_agent/main.py`
- `backend/functions/rca_agent/main.py`
- `backend/functions/scheduling_agent/main.py`
- `backend/functions/engagement_agent/main.py`
- `backend/functions/feedback_agent/main.py`
- `backend/functions/manufacturing_agent/main.py`
- `backend/functions/master_orchestrator/main.py`

---

## **PHASE 2: Communication Agent Setup (Twilio Integration)** 🆕 New Component
**Priority**: HIGH  
**Estimated Time**: 4-5 hours  
**Dependencies**: Phase 1 (orchestrator routing)

### Objective
Create Cloud Function wrapper for communication agent to enable actual voice calls using Twilio.

### Twilio Flow Analysis

#### **Which Agent Uses Twilio?**
- **`communication_agent`** - Makes actual voice calls
- **`sms_agent`** (optional) - Sends SMS notifications

#### **How Twilio Will Be Used:**

```
1. engagement_agent completes
   ↓
2. Publishes to: navigo-communication-trigger
   ↓
3. communication_agent (Cloud Function) receives message
   ↓
4. Fetches engagement script from engagement_cases
   ↓
5. Initializes VoiceCommunicationAgent
   ↓
6. Calls make_voice_call() → Twilio initiates call
   ↓
7. Twilio calls customer's phone
   ↓
8. Twilio requests TwiML from webhook: /twilio/gather
   ↓
9. Webhook generates TwiML (greeting/explanation/questions)
   ↓
10. Customer responds (speech/DTMF)
    ↓
11. Twilio sends response to webhook: /twilio/gather (with user input)
    ↓
12. Webhook processes response, generates next TwiML
    ↓
13. Conversation continues (multiple turns)
    ↓
14. Customer confirms/declines appointment
    ↓
15. Webhook updates booking, sends SMS confirmation
    ↓
16. Stores call results in communication_cases
    ↓
17. Publishes to: navigo-communication-complete
```

### Tasks

1. **Create Communication Agent Cloud Function**:
   - [ ] Create `backend/functions/communication_agent/main.py`
   - [ ] Subscribe to `navigo-communication-trigger` topic
   - [ ] Import `VoiceCommunicationAgent` from `agents/communication/agent.py`
   - [ ] Fetch engagement data from Firestore
   - [ ] Initialize Twilio client
   - [ ] Call `make_voice_call()` with webhook URL
   - [ ] Store call initiation in `communication_cases` collection
   - [ ] Publish to `navigo-communication-complete` when done

2. **Create Twilio Webhook Endpoints**:
   - [ ] Create `backend/functions/twilio_webhook/main.py` (HTTP trigger)
   - [ ] Endpoint: `POST /twilio/gather` - Handles customer responses
   - [ ] Endpoint: `POST /twilio/status` - Tracks call status
   - [ ] Generate TwiML responses using `VoiceCommunicationAgent` methods:
     - `generate_twiml_greeting()`
     - `generate_twiml_defect_explanation()`
     - `generate_twiml_question_response()`
     - `generate_twiml_schedule_confirmation()`
   - [ ] Store conversation state in Firestore
   - [ ] Update booking when customer confirms

3. **Update Engagement Agent**:
   - [ ] Modify `engagement_agent/main.py` to publish to `navigo-communication-trigger`
   - [ ] Include customer phone number in message
   - [ ] Include engagement_id for reference

4. **Create Pub/Sub Topics**:
   - [ ] Create `navigo-communication-trigger` topic
   - [ ] Create `navigo-communication-complete` topic

5. **Create Firestore Collections**:
   - [ ] Create `communication_cases` collection schema
   - [ ] Store: call_sid, customer_phone, engagement_id, conversation_transcript, outcome, booking_id

6. **Environment Variables**:
   - [ ] Add to Cloud Function environment:
     - `TWILIO_ACCOUNT_SID`
     - `TWILIO_AUTH_TOKEN`
     - `TWILIO_PHONE_NUMBER`
     - `TWILIO_CALLBACK_URL` (webhook URL)

7. **Dependencies**:
   - [ ] Add `twilio>=8.0.0` to `communication_agent/requirements.txt`
   - [ ] Copy `agents/communication/agent.py` and `schemas.py` to function directory (or use shared module)

8. **Testing**:
   - [ ] Test webhook endpoints locally
   - [ ] Test Twilio call initiation
   - [ ] Test conversation flow (greeting → explanation → questions → scheduling)
   - [ ] Test SMS confirmation

### Files to Create
- `backend/functions/communication_agent/main.py`
- `backend/functions/communication_agent/requirements.txt`
- `backend/functions/twilio_webhook/main.py`
- `backend/functions/twilio_webhook/requirements.txt`

### Files to Modify
- `backend/functions/engagement_agent/main.py`

---

## **PHASE 3: HTTP Endpoints for Frontend** 🟡 Important
**Priority**: MEDIUM-HIGH  
**Estimated Time**: 2-3 hours  
**Dependencies**: None (can be done in parallel)

### Objective
Create HTTP endpoints so frontend can submit feedback and update human reviews.

### Tasks

1. **Create Submit Feedback Endpoint**:
   - [ ] Create `backend/functions/submit_feedback/main.py`
   - [ ] HTTP trigger: `POST /submit_feedback`
   - [ ] Validate request body (booking_id, vehicle_id required)
   - [ ] Publish to `navigo-feedback-complete` topic
   - [ ] Return success response

2. **Create Update Human Review Endpoint**:
   - [ ] Create `backend/functions/update_human_review/main.py`
   - [ ] HTTP trigger: `POST /update_human_review`
   - [ ] Validate request (reviewId, decision: 'approved'|'rejected')
   - [ ] Update `human_reviews` collection
   - [ ] If approved, publish to `navigo-orchestrator` to continue pipeline
   - [ ] Return success response

3. **Testing**:
   - [ ] Test feedback submission endpoint
   - [ ] Test human review update endpoint
   - [ ] Verify Pub/Sub message publishing

### Files to Create
- `backend/functions/submit_feedback/main.py`
- `backend/functions/submit_feedback/requirements.txt`
- `backend/functions/update_human_review/main.py`
- `backend/functions/update_human_review/requirements.txt`

---

## **PHASE 4: Scheduling Agent Enhancements** 🟡 Important
**Priority**: MEDIUM  
**Estimated Time**: 5-6 hours  
**Dependencies**: Phase 1 (orchestrator)

### Objective
Replace mock data with real service center data and add edge case handling.

### Tasks

1. **Replace Mock Data**:
   - [ ] Update `scheduling_agent/main.py` to fetch from Firestore:
     - `service_centers` collection for availability
     - `spare_parts_availability` field
     - `technician_availability` field
   - [ ] Remove hardcoded mock data (lines 195-221)

2. **Edge Case 1: Declined Appointments**:
   - [ ] Add `handle_declined_appointment()` function
   - [ ] Check fallback slots
   - [ ] Escalate urgent declined appointments
   - [ ] Reschedule with alternative slots

3. **Edge Case 2: Urgent Failure Alerts**:
   - [ ] Add `handle_urgent_failure_alert()` function
   - [ ] Detect safety-critical components
   - [ ] Create emergency scheduling for RUL < 3 days
   - [ ] Publish to `navigo-urgent-alert` topic
   - [ ] Escalate if no emergency slots

4. **Edge Case 3: Fleet Scheduling**:
   - [ ] Add `handle_fleet_scheduling()` function
   - [ ] Optimize slot allocation across fleet
   - [ ] Batch similar services
   - [ ] Consider service center capacity

5. **Edge Case 4: Recurring Defects**:
   - [ ] Add `handle_recurring_defect()` function
   - [ ] Check recurrence count from `manufacturing_cases`
   - [ ] Adjust RUL calculation (reduce by 15% per recurrence)
   - [ ] Escalate if recurrence >= 3
   - [ ] Flag for warranty review

6. **RCA/CAPA-Informed Scheduling**:
   - [ ] Add `enhanced_scheduling_with_rca_capa()` function
   - [ ] Consider RCA confidence
   - [ ] Use CAPA severity to boost priority
   - [ ] Factor in recurrence patterns

7. **Create New Collections/Topics**:
   - [ ] Create `investigation_cases` collection
   - [ ] Create `navigo-urgent-alert` topic

8. **Update Schema**:
   - [ ] Update `scheduling_cases` to include:
     - `decline_count`
     - `recurring_defect`
     - `recurrence_count`
     - `special_requirements`
     - `fleet_optimized`
     - `fleet_id`

9. **Testing**:
   - [ ] Test declined appointment handling
   - [ ] Test urgent alert system
   - [ ] Test fleet scheduling
   - [ ] Test recurring defect handling

### Files to Modify
- `backend/functions/scheduling_agent/main.py`

---

## **PHASE 5: Manufacturing Agent Enhancements** 🟡 Important
**Priority**: MEDIUM  
**Estimated Time**: 4-5 hours  
**Dependencies**: Phase 1 (orchestrator)

### Objective
Enhance manufacturing agent with fleet-wide pattern detection and predicted failure aggregation.

### Tasks

1. **Fleet-Wide Pattern Detection**:
   - [ ] Add `detect_fleet_wide_patterns()` function
   - [ ] Identify if issue affects multiple vehicles
   - [ ] Detect batch vs design problems
   - [ ] Calculate affected percentage

2. **Predicted Failure Aggregation**:
   - [ ] Add `aggregate_predicted_failures()` function
   - [ ] Aggregate predicted vs actual failures
   - [ ] Calculate prediction accuracy
   - [ ] Group by severity

3. **Enhanced Manufacturing Agent**:
   - [ ] Update `manufacturing_agent/main.py` to:
     - Call fleet-wide pattern detection
     - Call predicted failure aggregation
     - Include fleet data in Gemini prompt
     - Calculate design improvement priority
     - Store enhanced data in `manufacturing_cases`

4. **Manufacturing Dashboard Feed**:
   - [ ] Publish to `navigo-manufacturing-dashboard-feed` topic
   - [ ] Include fleet impact metrics
   - [ ] Include prediction accuracy metrics

5. **Design Improvement Tracking**:
   - [ ] Add `track_design_improvement()` function
   - [ ] Measure defect reduction after CAPA implementation
   - [ ] Update CAPA status based on results

6. **Create New Topic**:
   - [ ] Create `navigo-manufacturing-dashboard-feed` topic

7. **Testing**:
   - [ ] Test fleet-wide pattern detection
   - [ ] Test predicted failure aggregation
   - [ ] Test enhanced CAPA generation
   - [ ] Test dashboard feed

### Files to Modify
- `backend/functions/manufacturing_agent/main.py`

---

## **PHASE 6: Error Handling & Monitoring** 🟢 Recommended
**Priority**: LOW-MEDIUM  
**Estimated Time**: 3-4 hours  
**Dependencies**: All previous phases

### Objective
Add comprehensive error handling, retry logic, and logging.

### Tasks

1. **Error Handling**:
   - [ ] Add try-catch blocks in all agents
   - [ ] Handle Vertex AI errors gracefully
   - [ ] Handle Firestore errors
   - [ ] Handle Pub/Sub errors

2. **Retry Logic**:
   - [ ] Implement exponential backoff for retries
   - [ ] Add retry for transient failures
   - [ ] Dead-letter queue handling

3. **Logging**:
   - [ ] Add structured logging to Cloud Logging
   - [ ] Include context (case_id, vehicle_id, agent_name)
   - [ ] Log errors with stack traces

4. **BigQuery Schema Validation**:
   - [ ] Validate schema before BigQuery insert
   - [ ] Handle schema mismatches gracefully
   - [ ] Log schema errors

5. **Testing**:
   - [ ] Test error handling
   - [ ] Test retry logic
   - [ ] Verify logging

### Files to Modify
- All agent files in `backend/functions/`

---

## **PHASE 7: Firestore Indexes & Optimization** 🟢 Recommended
**Priority**: LOW  
**Estimated Time**: 1-2 hours  
**Dependencies**: None

### Objective
Create required Firestore composite indexes for efficient queries.

### Tasks

1. **Create Composite Indexes**:
   - [ ] `telemetry_events`: `vehicle_id` (ASC) + `timestamp_utc` (DESC)
   - [ ] `anomaly_cases`: `vehicle_id` (ASC) + `created_at` (DESC)
   - [ ] `pipeline_states`: `vehicle_id` (ASC) + `updated_at` (DESC)
   - [ ] `human_reviews`: `review_status` (ASC) + `created_at` (DESC)
   - [ ] `scheduling_cases`: `vehicle_id` (ASC) + `status` (ASC) + `created_at` (DESC)
   - [ ] `communication_cases`: `engagement_id` (ASC) + `created_at` (DESC)

2. **Testing**:
   - [ ] Verify queries work with indexes
   - [ ] Check query performance

---

## **Implementation Order Summary**

### Week 1 (Critical Path):
1. ✅ **Phase 1**: Master Orchestrator Integration
2. ✅ **Phase 2**: Communication Agent Setup (Twilio)
3. ✅ **Phase 3**: HTTP Endpoints

### Week 2 (Enhancements):
4. ✅ **Phase 4**: Scheduling Agent Enhancements
5. ✅ **Phase 5**: Manufacturing Agent Enhancements

### Week 3 (Polish):
6. ✅ **Phase 6**: Error Handling & Monitoring
7. ✅ **Phase 7**: Firestore Indexes

---

## **Twilio Setup Requirements**

### Environment Variables Needed:
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_CALLBACK_URL=https://us-central1-navigo-27206.cloudfunctions.net/twilio_webhook
```

### Twilio Account Setup:
1. Create Twilio account (if not exists)
2. Get phone number with voice capabilities
3. Configure webhook URLs in Twilio console
4. Add environment variables to Cloud Functions

### Webhook Endpoints Required:
- `POST /twilio/gather` - Handles customer responses during call
- `POST /twilio/status` - Tracks call status updates

---

## **Testing Strategy**

### Unit Tests:
- Test each agent function independently
- Mock external dependencies (Twilio, Vertex AI, Firestore)

### Integration Tests:
- Test end-to-end pipeline flow
- Test orchestrator routing
- Test Twilio call flow

### Manual Tests:
- Test with real vehicle data
- Test Twilio voice calls
- Test frontend integration

---

## **Notes**

- All agents use **Gemini 2.5 Flash** via Vertex AI
- Confidence threshold is **85%** (hardcoded in orchestrator)
- Communication agent supports multiple LLM providers (but we'll use Gemini 2.5 Flash)
- Twilio webhooks require public HTTPS URLs (Cloud Functions provide this)
- All data synced to BigQuery for analytics
- Frontend uses Firestore real-time listeners (not REST APIs for most data)

---

**Last Updated**: 2024-12-15  
**Status**: Ready for Implementation

