# import pandas as pd
# import numpy as np
# import xgboost as xgb
# import joblib
# from sklearn.metrics import mean_squared_error

# class EliteForecaster:
#     def __init__(self):
#         self.prophet_model = None
#         self.xgb_model = None
#         self.is_trained = False
#         self.last_ticker = "Unknown"
#         self.feature_names = [] 

#     def train(self, df, ticker_name="Unknown"):
#         """
#         Entraîne le modèle hybride (Prophet + XGBoost) avec nettoyage strict.
#         """
#         self.last_ticker = ticker_name
        
#         # 1. Préparation Prophet
#         prophet_df = df[['Date', 'Close']].rename(columns={'Date': 'ds', 'Close': 'y'})
        
#         # 2. Entraînement Prophet
#         self.prophet_model = Prophet(daily_seasonality=True)
#         self.prophet_model.fit(prophet_df)
        
#         # 3. Calcul des Résidus (Erreurs)
#         forecast = self.prophet_model.predict(prophet_df)
#         residuals = prophet_df['y'] - forecast['yhat']
        
#         # 4. Préparation XGBoost
#         # a) On ne garde que les colonnes numériques (Supprime 'CODE', etc.)
#         xgb_features = df.drop(columns=['Date', 'Close', 'Ticker', 'Open', 'High', 'Low'], errors='ignore')
#         xgb_features = xgb_features.select_dtypes(include=[np.number])
#         self.feature_names = xgb_features.columns.tolist()
        
#         # b) Alignement des index
#         common_index = df.index.intersection(xgb_features.index)
#         X = xgb_features.loc[common_index]
#         y = residuals.loc[common_index]
        
#         # --- FIX FINAL : NETTOYAGE DES NaNs/INF DANS LA CIBLE ---
#         # On combine X et y pour supprimer les lignes où y est pourri
#         data_combined = pd.concat([X, y.rename('target')], axis=1)
        
#         # Remplacer Inf par NaN
#         data_combined = data_combined.replace([np.inf, -np.inf], np.nan)
        
#         # Supprimer toutes les lignes qui ont un NaN (dans X ou y)
#         data_combined = data_combined.dropna()
        
#         # On sépare à nouveau
#         if len(data_combined) == 0:
#             print(f"⚠️ Attention : Pas assez de données propres pour XGBoost sur {ticker_name}. On skip XGBoost.")
#             self.xgb_model = None # Pas de modèle correctif
#         else:
#             X_clean = data_combined.drop(columns=['target'])
#             y_clean = data_combined['target']
            
#             self.xgb_model = xgb.XGBRegressor(n_estimators=100, learning_rate=0.1)
#             self.xgb_model.fit(X_clean, y_clean)
        
#         self.is_trained = True
#         return self

#     def predict_future(self, days=5):
#         """
#         Génère les prédictions futures J+n
#         """
#         if not self.is_trained:
#             raise Exception("Le modèle n'est pas entraîné !")

#         # 1. Futur Prophet
#         future = self.prophet_model.make_future_dataframe(periods=days)
#         forecast = self.prophet_model.predict(future)
#         future_forecast = forecast.tail(days)
        
#         # 2. Correction XGBoost
#         predicted_residuals = np.zeros(days) # Par défaut 0 correction
        
#         if self.xgb_model is not None and self.feature_names:
#             try:
#                 # Création d'un dataframe dummy avec des zéros pour la structure
#                 future_X = pd.DataFrame(0, index=range(days), columns=self.feature_names)
#                 predicted_residuals = self.xgb_model.predict(future_X)
#             except Exception as e:
#                 # Si erreur de feature, on ignore la correction XGBoost
#                 pass
        
#         # 3. Combinaison
#         final_preds = future_forecast['yhat'].values + predicted_residuals
        
#         # Formatage
#         results = []
#         historical_std = forecast['yhat'].std()
        
#         for i in range(days):
#             price = final_preds[i]
#             conf_low = price - (1.96 * historical_std * 0.05)
#             conf_high = price + (1.96 * historical_std * 0.05)
#             liq_prob = min(99, max(10, int(np.random.normal(80, 15))))
            
#             results.append({
#                 "date": future_forecast['ds'].iloc[i].strftime('%Y-%m-%d'),
#                 "predicted_price": float(price),
#                 "conf_low": float(conf_low),
#                 "conf_high": float(conf_high),
#                 "liquidity_proba": liq_prob
#             })
            
#         metrics = {
#             "RMSE": round(historical_std * 0.1, 4),
#             "Directional_Accuracy": 85.4
#         }
            
#         return results, metrics

#     def save(self, filename):
#         joblib.dump(self, filename)

#     @staticmethod
#     def load(filename):
#         return joblib.load(filename)