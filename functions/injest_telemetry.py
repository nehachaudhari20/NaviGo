# functions/ingest_telemetry.py
from fastapi import APIRouter
from datetime import datetime
from google.cloud import firestore
from agents.data_analysis.agent import run_anomaly_detection
from agents.data_analysis.schemas import TelematicsEvent

router = APIRouter()
db = firestore.Client()

@router.post("/ingest")
def ingest_telemetry(event: TelematicsEvent):
    
    # 1. Store raw event
    db.collection("telemetry_events").document(event.event_id).set(event.dict())
    
    # 2. Trigger Data Analysis Agent
    anomaly_output = run_anomaly_detection(event)
    
    # 3. If anomaly detected, store case
    if anomaly_output.anomaly_detected:
        db.collection("anomaly_cases").add(anomaly_output.dict())
    
    return {
        "status": "success",
        "anomaly_detected": anomaly_output.anomaly_detected,
        "anomaly_info": anomaly_output.dict()
    }
