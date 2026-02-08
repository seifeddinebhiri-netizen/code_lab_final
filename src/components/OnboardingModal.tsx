import React from 'react';
import { ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingModalProps {
    onComplete: (profile: string) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {


    const profiles = [
        { id: 'safe', label: 'Conservateur', icon: ShieldCheck, color: 'text-emerald-400', desc: 'Priorité à la sécurité du capital.' },
        { id: 'moderate', label: 'Modéré', icon: TrendingUp, color: 'text-blue-400', desc: 'Équilibre entre risque et rendement.' },
        { id: 'risky', label: 'Offensif', icon: Zap, color: 'text-neon-red', desc: 'Maximisation des gains, volatilité acceptée.' },
    ];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-700 p-8 rounded-2xl max-w-2xl w-full text-center relative overflow-hidden shadow-2xl shadow-gold/20"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-blue-500 to-neon-red" />

                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Bienvenue sur <span className="text-gold-500">Project ORO</span></h2>
                    <p className="text-slate-400 mb-8">Pour personnaliser l'IA, définissez votre profil d'investisseur.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {profiles.map((profile) => {
                            const Icon = profile.icon;
                            return (
                                <motion.button
                                    key={profile.id}
                                    whileHover={{ scale: 1.05, borderColor: '#F59E0B' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onComplete(profile.id)}
                                    className="bg-slate-800 border border-slate-700 p-6 rounded-xl flex flex-col items-center gap-4 transition-colors hover:bg-slate-700 group"
                                >
                                    <div className={`p-4 rounded-full bg-slate-900 border border-slate-600 group-hover:border-gold-500/50 transition-colors`}>
                                        <Icon size={32} className={profile.color} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{profile.label}</h3>
                                    <p className="text-xs text-slate-400 leading-relaxed">{profile.desc}</p>
                                </motion.button>
                            );
                        })}
                    </div>

                    <p className="mt-8 text-xs text-slate-600 uppercase tracking-widest">IA Powered by Google DeepMind & BVMT Data</p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default OnboardingModal;
