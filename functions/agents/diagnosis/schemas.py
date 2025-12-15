from pydantic import BaseModel
from typing import Optional, List
from data_analysis.schemas import TelematicsEvent

class DiagnosisInput(BaseModel):
    vehicle_id: str
    anomaly_detected: bool
    anomaly_type: Optional[str]
    severity_score: Optional[float]
    telemetry_window: List[TelematicsEvent]

class DiagnosisOutput(BaseModel):
    vehicle_id: str
    component: str
    failure_probability: float
    estimated_rul_days: int
    severity: str  # "Low" | "Medium" | "High"
    context_window: List[TelematicsEvent]
