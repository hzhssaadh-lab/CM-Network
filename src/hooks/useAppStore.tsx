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
  loginWithStudioEmail: (email: string) => Promise<void>;
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
  startMining: () => Promise<{ success: boolean; message: string }>;
  claimMiningReward?: () => Promise<{ success: boolean; message: string }>;
  sendCryptoTransfer: (recipient: string, amount: number, asset: 'CM' | 'USDT') => Promise<{ success: boolean; message: string }>;
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

  const verifyDeviceLimit = async (authenticatedUid: string, email?: string) => {
    if (email === 'hzhssaadh@gmail.com' || email === 'ms888mf@gmail.com') {
      return;
    }
    const deviceId = getDeviceId();
    const { data: users } = await supabase.from('users').select('uid, email').eq('deviceId', deviceId);
    if (users && users.length > 0) {
      const isBoundToOther = users.some(u => u.uid !== authenticatedUid && u.email !== email);
      if (isBoundToOther) {
        console.warn("Notice: Device id shared with other profile", deviceId);
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

    const fetchUserData = async (sUser: SupabaseUser | any) => {
      try {
        await verifyDeviceLimit(sUser.id, sUser.email);
      } catch (err: any) {
        console.warn("Device check notice:", err?.message);
      }

      try {
        let u = null;

        // Priority 1: Match by email (handles legacy accounts + normal lookup)
        if (sUser.email) {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .ilike('email', sUser.email)
            .order('balance', { ascending: false })
            .limit(1);
            
          if (error) { console.error("email search error:", error); throw error; }
          if (data && data.length > 0) {
            u = data[0];
          }
        }

        // Priority 2: Match by UID if email not found or missing
        if (!u) {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('uid', sUser.id)
            .single();
          if (error && error.code !== 'PGRST116') { console.error("uid search error:", error); throw error; }
          if (data) u = data;
        }

        if (u) {
          if (u.isActive === false && u.role !== 'admin') {
            await supabase.auth.signOut();
            setUser(null);
            console.warn("Account is blocked by administrator.");
          } else {
            const oldUid = u.uid || u.UID;
            if (oldUid && oldUid !== sUser.id) {
              console.log(`Legacy user detected: migrating old ID "${oldUid}" to new ID "${sUser.id}"`);
              
              try {
                const { error: rpcError } = await supabase.rpc('link_legacy_account', {
                  user_email: sUser.email,
                  new_user_id: sUser.id
                });
                if (rpcError) {
                  console.error("RPC Migration error:", rpcError);
                } else {
                   // Since the backend did the work, refresh u block
                   const { data: migratedData } = await supabase.from('users').select('*').eq('uid', sUser.id).single();
                   if (migratedData) {
                     u = migratedData;
                     console.log(`Successfully migrated user via RPC to "${sUser.id}"`);
                   }
                }
              } catch (e) {
                console.warn("RPC migration threw an exception:", e);
              }
            }

            let updates: any = {};
            let needsUpdate = false;
            
            const isTargetAdmin = sUser.email?.trim().toLowerCase() === 'hzhssaadh@gmail.com';
            if (isTargetAdmin) {
              if (u.role !== 'admin') {
                updates.role = 'admin';
                u.role = 'admin';
                needsUpdate = true;
              }
            } else if (u.role === 'admin') {
              updates.role = 'user';
              u.role = 'user';
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
              } catch(e) { console.warn("Failed to fetch IP"); }
            }

            // Coin Protection & Reconcile: Ensure users never lose coin data across legacy columns
            const bestCm = Math.max(Number(u.balance || 0), Number(u['CM Coins'] || 0), Number(u.cm_coins || 0));
            const bestUsdt = Math.max(Number(u.usdtBalance || 0), Number(u['USDT'] || 0), Number(u.usdtbalance || 0));
            if (bestCm > Number(u.balance || 0) || bestUsdt > Number(u.usdtBalance || 0) || Number(u['CM Coins'] || 0) !== bestCm || Number(u.cm_coins || 0) !== bestCm || Number(u['USDT'] || 0) !== bestUsdt || Number(u.usdtbalance || 0) !== bestUsdt) {
              u.balance = bestCm;
              u['CM Coins'] = bestCm;
              u.cm_coins = bestCm;
              u.usdtBalance = bestUsdt;
              u['USDT'] = bestUsdt;
              u.usdtbalance = bestUsdt;
              updates.balance = bestCm;
              updates['CM Coins'] = bestCm;
              updates.cm_coins = bestCm;
              updates.usdtBalance = bestUsdt;
              updates['USDT'] = bestUsdt;
              updates.usdtbalance = bestUsdt;
              needsUpdate = true;
            }

            if (needsUpdate) {
              await supabase.from('users').update(updates).eq('uid', sUser.id);
            }

            const now = new Date();
            const today = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            
            const { count: cmCountToday } = await supabase.from('ads_log')
              .select('*', { count: 'exact', head: true })
              .eq('userId', sUser.id)
              .eq('adNetwork', 'Monetag (CM)')
              .gte('timestamp', startOfDay);

            const { count: cmCountTotal } = await supabase.from('ads_log')
              .select('*', { count: 'exact', head: true })
              .eq('userId', sUser.id)
              .eq('adNetwork', 'Monetag (CM)');
            
            u.cmAdsWatchedToday = cmCountToday || 0;
            u.totalCmAdsWatched = cmCountTotal || 0;

            const lsDate = localStorage.getItem(`cmAds_${sUser.id}_date`);
            if (lsDate === today) {
              const lsCount = parseInt(localStorage.getItem(`cmAds_${sUser.id}_count`) || '0', 10);
              if (lsCount > u.cmAdsWatchedToday) u.cmAdsWatchedToday = lsCount;
            }
            const lsTotal = parseInt(localStorage.getItem(`cmAds_${sUser.id}_total`) || '0', 10);
            if (lsTotal > u.totalCmAdsWatched) u.totalCmAdsWatched = lsTotal;

            u.lastCmAdWatchDate = (u.cmAdsWatchedToday > 0) ? today : undefined;

            // Hydrate KYC submission details from settings table or localStorage
            try {
              let kycDetails: any = null;
              const { data: kycRow } = await supabase.from('settings').select('*').eq('id', `kyc_${sUser.id}`).maybeSingle();
              if (kycRow?.adsterraSnippet) {
                try { kycDetails = JSON.parse(kycRow.adsterraSnippet); } catch(e) {}
              }
              if (!kycDetails) {
                const cached = localStorage.getItem(`cm_kyc_submission_${sUser.id}`);
                if (cached) {
                  try { kycDetails = JSON.parse(cached); } catch(e) {}
                }
              }

              // Check status from users table (case-insensitive)
              const rawDbStatus = String(u.kycStatus || (u as any).kycstatus || '').toLowerCase().trim();
              const isDbVerified = rawDbStatus === 'verified' || rawDbStatus === 'approved';
              const isDbRejected = rawDbStatus === 'rejected';

              if (kycDetails) {
                u.kycPhotoUrl = kycDetails.kycPhotoUrl || kycDetails.selfie || u.kycPhotoUrl;
                u.kycPaymentProofUrl = kycDetails.kycPaymentProofUrl || kycDetails.proof || u.kycPaymentProofUrl;
                u.kycChain = kycDetails.kycChain || kycDetails.chain || u.kycChain;
                u.kycTxHash = kycDetails.kycTxHash || kycDetails.txHash || u.kycTxHash;
                u.kycSubmittedAt = kycDetails.kycSubmittedAt || kycDetails.submittedAt || u.kycSubmittedAt;

                if (kycDetails.status === 'verified' || isDbVerified) {
                  u.kycStatus = 'verified';
                  (u as any).kycstatus = 'verified';
                  (u as any).kycApprovedAt = kycDetails.approvedAt || (u as any).kycApprovedAt || Date.now();
                } else if (kycDetails.status === 'rejected' || isDbRejected) {
                  u.kycStatus = 'rejected';
                  (u as any).kycstatus = 'rejected';
                  (u as any).rejectionReason = kycDetails.rejectionReason || (u as any).rejectionReason;
                  (u as any).kycRejectedAt = kycDetails.rejectedAt || (u as any).kycRejectedAt || Date.now();
                } else {
                  u.kycStatus = 'pending';
                  (u as any).kycstatus = 'pending';
                }
              } else if (isDbVerified) {
                u.kycStatus = 'verified';
                (u as any).kycstatus = 'verified';
              } else if (isDbRejected) {
                u.kycStatus = 'rejected';
                (u as any).kycstatus = 'rejected';
              } else if (rawDbStatus === 'pending') {
                u.kycStatus = 'pending';
                (u as any).kycstatus = 'pending';
              } else {
                u.kycStatus = 'unverified';
                (u as any).kycstatus = 'unverified';
              }
            } catch (err) {
              console.warn("KYC hydration error:", err);
            }

            setUser({ ...u, uid: sUser.id } as UserProfile);
          }
        } else {
          const newUser: UserProfile = {
            uid: sUser.id,
            UID: sUser.id,
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
            kycStatus: 'unverified',
            role: (sUser.email?.trim().toLowerCase() === 'hzhssaadh@gmail.com') ? 'admin' : 'user',
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

    const studioEmail = localStorage.getItem('cm_studio_user_email');

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        fetchUserData(session.user);
      } else if (studioEmail) {
        loginWithStudioEmail(studioEmail).catch(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setLoading(true);
        setSupabaseUser(session.user);
        fetchUserData(session.user);
      } else {
        const activeStudioEmail = localStorage.getItem('cm_studio_user_email');
        if (activeStudioEmail) {
          return;
        }
        setSupabaseUser(null);
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginWithStudioEmail = async (emailInput: string) => {
    setLoading(true);
    try {
      const email = emailInput.trim();
      if (!email) throw new Error("Please enter an email address");

      let u = null;
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email)
        .order('balance', { ascending: false })
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        console.error("User lookup error:", error);
      }
      if (data && data.length > 0) {
        u = data[0];
      }

      if (u) {
        const synthUser: any = {
          id: u.uid || u.UID,
          email: u.email,
          user_metadata: { full_name: u.name, avatar_url: u.photoURL }
        };
        localStorage.setItem('cm_studio_user_email', u.email);
        setSupabaseUser(synthUser);
        setUser({ ...u, uid: u.uid || u.UID });
      } else {
        const newUid = 'stu_' + Date.now() + Math.random().toString(36).substring(2, 8);
        const newUser: UserProfile = {
          uid: newUid,
          UID: newUid,
          name: email.split('@')[0],
          email: email,
          photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
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
          role: (email === 'ms888mf@gmail.com' || email === 'hzhssaadh@gmail.com') ? 'admin' : 'user',
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
        localStorage.setItem('cm_studio_user_email', newUser.email);
        const synthUser: any = {
          id: newUser.uid,
          email: newUser.email,
          user_metadata: { full_name: newUser.name }
        };
        setSupabaseUser(synthUser);
        setUser(newUser);
      }
    } catch (err: any) {
      console.error("Studio login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
      if (isInIframe) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { 
            redirectTo: window.location.origin,
            skipBrowserRedirect: true
          }
        });
        if (error) throw error;
        if (data?.url) {
          const opened = window.open(data.url, '_blank', 'noopener,noreferrer');
          if (!opened) {
            try {
              window.top!.location.href = data.url;
            } catch (e) {
              window.location.href = data.url;
            }
          }
          return;
        }
      }
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
          
          const nextInviterBal = (inviter.balance || 0) + 0.05;
          await supabase.from('users').update({
            referralCount: (inviter.referralCount || 0) + 1,
            balance: nextInviterBal,
            "CM Coins": nextInviterBal,
            cm_coins: nextInviterBal
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
            UID: data.user.id,
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
            role: (email === 'ms888mf@gmail.com' || email === 'hzhssaadh@gmail.com') ? 'admin' : 'user',
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
    localStorage.removeItem('cm_studio_user_email');
    setUser(null);
    setSupabaseUser(null);
    await supabase.auth.signOut();
  };

  const updateUser = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const matchConditions = [];
      const userUid = user.uid || user.UID;
      if (userUid) {
        matchConditions.push(`uid.eq.${userUid}`);
        matchConditions.push(`UID.eq.${userUid}`);
      }
      if (user.email) {
        matchConditions.push(`email.ilike.${user.email}`);
      }

      // If updating KYC fields, save submission payload to settings table
      if (data.kycPhotoUrl || data.kycPaymentProofUrl || data.kycSubmittedAt || data.kycChain || data.kycTxHash) {
        const kycPayload = {
          userId: userUid,
          userEmail: user.email,
          userName: user.name,
          kycPhotoUrl: data.kycPhotoUrl || user.kycPhotoUrl,
          kycPaymentProofUrl: data.kycPaymentProofUrl || user.kycPaymentProofUrl,
          kycChain: data.kycChain || user.kycChain,
          kycTxHash: data.kycTxHash || user.kycTxHash,
          kycSubmittedAt: data.kycSubmittedAt || user.kycSubmittedAt || Date.now(),
          status: data.kycStatus || user.kycStatus || 'pending'
        };
        try {
          localStorage.setItem(`cm_kyc_submission_${userUid}`, JSON.stringify(kycPayload));
          await supabase.from('settings').upsert({
            id: `kyc_${userUid}`,
            adsterraSnippet: JSON.stringify(kycPayload)
          });
        } catch (err) {
          console.warn("Could not save kyc to settings:", err);
        }
      }

      const payload: any = { ...data };
      if (payload.balance !== undefined) {
        payload["CM Coins"] = payload.balance;
        payload.cm_coins = payload.balance;
      }
      if (payload.usdtBalance !== undefined) {
        payload["USDT"] = payload.usdtBalance;
        payload.usdtbalance = payload.usdtBalance;
      }
      if (payload.kycStatus !== undefined) {
        payload.kycstatus = payload.kycStatus;
      }

      // Strip non-existent columns from users table update payload to prevent PostgREST column errors
      delete payload.kycPhotoUrl;
      delete payload.kycPaymentProofUrl;
      delete payload.kycChain;
      delete payload.kycTxHash;
      delete payload.kycSubmittedAt;
      delete payload.kycApprovedAt;
      delete payload.kyc_photo_url;
      delete payload.kyc_payment_proof_url;
      delete payload.kyc_submitted_at;
      delete payload.kyc_tx_hash;

      const { error } = await supabase
        .from('users')
        .update(payload)
        .or(matchConditions.join(','));

      if (error) {
        console.error("Failed to update user in Supabase:", error);
      }
    } catch (err) {
      console.error("Exception while updating user in Supabase:", err);
    }
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const updateLocalUser = (data: Partial<UserProfile>) => {
    if (!user) return;
    
    // Ignore ad watch stats from realtime updates to prevent overwriting local progress
    // if the columns are missing or out of sync in the DB.
    const safeData: any = { ...data };
    if (safeData.balance !== undefined) {
      safeData["CM Coins"] = safeData.balance;
      safeData.cm_coins = safeData.balance;
    }
    if (safeData.usdtBalance !== undefined) {
      safeData["USDT"] = safeData.usdtBalance;
      safeData.usdtbalance = safeData.usdtBalance;
    }
    delete safeData.cmAdsWatchedToday;
    delete safeData.totalCmAdsWatched;
    delete safeData.lastCmAdWatchDate;
    delete safeData.adsWatchedToday;
    delete safeData.totalAdsWatched;
    delete safeData.lastAdWatchDate;

    setUser(prev => prev ? { ...prev, ...safeData } : null);
  };

  const refreshUser = async () => {
    const activeAuthUser = supabaseUser || (user ? ({ id: user.uid, email: user.email } as any) : null);
    if (!activeAuthUser) return;
    try {
      let u = null;
      if (activeAuthUser.email) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .ilike('email', activeAuthUser.email)
          .order('balance', { ascending: false })
          .limit(1);
        if (data && data.length > 0) u = data[0];
      }
      
      if (!u && activeAuthUser.id) {
        const { data } = await supabase.from('users').select('*').eq('uid', activeAuthUser.id).single();
        if (data) u = data;
      }

      if (u) {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const { count: cmCountToday } = await supabase.from('ads_log')
          .select('*', { count: 'exact', head: true })
          .eq('userId', activeAuthUser.id)
          .eq('adNetwork', 'Monetag (CM)')
          .gte('timestamp', startOfDay);

        const { count: cmCountTotal } = await supabase.from('ads_log')
          .select('*', { count: 'exact', head: true })
          .eq('userId', activeAuthUser.id)
          .eq('adNetwork', 'Monetag (CM)');
          
        u.cmAdsWatchedToday = cmCountToday || 0;
        u.totalCmAdsWatched = cmCountTotal || 0;
        
        // Restore from localStorage if higher
        const lsDate = localStorage.getItem(`cmAds_${activeAuthUser.id}_date`);
        const todayStr = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
        
        if (lsDate === todayStr) {
          const lsCount = parseInt(localStorage.getItem(`cmAds_${activeAuthUser.id}_count`) || '0', 10);
          if (lsCount > u.cmAdsWatchedToday) {
             u.cmAdsWatchedToday = lsCount;
          }
        }
        
        const lsTotal = parseInt(localStorage.getItem(`cmAds_${activeAuthUser.id}_total`) || '0', 10);
        if (lsTotal > u.totalCmAdsWatched) {
           u.totalCmAdsWatched = lsTotal;
        }

        u.lastCmAdWatchDate = todayStr;
        u.lastAdWatchDate = todayStr;

        setUser({ ...u, uid: activeAuthUser.id } as UserProfile);
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
        
        const nextInviterBal = (inviter.balance || 0) + 0.05;
        await supabase.from('users').update({
          referralCount: (inviter.referralCount || 0) + 1,
          balance: nextInviterBal,
          "CM Coins": nextInviterBal,
          cm_coins: nextInviterBal
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

        const nextUserBal = (user.balance || 0) + 0.05;
        await supabase.from('users').update({
          referredBy: inviter.uid,
          balance: nextUserBal,
          "CM Coins": nextUserBal,
          cm_coins: nextUserBal
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
      const matchConditions = [`uid.eq.${user.uid}`, `UID.eq.${user.uid}`];
      if (user.email) {
        matchConditions.push(`email.ilike.${user.email}`);
      }

      const claimTime = Date.now();
      const nextBalance = (user.balance || 0) + rewardAmount;

      await supabase.from('users').update({
        lastSquadClaim: claimTime,
        balance: nextBalance,
        "CM Coins": nextBalance,
        cm_coins: nextBalance
      }).or(matchConditions.join(','));
      
      setUser(prev => prev ? {
        ...prev,
        lastSquadClaim: claimTime,
        balance: nextBalance
      } : null);

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
      const matchConditions = [`uid.eq.${user.uid}`, `UID.eq.${user.uid}`];
      if (user.email) {
        matchConditions.push(`email.ilike.${user.email}`);
      }

      const checkInTime = Date.now();
      const nextBalance = (user.balance || 0) + rewardAmount;

      await supabase.from('users').update({
        dailyStreak: newStreak,
        lastCheckIn: checkInTime,
        balance: nextBalance,
        "CM Coins": nextBalance,
        cm_coins: nextBalance
      }).or(matchConditions.join(','));
      
      await supabase.from('transactions').insert([{
        id: 'tx_chk_' + Date.now(),
        type: 'daily_checkin',
        amount: rewardAmount,
        timestamp: checkInTime,
        status: 'completed',
        receiverUid: user.uid,
        senderUid: 'system',
        description: `Daily check-in reward (Day ${dayInCycle})`
      }]);
      
      setUser(prev => prev ? {
        ...prev,
        dailyStreak: newStreak,
        lastCheckIn: checkInTime,
        balance: nextBalance
      } : null);

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
    
    let currentWatched = user.cmAdsWatchedToday || 0;
    if (user.lastCmAdWatchDate !== today) {
      currentWatched = 0;
    }
    
    if (currentWatched >= 40) {
      return { success: false, reward: 0, message: "Daily limit of 40 ads reached.", limitReached: true };
    }
    
    const rewardAmount = 0.01;
    
    try {
      const currentTime = Date.now();
      const timeGapSeconds = user.lastAdWatchTimestamp ? Math.floor((currentTime - user.lastAdWatchTimestamp) / 1000) : null;

      const nextWatched = currentWatched + 1;
      const nextTotalAdsWatched = (user.totalCmAdsWatched || 0) + 1;
      const nextBalance = Number(((user.balance || 0) + rewardAmount).toFixed(4));

      const matchConditions = [`uid.eq.${user.uid}`, `UID.eq.${user.uid}`];
      if (user.email) {
        matchConditions.push(`email.ilike.${user.email}`);
      }

      const txId = `tx_cmad_${user.uid}_${today}_${nextWatched}`;
      const logId = `adlog_cm_${user.uid}_${today}_${nextWatched}`;

      // Insert log & transaction first; if it's already watched/completed, it will fail to insert due to duplicate ID constraint preventing double claims
      const { error: txError } = await supabase.from('transactions').insert([{
        id: txId,
        type: 'ad_reward',
        amount: rewardAmount,
        timestamp: currentTime,
        status: 'completed',
        receiverUid: user.uid,
        senderUid: 'system',
        description: `Watched CM ad #${nextWatched}`
      }]);
      
      if (txError) {
        if (txError.code === '23505') return { success: false, reward: 0, message: "Duplicate reward claim detected." };
        console.error("tx error:", txError);
      }

      const { error: logError } = await supabase.from('ads_log').insert([{
        id: logId,
        userId: user.uid,
        adNetwork: 'Monetag (CM)',
        reward: rewardAmount,
        timestamp: currentTime,
        country: user.country || 'Unknown'
      }]);
      
      if (logError) {
        console.error("ads_log error:", logError);
      }

      let updatePayload: any = {
        balance: nextBalance,
        "CM Coins": nextBalance,
        cm_coins: nextBalance,
        lastCmAdWatchDate: today,
        cmAdsWatchedToday: nextWatched,
        totalCmAdsWatched: nextTotalAdsWatched
      };

      let { error: updateError } = await supabase.from('users').update(updatePayload).or(matchConditions.join(','));
      
      if (updateError) {
        delete updatePayload.totalCmAdsWatched;
        delete updatePayload.cmAdsWatchedToday;
        delete updatePayload.lastCmAdWatchDate;
        const retry = await supabase.from('users').update(updatePayload).or(matchConditions.join(','));
        updateError = retry.error;
      }
      
      if (updateError) throw updateError;
      
      setUser(prev => prev ? {
        ...prev,
        lastCmAdWatchDate: today,
        cmAdsWatchedToday: nextWatched,
        totalCmAdsWatched: nextTotalAdsWatched,
        balance: nextBalance
      } : null);

      localStorage.setItem(`cmAds_${user.uid}_date`, today);
      localStorage.setItem(`cmAds_${user.uid}_count`, nextWatched.toString());
      localStorage.setItem(`cmAds_${user.uid}_total`, nextTotalAdsWatched.toString());

      return { success: true, reward: rewardAmount, message: `You earned ${rewardAmount} CM Coins!` };
    } catch (e: any) {
      console.error("claimAdReward error:", e);
      if (e.code === '23505') {
        return { success: false, reward: 0, message: "Duplicate reward claim detected. You have already completed this ad reward." };
      }
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
    
    if (currentWatched >= 40) {
      return { success: false, reward: 0, message: "Daily limit of 40 ads reached.", limitReached: true };
    }
    
    const nextWatched = currentWatched + 1;
    // Flat 0.001 USDT per ad watched
    const rewardAmount = 0.001;
    
    try {
      const currentTime = Date.now();
      const timeGapSeconds = user.lastAdWatchTimestamp ? Math.floor((currentTime - user.lastAdWatchTimestamp) / 1000) : null;

      const nextTotalAdsWatched = (user.totalAdsWatched || 0) + 1;
      const nextUsdtBalance = Number(((user.usdtBalance || 0) + rewardAmount).toFixed(4));

      const matchConditions = [`uid.eq.${user.uid}`, `UID.eq.${user.uid}`];
      if (user.email) {
        matchConditions.push(`email.ilike.${user.email}`);
      }

      const txId = `tx_usdtad_${user.uid}_${today}_${nextWatched}`;
      const logId = `adlog_usdt_${user.uid}_${today}_${nextWatched}`;

      // Insert log & transaction first; composite ID protects against duplicates at database level
      const { error: txError } = await supabase.from('transactions').insert([{
        id: txId,
        type: 'ad_reward',
        amount: rewardAmount,
        timestamp: currentTime,
        status: 'completed',
        receiverUid: user.uid,
        senderUid: 'system',
        description: `Watched ad #${nextWatched} for USDT`
      }]);
      
      if (txError) {
        if (txError.code === '23505') return { success: false, reward: 0, message: "Duplicate reward claim detected." };
        console.error("tx error:", txError);
      }

      const { error: logError } = await supabase.from('ads_log').insert([{
        id: logId,
        userId: user.uid,
        adNetwork: 'Monetag (USDT)',
        reward: rewardAmount,
        timestamp: currentTime,
        country: user.country || 'Unknown'
      }]);
      
      if (logError) {
        console.error("ads_log error:", logError);
      }

      let updatePayload: any = {
        lastAdWatchDate: today,
        adsWatchedToday: nextWatched,
        totalAdsWatched: nextTotalAdsWatched,
        usdtBalance: nextUsdtBalance,
        "USDT": nextUsdtBalance,
        usdtbalance: nextUsdtBalance
      };

      let { error: updateError } = await supabase.from('users').update(updatePayload).or(matchConditions.join(','));
      
      if (updateError) {
        delete updatePayload.totalAdsWatched;
        delete updatePayload.adsWatchedToday;
        delete updatePayload.lastAdWatchDate;
        const retry = await supabase.from('users').update(updatePayload).or(matchConditions.join(','));
        updateError = retry.error;
      }
      
      if (updateError) throw updateError;
      
      setUser(prev => prev ? {
        ...prev,
        lastAdWatchDate: today,
        adsWatchedToday: nextWatched,
        totalAdsWatched: nextTotalAdsWatched,
        usdtBalance: nextUsdtBalance
      } : null);

      return { success: true, reward: rewardAmount, message: `You earned ${rewardAmount} USDT!` };
    } catch (e: any) {
      console.error("claimUsdtAdReward error:", e);
      if (e.code === '23505') {
        return { success: false, reward: 0, message: "Duplicate reward claim detected. You have already completed this ad reward." };
      }
      return { success: false, reward: 0, message: "Failed to claim ad reward" };
    }
  };

  const requestWithdrawal = async (amount: number, wallet: string) => {
    if (!user) return { success: false, message: "Not logged in" };
    if (user.balance < amount) return { success: false, message: "Insufficient balance" };
    if (amount < 5) return { success: false, message: "Minimum withdrawal is 5" };

    try {
      const nextBal = Number((user.balance - amount).toFixed(4));
      const matchConditions = [`uid.eq.${user.uid}`, `UID.eq.${user.uid}`];
      if (user.email && !user.email.includes('anonymous')) {
        matchConditions.push(`email.ilike.${user.email}`);
      }

      let updatePayload: any = {
        balance: nextBal,
        "CM Coins": nextBal,
        cm_coins: nextBal
      };

      let { error: updateError } = await supabase.from('users').update(updatePayload).or(matchConditions.join(','));
      if (updateError) {
        delete updatePayload["CM Coins"];
        delete updatePayload.cm_coins;
        const retry = await supabase.from('users').update(updatePayload).or(matchConditions.join(','));
        updateError = retry.error;
      }
      if (updateError) {
        console.error("Failed to update user CM balance:", updateError);
        throw updateError;
      }

      const wId = 'w_' + Date.now();
      const txId = 'tx_' + Date.now();
      
      try {
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
      } catch (txErr) {
        console.warn("Non-fatal transaction insert warning:", txErr);
      }

      const { error: wErr } = await supabase.from('withdrawals').insert([{
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
      if (wErr) {
        console.error("CM withdrawal insert error:", wErr);
        // Rollback balance deduction in database
        const rollbackPayload: any = {
          balance: user.balance,
          "CM Coins": user.balance,
          cm_coins: user.balance
        };
        await supabase.from('users').update(rollbackPayload).or(matchConditions.join(','));
        if (wErr.code === '42501' || wErr.message?.includes('security policy') || wErr.message?.includes('permission')) {
          return { success: false, message: "Database Permission Error (RLS). Please ask Admin to run the SQL permissions fix in Admin panel." };
        }
        throw wErr;
      }

      setUser(prev => prev ? {
        ...prev,
        balance: nextBal,
        "CM Coins": nextBal,
        cm_coins: nextBal
      } : null);

      return { success: true, message: "Withdrawal requested successfully!" };
    } catch (e: any) {
      console.error(e);
      return { success: false, message: e.message || "Request failed. Please try again." };
    }
  };

  const requestUsdtWithdrawal = async (amount: number, wallet: string, method?: string) => {
    if (!user) return { success: false, message: "Not logged in" };
    if ((user.usdtBalance || 0) < amount) return { success: false, message: "Insufficient USDT balance" };
    if (amount < 12) return { success: false, message: "Minimum withdrawal is 12 USDT" };

    try {
      const nextUsdtBal = Number(((user.usdtBalance || 0) - amount).toFixed(4));
      const matchConditions = [`uid.eq.${user.uid}`, `UID.eq.${user.uid}`];
      if (user.email && !user.email.includes('anonymous')) {
        matchConditions.push(`email.ilike.${user.email}`);
      }

      let updatePayload: any = {
        usdtBalance: nextUsdtBal,
        "USDT": nextUsdtBal,
        usdtbalance: nextUsdtBal
      };

      let { error: updateError } = await supabase.from('users').update(updatePayload).or(matchConditions.join(','));
      if (updateError) {
        delete updatePayload.USDT;
        delete updatePayload.usdtbalance;
        const retry = await supabase.from('users').update(updatePayload).or(matchConditions.join(','));
        updateError = retry.error;
      }
      if (updateError) {
        console.error("Failed to update user USDT balance:", updateError);
        throw updateError;
      }

      const wId = 'w_usdt_' + Date.now();
      const txId = 'tx_' + Date.now();

      try {
        await supabase.from('transactions').insert([{
          id: txId,
          type: 'withdrawal',
          amount: -amount,
          timestamp: Date.now(),
          status: 'pending',
          receiverUid: 'system',
          senderUid: user.uid,
          description: `USDT Withdrawal request to ${wallet} [${method || 'Binance UID'}]`
        }]);
      } catch (txErr) {
        console.warn("Non-fatal transaction insert warning:", txErr);
      }
      
      const wPayload: any = {
        id: wId,
        userId: user.uid,
        userName: user.name || 'Anonymous',
        userEmail: user.email || 'Unknown',
        amount: amount,
        wallet: `${wallet} [${method || 'Binance UID'}]`,
        method: method || 'TRC20 / Binance UID',
        status: 'pending',
        requestedAt: Date.now(),
        country: user.country || 'Unknown',
        transactionId: txId
      };

      let { error: wErr } = await supabase.from('withdrawals_usdt').insert([wPayload]);
      if (wErr) {
        delete wPayload.method;
        delete wPayload.country;
        delete wPayload.transactionId;
        const retry = await supabase.from('withdrawals_usdt').insert([wPayload]);
        wErr = retry.error;
      }
      if (wErr) {
        console.error("USDT withdrawal insert error:", wErr);
        // Rollback USDT balance in database
        const rollbackPayload: any = {
          usdtBalance: user.usdtBalance || 0,
          "USDT": user.usdtBalance || 0,
          usdtbalance: user.usdtBalance || 0
        };
        await supabase.from('users').update(rollbackPayload).or(matchConditions.join(','));
        if (wErr.code === '42501' || wErr.message?.includes('security policy') || wErr.message?.includes('permission')) {
          return { success: false, message: "Database Permission Error (RLS). Please ask Admin to run the SQL permissions fix in Admin panel." };
        }
        throw wErr;
      }

      setUser(prev => prev ? {
        ...prev,
        usdtBalance: nextUsdtBal,
        USDT: nextUsdtBal,
        usdtbalance: nextUsdtBal
      } : null);

      return { success: true, message: "USDT Withdrawal requested successfully!" };
    } catch (e: any) {
      console.error(e);
      return { success: false, message: e.message || "Request failed. Please try again." };
    }
  };

  const startMining = async () => {
    if (!user) return { success: false, message: "Please log in to start mining." };
    const now = Date.now();
    if (user.miningSessionEndTime && user.miningSessionEndTime > now) {
      return { success: false, message: "Mining is currently active!" };
    }
    const sessionEndTime = now + 12 * 60 * 60 * 1000;
    try {
      await updateUser({
        miningSessionStartTime: now,
        miningSessionEndTime: sessionEndTime
      });
      return { success: true, message: "12-Hour Mining Started! Keep earning CM coins." };
    } catch (e: any) {
      return { success: false, message: e.message || "Failed to start mining" };
    }
  };

  const claimMiningReward = async () => {
    if (!user) return { success: false, message: "Please log in to claim mining reward." };
    const now = Date.now();
    if (user.miningSessionEndTime && user.miningSessionEndTime > now) {
      return { success: false, message: "Mining session is still active!" };
    }
    const rewardAmount = 0.50;
    const nextBal = Number(((user.balance || 0) + rewardAmount).toFixed(4));
    try {
      await updateUser({
        balance: nextBal,
        miningSessionStartTime: null,
        miningSessionEndTime: null,
        totalMined: Number(((user.totalMined || 0) + rewardAmount).toFixed(4))
      });
      return { success: true, message: `Successfully claimed +${rewardAmount} CM Coins!` };
    } catch (e: any) {
      return { success: false, message: e.message || "Failed to claim reward" };
    }
  };

  const sendCryptoTransfer = async (
    recipientInput: string,
    amount: number,
    asset: 'CM' | 'USDT' = 'CM'
  ): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: "Please log in to transfer assets." };

    // Enforce CM Coin only as required
    if (asset === 'USDT') {
      return { success: false, message: "Transfers are exclusively enabled for CM Coin. USDT transfers are disabled." };
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return { success: false, message: "Please enter a valid amount." };
    }

    const currentBal = user.balance || 0;
    if (currentBal < numAmount) {
      return { success: false, message: `Insufficient CM Coin balance. You currently have ${currentBal.toFixed(2)} CM.` };
    }

    // Transfer limit: 10%
    const maxAllowed = Number((currentBal * 0.10).toFixed(4));
    if (user.role !== 'admin' && numAmount > maxAllowed + 0.0001) {
      return { success: false, message: `Transfer limit exceeded: Maximum 10% of CM balance (${maxAllowed.toFixed(2)} CM) allowed per transfer.` };
    }

    const trimmed = (recipientInput || '').trim().replace(/^["']|["']$/g, '');
    if (!trimmed) {
      return { success: false, message: "Please enter a recipient CM User UID, wallet address, or email." };
    }

    // Compute sender's own derived address for self-check
    const senderDerivedAddr = `0x${(user.uid || '').replace(/[^a-fA-F0-9]/g, '').padEnd(40, '7a9c').substring(0, 40)}`.toLowerCase();

    // Prevent transferring to self
    const isSelf = 
      trimmed.toLowerCase() === user.uid.toLowerCase() ||
      trimmed.toLowerCase() === senderDerivedAddr ||
      (user.email && trimmed.toLowerCase() === user.email.toLowerCase()) ||
      (user.walletAddress && trimmed.toLowerCase() === user.walletAddress.toLowerCase()) ||
      (user.referralCode && trimmed.toUpperCase() === user.referralCode.toUpperCase());

    if (isSelf) {
      return { success: false, message: "You cannot transfer CM Coins to your own account." };
    }

    try {
      // 1. Look up recipient in Supabase database
      let recipientUser: any = null;
      const cleanHex = trimmed.replace(/^0x/i, '').trim().toLowerCase();
      const isHexAddress = /^0x[0-9a-fA-F]{30,64}$/i.test(trimmed) || /^[0-9a-fA-F]{32,64}$/i.test(trimmed);

      // A. Match by direct UID (hyphenated UUID or alphanumeric)
      try {
        const { data: uidMatch } = await supabase
          .from('users')
          .select('*')
          .or(`uid.eq.${trimmed},UID.eq.${trimmed}`)
          .maybeSingle();
        if (uidMatch) recipientUser = uidMatch;
      } catch (e) {}

      // B. Match by Email
      if (!recipientUser && trimmed.includes('@')) {
        try {
          const { data: emailMatch } = await supabase
            .from('users')
            .select('*')
            .ilike('email', trimmed)
            .maybeSingle();
          if (emailMatch) recipientUser = emailMatch;
        } catch (e) {}
      }

      // C. Match by Referral Code
      if (!recipientUser && trimmed.length <= 16 && !trimmed.startsWith('0x')) {
        try {
          const { data: refMatch } = await supabase
            .from('users')
            .select('*')
            .ilike('referralCode', trimmed)
            .maybeSingle();
          if (refMatch) recipientUser = refMatch;
        } catch (e) {}
      }

      // D. Match by Web3 / BEP-20 Wallet Address
      if (!recipientUser && isHexAddress) {
        // 1. Reconstruct UUID from the 32 hex character prefix (covers ~10,000 users instantly)
        if (cleanHex.length >= 32) {
          const hex32 = cleanHex.slice(0, 32);
          const candidateUuid = `${hex32.slice(0, 8)}-${hex32.slice(8, 12)}-${hex32.slice(12, 16)}-${hex32.slice(16, 20)}-${hex32.slice(20, 32)}`;
          try {
            const { data: reconstructedMatch } = await supabase
              .from('users')
              .select('*')
              .or(`uid.eq.${candidateUuid},UID.eq.${candidateUuid}`)
              .maybeSingle();
            if (reconstructedMatch) recipientUser = reconstructedMatch;
          } catch (e) {}
        }

        // 2. Check non-hyphenated users (Firebase UIDs, only ~450 records in DB)
        if (!recipientUser) {
          try {
            const { data: nonHyphenated } = await supabase
              .from('users')
              .select('*')
              .not('uid', 'like', '%-%');
            if (nonHyphenated && nonHyphenated.length > 0) {
              const targetPadded = ('0x' + cleanHex.padEnd(40, '7a9c').substring(0, 40)).toLowerCase();
              const found = nonHyphenated.find(u => {
                const uUid = u.uid || u.UID || '';
                const derived = `0x${uUid.replace(/[^a-fA-F0-9]/g, '').padEnd(40, '7a9c').substring(0, 40)}`.toLowerCase();
                return derived === targetPadded || derived === trimmed.toLowerCase();
              });
              if (found) recipientUser = found;
            }
          } catch (e) {}
        }
      }

      // Prevent transfer if found user is self
      if (recipientUser && (recipientUser.uid === user.uid || (recipientUser.email && user.email && recipientUser.email.toLowerCase() === user.email.toLowerCase()))) {
        return { success: false, message: "You cannot transfer CM Coins to your own account." };
      }

      const txId = `tx_send_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const txHash = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');

      // =========================================================================
      // CASE 1: INTERNAL RECIPIENT USER FOUND (On CM Network)
      // =========================================================================
      if (recipientUser) {
        const recTargetUid = recipientUser.uid || recipientUser.UID;

        // Credit Recipient User
        const recCurrentBal = Number(recipientUser.balance || recipientUser['CM Coins'] || recipientUser.cm_coins || 0);
        const recNewBal = Number((recCurrentBal + numAmount).toFixed(4));

        try {
          const { error: recErr } = await supabase.from('users').update({
            balance: recNewBal,
            "CM Coins": recNewBal,
            cm_coins: recNewBal
          }).eq('uid', recTargetUid);

          if (recErr) {
            await supabase.from('users').update({ balance: recNewBal }).eq('uid', recTargetUid);
          }
        } catch (e) {
          await supabase.from('users').update({ balance: recNewBal }).eq('uid', recTargetUid);
        }

        // Log incoming transaction for recipient
        try {
          await supabase.from('transactions').insert([{
            id: `tx_rcv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            type: 'transfer_received',
            amount: numAmount,
            timestamp: Date.now(),
            status: 'completed',
            receiverUid: recTargetUid,
            senderUid: user.uid,
            description: `Received ${numAmount} CM Coins from ${user.name || user.email || user.uid.substring(0, 8)}`
          }]);
        } catch (e) {
          console.warn("Receiver transaction log warning:", e);
        }

        // Update recipient's local history cache if same device/browser
        try {
          const recHistory = JSON.parse(localStorage.getItem(`cm_tx_${recTargetUid}`) || '[]');
          recHistory.unshift({
            id: `tx_rcv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            type: 'receive',
            asset: 'CM',
            amount: numAmount,
            recipient: `From ${user.name || user.email || user.uid.substring(0, 8)}`,
            timestamp: Date.now(),
            status: 'Completed',
            hash: txHash
          });
          localStorage.setItem(`cm_tx_${recTargetUid}`, JSON.stringify(recHistory.slice(0, 50)));
        } catch (e) {}

        // Debit Sender
        const senderNewBal = Number(((user.balance || 0) - numAmount).toFixed(4));
        try {
          const { error: debitErr } = await supabase.from('users').update({
            balance: senderNewBal,
            "CM Coins": senderNewBal,
            cm_coins: senderNewBal
          }).eq('uid', user.uid);

          if (debitErr) {
            await supabase.from('users').update({ balance: senderNewBal }).eq('uid', user.uid);
          }
        } catch (e) {
          await supabase.from('users').update({ balance: senderNewBal }).eq('uid', user.uid);
        }

        // Update React user state immediately
        setUser(prev => prev ? {
          ...prev,
          balance: senderNewBal,
          "CM Coins": senderNewBal,
          cm_coins: senderNewBal
        } as any : null);

        // Record Outgoing Transaction for Sender
        try {
          await supabase.from('transactions').insert([{
            id: txId,
            type: 'transfer_sent',
            amount: -numAmount,
            timestamp: Date.now(),
            status: 'completed',
            receiverUid: recTargetUid,
            senderUid: user.uid,
            description: `Sent ${numAmount} CM Coins to ${recipientUser.name || recipientUser.email || recTargetUid.substring(0, 8)}`
          }]);
        } catch (e) {
          console.warn("Sender transaction log warning:", e);
        }

        const displayRecipient = recipientUser.name 
          ? `${recipientUser.name} (${recipientUser.email || recTargetUid.substring(0, 8)})` 
          : (recipientUser.email || (trimmed.startsWith('0x') ? `${trimmed.substring(0, 10)}...${trimmed.substring(trimmed.length - 6)}` : trimmed));

        const localTx = {
          id: txId,
          type: 'send',
          asset: 'CM',
          amount: numAmount,
          recipient: displayRecipient,
          timestamp: Date.now(),
          status: 'Completed',
          hash: txHash
        };
        const existingHistory = JSON.parse(localStorage.getItem(`cm_tx_${user.uid}`) || '[]');
        localStorage.setItem(`cm_tx_${user.uid}`, JSON.stringify([localTx, ...existingHistory].slice(0, 50)));

        return { 
          success: true, 
          message: `Successfully sent ${numAmount} CM Coins to ${displayRecipient}!` 
        };
      }

      // =========================================================================
      // CASE 2: EXTERNAL BEP-20 WALLET ADDRESS (e.g. MetaMask / TrustWallet)
      // =========================================================================
      const isValidExternalBep20 = /^0x[a-fA-F0-9]{40}$/i.test(trimmed) || /^[a-fA-F0-9]{40}$/i.test(trimmed);
      if (isValidExternalBep20) {
        const formattedAddress = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`;

        // Debit Sender
        const senderNewBal = Number(((user.balance || 0) - numAmount).toFixed(4));
        try {
          const { error: debitErr } = await supabase.from('users').update({
            balance: senderNewBal,
            "CM Coins": senderNewBal,
            cm_coins: senderNewBal
          }).eq('uid', user.uid);

          if (debitErr) {
            await supabase.from('users').update({ balance: senderNewBal }).eq('uid', user.uid);
          }
        } catch (e) {
          await supabase.from('users').update({ balance: senderNewBal }).eq('uid', user.uid);
        }

        // Update React user state immediately
        setUser(prev => prev ? {
          ...prev,
          balance: senderNewBal,
          "CM Coins": senderNewBal,
          cm_coins: senderNewBal
        } as any : null);

        // Record Outgoing Transaction
        try {
          await supabase.from('transactions').insert([{
            id: txId,
            type: 'transfer_sent',
            amount: -numAmount,
            timestamp: Date.now(),
            status: 'completed',
            receiverUid: formattedAddress,
            senderUid: user.uid,
            description: `Sent ${numAmount} CM Coins to BEP-20 address ${formattedAddress}`
          }]);
        } catch (e) {
          console.warn("External transfer log warning:", e);
        }

        const localTx = {
          id: txId,
          type: 'send',
          asset: 'CM',
          amount: numAmount,
          recipient: `${formattedAddress.substring(0, 8)}...${formattedAddress.substring(formattedAddress.length - 6)} (BEP-20)`,
          timestamp: Date.now(),
          status: 'Completed',
          hash: txHash
        };
        const existingHistory = JSON.parse(localStorage.getItem(`cm_tx_${user.uid}`) || '[]');
        localStorage.setItem(`cm_tx_${user.uid}`, JSON.stringify([localTx, ...existingHistory].slice(0, 50)));

        return {
          success: true,
          message: `Successfully transferred ${numAmount} CM Coins to ${formattedAddress.substring(0, 8)}...${formattedAddress.substring(formattedAddress.length - 6)}!`
        };
      }

      // Neither internal user nor valid BEP-20 address
      return { 
        success: false, 
        message: "Recipient not found! Please check the recipient CM UID, wallet address, or registered email." 
      };
    } catch (err: any) {
      console.error("sendCryptoTransfer exception:", err);
      return { success: false, message: err?.message || "Transfer failed. Please check your connection and try again." };
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
      loginWithStudioEmail,
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
      startMining,
      claimMiningReward,
      sendCryptoTransfer,
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
