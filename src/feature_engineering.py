import pandas as pd
import numpy as np

class BVMTFeatureEngineer:
    """
    Transforme les données OHLCV brutes en indicateurs financiers avancés.
    Spécialisé pour les marchés illiquides comme la BVMT.
    """
    
    def process(self, df):
        df = df.copy()
        
        # 1. Rendements Logarithmiques
        # (Évite les erreurs de division par zéro)
        df['Close'] = df['Close'].replace(0, np.nan).ffill()
        df['log_ret'] = np.log(df['Close'] / df['Close'].shift(1))

        # 2. INDICATEUR ELITE : Ratio d'Illiquidité d'Amihud
        # Formule : |Rendement| / (Prix * Volume)
        # Ajout de +1e-9 pour éviter division par zéro
        df['amihud_illiq'] = df['log_ret'].abs() / (df['Close'] * df['Volume'] + 1e-9)
        
        # 3. Volatilité Roulante (Risque sur 5 jours)
        df['volatility_5d'] = df['log_ret'].rolling(window=5).std()

        # 4. Momentum (RSI simplifié)
        delta = df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        
        # Protection contre division par zéro pour le RSI
        rs = gain / (loss + 1e-9)
        df['rsi'] = 100 - (100 / (1 + rs))

        # 5. Position dans la fourchette (Stochastic Oscillator proxy)
        min_low = df['Low'].rolling(14).min()
        max_high = df['High'].rolling(14).max()
        
        # Protection division par zéro
        denominator = max_high - min_low
        df['stoch_k'] = (df['Close'] - min_low) / (denominator + 1e-9)

        # Nettoyage des NaN générés par les calculs glissants (les 14 premiers jours)
        df.dropna(inplace=True)
        
        return df