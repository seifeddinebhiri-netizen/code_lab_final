import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Briefcase, ShieldAlert, LogOut, Search, Activity, Globe } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface SidebarProps {
    activeTab: string;
    role: 'investisseur' | 'regulateur';
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, role }) => {
    const navigate = useNavigate();

    const investorMenu = [
        { id: 'market', label: 'Marché', icon: LayoutDashboard, path: '/dashboard/market' },
        { id: 'analysis', label: 'Analyse IA', icon: TrendingUp, path: '/dashboard/analysis' },
        { id: 'insights', label: 'Intelligence IA', icon: Globe, path: '/dashboard/insights' },
        { id: 'academy', label: 'Simulation Academy', icon: Activity, path: '/dashboard/academy' },
        { id: 'portfolio', label: 'Portefeuille', icon: Briefcase, path: '/dashboard/portfolio' },
    ];

    const regulatorMenu = [
        { id: 'market', label: 'Aperçu Marché', icon: LayoutDashboard, path: '/dashboard/market' },
        { id: 'alerts', label: 'Surveillance CMF', icon: ShieldAlert, path: '/dashboard/alerts' },
        { id: 'audit', label: 'Audit Logs', icon: Search, path: '/dashboard/audit' },
    ];

    const menuItems = role === 'regulateur' ? regulatorMenu : investorMenu;
    const accentColor = role === 'regulateur' ? 'border-slate-400' : 'border-gold-500';
    const accentGlow = role === 'regulateur' ? 'shadow-slate-500/20' : 'shadow-gold';

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className={clsx(
            "h-screen w-64 border-r flex flex-col fixed left-0 top-0 z-20 transition-colors duration-500",
            role === 'regulateur' ? "bg-slate-950 border-slate-800" : "bg-midnight border-slate-800"
        )}>
            <div className="p-6">
                <h1 className="text-2xl font-black tracking-tighter text-white font-bebas">
                    BOURSA<span className="text-rose-600">GPT</span>
                </h1>
                <p className="text-slate-500 text-[10px] mt-1 tracking-[0.2em] uppercase font-bold">
                    {role === 'regulateur' ? 'Institutionnel CMF' : 'BVMT Intelligence'}
                </p>
            </div>

            <nav className="flex-1 px-4 mt-6">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => navigate(item.path)}
                                    className={clsx(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 relative overflow-hidden group",
                                        isActive
                                            ? `text-white bg-slate-800/80 border-l-4 ${accentColor} ${accentGlow}`
                                            : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className={clsx(
                                                "absolute inset-0 w-full h-full opacity-10",
                                                role === 'regulateur' ? "bg-slate-400" : "bg-gold-500"
                                            )}
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                    <Icon size={20} className={isActive ? (role === 'regulateur' ? "text-slate-300" : "text-gold-400") : ""} />
                                    <span className="font-semibold text-sm relative z-10">{item.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-slate-800 mt-auto">
                <div className={clsx(
                    "mb-4 p-3 rounded-lg border text-[10px] uppercase font-bold tracking-widest",
                    role === 'regulateur' ? "bg-slate-900/50 border-slate-700 text-slate-400" : "bg-gold-500/5 border-gold-500/20 text-gold-500"
                )}>
                    Mode: {role}
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-slate-500 hover:text-neon-red transition-colors w-full px-4 py-2 text-sm font-medium"
                >
                    <LogOut size={18} />
                    <span>Déconnexion</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
