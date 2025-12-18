# Complete Data Flow: JSON Upload → Frontend Dashboards

## Overview

This document traces the complete journey of vehicle telemetry data from JSON file upload through the entire AI pipeline to where it appears in each frontend dashboard.

---

## 🚀 Step-by-Step Flow

### **STEP 1: JSON File Upload (Telemetry Ingestion)**

**Location**: Customer Dashboard or Service Center Dashboard  
**Component**: Telemetry upload form/component  
**Action**: User uploads JSON file with vehicle telemetry data

**Example JSON Format**:
```json
{
  "event_id": "evt_1234567890",
  "vehicle_id": "MH-07-AB-1234",
  "timestamp_utc": "2024-12-15T10:30:45.123Z",
  "gps_lat": 19.0760,
  "gps_lon": 72.8777,
  "speed_kmph": 60.5,
  "odometer_km": 45230.5,
  "engine_rpm": 2500,
  "engine_coolant_temp_c": 85.0,
  "engine_oil_temp_c": 90.0,
  "fuel_level_pct": 45.0,
  "battery_soc_pct": 85.0,
  "battery_soh_pct": 92.0,
  "dtc_codes": ["P0301"]
}
```

**Frontend Code**:
```typescript
// frontend/vehicle-care-2/lib/api/telemetry.ts
import { API_ENDPOINTS } from './config'

export async function ingestTelemetry(data: TelematicsEvent) {
  const response = await fetch(API_ENDPOINTS.INGEST_TELEMETRY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return response.json()
}
```

**Backend Endpoint**: `POST /ingest_telemetry` (Cloud Function)  
**Backend File**: `backend/functions/ingest_telemetry/main.py`

**What Happens**:
1. Validates JSON against Pydantic schema (`TelematicsEvent`)
2. Stores in Firestore: `telemetry_events/{event_id}`
3. Returns success/error response

**Firestore Collection Updated**:
- ✅ `telemetry_events` - New document created

**Frontend Display** (Real-time):
- 📊 **Customer Dashboard** (`/`): Vehicle telemetry card shows latest data
- 📊 **Service Center Dashboard** (`/service-center`): Telemetry monitoring component shows real-time data

---

### **STEP 2: Firestore Trigger (Automatic)**

**Trigger**: Firestore document write event  
**Backend Function**: `telemetry_firestore_trigger`  
**Backend File**: `backend/functions/telemetry_firestore_trigger/main.py`

**What Happens**:
1. Automatically triggered when document is written to `telemetry_events`
2. Publishes to Pub/Sub: `navigo-telemetry-ingested`
3. Syncs data to BigQuery: `telemetry.telemetry_events` table

**Pub/Sub Topic**:
- ✅ `navigo-telemetry-ingested` - Message published

**No Frontend Display** (Backend-only process)

---

### **STEP 3: Anomaly Detection (Data Analysis Agent)**

**Trigger**: Pub/Sub message on `navigo-telemetry-ingested`  
**Backend Function**: `data_analysis_agent`  
**Backend File**: `backend/functions/data_analysis_agent/main.py`

**What Happens**:
1. Fetches last 10 telemetry events for the vehicle
2. Uses Gemini 2.5 Flash LLM to detect anomalies
3. Analyzes patterns: engine_temp spikes, brake_wear, battery degradation
4. **IF anomaly detected**:
   - Creates case in Firestore: `anomaly_cases/{case_id}`
   - Syncs to BigQuery
   - Publishes to Pub/Sub: `navigo-anomaly-detected`

**Firestore Collection Updated**:
- ✅ `anomaly_cases` - New document created with:
  ```json
  {
    "case_id": "case_1234567890",
    "vehicle_id": "MH-07-AB-1234",
    "anomaly_detected": true,
    "anomaly_type": "thermal_overheat",
    "severity_score": 0.75,
    "telemetry_window": [...],
    "created_at": "2024-12-15T10:31:00.000Z",
    "status": "pending_diagnosis"
  }
  ```

