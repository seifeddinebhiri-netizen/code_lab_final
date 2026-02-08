import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { specificStock } from '../../utils/mockData'; // Assuming stock structure
import clsx from 'clsx';
import { Target, Activity } from 'lucide-react';

interface StockAnalysisProps {
    stock: typeof specificStock;
}

const StockAnalysis: React.FC<StockAnalysisProps> = ({ stock }) => {
    // Combine history and forecast for the chart
    const data = [
        ...stock.history.map(d => ({ name: d.day, price: d.price, type: 'history' })),
        ...stock.forecast.map(d => ({ name: d.day, price: d.price, type: 'forecast' })),
    ];

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 col-span-2 lg:col-span-2 shadow-lg hover:shadow-gold transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Activity className="text-gold-500" /> Analyse IA: <span className="text-gold-400">{stock.symbol}</span>
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Comparaison Historique vs Prévision (5 Jours)</p>
                </div>
                <div className="text-right">
                    <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg">
                        <span className="text-xs text-slate-500 uppercase tracking-widest">Recommandation</span>
                        <p className={clsx(
                            "text-xl font-bold mt-1",
                            stock.indicators.recommendation === 'Achat' ? "text-emerald-400" :
                                stock.indicators.recommendation === 'Vente' ? "text-neon-red" : "text-gold-400"
                        )}>
                            {stock.indicators.recommendation.toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="h-64 w-full bg-slate-900/50 rounded-lg p-2 border border-slate-700/50 relative">
                <div className="absolute top-2 left-4 z-10 flex gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        <span className="text-xs text-slate-400">Historique</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-gold-500"></span>
                        <span className="text-xs text-slate-400">Prévision IA</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }}
                            itemStyle={{ color: '#F59E0B' }}
                            cursor={{ stroke: '#475569', strokeWidth: 1 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#F59E0B"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex flex-col items-center">
                    <span className="text-xs text-slate-500 mb-1">RSI (14)</span>
                    <span className={clsx("text-lg font-bold", stock.indicators.rsi > 70 ? "text-neon-red" : stock.indicators.rsi < 30 ? "text-emerald-400" : "text-white")}>
                        {stock.indicators.rsi}
                    </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex flex-col items-center">
                    <span className="text-xs text-slate-500 mb-1">MACD</span>
                    <span className="text-lg font-bold text-emerald-400">
                        {stock.indicators.macd}
                    </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex flex-col items-center group cursor-pointer hover:border-gold-500 transition-colors">
                    <span className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Target size={12} /> Confiance IA</span>
                    <span className="text-lg font-bold text-gold-400">92%</span>
                </div>
            </div>
        </div>
    );
};

export default StockAnalysis;
