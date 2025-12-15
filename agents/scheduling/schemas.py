from pydantic import BaseModel
from typing import List, Dict

class SchedulingInput(BaseModel):
    vehicle_id: str
    estimated_rul_days: int
    severity: str
    recommended_center: str
    spare_parts_availability: Dict
    technician_availability: Dict

class SchedulingOutput(BaseModel):
    best_slot: str
    service_center: str
    slot_type: str   # "urgent" | "normal" | "delayed"
    fallback_slots: List[str]
