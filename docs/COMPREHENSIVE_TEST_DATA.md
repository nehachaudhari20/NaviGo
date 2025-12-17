# Comprehensive Test Data for All Agents

This document provides comprehensive test data that caters to all agents in the NaviGo pipeline.

## Data Flow Overview

1. **Telemetry Data** → `ingest_telemetry` → Data Analysis Agent
2. **Anomaly Data** → Diagnosis Agent → RCA Agent
3. **RCA Data** → Scheduling Agent (needs: service centers, availability)
4. **Scheduling Data** → Engagement Agent (needs: customer info from vehicle)
5. **Engagement Data** → Communication Agent (needs: customer phone)
6. **Service Completion** → Feedback Agent
7. **Feedback Data** → Manufacturing Agent

## Required Data Collections

### 1. Telemetry Data (Already Provided)
✅ Your `telemetry_input_batch.json` is sufficient for this step.

### 2. Vehicle Data (Required for Engagement/Communication)
The `vehicles` collection must contain:
- `vehicle_id`
- `owner_name` or `name`
- `owner_phone` or `phone`
- `model`, `year`, `make` (optional but useful)

### 3. Service Centers Data (Required for Scheduling)
The `service_centers` collection must contain:
- `service_center_id`
- `name`, `address`, `location`
- `timezone`
- `capacity` (max concurrent bookings)
- `operating_hours` (per day)
- `spare_parts_availability` or `inventory`
- `technicians` (list of technician IDs)
- `available_slots` (optional, can be auto-generated)

---

## Complete Test Data Files

### File 1: `vehicles.json` - Vehicle and Customer Data

```json
[
  {
    "vehicle_id": "MH-07-AB-1234",
    "owner_name": "Rajesh Kumar",
    "owner_phone": "+919876543210",
    "name": "Rajesh Kumar",
    "phone": "+919876543210",
    "model": "Honda City",
    "year": 2022,
    "make": "Honda",
    "registration_date": "2022-01-15",
    "last_service_date": "2024-11-20",
    "service_history_count": 5
  }
]
```

### File 2: `service_centers.json` - Service Center Data

```json
[
  {
    "service_center_id": "center_001",
    "name": "NaviGo Service Center - Mumbai Central",
    "address": "123 MG Road, Mumbai Central, Mumbai 400008",
    "location": {
      "lat": 19.0760,
      "lon": 72.8777
    },
    "timezone": "Asia/Kolkata",
    "capacity": 15,
    "operating_hours": {
      "monday": {"start": "09:00", "end": "18:00"},
      "tuesday": {"start": "09:00", "end": "18:00"},
      "wednesday": {"start": "09:00", "end": "18:00"},
      "thursday": {"start": "09:00", "end": "18:00"},
      "friday": {"start": "09:00", "end": "18:00"},
      "saturday": {"start": "09:00", "end": "15:00"},
      "sunday": {"closed": true}
    },
    "spare_parts_availability": {
      "engine_coolant_system": "available",
      "coolant_pump": "available",
      "coolant_fluid": "available",
      "engine_oil_system": "available",
      "battery": "available",
      "transmission": "available",
      "brake_system": "available"
    },
    "inventory": {
      "coolant_pump": "available",
      "coolant_fluid": "available",
      "engine_oil": "available",
      "battery": "available",
      "brake_pads": "available"
    },
    "technicians": [
      "tech_001",
      "tech_002",
      "tech_003"
    ],
    "available_slots": []
  },
  {
    "service_center_id": "center_002",
    "name": "NaviGo Service Center - Andheri",
    "address": "456 SV Road, Andheri West, Mumbai 400053",
    "location": {
      "lat": 19.1136,
      "lon": 72.8297
    },
    "timezone": "Asia/Kolkata",
    "capacity": 12,
    "operating_hours": {
      "monday": {"start": "09:00", "end": "18:00"},
      "tuesday": {"start": "09:00", "end": "18:00"},
      "wednesday": {"start": "09:00", "end": "18:00"},
      "thursday": {"start": "09:00", "end": "18:00"},
      "friday": {"start": "09:00", "end": "18:00"},
      "saturday": {"start": "09:00", "end": "15:00"},
      "sunday": {"closed": true}
    },
    "spare_parts_availability": {
      "engine_coolant_system": "available",
      "coolant_pump": "in_transit",
      "coolant_fluid": "available",
      "engine_oil_system": "available",
      "battery": "available"
    },
    "inventory": {
      "coolant_pump": "in_transit",
      "coolant_fluid": "available",
      "engine_oil": "available",
      "battery": "available"
    },
    "technicians": [
      "tech_004",
      "tech_005"
    ],
    "available_slots": []
  }
]
```

---

## How to Upload This Data

### Option 1: Using Firebase Console
1. Go to Firebase Console → Firestore Database
2. Create collections: `vehicles`, `service_centers`
3. Upload documents manually

