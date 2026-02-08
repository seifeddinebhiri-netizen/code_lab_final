from datetime import date, datetime
from module4_domain_decision import DecisionEngine, PortfolioContext
from module4_domain_signals import AggregatedSignal


def test_step3_decision_engine():
    engine = DecisionEngine()
    d = date(2026, 2, 7)
    sym = "SFBT"
    last_price = 10.0

    sig_buy = AggregatedSignal(
        symbol=sym,
        as_of=d,
        action_score=0.60,
        confidence=0.72,
        reason_codes=["FORECAST_UP", "SENTIMENT_POS", "ANOMALY_NONE"],
        features={
            "volatility_pred": 0.02,
            "anomaly_max_severity": 0.0
        }
    )

    ctx_buy = PortfolioContext(
        cash=8_000.0,
        total_equity=10_000.0,
        position_qty=0.0,
        position_value=0.0,
        current_weight=0.0,
        last_price=last_price
    )

    dec1 = engine.decide_one(sig_buy, "moderate", ctx_buy)
    print("\n--- DECISION BUY ---")
    print(dec1)

    assert dec1.action in ("BUY", "HOLD")
    if dec1.action == "BUY":
        assert dec1.order_value > 0
        assert dec1.order_qty > 0

    sig_sell = AggregatedSignal(
        symbol=sym,
        as_of=d,
        action_score=-0.70,
        confidence=0.70,
        reason_codes=["FORECAST_DOWN", "SENTIMENT_NEG", "ANOMALY_PRESENT"],
        features={
            "volatility_pred": 0.03,
            "anomaly_max_severity": 0.2
        }
    )

    ctx_sell = PortfolioContext(
        cash=2_000.0,
        total_equity=10_000.0,
        position_qty=300.0,
        position_value=3_000.0,
        current_weight=0.30,
        last_price=last_price
    )

    dec2 = engine.decide_one(sig_sell, "moderate", ctx_sell)
    print("\n--- DECISION SELL ---")
    print(dec2)

    assert dec2.action in ("SELL", "HOLD")
    if dec2.action == "SELL":
        assert dec2.order_value > 0
        assert dec2.order_qty > 0

    print("\n✅ Test Step 3 OK")


if __name__ == "__main__":
    test_step3_decision_engine()
