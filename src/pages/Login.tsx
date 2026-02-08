import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Email ou mot de passe incorrect');
            }

            const userData = await response.json();
            localStorage.setItem('user', JSON.stringify(userData));

            // Intelligent Redirection
            if (!userData.role) {
                navigate('/login-selection');
            } else if (userData.role === 'regulateur') {
                navigate('/dashboard/alerts');
            } else {
                // investisseur
                if (!userData.risk_profile) {
                    navigate('/questionnaire');
                } else {
                    navigate('/dashboard/market');
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-midnight text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-gold-500/5" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-slate-800/50 backdrop-blur-md border border-slate-700 p-8 rounded-2xl shadow-xl relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold-500/20">
                        <ShieldCheck size={32} className="text-gold-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Connexion</h1>
                    <p className="text-slate-400">Accédez à votre espace BoursaGPT</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                                placeholder="nom@exemple.com"
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1 ml-1">Mot de passe</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 py-3 bg-gold-500 text-midnight font-bold rounded-lg hover:bg-gold-400 transition-colors shadow-lg shadow-gold/20 flex items-center justify-center gap-2 group"
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                        {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-400">
                    Nouveau ici ? <span className="text-gold-500 cursor-pointer font-bold hover:underline" onClick={() => navigate('/signup')}>Créer un compte</span>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
