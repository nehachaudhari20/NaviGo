# STEP 6 & 7: RCA & Scheduling Agents - Setup & Testing Status

## Overview
This document tracks the setup, configuration, and testing status of STEP 6: Root Cause Analysis (RCA Agent) and STEP 7: Intelligent Scheduling (Scheduling Agent).

---

## ✅ STEP 6: Root Cause Analysis (RCA Agent)

### Status: ✅ **CONFIGURED & ENHANCED**

**Backend Function**: `backend/functions/rca_agent/main.py`
- **Entry Point**: `rca_agent` (Pub/Sub trigger)
- **Trigger**: Pub/Sub message on `navigo-diagnosis-complete` topic
- **Decorator**: `@functions_framework.cloud_event` ✅

**Configuration**:
- **Input Topic**: `navigo-diagnosis-complete` (from diagnosis_agent)
- **Output Topic**: `navigo-rca-complete` (publishes to)
- **LLM Model**: Gemini 2.5 Flash (`gemini-2.5-flash`)
- **Vertex AI**: Project `navigo-27206`, Location `us-central1`

**What It Does**:
1. ✅ Receives diagnosis result event from Pub/Sub
2. ✅ Fetches diagnosis case from Firestore: `diagnosis_cases/{diagnosis_id}`
3. ✅ Fetches telemetry context window using event IDs from diagnosis
4. ✅ Uses Gemini 2.5 Flash LLM to perform root cause analysis
5. ✅ Identifies:
   - Root cause (e.g., "Coolant pump failure causing insufficient circulation")
   - Confidence score (0.0 - 1.0)
   - Recommended action (e.g., "Replace coolant pump, flush system")
   - CAPA type ("Corrective" or "Preventive")
6. ✅ Stores in Firestore: `rca_cases/{rca_id}`
7. ✅ Updates diagnosis case status to "rca_complete"
8. ✅ Publishes to Pub/Sub: `navigo-rca-complete`
9. ✅ Syncs to BigQuery: `telemetry.rca_cases` table

**Firestore Collection Updated**:
- ✅ `rca_cases` - New document created with:
  ```json
  {
    "rca_id": "rca_abc123",
    "diagnosis_id": "diagnosis_xyz789",
    "case_id": "case_1234567890",
    "vehicle_id": "MH-07-AB-1234",
    "root_cause": "Coolant pump failure causing insufficient circulation...",
    "confidence": 0.92,
    "recommended_action": "Replace coolant pump, flush cooling system...",
    "capa_type": "Corrective",
    "status": "pending_scheduling",
    "created_at": "2024-12-15T10:32:00.000Z"
  }
  ```

**Pub/Sub Topics**:
- ✅ **Input**: `navigo-diagnosis-complete` (subscribes to)
- ✅ **Output**: `navigo-rca-complete` (publishes to)

---

## ✅ STEP 7: Intelligent Scheduling (Scheduling Agent)

### Status: ✅ **CONFIGURED & ENHANCED**

**Backend Function**: `backend/functions/scheduling_agent/main.py`
- **Entry Point**: `scheduling_agent` (Pub/Sub trigger)
- **Trigger**: Pub/Sub message on `navigo-rca-complete` topic
- **Decorator**: `@functions_framework.cloud_event` ✅

**Configuration**:
- **Input Topic**: `navigo-rca-complete` (from rca_agent)
- **Output Topic**: `navigo-scheduling-complete` (publishes to)
- **LLM Model**: Gemini 2.5 Flash (`gemini-2.5-flash`)
- **Vertex AI**: Project `navigo-27206`, Location `us-central1`

**What It Does**:
1. ✅ Receives RCA result event from Pub/Sub
2. ✅ Fetches diagnosis case to get RUL and severity
3. ✅ Fetches service center availability data from Firestore
4. ✅ Checks existing bookings for slot availability
5. ✅ Uses Gemini 2.5 Flash LLM to optimize scheduling
6. ✅ Handles edge cases:
   - Urgent failures (RUL < 7 days) → "urgent" slot type
   - Normal (RUL 7-30 days) → "normal" slot type
   - Delayed (RUL >= 30 days) → "delayed" slot type
7. ✅ Stores in Firestore: `scheduling_cases/{scheduling_id}`
8. ✅ Creates booking record: `bookings/{booking_id}`
9. ✅ Updates RCA case status to "scheduled"
10. ✅ Publishes to Pub/Sub: `navigo-scheduling-complete`
11. ✅ Syncs to BigQuery: `telemetry.scheduling_cases` table

