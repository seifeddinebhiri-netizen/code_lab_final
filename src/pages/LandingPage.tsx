import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Shield, Wallet, ArrowRight } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: LineChart,
            title: "Analyse IA Avancée",
            desc: "Anticipez les mouvements du marché Tunisien grâce à nos algorithmes prédictifs entraînés sur l'historique BVMT."
        },
        {
            icon: Shield,
            title: "Surveillance CMF",
            desc: "Détection d'anomalies en temps réel pour le Conseil du Marché Financier. Alertes instantanées sur les volumes suspects."
        },
        {
            icon: Wallet,
            title: "Gestion de Portefeuille",
            desc: "Optimisez votre allocation d'actifs grâce aux recommandations personnalisées basées sur votre profil de risque."
        }
    ];

    return (
        <div className="min-h-screen bg-midnight text-slate-200 font-sans selection:bg-gold-500/30">

            {/* Navbar */}
            <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-gold-600 to-yellow-300 shadow-gold" />
                    <span className="text-xl font-black tracking-tighter text-white font-bebas">
                        BOURSA<span className="text-rose-600">GPT</span>
                    </span>
                </div>
                <button
                    onClick={() => navigate('/signup')}
                    className="px-6 py-2 bg-transparent border border-gold-500 text-gold-500 rounded-full font-medium hover:bg-gold-500 hover:text-midnight transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:shadow-gold"
                >
                    Commencer
                </button>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-8 pt-20 pb-32 flex flex-col items-center text-center relative">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-500/5 rounded-full blur-[120px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-slate-800/50 border border-slate-700 text-gold-400 text-xs font-mono tracking-widest mb-6 backdrop-blur-sm">
                        INTELLIGENCE ARTIFICIELLE &bull; BVMT &bull; DEEP LEARNING
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight max-w-4xl mx-auto">
                        L'IA au service de la <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-600 drop-shadow-sm">
                            Bourse de Tunis
                        </span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        BoursaGPT est la première plateforme de trading intelligente dédiée au marché tunisien.
                        Analysez, investissez et surveillez avec la puissance du Machine Learning.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-8 py-4 bg-gold-500 text-midnight font-bold rounded-lg hover:bg-gold-400 transition-colors shadow-lg shadow-gold/20 flex items-center gap-2 group"
                        >
                            Créer un Compte Gratuit
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-8 py-4 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors border border-slate-700 hover:text-gold-500"
                        >
                            Se Connecter
                        </button>
                    </div>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                viewport={{ once: true }}
                                className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-2xl hover:bg-slate-800/60 hover:border-gold-500/30 transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-slate-700 group-hover:border-gold-500/50">
                                    <Icon className="text-gold-500" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        )
                    })}
                </div>
            </main>

            <footer className="border-t border-slate-800 py-12 text-center text-slate-500 text-sm">
                <p>&copy; 2024 BoursaGPT. Tous droits réservés.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
