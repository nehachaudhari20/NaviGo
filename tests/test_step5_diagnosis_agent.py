#!/usr/bin/env python3
"""
Test script to verify STEP 5: Diagnosis Agent
Tests component failure diagnosis using Gemini 2.5 Flash
"""

import json
import requests
import time
from datetime import datetime
from typing import Dict, Any

# Configuration
API_BASE_URL = "https://us-central1-navigo-27206.cloudfunctions.net"
INGEST_ENDPOINT = f"{API_BASE_URL}/ingest_telemetry"
TRIGGER_AGENT_ENDPOINT = f"{API_BASE_URL}/trigger_agent"

def generate_anomaly_for_diagnosis(vehicle_id: str = "MH-07-AB-1234") -> Dict[str, Any]:
    """Generate telemetry that should trigger diagnosis"""
    return {
        "event_id": f"evt_diagnosis_{int(time.time())}",
        "vehicle_id": vehicle_id,
        "timestamp_utc": datetime.utcnow().isoformat() + "Z",
        "gps_lat": 19.0760,
        "gps_lon": 72.8777,
        "speed_kmph": 60.5,
        "odometer_km": 45230.5,
        "engine_rpm": 2500,
        "engine_coolant_temp_c": 115.0,  # High temperature - should trigger thermal_overheat
        "engine_oil_temp_c": 120.0,
        "fuel_level_pct": 45.0,
        "battery_soc_pct": 85.0,
        "battery_soh_pct": 92.0,
        "dtc_codes": ["P0301"]  # DTC code - should help with diagnosis
    }

def test_step5_complete_flow():
    """Test complete flow: Ingest → Anomaly Detection → Diagnosis"""
    print("\n" + "="*60)
    print("STEP 5: Testing Complete Diagnosis Flow")
    print("="*60)
    print("\nFlow: Telemetry → Anomaly Detection → Diagnosis Agent")
    
    test_data = generate_anomaly_for_diagnosis()
    
    try:
        # Step 1: Ingest telemetry
        print(f"\n📤 Step 1: Ingesting telemetry...")
        response = requests.post(
            INGEST_ENDPOINT,
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to ingest telemetry: HTTP {response.status_code}")
            print(f"   Error: {response.text}")
            return False
        
        result = response.json()
        if result.get("status") != "success":
            print(f"❌ Telemetry ingestion failed: {result.get('error')}")
            return False
        
        event_id = result.get("event_id")
        print(f"✅ Telemetry ingested: {event_id}")
        
        # Step 2: Wait for anomaly detection
        print(f"\n⏳ Step 2: Waiting 15 seconds for anomaly detection...")
        time.sleep(15)
        
        # Step 3: Wait for diagnosis
        print(f"\n⏳ Step 3: Waiting 20 seconds for diagnosis agent to process...")
        print("   (Anomaly Detection → Master Orchestrator → Diagnosis Agent)")
        time.sleep(20)
        
        print("\n📋 Verification Steps:")
        print("   1. Check Firestore 'anomaly_cases' collection")
        print("      - Should have case with anomaly_type: 'thermal_overheat'")
        print("   2. Check Firestore 'diagnosis_cases' collection")
        print("      - Should have diagnosis with component: 'engine_coolant_system'")
        print("      - Should have failure_probability, estimated_rul_days, severity")
        print("      - Should have confidence field")
        print("   3. Check Firestore 'pipeline_states' collection")
        print("      - Should show routing from data_analysis → diagnosis")
        print("   4. Check Cloud Functions logs:")
        print("      - data-analysis-agent")
        print("      - master-orchestrator")
        print("      - diagnosis-agent")
        print("   5. Check Pub/Sub topics:")
        print("      - navigo-anomaly-detected (should have message)")
        print("      - navigo-diagnosis-complete (should have message)")
        print("   6. Check Frontend:")
        print("      - Customer Dashboard: AI Predictions should show diagnosis")
        print("      - Service Center: Priority Queue should show diagnosis details")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_step5_manual_trigger():
    """Test manual trigger of diagnosis agent"""
    print("\n" + "="*60)
    print("STEP 5: Testing Manual Diagnosis Agent Trigger")
    print("="*60)
    
    # First, we need an anomaly case ID
    # For testing, we'll use a mock case_id
    test_case_id = f"case_test_{int(time.time())}"
    vehicle_id = "MH-07-AB-1234"
    
    try:
        print(f"\n📤 Triggering diagnosis agent manually...")
        print(f"   Case ID: {test_case_id}")
        print(f"   Vehicle ID: {vehicle_id}")
        
        response = requests.post(
            TRIGGER_AGENT_ENDPOINT,
            json={
                "agent_name": "diagnosis",
                "case_id": test_case_id,
                "vehicle_id": vehicle_id,
                "data": {
                    "anomaly_type": "thermal_overheat",
                    "severity_score": 0.75
                }
            },
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("status") == "success":
                print(f"✅ Diagnosis agent triggered: {result.get('message_id')}")
                print("\n⏳ Waiting 15 seconds for diagnosis to complete...")
                time.sleep(15)
                print("\n📋 Check Firestore 'diagnosis_cases' collection for results")
                return True
            else:
                print(f"❌ Failed: {result.get('error')}")
                return False
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    """Run STEP 5 tests"""
    print("\n" + "="*60)
    print("STEP 5: DIAGNOSIS AGENT TESTING")
    print("="*60)
    print("\nThis script tests the diagnosis agent:")
    print("1. Complete flow: Telemetry → Anomaly → Diagnosis")
    print("2. Manual trigger: Direct diagnosis agent trigger")
    
    # Test complete flow
    test_step5_complete_flow()
    
    # Test manual trigger (optional - requires existing anomaly case)
    # test_step5_manual_trigger()
    
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print("\n✅ STEP 5 (Diagnosis Agent): Tests initiated")
    print("\n📋 Manual Verification Required:")
    print("   1. Check Firestore collections:")
    print("      - diagnosis_cases (should have entries with component, RUL, severity)")
    print("      - pipeline_states (should show diagnosis stage)")
    print("      - anomaly_cases (should have status: 'diagnosed')")
    print("\n   2. Check Cloud Functions logs:")
    print("      - diagnosis-agent (should show Gemini LLM calls)")
    print("\n   3. Check Frontend:")
    print("      - Customer Dashboard: AI Predictions should show diagnosis results")
    print("      - Service Center: Priority Queue should show component and RUL")
    print("\n   4. Verify Diagnosis Data Structure:")
    print("      - component: Should be mapped from anomaly_type")
    print("      - failure_probability: Should be calculated from severity_score")
    print("      - estimated_rul_days: Should be calculated based on severity")
    print("      - severity: Should be 'Low', 'Medium', or 'High'")
    print("      - confidence: Should be present for orchestrator")
    print("\n")

if __name__ == "__main__":
    main()


