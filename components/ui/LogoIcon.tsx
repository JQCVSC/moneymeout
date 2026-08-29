import React from 'react';

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <img 
      src="https://i.imgur.com/iImqzDI.jpeg" 
      alt="Logo Icon" 
      className={`object-contain rounded-full ${className}`}
      referrerPolicy="no-referrer"
    />
  );
};

export default LogoIcon;
