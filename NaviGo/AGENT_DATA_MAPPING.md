# Agent Data Mapping - Quick Reference

## Which Agent Shows Data Where?

### Master Agent

| Data Display Location | What Data | Input Source | Database |
|----------------------|-----------|--------------|----------|
| `/service-center/agentic-ai` | Master Agent status, Worker Agent status | Pub/Sub topics, Agent health | Firestore (real-time), Cloud SQL (logs) |
| `/service-center/agentic-ai` | Real-time activity log | All agent activities | Cloud SQL (`agent_activities`) |
| `/service-center/agentic-ai` | System health metrics | Agent status, UEBA alerts | Firestore, Cloud SQL |

**Input:**
- All Pub/Sub messages
- Agent status from Firestore
- UEBA security alerts

**Output:**
- Task assignments to worker agents
- Orchestration commands
- System status updates

---

### Data Analysis Agent

| Data Display Location | What Data | Input Source | Database |
|----------------------|-----------|--------------|----------|
| `/service-center/predictive-maintenance` | Anomaly alerts panel | Pub/Sub (`anomalies-detected`) | Cloud SQL (`anomalies`) |
| `/service-center/predictive-maintenance` | Health scores | Calculated from telematics | Firestore (real-time), Cloud SQL |
| `/service-center` | Real-time telematics display | Pub/Sub (`telematics-raw`) | Firestore (`/vehicles/{id}/telematics/current`) |
| `/service-center` | Health indicators | Health scores | Firestore (`/vehicles/{id}/health/current`) |
| `/service-center/agentic-ai` | Agent status, tasks completed | Agent activity | Cloud SQL (`agent_activities`) |

**Input:**
- Telematics data from Pub/Sub (`telematics-raw`)
- Historical data from BigQuery
- Vehicle metadata from Cloud SQL

**Processing:**
- Vertex AI: Anomaly Detection Model
- Feature engineering
- Health score calculation

**Output:**
- Anomalies → Pub/Sub (`anomalies-detected`)
- Health scores → Firestore + Cloud SQL
- Demand forecasts → Cloud SQL

---

### Diagnosis Agent

| Data Display Location | What Data | Input Source | Database |
|----------------------|-----------|--------------|----------|
| `/service-center/predictive-maintenance` | **Predicted Issues Cards** | Pub/Sub (`predictions-generated`) | Cloud SQL (`predictions`) |
| `/service-center/predictive-maintenance` | **RCA Reasoning Panel** | ChatGPT API analysis | Cloud SQL (`predictions.rca_analysis`) |
| `/service-center/predictive-maintenance` | **Confidence Score Badge** | Calculated confidence | Cloud SQL (`predictions.confidence_score`) |
| `/service-center/predictive-maintenance` | **Confidence Breakdown** | Confidence calculation | Cloud SQL (`predictions.confidence_breakdown`) |
| `/service-center` | **Priority Vehicle Queue** | Predictions sorted by priority | Cloud SQL (`predictions`) |
| `/service-center` | **Human Review Queue** | Low confidence predictions (<85%) | Cloud SQL (`predictions` WHERE confidence < 85) |
| `/service-center/agentic-ai` | Agent status, predictions generated | Agent activity | Cloud SQL (`agent_activities`) |

**Input:**
- Anomalies from Pub/Sub (`anomalies-detected`)
- Health scores from Firestore
- Historical predictions from Cloud SQL
- Vehicle service history from Cloud SQL

**Processing:**
- **Vertex AI**: Failure Prediction Model
- **ChatGPT API**: RCA Analysis (gpt-4, temp=0.3)
- **ChatGPT API**: CAPA Recommendations (gpt-4, temp=0.3)
- Confidence calculation (4 factors)

**Output:**
- Predictions → Pub/Sub (`predictions-generated`)
- Low confidence → Pub/Sub (`confidence-check-required`)
- High confidence → Pub/Sub (`autonomous-action-triggered`)

**Confidence Calculation:**
```python
confidence = (
    prediction_confidence * 0.4 +
    historical_accuracy * 0.3 +
    data_quality * 0.2 +
    pattern_match * 0.1
)
```

---

### Scheduling Agent

| Data Display Location | What Data | Input Source | Database |
|----------------------|-----------|--------------|----------|
| `/service-center/autonomous-scheduling` | **AI-Scheduled Appointments** | Pub/Sub (`autonomous-action-triggered`) | Cloud SQL (`service_appointments`) |
| `/service-center/autonomous-scheduling` | **Capacity vs Demand Chart** | Appointment data, capacity | Cloud SQL (`service_appointments`, `service_centers`) |
| `/service-center/autonomous-scheduling` | **AI Recommendations** | Optimization results | Cloud SQL |
| `/service-center` | **Active Appointments** | Scheduled appointments | Cloud SQL (`service_appointments`) |
| `/service-center/agentic-ai` | Agent status, appointments scheduled | Agent activity | Cloud SQL (`agent_activities`) |

