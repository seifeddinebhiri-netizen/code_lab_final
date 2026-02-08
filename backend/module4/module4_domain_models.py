from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Literal


Side = Literal["BUY", "SELL"]


@dataclass
class Position:
    symbol: str
    qty: float = 0.0
    avg_price: float = 0.0


@dataclass
class Trade:
    ts: datetime
    symbol: str
    side: Side
    qty: float
    price: float
    fees: float = 0.0
    reason_codes: List[str] = field(default_factory=list)


@dataclass
class NavPoint:
    ts: datetime
    nav: float


@dataclass
class PortfolioSnapshot:
    ts: datetime
    cash: float
    positions: Dict[str, Position]
    prices: Dict[str, float]
    nav: float
    unrealized_pnl: float
    realized_pnl: float
