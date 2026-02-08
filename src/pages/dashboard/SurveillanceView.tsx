import React, { useState } from 'react';
import SurveillanceAlerts from '../../components/widgets/SurveillanceAlerts';
import { alerts } from '../../utils/mockData';
import { ShieldAlert, Filter, Search, FileText, BarChart2, AlertTriangle, ShieldCheck } from 'lucide-react';

const SurveillanceView: React.FC = () => {
    const [filter, setFilter] = useState('all');

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

            {/* Header Stats for Regulator */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Volatilité Marché</p>
                    <p className="text-2xl font-bold text-slate-200">2.4% <span className="text-xs text-slate-600 font-normal">Indice VIX-TN</span></p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Anomalies Détectées</p>
                    <p className="text-2xl font-bold text-orange-400">12</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Alertes Critiques</p>
                    <p className="text-2xl font-bold text-red-500">3</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Enquêtes Ouvertes</p>
                    <p className="text-2xl font-bold text-blue-400">5</p>
                </div>
            </div>

            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-inner">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64 font-mono">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                        <input
                            type="text"
                            placeholder="RECHERCHE TICKER / ID..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-300 focus:border-slate-500 outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    <Filter size={16} className="text-slate-600 mr-2 shrink-0" />
                    {[
                        { id: 'all', label: 'TOUT LE FLUX', color: 'bg-slate-700 border-slate-600' },
                        { id: 'Haute', label: 'CRITIQUE', color: 'bg-red-500/10 text-red-500 border-red-500/30' },
                        { id: 'Moyenne', label: 'SUSPICION', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
                    ].map(btn => (
                        <button
                            key={btn.id}
                            onClick={() => setFilter(btn.id)}
                            className={`px-4 py-1.5 rounded border text-[10px] font-bold tracking-tight uppercase transition-all shrink-0 ${filter === btn.id ? btn.color + ' ring-1 ring-slate-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Alerts Feed */}
                <div className="lg:col-span-3 space-y-6">
                    <SurveillanceAlerts
                        alerts={filter === 'all' ? alerts : alerts.filter(a => a.severity === filter)}
                        onInvestigate={(id) => console.log('Investigating alert:', id)}
                    />

                    {/* IA Explainability Section - Institutional UI */}
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none transition-all group-hover:bg-blue-500/10" />

                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <BarChart2 size={18} className="text-slate-400" /> Preuves Mathématiques IA (Explainability)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-widest flex items-center gap-2">
                                        <AlertTriangle size={12} className="text-orange-500" /> Corrélation Inhabituelle
                                    </p>
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        L'accumulation de titres a commencé <span className="text-white font-bold">42 minutes</span> avant la publication du communiqué financier.
                                        Coefficient de corrélation temporelle : <span className="text-orange-400 font-mono">0.89</span>.
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-widest flex items-center gap-2">
                                        <FileText size={12} className="text-blue-500" /> Profil des Acteurs
                                    </p>
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        <span className="text-white font-bold">3 comptes</span> inactifs depuis 12 mois ont soudainement exécuté des ordres de vente massifs pendant la phase de pré-ouverture.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col justify-between">
                                <div className="p-4 bg-slate-950 border border-slate-700 border-dashed rounded-lg border-opacity-50 h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-white mb-1">94%</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Indice de Confiance IA</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-3">
                                    <button className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded border border-slate-600 transition-all flex items-center justify-center gap-2">
                                        <FileText size={14} /> Générer Rapport d'Enquête
                                    </button>
                                    <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded border border-blue-500 shadow-lg shadow-blue-500/20 transition-all">
                                        Saisir le CMF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Regulation Status Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <ShieldCheck size={18} className="text-emerald-500" /> Certification IA
                        </h3>
                        <div className="space-y-4">
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Tous les modèles de détection sont conformes aux régulations ESMA/CMF v2.4.
                            </p>
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between text-[10px] text-slate-500">
                                    <span>Taux de Faux Positifs</span>
                                    <span className="text-emerald-400 font-mono">0.02%</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500">
                                    <span>Latence Analyse</span>
                                    <span className="text-white font-mono">14ms</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center">
                        <div className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center mb-4">
                            <ShieldAlert size={24} className="text-slate-500" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">Mode d'Investigation</h4>
                        <p className="text-[10px] text-slate-500 text-center">Vous agissez en tant qu'officier de conformité institué par le CMF.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurveillanceView;
