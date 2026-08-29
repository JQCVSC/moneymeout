import React, { useState, useEffect } from 'react';
import SearchPage from './pages/SearchPage';
import CreatorProfilePage from './pages/CreatorProfilePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import { CreatorProfile } from './types';
import { useAuth } from './hooks/useAuth';
import Spinner from './components/ui/Spinner';
import { fetchChannelDetailsByIds } from './services/youtubeService';
import { Toaster } from 'react-hot-toast';

export type Page = 'search' | 'profile' | 'login' | 'signup' | 'dashboard' | 'payment' | 'paymentSuccess' | 'contact' | 'terms' | 'privacy';
export type Route = {
  page: Page;
  creatorProfile?: CreatorProfile;
  donationAmount?: number;
  donationMessage?: string;
  paymentIntentId?: string;
};

const App: React.FC = () => {
  const [route, setRoute] = useState<Route>({ page: 'search' });
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  
  // Handle query parameters and popstate browser navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.page) {
        setRoute(event.state);
      } else {
        const params = new URLSearchParams(window.location.search);
        const page = (params.get('page') as Page) || 'search';
        setRoute({ page });
      }
    };

    window.addEventListener('popstate', handlePopState);

    const params = new URLSearchParams(window.location.search);
    const page = params.get('page') as Page | null;
    const creatorId = params.get('creatorId');
    const amount = params.get('amount');
    const message = params.get('message');
    const paymentIntentId = params.get('payment_intent');

    if (page === 'paymentSuccess' && creatorId && amount) {
      const loadCreator = async () => {
        const result = await fetchChannelDetailsByIds([creatorId]);
        if (result.creators.length > 0) {
          setRoute({
            page: 'paymentSuccess',
            creatorProfile: result.creators[0],
            donationAmount: parseFloat(amount),
            donationMessage: message || undefined,
            paymentIntentId: paymentIntentId || undefined
          });
        }
      };
      loadCreator();
    } else if (page === 'payment' && creatorId) {
      const loadCreator = async () => {
        const result = await fetchChannelDetailsByIds([creatorId]);
        if (result.creators.length > 0) {
          setRoute({
            page: 'payment',
            creatorProfile: result.creators[0],
            donationAmount: amount ? parseFloat(amount) : 5,
            donationMessage: message || undefined
          });
        }
      };
      loadCreator();
    } else if (page === 'profile' && creatorId) {
        const loadCreator = async () => {
            const result = await fetchChannelDetailsByIds([creatorId]);
            if (result.creators.length > 0) {
              setRoute({
                page: 'profile',
                creatorProfile: result.creators[0]
              });
            }
          };
          loadCreator();
    } else if (page) {
        setRoute({ page });
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Synchronize URL bar to ?page=dashboard when authenticated user lands on search/default route
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && user && route.page === 'search') {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page');
      if (!pageParam || pageParam === 'search') {
        setRoute({ page: 'dashboard' });
        window.history.replaceState({ page: 'dashboard' }, '', `${window.location.pathname}?page=dashboard`);
      }
    } else if (!isAuthLoading && !isAuthenticated && route.page === 'dashboard') {
      setRoute({ page: 'search' });
      window.history.replaceState({ page: 'search' }, '', `${window.location.pathname}?page=search`);
    }
  }, [isAuthLoading, isAuthenticated, user, route.page]);

  // Dynamically update document title based on the active route
  useEffect(() => {
    let title = 'Money Me Out - Direct-to-Bank Monetization for YouTube Creators';
    switch (route.page) {
      case 'dashboard':
        title = 'Dashboard | Money Me Out';
        break;
      case 'login':
        title = 'Log In | Money Me Out';
        break;
      case 'signup':
        title = 'Sign Up | Money Me Out';
        break;
      case 'profile':
        title = route.creatorProfile?.name ? `${route.creatorProfile.name} | Money Me Out` : 'Creator Profile | Money Me Out';
        break;
      case 'payment':
        title = route.creatorProfile?.name ? `Support ${route.creatorProfile.name} | Money Me Out` : 'Support Creator | Money Me Out';
        break;
      case 'paymentSuccess':
        title = 'Payment Successful | Money Me Out';
        break;
      case 'contact':
        title = 'Contact | Money Me Out';
        break;
      case 'terms':
        title = 'Terms & Conditions | Money Me Out';
        break;
      case 'privacy':
        title = 'Privacy Policy | Money Me Out';
        break;
      case 'search':
      default:
        title = 'Money Me Out - Direct-to-Bank Monetization for YouTube Creators';
        break;
    }
    document.title = title;
  }, [route]);
  
  const navigateTo = (page: Page, creatorProfile?: CreatorProfile, options?: { donationAmount?: number; donationMessage?: string; paymentIntentId?: string }) => {
    const newRoute: Route = { page, creatorProfile, ...options };
    setRoute(newRoute);

    const searchParams = new URLSearchParams();
    searchParams.set('page', page);
    if (creatorProfile?.id) searchParams.set('creatorId', creatorProfile.id);
    if (options?.donationAmount) searchParams.set('amount', options.donationAmount.toString());
    if (options?.donationMessage) searchParams.set('message', options.donationMessage);
    if (options?.paymentIntentId) searchParams.set('payment_intent', options.paymentIntentId);

    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState(newRoute, '', newUrl);
    window.scrollTo(0, 0);
  };
  
  const handleSelectCreator = (creator: CreatorProfile) => {
    navigateTo('profile', creator);
  };

  const renderPage = () => {
    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner />
            </div>
        );
    }
    
    switch (route.page) {
      case 'login':
        return <LoginPage navigateTo={navigateTo} />;
      case 'signup':
        return <SignUpPage navigateTo={navigateTo} />;
      case 'dashboard':
        if (!isAuthenticated || !user) {
          return <SearchPage onSelectCreator={handleSelectCreator} navigateTo={navigateTo} />;
        }
        return <DashboardPage navigateTo={navigateTo} onSelectCreator={handleSelectCreator} />;
       case 'contact':
        return <ContactPage navigateTo={navigateTo} />;
      case 'terms':
        return <TermsPage navigateTo={navigateTo} />;
      case 'privacy':
        return <PrivacyPage navigateTo={navigateTo} />;
      case 'payment':
        if (!isAuthenticated) {
            return <LoginPage navigateTo={navigateTo} redirectPage="payment" redirectOptions={{ creator: route.creatorProfile, donationAmount: route.donationAmount, donationMessage: route.donationMessage }} />;
        }
        if (route.creatorProfile && route.donationAmount) {
            return (
                <PaymentPage 
                    creator={route.creatorProfile} 
                    amount={route.donationAmount} 
                    message={route.donationMessage || ''}
                    navigateTo={navigateTo} 
                    user={user}
                />
            );
        }
        return <SearchPage onSelectCreator={handleSelectCreator} navigateTo={navigateTo} />;
      case 'paymentSuccess':
        if (route.creatorProfile && route.donationAmount) {
            return (
                <PaymentSuccessPage 
                    creator={route.creatorProfile} 
                    amount={route.donationAmount} 
                    message={route.donationMessage}
                    paymentIntentId={route.paymentIntentId}
                    navigateTo={navigateTo} 
                />
            );
        }
        return <SearchPage onSelectCreator={handleSelectCreator} navigateTo={navigateTo} />;
      case 'profile':
        if (route.creatorProfile) {
          return <CreatorProfilePage creator={route.creatorProfile} navigateTo={navigateTo} />;
        }
        // Fallback to search if no creator profile is provided
        return <SearchPage onSelectCreator={handleSelectCreator} navigateTo={navigateTo} />;
      case 'search':
      default:
        // If user is authenticated, redirect to dashboard from default search, otherwise show search
        if(isAuthenticated && user) {
             return <DashboardPage navigateTo={navigateTo} onSelectCreator={handleSelectCreator} />;
        }
        return <SearchPage onSelectCreator={handleSelectCreator} navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)]">
      <Toaster />
      {renderPage()}
    </div>
  );
};

export default App;
