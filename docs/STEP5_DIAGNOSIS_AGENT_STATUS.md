# STEP 5: Diagnosis Agent - Setup & Testing Status

## Overview
This document tracks the setup, configuration, and testing status of STEP 5: Diagnosis Agent, which diagnoses component failures using Gemini 2.5 Flash LLM.

---

## ✅ STEP 5: Failure Diagnosis (Diagnosis Agent)

### Status: ✅ **CONFIGURED & ENHANCED**

**Backend Function**: `backend/functions/diagnosis_agent/main.py`
- **Entry Point**: `diagnosis_agent` (Pub/Sub trigger)
- **Trigger**: Pub/Sub message on `navigo-anomaly-detected` topic
- **Decorator**: `@functions_framework.cloud_event` ✅

**Configuration**:
- **Input Topic**: `navigo-anomaly-detected` (from data_analysis_agent or orchestrator)
- **Output Topic**: `navigo-diagnosis-complete` (publishes to)
- **LLM Model**: Gemini 2.5 Flash (`gemini-2.5-flash`)
- **Vertex AI**: Project `navigo-27206`, Location `us-central1`

**What It Does**:
1. ✅ Receives anomaly detection event from Pub/Sub
2. ✅ Fetches anomaly case from Firestore: `anomaly_cases/{case_id}`
3. ✅ Fetches telemetry window using event IDs from anomaly case
4. ✅ Uses Gemini 2.5 Flash LLM to diagnose component failure
5. ✅ Identifies:
   - Component (e.g., "engine_coolant_system", "battery", "brake_pads")
   - Severity ("Critical", "High", "Medium", "Low")
   - Estimated RUL (Remaining Useful Life in days)
   - Failure probability (0.0 - 1.0)
6. ✅ Stores in Firestore: `diagnosis_cases/{diagnosis_id}`
7. ✅ Updates anomaly case status to "diagnosed"
8. ✅ Publishes to Pub/Sub: `navigo-diagnosis-complete`
9. ✅ Syncs to BigQuery: `telemetry.diagnosis_cases` table

**Firestore Collection Updated**:
- ✅ `diagnosis_cases` - New document created with:
  ```json
  {
    "diagnosis_id": "diagnosis_abc123",
    "case_id": "case_1234567890",
    "vehicle_id": "MH-07-AB-1234",
    "component": "engine_coolant_system",
    "failure_probability": 0.85,
    "estimated_rul_days": 15,
    "severity": "High",
    "confidence": 0.85,
    "confidence_score": 0.85,
    "predicted_failure": "engine_coolant_system failure",
    "status": "active",
    "created_at": "2024-12-15T10:31:30.000Z"
  }
  ```

**Pub/Sub Topics**:
- ✅ **Input**: `navigo-anomaly-detected` (subscribes to)
- ✅ **Output**: `navigo-diagnosis-complete` (publishes to)

---

## 🔧 Fixes & Enhancements Applied

### 1. Added Confidence Fields
**Issue**: Orchestrator needs confidence score for routing decisions

**Fix**: Added to diagnosis data:
```python
"confidence": confidence_score,  # For orchestrator
"confidence_score": confidence_score,  # Alternative field name
```

**File**: `backend/functions/diagnosis_agent/main.py`

### 2. Fixed Status Field
**Issue**: Frontend expects `status: "active"` but diagnosis was using `"pending_rca"`

**Fix**: Changed status to `"active"` for frontend compatibility

**File**: `backend/functions/diagnosis_agent/main.py`

### 3. Added Predicted Failure Field
**Issue**: Frontend needs `predicted_failure` field for display

**Fix**: Added `predicted_failure` field:
```python
"predicted_failure": f"{component} failure"
```

**File**: `backend/functions/diagnosis_agent/main.py`

### 4. Enhanced Pub/Sub Message
**Issue**: Orchestrator needs confidence and agent_stage

**Fix**: Added to Pub/Sub message:
```python
{
    "confidence": confidence_score,
    "confidence_score": confidence_score,
    "agent_stage": "diagnosis"
}
```

**File**: `backend/functions/diagnosis_agent/main.py`

### 5. Fixed Trigger Agent Endpoint
**Issue**: `trigger_agent` was using wrong topic for diagnosis

**Fix**: Changed from `navigo-diagnosis-request` to `navigo-anomaly-detected`

**File**: `backend/functions/trigger_agent/main.py`

### 6. Enhanced Frontend Integration
**Issue**: Frontend wasn't displaying RUL and component correctly

