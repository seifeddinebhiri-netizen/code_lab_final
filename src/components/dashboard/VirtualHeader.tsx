import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, DollarSign } from 'lucide-react';
import clsx from 'clsx';
import { apiService } from '../../services/api';

interface VirtualHeaderProps {
    userId: number;
    portfolioPnL: number;
    refreshKey?: number;
}

const VirtualHeader: React.FC<VirtualHeaderProps> = ({ userId, portfolioPnL, refreshKey }) => {
    const [balance, setBalance] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    const fetchBalance = async () => {
        try {
            const data = await apiService.getVirtualBalance(userId);
            setBalance(data.virtual_balance);
        } catch (error) {
            console.error("Failed to fetch balance", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
        const interval = setInterval(fetchBalance, 10000); // Sync balance evey 10s
        return () => clearInterval(interval);
    }, [userId, refreshKey]);

    const totalROI = balance > 0 ? (portfolioPnL / balance) * 100 : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-gold-500/20 shadow-xl backdrop-blur-md relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-gold-500/5 rounded-full blur-2xl group-hover:bg-gold-500/10 transition-all"></div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-2 flex items-center gap-2">
                    <Wallet size={12} className="text-gold-500" /> Capital Virtuel (Sim.)
                </p>
                <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-bold text-white font-mono">
                        {loading ? '---' : balance.toLocaleString()}
                    </h2>
                    <span className="text-sm text-slate-500">TND</span>
                </div>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-md relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-2 flex items-center gap-2">
                    <TrendingUp size={12} className="text-emerald-400" /> Profil / Perte Totale
                </p>
                <div className="flex items-baseline gap-2">
                    <h2 className={clsx(
                        "text-3xl font-bold font-mono",
                        portfolioPnL >= 0 ? "text-emerald-400" : "text-neon-red"
                    )}>
                        {portfolioPnL >= 0 ? '+' : ''}{portfolioPnL.toFixed(2)}
                    </h2>
                    <span className="text-sm text-slate-500">TND</span>
                </div>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-md relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-2 flex items-center gap-2">
                    <DollarSign size={12} className="text-blue-400" /> ROI Global (%)
                </p>
                <div className="flex items-baseline gap-2">
                    <h2 className={clsx(
                        "text-3xl font-bold font-mono",
                        totalROI >= 0 ? "text-emerald-400" : "text-neon-red"
                    )}>
                        {totalROI >= 0 ? '+' : ''}{totalROI.toFixed(2)}%
                    </h2>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-slate-900 rounded border border-slate-700">
                        {totalROI >= 0 ? 'Optimal' : 'Risque'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default VirtualHeader;
