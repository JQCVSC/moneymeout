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
        className="bg-white rounded-2xl shadow-sm overflow-hidden group transition-shadow hover:shadow-lg border border-[var(--border-color)]"
    >
      <div className="aspect-video overflow-hidden">
        <img 
            src={thumbnailUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-[var(--text-primary)] leading-snug group-hover:text-[var(--primary-hover-color)] transition-colors">{title}</h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{timeAgo(publishedAt)}</p>
      </div>
    </a>
  );
};

export default FeedPostCard;