**Fix**: Updated `ai-predictions-transparent.tsx` to:
- Use `estimated_rul_days` for timeToFailure
- Use `component` for issueType
- Handle multiple confidence field names
- Map severity correctly

**File**: `frontend/vehicle-care-2/components/ai-predictions-transparent.tsx`

### 7. Updated DiagnosisCase Interface
**Issue**: TypeScript interface missing new fields

**Fix**: Added fields:
- `diagnosis_id`
- `confidence_score`
- `failure_probability`
- `estimated_rul_days`

**File**: `frontend/vehicle-care-2/lib/api/dashboard-data.ts`

---

## 📋 Frontend Integration Status

### Customer Dashboard (`/`)
**Component**: `frontend/vehicle-care-2/components/ai-predictions-transparent.tsx`
- ✅ Uses `useDiagnosisCases(undefined, vehicleId, true)` - Real-time subscription
- ✅ Displays component, severity, RUL, confidence
- ✅ Shows `estimated_rul_days` as timeToFailure
- ✅ Maps component to issueType

**Component**: `frontend/vehicle-care-2/components/vehicle-card.tsx`
- ✅ Health score updates based on diagnosis cases
- ✅ Real-time subscription to diagnosis cases

### Service Center Dashboard (`/service-center`)
**Component**: `frontend/vehicle-care-2/components/service-center/priority-vehicle-queue.tsx`
- ✅ Shows diagnosis details (component, severity, confidence)
- ✅ Real-time subscription to diagnosis cases
- ✅ Filters by severity 'critical' or 'high'

**Component**: `frontend/vehicle-care-2/components/service-center/telemetry-monitoring.tsx`
- ✅ Shows component-specific alerts
- ✅ Anomaly markers on chart

---

## 🧪 Testing

### Test Script
**Location**: `tests/test_step5_diagnosis_agent.py`

**Usage**:
```bash
cd /Users/swaroopthakare/hackthon/navigo/NaviGo
python3 tests/test_step5_diagnosis_agent.py
```

**What It Tests**:
1. ✅ Complete flow: Telemetry → Anomaly Detection → Diagnosis
2. ✅ Manual trigger: Direct diagnosis agent trigger (optional)

### Test Scenarios

#### Scenario 1: Complete Flow
**Input**: Telemetry with critical anomaly (high engine temp + DTC codes)
**Expected Flow**:
1. `ingest_telemetry` → Stores in Firestore
2. `telemetry_firestore_trigger` → Publishes to `navigo-telemetry`
3. `data_analysis_agent` → Detects anomaly → Publishes to `navigo-anomaly-detected`
4. `master_orchestrator` → Routes based on confidence
5. `diagnosis_agent` → Diagnoses component → Publishes to `navigo-diagnosis-complete`

**Verification**:
- Check Firestore `diagnosis_cases` collection
- Check Firestore `pipeline_states` collection
- Check Cloud Functions logs: `diagnosis-agent`
- Check Pub/Sub topic: `navigo-diagnosis-complete`

#### Scenario 2: Component Mapping
**Test Cases**:
- `thermal_overheat` → `engine_coolant_system`
- `oil_overheat` → `engine_oil_system`
- `battery_degradation` → `battery`
- `rpm_spike` → `engine`
- `dtc_fault` → Component based on DTC code

**Verification**:
- Check `diagnosis_cases` collection for correct component mapping

---

## 🔍 Manual Verification Steps

### 1. Check Firestore Collections

```bash
# Check diagnosis_cases collection
gcloud firestore documents list --collection-id=diagnosis_cases --project=navigo-27206

# Check specific diagnosis case
gcloud firestore documents get diagnosis_cases/{diagnosis_id} --project=navigo-27206
```

**Expected Fields**:
- `diagnosis_id`: Unique identifier
- `case_id`: Reference to anomaly case
- `vehicle_id`: Vehicle identifier
- `component`: Component name (e.g., "engine_coolant_system")
- `failure_probability`: 0.0 - 1.0
- `estimated_rul_days`: Positive integer
- `severity`: "Low" | "Medium" | "High"
- `confidence`: 0.0 - 1.0
- `status`: "active"

### 2. Check Cloud Functions Logs

```bash
# Diagnosis agent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=diagnosis-agent" --project=navigo-27206 --limit=20

# Check for Gemini LLM calls
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=diagnosis-agent AND jsonPayload.message=~'Gemini'" --project=navigo-27206 --limit=10
```

