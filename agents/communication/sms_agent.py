from typing import List, Dict, Optional
import os
from schemas import VehicleDefect, VehicleStatus, AgentMessage

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv not installed, assume env vars are set

# Twilio for SMS
try:
    from twilio.rest import Client
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False
    print("Twilio not available - SMS disabled")

# LLM Service for intelligent message generation
try:
    from llm_service import LLMService, LLMConfig
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False

class SMSAgent:
    """
    Generates concise SMS messages about vehicle defects
    Adapts message style based on severity and user preferences
    Uses LLM for natural language generation when available
    """
    
    def __init__(self):
        # SMS character limits
        self.MAX_SMS_LENGTH = 160
        self.MAX_LONG_SMS_LENGTH = 1000
        
        # Initialize Twilio client
        self.twilio_client = None
        self.twilio_phone_number = None
        if TWILIO_AVAILABLE:
            account_sid = os.getenv('TWILIO_ACCOUNT_SID')
            auth_token = os.getenv('TWILIO_AUTH_TOKEN')
            self.twilio_phone_number = os.getenv('TWILIO_PHONE_NUMBER')
            
            if account_sid and auth_token:
                self.twilio_client = Client(account_sid, auth_token)
                print(f"✓ Twilio SMS initialized ({self.twilio_phone_number})")
            else:
                print("⚠ Twilio credentials not configured")
        
        # Initialize LLM service
        self.llm_service = LLMService() if LLM_AVAILABLE else None
        self.use_llm = self.llm_service and self.llm_service.config.is_configured()
        
        # Emoji/icons for severity (optional, can be toggled)
        self.severity_icons = {
            "Critical": "🚨",
            "High": "⚠️",
            "Medium": "ℹ️",
            "Low": "💡"
        }
    
    def generate_summary_sms(self, vehicle_status: VehicleStatus, 
                            use_icons: bool = True,
                            language: str = "en") -> str:
        """Generate a summary SMS of all defects"""
        
        sorted_defects = sorted(
            vehicle_status.defects,
            key=lambda d: {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}.get(d.severity, 4)
        )
        
        if not sorted_defects:
            return f"NaviGo: Your {vehicle_status.registration_number} is in good health! Health score: {vehicle_status.health_score}/100"
        
        icon = self.severity_icons.get(sorted_defects[0].severity, "") if use_icons else ""
        
        message = f"NaviGo Alert {icon}\n"
        message += f"Vehicle: {vehicle_status.registration_number}\n"
        message += f"Health: {vehicle_status.health_score}/100\n\n"
        
        critical_count = len([d for d in sorted_defects if d.severity in ["Critical", "High"]])
        
        if critical_count > 0:
            message += f"⚠️ {critical_count} Urgent Issue{'s' if critical_count > 1 else ''}:\n"
            
            for defect in sorted_defects[:3]:
                severity_marker = "!" if defect.severity == "Critical" else "•"
                component = defect.component.replace("_", " ").title()
                message += f"{severity_marker} {component}\n"
            
            if len(sorted_defects) > 3:
                message += f"... and {len(sorted_defects) - 3} more\n"
        
        message += "\n"
        
        most_severe = sorted_defects[0]
        if most_severe.severity == "Critical":
            message += "⚠️ Immediate action needed!\n"
        elif most_severe.severity == "High":
            message += "Service recommended soon.\n"
        else:
            message += "Schedule service at convenience.\n"
        
        message += "Call: 1800-NAVIGO\n"
        message += "Reply 'DETAILS' for full report"
        
        return message
    
    def send_sms(self, to_phone_number: str, message: str,
                 media_urls: Optional[List[str]] = None) -> Dict[str, str]:
        """
        Send SMS message using Twilio
        
        Args:
            to_phone_number: Recipient's phone number (E.164 format: +919876543210)
            message: SMS message content
            media_urls: Optional list of media URLs for MMS
            
        Returns:
            Dict with send status and message SID
        """
        if not self.twilio_client:
            return {
                'status': 'error',
                'message': 'Twilio not configured',
                'message_sid': None
            }
        
        try:
            # Truncate message if too long for single SMS
            if len(message) > self.MAX_LONG_SMS_LENGTH:
                message = message[:self.MAX_LONG_SMS_LENGTH - 3] + "..."
            
            # Send SMS
            sms_params = {
                'to': to_phone_number,
                'from_': self.twilio_phone_number,
                'body': message
            }
            
            # Add media if provided (converts to MMS)
            if media_urls:
                sms_params['media_url'] = media_urls
            
            message_obj = self.twilio_client.messages.create(**sms_params)
            
            return {
                'status': 'success',
                'message': f'SMS sent to {to_phone_number}',
                'message_sid': message_obj.sid,
                'message_status': message_obj.status,
                'segments': message_obj.num_segments
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Failed to send SMS: {str(e)}',
                'message_sid': None
            }
    
    def send_defect_alert(self, to_phone_number: str, vehicle_status: VehicleStatus,
                         include_details: bool = False) -> Dict[str, str]:
        """
        Send vehicle defect alert via SMS
        
        Args:
            to_phone_number: Customer's phone number
            vehicle_status: Vehicle status with defects
            include_details: Whether to include detailed defect information
            
        Returns:
            Dict with send status
        """
        # Generate summary message
        message = self.generate_summary_sms(vehicle_status, use_icons=True)
        
        # Add detailed information if requested
        if include_details and vehicle_status.defects:
            message += "\n\n--- DETAILS ---\n"
            for i, defect in enumerate(vehicle_status.defects[:3], 1):
                message += f"\n{i}. {defect.component.replace('_', ' ').title()}\n"
                message += f"   Severity: {defect.severity}\n"
                message += f"   Action: {defect.recommended_action}\n"
                if defect.estimated_time_to_failure:
                    message += f"   Timeline: {defect.estimated_time_to_failure}\n"
        
        # Send the SMS
        return self.send_sms(to_phone_number, message)
    
    def send_appointment_confirmation(self, to_phone_number: str,
                                     appointment_details: Dict[str, str]) -> Dict[str, str]:
        """
        Send service appointment confirmation SMS
        
        Args:
            to_phone_number: Customer's phone number
            appointment_details: Dict with service_center, date, time, address, etc.
            
        Returns:
            Dict with send status
        """
        message = "🔧 NaviGo Service Appointment Confirmed\n\n"
        message += f"📍 Center: {appointment_details.get('service_center', 'TBD')}\n"
        message += f"📅 Date: {appointment_details.get('date', 'TBD')}\n"
        message += f"⏰ Time: {appointment_details.get('time', 'TBD')}\n"
        
        if appointment_details.get('address'):
            message += f"🗺️ Address: {appointment_details['address']}\n"
        
        if appointment_details.get('contact'):
            message += f"📞 Contact: {appointment_details['contact']}\n"
        
        message += "\nPlease arrive 10 minutes early.\n"
        message += "Reply CANCEL to reschedule.\n"
        message += "\nThank you for choosing NaviGo!"
        
        return self.send_sms(to_phone_number, message)
    
    def send_reminder(self, to_phone_number: str, vehicle_reg: str,
                     reminder_type: str = "maintenance") -> Dict[str, str]:
        """
        Send maintenance or service reminder
        
        Args:
            to_phone_number: Customer's phone number
            vehicle_reg: Vehicle registration number
            reminder_type: Type of reminder (maintenance, service, followup)
            
        Returns:
            Dict with send status
        """
        if reminder_type == "maintenance":
            message = f"🔔 NaviGo Reminder\n\n"
            message += f"Your vehicle {vehicle_reg} is due for routine maintenance.\n\n"
            message += f"Schedule now to keep your vehicle in top shape!\n"
            message += f"Call: 1800-NAVIGO\n"
            message += f"Or reply SCHEDULE"
        elif reminder_type == "service":
            message = f"⚠️ NaviGo Service Reminder\n\n"
            message += f"Vehicle {vehicle_reg} has pending service items.\n\n"
            message += f"Don't delay - book your appointment today!\n"
            message += f"Call: 1800-NAVIGO"
        else:
            message = f"NaviGo Update for {vehicle_reg}\n\n"
            message += f"We're following up on your recent service inquiry.\n"
            message += f"Need help? Call 1800-NAVIGO"
        
        return self.send_sms(to_phone_number, message)
