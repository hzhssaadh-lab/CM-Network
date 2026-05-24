import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, onSnapshot, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { UserProfile, AdSettings } from '../types';
import { generateReferralCode } from '../lib/utils';

interface AppState {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  adSettings: AdSettings | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (name: string, email: string, pass: string, inviteCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<UserProfile>) => Promise<void>;
  submitReferralCode: (code: string) => Promise<boolean>;
}

const AppContext = createContext<AppState | undefined>(undefined);

const getDeviceId = () => {
  let deviceId = localStorage.getItem('cm_device_id');
  if (!deviceId) {
    deviceId = 'dev_' + Date.now() + Math.random().toString(36).substring(2);
    localStorage.setItem('cm_device_id', deviceId);
  }
  return deviceId;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [adSettings, setAdSettings] = useState<AdSettings | null>(null);

  useEffect(() => {
    // Listen to global AdSettings
    const adSettingsRef = doc(db, 'settings', 'ads');
    const unsubscribeAds = onSnapshot(adSettingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setAdSettings(docSnap.data() as AdSettings);
      } else {
        setAdSettings({ showAds: false });
      }
    });

    let unsubscribeUser: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      
      if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = null;
      }

      if (!fUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const userRef = doc(db, 'users', fUser.uid);
      
      unsubscribeUser = onSnapshot(userRef, async (docSnap) => {
        if (docSnap.exists()) {
          const u = docSnap.data() as UserProfile;
          if (u.isActive === false && u.role !== 'admin') {
            await signOut(auth);
            setUser(null);
            alert("Your account has been blocked by an administrator.");
          } else {
            // Auto-upgrade to admin for the specific email
            if (fUser.email === 'hzhssaadh@gmail.com' && u.role !== 'admin') {
               await setDoc(userRef, { role: 'admin' }, { merge: true });
               u.role = 'admin';
            }
            // Bind device ID if missing
            const currentDeviceId = getDeviceId();
            if (!u.deviceId) {
              await setDoc(userRef, { deviceId: currentDeviceId }, { merge: true });
              u.deviceId = currentDeviceId;
            }

            setUser(u);
          }
        } else {
          // Create new user profile
          const newUser: UserProfile = {
            uid: fUser.uid,
            name: fUser.displayName || 'User',
            email: fUser.email || '',
            photoURL: fUser.photoURL || '',
            balance: 0,
            miningRate: 0.05 / 24, // 0.05 CM daily = per hour rate
            miningSessionEndTime: null,
            miningSessionStartTime: null,
            referralCode: generateReferralCode(),
            referredBy: null,
            referralCount: 0,
            joinDate: Date.now(),
            dailyStreak: 0,
            kycStatus: 'pending',
            role: (fUser.email === 'hzhssaadh@gmail.com') ? 'admin' : 'user',
            isActive: true,
            totalMined: 0,
            lastCheckIn: null,
            deviceId: getDeviceId()
          };
          await setDoc(userRef, newUser);
          setUser(newUser);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching user data:", error);
        setLoading(false);
      });
    });

    return () => {
      unsubscribe();
      if (unsubscribeUser) unsubscribeUser();
      unsubscribeAds();
    };
  }, []);

  const verifyDeviceLimit = async (authenticatedUid: string) => {
    const deviceId = getDeviceId();
    const q = query(collection(db, 'users'), where('deviceId', '==', deviceId));
    const qs = await getDocs(q);
    
    if (!qs.empty) {
      const isBoundToOther = qs.docs.some(d => d.id !== authenticatedUid);
      if (isBoundToOther) {
        await signOut(auth);
        throw new Error("Anti-Cheat: Another account is already registered on this device.");
      }
    }
  };

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await verifyDeviceLimit(res.user.uid);
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      await verifyDeviceLimit(res.user.uid);
    } catch (error) {
      console.error("Email login failed", error);
      throw error;
    }
  };

  const signupWithEmail = async (name: string, email: string, pass: string, inviteCode?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await verifyDeviceLimit(userCredential.user.uid);
      
      let referredByUid = null;
      let newUserBonus = 0;

      if (inviteCode && inviteCode.trim() !== '') {
        const trimmedCode = inviteCode.trim();
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('referralCode', '==', trimmedCode));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const inviterDoc = querySnapshot.docs[0];
          const inviter = inviterDoc.data() as UserProfile;
          referredByUid = inviter.uid;
          newUserBonus = 0.05; // Instant reward for using a code
          
          const inviterRef = doc(db, 'users', inviter.uid);
          await setDoc(inviterRef, {
            referralCount: (inviter.referralCount || 0) + 1,
            balance: (inviter.balance || 0) + 0.08
          }, { merge: true });
          
          const txRef = doc(collection(db, 'transactions'));
          await setDoc(txRef, {
            id: txRef.id,
            type: 'referral_bonus',
            amount: 0.08,
            timestamp: Date.now(),
            status: 'completed',
            receiverUid: inviter.uid,
            senderUid: userCredential.user.uid,
            description: `Referral bonus for inviting ${name || 'User'}`
          });
          
          // Transaction for new user bonus
          const newUserTxRef = doc(collection(db, 'transactions'));
          await setDoc(newUserTxRef, {
            id: newUserTxRef.id,
            type: 'signup_bonus',
            amount: 0.05,
            timestamp: Date.now() + 1,
            status: 'completed',
            receiverUid: userCredential.user.uid,
            senderUid: inviter.uid,
            description: `Sign-up reward for using an invite code`
          });
        }
      }

      const userRef = doc(db, 'users', userCredential.user.uid);
      const updateData: Partial<UserProfile> = {
        name: name,
      };
      
      if (referredByUid) {
        updateData.referredBy = referredByUid;
        updateData.balance = newUserBonus;
      }
      
      await setDoc(userRef, updateData, { merge: true });
    } catch (error) {
      console.error("Email signup failed", error);
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    setFirebaseUser(null);
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout issue:", e);
    }
  };

  const updateUser = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, data, { merge: true });
  };

  const submitReferralCode = async (code: string) => {
    if (!user || user.referredBy || !code || code.trim() === '') return false;
    const trimmedCode = code.trim();
    if (trimmedCode === user.referralCode) return false;
    
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', trimmedCode));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const inviterDoc = querySnapshot.docs[0];
        const inviter = inviterDoc.data() as UserProfile;
        
        const inviterRef = doc(db, 'users', inviter.uid);
        await setDoc(inviterRef, {
          referralCount: (inviter.referralCount || 0) + 1,
          balance: (inviter.balance || 0) + 0.08
        }, { merge: true });
        
        const txRef = doc(collection(db, 'transactions'));
        await setDoc(txRef, {
          id: txRef.id,
          type: 'referral_bonus',
          amount: 0.08,
          timestamp: Date.now(),
          status: 'completed',
          receiverUid: inviter.uid,
          senderUid: user.uid,
          description: `Referral bonus for inviting ${user.name || 'User'}`
        });

        // Current user bonus for using the code
        const userTxRef = doc(collection(db, 'transactions'));
        await setDoc(userTxRef, {
          id: userTxRef.id,
          type: 'referral_bonus_received',
          amount: 0.05,
          timestamp: Date.now() + 1,
          status: 'completed',
          receiverUid: user.uid,
          senderUid: inviter.uid,
          description: `Reward for using an invite code`
        });

        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          referredBy: inviter.uid,
          balance: (user.balance || 0) + 0.05
        }, { merge: true });
        
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{ user, firebaseUser, loading, adSettings, loginWithGoogle, loginWithEmail, signupWithEmail, logout, updateUser, submitReferralCode }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
