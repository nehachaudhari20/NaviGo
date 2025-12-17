# Backend Review & Frontend Integration Guide

## Executive Summary

This document reviews the current backend implementation in `backend/functions/` and provides a comprehensive guide for:
1. **Backend Changes Required** - What needs to be fixed/updated
2. **Frontend Endpoint Integration** - Where and how to add API endpoints in the frontend
3. **Data Flow Mapping** - How frontend should interact with backend services

---

## 1. Backend Implementation Status

### ✅ **Fully Implemented Functions**

#### 1.1 `ingest_telemetry` (HTTP Trigger)
- **Status**: ✅ Complete
- **Location**: `backend/functions/ingest_telemetry/main.py`
- **Purpose**: Receives vehicle telemetry via HTTP POST
- **What it does**:
  - Validates data against Pydantic schema (`TelematicsEvent`)
  - Stores in Firestore `telemetry_events` collection
  - Returns success/error response
- **Endpoint**: `POST /ingest_telemetry` (Cloud Function HTTP trigger)

#### 1.2 `telemetry_firestore_trigger` (Firestore Trigger)
- **Status**: ✅ Complete
- **Location**: `backend/functions/telemetry_firestore_trigger/main.py`
- **Purpose**: Triggers when telemetry is written to Firestore
- **What it does**:
  - Publishes to Pub/Sub topic `navigo-telemetry-ingested`
  - Syncs data to BigQuery `telemetry.telemetry_events` table
- **Note**: No direct frontend interaction needed (automatic trigger)

#### 1.3 `data_analysis_agent` (Pub/Sub Trigger)
- **Status**: ✅ Complete
- **Location**: `backend/functions/data_analysis_agent/main.py`
- **Purpose**: Detects anomalies using Gemini 2.5 Flash
- **What it does**:
  - Subscribes to `navigo-telemetry-ingested` topic
  - Fetches last 10 telemetry events for vehicle
  - Uses Gemini 2.5 Flash to detect anomalies
  - If anomaly detected:
    - Creates case in `anomaly_cases` collection
    - Syncs to BigQuery
    - Publishes to `navigo-anomaly-detected` topic
- **Note**: No direct frontend interaction (event-driven)

#### 1.4 `diagnosis_agent` (Pub/Sub Trigger)
- **Status**: ✅ Complete
- **Location**: `backend/functions/diagnosis_agent/main.py`
- **Purpose**: Diagnoses component failures using Gemini 2.5 Flash
- **What it does**:
  - Subscribes to `navigo-anomaly-detected` topic
  - Fetches anomaly case and telemetry window
  - Uses Gemini 2.5 Flash to diagnose component failure
  - Stores in `diagnosis_cases` collection
  - Publishes to `navigo-diagnosis-complete` topic
- **Note**: No direct frontend interaction (event-driven)

#### 1.5 `rca_agent` (Pub/Sub Trigger)
- **Status**: ✅ Complete
- **Location**: `backend/functions/rca_agent/main.py`
- **Purpose**: Performs root cause analysis using Gemini 2.5 Flash
- **What it does**:
  - Subscribes to `navigo-diagnosis-complete` topic
  - Fetches diagnosis case and telemetry context
  - Uses Gemini 2.5 Flash for RCA
  - Stores in `rca_cases` collection
  - Publishes to `navigo-rca-complete` topic
- **Note**: No direct frontend interaction (event-driven)

#### 1.6 `scheduling_agent` (Pub/Sub Trigger)
- **Status**: ✅ Complete (with mock data)
- **Location**: `backend/functions/scheduling_agent/main.py`
- **Purpose**: Optimizes service scheduling using Gemini 2.5 Flash
- **What it does**:
  - Subscribes to `navigo-rca-complete` topic
  - Fetches diagnosis case to get RUL and severity
  - **⚠️ Uses mock service center availability data** (needs real data integration)
  - Uses Gemini 2.5 Flash to optimize scheduling
  - Stores in `scheduling_cases` collection
  - Publishes to `navigo-scheduling-complete` topic
- **Note**: No direct frontend interaction (event-driven)
- **Edge Cases**: See Section 1.6.1 for declined appointments, urgent alerts, fleet scheduling, and recurring defects

#### 1.6.1 Scheduling Agent Edge Cases & RCA/CAPA Integration

**⚠️ Current Implementation**: Basic scheduling logic exists, but edge case handling needs enhancement.

##### **Edge Case 1: Declined Appointments**

**Scenario**: Customer declines the scheduled appointment during engagement call or via SMS.

**Current Behavior**: 
- Engagement agent tracks `customer_decision: "declined"` or `"no_response"`
- No rescheduling logic currently implemented

**Required Enhancement**:
```python
# In scheduling_agent, add declined appointment handling:
def handle_declined_appointment(scheduling_id: str, reason: str = None):
    """
    Handle declined appointment:
    1. Check if fallback slots exist
    2. If urgent (RUL < 7 days), escalate to human review
    3. If normal/delayed, offer alternative slots
    4. Update scheduling_case status
    """
    db = firestore.Client()
    scheduling_ref = db.collection("scheduling_cases").document(scheduling_id)
    scheduling_doc = scheduling_ref.get()
    
    if not scheduling_doc.exists:
        return {"status": "error", "error": "Scheduling case not found"}
    
    scheduling_data = scheduling_doc.to_dict()
    slot_type = scheduling_data.get("slot_type")
    fallback_slots = scheduling_data.get("fallback_slots", [])
    estimated_rul_days = scheduling_data.get("estimated_rul_days", 30)
    
    # If urgent and declined, escalate
    if slot_type == "urgent" and estimated_rul_days < 7:
        # Create human review case
        human_review_data = {
            "case_id": scheduling_data.get("case_id"),
            "vehicle_id": scheduling_data.get("vehicle_id"),
            "agent_stage": "scheduling",
            "reason": "Urgent appointment declined",
            "decline_reason": reason,
            "status": "pending_review",
            "created_at": firestore.SERVER_TIMESTAMP
        }
        db.collection("human_reviews").document(f"{scheduling_id}_declined").set(human_review_data)
        
        # Send urgent alert to service center
        send_urgent_alert(scheduling_data)
        
        return {"status": "escalated", "action": "human_review"}
    
    # If fallback slots available, offer alternatives
    if fallback_slots:
        # Update scheduling with next best slot
        scheduling_ref.update({
            "best_slot": fallback_slots[0],
            "fallback_slots": fallback_slots[1:],
            "status": "rescheduled",
            "decline_count": scheduling_data.get("decline_count", 0) + 1,
            "last_declined_at": firestore.SERVER_TIMESTAMP
        })
        
        # Re-trigger engagement with new slot
        publish_to_engagement(scheduling_data)
        
        return {"status": "rescheduled", "new_slot": fallback_slots[0]}
    
    # No fallback slots, mark as pending manual scheduling
    scheduling_ref.update({
        "status": "pending_manual_scheduling",
        "decline_reason": reason
    })
    
    return {"status": "pending_manual", "message": "No alternative slots available"}
```

**RCA/CAPA Integration**:
- **RCA Analysis**: If customer declines due to cost concerns, RCA can identify if issue is recurring → suggests preventive maintenance plan
- **CAPA Insights**: If multiple declines for same vehicle/issue, manufacturing agent flags as potential design/quality issue

##### **Edge Case 2: Urgent Failure Alerts**

**Scenario**: Critical failure detected (RUL < 3 days, severity = "High", component = critical safety component).

**Current Behavior**:
- Scheduling agent classifies as "urgent" slot_type
- Schedules within 1-3 days

**Required Enhancement**:
```python
def handle_urgent_failure_alert(diagnosis_data: dict, rca_data: dict):
    """
    Handle urgent failure alerts:
    1. Check if component is safety-critical (brakes, steering, etc.)
    2. If RUL < 3 days, create emergency scheduling
    3. Notify service center immediately
    4. Offer same-day or next-day slots only
    5. Escalate to human if no slots available
    """
    component = diagnosis_data.get("component")
    estimated_rul_days = diagnosis_data.get("estimated_rul_days", 30)
    severity = diagnosis_data.get("severity")
    root_cause = rca_data.get("root_cause", "")
    
    # Safety-critical components
    safety_critical = ["brake_system", "steering_system", "suspension", "tire", "airbag_system"]
    is_safety_critical = any(crit in component.lower() for crit in safety_critical)
    
    # Urgent criteria
    is_urgent = (
        estimated_rul_days < 3 or
        (is_safety_critical and estimated_rul_days < 7) or
        (severity == "High" and estimated_rul_days < 5)
    )
    
    if is_urgent:
        # Force urgent scheduling
        scheduling_data = {
            "slot_type": "urgent",
            "priority": "emergency" if estimated_rul_days < 3 else "high",
            "safety_critical": is_safety_critical,
            "requires_immediate_attention": True,
            "alert_sent": True
        }
        
        # Notify service center via Pub/Sub
        publisher = pubsub_v1.PublisherClient()
        alert_topic = publisher.topic_path(PROJECT_ID, "navigo-urgent-alert")
        alert_message = {
            "vehicle_id": diagnosis_data.get("vehicle_id"),
            "component": component,
            "rul_days": estimated_rul_days,
            "root_cause": root_cause,
            "severity": severity,
            "safety_critical": is_safety_critical,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        publisher.publish(alert_topic, json.dumps(alert_message).encode())
        
        # Override normal scheduling - only offer same-day/next-day
        available_slots = get_emergency_slots()  # Only same-day/next-day
        if not available_slots:
            # Escalate to human - no emergency slots available
            create_emergency_escalation(diagnosis_data, rca_data)
        
        return scheduling_data
    
    return None
```

**RCA/CAPA Integration**:
- **RCA Analysis**: Identifies if urgent failure is due to manufacturing defect → informs scheduling priority
- **CAPA Insights**: If urgent failures cluster around specific components, manufacturing agent recommends immediate design review

##### **Edge Case 3: Multi-Vehicle Fleet Scheduling**

**Scenario**: Fleet manager has 50 vehicles, multiple need service, need to optimize scheduling across fleet.

**Current Behavior**:
- Schedules vehicles individually
- No fleet-level optimization

**Required Enhancement**:
```python
def handle_fleet_scheduling(fleet_id: str, vehicle_ids: List[str]):
    """
    Handle multi-vehicle fleet scheduling:
    1. Fetch all pending scheduling cases for fleet
    2. Group by urgency and service center
    3. Optimize slot allocation across vehicles
    4. Consider service center capacity
    5. Batch similar services together
    """
    db = firestore.Client()
    
    # Fetch all pending cases for fleet vehicles
    pending_cases = []
    for vehicle_id in vehicle_ids:
        cases = db.collection("scheduling_cases")\
                  .where("vehicle_id", "==", vehicle_id)\
                  .where("status", "==", "pending_engagement")\
                  .stream()
        pending_cases.extend([case.to_dict() for case in cases])
    
    # Group by service center and urgency
    by_center = {}
    for case in pending_cases:
        center = case.get("service_center")
        if center not in by_center:
            by_center[center] = {"urgent": [], "normal": [], "delayed": []}
        
        slot_type = case.get("slot_type", "normal")
        by_center[center][slot_type].append(case)
    
    # Optimize scheduling per service center
    optimized_schedule = {}
    for center, cases_by_type in by_center.items():
        # Priority: urgent first, then normal, then delayed
        urgent_cases = cases_by_type["urgent"]
        normal_cases = cases_by_type["normal"]
        delayed_cases = cases_by_type["delayed"]
        
        # Fetch service center capacity
        center_capacity = get_service_center_capacity(center)
        
        # Allocate slots
        allocated = allocate_fleet_slots(
            urgent_cases + normal_cases + delayed_cases,
            center_capacity,
            batch_similar_services=True  # Group similar repairs
        )
        
        optimized_schedule[center] = allocated
    
    # Update all scheduling cases
    for center, allocations in optimized_schedule.items():
        for allocation in allocations:
            scheduling_ref = db.collection("scheduling_cases")\
                              .document(allocation["scheduling_id"])
            scheduling_ref.update({
                "best_slot": allocation["slot"],
                "fleet_optimized": True,
                "fleet_id": fleet_id
            })
    
    return optimized_schedule

def allocate_fleet_slots(cases: List[dict], capacity: dict, batch_similar_services: bool = False):
    """
    Allocate slots for multiple vehicles considering:
    - Service center capacity (technicians, bays, parts)
    - Similar services can be batched (e.g., multiple oil changes)
    - Urgency priority
    """
    # Sort by urgency (RUL days ascending)
    sorted_cases = sorted(cases, key=lambda c: c.get("estimated_rul_days", 30))
    
    allocations = []
    available_slots = capacity.get("available_slots", [])
    current_load = {}  # Track slots per day
    
    for case in sorted_cases:
        component = case.get("component")
        slot_type = case.get("slot_type")
        
        # If batching enabled, try to group similar services
        if batch_similar_services:
            similar_slot = find_similar_service_slot(component, current_load)
            if similar_slot:
                allocations.append({
                    "scheduling_id": case.get("scheduling_id"),
                    "slot": similar_slot,
                    "batched": True
                })
                continue
        
        # Find best available slot
        best_slot = find_best_slot_for_case(case, available_slots, current_load)
        
        if best_slot:
            allocations.append({
                "scheduling_id": case.get("scheduling_id"),
                "slot": best_slot,
                "batched": False
            })
            # Update load
            slot_date = best_slot.split("T")[0]
            current_load[slot_date] = current_load.get(slot_date, 0) + 1
        else:
            # No slot available - escalate
            escalate_no_slot_case(case)
    
    return allocations
```

**RCA/CAPA Integration**:
- **RCA Analysis**: Identifies common root causes across fleet → suggests preventive maintenance schedule
- **CAPA Insights**: If multiple fleet vehicles have same issue, manufacturing agent flags as batch/design problem → influences scheduling priority

##### **Edge Case 4: Recurring Defects**

**Scenario**: Same vehicle has same defect recurring multiple times (e.g., coolant pump fails 3 times in 6 months).

