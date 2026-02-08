import React, { useState } from 'react';
import VirtualHeader from '../../components/dashboard/VirtualHeader';
import TradeWidget from '../../components/widgets/TradeWidget';
import MaTactique from '../../components/widgets/MaTactique';

const AcademyView: React.FC = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [totalPnL, setTotalPnL] = useState(0);

    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : { id: 1 }; // Fallback for dev

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            <VirtualHeader userId={user.id} portfolioPnL={totalPnL} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <MaTactique
                        userId={user.id}
                        refreshKey={refreshKey}
                        onPnLUpdate={setTotalPnL}
                    />
                </div>
                <div className="lg:col-span-1">
                    <TradeWidget
                        userId={user.id}
                        onTradeSuccess={handleRefresh}
                    />
                </div>
            </div>
        </div>
    );
};

export default AcademyView;
