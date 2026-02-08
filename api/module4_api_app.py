from __future__ import annotations

from dataclasses import asdict
from datetime import date, datetime
from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from module4_domain_portfolio import PortfolioEngine, PortfolioError
from module4_domain_signals import ForecastSignal, SentimentSignal, AnomalySignal, AggregatedSignal
from module4_domain_aggregator import SignalAggregator
from module4_domain_decision import DecisionEngine, PortfolioContext, Decision
from module4_domain_explain import ExplainabilityEngine


class api1:
    def get(self, symbol: str, as_of: date) -> ForecastSignal:
        base = (hash(symbol) % 100) / 10000.0
        exp_ret = 0.015 + base
        return ForecastSignal(
            symbol=symbol,
            as_of=as_of,
            horizon_days=5,
            expected_return=exp_ret,
            volatility_pred=0.02,
            confidence=0.70,
        )


class api2:
    def get(self, symbol: str, as_of: date) -> SentimentSignal:
        s = ((hash(symbol) % 200) - 100) / 100.0
        s = max(-1.0, min(1.0, s / 2.0))
        conf = 0.65
        return SentimentSignal(
            symbol=symbol,
            as_of=as_of,
            sentiment_score=s,
            confidence=conf,
            evidence=[{"title": "Mock news", "score": s}],
        )


class api3:
    def get_recent(self, symbol: str, as_of: date) -> List[AnomalySignal]:
        return []


class MockMarketDataProvider:
    def __init__(self):
        self.prices: Dict[str, float] = {}

    def set_price(self, symbol: str, price: float) -> None:
        self.prices[symbol] = float(price)

    def get_last_price(self, symbol: str) -> float:
        px = self.prices.get(symbol)
        if px is None:
            return 10.0
        return float(px)

    def get_prices(self, symbols: List[str]) -> Dict[str, float]:
        return {s: self.get_last_price(s) for s in symbols}


app = FastAPI(title="Module4 Portfolio Agent API", version="0.1")

STATE = {
    "profile": "moderate",
    "portfolio": None,
}

market = MockMarketDataProvider()
forecast_provider = api1()
sentiment_provider = api2()
anomaly_provider = api3()

aggregator = SignalAggregator()
decider = DecisionEngine()
explainer = ExplainabilityEngine()


class InitRequest(BaseModel):
    profile: str = Field(default="moderate", description="conservative/moderate/aggressive")
    initial_cash: float = Field(default=10_000.0, ge=0.0)


class SetPricesRequest(BaseModel):
    prices: Dict[str, float]


class TradeRequest(BaseModel):
    symbol: str
    side: str
    qty: float = Field(gt=0)
    price: Optional[float] = None
    fees: float = Field(default=0.0, ge=0.0)
    reason_codes: List[str] = Field(default_factory=list)


class RecommendationsRequest(BaseModel):
    symbols: List[str]
    as_of: Optional[date] = None


class RecommendationOut(BaseModel):
    symbol: str
    action: str
    confidence: float
    target_weight: float
    order_value: float
    order_qty: float
    reason_codes: List[str]


class ExplainOut(BaseModel):
    headline: str
    summary: str
    bullets: List[str]
    risks: List[str]
    next_steps: List[str]
    debug: Dict[str, float]


def get_portfolio() -> PortfolioEngine:
    pe = STATE["portfolio"]
    if pe is None:
        raise HTTPException(status_code=400, detail="Portfolio non initialisé. Appelez POST /init.")
    return pe


def portfolio_to_dict(pe: PortfolioEngine, prices: Dict[str, float]) -> Dict:
    snap = pe.snapshot(prices)
    m = pe.metrics()
    return {
        "ts": snap.ts.isoformat(),
        "cash": snap.cash,
        "nav": snap.nav,
        "unrealized_pnl": snap.unrealized_pnl,
        "realized_pnl": snap.realized_pnl,
        "positions": {k: asdict(v) for k, v in snap.positions.items() if v.qty > 0},
        "metrics": m,
        "prices": prices,
    }


