import React, { useState, useEffect } from 'react';
import { CreatorProfile } from '../types';
import Spinner from '../components/ui/Spinner';
import { getFeaturedCreators, searchCreators } from '../services/youtubeService';
import CreatorCard from '../components/CreatorListItem';
import Header from '../components/layout/Header';
import { Page } from '../App';
import Footer from '../components/layout/Footer';
import { Search, CheckCircle, ShieldCheck, Zap, ArrowRight, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface SearchPageProps {
    onSelectCreator: (creator: CreatorProfile) => void;
    navigateTo: (page: Page) => void;
}

type SearchType = 'featured' | 'keyword';

const SearchPage: React.FC<SearchPageProps> = ({ onSelectCreator, navigateTo }) => {
    const [creators, setCreators] = useState<CreatorProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [query, setQuery] = useState('');
    const [error, setError] = useState<string | { title: string; points: string[] } | null>(null);
    const [searchType, setSearchType] = useState<SearchType>('featured');

    useEffect(() => {
        const fetchInitialCreators = async () => {
            setIsLoading(true);
            setError(null);
            const result = await getFeaturedCreators();
            if (result.isError) {
                const errorMessage = typeof result.errorMessage === 'string' ? result.errorMessage : result.errorMessage?.title || "An error occurred";
                setError(errorMessage);
            } else {
                setCreators(result.creators);
                setSearchType('featured');
            }
            setIsLoading(false);
        };
        fetchInitialCreators();
    }, []);

    const handleSearch = async (e?: React.FormEvent, searchQuery?: string) => {
        if (e) e.preventDefault();
        const finalQuery = searchQuery || query;
        if(!finalQuery.trim()) return;
        
        setIsSearching(true);
        setError(null);
        setCreators([]);

        const keywordResult = await searchCreators(finalQuery);
        if (keywordResult.isError) {
            setError(keywordResult.errorMessage || "An unexpected error occurred with the keyword search.");
        } else {
            setCreators(keywordResult.creators);
            setSearchType('keyword');
        }
        setIsSearching(false);
        
        // Scroll to results
        const resultsSection = document.getElementById('search-results');
        if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-[#121212] min-h-screen font-sans text-white selection:bg-emerald-500/30">
            <Header navigateTo={navigateTo} />
            
            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden">
                    {/* Background Glows */}
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                    <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                    
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-base md:text-lg mb-8 shadow-sm">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span>Money Me Out</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter leading-none">
                                Stop Giving YouTube a <br />
                                <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent italic">30% Cut</span> of Your Support.
                            </h1>
                            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-10 font-medium font-sans">
                                <strong className="text-white font-bold">Money Me Out</strong> is the direct-to-bank monetization platform for YouTube Creators. <br className="hidden md:block" />
                                Get paid instantly, verify your identity, and keep more of what you earn.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button 
                                    onClick={() => navigateTo('signup')}
                                    className="w-full sm:w-auto px-8 py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xl rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                >
                                    Claim Your Channel Now
                                </button>
                                
                                <button 
                                    onClick={() => {
                                        const resultsSection = document.getElementById('search-results');
                                        if (resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="w-full sm:w-auto px-8 py-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xl rounded-2xl border border-slate-800 transition-all active:scale-95"
                                >
                                    Browse Creators
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Search Bar Section */}
                <section id="search-results" className="py-12 relative z-10">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <form onSubmit={(e) => handleSearch(e)} className="relative group">
                                <input 
                                    type="search" 
                                    placeholder="Search for your favorite creators..." 
                                    className="w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl py-6 px-16 text-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-white placeholder:text-slate-600"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                />
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                                <button 
                                    type="submit"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-2 bg-emerald-500 text-black font-bold rounded-xl active:scale-95 transition-all text-sm shadow-lg shadow-emerald-500/20"
                                >
                                    Search
                                </button>
                            </form>
                        </div>

                        {/* Search Results / Featured */}
                        <div className="mt-20">
                            {isLoading || isSearching ? (
                                <div className="py-20 flex justify-center"><Spinner /></div>
                            ) : (
                                <div className="max-w-7xl mx-auto">
                                    <div className="flex items-center justify-between mb-10 border-b border-slate-900 pb-6">
                                        <h2 className="text-3xl font-black italic uppercase italic">
                                            {searchType === 'featured' ? 'Featured Creators' : `Results for "${query}"`}
                                        </h2>
                                        {searchType === 'keyword' && (
                                            <button 
                                                onClick={() => window.location.reload()} 
                                                className="text-emerald-500 font-bold hover:underline"
                                            >
                                                Back to Featured
                                            </button>
                                        )}
                                    </div>
                                    
                                    {creators.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                            {creators.map(creator => <CreatorCard key={creator.id} creator={creator} onSelect={onSelectCreator} />)}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
                                            <div className="text-5xl mb-4">🔍</div>
                                            <h2 className="text-2xl font-bold text-slate-300">No creators found</h2>
                                            <p className="text-slate-500 mt-2 text-lg">Try a different search term. We're always adding new creators!</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Comparison Section */}
                <section className="py-32 bg-[#1a1a1a] relative overflow-hidden">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="text-center mb-20 md:mb-32">
                            <h2 className="text-4xl md:text-6xl font-black mb-6 italic uppercase">Why Money Me Out?</h2>
                            <p className="text-xl text-slate-400">The numbers don't lie. Stop leaving money on the table.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 items-stretch">
                            {/* The Old Way */}
                            <motion.div 
                                whileHover={{ y: -5 }}
                                className="bg-slate-900/30 border border-slate-800 rounded-3xl p-10 relative overflow-hidden flex flex-col"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
                                <h3 className="text-2xl font-black mb-8 text-slate-500 uppercase tracking-widest">The Old Way (AdSense/Super Chat)</h3>
                                <ul className="space-y-6 flex-grow">
                                    <li className="flex gap-4">
                                        <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                            <span className="text-red-500 text-xs font-bold">X</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-200">The 30% Tax</p>
                                            <p className="text-slate-500">YouTube takes nearly 1/3 of every dollar fans send you.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                            <span className="text-red-500 text-xs font-bold">X</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-200">The $100 Wall</p>
                                            <p className="text-slate-500">You can’t touch your money until you reach a $100 threshold.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                            <span className="text-red-500 text-xs font-bold">X</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-200">The 30-Day Wait</p>
                                            <p className="text-slate-500">Even after you earn it, you wait weeks for the "payout cycle."</p>
                                        </div>
                                    </li>
                                </ul>
                            </motion.div>

                            {/* The Money Me Out Way */}
                            <motion.div 
                                whileHover={{ y: -5 }}
                                className="bg-emerald-500/5 border-2 border-emerald-500/30 rounded-3xl p-10 relative overflow-hidden flex flex-col shadow-2xl shadow-emerald-500/10"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                                <h3 className="text-2xl font-black mb-8 text-emerald-400 uppercase tracking-widest">The Money Me Out Way</h3>
                                <ul className="space-y-6 flex-grow">
                                    <li className="flex gap-4">
                                        <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">Keep Your Earnings</p>
                                            <p className="text-slate-400">We only take a small 5% platform fee. You keep significantly more.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">No Minimums</p>
                                            <p className="text-slate-400">Whether it’s $10 or $1,000, it’s your money. Access it when you want.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">Instant Liquidity</p>
                                            <p className="text-slate-400">Withdraw directly to your bank account via Stripe Connect in real-time.</p>
                                        </div>
                                    </li>
                                </ul>
                                <div className="mt-10 pt-8 border-t border-emerald-500/20">
                                    <button onClick={() => navigateTo('signup')} className="w-full py-5 bg-emerald-500 text-black font-black text-lg rounded-2xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">Join the New Wave</button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Feature Highlights */}
                <section className="py-32">
                    <div className="container mx-auto px-4 max-w-6xl">
                         <h2 className="text-4xl md:text-6xl font-black mb-20 tracking-tighter italic uppercase text-center md:text-left">Built for Creators</h2>
                        <div className="grid md:grid-cols-3 gap-12 lg:gap-20">
                            <div className="text-center md:text-left">
                                <div className="h-20 w-20 bg-emerald-500/10 rounded-[28px] flex items-center justify-center mb-8 mx-auto md:mx-0 border border-emerald-500/20">
                                    <UserCheck className="h-10 w-10 text-emerald-500" />
                                </div>
                                <h3 className="text-2xl font-black mb-4">1. Verified Identity (Trust is Key)</h3>
                                <p className="text-slate-400 leading-relaxed text-lg">
                                    Fans want to know their money is going to the real you. We use the YouTube Data API to verify your channel identity, so your supporters can donate with 100% confidence.
                                </p>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="h-20 w-20 bg-blue-500/10 rounded-[28px] flex items-center justify-center mb-8 mx-auto md:mx-0 border border-blue-500/20">
                                    <Zap className="h-10 w-10 text-blue-500" />
                                </div>
                                <h3 className="text-2xl font-black mb-4">2. Real-Time Gratitude</h3>
                                <p className="text-slate-400 leading-relaxed text-lg">
                                    Never miss a moment. Our real-time notification engine triggers a live "toast" alert the second a fan supports you. See their name, their amount, and their personal message instantly.
                                </p>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="h-20 w-20 bg-purple-500/10 rounded-[28px] flex items-center justify-center mb-8 mx-auto md:mx-0 border border-purple-500/20">
                                    <ShieldCheck className="h-10 w-10 text-purple-500" />
                                </div>
                                <h3 className="text-2xl font-black mb-4">3. Institutional-Grade Security</h3>
                                <p className="text-slate-400 leading-relaxed text-lg">
                                    Your finances are serious. That’s why we built Money Me Out on top of Stripe and Google Cloud. We never see your bank details or credit card numbers—everything is handled by the same world-class security used by the world’s biggest tech companies.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it Works */}
                <section className="py-32 bg-slate-900/20 border-y border-slate-900/50">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <h2 className="text-4xl md:text-6xl font-black text-center mb-24 tracking-tighter italic uppercase text-emerald-500">The Game Plan</h2>
                        
                        <div className="space-y-40">
                            {/* Step 1 */}
                            <div className="group flex flex-col md:flex-row items-center gap-16 md:gap-32">
                                <div className="flex-1">
                                    <span className="text-9xl font-black text-slate-800/30 group-hover:text-emerald-500/10 transition-colors pointer-events-none select-none">01</span>
                                    <h3 className="text-5xl font-black mt-[-60px] mb-8">Search & Claim</h3>
                                    <p className="text-2xl text-slate-400 leading-relaxed font-medium">
                                        Find your YouTube channel via our search tool and verify your ownership in one click. Our integration with the YouTube Data API makes verification instant and foolproof.
                                    </p>
                                </div>
                                <div className="flex-1 w-full bg-slate-900 border-2 border-slate-800 rounded-[40px] p-12 shadow-2xl relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-[40px] pointer-events-none"></div>
                                    <Search className="h-24 w-24 text-emerald-500 mb-8" />
                                    <div className="h-5 w-3/4 bg-slate-800 rounded-full mb-6"></div>
                                    <div className="h-5 w-1/2 bg-slate-800 rounded-full"></div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="group flex flex-col md:flex-row-reverse items-center gap-16 md:gap-32">
                                <div className="flex-1">
                                    <span className="text-9xl font-black text-slate-800/30 group-hover:text-blue-500/10 transition-colors pointer-events-none select-none">02</span>
                                    <h3 className="text-5xl font-black mt-[-60px] mb-8">Onboard with Stripe</h3>
                                    <p className="text-2xl text-slate-400 leading-relaxed font-medium">
                                        Set up your secure Express Payout account. It takes less than 3 minutes to link your bank account. After that, you're ready to receive payouts globally.
                                    </p>
                                </div>
                                <div className="flex-1 w-full bg-slate-900 border-2 border-slate-800 rounded-[40px] p-12 shadow-2xl relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-[40px] pointer-events-none"></div>
                                    <ShieldCheck className="h-24 w-24 text-blue-500 mb-8" />
                                    <div className="h-5 w-full bg-slate-800 rounded-full mb-6"></div>
                                    <div className="h-5 w-2/3 bg-slate-800 rounded-full"></div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="group flex flex-col md:flex-row items-center gap-16 md:gap-32">
                                <div className="flex-1">
                                    <span className="text-9xl font-black text-slate-800/30 group-hover:text-purple-500/10 transition-colors pointer-events-none select-none">03</span>
                                    <h3 className="text-5xl font-black mt-[-60px] mb-8">Start Earning</h3>
                                    <p className="text-2xl text-slate-400 leading-relaxed font-medium">
                                        Share your profile link with your fans. Watch the real-time notifications roll in and cash out whenever you're ready. No more waiting for the end of the month.
                                    </p>
                                </div>
                                <div className="flex-1 w-full bg-slate-900 border-2 border-slate-800 rounded-[40px] p-12 shadow-2xl relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-[40px] pointer-events-none"></div>
                                    <Zap className="h-24 w-24 text-purple-500 mb-8" />
                                    <div className="h-10 w-1/3 bg-emerald-500 rounded-2xl mb-6"></div>
                                    <div className="h-5 w-full bg-slate-800 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PayPal vs Money Me Out Comparison */}
                <section className="py-24 bg-slate-900/10">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 md:p-16 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                            
                            <div className="relative z-10">
                                <h2 className="text-3xl md:text-5xl font-black mb-8 italic uppercase text-center md:text-left">
                                    Why not just use <span className="text-blue-400">PayPal</span>?
                                </h2>
                                
                                <div className="space-y-8 text-xl md:text-2xl text-slate-300 font-medium leading-relaxed">
                                    <p>
                                        PayPal links don't verify who you are. <span className="text-emerald-400 font-bold">Money Me Out</span> uses the YouTube Data API to prove that the person receiving the money is the person on the screen.
                                    </p>
                                    <p>
                                        Plus, PayPal often freezes creator funds for 21 days. With our Stripe Connect integration, your money is yours—withdraw it to your bank as soon as it clears.
                                    </p>
                                </div>
                                
                                <div className="mt-12">
                                    <button 
                                        onClick={() => navigateTo('signup')}
                                        className="inline-flex items-center gap-2 text-emerald-500 font-black text-xl hover:text-emerald-400 transition-colors group"
                                    >
                                        Start earning with confidence
                                        <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section (AEO & SEO Optimized) */}
                <section className="py-24 bg-slate-900/30 border-t border-slate-800/50">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-6xl font-black italic uppercase mb-4 tracking-tight">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-xl text-slate-400 font-medium">
                                Everything you need to know about Money Me Out, payouts, and channel verification.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 hover:border-emerald-500/40 transition-colors">
                                <h3 className="text-xl md:text-2xl font-bold mb-3 text-white flex items-center gap-3">
                                    <span className="text-emerald-400 font-mono">01.</span> What is Money Me Out?
                                </h3>
                                <p className="text-slate-300 text-lg leading-relaxed font-normal">
                                    Money Me Out is a direct-to-bank monetization platform for YouTube creators. It allows fans to send financial support directly to creators without the 30% cut taken by legacy platforms like YouTube Super Chat. We verify creator channel ownership using the official YouTube Data API and route instant payouts through Stripe Connect.
                                </p>
                            </div>

                            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 hover:border-emerald-500/40 transition-colors">
                                <h3 className="text-xl md:text-2xl font-bold mb-3 text-white flex items-center gap-3">
                                    <span className="text-emerald-400 font-mono">02.</span> How does Money Me Out compare to YouTube Super Chat?
                                </h3>
                                <p className="text-slate-300 text-lg leading-relaxed font-normal">
                                    YouTube Super Chat deducts a 30% fee from creator earnings and holds funds until you hit a $100 payout threshold. Money Me Out charges only a flat 5% platform fee (plus standard Stripe processing fees), has zero payout thresholds, and sends payouts directly to your bank account via Stripe Connect.
                                </p>
                            </div>

                            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 hover:border-emerald-500/40 transition-colors">
                                <h3 className="text-xl md:text-2xl font-bold mb-3 text-white flex items-center gap-3">
                                    <span className="text-emerald-400 font-mono">03.</span> How do creator payouts work?
                                </h3>
                                <p className="text-slate-300 text-lg leading-relaxed font-normal">
                                    Creators link their bank account securely through Stripe Connect Express. When fans contribute on Money Me Out, payments process instantly via Stripe and can be cashed out directly to your bank account with no 30-day waiting periods.
                                </p>
                            </div>

                            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 hover:border-emerald-500/40 transition-colors">
                                <h3 className="text-xl md:text-2xl font-bold mb-3 text-white flex items-center gap-3">
                                    <span className="text-emerald-400 font-mono">04.</span> How is channel ownership verified?
                                </h3>
                                <p className="text-slate-300 text-lg leading-relaxed font-normal">
                                    Money Me Out uses Google OAuth and the official YouTube Data API v3 to confirm that the person claiming a creator profile is the actual owner of that YouTube channel. This guarantees that fan contributions go strictly to the genuine creator.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-48 bg-[#121212] relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-emerald-500/5 rounded-full blur-[180px] pointer-events-none"></div>
                    
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-6xl md:text-8xl lg:text-9xl font-black mb-10 tracking-tighter leading-none italic uppercase">
                                Ready to take <br /> control?
                            </h2>
                            <p className="text-2xl md:text-3xl text-slate-400 mb-16 max-w-4xl mx-auto font-medium">
                                Join the new wave of creators who prioritize direct fan support and instant payouts.
                            </p>
                            <button 
                                onClick={() => navigateTo('signup')}
                                className="group relative px-16 py-8 bg-emerald-500 text-black font-black text-3xl rounded-[32px] hover:bg-emerald-400 transition-all shadow-3xl shadow-emerald-500/30 flex items-center gap-4 mx-auto active:scale-95"
                            >
                                Get Started for Free
                                <ArrowRight className="h-8 w-8 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </motion.div>
                        
                        {/* Transparency Small Print */}
                        <div className="mt-40 max-w-3xl mx-auto text-slate-600 text-base leading-relaxed border-t border-slate-900/50 pt-16">
                            <p className="italic">
                                "We believe in transparency. Money Me Out charges a flat 5% platform fee. Standard Stripe processing fees (2.9% + $0.30) apply. No hidden monthly subscriptions. No upfront costs. We only make money when you do."
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer navigateTo={navigateTo} />
        </div>
    );
};

export default SearchPage;