**Input:**
- Predictions requiring service (from Pub/Sub)
- Service center capacity (from Cloud SQL)
- Technician availability (from Cloud SQL)
- Customer preferences (from Cloud SQL)

**Processing:**
- **Vertex AI**: Scheduling Optimization Model (OR-Tools)
- Constraint solving
- Capacity optimization

**Output:**
- Scheduled appointments → Cloud SQL
- Appointment notifications → Pub/Sub (`appointment-scheduled`)

---

### Customer Engagement Agent

| Data Display Location | What Data | Input Source | Database |
|----------------------|-----------|--------------|----------|
| `/service-center/customer-engagement` | **Voice Conversation Logs** | Voice call transcripts | Cloud SQL (`voice_calls`) |
| `/service-center/customer-engagement` | **Conversation Transcripts** | Speech-to-text + ChatGPT | Cloud SQL (`voice_calls.transcript`) |
| `/service-center/customer-engagement` | **Engagement Metrics** | Call outcomes | Cloud SQL (aggregated) |
| `/service-center/customer-engagement` | **Manual Intervention Queue** | Failed/critical calls | Cloud SQL (`manual_interventions`) |
| `/service-center/autonomous-scheduling` | **Confirmed Appointments** | Call outcomes | Cloud SQL (`service_appointments`) |
| `/service-center/agentic-ai` | Agent status, calls completed | Agent activity | Cloud SQL (`agent_activities`) |
| `/` (Customer Dashboard) | **Voice Call Notifications** | Pub/Sub (`voice-call-initiated`) | Firestore (real-time) |

**Input:**
- Scheduled appointments (from Pub/Sub)
- Customer contact info (from Cloud SQL)
- Prediction details (from Cloud SQL)

**Processing:**
- **ChatGPT API**: Generate conversation scripts (gpt-4, temp=0.7)
- Voice call initiation (Twilio/Google Voice)
- Speech-to-text processing
- Response analysis

**Output:**
- Call transcripts → Cloud SQL
- Appointment confirmations → Cloud SQL
- Engagement metrics → Cloud SQL

---

### Feedback Agent

| Data Display Location | What Data | Input Source | Database |
|----------------------|-----------|--------------|----------|
| `/service-center` | **Feedback Collection Form** | Service completion | Cloud SQL (`service_feedback`) |
| `/service-center/agentic-ai` | **Learning Metrics** | Feedback accuracy | Cloud SQL (`learning_metrics`) |
| `/service-center/agentic-ai` | **Model Performance** | Accuracy trends | Cloud SQL (`learning_metrics`) |
| `/manufacturer` | **CAPA Feedback** | Low accuracy feedback | Cloud SQL (`capa_feedback`) |

**Input:**
- Service completion events (from Pub/Sub)
- Customer feedback (from API)
- Technician notes (from API)
- Original predictions (from Cloud SQL)

**Processing:**
- Accuracy calculation
- Learning metrics update
- Manufacturing notification (if accuracy < 80%)

**Output:**
- Feedback records → Cloud SQL
- Learning metrics → Cloud SQL
- Manufacturing alerts → Pub/Sub (`feedback-received`)

---

### Manufacturing Quality Insights Agent

| Data Display Location | What Data | Input Source | Database |
|----------------------|-----------|--------------|----------|
| `/manufacturer` | **Quality Insights Dashboard** | Service feedback patterns | Cloud SQL (`capa_feedback`), BigQuery |
| `/manufacturer` | **CAPA Feedback Section** | Recurring defects | Cloud SQL (`capa_feedback`) |
| `/manufacturer` | **Failure Pattern Visualization** | Component failure analysis | BigQuery (analytics) |
| `/manufacturer` | **Design Improvement Recommendations** | ChatGPT analysis | Cloud SQL (`capa_recommendations`) |

**Input:**
- Service feedback (from Pub/Sub)
- Manufacturing quality data (from Cloud SQL)
- Component batch data (from Cloud SQL)

**Processing:**
- **Vertex AI**: Pattern Analysis Model
- **ChatGPT API**: Manufacturing CAPA (gpt-4, temp=0.3)
- Recurring issue identification

