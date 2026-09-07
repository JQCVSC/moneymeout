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
              <fieldset className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <legend className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${selectedCreator ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white'}`}>
                        {selectedCreator ? '✓' : '1'}
                      </span>
                      Find Your Channel
                    </legend>
                    {selectedCreator && (
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        Channel Linked
                      </span>
                    )}
                  </div>
                  
                  {selectedCreator ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 text-center relative overflow-hidden">
                          <div className="flex items-center gap-3 justify-center">
                              <img src={selectedCreator.avatarUrl} className="w-12 h-12 rounded-full ring-2 ring-emerald-500/50 object-cover bg-slate-800" alt="" referrerPolicy="no-referrer" />
                              <div className="text-left">
                                <span className="font-bold text-white text-lg block leading-tight">{selectedCreator.name}</span>
                                <span className="text-xs text-emerald-400 font-medium">{selectedCreator.handle}</span>
                              </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setSelectedCreator(null)} 
                            className="text-xs text-slate-400 hover:text-white hover:underline mt-3 inline-block transition-colors"
                          >
                            ← Select a different channel
                          </button>
                      </div>
                  ) : (
                      <>
                      <p className="text-xs text-slate-400">Search by your channel name or @handle to link your page.</p>
                      <form onSubmit={handleChannelSearch} className="flex gap-2">
                          <Input 
                            value={searchQuery} 
                            onChange={e => setSearchQuery(e.target.value)} 
                            placeholder="e.g. MKBHD or @mkbhd" 
                            className="!rounded-xl !py-3 !px-4 !bg-slate-900/90 !border-white/10 !text-white placeholder:!text-slate-500 focus:!border-emerald-400 focus:!ring-emerald-400 text-sm sm:text-base" 
                          />
                          <Button 
                            type="submit" 
                            variant="secondary" 
                            className="!px-5 !py-3 !rounded-xl !bg-emerald-500 hover:!bg-emerald-400 !text-black !font-bold flex-shrink-0 active:scale-95 transition-all shadow-md shadow-emerald-500/20" 
                            isLoading={isSearching}
                          >
                            Search
                          </Button>
                      </form>
                      </>
                  )}
              </fieldset>
            )}

            {isCreator && isSearching ? (
                <div className="py-6 flex justify-center"><Spinner /></div>
            ) : isCreator && searchResults.length > 0 && !selectedCreator && (
                <div className="space-y-1.5 max-h-64 overflow-y-auto p-2 bg-[#101626] border border-white/10 rounded-2xl no-scrollbar">
                    <p className="text-xs font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">Select your channel:</p>
                    {searchResults.map(creator => (
                        <button 
                          type="button" 
                          key={creator.id} 
                          onClick={() => handleSelectCreator(creator)} 
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-left transition-all group border border-transparent hover:border-white/10"
                        >
                           <img src={creator.avatarUrl} className="w-11 h-11 rounded-full object-cover flex-shrink-0 ring-1 ring-white/10 group-hover:ring-emerald-400/50 transition-all" alt="" referrerPolicy="no-referrer" />
                           <div className="truncate flex-grow">
                            <p className="font-bold text-white text-sm truncate group-hover:text-emerald-400 transition-colors">{creator.name}</p>
                            <p className="text-xs text-slate-400">{creator.handle}</p>
                           </div>
                           <span className="text-xs font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                             Select →
                           </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Step 2: Account Info */}
            <fieldset className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <legend className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-xs font-black">
                      {isCreator ? '2' : '1'}
                    </span>
                    {isCreator ? 'Create Your Account' : 'Sign Up'}
                  </legend>
                </div>

                 <div className="space-y-4">
                    {isCreator && !selectedCreator && (
                      <p className="text-xs text-slate-400 italic">
                        👆 First find and select your YouTube channel above to enable Google sign-up.
                      </p>
                    )}
                    {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center">{error}</p>}
                    <Button 
                      onClick={handleGoogleSignUp} 
                      variant="secondary" 
                      className={`w-full !py-4 !text-base !font-bold rounded-xl shadow-lg transition-all ${
                        isCreator && !selectedCreator 
                          ? '!bg-white/20 !text-slate-400 cursor-not-allowed opacity-60' 
                          : '!bg-white hover:!bg-slate-100 !text-black hover:scale-[1.01] active:scale-95'
                      }`} 
                      isLoading={isGoogleLoading} 
                      disabled={isCreator && !selectedCreator}
                    >
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