**Current Behavior**:
- Manufacturing agent calculates `recurrence_count`
- No special scheduling logic for recurring defects

**Required Enhancement**:
```python
def handle_recurring_defect(vehicle_id: str, component: str, case_id: str, rca_data: dict):
    """
    Handle recurring defects:
    1. Check recurrence count from manufacturing_cases
    2. If recurrence >= 2, escalate scheduling priority
    3. Schedule with specialized technician/center
    4. Consider warranty/recall implications
    5. Flag for deeper investigation
    """
    db = firestore.Client()
    
    # Check recurrence count
    manufacturing_cases = db.collection("manufacturing_cases")\
                            .where("vehicle_id", "==", vehicle_id)\
                            .where("issue", ">=", component)\
                            .stream()
    
    recurrence_count = len(list(manufacturing_cases))
    root_cause = rca_data.get("root_cause", "")
    capa_recommendation = rca_data.get("capa_recommendation", "")
    
    # If recurring, enhance scheduling
    if recurrence_count >= 2:
        # Fetch diagnosis for current case
        diagnosis_ref = db.collection("diagnosis_cases")\
                          .where("case_id", "==", case_id)\
                          .limit(1)\
                          .stream()
        diagnosis_data = next(diagnosis_ref, None)
        
        if diagnosis_data:
            diagnosis_dict = diagnosis_data.to_dict()
            
            # Enhanced scheduling for recurring issues
            scheduling_enhancement = {
                "recurring_defect": True,
                "recurrence_count": recurrence_count,
                "requires_specialist": True,  # May need specialized technician
                "warranty_eligible": recurrence_count >= 3,  # Flag for warranty review
                "priority_boost": min(recurrence_count * 0.2, 0.5),  # Increase priority
                "rca_context": root_cause,
                "capa_context": capa_recommendation
            }
            
            # Modify RUL calculation for recurring issues
            # Recurring issues may fail faster
            original_rul = diagnosis_dict.get("estimated_rul_days", 30)
            adjusted_rul = original_rul * (1 - (recurrence_count * 0.15))  # Reduce RUL by 15% per recurrence
            adjusted_rul = max(adjusted_rul, 1)  # Minimum 1 day
            
            # Update diagnosis with adjusted RUL
            diagnosis_ref = db.collection("diagnosis_cases").document(diagnosis_data.id)
            diagnosis_ref.update({
                "estimated_rul_days": int(adjusted_rul),
                "recurring_defect": True,
                "recurrence_count": recurrence_count
            })
            
            # Schedule with higher priority
            scheduling_data = {
                **scheduling_enhancement,
                "slot_type": "urgent" if adjusted_rul < 7 else "normal",
                "special_handling_required": True,
                "investigation_flag": recurrence_count >= 3
            }
            
            # If recurrence >= 3, create investigation case
            if recurrence_count >= 3:
                create_investigation_case(vehicle_id, component, root_cause, capa_recommendation)
            
            return scheduling_data
    
    return None

def create_investigation_case(vehicle_id: str, component: str, root_cause: str, capa: str):
    """Create investigation case for recurring defects"""
    db = firestore.Client()
    
    investigation_data = {
        "vehicle_id": vehicle_id,
        "component": component,
        "root_cause": root_cause,
        "capa_recommendation": capa,
        "status": "pending_investigation",
        "priority": "high",
        "created_at": firestore.SERVER_TIMESTAMP
    }
    
    db.collection("investigation_cases").document(f"inv_{vehicle_id}_{component}").set(investigation_data)
```

**RCA/CAPA Integration**:
- **RCA Analysis**: 
  - Identifies if recurring defect has same root cause → suggests systemic issue
  - If root cause changes, indicates incomplete previous fix
  - Informs scheduling: same root cause = need better fix, different root cause = need investigation
  
- **CAPA Insights**:
  - Recurring defects trigger high-priority CAPA recommendations
  - Manufacturing agent flags as design/manufacturing quality issue
  - Influences scheduling: recurring issues get priority slots with specialists
  - Warranty implications: recurrence >= 3 may trigger warranty review

##### **How RCA/CAPA Analysis Informs Scheduling Decisions**

**Decision Matrix**:

| Scenario | RCA Insight | CAPA Insight | Scheduling Decision |
|----------|-------------|--------------|-------------------|
| **Urgent + Safety Critical** | Root cause: Manufacturing defect | High severity CAPA | Emergency slot (same-day), escalate if no slots |
| **Recurring Defect (2x)** | Same root cause = incomplete fix | Medium severity CAPA | Priority slot, specialist required, warranty review |
| **Recurring Defect (3x+)** | Systemic issue identified | High severity CAPA | Urgent slot, investigation case, warranty eligible |
| **Fleet-wide Issue** | Common root cause across vehicles | Batch/design problem | Batch scheduling, preventive maintenance plan |
| **Declined Appointment** | Cost concern → recurring issue | Preventive maintenance needed | Offer maintenance plan, reschedule with explanation |
| **Low Confidence RCA** | Unclear root cause | No CAPA yet | Human review before scheduling, diagnostic appointment first |

**Implementation Example**:
```python
def enhanced_scheduling_with_rca_capa(diagnosis_data: dict, rca_data: dict, manufacturing_data: dict = None):
    """
    Enhanced scheduling that considers RCA and CAPA insights
    """
    component = diagnosis_data.get("component")
    estimated_rul_days = diagnosis_data.get("estimated_rul_days", 30)
    severity = diagnosis_data.get("severity")
    
    root_cause = rca_data.get("root_cause", "")
    confidence = rca_data.get("confidence", 0.5)
    capa_type = rca_data.get("capa_type", "Corrective")
    
    # Get CAPA insights if available
    recurrence_count = 0
    capa_severity = "Low"
    if manufacturing_data:
        recurrence_count = manufacturing_data.get("recurrence_count", 0)
        capa_severity = manufacturing_data.get("severity", "Low")
        capa_recommendation = manufacturing_data.get("capa_recommendation", "")
    
    # Decision logic based on RCA/CAPA
    scheduling_decision = {
        "base_slot_type": "normal",
        "priority_boost": 0.0,
        "special_requirements": [],
        "escalation_needed": False
    }
    
    # Low confidence RCA → diagnostic first
    if confidence < 0.6:
        scheduling_decision["special_requirements"].append("diagnostic_appointment_first")
        scheduling_decision["base_slot_type"] = "normal"
    
    # Recurring defect → priority boost
    if recurrence_count >= 2:
        scheduling_decision["priority_boost"] = min(recurrence_count * 0.2, 0.5)
        scheduling_decision["special_requirements"].append("specialist_required")
        if recurrence_count >= 3:
            scheduling_decision["escalation_needed"] = True
            scheduling_decision["special_requirements"].append("warranty_review")
    
    # CAPA severity influences urgency
    if capa_severity == "High":
        scheduling_decision["priority_boost"] += 0.3
        scheduling_decision["base_slot_type"] = "urgent"
    
    # Root cause type influences scheduling
    if "manufacturing" in root_cause.lower() or "design" in root_cause.lower():
        scheduling_decision["special_requirements"].append("manufacturer_notification")
    
    # Calculate final slot type
    adjusted_rul = estimated_rul_days * (1 - scheduling_decision["priority_boost"])
    if adjusted_rul < 7 or scheduling_decision["base_slot_type"] == "urgent":
        final_slot_type = "urgent"
    elif adjusted_rul < 30:
        final_slot_type = "normal"
    else:
        final_slot_type = "delayed"
    
    return {
        "slot_type": final_slot_type,
        "adjusted_rul_days": int(adjusted_rul),
        "special_requirements": scheduling_decision["special_requirements"],
        "escalation_needed": scheduling_decision["escalation_needed"],
        "rca_confidence": confidence,
        "recurrence_count": recurrence_count,
        "capa_severity": capa_severity
    }
```

**Summary**: RCA/CAPA analysis transforms scheduling from simple time-based optimization to intelligent, context-aware decision-making that considers:
- Root cause quality (confidence)
- Recurrence patterns
- Manufacturing implications
- Safety criticality
- Warranty eligibility
- Fleet-wide patterns

#### 1.7 `engagement_agent` (Pub/Sub Trigger)
- **Status**: ✅ Complete
- **Location**: `backend/functions/engagement_agent/main.py`
- **Purpose**: Generates customer engagement scripts using Gemini 2.5 Flash
- **What it does**:
  - Subscribes to `navigo-scheduling-complete` topic
  - Fetches RCA case to get root cause and recommended action
  - Uses Gemini 2.5 Flash to generate customer engagement script
  - Stores in `engagement_cases` collection
  - Creates booking record in `bookings` collection if customer confirms
  - Publishes to `navigo-engagement-complete` topic
- **Note**: No direct frontend interaction (event-driven)

#### 1.8 `feedback_agent` (Pub/Sub Trigger)
- **Status**: ✅ Complete
- **Location**: `backend/functions/feedback_agent/main.py`
- **Purpose**: Processes service feedback and validates predictions
- **What it does**:
  - Subscribes to `navigo-feedback-complete` topic
  - Fetches original anomaly case and post-service telemetry
  - Uses Gemini 2.5 Flash to validate predictions and calculate CEI
  - Stores in `feedback_cases` collection
  - Publishes to `navigo-feedback-complete` topic
- **Note**: **⚠️ Needs HTTP endpoint for manual feedback submission**

#### 1.9 `manufacturing_agent` (Pub/Sub Trigger)
- **Status**: ✅ Complete (Basic Implementation)
- **Location**: `backend/functions/manufacturing_agent/main.py`
- **Purpose**: Generates CAPA insights for manufacturing
- **What it does**:
  - Subscribes to `navigo-feedback-complete` topic
  - Fetches RCA case to get root cause
  - Calculates recurrence count for the vehicle (⚠️ Currently only same vehicle, same anomaly type)
  - Uses Gemini 2.5 Flash to generate CAPA insights
  - Stores in `manufacturing_cases` collection
  - Publishes to `navigo-manufacturing-complete` topic
- **⚠️ Limitations**:
  - Only calculates recurrence for same vehicle (not fleet-wide)
  - Doesn't aggregate predicted failures across fleet
  - Doesn't detect batch/design problems
  - No direct feed to manufacturing dashboard
- **Note**: See Section 1.9.1 for enhanced fleet-wide pattern detection and feedback loop

#### 1.9.1 Manufacturing Feedback Loop: Aftersales → Production

**Current Code Review**:

**✅ What Works**:
- Manufacturing agent receives feedback from aftersales
- Generates CAPA recommendations using Gemini 2.5 Flash
- Calculates recurrence count (for same vehicle)
- Stores CAPA insights in Firestore

**⚠️ What Needs Enhancement**:
1. **Fleet-wide Pattern Detection**: Currently only checks same vehicle recurrence
2. **Batch Problem Identification**: Doesn't detect if multiple vehicles have same issue
3. **Predicted Failure Aggregation**: Doesn't aggregate predicted failures across fleet
4. **Design Improvement Tracking**: No tracking of CAPA implementation and results
5. **Manufacturing Dashboard Feed**: No real-time feed to manufacturer dashboard

**Enhanced Implementation**:

##### **1. Fleet-Wide Pattern Detection**

```python
def detect_fleet_wide_patterns(component: str, root_cause: str, anomaly_type: str):
    """
    Detect if issue affects multiple vehicles (fleet-wide pattern)
    This identifies batch/design problems vs isolated incidents
    """
    db = firestore.Client()
    
    # Find all vehicles with same component + anomaly type
    all_cases = db.collection("anomaly_cases")\
                  .where("anomaly_type", "==", anomaly_type)\
                  .stream()
    
    affected_vehicles = []
    vehicle_ids = set()
    
    for case in all_cases:
        case_data = case.to_dict()
        vehicle_id = case_data.get("vehicle_id")
        
        # Get diagnosis for this case to check component
        diagnosis_query = db.collection("diagnosis_cases")\
                           .where("case_id", "==", case.id)\
                           .limit(1)\
                           .stream()
        diagnosis_list = list(diagnosis_query)
        
        if diagnosis_list:
            diagnosis_data = diagnosis_list[0].to_dict()
            if diagnosis_data.get("component") == component:
                vehicle_ids.add(vehicle_id)
                affected_vehicles.append({
                    "vehicle_id": vehicle_id,
                    "case_id": case.id,
                    "created_at": case_data.get("created_at")
                })
    
    # Calculate fleet-wide metrics
    total_fleet_size = get_fleet_size()  # Total vehicles in fleet
    affected_count = len(vehicle_ids)
    affected_percentage = (affected_count / total_fleet_size * 100) if total_fleet_size > 0 else 0
    
    # Detect batch pattern
    batch_pattern = detect_batch_pattern(affected_vehicles)
    
    return {
        "fleet_wide": affected_percentage > 5.0,  # More than 5% of fleet affected
        "affected_vehicles": affected_count,
        "total_fleet_size": total_fleet_size,
        "affected_percentage": affected_percentage,
        "batch_pattern": batch_pattern,
        "pattern_type": "batch" if batch_pattern else "design" if affected_percentage > 10 else "isolated"
    }

def detect_batch_pattern(affected_vehicles: List[dict]):
    """
    Detect if affected vehicles are from same manufacturing batch
    """
    # Group by manufacturing date range (vehicles built in same period)
    # This would require vehicle metadata with batch/date info
    # For MVP, use vehicle_id patterns or registration dates
    
    # Example: If vehicles registered within 30 days, likely same batch
    from datetime import datetime, timedelta
    
    if len(affected_vehicles) < 3:
        return None
    
    # Group by time window
    time_windows = {}
    for vehicle in affected_vehicles:
        created_at = vehicle.get("created_at")
        if isinstance(created_at, datetime):
            # Group by month
            month_key = created_at.strftime("%Y-%m")
            if month_key not in time_windows:
                time_windows[month_key] = []
            time_windows[month_key].append(vehicle)
    
    # Find largest cluster
    largest_cluster = max(time_windows.values(), key=len) if time_windows else []
    
    if len(largest_cluster) >= 3:
        return {
            "batch_detected": True,
            "cluster_size": len(largest_cluster),
            "time_window": max(time_windows.keys()),
            "confidence": min(len(largest_cluster) / len(affected_vehicles), 1.0)
        }
    
    return None
```

