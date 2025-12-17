#!/usr/bin/env python3
"""
Test script to verify STEP 6 & 7: RCA Agent and Scheduling Agent
Tests root cause analysis and intelligent scheduling
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

def generate_anomaly_for_rca_scheduling(vehicle_id: str = "MH-07-AB-1234") -> Dict[str, Any]:
    """Generate telemetry that should trigger complete flow through RCA and Scheduling"""
    return {
        "event_id": f"evt_rca_sched_{int(time.time())}",
        "vehicle_id": vehicle_id,
        "timestamp_utc": datetime.utcnow().isoformat() + "Z",
        "gps_lat": 19.0760,
        "gps_lon": 72.8777,
        "speed_kmph": 60.5,
        "odometer_km": 45230.5,
        "engine_rpm": 2500,
        "engine_coolant_temp_c": 115.0,  # High temperature - should trigger complete flow
        "engine_oil_temp_c": 120.0,
        "fuel_level_pct": 45.0,
        "battery_soc_pct": 85.0,
        "battery_soh_pct": 92.0,
        "dtc_codes": ["P0301"]  # DTC code - should help with diagnosis
    }

def test_step6_7_complete_flow():
    """Test complete flow: Ingest → Anomaly → Diagnosis → RCA → Scheduling"""
    print("\n" + "="*60)
    print("STEP 6 & 7: Testing Complete RCA and Scheduling Flow")
    print("="*60)
    print("\nFlow: Telemetry → Anomaly → Diagnosis → RCA → Scheduling")
    
    test_data = generate_anomaly_for_rca_scheduling()
    
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
        
        # Step 2: Wait for complete pipeline
        print(f"\n⏳ Step 2: Waiting 60 seconds for complete pipeline to process...")
        print("   (Anomaly Detection → Diagnosis → RCA → Scheduling)")
        time.sleep(60)
        
        print("\n📋 Verification Steps:")
        print("   1. Check Firestore 'anomaly_cases' collection")
        print("      - Should have case with anomaly_type")
        print("   2. Check Firestore 'diagnosis_cases' collection")
        print("      - Should have diagnosis with component, RUL, severity")
        print("   3. Check Firestore 'rca_cases' collection")
        print("      - Should have RCA with root_cause, recommended_action, capa_type")
        print("      - Should have confidence field")
        print("   4. Check Firestore 'scheduling_cases' collection")
        print("      - Should have scheduling with best_slot, service_center, slot_type")
        print("      - Should have fallback_slots")
        print("   5. Check Firestore 'bookings' collection")
        print("      - Should have booking with scheduled_date, scheduled_time")
        print("      - Should have status: 'pending'")
        print("   6. Check Cloud Functions logs:")
        print("      - rca-agent (should show Gemini LLM calls)")
        print("      - scheduling-agent (should show Gemini LLM calls)")
        print("   7. Check Pub/Sub topics:")
        print("      - navigo-rca-complete (should have message)")
        print("      - navigo-scheduling-complete (should have message)")
        print("   8. Check Frontend:")
        print("      - Service Center: Priority Queue should show RCA and scheduling")
        print("      - Customer Dashboard: Service History should show booking")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_step6_rca_only():
    """Test RCA agent only (requires existing diagnosis)"""
    print("\n" + "="*60)
    print("STEP 6: Testing RCA Agent Only")
    print("="*60)
    print("\nNote: This requires an existing diagnosis case")
    print("Run complete flow test first to create diagnosis case")
    
    # This would require fetching a diagnosis_id from Firestore
    # For now, just provide instructions
    print("\n📋 Manual Test Steps:")
    print("   1. Find a diagnosis_id from Firestore 'diagnosis_cases' collection")
    print("   2. Use trigger_agent endpoint to trigger RCA:")
    print(f"      POST {TRIGGER_AGENT_ENDPOINT}")
    print("      Body: {")
    print('        "agent_name": "rca",')
    print('        "case_id": "<case_id>",')
    print('        "vehicle_id": "<vehicle_id>",')
    print('        "data": {')
    print('          "diagnosis_id": "<diagnosis_id>"')
    print("        }")
    print("      }")
    print("   3. Check Firestore 'rca_cases' collection for results")
    
    return True

def test_step7_scheduling_only():
    """Test Scheduling agent only (requires existing RCA)"""
    print("\n" + "="*60)
    print("STEP 7: Testing Scheduling Agent Only")
    print("="*60)
    print("\nNote: This requires an existing RCA case")
    print("Run complete flow test first to create RCA case")
    
    # This would require fetching an rca_id from Firestore
    # For now, just provide instructions
    print("\n📋 Manual Test Steps:")
    print("   1. Find an rca_id from Firestore 'rca_cases' collection")
    print("   2. Use trigger_agent endpoint to trigger Scheduling:")
    print(f"      POST {TRIGGER_AGENT_ENDPOINT}")
    print("      Body: {")
    print('        "agent_name": "scheduling",')
    print('        "case_id": "<case_id>",')
    print('        "vehicle_id": "<vehicle_id>",')
    print('        "data": {')
    print('          "rca_id": "<rca_id>",')
    print('          "diagnosis_id": "<diagnosis_id>"')
    print("        }")
    print("      }")
    print("   3. Check Firestore 'scheduling_cases' and 'bookings' collections")
    
    return True

def main():
    """Run STEP 6 & 7 tests"""
    print("\n" + "="*60)
    print("STEP 6 & 7: RCA & SCHEDULING AGENTS TESTING")
    print("="*60)
    print("\nThis script tests:")
    print("1. STEP 6: Root Cause Analysis (RCA Agent)")
    print("2. STEP 7: Intelligent Scheduling (Scheduling Agent)")
    print("3. Complete flow: Diagnosis → RCA → Scheduling")
    
    # Test complete flow
    test_step6_7_complete_flow()
    
    # Provide instructions for individual agent tests
    test_step6_rca_only()
    test_step7_scheduling_only()
    
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print("\n✅ STEP 6 & 7 (RCA & Scheduling): Tests initiated")
    print("\n📋 Manual Verification Required:")
    print("   1. Check Firestore collections:")
    print("      - rca_cases (should have entries with root_cause, confidence, capa_type)")
    print("      - scheduling_cases (should have entries with best_slot, slot_type)")
    print("      - bookings (should have entries with scheduled_date, scheduled_time)")
    print("\n   2. Check Cloud Functions logs:")
    print("      - rca-agent (should show Gemini LLM calls)")
    print("      - scheduling-agent (should show Gemini LLM calls)")
    print("\n   3. Check Frontend:")
    print("      - Service Center: Priority Queue should show RCA and scheduling")
    print("      - Customer Dashboard: Service History should show booking")
    print("\n   4. Verify RCA Data Structure:")
    print("      - root_cause: Should be specific and technical")
    print("      - confidence: Should be 0.0-1.0")
    print("      - recommended_action: Should be actionable")
    print("      - capa_type: Should be 'Corrective' or 'Preventive'")
    print("\n   5. Verify Scheduling Data Structure:")
    print("      - best_slot: Should be ISO timestamp in UTC")
    print("      - slot_type: Should be 'urgent', 'normal', or 'delayed'")
    print("      - fallback_slots: Should have at least 2 slots")
    print("      - service_center: Should be valid service center ID")
    print("\n")

if __name__ == "__main__":
    main()