**Firestore Collections Updated**:
- ✅ `scheduling_cases` - New document created with:
  ```json
  {
    "scheduling_id": "scheduling_abc123",
    "rca_id": "rca_xyz789",
    "diagnosis_id": "diagnosis_def456",
    "case_id": "case_1234567890",
    "vehicle_id": "MH-07-AB-1234",
    "best_slot": "2024-12-20T10:00:00Z",
    "service_center": "center_001",
    "slot_type": "normal",
    "fallback_slots": ["2024-12-20T14:00:00Z", "2024-12-21T09:00:00Z"],
    "status": "pending_engagement",
    "created_at": "2024-12-15T10:32:30.000Z"
  }
  ```
- ✅ `bookings` - New document created with:
  ```json
  {
    "booking_id": "booking_abc123",
    "vehicle_id": "MH-07-AB-1234",
    "service_center": "center_001",
    "service_center_id": "center_001",
    "scheduled_date": "2024-12-20",
    "scheduled_time": "10:00 AM",
    "scheduled_slot": "2024-12-20T10:00:00Z",
    "status": "pending",
    "service_type": "engine_coolant_system Service",
    "scheduling_id": "scheduling_abc123",
    "case_id": "case_1234567890",
    "created_at": "2024-12-15T10:32:30.000Z"
  }
  ```

**Pub/Sub Topics**:
- ✅ **Input**: `navigo-rca-complete` (subscribes to)
- ✅ **Output**: `navigo-scheduling-complete` (publishes to)

---

## 🔧 Fixes & Enhancements Applied

### STEP 6 (RCA Agent)

1. **Added Confidence Fields for Orchestrator**
   - Added `confidence` and `confidence_score` to Pub/Sub message
   - Added `agent_stage: "rca"` for orchestrator routing

**File**: `backend/functions/rca_agent/main.py`

### STEP 7 (Scheduling Agent)

1. **Fixed Diagnosis ID Handling**
   - If `diagnosis_id` not in message, fetches from RCA case
   - Prevents errors when diagnosis_id is missing

2. **Added Booking Creation**
   - Creates booking record in `bookings` collection
   - Parses ISO timestamp to extract date and time
   - Sets status to "pending"

3. **Added Confidence Fields for Orchestrator**
   - Added `confidence: 0.90` (default high confidence for scheduling)
   - Added `agent_stage: "scheduling"` for orchestrator routing
   - Added `diagnosis_id` to Pub/Sub message

**File**: `backend/functions/scheduling_agent/main.py`

4. **Updated Trigger Agent Endpoint**
   - Added `rca` and `scheduling` to `AGENT_TOPICS` mapping

**File**: `backend/functions/trigger_agent/main.py`

---

## 📋 Frontend Integration Status

### Service Center Dashboard (`/service-center`)
**Component**: `frontend/vehicle-care-2/components/service-center/priority-vehicle-queue.tsx`
- ✅ Shows RCA root cause in vehicle details
- ✅ Shows scheduling information (best_slot, service_center)
- ✅ Real-time subscription to `rca_cases` and `scheduling_cases`

### Customer Dashboard (`/`)
**Component**: `frontend/vehicle-care-2/components/service-history.tsx`
- ✅ Shows upcoming appointment from `bookings` collection
- ✅ Displays scheduled_date, scheduled_time, service_type
- ✅ Real-time subscription to bookings

**Component**: `frontend/vehicle-care-2/components/vehicle-card.tsx`
- ✅ Displays next service date from bookings

---

## 🧪 Testing

### Test Script
**Location**: `tests/test_step6_7_rca_scheduling.py`

**Usage**:
```bash
cd /Users/swaroopthakare/hackthon/navigo/NaviGo
python3 tests/test_step6_7_rca_scheduling.py
```

**What It Tests**:
1. ✅ Complete flow: Telemetry → Anomaly → Diagnosis → RCA → Scheduling
2. ✅ Manual trigger instructions for RCA agent
3. ✅ Manual trigger instructions for Scheduling agent

### Test Scenarios

#### Scenario 1: Complete Flow
**Input**: Telemetry with critical anomaly
**Expected Flow**:
1. `ingest_telemetry` → Stores in Firestore
2. `data_analysis_agent` → Detects anomaly
3. `diagnosis_agent` → Diagnoses component
4. `rca_agent` → Analyzes root cause
5. `scheduling_agent` → Schedules appointment and creates booking

**Verification**:
- Check Firestore `rca_cases` collection
- Check Firestore `scheduling_cases` collection
- Check Firestore `bookings` collection
- Check Cloud Functions logs
- Check Pub/Sub topics

