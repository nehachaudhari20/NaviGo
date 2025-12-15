"""
Cloud Function: data_analysis_agent
Pub/Sub Trigger: Subscribes to navigo-telemetry-ingested topic
Purpose: Detects anomalies in telemetry data and publishes to navigo-anomaly-detected
"""

import json
import uuid
import base64
from datetime import datetime
from google.cloud import pubsub_v1, firestore, bigquery
import functions_framework

# Import agent components
from agent import DataAnalysisAgent
from schemas import TelematicsEvent, AnomalyOutput

# Project configuration
PROJECT_ID = "navigo-27206"
ANOMALY_TOPIC_NAME = "navigo-anomaly-detected"

# BigQuery configuration
DATASET_ID = "telemetry"
TABLE_ID = "anomaly_cases"


@functions_framework.cloud_event
def data_analysis_agent(cloud_event):
    """
    Pub/Sub triggered function that:
    1. Receives telemetry ingestion event
    2. Fetches telemetry window from Firestore
    3. Runs anomaly detection
    4. If anomaly detected: stores case and publishes to Pub/Sub
    """
    
    try:
        # 1. Parse Pub/Sub message
        message_data = json.loads(base64.b64decode(cloud_event.data["message"]["data"]).decode("utf-8"))
        event_id = message_data.get("event_id")
        vehicle_id = message_data.get("vehicle_id")
        
        if not vehicle_id:
            print("Missing vehicle_id in message")
            return
        
        # 2. Fetch telemetry window from Firestore (last 10 events for this vehicle)
        db = firestore.Client()
        telemetry_ref = db.collection("telemetry_events")
        query = telemetry_ref.where("vehicle_id", "==", vehicle_id)\
                             .order_by("timestamp_utc", direction=firestore.Query.DESCENDING)\
                             .limit(10)
        
        events_docs = list(query.stream())
        if not events_docs:
            print(f"No telemetry events found for vehicle {vehicle_id}")
            return
        
        # 3. Convert Firestore documents to TelematicsEvent objects
        events = []
        for doc in reversed(events_docs):  # Reverse to get chronological order
            doc_data = doc.to_dict()
            # Convert Firestore data to TelematicsEvent
            event = TelematicsEvent(
                event_id=doc_data.get("event_id", doc.id),
                vehicle_id=doc_data.get("vehicle_id"),
                timestamp_utc=datetime.fromisoformat(doc_data.get("timestamp_utc").replace("Z", "+00:00")) if isinstance(doc_data.get("timestamp_utc"), str) else doc_data.get("timestamp_utc"),
                gps_lat=doc_data.get("gps_lat"),
                gps_lon=doc_data.get("gps_lon"),
                speed_kmph=doc_data.get("speed_kmph"),
                odometer_km=doc_data.get("odometer_km"),
                engine_rpm=doc_data.get("engine_rpm"),
                engine_coolant_temp_c=doc_data.get("engine_coolant_temp_c"),
                engine_oil_temp_c=doc_data.get("engine_oil_temp_c"),
                fuel_level_pct=doc_data.get("fuel_level_pct"),
                battery_soc_pct=doc_data.get("battery_soc_pct"),
                battery_soh_pct=doc_data.get("battery_soh_pct"),
                dtc_codes=doc_data.get("dtc_codes", [])
            )
            events.append(event)
        
        # 4. Run anomaly detection
        agent = DataAnalysisAgent()
        anomaly_output = agent.detect_anomaly(events)
        
        # 5. If anomaly detected, create case and publish
        if anomaly_output.anomaly_detected:
            case_id = f"case_{uuid.uuid4().hex[:10]}"
            
            # Prepare case data for Firestore
            case_data = {
                "case_id": case_id,
                "vehicle_id": vehicle_id,
                "anomaly_detected": True,
                "anomaly_type": anomaly_output.anomaly_type,
                "severity_score": anomaly_output.severity_score,
                "status": "pending_diagnosis",
                "created_at": firestore.SERVER_TIMESTAMP
            }
            
            # Store telemetry_window as reference (store IDs, not full objects)
            case_data["telemetry_event_ids"] = [e.event_id for e in anomaly_output.telemetry_window]
            
            # 6. Store in Firestore
            db.collection("anomaly_cases").document(case_id).set(case_data)
            print(f"Created anomaly case {case_id} for vehicle {vehicle_id}")
            
            # 7. Prepare BigQuery row
            bq_row = prepare_bigquery_row(case_data)
            
            # 8. Sync to BigQuery
            bq_client = bigquery.Client()
            table_ref = bq_client.dataset(DATASET_ID).table(TABLE_ID)
            errors = bq_client.insert_rows_json(table_ref, [bq_row])
            
            if errors:
                print(f"BigQuery insert errors: {errors}")
            else:
                print(f"Synced anomaly case {case_id} to BigQuery")
            
            # 9. Publish to Pub/Sub
            publisher = pubsub_v1.PublisherClient()
            topic_path = publisher.topic_path(PROJECT_ID, ANOMALY_TOPIC_NAME)
            
            message_data = {
                "case_id": case_id,
                "vehicle_id": vehicle_id,
                "anomaly_type": anomaly_output.anomaly_type,
                "severity_score": anomaly_output.severity_score
            }
            
            message_bytes = json.dumps(message_data).encode("utf-8")
            future = publisher.publish(topic_path, message_bytes)
            message_id = future.result()
            print(f"Published anomaly case {case_id} to {ANOMALY_TOPIC_NAME}: {message_id}")
            
            return {"status": "success", "case_id": case_id, "anomaly_detected": True}
        else:
            print(f"No anomaly detected for vehicle {vehicle_id}")
            return {"status": "success", "anomaly_detected": False}
        
    except Exception as e:
        print(f"Error in data_analysis_agent: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "error": str(e)}


def prepare_bigquery_row(case_data: dict) -> dict:
    """
    Prepare anomaly case data for BigQuery insertion.
    """
    bq_row = {}
    
    field_mapping = {
        "case_id": "case_id",
        "vehicle_id": "vehicle_id",
        "anomaly_detected": "anomaly_detected",
        "anomaly_type": "anomaly_type",
        "severity_score": "severity_score",
        "status": "status",
        "created_at": "created_at"
    }
    
    for key, bq_key in field_mapping.items():
        if key not in case_data:
            continue
        
        value = case_data[key]
        
        # Handle Firestore SERVER_TIMESTAMP
        if key == "created_at" and hasattr(value, "timestamp"):
            from datetime import datetime, timezone
            bq_row[bq_key] = datetime.now(timezone.utc).isoformat()
        elif value is None:
            continue
        else:
            bq_row[bq_key] = value
    
    return bq_row

