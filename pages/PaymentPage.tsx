import React, { useState, useEffect } from 'react';
import { CreatorProfile } from '../types';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import { Page } from '../App';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Initialize Stripe with the publishable key
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RpdxH3MeCyo3WK3Bsws0jTxP7tTNzLmfl0OGO8fLsOYMRW9tmdEkmzqP2ExfXvDkS4lx6iiwgOT7XJF4cDS8h3n00Cj4zcAc1';
const stripePromise = loadStripe(STRIPE_PK);

interface CheckoutFormProps {
  amount: number;
  creator: CreatorProfile;
  message: string;
  onCancel: () => void;
  navigateTo: (page: Page, creator?: CreatorProfile, options?: { donationAmount?: number; donationMessage?: string }) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ amount, creator, message, onCancel, navigateTo }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isElementReady, setIsElementReady] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage('Payment service is still initializing. Please wait a moment and try again.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/?page=paymentSuccess&creatorId=${creator.id}&amount=${amount}&message=${encodeURIComponent(message)}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'An unexpected error occurred with the payment.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        navigateTo('paymentSuccess', creator, { 
          donationAmount: amount, 
          donationMessage: message,
          paymentIntentId: paymentIntent.id
        });
      }
    } catch (err: any) {
      console.error('Payment confirmation error:', err);
      setErrorMessage(err.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isElementReady && (
        <div className="flex items-center justify-center p-6 text-sm text-slate-300 gap-3 bg-[#101626]/80 rounded-2xl border border-white/10">
          <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading secure payment form...</span>
        </div>
      )}
      <div className="bg-[#101626]/60 p-4 sm:p-5 rounded-2xl border border-white/10">
        <PaymentElement 
          options={{ layout: 'tabs' }} 
          onReady={() => setIsElementReady(true)} 
        />
      </div>
      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-sm font-medium">
          {errorMessage}
        </div>
      )}
      <div className="flex flex-col gap-3 pt-2">
        <Button
          type="submit"
          variant="success"
          className="w-full !py-4 !text-lg font-black bg-emerald-500 hover:bg-emerald-400 !text-black rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
          isLoading={isProcessing}
        >
          Pay ${amount.toFixed(2)}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer py-1"
        >
          Cancel and go back
        </button>
      </div>
    </form>
  );
};

