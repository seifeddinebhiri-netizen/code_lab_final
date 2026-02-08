from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
from src.hybrid_model import EliteForecaster
from colorama import Fore, init

init(autoreset=True)

app = FastAPI(
    title="🐺 WOLF MARKET API",
    description="Module 1: Prévision Multi-Actifs",
    version="2.0.0"
)

# --- MODÈLE DE REQUÊTE ---
class PredictionRequest(BaseModel):
    ticker: str = "SFBT"  # Valeur par défaut
    days: int = 5

@app.get("/")
def home():
    # Liste les modèles disponibles
    models = [f.replace("model_", "").replace(".pkl", "") for f in os.listdir("models") if f.endswith(".pkl")]
    return {
        "status": "ONLINE", 
        "available_tickers": models,
        "message": "Utilisez /predict avec un ticker spécifique."
    }

@app.post("/predict")
def predict(request: PredictionRequest):
    """
    Charge dynamiquement le modèle pour l'action demandée.
    """
    # Nettoyage du nom pour trouver le fichier
    safe_ticker = request.ticker.replace(" ", "_").replace("*", "")
    model_path = f"models/model_{safe_ticker}.pkl"
    
    print(f"{Fore.CYAN}[API] Requête reçue pour : {request.ticker} ({request.days} jours)")

    if not os.path.exists(model_path):
        # Fallback : Si on ne trouve pas le modèle exact, on liste ce qu'on a
        available = [f.replace("model_", "").replace(".pkl", "") for f in os.listdir("models") if f.endswith(".pkl")]
        raise HTTPException(status_code=404, detail=f"Modèle non trouvé pour '{request.ticker}'. Disponibles : {available}")

    try:
        # Chargement à la volée (Lazy Loading)
        model = EliteForecaster.load(model_path)
        
        predictions, metrics = model.predict_future(request.days)
        
        return {
            "target": request.ticker,
            "metrics": metrics,
            "forecast": predictions
        }
    except Exception as e:
        print(f"{Fore.RED}[ERROR] {e}")
        raise HTTPException(status_code=500, detail=str(e))
    



//Temps réel
# ... (imports existants)
from src.feature_engineering import BVMTFeatureEngineer # Assure-toi d'importer ça

# Ajouter cet endpoint dans api.py
@app.post("/update_data")
def update_market_data(ticker: str, close_price: float, volume: float):
    """
    SIMULATION TEMPS RÉEL : Reçoit un nouveau prix et met à jour le modèle.
    """
    print(f"{Fore.MAGENTA}[LIVE FEED] Nouvelle donnée reçue pour {ticker}: {close_price} DT | Vol: {volume}")
    
    # 1. On charge le modèle existant
    safe_ticker = ticker.replace(" ", "_").replace("*", "")
    model_path = f"models/model_{safe_ticker}.pkl"
    
    if not os.path.exists(model_path):
        raise HTTPException(status_code=404, detail="Modèle non trouvé")
    
    # ICI, dans un vrai système, on ajouterait la donnée au CSV et on relancerait train.py
    # Pour la démo, on simule une "réaction" immédiate :
    
    return {
        "status": "DATA_INGESTED",
        "action": "RETRAINING_SCHEDULED",
        "message": f"Le modèle {ticker} a pris en compte le prix {close_price}."
    }