import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserCircle, Bell } from 'lucide-react';
import UserDrawer from './UserDrawer';
import SettingsModal from './SettingsModal';

interface HeaderProps {
    onSearch: (value: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [user, setUser] = useState<{ full_name?: string, role?: string, email?: string } | null>(null);

    const notifications = [
        { id: 1, title: 'Alerte Marché', message: 'BIAT a franchi le support technique.', time: '2 min', type: 'warning' },
        { id: 2, title: 'IA Recommendation', message: 'Nouveau signal d\'achat détecté pour SFBT.', time: '1h', type: 'info' },
        { id: 3, title: 'Système', message: 'Données synchronisées avec succès.', time: '3h', type: 'success' },
    ];

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (e) {
                console.error("Header: Failed to parse user", e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-30 shadow-lg shadow-black/20">
            {/* Search Bar */}
            <div className="flex-1 max-w-xl relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                    type="text"
                    placeholder="Rechercher une valeur BVMT (ex: BIAT)..."
                    className="w-full bg-slate-800 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-gold-500/50 focus:shadow-gold transition-all duration-300 text-sm"
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>

            {/* Actions & Profile */}
            <div className="flex items-center gap-6">


                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="relative p-2 text-slate-400 hover:text-gold-400 transition-all hover:scale-110"
                    >
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></span>
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* Notification Dropdown */}
                    {isNotificationsOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                            <div className="absolute right-0 mt-4 w-80 bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all">
                                <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">Notifications</h3>
                                    <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-bold">3 Nouvelles</span>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.map((notif) => (
                                        <div key={notif.id} className="p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer group">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-xs font-bold text-gold-500">{notif.title}</p>
                                                <span className="text-[10px] text-slate-500">{notif.time}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 leading-relaxed group-hover:text-slate-300">
                                                {notif.message}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full p-3 bg-slate-900/80 text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-white transition-colors border-t border-slate-800">
                                    Tout marquer comme lu
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* User Profile Button */}
                <div className="relative pl-6 border-l border-slate-800">
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="flex items-center gap-3 group px-2 py-1.5 rounded-xl hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-700/50"
                    >
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-white leading-tight">{user?.full_name || 'Project ORO'}</p>
                            <p className="text-[10px] text-gold-500 uppercase tracking-widest font-bold opacity-80">
                                {user?.role || 'Guest'} Access
                            </p>
                        </div>

                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gold-600 to-slate-800 p-[2px] shadow-lg group-hover:shadow-gold/20 transition-all">
                            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                                <UserCircle size={24} className="text-slate-200 group-hover:text-gold-400 transition-colors" />
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Drawer Component */}
            <UserDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                user={user}
                onLogout={handleLogout}
                onOpenSettings={() => setIsSettingsOpen(true)}
            />

            {/* Settings Modal */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                user={user}
            />
        </header>
    );
};

export default Header;
