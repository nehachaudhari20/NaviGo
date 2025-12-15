# NaviGo - Complete Product Journey: From Telematics to Dashboard

## Table of Contents
1. [Overview](#overview)
2. [Phase 1: Data Generation (Vehicle Level)](#phase-1-data-generation-vehicle-level)
3. [Phase 2: Data Collection & Transmission](#phase-2-data-collection--transmission)
4. [Phase 3: Data Ingestion & Normalization](#phase-3-data-ingestion--normalization)
5. [Phase 4: Data Processing & Storage](#phase-4-data-processing--storage)
6. [Phase 5: AI Analysis & Insights](#phase-5-ai-analysis--insights)
7. [Phase 6: API Layer & Data Delivery](#phase-6-api-layer--data-delivery)
8. [Phase 7: Frontend Presentation](#phase-7-frontend-presentation)
9. [Complete Flow Diagram](#complete-flow-diagram)

---

## Overview

This document traces the complete journey of data in NaviGo, from the moment a vehicle sensor generates telematics data to how it's presented in the dashboard.

```
Vehicle Sensors → Data Collection → Transmission → Ingestion → Processing → 
AI Analysis → Storage → API → Frontend → Dashboard Display
```

---

## Phase 1: Data Generation (Vehicle Level)

### 1.1 Vehicle Sensors & Systems

```
┌─────────────────────────────────────────────────────────────┐
│                    VEHICLE ONBOARD SYSTEMS                  │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   CAN-BUS    │  │   BMS        │  │   TPMS       │
│   Network    │  │   (Battery)   │  │   (Tires)    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       └─────────────────┴──────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Telematics Gateway  │
              │  (OBD-II / IoT)      │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Data Aggregation    │
              └──────────────────────┘
```

### 1.2 Data Sources

**CAN-BUS Data:**
- Engine RPM, temperature, oil pressure
- Transmission status, gear position
- Brake system pressure
- Fuel level, consumption rate
- Speed, acceleration, deceleration
- Steering angle, wheel position

**Battery Management System (BMS):**
- Battery voltage, current
- State of Charge (SOC)
- State of Health (SOH)
- Cell temperatures
- Charging/discharging rates
- Battery degradation metrics

**Tire Pressure Monitoring System (TPMS):**
- Tire pressure (all 4 wheels)
- Tire temperature
- Tire wear indicators
- Rotation speed

**ADAS (Advanced Driver Assistance Systems):**
- Lane departure warnings
- Collision avoidance data
- Adaptive cruise control status
- Parking sensor data

**GPS & Location:**
- Vehicle coordinates
- Speed, heading
- Altitude
- Timestamp

### 1.3 Data Generation Frequency

```
Real-time Sensors:
├─► CAN-BUS: 10-100 Hz (10-100 readings per second)
├─► BMS: 1-10 Hz
├─► TPMS: 0.1-1 Hz (every 1-10 seconds)
├─► GPS: 1 Hz (1 reading per second)
└─► ADAS: Event-based (on detection)

Aggregated Data:
└─► Telematics Gateway: Batches every 1-5 seconds
```

### 1.4 Sample Raw Data Structure

```json
{
  "timestamp": "2024-09-15T10:30:45.123Z",
  "vehicleId": "MH-07-AB-1234",
  "canBus": {
    "engine": {
      "rpm": 2500,
      "temperature": 85,
      "oilPressure": 45,
      "load": 65
    },
    "transmission": {
      "gear": 5,
      "temperature": 75,
      "fluidLevel": "normal"
    },
    "brakes": {
      "frontPressure": 120,
      "rearPressure": 115,
      "padWear": 78
    },
    "fuel": {
      "level": 45,
      "consumption": 8.5,
      "range": 320
    }
  },
  "bms": {
    "voltage": 48.2,
    "current": 25.5,
    "soc": 85,
    "soh": 92,
    "temperature": 28,
    "charging": false
  },
  "tpms": {
    "frontLeft": { "pressure": 32, "temperature": 25 },
    "frontRight": { "pressure": 32, "temperature": 25 },
    "rearLeft": { "pressure": 30, "temperature": 24 },
    "rearRight": { "pressure": 30, "temperature": 24 }
  },
  "gps": {
    "latitude": 19.0760,
    "longitude": 72.8777,
    "speed": 60,
    "heading": 180,
    "altitude": 10
  },
  "adas": {
    "laneDeparture": false,
    "collisionWarning": false,
    "accActive": true
  }
}
```

---

## Phase 2: Data Collection & Transmission

### 2.1 Telematics Gateway Processing

```
┌─────────────────────────────────────────────────────────────┐
│              TELEMATICS GATEWAY (Vehicle)                   │
└─────────────────────────────────────────────────────────────┘

Raw Sensor Data
    │
    ├─► Data Validation
    │       ├─► Check data ranges
    │       ├─► Validate timestamps
    │       └─► Filter outliers
    │
    ├─► Data Compression
    │       └─► Reduce payload size
    │
    ├─► Data Batching
    │       └─► Group multiple readings (1-5 second batches)
    │
    └─► Encryption
            └─► Secure data before transmission
```

### 2.2 Transmission Methods

**Option 1: Cellular Network (4G/5G)**
```
Telematics Gateway
    │
    ├─► Encrypt Data
    ├─► Compress Payload
    └─► Transmit via 4G/5G Modem
            │
            └─► Cellular Tower
                    │
                    └─► Internet
                            │
                            └─► NaviGo Cloud Infrastructure
```

**Option 2: WiFi (When Available)**
```
Telematics Gateway
    │
    └─► WiFi Connection
            │
            └─► Internet
                    │
                    └─► NaviGo Cloud Infrastructure
```

**Option 3: Bluetooth (Short Range)**
```
Telematics Gateway
    │
    └─► Bluetooth to Mobile App
            │
            └─► Mobile App Transmits via Internet
                    │
                    └─► NaviGo Cloud Infrastructure
```

### 2.3 Transmission Protocol

```json
{
  "protocol": "HTTPS/MQTT",
  "endpoint": "https://api.navigo.com/telematics/ingest",
  "headers": {
    "Authorization": "Bearer <device_token>",
    "Content-Type": "application/json",
    "X-Vehicle-ID": "MH-07-AB-1234",
    "X-Device-ID": "device-uuid-123",
    "X-Timestamp": "2024-09-15T10:30:45.123Z"
  },
  "payload": {
    "batch": [
      { /* telematics data point 1 */ },
      { /* telematics data point 2 */ },
      { /* telematics data point 3 */ }
    ],
    "metadata": {
      "vehicleId": "MH-07-AB-1234",
      "firmwareVersion": "2.1.0",
      "transmissionTime": "2024-09-15T10:30:50.000Z"
    }
  }
}
```

---

## Phase 3: Data Ingestion & Normalization

### 3.1 Cloud Ingestion Layer

```
┌─────────────────────────────────────────────────────────────┐
│              NAVIGO CLOUD - INGESTION LAYER                  │
└─────────────────────────────────────────────────────────────┘

Incoming Data Stream
    │
    ├─► API Gateway
    │       ├─► Rate Limiting
    │       ├─► Authentication (Device Token)
    │       └─► Request Validation
    │
    ├─► Load Balancer
    │       └─► Distribute to Ingestion Servers
    │
    ├─► Ingestion Service
    │       ├─► Decrypt Data
    │       ├─► Decompress Payload
    │       ├─► Validate Schema
    │       └─► Parse JSON
    │
    └─► Message Queue (Kafka/RabbitMQ)
            └─► Queue for Processing
```

### 3.2 Data Normalization

```typescript
// Normalization Process
interface RawTelematicsData {
  // Raw data from vehicle
}

interface NormalizedTelematicsData {
  vehicleId: string
  timestamp: Date
  dataSource: 'CAN-BUS' | 'BMS' | 'TPMS' | 'GPS' | 'ADAS'
  metrics: {
    [key: string]: {
      value: number
      unit: string
      status: 'normal' | 'warning' | 'critical'
    }
  }
  location?: {
    lat: number
    lng: number
    speed: number
  }
  metadata: {
    firmwareVersion: string
    transmissionLatency: number
    dataQuality: number
  }
}

// Normalization Steps:
1. Convert units to standard (e.g., °F to °C, PSI to kPa)
2. Map vehicle-specific codes to standard codes
3. Add calculated fields (e.g., health scores)
4. Enrich with vehicle metadata
5. Validate data ranges
6. Flag anomalies
```

### 3.3 Data Validation & Quality Checks

```
Data Quality Checks:
├─► Range Validation
│   └─► Engine temp: 0-150°C (flag if outside)
├─► Consistency Checks
│   └─► Speed vs RPM correlation
├─► Completeness Checks
│   └─► Required fields present
├─► Timestamp Validation
│   └─► No future timestamps, reasonable gaps
└─► Anomaly Detection
    └─► Sudden spikes/drops flagged
```

---

## Phase 4: Data Processing & Storage

### 4.1 Stream Processing

```
┌─────────────────────────────────────────────────────────────┐
│              STREAM PROCESSING PIPELINE                     │
└─────────────────────────────────────────────────────────────┘

Message Queue
    │
    ├─► Stream Processor (Apache Kafka Streams / Flink)
    │       │
    │       ├─► Real-time Aggregation
    │       │       ├─► Calculate averages (1 min, 5 min, 1 hour)
    │       │       ├─► Calculate trends
    │       │       └─► Detect patterns
    │       │
    │       ├─► Anomaly Detection
    │       │       ├─► Isolation Forest Algorithm
    │       │       ├─► Statistical Outlier Detection
    │       │       └─► Pattern Deviation Detection
    │       │
    │       └─► Feature Engineering
    │               ├─► Calculate derivatives
    │               ├─► Moving averages
    │               └─► Rate of change
    │
    └─► Processed Data Output
            │
            ├─► Time-Series Database (InfluxDB/TimescaleDB)
            └─► Relational Database (PostgreSQL)
```

### 4.2 Data Storage Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA STORAGE LAYERS                       │
└─────────────────────────────────────────────────────────────┘

1. TIME-SERIES DATABASE (InfluxDB/TimescaleDB)
   └─► Raw telematics data
       ├─► High-frequency sensor readings
       ├─► Optimized for time-based queries
       └─► Retention: 90 days raw, 1 year aggregated

2. RELATIONAL DATABASE (PostgreSQL)
   └─► Structured data
       ├─► Vehicle metadata
       ├─► User accounts
       ├─► Service history
       ├─► Maintenance records
       └─► Configuration data

3. DATA WAREHOUSE (BigQuery/Snowflake)
   └─► Historical analytics
       ├─► Long-term trends
       ├─► Fleet-wide analytics
       └─► ML training data

4. CACHE LAYER (Redis)
   └─► Frequently accessed data
       ├─► Current vehicle status
       ├─► Recent alerts
       └─► Dashboard data
```

### 4.3 Data Processing Example

```typescript
// Stream Processing Logic
function processTelematicsData(rawData: RawTelematicsData) {
  // 1. Normalize
  const normalized = normalizeData(rawData)
  
  // 2. Calculate Health Scores
  const healthScores = {
    engine: calculateEngineHealth(normalized.canBus.engine),
    transmission: calculateTransmissionHealth(normalized.canBus.transmission),
    battery: calculateBatteryHealth(normalized.bms),
    tires: calculateTireHealth(normalized.tpms),
    overall: calculateOverallHealth(healthScores)
  }
  
  // 3. Detect Anomalies
  const anomalies = detectAnomalies(normalized)
  
  // 4. Predict Issues
  const predictions = predictIssues(normalized, healthScores)
  
  // 5. Store
  await Promise.all([
    timeSeriesDB.write(normalized),
    relationalDB.updateHealthScores(healthScores),
    cache.setCurrentStatus(healthScores),
    alertService.checkAnomalies(anomalies)
  ])
  
  return {
    normalized,
    healthScores,
    anomalies,
    predictions
  }
}
```

---

## Phase 5: AI Analysis & Insights

### 5.1 AI Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI ANALYSIS PIPELINE                       │
└─────────────────────────────────────────────────────────────┘

Processed Data
    │
    ├─► Data Analysis Agent
    │       │
    │       ├─► Pattern Recognition
    │       │       └─► Identify usage patterns
    │       │
    │       ├─► Trend Analysis
    │       │       └─► Detect degradation trends
    │       │
    │       └─► Demand Forecasting
    │               └─► Predict service demand
    │
    ├─► Diagnosis Agent
    │       │
    │       ├─► Failure Prediction Models
    │       │       ├─► Engine failure prediction
    │       │       ├─► Battery degradation
    │       │       ├─► Brake wear prediction
    │       │       └─► Transmission issues
    │       │
    │       ├─► Root Cause Analysis
    │       │       └─► Identify failure causes
    │       │
    │       └─► Priority Scoring
    │               └─► Rank issues by urgency
    │
    ├─► Quality Prediction Agent (Manufacturer)
    │       │
    │       ├─► Quality Score Prediction
    │       │       └─► ML model for batch quality
    │       │
    │       ├─► Defect Rate Prediction
    │       │       └─► Predict defect rates
    │       │
    │       └─► Production Optimization
    │               └─► Recommend improvements
    │
    └─► Optimization Agent
            │
            ├─► Maintenance Scheduling
            │       └─► Optimal service timing
            │
            ├─► Resource Allocation
            │       └─► Optimize production lines
            │
            └─► Cost Optimization
                    └─► Reduce waste, improve efficiency
```

### 5.2 ML Model Processing

```python
# Example: Quality Prediction Model (Manufacturer)
def predict_quality_score(production_data, historical_data):
    """
    Input:
    - production_data: Current production metrics
    - historical_data: Past production data
    
    Process:
    1. Feature Engineering
    2. Model Inference
    3. Confidence Calculation
    4. Insight Generation
    """
    
    # 1. Feature Engineering
    features = extract_features(production_data, historical_data)
    
    # 2. Model Inference
    model = load_model('quality_prediction_v2.pkl')
    prediction = model.predict(features)
    confidence = model.predict_proba(features)
    
    # 3. Generate Insights
    insights = generate_insights(prediction, confidence, production_data)
    
    return {
        'predicted_quality': prediction,
        'confidence': confidence,
        'insights': insights,
        'recommendations': generate_recommendations(insights)
    }
```

### 5.3 AI Output Structure

```json
{
  "vehicleId": "MH-07-AB-1234",
  "timestamp": "2024-09-15T10:35:00.000Z",
  "aiAnalysis": {
    "healthScore": {
      "overall": 87,
      "engine": 84,
      "transmission": 78,
      "battery": 91,
      "brakes": 72,
      "trend": "stable"
    },
    "predictions": [
      {
        "component": "brake_pads",
        "issue": "Wear threshold approaching",
        "confidence": 92,
        "predictedDate": "2024-10-15",
        "priority": "high",
        "recommendation": "Schedule brake pad replacement within 30 days"
      }
    ],
    "anomalies": [
      {
        "type": "temperature_spike",
        "component": "engine",
        "severity": "medium",
        "timestamp": "2024-09-15T10:30:00.000Z",
        "description": "Engine temperature exceeded normal range"
      }
    ],
    "insights": [
      {
        "type": "optimization",
        "title": "Production Efficiency",
        "description": "AI recommends shift adjustment to reduce waste by 8%",
        "confidence": 88,
        "impact": "medium"
      }
    ]
  }
}
```

---

## Phase 6: API Layer & Data Delivery

### 6.1 API Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER                                 │
└─────────────────────────────────────────────────────────────┘

Frontend Request
    │
    ├─► API Gateway
    │       ├─► Authentication (JWT)
    │       ├─► Rate Limiting
    │       ├─► Request Validation
    │       └─► Routing
    │
    ├─► API Service
    │       │
    │       ├─► Query Database
    │       │       ├─► Time-Series DB (recent data)
    │       │       ├─► Relational DB (metadata)
    │       │       └─► Cache (frequent data)
    │       │
    │       ├─► Call AI Service (if needed)
    │       │       └─► Get AI predictions/insights
    │       │
    │       └─► Aggregate Data
    │               └─► Combine multiple sources
    │
    └─► Format Response
            └─► Return JSON
```

### 6.2 API Endpoints

```typescript
// Manufacturer Dashboard APIs

// 1. KPI Data
GET /api/manufacturer/kpis
Response: {
  totalComponents: 45320,
  productionEfficiency: 92,
  ordersFulfilled: 1230,
  trends: { ... }
}

// 2. AI Insights
GET /api/manufacturer/ai/insights
Response: {
  insights: [
    {
      type: "prediction",
      title: "Quality Prediction",
      description: "AI predicts 15% reduction in defects",
      confidence: 92,
      impact: "high"
    }
  ]
}

// 3. Quality Predictions
GET /api/manufacturer/ai/quality-predictions
Response: {
  predictedQuality: 98,
  confidence: 94,
  historicalData: [...],
  predictions: [...]
}

// 4. Real-time Notifications
WebSocket: wss://api.navigo.com/notifications
Message: {
  type: "notification",
  data: {
    id: 1,
    title: "Production Line Alert",
    message: "Temperature threshold exceeded",
    priority: "high",
    timestamp: "2024-09-15T10:35:00.000Z"
  }
}
```

### 6.3 Data Aggregation Example

```typescript
// API Service: Aggregate data for dashboard
async function getManufacturerDashboardData(userId: string) {
  // Parallel data fetching
  const [
    kpis,
    aiInsights,
    qualityPredictions,
    notifications,
    stock,
    defects,
    production,
    waste,
    orders,
    topProduct
  ] = await Promise.all([
    getKPIData(userId),
    getAIInsights(userId),
    getQualityPredictions(userId),
    getNotifications(userId),
    getStockData(userId),
    getDefectData(userId),
    getProductionData(userId),
    getWasteData(userId),
    getOrdersData(userId),
    getTopProduct(userId)
  ])
  
  return {
    kpis,
    aiInsights,
    qualityPredictions,
    notifications,
    stock,
    defects,
    production,
    waste,
    orders,
    topProduct,
    timestamp: new Date().toISOString()
  }
}
```

---

## Phase 7: Frontend Presentation

### 7.1 Frontend Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND - DATA PRESENTATION                     │
└─────────────────────────────────────────────────────────────┘

API Response Received
    │
    ├─► Component State Update
    │       └─► useState/useReducer
    │
    ├─► Data Transformation
    │       ├─► Format for display
    │       ├─► Calculate derived values
    │       └─► Group/sort data
    │
    ├─► Component Re-render
    │       └─► React reconciliation
    │
    └─► UI Update
            ├─► Charts render (Recharts)
            ├─► Tables populate
            ├─► Cards display metrics
            └─► Notifications show
```

### 7.2 Dashboard Component Structure

```typescript
// Manufacturer Dashboard Component
"use client"

export default function ManufacturerDashboard() {
  // State Management
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Data Fetching
  useEffect(() => {
    fetchDashboardData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])
  
  // WebSocket for real-time updates
  useEffect(() => {
    const ws = new WebSocket('wss://api.navigo.com/notifications')
    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data)
      updateNotifications(notification)
    }
    return () => ws.close()
  }, [])
  
  return (
    <div>
      {/* KPI Cards - Display aggregated metrics */}
      <KPICards data={dashboardData?.kpis} />
      
      {/* AI Insights - Display AI predictions */}
      <AIInsights data={dashboardData?.aiInsights} />
      
      {/* Quality Predictions - Display ML predictions */}
      <AIQualityPredictions data={dashboardData?.qualityPredictions} />
      
      {/* Notifications - Display real-time alerts */}
      <NotificationsPanel data={dashboardData?.notifications} />
      
      {/* Charts - Visualize telematics data */}
      <CurrentStockChart data={dashboardData?.stock} />
      <DefectRatesChart data={dashboardData?.defects} />
      <WasteOfCostChart data={dashboardData?.waste} />
      
      {/* Tables - Display structured data */}
      <PendingOrdersTable data={dashboardData?.orders} />
    </div>
  )
}
```

### 7.3 Data Visualization

**KPI Cards:**
```typescript
// Display aggregated metrics from telematics
<KPICard
  title="Total Components Produced"
  value={45320}  // Aggregated from production line sensors
  trend="+8%"
  icon={<Wrench />}
/>
```

**Charts:**
```typescript
// Visualize time-series telematics data
<LineChart data={stockData}>
  {/* Data points from TPMS, inventory sensors */}
  <Line dataKey="value" stroke="#06b6d4" />
</LineChart>
```

**AI Insights:**
```typescript
// Display AI analysis results
<AIInsightCard
  title="Quality Prediction"
  description="AI predicts 15% reduction in defects"
  confidence={92}  // From ML model
  impact="high"
/>
```

### 7.4 Real-time Updates

```typescript
// WebSocket connection for live updates
useEffect(() => {
  const ws = new WebSocket('wss://api.navigo.com/notifications')
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    
    switch(data.type) {
      case 'notification':
        // Update notification state
        setNotifications(prev => [data.notification, ...prev])
        // Show browser notification
        showBrowserNotification(data.notification)
        break
        
      case 'production_update':
        // Update production metrics
        updateProductionData(data.production)
        break
        
      case 'quality_alert':
        // Update quality metrics
        updateQualityData(data.quality)
        break
    }
  }
  
  return () => ws.close()
}, [])
```

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│              COMPLETE NAVIGO JOURNEY: SENSOR TO SCREEN           │
└─────────────────────────────────────────────────────────────────┘

PHASE 1: VEHICLE SENSORS
┌─────────────────────────────────────────────────────────────┐
│  Vehicle Onboard Systems                                      │
│  ├─► CAN-BUS: Engine, Transmission, Brakes, Fuel            │
│  ├─► BMS: Battery voltage, SOC, SOH, temperature            │
│  ├─► TPMS: Tire pressure, temperature                       │
│  ├─► GPS: Location, speed, heading                          │
│  └─► ADAS: Lane departure, collision warnings               │
│                                                              │
│  Data Generated: 10-100 readings/second                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
PHASE 2: TELEMATICS GATEWAY
┌─────────────────────────────────────────────────────────────┐
│  On-Vehicle Processing                                        │
│  ├─► Data Validation                                          │
│  ├─► Data Compression                                         │
│  ├─► Data Batching (1-5 second batches)                      │
│  └─► Encryption                                               │
│                                                              │
│  Transmission: 4G/5G/WiFi/Bluetooth                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
PHASE 3: CLOUD INGESTION
┌─────────────────────────────────────────────────────────────┐
│  NaviGo Cloud - Ingestion Layer                              │
│  ├─► API Gateway (Authentication, Rate Limiting)            │
│  ├─► Load Balancer                                           │
│  ├─► Ingestion Service (Decrypt, Decompress, Validate)      │
│  └─► Message Queue (Kafka/RabbitMQ)                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
PHASE 4: DATA PROCESSING
┌─────────────────────────────────────────────────────────────┐
│  Stream Processing Pipeline                                   │
│  ├─► Real-time Aggregation (1min, 5min, 1hr averages)       │
│  ├─► Anomaly Detection (Isolation Forest)                   │
│  ├─► Feature Engineering                                     │
│  └─► Health Score Calculation                                │
│                                                              │
│  Storage:                                                    │
│  ├─► Time-Series DB (InfluxDB) - Raw data                   │
│  ├─► Relational DB (PostgreSQL) - Metadata                  │
│  ├─► Data Warehouse (BigQuery) - Analytics                   │
│  └─► Cache (Redis) - Frequent data                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
PHASE 5: AI ANALYSIS
┌─────────────────────────────────────────────────────────────┐
│  AI Service Pipeline                                          │
│  ├─► Data Analysis Agent                                     │
│  │   └─► Pattern recognition, trend analysis                │
│  ├─► Diagnosis Agent                                         │
│  │   └─► Failure prediction, root cause analysis           │
│  ├─► Quality Prediction Agent (Manufacturer)                │
│  │   └─► ML models for quality prediction                   │
│  └─► Optimization Agent                                      │
│       └─► Maintenance scheduling, resource allocation      │
│                                                              │
│  Output: Predictions, Insights, Recommendations            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
PHASE 6: API LAYER
┌─────────────────────────────────────────────────────────────┐
│  REST API + WebSocket                                         │
│  ├─► API Gateway (JWT Auth, Rate Limiting)                   │
│  ├─► API Service (Query DB, Call AI Service)                 │
│  ├─► Data Aggregation                                        │
│  └─► Response Formatting                                     │
│                                                              │
│  Endpoints:                                                   │
│  ├─► GET /api/manufacturer/kpis                              │
│  ├─► GET /api/manufacturer/ai/insights                       │
│  ├─► GET /api/manufacturer/quality/predictions              │
│  └─► WebSocket: wss://api.navigo.com/notifications          │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
PHASE 7: FRONTEND PRESENTATION
┌─────────────────────────────────────────────────────────────┐
│  Next.js/React Dashboard                                     │
│  ├─► Component State Management (useState)                    │
│  ├─► Data Fetching (useEffect, fetch/WebSocket)              │
│  ├─► Data Transformation                                     │
│  ├─► Component Re-render                                     │
│  └─► UI Display                                              │
│                                                              │
│  Components:                                                 │
│  ├─► KPI Cards (Aggregated metrics)                          │
│  ├─► AI Insights (ML predictions)                            │
│  ├─► Charts (Time-series visualization)                     │
│  ├─► Tables (Structured data)                                │
│  └─► Notifications (Real-time alerts)                       │
│                                                              │
│  User Views:                                                 │
│  └─► Dashboard with live data, AI insights, charts          │
└─────────────────────────────────────────────────────────────┘
```

---

## Timeline: Data Journey

```
T+0ms    : Sensor generates reading (e.g., engine temp = 85°C)
T+10ms   : CAN-BUS captures data
T+50ms   : Telematics gateway receives
T+100ms  : Gateway validates & batches
T+500ms  : Gateway encrypts & transmits
T+1000ms : Cloud receives via API Gateway
T+1100ms : Ingestion service processes
T+1200ms : Data queued for processing
T+1500ms : Stream processor analyzes
T+2000ms : Anomaly detection runs
T+2500ms : Health scores calculated
T+3000ms : Data stored in databases
T+3500ms : AI service processes (if triggered)
T+5000ms : AI predictions generated
T+5500ms : API aggregates data
T+6000ms : Frontend receives response
T+6100ms : Component state updates
T+6200ms : UI re-renders
T+6300ms : User sees updated data

Total Latency: ~6.3 seconds (end-to-end)
Real-time Updates: WebSocket reduces to ~1-2 seconds
```

---

## Data Transformation Example

### Input (Raw Sensor Data)
```json
{
  "engine": { "rpm": 2500, "temp": 85 },
  "battery": { "voltage": 48.2, "soc": 85 }
}
```

### After Normalization
```json
{
  "engine": {
    "rpm": 2500,
    "temperature": { "value": 85, "unit": "celsius", "status": "normal" },
    "healthScore": 84
  },
  "battery": {
    "voltage": { "value": 48.2, "unit": "volts", "status": "normal" },
    "soc": { "value": 85, "unit": "percent", "status": "good" },
    "healthScore": 91
  }
}
```

### After AI Analysis
```json
{
  "healthScore": 87,
  "predictions": [
    {
      "component": "battery",
      "issue": "Degradation detected",
      "confidence": 88,
      "predictedDate": "2024-11-15"
    }
  ],
  "insights": [
    {
      "type": "optimization",
      "title": "Battery Maintenance",
      "description": "Schedule battery check in 60 days"
    }
  ]
}
```

### Frontend Display
```tsx
<Card>
  <h3>Battery Health</h3>
  <Progress value={91} />
  <p>91% Health Score</p>
  <Alert>
    AI predicts battery degradation in 60 days
    Confidence: 88%
  </Alert>
</Card>
```

---

## Key Metrics & Performance

### Data Volume
- **Per Vehicle**: ~1-5 MB/day
- **Fleet (1000 vehicles)**: ~1-5 GB/day
- **Storage**: 90 days raw + 1 year aggregated

### Processing Speed
- **Ingestion**: <100ms latency
- **Stream Processing**: <500ms latency
- **AI Analysis**: 1-5 seconds
- **API Response**: <200ms
- **Frontend Update**: <100ms

### Accuracy
- **Sensor Data**: 99.9% accuracy
- **AI Predictions**: 85-95% confidence
- **Health Scores**: Real-time calculation

---

This complete journey document shows how NaviGo transforms raw vehicle telematics data into actionable insights displayed in the dashboard!

