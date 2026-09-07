import React from 'react';
import { CreatorProfile } from '../types';

interface CreatorCardProps {
  creator: CreatorProfile;
  onSelect: (creator: CreatorProfile) => void;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator, onSelect }) => {
    const bannerFallback = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop';
    
    return (
        <div 
            onClick={() => onSelect(creator)}
            className="glass-panel-interactive rounded-2xl overflow-hidden group cursor-pointer border border-white/10 hover:border-emerald-500/40 flex flex-col relative"
        >
            <div className="h-28 relative overflow-hidden bg-slate-800">
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                    style={{ backgroundImage: `url(${creator.bannerUrl || bannerFallback})`}} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101626] via-[#101626]/50 to-transparent" />
            </div>
            <div className="p-5 pt-0 flex-grow flex flex-col items-center text-center">
                <div className="-mt-11 relative z-10">
                    <img 
                        src={creator.avatarUrl} 
                        alt={creator.name} 
                        className="w-20 h-20 rounded-full object-cover bg-slate-800 ring-4 ring-[#101626] group-hover:ring-emerald-500/50 shadow-xl transition-all duration-300 group-hover:scale-105" 
                        referrerPolicy="no-referrer"
                    />
                </div>
                <div className="mt-3.5 w-full">
                    <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors truncate">
                        {creator.name}
                    </h3>
                    <p className="text-xs font-medium text-emerald-400/90 mt-0.5 tracking-wide">
                        {creator.handle}
                    </p>
                </div>
                <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 h-8 leading-relaxed">
                    {creator.description || "YouTube Content Creator"}
                </p>
                <div className="w-full mt-4 pt-3.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-medium text-slate-400">
                        {creator.subscribers ? `${Number(creator.subscribers).toLocaleString()} subs` : 'Verified Creator'}
                    </span>
                    <span className="text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Support &rarr;
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CreatorCard;