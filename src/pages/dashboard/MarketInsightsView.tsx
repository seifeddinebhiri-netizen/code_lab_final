import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { TrendingUp, TrendingDown, Activity, Globe, Info } from 'lucide-react';
import clsx from 'clsx';

interface SentimentItem {
    ticker: string;
    global_sentiment_score: number;
    market_consensus: string;
    summary: string;
    last_updated: string;
}

const MarketInsightsView: React.FC = () => {
    const [trending, setTrending] = useState<SentimentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSentiment = async () => {
            console.log('🔄 IA Debug: Lancement de la récupération du sentiment...');
            try {
                const data = await apiService.getMarketSentiment(10);
                console.log('✅ IA Debug - Données reçues:', data);

                if (Array.isArray(data)) {
                    setTrending(data);
                } else {
                    console.error('❌ IA Debug: Format de données invalide (pas un tableau)', data);
                    setError("Format de données invalide reçu de l'IA.");
                }
            } catch (err: any) {
                console.error("❌ IA Debug - Erreur sentiment:", err);
                setError(err.message || "Impossible de contacter le moteur d'Intelligence IA.");
            } finally {
                setLoading(false);
            }
        };
        fetchSentiment();
    }, []);

    const getStatusStyles = (score: number) => {
        // Thème Braquage / Dali
        if (score >= 0.5) return {
            color: 'text-emerald-400',
            label: 'ACCUMULATION FORTE',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/30',
            glow: 'shadow-[0_0_20px_rgba(52,211,153,0.15)]'
        };
        if (score > 0) return {
            color: 'text-emerald-500',
            label: 'OPTIMISTE',
            bg: 'bg-emerald-500/5',
            border: 'border-emerald-500/20',
            glow: ''
        };
        if (score <= -0.5) return {
            color: 'text-rose-500', // Dali Red
            label: 'VENTE FORTE (DANGER)',
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/30',
            glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]'
        };
        return {
            color: 'text-rose-400',
            label: 'PESSIMISTE',
            bg: 'bg-rose-500/5',
            border: 'border-rose-500/10',
            glow: ''
        };
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">

            {/* Header Section Section "La Casa de Papel" Style */}
            <div className="relative group overflow-hidden bg-slate-900/60 backdrop-blur-2xl p-8 rounded-3xl border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-rose-600/20 p-2 rounded-lg border border-rose-500/30">
                        <Globe size={18} className="text-rose-500 animate-pulse" />
                    </div>
                    <span className="text-xs font-black text-rose-500 uppercase tracking-[0.3em]">IA Market Intelligence</span>
                </div>

                <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    Flux Global de Sentiment <span className="text-rose-600 text-sm font-mono bg-rose-600/10 px-2 py-1 rounded border border-rose-600/20">LIVE</span>
                </h2>
                <p className="text-slate-400 mt-3 max-w-2xl leading-relaxed">
                    Analyse neuronale en temps réel (NLP) du marché financier. Notre IA Dali scanne les signaux faibles pour anticiper les retournements de tendance.
                </p>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center gap-3 text-rose-400 text-sm font-medium">
                    <Info size={18} />
                    {error}
                </div>
            )}

            {/* Trending Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-56 bg-white/5 rounded-3xl border border-white/5 animate-pulse" />
                    ))
                ) : trending.map((item) => {
                    const status = getStatusStyles(item.global_sentiment_score);
                    const isPositive = item.global_sentiment_score > 0;

                    return (
                        <div key={item.ticker} className={clsx(
                            "group relative overflow-hidden bg-slate-900/40 backdrop-blur-xl rounded-3xl border p-7 transition-all duration-500 hover:-translate-y-2 hover:bg-slate-900/60",
                            status.border, status.glow
                        )}>
                            <div className={clsx(
                                "absolute -right-8 -top-8 w-32 h-32 rounded-full blur-[60px] opacity-20 transition-all duration-700 group-hover:opacity-40",
                                isPositive ? "bg-emerald-500" : "bg-rose-600"
                            )} />

                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-white font-mono tracking-tighter">{item.ticker}</h3>
                                    <div className={clsx(
                                        "text-[9px] font-black px-2 py-1 rounded-full border uppercase tracking-widest mt-2 flex items-center gap-1",
                                        status.color, status.bg, status.border
                                    )}>
                                        <Activity size={10} /> {status.label}
                                    </div>
                                </div>
                                <div className={clsx(
                                    "p-3 rounded-2xl border backdrop-blur-md transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-lg",
                                    status.bg, status.border
                                )}>
                                    {isPositive ? <TrendingUp size={24} className={status.color} /> : <TrendingDown size={24} className={status.color} />}
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 leading-relaxed font-medium min-h-[48px] line-clamp-3">
                                {item.summary || "Analyse confidentielle cryptée par l'IA..."}
                            </p>

                            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-end">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block">Force du Signal</span>
                                    <span className={clsx("text-2xl font-black font-mono", status.color)}>
                                        {(item.global_sentiment_score * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">Expertise IA</span>
                                    <p className="text-xs text-white font-black bg-white/5 px-3 py-1 rounded-lg border border-white/10">{item.market_consensus}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {trending.length === 0 && !loading && !error && (
                <div className="p-20 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/5 border-dashed text-center">
                    <div className="w-16 h-16 bg-rose-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Activity size={32} className="text-rose-500/40" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">Canaux Silencieux</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">Le Watchdog IA scanne actuellement les fréquences BVMT. Revenez dans quelques instants pour l'infiltration des données.</p>
                </div>
            )}
        </div>
    );
};

export default MarketInsightsView;
