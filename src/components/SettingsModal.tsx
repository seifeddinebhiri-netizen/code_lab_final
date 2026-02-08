import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Globe } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: { full_name?: string, role?: string, email?: string } | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-[#111827] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                <span className="w-2 h-2 bg-rose-600 rounded-full animate-pulse" />
                                Configuration BoursaGPT
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Profile Section (Read-only) */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-gold-500 mb-2">
                                    <User size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Informations Profil</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Nom Complet</p>
                                        <p className="text-sm text-white font-medium">{user?.full_name || 'BoursaGPT'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Rôle</p>
                                            <p className="text-sm text-gold-500 font-bold capitalize">{user?.role || 'Guest'}</p>
                                        </div>
                                        <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Email</p>
                                            <p className="text-sm text-white font-medium truncate">{user?.email || 'contact@boursagpt.tn'}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Language Section */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-gold-500 mb-2">
                                    <Globe size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Langue de l'interface</span>
                                </div>
                                <div className="relative">
                                    <select className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 appearance-none cursor-pointer hover:border-slate-700 transition-all">
                                        <option>Français (Tunisie)</option>
                                        <option>English (Global)</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <Globe size={14} />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-800 flex justify-end bg-slate-900/30">
                            <button
                                onClick={onClose}
                                className="px-8 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 hover:scale-105 transition-all text-xs uppercase tracking-widest border border-slate-700 shadow-xl"
                            >
                                Fermer
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SettingsModal;
