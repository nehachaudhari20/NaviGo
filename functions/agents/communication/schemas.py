from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class VehicleDefect(BaseModel):
    """Model for vehicle defect information"""
    defect_id: str
    component: str
    description: str
    severity: str  # Critical, High, Medium, Low
    confidence: float = Field(ge=0.0, le=1.0)
    fault_codes: List[str] = []
    detected_at: datetime
    estimated_time_to_failure: Optional[str] = None
    recommended_action: str

class VehicleStatus(BaseModel):
    """Model for complete vehicle status"""
    vehicle_id: str
    registration_number: str
    owner_name: str
    health_score: int = Field(ge=0, le=100)
    defects: List[VehicleDefect]
    last_service_date: Optional[str] = None
    odometer_km: float = 0.0

class ConversationContext(BaseModel):
    """Model for tracking conversation state"""
    session_id: str
    vehicle_status: VehicleStatus
    conversation_history: List[dict] = []
    current_topic: str = "greeting"
    user_tone: str = "neutral"
    user_language_preference: str = "simple"
    user_sentiment: str = "neutral"
    questions_asked: List[str] = []

class UserResponse(BaseModel):
    """Model for user's response"""
    message: str
    intent: str
    tone: str
    sentiment: str
    timestamp: datetime = Field(default_factory=datetime.now)

class AgentMessage(BaseModel):
    """Model for agent's message"""
    message: str
    tone: str
    contains_technical_terms: bool
    simplified_version: str

class CommunicationOutput(BaseModel):
    """Model for complete communication output"""
    session_id: str
    vehicle_id: str
    communication_type: str  # voice, sms
    messages: List[AgentMessage]
    user_responses: List[UserResponse]
    outcome: str  # scheduled, declined, needs_followup
    next_action: Optional[str] = None
