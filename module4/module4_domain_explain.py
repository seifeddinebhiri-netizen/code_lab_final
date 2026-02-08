from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, List, Literal, Optional

from module4_domain_decision import Decision, get_profile
from module4_domain_signals import AggregatedSignal


Lang = Literal["fr", "ar"]


def _fmt_pct(x: float) -> str:
    return f"{x*100:.2f}%"


def _fmt_money(x: float) -> str:
    return f"{x:,.2f}"


def _clip(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


@dataclass
class Explanation:
    headline: str
    summary: str
    bullets: List[str]
    risks: List[str]
    next_steps: List[str]
    debug: Dict[str, float]


class ExplainabilityEngine:
    """
    Transforme reason_codes + features en explication claire.
    - headline: "ACHETER SFBT (Confiance 0.74)"
    - summary: 2-3 lignes
    - bullets: facteurs clés (forecast/sentiment/anomalies)
    - risks: risques/prudence selon profil
    - next_steps: actions recommandées
    """

    def explain(
        self,
        decision: Decision,
        signal: AggregatedSignal,
        profile_name: str,
        lang: Lang = "fr"
    ) -> Explanation:
        prof = get_profile(profile_name)

        score = float(signal.action_score)
        conf_sig = float(signal.confidence)
        conf_dec = float(decision.confidence)

        exp_ret = float(signal.features.get("expected_return", 0.0))
        vol = float(signal.features.get("volatility_pred", 0.0))
        sent = float(signal.features.get("sentiment_score", 0.0))
        max_sev = float(signal.features.get("anomaly_max_severity", 0.0))
        last_price = float(signal.features.get("last_price", 0.0))

        action_fr = {"BUY": "ACHETER", "SELL": "VENDRE", "HOLD": "CONSERVER"}
        action_ar = {"BUY": "شراء", "SELL": "بيع", "HOLD": "احتفاظ"}

        act = decision.action
        symbol = decision.symbol

        if lang == "ar":
            headline = f"{action_ar[act]} {symbol} (ثقة {conf_dec:.2f})"
        else:
            headline = f"{action_fr[act]} {symbol} (Confiance {conf_dec:.2f})"

        score_dir = "haussier" if score > 0 else ("baissier" if score < 0 else "neutre")
        if lang == "ar":
            summary = (
                f"الإشارة العامة {score_dir} (النتيجة {score:.2f}) مع ثقة إشارة {conf_sig:.2f}. "
                f"هذه التوصية تراعي ملف المخاطر: {prof.name}."
            )
        else:
            summary = (
                f"Signal global {score_dir} (score {score:.2f}) avec confiance {conf_sig:.2f}. "
                f"Cette recommandation respecte votre profil {prof.name}."
            )

        bullets: List[str] = []

        if "FORECAST_UP" in decision.reason_codes:
            if lang == "ar":
                bullets.append(f"توقعات إيجابية: عائد متوقع ≈ {_fmt_pct(exp_ret)}.")
            else:
                bullets.append(f"Prévision positive : rendement attendu ≈ {_fmt_pct(exp_ret)}.")
        elif "FORECAST_DOWN" in decision.reason_codes:
            if lang == "ar":
                bullets.append(f"توقعات سلبية: عائد متوقع ≈ {_fmt_pct(exp_ret)}.")
            else:
                bullets.append(f"Prévision négative : rendement attendu ≈ {_fmt_pct(exp_ret)}.")
        elif "FORECAST_MISSING" in decision.reason_codes:
            bullets.append("Prévision manquante : décision basée sur signaux disponibles." if lang == "fr"
                           else "لا توجد توقعات: القرار مبني على الإشارات المتاحة.")

        if "SENTIMENT_POS" in decision.reason_codes:
            bullets.append(f"Sentiment positif (score {sent:.2f})." if lang == "fr"
                           else f"المشاعر إيجابية (النتيجة {sent:.2f}).")
        elif "SENTIMENT_NEG" in decision.reason_codes:
            bullets.append(f"Sentiment négatif (score {sent:.2f})." if lang == "fr"
                           else f"المشاعر سلبية (النتيجة {sent:.2f}).")
        elif "SENTIMENT_MISSING" in decision.reason_codes:
            bullets.append("Sentiment manquant : prudence sur l'interprétation." if lang == "fr"
                           else "لا توجد بيانات مشاعر: الحذر مطلوب.")

        if "ANOMALY_SEVERE" in decision.reason_codes:
            bullets.append(f"Anomalie sévère détectée (sévérité {max_sev:.2f}) → taille réduite." if lang == "fr"
                           else f"تم رصد شذوذ قوي (الشدة {max_sev:.2f}) → تم تقليص الحجم.")
        elif "ANOMALY_PRESENT" in decision.reason_codes:
            bullets.append(f"Anomalie présente (sévérité max {max_sev:.2f}) → vigilance." if lang == "fr"
                           else f"يوجد شذوذ (أقصى شدة {max_sev:.2f}) → انتباه.")
        else:
            bullets.append("Aucune anomalie critique détectée." if lang == "fr"
                           else "لا توجد شذوذات حرجة.")

        if vol > 0:
            bullets.append(f"Volatilité prédite ≈ {_fmt_pct(vol)} (impact sur la confiance)." if lang == "fr"
                           else f"التقلب المتوقع ≈ {_fmt_pct(vol)} (يؤثر على الثقة).")

        if act == "BUY":
            bullets.append(
                (f"Montant proposé à l'achat ≈ {_fmt_money(decision.order_value)} TND "
                 f"(≈ {decision.order_qty:.4f} unités à {last_price:.3f}).")
                if lang == "fr"
                else
                (f"قيمة الشراء المقترحة ≈ {_fmt_money(decision.order_value)} د.ت "
                 f"(≈ {decision.order_qty:.4f} وحدة عند {last_price:.3f}).")
            )
        elif act == "SELL":
            bullets.append(
                (f"Montant proposé à la vente ≈ {_fmt_money(decision.order_value)} TND "
                 f"(≈ {decision.order_qty:.4f} unités à {last_price:.3f}).")
                if lang == "fr"
                else
                (f"قيمة البيع المقترحة ≈ {_fmt_money(decision.order_value)} د.ت "
                 f"(≈ {decision.order_qty:.4f} وحدة عند {last_price:.3f}).")
            )
        else:
            bullets.append("Aucune action immédiate : conserver et surveiller." if lang == "fr"
                           else "لا يوجد إجراء فوري: احتفاظ مع متابعة.")

        risks: List[str] = []

        if vol >= 0.03:
            risks.append("Risque de volatilité élevée : privilégier des tailles modestes." if lang == "fr"
                         else "خطر تقلب مرتفع: يُفضّل أحجاماً صغيرة.")
        if max_sev >= 0.75:
            risks.append("Anomalie sévère : risque de mouvement brusque / liquidité." if lang == "fr"
                         else "شذوذ قوي: خطر حركة مفاجئة / سيولة.")
        if prof.name == "conservative" and act == "BUY":
            risks.append("Profil conservateur : évitez la concentration, renforcez progressivement." if lang == "fr"
                         else "ملف محافظ: تجنب التركيز وزد تدريجياً.")
        if prof.name == "aggressive" and act == "SELL":
            risks.append("Profil agressif : la vente réduit l'exposition au momentum." if lang == "fr"
                         else "ملف هجومي: البيع يقلل التعرض للزخم.")

        if not risks:
            risks.append("Risques maîtrisés au regard des signaux actuels." if lang == "fr"
                         else "المخاطر تحت السيطرة وفق الإشارات الحالية.")

        next_steps: List[str] = []
        if act == "BUY":
            next_steps.append("Exécuter l'achat virtuel puis suivre la performance quotidienne." if lang == "fr"
                              else "نفّذ الشراء الافتراضي وتابع الأداء يومياً.")
            next_steps.append("Définir un seuil de sortie (stop) selon votre profil." if lang == "fr"
                              else "حدد حد الخروج (إيقاف) حسب ملف المخاطر.")
        elif act == "SELL":
            next_steps.append("Vendre virtuellement et réallouer vers des actifs plus solides." if lang == "fr"
                              else "نفّذ البيع الافتراضي وأعد التوزيع نحو أصول أقوى.")
            next_steps.append("Surveiller si les signaux s’inversent (news/forecast)." if lang == "fr"
                              else "راقب إن انعكست الإشارات (أخبار/توقعات).")
        else:
            next_steps.append("Attendre confirmation (meilleure confiance ou score plus marqué)." if lang == "fr"
                              else "انتظر تأكيداً (ثقة أعلى أو نتيجة أوضح).")
            next_steps.append("Surveiller anomalies et news avant de bouger." if lang == "fr"
                              else "تابع الشذوذات والأخبار قبل اتخاذ قرار.")

        debug = {
            "action_score": score,
            "signal_confidence": conf_sig,
            "decision_confidence": conf_dec,
            "expected_return": exp_ret,
            "volatility_pred": vol,
            "sentiment_score": sent,
            "anomaly_max_severity": max_sev,
        }

        return Explanation(
            headline=headline,
            summary=summary,
            bullets=bullets,
            risks=risks,
            next_steps=next_steps,
            debug=debug,
        )
