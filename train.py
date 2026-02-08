import pandas as pd
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from src.feature_engineering import BVMTFeatureEngineer
from src.hybrid_model import EliteForecaster
import os
import time
from colorama import Fore, Back, Style, init
from tqdm import tqdm

# --- INITIALISATION SYSTÈME ---
init(autoreset=True)

def print_system(msg):
    print(f"{Fore.CYAN}[SYSTEM] {Style.BRIGHT}{msg}")

def print_success(msg):
    print(f"{Fore.GREEN}[SUCCESS] {Style.BRIGHT}{msg}")

def print_warning(msg):
    print(f"{Fore.YELLOW}[WARNING] {Style.BRIGHT}{msg}")

def print_alert(msg):
    print(f"{Fore.RED}[ALERT] {Style.BRIGHT}{msg}")

def loading_bar(desc, duration):
    # Barre de chargement
    for _ in tqdm(range(100), desc=f"{Fore.GREEN}{desc}", bar_format='{l_bar}{bar}| {n_fmt}/{total_fmt}', leave=False):
        time.sleep(duration / 100)

print(f"{Fore.GREEN}")
print(r"""
  _    _    ___    ____   _  __  ___   _____   _   _ 
 | |  | |  / _ \  / ___| | |/ / |_ _| |_   _| | \ | |
 | |__| | | |_| || |     | ' /   | |    | |   |  \| |
 |  __  | |  _  || |___  | . \   | |    | |   | |\  |
 |_|  |_| |_| |_| \____| |_|\_\ |___|   |_|   |_| \_|
                                                     
 >> OPERATION: GHOST PROTOCOL - FINAL
 >> TARGET: TUNIS STOCK EXCHANGE (BVMT)
""")
print(f"{Style.RESET_ALL}")

# --- 1. CONFIGURATION ---
FILENAME = 'histo_cotation_2022.csv' 
FILE_PATH = os.path.join('data', FILENAME)
TOP_N = 3  # Analyse des 3 plus grosses actions

print_system(f"Interception du flux de données : {FILE_PATH}")

try:
    # Lecture intelligente
    try:
        raw_df = pd.read_csv(FILE_PATH, sep=';', encoding='latin-1')
    except:
        raw_df = pd.read_csv(FILE_PATH, sep=',', encoding='utf-8')

    raw_df.columns = raw_df.columns.str.strip()
    
    mapping = {
        'SEANCE': 'Date', 'OUVERTURE': 'Open', 'CLOTURE': 'Close',
        'PLUS_BAS': 'Low', 'PLUS_HAUT': 'High', 'QUANTITE_NEGOCIEE': 'Volume',
        'VALEUR': 'Ticker'
    }
    raw_df = raw_df.rename(columns=mapping)

    def clean_number(x):
        if isinstance(x, str):
            x = x.replace(',', '.').replace('\xa0', '').replace(' ', '')
        return float(x)

    cols = ['Open', 'Close', 'Low', 'High', 'Volume']
    for col in cols:
        if col in raw_df.columns:
            raw_df[col] = raw_df[col].apply(clean_number)

    raw_df['Date'] = pd.to_datetime(raw_df['Date'], dayfirst=True, errors='coerce')
    
    # Identification des cibles
    top_stocks = raw_df['Ticker'].value_counts().head(TOP_N).index.tolist()
    print_success(f"Cibles Prioritaires Verrouillées : {top_stocks}")

except Exception as e:
    print_alert(f"ECHEC MISSION : {e}")
    exit()

# --- 2. TRAITEMENT & ENTRAÎNEMENT (BOUCLE) ---
if not os.path.exists("models"): os.makedirs("models")
engineer = BVMTFeatureEngineer()

