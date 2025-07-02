import * as React from 'react';
import { X } from 'lucide-react';

interface ActiveTradeDetails {
    pair: string;
    direction: 'Buy' | 'Sell';
    stake: number;
    expectedProfit: number;
    entryPrice: number;
}

interface ActiveTradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    tradeDetails: ActiveTradeDetails | null;
    timeLeft: number;
    livePrice: number;
}

const DigitBox = ({ digit }: { digit: string }) => (
    <div className="bg-[#fcd535] text-black p-3 sm:p-4 rounded-md text-4xl sm:text-5xl font-bold leading-none flex items-center justify-center">
        {digit}
    </div>
);

const ActiveTradeModal = ({ isOpen, onClose, tradeDetails, timeLeft, livePrice }: ActiveTradeModalProps) => {
    if (!isOpen || !tradeDetails) return null;

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };
    
    const isPriceUp = livePrice >= tradeDetails.entryPrice;

    const [minutesStr, secondsStr] = formatTime(timeLeft).split(':');
    const directionColor = tradeDetails.direction === 'Buy' ? 'text-green-500' : 'text-red-500';
    const priceColor = isPriceUp ? 'text-green-500' : 'text-red-500';

    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-[#2a2d35] text-white rounded-lg p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
                <header className="flex justify-center items-center relative mb-6">
                    <h2 className="text-xl font-semibold">{tradeDetails.pair.replace('-', '/')}</h2>
                    <button onClick={onClose} className="absolute right-0 p-1 text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </header>

                <main className="space-y-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-400">Now Price</p>
                        <p className={`text-4xl font-bold ${priceColor}`}>{livePrice.toFixed(2)}</p>
                    </div>

                    <div className="flex justify-center items-center gap-1">
                        <DigitBox digit={minutesStr[0]} />
                        <DigitBox digit={minutesStr[1]} />
                        <span className="text-4xl font-bold text-[#fcd535] mx-1">:</span>
                        <DigitBox digit={secondsStr[0]} />
                        <DigitBox digit={secondsStr[1]} />
                    </div>

                    <div className="text-sm border-t border-gray-700 pt-4">
                        <div className="grid grid-cols-3 text-gray-400 font-semibold text-center">
                            <span>Direct</span>
                            <span>Amount</span>
                            <span>Expected Profit</span>
                        </div>
                        <div className="grid grid-cols-3 text-white font-medium text-center mt-1">
                            <span className={directionColor}>{tradeDetails.direction}</span>
                            <span>{Number(tradeDetails.stake).toLocaleString()}</span>
                            <span>{tradeDetails.expectedProfit.toFixed(2)}</span>
                        </div>
                    </div>
                </main>

                <footer className="mt-8">
                    <button onClick={onClose} className="w-full bg-[#fcd535] text-black font-bold py-3 rounded-lg text-lg hover:opacity-90 transition-opacity">
                        Close
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ActiveTradeModal;