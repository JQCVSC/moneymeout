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
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {isCreator ? 'Available Balance' : 'Total Payouts'}
                </h2>
                <div className="bg-gradient-to-br from-green-400 to-emerald-600 text-white p-6 rounded-2xl shadow-lg h-full">
                  <p className="text-sm font-medium opacity-90">{isCreator ? 'Available to withdraw' : 'Total sent to creators'}</p>
                  <p className="text-3xl sm:text-4xl font-bold tracking-tight mt-1">${balance.toFixed(2)}</p>
                  {isCreator && (
                    <div className="mt-6">
                      {!stripeOnboardingComplete ? (
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                          <p className="text-xs font-medium mb-3">Link your Stripe account to withdraw funds.</p>
                          <Button 
                            className="!bg-white !text-emerald-700 hover:!bg-gray-100 !font-bold w-full" 
                            onClick={handleOnboardStripe}
                            isLoading={isOnboarding}
                          >
                            Link Stripe
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          className="!bg-white !text-emerald-700 hover:!bg-gray-100 !font-bold w-full" 
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
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Lifetime Earnings
                  </h2>
                  <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-md h-full flex flex-col justify-center">
                    <p className="text-sm font-medium text-gray-500">Total revenue generated</p>
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900 mt-1">${totalEarnings.toFixed(2)}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-green-600 font-medium">
                      <span className="flex items-center justify-center w-5 h-5 bg-green-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                        </svg>
                      </span>
                      Keep growing!
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {isCreator ? 'Recent Supporters' : 'Recent Support'}
              </h2>
              <div className="bg-white rounded-2xl shadow-md border border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {donations.length > 0 ? donations.map(donation => (
                    <li key={donation.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{isCreator ? donation.fanName : (donation.creatorName || 'Creator')}</p>
                          <p className="text-sm text-gray-500">{donation.timestamp.toLocaleDateString()}</p>
                        </div>
                        <p className={`font-bold text-lg ${isCreator ? 'text-green-600' : 'text-blue-600'}`}>
                          {isCreator ? '+' : '-'}${donation.amount.toFixed(2)}
                        </p>
                      </div>
                      {donation.message && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100 italic text-gray-600 text-sm">
                          "{donation.message}"
                        </div>
                      )}
                    </li>
                  )) : (
                    <p className="p-6 text-center text-gray-500">
                      {isCreator ? 'No donations yet. Share your page to get started!' : 'You haven\'t supported any creators yet.'}
                    </p>
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
              <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Notifications</h2>
              <span className="bg-[var(--success-color)]/10 text-[var(--success-color)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {notifications.filter(n => !n.isRead).length} New
              </span>
            </div>
            
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <p className="text-[var(--text-secondary)] font-medium">No notifications yet.</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-6 rounded-3xl border transition-all ${
                      notification.isRead 
                        ? 'bg-white border-gray-100 opacity-75' 
                        : 'bg-white border-[var(--success-color)] shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-[var(--text-primary)]">{notification.title}</h3>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-[var(--success-color)] rounded-full animate-pulse"></span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mb-3">{notification.content}</p>
                        {notification.message && (
                          <div className="bg-gray-50 p-4 rounded-2xl text-sm italic text-[var(--text-primary)] border border-gray-100">
                            "{notification.message}"
                          </div>
                        )}
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">
                          {notification.timestamp ? new Date(notification.timestamp).toLocaleString() : ''}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <button 
                          onClick={() => markNotificationAsRead(notification.id)}
                          className="text-xs font-bold text-[var(--success-color)] hover:underline uppercase tracking-wider"
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
              <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Your Page</h2>
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                    <form onSubmit={handleProfileUpdate}>
                        <label htmlFor="description" className="block text-sm font-bold text-gray-600 mb-2">Your public description</label>
                        <textarea
                            id="description"
                            rows={5}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition"
                            value={editableDescription}
                            onChange={(e) => setEditableDescription(e.target.value)}
                        />
                        <div className="mt-4 flex items-center gap-4">
                            <Button type="submit" variant="primary" isLoading={isSaving}>Save Changes</Button>
                            {saveSuccess && <p className="text-green-600 font-semibold">Saved successfully!</p>}
                        </div>
                    </form>
                </div>
             </div>
        );
      case 'My Page':
      default:
        return user.claimedCreator ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                 <div className="w-full h-48 md:h-64 bg-cover bg-center" style={{backgroundImage: `url("${user.claimedCreator.bannerUrl || 'https://images.unsplash.com/photo-1511376777868-611b54f68947?q=80&w=2070&auto=format&fit=crop'}")`}} />
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20 relative z-10">
                         <img className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white bg-slate-200 object-cover" src={user.claimedCreator.avatarUrl} alt={`${user.claimedCreator.name} avatar`} referrerPolicy="no-referrer" />
                         <div className="sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left flex-grow">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{user.claimedCreator.name}</h2>
                            <p className="text-md text-gray-500">{user.claimedCreator.handle}</p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h3 className="font-bold text-lg">Your Description:</h3>
                        <p className="text-gray-600 mt-2 whitespace-pre-wrap">{user.claimedCreator.description || "You haven't added a description yet."}</p>
                    </div>
                </div>
            </div>
        ) : (
             <div className="text-center bg-white p-10 rounded-2xl shadow-md border border-gray-200">
                <h2 className="text-2xl font-semibold">Welcome to Money Me Out!</h2>
                <p className="text-gray-500 mt-2">You can now support your favorite creators directly.</p>
                <div className="mt-8 pt-8 border-t border-gray-100">
                    <p className="text-sm text-gray-400 mb-4">Are you a YouTube creator?</p>
                    <Button onClick={() => navigateTo('signup')} variant="secondary">Claim Your Creator Page</Button>
                </div>
            </div>
        );
    }
  };

  return (
    <div>
        <Header navigateTo={navigateTo} />
        <main className="container mx-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {stripeOnboardingSuccess && (
                  <div className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold">Stripe Account Linked!</p>
                      <p className="text-sm">Your account is now ready for withdrawals. It may take a moment for the status to update below.</p>
                    </div>
                  </div>
                )}
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">Welcome, {user.name}!</h1>
                <p className="mt-2 text-lg text-[var(--text-secondary)]">This is your dashboard. Manage your page and earnings here.</p>
                
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