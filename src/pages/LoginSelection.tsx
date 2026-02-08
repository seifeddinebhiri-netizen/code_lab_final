import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Scale, ArrowRight, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

const LoginSelection = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<string | null>(null);

    // Security check: If role is already set, redirect away
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.role === 'investisseur') {
                if (user.risk_profile) navigate('/dashboard/market');
                else navigate('/questionnaire');
            } else if (user.role === 'regulateur') {
                navigate('/dashboard/alerts');
            }
        }
    }, [navigate]);

    const handleRoleSelection = async (role: 'investisseur' | 'regulateur') => {
        setLoading(role);
        try {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                // If no user found (maybe direct access), redirect to signup
                navigate('/signup');
                return;
            }

            const user = JSON.parse(storedUser);

            // Call API to update role
            const response = await fetch(`http://localhost:8000/users/${user.id}/role`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role }),
            });

            if (!response.ok) {
                throw new Error('Failed to update role');
            }

            // Update local storage
            const updatedUser = { ...user, role };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Redirect based on role
            if (role === 'investisseur') {
                navigate('/questionnaire');
            } else {
                navigate('/dashboard/alerts');
            }

        } catch (error) {
            console.error('Error updating role:', error);
            alert("Erreur lors de la sélection du rôle. Veuillez réessayer.");
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-midnight text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-slate-900/50 -skew-y-3 transform origin-top-left z-0" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-[80px]" />

            <h1 className="text-3xl md:text-5xl font-black mb-12 z-10 text-center uppercase font-bebas tracking-tighter">
                Identifiez-vous <span className="text-rose-600">BoursaGPT</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full z-10">
                {/* Investor Card */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl flex flex-col items-center text-center hover:border-gold-500/50 transition-colors shadow-lg group cursor-pointer ${loading === 'investisseur' ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => handleRoleSelection('investisseur')}
                >
                    <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-600 group-hover:border-gold-500 transition-colors">
                        <TrendingUp size={40} className="text-gold-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Je suis Investisseur</h2>
                    <p className="text-slate-400 mb-8 max-w-sm">
                        Accédez à des analyses IA personnalisées, optimisez votre portefeuille et recevez des recommandations d'achat/vente.
                    </p>
                    <button disabled={!!loading} className="mt-auto px-6 py-3 bg-gold-500 text-midnight font-bold rounded-lg group-hover:bg-gold-400 transition-colors flex items-center gap-2 w-full justify-center">
                        {loading === 'investisseur' ? 'Configuration...' : 'Commencer le Profilage'} <ArrowRight size={18} />
                    </button>
                </motion.div>

                {/* Regulator Card */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl flex flex-col items-center text-center hover:border-neon-red/50 transition-colors shadow-lg group cursor-pointer ${loading === 'regulateur' ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => handleRoleSelection('regulateur')}
                >
                    <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-600 group-hover:border-neon-red transition-colors">
                        <Scale size={40} className="text-slate-300 group-hover:text-neon-red transition-colors" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Je suis Régulateur (CMF)</h2>
                    <p className="text-slate-400 mb-8 max-w-sm">
                        Accès direct aux outils de surveillance de marché, détection d'anomalies et flux d'alertes en temps réel.
                    </p>
                    <button disabled={!!loading} className="mt-auto px-6 py-3 bg-slate-700 text-white font-bold rounded-lg group-hover:bg-slate-600 transition-colors flex items-center gap-2 w-full justify-center border border-slate-600">
                        {loading === 'regulateur' ? 'Connexion sécurisée...' : 'Accès Surveillance'} <ShieldCheck size={18} />
                    </button>
                </motion.div>
            </div>

            <p className="mt-12 text-slate-500 text-sm z-10">
                Accès sécurisé par authentification biométrique (Simulation)
            </p>
        </div>
    );
};

export default LoginSelection;
