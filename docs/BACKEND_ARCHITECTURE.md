# NaviGo Backend Architecture - Complete Technical Specification

## Overview

This document provides complete backend architecture details for NaviGo's autonomous predictive maintenance system using GCP services, Vertex AI, Pub/Sub, and ChatGPT API.

---

## Technology Stack

- **Cloud Platform**: Google Cloud Platform (GCP)
- **AI/ML**: Vertex AI (for ML models, predictions)
- **LLM**: ChatGPT API (for reasoning, RCA analysis)
- **Message Queue**: Cloud Pub/Sub
- **Databases**: 
  - Cloud SQL (PostgreSQL) - Relational data
  - BigQuery - Analytics & Data Warehouse
  - Firestore - Real-time data, caching
  - Cloud Storage - File storage
- **Compute**: Cloud Run (Serverless containers)
- **API**: Cloud Endpoints / API Gateway
- **Monitoring**: Cloud Monitoring, Cloud Logging

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    VEHICLE TELEMATICS                          │
│  (CAN-BUS, BMS, TPMS, GPS, ADAS)                               │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│              TELEMATICS GATEWAY (IoT Device)                    │
│  • Data Validation                                              │
│  • Compression                                                  │
│  • Encryption                                                   │
│  • Batching (1-5 seconds)                                       │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ HTTPS/MQTT
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│              CLOUD RUN - INGESTION SERVICE                      │
│  • Decrypt & Decompress                                         │
│  • Schema Validation                                            │
│  • Normalize Data                                               │
│  • Publish to Pub/Sub                                           │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ Pub/Sub Topic: telematics-raw
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│              CLOUD RUN - STREAM PROCESSOR                       │
│  • Real-time Aggregation                                        │
│  • Anomaly Detection (Isolation Forest)                        │
│  • Feature Engineering                                         │
│  • Health Score Calculation                                     │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ├─► Store in Firestore (Real-time)
                   ├─► Store in BigQuery (Analytics)
                   └─► Publish to Pub/Sub: anomalies-detected
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│              MASTER AGENT (Orchestrator)                         │
│  Cloud Run Service                                              │
│  • Monitors all Pub/Sub topics                                  │
│  • Coordinates Worker Agents                                    │
│  • UEBA Security Monitoring                                     │
│  • Task Queue Management                                        │
└──────────────────┬──────────────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Data        │ │ Diagnosis   │ │ Scheduling  │
│ Analysis    │ │ Agent       │ │ Agent       │
│ Agent       │ │             │ │             │
└─────────────┘ └─────────────┘ └─────────────┘
        │          │          │
        └──────────┼──────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│              API LAYER (Cloud Run)                              │
│  • REST API Endpoints                                           │
│  • WebSocket Server (for real-time)                             │
│  • Authentication & Authorization                               │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND DASHBOARDS                                │
│  Customer / Service Center / Manufacturer                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema & Usage

### 1. Cloud SQL (PostgreSQL) - Primary Database

#### Tables:

**vehicles**
```sql
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number VARCHAR(20) UNIQUE NOT NULL,
  owner_id UUID REFERENCES users(id),
  make VARCHAR(50),
  model VARCHAR(50),
  variant VARCHAR(50),
  year INTEGER,
  mileage INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**telematics_data**
```sql
CREATE TABLE telematics_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id),
  timestamp TIMESTAMP NOT NULL,
  can_bus_data JSONB,
  bms_data JSONB,
  tpms_data JSONB,
  gps_data JSONB,
  adas_data JSONB,
  normalized_data JSONB,
  health_scores JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_telematics_vehicle_time ON telematics_data(vehicle_id, timestamp DESC);
```

**predictions**
```sql
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id),
  component VARCHAR(100) NOT NULL,
  issue_type VARCHAR(200) NOT NULL,
  predicted_failure_date DATE,
  remaining_useful_life INTEGER, -- days
  severity VARCHAR(20), -- critical, high, medium, low
  confidence_score DECIMAL(5,2), -- 0-100
  confidence_breakdown JSONB, -- {prediction: 40, historical: 30, dataQuality: 20, patternMatch: 10}
  rca_analysis JSONB, -- Root cause analysis
  capa_recommendations JSONB, -- Corrective actions
  status VARCHAR(20), -- pending, approved, rejected, resolved
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_predictions_vehicle ON predictions(vehicle_id, created_at DESC);
CREATE INDEX idx_predictions_confidence ON predictions(confidence_score, status);
```

**anomalies**
```sql
CREATE TABLE anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id),
  prediction_id UUID REFERENCES predictions(id),
  anomaly_type VARCHAR(100),
  detected_at TIMESTAMP NOT NULL,
  severity VARCHAR(20),
  description TEXT,
  telematics_snapshot JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**service_appointments**
