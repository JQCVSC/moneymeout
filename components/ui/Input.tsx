import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  variant?: 'light' | 'dark';
}

const Input: React.FC<InputProps> = ({ className = '', variant = 'light', ...props }) => {
  const baseClasses = 'w-full text-base transition-shadow focus:ring-2 focus:outline-none';

  const variantClasses = {
    light: 'text-[var(--text-primary)] bg-white border border-[var(--border-color)] rounded-full placeholder:text-[var(--text-secondary)] focus:ring-[var(--success-color)] focus:border-[var(--success-color)]',
    dark: 'bg-stone-800 border-stone-700 border-2 rounded-lg placeholder-stone-400 text-white focus:ring-emerald-500 focus:border-emerald-500 py-3 px-4'
  };

  return (
    <input
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
};

export default Input;