**Pub/Sub Topic**:
- ✅ `navigo-anomaly-detected` - Message published

**Frontend Display** (Real-time):
- 📊 **Customer Dashboard** (`/`): 
  - `ai-predictions-transparent.tsx` - Shows anomaly alerts
  - Health indicators update
- 📊 **Service Center Dashboard** (`/service-center`):
  - `priority-vehicle-queue.tsx` - Vehicle appears in priority queue if severity is high/critical
  - Telemetry monitoring shows anomaly markers

**Frontend Code**:
```typescript
// frontend/vehicle-care-2/components/ai-predictions-transparent.tsx
import { getCustomerPredictions } from '@/lib/api/dashboard-data'

useEffect(() => {
  const loadPredictions = async () => {
    const predictions = await getCustomerPredictions(vehicleId)
    setPredictions(predictions)
  }
  loadPredictions()
  
  // Real-time subscription
  const unsubscribe = subscribeToPredictions(vehicleId, (newPredictions) => {
    setPredictions(newPredictions)
  })
  return () => unsubscribe()
}, [vehicleId])
```

---

### **STEP 4: Master Orchestrator (Confidence Check)**

**Trigger**: Pub/Sub message on `navigo-anomaly-detected`  
**Backend Function**: `master_orchestrator`  
**Backend File**: `backend/functions/master_orchestrator/main.py`

**What Happens**:
1. Receives anomaly detection result
2. Checks confidence score (threshold: 85%)
3. **IF confidence >= 85%**:
   - Routes to next agent (`diagnosis_agent`)
   - Updates `pipeline_states` collection
4. **IF confidence < 85%**:
   - Routes to `human_reviews` collection
   - Frontend shows in Human Review Queue

**Firestore Collection Updated**:
- ✅ `pipeline_states` - Pipeline state tracked
- ✅ `human_reviews` - Created if confidence < 85%

**Frontend Display** (Real-time):
- 📊 **Service Center Dashboard** (`/service-center`):
  - `human-review-queue.tsx` - Shows items requiring human review (if confidence < 85%)
  - `ai-control-centre.tsx` - Shows pipeline state in Agentic AI dashboard

**Frontend Code**:
```typescript
// frontend/vehicle-care-2/components/service-center/human-review-queue.tsx
import { getHumanReviewQueue, subscribeToHumanReviews } from '@/lib/api/dashboard-data'

useEffect(() => {
  const loadReviews = async () => {
    const reviews = await getHumanReviewQueue(20)
    setReviewItems(reviews)
  }
  loadReviews()
  
  // Real-time subscription
  const unsubscribe = subscribeToHumanReviews((newReviews) => {
    setReviewItems(newReviews)
  })
  return () => unsubscribe()
}, [])
```

---

### **STEP 5: Failure Diagnosis (Diagnosis Agent)**

**Trigger**: Pub/Sub message (routed by orchestrator)  
**Backend Function**: `diagnosis_agent`  
**Backend File**: `backend/functions/diagnosis_agent/main.py`

**What Happens**:
1. Fetches anomaly case and telemetry window
2. Uses Gemini 2.5 Flash LLM to diagnose component failure
3. Identifies:
   - Component (e.g., "brake_pads", "engine_coolant_system")
   - Severity ("Critical", "High", "Medium", "Low")
   - Estimated RUL (Remaining Useful Life in days)
   - Failure probability (0.0 - 1.0)
4. Stores in Firestore: `diagnosis_cases/{case_id}`
5. Publishes to Pub/Sub: `navigo-diagnosis-complete`

**Firestore Collection Updated**:
- ✅ `diagnosis_cases` - New document created with:
  ```json
  {
    "case_id": "case_1234567890",
    "vehicle_id": "MH-07-AB-1234",
    "component": "brake_pads",
    "failure_probability": 0.85,
    "estimated_rul_days": 15,
    "severity": "High",
    "confidence": 0.92,
    "created_at": "2024-12-15T10:31:30.000Z",
    "status": "pending_rca"
  }
  ```

