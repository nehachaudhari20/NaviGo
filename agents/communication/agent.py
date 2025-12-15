from typing import List, Dict, Optional
from datetime import datetime
import re
from schemas import (
    VehicleDefect, VehicleStatus, ConversationContext, 
    UserResponse, AgentMessage, CommunicationOutput
)

# LLM Service for advanced analysis and response generation
try:
    from llm_service import LLMService, LLMConfig
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False
    print("LLM service not available - using rule-based responses")

class VoiceCommunicationAgent:
    """
    AI Agent for natural language communication about vehicle defects
    Adapts to user's speaking style and provides dynamic responses
    """
    
    def __init__(self):
        self.session_id = None
        self.context: Optional[ConversationContext] = None
        
        # Initialize LLM service (falls back to rule-based if not configured)
        self.llm_service = LLMService() if LLM_AVAILABLE else None
        self.use_llm = self.llm_service and self.llm_service.config.is_configured()
        
        if self.use_llm:
            print(f"✓ LLM enabled ({self.llm_service.config.provider})")
        else:
            print("Using rule-based responses (LLM not configured)")
        
        # Severity-based response templates (used as fallback)
        self.severity_intros = {
            "Critical": {
                "urgent": "I need to inform you about a critical issue that requires immediate attention.",
                "empathetic": "I understand this might be concerning, but we've detected a critical issue that needs urgent care.",
                "direct": "Your vehicle has a critical problem that needs to be fixed right away."
            },
            "High": {
                "urgent": "There's an important issue with your vehicle that should be addressed soon.",
                "empathetic": "I wanted to let you know about a significant issue we've found in your vehicle.",
                "direct": "Your vehicle has a high-priority problem that needs service soon."
            },
            "Medium": {
                "informative": "We've noticed a moderate issue with your vehicle that should be checked.",
                "casual": "Just wanted to give you a heads up about something we found in your vehicle.",
                "direct": "Your vehicle has a medium-level issue that needs attention."
            },
            "Low": {
                "informative": "During our monitoring, we detected a minor issue worth mentioning.",
                "casual": "There's a small thing we noticed that you should be aware of.",
                "reassuring": "Nothing to worry about, but we found a minor issue that can be addressed during your next service."
            }
        }
        
        # Component name mapping (technical to simple)
        self.component_translations = {
            "brake_pad": {"simple": "brake pads", "description": "the parts that help your car stop"},
            "engine_coolant": {"simple": "engine cooling system", "description": "what keeps your engine from overheating"},
            "transmission": {"simple": "gear system", "description": "the system that changes gears"},
            "battery": {"simple": "car battery", "description": "what powers your car's electrical systems"},
            "suspension": {"simple": "shock absorbers", "description": "what makes your ride smooth"},
            "engine_oil": {"simple": "engine oil", "description": "the lubricant for your engine"},
            "brake_fluid": {"simple": "brake fluid", "description": "the liquid that helps your brakes work"},
            "ac_compressor": {"simple": "AC cooling unit", "description": "what makes your AC blow cold air"},
        }
        
    def initialize_conversation(self, vehicle_status: VehicleStatus, customer_name: str, 
                                preferred_language: str = "en") -> ConversationContext:
        """Initialize a new conversation session"""
        import uuid
        self.session_id = str(uuid.uuid4())
        
        self.context = ConversationContext(
            session_id=self.session_id,
            vehicle_status=vehicle_status,
            conversation_history=[],
            current_topic="greeting",
            user_tone="neutral",
            user_language_preference="simple"
        )
        
        return self.context
    
    def generate_greeting(self, customer_name: str, time_of_day: str = "day") -> AgentMessage:
        """Generate personalized greeting"""
        greetings = {
            "morning": f"Good morning {customer_name}!",
            "afternoon": f"Good afternoon {customer_name}!",
            "evening": f"Good evening {customer_name}!",
            "day": f"Hello {customer_name}!"
        }
        
        greeting = greetings.get(time_of_day, greetings["day"])
        message = f"{greeting} This is your NaviGo vehicle care assistant calling about your {self.context.vehicle_status.registration_number}. Do you have a couple of minutes to discuss some important information about your vehicle?"
        
        return AgentMessage(
            message=message,
            tone="friendly",
            contains_technical_terms=False,
            simplified_version=message
        )
    
    def analyze_user_tone(self, user_message: str) -> Dict[str, str]:
        """Analyze user's speaking style and preferences using LLM or rule-based logic"""
        
        # Use LLM for advanced analysis if available
        if self.use_llm:
            try:
                vehicle_context = {
                    'registration_number': self.context.vehicle_status.registration_number,
                    'health_score': self.context.vehicle_status.health_score,
                    'defect_count': len(self.context.vehicle_status.defects),
                    'owner_name': getattr(self.context.vehicle_status, 'owner_name', 'Customer')
                }
                
                analysis = self.llm_service.analyze_user_input(
                    user_message=user_message,
                    conversation_history=[
                        {'role': msg.get('role', 'unknown'), 'message': msg.get('message', '')}
                        for msg in self.context.conversation_history
                    ],
                    vehicle_context=vehicle_context
                )
                
                # Update context with LLM analysis
                if analysis.get('tone'):
                    self.context.user_tone = analysis['tone']
                if analysis.get('language_preference'):
                    self.context.user_language_preference = analysis['language_preference']
                
                return {
                    'tone': analysis.get('tone', 'neutral'),
                    'language_preference': analysis.get('language_preference', 'simple'),
                    'sentiment': analysis.get('sentiment', 'neutral'),
                    'intent': analysis.get('intent', 'ask_question'),
                    'key_concerns': analysis.get('key_concerns', []),
                    'confidence': analysis.get('confidence', 0.9),
                    'method': 'llm'
                }
            except Exception as e:
                print(f"LLM analysis failed, falling back to rules: {e}")
        
        # Fallback to rule-based analysis
        message_lower = user_message.lower()
        
        # Detect formality
        formal_indicators = ["sir", "madam", "please", "kindly", "thank you", "appreciate"]
        casual_indicators = ["yeah", "yep", "ok", "sure", "cool", "got it", "alright"]
        
        is_formal = any(word in message_lower for word in formal_indicators)
        is_casual = any(word in message_lower for word in casual_indicators)
        
        # Detect technical vs simple preference
        technical_words = ["diagnostic", "sensor", "dtc", "fault code", "system", "mechanism"]
        has_technical = any(word in message_lower for word in technical_words)
        
        # Detect urgency/concern
        urgent_words = ["urgent", "emergency", "immediate", "asap", "quickly", "right now"]
        concerned_words = ["worried", "concerned", "afraid", "serious", "dangerous", "safe"]
        
        is_urgent = any(word in message_lower for word in urgent_words)
        is_concerned = any(word in message_lower for word in concerned_words)
        
        # Determine tone
        if is_formal and not is_casual:
            tone = "formal"
        elif is_casual and not is_formal:
            tone = "casual"
        else:
            tone = "neutral"
        
        # Determine language preference
        language_pref = "technical" if has_technical else "simple"
        
        # Determine sentiment
        if is_urgent or is_concerned:
            sentiment = "concerned"
        elif any(word in message_lower for word in ["great", "good", "thanks", "appreciate"]):
            sentiment = "positive"
        elif any(word in message_lower for word in ["no", "not interested", "busy", "later"]):
            sentiment = "negative"
        else:
            sentiment = "neutral"
        
        return {
            "tone": tone,
            "language_preference": language_pref,
            "sentiment": sentiment,
            "is_urgent": is_urgent,
            "is_concerned": is_concerned
        }
    
    def explain_defect(self, defect: VehicleDefect, user_preference: str = "simple", 
                       tone: str = "empathetic") -> AgentMessage:
        """Generate natural language explanation of a defect using LLM or templates"""
        
        # Use LLM for contextual explanation if available
        if self.use_llm:
            try:
                vehicle_context = {
                    'registration_number': self.context.vehicle_status.registration_number,
                    'health_score': self.context.vehicle_status.health_score,
                    'defect_count': len(self.context.vehicle_status.defects),
                    'owner_name': getattr(self.context.vehicle_status, 'owner_name', 'Customer'),
                    'odometer_km': getattr(self.context.vehicle_status, 'odometer_km', 0)
                }
                
                defect_info = {
                    'component': defect.component,
                    'severity': defect.severity,
                    'description': defect.description,
                    'confidence': defect.confidence,
                    'estimated_time_to_failure': defect.estimated_time_to_failure,
                    'recommended_action': defect.recommended_action,
                    'fault_codes': defect.fault_codes
                }
                
                response_type = 'urgent' if defect.severity == 'Critical' else 'informative'
                
                explanation = self.llm_service.generate_response(
                    user_message=f"Explain the {defect.component} issue in {user_preference} terms with {tone} tone",
                    conversation_history=[
                        {'role': msg.get('role', 'unknown'), 'message': msg.get('message', '')}
                        for msg in self.context.conversation_history
                    ],
                    vehicle_context=vehicle_context,
                    defect_info=defect_info,
                    response_type=response_type
                )
                
                simplified = self.llm_service.translate_technical_to_simple(
                    explanation,
                    context={'component': defect.component, 'severity': defect.severity}
                )
                
                return AgentMessage(
                    message=explanation,
                    tone=tone,
                    contains_technical_terms=(user_preference == "technical"),
                    simplified_version=simplified
                )
            except Exception as e:
                print(f"LLM explanation failed, falling back to templates: {e}")
        
        # Fallback to template-based explanation
        severity_intros = self.severity_intros.get(defect.severity, {})
        intro = severity_intros.get(tone, severity_intros.get("informative", ""))
        
        component_name = self.translate_component_name(defect.component, user_preference)
        
        if user_preference == "simple":
            explanation = f"{intro} It's about your {component_name}. "
            
            if defect.severity == "Critical":
                explanation += f"This is very serious and could be dangerous if not fixed immediately. "
            elif defect.severity == "High":
                explanation += f"This needs attention soon to avoid bigger problems. "
            elif defect.severity == "Medium":
                explanation += f"This should be checked to keep your vehicle running smoothly. "
            else:
                explanation += f"This is a minor issue that can be addressed during regular maintenance. "
                
            if defect.estimated_time_to_failure:
                explanation += f"Based on our analysis, this should be fixed within {defect.estimated_time_to_failure}. "
        else:
            explanation = f"{intro} We've detected an issue with the {defect.component}. "
            explanation += f"Severity level: {defect.severity}. Confidence: {int(defect.confidence * 100)}%. "
            
            if defect.fault_codes:
                explanation += f"Diagnostic codes: {', '.join(defect.fault_codes)}. "
            
            if defect.estimated_time_to_failure:
                explanation += f"Estimated time to potential failure: {defect.estimated_time_to_failure}. "
        
        explanation += f"{defect.recommended_action}"
        
        simplified = f"Your {self.component_translations.get(defect.component.lower().replace(' ', '_'), {}).get('simple', defect.component)} needs attention. "
        if defect.severity in ["Critical", "High"]:
            simplified += "It's important to get this checked soon."
        else:
            simplified += "You should get this checked when convenient."
        
        return AgentMessage(
            message=explanation,
            tone=tone,
            contains_technical_terms=(user_preference == "technical"),
            simplified_version=simplified
        )
    
    def translate_component_name(self, component: str, preference: str = "simple") -> str:
        """Translate technical component names to user-friendly language"""
        component_key = component.lower().replace(" ", "_")
        
        if component_key in self.component_translations:
            translation = self.component_translations[component_key]
            if preference == "simple":
                return f"{translation['simple']} ({translation['description']})"
            elif preference == "technical":
                return component
            else:
                return f"{component} or what we call {translation['simple']}"
        
        return component
    
    def handle_user_question(self, question: str, defect: VehicleDefect) -> AgentMessage:
        """Answer user questions about defects dynamically using LLM or rule-based logic"""
        
        # Use LLM for natural response generation if available
        if self.use_llm:
            try:
                vehicle_context = {
                    'registration_number': self.context.vehicle_status.registration_number,
                    'health_score': self.context.vehicle_status.health_score,
                    'defect_count': len(self.context.vehicle_status.defects),
                    'owner_name': getattr(self.context.vehicle_status, 'owner_name', 'Customer'),
                    'odometer_km': getattr(self.context.vehicle_status, 'odometer_km', 0)
                }
                
                defect_info = {
                    'component': defect.component,
                    'severity': defect.severity,
                    'description': defect.description,
                    'confidence': defect.confidence,
                    'estimated_time_to_failure': defect.estimated_time_to_failure,
                    'recommended_action': defect.recommended_action
                }
                
                response = self.llm_service.generate_response(
                    user_message=question,
                    conversation_history=[
                        {'role': msg.get('role', 'unknown'), 'message': msg.get('message', '')}
                        for msg in self.context.conversation_history
                    ],
                    vehicle_context=vehicle_context,
                    defect_info=defect_info,
                    response_type='conversational'
                )
                
                simplified = response
                if self.context.user_language_preference == 'simple':
                    simplified = self.llm_service.translate_technical_to_simple(
                        response,
                        context={'component': defect.component}
                    )
                
                return AgentMessage(
                    message=response,
                    tone=self.context.user_tone,
                    contains_technical_terms=self.context.user_language_preference == 'technical',
                    simplified_version=simplified
                )
            except Exception as e:
                print(f"LLM response generation failed, falling back to rules: {e}")
        
        # Fallback to rule-based responses
        question_lower = question.lower()
        
        if any(word in question_lower for word in ["how serious", "how bad", "dangerous", "safe"]):
            if defect.severity == "Critical":
                response = f"This is very serious. The {defect.component} issue could lead to unsafe driving conditions or vehicle breakdown. I strongly recommend getting this checked today."
            elif defect.severity == "High":
                response = f"It's quite serious. While you can still drive, the {defect.component} problem should be addressed within the next few days to prevent further damage."
            elif defect.severity == "Medium":
                response = f"It's moderate - not an emergency, but shouldn't be ignored. The {defect.component} should be checked within a week or two."
            else:
                response = f"It's a minor issue with the {defect.component}. Your vehicle is safe to drive, but it's good to address this during your next scheduled service."
        
        elif any(word in question_lower for word in ["cost", "price", "expensive", "how much"]):
            response = f"The cost will depend on the exact repair needed for the {defect.component}. Our service center can provide a detailed estimate. Typically, addressing this early can save money compared to waiting for more damage."
        
        elif any(word in question_lower for word in ["wait", "can i drive", "how long"]):
            if defect.estimated_time_to_failure:
                response = f"Based on our data, you should address this within {defect.estimated_time_to_failure}. "
                if defect.severity in ["Critical", "High"]:
                    response += "I wouldn't recommend waiting longer than that."
                else:
                    response += "You have some time, but it's best not to delay too much."
            else:
                if defect.severity == "Critical":
                    response = "I wouldn't recommend driving much longer. This should be checked as soon as possible, ideally today."
                elif defect.severity == "High":
                    response = "You can drive for a few days, but please schedule service soon."
                else:
                    response = "You can continue driving, but get this checked within the next couple of weeks."
        
        else:
            response = f"That's a good question about the {defect.component}. Let me connect you with our service team who can provide more specific details. Would you like to schedule a service appointment?"
        
        return AgentMessage(
            message=response,
            tone="informative",
            contains_technical_terms=False,
            simplified_version=response
        )
