import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success';
  className?: string;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  isLoading = false,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-full text-base font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none px-6 py-3';

  const variantClasses = {
    primary: 'bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover-color)] focus:ring-[var(--primary-color)]',
    secondary: 'bg-[var(--card-background-color)] text-[var(--text-secondary)] border-2 border-[var(--border-color)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:ring-[var(--primary-color)]',
    success: 'bg-[var(--success-color)] text-white hover:bg-[var(--success-hover-color)] focus:ring-[var(--success-color)]',
  };
  
  const spinnerColor = 'text-white';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className={`animate-spin -ml-1 mr-3 h-5 w-5 ${spinnerColor}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : children}
    </button>
  );
};

export default Button;