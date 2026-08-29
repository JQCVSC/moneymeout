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
        <div className="flex items-center justify-center p-6 text-sm text-gray-500 gap-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading secure payment form...</span>
        </div>
      )}
      <PaymentElement 
        options={{ layout: 'tabs' }} 
        onReady={() => setIsElementReady(true)} 
      />
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {errorMessage}
        </div>
      )}
      <div className="flex flex-col gap-3 pt-4">
        <Button
          type="submit"
          variant="success"
          className="w-full !py-4 !text-xl shadow-xl shadow-emerald-100 hover:shadow-emerald-200 cursor-pointer"
          isLoading={isProcessing}
        >
          Pay ${amount.toFixed(2)}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
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
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
        {/* Left Side: Payment Details (White) */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 md:p-16 flex flex-col justify-center bg-white order-2 md:order-1">
             <div className="max-w-md mx-auto w-full">
                 <div className="mb-8 md:mb-12">
                     <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[var(--success-color)]">Checkout</span>
                     <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mt-2 tracking-tighter">Complete Support</h1>
                 </div>

                 <div className="space-y-6 md:space-y-8">
                     {/* Amount Selector */}
                     <div className="bg-gray-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-100">
                         <div className="flex items-center justify-between mb-4">
                             <p className="text-[10px] sm:text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Support Amount</p>
                             <div className="flex items-center gap-2 sm:gap-3">
                                 <button 
                                     onClick={() => setLocalAmount(a => Math.max(5, a - 5))}
                                     className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white transition-colors active:scale-95"
                                 >-</button>
                                 <span className="text-lg sm:text-xl font-black text-[var(--success-color)] tracking-tight">${localAmount}</span>
                                 <button 
                                     onClick={() => setLocalAmount(a => a + 5)}
                                     className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white transition-colors active:scale-95"
                                 >+</button>
                             </div>
                         </div>
                         
                         <div className="space-y-2">
                             <label htmlFor="payment-message" className="text-[10px] sm:text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Message (Optional)</label>
                             <textarea
                                 id="payment-message"
                                 rows={2}
                                 className="w-full rounded-xl border-gray-200 bg-white p-3 text-sm focus:border-[var(--success-color)] focus:ring-[var(--success-color)] transition-all"
                                 placeholder="Say something nice..."
                                 value={localMessage}
                                 onChange={(e) => setLocalMessage(e.target.value)}
                             />
                         </div>
                     </div>

                     {error && (
                         <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex flex-col gap-2">
                             <div className="font-medium">{error}</div>
                             <button 
                                 type="button" 
                                 onClick={() => setLocalAmount(a => a)} // re-triggers debounced fetch
                                 className="self-start text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                             >
                                 Retry Connection
                             </button>
                         </div>
                     )}

                     {isInitializing && (
                         <div className="flex flex-col items-center justify-center py-8 md:py-12">
                             <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-[var(--success-color)] border-t-transparent rounded-full animate-spin mb-4"></div>
                             <p className="text-[var(--text-secondary)] text-sm sm:text-base font-medium">Updating secure checkout...</p>
                         </div>
                     )}

                     {clientSecret && !isInitializing && (
                         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
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

                     <p className="text-center text-[10px] sm:text-xs text-[var(--text-secondary)] mt-6 md:mt-8">
                         Your payment information is encrypted and never stored on our servers.
                     </p>
                 </div>
             </div>
        </div>

        {/* Right Side: Branding & Info (Green) */}
        <div className="w-full md:w-1/2 bg-[var(--success-color)] p-6 sm:p-10 md:p-16 flex flex-col justify-between relative overflow-hidden order-1 md:order-2 min-h-[300px] md:min-h-screen">
             {/* Background Blobs */}
             <div className="absolute top-0 -left-4 w-48 h-48 sm:w-72 sm:h-72 bg-white/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
             <div className="absolute top-0 -right-4 w-48 h-48 sm:w-72 sm:h-72 bg-white/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
             <div className="absolute -bottom-8 left-20 w-48 h-48 sm:w-72 sm:h-72 bg-white/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

             <div className="relative z-10">
                 <button 
                     onClick={() => navigateTo('profile', creator)}
                     className="mb-8 md:mb-12 flex items-center gap-2 text-white/80 hover:text-white transition-colors group text-sm sm:text-base"
                 >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                     </svg>
                     <span>Back to profile</span>
                 </button>

                 <Logo className="invert brightness-0 scale-90 sm:scale-100 origin-left" />
                 
                 <div className="mt-12 sm:mt-16 md:mt-24">
                     <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter">
                         Supporting <br />
                         <span className="text-white/80">{creator.name}</span>
                     </h2>
                     <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-white/70 max-w-md">
                         Your contribution helps creators keep doing what they love. Thank you for being part of the community.
                     </p>
                 </div>
             </div>

             <div className="relative z-10 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/20">
                 <p className="text-white/50 text-[10px] sm:text-xs">Secure payment powered by Stripe</p>
             </div>
        </div>
    </div>
  );
};

export default PaymentPage;