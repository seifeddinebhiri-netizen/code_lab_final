import feedparser
import google.generativeai as genai
import json
import os
import time
import urllib.parse
from datetime import datetime

# --- CONFIGURATION ---
API_KEY = os.getenv("GEMINI_API_KEY") or "AIzaSyCm9tKB61-DgSxeCZW7p5DHVqZXrIjLttU"
genai.configure(api_key=API_KEY)

# Fichier de base de données
DB_FILE = "market_news_cache.json"

class MarketWatchdog:
    def __init__(self):
        # Flux RSS GÉNÉRAL sur l'économie et la bourse en Tunisie
        self.rss_url = "https://news.google.com/rss/search?q=Bourse+Tunisie+Economie&hl=fr&gl=TN&ceid=TN:fr"

    def fetch_latest_market_news(self):
        print(f"🌍 Scan global du marché (Google News)...")
        feed = feedparser.parse(self.rss_url)
        
        news_items = []
        # On prend les 10 derniers articles du marché global
        for entry in feed.entries[:10]:
            news_items.append({
                "title": entry.title,
                "link": entry.link,
                "pubDate": entry.published,
                "source": entry.source.title if 'source' in entry else "Source Inconnue"
            })
        return news_items

    def detect_and_analyze(self, news_items):
        if not news_items:
            return {}

        news_text = json.dumps(news_items, ensure_ascii=False)
        
        # PROMPT AVANCÉ : Extraction d'Entités + Analyse Sentiment
        prompt = f"""
        Tu es un système de surveillance algorithmique pour la Bourse de Tunis (BVMT).
        Voici les dernières actualités brutes du marché :
        {news_text}

        Ta mission (CRITIQUE) :
        1. **Détection** : Identifie quelles entreprises cotées sont mentionnées dans ces titres. (Ex: "SFBT", "BIAT", "Carthage Cement", "Eurocycles").
        2. **Filtrage** : Si un article parle de l'économie générale (ex: "Inflation en hausse") sans citer d'entreprise précise, IGNORE-LE.
        3. **Analyse** : Pour chaque entreprise détectée, donne le sentiment et l'impact.

        Renvoie un JSON structuré où la CLÉ est le Ticker (Symbole Boursier) :
        {{
            "SFBT": {{
                "detected_in": "Titre de l'article",
                "sentiment_score": 0.8,
                "summary": "Résumé de l'info",
                "impact": "HIGH",
                "timestamp": "{datetime.now().isoformat()}"
            }},
            "BIAT": {{ ... }}
        }}
        
        Si aucune entreprise spécifique n'est citée, renvoie un JSON vide {{}}.
        """

        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)
            clean_json = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_json)
        except Exception as e:
            print(f"❌ Erreur Gemini : {e}")
            return {}

    def update_database(self, new_data):
        # 1. Charger l'ancienne base de données
        if os.path.exists(DB_FILE):
            with open(DB_FILE, "r", encoding='utf-8') as f:
                try:
                    db = json.load(f)
                except:
                    db = {}
        else:
            db = {}

        # 2. Mettre à jour (Merge)
        count = 0
        for ticker, data in new_data.items():
            # On met à jour l'entrée de l'entreprise
            # Note: Dans un vrai système, on ajouterait à une liste d'historique.
            # Ici, on écrase pour avoir la "Dernière Info Fraîche".
            
            # On garde le format compatible avec ton API
            db[ticker] = {
                "ticker": ticker,
                "global_sentiment_score": data['sentiment_score'],
                "market_consensus": "BUY" if data['sentiment_score'] > 0.3 else ("SELL" if data['sentiment_score'] < -0.3 else "HOLD"),
                "summary": data['summary'],
                "last_updated": datetime.now().strftime('%Y-%m-%d %H:%M'),
                "news_analysis": [{
                    "title": data['detected_in'],
                    "sentiment": data['sentiment_score'],
                    "source": "Market Watchdog"
                }]
            }
            count += 1
            print(f"   ✅ MISE À JOUR : {ticker} (Sentiment: {data['sentiment_score']})")

        # 3. Sauvegarder
        with open(DB_FILE, "w", encoding='utf-8') as f:
            json.dump(db, f, indent=2, ensure_ascii=False)
        
        if count == 0:
            print("   💤 Aucune entreprise spécifique détectée dans ce cycle.")
        else:
            print(f"   💾 Base de données mise à jour avec {count} entreprises.")

# --- LA BOUCLE INFINIE (Le Cœur du Système) ---
if __name__ == "__main__":
    watchdog = MarketWatchdog()
    
    print("🛰️  SYSTEME DE SURVEILLANCE ACTIVÉ (Ctrl+C pour arrêter)")
    
    while True:
        print("\n" + "-"*50)
        print(f"⏰ Cycle de scan : {datetime.now().strftime('%H:%M:%S')}")
        
        # 1. Récupérer les news globales
        news = watchdog.fetch_latest_market_news()
        
        # 2. Laisser l'IA trier et extraire les entreprises
        extracted_data = watchdog.detect_and_analyze(news)
        
        # 3. Mettre à jour le fichier JSON
        watchdog.update_database(extracted_data)
        
        # 4. Attendre 30 minutes (1800 secondes)
        # Pour le test, mets 60 secondes !
        wait_time = 60 
        print(f"⏳ Pause de {wait_time} secondes...")
        time.sleep(wait_time)