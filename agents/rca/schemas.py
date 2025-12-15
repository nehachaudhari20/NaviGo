from pydantic import BaseModel
from typing import List
from data_analysis.schemas import TelematicsEvent

class RCAInput(BaseModel):
    vehicle_id: str
    component: str
    failure_probability: float
    estimated_rul_days: int
    severity: str
    context_window: List[TelematicsEvent]

class RCAOutput(BaseModel):
    vehicle_id: str
    root_cause: str
    confidence: float
    recommended_action: str
    capa_type: str  # "Corrective" | "Preventive"
