import pandas as pd
import time
import os
import random
import glob
from colorama import Fore, Style, init, Back
from src.hybrid_model import EliteForecaster

init(autoreset=True)

print(f"{Fore.GREEN}")
print(r"""
  _      ___ __      __  ___ 
 | |    |_ _| \    / / | __|
 | |__   | | \ \  / /  | _| 
 |____| |___| \_\/_/   |___|
 >> REAL-TIME DATA STREAM SIMULATION
""")
print(f"{Style.RESET_ALL}")

# --- 1. DÉTECTION AUTOMATIQUE DU MODÈLE ---
# On cherche n'importe quel fichier .pkl dans le dossier models
list_models = glob.glob("models/model_*.pkl")

if not list_models:
    print(f"{Fore.RED}[ERREUR] Aucun modèle trouvé ! Lancez d'abord 'python train.py'.")
    exit()

# On prend le premier modèle trouvé (ex: models/model_SFBT.pkl)
MODEL_PATH = list_models[0]
# On extrait le nom de l'action du nom de fichier
TICKER = MODEL_PATH.split("model_")[1].split(".pkl")[0].replace("_", " ")

print(f"{Fore.CYAN}[SYSTEM] Modèle détecté : {TICKER} (Fichier: {MODEL_PATH})")

# --- 2. CHARGEMENT DES DONNÉES ---
print(f"{Fore.CYAN}[SYSTEM] Connexion au flux BVMT pour {TICKER}...")

try:
    filename = 'histo_cotation_2022.csv'
    # Lecture flexible (virgule ou point-virgule)
    try:
        df = pd.read_csv(os.path.join('data', filename), sep=';', encoding='latin-1')
    except:
        df = pd.read_csv(os.path.join('data', filename), sep=',', encoding='utf-8')
        
    df.columns = df.columns.str.strip()
    
    # Mapping des colonnes pour être sûr
    mapping = {
        'SEANCE': 'Date', 'OUVERTURE': 'Open', 'CLOTURE': 'Close',
        'PLUS_BAS': 'Low', 'PLUS_HAUT': 'High', 'QUANTITE_NEGOCIEE': 'Volume',
        'VALEUR': 'Ticker'
    }
    df = df.rename(columns=mapping)
    
    # Nettoyage
    def clean_num(x):
        if isinstance(x, str): return float(x.replace(',', '.').replace('\xa0',''))
        return float(x)

    df['Close'] = df['Close'].apply(clean_num)
    df['Volume'] = df['Volume'].apply(clean_num)
    df['Date'] = pd.to_datetime(df['Date'], dayfirst=True, errors='coerce')
    
    # Isolation de l'action
    df_stock = df[df['Ticker'] == TICKER].sort_values('Date').dropna()
    
    if df_stock.empty:
        print(f"{Fore.RED}[ERREUR] Le modèle existe pour {TICKER}, mais pas de données dans le CSV !")
        exit()

    # ON COUPE LES DONNÉES
    history = df_stock.iloc[:-10].copy()
    incoming_stream = df_stock.iloc[-10:].copy()
    
    print(f"{Fore.GREEN}[SUCCESS] Flux établi. {len(incoming_stream)} transactions en attente...{Style.RESET_ALL}\n")

except Exception as e:
    print(f"{Fore.RED}[ERROR] Chargement données : {e}")
    exit()

# --- 3. BOUCLE DE SIMULATION ---
try:
    model = EliteForecaster.load(MODEL_PATH)
except Exception as e:
    print(f"{Fore.RED}[CRASH] Impossible de charger le cerveau : {e}")
    print(f"{Fore.YELLOW}>> Conseil : Supprimez le dossier 'models' et relancez 'python train.py'")
    exit()

print(f"{Back.WHITE}{Fore.BLACK} >>> DÉBUT DU STREAMING TEMPS RÉEL <<< {Style.RESET_ALL}\n")

for index, row in incoming_stream.iterrows():
    time.sleep(2) # Pause dramatique
    
    date_str = row['Date'].strftime('%Y-%m-%d')
    price = row['Close']
    vol = row['Volume']
    
    print(f"{Fore.YELLOW}>>> [TICK] {date_str} | {TICKER} : {price:.3f} DT | Vol: {int(vol)}")
    
    # Détection de mouvement
    last_price = history.iloc[-1]['Close']
    variation = (price - last_price) / last_price
    
    if abs(variation) > 0.005: # Sensibilité 0.5%
        print(f"{Fore.MAGENTA}    ⚡ [ALERTE MARKET] Volatilité détectée : {variation*100:.2f}%")
        print(f"{Fore.CYAN}    🤖 [IA] Recalcul des trajectoires J+5...")
        
        # Simulation de prédiction rapide
        time.sleep(0.5)
        preds, _ = model.predict_future(1)
        target = preds[0]['predicted_price']
        
        direction = "HAUSSIER 🟢" if target > price else "BAISSIER 🔴"
        print(f"{Fore.WHITE}    🎯 [PRED] Nouvelle Cible : {target:.3f} DT | Tendance : {direction}")
    
    else:
        print(f"{Fore.BLACK}{Back.GREEN}    [OK] Marché Stable. {Style.RESET_ALL}")

    # Ajout à l'historique
    history = pd.concat([history, row.to_frame().T])

print(f"\n{Fore.GREEN}>> CLÔTURE DE SÉANCE. <<")