**Pub/Sub Topic**:
- ✅ `navigo-diagnosis-complete` - Message published

**Frontend Display** (Real-time):
- 📊 **Customer Dashboard** (`/`):
  - `ai-predictions-transparent.tsx` - Shows diagnosis results with component, severity, RUL
  - `vehicle-card.tsx` - Health score updates based on diagnosis
- 📊 **Service Center Dashboard** (`/service-center`):
  - `priority-vehicle-queue.tsx` - Vehicle appears with diagnosis details
  - Telemetry monitoring shows component-specific alerts

**Frontend Code**:
```typescript
// frontend/vehicle-care-2/components/ai-predictions-transparent.tsx
import { getCustomerPredictions, subscribeToPredictions } from '@/lib/api/dashboard-data'

// Real-time subscription to diagnosis_cases
const unsubscribe = subscribeToPredictions(vehicleId, (predictions) => {
  setPredictions(predictions.map(p => ({
    component: p.component,
    severity: p.severity,
    estimatedRul: p.estimated_rul_days,
    confidence: p.confidence
  })))
})
```

---

### **STEP 6: Root Cause Analysis (RCA Agent)**

**Trigger**: Pub/Sub message on `navigo-diagnosis-complete`  
**Backend Function**: `rca_agent`  
**Backend File**: `backend/functions/rca_agent/main.py`

**What Happens**:
1. Fetches diagnosis case and telemetry context
2. Uses Gemini 2.5 Flash LLM for Root Cause Analysis
3. Identifies:
   - Root cause (e.g., "Material degradation due to excessive heat cycles")
   - Contributing factors
   - Confidence score
   - Recommended actions
4. Stores in Firestore: `rca_cases/{case_id}`
5. Publishes to Pub/Sub: `navigo-rca-complete`

**Firestore Collection Updated**:
- ✅ `rca_cases` - New document created with:
  ```json
  {
    "case_id": "case_1234567890",
    "vehicle_id": "MH-07-AB-1234",
    "root_cause": "Material degradation due to excessive heat cycles",
    "contributing_factors": ["High-speed driving", "Heavy braking"],
    "confidence": 0.87,
    "recommended_action": "Replace brake pads with high-temperature rated compound",
    "created_at": "2024-12-15T10:32:00.000Z"
  }
  ```

**Pub/Sub Topic**:
- ✅ `navigo-rca-complete` - Message published

**Frontend Display** (Real-time):
- 📊 **Service Center Dashboard** (`/service-center`):
  - `priority-vehicle-queue.tsx` - Shows root cause in vehicle details
  - Diagnosis details expand to show RCA results
- 📊 **Manufacturer Dashboard** (`/manufacturer`):
  - `failure-patterns.tsx` - Aggregates root causes for pattern analysis (when connected)

---

### **STEP 7: Intelligent Scheduling (Scheduling Agent)**

**Trigger**: Pub/Sub message on `navigo-rca-complete`  
**Backend Function**: `scheduling_agent`  
**Backend File**: `backend/functions/scheduling_agent/main.py`

**What Happens**:
1. Fetches diagnosis case (RUL, severity) and RCA data
2. Fetches service center availability (technicians, parts, slots)
3. Uses Gemini 2.5 Flash LLM to optimize scheduling
4. Handles edge cases:
   - Urgent failures (RUL < 3 days) → Emergency slots
   - Fleet scheduling → Batch optimization
   - Recurring defects → Priority boost
5. Stores in Firestore: `scheduling_cases/{case_id}`
6. Creates booking record: `bookings/{booking_id}`
7. Publishes to Pub/Sub: `navigo-scheduling-complete`

**Firestore Collection Updated**:
- ✅ `scheduling_cases` - New document created with:
  ```json
  {
    "case_id": "case_1234567890",
    "vehicle_id": "MH-07-AB-1234",
    "best_slot": "2024-12-20T10:00:00Z",
    "service_center": "Mumbai Service Center",
    "slot_type": "urgent",
    "estimated_duration": "2 hours",
    "status": "pending_engagement",
    "created_at": "2024-12-15T10:32:30.000Z"
  }
  ```
