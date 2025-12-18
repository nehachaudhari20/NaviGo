#!/usr/bin/env python3
"""
Test script to verify STEP 8 & 9: Engagement Agent and Communication Agent
Tests customer engagement script generation and voice call initiation
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

def generate_anomaly_for_engagement_communication(vehicle_id: str = "MH-07-AB-1234") -> Dict[str, Any]:
    """Generate telemetry that should trigger complete flow through Engagement and Communication"""
    return {
        "event_id": f"evt_eng_comm_{int(time.time())}",
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

def test_step8_9_complete_flow():
    """Test complete flow: Ingest → ... → Engagement → Communication"""
    print("\n" + "="*60)
    print("STEP 8 & 9: Testing Complete Engagement and Communication Flow")
    print("="*60)
    print("\nFlow: Telemetry → ... → Engagement → Communication")
    
    test_data = generate_anomaly_for_engagement_communication()
    
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
        print(f"\n⏳ Step 2: Waiting 90 seconds for complete pipeline to process...")
        print("   (Anomaly → Diagnosis → RCA → Scheduling → Engagement → Communication)")
        time.sleep(90)
        
        print("\n📋 Verification Steps:")
        print("   1. Check Firestore 'engagement_cases' collection")
        print("      - Should have engagement with transcript, customer_decision")
        print("      - Should have booking_id if customer_decision = 'confirmed'")
        print("   2. Check Firestore 'communication_cases' collection")
        print("      - Should have communication case with call_status")
        print("      - Should have call_sid if Twilio call was initiated")
        print("   3. Check Firestore 'call_contexts' collection")
        print("      - Should have call context for webhook access")
        print("   4. Check Firestore 'bookings' collection")
        print("      - Should have booking if customer confirmed")
        print("   5. Check Cloud Functions logs:")
        print("      - engagement-agent (should show Gemini LLM calls)")
        print("      - communication-agent (should show Twilio call initiation)")
        print("   6. Check Pub/Sub topics:")
        print("      - navigo-engagement-complete (should have message)")
        print("      - navigo-communication-trigger (should have message)")
        print("      - navigo-communication-complete (should have message after call)")
        print("   7. Check Twilio Dashboard:")
        print("      - Should show call attempt (if Twilio configured)")
        print("   8. Check Frontend:")
        print("      - Service Center: Customer engagement section should show scripts")
        print("      - Communication agent status should show call status")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_step8_engagement_only():
    """Test Engagement agent only (requires existing scheduling)"""
    print("\n" + "="*60)
    print("STEP 8: Testing Engagement Agent Only")
    print("="*60)
    print("\nNote: This requires an existing scheduling case")
    print("Run complete flow test first to create scheduling case")
    
    print("\n📋 Manual Test Steps:")
    print("   1. Find a scheduling_id from Firestore 'scheduling_cases' collection")
    print("   2. Use trigger_agent endpoint to trigger Engagement:")
    print(f"      POST {TRIGGER_AGENT_ENDPOINT}")
    print("      Body: {")
    print('        "agent_name": "engagement",')
    print('        "case_id": "<case_id>",')
    print('        "vehicle_id": "<vehicle_id>",')
    print('        "data": {')
    print('          "scheduling_id": "<scheduling_id>",')
    print('          "rca_id": "<rca_id>"')
    print("        }")
    print("      }")
    print("   3. Check Firestore 'engagement_cases' collection for results")
    print("   4. Verify transcript is generated and customer_decision is set")
    
    return True

def test_step9_communication_only():
    """Test Communication agent only (requires existing engagement)"""
    print("\n" + "="*60)
    print("STEP 9: Testing Communication Agent Only")
    print("="*60)
    print("\nNote: This requires an existing engagement case")
    print("Run complete flow test first to create engagement case")
    
    print("\n📋 Manual Test Steps:")
    print("   1. Find an engagement_id from Firestore 'engagement_cases' collection")
    print("   2. Use trigger_agent endpoint to trigger Communication:")
    print(f"      POST {TRIGGER_AGENT_ENDPOINT}")
    print("      Body: {")
    print('        "agent_name": "communication",')
    print('        "case_id": "<case_id>",')
    print('        "vehicle_id": "<vehicle_id>",')
    print('        "data": {')
    print('          "engagement_id": "<engagement_id>",')
    print('          "customer_phone": "+919876543210"')
    print("        }")
    print("      }")
    print("   3. Check Firestore 'communication_cases' collection")
    print("   4. Check Twilio Dashboard for call attempt")
    print("   5. Verify call_sid is stored in communication case")
    print("\n⚠️  Note: Actual call completion is handled by Twilio webhook")
    print("   Check twilio_webhook function logs for call status updates")
    
    return True

def main():
    """Run STEP 8 & 9 tests"""
    print("\n" + "="*60)
    print("STEP 8 & 9: ENGAGEMENT & COMMUNICATION AGENTS TESTING")
    print("="*60)
    print("\nThis script tests:")
    print("1. STEP 8: Customer Engagement (Script Generation)")
    print("2. STEP 9: Voice Communication (Interactive Call)")
    print("3. Complete flow: Scheduling → Engagement → Communication")
    
    # Test complete flow
    test_step8_9_complete_flow()
    
    # Provide instructions for individual agent tests
    test_step8_engagement_only()
    test_step9_communication_only()
    
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print("\n✅ STEP 8 & 9 (Engagement & Communication): Tests initiated")
    print("\n📋 Manual Verification Required:")
    print("   1. Check Firestore collections:")
    print("      - engagement_cases (should have entries with transcript, customer_decision)")
    print("      - communication_cases (should have entries with call_status, call_sid)")
    print("      - call_contexts (should have entries for webhook access)")
    print("      - bookings (should have entries if customer confirmed)")
    print("\n   2. Check Cloud Functions logs:")
    print("      - engagement-agent (should show Gemini LLM calls)")
    print("      - communication-agent (should show Twilio call initiation)")
    print("      - twilio_webhook (should show call status updates)")
    print("\n   3. Check Twilio Dashboard:")
    print("      - Should show call attempts (if Twilio configured)")
    print("      - Check call status and duration")
    print("\n   4. Check Frontend:")
    print("      - Service Center: Customer engagement section should show scripts")
    print("      - Communication agent status should show call status")
    print("\n   5. Verify Engagement Data Structure:")
    print("      - transcript: Should be in format 'AI: ...\\nCustomer: ...'")
    print("      - customer_decision: Should be 'confirmed', 'declined', or 'no_response'")
    print("      - booking_id: Should be present if customer_decision = 'confirmed'")
    print("\n   6. Verify Communication Data Structure:")
    print("      - call_status: Should be 'initiated', 'ringing', 'answered', or 'completed'")
    print("      - call_sid: Should be present if Twilio call was initiated")
    print("      - conversation_transcript: Should be updated during call")
    print("\n⚠️  Important Notes:")
    print("   - Voice calls require Twilio configuration (TWILIO_ACCOUNT_SID, etc.)")
    print("   - Call completion is handled by Twilio webhook")
    print("   - Webhook URL must be publicly accessible")
    print("\n")

if __name__ == "__main__":
    main()


