"""
LLM Integration for Communication Agents
Supports OpenAI, Anthropic Claude, Google Gemini, and Groq
"""

import os
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

# LLM Provider imports (graceful handling if not installed)
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False


class LLMProvider(Enum):
    """Supported LLM providers"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GEMINI = "gemini"
    GROQ = "groq"
    NONE = "none"  # Fallback to rule-based


class LLMConfig:
    """Configuration for LLM integration"""
    
    def __init__(self):
        # Provider selection (default to OpenAI if available)
        self.provider = os.getenv('LLM_PROVIDER', 'openai').lower()
        
        # API Keys
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.anthropic_api_key = os.getenv('ANTHROPIC_API_KEY')
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        self.groq_api_key = os.getenv('GROQ_API_KEY')
        
        # Model configurations
        self.openai_model = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
        self.anthropic_model = os.getenv('ANTHROPIC_MODEL', 'claude-3-haiku-20240307')
        self.gemini_model = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')
        self.groq_model = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')
        
        # Generation parameters
        self.temperature = float(os.getenv('LLM_TEMPERATURE', '0.7'))
        self.max_tokens = int(os.getenv('LLM_MAX_TOKENS', '500'))
        
        # Enable/disable LLM
        self.enabled = os.getenv('LLM_ENABLED', 'true').lower() == 'true'
    
    def is_configured(self) -> bool:
        """Check if LLM is properly configured"""
        if not self.enabled:
            return False
        
        if self.provider == 'openai' and self.openai_api_key and OPENAI_AVAILABLE:
            return True
        elif self.provider == 'anthropic' and self.anthropic_api_key and ANTHROPIC_AVAILABLE:
            return True
        elif self.provider == 'gemini' and self.gemini_api_key and GEMINI_AVAILABLE:
            return True
        elif self.provider == 'groq' and self.groq_api_key and GROQ_AVAILABLE:
            return True
        
        return False


class LLMService:
    """
    LLM service for natural language understanding and generation
    Handles multiple providers with fallback to rule-based logic
    """
    
    def __init__(self, config: Optional[LLMConfig] = None):
        self.config = config or LLMConfig()
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize the appropriate LLM client"""
        if not self.config.is_configured():
            self.client = None
            return
        
        try:
            if self.config.provider == 'openai' and OPENAI_AVAILABLE:
                self.client = openai.OpenAI(api_key=self.config.openai_api_key)
            elif self.config.provider == 'anthropic' and ANTHROPIC_AVAILABLE:
                self.client = anthropic.Anthropic(api_key=self.config.anthropic_api_key)
            elif self.config.provider == 'gemini' and GEMINI_AVAILABLE:
                genai.configure(api_key=self.config.gemini_api_key)
                self.client = genai.GenerativeModel(self.config.gemini_model)
            elif self.config.provider == 'groq' and GROQ_AVAILABLE:
                self.client = Groq(api_key=self.config.groq_api_key)
            else:
                self.client = None
        except Exception as e:
            print(f"LLM initialization error: {e}")
            self.client = None
    
    def analyze_user_input(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        vehicle_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze user input with deep understanding"""
        
        if not self.client:
            return self._fallback_analyze(user_message)
        
        try:
            system_prompt = f"""You are analyzing customer responses in a vehicle maintenance conversation.

Vehicle Context:
- Registration: {vehicle_context.get('registration_number')}
- Health Score: {vehicle_context.get('health_score')}/100
- Critical Issues: {vehicle_context.get('defect_count', 0)}

Conversation History:
{self._format_history(conversation_history)}

Analyze the user's message and return a JSON response with:
1. intent: What does the user want? (schedule_service, ask_question, decline, emergency, need_more_info)
2. tone: How are they speaking? (formal, casual, concerned, frustrated, angry, neutral)
3. sentiment: Overall emotion (positive, negative, neutral, concerned, anxious)
4. language_preference: Do they prefer technical or simple explanations?
5. key_concerns: List of what they're worried about (e.g., cost, safety, time, inconvenience)
6. questions: Specific questions they're asking
7. confidence: Your confidence in this analysis (0.0-1.0)

Be culturally aware - Indian customers may use phrases like "okay ji", "please check na", mixing Hindi-English.

User Message: "{user_message}"

Return ONLY valid JSON, no markdown formatting."""

            response = self._call_llm(system_prompt)
            result = json.loads(response)
            return result
            
        except Exception as e:
            print(f"LLM analysis error: {e}")
            return self._fallback_analyze(user_message)
    
    def generate_response(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        vehicle_context: Dict[str, Any],
        defect_info: Optional[Dict[str, Any]] = None,
        response_type: str = 'conversational'
    ) -> str:
        """Generate natural, context-aware response"""
        
        if not self.client:
            return self._fallback_response(user_message, defect_info)
        
        try:
            system_prompt = f"""You are NaviGo, an AI assistant helping customers understand vehicle issues.

CRITICAL RULES:
1. Be empathetic and helpful
2. Explain technical issues in simple, relatable terms
3. Use Indian English naturally (e.g., "We'll fix this for you", "No worries")
4. Keep responses under 150 words for voice calls
5. Always prioritize safety
6. If urgent, clearly state "This needs immediate attention"

Vehicle Context:
- Registration: {vehicle_context.get('registration_number')}
- Owner: {vehicle_context.get('owner_name')}
- Health Score: {vehicle_context.get('health_score')}/100
- Odometer: {vehicle_context.get('odometer_km', 0):.0f} km

{self._format_defect_context(defect_info) if defect_info else ''}

Conversation History:
{self._format_history(conversation_history)}

Response Type: {response_type}

User Message: "{user_message}"

Generate a natural, helpful response. Be conversational but professional."""

            response = self._call_llm(system_prompt)
            return response.strip()
            
        except Exception as e:
            print(f"LLM generation error: {e}")
            return self._fallback_response(user_message, defect_info)
    
    def translate_technical_to_simple(
        self,
        technical_text: str,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Convert technical jargon to user-friendly language"""
        
        if not self.client:
            return self._fallback_translate(technical_text)
        
        try:
            prompt = f"""Convert this technical automotive text into simple, everyday language that anyone can understand.

Technical Text: "{technical_text}"

{f"Context: {context}" if context else ""}

Rules:
1. No jargon - explain like talking to a friend
2. Be concise
3. Focus on what it means for the customer
4. Use Indian English

Simple Version:"""

            response = self._call_llm(prompt)
            return response.strip()
            
        except Exception as e:
            print(f"Translation error: {e}")
            return self._fallback_translate(technical_text)
    
    def _call_llm(self, prompt: str) -> str:
        """Call the configured LLM provider"""
        
        if self.config.provider == 'openai':
            response = self.client.chat.completions.create(
                model=self.config.openai_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens
            )
            return response.choices[0].message.content
        
        elif self.config.provider == 'anthropic':
            response = self.client.messages.create(
                model=self.config.anthropic_model,
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text
        
        elif self.config.provider == 'gemini':
            response = self.client.generate_content(
                prompt,
                generation_config={
                    'temperature': self.config.temperature,
                    'max_output_tokens': self.config.max_tokens
                }
            )
            return response.text
        
        elif self.config.provider == 'groq':
            response = self.client.chat.completions.create(
                model=self.config.groq_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens
            )
            return response.choices[0].message.content
        
        else:
            raise ValueError(f"Unsupported provider: {self.config.provider}")
    
    def _format_history(self, history: List[Dict[str, str]]) -> str:
        """Format conversation history for context"""
        if not history:
            return "No previous conversation."
        
        formatted = []
        for msg in history[-5:]:
            role = msg.get('role', 'unknown')
            message = msg.get('message', '')
            formatted.append(f"{role.upper()}: {message}")
        
        return "\n".join(formatted)
    
    def _format_defect_context(self, defect: Dict[str, Any]) -> str:
        """Format defect information"""
        return f"""Current Issue:
- Component: {defect.get('component')}
- Severity: {defect.get('severity')}
- Description: {defect.get('description')}
- Confidence: {defect.get('confidence', 0) * 100:.0f}%
- Timeline: {defect.get('estimated_time_to_failure', 'Unknown')}
- Recommendation: {defect.get('recommended_action')}"""
    
    # Fallback methods for when LLM is not available
    def _fallback_analyze(self, user_message: str) -> Dict[str, Any]:
        """Rule-based analysis when LLM unavailable"""
        message_lower = user_message.lower()
        
        intent = 'ask_question'
        if any(w in message_lower for w in ['yes', 'schedule', 'book', 'okay', 'sure']):
            intent = 'schedule_service'
        elif any(w in message_lower for w in ['no', 'not now', 'later', 'maybe']):
            intent = 'decline'
        elif any(w in message_lower for w in ['emergency', 'urgent', 'immediate', 'now']):
            intent = 'emergency'
        
        tone = 'neutral'
        if any(w in message_lower for w in ['please', 'could you', 'kindly']):
            tone = 'formal'
        elif any(w in message_lower for w in ['yeah', 'yep', 'nope', 'gonna']):
            tone = 'casual'
        
        sentiment = 'neutral'
        if any(w in message_lower for w in ['worried', 'concerned', 'scared', 'afraid']):
            sentiment = 'concerned'
        
        concerns = []
        if any(w in message_lower for w in ['cost', 'price', 'expensive', 'money']):
            concerns.append('cost')
        if any(w in message_lower for w in ['safe', 'danger', 'risk']):
            concerns.append('safety')
        if any(w in message_lower for w in ['when', 'how long', 'time']):
            concerns.append('timeline')
        
        return {
            'intent': intent,
            'tone': tone,
            'sentiment': sentiment,
            'language_preference': 'simple',
            'key_concerns': concerns,
            'confidence': 0.6
        }
    
    def _fallback_response(self, user_message: str, defect: Optional[Dict] = None) -> str:
        """Template-based response when LLM unavailable"""
        message_lower = user_message.lower()
        
        if 'cost' in message_lower or 'price' in message_lower:
            return "The repair cost will depend on the parts needed. Our service center can provide a detailed estimate. Would you like to schedule an inspection?"
        elif 'serious' in message_lower or 'bad' in message_lower:
            return "Based on our diagnostics, this issue should be addressed soon to prevent further damage or safety concerns."
        elif 'time' in message_lower or 'how long' in message_lower:
            if defect and defect.get('estimated_time_to_failure'):
                return f"This should be addressed within {defect['estimated_time_to_failure']}."
            return "I recommend getting this checked as soon as possible."
        else:
            return "I understand your concern. Would you like to schedule a service appointment, or do you have any other questions?"
    
    def _fallback_translate(self, technical: str) -> str:
        """Simple translation map for common terms"""
        translations = {
            'brake_pad': 'brake pads',
            'engine_coolant': 'engine cooling system',
            'transmission': 'gearbox',
            'suspension': 'shock absorbers',
            'alternator': 'charging system',
            'battery': 'car battery',
            'degradation': 'wearing out',
            'malfunction': 'not working properly',
            'diagnostic': 'check',
            'telemetry': 'vehicle data'
        }
        
        result = technical.lower()
        for tech, simple in translations.items():
            result = result.replace(tech, simple)
        
        return result


# Utility function for testing
def test_llm_configuration() -> Dict[str, Any]:
    """Test LLM configuration and availability"""
    config = LLMConfig()
    
    result = {
        'enabled': config.enabled,
        'provider': config.provider,
        'configured': config.is_configured(),
        'available_providers': []
    }
    
    if OPENAI_AVAILABLE and config.openai_api_key:
        result['available_providers'].append('openai')
    if ANTHROPIC_AVAILABLE and config.anthropic_api_key:
        result['available_providers'].append('anthropic')
    if GEMINI_AVAILABLE and config.gemini_api_key:
        result['available_providers'].append('gemini')
    if GROQ_AVAILABLE and config.groq_api_key:
        result['available_providers'].append('groq')
    
    return result


if __name__ == "__main__":
    result = test_llm_configuration()
    print("LLM Configuration Test:")
    print(f"  Enabled: {result['enabled']}")
    print(f"  Provider: {result['provider']}")
    print(f"  Configured: {result['configured']}")
    print(f"  Available: {result['available_providers']}")
    
    if not result['configured']:
        print("\nTo enable LLM:")
        print("  export LLM_PROVIDER=groq  # or gemini, openai, anthropic")
        print("  export GROQ_API_KEY=gsk_...")
        print("  # or")
        print("  export GEMINI_API_KEY=AIza...")
        print("  # or")
        print("  export OPENAI_API_KEY=sk-...")
        print("  # or")
        print("  export ANTHROPIC_API_KEY=sk-ant-...")