- ✅ `bookings` - New document created with:
  ```json
  {
    "booking_id": "booking_1234567890",
    "vehicle_id": "MH-07-AB-1234",
    "service_center_id": "SC-MUM-001",
    "scheduled_date": "2024-12-20",
    "scheduled_time": "10:00 AM",
    "status": "pending",
    "service_type": "Brake Pad Replacement",
    "created_at": "2024-12-15T10:32:30.000Z"
  }
  ```

**Pub/Sub Topic**:
- ✅ `navigo-scheduling-complete` - Message published

**Frontend Display** (Real-time):
- 📊 **Customer Dashboard** (`/`):
  - `service-history.tsx` - Shows upcoming appointment in service history
  - `vehicle-card.tsx` - Displays next service date
- 📊 **Service Center Dashboard** (`/service-center`):
  - `priority-vehicle-queue.tsx` - Shows scheduled appointment time
  - Operations overview shows scheduled services

**Frontend Code**:
```typescript
// frontend/vehicle-care-2/components/service-history.tsx
import { getCustomerServiceHistory, subscribeToServiceHistory } from '@/lib/api/dashboard-data'

useEffect(() => {
  const loadHistory = async () => {
    const history = await getCustomerServiceHistory(vehicleId, 10)
    setHistory(history)
  }
  loadHistory()
  
  // Real-time subscription
  const unsubscribe = subscribeToServiceHistory(vehicleId, (newHistory) => {
    setHistory(newHistory)
  })
  return () => unsubscribe()
}, [vehicleId])
```

---

### **STEP 8: Customer Engagement (Script Generation)**

**Trigger**: Pub/Sub message on `navigo-scheduling-complete`  
**Backend Function**: `engagement_agent`  
**Backend File**: `backend/functions/engagement_agent/main.py`

**What Happens**:
1. Fetches RCA case (root cause, recommended action)
2. Fetches scheduling case (best slot, service center)
3. Uses Gemini 2.5 Flash LLM to generate customer engagement script
4. Generates:
   - Personalized greeting
   - Defect explanation (simple language)
   - Recommended action
   - Conversation transcript template
5. Stores in Firestore: `engagement_cases/{case_id}`
6. Publishes to Pub/Sub: `navigo-engagement-complete` AND `navigo-communication-trigger`

**Firestore Collection Updated**:
- ✅ `engagement_cases` - New document created with:
  ```json
  {
    "case_id": "case_1234567890",
    "vehicle_id": "MH-07-AB-1234",
    "transcript": "Hello [Name]! We've detected an issue with your brake pads...",
    "communication_method": "voice",
    "status": "pending_communication",
    "created_at": "2024-12-15T10:33:00.000Z"
  }
  ```

**Pub/Sub Topics**:
- ✅ `navigo-engagement-complete` - Message published
- ✅ `navigo-communication-trigger` - Message published (triggers voice call)

**Frontend Display** (Real-time):
- 📊 **Service Center Dashboard** (`/service-center`):
  - Customer engagement section shows generated scripts
  - Communication agent status shows "pending" → "calling" → "completed"

---

### **STEP 9: Voice Communication (Interactive Call)**

**Trigger**: Pub/Sub message on `navigo-communication-trigger`  
**Backend Function**: `communication_agent` (Cloud Function wrapper)  
**Backend File**: `backend/functions/communication_agent/main.py` + `agents/communication/agent.py`

**What Happens**:
1. Fetches engagement script from `engagement_cases`
2. Fetches scheduling case (best slot, service center)
3. Initializes `VoiceCommunicationAgent` (Twilio integration)
4. **Makes actual voice call** to customer phone number
5. **Interactive conversation**:
   - Greeting → Customer responds
   - Explains defect → Customer asks questions
   - Answers questions (cost, urgency, safety)
   - Asks to schedule → Customer confirms/declines
   - Confirms booking → Sends SMS confirmation
