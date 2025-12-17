"""
Cloud Function: telemetry_firestore_trigger
Firestore Trigger: Triggers when document is created in telemetry_events collection
Purpose: Publishes to Pub/Sub and syncs to BigQuery
"""

import json
import base64
from google.cloud import pubsub_v1
from google.cloud import bigquery
from google.cloud import firestore
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
        # For Firestore triggers via Eventarc, data comes as protobuf-encoded bytes
        # We need to decode it using DocumentEventData
        
        # 1. Extract document ID directly from protobuf bytes
        # For 2nd gen Firestore triggers, data comes as protobuf-encoded bytes
        # The document ID (event_id) is embedded in the protobuf structure
        doc_id = None
        
        if isinstance(cloud_event.data, bytes):
            try:
                # Simple approach: Look for "evt_" pattern in the bytes (all event IDs start with this)
                # The protobuf contains the document path: ...telemetry_events/evt_XXXXX...
                evt_pos = cloud_event.data.find(b'evt_')
                if evt_pos != -1:
                    # Extract the event ID (typically 10-20 characters: evt_ + 10 hex chars)
                    # Extract up to 25 bytes to cover "evt_" + max 20 char ID
                    id_bytes = cloud_event.data[evt_pos:evt_pos+25]
                    # Find end of string (look for null byte, non-printable, or end)
                    for i, byte in enumerate(id_bytes):
                        if byte == 0 or (byte < 32 and byte != 9 and byte != 10 and byte != 13):  # null, tab, newline, carriage return are OK
                            id_bytes = id_bytes[:i]
                            break
                    # Also ensure we only take alphanumeric/underscore/hyphen
                    clean_bytes = bytearray()
                    for byte in id_bytes:
                        if (32 <= byte <= 126) and (chr(byte).isalnum() or chr(byte) in ['_', '-']):
                            clean_bytes.append(byte)
                        else:
                            break
                    if clean_bytes:
                        doc_id = clean_bytes.decode('utf-8', errors='ignore')
                        print(f"Extracted document ID from bytes: {doc_id}")
                
                if not doc_id:
                    raise ValueError("Could not find event ID pattern (evt_) in protobuf bytes")
                
            except Exception as e:
                print(f"Error extracting document ID: {str(e)}")
                print(f"First 200 bytes (hex): {cloud_event.data[:200].hex()}")
                print(f"First 200 bytes (decoded): {cloud_event.data[:200].decode('utf-8', errors='ignore')}")
                return {"status": "error", "error": f"Failed to extract document ID: {str(e)}"}
            
            # Fetch the actual document from Firestore to get all fields
            # This is more reliable than parsing all protobuf fields manually
            try:
                db = firestore.Client()
                doc_ref = db.collection("telemetry_events").document(doc_id)
                doc_snapshot = doc_ref.get()
                
                if not doc_snapshot.exists:
                    print(f"Document {doc_id} not found in Firestore")
                    return {"status": "error", "error": "Document not found"}
                
                # Convert Firestore document to dict
                doc_data = doc_snapshot.to_dict()
                print(f"Successfully fetched document {doc_id} from Firestore")
                
            except Exception as e:
                print(f"Error fetching document from Firestore: {str(e)}")
                return {"status": "error", "error": f"Failed to fetch document: {str(e)}"}
            
        elif isinstance(cloud_event.data, dict):
            # Fallback: if data is already a dict (shouldn't happen for Firestore triggers)
            event_data = cloud_event.data
            doc_path = event_data.get("value", {}).get("name", "")
            if "telemetry_events" not in doc_path:
                print(f"Skipping event from different collection: {doc_path}")
                return {"status": "skipped"}
            
            # Extract document ID and fetch from Firestore
            doc_id = doc_path.split("/")[-1] if "/" in doc_path else ""
            db = firestore.Client()
            doc_ref = db.collection("telemetry_events").document(doc_id)
            doc_snapshot = doc_ref.get()
            
            if not doc_snapshot.exists:
                print(f"Document {doc_id} not found")
                return {"status": "error", "error": "Document not found"}
            
            doc_data = doc_snapshot.to_dict()
        else:
            print(f"Unexpected data type: {type(cloud_event.data)}")
            return {"status": "error", "error": f"Unsupported data type: {type(cloud_event.data)}"}
        
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