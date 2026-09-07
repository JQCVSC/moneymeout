import React, { useState, useEffect } from 'react';
import { CreatorProfile, CreatorPost } from '../types';
import Button from '../components/ui/Button';
import { getCreatorFeed } from '../services/youtubeService';
import Spinner from '../components/ui/Spinner';
import FeedPostCard from '../components/CreatorCard';
import LogoIcon from '../components/ui/LogoIcon';
import { Page } from '../App';
import Footer from '../components/layout/Footer';

interface CreatorProfilePageProps {
  creator: CreatorProfile;
  navigateTo: (page: Page, creator?: CreatorProfile, options?: { donationAmount?: number }) => void;
}

const CreatorProfilePage: React.FC<CreatorProfilePageProps> = ({ creator, navigateTo }) => {
    const [feed, setFeed] = useState<CreatorPost[]>([]);
    const [isLoadingFeed, setIsLoadingFeed] = useState(true);
    const [activeTab, setActiveTab] = useState<'feed' | 'about'>('feed');
    const [raisedAmount, setRaisedAmount] = useState<number | null>(null);

    useEffect(() => {
        const fetchCreatorBalance = async () => {
            try {
                const response = await fetch(`/api/creators/${creator.id}/balance`);
                const contentType = response.headers.get('content-type') || '';
                if (response.ok && contentType.includes('application/json')) {
                    const data = await response.json();
                    setRaisedAmount(data.balance);
                }
            } catch (error) {
                console.error("Failed to fetch creator balance:", error);
            }
        };
        fetchCreatorBalance();
    }, [creator.id]);

    useEffect(() => {
        if (creator && activeTab === 'feed' && feed.length === 0) {
            const fetchFeed = async () => {
                setIsLoadingFeed(true);
                const feedResult = await getCreatorFeed(creator.id);
                if (!feedResult.isError) {
                    setFeed(feedResult.posts);
                }
                setIsLoadingFeed(false);
            };
            fetchFeed();
        }
    }, [creator, activeTab, feed.length]);
    
     const handleBack = () => {
        navigateTo('search');
     };

    const bannerUrl = creator.bannerUrl || 'https://images.unsplash.com/photo-1511376777868-611b54f68947?q=80&w=2070&auto=format&fit=crop';
    
    return (
        <div className="bg-[#090d16] min-h-screen text-white">
            {/* Back button */}
            <button 
                onClick={handleBack} 
                className="fixed top-5 left-5 z-50 bg-[#101626]/80 backdrop-blur-md p-3 rounded-full text-slate-200 hover:text-white border border-white/10 hover:border-white/20 shadow-xl transition-all hover:scale-105"
                aria-label="Go back to search"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>

            <div className="relative w-full h-52 md:h-72 bg-cover bg-center overflow-hidden" style={{backgroundImage: `url("${bannerUrl}")`}}>
                <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/40 to-transparent" />
            </div>
            
            <div className="container mx-auto p-4 md:p-8">
                <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-28 relative z-10 px-4">
                    <img className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full ring-4 ring-[#090d16] bg-slate-800 object-cover shadow-2xl" src={creator.avatarUrl} alt={`${creator.name} avatar`} referrerPolicy="no-referrer" />
                    <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left flex-grow">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">{creator.name}</h1>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2">
                            <a href={`https://youtube.com/${creator.handle}`} target="_blank" rel="noopener noreferrer" className="text-base sm:text-lg text-slate-400 hover:text-emerald-400 transition-colors">{`youtube.com/${creator.handle}`}</a>
                            {raisedAmount != null && (
                                <div className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-1 rounded-full text-xs sm:text-sm w-fit mx-auto md:mx-0 shadow-sm">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span>Total Raised: ${raisedAmount?.toLocaleString() || "0"}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-6 md:mt-0 w-full md:w-auto">
                        <Button 
                            variant="success" 
                            className="w-full md:w-auto !py-4 md:!py-3.5 !px-8 text-lg font-black bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
                            onClick={() => navigateTo('payment', creator, { donationAmount: 5, donationMessage: '' })}
                        >
                            <LogoIcon className="w-5 h-5 mr-2" />
                            Money me out
                        </Button>
                    </div>
                </div>

                <div className="mt-8 glass-panel rounded-2xl p-6 border border-white/10">
                    <p className="text-base md:text-lg text-slate-300 leading-relaxed">{creator.description.substring(0, 200)}{creator.description.length > 200 && '...'}</p>
                </div>
                
                <div className="mt-8">
                     <div className="border-b border-white/10 mb-6">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('feed')}
                                className={`whitespace-nowrap py-4 px-2 border-b-2 font-bold text-base md:text-lg transition-colors ${activeTab === 'feed' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                            >
                                Feed
                            </button>
                            <button
                                 onClick={() => setActiveTab('about')}
                                 className={`whitespace-nowrap py-4 px-2 border-b-2 font-bold text-base md:text-lg transition-colors ${activeTab === 'about' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                            >
                                About
                            </button>
                        </nav>
                    </div>
                    
                    {activeTab === 'feed' && (
                        <div>
                            {isLoadingFeed ? <Spinner /> : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {feed.map(post => <FeedPostCard key={post.id} post={post} />)}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {activeTab === 'about' && (
                         <div className="glass-panel rounded-2xl p-6 border border-white/10">
                             <h2 className="text-2xl font-bold text-white mb-4">About {creator.name}</h2>
                            <p className="text-base text-slate-300 leading-relaxed whitespace-pre-wrap">{creator.description || "No description available."}</p>
                         </div>
                    )}
                </div>
            </div>
            <Footer navigateTo={navigateTo} />
        </div>
    );
};

export default CreatorProfilePage;