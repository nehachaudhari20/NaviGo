# NaviGo - Complete Implementation Architecture

## 🎯 Overview

Event-driven predictive maintenance system using:
- **Google Cloud Functions** (serverless)
- **Pub/Sub** (event messaging)
- **Firestore** (operational database)
- **BigQuery** (analytics database)
- **Gemini 2.5 Flash** (LLM for all agents)

---

## 📊 Complete System Flow

```
Vehicle Data → HTTP Endpoint → Firestore → Pub/Sub Trigger → 
Data Analysis → Master Orchestrator → Agent Pipeline → 
Firestore + BigQuery Storage
```

---

## 🗂️ Firestore Collections Structure

### 1. `telemetry_events`
**Purpose**: Raw vehicle telemetry data
```json
{
  "event_id": "evt_1234567890",
  "vehicle_id": "MH-07-AB-1234",
  "timestamp_utc": "2024-12-11T10:30:45.123Z",
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
  "dtc_codes": ["P0301"],
  "created_at": "2024-12-11T10:30:45.123Z"
}
```

### 2. `anomaly_cases`
**Purpose**: Detected anomalies from Data Analysis Agent
```json
{
  "case_id": "case_1234567890",
  "vehicle_id": "MH-07-AB-1234",
  "anomaly_detected": true,
  "anomaly_type": "thermal_overheat",
  "severity_score": 0.75,
  "telemetry_window": [...],
  "created_at": "2024-12-11T10:31:00.000Z",
  "status": "pending_diagnosis"
}
```

### 3. `diagnosis_results`
**Purpose**: Diagnosis Agent outputs
```json
{
  "case_id": "case_1234567890",
  "vehicle_id": "MH-07-AB-1234",
  "component": "engine_coolant_system",
  "failure_probability": 0.85,
  "estimated_rul_days": 15,
  "severity": "High",
  "context_window": [...],
  "created_at": "2024-12-11T10:31:30.000Z",
  "status": "pending_rca"
}
```

### 4. `rca_results`
**Purpose**: RCA Agent outputs
```json
{
  "case_id": "case_1234567890",
  "vehicle_id": "MH-07-AB-1234",
  "root_cause": "Coolant pump failure causing overheating",
  "confidence": 0.92,
  "recommended_action": "Replace coolant pump and flush system",
  "capa_type": "Corrective",
  "created_at": "2024-12-11T10:32:00.000Z",
  "status": "pending_scheduling"
}
```

### 5. `scheduling_results`
**Purpose**: Scheduling Agent outputs
```json
{
  "case_id": "case_1234567890",
  "vehicle_id": "MH-07-AB-1234",
  "best_slot": "2024-12-15T10:00:00Z",
  "service_center": "SC_Mumbai_001",
  "slot_type": "urgent",
  "fallback_slots": ["2024-12-15T14:00:00Z", "2024-12-16T10:00:00Z"],
  "created_at": "2024-12-11T10:32:30.000Z",
  "status": "pending_engagement"
}
```

### 6. `engagement_results`
**Purpose**: Engagement Agent outputs
```json
{
  "case_id": "case_1234567890",
  "vehicle_id": "MH-07-AB-1234",
  "customer_decision": "confirmed",
  "booking_id": "booking_1234567890",
  "transcript": "AI: Hello, we detected... Customer: Yes, I can come...",
  "created_at": "2024-12-11T10:33:00.000Z",
  "status": "pending_service"
}
```

### 7. `feedback_results`
**Purpose**: Feedback Agent outputs
```json
{
  "case_id": "case_1234567890",
  "vehicle_id": "MH-07-AB-1234",
  "booking_id": "booking_1234567890",
  "cei_score": 4.2,
  "validation_label": "Correct",
  "recommended_retrain": false,
  "created_at": "2024-12-11T10:40:00.000Z",
  "status": "completed"
}
```

### 8. `manufacturing_insights`
**Purpose**: Manufacturing Agent outputs
```json
{
  "case_id": "case_1234567890",
  "vehicle_id": "MH-07-AB-1234",
  "issue": "Coolant pump failure",
  "capa_recommendation": "Review coolant pump supplier quality standards",
  "severity": "High",
  "recurrence_cluster_size": 15,
  "created_at": "2024-12-11T10:41:00.000Z"
}
```

### 9. `human_reviews`
**Purpose**: Cases requiring human review (confidence < 85%)
```json
{
  "case_id": "case_1234567890",
  "vehicle_id": "MH-07-AB-1234",
  "confidence_score": 0.72,
  "current_stage": "diagnosis",
  "review_status": "pending",
  "reviewer_id": null,
  "review_notes": null,
  "created_at": "2024-12-11T10:31:30.000Z"
}
```

