import feedparser
import google.generativeai as genai
import json
import os
import urllib.parse
from datetime import datetime

# --- CONFIGURATION ---
# Put your API key here or in a .env file
API_KEY = "AIzaSyCm9tKB61-DgSxeCZW7p5DHVqZXrIjLttU" # or "YOUR_API_KEY_HERE" sorry for putting i needed to

genai.configure(api_key=API_KEY)

class RealNewsScraper:
    def __init__(self):
        # We target the Google News RSS feed specifically for Tunisia (fr-TN)
        self.base_url = "https://news.google.com/rss/search?q={query}&hl=fr&gl=TN&ceid=TN:fr"

    def get_live_news(self, ticker):
        """
        Fetches REAL news from Google News (aggregating IlBoursa, Tustex, etc.)
        """
        # Construct the query: Ticker + "Tunisie" + "Bourse" to filter noise
        query = f"{ticker} Tunisie bourse"
        encoded_query = urllib.parse.quote(query)
        final_url = self.base_url.format(query=encoded_query)

        print(f"🌍 Fetching live news for {ticker} from multiple sources...")
        
        # Parse the feed
        feed = feedparser.parse(final_url)
        
        news_items = []
        
        # We take the top 5 freshest news items
        for entry in feed.entries[:5]:
            # Clean up the source (Google often puts " - SourceName" at the end of title)
            title = entry.title
            source = entry.source.title if 'source' in entry else "Unknown Source"
            
            # Simple deduplication or cleanup if needed
            news_items.append({
                "title": title,
                "link": entry.link,
                "pubDate": entry.published,
                "source": source
            })

        if not news_items:
            print(f"⚠️ No recent news found for {ticker}. (This is normal for small stocks)")
            # Fallback only if absolutely empty
            return []

        print(f"✅ Found {len(news_items)} real articles.")
        print(json.dumps(news_items, indent=2, ensure_ascii=False))
        return news_items

    def analyze_with_gemini(self, ticker, news_items):
        if not news_items:
            return {
                "ticker": ticker,
                "global_sentiment_score": 0,
                "status": "NO_NEWS",
                "summary": "Pas d'actualités récentes trouvées sur Google News."
            }

        # Convert to string for AI
        news_text = json.dumps(news_items, ensure_ascii=False)

        prompt = f"""
        You are a financial expert for the Tunisian Market (BVMT).
        Analyze these REAL news articles for '{ticker}':
        {news_text}

        Tasks:
        1. **Source Check**: Note that sources like 'IlBoursa', 'Tustex', 'Managers.tn' are RELIABLE (High Credibility). 
        2. **Sentiment**: Calculate a global score (-1 to 1).
        3. **Impact**: Assess if this news will move the stock price (Volatility).

        Output STRICT JSON:
        {{
          "ticker": "{ticker}",
          "timestamp": "{datetime.now().isoformat()}",
          "global_sentiment_score": (float),
          "market_consensus": "BUY/SELL/HOLD",
          "news_analysis": [
            {{
              "title": "Article Title",
              "source": "Source Name",
              "sentiment": (float),
              "credibility": (float 0-1),
              "summary": "One sentence summary in French",
              "link": "The original link"
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
            print(f"❌ AI Error: {e}")
            return {"error": "AI Analysis Failed"}

# --- RUN IT NOW ---
if __name__ == "__main__":
    scraper = RealNewsScraper()
    
    # Try a major company to see real results
    target = "SFBT" 
    
    # 1. Get Real Links
    real_news = scraper.get_live_news(target)
    
    # 2. Analyze
    if real_news:
        analysis = scraper.analyze_with_gemini(target, real_news)
        print("\n--- 🚀 REAL LIVE DATA ---")
        print(json.dumps(analysis, indent=2, ensure_ascii=False))
    else:
        print("No news found.")