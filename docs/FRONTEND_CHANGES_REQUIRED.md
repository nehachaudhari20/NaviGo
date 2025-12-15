# Frontend Changes Required for Autonomous Predictive Maintenance Flow

## Overview

This document lists all the frontend changes needed in each dashboard to implement the complete autonomous predictive maintenance flow.

---

## 1. Service Center Dashboard (`/service-center`)

### Current State
- ✅ Real-time telematics display (partial)
- ✅ Priority vehicle queue
- ✅ Active services list
- ❌ Human review queue (for low confidence)
- ❌ Feedback & validation section
- ❌ Telemetry monitoring panel

### Changes Required

#### A. Add Telemetry Monitoring Panel
**Location**: Top section of dashboard
**Component**: `components/service-center/telemetry-monitoring.tsx`

```typescript
// Features needed:
- Real-time sensor data display (Engine, Battery, Tires, GPS)
- Live updates every 1-5 seconds
- Anomaly indicators
- Connection status
- Data quality metrics
```

#### B. Add Human Review Queue
**Location**: Priority Management section
**Component**: `components/service-center/human-review-queue.tsx`

```typescript
// Features needed:
- List of vehicles with low confidence predictions (<85%)
- Confidence score display
- Review action buttons (Approve/Reject/Request More Info)
- Filter by confidence level
- Priority sorting
- Link to detailed prediction view
```

#### C. Add Feedback & Validation Section
**Location**: After Active Services
**Component**: `components/service-center/feedback-validation.tsx`

```typescript
// Features needed:
- Service completion form
- Prediction accuracy validation
- Customer feedback collection
- Match prediction vs actual issue
- Accuracy metrics display
- Feedback submission
```

#### D. Enhance Real-time Updates
**Location**: Throughout dashboard
**Changes**:
- Add WebSocket connection for real-time telemetry
- Auto-refresh every 5 seconds
- Show live status indicators

---

## 2. Predictive Maintenance Page (`/service-center/predictive-maintenance`)

### Current State
- ✅ Anomaly detection display
- ✅ Failure prediction cards
- ✅ Vehicle priority queue
- ✅ Real-time telematics
- ❌ RCA Reasoning panel
- ❌ Confidence check indicator
- ❌ Confidence-based routing

### Changes Required

#### A. Add RCA Reasoning Panel
**Location**: Right sidebar, below Vehicle Details
**Component**: `components/service-center/rca-reasoning.tsx`

```typescript
// Features needed:
- Root Cause Analysis display
- CAPA recommendations
- Historical pattern analysis
- Similar past cases
- Action recommendations
- Confidence breakdown
```

#### B. Add Confidence Check Indicator
**Location**: In each vehicle card
**Component**: Update existing vehicle card

```typescript
// Features needed:
- Confidence score badge (prominent)
- Color coding:
  - Green (≥85%): High confidence → Auto-action
  - Yellow (70-84%): Medium confidence → Review recommended
  - Red (<70%): Low confidence → Human review required
- Confidence breakdown tooltip
- Auto-action vs Manual review indicator
```

#### C. Add Confidence-Based Routing
**Location**: Vehicle card actions
**Changes**:
- If confidence ≥85%: Show "Autonomous Action" badge + link to Autonomous Scheduling
- If confidence <85%: Show "Human Review Required" badge + add to review queue
- Add "View RCA Analysis" button

#### D. Add Confidence Calculation Display
**Location**: Vehicle details panel
**Component**: `components/service-center/confidence-breakdown.tsx`

```typescript
// Features needed:
- Prediction confidence (40%)
- Historical accuracy (30%)
- Data quality (20%)
- Pattern match (10%)
- Overall confidence score
- Visual breakdown chart
```

---

## 3. Autonomous Scheduling Hub (`/service-center/autonomous-scheduling`)

### Current State
- ✅ AI-scheduled appointments
- ✅ Capacity optimization
- ✅ Conflict resolution
- ❌ Link from Predictive Maintenance
- ❌ Confidence score display in appointments

