import React from 'react';
import { Activity } from 'lucide-react';

const SentimentWidget: React.FC = () => {
    // Statics as requested for the demo
    const score = 65;
    const label = 'GREED';
    const trend = '+2.4%';
    const status = 'AVOIDANCE / GREED';

    // Gauge rotation logic for score 65:
    // 0 -> -90deg, 50 -> 0deg, 100 -> 90deg
    // 65 -> (65/100 * 180) - 90 = 117 - 90 = 27deg
    const rotation = 27;

    return (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-rose-900/30 p-8 shadow-2xl h-full flex flex-col items-center justify-between relative overflow-hidden group">

            {/* Simulation Badge - Top Right */}
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-rose-600/10 border border-rose-600/20 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Live Analyses</span>
            </div>

            {/* Header */}
            <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-8 w-full text-center">
                Sentiment Marché BVMT
            </h2>

            {/* Gauge Container */}
            <div className="relative w-64 h-32 overflow-hidden mb-4">
                {/* Background Arc SVG */}
                <svg viewBox="0 0 100 50" className="w-full h-full">
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    {/* Zones markings */}
                    <path d="M 10 50 A 40 40 0 0 1 30 18" fill="none" stroke="#ef4444" strokeWidth="8" opacity="0.4" />
                    <path d="M 30 18 A 40 40 0 0 1 70 18" fill="none" stroke="#94a3b8" strokeWidth="8" opacity="0.4" />
                    <path d="M 70 18 A 40 40 0 0 1 90 50" fill="none" stroke="#10b981" strokeWidth="8" opacity="0.4" />
                </svg>

                {/* Needle Container */}
                <div className="absolute bottom-0 left-1/2 w-0 h-0 z-20">
                    <div
                        className="w-1 h-24 bg-gradient-to-t from-rose-600 to-rose-400 origin-bottom transition-transform duration-2000 ease-out shadow-[0_0_15px_rgba(225,29,72,0.5)] rounded-t-full"
                        style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
                    ></div>
                </div>

                {/* Center Value */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <span className="text-6xl font-black text-white tracking-tighter mb-[-10px] drop-shadow-2xl">
                        {score}
                    </span>
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] bg-emerald-400/10 px-4 py-1 rounded-full border border-emerald-400/20">
                        {label}
                    </span>
                </div>
            </div>

            {/* Zone Labels */}
            <div className="flex justify-between w-full px-4 mb-8">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-600"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Peur</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Neutre</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avidité</span>
                </div>
            </div>

            {/* Bottom Stats */}
            <div className="w-full grid grid-cols-2 gap-4 border-t border-white/5 pt-6 mt-4">
                <div>
                    <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest block mb-1">Status Global</span>
                    <p className="text-[10px] text-white font-black tracking-tighter uppercase">{status}</p>
                </div>
                <div className="text-right">
                    <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest block mb-1">Tendance</span>
                    <p className="text-[10px] text-emerald-400 font-black tracking-tighter uppercase flex items-center justify-end gap-1">
                        <Activity size={10} /> {trend}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SentimentWidget;
