from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TelematicsEvent(BaseModel):
    event_id: str
    vehicle_id: str
    timestamp_utc: datetime
    
    gps_lat: float
    gps_lon: float
    speed_kmph: float
    odometer_km: float

    engine_rpm: Optional[int] = None
    engine_coolant_temp_c: Optional[float] = None
    engine_oil_temp_c: Optional[float] = None
    fuel_level_pct: Optional[float] = None
    
    battery_soc_pct: Optional[float] = None
    battery_soh_pct: Optional[float] = None
    
    dtc_codes: List[str] = []

class AnomalyOutput(BaseModel):
    vehicle_id: str
    anomaly_detected: bool
    anomaly_type: Optional[str] = None
    severity_score: Optional[float] = None
    telemetry_window: List[TelematicsEvent] = []
