import { useApp } from '../hooks/useAppStore';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { UserProfile, Task as AppTask, TaskClaim } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';

import { ShieldAlert } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'users' | 'usdt_holders' | 'tasks' | 'approvals' | 'ads' | 'ad_logs' | 'withdrawals' | 'competition' | 'config' | 'all_data'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [globalStats, setGlobalStats] = useState({ totalBalance: 0, totalMined: 0, totalUsdtBalance: 0 });

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
      const { error } = await supabase.from('settings').upsert({ id: 'app', maintenanceMode: newMode });
      if (error && error.code === '42501') {
         alert("Cannot save maintenance mode due to database permissions. Please go to your Supabase SQL Editor and run:\n\nINSERT INTO settings (id, \"maintenanceMode\") VALUES ('app', false);");
         return;
      }
      setMaintenanceMode(newMode);
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
          setUsers(data as UserProfile[]);
        }
      } catch (err) {
        console.error("Search error", err);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, user]);

  const fetchData = async () => {
    try {
      const { data: userData } = await supabase.from('users').select('*').order('joinDate', { ascending: false, nullsFirst: false }).limit(2000);
      if (userData) setUsers(userData as UserProfile[]);

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
      }).eq('uid', editingUser.uid);
      setEditingUser(null);
      fetchData();
      fetchUsdtHolders();
    } catch (e) {
      console.error(e);
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

  if (!user || user.role !== 'admin') {
    return <div className="text-center p-12 text-red-500 font-bold uppercase tracking-widest">Unauthorized Access</div>;
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

      <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors whitespace-nowrap ${activeTab === 'users' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
        >
          Users
        </button>
        <button 
          onClick={() => {
            setActiveTab('usdt_holders');
            fetchUsdtHolders();
          }}
          className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors whitespace-nowrap ${activeTab === 'usdt_holders' ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-white/5 text-green-400 hover:bg-white/10'}`}
        >
          💰 USDT Holders
        </button>
        <button 
          onClick={() => setActiveTab('all_data')}
          className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors whitespace-nowrap ${activeTab === 'all_data' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
        >
          All Data
        </button>
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors whitespace-nowrap ${activeTab === 'tasks' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
        >
          Tasks
        </button>
        <button 
          onClick={() => setActiveTab('approvals')}
          className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors ${activeTab === 'approvals' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
        >
          Approvals
        </button>
        <button 
          onClick={() => setActiveTab('config')}
          className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors ${activeTab === 'config' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
        >
          App Config
        </button>
        <button 
          onClick={() => setActiveTab('ads')}
          className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors ${activeTab === 'ads' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
        >
          Ads Config
        </button>
        <button 
          onClick={() => setActiveTab('ad_logs')}
          className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors ${activeTab === 'ad_logs' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
        >
          Ad Logs
        </button>
        <button 
          onClick={() => setActiveTab('withdrawals')}
          className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors ${activeTab === 'withdrawals' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
        >
          Withdrawals
        </button>
        <button 
          onClick={() => setActiveTab('competition')}
          className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors ${activeTab === 'competition' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
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
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">USDT Ads</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest text-blue-400">CM Ads</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">Status</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">CM Balance</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest text-green-500">USDT Balance</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">Role</th>
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
                  <td className="p-3 font-mono font-bold text-[#FFD700]">{u.totalAdsWatched || 0}</td>
                  <td className="p-3 font-mono font-bold text-blue-400">{u.totalCmAdsWatched || 0}</td>
                  <td className="p-3">
                    <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold ${u.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {u.isActive ? 'Active' : 'Blocked'}
                    </span>
                    <br />
                    <span className={`text-[10px] px-2 py-1 mt-1 inline-block rounded-full uppercase tracking-widest font-bold ${!u.transactionsBlocked ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}`}>
                      {!u.transactionsBlocked ? 'TX Allowed' : 'TX Blocked'}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-[#FFD700]">{formatCurrency(u.balance)}</td>
                  <td className="p-3 font-mono font-bold text-green-500">${(u.usdtBalance || 0).toFixed(4)}</td>
                  <td className="p-3">
                    <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold ${u.role === 'admin' ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-gray-300'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button 
                      onClick={() => handleToggleTxStatus(u.uid, !!u.transactionsBlocked)}
                      className="text-[10px] font-bold tracking-widest uppercase bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors mb-2 sm:mb-0"
                    >
                      {!u.transactionsBlocked ? 'Block Tx' : 'Unblock Tx'}
                    </button>
                    <button 
                      onClick={() => handleToggleUserStatus(u.uid, u.isActive)}
                      className="text-[10px] font-bold tracking-widest uppercase bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {u.isActive ? 'Block' : 'Unblock'}
                    </button>
                    <button 
                      onClick={() => {
                        setEditingUser(u);
                        setEditBalance((u.balance || 0).toString());
                        setEditUsdtBalance((u.usdtBalance || 0).toString());
                        setEditMiningRate((u.miningRate || 0).toString());
                      }}
                      className="text-[10px] font-bold tracking-widest uppercase bg-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/30 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Edit Rate/Bal
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