### Changes Required

#### A. Add Confidence Score to Appointments
**Location**: In each appointment card
**Changes**:
- Display confidence score badge
- Show "Auto-scheduled" indicator for high confidence
- Link back to prediction details

#### B. Add Source Tracking
**Location**: Appointment details
**Changes**:
- Show which prediction triggered this appointment
- Link to original vehicle prediction
- Show RCA reasoning that led to scheduling

---

## 4. Customer Engagement Tracker (`/service-center/customer-engagement`)

### Current State
- ✅ Voice conversation logs
- ✅ Engagement metrics
- ✅ Manual intervention queue
- ❌ Link to scheduled appointments
- ❌ Prediction context in conversations

### Changes Required

#### A. Add Prediction Context
**Location**: Conversation details
**Changes**:
- Show which prediction triggered the call
- Display confidence score
- Show predicted issue details
- Link to vehicle prediction

#### B. Add Appointment Link
**Location**: Conversation outcome
**Changes**:
- Link to scheduled appointment (if scheduled)
- Show appointment details
- Track conversion from call to appointment

---

## 5. Agentic AI Control Center (`/service-center/agentic-ai`)

### Current State
- ✅ Master Agent status
- ✅ Worker Agent monitoring
- ✅ Real-time activity log
- ❌ Learning Loop metrics
- ❌ Model performance tracking
- ❌ Accuracy improvement display

### Changes Required

#### A. Add Learning Loop Metrics
**Location**: New section below Worker Agents
**Component**: `components/service-center/learning-loop-metrics.tsx`

```typescript
// Features needed:
- Model accuracy trends
- Prediction accuracy over time
- Learning rate indicators
- Improvement metrics
- Retraining status
- Performance comparison (before/after)
```

#### B. Add Feedback Integration
**Location**: Activity log
**Changes**:
- Show feedback received from services
- Display validation results
- Track accuracy improvements
- Show learning events

---

## 6. Customer Dashboard (`/`)

### Current State
- ✅ Vehicle health indicators
- ✅ Service history
- ✅ Nearby providers
- ❌ AI prediction display
- ❌ Confidence indicators
- ❌ Autonomous scheduling notifications

### Changes Required

#### A. Add AI Prediction Card
**Location**: Below Vehicle Card
**Component**: `components/ai-prediction-card.tsx`

```typescript
// Features needed:
- Predicted issues display
- Confidence score
- Recommended action
- Time to failure estimate
- "Schedule Service" button (if high confidence)
- "Learn More" link
```

#### B. Add Autonomous Scheduling Notifications
**Location**: Notifications panel
**Changes**:
- Show when AI schedules appointment
- Display appointment details
- Allow confirmation/cancellation
- Show confidence score

#### C. Add Voice Call Notifications
**Location**: Notifications
**Changes**:
- Notify when AI calls customer
- Show call outcome
- Link to appointment (if scheduled)

---

## 7. Manufacturer Dashboard (`/manufacturer`)

### Current State
- ✅ Quality insights
- ✅ Defect rates
- ✅ Production status
- ❌ CAPA Feedback section
- ❌ Failure pattern analysis from service centers
- ❌ Design improvement recommendations

### Changes Required

#### A. Add CAPA Feedback Section
**Location**: New section in main dashboard
**Component**: `components/manufacturer/capa-feedback.tsx`

```typescript
// Features needed:
- Recurring defect patterns from service centers
- Component failure analysis
- Root cause patterns
- CAPA recommendations
- Design improvement suggestions
- Quality trend analysis
```

#### B. Add Service Center Feedback Integration
**Location**: Quality Insights section
**Changes**:
- Show feedback from service centers
- Display validated predictions
- Track component failure rates
- Compare with manufacturing data

#### C. Add Failure Pattern Visualization
**Location**: New chart section
**Component**: `components/manufacturer/failure-patterns.tsx`

