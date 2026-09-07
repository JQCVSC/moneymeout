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
    
    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            navigateTo('search');
        }
    };
    
    const isCreator = !!user?.claimedCreator;
    
  return (
    <header className="bg-[#090d16]/85 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 transition-all duration-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <button onClick={() => navigateTo(isAuthenticated ? 'dashboard' : 'search')} aria-label="Home" className="transition-opacity hover:opacity-90">
            <Logo />
          </button>
          <nav className="flex items-center gap-2 md:gap-3">
            {isAuthenticated ? (
              <>
                {isCreator && (
                  <button 
                    onClick={() => navigateTo('dashboard')}
                    className="font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm md:text-base px-3.5 py-2 rounded-xl"
                  >
                    My Dashboard
                  </button>
                )}
                <button 
                  onClick={() => navigateTo('contact')}
                  className="font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm md:text-base px-3.5 py-2 rounded-xl"
                >
                  Contact
                </button>
                <button 
                  onClick={handleLogout}
                  className="bg-white/10 hover:bg-white/15 text-slate-200 font-medium rounded-xl px-4 py-2 text-sm md:text-base transition-colors border border-white/10"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigateTo('contact')}
                  className="font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm md:text-base px-3.5 py-2 rounded-xl"
                >
                  Contact
                </button>
                <button 
                  onClick={() => navigateTo('login')}
                  className="font-medium text-slate-200 hover:text-white border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all text-sm md:text-base px-4 py-2 rounded-xl"
                >
                  Log In
                </button>
                <button 
                  onClick={() => navigateTo('signup')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl px-4 md:px-5 py-2 text-sm md:text-base transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
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