6. Stores call results in Firestore: `communication_cases/{case_id}`
7. Updates booking status if customer confirms
8. Publishes to Pub/Sub: `navigo-communication-complete`

**Firestore Collection Updated**:
- ✅ `communication_cases` - New document created with:
  ```json
  {
    "case_id": "case_1234567890",
    "vehicle_id": "MH-07-AB-1234",
    "customer_phone": "+919876543210",
    "call_sid": "CA...",
    "call_status": "completed",
    "call_duration": 120,
    "customer_response": "confirmed",
    "booking_confirmed": true,
    "conversation_transcript": "...",
    "created_at": "2024-12-15T10:33:30.000Z"
  }
  ```
- ✅ `bookings` - Status updated to "confirmed" if customer confirms

**Pub/Sub Topic**:
- ✅ `navigo-communication-complete` - Message published

**Frontend Display** (Real-time):
- 📊 **Customer Dashboard** (`/`):
  - `service-history.tsx` - Booking status updates to "confirmed"
  - SMS notification received (if SMS agent triggered)
- 📊 **Service Center Dashboard** (`/service-center`):
  - Communication agent status shows "completed"
  - Call logs show conversation details
  - Operations overview shows confirmed appointments

---

### **STEP 10: Service Completion & Feedback**

**Action**: Service center technician completes service and submits feedback  
**Frontend Component**: `feedback-validation.tsx`  
**Frontend Location**: Service Center Dashboard → Reports Tab

**Frontend Code**:
```typescript
// frontend/vehicle-care-2/components/service-center/feedback-validation.tsx
import { submitFeedback } from '@/lib/api/agents'

const handleSubmit = async (e: React.FormEvent) => {
  const feedbackData = {
    booking_id: appointmentId,
    vehicle_id: vehicleId,
    technician_notes: formData.technicianNotes,
    customer_rating: formData.accuracyScore / 20,
    prediction_accurate: formData.predictionAccurate,
    accuracy_score: formData.accuracyScore,
    actual_issue: formData.actualIssue,
    parts_used: formData.partsUsed,
  }
  
  const result = await submitFeedback(feedbackData)
}
```

**Backend Endpoint**: `POST /submit_feedback`  
**Backend File**: `backend/functions/submit_feedback/main.py`

**What Happens**:
1. Publishes to Pub/Sub: `navigo-feedback-complete`

**Pub/Sub Topic**:
- ✅ `navigo-feedback-complete` - Message published

---

### **STEP 11: Feedback Processing (Feedback Agent)**

**Trigger**: Pub/Sub message on `navigo-feedback-complete`  
**Backend Function**: `feedback_agent`  
**Backend File**: `backend/functions/feedback_agent/main.py`

**What Happens**:
1. Fetches original anomaly case
2. Fetches post-service telemetry
3. Uses Gemini 2.5 Flash LLM to validate predictions
4. Calculates:
   - Prediction accuracy (was prediction correct?)
   - CEI (Customer Effort Index)
   - Validation label: "Correct", "Recurring", or "Incorrect"
5. Stores in Firestore: `feedback_cases/{case_id}`
6. Publishes to Pub/Sub: `navigo-feedback-complete`

**Firestore Collection Updated**:
- ✅ `feedback_cases` - New document created with:
  ```json
  {
    "case_id": "case_1234567890",
    "booking_id": "booking_1234567890",
    "vehicle_id": "MH-07-AB-1234",
    "accuracy_score": 95,
    "prediction_accurate": true,
    "cei_score": 4.2,
    "validation_label": "Correct",
    "created_at": "2024-12-15T14:00:00.000Z"
  }
  ```

**Frontend Display** (Real-time):
- 📊 **Service Center Dashboard** (`/service-center`):
  - `feedback-validation.tsx` - Shows validation results
  - Service analytics shows accuracy metrics
- 📊 **Manufacturer Dashboard** (`/manufacturer`):
  - `kpi-cards.tsx` - Shows prediction accuracy metrics (when connected)

---

