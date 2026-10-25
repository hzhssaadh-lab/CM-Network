import { useApp } from '../hooks/useAppStore';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { UserProfile, Task as AppTask, TaskClaim } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';

import { 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  ExternalLink, 
  Cpu, 
  Check, 
  X, 
  Users, 
  AlertCircle, 
  Copy, 
  ZoomIn, 
  RefreshCw,
  Sparkles,
  Lock
} from 'lucide-react';
import { ALLOWED_ADMIN_EMAILS, ADMIN_SECRET_PASSWORD } from '../components/AdminSecretModal';

export function Admin() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [totalUsersCount, setTotalUsersCount] = useState<number>(0);
  const [tasks, setTasks] = useState<AppTask[]>([]);
  const [claims, setClaims] = useState<TaskClaim[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [usdtWithdrawals, setUsdtWithdrawals] = useState<any[]>([]);
  const [adLogs, setAdLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'usdt_holders' | 'kyc' | 'nodes' | 'referrals' | 'tasks' | 'approvals' | 'ads' | 'ad_logs' | 'withdrawals' | 'competition' | 'config' | 'all_data'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [globalStats, setGlobalStats] = useState({ totalBalance: 0, totalMined: 0, totalUsdtBalance: 0 });
  const [directPassword, setDirectPassword] = useState('');
  const [directError, setDirectError] = useState('');
  const [isUnlockedState, setIsUnlockedState] = useState(() => {
    return sessionStorage.getItem('cm_admin_unlocked') === 'true';
  });

  // KYC Section State
  const [kycSearchQuery, setKycSearchQuery] = useState('');
  const [kycFilterStatus, setKycFilterStatus] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [selectedProofModal, setSelectedProofModal] = useState<{ title: string; imageUrl: string; user?: UserProfile } | null>(null);

  // Node Applications State
  const [nodeSearchQuery, setNodeSearchQuery] = useState('');
  const [nodeFilterStatus, setNodeFilterStatus] = useState<'all' | 'applied' | 'approved' | 'rejected'>('applied');

  // Referrals Network State
  const [referralSearchQuery, setReferralSearchQuery] = useState('');
  const [referralPhaseFilter, setReferralPhaseFilter] = useState<'all' | 'phase1' | 'phase2'>('all');
  const [referralKycFilter, setReferralKycFilter] = useState<'all' | 'verified' | 'pending'>('all');

  // USDT Holders Section State
  const [usdtHolders, setUsdtHolders] = useState<UserProfile[]>([]);
  const [loadingUsdtHolders, setLoadingUsdtHolders] = useState(false);
  const [usdtMinFilter, setUsdtMinFilter] = useState<'all' | 'above_5' | 'above_0'>('all');
  const [usdtSearchQuery, setUsdtSearchQuery] = useState('');

  // Edit User State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [editUsdtBalance, setEditUsdtBalance] = useState('');
  const [editMiningRate, setEditMiningRate] = useState('');
  const [editKycStatus, setEditKycStatus] = useState<string>('unverified');
  const [editNodeStatus, setEditNodeStatus] = useState<string>('none');

  const hasUserSubmittedKyc = (u: any) => {
    return Boolean(
      u?.kycPhotoUrl || 
      u?.kycPaymentProofUrl || 
      u?.kycSubmittedAt || 
      u?.kycTxHash || 
      u?.kyc_photo_url || 
      u?.kyc_payment_proof_url || 
      u?.kyc_submitted_at || 
      u?.kyc_tx_hash
    );
  };

  // Edit Task State
  const [editingTask, setEditingTask] = useState<AppTask | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskReward, setTaskReward] = useState('');
  const [taskType, setTaskType] = useState<AppTask['type']>('daily');
  const [taskUrl, setTaskUrl] = useState('');
  const [taskAutoApprove, setTaskAutoApprove] = useState(false);

  // Ads Settings State
  const [showAds, setShowAds] = useState(false);
  const [adsterraSnippet, setAdsterraSnippet] = useState('');
  const [admobBannerId, setAdmobBannerId] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
      fetchGlobalStats();
      fetchAdsSettings();
      fetchAppSettings();
      fetchUsdtHolders();
    }
  }, [user]);

  const fetchUsdtHolders = async () => {
    setLoadingUsdtHolders(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('usdtBalance', { ascending: false, nullsFirst: false })
        .limit(3000);
      
      if (data) {
        const sorted = (data as UserProfile[]).sort((a, b) => {
          const balA = Number(a.usdtBalance ?? (a as any).USDT ?? (a as any).usdtbalance ?? 0);
          const balB = Number(b.usdtBalance ?? (b as any).USDT ?? (b as any).usdtbalance ?? 0);
          return balB - balA;
        });
        setUsdtHolders(sorted);
      }
    } catch (err) {
      console.error("Error fetching USDT holders:", err);
      toast.error("Failed to fetch USDT holders");
    } finally {
      setLoadingUsdtHolders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'usdt_holders' && usdtHolders.length === 0 && !loadingUsdtHolders) {
      fetchUsdtHolders();
    }
  }, [activeTab]);

  const fetchGlobalStats = async () => {
    try {
      let fetched = 0;
      let totalBalance = 0;
      let totalMined = 0;
      let totalUsdtBalance = 0;
      
      while(true) {
        const { data, error } = await supabase.from('users').select('balance, totalMined, usdtBalance').range(fetched, fetched + 999);
        if (!data || data.length === 0) break;
        
        for(const d of data) {
           totalBalance += d.balance || 0;
           totalMined += d.totalMined || 0;
           totalUsdtBalance += d.usdtBalance || 0;
        }
        
        fetched += data.length;
        if (data.length < 1000) break;
      }
      setGlobalStats({ totalBalance, totalMined, totalUsdtBalance });
    } catch (e) {
      console.error("Failed to load global stats", e);
    }
  };

  const fetchAppSettings = async () => {
    try {
      const { data } = await supabase.from('settings').select('*').eq('id', 'app').single();
      if (data) setMaintenanceMode(data.maintenanceMode === true);
    } catch (e) {
      console.error("Failed to load app settings", e);
    }
  };

  const saveMaintenanceMode = async (newMode: boolean) => {
    try {
      const maintenanceUntil = newMode ? Date.now() + (2 * 60 * 60 * 1000) : null;
      const { error } = await supabase.from('settings').upsert({ 
        id: 'app', 
        maintenanceMode: newMode,
        maintenanceUntil: maintenanceUntil
      });
      if (error && error.code === '42501') {
         alert("Cannot save maintenance mode due to database permissions.");
         return;
      }
      setMaintenanceMode(newMode);
      if (newMode) {
        localStorage.setItem('cm_maintenance_until', maintenanceUntil!.toString());
        localStorage.setItem('cm_maintenance_mode', 'true');
        toast.success("2-Hour Maintenance Mode activated!");
      } else {
        localStorage.removeItem('cm_maintenance_until');
        localStorage.setItem('cm_maintenance_mode', 'false');
        toast.success("Maintenance Mode deactivated! App is live.");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving maintenance mode.");
    }
  };

  const fetchAdsSettings = async () => {
    try {
      const { data } = await supabase.from('settings').select('*').eq('id', 'ads').single();
      if (data) {
        setShowAds(data.showAds || false);
        setAdsterraSnippet(data.adsterraSnippet || '');
        setAdmobBannerId(data.admobBannerId || '');
      }
    } catch (e) {
      console.error("Failed to load ad settings", e);
    }
  };

  const saveAdsSettings = async () => {
    try {
      await supabase.from('settings').upsert({
        id: 'ads',
        showAds,
        adsterraSnippet,
        admobBannerId
      });
      alert("Ad settings saved! Changes will take effect immediately.");
    } catch (error) {
      console.error(error);
      alert("Error saving properties.");
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    
    // Don't trigger if it's the initial load and searchQuery is empty
    if (!searchQuery && users.length > 0) return;

    const timeoutId = setTimeout(async () => {
      const query = searchQuery.trim();
      if (!query) {
        const { data: userData } = await supabase.from('users').select('*').order('joinDate', { ascending: false, nullsFirst: false }).limit(2000);
        if (userData) setUsers(userData as UserProfile[]);
        return;
      }
      
      try {
        let orConditions = [
          `name.ilike.%${query}%`,
          `email.ilike.%${query}%`,
          `referralCode.ilike.%${query}%`,
          `country.ilike.%${query}%`
        ];
        
        // If search looks like a uuid
        if (query.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          orConditions.push(`uid.eq.${query}`);
        }
        
        const { data } = await supabase
          .from('users')
          .select('*')
          .or(orConditions.join(','))
          .limit(200);
          
        if (data) {
          const cleaned = (data as UserProfile[]).map(u => {
            const isExplicitlyApproved = u.kycStatus === 'verified' && Boolean((u as any).kycApprovedAt || (u as any).kyc_approved_at);
            const hasSubmission = hasUserSubmittedKyc(u);

            if (isExplicitlyApproved) {
              return { ...u, kycStatus: 'verified' as any };
            }
            if (hasSubmission && (u.kycStatus === 'pending' || !u.kycStatus)) {
              return { ...u, kycStatus: 'pending' as any };
            }
            if (hasSubmission && u.kycStatus === 'rejected') {
              return { ...u, kycStatus: 'rejected' as any };
            }
            return { ...u, kycStatus: 'unverified' as any };
          });
          setUsers(cleaned);
        }
      } catch (err) {
        console.error("Search error", err);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, user]);

  const fetchData = async () => {
    try {
      // Fetch all KYC submissions stored in settings table
      const { data: kycSettings } = await supabase.from('settings').select('*').like('id', 'kyc_%');
      const kycMap = new Map<string, any>();
      if (kycSettings) {
        for (const r of kycSettings) {
          try {
            const parsed = JSON.parse(r.adsterraSnippet || '{}');
            const uid = r.id.replace('kyc_', '');
            kycMap.set(uid, parsed);
            if (parsed.userEmail) {
              kycMap.set(parsed.userEmail.trim().toLowerCase(), parsed);
            }
          } catch (e) {}
        }
      }

      const { data: userData } = await supabase.from('users').select('*').order('joinDate', { ascending: false, nullsFirst: false }).limit(2000);
      if (userData) {
        const cleaned = (userData as UserProfile[]).map(u => {
          const kycInfo = kycMap.get(u.uid) || kycMap.get(u.UID) || kycMap.get(u.email?.trim().toLowerCase());
          if (kycInfo) {
            u.kycPhotoUrl = kycInfo.kycPhotoUrl || kycInfo.selfie;
            u.kycPaymentProofUrl = kycInfo.kycPaymentProofUrl || kycInfo.proof;
            u.kycChain = kycInfo.kycChain || kycInfo.chain;
            u.kycTxHash = kycInfo.kycTxHash || kycInfo.txHash;
            u.kycSubmittedAt = kycInfo.kycSubmittedAt || kycInfo.submittedAt;
            if (kycInfo.status === 'verified') {
              u.kycStatus = 'verified' as any;
              (u as any).kycApprovedAt = kycInfo.approvedAt || Date.now();
            } else if (kycInfo.status === 'rejected') {
              u.kycStatus = 'rejected' as any;
            } else if (u.kycStatus !== 'verified') {
              u.kycStatus = 'pending' as any;
            }
          }

          const isExplicitlyApproved = u.kycStatus === 'verified' && Boolean((u as any).kycApprovedAt || (u as any).kyc_approved_at || kycInfo?.status === 'verified');
          const hasSubmission = hasUserSubmittedKyc(u);

          if (isExplicitlyApproved) {
            return { ...u, kycStatus: 'verified' as any };
          }
          if (hasSubmission && (u.kycStatus === 'pending' || !u.kycStatus || u.kycStatus === 'unverified')) {
            return { ...u, kycStatus: 'pending' as any };
          }
          if (hasSubmission && u.kycStatus === 'rejected') {
            return { ...u, kycStatus: 'rejected' as any };
          }
          return { ...u, kycStatus: (u.kycStatus === 'verified' ? 'verified' : 'unverified') as any };
        });
        setUsers(cleaned);
      }

      const { count: uCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      if (uCount !== null) setTotalUsersCount(uCount);

      const { data: tasksData } = await supabase.from('tasks').select('*').limit(200);
      if (tasksData) setTasks(tasksData);

      const { data: claimsData } = await supabase.from('taskClaims').select('*').order('timestamp', { ascending: false }).limit(2000);
      if (claimsData) {
        setClaims(claimsData.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
      }

      const { data: wData } = await supabase.from('withdrawals').select('*').order('requestedAt', { ascending: false }).limit(2000);
      if (wData) {
        setWithdrawals(wData.sort((a, b) => (b.requestedAt || 0) - (a.requestedAt || 0)));
      }

      const { data: wuData } = await supabase.from('withdrawals_usdt').select('*').order('requestedAt', { ascending: false }).limit(2000);
      if (wuData) {
        setUsdtWithdrawals(wuData.map(w => ({ ...w, currency: 'USDT' })).sort((a, b) => (b.requestedAt || 0) - (a.requestedAt || 0)));
      }

      // Auto-restore any pending withdrawal requests from transaction logs if they failed to insert into withdrawals_usdt
      syncMissingWithdrawals(true);

      const { data: adLogData } = await supabase.from('ads_log').select('*').order('timestamp', { ascending: false }).limit(1000);
      if (adLogData) {
        setAdLogs(adLogData.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      const newBal = parseFloat(editBalance) || 0;
      const newUsdt = parseFloat(editUsdtBalance) || 0;
      await supabase.from('users').update({
        balance: newBal,
        "CM Coins": newBal,
        cm_coins: newBal,
        usdtBalance: newUsdt,
        "USDT": newUsdt,
        usdtbalance: newUsdt,
        miningRate: parseFloat(editMiningRate) || 0,
        kycStatus: editKycStatus as any,
        nodeStatus: editNodeStatus as any,
      }).eq('uid', editingUser.uid);
      setEditingUser(null);
      fetchData();
      fetchUsdtHolders();
      toast.success("User updated successfully!");
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to update user: " + e.message);
    }
  };

  const handleApproveKyc = async (targetUser: UserProfile) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('users').update({
        kycStatus: 'verified',
        kycstatus: 'verified'
      }).eq('uid', targetUser.uid);
      if (error) throw error;

      // Update in settings table
      const kycInfo = (targetUser as any);
      await supabase.from('settings').upsert({
        id: `kyc_${targetUser.uid}`,
        adsterraSnippet: JSON.stringify({
          userId: targetUser.uid,
          userEmail: targetUser.email,
          userName: targetUser.name,
          kycPhotoUrl: kycInfo.kycPhotoUrl,
          kycPaymentProofUrl: kycInfo.kycPaymentProofUrl,
          kycChain: kycInfo.kycChain,
          kycTxHash: kycInfo.kycTxHash,
          kycSubmittedAt: kycInfo.kycSubmittedAt || Date.now(),
          status: 'verified',
          approvedAt: Date.now()
        })
      });

      await supabase.from('transactions').insert([{
        id: 'tx_kyc_' + Date.now(),
        type: 'kyc_verified',
        amount: 0,
        timestamp: Date.now(),
        status: 'completed',
        receiverUid: targetUser.uid,
        senderUid: 'system',
        description: 'Identity KYC verified by protocol administrator'
      }]);

      setUsers(prev => prev.map(u => u.uid === targetUser.uid ? { ...u, kycStatus: 'verified', kycApprovedAt: Date.now() } : u));
      toast.success(`KYC Approved for ${targetUser.name || targetUser.email || targetUser.uid}!`);
      await fetchData();
    } catch (e: any) {
      console.error("KYC approve error:", e);
      toast.error(`Error approving KYC: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectKyc = async (targetUser: UserProfile) => {
    const reason = window.prompt("Enter rejection reason (optional):", "Unclear camera selfie or fee verification failed");
    if (reason === null) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('users').update({
        kycStatus: 'rejected',
        kycstatus: 'rejected'
      }).eq('uid', targetUser.uid);
      if (error) throw error;

      const kycInfo = (targetUser as any);
      await supabase.from('settings').upsert({
        id: `kyc_${targetUser.uid}`,
        adsterraSnippet: JSON.stringify({
          userId: targetUser.uid,
          userEmail: targetUser.email,
          userName: targetUser.name,
          kycPhotoUrl: kycInfo.kycPhotoUrl,
          kycPaymentProofUrl: kycInfo.kycPaymentProofUrl,
          kycChain: kycInfo.kycChain,
          kycTxHash: kycInfo.kycTxHash,
          kycSubmittedAt: kycInfo.kycSubmittedAt,
          status: 'rejected',
          rejectionReason: reason,
          rejectedAt: Date.now()
        })
      });

      setUsers(prev => prev.map(u => u.uid === targetUser.uid ? { ...u, kycStatus: 'rejected' } : u));
      toast.success(`KYC Rejected for ${targetUser.name || targetUser.email || targetUser.uid}.`);
      await fetchData();
    } catch (e: any) {
      console.error("KYC reject error:", e);
      toast.error(`Error rejecting KYC: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetKyc = async (targetUser: UserProfile) => {
    if (!window.confirm(`Reset KYC for ${targetUser.name || targetUser.email} back to unverified?`)) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('users').update({
        kycStatus: 'unverified',
        kycstatus: 'unverified'
      }).eq('uid', targetUser.uid);
      if (error) throw error;

      await supabase.from('settings').delete().eq('id', `kyc_${targetUser.uid}`);
      setUsers(prev => prev.map(u => u.uid === targetUser.uid ? { ...u, kycStatus: 'unverified', kycPhotoUrl: undefined, kycPaymentProofUrl: undefined } : u));
      toast.success(`KYC status reset to unverified.`);
      await fetchData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetAllUsersKyc = async () => {
    if (!window.confirm("RESET ALL USERS: Are you sure you want to reset EVERY user's KYC status to UNVERIFIED in the database?\n\nAll users will have to apply for KYC, and you can approve or reject them here.")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('users').update({
        kycStatus: 'unverified'
      }).neq('kycStatus', 'unverified');
      if (error) throw error;
      setUsers(prev => prev.map(u => ({ ...u, kycStatus: 'unverified' })));
      toast.success("All users' KYC status reset to UNVERIFIED! Users must now apply and wait for your approval.");
      await fetchData();
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to reset all users: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveNode = async (targetUser: UserProfile) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('users').update({
        nodeStatus: 'approved'
      }).eq('uid', targetUser.uid);
      if (error) throw error;

      await supabase.from('transactions').insert([{
        id: 'tx_node_' + Date.now(),
        type: 'node_activated',
        amount: 0,
        timestamp: Date.now(),
        status: 'completed',
        receiverUid: targetUser.uid,
        senderUid: 'system',
        description: 'Validator Node license granted. P2P Escrow unlocked.'
      }]);

      setUsers(prev => prev.map(u => u.uid === targetUser.uid ? { ...u, nodeStatus: 'approved' } : u));
      toast.success(`Node approved for ${targetUser.name || targetUser.email}! P2P trading unlocked.`);
    } catch (e: any) {
      console.error("Node approve error:", e);
      toast.error(`Error approving Node: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectNode = async (targetUser: UserProfile) => {
    const reason = window.prompt("Enter rejection reason (optional):", "Referral criteria (140+ with KYC verified) not met");
    if (reason === null) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('users').update({
        nodeStatus: 'rejected'
      }).eq('uid', targetUser.uid);
      if (error) throw error;

      setUsers(prev => prev.map(u => u.uid === targetUser.uid ? { ...u, nodeStatus: 'rejected' } : u));
      toast.success(`Node application rejected for ${targetUser.name || targetUser.email}.`);
    } catch (e: any) {
      console.error("Node reject error:", e);
      toast.error(`Error rejecting Node: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeNode = async (targetUser: UserProfile) => {
    if (!window.confirm(`Revoke Node license for ${targetUser.name || targetUser.email}?`)) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('users').update({
        nodeStatus: 'none'
      }).eq('uid', targetUser.uid);
      if (error) throw error;
      setUsers(prev => prev.map(u => u.uid === targetUser.uid ? { ...u, nodeStatus: 'none' } : u));
      toast.success(`Node status revoked.`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAllUserCoins = async () => {
    setLoading(true);
    toast.loading("Scanning and protecting all user balances in database...");
    try {
      let offset = 0;
      let totalSynced = 0;
      while (true) {
        const { data: users, error } = await supabase.from('users').select('uid, email, balance, "CM Coins", cm_coins, usdtBalance, "USDT", usdtbalance').range(offset, offset + 999);
        if (error || !users || users.length === 0) break;
        
        for (const u of users) {
          const maxCm = Math.max(Number(u.balance || 0), Number(u['CM Coins'] || 0), Number(u.cm_coins || 0));
          const maxUsdt = Math.max(Number(u.usdtBalance || 0), Number(u['USDT'] || 0), Number(u.usdtbalance || 0));
          
          const cmDiff = Math.abs(maxCm - Number(u.balance || 0)) > 1e-6 || Math.abs(maxCm - Number(u['CM Coins'] || 0)) > 1e-6 || Math.abs(maxCm - Number(u.cm_coins || 0)) > 1e-6;
          const usdtDiff = Math.abs(maxUsdt - Number(u.usdtBalance || 0)) > 1e-6 || Math.abs(maxUsdt - Number(u['USDT'] || 0)) > 1e-6 || Math.abs(maxUsdt - Number(u.usdtbalance || 0)) > 1e-6;
          
          if (cmDiff || usdtDiff) {
            await supabase.from('users').update({
              balance: maxCm,
              'CM Coins': maxCm,
              cm_coins: maxCm,
              usdtBalance: maxUsdt,
              'USDT': maxUsdt,
              usdtbalance: maxUsdt
            }).eq('uid', u.uid);
            totalSynced++;
          }
        }
        if (users.length < 1000) break;
        offset += 1000;
      }
      toast.dismiss();
      toast.success(`Successfully scanned database! Protected & synced coin balances for ${totalSynced} users.`);
      fetchData();
    } catch (err: any) {
      toast.dismiss();
      toast.error("Error syncing user balances: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  async function syncMissingWithdrawals(silent = false) {
    if (!silent) {
      setLoading(true);
      toast.loading("Scanning transactions for any missing withdrawal requests...");
    }
    try {
      const { data: txs } = await supabase.from('transactions').select('*').eq('type', 'withdrawal').eq('status', 'pending');
      if (!txs || txs.length === 0) {
        if (!silent) {
          toast.dismiss();
          toast.success("No withdrawal transactions found.");
        }
        return;
      }

      const { data: existingWu } = await supabase.from('withdrawals_usdt').select('transactionId, requestedAt, userId');
      const existingSet = new Set((existingWu || []).map(w => w.transactionId || (w.userId + '_' + w.requestedAt)));

      const missingTxs = txs.filter(tx => {
        const key = tx.id || (tx.senderUid + '_' + tx.timestamp);
        return !existingSet.has(key);
      });

      if (missingTxs.length === 0) {
        if (!silent) {
          toast.dismiss();
          toast.success("All withdrawal requests are already synced and visible!");
        }
        return;
      }

      let allUsers: any[] = [];
      let offset = 0;
      while (true) {
        const { data } = await supabase.from('users').select('uid, "UID", name, email, country').range(offset, offset + 999);
        if (!data || data.length === 0) break;
        allUsers.push(...data);
        if (data.length < 1000) break;
        offset += 1000;
      }
      const userMap = new Map();
      allUsers.forEach(u => {
        const id = u.uid || u['UID'];
        if (id) userMap.set(id, u);
      });

      let toInsert: any[] = [];
      missingTxs.forEach(tx => {
        const u = userMap.get(tx.senderUid) || {};
        const walletPart = tx.description ? tx.description.replace('USDT Withdrawal request to ', '').trim() : 'Unknown Wallet';
        const isEth = walletPart.startsWith('0x');
        const method = isEth ? 'BEP20 / ERC20' : 'TRC20 / Binance UID';
        toInsert.push({
          id: 'w_usdt_' + tx.timestamp + '_' + Math.random().toString(36).substring(2, 7),
          userId: tx.senderUid,
          userName: u.name || 'CM User ' + tx.senderUid.substring(0, 6),
          userEmail: u.email || ('user_' + tx.senderUid.substring(0, 6) + '@cmnetwork.io'),
          amount: Math.abs(tx.amount),
          wallet: walletPart,
          method: method,
          status: tx.status || 'pending',
          requestedAt: tx.timestamp,
          country: u.country || 'Unknown',
          transactionId: tx.id
        });
      });

      if (toInsert.length > 0) {
        let { error: insErr } = await supabase.from('withdrawals_usdt').insert(toInsert);
        if (insErr) {
          const stripped = toInsert.map(item => {
            const { method, country, transactionId, ...rest } = item;
            return rest;
          });
          await supabase.from('withdrawals_usdt').insert(stripped);
        }
      }

      const { data: wuData } = await supabase.from('withdrawals_usdt').select('*').order('requestedAt', { ascending: false }).limit(2000);
      if (wuData) {
        setUsdtWithdrawals(wuData.map(w => ({ ...w, currency: 'USDT' })).sort((a, b) => (b.requestedAt || 0) - (a.requestedAt || 0)));
      }

      if (!silent) {
        toast.dismiss();
        toast.success(`Successfully restored & synced ${toInsert.length} missing withdrawal requests!`);
      }
    } catch (err: any) {
      if (!silent) {
        toast.dismiss();
        toast.error("Error syncing withdrawals: " + err.message);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }

  const handleToggleUserStatus = async (uid: string, currentStatus: boolean) => {
    try {
      await supabase.from('users').update({
        isActive: !currentStatus
      }).eq('uid', uid);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTxStatus = async (uid: string, currentStatus: boolean) => {
    try {
      await supabase.from('users').update({
        transactionsBlocked: !currentStatus
      }).eq('uid', uid);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveTask = async () => {
    try {
      const taskData = {
        title: taskTitle,
        reward: parseFloat(taskReward) || 0,
        type: taskType,
        url: taskUrl.trim(),
        isActive: true,
        autoApprove: taskAutoApprove,
      };

      if (editingTask) {
        const { error } = await supabase.from('tasks').update(taskData).eq('id', editingTask.id);
        if (error) throw error;
      } else {
        const id = 'task_' + Date.now();
        const { error } = await supabase.from('tasks').insert([{ id, ...taskData }]);
        if (error) throw error;
      }

      setEditingTask(null);
      setIsCreatingTask(false);
      fetchData();
      toast.success(editingTask ? 'Task updated!' : 'Task created!');
    } catch (e: any) {
      console.error(e);
      if (e?.code === '42501') {
        toast.error("Permission denied (RLS). Please configure policies for tasks table.");
      } else {
        toast.error(`Error saving task: ${e?.message || 'Unknown error'}`);
      }
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      fetchData();
      toast.success('Task deleted!');
    } catch (e: any) {
      console.error(e);
      if (e?.code === '42501') {
        toast.error("Permission denied (RLS). Please configure policies for tasks table.");
      } else {
        toast.error(`Error deleting task: ${e?.message || 'Unknown error'}`);
      }
    }
  };

  const handleApproveClaim = async (claim: TaskClaim) => {
    setLoading(true);
    try {
      const rewardNum = parseFloat(String(claim.reward || 0)) || 0;
      const { data: dbUser, error: fetchError } = await supabase
        .from('users')
        .select('balance, totalTasksCompleted, uid, UID')
        .or(`uid.eq."${claim.userId}",UID.eq."${claim.userId}"`)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (dbUser) {
        const currentBal = Number(dbUser.balance || 0);
        const nextBal = Math.round((currentBal + rewardNum) * 1000000) / 1000000;
        const realUid = dbUser.uid || dbUser.UID || claim.userId;
        const { error: updateError } = await supabase.from('users').update({
          balance: nextBal,
          "CM Coins": nextBal,
          cm_coins: nextBal,
          totalTasksCompleted: (dbUser.totalTasksCompleted || 0) + 1
        }).or(`uid.eq."${realUid}",UID.eq."${realUid}"`);
        
        if (updateError) throw updateError;
      }
      
      const txId = 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const { error: txError } = await supabase.from('transactions').insert([{
        id: txId,
        type: 'task_reward',
        amount: rewardNum,
        timestamp: Date.now(),
        status: 'completed',
        receiverUid: claim.userId,
        description: `Admin approved task: ${claim.taskTitle}`
      }]);
      if (txError) throw txError;
      
      const { error: completedError } = await supabase.from('completedTasks').upsert({
        id: `${claim.userId}_${claim.taskId}`,
        userId: claim.userId,
        status: 'completed',
        taskId: claim.taskId,
        completedAt: Date.now()
      });
      if (completedError) throw completedError;
      
      const { error: claimError } = await supabase.from('taskClaims').update({
        status: 'approved'
      }).eq('id', claim.id);
      if (claimError) throw claimError;

      toast.success(`Task approved! ${rewardNum} CM reward credited to user.`);
      await fetchData();
    } catch (e: any) {
      console.error('Error approving task:', e);
      toast.error(`Error: ${e?.message || 'Failed to approve task'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectClaim = async (claim: TaskClaim) => {
    setLoading(true);
    try {
      await supabase.from('completedTasks').delete().match({ userId: claim.userId, taskId: claim.taskId });
      await supabase.from('taskClaims').update({
        status: 'rejected'
      }).eq('id', claim.id);

      toast.success('Task claim rejected.');
      await fetchData();
    } catch (e: any) {
      console.error('Error rejecting task:', e);
      toast.error(`Error: ${e?.message || 'Failed to reject task'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAllClaims = async () => {
    const pendingClaims = claims.filter(c => c.status === 'pending');
    if (pendingClaims.length === 0) {
      toast.error("No pending tasks to approve.");
      return;
    }

    if (!window.confirm(`Are you sure you want to approve ALL (${pendingClaims.length}) pending task claims and credit rewards to users?`)) return;

    setLoading(true);
    const toastId = toast.loading(`Approving ${pendingClaims.length} tasks and crediting user rewards...`);

    try {
      // Group reward amounts and completion counts by userId
      const userUpdates = new Map<string, { rewardSum: number, completedCount: number }>();
      for (const claim of pendingClaims) {
        const uId = claim.userId;
        const reward = parseFloat(String(claim.reward || 0)) || 0;
        const current = userUpdates.get(uId) || { rewardSum: 0, completedCount: 0 };
        current.rewardSum += reward;
        current.completedCount += 1;
        userUpdates.set(uId, current);
      }

      // 1. Fetch relevant users in bulk for speed
      const userIds = Array.from(userUpdates.keys());
      const { data: dbUsersByUid } = await supabase
        .from('users')
        .select('uid, UID, balance, totalTasksCompleted')
        .in('uid', userIds);

      const { data: dbUsersByUID } = await supabase
        .from('users')
        .select('uid, UID, balance, totalTasksCompleted')
        .in('UID', userIds);

      const userMap = new Map<string, any>();
      (dbUsersByUid || []).forEach(u => {
        if (u.uid) userMap.set(u.uid, u);
        if (u.UID) userMap.set(u.UID, u);
      });
      (dbUsersByUID || []).forEach(u => {
        if (u.uid) userMap.set(u.uid, u);
        if (u.UID) userMap.set(u.UID, u);
      });

      // 2. Update user balances in fast parallel chunks
      const userEntries = Array.from(userUpdates.entries());
      const CHUNK_SIZE = 20;
      for (let i = 0; i < userEntries.length; i += CHUNK_SIZE) {
        const chunk = userEntries.slice(i, i + CHUNK_SIZE);
        await Promise.all(chunk.map(async ([userId, update]) => {
          try {
            const userRecord = userMap.get(userId);
            let currentBalance = userRecord ? Number(userRecord.balance || 0) : 0;
            let currentCompleted = userRecord ? Number(userRecord.totalTasksCompleted || 0) : 0;
            const realUid = userRecord?.uid || userRecord?.UID || userId;

            // If user record wasn't in cache, single fallback fetch
            if (!userRecord) {
              const { data: singleUser } = await supabase
                .from('users')
                .select('uid, UID, balance, totalTasksCompleted')
                .or(`uid.eq."${userId}",UID.eq."${userId}"`)
                .maybeSingle();
              if (singleUser) {
                currentBalance = Number(singleUser.balance || 0);
                currentCompleted = Number(singleUser.totalTasksCompleted || 0);
              }
            }

            const rewardToAdd = Math.round(update.rewardSum * 1000000) / 1000000;
            const nextBal = Math.round((currentBalance + rewardToAdd) * 1000000) / 1000000;

            const { error: updateError } = await supabase.from('users').update({
              balance: nextBal,
              "CM Coins": nextBal,
              cm_coins: nextBal,
              totalTasksCompleted: currentCompleted + update.completedCount
            }).or(`uid.eq."${realUid}",UID.eq."${realUid}"`);
            
            if (updateError) throw updateError;
          } catch (err) {
            console.error(`Failed to update user ${userId}:`, err);
            throw err;
          }
        }));
      }

      // 3. Insert transactions in bulk
      const transactionsToInsert = pendingClaims.map(claim => ({
        id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
        type: 'task_reward',
        amount: parseFloat(String(claim.reward || 0)) || 0,
        timestamp: Date.now(),
        status: 'completed',
        receiverUid: claim.userId,
        description: `Admin approved task: ${claim.taskTitle}`
      }));

      for (let i = 0; i < transactionsToInsert.length; i += 100) {
        const batch = transactionsToInsert.slice(i, i + 100);
        const { error } = await supabase.from('transactions').insert(batch);
        if (error) throw error;
      }

      // 4. Upsert completed tasks in bulk
      const completedTasksToUpsert = pendingClaims.map(claim => ({
        id: `${claim.userId}_${claim.taskId}`,
        userId: claim.userId,
        status: 'completed',
        taskId: claim.taskId,
        completedAt: Date.now()
      }));

      for (let i = 0; i < completedTasksToUpsert.length; i += 100) {
        const batch = completedTasksToUpsert.slice(i, i + 100);
        const { error } = await supabase.from('completedTasks').upsert(batch);
        if (error) throw error;
      }

      // 5. Update taskClaims status to 'approved' in bulk
      const claimIds = pendingClaims.map(c => c.id);
      for (let i = 0; i < claimIds.length; i += 100) {
        const batch = claimIds.slice(i, i + 100);
        const { error } = await supabase.from('taskClaims').update({ status: 'approved' }).in('id', batch);
        if (error) throw error;
      }

      toast.dismiss(toastId);
      toast.success(`Successfully approved ${pendingClaims.length} task claims and credited rewards!`);
      await fetchData();
    } catch (e: any) {
      console.error('Error batch approving tasks:', e);
      toast.dismiss(toastId);
      toast.error(`Error batch approving tasks: ${e?.message || 'Operation failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAllClaims = async () => {
    const pendingClaims = claims.filter(c => c.status === 'pending');
    if (pendingClaims.length === 0) {
      toast.error("No pending tasks to reject.");
      return;
    }

    if (!window.confirm(`Are you sure you want to REJECT ALL (${pendingClaims.length}) pending tasks?`)) return;

    setLoading(true);
    const toastId = toast.loading(`Rejecting ${pendingClaims.length} tasks...`);

    try {
      const completedTaskIds = pendingClaims.map(claim => `${claim.userId}_${claim.taskId}`);
      for (let i = 0; i < completedTaskIds.length; i += 100) {
        const batch = completedTaskIds.slice(i, i + 100);
        const { error } = await supabase.from('completedTasks').delete().in('id', batch);
        if (error) throw error;
      }

      const claimIds = pendingClaims.map(c => c.id);
      for (let i = 0; i < claimIds.length; i += 100) {
        const batch = claimIds.slice(i, i + 100);
        const { error } = await supabase.from('taskClaims').update({ status: 'rejected' }).in('id', batch);
        if (error) throw error;
      }

      toast.dismiss(toastId);
      toast.success(`Successfully rejected ${pendingClaims.length} task claims.`);
      await fetchData();
    } catch (e: any) {
      console.error('Error batch rejecting tasks:', e);
      toast.dismiss(toastId);
      toast.error(`Error batch rejecting tasks: ${e?.message || 'Operation failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWithdrawal = async (w: any) => {
    try {
      await supabase.from('withdrawals').update({ status: 'approved' }).eq('id', w.id);

      if (w.transactionId) {
        await supabase.from('transactions').update({ status: 'approved' }).eq('id', w.transactionId);
      }

      fetchData();
    } catch (e: any) {
      console.error('Error approving withdrawal:', e);
    }
  };

  const handleRejectWithdrawal = async (w: any) => {
    try {
      await supabase.from('withdrawals').update({ status: 'rejected' }).eq('id', w.id);

      if (w.transactionId) {
        await supabase.from('transactions').update({ status: 'rejected' }).eq('id', w.transactionId);
      }

      const { data: dbUser } = await supabase.from('users').select('balance').or(`uid.eq."${w.userId}",UID.eq."${w.userId}"`).single();
      if (dbUser) {
        const nextBal = (dbUser.balance || 0) + w.amount;
        await supabase.from('users').update({
          balance: nextBal,
          "CM Coins": nextBal,
          cm_coins: nextBal
        }).or(`uid.eq."${w.userId}",UID.eq."${w.userId}"`);
      }

      fetchData();
    } catch (e: any) {
      console.error('Error rejecting withdrawal:', e);
    }
  };

  const handleApproveAllWithdrawals = async () => {
    const pending = withdrawals.filter(w => w.status === 'pending');
    if (pending.length === 0) {
      toast.error('No pending CM withdrawals to approve.');
      return;
    }
    if (!window.confirm(`Are you sure you want to approve ALL (${pending.length}) pending CM withdrawals?`)) return;

    setLoading(true);
    toast.loading(`Approving ${pending.length} CM withdrawals...`);
    try {
      let count = 0;
      for (const w of pending) {
        try {
          await supabase.from('withdrawals').update({ status: 'approved' }).eq('id', w.id);
          if (w.transactionId) {
            await supabase.from('transactions').update({ status: 'approved' }).eq('id', w.transactionId);
          }
          count++;
        } catch (err) {
          console.error(`Error approving CM withdrawal ${w.id}:`, err);
        }
      }
      toast.dismiss();
      toast.success(`Successfully approved ${count} CM withdrawals!`);
      await fetchData();
    } catch (e: any) {
      console.error('Error batch approving CM withdrawals:', e);
      toast.dismiss();
      toast.error('Error approving CM withdrawals: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAllWithdrawals = async () => {
    const pending = withdrawals.filter(w => w.status === 'pending');
    if (pending.length === 0) {
      toast.error('No pending CM withdrawals to reject.');
      return;
    }
    if (!window.confirm(`Are you sure you want to REJECT and refund ALL (${pending.length}) pending CM withdrawals?`)) return;

    setLoading(true);
    toast.loading(`Rejecting ${pending.length} CM withdrawals and refunding balances...`);
    try {
      let count = 0;
      for (const w of pending) {
        try {
          await supabase.from('withdrawals').update({ status: 'rejected' }).eq('id', w.id);
          if (w.transactionId) {
            await supabase.from('transactions').update({ status: 'rejected' }).eq('id', w.transactionId);
          }
          const { data: dbUser } = await supabase.from('users').select('balance').or(`uid.eq."${w.userId}",UID.eq."${w.userId}"`).single();
          if (dbUser) {
            const nextBal = (dbUser.balance || 0) + (w.amount || 0);
            await supabase.from('users').update({
              balance: nextBal,
              "CM Coins": nextBal,
              cm_coins: nextBal
            }).or(`uid.eq."${w.userId}",UID.eq."${w.userId}"`);
          }
          count++;
        } catch (err) {
          console.error(`Error rejecting CM withdrawal ${w.id}:`, err);
        }
      }
      toast.dismiss();
      toast.success(`Successfully rejected ${count} CM withdrawals and refunded user balances!`);
      await fetchData();
    } catch (e: any) {
      console.error('Error batch rejecting CM withdrawals:', e);
      toast.dismiss();
      toast.error('Error rejecting CM withdrawals: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUsdtWithdrawal = async (w: any) => {
    const txHash = window.prompt("Enter Transaction Hash / TXID (optional):");
    if (txHash === null) return; // user cancelled

    try {
      await supabase.from('withdrawals_usdt').update({ 
        status: 'approved', 
        txHash: txHash.trim(),
        approvedAt: Date.now()
      }).eq('id', w.id);

      if (w.transactionId) {
        await supabase.from('transactions').update({ status: 'approved' }).eq('id', w.transactionId);
      }

      fetchData();
    } catch (e: any) {
      console.error('Error approving USDT withdrawal:', e);
    }
  };

  const handleRejectUsdtWithdrawal = async (w: any) => {
    const reason = window.prompt("Enter reason for rejection (optional):");
    if (reason === null) return; // user cancelled

    try {
      await supabase.from('withdrawals_usdt').update({ 
        status: 'rejected',
        rejectionReason: reason.trim()
      }).eq('id', w.id);

      if (w.transactionId) {
        await supabase.from('transactions').update({ status: 'rejected' }).eq('id', w.transactionId);
      }

      const { data: dbUser } = await supabase.from('users').select('usdtBalance').or(`uid.eq."${w.userId}",UID.eq."${w.userId}"`).single();
      if (dbUser) {
        const nextUsdtBal = (dbUser.usdtBalance || 0) + w.amount;
        await supabase.from('users').update({
          usdtBalance: nextUsdtBal,
          "USDT": nextUsdtBal,
          usdtbalance: nextUsdtBal
        }).or(`uid.eq."${w.userId}",UID.eq."${w.userId}"`);
      }

      fetchData();
    } catch (e: any) {
      console.error('Error rejecting USDT withdrawal:', e);
    }
  };

  const handleApproveAllUsdtWithdrawals = async () => {
    const pending = usdtWithdrawals.filter(w => w.status === 'pending');
    if (pending.length === 0) {
      toast.error('No pending USDT withdrawals to approve.');
      return;
    }
    if (!window.confirm(`Are you sure you want to APPROVE all (${pending.length}) pending USDT withdrawals?`)) return;

    setLoading(true);
    toast.loading(`Approving ${pending.length} USDT withdrawals...`);
    try {
      let count = 0;
      for (const w of pending) {
        try {
          await supabase.from('withdrawals_usdt').update({ 
            status: 'approved',
            approvedAt: Date.now()
          }).eq('id', w.id);
          if (w.transactionId) {
            await supabase.from('transactions').update({ status: 'approved' }).eq('id', w.transactionId);
          }
          count++;
        } catch (err) {
          console.error(`Error approving USDT withdrawal ${w.id}:`, err);
        }
      }
      toast.dismiss();
      toast.success(`Successfully approved ${count} USDT withdrawals!`);
      await fetchData();
    } catch (e: any) {
      console.error('Error batch approving USDT withdrawals:', e);
      toast.dismiss();
      toast.error('Error approving USDT withdrawals: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAllUsdtWithdrawals = async () => {
    const pending = usdtWithdrawals.filter(w => w.status === 'pending');
    if (pending.length === 0) {
      toast.error('No pending USDT withdrawals to reject.');
      return;
    }
    const reason = window.prompt(`You are about to REJECT and refund ALL (${pending.length}) pending USDT withdrawals.\n\nEnter rejection reason for all (or leave blank for default):`, "Admin Batch Rejection");
    if (reason === null) return; // user cancelled

    setLoading(true);
    toast.loading(`Rejecting ${pending.length} USDT withdrawals and refunding balances...`);
    try {
      let count = 0;
      for (const w of pending) {
        try {
          await supabase.from('withdrawals_usdt').update({ 
            status: 'rejected',
            rejectionReason: reason.trim() || 'Admin Batch Rejection'
          }).eq('id', w.id);

          if (w.transactionId) {
            await supabase.from('transactions').update({ status: 'rejected' }).eq('id', w.transactionId);
          }

          const { data: dbUser } = await supabase.from('users').select('usdtBalance, USDT, usdtbalance').or(`uid.eq."${w.userId}",UID.eq."${w.userId}"`).single();
          if (dbUser) {
            const currentBal = dbUser.usdtBalance ?? dbUser.USDT ?? dbUser.usdtbalance ?? 0;
            const nextUsdtBal = currentBal + (w.amount || 0);
            await supabase.from('users').update({
              usdtBalance: nextUsdtBal,
              "USDT": nextUsdtBal,
              usdtbalance: nextUsdtBal
            }).or(`uid.eq."${w.userId}",UID.eq."${w.userId}"`);
          }
          count++;
        } catch (err) {
          console.error(`Error rejecting USDT withdrawal ${w.id}:`, err);
        }
      }
      toast.dismiss();
      toast.success(`Successfully rejected ${count} USDT withdrawals and refunded user balances!`);
      await fetchData();
    } catch (e: any) {
      console.error('Error batch rejecting USDT withdrawals:', e);
      toast.dismiss();
      toast.error('Error rejecting USDT withdrawals: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const currentEmail = (user?.email || '').trim().toLowerCase();
  const isAuthorizedEmail = user && ALLOWED_ADMIN_EMAILS.some(
    (allowed) => allowed.toLowerCase() === currentEmail
  );

  if (!user || !isAuthorizedEmail || !isUnlockedState) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="mb-8 p-8 bg-gradient-to-br from-red-900/40 to-black border border-red-500/20 rounded-[32px] relative overflow-hidden flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-red-500 tracking-tight mb-2">Admin Control</h2>
          <p className="text-red-400 text-sm">Manage Users & Platform Options</p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="bg-red-500/20 text-red-500 hover:bg-red-500/30 font-bold px-6 py-3 rounded-xl transition-colors text-sm uppercase tracking-widest border border-red-500/30"
        >
          Back to App
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Total Users</p>
          <p className="text-4xl font-black">{loading ? '...' : totalUsersCount}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Global CM Liquidity</p>
          <p className="text-4xl font-mono font-black text-[#FFD700]">{loading ? '...' : formatCurrency(globalStats.totalBalance)}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Total CM Mined</p>
          <p className="text-4xl font-mono font-black">{loading ? '...' : formatCurrency(globalStats.totalMined)}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Global USDT Liquidity</p>
          <p className="text-4xl font-mono font-black text-green-500">{loading ? '...' : `$${(globalStats.totalUsdtBalance || 0).toFixed(4)}`}</p>
        </div>
      </div>

      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
              <h3 className="text-lg font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" /> Maintenance Mode
              </h3>
              <p className="text-xs text-red-400/70 mt-1">Block the app for all non-admin users. Admins can still access the app.</p>
          </div>
          <div 
            className={`w-14 h-7 rounded-full cursor-pointer transition-colors relative flex items-center shrink-0 ${maintenanceMode ? 'bg-red-500' : 'bg-gray-600'}`}
            onClick={() => saveMaintenanceMode(!maintenanceMode)}
          >
            <div className={`absolute left-1 bg-white w-5 h-5 rounded-full transition-transform ${maintenanceMode ? 'translate-x-7' : 'translate-x-0'}`}></div>
          </div>
      </div>

      <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(255,215,0,0.08)]">
          <div>
              <h3 className="text-lg font-bold text-[#FFD700] uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#FFD700]" /> Fix Task Creation & Withdrawals (RLS Error)
              </h3>
              <p className="text-xs text-[#FFD700]/80 mt-1 max-w-2xl">If task creation or withdrawals fail or don't appear, Supabase Row Level Security (RLS) is blocking database writes. Click the button below to copy the complete SQL fix, then paste and run it in your **Supabase Dashboard &rarr; SQL Editor**.</p>
          </div>
          <button 
            onClick={() => {
              const sql = `-- Disable Row Level Security (RLS) across all public tables so app can read/write freely\nALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;\nALTER TABLE IF EXISTS public.tasks DISABLE ROW LEVEL SECURITY;\nALTER TABLE IF EXISTS public."completedTasks" DISABLE ROW LEVEL SECURITY;\nALTER TABLE IF EXISTS public."taskClaims" DISABLE ROW LEVEL SECURITY;\nALTER TABLE IF EXISTS public.transactions DISABLE ROW LEVEL SECURITY;\nALTER TABLE IF EXISTS public.withdrawals DISABLE ROW LEVEL SECURITY;\nALTER TABLE IF EXISTS public.withdrawals_usdt DISABLE ROW LEVEL SECURITY;\nALTER TABLE IF EXISTS public.squads DISABLE ROW LEVEL SECURITY;\nALTER TABLE IF EXISTS public.settings DISABLE ROW LEVEL SECURITY;\nALTER TABLE IF EXISTS public.ads_log DISABLE ROW LEVEL SECURITY;\n\n-- Create open access policies for all tables in case RLS is ever re-enabled by Supabase\nDO $$\nDECLARE t text;\nBEGIN\n    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'tasks', 'completedTasks', 'taskClaims', 'transactions', 'withdrawals', 'withdrawals_usdt', 'squads', 'settings', 'ads_log') LOOP\n        EXECUTE format('DROP POLICY IF EXISTS "public_access" ON public.%I;', t);\n        EXECUTE format('CREATE POLICY "public_access" ON public.%I FOR ALL USING (true) WITH CHECK (true);', t);\n    END LOOP;\nEND $$;\n\n-- Ensure required columns exist\nALTER TABLE IF EXISTS public.withdrawals_usdt ADD COLUMN IF NOT EXISTS "method" text;\nALTER TABLE IF EXISTS public.withdrawals_usdt ADD COLUMN IF NOT EXISTS "transactionId" text;\nALTER TABLE IF EXISTS public.withdrawals ADD COLUMN IF NOT EXISTS "transactionId" text;\nALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS "isBlocked" boolean DEFAULT false;\nALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS "usdtBalance" numeric DEFAULT 0;\n\nGRANT ALL ON ALL TABLES IN SCHEMA public TO anon;\nGRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;\nGRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;\nGRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;\n\nNOTIFY pgrst, 'reload schema';`;
              navigator.clipboard.writeText(sql);
              toast.success("SQL Fix copied to clipboard! Paste & Run in Supabase Dashboard -> SQL Editor.");
            }}
            className="bg-[#FFD700] text-black hover:bg-yellow-400 font-black px-6 py-4 rounded-xl transition-all text-xs uppercase tracking-widest shrink-0 shadow-[0_0_20px_rgba(255,215,0,0.4)] active:scale-95"
          >
            Copy SQL Fix Command
          </button>
      </div>

      <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(34,197,94,0.08)]">
          <div>
              <h3 className="text-lg font-bold text-green-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-green-400" /> Protect & Sync All User Coins
              </h3>
              <p className="text-xs text-green-400/80 mt-1 max-w-2xl">Ensures no user loses coins due to column discrepancies. Scans the entire database and synchronizes balance, CM Coins, and cm_coins (as well as USDT balances) to each user&apos;s maximum earned amount.</p>
          </div>
          <button 
            onClick={handleSyncAllUserCoins}
            disabled={loading}
            className="bg-green-500 text-black hover:bg-green-400 font-black px-6 py-4 rounded-xl transition-all text-xs uppercase tracking-widest shrink-0 shadow-[0_0_20px_rgba(34,197,94,0.4)] active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Syncing...' : '🛡️ Sync & Protect Coins'}
          </button>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(59,130,246,0.08)]">
          <div>
              <h3 className="text-lg font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-blue-400" /> Restore Missing USDT Withdrawal Requests
              </h3>
              <p className="text-xs text-blue-400/80 mt-1 max-w-2xl">If users requested USDT withdrawals but they are not appearing in the admin panel, this tool scans transaction logs and automatically restores all pending withdrawal requests into the admin table.</p>
          </div>
          <button 
            onClick={() => syncMissingWithdrawals(false)}
            disabled={loading}
            className="bg-blue-500 text-black hover:bg-blue-400 font-black px-6 py-4 rounded-xl transition-all text-xs uppercase tracking-widest shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Restoring...' : '🔄 Restore Withdrawals'}
          </button>
      </div>

      <div className="flex space-x-3 mb-6 overflow-x-auto pb-2">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-5 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors whitespace-nowrap ${activeTab === 'users' ? 'bg-[#FFD700] text-black shadow' : 'bg-white/5 text-white hover:bg-white/10'}`}
        >
          Users
        </button>
        <button 
          onClick={() => setActiveTab('kyc')}
          className={`px-5 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'kyc' ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-emerald-400 hover:bg-white/10'}`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>KYC Verifications</span>
          {users.filter(u => u.kycStatus === 'pending' && hasUserSubmittedKyc(u)).length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-black font-black animate-pulse">
              {users.filter(u => u.kycStatus === 'pending' && hasUserSubmittedKyc(u)).length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('nodes')}
          className={`px-5 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'nodes' ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-white/5 text-purple-400 hover:bg-white/10'}`}
        >
          <Cpu className="w-4 h-4" />
          <span>Node Applications</span>
          {users.filter(u => u.nodeStatus === 'applied').length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-300 text-black font-black animate-pulse">
              {users.filter(u => u.nodeStatus === 'applied').length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('referrals')}
          className={`px-5 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'referrals' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-white/5 text-blue-400 hover:bg-white/10'}`}
        >
          <Users className="w-4 h-4" />
          <span>Referrals Network</span>
        </button>
        <button 
          onClick={() => {
            setActiveTab('usdt_holders');
            fetchUsdtHolders();
          }}
          className={`px-5 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors whitespace-nowrap ${activeTab === 'usdt_holders' ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-white/5 text-green-400 hover:bg-white/10'}`}
        >
          💰 USDT Holders
        </button>
        <button 
          onClick={() => setActiveTab('all_data')}
          className={`px-5 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors whitespace-nowrap ${activeTab === 'all_data' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
        >
          All Data
        </button>
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`px-5 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors whitespace-nowrap ${activeTab === 'tasks' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
        >
          Tasks
        </button>
        <button 
          onClick={() => setActiveTab('approvals')}
          className={`px-5 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors ${activeTab === 'approvals' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
        >
          Approvals
        </button>
        <button 
          onClick={() => setActiveTab('config')}
          className={`px-5 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors ${activeTab === 'config' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
        >
          App Config
        </button>
        <button 
          onClick={() => setActiveTab('withdrawals')}
          className={`px-5 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors ${activeTab === 'withdrawals' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
        >
          Withdrawals
        </button>
        <button 
          onClick={() => setActiveTab('competition')}
          className={`px-5 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors ${activeTab === 'competition' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
        >
          Competition
        </button>
      </div>

      {activeTab === 'all_data' && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#FFD700]">All Data Explorer</h3>
            <div className="flex items-center gap-4">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total: {users.length} Records</div>
              <button 
                onClick={async () => {
                  try {
                    toast.success('Preparing export, please wait...');
                    const { data: allUsers } = await supabase.from('users').select('*');
                    const dataToExport = allUsers || users;
                    
                    const header = ['UID', 'Name', 'Email', 'Country', 'CM Coins', 'USDT', 'Referral Code', 'Referred By', 'Ref Count', 'Joined At'];
                    const rows = dataToExport.map(u => [
                      u.uid,
                      `"${(u.name || '').replace(/"/g, '""')}"`,
                      `"${(u.email || '').replace(/"/g, '""')}"`,
                      `"${(u.country || 'N/A').replace(/"/g, '""')}"`,
                      u.balance || 0,
                      u.usdtBalance || 0,
                      u.referralCode || '',
                      u.referredBy || '',
                      u.referralCount || 0,
                      `"${u.joinDate ? new Date(u.joinDate).toLocaleString().replace(/"/g, '""') : 'N/A'}"`
                    ]);
                    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', `users_data_${new Date().toISOString().split('T')[0]}.csv`);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success('Data exported as CSV file');
                  } catch (err) {
                    console.error(err);
                    toast.error('Failed to export data');
                  }
                }}
                className="bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
              >
                Download All Data (CSV)
              </button>
            </div>
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[70vh] rounded-xl pr-2">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">UID</th>
                  <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">Name</th>
                  <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">Email</th>
                  <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">Country</th>
                  <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">CM Coins</th>
                  <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest text-green-500">USDT</th>
                  <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">Referral Code</th>
                  <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">Referred By</th>
                  <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">Ref Count</th>
                  <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">Joined At</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.uid} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 text-[10px] font-mono text-gray-500">{u.uid}</td>
                    <td className="p-3 text-sm font-bold truncate max-w-[150px]">{u.name}</td>
                    <td className="p-3 text-xs font-mono text-gray-400">{u.email}</td>
                    <td className="p-3 text-xs font-bold text-gray-300 uppercase tracking-widest">{u.country || 'N/A'}</td>
                    <td className="p-3 font-mono font-bold text-[#FFD700]">{formatCurrency(u.balance)}</td>
                    <td className="p-3 font-mono font-bold text-green-500">${(u.usdtBalance || 0).toFixed(4)}</td>
                    <td className="p-3 text-xs font-mono font-bold text-blue-400">{u.referralCode}</td>
                    <td className="p-3 text-xs font-mono text-gray-400">{u.referredBy || 'None'}</td>
                    <td className="p-3 text-xs font-bold text-gray-300">{u.referralCount || 0}</td>
                    <td className="p-3 text-[10px] font-mono text-gray-500">
                      {u.joinDate ? new Date(u.joinDate).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#FFD700]">User Database</h3>
            <input 
              type="text" 
              placeholder="Search by Name or Email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#FFD700] transition-colors w-full sm:w-64"
            />
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[60vh] rounded-xl pr-2">
            <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">User</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">Country</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest text-emerald-400">KYC Status</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest text-purple-400">Node Status</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">CM Balance</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest text-green-500">USDT Balance</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">Ref Count</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">Status</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-sm truncate max-w-[150px]">{u.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono truncate max-w-[150px]">{u.email}</div>
                  </td>
                  <td className="p-3 text-xs font-bold text-gray-300 uppercase tracking-widest">{u.country || 'N/A'}</td>
                  
                  {/* KYC Status Badge & Quick Action */}
                  <td className="p-3">
                    <div className="flex flex-col gap-1 items-start">
                      {u.kycStatus === 'verified' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Verified
                        </span>
                      ) : u.kycStatus === 'pending' ? (
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                          <button
                            onClick={() => handleApproveKyc(u)}
                            className="text-[9px] bg-emerald-500 text-black font-black px-1.5 py-0.5 rounded hover:bg-emerald-400 transition-colors"
                            title="Approve KYC"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleRejectKyc(u)}
                            className="text-[9px] bg-red-500/20 text-red-400 font-black px-1.5 py-0.5 rounded hover:bg-red-500/30 transition-colors"
                            title="Reject KYC"
                          >
                            ✕
                          </button>
                        </div>
                      ) : u.kycStatus === 'rejected' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                          Rejected
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-white/5 text-gray-400">
                          Unverified
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Node Status Badge & Quick Action */}
                  <td className="p-3">
                    <div className="flex flex-col gap-1 items-start">
                      {u.nodeStatus === 'approved' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                          <Cpu className="w-3 h-3" /> Node Active
                        </span>
                      ) : u.nodeStatus === 'applied' ? (
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 animate-pulse">
                            Applied
                          </span>
                          <button
                            onClick={() => handleApproveNode(u)}
                            className="text-[9px] bg-purple-500 text-white font-black px-1.5 py-0.5 rounded hover:bg-purple-400 transition-colors"
                            title="Approve Node"
                          >
                            ⚡
                          </button>
                          <button
                            onClick={() => handleRejectNode(u)}
                            className="text-[9px] bg-red-500/20 text-red-400 font-black px-1.5 py-0.5 rounded hover:bg-red-500/30 transition-colors"
                            title="Reject Node"
                          >
                            ✕
                          </button>
                        </div>
                      ) : u.nodeStatus === 'rejected' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-red-500/20 text-red-400">
                          Rejected
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-500 font-mono">None</span>
                      )}
                    </div>
                  </td>

                  <td className="p-3 font-mono font-bold text-[#FFD700]">{formatCurrency(u.balance)}</td>
                  <td className="p-3 font-mono font-bold text-green-500">${(u.usdtBalance || 0).toFixed(4)}</td>
                  <td className="p-3 text-xs font-mono font-bold text-blue-400">{u.referralCount || 0}</td>
                  <td className="p-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold ${u.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {u.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2 whitespace-nowrap">
                    <button 
                      onClick={() => handleToggleTxStatus(u.uid, !!u.transactionsBlocked)}
                      className="text-[10px] font-bold tracking-widest uppercase bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      {!u.transactionsBlocked ? 'Block Tx' : 'Unblock Tx'}
                    </button>
                    <button 
                      onClick={() => handleToggleUserStatus(u.uid, u.isActive)}
                      className="text-[10px] font-bold tracking-widest uppercase bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      {u.isActive ? 'Block' : 'Unblock'}
                    </button>
                    <button 
                      onClick={() => {
                        setEditingUser(u);
                        setEditBalance((u.balance || 0).toString());
                        setEditUsdtBalance((u.usdtBalance || 0).toString());
                        setEditMiningRate((u.miningRate || 0).toString());
                        setEditKycStatus(u.kycStatus || 'unverified');
                        setEditNodeStatus(u.nodeStatus || 'none');
                      }}
                      className="text-[10px] font-bold tracking-widest uppercase bg-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/30 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Edit User
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          KYC VERIFICATIONS HUB (APPROVE / REJECT WITH LIVE PHOTO & PAYMENT PROOF)
         ========================================================================= */}
      {activeTab === 'kyc' && (
        <div className="bg-white/5 border border-emerald-500/30 rounded-3xl p-4 sm:p-8 animate-in fade-in duration-300 mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Identity Verification Protocol (KYC)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                KYC Applications & Identity Review
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                Review user live front camera selfies and blockchain fee payments (BNB, Ethereum, Solana). Approve to grant verified status and unlock Node Operator eligibility.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto shrink-0">
              <button 
                onClick={handleResetAllUsersKyc}
                disabled={loading}
                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 font-bold px-3.5 py-2.5 rounded-xl transition-all text-xs uppercase tracking-widest flex items-center gap-1.5"
                title="Reset all users to unverified so they must apply and wait for your approval"
              >
                <span>Reset All to Unverified</span>
              </button>
              <button 
                onClick={fetchData}
                disabled={loading}
                className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 font-bold px-4 py-2.5 rounded-xl transition-all text-xs uppercase tracking-widest flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Submissions</span>
              </button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10">
              <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Total Submissions</span>
              <p className="text-2xl font-black text-white font-mono mt-1">
                {users.filter(u => hasUserSubmittedKyc(u) || u.kycStatus === 'verified').length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider block flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> Pending Review
              </span>
              <p className="text-2xl font-black text-amber-400 font-mono mt-1">
                {users.filter(u => u.kycStatus === 'pending' && hasUserSubmittedKyc(u)).length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/40">
              <span className="text-[10px] text-emerald-400 uppercase font-black tracking-wider block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified Users
              </span>
              <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
                {users.filter(u => u.kycStatus === 'verified').length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-black/60 border border-red-500/40">
              <span className="text-[10px] text-red-400 uppercase font-black tracking-wider block flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-red-400" /> Rejected
              </span>
              <p className="text-2xl font-black text-red-400 font-mono mt-1">
                {users.filter(u => u.kycStatus === 'rejected' && hasUserSubmittedKyc(u)).length}
              </p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setKycFilterStatus('pending')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  kycFilterStatus === 'pending' 
                    ? 'bg-amber-500 text-black shadow' 
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Pending ({users.filter(u => u.kycStatus === 'pending' && hasUserSubmittedKyc(u)).length})
              </button>
              <button
                onClick={() => setKycFilterStatus('verified')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  kycFilterStatus === 'verified' 
                    ? 'bg-emerald-500 text-black shadow' 
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Verified ({users.filter(u => u.kycStatus === 'verified').length})
              </button>
              <button
                onClick={() => setKycFilterStatus('rejected')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  kycFilterStatus === 'rejected' 
                    ? 'bg-red-500 text-white shadow' 
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Rejected ({users.filter(u => u.kycStatus === 'rejected' && hasUserSubmittedKyc(u)).length})
              </button>
              <button
                onClick={() => setKycFilterStatus('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  kycFilterStatus === 'all' 
                    ? 'bg-white text-black shadow' 
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                All Submissions
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search name, email, or TXID..."
                value={kycSearchQuery}
                onChange={(e) => setKycSearchQuery(e.target.value)}
                className="bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-emerald-500 transition-colors w-full"
              />
            </div>
          </div>

          {/* Submissions List */}
          {(() => {
            const kycUsers = users.filter(u => {
              const applied = hasUserSubmittedKyc(u);
              // Crucial: Only show users if they have submitted proof/selfie or are verified
              if (!applied && u.kycStatus !== 'verified') return false;

              if (kycFilterStatus === 'pending') {
                if (u.kycStatus !== 'pending' || !applied) return false;
              } else if (kycFilterStatus === 'verified') {
                if (u.kycStatus !== 'verified') return false;
              } else if (kycFilterStatus === 'rejected') {
                if (u.kycStatus !== 'rejected' || !applied) return false;
              } else {
                if (!applied && u.kycStatus !== 'verified') return false;
              }

              if (kycSearchQuery.trim()) {
                const q = kycSearchQuery.toLowerCase().trim();
                const name = (u.name || '').toLowerCase();
                const email = (u.email || '').toLowerCase();
                const uid = (u.uid || '').toLowerCase();
                const txHash = (u.kycTxHash || '').toLowerCase();
                const chain = (u.kycChain || '').toLowerCase();
                return name.includes(q) || email.includes(q) || uid.includes(q) || txHash.includes(q) || chain.includes(q);
              }
              return true;
            });

            if (kycUsers.length === 0) {
              return (
                <div className="text-center py-16 p-8 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                  <ShieldCheck className="w-10 h-10 text-emerald-500/40 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No KYC Submissions in this filter</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    {kycFilterStatus === 'pending' 
                      ? 'Great news! There are currently no pending KYC applications waiting for review.'
                      : 'No user applications match your current status filter.'}
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {kycUsers.map((u) => {
                  const feeInfo = u.kycChain === 'SOL'
                    ? { fee: '0.00041 SOL', address: '2z8hTr7ccNH6bq2kyjS9cvH9d8XFMESaWFaD9z5HSr1D' }
                    : u.kycChain === 'ETH'
                    ? { fee: '0.00001245 ETH', address: '0x7CFD255CA3FE95e88BDFdFAb44d12d92F0f2A120' }
                    : { fee: '0.00053 BNB', address: '0x7CFD255CA3FE95e88BDFdFAb44d12d92F0f2A120' };

                  return (
                    <div 
                      key={u.uid}
                      className="p-5 sm:p-6 rounded-2xl bg-black/60 border border-white/10 hover:border-emerald-500/40 transition-all space-y-5"
                    >
                      {/* User Top Row */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 text-sm shrink-0">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-white font-black text-base">{u.name || 'Anonymous Miner'}</h4>
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                u.kycStatus === 'verified' 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : u.kycStatus === 'pending'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                                {u.kycStatus === 'verified' ? '✓ Verified' : u.kycStatus === 'pending' ? '⏳ Pending Review' : '✕ Rejected'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 font-mono mt-0.5 flex items-center gap-3 flex-wrap">
                              <span>Email: {u.email}</span>
                              <span>UID: {u.uid}</span>
                              {u.kycSubmittedAt && (
                                <span className="text-gray-500">
                                  Submitted: {new Date(u.kycSubmittedAt).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Balances & Referrals */}
                        <div className="flex items-center gap-3">
                          <div className="text-right px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-[9px] uppercase font-bold text-gray-400 block">Balance</span>
                            <span className="text-xs font-mono font-black text-[#FFD700]">
                              {formatCurrency(u.balance)} CM
                            </span>
                          </div>
                          <div className="text-right px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-[9px] uppercase font-bold text-gray-400 block">Referrals</span>
                            <span className="text-xs font-mono font-black text-blue-400">
                              {u.referralCount || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Proofs Grid: Front Camera Selfie vs Payment Screenshot */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Selfie Proof */}
                        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              📸 Front Camera Live Selfie
                            </span>
                            {u.kycPhotoUrl && (
                              <button
                                onClick={() => setSelectedProofModal({ title: `${u.name || u.email}'s Front Camera Selfie`, imageUrl: u.kycPhotoUrl!, user: u })}
                                className="text-[10px] text-emerald-400 font-bold hover:underline flex items-center gap-1"
                              >
                                <ZoomIn className="w-3 h-3" /> Zoom Photo
                              </button>
                            )}
                          </div>

                          {u.kycPhotoUrl ? (
                            <div 
                              onClick={() => setSelectedProofModal({ title: `${u.name || u.email}'s Front Camera Selfie`, imageUrl: u.kycPhotoUrl!, user: u })}
                              className="relative h-44 rounded-xl overflow-hidden border border-white/10 group cursor-pointer bg-black/80 flex items-center justify-center"
                            >
                              <img 
                                src={u.kycPhotoUrl} 
                                alt="Live Selfie" 
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform" 
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="px-3 py-1.5 rounded-lg bg-black/80 text-white text-xs font-bold flex items-center gap-1">
                                  <ZoomIn className="w-3.5 h-3.5" /> Click to view full image
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="h-44 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-xs text-gray-500">
                              No selfie photo uploaded
                            </div>
                          )}
                        </div>

                        {/* Fee & Payment Screenshot Proof */}
                        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              🧾 Fee Receipt & Gas Transfer
                            </span>
                            {u.kycPaymentProofUrl && (
                              <button
                                onClick={() => setSelectedProofModal({ title: `${u.name || u.email}'s Fee Payment Screenshot`, imageUrl: u.kycPaymentProofUrl!, user: u })}
                                className="text-[10px] text-emerald-400 font-bold hover:underline flex items-center gap-1"
                              >
                                <ZoomIn className="w-3 h-3" /> Zoom Screenshot
                              </button>
                            )}
                          </div>

                          {/* Fee metadata box */}
                          <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] space-y-1 font-mono">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Selected Chain:</span>
                              <span className="text-emerald-400 font-bold">{u.kycChain || 'BNB'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Required Gas Fee:</span>
                              <span className="text-white font-bold">{feeInfo.fee}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-white/5">
                              <span className="text-gray-400">TXID Hash:</span>
                              <span className="text-[#FFD700] truncate max-w-[180px]">
                                {u.kycTxHash || 'Not provided'}
                              </span>
                            </div>
                          </div>

                          {/* Screenshot image */}
                          {u.kycPaymentProofUrl ? (
                            <div 
                              onClick={() => setSelectedProofModal({ title: `${u.name || u.email}'s Fee Payment Screenshot`, imageUrl: u.kycPaymentProofUrl!, user: u })}
                              className="relative h-28 rounded-xl overflow-hidden border border-white/10 group cursor-pointer bg-black/80 flex items-center justify-center"
                            >
                              <img 
                                src={u.kycPaymentProofUrl} 
                                alt="Payment Proof" 
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform" 
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="px-3 py-1.5 rounded-lg bg-black/80 text-white text-xs font-bold flex items-center gap-1">
                                  <ZoomIn className="w-3.5 h-3.5" /> View full receipt
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="h-28 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-xs text-gray-500">
                              No payment screenshot uploaded
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Decision Buttons */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/5">
                        <span className="text-xs text-gray-500">
                          Review decision will update the user&apos;s KYC status across the entire network in real time.
                        </span>
                        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                          <button
                            onClick={() => handleResetKyc(u)}
                            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold transition-colors"
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => handleRejectKyc(u)}
                            className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject KYC</span>
                          </button>
                          <button
                            onClick={() => handleApproveKyc(u)}
                            className="px-5 py-2 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve KYC ✓</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* =========================================================================
          NODE APPLICATIONS HUB (APPROVE / REJECT VALIDATOR NODES & P2P ACCESS)
         ========================================================================= */}
      {activeTab === 'nodes' && (
        <div className="bg-white/5 border border-purple-500/30 rounded-3xl p-4 sm:p-8 animate-in fade-in duration-300 mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-black uppercase tracking-wider mb-2">
                <Cpu className="w-3.5 h-3.5" />
                <span>Validator Node Licensing & Governance</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Node Operator Applications
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                Review and approve Node Validators. Approving grants exclusive access to P2P Escrow Trading, higher node multiplier yields, and core team direct communication.
              </p>
            </div>
            <button 
              onClick={fetchData}
              disabled={loading}
              className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30 font-bold px-4 py-2.5 rounded-xl transition-all text-xs uppercase tracking-widest flex items-center gap-2 self-start sm:self-auto shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Applicants</span>
            </button>
          </div>

          {/* Criteria Checklist Card */}
          <div className="p-4 rounded-2xl bg-black/60 border border-purple-500/20 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">1</span>
              <div>
                <h5 className="text-xs font-bold text-white">140+ Referral Milestone</h5>
                <p className="text-[11px] text-gray-400 mt-0.5">Applicant must have invited at least 140 members.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">2</span>
              <div>
                <h5 className="text-xs font-bold text-white">100% Referral KYC Verified</h5>
                <p className="text-[11px] text-gray-400 mt-0.5">All referrals must complete front camera & fee KYC.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">3</span>
              <div>
                <h5 className="text-xs font-bold text-white">Unlocked Privileges</h5>
                <p className="text-[11px] text-gray-400 mt-0.5">Approved nodes get P2P trading & direct team chat.</p>
              </div>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10">
              <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Total Applicants</span>
              <p className="text-2xl font-black text-white font-mono mt-1">
                {users.filter(u => u.nodeStatus && u.nodeStatus !== 'none').length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-black/60 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
              <span className="text-[10px] text-purple-400 uppercase font-black tracking-wider block flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-400" /> Pending Applications
              </span>
              <p className="text-2xl font-black text-purple-400 font-mono mt-1">
                {users.filter(u => u.nodeStatus === 'applied').length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/40">
              <span className="text-[10px] text-emerald-400 uppercase font-black tracking-wider block flex items-center gap-1">
                <Cpu className="w-3 h-3 text-emerald-400" /> Approved Node Operators
              </span>
              <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
                {users.filter(u => u.nodeStatus === 'approved').length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-black/60 border border-red-500/40">
              <span className="text-[10px] text-red-400 uppercase font-black tracking-wider block flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-red-400" /> Rejected
              </span>
              <p className="text-2xl font-black text-red-400 font-mono mt-1">
                {users.filter(u => u.nodeStatus === 'rejected').length}
              </p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setNodeFilterStatus('applied')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  nodeFilterStatus === 'applied' 
                    ? 'bg-purple-500 text-white shadow' 
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Pending Applied ({users.filter(u => u.nodeStatus === 'applied').length})
              </button>
              <button
                onClick={() => setNodeFilterStatus('approved')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  nodeFilterStatus === 'approved' 
                    ? 'bg-emerald-500 text-black shadow' 
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Approved Operators ({users.filter(u => u.nodeStatus === 'approved').length})
              </button>
              <button
                onClick={() => setNodeFilterStatus('rejected')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  nodeFilterStatus === 'rejected' 
                    ? 'bg-red-500 text-white shadow' 
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Rejected ({users.filter(u => u.nodeStatus === 'rejected').length})
              </button>
              <button
                onClick={() => setNodeFilterStatus('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  nodeFilterStatus === 'all' 
                    ? 'bg-white text-black shadow' 
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                All Applicants
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search name, email, or UID..."
                value={nodeSearchQuery}
                onChange={(e) => setNodeSearchQuery(e.target.value)}
                className="bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors w-full"
              />
            </div>
          </div>

          {/* Node Applicants List */}
          {(() => {
            const nodeUsers = users.filter(u => {
              if (nodeFilterStatus !== 'all') {
                if (u.nodeStatus !== nodeFilterStatus) return false;
              } else {
                if (!u.nodeStatus || u.nodeStatus === 'none') return false;
              }

              if (nodeSearchQuery.trim()) {
                const q = nodeSearchQuery.toLowerCase().trim();
                const name = (u.name || '').toLowerCase();
                const email = (u.email || '').toLowerCase();
                const uid = (u.uid || '').toLowerCase();
                return name.includes(q) || email.includes(q) || uid.includes(q);
              }
              return true;
            });

            if (nodeUsers.length === 0) {
              return (
                <div className="text-center py-16 p-8 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                  <Cpu className="w-10 h-10 text-purple-500/40 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No Node Applications Found</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    {nodeFilterStatus === 'applied' 
                      ? 'No pending node validator applications waiting for approval.'
                      : 'No users match your selected filter.'}
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {nodeUsers.map((u) => {
                  const meetsRef = (u.referralCount || 0) >= 140;
                  const isUserKyc = u.kycStatus === 'verified';

                  return (
                    <div 
                      key={u.uid}
                      className="p-5 sm:p-6 rounded-2xl bg-black/60 border border-white/10 hover:border-purple-500/40 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-black text-purple-400 text-sm shrink-0">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-white font-black text-base">{u.name || 'Anonymous Miner'}</h4>
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                u.nodeStatus === 'approved' 
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : u.nodeStatus === 'applied'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                                {u.nodeStatus === 'approved' ? '⚡ Node Operator Active' : u.nodeStatus === 'applied' ? '⏳ Application Pending' : '✕ Application Rejected'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 font-mono mt-0.5 flex items-center gap-3 flex-wrap">
                              <span>Email: {u.email}</span>
                              <span>UID: {u.uid}</span>
                              {u.nodeAppliedAt && (
                                <span className="text-gray-500">
                                  Applied: {new Date(u.nodeAppliedAt).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex items-center gap-3">
                          <div className="text-right px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-[9px] uppercase font-bold text-gray-400 block">Balance</span>
                            <span className="text-xs font-mono font-black text-[#FFD700]">
                              {formatCurrency(u.balance)} CM
                            </span>
                          </div>
                          <div className="text-right px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-[9px] uppercase font-bold text-gray-400 block">Applicant KYC</span>
                            <span className={`text-xs font-mono font-black ${isUserKyc ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {isUserKyc ? 'Verified ✓' : 'Pending KYC ⏳'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Criteria Audit Card */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-gray-400">Referral Requirement (140+):</span>
                            <span className={meetsRef ? 'text-emerald-400' : 'text-amber-400'}>
                              {u.referralCount || 0} / 140 {meetsRef ? '✓ Met' : '⏳ In Progress'}
                            </span>
                          </div>
                          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${meetsRef ? 'bg-emerald-400' : 'bg-amber-400'}`}
                              style={{ width: `${Math.min(100, (((u.referralCount || 0) / 140) * 100))}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-gray-400">P2P Escrow Trading Status:</span>
                            <span className={u.nodeStatus === 'approved' ? 'text-emerald-400' : 'text-gray-400'}>
                              {u.nodeStatus === 'approved' ? 'Unlocked & Active 🔓' : 'Locked (Node Required) 🔒'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500">
                            Node operators can post and take bids on the P2P Escrow Desk.
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/5">
                        <span className="text-xs text-gray-500">
                          Approving unlocks P2P Escrow trading and awards the official Node Validator license.
                        </span>
                        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                          <button
                            onClick={() => handleRevokeNode(u)}
                            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold transition-colors"
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => handleRejectNode(u)}
                            className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject Node</span>
                          </button>
                          <button
                            onClick={() => handleApproveNode(u)}
                            className="px-5 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-400 text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] active:scale-95 flex items-center gap-1.5"
                          >
                            <Cpu className="w-3.5 h-3.5" />
                            <span>Approve Node Validator ⚡</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* =========================================================================
          REFERRALS NETWORK LEDGER (PHASE 1 & PHASE 2 ALL USERS WITH COINS & KYC)
         ========================================================================= */}
      {activeTab === 'referrals' && (
        <div className="bg-white/5 border border-blue-500/30 rounded-3xl p-4 sm:p-8 animate-in fade-in duration-300 mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5" />
                <span>Protocol Referral Tree & Network Ledger</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                All Referrals (Phase 1 & Phase 2)
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                Global view of all referred users from Phase 1 and Phase 2. Audit who invited each member, their accumulated CM Coins, and real-time KYC verification status.
              </p>
            </div>
            <button 
              onClick={fetchData}
              disabled={loading}
              className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 font-bold px-4 py-2.5 rounded-xl transition-all text-xs uppercase tracking-widest flex items-center gap-2 self-start sm:self-auto shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Network</span>
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setReferralPhaseFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  referralPhaseFilter === 'all' 
                    ? 'bg-blue-500 text-white shadow' 
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                All Members ({users.length})
              </button>
              <button
                onClick={() => setReferralPhaseFilter('phase1')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  referralPhaseFilter === 'phase1' 
                    ? 'bg-purple-500 text-white shadow' 
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Phase 1 Pioneers
              </button>
              <button
                onClick={() => setReferralPhaseFilter('phase2')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  referralPhaseFilter === 'phase2' 
                    ? 'bg-emerald-500 text-black shadow' 
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Phase 2 Members
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search user, referrer, email, or UID..."
                value={referralSearchQuery}
                onChange={(e) => setReferralSearchQuery(e.target.value)}
                className="bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors w-full"
              />
            </div>
          </div>

          {/* Referrals Table */}
          {(() => {
            const PHASE_2_TS = 1729600000000;
            const refUsers = users.filter(u => {
              const isP1 = !u.joinDate || u.joinDate < PHASE_2_TS;
              if (referralPhaseFilter === 'phase1' && !isP1) return false;
              if (referralPhaseFilter === 'phase2' && isP1) return false;

              if (referralSearchQuery.trim()) {
                const q = referralSearchQuery.toLowerCase().trim();
                const name = (u.name || '').toLowerCase();
                const email = (u.email || '').toLowerCase();
                const uid = (u.uid || '').toLowerCase();
                const refBy = (u.referredBy || '').toLowerCase();
                const refCode = (u.referralCode || '').toLowerCase();
                return name.includes(q) || email.includes(q) || uid.includes(q) || refBy.includes(q) || refCode.includes(q);
              }
              return true;
            });

            return (
              <div className="overflow-x-auto overflow-y-auto max-h-[60vh] rounded-xl pr-1">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">User</th>
                      <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest text-blue-400">Referred By</th>
                      <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">Phase</th>
                      <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest text-emerald-400">KYC Status</th>
                      <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">CM Coins</th>
                      <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest text-green-500">USDT</th>
                      <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">Ref Count</th>
                      <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refUsers.map((u) => {
                      const isP1 = !u.joinDate || u.joinDate < PHASE_2_TS;
                      const cmCoins = Number(u.balance ?? (u as any)['CM Coins'] ?? (u as any).cm_coins ?? 0);
                      const usdtBal = Number(u.usdtBalance ?? (u as any)['USDT'] ?? 0);

                      return (
                        <tr key={u.uid} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-sm truncate max-w-[150px]">{u.name}</div>
                            <div className="text-[10px] text-gray-500 font-mono truncate max-w-[150px]">{u.email}</div>
                          </td>
                          <td className="p-3 text-xs font-mono font-bold text-blue-400">
                            {u.referredBy || <span className="text-gray-500 font-normal">None / Pioneer</span>}
                          </td>
                          <td className="p-3">
                            {isP1 ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                Phase 1 Pioneer
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                Phase 2 Member
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {u.kycStatus === 'verified' ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-max">
                                <Check className="w-3 h-3" /> KYC Verified
                              </span>
                            ) : u.kycStatus === 'pending' ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-max animate-pulse">
                                <Clock className="w-3 h-3" /> KYC Pending
                              </span>
                            ) : u.kycStatus === 'rejected' ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-red-500/20 text-red-400 border border-red-500/30 w-max">
                                KYC Rejected
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-white/5 text-gray-400 w-max">
                                Not Done
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono font-bold text-[#FFD700]">{formatCurrency(cmCoins)}</td>
                          <td className="p-3 font-mono font-bold text-green-500">${usdtBal.toFixed(4)}</td>
                          <td className="p-3 font-mono font-bold text-white">{u.referralCount || 0}</td>
                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            {u.kycStatus === 'pending' && (
                              <button
                                onClick={() => handleApproveKyc(u)}
                                className="text-[10px] bg-emerald-500 text-black font-black px-2.5 py-1 rounded hover:bg-emerald-400 transition-colors"
                              >
                                Approve KYC
                              </button>
                            )}
                            {u.nodeStatus === 'applied' && (
                              <button
                                onClick={() => handleApproveNode(u)}
                                className="text-[10px] bg-purple-500 text-white font-black px-2.5 py-1 rounded hover:bg-purple-400 transition-colors"
                              >
                                Approve Node
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setEditBalance((u.balance || 0).toString());
                                setEditUsdtBalance((u.usdtBalance || 0).toString());
                                setEditMiningRate((u.miningRate || 0).toString());
                                setEditKycStatus(u.kycStatus || 'unverified');
                                setEditNodeStatus(u.nodeStatus || 'none');
                              }}
                              className="text-[10px] bg-white/10 hover:bg-white/20 text-white font-bold px-2.5 py-1 rounded transition-colors"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
      {selectedProofModal && (
        <div 
          onClick={() => setSelectedProofModal(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#12110c] border border-white/20 rounded-3xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col space-y-4 shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">{selectedProofModal.title}</h3>
                {selectedProofModal.user && (
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    User: {selectedProofModal.user.name} ({selectedProofModal.user.email})
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedProofModal(null)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center bg-black/60 rounded-2xl p-2 border border-white/5 min-h-[350px]">
              <img 
                src={selectedProofModal.imageUrl} 
                alt="Full proof" 
                className="max-h-[65vh] max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a 
                href={selectedProofModal.imageUrl} 
                target="_blank" 
                rel="noreferrer" 
                download="kyc-proof"
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-bold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open original image in new tab</span>
              </a>
              <button
                onClick={() => setSelectedProofModal(null)}
                className="px-6 py-2.5 rounded-xl bg-[#FFD700] text-black font-black text-xs uppercase tracking-wider"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'usdt_holders' && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-8 animate-in fade-in duration-300 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-white/10 pb-6">
            <div>
              <h3 className="text-xl font-black uppercase tracking-wider text-green-400 flex items-center gap-2">
                <span>💰</span> USDT Richlist & Holders
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                All platform users ranked by highest USDT balance. Emails are shown prominently for verification and priority support.
              </p>
            </div>
            <button 
              onClick={fetchUsdtHolders}
              disabled={loadingUsdtHolders}
              className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 font-bold px-4 py-2.5 rounded-xl transition-all text-xs uppercase tracking-widest flex items-center gap-2 self-start sm:self-auto shrink-0"
            >
              <span>{loadingUsdtHolders ? '⏳' : '🔄'}</span>
              <span>{loadingUsdtHolders ? 'Refreshing...' : 'Refresh List'}</span>
            </button>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-black/40 border border-green-500/20 rounded-2xl p-4">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">Total Users Shown</span>
              <span className="text-2xl font-black text-white font-mono">
                {usdtHolders.filter(u => {
                  const bal = Number(u.usdtBalance ?? (u as any).USDT ?? (u as any).usdtbalance ?? 0);
                  if (usdtMinFilter === 'above_5' && bal <= 5) return false;
                  if (usdtMinFilter === 'above_0' && bal <= 0) return false;
                  return true;
                }).length}
              </span>
            </div>
            <div className="bg-black/40 border border-green-500/20 rounded-2xl p-4">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">Users With &gt; 5 USDT</span>
              <span className="text-2xl font-black text-green-400 font-mono">
                {usdtHolders.filter(u => Number(u.usdtBalance ?? (u as any).USDT ?? (u as any).usdtbalance ?? 0) > 5).length}
              </span>
            </div>
            <div className="bg-black/40 border border-green-500/20 rounded-2xl p-4">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">Total USDT Balance (All)</span>
              <span className="text-2xl font-black text-green-500 font-mono">
                ${usdtHolders.reduce((sum, u) => sum + Number(u.usdtBalance ?? (u as any).USDT ?? (u as any).usdtbalance ?? 0), 0).toFixed(4)}
              </span>
            </div>
          </div>

          {/* Filter Pills & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-black/30 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mr-1">Filter:</span>
              <button
                onClick={() => setUsdtMinFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold uppercase text-[11px] tracking-wider transition-all ${usdtMinFilter === 'all' ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                All Users ({usdtHolders.length})
              </button>
              <button
                onClick={() => setUsdtMinFilter('above_0')}
                className={`px-3 py-1.5 rounded-lg font-bold uppercase text-[11px] tracking-wider transition-all ${usdtMinFilter === 'above_0' ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                &gt; 0 USDT ({usdtHolders.filter(u => Number(u.usdtBalance ?? (u as any).USDT ?? (u as any).usdtbalance ?? 0) > 0).length})
              </button>
              <button
                onClick={() => setUsdtMinFilter('above_5')}
                className={`px-3 py-1.5 rounded-lg font-bold uppercase text-[11px] tracking-wider transition-all ${usdtMinFilter === 'above_5' ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                ⭐ &gt; 5 USDT ({usdtHolders.filter(u => Number(u.usdtBalance ?? (u as any).USDT ?? (u as any).usdtbalance ?? 0) > 5).length})
              </button>
            </div>

            <input
              type="text"
              placeholder="Search Gmail, Name, or UID..."
              value={usdtSearchQuery}
              onChange={(e) => setUsdtSearchQuery(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-green-500 transition-colors w-full sm:w-64"
            />
          </div>

          {/* Table */}
          {loadingUsdtHolders ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading USDT Richlist...</span>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[65vh] rounded-xl pr-2">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] text-gray-500 uppercase tracking-widest">
                    <th className="p-3 w-16 text-center">Rank</th>
                    <th className="p-3">User Email (Gmail)</th>
                    <th className="p-3">Name</th>
                    <th className="p-3 text-green-400">USDT Balance</th>
                    <th className="p-3">Country</th>
                    <th className="p-3">Joined</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usdtHolders
                    .filter(u => {
                      const bal = Number(u.usdtBalance ?? (u as any).USDT ?? (u as any).usdtbalance ?? 0);
                      if (usdtMinFilter === 'above_5' && bal <= 5) return false;
                      if (usdtMinFilter === 'above_0' && bal <= 0) return false;
                      if (usdtSearchQuery.trim()) {
                        const q = usdtSearchQuery.trim().toLowerCase();
                        const name = (u.name || '').toLowerCase();
                        const email = (u.email || '').toLowerCase();
                        const uid = (u.uid || '').toLowerCase();
                        if (!name.includes(q) && !email.includes(q) && !uid.includes(q)) return false;
                      }
                      return true;
                    })
                    .map((u, idx) => {
                      const bal = Number(u.usdtBalance ?? (u as any).USDT ?? (u as any).usdtbalance ?? 0);
                      return (
                        <tr key={u.uid || idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-3 text-center font-black text-sm">
                            {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-white tracking-wide">{u.email || 'No Email'}</span>
                              {u.email && (
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(u.email);
                                    toast.success('Email copied!');
                                  }}
                                  title="Copy Email"
                                  className="text-gray-500 hover:text-white p-1 transition-colors"
                                >
                                  📋
                                </button>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-gray-500 block">UID: {u.uid?.substring(0, 12)}...</span>
                          </td>
                          <td className="p-3 font-bold text-sm text-gray-300 truncate max-w-[150px]">
                            {u.name || 'Anonymous'}
                          </td>
                          <td className="p-3">
                            <span className="font-mono font-black text-base text-green-400 bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/20 inline-block">
                              ${bal.toFixed(4)} USDT
                            </span>
                          </td>
                          <td className="p-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {u.country || 'N/A'}
                          </td>
                          <td className="p-3 text-[10px] font-mono text-gray-500">
                            {u.joinDate ? new Date(u.joinDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setEditBalance((u.balance || 0).toString());
                                setEditUsdtBalance(bal.toString());
                                setEditMiningRate((u.miningRate || 0).toString());
                              }}
                              className="text-[10px] font-bold tracking-widest uppercase bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Edit Balance
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  {usdtHolders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-500 font-bold uppercase tracking-widest text-xs">
                        No USDT holders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'config' && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#FFD700]">App Configuration</h3>
          </div>
          <div className="bg-black/40 p-6 rounded-2xl border border-white/5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold uppercase tracking-widest text-white">Enable Maintenance Mode</label>
                <div 
                  className={`w-12 h-6 rounded-full cursor-pointer transition-colors relative flex items-center ${maintenanceMode ? 'bg-red-500' : 'bg-gray-600'}`}
                  onClick={() => saveMaintenanceMode(!maintenanceMode)}
                >
                  <div className={`absolute left-1 bg-white w-4 h-4 rounded-full transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>
              <p className="text-xs text-gray-500 tracking-wide leading-relaxed">Turn this on to block the app for all non-admin users. A full-screen maintenance message with a WhatsApp channel link will be shown. Admins and existing logged-in admins will still be able to access the app.</p>
          </div>

          <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
              <div className="mb-4">
                <label className="text-sm font-bold uppercase tracking-widest text-white block mb-2">Import Legacy Data (JSON)</label>
                <textarea 
                  id="legacyDataInput"
                  placeholder="Paste JSON array of users here... e.g. [{ email: '...', balance: 10, usdtBalance: 5, cm_coins: 10 }]"
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-300 h-32 focus:outline-none focus:border-[#FFD700]/50"
                ></textarea>
              </div>
              <button 
                onClick={async () => {
                  const input = document.getElementById('legacyDataInput') as HTMLTextAreaElement;
                  if (!input || !input.value.trim()) return alert('Please paste JSON data first.');
                  try {
                    const data = JSON.parse(input.value);
                    if (!Array.isArray(data)) return alert('Data must be a JSON array.');
                    if (!confirm(`Are you sure you want to process ${data.length} records?`)) return;
                    
                    let updated = 0;
                    for (const row of data) {
                      if (!row.email) continue;
                      
                      // Fetch user by email
                      const { data: existing } = await supabase.from('users').select('*').ilike('email', row.email).limit(1);
                      if (existing && existing.length > 0) {
                        const user = existing[0];
                        const updates: any = {};
                        let needsUpdate = false;
                        
                        const newBalance = Math.max(Number(user.balance || 0), Number(row.cm_coins || row.balance || 0));
                        if (newBalance > Number(user.balance || 0)) { 
                          updates.balance = newBalance; 
                          updates['CM Coins'] = newBalance;
                          updates.cm_coins = newBalance;
                          needsUpdate = true; 
                        }
                        
                        const newUsdt = Math.max(Number(user.usdtBalance || 0), Number(row.usdt || row.usdtBalance || row.usdtbalance || 0));
                        if (newUsdt > Number(user.usdtBalance || 0)) { 
                          updates.usdtBalance = newUsdt; 
                          updates['USDT'] = newUsdt;
                          updates.usdtbalance = newUsdt;
                          needsUpdate = true; 
                        }

                        if (needsUpdate) {
                          await supabase.from('users').update(updates).eq('uid', user.uid);
                          updated++;
                        }
                      }
                    }
                    alert(`Migration complete! Updated ${updated} users.`);
                    input.value = '';
                    fetchData();
                  } catch (e: any) {
                    alert('Error parsing or processing JSON: ' + e.message);
                  }
                }}
                className="bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700] hover:text-black border border-[#FFD700]/50 px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
              >
                Start Import Process
              </button>
              <p className="text-xs text-gray-500 tracking-wide mt-4">
                The script will search users by email and update their CM Coins and USDT balances to the provided values if the provided value is higher than their current balance.
              </p>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#FFD700]">Tasks Database</h3>
            <button 
              onClick={() => {
                setIsCreatingTask(true);
                setEditingTask(null);
                setTaskTitle('');
                setTaskReward('0');
                setTaskType('daily');
                setTaskUrl('');
                setTaskAutoApprove(false);
              }}
              className="text-xs px-4 py-2 bg-[#FFD700] text-black font-bold uppercase tracking-widest rounded-xl hover:bg-[#e6c200] transition-colors"
            >
              + Create Task
            </button>
          </div>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                <div>
                  <p className="font-bold text-sm">{task.title}</p>
                  <p className="text-[10px] text-[#FFD700] font-bold tracking-widest mt-1">REWARD: {task.reward} CM | TYPE: {task.type}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      setEditingTask(task);
                      setIsCreatingTask(true);
                      setTaskTitle(task.title || '');
                      setTaskReward((task.reward || 0).toString());
                      setTaskType(task.type || 'daily');
                      setTaskUrl(task.url || '');
                      setTaskAutoApprove(task.autoApprove || false);
                    }}
                    className="text-[10px] px-3 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 font-bold uppercase tracking-widest"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteTask(task.id!)}
                    className="text-[10px] px-3 py-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 font-bold uppercase tracking-widest"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {tasks.length === 0 && !loading && (
              <p className="text-center text-sm text-gray-500 uppercase tracking-widest font-bold">No tasks created yet</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-white/10 pb-6">
            <h3 className="text-xl font-bold uppercase tracking-widest text-[#FFD700]">Pending Task Approvals</h3>
            {claims.filter(c => c.status === 'pending').length > 0 && (
              <div className="flex gap-2">
                <button 
                  onClick={handleApproveAllClaims}
                  className="px-4 py-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 font-bold uppercase tracking-widest text-[10px] border border-green-500/30"
                >
                  Approve All
                </button>
                <button 
                  onClick={handleRejectAllClaims}
                  className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 font-bold uppercase tracking-widest text-[10px] border border-red-500/30"
                >
                  Reject All
                </button>
              </div>
            )}
          </div>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {claims.filter(c => c.status === 'pending').map(claim => {
              const cUser = users.find(u => u.uid === claim.userId);
              return (
                <div key={claim.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 gap-4">
                  <div>
                    <p className="font-bold text-sm">{claim.taskTitle}</p>
                    <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">
                      USER: {claim.userName} ({claim.userEmail})
                    </p>
                    {cUser && (
                      <p className="text-[10px] text-blue-400 font-bold tracking-widest mt-1">
                        ADS WATCHED TODAY: {cUser.adsWatchedToday || 0} | TOTAL ADS: {cUser.totalAdsWatched || 0}
                      </p>
                    )}
                    <p className="text-[10px] text-[#FFD700] font-bold tracking-widest mt-1">REWARD: {claim.reward} CM</p>
                  </div>
                  <div className="flex space-x-2 shrink-0">
                    <button 
                      onClick={() => handleApproveClaim(claim)}
                      className="text-[10px] px-4 py-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 font-bold uppercase tracking-widest"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleRejectClaim(claim)}
                      className="text-[10px] px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 font-bold uppercase tracking-widest"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
            {claims.filter(c => c.status === 'pending').length === 0 && !loading && (
              <p className="text-center text-sm text-gray-500 uppercase tracking-widest font-bold">No pending approvals</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'withdrawals' && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-white/10 pb-6">
            <h3 className="text-xl font-bold uppercase tracking-widest text-[#FFD700]">CM Withdrawal Requests</h3>
            {withdrawals.filter(w => w.status === 'pending').length > 0 && (
              <div className="flex gap-2">
                <button 
                  onClick={handleApproveAllWithdrawals}
                  className="px-4 py-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 font-bold uppercase tracking-widest text-[10px] border border-green-500/30"
                >
                  Approve All
                </button>
                <button 
                  onClick={handleRejectAllWithdrawals}
                  className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 font-bold uppercase tracking-widest text-[10px] border border-red-500/30"
                >
                  Reject All
                </button>
              </div>
            )}
          </div>
          
          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {withdrawals.filter(w => w.status === 'pending').map(w => (
              <div key={w.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 gap-4">
                <div>
                  <p className="font-bold text-[#FFD700] text-sm uppercase tracking-widest">{w.amount} CM <span className="text-gray-400">({(w.amount * 6.0).toFixed(2)} USD)</span></p>
                  <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">WALLET (TRC20 / UID): <span className="text-white break-all">{w.wallet}</span></p>
                  <p className="text-[10px] text-gray-500 font-bold tracking-widest mt-1">USER: {w.userName} ({w.userEmail}) | COUNTRY: {w.country}</p>
                </div>
                <div className="flex space-x-2 shrink-0">
                  <button 
                    onClick={() => handleApproveWithdrawal(w)}
                    className="text-[10px] px-4 py-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 font-bold uppercase tracking-widest"
                  >
                    Mark Paid
                  </button>
                  <button 
                    onClick={() => handleRejectWithdrawal(w)}
                    className="text-[10px] px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 font-bold uppercase tracking-widest"
                  >
                    Reject & Refund
                  </button>
                </div>
              </div>
            ))}
            {withdrawals.filter(w => w.status === 'pending').length === 0 && !loading && (
              <p className="text-center text-sm text-gray-500 uppercase tracking-widest font-bold">No pending CM withdrawals</p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 mt-12 gap-4 border-b border-white/10 pb-6">
            <h3 className="text-xl font-bold uppercase tracking-widest text-green-500">USDT Withdrawal Requests</h3>
            {usdtWithdrawals.filter(w => w.status === 'pending').length > 0 && (
              <div className="flex gap-2">
                <button 
                  onClick={handleApproveAllUsdtWithdrawals}
                  className="px-4 py-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 font-bold uppercase tracking-widest text-[10px] border border-green-500/30"
                >
                  Approve All
                </button>
                <button 
                  onClick={handleRejectAllUsdtWithdrawals}
                  className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 font-bold uppercase tracking-widest text-[10px] border border-red-500/30"
                >
                  Reject All
                </button>
              </div>
            )}
          </div>
          
          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {usdtWithdrawals.filter(w => w.status === 'pending').map(w => (
              <div key={w.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/40 rounded-2xl border border-green-500/20 gap-4">
                <div>
                  <p className="font-bold text-green-500 text-sm uppercase tracking-widest">
                    {w.amount} USDT <span className="text-gray-400 text-[10px] ml-2">VIA {w.method || 'TRC20 / UID'}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">WALLET: <span className="text-white break-all">{w.wallet}</span></p>
                  <p className="text-[10px] text-gray-500 font-bold tracking-widest mt-1">USER: {w.userName} ({w.userEmail}) | COUNTRY: {w.country} | REQUESTED: {new Date(w.requestedAt).toLocaleString()}</p>
                </div>
                <div className="flex space-x-2 shrink-0">
                  <button 
                    onClick={() => handleApproveUsdtWithdrawal(w)}
                    className="text-[10px] px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 font-black uppercase tracking-widest"
                  >
                    Mark Paid
                  </button>
                  <button 
                    onClick={() => handleRejectUsdtWithdrawal(w)}
                    className="text-[10px] px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 font-bold uppercase tracking-widest"
                  >
                    Reject & Refund
                  </button>
                </div>
              </div>
            ))}
            {usdtWithdrawals.filter(w => w.status === 'pending').length === 0 && !loading && (
              <p className="text-center text-sm text-gray-500 uppercase tracking-widest font-bold">No pending USDT withdrawals</p>
            )}
          </div>

          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mt-16 mb-4">Past Withdrawals (Combined)</h3>
          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar opacity-70">
            {[...withdrawals, ...usdtWithdrawals].filter(w => w.status !== 'pending').sort((a,b) => b.requestedAt - a.requestedAt).map(w => (
              <div key={w.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 gap-4">
                <div>
                  <p className={`font-bold text-sm uppercase tracking-widest ${w.currency === 'USDT' ? 'text-green-500' : 'text-gray-300'}`}>
                    {w.amount} {w.currency || 'CM'} {w.currency === 'USDT' && <span className="text-[10px] text-gray-500 ml-2">VIA {w.method || 'TRC20 / UID'}</span>}
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold tracking-widest mt-1">WALLET: <span className="break-all text-gray-400">{w.wallet}</span> | USER: {w.userEmail}</p>
                  {w.status === 'approved' && w.txHash && (
                    <p className="text-[10px] text-green-500 font-mono mt-1 break-all">TXID: {w.txHash}</p>
                  )}
                  {w.status === 'rejected' && w.rejectionReason && (
                    <p className="text-[10px] text-red-500 font-medium mt-1">Reason: {w.rejectionReason}</p>
                  )}
                </div>
                <span className={`text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-bold ${w.status === 'approved' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                  {w.status}
                </span>
              </div>
            ))}
            {[...withdrawals, ...usdtWithdrawals].filter(w => w.status !== 'pending').length === 0 && !loading && (
              <p className="text-[10px] text-gray-600 uppercase tracking-widest">No past withdrawals.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'competition' && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-6">
            <h3 className="text-xl font-bold uppercase tracking-widest text-[#FFD700]">Ads & Tasks Competition</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-full">Score = Ads Watched + CM Ads + Tasks Completed</p>
          </div>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {users.slice().sort((a,b) => {
              const scoreA = (a.totalAdsWatched || 0) + (a.totalCmAdsWatched || 0) + (a.totalTasksCompleted || 0);
              const scoreB = (b.totalAdsWatched || 0) + (b.totalCmAdsWatched || 0) + (b.totalTasksCompleted || 0);
              return scoreB - scoreA;
            }).map((u, idx) => {
              const score = (u.totalAdsWatched || 0) + (u.totalCmAdsWatched || 0) + (u.totalTasksCompleted || 0);
              if (score === 0) return null; // You can show them or not, but hiding those with 0 score makes sense
              
              const isTop3 = idx < 3;
              let rankColor = 'text-white/50';
              if (idx === 0) rankColor = 'text-yellow-400 bg-yellow-400/10 shadow-[0_0_15px_rgba(250,204,21,0.2)]';
              else if (idx === 1) rankColor = 'text-gray-300 bg-gray-300/10';
              else if (idx === 2) rankColor = 'text-amber-600 bg-amber-600/10';

              return (
                <div key={u.uid} className={`flex items-center justify-between p-4 bg-black/40 rounded-2xl border ${isTop3 ? 'border-[#FFD700]/30' : 'border-white/5'} gap-4 transition-all hover:bg-black/60`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full font-black text-lg ${rankColor} border border-white/5`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-sm sm:text-base text-white">{u.name || 'Anonymous'}</p>
                      <p className="text-[10px] text-gray-400 font-mono tracking-widest mt-0.5 max-w-[150px] sm:max-w-xs truncate">{u.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 sm:gap-8 items-center text-right shrink-0">
                    <div className="hidden sm:block">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Ads</p>
                      <p className="font-mono font-bold text-green-400">{u.totalAdsWatched || 0}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Tasks</p>
                      <p className="font-mono font-bold text-blue-400">{u.totalTasksCompleted || 0}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 min-w-[80px]">
                      <p className="text-[10px] text-[#FFD700] font-black uppercase tracking-widest mb-1 leading-none">Score</p>
                      <p className="font-mono font-black text-white text-lg leading-none">{score}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {users.filter(u => ((u.totalAdsWatched || 0) + (u.totalCmAdsWatched || 0) + (u.totalTasksCompleted || 0)) > 0).length === 0 && !loading && (
              <p className="text-center text-sm text-gray-500 uppercase tracking-widest font-bold py-8">No competition data yet</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'ads' && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#FFD700]">Global Advertisement Configuration</h3>
          </div>
          
          <div className="space-y-6">
            <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold uppercase tracking-widest text-white">Enable Global Ads Display</label>
                <div 
                  className={`w-12 h-6 rounded-full cursor-pointer transition-colors relative flex items-center ${showAds ? 'bg-green-500' : 'bg-gray-600'}`}
                  onClick={() => setShowAds(!showAds)}
                >
                  <div className={`absolute left-1 bg-white w-4 h-4 rounded-full transition-transform ${showAds ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>
              <p className="text-xs text-gray-500 tracking-wide leading-relaxed">Turn this on to render Adsterra snippets or AdMob integrations automatically in the main Dashboard and Task Views across the application.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Adsterra Snippet (Native HTML & Scripts)</label>
                <textarea 
                  rows={5}
                  value={adsterraSnippet} 
                  onChange={(e) => setAdsterraSnippet(e.target.value)}
                  placeholder="Paste your <div> and <script> payload here..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 focus:border-[#FFD700] outline-none transition-colors font-mono text-sm text-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">AdMob App/Banner ID (Optional)</label>
                <input 
                  type="text" 
                  value={admobBannerId} 
                  onChange={(e) => setAdmobBannerId(e.target.value)}
                  placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 focus:border-[#FFD700] outline-none transition-colors font-mono text-sm text-gray-300"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex gap-4">
              <button 
                onClick={saveAdsSettings}
                className="bg-[#FFD700] text-black px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#F2C800] transition-colors"
               >
                 Save Global Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ad_logs' && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#FFD700]">Ad Logs & Tracking</h3>
          </div>
          
          <div className="mb-8 bg-black/40 border border-white/5 rounded-2xl p-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Time Interval Between Ad Views</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: '< 5s', count: adLogs.filter(l => l.timeGapSeconds !== undefined && l.timeGapSeconds !== null && l.timeGapSeconds < 5).length },
                  { name: '5-15s', count: adLogs.filter(l => l.timeGapSeconds !== undefined && l.timeGapSeconds !== null && l.timeGapSeconds >= 5 && l.timeGapSeconds < 15).length },
                  { name: '15-30s', count: adLogs.filter(l => l.timeGapSeconds !== undefined && l.timeGapSeconds !== null && l.timeGapSeconds >= 15 && l.timeGapSeconds < 30).length },
                  { name: '30-60s', count: adLogs.filter(l => l.timeGapSeconds !== undefined && l.timeGapSeconds !== null && l.timeGapSeconds >= 30 && l.timeGapSeconds < 60).length },
                  { name: '1-5m', count: adLogs.filter(l => l.timeGapSeconds !== undefined && l.timeGapSeconds !== null && l.timeGapSeconds >= 60 && l.timeGapSeconds < 300).length },
                  { name: '> 5m', count: adLogs.filter(l => l.timeGapSeconds !== undefined && l.timeGapSeconds !== null && l.timeGapSeconds >= 300).length }
                ]}>
                  <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#FFD700' }}
                  />
                  <Bar dataKey="count" fill="#FFD700" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-4 text-center">Spikes in the left-side columns ({'<'} 15s) may indicate rapid clicking or automation.</p>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {adLogs.map(log => (
              <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 gap-4">
                <div>
                  <p className="font-bold text-sm text-[#FFD700] uppercase tracking-widest">{log.adNetwork.includes('USDT') ? 'USDT Ad' : 'CM Ad'} - {log.adNetwork}</p>
                  <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">USER: {log.userName || log.userId} ({log.userEmail || 'N/A'})</p>
                  <p className="text-[10px] text-gray-500 font-bold tracking-widest mt-1">TIME: {new Date(log.timestamp).toLocaleString()}</p>
                  {log.timeGapSeconds !== null && log.timeGapSeconds !== undefined && (
                    <p className={`text-[10px] font-bold tracking-widest mt-1 ${log.timeGapSeconds < 15 ? 'text-red-500' : 'text-green-500'}`}>
                      TIME SINCE LAST WATCH: {log.timeGapSeconds} SECONDS
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-black text-white">REWARD: {log.reward}</p>
                  <p className="text-[10px] text-gray-500 tracking-widest mt-1 font-bold uppercase">COUNTRY: {log.country}</p>
                </div>
              </div>
            ))}
            {adLogs.length === 0 && !loading && (
              <p className="text-center text-sm text-gray-500 uppercase tracking-widest font-bold">No ads watched yet.</p>
            )}
          </div>
        </div>
      )}

      {/* User Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">Edit {editingUser.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">CM Balance</label>
                <input 
                  type="number" 
                  value={editBalance} 
                  onChange={(e) => setEditBalance(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 focus:border-[#FFD700] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-green-500 font-bold mb-2">USDT Balance</label>
                <input 
                  type="number" 
                  value={editUsdtBalance} 
                  onChange={(e) => setEditUsdtBalance(e.target.value)}
                  className="w-full bg-black/50 border border-green-500/30 rounded-xl p-3 focus:border-green-500 outline-none transition-colors text-white"
                  step="0.0001"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Mining Rate (per hr)</label>
                <input 
                  type="number" 
                  value={editMiningRate} 
                  onChange={(e) => setEditMiningRate(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 focus:border-[#FFD700] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">KYC Verification Status</label>
                <select
                  value={editKycStatus}
                  onChange={(e) => setEditKycStatus(e.target.value)}
                  className="w-full bg-black/50 border border-emerald-500/30 rounded-xl p-3 focus:border-emerald-500 outline-none transition-colors text-white"
                >
                  <option value="unverified">Unverified</option>
                  <option value="pending">Pending Review</option>
                  <option value="verified">Verified (Approved) ✓</option>
                  <option value="rejected">Rejected ✕</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-purple-400 font-bold mb-2">Validator Node Status</label>
                <select
                  value={editNodeStatus}
                  onChange={(e) => setEditNodeStatus(e.target.value)}
                  className="w-full bg-black/50 border border-purple-500/30 rounded-xl p-3 focus:border-purple-500 outline-none transition-colors text-white"
                >
                  <option value="none">Standard Miner (No Node)</option>
                  <option value="applied">Application Pending</option>
                  <option value="approved">Approved Node Operator ⚡ (P2P Enabled)</option>
                  <option value="rejected">Application Rejected</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-4 mt-8">
              <button 
                onClick={() => setEditingUser(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 rounded-xl py-3 font-bold uppercase tracking-widest text-xs transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveUser}
                className="flex-1 bg-[#FFD700] text-black hover:bg-[#e6c200] rounded-xl py-3 font-bold uppercase tracking-widest text-xs transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Edit/Create Modal */}
      {isCreatingTask && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">{editingTask ? 'Edit Task' : 'Create Task'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Task Title</label>
                <input 
                  type="text" 
                  value={taskTitle} 
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 focus:border-[#FFD700] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Reward Amount (CM)</label>
                <input 
                  type="number" 
                  value={taskReward} 
                  onChange={(e) => setTaskReward(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 focus:border-[#FFD700] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Type</label>
                <select 
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as AppTask['type'])}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 focus:border-[#FFD700] outline-none transition-colors appearance-none"
                >
                  <option value="daily">Daily / General</option>
                  <option value="twitter">Twitter</option>
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="ad">Ad Watching</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Task Link (URL / Optional)</label>
                <input 
                  type="url" 
                  value={taskUrl} 
                  onChange={(e) => setTaskUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 focus:border-[#FFD700] outline-none transition-colors"
                />
              </div>
              <div className="flex items-center gap-3 mt-4">
                <input
                  type="checkbox"
                  id="autoApprove"
                  checked={taskAutoApprove}
                  onChange={(e) => setTaskAutoApprove(e.target.checked)}
                  className="w-5 h-5 accent-[#FFD700]"
                />
                <label htmlFor="autoApprove" className="text-xs uppercase tracking-widest text-gray-500 font-bold cursor-pointer">
                  Auto Approve (Reward given immediately on claim)
                </label>
              </div>
            </div>
            <div className="flex space-x-4 mt-8">
              <button 
                onClick={() => setIsCreatingTask(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 rounded-xl py-3 font-bold uppercase tracking-widest text-xs transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveTask}
                className="flex-1 bg-[#FFD700] text-black hover:bg-[#e6c200] rounded-xl py-3 font-bold uppercase tracking-widest text-xs transition-colors"
              >
                {editingTask ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