```sql
CREATE TABLE service_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id),
  prediction_id UUID REFERENCES predictions(id),
  customer_id UUID REFERENCES users(id),
  service_center_id UUID REFERENCES service_centers(id),
  scheduled_at TIMESTAMP NOT NULL,
  technician_id UUID REFERENCES technicians(id),
  service_type VARCHAR(100),
  status VARCHAR(20), -- scheduled, in-progress, completed, cancelled
  ai_scheduled BOOLEAN DEFAULT FALSE,
  confidence_score DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**service_feedback**
```sql
CREATE TABLE service_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES service_appointments(id),
  prediction_id UUID REFERENCES predictions(id),
  actual_issue VARCHAR(200),
  prediction_accurate BOOLEAN,
  accuracy_score DECIMAL(5,2), -- 0-100
  customer_feedback TEXT,
  technician_notes TEXT,
  parts_used JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**agent_activities**
```sql
CREATE TABLE agent_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name VARCHAR(100) NOT NULL,
  agent_type VARCHAR(50), -- master, worker
  action VARCHAR(200),
  status VARCHAR(20), -- success, warning, error
  input_data JSONB,
  output_data JSONB,
  execution_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agent_activities_agent ON agent_activities(agent_name, created_at DESC);
```

**learning_metrics**
```sql
CREATE TABLE learning_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name VARCHAR(100),
  metric_type VARCHAR(50), -- accuracy, precision, recall, f1
  metric_value DECIMAL(10,4),
  training_date DATE,
  validation_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Firestore - Real-time Data & Caching

**Collections:**

```
/vehicles/{vehicleId}/telematics/current
  - Real-time telemetry data
  - Updated every 1-5 seconds
  - TTL: 24 hours

/vehicles/{vehicleId}/health/current
  - Current health scores
  - Updated on anomaly detection
  - TTL: 7 days

/predictions/{predictionId}
  - Prediction details
  - Real-time updates
  - TTL: 90 days

/service-centers/{centerId}/appointments/active
  - Active appointments
  - Real-time status
  - TTL: 1 day

/agent-status/{agentName}
  - Agent health & status
  - Updated every 10 seconds
  - TTL: 1 hour
```

### 3. BigQuery - Analytics & Data Warehouse

**Datasets:**

```
navigo_analytics/
  ├── telematics_raw (Partitioned by date)
  ├── predictions_history
  ├── service_history
  ├── anomaly_patterns
  └── agent_performance
