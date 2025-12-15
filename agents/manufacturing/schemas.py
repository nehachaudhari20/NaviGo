from pydantic import BaseModel

class ManufacturingInput(BaseModel):
    vehicle_id: str
    root_cause: str
    cei_score: float
    recurrence_count: int

class ManufacturingOutput(BaseModel):
    issue: str
    capa_recommendation: str
    severity: str
    recurrence_cluster_size: int
