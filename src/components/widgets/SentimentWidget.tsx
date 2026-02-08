import React from 'react';
import { marketSentiment } from '../../utils/mockData';
import { Zap } from 'lucide-react';
import clsx from 'clsx';

const SentimentWidget: React.FC = () => {
    const { score, label } = marketSentiment;
    // Gauge rotation logic: 0 to 180 degrees.
    // Score 0 -> -90deg, 50 -> 0deg, 100 -> 90deg
    const rotation = (score / 100) * 180 - 90;

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg h-full flex flex-col items-center justify-center relative overflow-hidden group hover:border-gold-500/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-bl-full group-hover:bg-gold-500/10 transition-colors pointer-events-none" />

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 z-10 w-full justify-center">
                <Zap className="text-gold-500 fill-gold-500 animate-pulse" /> Sentiment BVMT
            </h2>

            <div className="relative w-48 h-24 overflow-hidden mb-4 bg-slate-900 rounded-t-full p-4 border border-slate-800 shadow-inner">
                {/* Needle Container */}
                <div className="absolute bottom-0 left-1/2 w-0 h-0">
                    <div
                        className="w-1 h-20 bg-gradient-to-t from-gold-600 to-yellow-300 origin-bottom transition-transform duration-1000 ease-out z-20 shadow-[0_0_15px_rgba(245,158,11,0.8)] rounded-t-full"
                        style={{ transform: `rotate(${rotation}deg)` }}
                    ></div>
                </div>

                {/* Center Dot */}
                <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-slate-200 rounded-full -translate-x-1/2 translate-y-1/2 z-30 border-4 border-slate-900 shadow-lg"></div>
            </div>

            <div className="text-center z-10 mt-2">
                <span className={clsx(
                    "text-5xl font-black tracking-tighter drop-shadow-lg",
                    score > 60 ? "text-emerald-400" : score < 40 ? "text-neon-red" : "text-gold-400"
                )}>
                    {score}
                </span>
                <p className="text-slate-400 uppercase tracking-[0.2em] text-xs font-bold mt-2">{label}</p>
            </div>

            <div className="w-full flex justify-between px-4 mt-6 text-[10px] font-mono text-slate-600 font-bold tracking-wider">
                <span>PEUR</span>
                <span>NEUTRE</span>
                <span>AVIDITÉ</span>
            </div>
        </div>
    );
};

export default SentimentWidget;