```

**Usage:**
- Historical analysis
- ML model training data
- Trend analysis
- Reporting

### 4. Cloud Storage - File Storage

**Buckets:**
- `navigo-ml-models` - Trained ML models
- `navigo-reports` - Generated reports
- `navigo-voice-recordings` - Voice call recordings

---

## Pub/Sub Topics & Subscriptions

### Topics:

1. **telematics-raw**
   - Publisher: Ingestion Service
   - Subscribers: Stream Processor
   - Message: Raw telematics data

2. **anomalies-detected**
   - Publisher: Stream Processor
   - Subscribers: Master Agent, Notification Service
   - Message: Anomaly detection results

3. **predictions-generated**
   - Publisher: Diagnosis Agent
   - Subscribers: Master Agent, Notification Service, Frontend (via WebSocket)
   - Message: New prediction with confidence

4. **confidence-check-required**
   - Publisher: Diagnosis Agent
   - Subscribers: Master Agent, Human Review Service
   - Message: Prediction requiring confidence check

5. **autonomous-action-triggered**
   - Publisher: Master Agent (when confidence ≥85%)
   - Subscribers: Scheduling Agent, Customer Engagement Agent
   - Message: Auto-action command

6. **human-review-required**
   - Publisher: Master Agent (when confidence <85%)
   - Subscribers: Human Review Service, Notification Service
   - Message: Review queue item

7. **appointment-scheduled**
   - Publisher: Scheduling Agent
   - Subscribers: Customer Engagement Agent, Notification Service
   - Message: Appointment details

8. **voice-call-initiated**
   - Publisher: Customer Engagement Agent
   - Subscribers: Notification Service, Frontend
   - Message: Call status

9. **service-completed**
   - Publisher: Service Center API
   - Subscribers: Feedback Agent, Learning Service
   - Message: Service completion with feedback

10. **feedback-received**
    - Publisher: Feedback Agent
    - Subscribers: Learning Service, Manufacturing Service
    - Message: Validation feedback

11. **model-retrained**
    - Publisher: Learning Service
    - Subscribers: Diagnosis Agent, Master Agent
    - Message: New model version

---

## Agent Architecture & Data Flow

### 1. Master Agent (Orchestrator)

**Location**: Cloud Run Service
**Language**: Python
**Responsibilities:**
- Monitor all Pub/Sub topics
- Coordinate worker agents
- UEBA security monitoring
- Task queue management
- Route based on confidence scores

**Input:**
- All Pub/Sub messages
- Agent status from Firestore
- UEBA alerts

**Output:**
- Task assignments to worker agents
- Orchestration commands
- System status updates

**Data Display Locations:**
- `/service-center/agentic-ai` - Master Agent control panel
- Real-time activity log
- Worker agent status

**Database Usage:**
- Firestore: Agent status, real-time updates
- Cloud SQL: Agent activity logs
- Pub/Sub: Command distribution

---

### 2. Data Analysis Agent

**Location**: Cloud Run Service
**Language**: Python
**AI/ML**: Vertex AI (Anomaly Detection Model)

**Responsibilities:**
- Analyze telematics patterns
- Calculate health scores
- Detect anomalies
- Generate demand forecasts

**Input:**
- Telematics data from Pub/Sub (`telematics-raw`)
- Historical data from BigQuery
- Vehicle metadata from Cloud SQL

**Processing:**
```python
# Pseudocode
def analyze_telematics(data):
    # 1. Feature Engineering
    features = extract_features(data)
    
    # 2. Anomaly Detection (Vertex AI)
    anomaly_model = load_vertex_ai_model('anomaly-detection-v1')
    anomalies = anomaly_model.predict(features)
    
    # 3. Health Score Calculation
    health_scores = calculate_health_scores(data, anomalies)
    
    # 4. Pattern Recognition
    patterns = identify_patterns(data, historical_data)
    
    return {
        'anomalies': anomalies,
        'health_scores': health_scores,
        'patterns': patterns
    }
```

**Output:**
- Anomaly alerts → Pub/Sub (`anomalies-detected`)
- Health scores → Firestore + Cloud SQL
- Demand forecasts → Cloud SQL

**Data Display Locations:**
- `/service-center/predictive-maintenance` - Anomaly alerts, health scores
- `/service-center` - Real-time telematics, health indicators
- `/service-center/agentic-ai` - Agent status

**Database Usage:**
- Firestore: Real-time health scores
- Cloud SQL: Historical health data
- BigQuery: Analytics data

---

### 3. Diagnosis Agent

**Location**: Cloud Run Service
**Language**: Python
**AI/ML**: 
- Vertex AI (Failure Prediction Model)
- ChatGPT API (RCA Reasoning)

**Responsibilities:**
- Predict component failures
- Calculate Remaining Useful Life (RUL)
- Root Cause Analysis (RCA)
- CAPA recommendations
- Confidence score calculation

**Input:**
- Anomalies from Pub/Sub (`anomalies-detected`)
- Health scores from Firestore
- Historical predictions from Cloud SQL
- Vehicle service history

**Processing:**
```python
# Pseudocode
def diagnose_failure(anomaly, health_scores, history):
    # 1. Failure Prediction (Vertex AI)
    prediction_model = load_vertex_ai_model('failure-prediction-v2')
    prediction = prediction_model.predict({
        'anomaly': anomaly,
        'health_scores': health_scores,
        'history': history
    })
    
    # 2. Confidence Calculation
    confidence = calculate_confidence(
        prediction_confidence=prediction['confidence'],
        historical_accuracy=get_historical_accuracy(),
        data_quality=assess_data_quality(anomaly),
        pattern_match=compare_patterns(history)
    )
    
    # 3. RCA Analysis (ChatGPT API)
    if confidence >= 70:  # Only for medium+ confidence
        rca = analyze_rca_with_chatgpt(
            prediction=prediction,
            history=history,
            similar_cases=get_similar_cases()
        )
    else:
        rca = None
    
    # 4. CAPA Recommendations (ChatGPT API)
    if rca:
        capa = generate_capa_with_chatgpt(
            rca=rca,
            component=prediction['component'],
            severity=prediction['severity']
        )
    else:
        capa = None
    
    return {
        'prediction': prediction,
        'confidence': confidence,
        'rca': rca,
        'capa': capa
    }
