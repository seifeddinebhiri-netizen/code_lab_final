import React, { useState, useEffect, useMemo } from 'react';
import StockAnalysis from '../../components/widgets/StockAnalysis';
import { TrendingUp, Activity, ShieldAlert, Search, Shield } from 'lucide-react';
import clsx from 'clsx';

const AnalysisView: React.FC = () => {
    const [userRole, setUserRole] = useState<'investisseur' | 'regulateur'>('investisseur');
    const [selectedTicker, setSelectedTicker] = useState('SFBT');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.role) setUserRole(user.role);
        }
    }, []);

    const isRegulator = userRole === 'regulateur';

    // Dynamic Indicators for the UI
    const tickerIndicators = useMemo(() => {
        const data: Record<string, any> = {
            'SFBT': {
                rsi: '65.4',
                macd: 'Achat',
                volatility: 'Faible',
                confidence: '88%',
                risk: 'Bas',
                status: 'BULLISH'
            },
            'BIAT': {
                rsi: '72.1',
                macd: 'Achat Fort',
                volatility: 'Moyenne',
                confidence: '94%',
                risk: 'Modéré',
                status: 'BULLISH'
            },
            'ATTIJARI BANK': {
                rsi: '52.3',
                macd: 'Neutre',
                volatility: 'Basse',
                confidence: '75%',
                risk: 'Bas',
                status: 'NEUTRAL'
            },
            'MONOPRIX': {
                rsi: '38.2',
                macd: 'Vente',
                volatility: 'Haute',
                confidence: '62%',
                risk: 'Élevé',
                status: 'BEARISH'
            }
        };
        return data[selectedTicker] || data['SFBT'];
    }, [selectedTicker]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">

            {/* Left Column: The Main Chart & Analysis */}
            <div className="lg:col-span-2 space-y-6">

                {/* Status Bar style Dali */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-4 rounded-2xl flex items-center justify-between shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></div>
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">IA Core Engine Active</span>
                    </div>
                    <div className="flex gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span>LATENCY: 12ms</span>
                        <span>SENSORS: ONLINE</span>
                    </div>
                </div>

                {isRegulator && (
                    <div className="bg-rose-600/10 border border-rose-600/20 p-5 rounded-2xl flex items-center justify-between shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-full bg-rose-600/5 -skew-x-12 transform origin-right"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <ShieldAlert size={28} className="text-rose-600" />
                            <div>
                                <p className="text-sm font-black text-white uppercase tracking-tight">Terminal de Surveillance CMF</p>
                                <p className="text-[11px] text-rose-500/80 uppercase tracking-widest font-mono font-bold">MODE AUDIT: Détection d'Anomalies de Marché</p>
                            </div>
                        </div>
                        <button className="px-5 py-2 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-rose-700 transition-all z-10 shadow-lg shadow-rose-600/20">
                            VOIR PREUVES
                        </button>
                    </div>
                )}

                <StockAnalysis ticker={selectedTicker} />
            </div>

            {/* Right Column: Selectors & Indicators */}
            <div className="lg:col-span-1 space-y-6">

                {/* Search & Selector Style Casa de Papel */}
                <div className="bg-slate-900/60 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-1 bg-rose-600"></div>
                        <h3 className="font-black text-white uppercase tracking-[0.2em] text-sm">
                            {isRegulator ? 'Audit Database' : 'Sélecteur de Valeur'}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="IDENTIFIER UN SYMBOLE..."
                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 pl-12 py-4 text-xs font-bold text-white focus:border-rose-600/50 outline-none transition-all placeholder:text-slate-700"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-2 mt-4">
                            {['SFBT', 'BIAT', 'ATTIJARI BANK', 'MONOPRIX'].map(ticker => (
                                <button
                                    key={ticker}
                                    onClick={() => setSelectedTicker(ticker)}
                                    className={clsx(
                                        "w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 text-xs font-black border flex justify-between items-center group relative overflow-hidden",
                                        selectedTicker === ticker
                                            ? "bg-rose-600 text-white border-rose-500 shadow-xl shadow-rose-600/20 translate-x-2"
                                            : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    <span className="relative z-10 tracking-widest">{ticker}</span>
                                    {selectedTicker === ticker ? (
                                        <Shield size={16} className="relative z-10 text-white animate-pulse" />
                                    ) : (
                                        <TrendingUp size={16} className="text-slate-700 group-hover:text-rose-500 transition-colors" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Indicators Card */}
                <div className="bg-slate-900/40 backdrop-blur-2xl p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Activity size={80} className="text-rose-600" />
                    </div>

                    <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                        <div className="p-2 bg-rose-600/20 rounded-lg border border-rose-600/30">
                            <Activity size={16} className="text-rose-600" />
                        </div>
                        Indicateurs Neuronaux
                    </h3>

                    <div className="space-y-6">
                        <div className="flex justify-between items-end border-b border-white/5 pb-4">
                            <div className="space-y-1">
                                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">RSI IA (14)</span>
                                <p className="text-2xl font-black text-white font-mono tracking-tighter">{tickerIndicators.rsi}</p>
                            </div>
                            <span className={clsx(
                                "text-[9px] font-black px-2 py-1 rounded-md mb-1",
                                parseFloat(tickerIndicators.rsi) > 60 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                            )}>
                                {parseFloat(tickerIndicators.rsi) > 60 ? 'SURACHAT' : 'SURVENTE'}
                            </span>
                        </div>

                        <div className="flex justify-between items-end border-b border-white/5 pb-4">
                            <div className="space-y-1">
                                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Tendance MACD</span>
                                <p className={clsx(
                                    "text-xl font-black font-mono tracking-tighter",
                                    tickerIndicators.macd.includes('Achat') ? "text-emerald-400" : "text-rose-500"
                                )}>
                                    {tickerIndicators.macd.toUpperCase()}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-between items-end border-b border-white/5 pb-4">
                            <div className="space-y-1">
                                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Volatilité 24H</span>
                                <p className="text-xl font-black text-white font-mono tracking-tighter">{tickerIndicators.volatility.toUpperCase()}</p>
                            </div>
                            <span className="text-[9px] font-black text-slate-500 bg-white/5 px-2 py-1 rounded-md mb-1 uppercase tracking-widest">Risque {tickerIndicators.risk}</span>
                        </div>

                        <div className="pt-2">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Score de Confiance</span>
                                <span className="text-xs font-black text-rose-500 font-mono">{tickerIndicators.confidence}</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                <div
                                    className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-1000"
                                    style={{ width: tickerIndicators.confidence }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Regulator Action if applicable */}
                {isRegulator && (
                    <button className="w-full p-4 bg-black/40 border-2 border-dashed border-rose-600/30 text-rose-600 text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-rose-600 hover:text-white transition-all duration-300">
                        Générer Rapport d'Audit ID: 8902
                    </button>
                )}
            </div>
        </div>
    );
};

export default AnalysisView;
