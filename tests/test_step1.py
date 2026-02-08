from datetime import datetime, timedelta

from module4_domain_portfolio import PortfolioEngine


def test_step1_portfolio_engine():
    pe = PortfolioEngine(initial_cash=10_000.0)

    t0 = datetime(2026, 2, 7, 9, 0, 0)

    prices_d0 = {"SFBT": 10.00, "BIAT": 90.00}
    prices_d1 = {"SFBT": 10.50, "BIAT": 89.00}
    prices_d2 = {"SFBT": 10.20, "BIAT": 91.00}
    prices_d3 = {"SFBT": 10.90, "BIAT": 92.00}

    pe.mark_to_market(prices_d0, ts=t0)

    pe.apply_trade(
        symbol="SFBT",
        side="BUY",
        qty=200,
        price=10.00,
        ts=t0 + timedelta(minutes=10),
        fees=2.0,
        reason_codes=["INIT_BUY", "FORECAST_UP"]
    )
    pe.mark_to_market(prices_d0, ts=t0 + timedelta(hours=1))

    pe.mark_to_market(prices_d1, ts=t0 + timedelta(days=1))

    pe.apply_trade(
        symbol="SFBT",
        side="SELL",
        qty=50,
        price=10.50,
        ts=t0 + timedelta(days=1, hours=2),
        fees=1.0,
        reason_codes=["TAKE_PROFIT", "SENTIMENT_POS"]
    )
    pe.mark_to_market(prices_d1, ts=t0 + timedelta(days=1, hours=3))

    pe.mark_to_market(prices_d2, ts=t0 + timedelta(days=2))
    snap_last = pe.mark_to_market(prices_d3, ts=t0 + timedelta(days=3))

    print("\n====== SNAPSHOT FINAL ======")
    print("Date:", snap_last.ts)
    print("Cash:", round(snap_last.cash, 3))
    if "SFBT" in snap_last.positions:
        pos = snap_last.positions["SFBT"]
        print("Position SFBT:", {"qty": pos.qty, "avg_price": round(pos.avg_price, 4)})
    print("NAV:", round(snap_last.nav, 4))
    print("PnL latent:", round(snap_last.unrealized_pnl, 4))
    print("PnL réalisé:", round(snap_last.realized_pnl, 4))

    print("\n====== METRICS ======")
    m = pe.metrics()
    print("ROI:", round(m["roi"], 6))
    print("Sharpe (daily):", round(m["sharpe"], 6))
    print("Max Drawdown:", round(m["max_drawdown"], 6))

    assert pe.cash >= 0
    assert snap_last.nav > 0
    assert m["max_drawdown"] >= 0
    assert -1.0 < m["roi"] < 1.0
    assert len(pe.trade_log) == 2
    assert len(pe.nav_history) >= 2

    print("\n✅ Test Step 1 OK")


if __name__ == "__main__":
    test_step1_portfolio_engine()