### 10. `pipeline_states`
**Purpose**: Track complete pipeline state for each case
```json
{
  "case_id": "case_1234567890",
  "vehicle_id": "MH-07-AB-1234",
  "current_stage": "engagement",
  "stages_completed": ["data_analysis", "diagnosis", "rca", "scheduling"],
  "stages_pending": ["engagement", "feedback", "manufacturing"],
  "confidence_score": 0.92,
  "status": "in_progress",
  "created_at": "2024-12-11T10:31:00.000Z",
  "updated_at": "2024-12-11T10:33:00.000Z"
}
```

---

## 📨 Pub/Sub Topics Structure

### Topic Naming Convention
All topics follow pattern: `navigo-{event-type}`

### Topics List:

1. **`navigo-telemetry-ingested`**
   - Triggered: When telemetry stored in Firestore
   - Subscriber: Data Analysis Agent
   - Message Format:
   ```json
   {
     "event_id": "evt_1234567890",
     "vehicle_id": "MH-07-AB-1234",
     "timestamp": "2024-12-11T10:30:45.123Z"
   }
   ```

2. **`navigo-anomaly-detected`**
   - Triggered: When anomaly detected by Data Analysis Agent
   - Subscriber: Master Orchestrator
   - Message Format:
   ```json
   {
     "case_id": "case_1234567890",
     "vehicle_id": "MH-07-AB-1234",
     "anomaly_type": "thermal_overheat",
     "severity_score": 0.75
   }
   ```

3. **`navigo-diagnosis-complete`**
   - Triggered: When Diagnosis Agent completes
   - Subscriber: Master Orchestrator
   - Message Format:
   ```json
   {
     "case_id": "case_1234567890",
     "vehicle_id": "MH-07-AB-1234",
     "component": "engine_coolant_system",
     "failure_probability": 0.85,
     "confidence": 0.85
   }
   ```

4. **`navigo-rca-complete`**
   - Triggered: When RCA Agent completes
   - Subscriber: Master Orchestrator
   - Message Format:
   ```json
   {
     "case_id": "case_1234567890",
     "vehicle_id": "MH-07-AB-1234",
     "root_cause": "...",
     "confidence": 0.92
   }
   ```

5. **`navigo-scheduling-complete`**
   - Triggered: When Scheduling Agent completes
   - Subscriber: Master Orchestrator
   - Message Format:
   ```json
   {
     "case_id": "case_1234567890",
     "vehicle_id": "MH-07-AB-1234",
     "best_slot": "2024-12-15T10:00:00Z",
     "service_center": "SC_Mumbai_001"
   }
   ```

6. **`navigo-engagement-complete`**
   - Triggered: When Engagement Agent completes
   - Subscriber: Master Orchestrator
   - Message Format:
   ```json
   {
     "case_id": "case_1234567890",
     "vehicle_id": "MH-07-AB-1234",
     "customer_decision": "confirmed",
     "booking_id": "booking_1234567890"
   }
   ```

7. **`navigo-feedback-complete`**
   - Triggered: When Feedback Agent completes
   - Subscriber: Master Orchestrator
   - Message Format:
   ```json
   {
     "case_id": "case_1234567890",
     "vehicle_id": "MH-07-AB-1234",
     "cei_score": 4.2,
     "validation_label": "Correct"
   }
   ```

8. **`navigo-manufacturing-complete`**
   - Triggered: When Manufacturing Agent completes
   - Subscriber: None (end of pipeline)
   - Message Format:
   ```json
   {
     "case_id": "case_1234567890",
     "vehicle_id": "MH-07-AB-1234",
     "capa_recommendation": "..."
   }
   ```

9. **`navigo-human-review-required`**
   - Triggered: When confidence < 85%
   - Subscriber: None (manual review)
   - Message Format:
   ```json
   {
     "case_id": "case_1234567890",
     "vehicle_id": "MH-07-AB-1234",
     "confidence_score": 0.72,
     "current_stage": "diagnosis"
   }
   ```

---

## ☁️ Cloud Functions Architecture

### Function 1: `ingest_telemetry` (HTTP Trigger)
**Path**: `functions/ingest_telemetry/main.py`
**Trigger**: HTTP POST `/ingest`
**Purpose**: Receive vehicle telemetry data

