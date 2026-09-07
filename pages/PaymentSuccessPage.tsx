import React, { useEffect } from 'react';
import { CreatorProfile } from '../types';
import Button from '../components/ui/Button';
import { Page } from '../App';
import { useCreatorData } from '../hooks/useCreatorData';
import { useAuth } from '../hooks/useAuth';
import Footer from '../components/layout/Footer';

interface PaymentSuccessPageProps {
  creator: CreatorProfile;
  amount: number;
  message?: string;
  paymentIntentId?: string;
  navigateTo: (page: Page, creator?: CreatorProfile, options?: { donationAmount?: number; donationMessage?: string; paymentIntentId?: string }) => void;
}

const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = ({ creator, amount, message, paymentIntentId, navigateTo }) => {
    const { addDonation } = useCreatorData();
    const { user } = useAuth();
    
    useEffect(() => {
        const recordDonation = async () => {
            // In a real app, the fan's name would come from their user profile
            const fanName = user?.name || 'Anonymous Fan';
            await addDonation(amount, fanName, creator.id, message, paymentIntentId);
        }
        recordDonation();
    }, [addDonation, amount, creator.id, user, message, paymentIntentId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090d16] text-white p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md text-center relative z-10">
        <div className="glass-panel p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-6 shadow-lg">
                 <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Payment Successful!</h1>
           <p className="text-base text-slate-400 mt-2">
                Thank you for your generous support of <span className="font-bold text-white">{creator.name}</span>.
           </p>
           <p className="text-4xl sm:text-5xl font-black text-emerald-400 my-5">${amount.toFixed(2)}</p>
           
           {message && (
             <div className="mt-4 p-4 bg-slate-900/90 rounded-2xl border border-white/5 italic text-slate-300 text-sm">
               "{message}"
             </div>
           )}

          <Button 
            onClick={() => navigateTo('profile', creator)} 
            variant="primary" 
            className="mt-6 w-full !py-3.5 !bg-emerald-500 hover:!bg-emerald-400 !text-black !font-black !rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            Back to {creator.name}'s Page
          </Button>
        </div>
      </div>
      <Footer navigateTo={navigateTo} />
    </div>
  );
};

export default PaymentSuccessPage;