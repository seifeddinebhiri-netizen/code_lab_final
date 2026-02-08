from __future__ import annotations
from dataclasses import dataclass, field
from datetime import date
from typing import Dict, List, Optional, Literal

from module4_domain_signals import AggregatedSignal


Action = Literal["BUY", "SELL", "HOLD"]


@dataclass
class RiskProfile:
    name: Literal["conservative", "moderate", "aggressive"]

    max_weight_per_asset: float
    min_confidence_to_trade: float
    score_buy_th: float
    score_sell_th: float

    base_target_weight: float
    anomaly_size_penalty: float
    volatility_size_penalty: float

    max_total_exposure: float


def get_profile(profile: str) -> RiskProfile:
    p = profile.strip().lower()
    if p in ("conservateur", "conservative"):
        return RiskProfile(
            name="conservative",
            max_weight_per_asset=0.15,
            min_confidence_to_trade=0.60,
            score_buy_th=0.35,
            score_sell_th=-0.35,
            base_target_weight=0.08,
            anomaly_size_penalty=0.75,
            volatility_size_penalty=0.35,
            max_total_exposure=0.60,
        )
    if p in ("modere", "modéré", "moderate"):
        return RiskProfile(
            name="moderate",
            max_weight_per_asset=0.25,
            min_confidence_to_trade=0.55,
            score_buy_th=0.25,
            score_sell_th=-0.25,
            base_target_weight=0.12,
            anomaly_size_penalty=0.70,
            volatility_size_penalty=0.30,
            max_total_exposure=0.80,
        )
    return RiskProfile(
        name="aggressive",
        max_weight_per_asset=0.35,
        min_confidence_to_trade=0.50,
        score_buy_th=0.15,
        score_sell_th=-0.15,
        base_target_weight=0.16,
        anomaly_size_penalty=0.60,
        volatility_size_penalty=0.25,
        max_total_exposure=0.95,
    )


@dataclass
class PortfolioContext:
    """
    Contexte minimal fourni par PortfolioEngine + MarketData:
    - cash
    - total_equity: NAV actuelle
    - position_qty, position_value, current_weight
    - last_price
    """
    cash: float
    total_equity: float
    position_qty: float
    position_value: float
    current_weight: float
    last_price: float


@dataclass
class Decision:
    symbol: str
    as_of: date
    action: Action
    confidence: float
    target_weight: float
    order_value: float
    order_qty: float
    reason_codes: List[str] = field(default_factory=list)