### **STEP 12: Manufacturing Feedback Loop (Manufacturing Agent)**

**Trigger**: Pub/Sub message on `navigo-feedback-complete`  
**Backend Function**: `manufacturing_agent`  
**Backend File**: `backend/functions/manufacturing_agent/main.py`

**What Happens**:
1. Fetches RCA case (root_cause)
2. Fetches feedback case (CEI, validation_label)
3. Calculates recurrence count (same vehicle, same component)
4. **Enhanced Analysis** (if implemented):
   - Detects fleet-wide patterns
   - Aggregates predicted failures
   - Identifies batch problems
5. Uses Gemini 2.5 Flash LLM to generate CAPA insights:
   - Corrective Action
   - Preventive Action
   - Severity (Low/Medium/High/Critical)
6. Stores in Firestore: `manufacturing_cases/{case_id}`
7. Publishes to Pub/Sub: `navigo-manufacturing-complete` AND `navigo-manufacturing-dashboard-feed`

**Firestore Collection Updated**:
- ✅ `manufacturing_cases` - New document created with:
  ```json
  {
    "case_id": "case_1234567890",
    "vehicle_id": "MH-07-AB-1234",
    "issue": "Brake Pads: Premature Wear",
    "root_cause": "Material degradation due to excessive heat cycles",
    "capa_recommendation": "Update supplier specifications: Require high-temperature rated ceramic compound",
    "severity": "High",
    "recurrence_count": 2,
    "fleet_wide_pattern": false,
    "affected_vehicles_count": 1,
    "created_at": "2024-12-15T14:01:00.000Z"
  }
  ```

**Pub/Sub Topics**:
- ✅ `navigo-manufacturing-complete` - Message published
- ✅ `navigo-manufacturing-dashboard-feed` - Message published (for real-time dashboard)

**Frontend Display** (Real-time):
- 📊 **Manufacturer Dashboard** (`/manufacturer`):
  - `capa-feedback.tsx` - Shows CAPA insights (when connected to Firestore)
  - `failure-patterns.tsx` - Shows root cause patterns (when connected)
  - `kpi-cards.tsx` - Shows manufacturing metrics

**Frontend Code** (When Implemented):
```typescript
// frontend/vehicle-care-2/components/manufacturer/capa-feedback.tsx
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/api/firestore'
import { API_ENDPOINTS } from '@/lib/api/config'

useEffect(() => {
  const q = query(
    collection(db, API_ENDPOINTS.COLLECTIONS.MANUFACTURING_CASES),
    orderBy('created_at', 'desc'),
    limit(50)
  )
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const capaItems = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    setCAPAFeedback(capaItems)
  })
  
  return () => unsubscribe()
}, [])
```

---

## 📊 Complete Frontend Dashboard Mapping

### **Customer Dashboard** (`/`)

| Component | Data Source | Firestore Collection | Real-time? |
|-----------|-------------|---------------------|------------|
| `vehicle-card.tsx` | Vehicle health, last service | `vehicles`, `bookings` | ✅ Yes |
| `service-history.tsx` | Service history, appointments | `bookings` | ✅ Yes |
| `ai-predictions-transparent.tsx` | Anomaly alerts, diagnoses | `anomaly_cases`, `diagnosis_cases` | ✅ Yes |

**Data Flow**:
1. JSON upload → `telemetry_events`
2. Anomaly detected → `anomaly_cases` → Shows in predictions
3. Diagnosis → `diagnosis_cases` → Shows component, severity, RUL
4. Scheduling → `bookings` → Shows in service history
5. Communication → `bookings` status → Updates to "confirmed"

---

### **Service Center Dashboard** (`/service-center`)

| Component | Data Source | Firestore Collection | Real-time? |
|-----------|-------------|---------------------|------------|
| `priority-vehicle-queue.tsx` | High-priority vehicles | `diagnosis_cases` (filtered by severity) | ✅ Yes |
| `human-review-queue.tsx` | Items requiring review | `human_reviews` | ✅ Yes |
| `feedback-validation.tsx` | Submit service feedback | `feedback_cases` (via API) | ✅ Yes |
| `ai-control-centre.tsx` | Pipeline states | `pipeline_states` | ⚠️ Partial (mock data) |
| Telemetry Monitoring | Real-time telemetry | `telemetry_events` | ✅ Yes |
| Operations Overview | Scheduled services | `bookings` | ✅ Yes |

