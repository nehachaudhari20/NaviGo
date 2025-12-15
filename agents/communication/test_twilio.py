"""
Test script for Twilio SMS and Voice Call functionality
"""
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from agent import VoiceCommunicationAgent
from sms_agent import SMSAgent
from schemas import VehicleDefect, VehicleStatus

def test_sms():
    """Test SMS functionality"""
    print("\n" + "="*60)
    print("TESTING SMS FUNCTIONALITY")
    print("="*60)
    
    # Create test defect
    defect = VehicleDefect(
        defect_id="DEF001",
        component="brake_pad",
        description="Brake pad friction material degradation detected",
        severity="High",
        confidence=0.92,
        fault_codes=["C1234"],
        detected_at=datetime.now(),
        estimated_time_to_failure="7-10 days",
        recommended_action="Replace brake pads immediately"
    )
    
    # Create test vehicle
    vehicle = VehicleStatus(
        vehicle_id="VEH001",
        registration_number="MH-12-AB-1234",
        owner_name="Rajesh Kumar",
        health_score=65,
        defects=[defect],
        odometer_km=45000
    )
    
    # Initialize SMS agent
    sms_agent = SMSAgent()
    
    # Generate SMS message
    print("\n1. Generating SMS Alert...")
    message = sms_agent.generate_summary_sms(vehicle, use_icons=True)
    print(f"\n{message}")
    print(f"\nMessage length: {len(message)} characters")
    
    # Test actual SMS sending (requires valid phone number)
    test_phone = os.getenv('TEST_PHONE_NUMBER')  # Set in .env for actual testing
    
    if test_phone and sms_agent.twilio_client:
        print(f"\n2. Sending SMS to {test_phone}...")
        result = sms_agent.send_defect_alert(
            to_phone_number=test_phone,
            vehicle_status=vehicle,
            include_details=True
        )
        print(f"Status: {result['status']}")
        print(f"Message: {result['message']}")
        if result['message_sid']:
            print(f"Message SID: {result['message_sid']}")
    else:
        print("\n⚠ Skipping actual SMS send (set TEST_PHONE_NUMBER in .env)")
    
    print("\n✅ SMS TEST COMPLETE!\n")

def test_voice():
    """Test Voice Call functionality"""
    print("\n" + "="*60)
    print("TESTING VOICE CALL FUNCTIONALITY")
    print("="*60)
    
    # Create test defect
    defect = VehicleDefect(
        defect_id="DEF001",
        component="brake_pad",
        description="Brake pad friction material degradation detected",
        severity="High",
        confidence=0.92,
        fault_codes=["C1234"],
        detected_at=datetime.now(),
        estimated_time_to_failure="7-10 days",
        recommended_action="Replace brake pads immediately"
    )
    
    # Create test vehicle
    vehicle = VehicleStatus(
        vehicle_id="VEH001",
        registration_number="MH-12-AB-1234",
        owner_name="Rajesh Kumar",
        health_score=65,
        defects=[defect],
        odometer_km=45000
    )
    
    # Initialize voice agent
    voice_agent = VoiceCommunicationAgent()
    voice_agent.initialize_conversation(vehicle, "Rajesh Kumar")
    
    # Generate TwiML greeting
    print("\n1. Generating TwiML Greeting...")
    twiml = voice_agent.generate_twiml_greeting(
        customer_name="Rajesh Kumar",
        gather_url="https://your-server.com/gather"
    )
    print(f"\n{twiml}\n")
    
    # Generate TwiML defect explanation
    print("\n2. Generating TwiML Defect Explanation...")
    twiml = voice_agent.generate_twiml_defect_explanation(
        defect=defect,
        gather_url="https://your-server.com/gather",
        user_tone="concerned"
    )
    print(f"\n{twiml}\n")
    
    # Test actual call (requires valid phone number and callback URL)
    test_phone = os.getenv('TEST_PHONE_NUMBER')
    callback_url = os.getenv('TWILIO_CALLBACK_URL')  # Your server URL
    
    if test_phone and callback_url and voice_agent.twilio_client:
        print(f"\n3. Initiating call to {test_phone}...")
        result = voice_agent.make_voice_call(
            to_phone_number=test_phone,
            customer_name="Rajesh Kumar",
            callback_url=callback_url
        )
        print(f"Status: {result['status']}")
        print(f"Message: {result['message']}")
        if result['call_sid']:
            print(f"Call SID: {result['call_sid']}")
    else:
        print("\n⚠ Skipping actual call (set TEST_PHONE_NUMBER and TWILIO_CALLBACK_URL in .env)")
    
    print("\n✅ VOICE CALL TEST COMPLETE!\n")

if __name__ == "__main__":
    print("\n🚀 NaviGo Communication Agents - Twilio Test Suite")
    
    try:
        test_sms()
        test_voice()
        
        print("\n" + "="*60)
        print("ALL TESTS COMPLETE!")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
