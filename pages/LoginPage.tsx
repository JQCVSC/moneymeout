import React, { useState } from 'react';
import { Page } from '../App';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/ui/Logo';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import GoogleIcon from '../components/ui/GoogleIcon';
import Footer from '../components/layout/Footer';

import { CreatorProfile } from '../types';

interface LoginPageProps {
  navigateTo: (page: Page, creator?: CreatorProfile, options?: { donationAmount?: number; donationMessage?: string }) => void;
  redirectPage?: Page;
  redirectOptions?: {
    creator?: CreatorProfile;
    donationAmount?: number;
    donationMessage?: string;
  };
}

const LoginPage: React.FC<LoginPageProps> = ({ navigateTo, redirectPage, redirectOptions }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [view, setView] = useState<'login' | 'reset'>('login');
  const [resetMessage, setResetMessage] = useState('');
  const { login, signInWithGoogle, sendPasswordReset } = useAuth();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setIsLoading(true);

    const result = await login(email, password);

    setIsLoading(false);
    if (result.success) {
      if (redirectPage) {
        navigateTo(redirectPage, redirectOptions?.creator, { donationAmount: redirectOptions?.donationAmount, donationMessage: redirectOptions?.donationMessage });
      } else {
        navigateTo('dashboard');
      }
    } else {
      if(result.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again or reset your password.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error("Firebase Login Error:", result.error);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setResetMessage('');
    setIsGoogleLoading(true);
    const result = await signInWithGoogle();
    if (result.success) {
      if (redirectPage) {
        navigateTo(redirectPage, redirectOptions?.creator, { donationAmount: redirectOptions?.donationAmount, donationMessage: redirectOptions?.donationMessage });
      } else {
        navigateTo('dashboard');
      }
    } else {
      setError(result.error || 'Could not sign in with Google. Please try again.');
    }
    setIsGoogleLoading(false);
  };
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setIsLoading(true);
    const result = await sendPasswordReset(email);
    if (result.success) {
        setResetMessage('Password reset link sent! Check your email inbox.');
    } else {
        setError('Could not send reset link. Please ensure the email address is correct.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#090d16] text-white p-4 relative overflow-hidden">
       {/* Ambient glow */}
       <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

       <button 
            onClick={() => navigateTo('search')}
            className="fixed top-5 left-5 z-50 bg-[#101626]/80 backdrop-blur-md p-3 rounded-full text-slate-200 hover:text-white border border-white/10 hover:border-white/20 shadow-xl transition-all hover:scale-105"
            aria-label="Go back to search"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
            <Logo />
        </div>
        <div className="glass-panel p-8 md:p-10 rounded-3xl shadow-2xl border border-white/10">
          {view === 'login' ? (
            <>
              <h1 className="text-2xl md:text-3xl font-black text-center text-white mb-2 tracking-tight">Welcome Back!</h1>
              <p className="text-center text-slate-400 mb-6 text-sm">Log in to support creators or manage your page.</p>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <Button onClick={handleGoogleSignIn} variant="secondary" className="w-full !py-3.5 !text-base !font-bold !bg-white hover:!bg-slate-100 !text-black rounded-xl shadow-lg transition-all" isLoading={isGoogleLoading}>
                    <GoogleIcon className="w-5 h-5 mr-3" />
                    Sign in with Google
                </Button>
                <div className="flex items-center my-4">
                    <hr className="w-full border-white/10"/>
                    <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest">OR</p>
                    <hr className="w-full border-white/10"/>
                </div>
                <div>
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">Email Address</label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="!rounded-xl !py-3 !px-4 !bg-slate-900/90 !border-white/10 !text-white placeholder:!text-slate-500 focus:!border-emerald-400 focus:!ring-emerald-400" />
                </div>
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label htmlFor="password_login" className="text-xs font-bold uppercase tracking-wider text-slate-300 block">Password</label>
                     <button type="button" onClick={() => setView('reset')} className="text-xs font-semibold text-emerald-400 hover:underline">Forgot?</button>
                  </div>
                  <Input id="password_login" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="!rounded-xl !py-3 !px-4 !bg-slate-900/90 !border-white/10 !text-white placeholder:!text-slate-500 focus:!border-emerald-400 focus:!ring-emerald-400" />
                </div>
                
                {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center">{error}</p>}

                <Button type="submit" variant="success" className="w-full !py-3.5 !text-lg !font-black !bg-emerald-500 hover:!bg-emerald-400 !text-black rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all" isLoading={isLoading}>
                  Log In
                </Button>
              </form>
            </>
          ) : (
             <>
                <h1 className="text-2xl md:text-3xl font-black text-center text-white mb-2 tracking-tight">Reset Password</h1>
                <p className="text-center text-slate-400 mb-6 text-sm">Enter your email to receive a reset link.</p>
                 <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div>
                        <label htmlFor="email_reset" className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">Email Address</label>
                        <Input id="email_reset" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="!rounded-xl !py-3 !px-4 !bg-slate-900/90 !border-white/10 !text-white placeholder:!text-slate-500 focus:!border-emerald-400 focus:!ring-emerald-400" />
                    </div>
                     {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center">{error}</p>}
                     {resetMessage && <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center">{resetMessage}</p>}
                    <Button type="submit" variant="primary" className="w-full !py-3.5 !text-lg !font-black !bg-emerald-500 hover:!bg-emerald-400 !text-black rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all" isLoading={isLoading}>
                        Send Reset Link
                    </Button>
                     <button type="button" onClick={() => { setView('login'); setError(''); setResetMessage('');}} className="w-full text-center text-sm font-semibold text-slate-400 hover:text-emerald-400 hover:underline mt-2">Back to Login</button>
                 </form>
             </>
          )}
        </div>
        <p className="text-center text-slate-400 mt-6 text-sm">
          Don't have an account?{' '}
          <button onClick={() => navigateTo('signup')} className="font-bold text-emerald-400 hover:underline">
            Sign up
          </button>
        </p>
      </div>
      <Footer navigateTo={navigateTo} />
    </div>
  );
};

export default LoginPage;