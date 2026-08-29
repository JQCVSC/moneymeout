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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                 <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
          <h1 className="text-2xl font-bold text-gray-800">Payment Successful!</h1>
           <p className="text-lg text-gray-500 mt-2">
                Thank you for your generous support of <span className="font-semibold text-gray-700">{creator.name}</span>.
           </p>
           <p className="text-4xl font-bold text-green-600 my-4">${amount.toFixed(2)}</p>
           
           {message && (
             <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 italic text-gray-600 text-sm">
               "{message}"
             </div>
           )}

          <Button onClick={() => navigateTo('profile', creator)} variant="primary" className="mt-6 w-full">
            Back to {creator.name}'s Page
          </Button>
        </div>
      </div>
      <Footer navigateTo={navigateTo} />
    </div>
  );
};

export default PaymentSuccessPage;