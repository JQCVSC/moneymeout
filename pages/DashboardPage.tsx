import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCreatorData } from '../hooks/useCreatorData';
import { Page } from '../App';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import TabNavigator from '../components/layout/TabNavigator';
import WithdrawModal from '../components/WithdrawModal';
import CreatorBrowser from '../components/CreatorBrowser';
import { CreatorProfile } from '../types';
import Footer from '../components/layout/Footer';

interface DashboardPageProps {
  navigateTo: (page: Page) => void;
  onSelectCreator: (creator: CreatorProfile) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ navigateTo, onSelectCreator }) => {
  const { user } = useAuth();
  const { 
    balance, 
    totalEarnings,
    donations, 
    notifications, 
    markNotificationAsRead, 
    updateProfile,
    stripeOnboardingComplete,
    onboardStripe,
    withdrawFunds
  } = useCreatorData();
  const isCreator = !!user?.claimedCreator;
  const earningsTabLabel = isCreator ? 'Earnings' : 'Total Payouts to Creators';
  const tabs = isCreator ? ['My Page', 'Browse', earningsTabLabel, 'Notifications', 'Settings'] : ['Browse', 'Total Payouts to Creators', 'Settings'];

  const [activeTab, setActiveTab] = useState(isCreator ? 'My Page' : 'Browse');
  const [editableDescription, setEditableDescription] = useState(user?.claimedCreator?.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);

  const queryParams = new URLSearchParams(window.location.search);
  const stripeOnboardingSuccess = queryParams.get('stripe_onboarding') === 'success';

  React.useEffect(() => {
    if (!user) {
      navigateTo('search');
    }
  }, [user, navigateTo]);

  if (!user) {
    return null;
  }
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
        await updateProfile({ description: editableDescription });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
    } catch(error) {
        console.error("Failed to update profile", error);
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleWithdrawClick = () => {
      setIsWithdrawModalOpen(true);
  }

  const handleOnboardStripe = async () => {
    setIsOnboarding(true);
    try {
      const url = await onboardStripe();
      window.location.href = url;
    } catch (error: any) {
      console.error("Onboarding failed", error);
      alert(error.message || "Failed to start Stripe onboarding. Please try again.");
    } finally {
      setIsOnboarding(false);
    }
  };

  const confirmWithdraw = async () => {
      if (balance <= 0) {
        alert("No balance to withdraw.");
        return;
      }
      setIsWithdrawing(true);
      try {
          await withdrawFunds(balance);
          setIsWithdrawModalOpen(false);
          alert(`Success! Withdrawal of $${balance.toFixed(2)} initiated.`);
      } catch (error: any) {
          console.error("Withdrawal failed", error);
          alert(error.message || "Withdrawal failed. Please try again later.");
      } finally {
          setIsWithdrawing(false);
      }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Browse':
        return <CreatorBrowser onSelectCreator={onSelectCreator} />;
      case 'Earnings':
      case 'Total Payouts to Creators':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-bold text-slate-300 mb-2">
                  {isCreator ? 'Available Balance' : 'Total Payouts'}
                </h2>
                <div className="glass-panel p-7 rounded-3xl border border-emerald-500/30 glow-emerald-sm h-full flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      {isCreator ? 'Available to withdraw' : 'Total sent to creators'}
                    </p>
                    <p className="text-4xl sm:text-5xl font-black tracking-tight text-white mt-2">
                      ${balance.toFixed(2)}
                    </p>
                  </div>
                  {isCreator && (
                    <div className="mt-6 pt-4 border-t border-white/10">
                      {!stripeOnboardingComplete ? (
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                          <p className="text-xs font-medium text-slate-300 mb-3">Link your Stripe account to withdraw funds.</p>
                          <Button 
                            className="!bg-emerald-500 hover:!bg-emerald-400 !text-black !font-black w-full !rounded-xl shadow-lg shadow-emerald-500/20" 
                            onClick={handleOnboardStripe}
                            isLoading={isOnboarding}
                          >
                            Link Stripe
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          className="!bg-emerald-500 hover:!bg-emerald-400 !text-black !font-black w-full !rounded-xl shadow-lg shadow-emerald-500/20" 
                          onClick={handleWithdrawClick}
                          disabled={balance <= 0}
                        >
                          Withdraw Funds
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isCreator && (
                <div>
                  <h2 className="text-lg font-bold text-slate-300 mb-2">
                    Lifetime Earnings
                  </h2>
                  <div className="glass-panel p-7 rounded-3xl border border-white/10 h-full flex flex-col justify-between relative overflow-hidden">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total revenue generated</p>
                      <p className="text-4xl sm:text-5xl font-black tracking-tight text-white mt-2">${totalEarnings.toFixed(2)}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-sm text-emerald-400 font-bold">
                      <span className="flex items-center justify-center w-6 h-6 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-xs">
                        ↗
                      </span>
                      <span>Verified Revenue</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-300 mb-4">
                {isCreator ? 'Recent Supporters' : 'Recent Support'}
              </h2>
              <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                <ul className="divide-y divide-white/5">
                  {donations.length > 0 ? donations.map(donation => (
                    <li key={donation.id} className="p-5 hover:bg-white/5 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-white text-base">{isCreator ? donation.fanName : (donation.creatorName || 'Creator')}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{donation.timestamp.toLocaleDateString()}</p>
                        </div>
                        <p className={`font-black text-lg ${isCreator ? 'text-emerald-400' : 'text-blue-400'}`}>
                          {isCreator ? '+' : '-'}${donation.amount.toFixed(2)}
                        </p>
                      </div>
                      {donation.message && (
                        <div className="mt-3 p-3.5 bg-slate-900/90 rounded-xl border border-white/5 italic text-slate-300 text-sm">
                          "{donation.message}"
                        </div>
                      )}
                    </li>
                  )) : (
                    <div className="p-10 text-center text-slate-400">
                      <p className="text-base font-medium">{isCreator ? 'No donations yet. Share your page to get started!' : 'You haven\'t supported any creators yet.'}</p>
                      {!isCreator && (
                        <button 
                          onClick={() => setActiveTab('Browse')} 
                          className="mt-4 px-5 py-2.5 bg-emerald-500 text-black font-bold rounded-xl text-sm hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
                        >
                          Explore Creators
                        </button>
                      )}
                    </div>
                  )}
                </ul>
              </div>
            </div>
          </div>
        );
      case 'Notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white tracking-tight">Notifications</h2>
              <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {notifications.filter(n => !n.isRead).length} New
              </span>
            </div>
            
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-16 glass-panel rounded-3xl border border-dashed border-white/10">
                  <p className="text-slate-400 font-medium">No notifications yet.</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-6 rounded-3xl border transition-all ${
                      notification.isRead 
                        ? 'bg-[#101626]/60 border-white/5 opacity-75' 
                        : 'bg-[#101626]/90 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white">{notification.title}</h3>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                          )}
                        </div>
                        <p className="text-sm text-slate-300 mb-3">{notification.content}</p>
                        {notification.message && (
                          <div className="bg-slate-900/90 p-4 rounded-2xl text-sm italic text-slate-200 border border-white/5">
                            "{notification.message}"
                          </div>
                        )}
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
                          {notification.timestamp ? new Date(notification.timestamp).toLocaleString() : ''}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <button 
                          onClick={() => markNotificationAsRead(notification.id)}
                          className="text-xs font-bold text-emerald-400 hover:underline uppercase tracking-wider"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'Settings':
        return (
             <div>
              <h2 className="text-xl font-black text-white mb-4">Edit Your Page</h2>
                <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10">
                    <form onSubmit={handleProfileUpdate}>
                        <label htmlFor="description" className="block text-sm font-bold text-slate-300 mb-2">Your public description</label>
                        <textarea
                            id="description"
                            rows={5}
                            className="w-full p-4 bg-slate-900/80 border border-white/10 rounded-2xl text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition"
                            value={editableDescription}
                            onChange={(e) => setEditableDescription(e.target.value)}
                        />
                        <div className="mt-6 flex items-center gap-4">
                            <Button type="submit" variant="primary" className="!bg-emerald-500 hover:!bg-emerald-400 !text-black !font-black !rounded-xl !py-3 !px-6" isLoading={isSaving}>Save Changes</Button>
                            {saveSuccess && <p className="text-emerald-400 font-semibold text-sm">Saved successfully!</p>}
                        </div>
                    </form>
                </div>
             </div>
        );
      case 'My Page':
      default:
        return user.claimedCreator ? (
            <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-xl">
                 <div className="w-full h-48 md:h-64 bg-cover bg-center relative" style={{backgroundImage: `url("${user.claimedCreator.bannerUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop'}")`}}>
                     <div className="absolute inset-0 bg-gradient-to-t from-[#101626] via-[#101626]/40 to-transparent" />
                 </div>
                <div className="p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20 relative z-10">
                         <img className="w-28 h-28 md:w-32 md:h-32 rounded-full ring-4 ring-[#101626] bg-slate-800 object-cover shadow-2xl" src={user.claimedCreator.avatarUrl} alt={`${user.claimedCreator.name} avatar`} referrerPolicy="no-referrer" />
                         <div className="sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left flex-grow">
                            <h2 className="text-2xl md:text-3xl font-black text-white">{user.claimedCreator.name}</h2>
                            <p className="text-sm font-medium text-emerald-400 mt-0.5">{user.claimedCreator.handle}</p>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/5">
                        <h3 className="font-bold text-slate-300 text-sm uppercase tracking-wider">Your Description:</h3>
                        <p className="text-slate-300 mt-2 whitespace-pre-wrap leading-relaxed">{user.claimedCreator.description || "You haven't added a description yet."}</p>
                    </div>
                </div>
            </div>
        ) : (
             <div className="text-center glass-panel p-10 md:p-14 rounded-3xl border border-white/10">
                <h2 className="text-2xl font-black text-white">Welcome to Money Me Out!</h2>
                <p className="text-slate-400 mt-2">You can now support your favorite creators directly.</p>
                <div className="mt-8 pt-8 border-t border-white/5">
                    <p className="text-sm text-slate-400 mb-4">Are you a YouTube creator?</p>
                    <Button onClick={() => navigateTo('signup')} variant="secondary" className="!bg-emerald-500 hover:!bg-emerald-400 !text-black !font-black !rounded-xl !py-3 !px-6">Claim Your Creator Page</Button>
                </div>
            </div>
        );
    }
  };

  return (
    <div className="bg-[#090d16] min-h-screen text-white">
        <Header navigateTo={navigateTo} />
        <main className="container mx-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {stripeOnboardingSuccess && (
                  <div className="mb-6 p-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl flex items-center gap-4 shadow-lg">
                    <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-black font-bold flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-white">Stripe Account Linked!</p>
                      <p className="text-xs md:text-sm text-emerald-300/80">Your account is ready for direct withdrawals. It may take a moment for the status to update below.</p>
                    </div>
                  </div>
                )}
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Welcome, {user.name}!</h1>
                <p className="mt-2 text-base md:text-lg text-slate-400">This is your dashboard. Manage your page and earnings here.</p>
                
                <div className="my-8">
                    <TabNavigator tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
                
                <div className="mt-8">
                    {renderContent()}
                </div>

                {isWithdrawModalOpen && (
                    <WithdrawModal 
                        balance={balance} 
                        onClose={() => setIsWithdrawModalOpen(false)} 
                        onConfirm={confirmWithdraw}
                        isLoading={isWithdrawing}
                    />
                )}
            </div>
        </main>
        <Footer navigateTo={navigateTo} />
    </div>
  );
};

export default DashboardPage;