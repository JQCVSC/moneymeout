import React from 'react';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`flex items-center gap-2.5 group cursor-pointer ${className || ''}`}>
      <img 
        src="https://i.imgur.com/iImqzDI.jpeg" 
        alt="Money Me Out Logo" 
        className="w-9 h-9 object-cover rounded-full ring-2 ring-emerald-500/30 group-hover:ring-emerald-400 transition-all duration-300"
        referrerPolicy="no-referrer"
      />
      <span className="font-heading text-xl md:text-2xl font-black tracking-tight text-white flex items-center">
        Money Me <span className="text-emerald-400 ml-1.5">Out</span>
      </span>
    </div>
  );
};

export default Logo;