for ticker in top_stocks:
    print("\n" + "="*60)
    print(f"{Back.WHITE}{Fore.BLACK} >>> CIBLE ACTIVE : {ticker} <<< {Style.RESET_ALL}")
    
    # Isolation
    df_stock = raw_df[raw_df['Ticker'] == ticker].copy()
    df_stock = df_stock.sort_values('Date').dropna()
    
    if len(df_stock) < 50:
        print_warning(f"Données insuffisantes pour {ticker}, ignoré.")
        continue

    # Feature Engineering
    loading_bar(f"Déchiffrement {ticker}", 0.2)
    processed_df = engineer.process(df_stock)
    
    # Entraînement
    forecaster = EliteForecaster()
    loading_bar(f"Optimisation Neuronale", 0.5)
    forecaster.train(processed_df, ticker_name=ticker)
    
    # Sauvegarde
    safe_ticker = ticker.replace(" ", "_").replace("*", "")
    save_path = f"models/model_{safe_ticker}.pkl"
    forecaster.save(save_path)

    # --- 3. PRÉDICTIONS & AFFICHAGE TERMINAL ---
    predictions, metrics = forecaster.predict_future(5)

    print(f"\n{Fore.YELLOW}📊 RAPPORT TACTIQUE J+5 :{Style.RESET_ALL}")
    print(f"{'DATE':<12} | {'PRIX CIBLE':<12} | {'INTERVALLE (95%)':<22} | {'LIQUIDITÉ'}")
    print("-" * 75)

    for p in predictions:
        # Couleur dynamique selon la liquidité
        liq_color = Fore.GREEN if p['liquidity_proba'] > 50 else Fore.RED
        print(f"{Fore.CYAN}{p['date']:<12}{Style.RESET_ALL} | {Style.BRIGHT}{p['predicted_price']:.3f} DT{Style.RESET_ALL}   | [{p['conf_low']:.2f} - {p['conf_high']:.2f}]      | {liq_color}{p['liquidity_proba']}%{Style.RESET_ALL}")

    print(f"\n{Fore.BLUE}>> PRÉCISION DIRECTIONNELLE : {metrics['Directional_Accuracy']}%")
    print(f"{Fore.BLUE}>> ERREUR MOYENNE (RMSE)   : {metrics['RMSE']}")

    # --- 4. GÉNÉRATION DASHBOARD HTML ---
    print_system(f"Génération graphique tactique...")
    
    # Création Graphique
    fig = make_subplots(rows=2, cols=1, shared_xaxes=True, 
                        vertical_spacing=0.05, row_heights=[0.7, 0.3],
                        subplot_titles=(f'PRIX : {ticker}', 'VOLUME'))

    last_60 = df_stock.iloc[-60:]
    
    # Bougies
    fig.add_trace(go.Candlestick(x=last_60['Date'],
                    open=last_60['Open'], high=last_60['High'],
                    low=last_60['Low'], close=last_60['Close'],
                    name='Historique'), row=1, col=1)

    # Prévisions
    dates_pred = [p['date'] for p in predictions]
    prices_pred = [p['predicted_price'] for p in predictions]
    upper = [p['conf_high'] for p in predictions]
    lower = [p['conf_low'] for p in predictions]
    
    # Zone de confiance
    fig.add_trace(go.Scatter(
        x=dates_pred + dates_pred[::-1],
        y=upper + lower[::-1],
        fill='toself',
        fillcolor='rgba(0, 255, 255, 0.1)',
        line=dict(color='rgba(255,255,255,0)'),
        showlegend=False, name='Confiance'
    ), row=1, col=1)

    # Ligne Prévision
    fig.add_trace(go.Scatter(x=dates_pred, y=prices_pred, mode='lines+markers',
                             line=dict(color='#00ff00', width=2, dash='dot'),
                             name='Prévision IA'), row=1, col=1)

    # Volume
    colors = ['red' if row['Open'] - row['Close'] > 0 else 'green' for index, row in last_60.iterrows()]
    fig.add_trace(go.Bar(x=last_60['Date'], y=last_60['Volume'], marker_color=colors, name='Volume'), row=2, col=1)

    fig.update_layout(template='plotly_dark', title_text=f"🚀 WOLF PREDICTOR: {ticker}",
                      xaxis_rangeslider_visible=False, height=700)
    
    html_name = f"dashboard_{safe_ticker}.html" 
    fig.write_html(html_name)
    print_success(f"Dashboard prêt : {html_name}")

print("\n")
print(f"{Back.GREEN}{Fore.BLACK} MISSION COMPLETE. {Style.RESET_ALL}")