def build_ctx(pe: PortfolioEngine, symbol: str, last_price: float) -> PortfolioContext:
    prices = market.get_prices(list(pe.positions.keys()) + [symbol])
    prices[symbol] = last_price

    total_equity = pe.nav(prices)
    pos = pe.positions.get(symbol)
    qty = float(pos.qty) if pos else 0.0
    pos_value = qty * last_price
    current_weight = (pos_value / total_equity) if total_equity > 0 else 0.0

    return PortfolioContext(
        cash=pe.cash,
        total_equity=total_equity,
        position_qty=qty,
        position_value=pos_value,
        current_weight=current_weight,
        last_price=last_price,
    )


@app.post("/init")
def init(req: InitRequest):
    STATE["profile"] = req.profile
    STATE["portfolio"] = PortfolioEngine(initial_cash=req.initial_cash)
    return {"ok": True, "profile": STATE["profile"], "initial_cash": req.initial_cash}


@app.post("/set_prices")
def set_prices(req: SetPricesRequest):
    for sym, px in req.prices.items():
        if px <= 0:
            raise HTTPException(status_code=400, detail=f"Prix invalide pour {sym}")
        market.set_price(sym, px)
    return {"ok": True, "count": len(req.prices)}


@app.get("/portfolio")
def portfolio():
    pe = get_portfolio()
    symbols = list(pe.positions.keys())
    prices = market.get_prices(symbols) if symbols else {}
    return portfolio_to_dict(pe, prices)


@app.post("/trade")
def trade(req: TradeRequest):
    pe = get_portfolio()

    price = req.price
    if price is None:
        price = market.get_last_price(req.symbol)

    try:
        tr = pe.apply_trade(
            symbol=req.symbol,
            side=req.side,
            qty=req.qty,
            price=price,
            ts=datetime.utcnow(),
            fees=req.fees,
            reason_codes=req.reason_codes,
        )
    except PortfolioError as e:
        raise HTTPException(status_code=400, detail=str(e))

    symbols = list({*pe.positions.keys(), req.symbol})
    prices = market.get_prices(symbols)
    pe.mark_to_market(prices)

    return {"ok": True, "trade": asdict(tr)}


@app.post("/recommendations", response_model=List[RecommendationOut])
def recommendations(req: RecommendationsRequest):
    pe = get_portfolio()
    as_of = req.as_of or date.today()
    profile = STATE["profile"]

    outs: List[RecommendationOut] = []

    for sym in req.symbols:
        last_price = market.get_last_price(sym)

        f = forecast_provider.get(sym, as_of)
        s = sentiment_provider.get(sym, as_of)
        a = anomaly_provider.get_recent(sym, as_of)

        agg = aggregator.aggregate_one(
            symbol=sym,
            as_of=as_of,
            forecast=f,
            sentiment=s,
            anomalies=a,
            last_price=last_price,
        )

        ctx = build_ctx(pe, sym, last_price)

        dec = decider.decide_one(agg, profile, ctx)

        outs.append(RecommendationOut(
            symbol=dec.symbol,
            action=dec.action,
            confidence=dec.confidence,
            target_weight=dec.target_weight,
            order_value=dec.order_value,
            order_qty=dec.order_qty,
            reason_codes=dec.reason_codes,
        ))

    return outs


@app.get("/explain/{symbol}", response_model=ExplainOut)
def explain(symbol: str, lang: str = "fr"):
    pe = get_portfolio()
    as_of = date.today()
    profile = STATE["profile"]

    last_price = market.get_last_price(symbol)

    f = forecast_provider.get(symbol, as_of)
    s = sentiment_provider.get(symbol, as_of)
    a = anomaly_provider.get_recent(symbol, as_of)

    agg = aggregator.aggregate_one(
        symbol=symbol,
        as_of=as_of,
        forecast=f,
        sentiment=s,
        anomalies=a,
        last_price=last_price,
    )

    ctx = build_ctx(pe, symbol, last_price)
    dec: Decision = decider.decide_one(agg, profile, ctx)

    exp = explainer.explain(dec, agg, profile_name=profile, lang=("ar" if lang == "ar" else "fr"))

    return ExplainOut(
        headline=exp.headline,
        summary=exp.summary,
        bullets=exp.bullets,
        risks=exp.risks,
        next_steps=exp.next_steps,
        debug=exp.debug,
    )
