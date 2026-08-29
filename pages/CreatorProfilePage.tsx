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
        <div className="bg-[var(--background-color)] min-h-screen">
            {/* Back button */}
            <button 
                onClick={handleBack} 
                className="fixed top-4 left-4 z-50 bg-white/70 backdrop-blur-sm p-2 rounded-full text-[var(--text-primary)] hover:bg-white shadow-md transition-all"
                aria-label="Go back to search"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>

            <div className="w-full h-48 md:h-64 bg-cover bg-center" style={{backgroundImage: `url("${bannerUrl}")`}} />
            
            <div className="container mx-auto p-4 md:p-8">
                <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-28 relative z-10 px-4">
                    <img className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-slate-200 object-cover shadow-lg" src={creator.avatarUrl} alt={`${creator.name} avatar`} referrerPolicy="no-referrer" />
                    <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left flex-grow">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight">{creator.name}</h1>
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mt-1">
                            <a href={`https://youtube.com/${creator.handle}`} target="_blank" rel="noopener noreferrer" className="text-base sm:text-lg text-[var(--text-secondary)] hover:underline">{`youtube.com/${creator.handle}`}</a>
                            {raisedAmount != null && (
                                <div className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full text-xs sm:text-sm w-fit mx-auto md:mx-0">
                                    <span className="mr-1">💰</span>
                                    Total Raised: ${raisedAmount?.toLocaleString() || "0"}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-6 md:mt-0 w-full md:w-auto">
                        <Button 
                            variant="success" 
                            className="w-full md:w-auto !py-4 md:!py-3 !px-8 text-lg font-bold shadow-lg shadow-emerald-100"
                            onClick={() => navigateTo('payment', creator, { donationAmount: 5, donationMessage: '' })}
                        >
                            <LogoIcon className="w-5 h-5 mr-2" />
                            Money me out
                        </Button>
                    </div>
                </div>

                <div className="mt-8 bg-[var(--card-background-color)] rounded-2xl shadow-sm border border-[var(--border-color)] p-6">
                    <p className="text-lg text-[var(--text-primary)] leading-relaxed">{creator.description.substring(0, 200)}{creator.description.length > 200 && '...'}</p>
                </div>
                
                <div className="mt-8">
                     <div className="border-b border-[var(--border-color)] mb-6">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('feed')}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${activeTab === 'feed' ? 'border-[var(--primary-color)] text-[var(--primary-color)]' : 'border-transparent text-[var(--text-secondary)] hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                Feed
                            </button>
                            <button
                                 onClick={() => setActiveTab('about')}
                                 className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${activeTab === 'about' ? 'border-[var(--primary-color)] text-[var(--primary-color)]' : 'border-transparent text-[var(--text-secondary)] hover:text-gray-700 hover:border-gray-300'}`}
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
                         <div className="bg-[var(--card-background-color)] rounded-2xl shadow-sm border border-[var(--border-color)] p-6">
                             <h2 className="text-2xl font-bold mb-4">About {creator.name}</h2>
                            <p className="text-base text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{creator.description || "No description available."}</p>
                         </div>
                    )}
                </div>
            </div>
            <Footer navigateTo={navigateTo} />
        </div>
    );
};

export default CreatorProfilePage;