**Flow**:
1. Receive HTTP POST with `TelematicsEvent` data
2. Validate against Pydantic schema
3. Generate `event_id` if not provided
4. Write to Firestore `telemetry_events` collection
5. Return success response

**Code Structure**:
```python
# functions/ingest_telemetry/main.py
from flask import Request
from google.cloud import firestore
from agents.data_analysis.schemas import TelematicsEvent
import uuid
from datetime import datetime

def ingest_telemetry(request: Request):
    # 1. Parse and validate
    data = request.get_json()
    event = TelematicsEvent(**data)
    
    # 2. Generate event_id if missing
    if not event.event_id:
        event.event_id = f"evt_{uuid.uuid4().hex[:10]}"
    
    # 3. Write to Firestore
    db = firestore.Client()
    doc_ref = db.collection("telemetry_events").document(event.event_id)
    doc_ref.set(event.dict())
    
    # 4. Return response
    return {"status": "success", "event_id": event.event_id}
```

---

### Function 2: `telemetry_firestore_trigger` (Firestore Trigger)
**Path**: `functions/telemetry_firestore_trigger/main.py`
**Trigger**: Firestore `onCreate` on `telemetry_events`
**Purpose**: Trigger Pub/Sub when telemetry stored

**Flow**:
1. Firestore onCreate event
2. Extract telemetry data
3. Publish to `navigo-telemetry-ingested` Pub/Sub topic
4. Sync to BigQuery

**Code Structure**:
```python
# functions/telemetry_firestore_trigger/main.py
from google.cloud import pubsub_v1
from google.cloud import bigquery
from google.events.cloud.firestore import DocumentEventData
import json

def telemetry_firestore_trigger(event: DocumentEventData):
    # 1. Extract data
    data = event.data.to_dict()
    
    # 2. Publish to Pub/Sub
    publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path("navigo-27206", "navigo-telemetry-ingested")
    
    message_data = json.dumps({
        "event_id": data["event_id"],
        "vehicle_id": data["vehicle_id"],
        "timestamp": data["timestamp_utc"]
    }).encode("utf-8")
    
    publisher.publish(topic_path, message_data)
    
    # 3. Sync to BigQuery
    client = bigquery.Client()
    table = client.get_table("navigo-27206.telemetry.telemetry_events")
    errors = client.insert_rows_json(table, [data])
    
    return {"status": "success"}
```

---

### Function 3: `data_analysis_agent` (Pub/Sub Trigger)
**Path**: `functions/agents/data_analysis/main.py`
**Trigger**: Pub/Sub `navigo-telemetry-ingested`
**Purpose**: Detect anomalies in telemetry data

**Flow**:
1. Receive Pub/Sub message
2. Fetch telemetry window from Firestore
3. Run anomaly detection (existing logic)
4. If anomaly detected:
   - Create `case_id`
   - Store in `anomaly_cases` collection
   - Publish to `navigo-anomaly-detected` topic
5. Store in BigQuery

**Code Structure**:
```python
# functions/agents/data_analysis/main.py
from google.cloud import pubsub_v1, firestore, bigquery
from agents.data_analysis.agent import DataAnalysisAgent
from agents.data_analysis.schemas import AnomalyOutput
import json
import uuid

def data_analysis_agent(event, context):
    # 1. Parse Pub/Sub message
    message_data = json.loads(event.data.decode("utf-8"))
    event_id = message_data["event_id"]
    vehicle_id = message_data["vehicle_id"]
    
    # 2. Fetch telemetry window from Firestore
    db = firestore.Client()
    telemetry_ref = db.collection("telemetry_events")
    query = telemetry_ref.where("vehicle_id", "==", vehicle_id)\
                         .order_by("timestamp_utc", direction=firestore.Query.DESCENDING)\
                         .limit(10)
    
    events = [TelematicsEvent(**doc.to_dict()) for doc in query.stream()]
    
    # 3. Run anomaly detection
    agent = DataAnalysisAgent()
    anomaly_output = agent.detect_anomaly(events)
    
    # 4. If anomaly detected
    if anomaly_output.anomaly_detected:
        case_id = f"case_{uuid.uuid4().hex[:10]}"
        
        # Store in Firestore
        case_data = {
            **anomaly_output.dict(),
            "case_id": case_id,
            "status": "pending_diagnosis",
            "created_at": firestore.SERVER_TIMESTAMP
        }
        db.collection("anomaly_cases").document(case_id).set(case_data)
        
        # Store in BigQuery
        bq_client = bigquery.Client()
        table = bq_client.get_table("navigo-27206.telemetry.anomaly_cases")
        bq_client.insert_rows_json(table, [case_data])
        
        # Publish to Pub/Sub
        publisher = pubsub_v1.PublisherClient()
        topic_path = publisher.topic_path("navigo-27206", "navigo-anomaly-detected")
        message = json.dumps({
            "case_id": case_id,
            "vehicle_id": vehicle_id,
            "anomaly_type": anomaly_output.anomaly_type,
            "severity_score": anomaly_output.severity_score
        }).encode("utf-8")
        publisher.publish(topic_path, message)
    
    return {"status": "success"}
```

