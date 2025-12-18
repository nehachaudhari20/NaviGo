#!/usr/bin/env python3
"""
Test script to verify STEP 10, 11 & 12: Feedback Submission, Feedback Agent, and Manufacturing Agent
Tests service completion feedback and manufacturing feedback loop
"""

import json
import requests
import time
from datetime import datetime
from typing import Dict, Any

# Configuration
API_BASE_URL = "https://us-central1-navigo-27206.cloudfunctions.net"
SUBMIT_FEEDBACK_ENDPOINT = f"{API_BASE_URL}/submit_feedback"
TRIGGER_AGENT_ENDPOINT = f"{API_BASE_URL}/trigger_agent"

def test_step10_submit_feedback():
    """Test STEP 10: Service Completion & Feedback Submission"""
    print("\n" + "="*60)
    print("STEP 10: Testing Feedback Submission")
    print("="*60)
    print("\nNote: This requires an existing booking")
    print("Run complete flow test first to create booking")
    
    # Mock booking ID for testing
    test_booking_id = f"booking_test_{int(time.time())}"
    test_vehicle_id = "MH-07-AB-1234"
    
    try:
        print(f"\n📤 Submitting feedback...")
        print(f"   Booking ID: {test_booking_id}")
        print(f"   Vehicle ID: {test_vehicle_id}")
        
        feedback_data = {
            "booking_id": test_booking_id,
            "vehicle_id": test_vehicle_id,
            "technician_notes": "Replaced coolant pump. System tested and working normally.",
            "customer_rating": 5,
            "prediction_accurate": True,
            "accuracy_score": 95,
            "actual_issue": "Coolant pump failure",
            "parts_used": ["coolant_pump", "coolant_fluid"]
        }
        
        response = requests.post(
            SUBMIT_FEEDBACK_ENDPOINT,
            json=feedback_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("status") == "success":
                print(f"✅ Feedback submitted: {result.get('message_id')}")
                print("\n⏳ Waiting 20 seconds for feedback agent to process...")
                time.sleep(20)
                print("\n📋 Check Firestore 'feedback_cases' collection for results")
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

def test_step11_12_complete_flow():
    """Test complete flow: Feedback Submission → Feedback Agent → Manufacturing Agent"""
    print("\n" + "="*60)
    print("STEP 11 & 12: Testing Complete Feedback and Manufacturing Flow")
    print("="*60)
    print("\nFlow: Feedback Submission → Feedback Agent → Manufacturing Agent")
    
    # This would require an existing booking
    print("\n📋 Manual Test Steps:")
    print("   1. Find a booking_id from Firestore 'bookings' collection")
    print("   2. Submit feedback using submit_feedback endpoint:")
    print(f"      POST {SUBMIT_FEEDBACK_ENDPOINT}")
    print("      Body: {")
    print('        "booking_id": "<booking_id>",')
    print('        "vehicle_id": "<vehicle_id>",')
    print('        "technician_notes": "Replaced component. System tested.",')
    print('        "customer_rating": 5')
    print("      }")
    print("   3. Wait 20 seconds for feedback agent to process")
    print("   4. Check Firestore 'feedback_cases' collection")
    print("      - Should have feedback with cei_score, validation_label")
    print("   5. Wait 20 seconds for manufacturing agent to process")
    print("   6. Check Firestore 'manufacturing_cases' collection")
    print("      - Should have manufacturing case with capa_recommendation, severity")
    print("   7. Check Cloud Functions logs:")
    print("      - feedback-agent (should show Gemini LLM calls)")
    print("      - manufacturing-agent (should show Gemini LLM calls)")
    print("   8. Check Pub/Sub topics:")
    print("      - navigo-feedback-complete (should have message)")
    print("      - navigo-manufacturing-complete (should have message)")
    print("   9. Check Frontend:")
    print("      - Service Center: Feedback validation should show results")
    print("      - Manufacturer Dashboard: Should show CAPA recommendations")
    
    return True

def test_step11_feedback_agent_only():
    """Test Feedback agent only (requires existing feedback submission)"""
    print("\n" + "="*60)
    print("STEP 11: Testing Feedback Agent Only")
    print("="*60)
    print("\nNote: This requires an existing feedback submission")
    
    print("\n📋 Manual Test Steps:")
    print("   1. Submit feedback using submit_feedback endpoint")
    print("   2. Check Firestore 'feedback_cases' collection")
    print("   3. Verify CEI score, validation_label, recommended_retrain")
    
    return True

def test_step12_manufacturing_agent_only():
    """Test Manufacturing agent only (requires existing feedback case)"""
    print("\n" + "="*60)
    print("STEP 12: Testing Manufacturing Agent Only")
    print("="*60)
    print("\nNote: This requires an existing feedback case")
    
    print("\n📋 Manual Test Steps:")
    print("   1. Find a feedback_id from Firestore 'feedback_cases' collection")
    print("   2. Use trigger_agent endpoint to trigger Manufacturing:")
    print(f"      POST {TRIGGER_AGENT_ENDPOINT}")
    print("      Body: {")
    print('        "agent_name": "manufacturing",')
    print('        "case_id": "<case_id>",')
    print('        "vehicle_id": "<vehicle_id>",')
    print('        "data": {')
    print('          "feedback_id": "<feedback_id>"')
    print("        }")
    print("      }")
    print("   3. Check Firestore 'manufacturing_cases' collection")
    print("   4. Verify CAPA recommendation, severity, recurrence_cluster_size")
    
    return True

def main():
    """Run STEP 10, 11 & 12 tests"""
    print("\n" + "="*60)
    print("STEP 10, 11 & 12: FEEDBACK & MANUFACTURING TESTING")
    print("="*60)
    print("\nThis script tests:")
    print("1. STEP 10: Service Completion & Feedback Submission")
    print("2. STEP 11: Feedback Processing (Feedback Agent)")
    print("3. STEP 12: Manufacturing Feedback Loop (Manufacturing Agent)")
    
    # Test feedback submission
    test_step10_submit_feedback()
    
    # Provide instructions for complete flow
    test_step11_12_complete_flow()
    
    # Provide instructions for individual agent tests
    test_step11_feedback_agent_only()
    test_step12_manufacturing_agent_only()
    
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print("\n✅ STEP 10, 11 & 12 (Feedback & Manufacturing): Tests initiated")
    print("\n📋 Manual Verification Required:")
    print("   1. Check Firestore collections:")
    print("      - feedback_cases (should have entries with cei_score, validation_label)")
    print("      - manufacturing_cases (should have entries with capa_recommendation, severity)")
    print("\n   2. Check Cloud Functions logs:")
    print("      - feedback-agent (should show Gemini LLM calls)")
    print("      - manufacturing-agent (should show Gemini LLM calls)")
    print("\n   3. Check Frontend:")
    print("      - Service Center: Feedback validation should show results")
    print("      - Manufacturer Dashboard: Should show CAPA recommendations")
    print("\n   4. Verify Feedback Data Structure:")
    print("      - cei_score: Should be 1.0-5.0")
    print("      - validation_label: Should be 'Correct', 'Recurring', or 'Incorrect'")
    print("      - recommended_retrain: Should be boolean")
    print("\n   5. Verify Manufacturing Data Structure:")
    print("      - issue: Should be concise summary")
    print("      - capa_recommendation: Should be specific and actionable")
    print("      - severity: Should be 'Low', 'Medium', or 'High'")
    print("      - recurrence_cluster_size: Should be positive integer")
    print("\n")

if __name__ == "__main__":
    main()


