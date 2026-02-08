from datetime import date
from module4_domain_explain import ExplainabilityEngine
from module4_domain_decision import Decision
from module4_domain_signals import AggregatedSignal


def test_step4_explainability():
    engine = ExplainabilityEngine()
    d = date(2026, 2, 7)

    signal = AggregatedSignal(
        symbol="SFBT",
        as_of=d,
        action_score=0.58,
        confidence=0.72,
        reason_codes=["FORECAST_UP", "SENTIMENT_POS", "ANOMALY_NONE"],
        features={
            "expected_return": 0.02,
            "volatility_pred": 0.02,
            "sentiment_score": 0.60,
            "anomaly_max_severity": 0.0,
            "last_price": 10.0,
        }
    )

    decision = Decision(
        symbol="SFBT",
        as_of=d,
        action="BUY",
        confidence=0.70,
        target_weight=0.12,
        order_value=1200.0,
        order_qty=120.0,
        reason_codes=["FORECAST_UP", "SENTIMENT_POS", "ANOMALY_NONE", "RULE_BUY_SCORE"]
    )

    expl = engine.explain(decision, signal, profile_name="moderate", lang="fr")

    print("\n=== HEADLINE ===")
    print(expl.headline)
    print("\n=== SUMMARY ===")
    print(expl.summary)
    print("\n=== BULLETS ===")
    for b in expl.bullets:
        print("-", b)
    print("\n=== RISKS ===")
    for r in expl.risks:
        print("-", r)
    print("\n=== NEXT STEPS ===")
    for n in expl.next_steps:
        print("-", n)

    assert len(expl.bullets) >= 3
    assert len(expl.risks) >= 1
    assert len(expl.next_steps) >= 1

    print("\n✅ Test Step 4 OK")


if __name__ == "__main__":
    test_step4_explainability()