**Output:**
- Quality insights → Cloud SQL
- CAPA recommendations → Cloud SQL
- Alerts → Pub/Sub

---

## Data Flow Summary

### Phase 1: Data Collection
```
Vehicle Sensors → Telematics Gateway → Ingestion Service → Pub/Sub (telematics-raw)
```

### Phase 2: Processing
```
Pub/Sub (telematics-raw) → Stream Processor → 
  ├─► Anomaly Detection → Pub/Sub (anomalies-detected)
  ├─► Health Scores → Firestore + Cloud SQL
  └─► Analytics → BigQuery
```

### Phase 3: Prediction
```
Pub/Sub (anomalies-detected) → Diagnosis Agent →
  ├─► Vertex AI: Failure Prediction
  ├─► ChatGPT: RCA Analysis
  ├─► ChatGPT: CAPA Recommendations
  └─► Confidence Calculation →
      ├─► High (≥85%) → Pub/Sub (autonomous-action-triggered)
      └─► Low (<85%) → Pub/Sub (confidence-check-required)
```

### Phase 4: Action
```
High Confidence:
  Pub/Sub (autonomous-action-triggered) →
    ├─► Scheduling Agent → Appointment → Cloud SQL
    └─► Customer Engagement Agent → Voice Call → Cloud SQL

Low Confidence:
  Pub/Sub (confidence-check-required) →
    └─► Human Review Queue → Cloud SQL
```

### Phase 5: Feedback & Learning
```
Service Completion → Feedback Agent →
  ├─► Accuracy Validation → Cloud SQL
  ├─► Learning Metrics → Cloud SQL
  └─► Manufacturing Alert (if needed) → Pub/Sub
```

---

## Database Usage by Agent

| Agent | Cloud SQL Tables | Firestore Collections | BigQuery Tables |
|-------|-----------------|----------------------|-----------------|
| **Data Analysis** | `telematics_data`, `anomalies` | `/vehicles/{id}/telematics/current`, `/vehicles/{id}/health/current` | `telematics_raw` |
| **Diagnosis** | `predictions`, `anomalies` | `/predictions/{id}` | `predictions_history` |
| **Scheduling** | `service_appointments`, `service_centers`, `technicians` | `/service-centers/{id}/appointments/active` | - |
| **Customer Engagement** | `voice_calls`, `service_appointments` | - | - |
| **Feedback** | `service_feedback`, `learning_metrics` | - | `service_history` |
| **Manufacturing** | `capa_feedback`, `quality_insights` | - | `anomaly_patterns` |
| **Master Agent** | `agent_activities` | `/agent-status/{agentName}` | `agent_performance` |

---

## API Endpoints by Agent

### Data Analysis Agent
```
GET /api/service-center/telemetry/:vehicleId/current
GET /api/service-center/telemetry/:vehicleId/history
GET /api/service-center/anomalies
```

### Diagnosis Agent
```
GET /api/service-center/predictions
GET /api/service-center/predictions/:id
GET /api/service-center/predictions/:id/rca
GET /api/service-center/predictions/:id/confidence-breakdown
GET /api/service-center/predictions/low-confidence
```

### Scheduling Agent
```
GET /api/service-center/appointments
GET /api/service-center/appointments/autonomous
POST /api/service-center/appointments
```

### Customer Engagement Agent
```
GET /api/service-center/customer-engagement/conversations
GET /api/service-center/customer-engagement/metrics
```

### Feedback Agent
```
POST /api/service-center/feedback
GET /api/service-center/learning-metrics
```

### Manufacturing Agent
```
GET /api/manufacturer/capa-feedback
GET /api/manufacturer/failure-patterns
```

---

## WebSocket Events by Agent

| Agent | Event Type | Channel | Data |
|-------|-----------|---------|------|
| **Data Analysis** | `telemetry:update` | `vehicle:telemetry` | Real-time telematics |
| **Data Analysis** | `health:update` | `vehicle:health` | Health scores |
| **Diagnosis** | `prediction:new` | `predictions` | New prediction |
| **Diagnosis** | `prediction:confidence-update` | `predictions` | Confidence update |
| **Scheduling** | `appointment:auto-scheduled` | `appointments` | AI-scheduled appointment |
| **Customer Engagement** | `voice:call-started` | `customer:engagement` | Call initiated |
| **Customer Engagement** | `voice:call-completed` | `customer:engagement` | Call completed |
| **Feedback** | `feedback:received` | `learning` | Feedback submitted |
| **Master Agent** | `agent:status-update` | `agentic-ai` | Agent status change |

---

This quick reference shows exactly which agent displays what data where, with what inputs!
\ 