### 3. Check Pub/Sub Topics

```bash
# Check navigo-diagnosis-complete topic
gcloud pubsub topics describe navigo-diagnosis-complete --project=navigo-27206

# Check subscription
gcloud pubsub subscriptions list --project=navigo-27206 | grep diagnosis
```

### 4. Check Frontend

1. **Customer Dashboard** (`/`):
   - AI Predictions should show diagnosis results
   - Component name should be displayed
   - RUL should be shown in days
   - Severity should be color-coded

2. **Service Center Dashboard** (`/service-center`):
   - Priority Queue should show diagnosis details
   - Component and severity should be visible
   - Confidence should be displayed

---

## 🚀 Deployment

### Deploy Diagnosis Agent

```bash
cd backend/functions/diagnosis_agent

gcloud functions deploy diagnosis-agent \
  --gen2 \
  --runtime=python311 \
  --region=us-central1 \
  --source=. \
  --entry-point=diagnosis_agent \
  --trigger-topic=navigo-anomaly-detected \
  --project=navigo-27206 \
  --service-account=navigo-functions@navigo-27206.iam.gserviceaccount.com \
  --max-instances=10 \
  --timeout=540s \
  --memory=512MB
```

### Verify Deployment

```bash
# Check function exists
gcloud functions describe diagnosis-agent --gen2 --region=us-central1 --project=navigo-27206

# Check trigger configuration
gcloud functions describe diagnosis-agent --gen2 --region=us-central1 --project=navigo-27206 --format="value(eventTrigger)"
```

### Required Permissions

The service account needs:
- ✅ Firestore: Read/Write access
- ✅ Pub/Sub: Publish/Subscribe
- ✅ BigQuery: Write access
- ✅ Vertex AI: Use Gemini models

---

## 📊 Component Mapping

The diagnosis agent maps anomaly types to components:

| Anomaly Type | Component |
|--------------|-----------|
| `thermal_overheat` | `engine_coolant_system` |
| `oil_overheat` | `engine_oil_system` |
| `battery_degradation` | `battery` |
| `low_charge` | `battery` |
| `rpm_spike` | `engine` |
| `rpm_stall` | `engine` |
| `dtc_fault` | Based on DTC code (P0xxx = engine, etc.) |
| `speed_anomaly` | `transmission` or `brake_system` |
| `gps_anomaly` | `gps_system` |

---

## 📈 RUL Calculation

The diagnosis agent calculates RUL based on severity:

| Severity Score | RUL Range | Example |
|----------------|-----------|---------|
| > 0.8 (Critical) | 1-7 days | 3 days |
| 0.7-0.8 (Serious) | 7-30 days | 15 days |
| 0.4-0.6 (Moderate) | 30-90 days | 60 days |
| < 0.4 (Low) | 90-180 days | 120 days |

---

## ✅ Summary

| Component | Status | Notes |
|-----------|--------|-------|
| **Backend Function** | ✅ Configured | `diagnosis_agent/main.py` |
| **Pub/Sub Trigger** | ✅ Configured | Subscribes to `navigo-anomaly-detected` |
| **LLM Integration** | ✅ Configured | Gemini 2.5 Flash |
| **Component Mapping** | ✅ Implemented | Maps anomaly types to components |
| **RUL Calculation** | ✅ Implemented | Based on severity score |
| **Confidence Fields** | ✅ Added | For orchestrator routing |
| **Frontend Integration** | ✅ Working | Real-time subscription |
| **Test Script** | ✅ Created | `tests/test_step5_diagnosis_agent.py` |
| **Manual Trigger** | ✅ Available | Via `trigger_agent` endpoint |

**All components are configured and ready for testing!**

---

## 📝 Next Steps

1. **Deploy Function** (if not already deployed):
   - Deploy `diagnosis-agent` with Pub/Sub trigger
   - Verify trigger is connected to `navigo-anomaly-detected` topic

2. **Test Complete Flow**:
   - Upload telemetry with anomaly
   - Verify diagnosis is created in Firestore
   - Check frontend displays diagnosis results

3. **Monitor Logs**:
   - Watch Cloud Functions logs for Gemini LLM calls
   - Verify component mapping is correct
   - Check RUL calculations

4. **Frontend Verification**:
   - Check Customer Dashboard shows diagnosis
   - Verify Service Center shows component and RUL
   - Test real-time updates

---

**Last Updated**: 2025-12-17
**Status**: ✅ Configured & Enhanced | Ready for Testing