### Option 2: Using a Script (Recommended)

Create a script `scripts/upload_test_data.py`:

```python
import json
from google.cloud import firestore

# Initialize Firestore
db = firestore.Client(project="navigo-27206")

# Load vehicle data
with open("vehicles.json", "r") as f:
    vehicles = json.load(f)

for vehicle in vehicles:
    vehicle_id = vehicle["vehicle_id"]
    db.collection("vehicles").document(vehicle_id).set(vehicle)
    print(f"Uploaded vehicle: {vehicle_id}")

# Load service center data
with open("service_centers.json", "r") as f:
    service_centers = json.load(f)

for center in service_centers:
    center_id = center["service_center_id"]
    db.collection("service_centers").document(center_id).set(center)
    print(f"Uploaded service center: {center_id}")

print("✅ All test data uploaded successfully!")
```

### Option 3: Using Firestore REST API

You can also use the Firestore REST API or Firebase Admin SDK to upload data programmatically.

---

## Data Requirements by Agent

### Data Analysis Agent
✅ **Input**: Telemetry data (your JSON file)
- Needs: `vehicle_id`, `timestamp_utc`, sensor data
- ✅ Your data is sufficient

### Diagnosis Agent
✅ **Input**: Anomaly detection results
- Needs: `anomaly_type`, `severity_score`, `telemetry_window`
- ✅ Generated automatically from Data Analysis Agent

### RCA Agent
✅ **Input**: Diagnosis results
- Needs: `component`, `failure_probability`, `estimated_rul_days`
- ✅ Generated automatically from Diagnosis Agent

### Scheduling Agent
⚠️ **Input**: RCA results + Service Center Data
- **Needs from Firestore**:
  - `service_centers` collection (with availability, technicians, parts)
  - `bookings` collection (to check existing bookings)
- ✅ Service center data must be uploaded before scheduling works

### Engagement Agent
⚠️ **Input**: Scheduling results + Vehicle Data
- **Needs from Firestore**:
  - `vehicles` collection (with `owner_name`, `owner_phone`)
- ✅ Vehicle data must be uploaded before engagement works

### Communication Agent
⚠️ **Input**: Engagement results
- **Needs**: `customer_phone` (from vehicle data)
- ✅ Works if vehicle data is uploaded

### Feedback Agent
✅ **Input**: Service completion data
- Needs: HTTP POST with feedback data
- ✅ Works independently

### Manufacturing Agent
✅ **Input**: Feedback results
- Needs: Feedback data + diagnosis data
- ✅ Generated automatically

---

## Quick Setup Checklist

1. ✅ Upload telemetry data (your JSON file) → `ingest_telemetry` endpoint
2. ⚠️ Upload vehicle data → `vehicles` collection in Firestore
3. ⚠️ Upload service center data → `service_centers` collection in Firestore
4. ✅ Run data flow - all agents should work now!

---

## Example: Complete Data Flow Test

1. **Upload Vehicle Data**:
   ```bash
   # Use the upload script or Firebase Console
   python scripts/upload_test_data.py
   ```

2. **Upload Service Center Data**:
   ```bash
   # Same script uploads both
   python scripts/upload_test_data.py
   ```

3. **Upload Telemetry Data**:
   ```bash
   curl -X POST https://YOUR_FUNCTION_URL/ingest_telemetry \
     -H "Content-Type: application/json" \
     -d @telemetry_input_batch.json
   ```

4. **Verify Data Flow**:
   - Check `anomaly_cases` collection (Data Analysis Agent)
   - Check `diagnosis_cases` collection (Diagnosis Agent)
   - Check `rca_cases` collection (RCA Agent)
   - Check `scheduling_cases` collection (Scheduling Agent) ⚠️ Needs service centers
   - Check `engagement_cases` collection (Engagement Agent) ⚠️ Needs vehicle data
   - Check `bookings` collection (Booking created)
   - Check `call_contexts` collection (Communication Agent) ⚠️ Needs vehicle phone

---

## Notes

- **Service Centers**: The scheduling agent will auto-generate `available_slots` if not provided, based on `operating_hours`
- **Technicians**: The scheduling agent will auto-generate technician availability if not provided
- **Phone Numbers**: Must be in E.164 format (e.g., `+919876543210`) for Twilio
- **Timezones**: Use IANA timezone names (e.g., `Asia/Kolkata`)

---

## Troubleshooting

### Scheduling Agent fails: "No service centers available"
→ Upload `service_centers.json` to Firestore

### Engagement Agent fails: "Vehicle not found"
→ Upload `vehicles.json` to Firestore

### Communication Agent fails: "No phone number"
→ Ensure vehicle document has `owner_phone` or `phone` field

### Scheduling Agent: No available slots
→ Check `operating_hours` format and ensure slots are generated correctly