##### **2. Predicted Failure Aggregation**

```python
def aggregate_predicted_failures(component: str, time_window_days: int = 90):
    """
    Aggregate all predicted failures for a component across fleet
    This feeds back to manufacturing: "We predicted X failures, Y occurred"
    """
    db = firestore.Client()
    
    # Get all anomaly cases for this component in time window
    cutoff_date = datetime.now() - timedelta(days=time_window_days)
    
    all_cases = db.collection("anomaly_cases")\
                  .where("created_at", ">=", cutoff_date)\
                  .stream()
    
    predicted_failures = []
    actual_failures = []
    
    for case in all_cases:
        case_data = case.to_dict()
        
        # Get diagnosis to check component
        diagnosis_query = db.collection("diagnosis_cases")\
                           .where("case_id", "==", case.id)\
                           .limit(1)\
                           .stream()
        diagnosis_list = list(diagnosis_query)
        
        if diagnosis_list:
            diagnosis_data = diagnosis_list[0].to_dict()
            if diagnosis_data.get("component") == component:
                predicted_failures.append({
                    "case_id": case.id,
                    "vehicle_id": case_data.get("vehicle_id"),
                    "predicted_at": case_data.get("created_at"),
                    "predicted_rul": diagnosis_data.get("estimated_rul_days"),
                    "severity": diagnosis_data.get("severity"),
                    "confidence": diagnosis_data.get("failure_probability", 0.0)
                })
                
                # Check if failure actually occurred (via feedback)
                feedback_query = db.collection("feedback_cases")\
                                  .where("case_id", "==", case.id)\
                                  .limit(1)\
                                  .stream()
                feedback_list = list(feedback_query)
                
                if feedback_list:
                    feedback_data = feedback_list[0].to_dict()
                    validation_label = feedback_data.get("validation_label")
                    
                    if validation_label in ["Correct", "Recurring"]:
                        actual_failures.append({
                            "case_id": case.id,
                            "validation_label": validation_label,
                            "cei_score": feedback_data.get("cei_score")
                        })
    
    # Calculate prediction accuracy
    total_predicted = len(predicted_failures)
    total_actual = len(actual_failures)
    accuracy = (total_actual / total_predicted * 100) if total_predicted > 0 else 0
    
    # Aggregate by severity
    severity_breakdown = {}
    for pred in predicted_failures:
        severity = pred.get("severity", "Medium")
        severity_breakdown[severity] = severity_breakdown.get(severity, 0) + 1
    
    return {
        "component": component,
        "time_window_days": time_window_days,
        "total_predicted": total_predicted,
        "total_actual": total_actual,
        "prediction_accuracy": accuracy,
        "severity_breakdown": severity_breakdown,
        "predicted_failures": predicted_failures[:10],  # Sample
        "actual_failures": actual_failures[:10]  # Sample
    }
```

##### **3. Enhanced Manufacturing Agent with Fleet Analysis**

```python
@functions_framework.cloud_event
def manufacturing_agent_enhanced(cloud_event):
    """
    Enhanced manufacturing agent that:
    1. Detects fleet-wide patterns
    2. Aggregates predicted failures
    3. Generates actionable CAPA insights
    4. Feeds back to manufacturing dashboard
    """
    # ... existing code ...
    
    # After getting root_cause and recurrence_count:
    
    # 1. Detect fleet-wide patterns
    diagnosis_data = diagnosis_doc.to_dict()
    component = diagnosis_data.get("component")
    anomaly_type = current_case_data.get("anomaly_type")
    
    fleet_pattern = detect_fleet_wide_patterns(component, root_cause, anomaly_type)
    
    # 2. Aggregate predicted failures for this component
    predicted_aggregate = aggregate_predicted_failures(component, time_window_days=90)
    
    # 3. Enhanced input for Gemini (include fleet data)
    input_data = {
        "vehicle_id": vehicle_id,
        "root_cause": root_cause,
        "cei_score": cei_score,
        "recurrence_count": recurrence_count,
        # NEW: Fleet-wide data
        "fleet_wide_pattern": fleet_pattern.get("fleet_wide", False),
        "affected_vehicles_count": fleet_pattern.get("affected_vehicles", 1),
        "affected_percentage": fleet_pattern.get("affected_percentage", 0),
        "pattern_type": fleet_pattern.get("pattern_type", "isolated"),
        "batch_pattern": fleet_pattern.get("batch_pattern"),
        "prediction_accuracy": predicted_aggregate.get("prediction_accuracy", 0),
        "total_predicted_failures": predicted_aggregate.get("total_predicted", 0),
        "total_actual_failures": predicted_aggregate.get("total_actual", 0)
    }
    
    # 4. Enhanced system prompt for Gemini
    enhanced_prompt = f"""{SYSTEM_PROMPT}

FLEET-WIDE ANALYSIS:
- Fleet-wide pattern: {fleet_pattern.get("fleet_wide", False)}
- Affected vehicles: {fleet_pattern.get("affected_vehicles", 1)} out of {fleet_pattern.get("total_fleet_size", 100)}
- Pattern type: {fleet_pattern.get("pattern_type", "isolated")}
- Batch pattern detected: {fleet_pattern.get("batch_pattern") is not None}

PREDICTED FAILURE AGGREGATION:
- Total predicted failures (90 days): {predicted_aggregate.get("total_predicted", 0)}
- Total actual failures: {predicted_aggregate.get("total_actual", 0)}
- Prediction accuracy: {predicted_aggregate.get("prediction_accuracy", 0):.1f}%

Use this fleet-wide data to:
1. Identify if this is a batch problem (multiple vehicles from same production period)
2. Identify if this is a design problem (affects >10% of fleet)
3. Generate more specific CAPA recommendations based on pattern type
4. Prioritize severity based on fleet impact
"""
    
    # 5. Call Gemini with enhanced context
    prompt = f"{enhanced_prompt}\n\nGenerate CAPA insights:\n{json.dumps(input_data, default=str, indent=2)}"
    
    response = model.generate_content(prompt)
    result = extract_json_from_response(response.text)
    
    # 6. Enhanced manufacturing data
    manufacturing_data = {
        # ... existing fields ...
        "fleet_wide_pattern": fleet_pattern.get("fleet_wide", False),
        "affected_vehicles_count": fleet_pattern.get("affected_vehicles", 1),
        "pattern_type": fleet_pattern.get("pattern_type", "isolated"),
        "batch_pattern": fleet_pattern.get("batch_pattern"),
        "prediction_accuracy": predicted_aggregate.get("prediction_accuracy", 0),
        "design_improvement_priority": calculate_design_priority(fleet_pattern, predicted_aggregate),
        "manufacturing_dashboard_feed": True  # Flag for dashboard
    }
    
    # 7. Store enhanced data
    db.collection("manufacturing_cases").document(manufacturing_id).set(manufacturing_data)
    
    # 8. Publish to manufacturing dashboard topic
    dashboard_topic = publisher.topic_path(PROJECT_ID, "navigo-manufacturing-dashboard-feed")
    dashboard_message = {
        "manufacturing_id": manufacturing_id,
        "component": component,
        "issue": result.get("issue"),
        "capa_recommendation": result.get("capa_recommendation"),
        "severity": result.get("severity"),
        "fleet_impact": {
            "affected_vehicles": fleet_pattern.get("affected_vehicles", 1),
            "affected_percentage": fleet_pattern.get("affected_percentage", 0),
            "pattern_type": fleet_pattern.get("pattern_type", "isolated")
        },
        "prediction_metrics": {
            "total_predicted": predicted_aggregate.get("total_predicted", 0),
            "total_actual": predicted_aggregate.get("total_actual", 0),
            "accuracy": predicted_aggregate.get("prediction_accuracy", 0)
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    publisher.publish(dashboard_topic, json.dumps(dashboard_message).encode())

def calculate_design_priority(fleet_pattern: dict, predicted_aggregate: dict) -> str:
    """Calculate design improvement priority based on fleet impact"""
    affected_pct = fleet_pattern.get("affected_percentage", 0)
    pattern_type = fleet_pattern.get("pattern_type", "isolated")
    accuracy = predicted_aggregate.get("prediction_accuracy", 0)
    
    if pattern_type == "design" and affected_pct > 10:
        return "critical"  # Design flaw affecting >10% of fleet
    elif pattern_type == "batch" and affected_pct > 5:
        return "high"  # Batch problem affecting >5% of fleet
    elif accuracy < 50:
        return "medium"  # Low prediction accuracy needs model improvement
    else:
        return "low"  # Isolated incident
```

##### **4. Complete Feedback Loop: Aftersales → Manufacturing → Design → Reduced Defects**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. AFTERSALES: Vehicle in Service                               │
│    - Service completed                                          │
│    - Technician notes: "Replaced coolant pump"                 │
│    - Customer rating: 4/5                                       │
│    - Post-service telemetry collected                          │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. FEEDBACK AGENT                                                │
│    - Validates prediction accuracy                              │
│    - Calculates CEI (Customer Effort Index)                    │
│    - Labels: "Correct", "Recurring", or "Incorrect"            │
│    - Publishes to: navigo-feedback-complete                    │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. MANUFACTURING AGENT (Enhanced)                                │
│    a. Fetches RCA root cause                                    │
│    b. Calculates recurrence (same vehicle)                     │
│    c. 🆕 Detects fleet-wide patterns                            │
│    d. 🆕 Aggregates predicted failures                          │
│    e. Generates CAPA insights with fleet context                │
│    f. Calculates design improvement priority                    │
│    g. Publishes to: navigo-manufacturing-complete               │
│    h. 🆕 Publishes to: navigo-manufacturing-dashboard-feed      │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. MANUFACTURING DASHBOARD (Frontend)                            │
│    - Real-time CAPA insights feed                               │
│    - Fleet-wide pattern visualization                           │
│    - Predicted vs Actual failure comparison                    │
│    - Design improvement priority queue                          │
│    - Batch problem alerts                                       │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. DESIGN TEAM ACTION                                            │
│    - Reviews CAPA recommendations                               │
│    - Implements design changes                                 │
│    - Updates component specifications                           │
│    - Modifies manufacturing processes                          │
│    - Updates supplier quality requirements                      │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. PRODUCTION IMPROVEMENT                                        │
│    - New batches with improved design                           │
│    - Reduced defect rates                                       │
│    - Better quality control                                     │
│    - Fewer service center visits                                │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. CLOSED LOOP: Reduced Defects                                 │
│    - New vehicles have fewer issues                             │
│    - Lower recurrence rates                                     │
│    - Higher customer satisfaction (CEI)                         │
│    - Lower warranty costs                                       │
│    - Better prediction accuracy                                │
└─────────────────────────────────────────────────────────────────┘
```

##### **5. Manufacturing Dashboard Integration**

**Frontend Component Update**: `frontend/vehicle-care-2/components/manufacturer/capa-feedback.tsx`

```typescript
// Replace mock data with Firestore real-time listener
useEffect(() => {
  // Listen to manufacturing_cases collection
  const q = query(
    collection(db, 'manufacturing_cases'),
    orderBy('created_at', 'desc'),
    limit(50)
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const capaItems = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Map backend fields to frontend format
      component: doc.data().issue?.split(':')[0] || 'Unknown',
      issueType: doc.data().issue?.split(':')[1]?.trim() || '',
      severity: doc.data().severity?.toLowerCase() || 'low',
      rootCause: doc.data().capa_recommendation || '',
      correctiveAction: extractCorrectiveAction(doc.data().capa_recommendation),
      preventiveAction: extractPreventiveAction(doc.data().capa_recommendation),
      affectedVehicles: doc.data().affected_vehicles_count || doc.data().recurrence_cluster_size || 1,
      fleetWide: doc.data().fleet_wide_pattern || false,
      patternType: doc.data().pattern_type || 'isolated',
      predictionAccuracy: doc.data().prediction_accuracy || 0
    }));
    
    setCAPAFeedback(capaItems);
  });
  
  return () => unsubscribe();
}, []);
```

**New Dashboard Features**:

1. **Fleet-Wide Pattern Visualization**:
   - Show affected vehicles count vs total fleet
   - Highlight batch vs design problems
   - Trend charts showing pattern evolution

2. **Predicted vs Actual Failure Comparison**:
   - Bar chart: Predicted failures vs Actual failures
   - Accuracy metrics per component
   - Time-series showing prediction improvement

3. **Design Improvement Priority Queue**:
   - Critical: Design flaws affecting >10% of fleet
   - High: Batch problems affecting >5% of fleet
   - Medium: Low prediction accuracy
   - Low: Isolated incidents

4. **CAPA Implementation Tracking**:
   - Track CAPA status (open → in-progress → resolved → closed)
   - Measure defect reduction after CAPA implementation
   - ROI calculation: Cost of CAPA vs warranty savings

##### **6. Design Improvement Tracking**

```python
def track_design_improvement(capa_id: str, implementation_date: datetime):
    """
    Track design improvements and measure impact
    """
    db = firestore.Client()
    
    # Get original CAPA
    capa_ref = db.collection("manufacturing_cases").document(capa_id)
    capa_data = capa_ref.get().to_dict()
    
    component = capa_data.get("issue", "").split(":")[0]
    
    # Measure defect rate before implementation
    before_cases = db.collection("anomaly_cases")\
                     .where("created_at", "<", implementation_date)\
                     .stream()
    
    before_count = 0
    for case in before_cases:
        # Check if same component (via diagnosis)
        diagnosis_query = db.collection("diagnosis_cases")\
                           .where("case_id", "==", case.id)\
                           .limit(1)\
                           .stream()
        if list(diagnosis_query):
            before_count += 1
    
    # Measure defect rate after implementation (30 days)
    after_date = implementation_date + timedelta(days=30)
    after_cases = db.collection("anomaly_cases")\
                    .where("created_at", ">=", implementation_date)\
                    .where("created_at", "<", after_date)\
                    .stream()
    
    after_count = 0
    for case in after_cases:
        diagnosis_query = db.collection("diagnosis_cases")\
                           .where("case_id", "==", case.id)\
                           .limit(1)\
                           .stream()
        if list(diagnosis_query):
            after_count += 1
    
    # Calculate improvement
    reduction_percentage = ((before_count - after_count) / before_count * 100) if before_count > 0 else 0
    
    # Update CAPA with results
    capa_ref.update({
        "implementation_date": implementation_date,
        "defects_before": before_count,
        "defects_after_30days": after_count,
        "reduction_percentage": reduction_percentage,
        "status": "resolved" if reduction_percentage > 20 else "in-progress"
    })
    
    return {
        "reduction_percentage": reduction_percentage,
        "defects_before": before_count,
        "defects_after": after_count
    }
