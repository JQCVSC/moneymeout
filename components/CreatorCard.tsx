import React from 'react';
import { CreatorPost } from '../types';

interface FeedPostCardProps {
  post: CreatorPost;
}

const FeedPostCard: React.FC<FeedPostCardProps> = ({ post }) => {
  const { title, thumbnailUrl, url, publishedAt } = post;
  
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <a 
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#101626]/80 backdrop-blur-md rounded-2xl overflow-hidden group transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(0,197,101,0.2)] hover:-translate-y-1 border border-white/10 hover:border-emerald-500/30 flex flex-col"
    >
      <div className="aspect-video overflow-hidden relative bg-slate-800">
        <img 
            src={thumbnailUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101626]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <h3 className="font-bold text-slate-100 text-sm md:text-base leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="mt-3 text-xs font-medium text-slate-400 flex items-center justify-between">
          <span>{timeAgo(publishedAt)}</span>
          <span className="text-emerald-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            Watch &rarr;
          </span>
        </p>
      </div>
    </a>
  );
};

export default FeedPostCard;