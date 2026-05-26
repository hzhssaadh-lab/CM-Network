import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
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
  claimDailyCheckIn: () => Promise<{ success: boolean; reward: number; message: string }>;
  claimSquadBonus: (squadSize: number) => Promise<{ success: boolean; reward: number; message: string }>;
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
      setLoading(true);
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
      
      try {
         await verifyDeviceLimit(fUser.uid);
      } catch (err: any) {
         alert(err.message);
         setUser(null);
         setLoading(false);
         return;
      }

      const userRef = doc(db, 'users', fUser.uid);
      
      unsubscribeUser = onSnapshot(userRef, async (docSnap) => {
        if (docSnap.exists()) {
          const u = docSnap.data() as UserProfile;
          u.uid = fUser.uid; // Ensure uid is present even for older documents
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
          try {
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
          } catch (err: any) {
            console.error("Error creating user document", err);
            await signOut(auth);
            setUser(null);
            alert("Error creating account. Please try again later.");
          }
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

  const loginWithGoogle = async () => {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Email login failed", error);
      throw error;
    }
  };

  const signupWithEmail = async (name: string, email: string, pass: string, inviteCode?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);

      
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

  const claimSquadBonus = async (squadSize: number) => {
    if (!user) return { success: false, reward: 0, message: "Not logged in" };
    if (squadSize === 0) return { success: false, reward: 0, message: "No squad members" };
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    if (user.lastSquadClaim && user.lastSquadClaim >= startOfDay) {
      return { success: false, reward: 0, message: "Already claimed today" };
    }
    
    // Reward between 0.01 and 0.2 depending on squad size or random
    const maxReward = 0.2;
    const calcReward = squadSize * 0.01;
    let rewardAmount = Math.min(calcReward, maxReward);
    // ensure at least 0.01
    rewardAmount = Math.max(rewardAmount, 0.01);
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        lastSquadClaim: Date.now(),
        balance: (user.balance || 0) + rewardAmount
      }, { merge: true });
      
      return { success: true, reward: rewardAmount, message: "Claimed successfully" };
    } catch (e) {
      console.error(e);
      return { success: false, reward: 0, message: "Error claiming" };
    }
  };

  const claimDailyCheckIn = async () => {
    if (!user) return { success: false, reward: 0, message: "Not logged in" };
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    if (user.lastCheckIn && user.lastCheckIn >= startOfDay) {
      return { success: false, reward: 0, message: "Already claimed today" };
    }
    
    let newStreak = (user.dailyStreak || 0) + 1;
    
    // Check if missed a day
    const startOfYesterday = startOfDay - 24 * 60 * 60 * 1000;
    if (user.lastCheckIn && user.lastCheckIn < startOfYesterday) {
      newStreak = 1; // Reset streak
    }
    
    // Cycle from 1 to 5
    const dayInCycle = ((newStreak - 1) % 5) + 1;
    const rewardAmounts = [0.02, 0.04, 0.06, 0.08, 0.10];
    const rewardAmount = rewardAmounts[dayInCycle - 1];
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        dailyStreak: newStreak,
        lastCheckIn: Date.now(),
        balance: (user.balance || 0) + rewardAmount
      }, { merge: true });
      
      const txRef = doc(collection(db, 'transactions'));
      await setDoc(txRef, {
        id: txRef.id,
        type: 'daily_checkin',
        amount: rewardAmount,
        timestamp: Date.now(),
        status: 'completed',
        receiverUid: user.uid,
        senderUid: 'system',
        description: `Daily check-in reward (Day ${dayInCycle})`
      });
      
      return { success: true, reward: rewardAmount, message: `Day ${dayInCycle} check-in successful!` };
    } catch (e) {
      console.error(e);
      return { success: false, reward: 0, message: "Failed to claim reward" };
    }
  };

  return (
    <AppContext.Provider value={{ user, firebaseUser, loading, adSettings, loginWithGoogle, loginWithEmail, signupWithEmail, logout, updateUser, submitReferralCode, claimDailyCheckIn, claimSquadBonus }}>
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
