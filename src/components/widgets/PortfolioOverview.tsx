import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { PortfolioAsset } from '../../utils/mockData';
import { Lightbulb, TrendingUp, Wallet, Activity, ShieldAlert, PlusCircle } from 'lucide-react';

interface PortfolioOverviewProps {
    assets: PortfolioAsset[];
    capital?: number; // Optional prop to override calculated capital
}

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444'];

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ assets, capital }) => {
    const data = assets.map(asset => ({
        name: asset.symbol,
        value: asset.allocation
    }));

    // Use provided capital if available (e.g. 0), otherwise fallback to sum of assets
    const calculatedTotal = assets.reduce((acc, curr) => acc + curr.totalValue, 0);
    const totalValue = capital !== undefined ? capital : calculatedTotal;

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg hover:shadow-gold transition-all duration-300 flex flex-col h-full">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-gold-500">◆</span> Mon Portefeuille
            </h2>

            {/* Performance Cards - Show 'Deposit Funds' if capital is 0 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                {/* Capital Card with Conditional Button */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-gold-500/50 transition-colors group relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm">
                        <Wallet size={16} className="text-gold-500" /> Capital Total
                    </div>

                    {totalValue === 0 ? (
                        <div>
                            <p className="text-2xl font-bold text-white mb-2">0 <span className="text-xs font-normal text-slate-500">TND</span></p>
                            <button className="w-full py-1 px-2 bg-gold-500 hover:bg-gold-400 text-midnight text-xs font-bold rounded flex items-center justify-center gap-1 transition-colors">
                                <PlusCircle size={12} /> Déposer
                            </button>
                        </div>
                    ) : (
                        <p className="text-2xl font-bold text-white max-w-full truncate" title={totalValue.toLocaleString()}>
                            {totalValue.toLocaleString()} <span className="text-xs font-normal text-slate-500">TND</span>
                        </p>
                    )}
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-gold-500/50 transition-colors group">
                    <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm">
                        <TrendingUp size={16} className="text-emerald-400" /> ROI Global
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">+12.4%</p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-gold-500/50 transition-colors group">
                    <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm">
                        <Activity size={16} className="text-blue-400" /> Sharpe Ratio
                    </div>
                    <p className="text-2xl font-bold text-white">1.85</p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-gold-500/50 transition-colors group">
                    <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm">
                        <ShieldAlert size={16} className="text-orange-500" /> Max Drawdown
                    </div>
                    <p className="text-2xl font-bold text-neon-red">-5.2%</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row items-center gap-6">
                <div className="h-48 w-48 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data as any}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }}
                                itemStyle={{ color: '#F59E0B' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <p className="text-xs text-slate-500">Total (TND)</p>
                        <p className="font-bold text-white text-md">{(totalValue / 1000).toFixed(1)}k</p>
                    </div>
                </div>

                <div className="flex-1 space-y-3 w-full">
                    {assets.map((asset, index) => (
                        <div key={asset.symbol} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-slate-300">{asset.symbol}</span>
                            </div>
                            <span className="font-mono text-white">{asset.allocation}%</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700">
                <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg border border-dashed border-slate-600">
                    <Lightbulb className="text-gold-400 shrink-0 mt-1" size={18} />
                    <div>
                        <h4 className="text-gold-400 font-bold text-sm mb-1">Optimisation IA</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Votre exposition à <span className="text-white font-semibold">BIAT</span> (45%) dépasse le seuil de risque modéré. Envisagez une redistribution vers <span className="text-white font-semibold">Euro-Cycles</span> pour diversifier.
                        </p>
                    </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>Performance globale (YTD)</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <TrendingUp size={12} /> +12.4%
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PortfolioOverview;
