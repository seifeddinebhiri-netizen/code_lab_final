import React, { useState, useEffect, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ScriptableContext
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Activity, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface StockAnalysisProps {
    ticker: string;
}

const StockAnalysis: React.FC<StockAnalysisProps> = ({ ticker }) => {
    const [loading, setLoading] = useState(false);

    // Mock Data Generation
    const mockData = useMemo(() => {
        const generatePrices = (start: number, count: number, volatility: number, trend: number = 0) => {
            let prices = [start];
            for (let i = 1; i < count; i++) {
                const change = (Math.random() - 0.5) * volatility + trend;
                prices.push(prices[i - 1] + change);
            }
            return prices;
        };

        const today = new Date();
        const labels = [];
        for (let i = 30; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            labels.push(d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
        }

        const futureLabels = [];
        for (let i = 1; i <= 5; i++) {
            const d = new Date();
            d.setDate(today.getDate() + i);
            futureLabels.push(d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
        }

        let history: number[] = [];
        let forecast: number[] = [];

        if (ticker === 'SFBT') {
            // SFBT: Simule une légère correction suivie d'un rebond vers 14.200 TND.
            history = generatePrices(14.5, 31, 0.1, -0.02);
            const last = history[history.length - 1];
            forecast = [last, last + 0.05, last + 0.1, last + 0.15, last + 0.25];
        } else if (ticker === 'BIAT') {
            // BIAT: Simule une tendance haussière solide.
            history = generatePrices(125, 31, 1.5, 0.5);
            const last = history[history.length - 1];
            forecast = [last, last + 1.2, last + 2.5, last + 3.8, last + 5.0];
        } else {
            // ATTIJARI: Simule une stabilité avec une volatilité modérée.
            history = generatePrices(48, 31, 0.3, 0);
            const last = history[history.length - 1];
            forecast = [last, last + 0.05, last - 0.1, last + 0.2, last - 0.05];
        }

        return {
            labels: [...labels, ...futureLabels],
            history,
            forecast: [...Array(30).fill(null), ...forecast],
            allData: [...history, ...forecast.slice(1)]
        };
    }, [ticker]);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, [ticker]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: { family: 'Bebas Neue', size: 16 },
                bodyFont: { family: 'Bebas Neue', size: 20 },
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: (context: any) => `${context.parsed.y.toFixed(3)} TND`
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#64748b', font: { size: 10 } }
            },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#64748b', font: { size: 10 } }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index' as const,
        },
    };

    const data = {
        labels: mockData.labels,
        datasets: [
            {
                label: 'Historique',
                data: mockData.history,
                borderColor: '#ef4444', // Dali Red
                backgroundColor: (context: ScriptableContext<'line'>) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.2)');
                    gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
                    return gradient;
                },
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#ef4444',
                pointHoverBorderColor: '#fff',
            },
            {
                label: 'Prédiction IA',
                data: mockData.forecast,
                borderColor: '#f59e0b', // Gold
                borderDash: [5, 5],
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#f59e0b',
                pointHoverBorderColor: '#fff',
            }
        ],
    };

    if (loading) {
        return (
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-12 flex flex-col items-center justify-center shadow-2xl h-[480px]">
                <Loader2 className="text-rose-600 animate-spin mb-4" size={48} />
                <p className="text-rose-500 font-black tracking-widest uppercase text-xs">Initialisation de l'Algorithme Dali...</p>
            </div>
        );
    }

    const lastPrice = mockData.history[mockData.history.length - 1];
    const finalPred = mockData.forecast[mockData.forecast.length - 1] as number;
    const isBullish = finalPred > lastPrice;

    return (
        <div className="bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden group">
            {/* Scan Animation Line */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent absolute top-0 animate-scan" />
            </div>

            <style>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 4s linear infinite;
                }
            `}</style>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Activity size={16} className="text-rose-600 animate-pulse" />
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">IA Predictive Engine v2.0</span>
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                        ANALYSE: <span className="text-rose-600 font-mono">{ticker}</span>
                    </h2>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-right backdrop-blur-md">
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Signal IA</span>
                        <p className={clsx(
                            "text-xl font-black mt-1 flex items-center gap-2 justify-end",
                            isBullish ? "text-emerald-400" : "text-rose-500"
                        )}>
                            {isBullish ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                            {isBullish ? 'ACHAT' : 'VENTE'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="h-[300px] w-full relative">
                <Line options={chartOptions} data={data} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 mb-2 uppercase font-black tracking-[0.2em]">Confiance IA</span>
                    <div className="flex items-center gap-2">
                        <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-600" style={{ width: '88%' }}></div>
                        </div>
                        <span className="text-xl font-black text-white font-mono">88%</span>
                    </div>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 mb-2 uppercase font-black tracking-[0.2em]">Volatilité PRÉVUE</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">BASSE</span>
                </div>

                <div className="bg-rose-600/10 p-4 rounded-2xl border border-rose-600/20 flex flex-col items-center group cursor-pointer hover:bg-rose-600/20 transition-all">
                    <span className="text-[10px] text-rose-500 mb-2 uppercase font-black tracking-[0.2em]">Objectif 5J</span>
                    <span className="text-xl font-black text-white font-mono">{finalPred.toFixed(3)} TND</span>
                </div>
            </div>
        </div>
    );
};

export default StockAnalysis;
