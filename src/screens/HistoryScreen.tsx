import * as React from 'react';
import type { Transaction } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import TradeDetailModal from '../components/TradeDetailModal.tsx';

const HistoryScreen = () => {
    const [activeTab, setActiveTab] = React.useState('History Detail');
    const { user } = useAuth();
    const [selectedTrade, setSelectedTrade] = React.useState<Transaction | null>(null);
    
    const tradeHistory = React.useMemo(() => {
        if (!user || !user.transactions) return [];
        return user.transactions
            .filter((tx): tx is Transaction & { type: 'Trade' } => tx.type === 'Trade')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [user]);

    const formatDate = (isoString: string) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});
    };

    const HistoryListItem = ({ trade }: { trade: Transaction }) => {
        const isProfit = (trade.profit || 0) >= 0;
        const profitLossColor = isProfit ? 'text-[#0ecb81]' : 'text-[#f6465d]';
        const directionColor = trade.direction === 'Buy' ? 'text-green-500' : 'text-red-500';
        const priceColor = 'text-red-500';
        
        return (
            <button 
                onClick={() => setSelectedTrade(trade)}
                className="w-full flex justify-between items-center py-4 border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors duration-150"
            >
                <div className="flex-1 text-left">
                    <p className="font-bold text-white">{trade.pair}</p>
                    <p className={`text-sm ${priceColor}`}>{trade.entryPrice?.toFixed(4)}-{trade.exitPrice?.toFixed(4)}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(trade.date)}</p>
                </div>

                <div className="flex-1 text-center">
                    <p className={`font-semibold ${directionColor}`}>{trade.direction}({trade.stake})</p>
                </div>

                <div className="flex-1 text-right">
                    <p className={`text-lg font-bold ${profitLossColor}`}>{isProfit ? '+' : ''}{trade.profit?.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(trade.endTime || '')}</p>
                </div>
            </button>
        );
    }

    return (
        <div className="bg-black text-white min-h-screen">
            <header className="pt-6 pb-4">
                <h1 className="text-2xl font-bold text-center">Purchased</h1>
            </header>

            <nav className="flex justify-center border-b border-slate-700/50">
                <button
                    onClick={() => setActiveTab('Purchased Detail')}
                    className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'Purchased Detail' ? 'text-white border-b-2 border-[#fcd535]' : 'text-gray-500'}`}
                >
                    Purchased Detail
                </button>
                <button
                    onClick={() => setActiveTab('History Detail')}
                    className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'History Detail' ? 'text-white border-b-2 border-[#fcd535]' : 'text-gray-500'}`}
                >
                    History Detail
                </button>
            </nav>

            <main className="px-4 pb-4">
                {activeTab === 'History Detail' ? (
                     tradeHistory.length > 0 ? (
                        <div>
                            {tradeHistory.map(trade => <HistoryListItem key={trade.id} trade={trade} />)}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            <p>No trade history found.</p>
                        </div>
                    )
                ) : (
                     <div className="text-center py-20 text-gray-500">
                        <p>Purchased details are not available in this view.</p>
                    </div>
                )}
            </main>

            <TradeDetailModal 
                isOpen={!!selectedTrade}
                onClose={() => setSelectedTrade(null)}
                trade={selectedTrade}
            />
        </div>
    );
};

export default HistoryScreen;