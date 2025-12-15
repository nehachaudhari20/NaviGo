from typing import List, Dict
from schemas import VehicleDefect, VehicleStatus, AgentMessage

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
