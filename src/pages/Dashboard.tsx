import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import clsx from 'clsx';

// New Modular Views
import MarketView from './dashboard/MarketView';
import AnalysisView from './dashboard/AnalysisView';
import PortfolioView from './dashboard/PortfolioView';
import SurveillanceView from './dashboard/SurveillanceView';
import AcademyView from './dashboard/AcademyView';

const Dashboard: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [userCapital, setUserCapital] = useState<number | undefined>(undefined);
    const [userRole, setUserRole] = useState<'investisseur' | 'regulateur'>('investisseur');

    // Sync active tab based on URL
    const activeTab = location.pathname.split('/').pop() || 'market';

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        try {
            const user = JSON.parse(storedUser);
            if (user.capital !== undefined) setUserCapital(user.capital);
            if (user.role) setUserRole(user.role);
        } catch (e) {
            console.error("Failed to parse user", e);
            navigate('/login');
        }
    }, [navigate]);

    const getTitle = () => {
        switch (activeTab) {
            case 'analysis': return 'Analyse Technique IA';
            case 'portfolio': return 'Mon Portefeuille';
            case 'alerts': return 'Centre de Surveillance';
            case 'audit': return 'Journal d\'Audit';
            default: return userRole === 'regulateur' ? 'Aperçu Global Marché' : 'Marché BVMT';
        }
    };

    return (
        <div className={clsx(
            "flex min-h-screen font-sans text-slate-200 overflow-hidden transition-colors duration-700",
            userRole === 'regulateur' ? "bg-slate-950" : "bg-midnight"
        )}>
            {/* Sidebar - Now role-aware */}
            <Sidebar activeTab={activeTab === 'dashboard' ? 'market' : activeTab} role={userRole} />

            {/* Main Content Area */}
            <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden relative">
                <Header onSearch={(val) => console.log(val)} />

                {/* Content Container */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-28 space-y-8 scrollbar-hide relative z-10 w-full">

                    {/* Page Breadcrumb/Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={clsx(
                                "w-2 h-10 rounded-full",
                                userRole === 'regulateur' ? "bg-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.5)]" : "bg-gold-500 shadow-gold"
                            )}></div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.3em] mb-1">
                                    {userRole === 'regulateur' ? 'RESEAU SECURISE CMF' : 'PLATEFORME ORO'}
                                </p>
                                <h1 className="text-3xl font-bold text-white tracking-tight">
                                    {getTitle()}
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* ROUTING FOR DASHBOARD VIEWS - Filtered by Role if needed */}
                    <Routes>
                        <Route index element={<MarketView />} />
                        <Route path="market" element={<MarketView />} />

                        {/* Investor Specific */}
                        <Route path="analysis" element={<AnalysisView />} />
                        <Route path="portfolio" element={<PortfolioView capital={userCapital} />} />
                        <Route path="academy" element={<AcademyView />} />

                        {/* Regulator Specific */}
                        <Route path="alerts" element={<SurveillanceView />} />
                        <Route path="audit" element={
                            <div className="bg-slate-900/50 p-12 rounded-2xl border border-slate-800 border-dashed text-center">
                                <p className="text-slate-500 font-mono">Journal d'Audit Système v1.0 - Accès restreint</p>
                            </div>
                        } />
                    </Routes>

                </div>

                {/* Footer Style based on role */}
                <div className={clsx(
                    "w-full h-10 backdrop-blur text-center text-[10px] uppercase tracking-[0.2em] flex items-center justify-center border-t z-20 shrink-0 font-bold",
                    userRole === 'regulateur'
                        ? "bg-slate-950/95 text-slate-400 border-slate-800"
                        : "bg-midnight/95 text-slate-600 border-slate-800"
                )}>
                    {userRole === 'regulateur' ? 'CMF - SECURITE DES MARCHES FINANCIERS' : 'Project ORO © 2024 - BVMT Intelligence'}
                </div>

                {/* Role-based background effects */}
                <div className={clsx(
                    "pointer-events-none fixed inset-0 z-0",
                    userRole === 'regulateur'
                        ? "bg-gradient-to-tr from-slate-900 via-transparent to-slate-400/5"
                        : "bg-gradient-to-tr from-blue-900/5 via-transparent to-gold-500/10"
                )} />
            </div>
        </div>
    );
};

export default Dashboard;
