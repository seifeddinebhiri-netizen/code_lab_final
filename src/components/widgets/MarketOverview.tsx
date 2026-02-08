import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { MarketIndex, Stock } from '../../utils/mockData';

interface MarketOverviewProps {
    indices: MarketIndex[];
    topGainers: Stock[];
    topLosers: Stock[];
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ indices, topGainers, topLosers }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Indices Section */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden group hover:border-gold-500/30 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-bl-full group-hover:bg-gold-500/10 transition-colors" />
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="text-gold-500" /> Indices BVMT
                </h2>

                <div className="space-y-4">
                    {indices.map((idx) => (
                        <div key={idx.name} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                            <div>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">{idx.name}</p>
                                <p className="text-2xl font-mono text-white tracking-widest">{idx.value.toFixed(2)}</p>
                            </div>
                            <div className={`text-right ${idx.change >= 0 ? 'text-emerald-400' : 'text-neon-red'}`}>
                                <div className="flex items-center justify-end gap-1 font-bold">
                                    {idx.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                    <span>{Math.abs(idx.changePercent)}%</span>
                                </div>
                                <p className="text-xs text-slate-500">{idx.change > 0 ? '+' : ''}{idx.change}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Gainers Section */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full group-hover:bg-emerald-500/10 transition-colors" />
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <ArrowUpRight className="text-emerald-500" /> Top Gagnants
                </h2>
                <div className="space-y-3">
                    {topGainers.map((stock) => (
                        <div key={stock.symbol} className="flex justify-between items-center border-b border-slate-700 pb-2 last:border-0 last:pb-0">
                            <div>
                                <span className="font-bold text-slate-200">{stock.symbol}</span>
                                <p className="text-xs text-slate-500 truncate w-32">{stock.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-emerald-400 font-bold">+{stock.changePercent}%</p>
                                <p className="text-slate-400 text-sm">{stock.price} TND</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Losers Section */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden group hover:border-neon-red/30 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-neon-red/5 rounded-bl-full group-hover:bg-neon-red/10 transition-colors" />
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <ArrowDownRight className="text-neon-red" /> Top Perdants
                </h2>
                <div className="space-y-3">
                    {topLosers.map((stock) => (
                        <div key={stock.symbol} className="flex justify-between items-center border-b border-slate-700 pb-2 last:border-0 last:pb-0">
                            <div>
                                <span className="font-bold text-slate-200">{stock.symbol}</span>
                                <p className="text-xs text-slate-500 truncate w-32">{stock.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-neon-red font-bold">{stock.changePercent}%</p>
                                <p className="text-slate-400 text-sm">{stock.price} TND</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MarketOverview;
