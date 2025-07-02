import * as React from 'react';
import { X, Trophy, Frown } from 'lucide-react';

interface TradeResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: {
        outcome: 'Win' | 'Loss';
        pnl: number;
        stake?: number;
        profitPercentage?: number;
    } | null;
}

const TradeResultModal = ({ isOpen, onClose, result }: TradeResultModalProps) => {
    if (!isOpen || !result) return null;

    const isWin = result.outcome === 'Win';
    const pnlColor = isWin ? 'text-green-400' : 'text-red-400';
    const bgColor = isWin ? 'bg-green-500/10' : 'bg-red-500/10';
    const iconColor = isWin ? 'text-green-500' : 'text-red-500';

    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className={`bg-[#2a2d35] text-white rounded-lg p-6 w-full max-w-xs mx-4 ${bgColor}`} onClick={e => e.stopPropagation()}>
                <header className="flex justify-end items-center relative mb-4">
                    <button onClick={onClose} className="absolute top-0 right-0 p-1 text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </header>

                <main className="text-center">
                    <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${iconColor} bg-slate-800/50 mb-4`}>
                        {isWin ? <Trophy size={60} /> : <Frown size={60} />}
                    </div>
                    <h2 className={`text-4xl font-bold ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                        You {result.outcome}
                    </h2>
                    <p className="text-lg text-gray-300 mt-2">Your Profit / Loss</p>
                    <p className={`text-3xl font-bold mt-1 ${pnlColor}`}>
                        {isWin ? '+' : ''}{result.pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    {isWin && result.stake && result.profitPercentage && (
                        <p className="text-sm text-gray-400 mt-2">
                            ({result.profitPercentage}% of ${result.stake.toLocaleString()})
                        </p>
                    )}
                </main>
                
                <footer className="mt-8">
                    <button onClick={onClose} className="w-full bg-[#fcd535] text-black font-bold py-3 rounded-lg text-lg hover:opacity-90 transition-opacity">
                        Continue Trading
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default TradeResultModal;