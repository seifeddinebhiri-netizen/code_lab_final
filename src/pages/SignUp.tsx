import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Inscription échouée');
            }

            const user = await response.json();

            // Store user ID for the next steps
            localStorage.setItem('user', JSON.stringify(user));

            // Move to Step 2: Role Selection
            navigate('/login-selection');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-midnight text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Overlay */}
            <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-gold-500/5" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-slate-800/50 backdrop-blur-md border border-slate-700 p-8 rounded-2xl shadow-xl relative z-10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Créer un compte</h1>
                    <p className="text-slate-400">Rejoignez la plateforme Project ORO</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Nom complet</label>
                        <input
                            type="text"
                            name="full_name"
                            required
                            value={formData.full_name}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                            placeholder="Foulen Fouleni"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                            placeholder="fouelnfouleni@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Mot de passe</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gold-500 text-midnight font-bold rounded-lg hover:bg-gold-400 transition-colors shadow-lg shadow-gold/20 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Création...' : 'Continuer'}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-400">
                    Déjà un compte ? <span className="text-gold-500 cursor-pointer hover:underline" onClick={() => navigate('/login')}>Se connecter</span>
                </div>

            </motion.div>
        </div>
    );
};

export default SignUp;