def _clip(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


@dataclass
class DecisionEngine:
    """
    Rule-based MVP:
    - BUY si action_score élevé + confidence suffisante
    - SELL si action_score très négatif ou réduction de risque
    - HOLD sinon

    Le sizing respecte:
    - max_weight_per_asset
    - max_total_exposure
    - cash disponible
    - réduction si anomalies / volatilité élevée
    """
    vol_high_th: float = 0.03
    anomaly_severe_th: float = 0.75

    def decide_one(
        self,
        signal: AggregatedSignal,
        profile_name: str,
        ctx: PortfolioContext
    ) -> Decision:

        prof = get_profile(profile_name)
        rc: List[str] = list(signal.reason_codes)

        if ctx.total_equity <= 0 or ctx.last_price <= 0:
            return Decision(
                symbol=signal.symbol,
                as_of=signal.as_of,
                action="HOLD",
                confidence=0.0,
                target_weight=ctx.current_weight,
                order_value=0.0,
                order_qty=0.0,
                reason_codes=rc + ["INVALID_CONTEXT"],
            )

        score = float(signal.action_score)
        conf = float(signal.confidence)

        vol = float(signal.features.get("volatility_pred", 0.0))
        max_sev = float(signal.features.get("anomaly_max_severity", 0.0))

        if conf < prof.min_confidence_to_trade:
            return Decision(
                symbol=signal.symbol,
                as_of=signal.as_of,
                action="HOLD",
                confidence=conf,
                target_weight=ctx.current_weight,
                order_value=0.0,
                order_qty=0.0,
                reason_codes=rc + ["HOLD_LOW_CONFIDENCE"],
            )

        action: Action = "HOLD"
        if score >= prof.score_buy_th:
            action = "BUY"
            rc.append("RULE_BUY_SCORE")
        elif score <= prof.score_sell_th:
            action = "SELL"
            rc.append("RULE_SELL_SCORE")
        else:
            return Decision(
                symbol=signal.symbol,
                as_of=signal.as_of,
                action="HOLD",
                confidence=conf,
                target_weight=ctx.current_weight,
                order_value=0.0,
                order_qty=0.0,
                reason_codes=rc + ["HOLD_SCORE_NEUTRAL"],
            )

        base_w = prof.base_target_weight

        score_factor = _clip(abs(score), 0.0, 1.0)

        conf_factor = _clip(conf, 0.0, 1.0)

        target_w = base_w * (0.6 + 0.4 * score_factor) * (0.6 + 0.4 * conf_factor)

        if max_sev >= self.anomaly_severe_th:
            target_w *= (1.0 - prof.anomaly_size_penalty * max_sev)
            rc.append("SIZE_ANOMALY_PENALTY")

        if vol >= self.vol_high_th:
            vol_pen = _clip(vol / 0.10, 0.0, 1.0) * prof.volatility_size_penalty
            target_w *= (1.0 - vol_pen)
            rc.append("SIZE_VOLATILITY_PENALTY")

        target_w = _clip(target_w, 0.0, prof.max_weight_per_asset)

        current_exposure = 1.0 - (ctx.cash / ctx.total_equity)
        if current_exposure > prof.max_total_exposure:
            if action == "BUY":
                return Decision(
                    symbol=signal.symbol,
                    as_of=signal.as_of,
                    action="HOLD",
                    confidence=conf,
                    target_weight=ctx.current_weight,
                    order_value=0.0,
                    order_qty=0.0,
                    reason_codes=rc + ["HOLD_MAX_EXPOSURE_REACHED"],
                )

        desired_value = target_w * ctx.total_equity
        order_value = 0.0

        if action == "BUY":
            if desired_value <= ctx.position_value:
                return Decision(
                    symbol=signal.symbol,
                    as_of=signal.as_of,
                    action="HOLD",
                    confidence=conf,
                    target_weight=ctx.current_weight,
                    order_value=0.0,
                    order_qty=0.0,
                    reason_codes=rc + ["HOLD_ALREADY_ALLOCATED"],
                )

            order_value = desired_value - ctx.position_value

            if order_value > ctx.cash:
                order_value = ctx.cash
                rc.append("CAPPED_BY_CASH")

        else:
            sell_fraction = _clip(abs(score), 0.2, 1.0)
            order_value = ctx.position_value * sell_fraction
            if order_value > ctx.position_value:
                order_value = ctx.position_value

            if ctx.position_value <= 0:
                return Decision(
                    symbol=signal.symbol,
                    as_of=signal.as_of,
                    action="HOLD",
                    confidence=conf,
                    target_weight=ctx.current_weight,
                    order_value=0.0,
                    order_qty=0.0,
                    reason_codes=rc + ["HOLD_NO_POSITION_TO_SELL"],
                )

        order_qty = 0.0
        if ctx.last_price > 0:
            order_qty = order_value / ctx.last_price

        if action == "SELL":
            target_w = _clip(ctx.current_weight * (1.0 - _clip(abs(score), 0.2, 1.0)), 0.0, prof.max_weight_per_asset)

        conf_adj = conf * (1.0 - 0.3 * _clip(max_sev, 0.0, 1.0))
        conf_adj = _clip(conf_adj, 0.0, 1.0)

        return Decision(
            symbol=signal.symbol,
            as_of=signal.as_of,
            action=action,
            confidence=conf_adj,
            target_weight=target_w,
            order_value=order_value,
            order_qty=order_qty,
            reason_codes=rc,
        )
