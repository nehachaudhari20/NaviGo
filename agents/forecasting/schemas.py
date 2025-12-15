from pydantic import BaseModel
from typing import Dict

class ForecastInput(BaseModel):
    region: str
    service_history: Dict
    fleet_usage_stats: Dict
    workshop_capacity: Dict

class ForecastOutput(BaseModel):
    service_center_load: Dict
    demand_prediction_next_14_days: Dict
    recommended_center: str
