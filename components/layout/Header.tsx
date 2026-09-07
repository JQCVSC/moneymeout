import React, { useState } from 'react';
import Logo from '../ui/Logo';
import { Page } from '../../App';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  navigateTo: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ navigateTo }) => {
    const { isAuthenticated, user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            setMobileMenuOpen(false);
            navigateTo('search');
        }
    };

    const handleNav = (page: Page) => {
        setMobileMenuOpen(false);
        navigateTo(page);
    };
    
    const isCreator = !!user?.claimedCreator;
    
  return (
    <header className="bg-[#090d16]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 transition-all duration-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <button onClick={() => handleNav(isAuthenticated ? 'dashboard' : 'search')} aria-label="Home" className="transition-opacity hover:opacity-90 flex-shrink-0">
            <Logo />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {isCreator && (
                  <button 
                    onClick={() => handleNav('dashboard')}
                    className="font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm lg:text-base px-3.5 py-2 rounded-xl"
                  >
                    My Dashboard
                  </button>
                )}
                <button 
                  onClick={() => handleNav('contact')}
                  className="font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm lg:text-base px-3.5 py-2 rounded-xl"
                >
                  Contact
                </button>
                <button 
                  onClick={handleLogout}
                  className="bg-white/10 hover:bg-white/15 text-slate-200 font-medium rounded-xl px-4 py-2 text-sm lg:text-base transition-colors border border-white/10"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleNav('contact')}
                  className="font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm lg:text-base px-3.5 py-2 rounded-xl"
                >
                  Contact
                </button>
                <button 
                  onClick={() => handleNav('login')}
                  className="font-medium text-slate-200 hover:text-white border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all text-sm lg:text-base px-4 py-2 rounded-xl"
                >
                  Log In
                </button>
                <button 
                  onClick={() => handleNav('signup')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl px-5 py-2 text-sm lg:text-base transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                  title="For YouTube Creators"
                >
                  Start my page
                </button>
              </>
            )}
          </nav>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            {!isAuthenticated && (
              <button 
                onClick={() => handleNav('signup')}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg px-3 py-1.5 text-xs transition-all shadow-md shadow-emerald-500/20"
              >
                Start page
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors border border-white/10"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  {isCreator && (
                    <button 
                      onClick={() => handleNav('dashboard')}
                      className="text-left font-medium text-slate-200 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl transition-all"
                    >
                      My Dashboard
                    </button>
                  )}
                  <button 
                    onClick={() => handleNav('contact')}
                    className="text-left font-medium text-slate-200 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl transition-all"
                  >
                    Contact Support
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="text-left font-medium text-red-400 hover:bg-red-500/10 px-4 py-3 rounded-xl transition-all mt-2 border-t border-white/5"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleNav('signup')}
                    className="w-full text-center bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl py-3 px-4 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    Start my page (Claim Channel)
                  </button>
                  <button 
                    onClick={() => handleNav('login')}
                    className="text-center font-medium text-white border border-white/15 hover:bg-white/5 py-3 px-4 rounded-xl transition-all"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => handleNav('contact')}
                    className="text-center font-medium text-slate-300 hover:text-white hover:bg-white/5 py-3 px-4 rounded-xl transition-all"
                  >
                    Contact
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;