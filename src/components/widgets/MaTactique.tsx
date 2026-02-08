import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';
import { apiService } from '../../services/api';

interface DemoPortfolioItem {
    id: number;
    ticker: string;
    quantity: number;
    purchase_price: number;
}

interface MaTactiqueProps {
    userId: number;
    refreshKey: number;
    onPnLUpdate: (totalPnL: number) => void;
}

// Mock current prices for ROI calculation in the demo
const CURRENT_PRICES: Record<string, number> = {
    'BIAT': 94.8,
    'SFBT': 14.2,
    'SAH': 8.95,
    'EURO-CYCLES': 13.7,
};

const MaTactique: React.FC<MaTactiqueProps> = ({ userId, refreshKey, onPnLUpdate }) => {
    const [items, setItems] = useState<DemoPortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPortfolio = async () => {
        try {
            const data = await apiService.getDemoPortfolio(userId);
            setItems(data);

            // Calculate PnL for the header
            const totalPnL = data.reduce((acc: number, item: DemoPortfolioItem) => {
                const currentPrice = CURRENT_PRICES[item.ticker] || item.purchase_price;
                return acc + (currentPrice - item.purchase_price) * item.quantity;
            }, 0);
            onPnLUpdate(totalPnL);
        } catch (error) {
            console.error("Failed to fetch demo portfolio", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolio();
    }, [userId, refreshKey]);

    return (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <Activity className="text-emerald-400" size={18} /> Ma Tactique en Temps Réel
                </h3>
                <span className="text-[10px] bg-slate-900 text-slate-500 px-3 py-1 rounded-full border border-slate-700 font-bold tracking-widest uppercase">
                    LIVE ACADEMY
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/30 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                            <th className="px-6 py-4">Valeur</th>
                            <th className="px-6 py-4">Quantité</th>
                            <th className="px-6 py-4">Prix Achat</th>
                            <th className="px-6 py-4">Prix Actuel</th>
                            <th className="px-6 py-4">P&L (TND)</th>
                            <th className="px-6 py-4">ROI (%)</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-700/50">
                        {loading && items.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">Chargement du simulateur...</td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">Aucune position ouverte. Allez sur le marché pour investir !</td>
                            </tr>
                        ) : (
                            items.map((item) => {
                                const currentPrice = CURRENT_PRICES[item.ticker] || item.purchase_price;
                                const pnl = (currentPrice - item.purchase_price) * item.quantity;
                                const roi = ((currentPrice - item.purchase_price) / item.purchase_price) * 100;

                                return (
                                    <tr key={item.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-white">{item.ticker}</td>
                                        <td className="px-6 py-4 text-slate-300 font-mono">{item.quantity}</td>
                                        <td className="px-6 py-4 text-slate-300 font-mono">{item.purchase_price.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-white font-mono font-bold">{currentPrice.toFixed(2)}</td>
                                        <td className={clsx(
                                            "px-6 py-4 font-mono font-bold",
                                            pnl >= 0 ? "text-emerald-400" : "text-neon-red"
                                        )}>
                                            {pnl >= 0 ? '+' : ''}{pnl.toFixed(1)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={clsx(
                                                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                                roi >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                                            )}>
                                                {roi >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                                {roi.toFixed(1)}%
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MaTactique;