---

### Function 4: `master_orchestrator` (Pub/Sub Trigger)
**Path**: `functions/agents/master/orchestrator/main.py`
**Trigger**: Multiple Pub/Sub topics (all agent outputs)
**Purpose**: Route events, apply confidence checks, manage pipeline

**Flow**:
1. Receive Pub/Sub message from any agent
2. Determine current stage
3. Apply confidence check (85% threshold)
4. If confidence < 85%:
   - Create entry in `human_reviews` collection
   - Publish to `navigo-human-review-required` topic
   - Halt pipeline
5. If confidence >= 85%:
   - Determine next agent
   - Publish to next agent's input topic
   - Update `pipeline_states` collection

**Code Structure**:
```python
# functions/agents/master/orchestrator/main.py
from google.cloud import pubsub_v1, firestore
import json

CONFIDENCE_THRESHOLD = 0.85

def master_orchestrator(event, context):
    # 1. Parse message
    message_data = json.loads(event.data.decode("utf-8"))
    case_id = message_data["case_id"]
    vehicle_id = message_data["vehicle_id"]
    
    # 2. Determine stage and confidence
    topic_name = event.attributes.get("topic", "")
    stage = determine_stage(topic_name)
    confidence = calculate_confidence(message_data, stage)
    
    # 3. Update pipeline state
    db = firestore.Client()
    pipeline_ref = db.collection("pipeline_states").document(case_id)
    pipeline_data = pipeline_ref.get().to_dict() if pipeline_ref.get().exists else {}
    
    # 4. Confidence check
    if confidence < CONFIDENCE_THRESHOLD:
        # Human review required
        db.collection("human_reviews").document(case_id).set({
            "case_id": case_id,
            "vehicle_id": vehicle_id,
            "confidence_score": confidence,
            "current_stage": stage,
            "review_status": "pending",
            "created_at": firestore.SERVER_TIMESTAMP
        })
        
        # Publish to human review topic
        publisher = pubsub_v1.PublisherClient()
        topic_path = publisher.topic_path("navigo-27206", "navigo-human-review-required")
        publisher.publish(topic_path, json.dumps(message_data).encode("utf-8"))
        
        # Update pipeline state
        pipeline_ref.set({
            "case_id": case_id,
            "vehicle_id": vehicle_id,
            "current_stage": stage,
            "status": "halted_human_review",
            "confidence_score": confidence,
            "updated_at": firestore.SERVER_TIMESTAMP
        }, merge=True)
        
        return {"status": "halted", "reason": "low_confidence"}
    
    # 5. Route to next agent
    next_stage = get_next_stage(stage)
    if next_stage:
        next_topic = get_topic_for_stage(next_stage)
        
        publisher = pubsub_v1.PublisherClient()
        topic_path = publisher.topic_path("navigo-27206", next_topic)
        publisher.publish(topic_path, json.dumps(message_data).encode("utf-8"))
        
        # Update pipeline state
        pipeline_ref.set({
            "case_id": case_id,
            "vehicle_id": vehicle_id,
            "current_stage": next_stage,
            "status": "in_progress",
            "confidence_score": confidence,
            "stages_completed": firestore.ArrayUnion([stage]),
            "updated_at": firestore.SERVER_TIMESTAMP
        }, merge=True)
    
    return {"status": "routed", "next_stage": next_stage}
```

---

### Function 5: `diagnosis_agent` (Pub/Sub Trigger)
**Path**: `functions/agents/diagnosis/main.py`
**Trigger**: Pub/Sub `navigo-diagnosis-request` (published by orchestrator)
**Purpose**: Diagnose component failure using Gemini 2.5 Flash

**Flow**:
1. Receive Pub/Sub message
2. Fetch anomaly case from Firestore
3. Use Gemini 2.5 Flash to analyze and generate diagnosis
4. Store in `diagnosis_results` collection
5. Store in BigQuery
6. Publish to `navigo-diagnosis-complete` topic