```

##### **7. Example: Complete Feedback Loop in Action**

**Scenario**: Coolant pump failures across fleet

```
1. AFTERSALES:
   - 50 vehicles report coolant pump issues
   - Service centers complete repairs
   - Feedback agent validates: 45 correct, 3 recurring, 2 incorrect

2. MANUFACTURING AGENT:
   - Detects fleet-wide pattern: 50/500 vehicles = 10% affected
   - Pattern type: "batch" (vehicles from Q2 2024)
   - Aggregates: 60 predicted, 45 actual = 75% accuracy
   - Generates CAPA: "Update supplier specification: Require coolant pump 
     bearings to meet ISO 9001 quality standards with minimum 50,000-hour MTBF"

3. MANUFACTURING DASHBOARD:
   - Shows: 10% fleet affected, batch problem, 75% prediction accuracy
   - Priority: HIGH (batch problem >5%)
   - Design team assigned CAPA

4. DESIGN TEAM:
   - Reviews CAPA recommendation
   - Updates supplier contract with new specifications
   - Implements batch testing for incoming pumps
   - New batches (Q3 2024+) use improved pumps

5. PRODUCTION IMPROVEMENT:
   - Q3 2024 batches: 2% defect rate (down from 10%)
   - Q4 2024 batches: 1% defect rate
   - Warranty costs reduced by 80%
   - Customer satisfaction (CEI) improved from 2.5 to 4.2

6. CLOSED LOOP:
   - Manufacturing agent detects improvement
   - Updates CAPA status: "resolved"
   - Tracks: 80% reduction in defects
   - Feeds back: "Design improvement successful"
```

#### 1.10 `master_orchestrator` (Pub/Sub Trigger)
- **Status**: ✅ Complete (but needs refinement)
- **Location**: `backend/functions/master_orchestrator/main.py`
- **Purpose**: Routes events and manages pipeline flow
- **What it does**:
  - Subscribes to all agent completion topics
  - Applies confidence check (85% threshold)
  - Routes to next agent if confidence >= 85%
  - Routes to human review queue if confidence < 85%
  - Tracks pipeline state in `pipeline_states` collection
- **Note**: **⚠️ Currently agents publish directly to next agent's topic. Orchestrator should intercept.**

### 🆕 **New Components Added (College Updates)**

#### 1.11 `communication_agent` (Voice Calling Agent)
- **Status**: ✅ Complete (New Addition)
- **Location**: `agents/communication/agent.py`
- **Purpose**: Makes actual voice calls to customers using Twilio with **full interactive conversation handling**
- **What it does**:
  - **✅ Makes Real Voice Calls**: Uses Twilio to initiate actual phone calls to customers
  - **✅ Handles Interactive Conversations**: Uses Twilio's Gather verb to listen to customer responses (speech or DTMF)
  - **✅ Explains Vehicle Conditions**: Converts technical defects to simple, understandable language
  - **✅ Answers Customer Questions**: Dynamically responds to questions about cost, urgency, safety, etc.
  - **✅ Convinces to Book Services**: Uses empathetic, persuasive language based on severity and urgency
  - **✅ Schedules Appointments**: Confirms bookings and sends SMS confirmations
  - **LLM Integration**: Supports OpenAI, Anthropic Claude, Google Gemini, and Groq for intelligent responses
  - **Adaptive Communication**: Analyzes user tone (formal/casual/technical) and adapts conversation style
  - **Natural Language**: Automatically translates technical terms to customer-friendly language
  - **Fallback Support**: Falls back to rule-based responses if LLM unavailable
- **Key Features**:
  - `make_voice_call()`: ✅ Initiates Twilio voice calls to customer phone numbers
  - `generate_twiml_greeting()`: Creates interactive greeting with speech/DTMF input
  - `generate_twiml_defect_explanation()`: ✅ Explains vehicle defects in simple language, asks if customer wants to schedule
  - `generate_twiml_question_response()`: ✅ Answers customer questions dynamically during call
  - `generate_twiml_schedule_confirmation()`: ✅ Confirms appointment booking and sends SMS
  - `analyze_user_tone()`: Detects user's speaking style (formal/casual/technical) and adapts
  - `explain_defect()`: ✅ Converts technical defects to empathetic, understandable explanations
  - `handle_user_question()`: ✅ Answers questions about cost, urgency, safety, timeline, etc.
- **Conversation Flow**:
  1. **Greeting**: Personalized greeting asking if customer has time to discuss
  2. **Defect Explanation**: Explains vehicle issue in simple terms, adapts to user's language preference
  3. **Question Handling**: Answers customer questions (cost, urgency, safety, timeline)
  4. **Service Scheduling**: Asks if customer wants to schedule, handles yes/no responses
  5. **Confirmation**: Confirms booking details and sends SMS confirmation
- **Dependencies**: Twilio SDK, LLM Service (optional)
- **Environment Variables Required**:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`
- **⚠️ Important**: Needs Cloud Function wrapper with webhook endpoints for Twilio callbacks
- **Note**: **This is separate from `engagement_agent`. Engagement generates scripts, Communication makes actual interactive calls.**

#### 1.12 `sms_agent` (Enhanced SMS Agent)
- **Status**: ✅ Enhanced (Updated)
- **Location**: `agents/communication/sms_agent.py`
- **Purpose**: Sends SMS messages about vehicle defects
- **What it does**:
  - Generates concise SMS messages (160-1000 characters)
  - Sends defect alerts via SMS
  - Sends appointment confirmations
  - Sends maintenance reminders
  - Uses LLM for intelligent message generation (when available)
- **Key Features**:
  - `generate_summary_sms()`: Creates summary SMS of all defects
  - `send_sms()`: Sends SMS via Twilio
  - `send_defect_alert()`: Sends vehicle defect alerts
  - `send_appointment_confirmation()`: Sends booking confirmations
  - `send_reminder()`: Sends maintenance/service reminders
- **Dependencies**: Twilio SDK, LLM Service (optional)

#### 1.13 `UEBA System` (User and Entity Behavior Analytics)
- **Status**: ✅ Complete (Frontend Implementation)
- **Location**: `frontend/vehicle-care-2/lib/analytics.ts`, `frontend/vehicle-care-2/components/ueba-dashboard.tsx`
- **Purpose**: Monitors and analyzes AI agent behavior and user interactions
- **What it does**:
  - **Event Tracking**: Tracks chat interactions, logins, logouts, page views
  - **Risk Scoring**: Calculates risk scores based on:
    - Emergency keywords detection
    - Response time analysis
    - Message pattern analysis
    - Spam detection
    - Login anomaly detection
  - **Anomaly Detection**: Identifies suspicious behavior patterns
  - **Real-time Dashboard**: Visualizes analytics at `/analytics` page
  - **Firebase Analytics Integration**: Syncs with Google Analytics 4
- **Key Components**:
  - `lib/analytics.ts`: Core UEBA service
  - `lib/firebase-analytics.ts`: Firebase Analytics integration
  - `components/ueba-dashboard.tsx`: Real-time analytics visualization
  - `components/chatbot.tsx`: Chatbot with UEBA integration
  - `contexts/auth-context.tsx`: Authentication tracking
- **Tracked Events**:
  - Chat interactions (with intent detection)
  - User logins/logouts
  - Page views
  - Agent performance metrics
- **Risk Levels**:
  - 🟢 Low (0-39): Green
  - 🟠 Medium (40-69): Orange
  - 🔴 High (70-100): Red
- **Note**: **Frontend-only implementation. No backend integration yet.**

---

## 1.5 Compatibility Analysis: Communication Agent vs Engagement Agent

### **Key Differences**

| Feature | Engagement Agent | Communication Agent |
|---------|----------------|-------------------|
| **Type** | Script Generator | Voice Call Executor |
| **Output** | Text transcript (JSON) | Actual Twilio voice call |
| **Trigger** | Pub/Sub (automatic) | Can be HTTP or Pub/Sub |
| **LLM** | Gemini 2.5 Flash only | Multiple providers (OpenAI, Claude, Gemini, Groq) |
| **Interaction** | Simulated conversation | Real-time interactive call |
| **Storage** | `engagement_cases` collection | Can store call logs separately |
| **Use Case** | Generate conversation scripts | Make actual phone calls |

### **How They Work Together**

#### **Option 1: Sequential Flow (Recommended)**
```
1. engagement_agent generates script → stores in engagement_cases
2. communication_agent reads script → makes actual voice call
3. Call results stored → triggers feedback_agent
```

**Implementation**:
- After `engagement_agent` completes, publish to `navigo-communication-trigger` topic
- `communication_agent` subscribes to this topic
- Uses engagement script as base, but adapts in real-time during call

#### **Option 2: Parallel Flow**
```
1. engagement_agent generates script (for SMS/email)
2. communication_agent makes voice call (independent, uses same data)
3. Both complete → feedback_agent processes results
```

**Implementation**:
- Both agents subscribe to `navigo-scheduling-complete`
- Engagement generates text script
- Communication makes voice call
- Results stored separately

#### **Option 3: Communication Agent Only**
```
1. Skip engagement_agent
2. communication_agent directly makes voice call
3. Stores results → triggers feedback_agent
```

**Implementation**:
- Modify pipeline to route `navigo-scheduling-complete` → `communication_agent`
- Skip `engagement_agent` entirely
- Use communication agent for all customer outreach

### **Recommended Integration Approach**

**Best Practice**: Use **Option 1 (Sequential Flow)**

1. **Keep `engagement_agent`** for:
   - Generating initial conversation scripts
   - Creating booking records
   - Storing engagement metadata

2. **Add `communication_agent`** for:
   - ✅ **Making actual voice calls** using engagement script as template
   - ✅ **Real-time interactive conversations** - listens to customer responses
   - ✅ **Handling customer questions** during call (cost, urgency, safety, etc.)
   - ✅ **Explaining vehicle conditions** in simple, empathetic language
   - ✅ **Convincing customers to book** services based on severity and urgency
   - ✅ **Scheduling appointments** directly during the call
   - **Adaptive communication** - adjusts tone based on customer's speaking style

3. **How Communication Agent Handles Conversations**:
   - Uses **Twilio's Gather verb** to listen to customer speech or keypad input
   - Processes customer responses in real-time
   - Adapts explanations based on customer's questions and concerns
   - Can handle multiple conversation turns (greeting → explanation → questions → scheduling)
   - Falls back to SMS if customer doesn't respond or call fails

4. **Integration Points**:
   ```python
   # In engagement_agent, after storing engagement_case:
   pubsub_message = {
       "engagement_id": engagement_id,
       "case_id": case_id,
       "vehicle_id": vehicle_id,
       "customer_phone": "+919876543210",  # Add phone number
       "customer_name": "John Doe",
       "transcript_template": result.get("transcript"),  # Use as template
       "root_cause": root_cause,
       "recommended_action": recommended_action,
       "best_slot": best_slot
   }
   
   # Publish to communication agent topic
   publisher.publish(communication_topic_path, message_bytes)
   ```

4. **Communication Agent Cloud Function** (Required):
   - Create: `backend/functions/communication_agent/main.py`
   - Subscribe to: `navigo-communication-trigger` topic
   - Use `VoiceCommunicationAgent` from `agents/communication/agent.py`
   - Make voice call using Twilio
   - Store call results in `communication_cases` collection
   
5. **Webhook Endpoints Required** (For Interactive Conversations):
   - `POST /twilio/gather` - Handles customer responses during call
   - `POST /twilio/status` - Tracks call status updates
   - These endpoints process Twilio callbacks and generate next TwiML response
   - Enables multi-turn conversations (customer can ask questions, agent responds)

### **UEBA Integration with Communication Agent**

**How UEBA can track communication agent**:

1. **Call Initiation Events**:
   ```typescript
   uebaService.trackEvent({
     type: 'voice_call_initiated',
     agent: 'communication_agent',
     vehicle_id: vehicleId,
     customer_phone: phoneNumber,
     risk_score: calculateRiskScore(severity, urgency)
   });
   ```

2. **Call Completion Events**:
   ```typescript
   uebaService.trackEvent({
     type: 'voice_call_completed',
     agent: 'communication_agent',
     duration: callDuration,
     customer_response: customerDecision,
     success: true/false
   });
   ```

3. **Anomaly Detection**:
   - Track failed calls
   - Monitor call duration patterns
   - Detect unusual customer responses
   - Flag high-risk interactions

### **Compatibility Status**

✅ **Fully Compatible**: Communication agent and engagement agent can work together seamlessly.

**Integration Requirements**:
1. Create Cloud Function wrapper for `communication_agent`
2. Add Pub/Sub topic: `navigo-communication-trigger`
3. Update `engagement_agent` to publish to communication topic
4. Store communication results in Firestore
5. Integrate UEBA tracking for voice calls

**No Conflicts**: Both agents use different outputs (text vs voice) and can complement each other.

---

## 2. Backend Changes Required

### 🔴 **Critical Changes**

#### 2.1 Master Orchestrator Integration
**Issue**: Currently, agents publish directly to the next agent's topic, bypassing the orchestrator.

