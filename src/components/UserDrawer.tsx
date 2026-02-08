import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Lock, Eye, EyeOff, CheckCircle, AlertTriangle, LogOut, User, Settings } from 'lucide-react';
import clsx from 'clsx';

interface UserDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    user: { full_name?: string, role?: string } | null;
    onLogout: () => void;
    onOpenSettings: () => void;
}

const UserDrawer: React.FC<UserDrawerProps> = ({ isOpen, onClose, user, onLogout, onOpenSettings }) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({
        type: null,
        message: ''
    });

    const [loading, setLoading] = useState(false);

    const toggleVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ type: null, message: '' });

        // Phase 1: Validation Front-end
        if (formData.newPassword !== formData.confirmPassword) {
            setStatus({ type: 'error', message: 'Les nouveaux mots de passe ne correspondent pas.' });
            return;
        }

        if (formData.newPassword.length < 6) {
            setStatus({ type: 'error', message: 'Le nouveau mot de passe doit faire au moins 6 caractères.' });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                setStatus({ type: 'success', message: 'Mot de passe mis à jour avec succès !' });
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });

                // Fermeture automatique après 2 secondes
                setTimeout(() => {
                    onClose();
                    setStatus({ type: null, message: '' });
                }, 2000);
            } else {
                // Gestion des erreurs API spécifiques
                let errorMsg = 'Erreur lors de la mise à jour';
                if (response.status === 404) errorMsg = 'Not Found';
                else if (response.status === 401) errorMsg = 'Erreur de mot de passe';
                else if (data.detail) errorMsg = data.detail;

                setStatus({ type: 'error', message: errorMsg });
            }
        } catch (error) {
            console.error('API Error:', error);
            setStatus({ type: 'error', message: 'Impossible de contacter le serveur de sécurité.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-sm bg-[#111827] border-l border-slate-800 shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                    <User className="text-gold-500" size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{user?.full_name || 'Project ORO'}</p>
                                    <p className="text-[10px] text-gold-500 font-bold uppercase tracking-widest opacity-80">
                                        Accès {user?.role || 'Guest'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content - Change Password Form */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Settings Shortcut */}
                            <button
                                onClick={() => {
                                    onOpenSettings();
                                    onClose();
                                }}
                                className="w-full flex items-center justify-between p-4 bg-gold-500/5 border border-gold-500/20 rounded-2xl group hover:bg-gold-500/10 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gold-500/10 rounded-lg text-gold-500">
                                        <Settings size={18} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-white">Paramètres</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Préférences & Profil</p>
                                    </div>
                                </div>
                                <ShieldCheck size={16} className="text-slate-700 group-hover:text-gold-500 transition-colors" />
                            </button>

                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-gold-500" /> Sécurité du compte
                                </h3>

                                <form onSubmit={handlePasswordChange} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mot de passe actuel</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-gold-500 transition-colors" size={14} />
                                            <input
                                                type={showPasswords.current ? 'text' : 'password'}
                                                value={formData.currentPassword}
                                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                                className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-mono"
                                                required
                                            />
                                            <button type="button" onClick={() => toggleVisibility('current')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                                                {showPasswords.current ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nouveau mot de passe</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-gold-500 transition-colors" size={14} />
                                            <input
                                                type={showPasswords.new ? 'text' : 'password'}
                                                value={formData.newPassword}
                                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                                className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-mono"
                                                required
                                            />
                                            <button type="button" onClick={() => toggleVisibility('new')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                                                {showPasswords.new ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confirmation</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-gold-500 transition-colors" size={14} />
                                            <input
                                                type={showPasswords.confirm ? 'text' : 'password'}
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-mono"
                                                required
                                            />
                                            <button type="button" onClick={() => toggleVisibility('confirm')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                                                {showPasswords.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>

                                    {status.type && (
                                        <p className={clsx(
                                            "text-xs font-bold flex items-center gap-2",
                                            status.type === 'success' ? "text-emerald-400" : "text-red-400"
                                        )}>
                                            {status.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                                            {status.message}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-gold-500/10 border border-gold-500/30 text-gold-500 font-bold rounded-lg hover:bg-gold-500 hover:text-midnight transition-all text-xs uppercase tracking-widest disabled:opacity-50"
                                    >
                                        {loading ? 'Chargement...' : 'Confirmer le changement'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Footer - Logout Button */}
                        <div className="p-6 border-t border-slate-800 bg-slate-950/20">
                            <button
                                onClick={onLogout}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all font-bold text-sm group"
                            >
                                <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
                                Déconnexion
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default UserDrawer;
