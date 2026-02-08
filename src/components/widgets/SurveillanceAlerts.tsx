import { AlertTriangle, Siren, Activity, Search } from 'lucide-react';
import { Alert } from '../../utils/mockData';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface SurveillanceAlertsProps {
    alerts: Alert[];
    onInvestigate?: (id: string) => void;
}

const SurveillanceAlerts: React.FC<SurveillanceAlertsProps> = ({ alerts, onInvestigate }) => {
    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-full shadow-lg relative">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 border-b border-slate-700 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Siren className="text-neon-red animate-pulse" /> Surveillance CMF
                </h2>
                <span className="bg-neon-red/10 text-neon-red text-xs px-2 py-1 rounded border border-neon-red/20 font-mono animate-pulse">
                    LIVE
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
                </div>

                <AnimatePresence>
                    {alerts.map((alert) => (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={clsx(
                                "p-3 rounded-lg border-l-4 shadow-md relative group hover:scale-[1.02] transition-transform duration-200 flex flex-col gap-2", // Hover effect
                                alert.severity === 'high' ? "bg-red-900/10 border-neon-red shadow-[0_0_10px_rgba(239,68,68,0.1)]" :
                                    alert.severity === 'medium' ? "bg-orange-900/10 border-orange-500" : "bg-slate-700/30 border-slate-500"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <span className={clsx(
                                    "font-bold text-sm",
                                    alert.severity === 'high' ? "text-neon-red" : "text-orange-400"
                                )}>
                                    {alert.symbol}
                                </span>
                                <span className="text-xs text-slate-500 font-mono">{alert.timestamp}</span>
                            </div>
                            <p className="text-sm text-slate-300 font-medium leading-tight">{alert.message}</p>

                            <div className="flex items-center justify-between mt-1">
                                <span className={clsx(
                                    "text-[10px] uppercase font-bold px-2 py-0.5 rounded border",
                                    alert.severity === 'high' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                        alert.severity === 'medium' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                )}>
                                    Priorité {alert.severity === 'high' ? 'Haute' : alert.severity === 'medium' ? 'Moyenne' : 'Basse'}
                                </span>

                                <button
                                    onClick={() => onInvestigate && onInvestigate(alert.id)}
                                    className="text-xs flex items-center gap-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1 rounded transition-colors"
                                >
                                    <Search size={12} /> Investiguer
                                </button>
                            </div>

                            {alert.severity === 'high' && (
                                <div className="mt-1 flex items-center gap-2 text-xs text-neon-red font-bold uppercase tracking-wider border-t border-red-900/30 pt-2">
                                    <AlertTriangle size={12} />
                                    Anomalie Critique
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {alerts.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 text-slate-500">
                        <Activity size={32} className="mb-2 opacity-50" />
                        <p className="text-sm">Aucune anomalie détectée</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SurveillanceAlerts;