**Code Structure**:
```python
# functions/agents/diagnosis/main.py
from google.cloud import pubsub_v1, firestore, bigquery
from google import generativeai as genai
from agents.diagnosis.schemas import DiagnosisInput, DiagnosisOutput
import json

genai.configure(api_key="YOUR_API_KEY")
model = genai.GenerativeModel("gemini-2.0-flash-exp")

def diagnosis_agent(event, context):
    # 1. Parse message
    message_data = json.loads(event.data.decode("utf-8"))
    case_id = message_data["case_id"]
    
    # 2. Fetch anomaly case
    db = firestore.Client()
    anomaly_doc = db.collection("anomaly_cases").document(case_id).get()
    anomaly_data = anomaly_doc.to_dict()
    
    # 3. Prepare input for Gemini
    prompt = f"""
    Analyze this vehicle anomaly and provide diagnosis:
    
    Vehicle ID: {anomaly_data['vehicle_id']}
    Anomaly Type: {anomaly_data['anomaly_type']}
    Severity Score: {anomaly_data['severity_score']}
    Telemetry Data: {json.dumps(anomaly_data['telemetry_window'][-5:], default=str)}
    
    Provide diagnosis in JSON format:
    {{
        "component": "component_name",
        "failure_probability": 0.0-1.0,
        "estimated_rul_days": number,
        "severity": "Low|Medium|High",
        "reasoning": "explanation"
    }}
    """
    
    # 4. Call Gemini
    response = model.generate_content(prompt)
    diagnosis_json = extract_json_from_response(response.text)
    
    # 5. Create DiagnosisOutput
    diagnosis_output = DiagnosisOutput(
        vehicle_id=anomaly_data["vehicle_id"],
        component=diagnosis_json["component"],
        failure_probability=diagnosis_json["failure_probability"],
        estimated_rul_days=diagnosis_json["estimated_rul_days"],
        severity=diagnosis_json["severity"],
        context_window=anomaly_data["telemetry_window"]
    )
    
    # 6. Store in Firestore
    diagnosis_data = {
        **diagnosis_output.dict(),
        "case_id": case_id,
        "status": "pending_rca",
        "created_at": firestore.SERVER_TIMESTAMP
    }
    db.collection("diagnosis_results").document(case_id).set(diagnosis_data)
    
    # 7. Store in BigQuery
    bq_client = bigquery.Client()
    table = bq_client.get_table("navigo-27206.telemetry.diagnosis_results")
    bq_client.insert_rows_json(table, [diagnosis_data])
    
    # 8. Publish to Pub/Sub
    publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path("navigo-27206", "navigo-diagnosis-complete")
    publisher.publish(topic_path, json.dumps({
        "case_id": case_id,
        "vehicle_id": diagnosis_output.vehicle_id,
        "component": diagnosis_output.component,
        "failure_probability": diagnosis_output.failure_probability,
        "confidence": diagnosis_output.failure_probability
    }).encode("utf-8"))
    
    return {"status": "success"}
```

---

### Function 6: `rca_agent` (Pub/Sub Trigger)
**Path**: `functions/agents/rca/main.py`
**Trigger**: Pub/Sub `navigo-rca-request`
**Purpose**: Root Cause Analysis using Gemini 2.5 Flash

**Flow**:
1. Receive Pub/Sub message
2. Fetch diagnosis result from Firestore
3. Use Gemini 2.5 Flash for RCA
4. Store in `rca_results` collection
5. Store in BigQuery
6. Publish to `navigo-rca-complete` topic

---

### Function 7: `scheduling_agent` (Pub/Sub Trigger)
**Path**: `functions/agents/scheduling/main.py`
**Trigger**: Pub/Sub `navigo-scheduling-request`
**Purpose**: Schedule service appointment using Gemini 2.5 Flash

**Flow**:
1. Receive Pub/Sub message
2. Fetch RCA result from Firestore
3. Use Gemini 2.5 Flash to optimize scheduling
4. Store in `scheduling_results` collection
5. Store in BigQuery
6. Publish to `navigo-scheduling-complete` topic

---

### Function 8: `engagement_agent` (Pub/Sub Trigger)
**Path**: `functions/agents/engagement/main.py`
**Trigger**: Pub/Sub `navigo-engagement-request`
**Purpose**: Generate customer engagement script using Gemini 2.5 Flash

