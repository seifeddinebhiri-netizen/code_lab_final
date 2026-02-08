import { Search, UserCircle, Bell, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
    onSearch: (value: string) => void;
    isConnected: boolean;
}

const Header: React.FC<HeaderProps> = ({ onSearch, isConnected }) => {
    return (
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-30 shadow-lg shadow-black/20">
            <div className="flex-1 max-w-xl relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                    type="text"
                    placeholder="Rechercher une valeur BVMT (ex: BIAT)..."
                    className="w-full bg-slate-800 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-gold-500/50 focus:shadow-gold transition-all duration-300"
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
                    {isConnected ? (
                        <Wifi size={14} className="text-green-400 animate-pulse" />
                    ) : (
                        <WifiOff size={14} className="text-red-400" />
                    )}
                    <span className={`text-xs font-semibold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                        {isConnected ? 'LIVE' : 'OFFLINE'}
                    </span>
                </div>

                <button className="relative p-2 text-slate-400 hover:text-gold-400 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-neon-red rounded-full animate-ping"></span>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-neon-red rounded-full"></span>
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-slate-700">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-white">Project ORO</p>
                        <p className="text-xs text-gold-500">Regulator Access</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-600 to-slate-800 p-[2px]">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                            <UserCircle size={24} className="text-slate-200" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
