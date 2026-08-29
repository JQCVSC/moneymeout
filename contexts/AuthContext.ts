import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User, CreatorProfile } from '../types';
import { 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    type User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, getDocFromServer } from "firebase/firestore";
import { auth, db } from '../firebase';

const googleProvider = new GoogleAuthProvider();

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    // Non-blocking connection test; ignore initial connection sync errors gracefully
  }
}
testConnection();

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

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
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

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, pass: string) => Promise<{success: boolean, error?: string, code?: string}>;
  logout: () => void;
  signup: (name: string, email: string, pass: string, claimedCreator?: CreatorProfile) => Promise<{success: boolean, error?: string}>;
  signInWithGoogle: (claimedCreator?: CreatorProfile) => Promise<{success: boolean, error?: string}>;
  sendPasswordReset: (email: string) => Promise<{success: boolean, error?: string}>;
  updateClaimedCreator: (updates: Partial<CreatorProfile>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const sanitizeCreatorProfile = (profile: CreatorProfile): CreatorProfile => {
    // This function creates a new, clean object to avoid any potential complex objects or methods
    // from being passed into the state or database.
    const cleanProfile: CreatorProfile = {
        id: profile.id,
        name: profile.name,
        handle: profile.handle,
        subscribers: profile.subscribers || 0,
        description: profile.description || '',
        avatarUrl: profile.avatarUrl || '',
        bannerUrl: profile.bannerUrl || '',
        balance: 0, // Always initialize balance to 0 for new claims
    };
    return cleanProfile;
};


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserDocument = async (firebaseUser: FirebaseUser): Promise<User | null> => {
      const path = `users/${firebaseUser.uid}`;
      try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            return userSnap.data() as User;
          } else {
            // This case should ideally not be hit in normal login flow, but as a fallback.
            console.warn("No user document found for uid:", firebaseUser.uid);
            return null;
          }
      } catch (error) {
          handleFirestoreError(error, OperationType.GET, path);
          return null;
      }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        setIsLoading(true);
        if (firebaseUser) {
            const userDoc = await fetchUserDocument(firebaseUser);
            // If userDoc is null (e.g., signup failed halfway), they'll be treated as logged out.
            setUser(userDoc); 
        } else {
            setUser(null);
        }
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<{success: boolean, error?: string, code?: string}> => {
    setIsLoading(true);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        // Explicitly fetch user doc after login to prevent race condition
        const userDoc = await fetchUserDocument(userCredential.user);
        if (userDoc) {
            setUser(userDoc);
            setIsLoading(false);
            return { success: true };
        } else {
            // This can happen if the user document was never created on signup
            throw new Error("User profile not found. Please contact support.");
        }
    } catch (error: any) {
        setIsLoading(false);
        return { success: false, error: error.message, code: error.code };
    }
  };
  
  const signup = async (name: string, email: string, pass: string, claimedCreator?: CreatorProfile): Promise<{success: boolean, error?: string}> => {
    setIsLoading(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const firebaseUser = userCredential.user;
        if (firebaseUser) {
            await updateProfile(firebaseUser, { displayName: name });
            
            const newUser: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name,
            };

            if (claimedCreator) {
                // Check if creator is already claimed
                const creatorRef = doc(db, 'creators', claimedCreator.id);
                const creatorSnap = await getDoc(creatorRef);
                if (creatorSnap.exists() && creatorSnap.data()?.ownerUid && creatorSnap.data()?.ownerUid !== firebaseUser.uid) {
                    throw new Error("This creator is already claimed by another user.");
                }

                newUser.claimedCreator = sanitizeCreatorProfile(claimedCreator);
            }
            
            // 1. Create the user document FIRST so Firestore rules know this user owns the creator profile
            const path = `users/${firebaseUser.uid}`;
            try {
                await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            } catch (error) {
                handleFirestoreError(error, OperationType.WRITE, path);
            }

            // 2. Initialize creator document SECOND (after user profile is created)
            if (claimedCreator) {
                try {
                    const creatorRef = doc(db, 'creators', claimedCreator.id);
                    const creatorPayload: Record<string, any> = {
                        ownerUid: firebaseUser.uid,
                        name: claimedCreator.name,
                        handle: claimedCreator.handle,
                    };
                    if (claimedCreator.avatarUrl && (claimedCreator.avatarUrl.startsWith('http://') || claimedCreator.avatarUrl.startsWith('https://'))) {
                        creatorPayload.avatarUrl = claimedCreator.avatarUrl;
                    }
                    if (claimedCreator.bannerUrl && (claimedCreator.bannerUrl.startsWith('http://') || claimedCreator.bannerUrl.startsWith('https://'))) {
                        creatorPayload.bannerUrl = claimedCreator.bannerUrl;
                    }

                    await setDoc(creatorRef, creatorPayload, { merge: true });
                } catch (creatorErr) {
                    console.warn("Non-fatal creator document sync error during signup:", creatorErr);
                }
            }

            setUser(newUser);
        }
        setIsLoading(false);
        return { success: true };
    } catch (error: any) {
        setIsLoading(false);
         return { success: false, error: error.message };
    }
  };

  const signInWithGoogle = async (claimedCreator?: CreatorProfile): Promise<{success: boolean, error?: string}> => {
    setIsLoading(true);
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const firebaseUser = result.user;
        const userRef = doc(db, "users", firebaseUser.uid);
        const path = `users/${firebaseUser.uid}`;
        
        let docSnap;
        try {
            docSnap = await getDoc(userRef);
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, path);
        }
        
        let finalUser: User;

        if (!docSnap?.exists()) {
            // First time signing in with Google. If they are claiming a channel, sanitize it.
            finalUser = {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName,
                email: firebaseUser.email,
            };
            if (claimedCreator) {
                // Check if creator is already claimed
                const creatorRef = doc(db, 'creators', claimedCreator.id);
                const creatorSnap = await getDoc(creatorRef);
                if (creatorSnap.exists() && creatorSnap.data()?.ownerUid && creatorSnap.data()?.ownerUid !== firebaseUser.uid) {
                    throw new Error("This creator is already claimed by another user.");
                }

                finalUser.claimedCreator = sanitizeCreatorProfile(claimedCreator);
            }

            // 1. Create user document FIRST
            try {
                await setDoc(userRef, finalUser);
            } catch (error) {
                handleFirestoreError(error, OperationType.WRITE, path);
            }

            // 2. Initialize creator document SECOND
            if (claimedCreator) {
                try {
                    const creatorRef = doc(db, 'creators', claimedCreator.id);
                    const creatorPayload: Record<string, any> = {
                        ownerUid: firebaseUser.uid,
                        name: claimedCreator.name,
                        handle: claimedCreator.handle,
                    };
                    if (claimedCreator.avatarUrl && (claimedCreator.avatarUrl.startsWith('http://') || claimedCreator.avatarUrl.startsWith('https://'))) {
                        creatorPayload.avatarUrl = claimedCreator.avatarUrl;
                    }
                    if (claimedCreator.bannerUrl && (claimedCreator.bannerUrl.startsWith('http://') || claimedCreator.bannerUrl.startsWith('https://'))) {
                        creatorPayload.bannerUrl = claimedCreator.bannerUrl;
                    }

                    await setDoc(creatorRef, creatorPayload, { merge: true });
                } catch (creatorErr) {
                    console.warn("Non-fatal creator document sync error during Google sign-in:", creatorErr);
                }
            }
        } else {
            const existingUser = docSnap.data() as User;
             // Existing Google user, now claiming a channel. Sanitize before updating.
             if (claimedCreator && !existingUser.claimedCreator) {
                 // Check if creator is already claimed
                 const creatorId = claimedCreator.id;
                 const creatorRef = doc(db, 'creators', creatorId);
                 const creatorSnap = await getDoc(creatorRef);
                 if (creatorSnap.exists() && creatorSnap.data()?.ownerUid && creatorSnap.data()?.ownerUid !== firebaseUser.uid) {
                     throw new Error("This creator is already claimed by another user.");
                 }

                 const sanitizedCreator = sanitizeCreatorProfile(claimedCreator);
                 const updateData = { claimedCreator: sanitizedCreator };
                 try {
                     await updateDoc(userRef, updateData);
                 } catch (error) {
                     handleFirestoreError(error, OperationType.WRITE, path);
                 }

                 // Initialize creator document
                 try {
                     const creatorPayload: Record<string, any> = {
                        ownerUid: firebaseUser.uid,
                        name: claimedCreator.name,
                        handle: claimedCreator.handle,
                     };
                     if (claimedCreator.avatarUrl && (claimedCreator.avatarUrl.startsWith('http://') || claimedCreator.avatarUrl.startsWith('https://'))) {
                         creatorPayload.avatarUrl = claimedCreator.avatarUrl;
                     }
                     if (claimedCreator.bannerUrl && (claimedCreator.bannerUrl.startsWith('http://') || claimedCreator.bannerUrl.startsWith('https://'))) {
                         creatorPayload.bannerUrl = claimedCreator.bannerUrl;
                     }

                     await setDoc(creatorRef, creatorPayload, { merge: true });
                 } catch (creatorErr) {
                     console.warn("Non-fatal creator document sync error during existing Google user claim:", creatorErr);
                 }

                 finalUser = { ...existingUser, ...updateData };
             } else {
                 finalUser = existingUser;
             }
        }
        setUser(finalUser);
        setIsLoading(false);
        return { success: true };
    } catch (error: any) {
        setIsLoading(false);
        return { success: false, error: error.message };
    }
  };
  
  const sendPasswordReset = async (email: string): Promise<{success: boolean, error?: string}> => {
      try {
          await sendPasswordResetEmail(auth, email);
          return { success: true };
      } catch (error: any) {
          return { success: false, error: error.message };
      }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };
  
  const updateClaimedCreator = useCallback(async (updates: Partial<CreatorProfile>) => {
      if (!user || !user.claimedCreator) return;
      
      const userRef = doc(db, 'users', user.uid);
      const path = `users/${user.uid}`;
      
      // Use dot notation for updating nested fields. This is safer and more efficient.
      const updatePayload: { [key: string]: any } = {};
      for (const key in updates) {
          if (Object.prototype.hasOwnProperty.call(updates, key)) {
              updatePayload[`claimedCreator.${key}`] = (updates as any)[key];
          }
      }

      if (Object.keys(updatePayload).length === 0) return;

      try {
          await updateDoc(userRef, updatePayload);
      } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, path);
      }

      // Update local state safely
      setUser(currentUser => {
          if (!currentUser || !currentUser.claimedCreator) return null;
          return {
              ...currentUser,
              claimedCreator: {
                  ...currentUser.claimedCreator,
                  ...updates,
              },
          };
      });
  }, [user]);

  const value = {
    isAuthenticated: !!user,
    isLoading,
    user,
    login,
    logout,
    signup,
    signInWithGoogle,
    sendPasswordReset,
    updateClaimedCreator
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};