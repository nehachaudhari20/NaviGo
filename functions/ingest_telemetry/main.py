"""
Cloud Function: ingest_telemetry
HTTP Trigger: Receives vehicle telemetry data via POST request
Purpose: Validates and stores telemetry data in Firestore
"""

import json
import uuid
from datetime import datetime
from flask import Request, jsonify
from google.cloud import firestore
from schemas import TelematicsEvent

# Initialize Firestore client
db = firestore.Client()


def ingest_telemetry(request: Request):
    """
    HTTP Cloud Function to ingest vehicle telemetry data.
    
    Expected JSON body:
    {
        "event_id": "evt_123" (optional, auto-generated if missing),
        "vehicle_id": "MH-07-AB-1234",
        "timestamp_utc": "2024-12-11T10:30:45.123Z",
        "gps_lat": 19.0760,
        "gps_lon": 72.8777,
        "speed_kmph": 60.5,
        "odometer_km": 45230.5,
        "engine_rpm": 2500,
        "engine_coolant_temp_c": 85.0,
        ...
    }
    """
    
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)
    
    # Only allow POST
    if request.method != 'POST':
        return jsonify({"error": "Method not allowed"}), 405
    
    try:
        # 1. Parse and validate request body
        request_json = request.get_json(silent=True)
        if not request_json:
            return jsonify({"error": "Invalid JSON body"}), 400
        
        # 2. Generate event_id if not provided
        if 'event_id' not in request_json or not request_json['event_id']:
            request_json['event_id'] = f"evt_{uuid.uuid4().hex[:10]}"
        
        # 3. Validate data against Pydantic schema
        try:
            # Convert timestamp string to datetime if needed
            if 'timestamp_utc' in request_json and isinstance(request_json['timestamp_utc'], str):
                request_json['timestamp_utc'] = datetime.fromisoformat(
                    request_json['timestamp_utc'].replace('Z', '+00:00')
                )
            
            telemetry_event = TelematicsEvent(**request_json)
        except Exception as e:
            return jsonify({
                "error": "Validation failed",
                "details": str(e)
            }), 400
        
        # 4. Convert to dict and add created_at timestamp
        event_data = telemetry_event.dict()
        event_data['created_at'] = firestore.SERVER_TIMESTAMP
        
        # Convert datetime to ISO string for Firestore
        if isinstance(event_data.get('timestamp_utc'), datetime):
            event_data['timestamp_utc'] = event_data['timestamp_utc'].isoformat()
        
        # Ensure dtc_codes is a list (Pydantic handles this, but ensure it's stored correctly)
        if 'dtc_codes' in event_data and not isinstance(event_data['dtc_codes'], list):
            event_data['dtc_codes'] = []
        
        # 5. Write to Firestore
        doc_ref = db.collection("telemetry_events").document(event_data['event_id'])
        doc_ref.set(event_data)
        
        # 6. Return success response
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        }
        
        return jsonify({
            "status": "success",
            "event_id": event_data['event_id'],
            "message": "Telemetry data stored successfully"
        }), 200, headers
        
    except Exception as e:
        # Log error (Cloud Functions automatically logs to Cloud Logging)
        print(f"Error ingesting telemetry: {str(e)}")
        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500

