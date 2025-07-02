import * as React from 'react';
import { X } from 'lucide-react';
import type { Transaction } from '../types.ts';

interface TradeDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    trade: Transaction | null;
}

const TradeDetailModal = ({ isOpen, onClose, trade }: TradeDetailModalProps) => {
    if (!isOpen || !trade) return null;

    const formatDate = (isoString?: string) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        }).replace(',', '');
    };

    const DetailRow = ({ label, value, valueColor = 'text-white' }: { label: string; value: string | number; valueColor?: string; }) => (
        <div className="flex justify-between items-center">
            <span className="text-gray-400">{label}</span>
            <span className={`font-semibold ${valueColor}`}>{value}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-[#2a2d35] text-white rounded-lg p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                <header className="flex justify-center items-center relative pb-4 border-b border-slate-700">
                    <h2 className="text-xl font-semibold">{trade.pair?.replace('-', '/')}</h2>
                    <button onClick={onClose} className="absolute right-0 p-1 text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </header>

                <main className="mt-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-green-500 mb-2">Buy</h3>
                        <p className="text-sm text-gray-500 mb-3">{formatDate(trade.date)}</p>
                        <div className="space-y-3 text-sm">
                            <DetailRow label="Buying Price" value={trade.entryPrice?.toFixed(4) ?? 'N/A'} valueColor="text-red-500" />
                            <DetailRow label={`Invest amount ${trade.asset}`} value={trade.stake?.toLocaleString() ?? 'N/A'} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-green-500 mb-2">Sell</h3>
                        <p className="text-sm text-gray-500 mb-3">{formatDate(trade.endTime)}</p>
                         <div className="space-y-3 text-sm">
                            <DetailRow label="Selling Price" value={trade.exitPrice?.toFixed(4) ?? 'N/A'} valueColor="text-green-500" />
                            <DetailRow label="Profit" value={trade.profit?.toFixed(2) ?? 'N/A'} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TradeDetailModal;