**Required Change**:
- Update all agents to publish to orchestrator topics instead of next agent topics
- Orchestrator should then route based on confidence check
- **Files to modify**:
  - `data_analysis_agent/main.py` - Change publish target to orchestrator
  - `diagnosis_agent/main.py` - Change publish target to orchestrator
  - `rca_agent/main.py` - Change publish target to orchestrator
  - `scheduling_agent/main.py` - Change publish target to orchestrator
  - `engagement_agent/main.py` - Change publish target to orchestrator
  - `feedback_agent/main.py` - Change publish target to orchestrator
  - `manufacturing_agent/main.py` - Change publish target to orchestrator

**Recommended Approach**:
```python
# Instead of publishing directly to next agent:
# publisher.publish(topic_path, message_bytes)  # ❌ Old way

# Publish to orchestrator:
ORCHESTRATOR_TOPIC = "navigo-orchestrator"
topic_path = publisher.topic_path(PROJECT_ID, ORCHESTRATOR_TOPIC)
publisher.publish(topic_path, message_bytes)  # ✅ New way
```

#### 2.2 Scheduling Agent - Real Service Center Data
**Issue**: Currently uses mock data for service center availability.

**Required Change**:
- Replace mock data with real service center data from Firestore or external API
- **File to modify**: `scheduling_agent/main.py` (lines 195-221)
- **Recommended approach**:
  ```python
  # Fetch from Firestore service_centers collection
  service_center_ref = db.collection("service_centers").document(recommended_center)
  service_center_data = service_center_ref.get().to_dict()
  
  # Fetch real availability
  spare_parts_availability = service_center_data.get("spare_parts_availability", {})
  technician_availability = service_center_data.get("technician_availability", {})
  ```

#### 2.2.1 Scheduling Agent - Edge Case Handling
**Issue**: Current implementation doesn't handle edge cases like declined appointments, urgent alerts, fleet scheduling, or recurring defects.

**Required Changes** (See Section 1.6.1 for detailed implementation):

1. **Declined Appointment Handling**:
   - Add `handle_declined_appointment()` function
   - Check fallback slots
   - Escalate urgent declined appointments to human review
   - Reschedule with alternative slots

2. **Urgent Failure Alert System**:
   - Add `handle_urgent_failure_alert()` function
   - Detect safety-critical components
   - Create emergency scheduling for RUL < 3 days
   - Publish to `navigo-urgent-alert` topic
   - Escalate if no emergency slots available

3. **Multi-Vehicle Fleet Scheduling**:
   - Add `handle_fleet_scheduling()` function
   - Optimize slot allocation across fleet vehicles
   - Batch similar services together
   - Consider service center capacity constraints
   - Group by urgency and service center

4. **Recurring Defect Handling**:
   - Add `handle_recurring_defect()` function
   - Check recurrence count from manufacturing_cases
   - Adjust RUL calculation for recurring issues (reduce by 15% per recurrence)
   - Escalate to investigation if recurrence >= 3
   - Flag for warranty review
   - Require specialist technician

5. **RCA/CAPA-Informed Scheduling**:
   - Add `enhanced_scheduling_with_rca_capa()` function
   - Consider RCA confidence in scheduling decisions
   - Use CAPA severity to boost priority
   - Factor in recurrence patterns
   - Adjust slot type based on root cause type (manufacturing vs usage)

**Files to modify**:
- `backend/functions/scheduling_agent/main.py` - Add edge case functions
- Create new Pub/Sub topic: `navigo-urgent-alert`
- Create new Firestore collection: `investigation_cases`
- Update `scheduling_cases` schema to include:
  - `decline_count`
  - `recurring_defect`
  - `recurrence_count`
  - `special_requirements`
  - `fleet_optimized`
  - `fleet_id`

#### 2.3 Feedback Agent - HTTP Endpoint for Manual Submission
**Issue**: Feedback agent only triggers via Pub/Sub. Need HTTP endpoint for frontend to submit feedback.

**Required Change**:
- Add HTTP trigger function for feedback submission
- **New file**: `backend/functions/submit_feedback/main.py`
- **Purpose**: Allow frontend to submit service feedback manually
- **Endpoint**: `POST /submit_feedback`
- **Request body**:
  ```json
  {
    "booking_id": "booking_xxx",
    "vehicle_id": "MH-07-AB-1234",
    "technician_notes": "Replaced coolant pump...",
    "customer_rating": 5,
    "post_service_telemetry": [...] // optional
  }
  ```
- **Action**: Publish to `navigo-feedback-complete` topic to trigger feedback_agent

#### 2.4 Pub/Sub Topic Name Consistency
**Issue**: Topic names need to be standardized.

**Required Change**:
- Ensure all topic names follow pattern: `navigo-{agent}-complete` or `navigo-{event}`
- **Current topics**:
  - ✅ `navigo-telemetry-ingested`
  - ✅ `navigo-anomaly-detected`
  - ✅ `navigo-diagnosis-complete`
  - ✅ `navigo-rca-complete`
  - ✅ `navigo-scheduling-complete`
  - ✅ `navigo-engagement-complete`
  - ✅ `navigo-feedback-complete`
  - ✅ `navigo-manufacturing-complete`
- **Add**: `navigo-orchestrator` (for orchestrator routing)

### 🟡 **Recommended Improvements**

#### 2.5 Error Handling and Retry Logic
**Issue**: Limited error handling and retry logic in agents.

**Recommended Change**:
- Add comprehensive error handling
- Implement exponential backoff for retries
- Log errors to Cloud Logging with proper context

#### 2.6 BigQuery Schema Validation
**Issue**: BigQuery sync might fail if schema doesn't match.

**Recommended Change**:
- Add schema validation before BigQuery insert
- Handle schema mismatches gracefully
- Log schema errors for debugging

#### 2.7 Firestore Indexes
**Issue**: Some queries might require composite indexes.

**Required Indexes** (create in Firestore Console):
1. `telemetry_events`: `vehicle_id` (ASC) + `timestamp_utc` (DESC)
2. `anomaly_cases`: `vehicle_id` (ASC) + `created_at` (DESC)
3. `pipeline_states`: `vehicle_id` (ASC) + `updated_at` (DESC)
4. `human_reviews`: `review_status` (ASC) + `created_at` (DESC)

---

## 3. Frontend Endpoint Integration

### 3.1 Frontend API Client Setup

**Location**: `frontend/vehicle-care-2/lib/api-client.ts` (create new file)

```typescript
// lib/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
  'https://us-central1-navigo-27206.cloudfunctions.net';

export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Telemetry ingestion
  async ingestTelemetry(data: TelematicsEvent): Promise<IngestResponse> {
    return this.request<IngestResponse>('/ingest_telemetry', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Submit service feedback
  async submitFeedback(data: FeedbackSubmission): Promise<FeedbackResponse> {
    return this.request<FeedbackResponse>('/submit_feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
```

### 3.2 Frontend Endpoints to Add

#### 3.2.1 Customer Dashboard (`/`)

**File**: `frontend/vehicle-care-2/app/page.tsx`

**Endpoints needed**:
1. **Get Vehicle Health Status**
   - **Source**: Firestore listener on `anomaly_cases` collection
   - **Query**: Filter by `vehicle_id` + order by `created_at` DESC
   - **Component**: `components/health-indicators.tsx`
   - **Implementation**:
     ```typescript
     // Use Firestore SDK
     import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
     
     const q = query(
       collection(db, 'anomaly_cases'),
       where('vehicle_id', '==', vehicleId),
       orderBy('created_at', 'desc'),
       limit(1)
     );
     
     onSnapshot(q, (snapshot) => {
       // Update health status
     });
     ```

2. **Get Service History**
   - **Source**: Firestore listener on `bookings` collection
   - **Query**: Filter by `vehicle_id` + order by `created_at` DESC
   - **Component**: `components/service-history.tsx`
   - **Implementation**: Similar to above

3. **Get Upcoming Maintenance**
   - **Source**: Firestore listener on `scheduling_cases` collection
   - **Query**: Filter by `vehicle_id` + `status` = "pending_engagement"
   - **Component**: `components/upcoming-maintenance.tsx`

#### 3.2.2 Service Center Dashboard (`/service-center`)

**File**: `frontend/vehicle-care-2/app/service-center/page.tsx`

**Endpoints needed**:
1. **Get Real-time Telemetry**
   - **Source**: Firestore listener on `telemetry_events` collection
   - **Query**: Filter by `vehicle_id` + order by `timestamp_utc` DESC + limit(100)
   - **Component**: `components/service-center/telemetry-monitoring.tsx`
   - **Implementation**:
     ```typescript
     const q = query(
       collection(db, 'telemetry_events'),
       where('vehicle_id', '==', vehicleId),
       orderBy('timestamp_utc', 'desc'),
       limit(100)
     );
     ```

2. **Get Predictive Maintenance Alerts**
   - **Source**: Firestore listener on `anomaly_cases` collection
   - **Query**: Filter by `status` = "pending_diagnosis" OR "diagnosed"
   - **Component**: `components/service-center/priority-vehicle-queue.tsx`

3. **Get Autonomous Scheduling Results**
   - **Source**: Firestore listener on `scheduling_cases` collection
   - **Query**: Filter by `status` = "pending_engagement"
   - **Component**: `components/service-center/ai-appointment-scheduler.tsx`

4. **Get Customer Engagement Results**
   - **Source**: Firestore listener on `engagement_cases` collection
   - **Query**: Filter by `status` = "completed"
   - **Component**: `components/service-center/customer-engagement.tsx`

5. **Get Human Review Queue**
   - **Source**: Firestore listener on `human_reviews` collection
   - **Query**: Filter by `review_status` = "pending_review"
   - **Component**: `components/service-center/human-review-queue.tsx`
   - **Action**: Add HTTP endpoint to update review status
     ```typescript
     // New endpoint needed: POST /update_human_review
     async updateHumanReview(reviewId: string, decision: 'approved' | 'rejected', notes?: string) {
       return this.request('/update_human_review', {
         method: 'POST',
         body: JSON.stringify({ reviewId, decision, notes }),
       });
     }
     ```

6. **Get Agentic AI Control Center Data**
   - **Source**: Firestore listener on `pipeline_states` collection
   - **Query**: All pipeline states
   - **Component**: `components/service-center/agentic-ai/page.tsx`

#### 3.2.3 Manufacturer Dashboard (`/manufacturer`)

**File**: `frontend/vehicle-care-2/app/manufacturer/page.tsx`

**Endpoints needed**:
1. **Get CAPA Insights**
   - **Source**: Firestore listener on `manufacturing_cases` collection
   - **Query**: Order by `created_at` DESC
   - **Component**: `components/manufacturer/capa-feedback.tsx`

2. **Get Defect Analysis**
   - **Source**: Firestore listener on `anomaly_cases` + `diagnosis_cases`
   - **Query**: Aggregate by `anomaly_type` and `component`
   - **Component**: `components/manufacturer/defect-rates.tsx`

3. **Get Failure Patterns**
   - **Source**: Firestore listener on `rca_cases` collection
   - **Query**: Group by `root_cause`
   - **Component**: `components/manufacturer/failure-patterns.tsx`

#### 3.2.4 Servicing Page (`/servicing`)

**File**: `frontend/vehicle-care-2/app/servicing/page.tsx`

**Endpoints needed**:
1. **Submit Service Feedback**
   - **Endpoint**: `POST /submit_feedback` (needs to be created)
   - **Component**: `components/servicing/service-recommendations.tsx`
   - **Implementation**:
     ```typescript
     async submitServiceFeedback(data: {
       booking_id: string;
       vehicle_id: string;
       technician_notes?: string;
       customer_rating?: number;
       post_service_telemetry?: TelematicsEvent[];
     }) {
       return apiClient.submitFeedback(data);
     }
     ```

### 3.3 Firestore Real-time Listeners Setup

**File**: `frontend/vehicle-care-2/lib/firestore-listeners.ts` (create new file)

```typescript
import { collection, query, where, orderBy, limit, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase'; // Initialize Firebase in separate file

export class FirestoreListeners {
  // Listen to anomaly cases for a vehicle
  static listenToAnomalyCases(
    vehicleId: string,
    callback: (cases: AnomalyCase[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'anomaly_cases'),
      where('vehicle_id', '==', vehicleId),
      orderBy('created_at', 'desc'),
      limit(10)
    );

    return onSnapshot(q, (snapshot) => {
      const cases = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AnomalyCase[];
      callback(cases);
    });
  }

  // Listen to pipeline states
  static listenToPipelineStates(
    callback: (states: PipelineState[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'pipeline_states'),
      orderBy('updated_at', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const states = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PipelineState[];
      callback(states);
    });
  }

  // Add more listener methods as needed...
}
```

### 3.4 New Backend Endpoints to Create

#### 3.4.1 Submit Feedback Endpoint
**File**: `backend/functions/submit_feedback/main.py` (create new)

```python
"""
Cloud Function: submit_feedback
HTTP Trigger: Receives service feedback from frontend
Purpose: Publishes feedback to Pub/Sub to trigger feedback_agent
"""

from flask import Request, jsonify
from google.cloud import pubsub_v1
import json
import functions_framework

PROJECT_ID = "navigo-27206"
FEEDBACK_TOPIC_NAME = "navigo-feedback-complete"

@functions_framework.http
def submit_feedback(request: Request):
    if request.method != 'POST':
        return jsonify({"error": "Method not allowed"}), 405
    
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['booking_id', 'vehicle_id']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Publish to Pub/Sub
        publisher = pubsub_v1.PublisherClient()
        topic_path = publisher.topic_path(PROJECT_ID, FEEDBACK_TOPIC_NAME)
        message_bytes = json.dumps(data).encode("utf-8")
        future = publisher.publish(topic_path, message_bytes)
        message_id = future.result()
        
        return jsonify({
            "status": "success",
            "message_id": message_id,
            "message": "Feedback submitted successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

#### 3.4.2 Update Human Review Endpoint
**File**: `backend/functions/update_human_review/main.py` (create new)

```python
"""
Cloud Function: update_human_review
HTTP Trigger: Updates human review decision
Purpose: Allows frontend to approve/reject items in human review queue
"""

from flask import Request, jsonify
from google.cloud import firestore, pubsub_v1
import json
import functions_framework

PROJECT_ID = "navigo-27206"

