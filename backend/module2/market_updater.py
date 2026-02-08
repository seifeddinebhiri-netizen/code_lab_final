import feedparser
import google.generativeai as genai
import json
import os
import time
import urllib.parse
from datetime import datetime

# --- CONFIGURATION ---
# ⚠️ Remets ta clé API ici
API_KEY = os.getenv("GEMINI_API_KEY") or "AIzaSyCm9tKB61-DgSxeCZW7p5DHVqZXrIjLttU"
genai.configure(api_key=API_KEY)

# Liste des "Big Caps" de la Bourse de Tunis (Top 10 liquidité/capitalisation)
TOP_STOCKS = [
    "SFBT", "BIAT", "SAH", "POULINA", "SOTUVER", 
    "BT", "EUROCYCLES", "TELNET", "TPR", "ATB"
]

class RealNewsScraper:
    def __init__(self):
        self.base_url = "https://news.google.com/rss/search?q={query}&hl=fr&gl=TN&ceid=TN:fr"

    def get_live_news(self, ticker):
        # On affine la recherche pour éviter le bruit
        query = f"{ticker} Tunisie bourse économie"
        encoded_query = urllib.parse.quote(query)
        final_url = self.base_url.format(query=encoded_query)

        print(f"   🌍 Recherche news Google pour : {ticker}...")
        try:
            feed = feedparser.parse(final_url)
            news_items = []
            
            # On prend les 4 plus récents pour ne pas surcharger Gemini
            for entry in feed.entries[:4]:
                news_items.append({
                    "title": entry.title,
                    "link": entry.link,
                    "pubDate": entry.published,
                    "source": entry.source.title if 'source' in entry else "Source Inconnue"
                })
            return news_items
        except Exception as e:
            print(f"   ⚠️ Erreur RSS: {e}")
            return []

    def analyze_with_gemini(self, ticker, news_items):
        if not news_items:
            # Pas de news = Sentiment Neutre (0)
            return {
                "ticker": ticker,
                "global_sentiment_score": 0,
                "market_consensus": "NEUTRAL",
                "summary": "Aucune actualité récente significative détectée.",
                "news_count": 0
            }

        news_text = json.dumps(news_items, ensure_ascii=False)
        
        # Prompt optimisé pour la vitesse et la précision
        prompt = f"""
        Expert Bourse de Tunis. Analyse ces news pour '{ticker}':
        {news_text}

        Ta mission :
        1. **Filtrer**: Ignore les news qui ne parlent PAS de l'entreprise '{ticker}'.
        2. **Synthèse**: Donne un score global (-1=Très Négatif, 0=Neutre, 1=Très Positif).
        3. **Impact**: Est-ce que ça va faire bouger le prix ? (Volatilité).

        Réponds en JSON STRICT :
        {{
          "ticker": "{ticker}",
          "last_updated": "{datetime.now().strftime('%Y-%m-%d %H:%M')}",
          "global_sentiment_score": (float -1 à 1),
          "market_consensus": "BUY" | "SELL" | "HOLD",
          "volatility_prediction": "HIGH" | "MEDIUM" | "LOW",
          "summary": "Résumé de la situation en 1 phrase (Français)",
          "news_analysis": [
             {{
               "title": "Titre article",
               "source": "Source",
               "sentiment": (float),
               "link": "URL"
             }}
          ]
        }}
        """
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)
            clean_json = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_json)
        except Exception as e:
            print(f"   ❌ Erreur AI: {e}")
            return None

def update_market_cache():
    print(f"\n🚀 DÉMARRAGE DU BATCH UPDATE ({len(TOP_STOCKS)} Actions)...")
    print("="*60)
    
    scraper = RealNewsScraper()
    full_market_data = {}

    for ticker in TOP_STOCKS:
        print(f"\n🔹 Traitement de {ticker}...")
        
        # 1. Récupérer les news
        news = scraper.get_live_news(ticker)
        
        # 2. Analyser avec Gemini
        if news:
            print(f"   🧠 Analyse IA en cours ({len(news)} articles)...")
            analysis = scraper.analyze_with_gemini(ticker, news)
        else:
            print("   ⚠️ Aucune news trouvée, génération d'un statut neutre.")
            analysis = {
                "ticker": ticker,
                "global_sentiment_score": 0,
                "market_consensus": "HOLD",
                "summary": "Pas de nouvelles récentes.", 
                "news_analysis": []
            }

        # 3. Stocker dans le dictionnaire global
        if analysis:
            full_market_data[ticker] = analysis
        
        # 4. Petite pause pour respecter les limites de l'API (Rate Limiting)
        time.sleep(2) 

    # 5. Sauvegarder tout dans un fichier JSON "Cache"
    output_file = "market_news_cache.json"
    with open(output_file, "w", encoding='utf-8') as f:
        json.dump(full_market_data, f, indent=2, ensure_ascii=False)

    print("\n" + "="*60)
    print(f"✅ TERMINÉ ! Données sauvegardées dans '{output_file}'")
    print(f"🕒 Timestamp: {datetime.now().strftime('%H:%M:%S')}")

if __name__ == "__main__":
    # Tu peux lancer ce script une fois, ou le mettre dans une boucle while True avec un sleep(3600)
    update_market_cache()