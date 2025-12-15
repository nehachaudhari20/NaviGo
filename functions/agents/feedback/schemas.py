from pydantic import BaseModel
from typing import Optional, List
from data_analysis.schemas import TelematicsEvent

class FeedbackInput(BaseModel):
    vehicle_id: str
    booking_id: str
    technician_notes: Optional[str]
    post_service_telemetry: List[TelematicsEvent]
    customer_rating: Optional[int]

class FeedbackOutput(BaseModel):
    vehicle_id: str
    cei_score: float
    validation_label: str  # "Correct" | "Recurring" | "Incorrect"
    recommended_retrain: bool
