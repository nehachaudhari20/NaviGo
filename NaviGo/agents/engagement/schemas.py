from pydantic import BaseModel
from typing import Optional

class EngagementInput(BaseModel):
    vehicle_id: str
    root_cause: str
    recommended_action: str
    best_slot: str
    service_center: str

class EngagementOutput(BaseModel):
    vehicle_id: str
    customer_decision: str   # "confirmed" | "declined" | "no_response"
    booking_id: Optional[str] = None
    transcript: Optional[str] = None