```

**ChatGPT API Integration:**
```python
import openai

def analyze_rca_with_chatgpt(prediction, history, similar_cases):
    prompt = f"""
    Analyze the root cause for this vehicle failure prediction:
    
    Component: {prediction['component']}
    Issue: {prediction['issue_type']}
    Severity: {prediction['severity']}
    
    Historical Data:
    {format_history(history)}
    
    Similar Cases:
    {format_cases(similar_cases)}
    
    Provide:
    1. Root cause analysis
    2. Contributing factors
    3. Likelihood assessment
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "system", "content": "You are an expert automotive diagnostic engineer."},
                  {"role": "user", "content": prompt}],
        temperature=0.3
    )
    
    return parse_rca_response(response)

def generate_capa_with_chatgpt(rca, component, severity):
    prompt = f"""
    Based on this RCA analysis:
    {rca}
    
    Component: {component}
    Severity: {severity}
    
    Provide:
    1. Corrective Actions (immediate)
    2. Preventive Actions (long-term)
    3. Recommended service procedures
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "system", "content": "You are an expert in automotive maintenance procedures."},
                  {"role": "user", "content": prompt}],
        temperature=0.3
    )
    
    return parse_capa_response(response)
```

**Output:**
- Predictions → Pub/Sub (`predictions-generated`)
- Low confidence → Pub/Sub (`confidence-check-required`)
- High confidence → Pub/Sub (`autonomous-action-triggered`)

**Data Display Locations:**
- `/service-center/predictive-maintenance` - Predictions, RCA, CAPA
- `/service-center` - Priority queue
- `/service-center/agentic-ai` - Agent status

**Database Usage:**
- Cloud SQL: Predictions, RCA, CAPA
- Firestore: Real-time prediction updates
- BigQuery: Historical predictions for training

---

### 4. Scheduling Agent

**Location**: Cloud Run Service
**Language**: Python
**AI/ML**: Vertex AI (Optimization Model - OR-Tools)

**Responsibilities:**
- Optimize appointment scheduling
- Match technicians to services
- Resolve conflicts
- Maximize capacity utilization

**Input:**
- Predictions requiring service (from Pub/Sub)
- Service center capacity (from Cloud SQL)
- Technician availability (from Cloud SQL)
- Customer preferences (from Cloud SQL)

**Processing:**
```python
# Pseudocode
def optimize_scheduling(predictions, capacity, technicians):
    # 1. Load Optimization Model (Vertex AI)
    optimization_model = load_vertex_ai_model('scheduling-optimizer-v1')
    
    # 2. Build Constraint Problem
    problem = build_scheduling_problem(
        predictions=predictions,
        capacity=capacity,
        technicians=technicians,
        constraints=get_constraints()
    )
    
    # 3. Solve with OR-Tools (via Vertex AI)
    solution = optimization_model.solve(problem)
    
    # 4. Generate Recommendations
    recommendations = generate_recommendations(solution)
    
    return recommendations
```

**Output:**
- Scheduled appointments → Cloud SQL
- Appointment notifications → Pub/Sub (`appointment-scheduled`)

**Data Display Locations:**
- `/service-center/autonomous-scheduling` - AI-scheduled appointments
- `/service-center` - Active appointments
- `/service-center/agentic-ai` - Agent status

**Database Usage:**
- Cloud SQL: Appointments, capacity, technicians
- Firestore: Real-time appointment updates

---

### 5. Customer Engagement Agent

**Location**: Cloud Run Service
**Language**: Python
**AI/ML**: ChatGPT API (Voice/Text Conversations)

**Responsibilities:**
- Initiate voice calls to customers
- Handle customer conversations
- Schedule appointments via voice
- Collect customer preferences

**Input:**
- Scheduled appointments (from Pub/Sub)
- Customer contact info (from Cloud SQL)
- Prediction details (from Cloud SQL)

**Processing:**
```python
# Pseudocode
def engage_customer(appointment, prediction, customer):
    # 1. Generate Conversation Script (ChatGPT)
    script = generate_script_with_chatgpt(
        prediction=prediction,
        appointment=appointment,
        customer_preferences=customer['preferences']
    )
    
    # 2. Initiate Voice Call (Twilio/Google Voice API)
    call = initiate_voice_call(
        phone=customer['phone'],
        script=script
    )
    
    # 3. Process Response (Speech-to-Text + ChatGPT)
    response = process_voice_response(call)
    
    # 4. Confirm Appointment
    if response['confirmed']:
        confirm_appointment(appointment)
    
    return {
        'call_status': call['status'],
        'outcome': response['outcome'],
        'transcript': response['transcript']
    }