**Flow**:
1. Receive Pub/Sub message
2. Fetch scheduling result from Firestore
3. Use Gemini 2.5 Flash to generate voice script
4. Simulate customer engagement (no actual calling yet)
5. Store in `engagement_results` collection
6. Store in BigQuery
7. Publish to `navigo-engagement-complete` topic

---

### Function 9: `feedback_agent` (Pub/Sub Trigger)
**Path**: `functions/agents/feedback/main.py`
**Trigger**: Pub/Sub `navigo-feedback-request`
**Purpose**: Process service feedback using Gemini 2.5 Flash

**Flow**:
1. Receive Pub/Sub message
2. Fetch engagement result from Firestore
3. Use Gemini 2.5 Flash to analyze feedback
4. Calculate CEI score
5. Store in `feedback_results` collection
6. Store in BigQuery
7. Publish to `navigo-feedback-complete` topic

---

### Function 10: `manufacturing_agent` (Pub/Sub Trigger)
**Path**: `functions/agents/manufacturing/main.py`
**Trigger**: Pub/Sub `navigo-manufacturing-request`
**Purpose**: Generate CAPA insights using Gemini 2.5 Flash

**Flow**:
1. Receive Pub/Sub message
2. Fetch feedback result from Firestore
3. Use Gemini 2.5 Flash to generate CAPA recommendations
4. Store in `manufacturing_insights` collection
5. Store in BigQuery
6. Publish to `navigo-manufacturing-complete` topic (end of pipeline)

---

## 🔄 Complete Event Flow

```
1. Vehicle sends telemetry → HTTP POST /ingest
2. ingest_telemetry function → Stores in Firestore
3. Firestore trigger → Publishes to navigo-telemetry-ingested
4. data_analysis_agent → Detects anomaly → Publishes to navigo-anomaly-detected
5. master_orchestrator → Checks confidence → Routes to diagnosis
6. diagnosis_agent → Uses Gemini → Publishes to navigo-diagnosis-complete
7. master_orchestrator → Routes to RCA
8. rca_agent → Uses Gemini → Publishes to navigo-rca-complete
9. master_orchestrator → Routes to scheduling
10. scheduling_agent → Uses Gemini → Publishes to navigo-scheduling-complete
11. master_orchestrator → Routes to engagement
12. engagement_agent → Uses Gemini → Publishes to navigo-engagement-complete
13. master_orchestrator → Routes to feedback
14. feedback_agent → Uses Gemini → Publishes to navigo-feedback-complete
15. master_orchestrator → Routes to manufacturing
16. manufacturing_agent → Uses Gemini → Publishes to navigo-manufacturing-complete
17. Pipeline complete → All data in Firestore + BigQuery
```

---

## 📋 Implementation Checklist

### Phase 1: Infrastructure Setup
- [ ] Create all Pub/Sub topics
- [ ] Create Firestore collections
- [ ] Create BigQuery datasets and tables
- [ ] Set up Cloud Functions environment

### Phase 2: Ingestion Layer
- [ ] Implement `ingest_telemetry` function
- [ ] Implement `telemetry_firestore_trigger` function
- [ ] Test end-to-end ingestion flow

### Phase 3: Data Analysis Agent
- [ ] Implement `data_analysis_agent` function
- [ ] Integrate existing anomaly detection logic
- [ ] Test anomaly detection and Pub/Sub publishing

### Phase 4: Master Orchestrator
- [ ] Implement `master_orchestrator` function
- [ ] Implement confidence check logic
- [ ] Implement routing logic
- [ ] Test routing and human review flow

### Phase 5: Agent Pipeline
- [ ] Implement `diagnosis_agent` with Gemini
- [ ] Implement `rca_agent` with Gemini
- [ ] Implement `scheduling_agent` with Gemini
- [ ] Implement `engagement_agent` with Gemini
- [ ] Implement `feedback_agent` with Gemini
- [ ] Implement `manufacturing_agent` with Gemini

### Phase 6: BigQuery Sync
- [ ] Implement BigQuery sync for all collections
- [ ] Test data consistency

### Phase 7: Testing
- [ ] End-to-end pipeline test
- [ ] Error handling tests
- [ ] Performance tests

---

## 🎯 Next Steps

1. **Start with Phase 1**: Set up all infrastructure (Pub/Sub topics, Firestore collections, BigQuery tables)
2. **Then Phase 2**: Implement ingestion layer
3. **Then Phase 3**: Implement Data Analysis Agent
4. **Then Phase 4**: Implement Master Orchestrator
5. **Then Phase 5**: Implement all remaining agents

Ready to start implementation? Let me know which phase you want to begin with!

