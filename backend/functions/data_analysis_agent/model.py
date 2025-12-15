class SimpleAnomalyModel:
    """
    Minimal anomaly detection placeholder.
    Later replace with Isolation Forest or LSTM autoencoder.
    """

    def detect_spike(self, value: float, threshold: float) -> bool:
        if threshold is None:
            return False
        return value > threshold

    def compute_severity(self, value: float, threshold: float) -> float:
        if threshold is None:
            return 0.0
        return min(1.0, (value - threshold) / threshold)