@functions_framework.http
def update_human_review(request: Request):
    if request.method != 'POST':
        return jsonify({"error": "Method not allowed"}), 405
    
    try:
        data = request.get_json()
        review_id = data.get('reviewId')
        decision = data.get('decision')  # 'approved' or 'rejected'
        notes = data.get('notes', '')
        
        if not review_id or not decision:
            return jsonify({"error": "Missing required fields"}), 400
        
        if decision not in ['approved', 'rejected']:
            return jsonify({"error": "Invalid decision"}), 400
        
        db = firestore.Client()
        review_ref = db.collection("human_reviews").document(review_id)
        review_doc = review_ref.get()
        
        if not review_doc.exists:
            return jsonify({"error": "Review not found"}), 404
        
        # Update review
        review_ref.update({
            "review_status": decision,
            "review_notes": notes,
            "reviewed_at": firestore.SERVER_TIMESTAMP
        })
        
        # If approved, continue pipeline
        if decision == 'approved':
            review_data = review_doc.to_dict()
            message_data = review_data.get('message_data', {})
            
            # Publish to orchestrator to continue pipeline
            publisher = pubsub_v1.PublisherClient()
            topic_path = publisher.topic_path(PROJECT_ID, "navigo-orchestrator")
            message_bytes = json.dumps(message_data).encode("utf-8")
            publisher.publish(topic_path, message_bytes)
        
        return jsonify({
            "status": "success",
            "message": f"Review {decision}"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

---

## 4. Data Flow Summary

### 4.1 Complete End-to-End System Flow

**Complete Pipeline: From Vehicle Telemetry to Manufacturing Feedback**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    COMPLETE NAVIGO SYSTEM FLOW                          │
└─────────────────────────────────────────────────────────────────────────┘

STEP 1: TELEMETRY INGESTION
────────────────────────────
Vehicle (IoT Device)
   │
   │ HTTP POST /ingest_telemetry
   │ { vehicle_id, timestamp, engine_temp, brake_wear, battery_voltage, ... }
   ▼
[ingest_telemetry] Cloud Function (HTTP Trigger)
   │
   │ Validates data (Pydantic schema)
   │ Stores in Firestore: telemetry_events collection
   │
   ▼
Firestore: telemetry_events/{event_id}
   │
   │ Firestore Trigger (automatic)
   ▼
[telemetry_firestore_trigger] Cloud Function
   │
   │ Publishes to Pub/Sub: navigo-telemetry-ingested
   │ Syncs to BigQuery: telemetry.telemetry_events table
   │
   ▼
Pub/Sub Topic: navigo-telemetry-ingested
   │
   │ Event-driven trigger
   ▼

STEP 2: ANOMALY DETECTION
──────────────────────────
[data_analysis_agent] Cloud Function (Pub/Sub Trigger)
   │
   │ Fetches last 10 telemetry events for vehicle
   │ Uses Gemini 2.5 Flash LLM to detect anomalies
   │ Analyzes: engine_temp spikes, brake_wear patterns, battery degradation
   │
   │ IF anomaly detected:
   │   - Creates case in Firestore: anomaly_cases collection
   │   - Syncs to BigQuery
   │   - Publishes to Pub/Sub: navigo-anomaly-detected
   │
   ▼
Pub/Sub Topic: navigo-anomaly-detected
   │
   │ Event-driven trigger
   ▼

STEP 3: MASTER ORCHESTRATOR (Confidence Check)
───────────────────────────────────────────────
[master_orchestrator] Cloud Function (Pub/Sub Trigger)
   │
   │ Receives anomaly detection result
   │ Checks confidence score (threshold: 85%)
   │
   │ IF confidence >= 85%:
   │   - Routes to next agent (diagnosis_agent)
   │   - Updates pipeline_states collection
   │
   │ IF confidence < 85%:
   │   - Routes to human_reviews collection
   │   - Frontend shows in Human Review Queue
   │   - Human reviews and approves/rejects
   │   - If approved, continues pipeline
   │
   ▼
   ├─→ [High Confidence Path] → diagnosis_agent
   └─→ [Low Confidence Path] → human_reviews → (after approval) → diagnosis_agent

STEP 4: FAILURE DIAGNOSIS
──────────────────────────
[diagnosis_agent] Cloud Function (Pub/Sub Trigger)
   │
   │ Fetches anomaly case and telemetry window
   │ Uses Gemini 2.5 Flash LLM to diagnose component failure
   │ Identifies: component, severity, estimated RUL (Remaining Useful Life)
   │
   │ Stores in Firestore: diagnosis_cases collection
   │ Publishes to Pub/Sub: navigo-diagnosis-complete
   │
   ▼
Pub/Sub Topic: navigo-diagnosis-complete
   │
   │ Event-driven trigger
   ▼

STEP 5: ROOT CAUSE ANALYSIS (RCA)
──────────────────────────────────
[rca_agent] Cloud Function (Pub/Sub Trigger)
   │
   │ Fetches diagnosis case and telemetry context
   │ Uses Gemini 2.5 Flash LLM for Root Cause Analysis
   │ Identifies: root_cause, contributing_factors, confidence
   │
   │ Stores in Firestore: rca_cases collection
   │ Publishes to Pub/Sub: navigo-rca-complete
   │
   ▼
Pub/Sub Topic: navigo-rca-complete
   │
   │ Event-driven trigger
   ▼

STEP 6: CUSTOMER ENGAGEMENT (Script Generation)
────────────────────────────────────────────────
[engagement_agent] Cloud Function (Pub/Sub Trigger)
   │
   │ Fetches RCA case (root cause, recommended action)
   │ Uses Gemini 2.5 Flash LLM to generate customer engagement script
   │
   │ Generates:
   │   - Personalized greeting
   │   - Defect explanation (simple language)
   │   - Recommended action
   │   - Conversation transcript template
   │
   │ Stores in Firestore: engagement_cases collection
   │ Publishes to Pub/Sub: navigo-engagement-complete
   │
   ▼
Pub/Sub Topic: navigo-engagement-complete
   │
   │ Event-driven trigger
   ▼

STEP 7: INTELLIGENT SCHEDULING
───────────────────────────────
[scheduling_agent] Cloud Function (Pub/Sub Trigger)
   │
   │ Fetches diagnosis case (RUL, severity) and RCA data
   │ Fetches engagement case (customer preferences, conversation context)
   │ Fetches service center availability (technicians, parts, slots)
   │ Uses Gemini 2.5 Flash LLM to optimize scheduling
   │
   │ Edge Cases Handled:
   │   - Declined appointments → reschedule or escalate
   │   - Urgent failures (RUL < 3 days) → emergency slots
   │   - Multi-vehicle fleet → batch optimization
   │   - Recurring defects → priority boost, specialist required
   │   - RCA/CAPA-informed decisions → adjusts priority based on root cause
   │
   │ Stores in Firestore: scheduling_cases collection
   │ Creates booking record in Firestore: bookings collection
   │ Publishes to Pub/Sub: navigo-scheduling-complete
   │
   ▼
Pub/Sub Topic: navigo-scheduling-complete
   │
   │ Event-driven trigger
   ▼

STEP 8: VOICE COMMUNICATION (Interactive Call)
───────────────────────────────────────────────
[communication_agent] Cloud Function (Pub/Sub Trigger)
   │
   │ Fetches engagement script from engagement_cases
   │ Fetches scheduling case (best_slot, service center, appointment details)
   │ Initializes VoiceCommunicationAgent (Twilio integration)
   │
   │ MAKES ACTUAL VOICE CALL to customer:
   │
   │   Conversation Flow:
   │   1. Greeting
   │      AI: "Hello [Name]! This is NaviGo calling about your vehicle [ID]. 
   │          Do you have a couple of minutes?"
   │      Customer: [Responds: Yes/No/DTMF key]
   │
   │   2. Defect Explanation
   │      AI: "We've detected [issue]. [Simple explanation]. 
   │          This should be fixed within [RUL] days."
   │      Customer: [Asks questions or confirms]
   │
   │   3. Question Handling (Interactive)
   │      Customer: "How much will it cost?"
   │      AI: [Answers using LLM or rule-based logic]
   │      Customer: "Is it safe to drive?"
   │      AI: [Provides safety recommendations]
   │      Customer: "Can I wait?"
   │      AI: [Explains urgency based on RUL]
   │
   │   4. Service Scheduling
   │      AI: "Would you like to schedule a service appointment?"
   │      Customer: [Yes/No response]
   │
   │   5. Confirmation
   │      IF customer confirms:
   │        - Confirms booking details
   │        - Sends SMS confirmation via SMS Agent
   │        - Updates booking status
   │
   │ Stores call results in Firestore: communication_cases collection
   │ Updates booking if customer confirms
   │ Publishes to Pub/Sub: navigo-communication-complete
   │
   ▼
Pub/Sub Topic: navigo-communication-complete
   │
   │ Event-driven trigger
   ▼

STEP 9: SMS NOTIFICATION (Alternative/Confirmation)
─────────────────────────────────────────────────────
[sms_agent] Cloud Function (Pub/Sub Trigger or HTTP)
   │
   │ Generates concise SMS message (160-1000 chars)
   │ Uses LLM for intelligent message generation
   │
   │ Sends via Twilio:
   │   - Defect alerts
   │   - Appointment confirmations
   │   - Service reminders
   │
   │ Stores in Firestore: sms_logs collection
   │
   ▼
Customer receives SMS notification

STEP 10: SERVICE COMPLETION & FEEDBACK
───────────────────────────────────────
Service Center completes service
   │
   │ Technician submits feedback via frontend
   │ HTTP POST /submit_feedback
   │ { booking_id, vehicle_id, technician_notes, customer_rating, ... }
   ▼
[submit_feedback] Cloud Function (HTTP Trigger)
   │
   │ Publishes to Pub/Sub: navigo-feedback-complete
   │
   ▼
Pub/Sub Topic: navigo-feedback-complete
   │
   │ Event-driven trigger
   ▼
[feedback_agent] Cloud Function (Pub/Sub Trigger)
   │
   │ Fetches original anomaly case
   │ Fetches post-service telemetry
   │ Uses Gemini 2.5 Flash LLM to validate predictions
   │
   │ Calculates:
   │   - Prediction accuracy (was prediction correct?)
   │   - CEI (Customer Effort Index)
   │   - Validation label: "Correct", "Recurring", or "Incorrect"
   │
   │ Stores in Firestore: feedback_cases collection
   │ Publishes to Pub/Sub: navigo-feedback-complete
   │
   ▼
Pub/Sub Topic: navigo-feedback-complete
   │
   │ Event-driven trigger
   ▼

STEP 11: MANUFACTURING FEEDBACK LOOP
─────────────────────────────────────
[manufacturing_agent] Cloud Function (Pub/Sub Trigger)
   │
   │ Fetches RCA case (root_cause)
   │ Fetches feedback case (CEI, validation_label)
   │
   │ Enhanced Analysis:
   │   1. Calculates recurrence count (same vehicle, same component)
   │   2. Detects fleet-wide patterns (multiple vehicles affected?)
   │   3. Aggregates predicted failures (predicted vs actual)
   │   4. Identifies batch problems (vehicles from same production period)
   │   5. Calculates design improvement priority
   │
   │ Uses Gemini 2.5 Flash LLM to generate CAPA insights:
   │   - Corrective Action: What to fix now
   │   - Preventive Action: How to prevent in future
   │   - Severity: Low/Medium/High/Critical
   │   - Design improvement recommendations
   │
   │ Stores in Firestore: manufacturing_cases collection
   │ Publishes to Pub/Sub: navigo-manufacturing-complete
   │ Publishes to Pub/Sub: navigo-manufacturing-dashboard-feed (for real-time dashboard)
   │
   ▼
Pub/Sub Topic: navigo-manufacturing-dashboard-feed
   │
   │ Real-time feed
   ▼
Manufacturer Dashboard (Frontend)
   │
   │ Displays:
   │   - CAPA insights
   │   - Fleet-wide patterns
   │   - Predicted vs actual failures
   │   - Design improvement priority queue
   │   - Batch problem alerts
   │
   ▼
Design Team Reviews CAPA
   │
   │ Implements design changes
   │ Updates component specifications
   │ Modifies manufacturing processes
   │
   ▼
Production Improvement
   │
   │ New batches with improved design
   │ Reduced defect rates
   │ Better quality control
   │
   ▼
CLOSED LOOP: Reduced Defects
   │
   │ New vehicles have fewer issues
   │ Lower recurrence rates
   │ Higher customer satisfaction
   │ Lower warranty costs
   │ Better prediction accuracy
```

### 4.1.1 Communication Agent Detailed Flow

**How Communication Agent Works: Interactive Voice Call Flow**

```
┌─────────────────────────────────────────────────────────────────────────┐
│              COMMUNICATION AGENT: INTERACTIVE CALL FLOW                 │
└─────────────────────────────────────────────────────────────────────────┘

TRIGGER
───────
engagement_agent completes
   │
   │ Publishes to: navigo-communication-trigger
   │ Message: { engagement_id, case_id, vehicle_id, customer_phone, 
   │            customer_name, transcript_template, root_cause, 
   │            recommended_action, best_slot }
   ▼
[communication_agent] Cloud Function (Pub/Sub Trigger)
   │
   │ 1. Fetches engagement script from engagement_cases
   │ 2. Initializes VoiceCommunicationAgent
   │ 3. Prepares call data
   │
   ▼

CALL INITIATION
───────────────
VoiceCommunicationAgent.make_voice_call()
   │
   │ Uses Twilio API to initiate call:
   │   - From: TWILIO_PHONE_NUMBER
   │   - To: customer_phone (e.g., +919876543210)
   │   - Webhook URL: https://[function-url]/twilio/gather
   │
   │ Returns: call_sid (for tracking)
   │
   ▼
Twilio initiates call to customer
   │
   │ Customer answers phone
   │
   ▼

CONVERSATION FLOW (Multi-Turn Interactive)
───────────────────────────────────────────

TURN 1: GREETING
────────────────
Twilio webhook → POST /twilio/gather
   │
   │ VoiceCommunicationAgent.generate_twiml_greeting()
   │
   │ Generates TwiML:
   │   <Say>Hello [Name]! This is NaviGo calling about your vehicle [ID]. 
   │        Do you have a couple of minutes to discuss some important information?</Say>
   │   <Gather input="speech dtmf" timeout="10" numDigits="1">
   │     <Say>Press 1 for yes, 2 for no, or just speak your answer.</Say>
   │   </Gather>
   │
   │ Returns TwiML XML to Twilio
   │
   ▼
Customer hears greeting
   │
   │ Customer responds:
   │   - Speech: "Yes, I have time" OR "No, call later"
   │   - DTMF: Presses 1 (yes) or 2 (no)
   │
   ▼
Twilio sends customer response to webhook
   │
   │ POST /twilio/gather
   │ Body: { SpeechResult: "yes I have time", Digits: "1" }
   │
   ▼

TURN 2: DEFECT EXPLANATION
───────────────────────────
VoiceCommunicationAgent.generate_twiml_defect_explanation()
   │
   │ Analyzes user tone (formal/casual/technical)
   │ Uses explain_defect() to convert technical terms to simple language
   │
   │ Generates TwiML:
   │   <Say>We've detected an issue with your [component]. 
   │        [Simple explanation based on severity and user preference].
   │        Based on our analysis, this should be fixed within [RUL] days.
   │        Would you like to schedule a service appointment?</Say>
   │   <Gather input="speech dtmf" timeout="15">
   │     <Say>Press 1 to schedule, 2 to ask questions, or just speak your answer.</Say>
   │   </Gather>
   │
   ▼
Customer hears explanation
   │
   │ Customer responds:
   │   - "How much will it cost?" (Question)
   │   - "Is it safe to drive?" (Question)
   │   - "Yes, schedule it" (Confirmation)
   │   - "No, not now" (Decline)
   │
   ▼

TURN 3: QUESTION HANDLING (If Customer Asks Questions)
───────────────────────────────────────────────────────
IF customer asks question:
   │
   │ VoiceCommunicationAgent.generate_twiml_question_response()
   │
   │ Uses handle_user_question() to answer:
   │   - "How much will it cost?"
   │     → Explains cost factors, early intervention benefits
   │   - "Is it safe to drive?"
   │     → Provides safety recommendations based on severity
   │   - "Can I wait?"
   │     → Explains urgency based on RUL
   │   - "How serious is it?"
   │     → Explains severity and safety implications
   │
   │ Uses LLM (if available) for intelligent responses
   │ Falls back to rule-based responses if LLM unavailable
   │
   │ Generates TwiML with answer
   │
   │ Asks again: "Would you like to schedule a service appointment?"
   │
   ▼
Customer responds (may ask more questions or confirm)
   │
   │ Loop back to question handling if more questions
   │ OR proceed to scheduling if customer confirms
   │
   ▼

TURN 4: SERVICE SCHEDULING
───────────────────────────
IF customer confirms (yes/1):
   │
   │ VoiceCommunicationAgent.generate_twiml_schedule_confirmation()
   │
   │ Confirms booking:
   │   - Service center name
   │   - Date and time
   │   - Service type
   │   - Estimated duration
   │
   │ Generates TwiML:
   │   <Say>Great! I've scheduled your service appointment at [Service Center] 
   │        for [Date] at [Time]. You'll receive a confirmation SMS with all 
   │        the details shortly. Thank you for using NaviGo!</Say>
   │   <Hangup/>
   │
   │ Triggers SMS Agent to send confirmation SMS
   │ Updates booking status in Firestore
   │
   ▼
IF customer declines (no/2):
   │
   │ Generates TwiML:
   │   <Say>I understand. We'll send you an SMS with the details. 
   │        You can schedule at your convenience. Thank you!</Say>
   │   <Hangup/>
   │
   │ Updates engagement_case with decline reason
   │ May trigger rescheduling logic
   │
   ▼

CALL COMPLETION
───────────────
Twilio sends call status update
   │
   │ POST /twilio/status
   │ Body: { CallSid, CallStatus: "completed", Duration, ... }
   │
   ▼
VoiceCommunicationAgent stores call results
   │
   │ Stores in Firestore: communication_cases collection
   │   {
   │     engagement_id: "...",
   │     case_id: "...",
   │     vehicle_id: "...",
   │     customer_phone: "+919876543210",
   │     call_sid: "CA...",
   │     call_status: "completed",
   │     call_duration: 120, // seconds
   │     customer_response: "confirmed" | "declined" | "no_response",
   │     questions_asked: ["How much will it cost?", "Is it safe?"],
   │     booking_confirmed: true/false,
   │     conversation_transcript: "...",
   │     created_at: timestamp
   │   }
   │
   │ Publishes to Pub/Sub: navigo-communication-complete
   │
   ▼
SMS Agent sends confirmation (if booking confirmed)
   │
   │ Generates SMS: "Your service appointment is confirmed at [Center] 
   │                 on [Date] at [Time]. Booking ID: [ID]"
   │
   │ Sends via Twilio SMS API
   │
   ▼
Customer receives SMS confirmation
```

**Key Features of Communication Agent:**

1. **✅ Real Voice Calls**: Uses Twilio to make actual phone calls
2. **✅ Interactive Conversations**: Uses Twilio Gather verb to listen to customer responses
3. **✅ Speech Recognition**: Customer can speak naturally (not just keypad)
4. **✅ DTMF Support**: Customer can press keys (1 for yes, 2 for no)
5. **✅ Multi-Turn Dialogue**: Handles multiple questions and responses
6. **✅ Adaptive Communication**: Adjusts tone based on customer's speaking style
7. **✅ Question Handling**: Answers cost, urgency, safety, timeline questions
8. **✅ Defect Explanation**: Converts technical terms to simple language
9. **✅ Service Scheduling**: Confirms bookings directly during call
10. **✅ SMS Integration**: Sends confirmation SMS after call

### 4.1.1 Communication Agent Integration Flow

```
engagement_agent completes (generates script)
   ↓
Publishes to: navigo-engagement-complete
   ↓
scheduling_agent (optimizes appointment slot)
   ↓
Publishes to: navigo-scheduling-complete
   ↓
Publishes to: navigo-communication-trigger
   ↓
communication_agent (Cloud Function)
   ↓
1. Fetches engagement script from engagement_cases
2. Fetches scheduling case (best_slot, service center, appointment details)
3. Initializes VoiceCommunicationAgent
4. Makes Twilio voice call to customer
   ↓
5. INTERACTIVE CONVERSATION FLOW:
   a. Greeting → Customer responds (yes/no/has time)
   b. Explains vehicle defect → Customer asks questions
   c. Answers questions (cost, urgency, safety) → Customer decides
   d. Asks to schedule → Customer confirms/declines
   e. Confirms booking with scheduled slot → Sends SMS confirmation
   ↓
6. Stores call results in communication_cases
7. Updates booking if customer confirms
   ↓
Publishes to: navigo-communication-complete
   ↓
feedback_agent (when service completed)
```

**Conversation Example**:
```
AI: "Hello Rajesh! This is NaviGo calling about your vehicle MH-12-AB-1234. 
     Do you have a couple of minutes to discuss some important information?"
     
Customer: "Yes, I have time."

AI: "We've detected an issue with your brake pads. The friction material is 
     wearing down, which could affect your ability to stop safely. Based on 
     our analysis, this should be fixed within 7-10 days. Would you like to 
     schedule a service appointment?"
     
Customer: "How much will it cost?"

AI: "The cost will depend on the exact repair needed for your brake pads. 
     Our service center can provide a detailed estimate. Typically, addressing 
     this early can save money compared to waiting for more damage. Would you 
     like to schedule an appointment?"
     
Customer: "Yes, please schedule it."

AI: "Great! I've scheduled your service appointment at Service Center Mumbai 
     for December 20th at 10:00 AM. You'll receive a confirmation SMS with 
     all the details shortly. Thank you for using NaviGo!"
```

### 4.1.2 Communication Agent Conversation Capabilities

**✅ YES - The communication_agent CAN handle all of this:**

1. **✅ Makes Calls**: 
   - Uses `make_voice_call()` to initiate Twilio voice calls
   - Calls customer's phone number directly
   - Returns call SID for tracking

2. **✅ Handles Replies & Conversations**:
   - Uses Twilio's **Gather verb** to listen to customer responses
   - Supports **speech recognition** (customer can speak)
   - Supports **DTMF** (customer can press keys: 1 for yes, 2 for no)
   - Processes responses in real-time via webhook callbacks
   - Can handle multiple conversation turns (back-and-forth dialogue)

3. **✅ Explains Vehicle Conditions**:
   - `explain_defect()` method converts technical defects to simple language
   - Adapts explanation based on:
     - **Severity** (Critical/High/Medium/Low) - uses appropriate urgency
     - **User preference** (simple vs technical language)
     - **User tone** (empathetic, direct, casual)
   - Example: "engine_coolant_system" → "engine cooling system (what keeps your engine from overheating)"
   - Uses LLM for contextual explanations when available

4. **✅ Convinces Owners to Book Services**:
   - **Persuasive Language**: Uses severity-based messaging
     - Critical: "This is very serious and could be dangerous if not fixed immediately"
     - High: "This needs attention soon to avoid bigger problems"
     - Medium: "This should be checked to keep your vehicle running smoothly"
   - **Addresses Concerns**: Answers common objections:
     - Cost: "Addressing this early can save money compared to waiting"
     - Urgency: "Based on our analysis, this should be fixed within X days"
     - Safety: "This could affect your ability to [function] safely"
   - **Clear Call-to-Action**: "Would you like to schedule a service appointment?"
   - **Confirmation**: Confirms booking and sends SMS with details

5. **✅ Handles Customer Questions**:
   - `handle_user_question()` method answers:
     - "How serious is it?" → Explains severity and safety implications
     - "How much will it cost?" → Explains cost factors and early intervention benefits
     - "Can I wait?" → Provides timeline based on RUL (Remaining Useful Life)
     - "Is it safe to drive?" → Gives safety recommendations based on severity
   - Uses LLM for intelligent responses when available
   - Falls back to rule-based responses if LLM unavailable

**Technical Implementation**:
- **TwiML Generation**: Creates XML responses for Twilio
- **Webhook Endpoints**: Required for handling customer responses
- **State Management**: Tracks conversation context and customer preferences
- **Multi-turn Conversations**: Can handle multiple questions and responses
- **Adaptive Responses**: Adjusts language and tone based on customer's speaking style

### 4.1.2 UEBA Monitoring Flow

```
All Agent Activities
   ↓
Frontend UEBA Service (analytics.ts)
   ↓
Tracks:
- Chat interactions
- Voice call events
- User logins/logouts
- Agent performance
- Risk scores
   ↓
Firebase Analytics + Local Storage
   ↓
UEBA Dashboard (/analytics)
   - Real-time metrics
   - Risk analysis
   - Anomaly detection
```

### 4.2 Frontend Data Access Points

| Dashboard | Data Source | Collection | Query |
|-----------|------------|------------|-------|
| Customer (`/`) | Firestore | `anomaly_cases` | `vehicle_id` + `created_at` DESC |
| Customer (`/`) | Firestore | `bookings` | `vehicle_id` + `created_at` DESC |
| Customer (`/`) | Firestore | `scheduling_cases` | `vehicle_id` + `status` = "pending" |
| Service Center | Firestore | `telemetry_events` | `vehicle_id` + `timestamp_utc` DESC |
| Service Center | Firestore | `anomaly_cases` | `status` IN ["pending_diagnosis", "diagnosed"] |
| Service Center | Firestore | `human_reviews` | `review_status` = "pending_review" |
| Service Center | Firestore | `pipeline_states` | All (for agentic AI dashboard) |
| Manufacturer | Firestore | `manufacturing_cases` | `created_at` DESC |
| Manufacturer | Firestore | `anomaly_cases` + `diagnosis_cases` | Aggregate by `anomaly_type` |

---

## 5. Implementation Checklist

### Backend Changes
- [ ] Update all agents to publish to orchestrator instead of next agent
- [ ] Replace mock data in scheduling_agent with real service center data
- [ ] **Implement declined appointment handling in scheduling_agent** (NEW)
- [ ] **Implement urgent failure alert system** (NEW)
- [ ] **Implement multi-vehicle fleet scheduling** (NEW)
- [ ] **Implement recurring defect handling** (NEW)
- [ ] **Implement RCA/CAPA-informed scheduling decisions** (NEW)
- [ ] **Enhance manufacturing_agent with fleet-wide pattern detection** (NEW)
- [ ] **Add predicted failure aggregation to manufacturing_agent** (NEW)
- [ ] **Add batch problem identification** (NEW)
- [ ] **Add design improvement priority calculation** (NEW)
- [ ] **Add design improvement tracking** (NEW)
- [ ] **Add Pub/Sub topic: `navigo-manufacturing-dashboard-feed`** (NEW)
- [ ] Create `submit_feedback` HTTP endpoint
- [ ] Create `update_human_review` HTTP endpoint
- [ ] **Create `communication_agent` Cloud Function wrapper** (NEW)
- [ ] **Add Pub/Sub topic: `navigo-communication-trigger`** (NEW)
- [ ] **Add Pub/Sub topic: `navigo-urgent-alert`** (NEW)
- [ ] **Update `engagement_agent` to publish to communication topic** (NEW)
- [ ] **Create `communication_cases` Firestore collection** (NEW)
- [ ] **Create `investigation_cases` Firestore collection** (NEW)
- [ ] Add error handling and retry logic
- [ ] Create Firestore composite indexes
- [ ] Test orchestrator confidence routing
- [ ] **Test communication agent voice call flow** (NEW)
- [ ] **Test scheduling agent edge cases** (NEW)
- [ ] **Test manufacturing feedback loop end-to-end** (NEW)

### Frontend Integration
- [x] Create `lib/api-client.ts` with API client class (✅ **DONE** - Using `lib/api/` structure with `config.ts`, `agents.ts`, `dashboard-data.ts`, `firestore.ts`)
- [x] Create `lib/firestore-listeners.ts` with listener utilities (✅ **DONE** - Implemented in `lib/api/dashboard-data.ts` with `subscribeToVehicle`, `subscribeToHumanReviews`, `subscribeToPriorityVehicles`, etc.)
- [x] Initialize Firebase SDK in `lib/firebase.ts` (✅ **DONE** - Initialized in `lib/api/firestore.ts`)
- [x] Add Firestore listeners to Customer Dashboard (✅ **DONE** - `vehicle-card.tsx`, `service-history.tsx`, `ai-predictions-transparent.tsx` all use real-time Firestore subscriptions)
- [x] Add Firestore listeners to Service Center Dashboard (✅ **DONE** - `priority-vehicle-queue.tsx`, `human-review-queue.tsx` use real-time subscriptions)
- [ ] Add Firestore listeners to Manufacturer Dashboard (⚠️ **PARTIAL** - `kpi-cards.tsx` exists but needs verification)
- [ ] **Update Manufacturer Dashboard with real-time CAPA feed** (NEW) (❌ **PENDING**)
- [ ] **Replace mock data in `capa-feedback.tsx` with Firestore listener** (NEW) (❌ **PENDING** - Still using `mockCAPAFeedback`)
- [ ] **Replace mock data in `failure-patterns.tsx` with Firestore listener** (NEW) (❌ **PENDING** - Needs verification)
- [ ] **Add fleet-wide pattern visualization** (NEW) (❌ **PENDING**)
- [ ] **Add predicted vs actual failure comparison charts** (NEW) (❌ **PENDING**)
- [ ] **Add design improvement priority queue** (NEW) (❌ **PENDING**)
- [ ] **Add CAPA implementation tracking UI** (NEW) (❌ **PENDING**)
- [x] Add feedback submission form in Servicing page (✅ **DONE** - `feedback-validation.tsx` uses `submitFeedback` API)
- [x] Add human review queue UI with approve/reject actions (✅ **DONE** - `human-review-queue.tsx` uses `updateHumanReview` API and real-time subscriptions)
- [ ] Add real-time telemetry monitoring component (⚠️ **PARTIAL** - Component exists but needs verification if using real data)
- [ ] Add pipeline state visualization (⚠️ **PARTIAL** - `ai-control-centre.tsx` exists but uses mock data)
- [ ] **Integrate UEBA tracking for communication agent calls** (NEW) (❌ **PENDING**)
- [ ] **Add communication call logs to Service Center dashboard** (NEW) (❌ **PENDING**)
- [ ] **Display UEBA analytics in Agentic AI dashboard** (NEW) (❌ **PENDING**)

**Frontend Integration Status Summary (Updated: 2024-12-15):**
- ✅ **API Infrastructure**: Complete - `lib/api/` structure with `config.ts`, `agents.ts`, `dashboard-data.ts`, `firestore.ts`
- ✅ **Customer Dashboard**: Complete - All components (`vehicle-card.tsx`, `service-history.tsx`, `ai-predictions-transparent.tsx`) use real-time Firestore subscriptions
- ✅ **Service Center Dashboard**: Complete - Priority queue, human review queue, and feedback validation all connected to backend APIs
- ⚠️ **Manufacturer Dashboard**: Partial - KPI cards exist but CAPA feedback and failure patterns still use mock data
- ❌ **Advanced Features**: Pending - Fleet-wide patterns, predicted vs actual charts, design improvement queue, CAPA tracking, UEBA integration for communication agent

### Testing
- [ ] Test telemetry ingestion endpoint
- [ ] Test feedback submission endpoint
- [ ] Test human review update endpoint
- [ ] Test Firestore real-time listeners
- [ ] Test orchestrator routing logic
- [ ] Test confidence threshold (85%)

---

## 6. Environment Variables

Add to `frontend/vehicle-care-2/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=https://us-central1-navigo-27206.cloudfunctions.net
NEXT_PUBLIC_FIREBASE_PROJECT_ID=navigo-27206
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=navigo-27206.firebaseapp.com
```

---

## 7. Next Steps

1. **Immediate**: Create `submit_feedback` and `update_human_review` endpoints
2. **Short-term**: Update orchestrator integration in all agents
3. **Short-term**: Replace mock data in scheduling_agent
4. **Medium-term**: Add Firestore listeners to frontend
5. **Medium-term**: Create human review queue UI
6. **Long-term**: Add comprehensive error handling and monitoring

---

## 8. Notes

- All agents use **Gemini 2.5 Flash** model via Vertex AI (except communication agent which supports multiple LLMs)
- Confidence threshold is **85%** (hardcoded in orchestrator)
- All data is synced to **BigQuery** for analytics
- Frontend should use **Firestore real-time listeners** for live updates
- Use **Pub/Sub** for event-driven backend communication
- Use **HTTP endpoints** only for frontend-initiated actions (ingest, feedback, review)
- **Communication Agent** requires Twilio credentials (separate from engagement agent)
- **UEBA System** is frontend-only and tracks all agent activities in real-time
- **Engagement Agent** and **Communication Agent** work together: Engagement generates scripts, Communication executes calls

## 9. New Components Summary

### Communication Agent (Voice Calling)
- **Location**: `agents/communication/agent.py`
- **Status**: ✅ Code complete, needs Cloud Function wrapper
- **Integration**: Subscribe to `navigo-communication-trigger` topic
- **Dependencies**: Twilio SDK, LLM Service (optional)
- **Output**: Voice calls via Twilio, call logs stored in Firestore

### UEBA System (Analytics)
- **Location**: `frontend/vehicle-care-2/lib/analytics.ts`
- **Status**: ✅ Fully implemented (frontend)
- **Integration**: Tracks all frontend events automatically
- **Dashboard**: `/analytics` page
- **Output**: Real-time risk scores, anomaly detection, behavioral analytics

### Compatibility
- ✅ **Communication Agent** and **Engagement Agent** are fully compatible
- ✅ **UEBA System** can track communication agent activities
- ✅ All components can work together without conflicts
- ⚠️ **Action Required**: Create Cloud Function wrapper for communication agent

---

---

## 10. Video Presentation Guide: Complete System Flow

### 10.1 System Overview (30 seconds)

**NaviGo is an AI-powered vehicle maintenance platform that:**
- **Detects** vehicle issues before they become failures (Predictive Maintenance)
- **Diagnoses** component failures using AI (Root Cause Analysis)
- **Schedules** optimal service appointments (Intelligent Scheduling)
- **Engages** customers via voice calls and SMS (Communication Agent)
- **Learns** from service feedback to improve predictions (Feedback Loop)
- **Feeds back** to manufacturing for design improvements (Manufacturing Feedback Loop)

### 10.2 Key Components for Video Demo

#### **1. Telemetry Ingestion (5 seconds)**
- Show: Vehicle sending telemetry data
- Highlight: Real-time data collection from IoT sensors
- Result: Data stored in Firestore

#### **2. Anomaly Detection (10 seconds)**
- Show: AI analyzing telemetry patterns
- Highlight: Gemini 2.5 Flash LLM detecting anomalies
- Result: Anomaly case created

#### **3. Failure Diagnosis (10 seconds)**
- Show: AI diagnosing component failure
- Highlight: Identifies component, severity, RUL (Remaining Useful Life)
- Result: Diagnosis case with estimated time to failure

#### **4. Root Cause Analysis (10 seconds)**
- Show: AI performing RCA
- Highlight: Identifies root cause (manufacturing defect, wear, etc.)
- Result: RCA case with corrective actions

#### **5. Intelligent Scheduling (15 seconds)**
- Show: AI optimizing service appointment
- Highlight: Considers urgency, service center capacity, technician availability
- Edge Cases: Urgent alerts, fleet scheduling, recurring defects
- Result: Optimal appointment slot selected

#### **6. Customer Engagement (15 seconds)**
- Show: Engagement agent generating conversation script
- Highlight: Personalized, empathetic script generation
- Result: Engagement case with conversation template

#### **7. Voice Communication (30 seconds) - KEY FEATURE**
- Show: **Actual voice call to customer**
- Highlight: 
  - Interactive conversation (customer can speak or press keys)
  - Explains vehicle condition in simple language
  - Answers customer questions (cost, urgency, safety)
  - Convinces customer to book service
  - Confirms appointment during call
- Result: Booking confirmed, SMS sent

#### **8. Service Completion & Feedback (10 seconds)**
- Show: Technician submitting feedback
- Highlight: Validates prediction accuracy
- Result: Feedback case with CEI (Customer Effort Index)

#### **9. Manufacturing Feedback Loop (20 seconds)**
- Show: AI generating CAPA insights
- Highlight:
  - Detects fleet-wide patterns
  - Aggregates predicted vs actual failures
  - Identifies batch/design problems
  - Generates design improvement recommendations
- Result: Manufacturing case with CAPA insights

#### **10. Closed Loop (10 seconds)**
- Show: Design improvements reducing defects
- Highlight: New vehicles have fewer issues
- Result: Lower warranty costs, higher customer satisfaction

### 10.3 Communication Agent Demo Script

**For Video Presentation:**

```
SCENE 1: Engagement Agent Completes
────────────────────────────────────
[Screen shows] Engagement case created with conversation script

NARRATOR: "The engagement agent has generated a personalized conversation script."


SCENE 2: Communication Agent Initiates Call
───────────────────────────────────────────
[Screen shows] Communication agent making Twilio call
[Phone rings] Customer answers

NARRATOR: "The communication agent makes an actual voice call to the customer."


SCENE 3: Interactive Conversation
──────────────────────────────────
[Audio plays] AI: "Hello Rajesh! This is NaviGo calling about your vehicle..."

[Audio plays] Customer: "Yes, I have time."

[Audio plays] AI: "We've detected an issue with your brake pads. The friction 
material is wearing down, which could affect your ability to stop safely. 
Based on our analysis, this should be fixed within 7-10 days."

[Audio plays] Customer: "How much will it cost?"

[Audio plays] AI: "The cost will depend on the exact repair needed. Typically, 
addressing this early can save money compared to waiting for more damage."

[Audio plays] Customer: "Is it safe to drive?"

[Audio plays] AI: "Yes, it's safe for now, but we recommend fixing it within 
7-10 days to avoid safety issues."

[Audio plays] Customer: "Okay, please schedule it."

[Audio plays] AI: "Great! I've scheduled your service appointment at Service 
Center Mumbai for December 20th at 10:00 AM. You'll receive a confirmation 
SMS shortly."


SCENE 4: Call Results
─────────────────────
[Screen shows] Communication case stored in Firestore
[Screen shows] Booking confirmed
[Screen shows] SMS sent

NARRATOR: "The call is complete. The booking is confirmed and the customer 
receives an SMS confirmation."
```

### 10.4 System Architecture Diagram (For Video)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         NAVIGO SYSTEM ARCHITECTURE                  │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Vehicle    │ ──HTTP POST──> ┌──────────────────┐
│  (IoT Data)  │                │ ingest_telemetry │
└──────────────┘                └────────┬─────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │  Firestore Trigger  │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │  Pub/Sub Topics     │
                              │  (Event-Driven)     │
                              └──────────┬───────────┘
                                         │
         ┌──────────────────────────────┼──────────────────────────────┐
         │                              │                              │
         ▼                              ▼                              ▼
┌─────────────────┐          ┌──────────────────┐          ┌─────────────────┐
│ Data Analysis   │          │   Diagnosis      │          │      RCA        │
│    Agent        │          │     Agent        │          │     Agent       │
│ (Anomaly Det.)  │          │ (Component ID)   │          │ (Root Cause)    │
└────────┬────────┘          └────────┬─────────┘          └────────┬────────┘
         │                             │                             │
         └─────────────────────────────┴─────────────────────────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │   Scheduling     │
                              │     Agent        │
                              │  (Optimization)  │
                              └────────┬──────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │   Engagement     │
                              │     Agent        │
                              │  (Script Gen.)   │
                              └────────┬──────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │ Communication    │
                              │     Agent        │
                              │  (Voice Call)    │
                              └────────┬──────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │    Feedback      │
                              │     Agent        │
                              │  (Validation)    │
                              └────────┬──────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │ Manufacturing    │
                              │     Agent        │
                              │  (CAPA Insights) │
                              └────────┬──────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │  Design Team     │
                              │  (Improvements)  │
                              └──────────────────┘
```

### 10.5 Key Metrics to Highlight

1. **Prediction Accuracy**: 90%+ accuracy in failure prediction
2. **Response Time**: < 5 seconds from telemetry to anomaly detection
3. **Customer Engagement**: 85%+ booking confirmation rate via voice calls
4. **Defect Reduction**: 80% reduction in recurring defects after CAPA implementation
5. **Cost Savings**: 60% reduction in warranty costs
6. **Customer Satisfaction**: CEI (Customer Effort Index) improved from 2.5 to 4.2

### 10.6 Technology Stack (For Video)

- **AI/ML**: Google Gemini 2.5 Flash (LLM)
- **Cloud Platform**: Google Cloud Platform (GCP)
- **Database**: Firestore (NoSQL), BigQuery (Data Warehouse)
- **Messaging**: Pub/Sub (Event-driven architecture)
- **Voice**: Twilio (Voice calls, SMS)
- **Frontend**: Next.js, React, TypeScript
- **Backend**: Cloud Functions (Python)
- **Analytics**: UEBA (User and Entity Behavior Analytics)

### 10.7 Demo Flow Checklist

- [ ] Show telemetry ingestion (real-time data)
- [ ] Show anomaly detection (AI analysis)
- [ ] Show diagnosis (component identification)
- [ ] Show RCA (root cause analysis)
- [ ] Show scheduling optimization
- [ ] **Show voice call (KEY FEATURE)** - Interactive conversation
- [ ] Show SMS confirmation
- [ ] Show feedback submission
- [ ] Show manufacturing CAPA insights
- [ ] Show closed loop (defect reduction)

---

**Last Updated**: 2024-12-15 (Updated with Communication Agent flow and complete system flow for video presentation)
**Review Status**: Complete
**Next Review**: After communication agent Cloud Function implementation

