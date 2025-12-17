# API Integration Guide

This directory contains the API integration layer for connecting the frontend to the backend agent system.

## Structure

```
lib/api/
├── config.ts          # API configuration and endpoints
├── telemetry.ts       # Telemetry ingestion API
├── firestore.ts       # Firestore data access (agent results)
└── index.ts           # Central exports

hooks/
└── use-agent-data.ts  # React hooks for agent data
```

## Quick Start

### 1. Ingest Telemetry Data

```typescript
import { ingestTelemetry } from '@/lib/api'

// Send telemetry event
const response = await ingestTelemetry({
  vehicle_id: 'MH-07-AB-1234',
  timestamp: new Date().toISOString(),
  engine: {
    rpm: 2500,
    temperature: 85,
    oil_pressure: 45,
  },
  battery: {
    voltage: 12.6,
    state_of_charge: 85,
  },
})

if (response.status === 'success') {
  console.log('Telemetry ingested:', response.event_id)
}
```

### 2. Fetch Agent Data (Using Hooks)

```typescript
import { useAnomalyCases, useDiagnosisCases, useRCACases } from '@/hooks/use-agent-data'

function MyComponent() {
  const vehicleId = 'MH-07-AB-1234'
  
  // Fetch anomaly cases
  const { data: anomalies, loading, error } = useAnomalyCases(vehicleId)
  
  // Fetch diagnosis cases for a specific anomaly
  const { data: diagnoses } = useDiagnosisCases(anomalies[0]?.case_id, vehicleId)
  
  // Fetch RCA cases
  const { data: rcas } = useRCACases(anomalies[0]?.case_id, vehicleId)
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      <h2>Anomalies: {anomalies.length}</h2>
      <h2>Diagnoses: {diagnoses.length}</h2>
      <h2>RCAs: {rcas.length}</h2>
    </div>
  )
}
```

### 3. Real-time Updates

```typescript
import { useAnomalyCases } from '@/hooks/use-agent-data'

function RealTimeComponent() {
  const vehicleId = 'MH-07-AB-1234'
  
  // Enable real-time updates
  const { data, loading } = useAnomalyCases(vehicleId, true)
  
  // Data will automatically update when new anomalies are detected
  return <div>Anomalies: {data.length}</div>
}
```

### 4. Direct Firestore Access

```typescript
import {
  getAnomalyCases,
  getDiagnosisCases,
  getRCACases,
  getSchedulingCases,
  getEngagementCases,
  getFeedbackCases,
  getManufacturingCases,
} from '@/lib/api/firestore'

// Fetch data directly (useful for server components or one-time fetches)
const anomalies = await getAnomalyCases('MH-07-AB-1234')
const diagnoses = await getDiagnosisCases(anomalies[0]?.case_id)
const rcas = await getRCACases(anomalies[0]?.case_id)
```

## Available Hooks

### `useAnomalyCases(vehicleId?, realtime?)`
Fetches anomaly cases detected by the Data Analysis Agent.

### `useDiagnosisCases(caseId?, vehicleId?, realtime?)`
Fetches diagnosis cases from the Diagnosis Agent.

### `useRCACases(caseId?, vehicleId?, realtime?)`
Fetches root cause analysis cases from the RCA Agent.

### `useSchedulingCases(vehicleId?, status?, realtime?)`
Fetches scheduling cases from the Scheduling Agent.

### `useEngagementCases(vehicleId?, realtime?)`
Fetches customer engagement cases from the Engagement Agent.

### `useFeedbackCases(vehicleId?, caseId?, realtime?)`
Fetches feedback cases from the Feedback Agent.

### `useManufacturingCases(component?, realtime?)`
Fetches manufacturing insights from the Manufacturing Agent.

### `useTelemetryEvents(vehicleId, maxResults?, realtime?)`
Fetches telemetry events for a vehicle.

## Data Flow

1. **Telemetry Ingestion**: Frontend sends telemetry → `ingest_telemetry` Cloud Function
2. **Agent Processing**: Backend agents process data via Pub/Sub (automatic)
3. **Data Access**: Frontend reads results from Firestore collections
4. **Real-time Updates**: Frontend subscribes to Firestore for live updates

## Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://us-central1-navigo-27206.cloudfunctions.net
NEXT_PUBLIC_FIREBASE_PROJECT_ID=navigo-27206
```

## Example: Complete Agent Pipeline View

```typescript
import { useAnomalyCases, useDiagnosisCases, useRCACases, useSchedulingCases } from '@/hooks/use-agent-data'

function AgentPipelineView({ vehicleId }: { vehicleId: string }) {
  // Fetch all agent data
  const { data: anomalies } = useAnomalyCases(vehicleId, true)
  const caseId = anomalies[0]?.case_id
  
  const { data: diagnoses } = useDiagnosisCases(caseId, vehicleId, true)
  const { data: rcas } = useRCACases(caseId, vehicleId, true)
  const { data: schedules } = useSchedulingCases(vehicleId, undefined, true)
  
  return (
    <div>
      <h2>Agent Pipeline</h2>
      
      <section>
        <h3>Anomaly Detection</h3>
        {anomalies.map(anomaly => (
          <div key={anomaly.case_id}>
            {anomaly.anomaly_type} - {anomaly.severity}
          </div>
        ))}
      </section>
      
      <section>
        <h3>Diagnosis</h3>
        {diagnoses.map(diagnosis => (
          <div key={diagnosis.diagnosis_id}>
            {diagnosis.component} - RUL: {diagnosis.estimated_rul_days} days
          </div>
        ))}
      </section>
      
      <section>
        <h3>Root Cause Analysis</h3>
        {rcas.map(rca => (
          <div key={rca.rca_id}>
            {rca.root_cause} - Confidence: {rca.confidence}
          </div>
        ))}
      </section>
      
      <section>
        <h3>Scheduling</h3>
        {schedules.map(schedule => (
          <div key={schedule.scheduling_id}>
            Slot: {schedule.best_slot} - Type: {schedule.slot_type}
          </div>
        ))}
      </section>
    </div>
  )
}
```

## Error Handling

All hooks return `{ data, loading, error, refetch }`:

```typescript
const { data, loading, error, refetch } = useAnomalyCases(vehicleId)

if (loading) return <Spinner />
if (error) return <Error message={error.message} />
if (!data.length) return <EmptyState />

// Use data
return <DataView data={data} onRefresh={refetch} />
```

## TypeScript Types

All types are exported from `@/lib/api`:

```typescript
import type {
  AnomalyCase,
  DiagnosisCase,
  RCACase,
  SchedulingCase,
  EngagementCase,
  FeedbackCase,
  ManufacturingCase,
  TelematicsEvent,
} from '@/lib/api'
```
