#!/usr/bin/env python3
"""
Test script to verify STEP 4: Master Orchestrator
Tests confidence-based routing to diagnosis agent or human review
"""

import json
import requests
import time
from datetime import datetime
from typing import Dict, Any

# Configuration
API_BASE_URL = "https://us-central1-navigo-27206.cloudfunctions.net"
INGEST_ENDPOINT = f"{API_BASE_URL}/ingest_telemetry"

def generate_high_confidence_anomaly(vehicle_id: str = "MH-07-AB-1234") -> Dict[str, Any]:
    """Generate telemetry that should trigger high confidence anomaly (>= 85%)"""
    return {
        "event_id": f"evt_high_conf_{int(time.time())}",
        "vehicle_id": vehicle_id,
        "timestamp_utc": datetime.utcnow().isoformat() + "Z",
        "gps_lat": 19.0760,
        "gps_lon": 72.8777,
        "speed_kmph": 60.5,
        "odometer_km": 45230.5,
        "engine_rpm": 2500,
        "engine_coolant_temp_c": 115.0,  # High temperature - should trigger anomaly
        "engine_oil_temp_c": 120.0,
        "fuel_level_pct": 45.0,
        "battery_soc_pct": 85.0,
        "battery_soh_pct": 92.0,
        "dtc_codes": ["P0301"]  # DTC code present - high confidence anomaly
    }

def generate_low_confidence_anomaly(vehicle_id: str = "MH-07-AB-1234") -> Dict[str, Any]:
    """Generate telemetry that should trigger low confidence anomaly (< 85%)"""
    return {
        "event_id": f"evt_low_conf_{int(time.time())}",
        "vehicle_id": vehicle_id,
        "timestamp_utc": datetime.utcnow().isoformat() + "Z",
        "gps_lat": 19.0760,
        "gps_lon": 72.8777,
        "speed_kmph": 60.5,
        "odometer_km": 45230.5,
        "engine_rpm": 2500,
        "engine_coolant_temp_c": 95.0,  # Slightly elevated but not critical
        "engine_oil_temp_c": 100.0,
        "fuel_level_pct": 45.0,
        "battery_soc_pct": 75.0,  # Lower but not critical
        "battery_soh_pct": 85.0,
        "dtc_codes": []  # No DTC codes - lower confidence
    }

def test_step4_high_confidence():
    """Test STEP 4 with high confidence anomaly (should route to diagnosis)"""
    print("\n" + "="*60)
    print("STEP 4: Testing High Confidence Routing (>= 85%)")
    print("="*60)
    print("\nExpected: Routes to diagnosis_agent (confidence >= 85%)")
    
    test_data = generate_high_confidence_anomaly()
    
    try:
        print(f"\n📤 Sending high-confidence anomaly data...")
        response = requests.post(
            INGEST_ENDPOINT,
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("status") == "success":
                print(f"✅ Telemetry ingested: {result.get('event_id')}")
                print("\n⏳ Waiting 20 seconds for pipeline to process...")
                print("   (Data Analysis → Orchestrator → Diagnosis/Human Review)")
                time.sleep(20)
                
                print("\n📋 Verification Steps:")
                print("   1. Check Firestore 'anomaly_cases' collection")
                print("   2. Check Firestore 'pipeline_states' collection")
                print("   3. Check Firestore 'diagnosis_cases' collection (if routed to diagnosis)")
                print("   4. Check Cloud Functions logs: master-orchestrator")
                print("   5. Check Pub/Sub topic: navigo-diagnosis-request")
                
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

def test_step4_low_confidence():
    """Test STEP 4 with low confidence anomaly (should route to human review)"""
    print("\n" + "="*60)
    print("STEP 4: Testing Low Confidence Routing (< 85%)")
    print("="*60)
    print("\nExpected: Routes to human_reviews (confidence < 85%)")
    
    test_data = generate_low_confidence_anomaly()
    
    try:
        print(f"\n📤 Sending low-confidence anomaly data...")
        response = requests.post(
            INGEST_ENDPOINT,
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("status") == "success":
                print(f"✅ Telemetry ingested: {result.get('event_id')}")
                print("\n⏳ Waiting 20 seconds for pipeline to process...")
                print("   (Data Analysis → Orchestrator → Human Review)")
                time.sleep(20)
                
                print("\n📋 Verification Steps:")
                print("   1. Check Firestore 'anomaly_cases' collection")
                print("   2. Check Firestore 'pipeline_states' collection")
                print("   3. Check Firestore 'human_reviews' collection (should have entry)")
                print("   4. Check frontend Human Review Queue (should show item)")
                print("   5. Check Cloud Functions logs: master-orchestrator")
                
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
    """Run STEP 4 tests"""
    print("\n" + "="*60)
    print("STEP 4: MASTER ORCHESTRATOR TESTING")
    print("="*60)
    print("\nThis script tests the master orchestrator's confidence-based routing:")
    print("1. High confidence (>= 85%): Routes to diagnosis_agent")
    print("2. Low confidence (< 85%): Routes to human_reviews")
    
    # Test high confidence routing
    test_step4_high_confidence()
    
    # Test low confidence routing
    test_step4_low_confidence()
    
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print("\n✅ STEP 4 (Orchestrator): Tests initiated")
    print("\n📋 Manual Verification Required:")
    print("   1. Check Firestore collections:")
    print("      - anomaly_cases (should have entries)")
    print("      - pipeline_states (should show routing decisions)")
    print("      - human_reviews (should have entries for low confidence)")
    print("      - diagnosis_cases (should have entries for high confidence)")
    print("\n   2. Check Cloud Functions logs:")
    print("      - data-analysis-agent")
    print("      - master-orchestrator")
    print("      - diagnosis-agent (if high confidence)")
    print("\n   3. Check Frontend:")
    print("      - Human Review Queue should show low confidence items")
    print("      - Priority Vehicle Queue should show high confidence items")
    print("\n")

if __name__ == "__main__":
    main()


