import React from 'react';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
        <img 
          src="https://i.imgur.com/iImqzDI.jpeg" 
          alt="Logo" 
          className="w-10 h-10 object-contain rounded-full"
          referrerPolicy="no-referrer"
        />
      <span className="font-logo text-2xl font-bold text-[#00c565]">
        Money Me Out
      </span>
    </div>
  );
};

export default Logo;