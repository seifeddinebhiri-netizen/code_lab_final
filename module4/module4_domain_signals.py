from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, date
from typing import Dict, List, Optional


@dataclass
class ForecastSignal:
    symbol: str
    as_of: date
    horizon_days: int
    expected_return: float
    volatility_pred: float
    confidence: float


@dataclass
class SentimentSignal:
    symbol: str
    as_of: date
    sentiment_score: float
    confidence: float
    evidence: List[Dict] = field(default_factory=list)


@dataclass
class AnomalySignal:
    symbol: str
    ts: datetime
    anomaly_type: str
    severity: float
    description: str = ""
    recommended_caution: bool = True


@dataclass
class AggregatedSignal:
    symbol: str
    as_of: date
    action_score: float
    confidence: float
    reason_codes: List[str] = field(default_factory=list)
    features: Dict[str, float] = field(default_factory=dict)