```typescript
// Features needed:
- Component failure frequency
- Time-to-failure analysis
- Batch comparison
- Design flaw identification
- Improvement recommendations
```

---

## Summary of New Components Needed

### Service Center
1. `components/service-center/telemetry-monitoring.tsx` - Real-time telemetry display
2. `components/service-center/human-review-queue.tsx` - Low confidence review queue
3. `components/service-center/rca-reasoning.tsx` - Root cause analysis panel
4. `components/service-center/confidence-breakdown.tsx` - Confidence score breakdown
5. `components/service-center/feedback-validation.tsx` - Service feedback collection
6. `components/service-center/learning-loop-metrics.tsx` - AI learning metrics

### Customer
1. `components/ai-prediction-card.tsx` - AI predictions display

### Manufacturer
1. `components/manufacturer/capa-feedback.tsx` - CAPA feedback from service centers
2. `components/manufacturer/failure-patterns.tsx` - Failure pattern visualization

---

## API Endpoints Needed

### Service Center
- `GET /api/service-center/telemetry/:vehicleId` - Real-time telemetry
- `GET /api/service-center/predictions/low-confidence` - Low confidence predictions
- `GET /api/service-center/predictions/:id/rca` - RCA analysis
- `GET /api/service-center/predictions/:id/confidence` - Confidence breakdown
- `POST /api/service-center/feedback` - Submit service feedback
- `GET /api/service-center/learning-metrics` - Learning loop metrics

### Customer
- `GET /api/customer/predictions` - Customer vehicle predictions
- `GET /api/customer/autonomous-appointments` - AI-scheduled appointments

### Manufacturer
- `GET /api/manufacturer/capa-feedback` - CAPA feedback from services
- `GET /api/manufacturer/failure-patterns` - Failure pattern analysis

---

## WebSocket Events Needed

### Real-time Updates
- `telemetry:update` - Real-time telemetry data
- `prediction:new` - New prediction generated
- `prediction:confidence-update` - Confidence score updated
- `appointment:auto-scheduled` - AI scheduled appointment
- `voice:call-started` - Voice call initiated
- `voice:call-completed` - Voice call completed
- `service:feedback-received` - Service feedback submitted
- `learning:model-updated` - AI model retrained

---

## Priority Implementation Order

### Phase 1 (Critical - Flow Completion)
1. ✅ Confidence Check Indicator (Predictive Maintenance)
2. ✅ RCA Reasoning Panel (Predictive Maintenance)
3. ✅ Human Review Queue (Service Center Dashboard)
4. ✅ Confidence-based Routing (Predictive Maintenance → Autonomous Scheduling)

### Phase 2 (Important - User Experience)
5. ✅ Telemetry Monitoring Panel (Service Center Dashboard)
6. ✅ Feedback & Validation (Service Center Dashboard)
7. ✅ AI Prediction Card (Customer Dashboard)
8. ✅ Learning Loop Metrics (Agentic AI Control Center)

### Phase 3 (Enhancement - Advanced Features)
9. ✅ CAPA Feedback (Manufacturer Dashboard)
10. ✅ Failure Pattern Analysis (Manufacturer Dashboard)
11. ✅ Enhanced Real-time Updates (All Dashboards)
12. ✅ WebSocket Integration (All Dashboards)

---

## UI/UX Considerations

### Confidence Indicators
- Use consistent color coding across all dashboards
- Green (≥85%): Autonomous action
- Yellow (70-84%): Review recommended
- Red (<70%): Human review required

### Navigation Flow
- Clear path from Prediction → Review → Action
- Easy access to RCA analysis
- Quick links between related components

### Real-time Updates
- Subtle animations for live data
- Badge indicators for new updates
- Auto-refresh without page reload

### Mobile Responsiveness
- All new components must be mobile-friendly
- Collapsible sections for smaller screens
- Touch-friendly buttons and interactions

---

This document provides a complete roadmap for implementing the autonomous predictive maintenance flow in the frontend!

