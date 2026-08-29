import React from 'react';
import { CreatorProfile } from '../types';

interface CreatorCardProps {
  creator: CreatorProfile;
  onSelect: (creator: CreatorProfile) => void;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator, onSelect }) => {
    
    const bannerFallback = 'https://images.unsplash.com/photo-1511376777868-611b54f68947?q=80&w=2070&auto=format&fit=crop';
    
    return (
        <div 
            onClick={() => onSelect(creator)}
            className="bg-[var(--card-background-color)] rounded-2xl shadow-sm overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border border-[var(--border-color)]"
        >
            <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(${creator.bannerUrl || bannerFallback})`}} />
            <div className="p-4 pt-0">
                <div className="flex justify-center -mt-10">
                    <img 
                        src={creator.avatarUrl} 
                        alt={creator.name} 
                        className="w-20 h-20 rounded-full object-cover bg-slate-200 ring-4 ring-white shadow-md" 
                        referrerPolicy="no-referrer"
                    />
                </div>
                <div className="text-center mt-4">
                    <h3 className="font-bold text-lg text-[var(--text-primary)] truncate">{creator.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{creator.handle}</p>
                </div>
                <p className="text-sm text-center text-[var(--text-secondary)] mt-3 h-10 overflow-hidden">
                    {creator.description.substring(0, 60)}{creator.description.length > 60 && '...'}
                </p>
            </div>
        </div>
    );
};

export default CreatorCard;