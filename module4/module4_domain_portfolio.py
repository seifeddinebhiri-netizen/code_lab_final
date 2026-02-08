from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional
import math

from module4_domain_models import (
    Position,
    Trade,
    NavPoint,
    PortfolioSnapshot,
)


class PortfolioError(Exception):
    pass


def _safe_std(values: List[float]) -> float:
    if len(values) < 2:
        return 0.0
    mean = sum(values) / len(values)
    var = sum((x - mean) ** 2 for x in values) / (len(values) - 1)
    return math.sqrt(var)


def _pct_change(series: List[float]) -> List[float]:
    if len(series) < 2:
        return []
    returns = []
    for i in range(1, len(series)):
        prev = series[i - 1]
        cur = series[i]
        returns.append(cur / prev - 1 if prev > 0 else 0.0)
    return returns


def max_drawdown(nav_series: List[float]) -> float:
    if not nav_series:
        return 0.0
    peak = nav_series[0]
    mdd = 0.0
    for nav in nav_series:
        peak = max(peak, nav)
        if peak > 0:
            mdd = max(mdd, (peak - nav) / peak)
    return mdd


def sharpe_ratio(nav_series: List[float], rf_daily: float = 0.0) -> float:
    returns = _pct_change(nav_series)
    if not returns:
        return 0.0
    excess = [r - rf_daily for r in returns]
    mu = sum(excess) / len(excess)
    sd = _safe_std(excess)
    return mu / sd if sd > 0 else 0.0


def roi(initial_nav: float, final_nav: float) -> float:
    return (final_nav - initial_nav) / initial_nav if initial_nav > 0 else 0.0


@dataclass
class PortfolioEngine:
    initial_cash: float = 10_000.0
    cash: float = field(init=False)
    positions: Dict[str, Position] = field(default_factory=dict, init=False)
    trade_log: List[Trade] = field(default_factory=list, init=False)
    nav_history: List[NavPoint] = field(default_factory=list, init=False)
    realized_pnl: float = field(default=0.0, init=False)

    def __post_init__(self) -> None:
        if self.initial_cash <= 0:
            raise PortfolioError("initial_cash doit être > 0")
        self.cash = float(self.initial_cash)

    def get_position(self, symbol: str) -> Position:
        if symbol not in self.positions:
            self.positions[symbol] = Position(symbol=symbol)
        return self.positions[symbol]

    def apply_trade(
        self,
        symbol: str,
        side: str,
        qty: float,
        price: float,
        ts: Optional[datetime] = None,
        fees: float = 0.0,
        reason_codes: Optional[List[str]] = None,
    ) -> Trade:

        ts = ts or datetime.utcnow()
        reason_codes = reason_codes or []
        side = side.upper()

        if side not in ("BUY", "SELL"):
            raise PortfolioError("side doit être BUY ou SELL")
        if qty <= 0 or price <= 0:
            raise PortfolioError("qty et price doivent être > 0")

        pos = self.get_position(symbol)

        if side == "BUY":
            total_cost = qty * price + fees
            if total_cost > self.cash:
                raise PortfolioError("Cash insuffisant")

            new_qty = pos.qty + qty
            total_old_cost = pos.qty * pos.avg_price
            total_new_cost = total_old_cost + qty * price + fees

            pos.qty = new_qty
            pos.avg_price = total_new_cost / new_qty
            self.cash -= total_cost

        else:
            if qty > pos.qty:
                raise PortfolioError("Quantité insuffisante")

            proceeds = qty * price - fees
            realized = qty * (price - pos.avg_price) - fees

            self.cash += proceeds
            self.realized_pnl += realized
            pos.qty -= qty

            if pos.qty == 0:
                pos.avg_price = 0.0

        trade = Trade(
            ts=ts,
            symbol=symbol,
            side=side,
            qty=qty,
            price=price,
            fees=fees,
            reason_codes=reason_codes,
        )
        self.trade_log.append(trade)
        return trade

    def market_value(self, prices: Dict[str, float]) -> float:
        return sum(
            pos.qty * prices[symbol]
            for symbol, pos in self.positions.items()
            if pos.qty > 0
        )

    def unrealized_pnl(self, prices: Dict[str, float]) -> float:
        return sum(
            pos.qty * (prices[symbol] - pos.avg_price)
            for symbol, pos in self.positions.items()
            if pos.qty > 0
        )

    def nav(self, prices: Dict[str, float]) -> float:
        return self.cash + self.market_value(prices)

    def mark_to_market(
        self, prices: Dict[str, float], ts: Optional[datetime] = None
    ) -> PortfolioSnapshot:

        ts = ts or datetime.utcnow()
        nav_value = self.nav(prices)

        self.nav_history.append(NavPoint(ts=ts, nav=nav_value))

        return PortfolioSnapshot(
            ts=ts,
            cash=self.cash,
            positions={k: v for k, v in self.positions.items()},
            prices=dict(prices),
            nav=nav_value,
            unrealized_pnl=self.unrealized_pnl(prices),
            realized_pnl=self.realized_pnl,
        )

    def metrics(self) -> Dict[str, float]:
        if not self.nav_history:
            return {"roi": 0.0, "sharpe": 0.0, "max_drawdown": 0.0}

        navs = [p.nav for p in self.nav_history]

        return {
            "roi": roi(navs[0], navs[-1]),
            "sharpe": sharpe_ratio(navs),
            "max_drawdown": max_drawdown(navs),
        }
