import google.generativeai as genai
import json

# Configure ton API Key
genai.configure(api_key="AIzaSyCm9tKB61-DgSxeCZW7p5DHVqZXrIjLttU")
model = genai.GenerativeModel('gemini-1.5-flash')

def generate_decision_explanation(market_data_json, user_query):
    """
    market_data_json: Le JSON contenant les sorties de tes modules 1, 2 et 3
    user_query: La question de l'utilisateur (ex: "Dois-je acheter du SFBT ?")
    """
    
    # Structure du Prompt (Engineering Layer)
    system_prompt = f"""
    Tu es un expert financier de la Bourse de Tunis (BVMT). 
    Voici les données techniques actuelles :
    {json.dumps(market_data_json, indent=2)}
    
    Ta mission :
    1. Analyser la cohérence entre le Sentiment (NLP) et les Prévisions (ML).
    2. Vérifier si une Anomalie bloque l'investissement.
    3. Répondre à l'utilisateur de manière concise, pédagogique et en français.
    4. Terminer par une recommandation claire : ACHETER, VENDRE ou ATTENDRE.
    """

    response = model.generate_content([system_prompt, user_query])
    return response.text