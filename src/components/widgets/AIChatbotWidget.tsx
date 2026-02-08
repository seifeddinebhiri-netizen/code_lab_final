import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../../services/api';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface Message {
    role: 'user' | 'ai';
    content: string;
}

const AIChatbotWidget: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: "Bonjour ! Je suis l'assistant IA de BoursaGPT. Comment puis-je vous aider dans vos analyses boursières aujourd'hui ?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUserId(JSON.parse(storedUser).id);
        }
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !userId || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const data = await apiService.aiChat(userId, userMsg);
            setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: "Désolé, j'ai rencontré une erreur technique. Veuillez réessayer." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full min-h-[400px]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 border-b border-slate-700/50 pb-4">
                <div className="p-2 bg-gold-500/20 rounded-lg">
                    <Bot size={20} className="text-gold-500" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-sm">Conseiller IA Dali</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Expert Bourse de Tunis • Live</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[9px] text-emerald-500 font-bold uppercase">Online</span>
                </div>
            </div>

            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin scrollbar-thumb-slate-700"
            >
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={clsx(
                            "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                            msg.role === 'user' ? "flex-row-reverse" : ""
                        )}
                    >
                        <div className={clsx(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                            msg.role === 'ai' ? "bg-gold-500/10 border-gold-500/20 text-gold-500" : "bg-slate-700 border-slate-600 text-slate-300"
                        )}>
                            {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
                        </div>
                        <div className={clsx(
                            "max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed",
                            msg.role === 'ai'
                                ? "bg-slate-800/80 border border-slate-700 text-slate-200"
                                : "bg-gold-500 text-midnight font-medium"
                        )}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center shrink-0 text-gold-500">
                            <Bot size={16} />
                        </div>
                        <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-2xl flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin text-gold-500" />
                            <span className="text-[10px] text-slate-400 italic">Dali réfléchit...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Posez votre question sur la BVMT..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-3.5 pr-12 text-xs text-white placeholder:text-slate-600 focus:border-gold-500/50 outline-none transition-all"
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gold-500 hover:bg-gold-500/10 rounded-lg transition-all disabled:opacity-30"
                >
                    <Send size={18} />
                </button>
            </div>

            <div className="mt-3 flex items-center gap-3 justify-center">
                <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-widest bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/50">
                    <Sparkles size={10} className="text-gold-500" /> Suggestion: SFBT est-il un bon achat ?
                </div>
            </div>
        </div>
    );
};

export default AIChatbotWidget;
