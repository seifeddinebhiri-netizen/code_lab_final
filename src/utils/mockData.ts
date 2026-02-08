export interface Stock {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
}

export interface MarketIndex {
    name: string;
    value: number;
    change: number;
    changePercent: number;
}

export interface PortfolioAsset {
    symbol: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    totalValue: number;
    allocation: number;
}

export interface Alert {
    id: string;
    symbol: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: string;
}

export const indices: MarketIndex[] = [
    { name: 'TUNINDEX', value: 14599.12, change: 45.23, changePercent: 0.31 },
    { name: 'TUNINDEX20', value: 6542.10, change: -12.4, changePercent: -0.19 },
];

export const topGainers: Stock[] = [
    { symbol: 'BIAT', name: 'Banque Internationale Arabe de Tunisie', price: 92.50, change: 2.10, changePercent: 2.32, volume: 15400 },
    { symbol: 'SFBT', name: 'Société de Fabrication des Boissons de Tunisie', price: 14.20, change: 0.30, changePercent: 2.15, volume: 8500 },
    { symbol: 'SAH', name: 'SAH Lilas', price: 8.90, change: 0.15, changePercent: 1.71, volume: 12000 },
];

export const topLosers: Stock[] = [
    { symbol: 'CC', name: 'Carthage Cement', price: 1.85, change: -0.10, changePercent: -5.13, volume: 45000 },
    { symbol: 'SOTETEL', name: 'Société Tunisienne d’Entreprises de Télécommunications', price: 3.45, change: -0.15, changePercent: -4.17, volume: 3200 },
];

export const marketSentiment = {
    score: 65, // 0-100
    label: 'Greed', // Fear, Neutral, Greed
};

export const specificStock = {
    symbol: 'SFBT',
    price: 14.20,
    history: [
        { day: 'J-4', price: 13.5 },
        { day: 'J-3', price: 13.8 },
        { day: 'J-2', price: 13.7 },
        { day: 'J-1', price: 13.9 },
        { day: 'Aujourd\'hui', price: 14.2 },
    ],
    forecast: [
        { day: 'J+1', price: 14.35 },
        { day: 'J+2', price: 14.42 },
        { day: 'J+3', price: 14.10 },
        { day: 'J+4', price: 14.50 },
        { day: 'J+5', price: 14.65 },
    ],
    indicators: {
        rsi: 68,
        macd: 'Bullish',
        recommendation: 'Achat', // Achat, Vente, Hold
    }
};

export const portfolio: PortfolioAsset[] = [
    { symbol: 'BIAT', quantity: 150, avgPrice: 85.00, currentPrice: 92.50, totalValue: 13875, allocation: 45 },
    { symbol: 'SFBT', quantity: 500, avgPrice: 12.50, currentPrice: 14.20, totalValue: 7100, allocation: 23 },
    { symbol: 'SAH', quantity: 800, avgPrice: 9.10, currentPrice: 8.90, totalValue: 7120, allocation: 23 },
    { symbol: 'Euro-Cycles', quantity: 100, avgPrice: 15.20, currentPrice: 14.80, totalValue: 1480, allocation: 9 },
];

export const alerts: Alert[] = [
    { id: '1', symbol: 'CC', message: 'Volume > 3 Sigma (Anomalie détectée)', severity: 'high', timestamp: '10:45' },
    { id: '2', symbol: 'SOTETEL', message: 'Forte baisse inexpliquée', severity: 'medium', timestamp: '09:32' },
];
