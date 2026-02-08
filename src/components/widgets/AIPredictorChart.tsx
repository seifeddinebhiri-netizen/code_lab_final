import React, { useState, useEffect } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine
} from 'recharts';
import { apiService } from '../../services/api';
import { TrendingUp, Activity, AlertCircle, Loader2 } from 'lucide-react';

interface AIPredictorChartProps {
    ticker: string;
}

const AIPredictorChart: React.FC<AIPredictorChartProps> = ({ ticker }) => {
    const [data, setData] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPredictions = async () => {
            if (!ticker) return;
            setLoading(true);
            setError(null);
            try {
                const response = await apiService.getPredictions(ticker);

                // Combine history and predictions for chart
                // History: {date, price} -> {date, price, type: 'history' }
                // Predictions: {date, predicted_price} -> {date, price, type: 'prediction'}

                const historyFormatted = response.history.map((h: any) => ({
                    date: h.date,
                    price: h.price,
                    type: 'history'
                }));

                const predictionsFormatted = response.predictions.map((p: any) => ({
                    date: p.date,
                    prediction: p.predicted_price,
                    type: 'prediction'
                }));

                // For a continuous line, the last history point should be the first prediction point's start
                // Or we just merge them. To have dashed line, we need separate data series in Recharts.

                const combined = [...historyFormatted, ...predictionsFormatted];
                setData(combined);
                setMetrics(response.metrics);
            } catch (err: any) {
                console.error("Failed to fetch predictions:", err);
                setError(err.message || "Impossible de charger les prédictions.");
            } finally {
                setLoading(false);
            }
        };

        fetchPredictions();
    }, [ticker]);

    if (loading) {
        return (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 bg-slate-900/20 rounded-xl border border-slate-800">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p className="text-sm font-medium">Analyse des flux BVMT par l'IA...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-64 flex flex-col items-center justify-center text-rose-500 bg-rose-500/5 rounded-xl border border-rose-500/20 p-4 text-center">
                <AlertCircle className="mb-2" size={32} />
                <p className="text-sm font-bold">{error}</p>
                <p className="text-xs text-slate-500 mt-2">Assurez-vous qu'un modèle existe pour {ticker}.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <TrendingUp size={20} className="text-emerald-400" />
                    Trajectoire Prévisionnelle : <span className="text-amber-500 uppercase">{ticker}</span>
                </h3>
                {metrics && (
                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-[10px] text-slate-500 uppercase font-black">Précision</p>
                            <p className="text-xs text-white font-bold">{metrics.Directional_Accuracy}%</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-500 uppercase font-black">Erreur (RMSE)</p>
                            <p className="text-xs text-white font-bold">{metrics.RMSE}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#64748b"
                            fontSize={10}
                            tickFormatter={(str) => str.split('-').slice(1).join('/')}
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={10}
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => `${value.toFixed(2)}`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                            itemStyle={{ fontWeight: 'bold' }}
                            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />

                        {/* Historical Line - Solid */}
                        <Line
                            name="Prix Historique"
                            type="monotone"
                            dataKey="price"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: '#3b82f6' }}
                        />

                        {/* Prediction Line - Dashed */}
                        <Line
                            name="Prédiction IA"
                            type="monotone"
                            dataKey="prediction"
                            stroke="#10b981"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                            activeDot={{ r: 6, fill: '#10b981' }}
                        />

                        {/* Split line */}
                        {data.findIndex(d => d.type === 'prediction') > 0 && (
                            <ReferenceLine
                                x={data[data.findIndex(d => d.type === 'prediction') - 1]?.date}
                                stroke="#f59e0b"
                                strokeDasharray="3 3"
                                label={{ value: 'PRÉSENT', position: 'top', fill: '#f59e0b', fontSize: 10, fontWeight: 'bold' }}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                <Activity size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                    <span className="text-emerald-400 font-bold uppercase tracking-wider">Note de l'IA :</span> Les prédictions sont basées sur un modèle hybride Prophet + XGBoost. La ligne pointillée indique une projection statistique sur 5 jours glissants. Ne constitue pas un conseil en investissement.
                </p>
            </div>
        </div>
    );
};

export default AIPredictorChart;
