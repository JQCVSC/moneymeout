import React, { createContext, useState, ReactNode, useContext, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Donation, CreatorProfile, Notification } from '../types';
import { doc, collection, onSnapshot, query, orderBy, limit, updateDoc, where } from "firebase/firestore";
import { auth, db } from '../firebase';
import toast from 'react-hot-toast';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

const authInstance = auth;

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authInstance.currentUser?.uid,
      email: authInstance.currentUser?.email,
      emailVerified: authInstance.currentUser?.emailVerified,
      isAnonymous: authInstance.currentUser?.isAnonymous,
      tenantId: authInstance.currentUser?.tenantId,
      providerInfo: authInstance.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface CreatorDataContextType {
  balance: number;
  totalEarnings: number;
  stripeConnectAccountId: string | null;
  stripeOnboardingComplete: boolean;
  donations: Donation[];
  notifications: Notification[];
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  addDonation: (amount: number, fanName: string, creatorId: string, message?: string, paymentIntentId?: string) => Promise<void>;
  updateProfile: (updates: Partial<CreatorProfile>) => Promise<void>;
  onboardStripe: () => Promise<string>;
  withdrawFunds: (amount: number) => Promise<void>;
}

export const CreatorDataContext = createContext<CreatorDataContextType | undefined>(undefined);

interface CreatorDataProviderProps {
  children: ReactNode;
}

// Removed local db initialization to use imported db from firebase.ts

