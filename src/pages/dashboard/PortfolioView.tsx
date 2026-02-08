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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

            {/* Top Stats specifically for Investors */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 shadow-lg">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Performance YTD</p>
                    <p className="text-2xl font-bold text-emerald-400 font-mono">+12.4%</p>
                </div>
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 shadow-lg">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Meilleure Valeur (P&L)</p>
                    <p className="text-2xl font-bold text-white">BIAT</p>
                </div>
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 shadow-lg">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Score Santé Portefeuille</p>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-gold-500">82/100</p>
                        <ShieldCheck size={20} className="text-emerald-500 mb-1" />
                    </div>
                </div>
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 shadow-lg">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Dividendes Prévus</p>
                    <p className="text-2xl font-bold text-white font-mono">1,120 <span className="text-xs text-slate-500">TND</span></p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
                <PortfolioOverview assets={portfolio} capital={capital} />

                {/* Personal Protection Alerts */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all"></div>

                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <AlertCircle size={18} className="text-neon-red" /> Protection de vos Gains
                    </h3>

                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-lg gap-4">
                            <div>
                                <p className="text-sm text-white font-bold mb-1">Alerte de baisse sur SFBT</p>
                                <p className="text-xs text-slate-400">
                                    L'IA détecte une pression vendeuse institutionnelle. Risque de retour sur support à 11.500 TND.
                                </p>
                            </div>
                            <button className="px-4 py-2 bg-neon-red/10 border border-neon-red/30 text-neon-red text-xs font-bold rounded-lg hover:bg-neon-red hover:text-white transition-all whitespace-nowrap">
                                Protéger mes gains (Vendre)
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-lg gap-4">
                            <div>
                                <p className="text-sm text-white font-bold mb-1">Opportunité d'achat : Euro-Cycles</p>
                                <p className="text-xs text-slate-400">
                                    Correction de -4% terminée. Les volumes indiquent un rebond imminent vers 14.200 TND.
                                </p>
                            </div>
                            <button className="px-4 py-2 bg-emerald-500 text-midnight text-xs font-bold rounded-lg hover:bg-emerald-400 transition-all whitespace-nowrap flex items-center gap-1">
                                <TrendingUp size={14} /> Renforcer ma position
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Advice & Profile Section */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-gradient-to-br from-midnight to-slate-900 p-6 rounded-xl border border-gold-500/20 shadow-2xl relative">
                    <div className="absolute top-2 right-2 px-2 py-1 bg-gold-500 text-midnight text-[8px] font-bold rounded uppercase tracking-tighter shadow-gold">Conseiller AI</div>

                    <h3 className="text-gold-500 font-bold mb-4 flex items-center gap-2">
                        <Wallet size={18} /> Profil: <span className="text-white capitalize px-2 py-0.5 bg-slate-800 rounded text-xs">{userProfile}</span>
                    </h3>

                    <div className="space-y-4">
                        <p className="text-xs text-slate-300 leading-relaxed italic">
                            "Basé sur votre profil <span className="text-gold-400 font-bold">{userProfile}</span>, l'IA suggère de maintenir vos positions sur les bancaires (BIAT) mais de réduire l'exposition à l'agroalimentaire (SFBT)."
                        </p>

                        <div className="pt-4 border-t border-slate-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-slate-500">Volatilité tolérée</span>
                                <span className="text-xs text-white">Modérée</span>
                            </div>
                            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gold-500 w-[65%]"></div>
                            </div>
                        </div>

                        <button className="w-full mt-4 py-3 bg-slate-800 border border-gold-500/30 text-gold-500 text-xs font-bold rounded-lg hover:bg-gold-500 hover:text-midnight transition-all">
                            Refaire le Questionnaire
                        </button>
                    </div>
                </div>

                <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <History size={18} className="text-slate-400" /> Activité Récente
                    </h3>
                    <div className="space-y-4">
                        {[
                            { type: 'Buy', stock: 'BIAT', time: 'Il y a 2h', amount: '+5 titres', color: 'text-emerald-400' },
                            { type: 'Sell', stock: 'SAH', time: 'Hier', amount: '-10 titres', color: 'text-neon-red' },
                        ].map((tx, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className={clsx("p-1.5 rounded bg-slate-800", tx.color.replace('text', 'bg')) + "/10"}>
                                        {tx.type === 'Buy' ? <ArrowUpRight size={14} className={tx.color} /> : <ArrowDownRight size={14} className={tx.color} />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase text-white">{tx.stock}</p>
                                        <p className="text-[10px] text-slate-500">{tx.time}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-mono text-slate-300 font-bold">{tx.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortfolioView;
