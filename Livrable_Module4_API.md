# Livrable — Module 4 : Agent de Décision & Gestion de Portefeuille (MVP)

Ce document décrit **les méthodes** et **les étapes** utilisées pour construire l’API du **Module 4** (gestion de portefeuille + recommandations + explicabilité), conforme au cahier des charges.

---

## 1) Objectif du Module 4

Le Module 4 joue le rôle d’**orchestrateur décisionnel** :
- maintient un **portefeuille virtuel** (cash, positions, historique),
- simule l’impact des décisions (buy/sell/hold),
- calcule des métriques (ROI, Sharpe Ratio, Max Drawdown),
- génère des **recommandations concrètes** (ACHETER / VENDRE / CONSERVER),
- fournit une **explication en langage naturel** (Explainability).

> Le module est conçu pour rester **indépendant** des autres modules : il consomme des signaux (forecast/sentiment/anomalies) via des providers. Dans ce MVP, ces providers sont **mockés**.

---

## 2) Architecture (résumé)

Le pipeline décisionnel suit la chaîne suivante :

1. **PortfolioEngine** (état + simulation + métriques)  
2. **SignalAggregator** (fusion des signaux → score + confiance + reason codes)  
3. **DecisionEngine** (règles → BUY/SELL/HOLD + sizing + contraintes de risque)  
4. **ExplainabilityEngine** (reason codes + features → texte explicatif)  
5. **API FastAPI** (endpoints pour piloter le portefeuille et exposer l’agent)

---

## 3) Étapes réalisées (1 → 5)

### Étape 1 — PortfolioEngine (Simulation + métriques)
**Méthode :**
- Modélisation du portefeuille : `cash`, `positions`, `trade_log`, `nav_history`.
- Trades virtuels : `apply_trade(BUY/SELL)`.
- Valorisation : `nav = cash + market_value`.
- PnL :
  - *réalisé* lors des ventes (différence prix - coût moyen),
  - *latent* sur positions ouvertes.
- Métriques :
  - **ROI** = (NAV_final - NAV_initial) / NAV_initial
  - **Sharpe Ratio** (sur rendements de NAV, rf=0 pour MVP)
  - **Max Drawdown** (pire chute depuis un pic de NAV)

**Pourquoi :**
- Cette brique est totalement indépendante des autres modules → permet de tester et valider le cœur du système très tôt.

---

### Étape 2 — SignalAggregator (Fusion intelligente)
**Méthode :**
- Entrées : signaux *Forecast*, *Sentiment*, *Anomalies* (et prix last via MarketData).
- Sorties par actif :
  - `action_score ∈ [-1,+1]` : directionnel (achat/vente)
  - `confidence ∈ [0,1]` : confiance globale
  - `reason_codes[]` : explications structurées (ex: `FORECAST_UP`, `SENTIMENT_POS`, `ANOMALY_SEVERE`)
  - `features{}` : données numériques utiles (volatilité, severity, expected_return…)

**Pourquoi :**
- Standardise les informations hétérogènes et prépare un format exploitable par le moteur de décision et l’explication.

---

### Étape 3 — DecisionEngine (Rule-based MVP)
**Méthode :**
- Règles *if/else* “défendables” :
  - BUY si score >= seuil + confiance suffisante
  - SELL si score <= seuil négatif + position existante
  - HOLD sinon
- Gestion du **profil de risque** (conservateur / modéré / agressif) :
  - seuils de décision,
  - limites de poids par actif,
  - exposition totale max (garder du cash),
  - sizing (taille de position) ajusté par confiance/score,
  - pénalités sizing si volatilité/anomalies élevées.

**Pourquoi :**
- Fournit un MVP robuste, explicable, et aligné “buy/sell/hold”.
- Peut être remplacé plus tard par du RL (optionnel) sans casser l’API.

---

### Étape 4 — ExplainabilityEngine (Explication en langage naturel)
**Méthode :**
- Entrées : `Decision` + `AggregatedSignal` + profil risque.
- Génère une structure :
  - `headline` (ex: “ACHETER SFBT (Confiance 0.70)”)
  - `summary` (2 lignes)
  - `bullets` (preuves : forecast, sentiment, anomalies, volatilité, sizing)
  - `risks` (risques adaptés au profil)
  - `next_steps` (actions suivantes)

**Pourquoi :**
- Répond à l’exigence “Explainability” : justification claire et traçable via `reason_codes`.

---

### Étape 5 — API FastAPI (Agent utilisable)
**Méthode :**
- Exposition de l’agent sous forme d’API REST (Swagger automatique).
- État MVP en mémoire :
  - `POST /init` : initialise profil + cash
  - `POST /set_prices` : injecte les prix (MarketData mock)
  - `POST /trade` : exécute un trade virtuel (BUY/SELL)
  - `GET /portfolio` : snapshot + métriques
  - `POST /recommendations` : recommandations sur une liste de symbols
  - `GET /explain/{symbol}` : explication “bouton expliquer”

**Pourquoi :**
- Rend le module testable via Postman/Swagger et intégrable dans un front.

---

## 4) Comment exécuter l’API

### 4.1 Installer
```bash
pip install -r requirements.txt
```

### 4.2 Lancer
```bash
python run_module4_api.py
```

### 4.3 Tester
- Swagger : `http://localhost:8000/docs`
- Scénario rapide :
  1) `POST /init`
  2) `POST /set_prices`
  3) `POST /recommendations`
  4) `POST /trade` (optionnel)
  5) `GET /portfolio`
  6) `GET /explain/{symbol}`

---

## 5) Tests (recommandé)
Chaque étape a un test minimal :
- Step1 : simulation + métriques
- Step2 : agrégation (avec et sans anomalies)
- Step3 : décision BUY/SELL/HOLD
- Step4 : génération d’explication

---

## 6) Limites du MVP (assumées)
- Données des autres modules non branchées (providers mock).
- État conservé en mémoire (pas de DB/auth).
- Sharpe “daily” et sans taux sans risque (rf=0) pour simplifier le MVP.

---

## 7) Évolutions futures possibles (post-MVP)
- Remplacement des mocks par providers API (intégration équipe).
- Persistance (SQLite/Redis) + multi-utilisateurs + auth.
- RLPolicy : apprentissage offline sur historique + exécution online.
