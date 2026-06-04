import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile, AdSettings } from '../types';
import { generateReferralCode } from '../lib/utils';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface AppState {
  user: UserProfile | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  adSettings: AdSettings | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (name: string, email: string, pass: string, inviteCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<UserProfile>) => Promise<void>;
  updateLocalUser: (data: Partial<UserProfile>) => void;
  refreshUser: () => Promise<void>;
  submitReferralCode: (code: string) => Promise<boolean>;
  claimDailyCheckIn: () => Promise<{ success: boolean; reward: number; message: string }>;
  claimSquadBonus: (squadSize: number) => Promise<{ success: boolean; reward: number; message: string }>;
  claimAdReward: () => Promise<{ success: boolean; reward: number; message: string; limitReached?: boolean }>;
  claimUsdtAdReward: () => Promise<{ success: boolean; reward: number; message: string; limitReached?: boolean }>;
  requestWithdrawal: (amount: number, wallet: string) => Promise<{ success: boolean; message: string }>;
  requestUsdtWithdrawal: (amount: number, wallet: string, method?: string) => Promise<{ success: boolean; message: string }>;
  firebaseUser?: any; 
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
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [adSettings, setAdSettings] = useState<AdSettings | null>(null);

  const verifyDeviceLimit = async (authenticatedUid: string) => {
    const deviceId = getDeviceId();
    const { data: users } = await supabase.from('users').select('uid').eq('deviceId', deviceId);
    if (users && users.length > 0) {
      const isBoundToOther = users.some(u => u.uid !== authenticatedUid);
      if (isBoundToOther) {
        await supabase.auth.signOut();
        throw new Error("Anti-Cheat: Another account is already registered on this device.");
      }
    }
  };

  useEffect(() => {
    const fetchAdSettings = async () => {
      try {
        const { data } = await supabase.from('settings').select('*').eq('id', 'ads').single();
        if (data) {
          setAdSettings(data as AdSettings);
        } else {
          setAdSettings({ showAds: false });
        }
      } catch (error) {
        console.error("Error fetching ad settings:", error);
      }
    };
    fetchAdSettings();

    const fetchUserData = async (sUser: SupabaseUser) => {
      try {
        await verifyDeviceLimit(sUser.id);
      } catch (err: any) {
        alert(err.message);
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        let u = null;

        // Priority 1: Match by email (handles legacy accounts + normal lookup)
        if (sUser.email) {
          const { data } = await supabase
            .from('users')
            .select('*')
            .ilike('email', sUser.email)
            .order('balance', { ascending: false })
            .limit(1);
            
          if (data && data.length > 0) {
            u = data[0];
          }
        }

        // Priority 2: Match by UID if email not found or missing
        if (!u) {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('uid', sUser.id)
            .single();
          if (data) u = data;
        }

        if (u) {
          if (u.isActive === false && u.role !== 'admin') {
            await supabase.auth.signOut();
            setUser(null);
            alert("Your account has been blocked by an administrator.");
          } else {
            let updates: any = {};
            let needsUpdate = false;
            
            if (sUser.email === 'hzhssaadh@gmail.com' && u.role !== 'admin') {
               updates.role = 'admin';
               u.role = 'admin';
               needsUpdate = true;
            }
            
            const currentDeviceId = getDeviceId();
            if (!u.deviceId) {
              updates.deviceId = currentDeviceId;
              u.deviceId = currentDeviceId;
              needsUpdate = true;
            }
            
            if (!u.country) {
              try {
                const res = await fetch('https://ipapi.co/json/');
                if (res.ok) {
                  const data = await res.json();
                  if (data.country_name) {
                    updates.country = data.country_name;
                    u.country = data.country_name;
                    needsUpdate = true;
                  }
                }
              } catch(e) { console.warn("Failed to fetch IP", e); }
            }

            if (needsUpdate) {
              await supabase.from('users').update(updates).eq('uid', sUser.id);
            }

            setUser({ ...u, uid: sUser.id } as UserProfile);
          }
        } else {
          const newUser: UserProfile = {
            uid: sUser.id,
            name: sUser.user_metadata?.full_name || 'User',
            email: sUser.email || '',
            photoURL: sUser.user_metadata?.avatar_url || '',
            balance: 0,
            miningRate: 0.05 / 24,
            miningSessionEndTime: null,
            miningSessionStartTime: null,
            referralCode: generateReferralCode(),
            referredBy: null,
            referralCount: 0,
            joinDate: Date.now(),
            dailyStreak: 0,
            kycStatus: 'pending',
            role: (sUser.email === 'hzhssaadh@gmail.com') ? 'admin' : 'user',
            isActive: true,
            totalMined: 0,
            lastCheckIn: null,
            deviceId: getDeviceId(),
            transactionsBlocked: false,
            squadId: null,
            adsWatchedToday: 0,
            lastAdWatchDate: null,
            totalAdsWatched: 0,
            totalTasksCompleted: 0,
            country: null,
            isBlocked: false,
            usdtBalance: 0
          };
          const { error: insertError } = await supabase.from('users').insert([newUser]);
          if (insertError) {
            console.error("Error creating user", insertError);
            await supabase.auth.signOut();
            setUser(null);
            alert("Error creating account: " + insertError.message);
          } else {
            setUser(newUser);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        fetchUserData(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(true);
      if (session?.user) {
        setSupabaseUser(session.user);
        fetchUserData(session.user);
      } else {
        setSupabaseUser(null);
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
    } catch (error) {
      console.error("Email login failed", error);
      throw error;
    }
  };

  const signupWithEmail = async (name: string, email: string, pass: string, inviteCode?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { full_name: name } }
      });
      if (error) throw error;
      if (!data.user) throw new Error("No user returned");
      
      let referredByUid = null;
      let newUserBonus = 0;

      if (inviteCode && inviteCode.trim() !== '') {
        const trimmedCode = inviteCode.trim();
        const { data: inviterData } = await supabase.from('users').select('*').eq('referralCode', trimmedCode).single();
        
        if (inviterData) {
          const inviter = inviterData as UserProfile;
          referredByUid = inviter.uid;
          newUserBonus = 0.05;
          
          await supabase.from('users').update({
            referralCount: (inviter.referralCount || 0) + 1,
            balance: (inviter.balance || 0) + 0.05
          }).eq('uid', inviter.uid);
          
          await supabase.from('transactions').insert([{
            id: 'tx_' + Date.now() + Math.random().toString(36).substring(2),
            type: 'referral_bonus',
            amount: 0.05,
            timestamp: Date.now(),
            status: 'completed',
            receiverUid: inviter.uid,
            senderUid: 'system',
            description: `Referral bonus for inviting ${name || 'User'}`
          }]);
          
          await supabase.from('transactions').insert([{
            id: 'tx_signup_' + Date.now(),
            type: 'signup_bonus',
            amount: 0.05,
            timestamp: Date.now() + 1,
            status: 'completed',
            receiverUid: data.user.id,
            senderUid: 'system',
            description: `Sign-up reward for using an invite code`
          }]);
        }
      }

      if (referredByUid) {
        const newUser: UserProfile = {
            uid: data.user.id,
            name: name,
            email: email,
            photoURL: '',
            balance: newUserBonus,
            miningRate: 0.05 / 24,
            miningSessionEndTime: null,
            miningSessionStartTime: null,
            referralCode: generateReferralCode(),
            referredBy: referredByUid,
            referralCount: 0,
            joinDate: Date.now(),
            dailyStreak: 0,
            kycStatus: 'pending',
            role: (email === 'hzhssaadh@gmail.com') ? 'admin' : 'user',
            isActive: true,
            totalMined: 0,
            lastCheckIn: null,
            deviceId: getDeviceId(),
            transactionsBlocked: false,
            squadId: null,
            adsWatchedToday: 0,
            lastAdWatchDate: null,
            totalAdsWatched: 0,
            totalTasksCompleted: 0,
            country: null,
            isBlocked: false,
            usdtBalance: 0
        };
        await supabase.from('users').insert([newUser]);
      }
    } catch (error) {
      console.error("Email signup failed", error);
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    setSupabaseUser(null);
    await supabase.auth.signOut();
  };

  const updateUser = async (data: Partial<UserProfile>) => {
    if (!user) return;
    await supabase.from('users').update(data).eq('uid', user.uid);
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const updateLocalUser = (data: Partial<UserProfile>) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const refreshUser = async () => {
    if (!supabaseUser) return;
    try {
      const { data: u } = await supabase.from('users').select('*').eq('uid', supabaseUser.id).single();
      if (u) {
        setUser(u as UserProfile);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const submitReferralCode = async (code: string) => {
    if (!user || user.referredBy || !code || code.trim() === '') return false;
    const trimmedCode = code.trim();
    if (trimmedCode === user.referralCode) return false;
    
    try {
      const { data: inviterData } = await supabase.from('users').select('*').eq('referralCode', trimmedCode).single();
      
      if (inviterData) {
        const inviter = inviterData as UserProfile;
        
        await supabase.from('users').update({
          referralCount: (inviter.referralCount || 0) + 1,
          balance: (inviter.balance || 0) + 0.05
        }).eq('uid', inviter.uid);
        
        await supabase.from('transactions').insert([{
          id: 'tx_ref_' + Date.now(),
          type: 'referral_bonus',
          amount: 0.05,
          timestamp: Date.now(),
          status: 'completed',
          receiverUid: inviter.uid,
          senderUid: 'system',
          description: `Referral bonus for inviting ${user.name || 'User'}`
        }]);

        await supabase.from('transactions').insert([{
          id: 'tx_ref_rcv_' + Date.now(),
          type: 'referral_bonus_received',
          amount: 0.05,
          timestamp: Date.now() + 1,
          status: 'completed',
          receiverUid: user.uid,
          senderUid: 'system',
          description: `Reward for using an invite code`
        }]);

        await supabase.from('users').update({
          referredBy: inviter.uid,
          balance: (user.balance || 0) + 0.05
        }).eq('uid', user.uid);
        
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
    
    const maxReward = 0.2;
    const calcReward = squadSize * 0.01;
    let rewardAmount = Math.min(calcReward, maxReward);
    rewardAmount = Math.max(rewardAmount, 0.01);
    
    try {
      await supabase.from('users').update({
        lastSquadClaim: Date.now(),
        balance: (user.balance || 0) + rewardAmount
      }).eq('uid', user.uid);
      
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
    const startOfYesterday = startOfDay - 24 * 60 * 60 * 1000;
    if (user.lastCheckIn && user.lastCheckIn < startOfYesterday) {
      newStreak = 1;
    }
    
    const dayInCycle = ((newStreak - 1) % 5) + 1;
    const rewardAmounts = [0.02, 0.04, 0.06, 0.08, 0.10];
    const rewardAmount = rewardAmounts[dayInCycle - 1];
    
    try {
      await supabase.from('users').update({
        dailyStreak: newStreak,
        lastCheckIn: Date.now(),
        balance: (user.balance || 0) + rewardAmount
      }).eq('uid', user.uid);
      
      await supabase.from('transactions').insert([{
        id: 'tx_chk_' + Date.now(),
        type: 'daily_checkin',
        amount: rewardAmount,
        timestamp: Date.now(),
        status: 'completed',
        receiverUid: user.uid,
        senderUid: 'system',
        description: `Daily check-in reward (Day ${dayInCycle})`
      }]);
      
      return { success: true, reward: rewardAmount, message: `Day ${dayInCycle} check-in successful!` };
    } catch (e) {
      console.error(e);
      return { success: false, reward: 0, message: "Failed to claim reward" };
    }
  };

  const claimAdReward = async () => {
    if (!user) return { success: false, reward: 0, message: "Not logged in" };
    
    const now = new Date();
    const today = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
    
    let currentWatched = user.adsWatchedToday || 0;
    if (user.lastAdWatchDate !== today) {
      currentWatched = 0;
    }
    
    if (currentWatched >= 30) {
      return { success: false, reward: 0, message: "Daily limit of 30 ads reached.", limitReached: true };
    }
    
    const rewardAmount = Number((Math.random() * (0.05 - 0.01) + 0.01).toFixed(3));
    
    try {
      const currentTime = Date.now();
      const timeGapSeconds = user.lastAdWatchTimestamp ? Math.floor((currentTime - user.lastAdWatchTimestamp) / 1000) : null;

      await supabase.from('users').update({
        lastAdWatchDate: today,
        lastAdWatchTimestamp: currentTime,
        adsWatchedToday: currentWatched + 1,
        totalAdsWatched: (user.totalAdsWatched || 0) + 1,
        balance: (user.balance || 0) + rewardAmount
      }).eq('uid', user.uid);
      
      await supabase.from('transactions').insert([{
        id: 'tx_ad_' + Date.now(),
        type: 'ad_reward',
        amount: rewardAmount,
        timestamp: currentTime,
        status: 'completed',
        receiverUid: user.uid,
        senderUid: 'system',
        description: `Watched ad #${currentWatched + 1}`
      }]);

      await supabase.from('ads_log').insert([{
        id: 'adlog_' + Date.now(),
        userId: user.uid,
        userName: user.name || 'Anonymous',
        userEmail: user.email || 'Unknown',
        adNetwork: 'Monetag',
        reward: rewardAmount,
        timestamp: currentTime,
        timeGapSeconds: timeGapSeconds,
        country: user.country || 'Unknown'
      }]);
      
      return { success: true, reward: rewardAmount, message: `You earned ${rewardAmount} CM!` };
    } catch (e) {
      console.error(e);
      return { success: false, reward: 0, message: "Failed to claim ad reward" };
    }
  };

  const claimUsdtAdReward = async () => {
    if (!user) return { success: false, reward: 0, message: "Not logged in" };
    
    const now = new Date();
    const today = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
    
    let currentWatched = user.adsWatchedToday || 0;
    if (user.lastAdWatchDate !== today) {
      currentWatched = 0;
    }
    
    if (currentWatched >= 200) {
      return { success: false, reward: 0, message: "Daily limit of 200 ads reached.", limitReached: true };
    }
    
    const rewardAmount = 0.0008;
    
    try {
      const currentTime = Date.now();
      const timeGapSeconds = user.lastAdWatchTimestamp ? Math.floor((currentTime - user.lastAdWatchTimestamp) / 1000) : null;

      await supabase.from('users').update({
        lastAdWatchDate: today,
        lastAdWatchTimestamp: currentTime,
        adsWatchedToday: currentWatched + 1,
        totalAdsWatched: (user.totalAdsWatched || 0) + 1,
        usdtBalance: (user.usdtBalance || 0) + rewardAmount
      }).eq('uid', user.uid);
      
      await supabase.from('transactions').insert([{
        id: 'tx_usdtad_' + Date.now(),
        type: 'ad_reward',
        amount: rewardAmount,
        currency: 'USDT',
        timestamp: currentTime,
        status: 'completed',
        receiverUid: user.uid,
        senderUid: 'system',
        description: `Watched ad #${currentWatched + 1} for USDT`
      }]);

      await supabase.from('ads_log').insert([{
        id: 'adlog_' + Date.now(),
        userId: user.uid,
        userName: user.name || 'Anonymous',
        userEmail: user.email || 'Unknown',
        adNetwork: 'Monetag (USDT)',
        reward: rewardAmount,
        timestamp: currentTime,
        timeGapSeconds: timeGapSeconds,
        country: user.country || 'Unknown'
      }]);
      
      return { success: true, reward: rewardAmount, message: `You earned ${rewardAmount} USDT!` };
    } catch (e) {
      console.error(e);
      return { success: false, reward: 0, message: "Failed to claim ad reward" };
    }
  };

  const requestWithdrawal = async (amount: number, wallet: string) => {
    if (!user) return { success: false, message: "Not logged in" };
    if (user.balance < amount) return { success: false, message: "Insufficient balance" };
    if (amount < 5) return { success: false, message: "Minimum withdrawal is 5" };

    try {
      await supabase.from('users').update({ balance: user.balance - amount }).eq('uid', user.uid);

      const wId = 'w_' + Date.now();
      const txId = 'tx_' + Date.now();
      
      await supabase.from('transactions').insert([{
        id: txId,
        type: 'withdrawal',
        amount: -amount,
        timestamp: Date.now(),
        status: 'pending',
        receiverUid: 'system',
        senderUid: user.uid,
        description: `Withdrawal request to ${wallet}`
      }]);

      await supabase.from('withdrawals').insert([{
        id: wId,
        userId: user.uid,
        userName: user.name || 'Anonymous',
        userEmail: user.email || 'Unknown',
        amount: amount,
        wallet: wallet,
        status: 'pending',
        requestedAt: Date.now(),
        country: user.country || 'Unknown',
        transactionId: txId
      }]);

      return { success: true, message: "Withdrawal requested successfully!" };
    } catch (e) {
      console.error(e);
      return { success: false, message: "Request failed. Please try again." };
    }
  };

  const requestUsdtWithdrawal = async (amount: number, wallet: string, method?: string) => {
    if (!user) return { success: false, message: "Not logged in" };
    if ((user.usdtBalance || 0) < amount) return { success: false, message: "Insufficient USDT balance" };
    if (amount < 2) return { success: false, message: "Minimum withdrawal is 2 USDT" };

    try {
      await supabase.from('users').update({ usdtBalance: (user.usdtBalance || 0) - amount }).eq('uid', user.uid);

      const wId = 'w_usdt_' + Date.now();
      const txId = 'tx_' + Date.now();

      await supabase.from('transactions').insert([{
        id: txId,
        type: 'withdrawal',
        amount: -amount,
        currency: 'USDT',
        timestamp: Date.now(),
        status: 'pending',
        receiverUid: 'system',
        senderUid: user.uid,
        description: `USDT Withdrawal request to ${wallet}`
      }]);
      
      await supabase.from('withdrawals_usdt').insert([{
        id: wId,
        userId: user.uid,
        userName: user.name || 'Anonymous',
        userEmail: user.email || 'Unknown',
        amount: amount,
        currency: 'USDT',
        wallet: wallet,
        method: method || 'TRC20 / Binance UID',
        status: 'pending',
        requestedAt: Date.now(),
        country: user.country || 'Unknown',
        transactionId: txId
      }]);

      return { success: true, message: "USDT Withdrawal requested successfully!" };
    } catch (e: any) {
      console.error(e);
      return { success: false, message: e.message || "Request failed. Please try again." };
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      supabaseUser, 
      firebaseUser: supabaseUser,
      loading, 
      adSettings, 
      loginWithGoogle, 
      loginWithEmail, 
      signupWithEmail, 
      logout, 
      updateUser, 
      updateLocalUser, 
      refreshUser, 
      submitReferralCode, 
      claimDailyCheckIn, 
      claimSquadBonus, 
      claimAdReward, 
      claimUsdtAdReward, 
      requestWithdrawal, 
      requestUsdtWithdrawal 
    }}>
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
