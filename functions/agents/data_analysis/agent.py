# agents/data_analysis/agent.py

from .schemas import TelematicsEvent, AnomalyOutput

class DataAnalysisAgent:

    def __init__(self):
        # Any thresholds you want to define can go here
        self.temp_threshold = 95.0
        self.rpm_threshold = 6500
        self.battery_drop_threshold = 20

    def run(self, event: TelematicsEvent) -> AnomalyOutput:
        """
        Main entry point for the agent.
        MUST BE NAMED 'run' because FastAPI calls agent.run()
        """

        anomaly_detected = False
        anomaly_type = None
        severity_score = 0.0

        # ----- SIMPLE RULE-BASED LOGIC (MVP) -----
        if event.engine_coolant_temp_c and event.engine_coolant_temp_c > self.temp_threshold:
            anomaly_detected = True
            anomaly_type = "thermal"
            severity_score = min(1.0, (event.engine_coolant_temp_c - 90) / 50)

        elif event.engine_rpm and event.engine_rpm > self.rpm_threshold:
            anomaly_detected = True
            anomaly_type = "mechanical"
            severity_score = min(1.0, (event.engine_rpm - 5000) / 3000)

        elif event.battery_soc_pct and event.battery_soc_pct < self.battery_drop_threshold:
            anomaly_detected = True
            anomaly_type = "electrical"
            severity_score = min(1.0, (20 - event.battery_soc_pct) / 20)

        # Return Pydantic model
        return AnomalyOutput(
            vehicle_id=event.vehicle_id,
            anomaly_detected=anomaly_detected,
            anomaly_type=anomaly_type,
            severity_score=severity_score,
            telemetry_window=[event]  # minimal MVP
        )
