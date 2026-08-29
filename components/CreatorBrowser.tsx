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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-focus-within:text-[var(--success-color)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input 
                        type="search" 
                        placeholder="Find your favorite creator..." 
                        className="w-full bg-white border-2 border-gray-100 focus:border-[var(--success-color)] rounded-full py-4 pl-16 pr-6 text-lg outline-none transition-all shadow-sm focus:shadow-md"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-6 py-2 rounded-full font-bold hover:bg-slate-800 transition-colors">
                        Search
                    </button>
                </form>
            </div>

            {isLoading || isSearching ? (
                <div className="py-20 flex justify-center"><Spinner /></div>
            ) : (
                <div className="max-w-6xl mx-auto">
                    {error && (
                        <div className="text-center py-10 bg-green-50 border border-green-200 rounded-2xl mb-12">
                            <h3 className="text-lg font-bold text-green-700">
                                {typeof error === 'string' ? 'An Error Occurred' : error.title}
                            </h3>
                            {typeof error === 'string' ? (
                                <p className="text-green-600 mt-2">{error}</p>
                            ) : (
                                <ul className="mt-2 text-left list-disc list-inside text-green-600 inline-block">
                                    {error.points.map((point, i) => <li key={i}>{point}</li>)}
                                </ul>
                            )}
                        </div>
                    )}

                    {!error && creators.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {searchType === 'featured' ? 'Featured Creators' : `Search results for "${query}"`}
                                </h2>
                                {searchType === 'keyword' && (
                                    <button 
                                        onClick={handleClearSearch} 
                                        className="text-[var(--success-color)] font-bold hover:underline"
                                    >
                                        Back to Featured
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
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                            <div className="text-5xl mb-4">🔍</div>
                            <h2 className="text-2xl font-bold text-gray-800">No creators found</h2>
                            <p className="text-gray-500 mt-2 text-lg">Try a different search term.</p>
                            <button 
                                onClick={handleClearSearch}
                                className="mt-6 text-[var(--success-color)] font-bold hover:underline"
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
