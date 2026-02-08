import React from 'react';
import PortfolioOverview from '../../components/widgets/PortfolioOverview';
import { portfolio } from '../../utils/mockData';
import { History, ArrowUpRight, ShieldCheck, AlertCircle, TrendingUp, Wallet, ArrowDownRight } from 'lucide-react';
import clsx from 'clsx';

interface PortfolioViewProps {
    capital?: number;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ capital }) => {
    // Mock risk profile from local storage if needed, or assume 'Equilibré'
    const storedUser = localStorage.getItem('user');
    const userProfile = storedUser ? JSON.parse(storedUser).risk_profile || 'balance' : 'balance';

    return (
        <div className="min-h-full bg-gradient-to-br from-slate-950 via-slate-900 to-black p-4 md:p-8 rounded-[2.5rem] shadow-2xl border border-white/5 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">

                {/* Top Stats - Glassmorphism */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Performance YTD', value: '+12.4%', color: 'text-emerald-400', font: 'font-mono' },
                        { label: 'Meilleure Valeur (P&L)', value: 'BIAT', color: 'text-white', font: 'font-sans' },
                        { label: 'Score Santé Portefeuille', value: '82/100', color: 'text-amber-500', font: 'font-sans', icon: ShieldCheck },
                        { label: 'Dividendes Prévus', value: '1,120', suffix: 'TND', color: 'text-white', font: 'font-mono' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-xl shadow-black/20 hover:scale-105 transition-all duration-300 group">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em] mb-2 group-hover:text-amber-400/80 transition-colors">{stat.label}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-baseline gap-2">
                                    <p className={clsx("text-3xl font-bold transition-all", stat.color, stat.font)}>
                                        {stat.value}
                                    </p>
                                    {stat.suffix && <span className="text-xs text-slate-500 font-bold">{stat.suffix}</span>}
                                </div>
                                {stat.icon && <stat.icon className="text-emerald-400 shadow-emerald-500/20" size={24} />}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-xl shadow-black/20 overflow-hidden">
                        <PortfolioOverview assets={portfolio} capital={capital} />
                    </div>

                    {/* Personal Protection Alerts */}
                    <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-black/20 relative overflow-hidden group">
                        <div className="absolute -top-4 -right-4 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all"></div>

                        <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-lg">
                            <AlertCircle size={20} className="text-rose-500" /> Protection de vos Gains
                        </h3>

                        <div className="grid gap-4">
                            <div className="flex flex-col md:flex-row items-center justify-between p-5 bg-slate-900/40 border border-slate-700/30 rounded-xl gap-4 hover:border-rose-500/30 transition-all">
                                <div>
                                    <p className="text-sm text-white font-bold mb-1">Alerte de baisse sur SFBT</p>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        L'IA détecte une pression vendeuse institutionnelle. Risque de retour sur support à <span className="text-white font-bold">11.500 TND</span>.
                                    </p>
                                </div>
                                <button className="px-6 py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold rounded-xl hover:bg-rose-500 hover:text-white transition-all duration-300 hover:scale-105 whitespace-nowrap shadow-lg shadow-rose-500/5">
                                    Protéger mes gains (Vendre)
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between p-5 bg-slate-900/40 border border-slate-700/30 rounded-xl gap-4 hover:border-emerald-500/30 transition-all">
                                <div>
                                    <p className="text-sm text-white font-bold mb-1">Opportunité d'achat : Euro-Cycles</p>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Correction de -4% terminée. Les volumes indiquent un rebond imminent vers <span className="text-white font-bold">14.200 TND</span>.
                                    </p>
                                </div>
                                <button className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all duration-300 hover:scale-105 whitespace-nowrap flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                                    <TrendingUp size={14} /> Renforcer ma position
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Advice & Profile Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border-l-4 border-amber-500 border-t border-r border-b border-slate-700/50 shadow-xl shadow-black/20 relative group">
                        <div className="absolute top-4 right-4 px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-midnight text-[8px] font-black rounded uppercase tracking-widest shadow-lg shadow-amber-500/20">Conseillé AI</div>

                        <h3 className="text-amber-500 font-bold mb-6 flex items-center gap-2 text-lg">
                            <Wallet size={20} className="text-amber-400" /> Profil <span className="text-white font-black capitalize px-2 py-0.5 bg-slate-700/50 rounded border border-slate-600/50 text-xs">{userProfile}</span>
                        </h3>

                        <div className="space-y-6">
                            <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-slate-700/50 pl-4 py-1">
                                "Basé sur votre profil <span className="text-amber-400 font-bold uppercase tracking-wider">{userProfile}</span>, l'IA suggère de maintenir vos positions sur les bancaires (BIAT) mais de réduire l'exposition à l'agroalimentaire (SFBT)."
                            </p>

                            <div className="pt-4 border-t border-slate-700/30">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Volatilité tolérée</span>
                                    <span className="text-xs text-emerald-400 font-bold">MODÉRÉE</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                    <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 w-[65%] shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-slate-900/50 border border-slate-700/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] rounded-xl hover:bg-slate-800 hover:text-white hover:border-amber-500/50 transition-all duration-300 hover:scale-105">
                                Refaire le Questionnaire
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-xl shadow-black/20 group">
                        <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                            <History size={18} className="text-slate-500 group-hover:text-amber-400 transition-colors" /> Activité Récente
                        </h3>
                        <div className="space-y-4">
                            {[
                                { type: 'Buy', stock: 'BIAT', time: 'Il y a 2h', amount: '+5 titres', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                                { type: 'Sell', stock: 'SAH', time: 'Hier', amount: '-10 titres', color: 'text-rose-500', bg: 'bg-rose-500/10' },
                            ].map((tx, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-slate-900/40 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={clsx("p-2 rounded-lg", tx.bg)}>
                                            {tx.type === 'Buy' ? <ArrowUpRight size={16} className={tx.color} /> : <ArrowDownRight size={16} className={tx.color} />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase text-white tracking-widest">{tx.stock}</p>
                                            <p className="text-[10px] text-slate-500 font-bold">{tx.time}</p>
                                        </div>
                                    </div>
                                    <span className={clsx("text-xs font-mono font-black", tx.color)}>{tx.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortfolioView;
