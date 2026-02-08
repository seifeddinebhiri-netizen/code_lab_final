import React, { useState, useEffect } from 'react';
import StockAnalysis from '../../components/widgets/StockAnalysis';
import { specificStock } from '../../utils/mockData';
import { TrendingUp, Activity, BarChart3, ShieldAlert, Search, Info } from 'lucide-react';
import clsx from 'clsx';

const AnalysisView: React.FC = () => {
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div className="lg:col-span-2 space-y-6">

                {/* Regulator Special Banner if applicable */}
                {isRegulator && (
                    <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex items-center justify-between shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-full bg-slate-400/5 -skew-x-12 transform origin-right"></div>
                        <div className="flex items-center gap-3">
                            <ShieldAlert size={24} className="text-slate-400" />
                            <div>
                                <p className="text-sm font-bold text-white">Mode Analyse d'Audit CMF</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Détection de délits d'initiés & manipulation</p>
                            </div>
                        </div>
                        <button className="px-4 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded hover:bg-slate-700 transition-all z-10">
                            VOIR PREUVES
                        </button>
                    </div>
                )}

                <StockAnalysis stock={specificStock} />

                {/* Advanced AI Forecast Section */}
                <div className={clsx(
                    "p-6 rounded-xl border shadow-lg",
                    isRegulator ? "bg-slate-900 border-slate-700" : "bg-slate-800 border-slate-700"
                )}>
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        {isRegulator ? (
                            <>
                                <Activity size={18} className="text-slate-400" /> Projection de Stabilité Institutionnelle
                            </>
                        ) : (
                            <>
                                <TrendingUp size={18} className="text-gold-500" /> Prédiction IA (Modèle LSTM/Transformer)
                            </>
                        )}
                    </h3>
                    <div className="h-64 bg-slate-950/40 rounded-lg border border-dashed border-slate-700/50 flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                        <BarChart3 size={40} className="mb-2 opacity-10" />
                        <p className="text-sm font-medium">
                            {isRegulator ? 'Analyse de la volatilité prévue sur 15 jours' : 'Graphique de prévision sur 5 jours glissants'}
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.2em] mt-2 font-mono opacity-60">
                            {isRegulator ? 'Probabilité de dépassement de seuil : 12.4%' : 'Confiance algorithmique : 94.2%'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
                {/* Search & Selector */}
                <div className={clsx(
                    "p-6 rounded-xl border shadow-lg",
                    isRegulator ? "bg-slate-900 border-slate-700" : "bg-slate-800 border-slate-700"
                )}>
                    <h3 className={clsx("font-bold mb-4", isRegulator ? "text-slate-300" : "text-gold-500")}>
                        {isRegulator ? 'Audit par Ticker' : 'Sélecteur de Valeur'}
                    </h3>
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                            <input
                                type="text"
                                placeholder="Chercher un symbole..."
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 pl-10 py-2.5 text-xs text-white focus:border-slate-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            {['BIAT', 'SFBT', 'SAH', 'EURO-CYCLES'].map(ticker => (
                                <button key={ticker} className="w-full text-left px-4 py-2.5 rounded bg-slate-800/50 hover:bg-slate-700/60 transition-all text-xs font-mono border border-slate-700/30 flex justify-between items-center group">
                                    <span className="group-hover:text-white transition-colors">{ticker}</span>
                                    {isRegulator && <Info size={12} className="text-slate-600" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Score / Indicators */}
                <div className={clsx(
                    "p-6 rounded-xl border shadow-lg",
                    isRegulator ? "bg-slate-950 border-slate-800" : "bg-slate-800 border-slate-700"
                )}>
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        {isRegulator ? <ShieldAlert size={18} className="text-slate-400" /> : <Activity size={18} className="text-blue-400" />}
                        {isRegulator ? 'Indicateurs de Conformité' : 'Indicateurs IA'}
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span className="text-slate-500">{isRegulator ? 'Indice Manipulation' : 'RSI (14)'}</span>
                            <span className={clsx("font-bold", isRegulator ? "text-slate-200" : "text-emerald-400")}>
                                {isRegulator ? 'Bas (0.12)' : '65.4'}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span className="text-slate-500">{isRegulator ? 'Concentration Vendeurs' : 'MACD'}</span>
                            <span className={clsx("font-bold", isRegulator ? "text-slate-200" : "text-blue-400")}>
                                {isRegulator ? '24%' : 'Achat'}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span className="text-slate-500">{isRegulator ? 'Alertes ESMA' : 'Bollinger Bands'}</span>
                            <span className="text-white font-bold">
                                {isRegulator ? 'Saines' : 'Serrées'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Score de Confiance</span>
                            <span className={clsx("font-bold font-mono", isRegulator ? "text-slate-300" : "text-gold-500")}>88%</span>
                        </div>
                    </div>

                    {isRegulator && (
                        <button className="w-full mt-6 py-2 bg-slate-800 border border-slate-700 text-slate-300 text-[10px] uppercase font-bold tracking-widest rounded hover:bg-slate-700 transition-all">
                            Vérifier Historique Audit
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalysisView;
