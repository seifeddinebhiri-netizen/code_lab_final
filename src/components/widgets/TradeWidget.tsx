import React, { useState } from 'react';
import { ShoppingCart, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

interface TradeWidgetProps {
    userId: number;
    onTradeSuccess: () => void;
}

// Mock current prices for the simulation (same as MaTactique)
const CURRENT_PRICES: Record<string, number> = {
    'BIAT': 94.8,
    'SFBT': 14.2,
    'SAH': 8.95,
    'EURO-CYCLES': 13.7,
};

const TradeWidget: React.FC<TradeWidgetProps> = ({ userId, onTradeSuccess }) => {
    const [ticker, setTicker] = useState('BIAT');
    const [quantity, setQuantity] = useState<number>(10);
    const [price, setPrice] = useState<number>(CURRENT_PRICES['BIAT']);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | null }>({ message: '', type: null });

    const handleTickerChange = (newTicker: string) => {
        setTicker(newTicker);
        setPrice(CURRENT_PRICES[newTicker] || 0);
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: '', type: null }), 3000);
    };

    const handleBuy = async () => {
        if (quantity <= 0) {
            showToast("La quantité doit être supérieure à 0", "error");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/trade/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    ticker,
                    quantity: Number(quantity),
                    purchase_price: Number(price)
                })
            });

            const data = await response.json();

            if (response.ok) {
                showToast("Achat virtuel réussi !", "success");
                onTradeSuccess();
            } else {
                showToast(data.detail || "Échec de la transaction", "error");
            }
        } catch (error) {
            showToast("Erreur serveur", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl relative overflow-hidden h-full">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <ShoppingCart className="text-gold-500" size={18} /> Passer un Ordre (Simulé)
            </h3>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valeur BVMT</label>
                    <select
                        value={ticker}
                        onChange={(e) => handleTickerChange(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all cursor-pointer"
                    >
                        <option value="BIAT">BIAT (Banque Internationale)</option>
                        <option value="SFBT">SFBT (Agroalimentaire)</option>
                        <option value="SAH">SAH (Lilas)</option>
                        <option value="EURO-CYCLES">EURO-CYCLES (Industrie)</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quantité</label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(parseFloat(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Prix d'Achat (TND)</label>
                        <input
                            type="number"
                            value={price}
                            readOnly
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed outline-none select-none font-mono"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs text-slate-500">Estimation Totale</span>
                        <span className="text-lg font-bold text-white font-mono">{(quantity * price).toFixed(2)} TND</span>
                    </div>

                    <button
                        onClick={handleBuy}
                        disabled={loading}
                        className="w-full py-4 bg-gold-500 text-midnight font-bold rounded-xl hover:bg-gold-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold/20"
                    >
                        {loading ? (
                            <RefreshCw className="animate-spin" size={18} />
                        ) : (
                            <>Investir (Virtuel)</>
                        )}
                    </button>
                </div>
            </div>

            {/* Toast Notification Layer */}
            {toast.type && (
                <div className={clsx(
                    "absolute bottom-4 left-4 right-4 p-3 rounded-lg border flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-300 z-50",
                    toast.type === 'success' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
                )}>
                    {toast.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                    <span className="text-xs font-bold">{toast.message}</span>
                </div>
            )}
        </div>
    );
};

export default TradeWidget;
