"""
Test LLM Integration with Communication Agents
"""

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from agent import VoiceCommunicationAgent
from sms_agent import SMSAgent
from schemas import VehicleDefect, VehicleStatus
from datetime import datetime

print("=" * 70)
print("🧪 TESTING LLM INTEGRATION")
print("=" * 70)

voice_agent = VoiceCommunicationAgent()
sms_agent = SMSAgent()

print(f"\n✅ Voice Agent - LLM Enabled: {voice_agent.use_llm}")
print(f"✅ SMS Agent - LLM Enabled: {sms_agent.use_llm}")

if voice_agent.use_llm:
    print(f"✅ Provider: {voice_agent.llm_service.config.provider}")
    print(f"✅ Model: {voice_agent.llm_service.config.gemini_model}")

test_defect = VehicleDefect(
    defect_id="DEFECT_TEST_001",
    component="brake_pad",
    description="Brake pad wear detected",
    severity="High",
    confidence=0.92,
    fault_codes=["C1201"],
    detected_at=datetime.now(),
    estimated_time_to_failure="1-2 weeks",
    recommended_action="Schedule service within 7 days"
)

test_vehicle = VehicleStatus(
    vehicle_id="VH-001",
    registration_number="MH-12-AB-1234",
    owner_name="Rajesh Kumar",
    health_score=65,
    defects=[test_defect],
    last_service_date="2024-11-01",
    odometer_km=45230.0
)

print("\n" + "=" * 70)
print("📞 TEST: GREETING")
print("=" * 70)

context = voice_agent.initialize_conversation(test_vehicle, "Rajesh")
greeting = voice_agent.generate_greeting("Rajesh", "afternoon")
print(f"\n🤖 Agent: {greeting.message}")

print("\n" + "=" * 70)
print("✅ TESTING COMPLETE!")
print("=" * 70)
