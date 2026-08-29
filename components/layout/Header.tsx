import React from 'react';
import Logo from '../ui/Logo';
import { Page } from '../../App';
import { useAuth } from '../../hooks/useAuth';
import { ArrowUp } from 'lucide-react';

interface HeaderProps {
  navigateTo: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ navigateTo }) => {
    const { isAuthenticated, user, logout } = useAuth();
    
    const handleLogout = () => {
        logout();
        navigateTo('search');
    }
    
    const isCreator = !!user?.claimedCreator;
    
  return (
    <header className="bg-[var(--card-background-color)] border-b border-[var(--border-color)] sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <button onClick={() => navigateTo(isAuthenticated ? 'dashboard' : 'search')} aria-label="Home">
            <Logo />
          </button>
          <nav className="flex items-center gap-2 md:gap-4">
            {isAuthenticated ? (
                <>
                    {isCreator && (
                        <button 
                            onClick={() => navigateTo('dashboard')}
                            className="font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm md:text-base px-3 py-2"
                        >
                            My Dashboard
                        </button>
                    )}
                    <button 
                        onClick={() => navigateTo('contact')}
                        className="font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200 text-sm md:text-base px-4 py-2 rounded-full hover:shadow-[0_2px_12px_rgba(0,197,101,0.25)]"
                    >
                        Contact
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="bg-gray-200 text-gray-700 font-semibold rounded-full px-4 py-2 text-sm md:text-base hover:bg-gray-300 transition-colors"
                    >
                        Log Out
                    </button>
                </>
            ) : (
                <>
                    <div className="relative group">
                        <button 
                            onClick={() => navigateTo('login')}
                            className="font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200 text-sm md:text-base px-4 py-2 rounded-full hover:shadow-[0_2px_12px_rgba(0,197,101,0.25)]"
                        >
                            Log In
                        </button>
                        
                        {/* CTA Message */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-[#00c565] text-white p-3 rounded-xl shadow-2xl pointer-events-none animate-bounce-subtle z-50 hidden lg:block">
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-[#00c565]"></div>
                            <p className="text-xs font-bold text-center leading-tight">
                                Please sign in to superchat your donation to your favorite creators
                            </p>
                        </div>
                    </div>

                     <button 
                        onClick={() => navigateTo('contact')}
                        className="font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200 text-sm md:text-base px-4 py-2 rounded-full hover:shadow-[0_2px_12px_rgba(0,197,101,0.25)]"
                    >
                        Contact
                    </button>
                    <button 
                        onClick={() => navigateTo('signup')}
                        className="bg-[var(--success-color)] text-white font-semibold rounded-full px-4 py-2 text-sm md:text-base hover:bg-[var(--success-hover-color)] transition-colors"
                        title="For YouTube Creators"
                    >
                        Start my page
                    </button>
                </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;