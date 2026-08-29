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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
       <button 
            onClick={() => navigateTo('search')}
            className="fixed top-4 left-4 z-50 bg-white/70 backdrop-blur-sm p-2 rounded-full text-[var(--text-primary)] hover:bg-white shadow-md transition-all"
            aria-label="Go back to search"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
            <Logo />
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
          {view === 'login' ? (
            <>
              <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Welcome Back!</h1>
              <p className="text-center text-gray-500 mb-6">Log in to support creators or manage your page.</p>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <Button onClick={handleGoogleSignIn} variant="secondary" className="w-full !py-3" isLoading={isGoogleLoading}>
                    <GoogleIcon className="w-5 h-5 mr-3" />
                    Sign in with Google
                </Button>
                <div className="flex items-center my-4">
                    <hr className="w-full border-gray-300"/>
                    <p className="px-2 text-sm text-gray-500 bg-white">OR</p>
                    <hr className="w-full border-gray-300"/>
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-bold text-gray-600 block mb-2">Email Address</label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="!rounded-lg !py-3 !px-4" />
                </div>
                <div>
                  <div className="flex justify-between items-baseline">
                    <label htmlFor="password_login" className="text-sm font-bold text-gray-600 block mb-2">Password</label>
                     <button type="button" onClick={() => setView('reset')} className="text-sm text-[var(--primary-color)] hover:underline">Forgot?</button>
                  </div>
                  <Input id="password_login" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="!rounded-lg !py-3 !px-4" />
                </div>
                
                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button type="submit" variant="success" className="w-full !py-3 !text-lg" isLoading={isLoading}>
                  Log In
                </Button>
              </form>
            </>
          ) : (
             <>
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Reset Password</h1>
                <p className="text-center text-gray-500 mb-6">Enter your email to receive a reset link.</p>
                 <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div>
                        <label htmlFor="email_reset" className="text-sm font-bold text-gray-600 block mb-2">Email Address</label>
                        <Input id="email_reset" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="!rounded-lg !py-3 !px-4" />
                    </div>
                     {error && <p className="text-sm text-red-600">{error}</p>}
                     {resetMessage && <p className="text-sm text-green-600">{resetMessage}</p>}
                    <Button type="submit" variant="primary" className="w-full !py-3 !text-lg" isLoading={isLoading}>
                        Send Reset Link
                    </Button>
                     <button type="button" onClick={() => { setView('login'); setError(''); setResetMessage('');}} className="w-full text-center text-sm text-gray-500 hover:underline mt-2">Back to Login</button>
                 </form>
             </>
          )}
        </div>
        <p className="text-center text-gray-500 mt-6">
          Don't have an account?{' '}
          <button onClick={() => navigateTo('signup')} className="font-semibold text-[var(--primary-color)] hover:underline">
            Sign up
          </button>
        </p>
      </div>
      <Footer navigateTo={navigateTo} />
    </div>
  );
};

export default LoginPage;