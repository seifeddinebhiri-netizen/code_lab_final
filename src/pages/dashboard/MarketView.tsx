import React, { useState, useEffect } from 'react';
import MarketOverview from '../../components/widgets/MarketOverview';
import SentimentWidget from '../../components/widgets/SentimentWidget';
import AIChatbotWidget from '../../components/widgets/AIChatbotWidget';
import { indices, topGainers, topLosers } from '../../utils/mockData';
import clsx from 'clsx';
import { ShieldAlert, Globe } from 'lucide-react';

const MarketView: React.FC = () => {
    const [userRole, setUserRole] = useState<'investisseur' | 'regulateur'>('investisseur');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.role) setUserRole(user.role);
        }
    }, []);

    const isRegulator = userRole === 'regulateur';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

            {/* Meta-Info for Regulator */}
            {isRegulator && (
                <div className="flex items-center gap-2 px-1 text-slate-500 font-mono text-[10px] uppercase tracking-widest">
                    <Globe size={12} /> Flux Marché Global • Temps de latence: 1.2ms • État: Stable
                </div>
            )}

            {/* Market Overview - Full Width (Indices + Gainers/Losers) */}
            <MarketOverview indices={indices} topGainers={topGainers} topLosers={topLosers} />

            {/* Row with Sentiment / Volatility */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <SentimentWidget />
                </div>

                <div className={clsx(
                    "lg:col-span-2 p-8 rounded-xl border flex flex-col justify-center relative overflow-hidden group min-h-[450px]",
                    isRegulator ? "bg-slate-900 border-slate-700" : "bg-slate-800/50 border-slate-700"
                )}>
                    {isRegulator ? (
                        <>
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <ShieldAlert size={80} />
                            </div>
                            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                <ShieldAlert size={18} className="text-slate-400" /> État du Système de Surveillance
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                                La surveillance automatisée sur BIAT et SFBT a été intensifiée suite à des volumes atypiques détectés en séance.
                                <br /><br />
                                <span className="text-emerald-400 font-bold font-mono text-xs uppercase tracking-widest px-2 py-1 bg-emerald-400/5 border border-emerald-400/10 rounded">
                                    ✓ Tous les index sont nominaux
                                </span>
                            </p>
                        </>
                    ) : (
                        <AIChatbotWidget />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketView;
