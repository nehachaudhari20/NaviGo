"""
Cloud Function: telemetry_firestore_trigger
Firestore Trigger: Triggers when document is created in telemetry_events collection
Purpose: Publishes to Pub/Sub and syncs to BigQuery
"""

import json
import base64
from google.cloud import pubsub_v1
from google.cloud import bigquery
import functions_framework

# Project and topic configuration
PROJECT_ID = "navigo-27206"
TOPIC_NAME = "navigo-telemetry"

# BigQuery configuration
DATASET_ID = "telemetry"
TABLE_ID = "telemetry_events"


@functions_framework.cloud_event
def telemetry_firestore_trigger(cloud_event):
    """
    Firestore trigger function that:
    1. Publishes telemetry event to Pub/Sub topic
    2. Syncs data to BigQuery
    """
    
    try:
        # 1. Parse Firestore event data
        # cloud_event.data might be a dict or JSON string
        if isinstance(cloud_event.data, str):
            event_data = json.loads(cloud_event.data)
        else:
            event_data = cloud_event.data
        
        # 2. Extract document path and check collection
        doc_path = event_data.get("value", {}).get("name", "")
        if "telemetry_events" not in doc_path:
            print(f"Skipping event from different collection: {doc_path}")
            return
        
        # 3. Extract document data
        value = event_data.get("value", {})
        if not value:
            print("No document data in event")
            return
        
        # Extract fields from Firestore document
        fields = value.get("fields", {})
        if not fields:
            print("Empty document fields")
            return
        
        # Convert Firestore fields to dict
        doc_data = {}
        for key, field_value in fields.items():
            # Handle different Firestore value types
            if "stringValue" in field_value:
                doc_data[key] = field_value["stringValue"]
            elif "integerValue" in field_value:
                doc_data[key] = int(field_value["integerValue"])
            elif "doubleValue" in field_value:
                doc_data[key] = float(field_value["doubleValue"])
            elif "booleanValue" in field_value:
                doc_data[key] = field_value["booleanValue"]
            elif "arrayValue" in field_value:
                # Handle array (like dtc_codes)
                array_values = field_value["arrayValue"].get("values", [])
                doc_data[key] = [v.get("stringValue", "") for v in array_values if "stringValue" in v]
            elif "timestampValue" in field_value:
                doc_data[key] = field_value["timestampValue"]
            elif "nullValue" in field_value:
                doc_data[key] = None
        
        if not doc_data:
            print("Empty document data after conversion")
            return
        
        # 3. Prepare Pub/Sub message
        message_data = {
            "event_id": doc_data.get("event_id"),
            "vehicle_id": doc_data.get("vehicle_id"),
            "timestamp": doc_data.get("timestamp_utc")
        }
        
        # 4. Initialize clients (inside function for better error handling)
        publisher = pubsub_v1.PublisherClient()
        bq_client = bigquery.Client()
        
        # 5. Publish to Pub/Sub
        topic_path = publisher.topic_path(PROJECT_ID, TOPIC_NAME)
        message_bytes = json.dumps(message_data).encode("utf-8")
        future = publisher.publish(topic_path, message_bytes)
        message_id = future.result()
        print(f"Published message {message_id} to {TOPIC_NAME}")
        
        # 6. Prepare data for BigQuery (convert timestamps and handle nested data)
        bq_row = prepare_bigquery_row(doc_data)
        
        # 7. Insert into BigQuery
        table_ref = bq_client.dataset(DATASET_ID).table(TABLE_ID)
        errors = bq_client.insert_rows_json(table_ref, [bq_row])
        
        if errors:
            print(f"BigQuery insert errors: {errors}")
        else:
            print(f"Successfully synced to BigQuery: {doc_data.get('event_id')}")
        
        return {"status": "success", "message_id": message_id}
        
    except Exception as e:
        print(f"Error in telemetry_firestore_trigger: {str(e)}")
        # Don't raise - we don't want to retry indefinitely
        return {"status": "error", "error": str(e)}


def prepare_bigquery_row(doc_data: dict) -> dict:
    """
    Prepare Firestore document data for BigQuery insertion.
    Converts timestamps and handles nested structures.
    Matches exact schema: TelematicsEvent
    """
    bq_row = {}
    
    # Map all fields according to TelematicsEvent schema
    field_mapping = {
        "event_id": "event_id",
        "vehicle_id": "vehicle_id",
        "timestamp_utc": "timestamp_utc",
        "gps_lat": "gps_lat",
        "gps_lon": "gps_lon",
        "speed_kmph": "speed_kmph",
        "odometer_km": "odometer_km",
        "engine_rpm": "engine_rpm",
        "engine_coolant_temp_c": "engine_coolant_temp_c",
        "engine_oil_temp_c": "engine_oil_temp_c",
        "fuel_level_pct": "fuel_level_pct",
        "battery_soc_pct": "battery_soc_pct",
        "battery_soh_pct": "battery_soh_pct",
        "dtc_codes": "dtc_codes",
        "created_at": "created_at"
    }
    
    for key, bq_key in field_mapping.items():
        if key not in doc_data:
            continue
            
        value = doc_data[key]
        
        # Handle Firestore SERVER_TIMESTAMP
        if key == "created_at" and hasattr(value, "timestamp"):
            from datetime import datetime, timezone
            bq_row[bq_key] = datetime.now(timezone.utc).isoformat()
        # Handle dtc_codes: convert list to comma-separated string for BigQuery STRING field
        elif key == "dtc_codes" and isinstance(value, list):
            bq_row[bq_key] = ",".join(value) if value else ""
        # Handle timestamps (convert ISO string to TIMESTAMP format)
        elif key == "timestamp_utc" and isinstance(value, str):
            bq_row[bq_key] = value  # BigQuery will parse ISO string
        # Handle None values (BigQuery will use NULL)
        elif value is None:
            continue
        # Handle other types
        else:
            bq_row[bq_key] = value
    
    return bq_row

