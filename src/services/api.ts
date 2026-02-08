const API_URL = "http://127.0.0.1:8000";

export const apiService = {
    // --- AUTH ---
    login: async (credentials: any) => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        if (!response.ok) throw new Error("Erreur de connexion");
        return response.json();
    },

    // --- SIMULATION ACADEMY ---
    getVirtualBalance: async (userId: number) => {
        const response = await fetch(`${API_URL}/api/user/balance/${userId}`);
        if (!response.ok) throw new Error("Erreur solde");
        return response.json();
    },

    getDemoPortfolio: async (userId: number) => {
        const response = await fetch(`${API_URL}/api/user/portfolio/${userId}`);
        if (!response.ok) throw new Error("Erreur portfolio");
        return response.json();
    },

    buyStock: async (tradeData: { user_id: number, ticker: string, quantity: number, purchase_price: number }) => {
        const response = await fetch(`${API_URL}/api/trade/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tradeData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Échec de l'achat");
        }
        return response.json();
    },

    // --- MARKET INTELLIGENCE ---
    getMarketSentiment: async (limit: number = 10) => {
        const response = await fetch(`${API_URL}/market/sentiment?limit=${limit}`);
        if (!response.ok) throw new Error("Erreur sentiment marché");
        return response.json();
    },

    // --- PORTFOLIO ---
    addFunds: async (userId: number, amount: number) => {
        const response = await fetch(`${API_URL}/users/${userId}/add-funds`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        });
        if (!response.ok) throw new Error("Erreur lors du dépôt");
        return response.json();
    },

    getPredictions: async (ticker: string) => {
        const response = await fetch(`${API_URL}/api/predict/${ticker}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Erreur prédictions");
        }
        return response.json();
    },

    aiChat: async (userId: number, query: string) => {
        const response = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, query })
        });
        if (!response.ok) throw new Error("Erreur IA Chat");
        return response.json();
    }
};
