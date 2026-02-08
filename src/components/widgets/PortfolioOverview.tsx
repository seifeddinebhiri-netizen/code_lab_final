import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { PortfolioAsset } from '../../utils/mockData';
import { Lightbulb, TrendingUp, Wallet, Activity, ShieldAlert, PlusCircle, X } from 'lucide-react';
import { apiService } from '../../services/api';
import clsx from 'clsx';

interface PortfolioOverviewProps {
    assets: PortfolioAsset[];
    capital?: number;
}

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444'];

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ assets, capital }) => {
    const [showModal, setShowModal] = useState(false);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    // Local state for capital to allow instant updates
    const calculatedTotal = assets.reduce((acc, curr) => acc + curr.totalValue, 0);
    const [localCapital, setLocalCapital] = useState<number>(capital !== undefined ? capital : calculatedTotal);

    // Sync with props if they change
    useEffect(() => {
        if (capital !== undefined) setLocalCapital(capital);
    }, [capital]);

    const data = assets.map(asset => ({
        name: asset.symbol,
        value: asset.allocation
    }));

    const handleDeposit = async () => {
        const depositAmount = parseFloat(amount);
        if (isNaN(depositAmount) || depositAmount <= 0) {
            alert("Veuillez saisir un montant valide (supérieur à 0).");
            return;
        }

        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;
        const userId = JSON.parse(storedUser).id;

        setLoading(true);
        try {
            const response = await apiService.addFunds(userId, depositAmount);
            if (response.success) {
                // Update local visual capital
                const newTotal = localCapital + depositAmount;
                setLocalCapital(newTotal);

                // Update localStorage to keep consistency across navigation
                const user = JSON.parse(storedUser);
                user.capital = newTotal;
                localStorage.setItem('user', JSON.stringify(user));

                setShowModal(false);
                setAmount('');
            }
        } catch (error) {
            console.error("Dépôt échoué:", error);
            alert("Erreur lors du dépôt. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-transparent p-6 flex flex-col h-full group/main">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></div>
                Mon Portefeuille
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-900/40 backdrop-blur-sm p-4 rounded-xl border border-slate-700/30 hover:border-amber-500/30 transition-all duration-300 group/card relative overflow-hidden shadow-lg">
                    <div className="flex items-center gap-2 mb-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        <Wallet size={14} className="text-amber-400" /> Capital Total
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white mb-2 font-mono">
                            {localCapital.toLocaleString()} <span className="text-xs font-normal text-slate-500">TND</span>
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="w-full py-2 px-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-midnight text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-1 transition-all duration-300 hover:scale-105 shadow-lg shadow-amber-500/20"
                        >
                            <PlusCircle size={12} /> Déposer
                        </button>
                    </div>
                </div>

                {[
                    { label: 'ROI Global', value: '+12.4%', color: 'text-emerald-400', icon: TrendingUp },
                    { label: 'Sharpe Ratio', value: '1.85', color: 'text-white', icon: Activity, iconColor: 'text-blue-400' },
                    { label: 'Max Drawdown', value: '-5.2%', color: 'text-rose-500', icon: ShieldAlert, iconColor: 'text-orange-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-900/40 backdrop-blur-sm p-4 rounded-xl border border-slate-700/30 hover:border-slate-500/30 transition-all duration-300 group/card shadow-lg">
                        <div className="flex items-center gap-2 mb-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest text-nowrap">
                            <stat.icon size={14} className={stat.iconColor || stat.color} /> {stat.label}
                        </div>
                        <p className={clsx("text-2xl font-bold font-mono", stat.color)}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="flex-1 flex flex-col md:flex-row items-center gap-10">
                <div className="h-56 w-56 relative group/chart">
                    <div className="absolute inset-0 bg-amber-500/5 rounded-full blur-3xl group-hover/chart:bg-amber-500/10 transition-all"></div>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data as any}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={85}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        style={{ filter: `drop-shadow(0 0 6px ${COLORS[index % COLORS.length]}80)` }}
                                    />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                    borderColor: 'rgba(51, 65, 85, 0.5)',
                                    borderRadius: '12px',
                                    backdropFilter: 'blur(8px)',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)'
                                }}
                                itemStyle={{ color: '#F59E0B', fontWeight: 'bold' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Valeur</p>
                        <p className="font-black text-white text-xl font-mono">{(localCapital / 1000).toFixed(1)}k</p>
                    </div>
                </div>

                <div className="flex-1 space-y-4 w-full">
                    <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4">Allocation Actifs</h4>
                    {assets.map((asset, index) => (
                        <div key={asset.symbol} className="group/item">
                            <div className="flex justify-between items-center text-sm mb-1.5">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: COLORS[index % COLORS.length], boxShadow: `0 0 10px ${COLORS[index % COLORS.length]}40` }}></div>
                                    <span className="text-slate-300 font-bold group-hover/item:text-white transition-colors">{asset.symbol}</span>
                                </div>
                                <span className="font-mono text-white font-bold">{asset.allocation}%</span>
                            </div>
                            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800/50">
                                <div
                                    className="h-full transition-all duration-1000 ease-out"
                                    style={{
                                        backgroundColor: COLORS[index % COLORS.length],
                                        width: `${asset.allocation}%`,
                                        boxShadow: `0 0 10px ${COLORS[index % COLORS.length]}40`
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* DEPOSIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-amber-500/10 rounded-xl">
                                <Wallet className="text-amber-500" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Déposer des fonds</h3>
                                <p className="text-sm text-slate-500">Ajoutez du capital à votre portefeuille</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Montant (TND)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Ex: 5000"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-750 transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDeposit}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-400 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {loading ? "Chargement..." : "Confirmer le Dépôt"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-700/30">
                <div className="flex items-start gap-4 bg-slate-900/50 p-4 rounded-xl border border-dashed border-slate-700 hover:border-amber-500/30 transition-colors">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                        <Lightbulb className="text-amber-400 shrink-0" size={20} />
                    </div>
                    <div>
                        <h4 className="text-amber-400 font-black text-xs uppercase tracking-widest mb-1.5">Optimisation IA</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Votre exposition à <span className="text-white font-black uppercase tracking-wider underline decoration-amber-500/30">BIAT</span> (45%) dépasse le seuil de risque modéré. Envisagez une redistribution vers <span className="text-white font-black uppercase tracking-wider underline decoration-emerald-500/30">Euro-Cycles</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortfolioOverview;
