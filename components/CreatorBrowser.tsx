import React, { useState, useEffect } from 'react';
import { CreatorProfile } from '../types';
import Spinner from './ui/Spinner';
import { getFeaturedCreators, searchCreators } from '../services/youtubeService';
import CreatorCard from './CreatorListItem';

interface CreatorBrowserProps {
    onSelectCreator: (creator: CreatorProfile) => void;
}

type SearchType = 'featured' | 'keyword';

const CreatorBrowser: React.FC<CreatorBrowserProps> = ({ onSelectCreator }) => {
    const [creators, setCreators] = useState<CreatorProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [query, setQuery] = useState('');
    const [error, setError] = useState<string | { title: string; points: string[] } | null>(null);
    const [searchType, setSearchType] = useState<SearchType>('featured');

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

    useEffect(() => {
        fetchInitialCreators();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!query.trim()) return;
        
        setIsSearching(true);
        setError(null);
        setCreators([]);

        const keywordResult = await searchCreators(query);
        if (keywordResult.isError) {
            setError(keywordResult.errorMessage || "An unexpected error occurred with the keyword search.");
        } else {
            setCreators(keywordResult.creators);
            setSearchType('keyword');
        }
        setIsSearching(false);
    };

    const handleClearSearch = () => {
        setQuery('');
        fetchInitialCreators();
    };

    return (
        <div className="space-y-8">
            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSearch} className="relative group">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 group-focus-within:text-[var(--success-color)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input 
                        type="search" 
                        placeholder="Find your favorite creator..." 
                        className="w-full bg-slate-900/80 backdrop-blur-md border border-white/10 focus:border-[var(--success-color)]/60 rounded-full py-4 pl-16 pr-28 text-lg text-white placeholder:text-slate-500 outline-none transition-all shadow-inner focus:shadow-[0_0_20px_rgba(0,197,101,0.15)]"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-[var(--success-color)] text-black px-6 py-2.5 rounded-full font-bold hover:brightness-110 active:scale-95 transition-all shadow-md shadow-emerald-500/20">
                        Search
                    </button>
                </form>
            </div>

            {isLoading || isSearching ? (
                <div className="py-20 flex justify-center"><Spinner /></div>
            ) : (
                <div className="max-w-6xl mx-auto">
                    {error && (
                        <div className="text-center py-10 bg-red-950/30 border border-red-500/20 rounded-2xl mb-12 backdrop-blur-md">
                            <h3 className="text-lg font-bold text-red-400">
                                {typeof error === 'string' ? 'An Error Occurred' : error.title}
                            </h3>
                            {typeof error === 'string' ? (
                                <p className="text-red-300/80 mt-2">{error}</p>
                            ) : (
                                <ul className="mt-2 text-left list-disc list-inside text-red-300/80 inline-block">
                                    {error.points.map((point, i) => <li key={i}>{point}</li>)}
                                </ul>
                            )}
                        </div>
                    )}

                    {!error && creators.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white tracking-tight">
                                    {searchType === 'featured' ? 'Featured Creators' : `Search results for "${query}"`}
                                </h2>
                                {searchType === 'keyword' && (
                                    <button 
                                        onClick={handleClearSearch} 
                                        className="text-[var(--success-color)] font-semibold hover:underline flex items-center gap-1.5 transition-all"
                                    >
                                        ← Back to Featured
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {creators.map(creator => (
                                    <CreatorCard 
                                        key={creator.id} 
                                        creator={creator} 
                                        onSelect={onSelectCreator} 
                                    />
                                ))}
                            </div>
                        </>
                    ) : !error && (
                        <div className="text-center py-20 bg-slate-900/40 border border-white/10 rounded-3xl backdrop-blur-md">
                            <div className="text-5xl mb-4 opacity-70">🔍</div>
                            <h2 className="text-2xl font-bold text-white">No creators found</h2>
                            <p className="text-slate-400 mt-2 text-base">Try a different search term or handle.</p>
                            <button 
                                onClick={handleClearSearch}
                                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-[var(--success-color)] font-bold hover:bg-white/10 transition-all"
                            >
                                Clear search
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CreatorBrowser;