**Data Flow**:
1. JSON upload → `telemetry_events` → Shows in telemetry monitoring
2. Anomaly detected → `anomaly_cases` → May appear in priority queue
3. Diagnosis → `diagnosis_cases` → Appears in priority queue if severity high/critical
4. Low confidence → `human_reviews` → Shows in human review queue
5. Scheduling → `bookings` → Shows in operations overview
6. Communication → `communication_cases` → Shows call status
7. Feedback → `feedback_cases` → Shows validation results

---

### **Manufacturer Dashboard** (`/manufacturer`)

| Component | Data Source | Firestore Collection | Real-time? |
|-----------|-------------|---------------------|------------|
| `kpi-cards.tsx` | Manufacturing metrics | `manufacturing_cases`, `feedback_cases` | ⚠️ Partial |
| `capa-feedback.tsx` | CAPA insights | `manufacturing_cases` | ❌ Mock data (needs connection) |
| `failure-patterns.tsx` | Root cause patterns | `rca_cases`, `manufacturing_cases` | ❌ Mock data (needs connection) |

**Data Flow**:
1. Feedback → `feedback_cases` → Aggregated in KPIs
2. Manufacturing agent → `manufacturing_cases` → Should show in CAPA feedback (when connected)
3. RCA → `rca_cases` → Should show in failure patterns (when connected)

---

## 🔄 Real-time Update Flow

### **How Real-time Updates Work**

1. **Backend writes to Firestore** → Document created/updated
2. **Frontend subscribes** → `onSnapshot()` listener active
3. **Firestore sends update** → Frontend receives new data
4. **Component re-renders** → UI updates automatically

**Example**:
```typescript
// Real-time subscription
const unsubscribe = onSnapshot(
  query(
    collection(db, 'anomaly_cases'),
    where('vehicle_id', '==', vehicleId),
    orderBy('created_at', 'desc')
  ),
  (snapshot) => {
    const cases = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    setAnomalyCases(cases) // UI updates automatically
  }
)
```

---

## 📋 Summary: Data Journey

```
JSON Upload
    ↓
telemetry_events (Firestore)
    ↓
telemetry_firestore_trigger (Pub/Sub)
    ↓
data_analysis_agent → anomaly_cases (Firestore)
    ↓
master_orchestrator → pipeline_states (Firestore)
    ↓
diagnosis_agent → diagnosis_cases (Firestore)
    ↓
rca_agent → rca_cases (Firestore)
    ↓
scheduling_agent → scheduling_cases + bookings (Firestore)
    ↓
engagement_agent → engagement_cases (Firestore)
    ↓
communication_agent → communication_cases (Firestore)
    ↓
[Service Completed]
    ↓
submit_feedback (HTTP) → feedback_cases (Firestore)
    ↓
feedback_agent → feedback_cases (Firestore)
    ↓
manufacturing_agent → manufacturing_cases (Firestore)
    ↓
[Design Team Reviews]
    ↓
[Production Improvement]
```

**Frontend Dashboards Update in Real-time at Each Step!**

---

## 🎯 Key Takeaways

1. **JSON Upload** triggers the entire pipeline automatically
2. **Each agent** writes to Firestore collections
3. **Frontend components** subscribe to Firestore collections for real-time updates
4. **Customer Dashboard** sees: predictions, service history, appointments
5. **Service Center Dashboard** sees: priority queue, reviews, operations, feedback
6. **Manufacturer Dashboard** sees: CAPA insights, failure patterns, KPIs (when fully connected)

---

**Last Updated**: 2024-12-15  
**Status**: Complete flow documented, some manufacturer dashboard features still need Firestore connection