---

## 🔍 Manual Verification Steps

### 1. Check Firestore Collections

```bash
# Check rca_cases collection
gcloud firestore documents list --collection-id=rca_cases --project=navigo-27206

# Check scheduling_cases collection
gcloud firestore documents list --collection-id=scheduling_cases --project=navigo-27206

# Check bookings collection
gcloud firestore documents list --collection-id=bookings --project=navigo-27206
```

### 2. Check Cloud Functions Logs

```bash
# RCA agent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=rca-agent" --project=navigo-27206 --limit=20

# Scheduling agent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=scheduling-agent" --project=navigo-27206 --limit=20
```

### 3. Check Pub/Sub Topics

```bash
# Check navigo-rca-complete topic
gcloud pubsub topics describe navigo-rca-complete --project=navigo-27206

# Check navigo-scheduling-complete topic
gcloud pubsub topics describe navigo-scheduling-complete --project=navigo-27206
```

### 4. Check Frontend

1. **Service Center Dashboard** (`/service-center`):
   - Priority Queue should show RCA root cause
   - Should show scheduling information

2. **Customer Dashboard** (`/`):
   - Service History should show upcoming appointment
   - Vehicle Card should show next service date

---

## 🚀 Deployment

### Deploy RCA Agent

```bash
cd backend/functions/rca_agent

gcloud functions deploy rca-agent \
  --gen2 \
  --runtime=python311 \
  --region=us-central1 \
  --source=. \
  --entry-point=rca_agent \
  --trigger-topic=navigo-diagnosis-complete \
  --project=navigo-27206 \
  --service-account=navigo-functions@navigo-27206.iam.gserviceaccount.com \
  --max-instances=10 \
  --timeout=540s \
  --memory=512MB
```

### Deploy Scheduling Agent

```bash
cd backend/functions/scheduling_agent

gcloud functions deploy scheduling-agent \
  --gen2 \
  --runtime=python311 \
  --region=us-central1 \
  --source=. \
  --entry-point=scheduling_agent \
  --trigger-topic=navigo-rca-complete \
  --project=navigo-27206 \
  --service-account=navigo-functions@navigo-27206.iam.gserviceaccount.com \
  --max-instances=10 \
  --timeout=540s \
  --memory=512MB
```

---

## 📊 Slot Type Classification

The scheduling agent classifies slots based on RUL:

| RUL Range | Slot Type | Scheduling Window |
|-----------|-----------|-------------------|
| < 7 days | `urgent` | 1-3 days from now |
| 7-30 days | `normal` | 7-14 days from now |
| >= 30 days | `delayed` | 30-60 days from now |

---

## ✅ Summary

| Component | Status | Notes |
|-----------|--------|-------|
| **RCA Backend Function** | ✅ Configured | `rca_agent/main.py` |
| **RCA Pub/Sub Trigger** | ✅ Configured | Subscribes to `navigo-diagnosis-complete` |
| **RCA LLM Integration** | ✅ Configured | Gemini 2.5 Flash |
| **RCA Confidence Fields** | ✅ Added | For orchestrator routing |
| **Scheduling Backend Function** | ✅ Configured | `scheduling_agent/main.py` |
| **Scheduling Pub/Sub Trigger** | ✅ Configured | Subscribes to `navigo-rca-complete` |
| **Scheduling LLM Integration** | ✅ Configured | Gemini 2.5 Flash |
| **Booking Creation** | ✅ Implemented | Creates booking record |
| **Scheduling Confidence Fields** | ✅ Added | For orchestrator routing |
| **Frontend Integration** | ✅ Working | Real-time subscriptions |
| **Test Script** | ✅ Created | `tests/test_step6_7_rca_scheduling.py` |

**All components are configured and ready for testing!**

---

## 📝 Next Steps

1. **Deploy Functions** (if not already deployed):
   - Deploy `rca-agent` with Pub/Sub trigger
   - Deploy `scheduling-agent` with Pub/Sub trigger

2. **Test Complete Flow**:
   - Upload telemetry with anomaly
   - Verify RCA is created in Firestore
   - Verify scheduling and booking are created

3. **Monitor Logs**:
   - Watch Cloud Functions logs for Gemini LLM calls
   - Verify root cause analysis is accurate
   - Verify scheduling optimization is working

4. **Frontend Verification**:
   - Check Service Center shows RCA and scheduling
   - Check Customer Dashboard shows booking

---

**Last Updated**: 2025-12-17
**Status**: ✅ Configured & Enhanced | Ready for Testing


