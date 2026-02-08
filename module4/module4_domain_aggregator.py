from __future__ import annotations
from dataclasses import dataclass
from datetime import date
from typing import Dict, List, Optional

from module4_domain_signals import (
    ForecastSignal,
    SentimentSignal,
    AnomalySignal,
    AggregatedSignal,
)


def _clip(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


@dataclass
class AggregationWeights:
    w_forecast: float = 0.55
    w_sentiment: float = 0.35
    w_anomaly_penalty: float = 0.45


@dataclass
class SignalAggregator:
    """
    Fusionne Forecast + Sentiment + Anomalies.

    - action_score: combine signal directionnel (retour attendu) + sentiment
    - confidence: combine confiances + pénalités anomalies/volatilité
    - reason_codes: pour ExplainabilityEngine
    """
    weights: AggregationWeights = AggregationWeights()

    ret_buy_th: float = 0.01
    ret_sell_th: float = -0.01
    sentiment_pos_th: float = 0.20
    sentiment_neg_th: float = -0.20
    anomaly_severe_th: float = 0.75

    def aggregate_one(
        self,
        symbol: str,
        as_of: date,
        forecast: Optional[ForecastSignal],
        sentiment: Optional[SentimentSignal],
        anomalies: Optional[List[AnomalySignal]] = None,
        last_price: Optional[float] = None,
    ) -> AggregatedSignal:

        anomalies = anomalies or []
        reason_codes: List[str] = []
        features: Dict[str, float] = {}

        forecast_score = 0.0
        forecast_conf = 0.0
        exp_ret = 0.0
        vol = 0.0

        if forecast is not None:
            exp_ret = float(forecast.expected_return)
            vol = float(forecast.volatility_pred)
            forecast_conf = _clip(float(forecast.confidence), 0.0, 1.0)

            forecast_score = _clip(exp_ret / 0.05, -1.0, 1.0)

            if exp_ret >= self.ret_buy_th:
                reason_codes.append("FORECAST_UP")
            elif exp_ret <= self.ret_sell_th:
                reason_codes.append("FORECAST_DOWN")
            else:
                reason_codes.append("FORECAST_NEUTRAL")

            features["expected_return"] = exp_ret
            features["volatility_pred"] = vol
            features["forecast_conf"] = forecast_conf
        else:
            reason_codes.append("FORECAST_MISSING")
            features["forecast_conf"] = 0.0

        sent_score = 0.0
        sent_conf = 0.0
        sent_val = 0.0

        if sentiment is not None:
            sent_val = _clip(float(sentiment.sentiment_score), -1.0, 1.0)
            sent_conf = _clip(float(sentiment.confidence), 0.0, 1.0)
            sent_score = sent_val

            if sent_val >= self.sentiment_pos_th:
                reason_codes.append("SENTIMENT_POS")
            elif sent_val <= self.sentiment_neg_th:
                reason_codes.append("SENTIMENT_NEG")
            else:
                reason_codes.append("SENTIMENT_NEUTRAL")

            features["sentiment_score"] = sent_val
            features["sentiment_conf"] = sent_conf
        else:
            reason_codes.append("SENTIMENT_MISSING")
            features["sentiment_score"] = 0.0
            features["sentiment_conf"] = 0.0

        max_sev = 0.0
        severe = False
        if anomalies:
            max_sev = max(_clip(float(a.severity), 0.0, 1.0) for a in anomalies)
            severe = max_sev >= self.anomaly_severe_th
            features["anomaly_max_severity"] = max_sev

            if severe:
                reason_codes.append("ANOMALY_SEVERE")
            else:
                reason_codes.append("ANOMALY_PRESENT")
        else:
            reason_codes.append("ANOMALY_NONE")
            features["anomaly_max_severity"] = 0.0

        w = self.weights
        raw = (w.w_forecast * forecast_score) + (w.w_sentiment * sent_score)

        penalty = w.w_anomaly_penalty * max_sev
        action_score = _clip(raw * (1.0 - penalty), -1.0, 1.0)

        denom = 0.0
        conf_sum = 0.0
        if forecast is not None:
            denom += w.w_forecast
            conf_sum += w.w_forecast * forecast_conf
        if sentiment is not None:
            denom += w.w_sentiment
            conf_sum += w.w_sentiment * sent_conf

        base_conf = (conf_sum / denom) if denom > 0 else 0.25

        vol_pen = _clip(vol / 0.10, 0.0, 0.35)
        anom_pen = _clip(max_sev * 0.50, 0.0, 0.50)

        confidence = _clip(base_conf * (1.0 - vol_pen) * (1.0 - anom_pen), 0.0, 1.0)

        if confidence < 0.35:
            reason_codes.append("LOW_CONFIDENCE")

        if last_price is not None:
            features["last_price"] = float(last_price)

        features["forecast_score"] = forecast_score
        features["sent_score"] = sent_score
        features["raw_score"] = raw
        features["penalty"] = penalty

        return AggregatedSignal(
            symbol=symbol,
            as_of=as_of,
            action_score=action_score,
            confidence=confidence,
            reason_codes=reason_codes,
            features=features,
        )
