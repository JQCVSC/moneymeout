import React from 'react';
import Button from './ui/Button';

interface WithdrawModalProps {
  balance: number;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ balance, onClose, onConfirm, isLoading = false }) => {
  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="withdraw-modal-title"
        onClick={onClose}
    >
        <div 
            className="bg-[#101626]/95 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-md m-4 p-8 text-center border border-white/10 glow-emerald"
            onClick={e => e.stopPropagation()}
        >
            <div className="mb-6">
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 id="withdraw-modal-title" className="text-2xl font-black text-white">
                    Confirm Withdrawal
                </h1>
            </div>
            
            <p className="text-base md:text-lg text-slate-300 mb-8">
                You are about to withdraw <span className="font-bold text-emerald-400">${balance.toFixed(2)}</span> to your connected account.
            </p>

            <div className="space-y-3">
                <Button 
                    variant="success" 
                    onClick={onConfirm} 
                    className="w-full py-4 text-lg font-black bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                    isLoading={isLoading}
                >
                    Confirm & Withdraw
                </Button>
                <button 
                    onClick={onClose} 
                    className="w-full py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                    disabled={isLoading}
                >
                    Cancel
                </button>
            </div>
            
            <p className="mt-6 text-xs text-slate-400">
                Withdrawals are processed securely via Stripe. Funds typically arrive in 1-3 business days.
            </p>
        </div>
    </div>
  );
};

export default WithdrawModal;
