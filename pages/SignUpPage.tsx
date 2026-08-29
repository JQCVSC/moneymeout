import React, { useState } from 'react';
import { Page } from '../App';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/ui/Logo';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { searchCreators } from '../services/youtubeService';
import { CreatorProfile } from '../types';
import Spinner from '../components/ui/Spinner';
import GoogleIcon from '../components/ui/GoogleIcon';
import Footer from '../components/layout/Footer';

interface SignUpPageProps {
  navigateTo: (page: Page) => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ navigateTo }) => {
  const [isCreator, setIsCreator] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signup, signInWithGoogle } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<CreatorProfile[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<CreatorProfile | null>(null);

  const handleChannelSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSelectedCreator(null);
    setError('');
    const result = await searchCreators(searchQuery);
    if (!result.isError) {
      setSearchResults(result.creators);
    } else {
      setError('Could not perform search. Please check API keys.');
    }
    setIsSearching(false);
  };
  
  const handleSelectCreator = (creator: CreatorProfile) => {
      setSelectedCreator(creator);
      setSearchResults([]);
      setSearchQuery('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreator && !selectedCreator) {
        setError('Please find and select your YouTube channel to continue.');
        return;
    }
    setError('');
    setIsLoading(true);

    const result = await signup(name, email, password, isCreator ? (selectedCreator || undefined) : undefined);

    setIsLoading(false);
    if (result.success) {
      navigateTo('dashboard');
    } else {
      setError(result.error || 'Could not create account. Please check your details.');
    }
  };
  
  const handleGoogleSignUp = async () => {
    if (isCreator && !selectedCreator) {
        setError('Please find and select your YouTube channel before signing up with Google.');
        return;
    }
    setError('');
    setIsGoogleLoading(true);
    const result = await signInWithGoogle(isCreator ? (selectedCreator || undefined) : undefined);
    if(result.success) {
        navigateTo('dashboard');
    } else {
        setError(result.error || 'Could not sign up with Google. Please try again.');
    }
    setIsGoogleLoading(false);
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
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-8">
            <Logo />
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
          <div className="flex justify-center mb-6">
            <div className="inline-flex p-1 bg-gray-100 rounded-xl">
              <button 
                onClick={() => { setIsCreator(true); setError(''); }}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${isCreator ? 'bg-white text-[var(--success-color)] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Creator
              </button>
              <button 
                onClick={() => { setIsCreator(false); setError(''); setSelectedCreator(null); }}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${!isCreator ? 'bg-white text-[var(--primary-color)] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Fan
              </button>
            </div>
          </div>

          <h1 className="font-heading text-3xl md:text-4xl font-bold text-[var(--text-primary)] text-center leading-tight tracking-tight">
            {isCreator ? 'Turn Views Into Value' : 'Support Your Favorites'}
          </h1>
          <p className="mt-4 text-lg text-center text-[var(--text-secondary)] max-w-md mx-auto mb-8">
            {isCreator ? 'Let your fans support you directly on Money Me Out.' : 'Join Money Me Out to communicate payments to creators.'}
          </p>
          
          <div className="space-y-6">
            {/* Step 1: Claim Channel (Only for Creators) */}
            {isCreator && (
              <fieldset>
                  <legend className="text-lg font-bold text-gray-700 mb-3 border-b pb-2 w-full">1. Find Your Channel</legend>
                  
                  {selectedCreator ? (
                      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 text-center">
                          <p className="font-semibold text-emerald-800">Your Channel:</p>
                          <div className="flex items-center gap-3 justify-center mt-2">
                              <img src={selectedCreator.avatarUrl} className="w-10 h-10 rounded-full" alt="" referrerPolicy="no-referrer" />
                              <span className="font-bold text-gray-800">{selectedCreator.name}</span>
                          </div>
                          <button type="button" onClick={() => setSelectedCreator(null)} className="text-sm text-gray-500 hover:underline mt-2">Change channel</button>
                      </div>
                  ) : (
                      <>
                      <p className="text-sm text-gray-500 mb-3">Search for your YouTube channel by name or handle.</p>
                      <form onSubmit={handleChannelSearch} className="flex gap-2">
                          <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="e.g. MKBHD or @mkbhd" className="!rounded-lg !py-3 !px-4" />
                          <Button type="submit" variant="secondary" className="!px-4 !py-2.5" isLoading={isSearching}>Find</Button>
                      </form>
                      </>
                  )}
              </fieldset>
            )}

            {isCreator && isSearching ? <Spinner/> : isCreator && searchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                    {searchResults.map(creator => (
                        <button type="button" key={creator.id} onClick={() => handleSelectCreator(creator)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 text-left">
                           <img src={creator.avatarUrl} className="w-10 h-10 rounded-full flex-shrink-0" alt="" referrerPolicy="no-referrer" />
                           <div>
                            <p className="font-bold">{creator.name}</p>
                            <p className="text-sm text-gray-500">{creator.handle}</p>
                           </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Step 2: Account Info */}
            <fieldset>
                <legend className="text-lg font-bold text-gray-700 mb-3 border-b pb-2 w-full">
                  {isCreator ? '2. Create Your Account' : 'Create Your Account'}
                </legend>
                 <div className="space-y-4">
                    <Button onClick={handleGoogleSignUp} variant="secondary" className="w-full !py-3" isLoading={isGoogleLoading} disabled={isCreator && !selectedCreator}>
                        <GoogleIcon className="w-5 h-5 mr-3" />
                        Sign up with Google
                    </Button>
                    <div className="flex items-center my-2">
                        <hr className="w-full border-gray-300"/>
                        <p className="px-2 text-sm text-gray-500 bg-white">OR</p>
                        <hr className="w-full border-gray-300"/>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-gray-600 block mb-2" htmlFor="name">Full Name</label>
                            <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" required className="!rounded-lg !py-3 !px-4" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-600 block mb-2" htmlFor="email_signup">Email Address</label>
                            <Input id="email_signup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="!rounded-lg !py-3 !px-4" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-600 block mb-2" htmlFor="password_signup">Password</label>
                            <Input id="password_signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="!rounded-lg !py-3 !px-4" />
                        </div>
                         {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                        <Button type="submit" variant={isCreator ? "success" : "primary"} className="w-full !py-3 !text-lg" isLoading={isLoading} disabled={isCreator && !selectedCreator}>
                          {isCreator ? 'Create My Page' : 'Sign Up'}
                        </Button>
                    </form>
                 </div>
            </fieldset>

          </div>
        </div>
        <p className="text-center text-gray-500 mt-6">
          Already have an account?{' '}
          <button onClick={() => navigateTo('login')} className="font-semibold text-[var(--primary-color)] hover:underline">
            Log In
          </button>
        </p>
      </div>
      <Footer navigateTo={navigateTo} />
    </div>
  );
};

export default SignUpPage;