export const CreatorDataProvider: React.FC<CreatorDataProviderProps> = ({ children }) => {
  const { user, updateClaimedCreator } = useAuth();
  const [balance, setBalance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [stripeConnectAccountId, setStripeConnectAccountId] = useState<string | null>(null);
  const [stripeOnboardingComplete, setStripeOnboardingComplete] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const isInitialLoad = useRef(true);
  
  useEffect(() => {
    if (!user) {
        setBalance(0);
        setTotalEarnings(0);
        setStripeConnectAccountId(null);
        setStripeOnboardingComplete(false);
        setDonations([]);
        setNotifications([]);
        isInitialLoad.current = true;
        return;
    }

    let unsubscribeCreator: () => void = () => {};
    let unsubscribeDonations: () => void = () => {};
    let unsubscribeNotifications: () => void = () => {};

    if (user.claimedCreator) {
        const creatorId = user.claimedCreator.id;
        const creatorRef = doc(db, 'creators', creatorId);

        // Listener for balance and stripe changes
        unsubscribeCreator = onSnapshot(creatorRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setBalance(data.balance || 0);
                setTotalEarnings(data.totalEarnings || 0);
                setStripeConnectAccountId(data.stripeConnectAccountId || null);
                setStripeOnboardingComplete(data.stripeOnboardingComplete || false);
            }
        });
        
        // Listener for donations
        const donationsRef = collection(creatorRef, 'donations');
        const q = query(donationsRef, orderBy('timestamp', 'desc'), limit(50));
        
        unsubscribeDonations = onSnapshot(q, (snapshot) => {
            const fetchedDonations: Donation[] = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                fetchedDonations.push({
                    id: doc.id,
                    amount: data.amount,
                    fanName: data.fanName,
                    message: data.message,
                    timestamp: data.timestamp?.toDate() || new Date()
                });
            });
            setDonations(fetchedDonations);
        }, (error) => {
            handleFirestoreError(error, OperationType.LIST, donationsRef.path);
        });

        // Listener for notifications (detect new for toast)
        const notificationsRef = collection(creatorRef, 'notifications');
        const now = new Date();
        const bufferTime = new Date(now.getTime() - 60000); // 1 minute ago buffer
        
        const nq = query(
            notificationsRef, 
            where('timestamp', '>=', bufferTime),
            where('isRead', '==', false),
            orderBy('timestamp', 'desc'), 
            limit(5)
        );
        
        unsubscribeNotifications = onSnapshot(nq, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const data = change.doc.data();
                    if (data.type === 'donation') {
                        toast.success(
                            <div className="flex flex-col">
                                <span className="font-bold text-lg">{data.fanName} sent ${data.amount}!</span>
                                {data.message && (
                                    <span className="text-sm italic opacity-90 mt-1">"{data.message}"</span>
                                )}
                            </div>, 
                            {
                                duration: 6000,
                                position: 'top-right',
                                icon: '💰',
                                style: {
                                    borderRadius: '12px',
                                    background: '#10b981',
                                    color: '#fff',
                                    minWidth: '300px'
                                }
                            }
                        );
                    }
                }
            });
        }, (error) => {
            handleFirestoreError(error, OperationType.LIST, notificationsRef.path);
        });

        const fullNotificationsQuery = query(notificationsRef, orderBy('timestamp', 'desc'), limit(20));
        const unsubscribeFullNotifications = onSnapshot(fullNotificationsQuery, (snapshot) => {
            const fetched: Notification[] = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                fetched.push({
                    id: doc.id,
                    type: data.type,
                    title: data.title,
                    content: data.content,
                    message: data.message,
                    amount: data.amount,
                    fanName: data.fanName,
                    isRead: data.isRead,
                    timestamp: data.timestamp?.toDate() || new Date()
                });
            });
            setNotifications(fetched);
            isInitialLoad.current = false;
        }, (error) => {
             handleFirestoreError(error, OperationType.LIST, notificationsRef.path);
        });

        return () => {
            unsubscribeCreator();
            unsubscribeDonations();
            unsubscribeNotifications();
            unsubscribeFullNotifications();
        };
    } else {
        // Fan mode: Sync via backend endpoint then listen to users/{uid}/payouts
        const syncAndListenFanPayouts = async () => {
            try {
                const res = await fetch(`/api/users/${user.uid}/payouts`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.payouts && Array.isArray(data.payouts)) {
                        setDonations(data.payouts.map((p: any) => ({
                            id: p.id,
                            amount: p.amount,
                            creatorName: p.creatorName,
                            creatorId: p.creatorId,
                            timestamp: new Date(p.timestamp)
                        })));
                        setBalance(data.totalPayouts || 0);
                    }
                }
            } catch (err) {
                console.warn("Fan payouts sync error:", err);
            }
        };

        syncAndListenFanPayouts();

        const payoutsRef = collection(db, 'users', user.uid, 'payouts');
        const q = query(payoutsRef, orderBy('timestamp', 'desc'), limit(50));

        unsubscribeDonations = onSnapshot(q, (snapshot) => {
            const fetchedPayouts: Donation[] = [];
            let totalPayouts = 0;
            snapshot.forEach(doc => {
                const data = doc.data();
                const amount = data.amount || 0;
                totalPayouts += amount;
                fetchedPayouts.push({
                    id: doc.id,
                    amount: amount,
                    fanName: data.fanName,
                    creatorName: data.creatorName,
                    creatorId: data.creatorId,
                    timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp || Date.now())
                });
            });
            if (fetchedPayouts.length > 0) {
                setDonations(fetchedPayouts);
                setBalance(totalPayouts);
            }
            isInitialLoad.current = false;
        }, (error) => {
            handleFirestoreError(error, OperationType.LIST, payoutsRef.path);
        });

        return () => {
            unsubscribeDonations();
        };
    }
  }, [user]);

  const markNotificationAsRead = async (notificationId: string) => {
    if (!user?.claimedCreator) return;
    try {
        const notificationRef = doc(db, 'creators', user.claimedCreator.id, 'notifications', notificationId);
        await updateDoc(notificationRef, { isRead: true });
    } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `creators/${user.claimedCreator.id}/notifications/${notificationId}`);
    }
  };

  const addDonation = async (amount: number, fanName: string, creatorId: string, message?: string, paymentIntentId?: string) => {
    // This is now handled by the Stripe webhook on the server,
    // but we also call a confirmation endpoint to ensure immediate update in dev environments
    if (!paymentIntentId) return;

    try {
        await fetch('/api/confirm-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                paymentIntentId,
                creatorId,
                amount,
                fanName,
                message,
                fanId: user?.uid
            })
        });
    } catch (error) {
        console.error("Failed to confirm payment with server", error);
    }
  };
  
  const updateProfile = async (updates: Partial<CreatorProfile>) => {
      await updateClaimedCreator(updates);
  };

  const onboardStripe = async (): Promise<string> => {
    if (!user?.claimedCreator) throw new Error("No creator profile found");
    
    const response = await fetch('/api/auth/stripe/onboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creatorId: user.claimedCreator.id,
        email: user.email
      })
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error("Server error: Unable to connect to onboarding service.");
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to start onboarding");
    }

    return data.url;
  };

  const withdrawFunds = async (amount: number) => {
    if (!user?.claimedCreator) throw new Error("No creator profile found");

    const response = await fetch('/api/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creatorId: user.claimedCreator.id,
        amount
      })
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error("Server error: Unable to connect to withdrawal service.");
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to process withdrawal");
    }
  };

  const value = {
    balance,
    totalEarnings,
    stripeConnectAccountId,
    stripeOnboardingComplete,
    donations,
    notifications,
    markNotificationAsRead,
    addDonation,
    updateProfile,
    onboardStripe,
    withdrawFunds,
  };

  return (
    <CreatorDataContext.Provider value={value}>
      {children}
    </CreatorDataContext.Provider>
  );
};