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
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#090d16] text-white p-4 relative overflow-hidden">
       {/* Background ambient glow */}
       <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

       <button 
            onClick={() => navigateTo('search')}
            className="fixed top-5 left-5 z-50 bg-[#101626]/80 backdrop-blur-md p-3 rounded-full text-slate-200 hover:text-white border border-white/10 hover:border-white/20 shadow-xl transition-all hover:scale-105"
            aria-label="Go back to search"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
      <div className="w-full max-w-lg relative z-10">
        <div className="flex justify-center mb-8">
            <Logo />
        </div>
        <div className="glass-panel p-8 md:p-10 rounded-3xl shadow-2xl border border-white/10">
          <div className="flex justify-center mb-6">
            <div className="inline-flex p-1.5 bg-white/5 border border-white/10 rounded-2xl">
              <button 
                onClick={() => { setIsCreator(true); setError(''); }}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${isCreator ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                Creator
              </button>
              <button 
                onClick={() => { setIsCreator(false); setError(''); setSelectedCreator(null); }}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${!isCreator ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                Fan
              </button>
            </div>
          </div>

          <h1 className="font-heading text-2xl md:text-3xl font-black text-white text-center tracking-tight">
            {isCreator ? 'Turn Views Into Value' : 'Support Your Favorites'}
          </h1>
          <p className="mt-2.5 text-base text-center text-slate-400 max-w-md mx-auto mb-8">
            {isCreator ? 'Let your fans support you directly on Money Me Out.' : 'Join Money Me Out to communicate payments to creators.'}
          </p>
          
          <div className="space-y-6">
            {/* Step 1: Claim Channel (Only for Creators) */}
            {isCreator && (
              <fieldset>
                  <legend className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 border-b border-white/10 pb-2 w-full">1. Find Your Channel</legend>
                  
                  {selectedCreator ? (
                      <div className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl p-4 text-center">
                          <p className="font-bold text-emerald-400 text-sm">Selected Channel:</p>
                          <div className="flex items-center gap-3 justify-center mt-2">
                              <img src={selectedCreator.avatarUrl} className="w-11 h-11 rounded-full ring-2 ring-emerald-500/40 object-cover" alt="" referrerPolicy="no-referrer" />
                              <span className="font-bold text-white text-lg">{selectedCreator.name}</span>
                          </div>
                          <button type="button" onClick={() => setSelectedCreator(null)} className="text-xs text-slate-400 hover:text-emerald-400 hover:underline mt-3 block mx-auto">Change channel</button>
                      </div>
                  ) : (
                      <>
                      <p className="text-xs text-slate-400 mb-3">Search for your YouTube channel by name or handle.</p>
                      <form onSubmit={handleChannelSearch} className="flex gap-2">
                          <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="e.g. MKBHD or @mkbhd" className="!rounded-xl !py-3 !px-4 !bg-slate-900/90 !border-white/10 !text-white placeholder:!text-slate-500 focus:!border-emerald-400 focus:!ring-emerald-400" />
                          <Button type="submit" variant="secondary" className="!px-5 !py-3 !rounded-xl !bg-white/10 !text-white hover:!bg-white/20 !font-bold" isLoading={isSearching}>Find</Button>
                      </form>
                      </>
                  )}
              </fieldset>
            )}

            {isCreator && isSearching ? <Spinner/> : isCreator && searchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-[#101626] border border-white/10 rounded-2xl no-scrollbar">
                    {searchResults.map(creator => (
                        <button type="button" key={creator.id} onClick={() => handleSelectCreator(creator)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-left transition-colors">
                           <img src={creator.avatarUrl} className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-1 ring-white/10" alt="" referrerPolicy="no-referrer" />
                           <div className="truncate">
                            <p className="font-bold text-white text-sm truncate">{creator.name}</p>
                            <p className="text-xs text-emerald-400">{creator.handle}</p>
                           </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Step 2: Account Info */}
            <fieldset>
                <legend className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 border-b border-white/10 pb-2 w-full">
                  {isCreator ? '2. Create Your Account' : 'Create Your Account'}
                </legend>
                 <div className="space-y-4">
                    {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center">{error}</p>}
                    <Button onClick={handleGoogleSignUp} variant="secondary" className="w-full !py-4 !text-base !font-bold !bg-white hover:!bg-slate-100 !text-black rounded-xl shadow-lg transition-all" isLoading={isGoogleLoading} disabled={isCreator && !selectedCreator}>
                        <GoogleIcon className="w-5 h-5 mr-3" />
                        Sign up with Google
                    </Button>
                 </div>
            </fieldset>

          </div>
        </div>
        <p className="text-center text-slate-400 mt-6 text-sm">
          Already have an account?{' '}
          <button onClick={() => navigateTo('login')} className="font-bold text-emerald-400 hover:underline">
            Log In
          </button>
        </p>
      </div>
      <Footer navigateTo={navigateTo} />
    </div>
  );
};

export default SignUpPage;