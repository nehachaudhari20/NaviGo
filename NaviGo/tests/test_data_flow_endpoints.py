#!/usr/bin/env python3
"""
Test script to verify all three steps of the data flow are working:
1. STEP 1: Telemetry Ingestion (HTTP endpoint)
2. STEP 2: Firestore Trigger (automatic)
3. STEP 3: Anomaly Detection (Pub/Sub trigger)
"""

import json
import requests
import time
from datetime import datetime
from typing import Dict, Any

# Configuration
API_BASE_URL = "https://us-central1-navigo-27206.cloudfunctions.net"
INGEST_ENDPOINT = f"{API_BASE_URL}/ingest_telemetry"

def generate_test_telemetry(vehicle_id: str = "MH-07-AB-1234") -> Dict[str, Any]:
    """Generate a test telemetry event"""
    return {
        "event_id": f"evt_test_{int(time.time())}",
        "vehicle_id": vehicle_id,
        "timestamp_utc": datetime.utcnow().isoformat() + "Z",
        "gps_lat": 19.0760,
        "gps_lon": 72.8777,
        "speed_kmph": 60.5,
        "odometer_km": 45230.5,
        "engine_rpm": 2500,
        "engine_coolant_temp_c": 85.0,
        "engine_oil_temp_c": 90.0,
        "fuel_level_pct": 45.0,
        "battery_soc_pct": 85.0,
        "battery_soh_pct": 92.0,
        "dtc_codes": []
    }

def test_step1_ingest_telemetry():
    """Test STEP 1: Telemetry Ingestion"""
    print("\n" + "="*60)
    print("STEP 1: Testing Telemetry Ingestion Endpoint")
    print("="*60)
    
    test_data = generate_test_telemetry()
    
    try:
        print(f"\n📤 Sending POST request to: {INGEST_ENDPOINT}")
        print(f"📦 Payload: {json.dumps(test_data, indent=2)}")
        
        response = requests.post(
            INGEST_ENDPOINT,
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"\n📥 Response Status: {response.status_code}")
        print(f"📥 Response Body: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get("status") == "success":
                print("✅ STEP 1 PASSED: Telemetry ingested successfully")
                print(f"   Event ID: {result.get('event_id')}")
                return True, result.get("event_id")
            else:
                print(f"❌ STEP 1 FAILED: {result.get('error', 'Unknown error')}")
                return False, None
        else:
            print(f"❌ STEP 1 FAILED: HTTP {response.status_code}")
            print(f"   Error: {response.text}")
            return False, None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ STEP 1 FAILED: Request exception - {str(e)}")
        return False, None
    except Exception as e:
        print(f"❌ STEP 1 FAILED: Unexpected error - {str(e)}")
        return False, None

def check_firestore_trigger(event_id: str):
    """Check if STEP 2 (Firestore Trigger) was triggered"""
    print("\n" + "="*60)
    print("STEP 2: Checking Firestore Trigger (Automatic)")
    print("="*60)
    
    print("\n⏳ Waiting 5 seconds for Firestore trigger to execute...")
    time.sleep(5)
    
    # Note: We can't directly test the trigger, but we can check if:
    # 1. The document exists in Firestore (would need Firestore SDK)
    # 2. A Pub/Sub message was published (would need Pub/Sub SDK)
    
    print("ℹ️  STEP 2 is automatic and cannot be directly tested from here.")
    print("   To verify:")
    print("   1. Check Firestore console: telemetry_events collection")
    print("   2. Check Pub/Sub console: navigo-telemetry topic")
    print("   3. Check Cloud Functions logs: telemetry_firestore_trigger")
    
    return True

def check_anomaly_detection(vehicle_id: str):
    """Check if STEP 3 (Anomaly Detection) was triggered"""
    print("\n" + "="*60)
    print("STEP 3: Checking Anomaly Detection (Pub/Sub Trigger)")
    print("="*60)
    
    print("\n⏳ Waiting 10 seconds for anomaly detection to process...")
    time.sleep(10)
    
    print("ℹ️  STEP 3 is automatic and cannot be directly tested from here.")
    print("   To verify:")
    print("   1. Check Firestore console: anomaly_cases collection")
    print("   2. Check Pub/Sub console: navigo-anomaly-detected topic")
    print("   3. Check Cloud Functions logs: data_analysis_agent")
    
    return True

def test_with_anomaly_data():
    """Test with data that should trigger an anomaly"""
    print("\n" + "="*60)
    print("Testing with Anomaly-Triggering Data")
    print("="*60)
    
    # Create telemetry with high engine temperature (should trigger anomaly)
    anomaly_data = generate_test_telemetry()
    anomaly_data["engine_coolant_temp_c"] = 115.0  # Above 110°C threshold
    anomaly_data["dtc_codes"] = ["P0301"]  # DTC code present
    
    try:
        print(f"\n📤 Sending anomaly-triggering data...")
        response = requests.post(
            INGEST_ENDPOINT,
            json=anomaly_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("status") == "success":
                print("✅ Anomaly-triggering data ingested successfully")
                print("⏳ Waiting 15 seconds for anomaly detection...")
                time.sleep(15)
                print("✅ Check Firestore anomaly_cases collection for results")
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
    """Run all tests"""
    print("\n" + "="*60)
    print("DATA FLOW ENDPOINT TESTING")
    print("="*60)
    print("\nThis script tests the three-step data flow:")
    print("1. STEP 1: Telemetry Ingestion (HTTP POST)")
    print("2. STEP 2: Firestore Trigger (Automatic)")
    print("3. STEP 3: Anomaly Detection (Pub/Sub Trigger)")
    
    # Test Step 1
    success, event_id = test_step1_ingest_telemetry()
    
    if success and event_id:
        # Check Step 2 (informational)
        check_firestore_trigger(event_id)
        
        # Check Step 3 (informational)
        check_anomaly_detection("MH-07-AB-1234")
        
        # Test with anomaly data
        test_with_anomaly_data()
    
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print("\n✅ STEP 1 (Ingest): Tested via HTTP endpoint")
    print("ℹ️  STEP 2 (Trigger): Automatic - check Cloud Functions logs")
    print("ℹ️  STEP 3 (Anomaly): Automatic - check Firestore anomaly_cases")
    print("\n📋 Next Steps:")
    print("   1. Check Cloud Functions logs in GCP Console")
    print("   2. Check Firestore collections: telemetry_events, anomaly_cases")
    print("   3. Check Pub/Sub topics: navigo-telemetry, navigo-anomaly-detected")
    print("\n")

if __name__ == "__main__":
    main()