```

**ChatGPT API Integration:**
```python
def generate_script_with_chatgpt(prediction, appointment, preferences):
    prompt = f"""
    Generate a natural, friendly phone conversation script for a customer:
    
    Vehicle: {prediction['vehicle']}
    Issue: {prediction['issue_type']}
    Urgency: {prediction['severity']}
    Recommended Service: {appointment['service_type']}
    Suggested Time: {appointment['scheduled_at']}
    
    Customer Preferences: {preferences}
    
    Create a script that:
    1. Explains the issue clearly
    2. Recommends service timing
    3. Offers appointment options
    4. Handles objections gracefully
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "system", "content": "You are a friendly, professional customer service representative."},
                  {"role": "user", "content": prompt}],
        temperature=0.7
    )
    
    return response.choices[0].message.content
```

**Output:**
- Call transcripts → Cloud SQL
- Appointment confirmations → Cloud SQL
- Engagement metrics → Cloud SQL

**Data Display Locations:**
- `/service-center/customer-engagement` - Voice conversations, transcripts
- `/service-center/autonomous-scheduling` - Confirmed appointments
- `/service-center/agentic-ai` - Agent status

**Database Usage:**
- Cloud SQL: Call logs, transcripts, outcomes
- Cloud Storage: Voice recordings
- Firestore: Real-time call status

---

### 6. Feedback Agent

**Location**: Cloud Run Service
**Language**: Python

**Responsibilities:**
- Collect service completion feedback
- Validate prediction accuracy
- Update learning metrics
- Send feedback to manufacturing

**Input:**
- Service completion events (from Pub/Sub)
- Customer feedback (from API)
- Technician notes (from API)

**Processing:**
```python
# Pseudocode
def process_feedback(service_completion, prediction):
    # 1. Validate Prediction Accuracy
    accuracy = calculate_accuracy(
        predicted=prediction,
        actual=service_completion['actual_issue']
    )
    
    # 2. Update Learning Metrics
    update_learning_metrics(
        prediction_id=prediction['id'],
        accuracy=accuracy,
        feedback=service_completion['feedback']
    )
    
    # 3. Send to Manufacturing (if applicable)
    if accuracy < 0.8:  # Low accuracy - needs investigation
        send_to_manufacturing(
            prediction=prediction,
            actual=service_completion['actual_issue'],
            accuracy=accuracy
        )
    
    return {
        'accuracy': accuracy,
        'learning_updated': True,
        'manufacturing_notified': accuracy < 0.8
    }
```

**Output:**
- Feedback records → Cloud SQL
- Learning metrics → Cloud SQL
- Manufacturing alerts → Pub/Sub (`feedback-received`)

**Data Display Locations:**
- `/service-center` - Feedback collection form
- `/service-center/agentic-ai` - Learning metrics
- `/manufacturer` - CAPA feedback

**Database Usage:**
- Cloud SQL: Feedback, accuracy metrics
- BigQuery: Historical feedback for analysis

---

### 7. Manufacturing Quality Insights Agent

**Location**: Cloud Run Service
**Language**: Python
**AI/ML**: Vertex AI (Pattern Analysis)

**Responsibilities:**
- Analyze failure patterns from service centers
- Identify recurring defects
- Generate CAPA recommendations
- Compare with manufacturing data

**Input:**
- Service feedback (from Pub/Sub)
- Manufacturing quality data (from Cloud SQL)
- Component batch data (from Cloud SQL)

**Processing:**
```python
# Pseudocode
def analyze_quality_insights(feedback, manufacturing_data):
    # 1. Pattern Analysis (Vertex AI)
    pattern_model = load_vertex_ai_model('pattern-analysis-v1')
    patterns = pattern_model.analyze(
        feedback=feedback,
        manufacturing=manufacturing_data
    )
    
    # 2. Identify Recurring Issues
    recurring = identify_recurring_issues(patterns)
    
    # 3. Generate CAPA Recommendations (ChatGPT)
    capa = generate_manufacturing_capa_with_chatgpt(
        patterns=patterns,
        recurring=recurring
    )
    
    return {
        'patterns': patterns,
        'recurring_issues': recurring,
        'capa_recommendations': capa
    }
```

**Output:**
- Quality insights → Cloud SQL
- CAPA recommendations → Cloud SQL
- Alerts → Pub/Sub

**Data Display Locations:**
- `/manufacturer` - Quality insights dashboard
- `/manufacturer` - CAPA feedback section
- `/manufacturer` - Failure pattern visualization

**Database Usage:**
- Cloud SQL: Quality insights, CAPA
- BigQuery: Historical patterns

---

## API Endpoints

### Service Center APIs

**Base URL**: `https://api.navigo.com/service-center`

#### Telemetry
```
GET /telemetry/:vehicleId/current
  → Returns: Real-time telematics data
  → Source: Firestore
  → Cache: 1 second

GET /telemetry/:vehicleId/history
  → Returns: Historical telematics
  → Source: BigQuery
  → Params: startDate, endDate, interval
```

#### Predictions
```
GET /predictions
  → Returns: List of predictions
  → Source: Cloud SQL
  → Filters: vehicleId, status, confidence

GET /predictions/:id
  → Returns: Prediction details with RCA & CAPA
  → Source: Cloud SQL

GET /predictions/low-confidence
  → Returns: Predictions requiring human review
  → Source: Cloud SQL
  → Filter: confidence < 85

GET /predictions/:id/rca
  → Returns: Root cause analysis
  → Source: Cloud SQL

GET /predictions/:id/confidence-breakdown
  → Returns: Confidence calculation details
  → Source: Cloud SQL
```

#### Appointments
```
GET /appointments
  → Returns: Scheduled appointments
  → Source: Cloud SQL

POST /appointments
  → Creates: New appointment
  → Body: {vehicleId, serviceType, scheduledAt, ...}

GET /appointments/autonomous
  → Returns: AI-scheduled appointments
  → Source: Cloud SQL
  → Filter: ai_scheduled = true
```

#### Feedback
```
POST /feedback
  → Creates: Service feedback
  → Body: {appointmentId, predictionId, actualIssue, accuracy, ...}
  → Triggers: Pub/Sub → Feedback Agent
```

#### Agent Status
```
GET /agentic-ai/status
  → Returns: Master Agent & Worker Agent status
  → Source: Firestore

GET /agentic-ai/activities
  → Returns: Recent agent activities
  → Source: Cloud SQL
```

### Customer APIs

**Base URL**: `https://api.navigo.com/customer`

```
GET /predictions
  → Returns: Customer's vehicle predictions
  → Source: Cloud SQL
  → Filter: customerId

GET /appointments/autonomous
  → Returns: AI-scheduled appointments for customer
  → Source: Cloud SQL
```

### Manufacturer APIs

**Base URL**: `https://api.navigo.com/manufacturer`

```
GET /capa-feedback
  → Returns: CAPA feedback from service centers
  → Source: Cloud SQL

GET /failure-patterns
  → Returns: Component failure patterns
  → Source: BigQuery
  → Params: component, dateRange
```

---

## WebSocket Events (Real-time)

**Connection**: `wss://api.navigo.com/ws`

### Events:

```javascript
// Client subscribes to vehicle updates
{
  "type": "subscribe",
  "channel": "vehicle:telemetry",
  "vehicleId": "vehicle-123"
}

// Server sends real-time updates
{
  "type": "telemetry:update",
  "vehicleId": "vehicle-123",
  "data": {
    "engineTemp": 85,
    "batteryVoltage": 48.2,
    "healthScore": 87
  },
  "timestamp": "2024-09-15T10:30:00Z"
}

// Prediction generated
{
  "type": "prediction:new",
  "predictionId": "pred-456",
  "vehicleId": "vehicle-123",
  "confidence": 92,
  "component": "brake_pads"
}

// Appointment scheduled
{
  "type": "appointment:auto-scheduled",
  "appointmentId": "apt-789",
  "vehicleId": "vehicle-123",
  "scheduledAt": "2024-09-16T14:00:00Z"
}
```

---

## Vertex AI Models

### 1. Anomaly Detection Model
- **Type**: Isolation Forest
- **Input**: Telematics features
- **Output**: Anomaly score, anomaly type
- **Training**: BigQuery historical data
- **Used by**: Data Analysis Agent

### 2. Failure Prediction Model
- **Type**: Time Series Forecasting (LSTM/Prophet)
- **Input**: Health scores, telematics, history
- **Output**: Failure probability, RUL, severity
- **Training**: Historical failure data
- **Used by**: Diagnosis Agent

### 3. Scheduling Optimization Model
- **Type**: Constraint Programming (OR-Tools)
- **Input**: Appointments, capacity, constraints
- **Output**: Optimized schedule
- **Used by**: Scheduling Agent

### 4. Pattern Analysis Model
- **Type**: Clustering, Association Rules
- **Input**: Service feedback, manufacturing data
- **Output**: Failure patterns, correlations
- **Used by**: Manufacturing Quality Agent

---

## ChatGPT API Usage

### Use Cases:

1. **RCA Analysis** (Diagnosis Agent)
   - Model: `gpt-4`
   - Temperature: 0.3 (deterministic)
   - Input: Prediction, history, similar cases
   - Output: Root cause analysis

2. **CAPA Recommendations** (Diagnosis Agent)
   - Model: `gpt-4`
   - Temperature: 0.3
   - Input: RCA, component, severity
   - Output: Corrective & preventive actions

3. **Customer Engagement Scripts** (Customer Engagement Agent)
   - Model: `gpt-4`
   - Temperature: 0.7 (more natural)
   - Input: Prediction, appointment, preferences
   - Output: Conversation script

4. **Manufacturing CAPA** (Manufacturing Agent)
   - Model: `gpt-4`
   - Temperature: 0.3
   - Input: Failure patterns, recurring issues
   - Output: Manufacturing improvements

---

## Environment Variables

```bash
# GCP
GOOGLE_CLOUD_PROJECT=navigo-production
GCP_REGION=us-central1

# Vertex AI
VERTEX_AI_LOCATION=us-central1
ANOMALY_MODEL_ID=anomaly-detection-v1
PREDICTION_MODEL_ID=failure-prediction-v2
SCHEDULING_MODEL_ID=scheduling-optimizer-v1
PATTERN_MODEL_ID=pattern-analysis-v1

# ChatGPT API
OPENAI_API_KEY=sk-...
CHATGPT_MODEL=gpt-4

# Pub/Sub
PUBSUB_TELEMETRY_TOPIC=telematics-raw
PUBSUB_ANOMALIES_TOPIC=anomalies-detected
PUBSUB_PREDICTIONS_TOPIC=predictions-generated
PUBSUB_APPOINTMENTS_TOPIC=appointment-scheduled

# Databases
POSTGRES_HOST=cloud-sql-proxy
POSTGRES_DB=navigo
POSTGRES_USER=navigo-user
POSTGRES_PASSWORD=...

FIRESTORE_PROJECT_ID=navigo-production
BIGQUERY_PROJECT_ID=navigo-production
BIGQUERY_DATASET=navigo_analytics
```

---

## Deployment Architecture

### Cloud Run Services:

1. **ingestion-service**
   - Handles telematics ingestion
   - Publishes to Pub/Sub
   - Memory: 512MB, CPU: 1

2. **stream-processor**
   - Processes telematics stream
   - Anomaly detection
   - Memory: 2GB, CPU: 2

3. **master-agent**
   - Orchestrates all agents
   - Memory: 1GB, CPU: 1

4. **data-analysis-agent**
   - Analyzes telematics
   - Memory: 2GB, CPU: 2

5. **diagnosis-agent**
   - Predicts failures, RCA analysis
   - Memory: 4GB, CPU: 2 (for ChatGPT API)

6. **scheduling-agent**
   - Optimizes scheduling
   - Memory: 2GB, CPU: 2

7. **customer-engagement-agent**
   - Handles voice calls
   - Memory: 2GB, CPU: 2

8. **feedback-agent**
   - Processes feedback
   - Memory: 1GB, CPU: 1

9. **manufacturing-agent**
   - Quality insights
   - Memory: 2GB, CPU: 2

10. **api-service**
    - REST API & WebSocket
    - Memory: 1GB, CPU: 1

---

This complete backend architecture document provides all the details needed to build the NaviGo system!

