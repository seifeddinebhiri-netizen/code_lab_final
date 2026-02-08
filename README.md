# 📈 BourseGPT - Plateforme de Trading Intelligente & Hybride

![Python](https://img.shields.io/badge/Python-3.9%2B-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.95%2B-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)
![TensorFlow](https://img.shields.io/badge/AI-TensorFlow-FF6F00?logo=tensorflow&logoColor=white)

BourseGPT est un système de trading algorithmique hybride combinant une gestion de portefeuille traditionnelle (SQL) avec un moteur décisionnel multi-agent (IA).

---

## 🏗️ Architecture Globale

Le projet repose sur une architecture **Modular Monolith** asynchrone :

* **Backend :** API RESTful haute performance.
* **Frontend :** Single Page Application (SPA) réactive.
* **Intelligence :** Moteur multi-agents (Prédiction, Sentiment, Sécurité, Décision).
* **Données :** Stockage mixte SQL (structuré) + JSON (cache rapide).

---

## 🛠️ Stack Technique

### 🔙 Backend (Le Cerveau & API)
Le backend orchestre les interactions entre l'utilisateur, la base de données et les modules d'IA.

| Technologie | Rôle & Justification |
| :--- | :--- |
| **Python 3.9+** | Langage dominant en Data Science et IA. |
| **FastAPI** | Framework ultra-rapide, natif asynchrone (`async`/`await`) parfait pour le trading temps réel. Génération auto de Swagger UI. |
| **Uvicorn** | Serveur ASGI ultra-rapide pour propulser l'application. |
| **Pydantic** | Validation rigoureuse des données (Entrées/Sorties API) via des `BaseModel`. |
| **Modular Monolith** | Architecture unifiée mais segmentée (Router, Services, Controllers) pour une maintenance aisée. |

### 🧠 Intelligence Artificielle (La "Secret Sauce")
Le système utilise 4 modules distincts interconnectés.

#### 📊 Module 1 : Prédictions (Market Forecast)
* **Bibliothèques :** `TensorFlow` / `Keras`, `Scikit-Learn`.
* **Modèle :** Réseaux de neurones **LSTM** (Long Short-Term Memory).
* **Fonction :** Analyse des séries temporelles pour prédire les prix futurs.

#### 📰 Module 2 : Analyse de Sentiment (News)
* **Bibliothèques :** `Transformers` (Hugging Face), `BeautifulSoup4`.
* **Modèle :** **FinBERT** (BERT entraîné sur des données financières).
* **Fonction :** Web scraping et analyse NLP des actualités pour déterminer le sentiment (Positif/Négatif).

#### 🛡️ Module 3 : Sécurité & Anomalies
* **Bibliothèques :** `Scikit-Learn`, `Pandas`, `NumPy`.
* **Algorithme :** **Isolation Forest** (Non-supervisé).
* **Fonction :** Détection de manipulations de marché (Pump & Dump) et volumes anormaux.

#### ⚖️ Module 4 : Moteur de Décision
* **Logique :** Algorithmes custom en Python.
* **Fonction :** Agrégation des signaux (1, 2, 3), pondération selon le profil de risque utilisateur et génération de l'ordre final.

---

### 🗄️ Base de Données & Stockage (Hybrid Storage)

Une approche hybride pour optimiser la latence et la fiabilité.

1.  **Stockage Froid (Persistant) - MySQL 8.0**
    * Stocke les données critiques : Utilisateurs, Portefeuille réel, Historique, Capital.
    * Driver : `mysql-connector-python`.

2.  **Stockage Chaud (Cache IA) - JSON Files**
    * Fichiers : `market_news_cache.json`, `signals_module1.json`.
    * Rôle : Mémoire tampon (RAM-like) pour les signaux IA volatils. Évite de recalculer les modèles lourds à chaque requête.

---

### 🖥️ Frontend (Interface Utilisateur)

* **Framework :** **React.js** (Standard industriel pour les SPA).
* **Communication :** **Axios** (Requêtes HTTP vers FastAPI).
* **Styling :** **Tailwind CSS** (Pour un développement UI rapide et moderne).
* **Visualisation :** **Recharts.js** ou **Chart.js** (Courbes de prix et indicateurs).

---

### ⚙️ Outils & DevOps

* **Versionning :** Git & GitHub.
* **Test API :** Postman & Swagger UI (`/docs`).
* **IDE :** VS Code.

---

## 🚀 Installation Rapide

```bash
# Cloner le projet
git clone [https://github.com/votre-user/boursegpt.git](https://github.com/votre-user/boursegpt.git)

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
python main.py
