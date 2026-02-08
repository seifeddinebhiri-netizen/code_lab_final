import feedparser
import google.generativeai as genai
import json
import os
import time
import random
from datetime import datetime

# --- CONFIGURATION ---
API_KEY = os.getenv("GEMINI_API_KEY") or "AIzaSyCm9tKB61-DgSxeCZW7p5DHVqZXrIjLttU"
genai.configure(api_key=API_KEY)

DB_FILE = "market_news_cache.json"
HISTORY_FILE = "processed_urls.txt"

# ACTIVE CECI POUR LA DÉMO ! 
# Si True : Si aucune vraie news n'est trouvée, on en invente une pour le show.
DEMO_MODE = True 

class MarketWatchdog:
    def __init__(self):
        # On élargit la recherche pour avoir plus de chance de trouver des trucs
        self.rss_url = "https://news.google.com/rss/search?q=Tunisie+Bourse+Economie+Entreprise&hl=fr&gl=TN&ceid=TN:fr"
        self.seen_urls = self.load_history()

    def load_history(self):
        """Charge la liste des articles déjà lus pour ne pas les répéter."""
        if not os.path.exists(HISTORY_FILE):
            return set()
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return set(line.strip() for line in f)

    def save_history(self, new_url):
        """Ajoute une URL à l'historique."""
        with open(HISTORY_FILE, "a", encoding="utf-8") as f:
            f.write(new_url + "\n")
        self.seen_urls.add(new_url)

    def fetch_latest_market_news(self):
        print(f"🌍 Scan du flux RSS Google News...")
        feed = feedparser.parse(self.rss_url)
        
        new_items = []
        for entry in feed.entries:
            # DÉTECTION DE DOUBLON : C'est ici que la magie opère
            if entry.link in self.seen_urls:
                continue # On saute cet article, on le connait déjà !
            
            new_items.append({
                "title": entry.title,
                "link": entry.link,
                "pubDate": entry.published,
                "source": entry.source.title if 'source' in entry else "Source Inconnue"
            })
            
            # On marque comme vu tout de suite pour éviter les problèmes
            self.save_history(entry.link)

        return new_items

    def generate_demo_event(self):
        """Génère une fausse news réaliste pour que la démo ne soit jamais vide."""
        events = [
            ("SAH", "SAH Lilas annonce l'acquisition d'un concurrent au Maroc", 0.9, "HIGH"),
            ("BIAT", "Rumeurs de fusion entre la BIAT et une banque égyptienne", 0.6, "MEDIUM"),
            ("SFBT", "Grève inattendue dans l'usine principale de la SFBT", -0.7, "HIGH"),
            ("TUNINDEX", "Le marché chute de 2% suite aux annonces de la BCT", -0.5, "HIGH")
        ]
        ticker, title, sentiment, impact = random.choice(events)
        
        return {
            ticker: {
                "detected_in": f"[DEMO] {title}",
                "sentiment_score": sentiment,
                "summary": "Ceci est un événement simulé pour la démonstration.",
                "impact": impact,
                "timestamp": datetime.now().isoformat()
            }
        }

    def analyze_with_gemini(self, news_items):
        if not news_items:
            return {}

        news_text = json.dumps(news_items, ensure_ascii=False)
        print(f"🧠 Analyse de {len(news_items)} nouveaux articles avec Gemini...")

        prompt = f"""
        Tu es un analyste financier expert. Analyse ces NOUVELLES ACTUALITÉS :
        {news_text}

        Ta mission :
        1. Repère les entreprises tunisiennes (ex: SFBT, BIAT) OU "TUNINDEX" si c'est général.
        2. Extrais le sentiment (-1 à 1).
        
        Renvoie un JSON (clé = Ticker) :
        {{
            "SFBT": {{
                "detected_in": "Titre",
                "sentiment_score": 0.8,
                "summary": "Résumé",
                "impact": "HIGH/MEDIUM/LOW"
            }}
        }}
        Si rien de pertinent, renvoie {{}}.
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
        if not new_data:
            return

        # Charger la DB existante
        if os.path.exists(DB_FILE):
            with open(DB_FILE, "r", encoding='utf-8') as f:
                try:
                    db = json.load(f)
                except:
                    db = {}
        else:
            db = {}

        # Mise à jour
        for ticker, data in new_data.items():
            db[ticker] = {
                "ticker": ticker,
                "global_sentiment_score": data['sentiment_score'],
                "market_consensus": "BUY" if data['sentiment_score'] > 0 else "SELL",
                "summary": data['summary'],
                "last_updated": datetime.now().strftime('%Y-%m-%d %H:%M'),
                "news_analysis": [{
                    "title": data['detected_in'],
                    "sentiment": data['sentiment_score'],
                    "predicted_impact": data.get('impact', 'LOW')
                }]
            }
            print(f"   ✅ NEWS FRAÎCHE AJOUTÉE : {ticker}")

        # Sauvegarder
        with open(DB_FILE, "w", encoding='utf-8') as f:
            json.dump(db, f, indent=2, ensure_ascii=False)


# --- BOUCLE PRINCIPALE ---
if __name__ == "__main__":
    watchdog = MarketWatchdog()
    print("🛰️  WATCHDOG V2 ACTIVÉ (Avec Mémoire + Mode Démo)")
    
    while True:
        print("\n" + "-"*50)
        
        # 1. Chercher des VRAIES news (qu'on n'a pas encore vues)
        new_articles = watchdog.fetch_latest_market_news()
        
        if new_articles:
            # On a trouvé du vrai contenu !
            analyzed_data = watchdog.analyze_with_gemini(new_articles)
            watchdog.update_database(analyzed_data)
        else:
            print("💤 Aucune nouvelle 'fraîche' trouvée sur Google News.")
            
            # 2. FILET DE SÉCURITÉ (DEMO MODE)
            if DEMO_MODE:
                print("⚠️  DEMO MODE : Injection d'un événement simulé...")
                fake_data = watchdog.generate_demo_event()
                watchdog.update_database(fake_data)

        print("⏳ Pause de 30 secondes...")
        time.sleep(30)