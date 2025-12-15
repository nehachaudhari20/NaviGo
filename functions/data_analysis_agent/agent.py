from typing import List
from schemas import TelematicsEvent, AnomalyOutput
from thresholds import get_threshold
from model import SimpleAnomalyModel

class DataAnalysisAgent:

    def __init__(self):
        self.model = SimpleAnomalyModel()

    def detect_anomaly(self, events: List[TelematicsEvent]) -> AnomalyOutput:
        """
        Input: List of telemetry events (sliding window)
        Output: AnomalyOutput
        """

        if not events:
            raise ValueError("No telemetry events received")

        latest = events[-1]
        vehicle_id = latest.vehicle_id

        anomaly_detected = False
        anomaly_type = None
        severity_score = 0.0

        # Check engine coolant temperature
        if latest.engine_coolant_temp_c is not None:
            threshold = get_threshold("engine_coolant_temp_c")
            if self.model.detect_spike(latest.engine_coolant_temp_c, threshold):
                anomaly_detected = True
                anomaly_type = "thermal_overheat"
                severity_score = self.model.compute_severity(latest.engine_coolant_temp_c, threshold)

        # Check battery health
        if latest.battery_soh_pct is not None:
            threshold = get_threshold("battery_soh_pct")
            if latest.battery_soh_pct < threshold:
                anomaly_detected = True
                anomaly_type = "battery_degradation"
                severity_score = max(severity_score, 1 - (latest.battery_soh_pct / threshold))

        # Check engine RPM
        if latest.engine_rpm is not None:
            threshold = get_threshold("engine_rpm")
            if self.model.detect_spike(latest.engine_rpm, threshold):
                anomaly_detected = True
                anomaly_type = "rpm_spike"
                severity_score = max(severity_score, self.model.compute_severity(latest.engine_rpm, threshold))

        # Check DTC codes
        if latest.dtc_codes:
            anomaly_detected = True
            anomaly_type = "dtc_fault"
            severity_score = max(severity_score, 0.7)

        return AnomalyOutput(
            vehicle_id=vehicle_id,
            anomaly_detected=anomaly_detected,
            anomaly_type=anomaly_type,
            severity_score=round(severity_score, 3),
            telemetry_window=events
        )

