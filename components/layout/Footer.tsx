import React from 'react';
import Logo from '../ui/Logo';
import { Page } from '../../App';

interface FooterProps {
    navigateTo?: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ navigateTo }) => {
    return (
        <footer className="bg-[#090d16] py-10 border-t border-white/10 mt-auto">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3 text-slate-400 text-sm cursor-pointer hover:text-white transition-colors" onClick={() => navigateTo?.('search')}>
                        <Logo className="scale-75 origin-left" />
                        <span>© Money Me Out</span>
                    </div>
                    
                    <nav className="flex flex-wrap justify-center items-center gap-8 text-sm font-medium text-slate-400">
                        <button 
                            onClick={() => navigateTo?.('contact')} 
                            className="hover:text-[var(--success-color)] transition-colors cursor-pointer"
                        >
                            Contact
                        </button>
                        <button 
                            onClick={() => navigateTo?.('privacy')} 
                            className="hover:text-[var(--success-color)] transition-colors cursor-pointer"
                        >
                            Privacy Policy
                        </button>
                        <button 
                            onClick={() => navigateTo?.('terms')} 
                            className="hover:text-[var(--success-color)] transition-colors cursor-pointer"
                        >
                            Terms and Conditions
                        </button>
                    </nav>

                    <div className="flex items-center">
                        <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
