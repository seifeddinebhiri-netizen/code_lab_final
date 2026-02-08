import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import clsx from 'clsx';

const InvestorOnboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(false);

    const questions = [
        {
            id: 1,
            question: "Quelle est votre expérience en bourse ?",
            options: ["Débutant (J'apprends)", "Intermédiaire (Je trade parfois)", "Expert (Je trade activement)"]
        },
        {
            id: 2,
            question: "Quel est votre objectif principal ?",
            options: ["Sécurité du capital (Risque 0)", "Revenus réguliers (Dividendes)", "Croissance maximale (Plus-values)"]
        },
        {
            id: 3,
            question: "Quelle perte maximale tolérez-vous sur 1 an ?",
            options: ["Jusqu'à 5%", "Jusqu'à 15%", "30% ou plus (Risque total)"]
        }
    ];

    const handleSelect = (option: string) => {
        setAnswers({ ...answers, [step]: option });
        if (step < questions.length - 1) {
            setTimeout(() => setStep(step + 1), 300);
        } else {
            setTimeout(() => setIsCompleted(true), 500);
        }
    };

    const getProfile = () => {
        // Simplified logic based on last answer
        const risk = answers[2];
        if (risk?.includes("30%")) return "Risk Taker (Aggressif)";
        if (risk?.includes("15%")) return "Balanced (Modéré)";
        return "Safe Haven (Prudent)";
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                navigate('/login');
                return;
            }

            const user = JSON.parse(storedUser);
            const profileDisplay = getProfile();
            // Map display profile to simpler backend key if needed, or send as is.
            // Let's send a simplified key for the backend DB enum/string
            let riskKey = 'prudent';
            if (profileDisplay.includes('Aggressif')) riskKey = 'aggressif';
            else if (profileDisplay.includes('Modéré')) riskKey = 'balance';

            const response = await fetch(`http://localhost:8000/users/${user.id}/risk-profile`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ risk_profile: riskKey })
            });

            if (!response.ok) {
                throw new Error('Failed to update risk profile');
            }

            // Update local user
            const updatedUser = { ...user, risk_profile: riskKey };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            navigate('/dashboard/market');

        } catch (error) {
            console.error(error);
            alert("Erreur de sauvegarde du profil.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-midnight text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-slate-800">
                <motion.div
                    className="h-full bg-gradient-to-r from-gold-500 to-yellow-300"
                    initial={{ width: 0 }}
                    animate={{ width: `${((step + (isCompleted ? 1 : 0)) / questions.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            <AnimatePresence mode="wait">
                {!isCompleted ? (
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-2xl w-full"
                    >
                        <div className="mb-8">
                            <span className="text-gold-500 font-mono text-sm tracking-widest uppercase">Question {step + 1}/{questions.length}</span>
                            <h2 className="text-3xl md:text-4xl font-bold mt-2 leading-tight">{questions[step].question}</h2>
                        </div>

                        <div className="space-y-4">
                            {questions[step].options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(option)}
                                    className={clsx(
                                        "w-full text-left p-6 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-gold-500 transition-all duration-200 flex justify-between items-center group",
                                        answers[step] === option ? "border-gold-500 bg-slate-800 ring-2 ring-gold-500/20" : ""
                                    )}
                                >
                                    <span className="text-lg font-medium group-hover:text-gold-400 transition-colors">{option}</span>
                                    <ChevronRight className="text-slate-500 group-hover:text-gold-500 transform group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center max-w-xl"
                    >
                        <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-green-300 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                            <Check size={48} className="text-white" />
                        </div>

                        <h2 className="text-4xl font-bold mb-4">Profil Déterminé</h2>
                        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl mb-8">
                            <p className="text-gold-500 font-mono text-sm uppercase tracking-widest mb-2">Résultat de l'analyse</p>
                            <p className="text-3xl font-bold text-white">{getProfile()}</p>
                        </div>

                        <p className="text-slate-400 mb-8">
                            L'IA a configuré votre dashboard pour correspondre à votre tolérance au risque.
                        </p>

                        <button
                            onClick={handleComplete}
                            disabled={loading}
                            className="w-full py-4 bg-gold-500 text-midnight font-bold text-lg rounded-xl hover:bg-gold-400 transition-colors shadow-lg shadow-gold/20 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Configuration...' : 'Entrer dans le Dashboard'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InvestorOnboarding;
