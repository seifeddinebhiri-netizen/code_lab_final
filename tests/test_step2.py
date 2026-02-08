from datetime import date, datetime
from module4_domain_aggregator import SignalAggregator
from module4_domain_signals import ForecastSignal, SentimentSignal, AnomalySignal


def test_step2_signal_aggregator():
    agg = SignalAggregator()

    sym = "SFBT"
    d = date(2026, 2, 7)

    forecast = ForecastSignal(
        symbol=sym, as_of=d, horizon_days=5,
        expected_return=0.02, volatility_pred=0.02, confidence=0.75
    )

    sentiment = SentimentSignal(
        symbol=sym, as_of=d,
        sentiment_score=0.6, confidence=0.70,
        evidence=[{"title": "News positive", "score": 0.8}]
    )

    out1 = agg.aggregate_one(sym, d, forecast, sentiment, anomalies=[], last_price=10.5)
    print("\n--- CAS 1 (no anomaly) ---")
    print(out1)

    assert out1.action_score > 0
    assert 0 <= out1.confidence <= 1
    assert "ANOMALY_NONE" in out1.reason_codes

    anomalies = [
        AnomalySignal(symbol=sym, ts=datetime(2026, 2, 7, 10, 0, 0),
                      anomaly_type="volume_spike", severity=0.9,
                      description="Volume +800%", recommended_caution=True)
    ]
    out2 = agg.aggregate_one(sym, d, forecast, sentiment, anomalies=anomalies, last_price=10.5)
    print("\n--- CAS 2 (severe anomaly) ---")
    print(out2)

    assert out2.confidence < out1.confidence
    assert abs(out2.action_score) <= abs(out1.action_score)
    assert "ANOMALY_SEVERE" in out2.reason_codes

    print("\n✅ Test Step 2 OK")


if __name__ == "__main__":
    test_step2_signal_aggregator()
