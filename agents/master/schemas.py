from pydantic import BaseModel
from typing import Optional, List, Dict

class OrchestratorInput(BaseModel):
    anomaly_event: Optional[Dict] = None
    diagnosis_result: Optional[Dict] = None
    rca_result: Optional[Dict] = None
    scheduling_result: Optional[Dict] = None
    engagement_result: Optional[Dict] = None
    cei_result: Optional[Dict] = None
    ueba_flags: Optional[List[str]] = None

class OrchestratorOutput(BaseModel):
    status: str   # "triggered_next_agent" | "halted_due_to_UEBA" | "completed_pipeline"
    next_agent: Optional[str]
    case_id: str
    logs: List[str]
