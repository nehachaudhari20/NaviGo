DEFAULT_THRESHOLDS = {
    "engine_coolant_temp_c": 110,   # Overheat
    "engine_oil_temp_c": 130,       # High oil temp
    "battery_soc_pct": 10,          # Low state of charge
    "battery_soh_pct": 70,          # Battery degradation
    "engine_rpm": 6500              # Abnormal high RPM
}

def get_threshold(metric: str) -> float:
    return DEFAULT_THRESHOLDS.get(metric, None)