interface PaymentPageProps {
  creator: CreatorProfile;
  amount: number;
  message: string;
  navigateTo: (page: Page, creator?: CreatorProfile, options?: { donationAmount?: number; donationMessage?: string }) => void;
  user: any;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ creator, amount: initialAmount, message: initialMessage, navigateTo, user }) => {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [localAmount, setLocalAmount] = useState(initialAmount);
    const [localMessage, setLocalMessage] = useState(initialMessage);
    const [isInitializing, setIsInitializing] = useState(false);

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads or amount/message changes
        const fetchPaymentIntent = async () => {
            setIsInitializing(true);
            setClientSecret(null); // Reset client secret while fetching new one
            setError(null);
            try {
                const response = await fetch('/api/create-payment-intent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        creator,
                        amount: localAmount,
                        message: localMessage,
                        fanName: user?.name || user?.displayName || user?.email || 'Anonymous',
                        fanId: user?.uid
                    }),
                });

                const contentType = response.headers.get('content-type') || '';
                if (!contentType.includes('application/json')) {
                    if (response.status === 404) {
                        throw new Error('Payment API endpoint not found (HTTP 404). Please verify backend server deployment and API routing.');
                    }
                    throw new Error(`Payment service returned non-JSON response (${response.status}). Please check backend server configuration and STRIPE_SECRET_KEY.`);
                }

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to initialize payment');
                }

                if (!data.clientSecret) {
                    throw new Error('No payment token returned. Please try again.');
                }

                setClientSecret(data.clientSecret);
            } catch (err: any) {
                console.error('Error fetching client secret:', err);
                setError(err.message || 'Failed to initialize payment');
            } finally {
                setIsInitializing(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchPaymentIntent();
        }, 500); // Debounce fetch

        return () => clearTimeout(timeoutId);
    }, [creator, localAmount, localMessage, user]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#090d16] text-white">
        {/* Left Side: Payment Details */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 md:p-14 flex flex-col justify-center bg-[#090d16] order-2 md:order-1 border-r border-white/5">
             <div className="max-w-md mx-auto w-full">
                 <div className="mb-6 md:mb-8">
                     <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-400">Direct Support</span>
                     <h1 className="text-3xl sm:text-4xl font-black text-white mt-1.5 tracking-tight">Complete Support</h1>
                 </div>

                 <div className="space-y-6">
                     {/* Amount Selector */}
                     <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10">
                         <div className="flex items-center justify-between mb-4">
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Support Amount</p>
                             <div className="flex items-center gap-2.5">
                                 <button 
                                     onClick={() => setLocalAmount(a => Math.max(5, a - 5))}
                                     className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/15 text-white transition-colors active:scale-95 font-bold"
                                 >-</button>
                                 <span className="text-2xl font-black text-emerald-400 tracking-tight">${localAmount}</span>
                                 <button 
                                     onClick={() => setLocalAmount(a => a + 5)}
                                     className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/15 text-white transition-colors active:scale-95 font-bold"
                                 >+</button>
                             </div>
                         </div>

                         {/* Quick Select Chips */}
                         <div className="grid grid-cols-4 gap-2 mb-4">
                             {[5, 10, 25, 50].map((preset) => (
                                 <button
                                     key={preset}
                                     type="button"
                                     onClick={() => setLocalAmount(preset)}
                                     className={`py-2 rounded-xl font-bold text-xs transition-all ${
                                         localAmount === preset
                                             ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                                             : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                                     }`}
                                 >
                                     ${preset}
                                 </button>
                             ))}
                         </div>
                         
                         <div className="space-y-2">
                             <label htmlFor="payment-message" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Message (Optional)</label>
                             <textarea
                                 id="payment-message"
                                 rows={2}
                                 className="w-full rounded-xl border border-white/10 bg-slate-900/90 p-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all outline-none"
                                 placeholder="Say something nice..."
                                 value={localMessage}
                                 onChange={(e) => setLocalMessage(e.target.value)}
                             />
                         </div>
                     </div>

                     {error && (
                         <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-sm flex flex-col gap-2">
                             <div className="font-medium">{error}</div>
                             <button 
                                 type="button" 
                                 onClick={() => setLocalAmount(a => a)} // re-triggers debounced fetch
                                 className="self-start text-xs bg-red-500/20 hover:bg-red-500/30 text-red-200 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                             >
                                 Retry Connection
                             </button>
                         </div>
                     )}

                     {isInitializing && (
                         <div className="flex flex-col items-center justify-center py-8 md:py-10">
                             <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                             <p className="text-slate-400 text-sm font-medium">Updating secure checkout...</p>
                         </div>
                     )}

                     {clientSecret && !isInitializing && (
                         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <Elements 
                                stripe={stripePromise} 
                                options={{ 
                                    clientSecret, 
                                    appearance: { 
                                        theme: 'night',
                                        variables: {
                                            colorPrimary: '#00c565',
                                            colorBackground: '#101626',
                                            colorText: '#f8fafc',
                                            colorDanger: '#ef4444',
                                            fontFamily: 'Inter, sans-serif',
                                            borderRadius: '12px',
                                        }
                                    } 
                                }}
                             >
                                 <CheckoutForm 
                                     amount={localAmount} 
                                     creator={creator} 
                                     message={localMessage}
                                     onCancel={() => navigateTo('profile', creator)} 
                                     navigateTo={navigateTo}
                                 />
                             </Elements>
                         </div>
                     )}

                     <p className="text-center text-xs text-slate-500 mt-6">
                         🔒 256-bit encrypted checkout. Funds deposit directly to creator.
                     </p>
                 </div>
             </div>
        </div>

        {/* Right Side: Creator Showcase & Branding */}
        <div className="w-full md:w-1/2 bg-[#0c111e] p-6 sm:p-10 md:p-16 flex flex-col justify-between relative overflow-hidden order-1 md:order-2 min-h-[340px] md:min-h-screen">
             {/* Background Glows */}
             <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

             <div className="relative z-10">
                 <button 
                     onClick={() => navigateTo('profile', creator)}
                     className="mb-8 md:mb-12 inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group text-sm sm:text-base font-medium"
                 >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                     </svg>
                     <span>Back to profile</span>
                 </button>

                 <Logo className="scale-90 sm:scale-100 origin-left mb-10" />

                 {/* Creator Card Preview */}
                 <div className="glass-panel p-5 rounded-3xl border border-white/10 flex items-center gap-4 max-w-md shadow-xl">
                     <img 
                         src={creator.avatarUrl} 
                         alt={creator.name} 
                         className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500/40 bg-slate-800 shadow-md" 
                         referrerPolicy="no-referrer"
                     />
                     <div>
                         <p className="font-black text-xl text-white">{creator.name}</p>
                         <p className="text-xs font-semibold text-emerald-400 mt-0.5">{creator.handle}</p>
                         <p className="text-xs text-slate-400 mt-1">Verified YouTube Creator</p>
                     </div>
                 </div>
                 
                 <div className="mt-10 md:mt-14">
                     <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                         Directly Supporting <br />
                         <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">{creator.name}</span>
                     </h2>
                     <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-md leading-relaxed">
                         Your contribution goes directly to the creator's bank account with 0 hidden middleman cuts.
                     </p>
                 </div>
             </div>

             <div className="relative z-10 mt-8 md:mt-12 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                 <span>Secure payment powered by Stripe</span>
                 <span className="text-emerald-400 font-bold">Money Me Out</span>
             </div>
        </div>
    </div>
  );
};

export default PaymentPage;