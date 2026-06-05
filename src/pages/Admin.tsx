import { useApp } from '../hooks/useAppStore';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { UserProfile, Task as AppTask, TaskClaim } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';

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
  const [activeTab, setActiveTab] = useState<'users' | 'tasks' | 'approvals' | 'ads' | 'ad_logs' | 'withdrawals' | 'competition' | 'config' | 'all_data'>('users');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Ads Settings State
  const [showAds, setShowAds] = useState(false);
  const [adsterraSnippet, setAdsterraSnippet] = useState('');
  const [admobBannerId, setAdmobBannerId] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
      fetchAdsSettings();
      fetchAppSettings();
    }
  }, [user]);

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
      await supabase.from('settings').update({ maintenanceMode: newMode }).eq('id', 'app');
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

  const fetchData = async () => {
    try {
      const { data: userData } = await supabase.from('users').select('*').limit(50000);
      if (userData) setUsers(userData as UserProfile[]);

      const { count: uCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      if (uCount !== null) setTotalUsersCount(uCount);

      const { data: tasksData } = await supabase.from('tasks').select('*').limit(10000);
      if (tasksData) setTasks(tasksData);

      const { data: claimsData } = await supabase.from('taskClaims').select('*').limit(50000);
      if (claimsData) {
        setClaims(claimsData.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
      }

      const { data: wData } = await supabase.from('withdrawals').select('*').limit(50000);
      if (wData) {
        setWithdrawals(wData.sort((a, b) => (b.requestedAt || 0) - (a.requestedAt || 0)));
      }

      const { data: wuData } = await supabase.from('withdrawals_usdt').select('*').limit(50000);
      if (wuData) {
        setUsdtWithdrawals(wuData.sort((a, b) => (b.requestedAt || 0) - (a.requestedAt || 0)));
      }

      const { data: adLogData } = await supabase.from('ads_log').select('*').limit(50000);
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
      await supabase.from('users').update({
        balance: parseFloat(editBalance) || 0,
        usdtBalance: parseFloat(editUsdtBalance) || 0,
        miningRate: parseFloat(editMiningRate) || 0,
      }).eq('uid', editingUser.uid);
      setEditingUser(null);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

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
      };

      if (editingTask) {
        await supabase.from('tasks').update(taskData).eq('id', editingTask.id);
      } else {
        const id = 'task_' + Date.now();
        await supabase.from('tasks').insert([{ id, ...taskData }]);
      }

      setEditingTask(null);
      setIsCreatingTask(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await supabase.from('tasks').delete().eq('id', id);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveClaim = async (claim: TaskClaim) => {
    try {
      const u = users.find(usr => usr.uid === claim.userId || usr.UID === claim.userId);
      if (u) {
        await supabase.from('users').update({
          balance: (u.balance || 0) + Number(claim.reward),
          totalTasksCompleted: (u.totalTasksCompleted || 0) + 1
        }).or(`uid.eq.${claim.userId},UID.eq.${claim.userId}`);
      }
      
      const txId = 'tx_' + Date.now();
      await supabase.from('transactions').insert([{
        id: txId,
        type: 'task_reward',
        amount: Number(claim.reward),
        timestamp: Date.now(),
        status: 'completed',
        receiverUid: claim.userId,
        description: `Admin approved task: ${claim.taskTitle}`
      }]);
      
      await supabase.from('completedTasks').upsert({
        id: `${claim.userId}_${claim.taskId}`,
        userId: claim.userId,
        status: 'completed',
        taskId: claim.taskId,
        completedAt: Date.now()
      });
      
      await supabase.from('taskClaims').update({
        status: 'approved'
      }).eq('id', claim.id);

      fetchData();
    } catch (e: any) {
      console.error('Error approving task:', e);
    }
  };

  const handleRejectClaim = async (claim: TaskClaim) => {
    try {
      await supabase.from('completedTasks').delete().match({ userId: claim.userId, taskId: claim.taskId });
      
      await supabase.from('taskClaims').update({
        status: 'rejected'
      }).eq('id', claim.id);

      fetchData();
    } catch (e: any) {
      console.error('Error rejecting task:', e);
    }
  };

  const handleApproveAllClaims = async () => {
    if (!window.confirm('Are you sure you want to approve ALL pending tasks?')) return;
    try {
      const pendingClaims = claims.filter(c => c.status === 'pending');
      if (pendingClaims.length === 0) {
        toast.error("No pending tasks to approve.");
        return;
      }
      
      setLoading(true);

      // Group reward amounts and completion counts by userId
      const userUpdates = new Map<string, { rewardSum: number, completedCount: number }>();
      for (const claim of pendingClaims) {
        const uId = claim.userId;
        const current = userUpdates.get(uId) || { rewardSum: 0, completedCount: 0 };
        current.rewardSum += Number(claim.reward);
        current.completedCount += 1;
        userUpdates.set(uId, current);
      }

      // 1. Fetch latest balance and complete counts for each user, then increase
      // This defends against stale state or concurrent balance changes
      for (const [userId, update] of userUpdates.entries()) {
        const { data: dbUser } = await supabase
          .from('users')
          .select('balance, totalTasksCompleted, uid')
          .or(`uid.eq.${userId},UID.eq.${userId}`)
          .single();

        const currentBalance = dbUser ? (dbUser.balance || 0) : 0;
        const currentCompleted = dbUser ? (dbUser.totalTasksCompleted || 0) : 0;
        const realUid = dbUser?.uid || userId;

        await supabase.from('users').update({
          balance: currentBalance + update.rewardSum,
          totalTasksCompleted: currentCompleted + update.completedCount
        }).or(`uid.eq.${realUid},UID.eq.${realUid}`);
      }

      // 2. Prepare transaction insertions in bulk
      const transactionsToInsert = pendingClaims.map(claim => {
        const txId = 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        return {
          id: txId,
          type: 'task_reward',
          amount: Number(claim.reward),
          timestamp: Date.now(),
          status: 'completed',
          receiverUid: claim.userId,
          description: `Admin approved task: ${claim.taskTitle}`
        };
      });

      if (transactionsToInsert.length > 0) {
        for (let i = 0; i < transactionsToInsert.length; i += 100) {
          const batch = transactionsToInsert.slice(i, i + 100);
          await supabase.from('transactions').insert(batch);
        }
      }

      // 3. Prepare completed tasks upserts in bulk
      const completedTasksToUpsert = pendingClaims.map(claim => ({
        id: `${claim.userId}_${claim.taskId}`,
        userId: claim.userId,
        status: 'completed',
        taskId: claim.taskId,
        completedAt: Date.now()
      }));

      if (completedTasksToUpsert.length > 0) {
        for (let i = 0; i < completedTasksToUpsert.length; i += 100) {
          const batch = completedTasksToUpsert.slice(i, i + 100);
          await supabase.from('completedTasks').upsert(batch);
        }
      }

      // 4. Update task claims in bulk
      const claimIds = pendingClaims.map(c => c.id);
      for (let i = 0; i < claimIds.length; i += 100) {
        const batch = claimIds.slice(i, i + 100);
        await supabase.from('taskClaims').update({ status: 'approved' }).in('id', batch);
      }

      toast.success(`Successfully approved ${pendingClaims.length} tasks!`);
      fetchData();
    } catch (e: any) {
      console.error('Error batch approving tasks:', e);
      toast.error('Failed to batch approve tasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAllClaims = async () => {
    if (!window.confirm('Are you sure you want to reject ALL pending tasks?')) return;
    try {
      const pendingClaims = claims.filter(c => c.status === 'pending');
      if (pendingClaims.length === 0) {
        toast.error("No pending tasks to reject.");
        return;
      }

      setLoading(true);

      // 1. Delete completed tasks in bulk
      const completedTaskIds = pendingClaims.map(claim => `${claim.userId}_${claim.taskId}`);
      if (completedTaskIds.length > 0) {
        for (let i = 0; i < completedTaskIds.length; i += 100) {
          const batch = completedTaskIds.slice(i, i + 100);
          await supabase.from('completedTasks').delete().in('id', batch);
        }
      }

      // 2. Bulk update status of claims to 'rejected'
      const claimIds = pendingClaims.map(c => c.id);
      for (let i = 0; i < claimIds.length; i += 100) {
        const batch = claimIds.slice(i, i + 100);
        await supabase.from('taskClaims').update({ status: 'rejected' }).in('id', batch);
      }

      toast.success(`Successfully rejected ${pendingClaims.length} tasks!`);
      fetchData();
    } catch (e: any) {
      console.error('Error batch rejecting tasks:', e);
      toast.error('Failed to batch reject tasks.');
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

      const u = users.find(usr => usr.uid === w.userId || usr.UID === w.userId);
      if (u) {
        await supabase.from('users').update({ balance: (u.balance || 0) + w.amount }).or(`uid.eq.${w.userId},UID.eq.${w.userId}`);
      }

      fetchData();
    } catch (e: any) {
      console.error('Error rejecting withdrawal:', e);
    }
  };

  const handleApproveAllWithdrawals = async () => {
    if (!window.confirm('Are you sure you want to approve ALL pending CM withdrawals?')) return;
    try {
      const pending = withdrawals.filter(w => w.status === 'pending');
      if (pending.length === 0) return;
      
      for (const w of pending) {
        await handleApproveWithdrawal(w);
      }
      fetchData();
    } catch (e: any) {
      console.error('Error batch approving CM withdrawals:', e);
    }
  };

  const handleRejectAllWithdrawals = async () => {
    if (!window.confirm('Are you sure you want to reject ALL pending CM withdrawals?')) return;
    try {
      const pending = withdrawals.filter(w => w.status === 'pending');
      if (pending.length === 0) return;
      
      for (const w of pending) {
        await handleRejectWithdrawal(w);
      }
      fetchData();
    } catch (e: any) {
      console.error('Error batch rejecting CM withdrawals:', e);
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

      const u = users.find(usr => usr.uid === w.userId || usr.UID === w.userId);
      if (u) {
        await supabase.from('users').update({ usdtBalance: (u.usdtBalance || 0) + w.amount }).or(`uid.eq.${w.userId},UID.eq.${w.userId}`);
      }

      fetchData();
    } catch (e: any) {
      console.error('Error rejecting USDT withdrawal:', e);
    }
  };

  const handleApproveAllUsdtWithdrawals = async () => {
    if (!window.confirm('Are you sure you want to approve ALL pending USDT withdrawals?')) return;
    try {
      const pending = usdtWithdrawals.filter(w => w.status === 'pending');
      if (pending.length === 0) return;
      
      for (const w of pending) {
        await supabase.from('withdrawals_usdt').update({ status: 'approved' }).eq('id', w.id);
        if (w.transactionId) {
          await supabase.from('transactions').update({ status: 'approved' }).eq('id', w.transactionId);
        }
      }
      fetchData();
    } catch (e: any) {
      console.error('Error batch approving USDT withdrawals:', e);
    }
  };

  const handleRejectAllUsdtWithdrawals = async () => {
    if (!window.confirm('Are you sure you want to reject ALL pending USDT withdrawals?')) return;
    try {
      const pending = usdtWithdrawals.filter(w => w.status === 'pending');
      if (pending.length === 0) return;
      
      for (const w of pending) {
        await handleRejectUsdtWithdrawal(w);
      }
      fetchData();
    } catch (e: any) {
      console.error('Error batch rejecting USDT withdrawals:', e);
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="text-center p-12 text-red-500 font-bold uppercase tracking-widest">Unauthorized Access</div>;
  }

  const totalMined = users.reduce((acc, curr) => acc + (curr.totalMined || 0), 0);
  const totalBalance = users.reduce((acc, curr) => acc + (curr.balance || 0), 0);

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Total Users</p>
          <p className="text-4xl font-black">{loading ? '...' : totalUsersCount}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Global Liquidity</p>
          <p className="text-4xl font-mono font-black text-[#FFD700]">{loading ? '...' : formatCurrency(totalBalance)}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Total Mined</p>
          <p className="text-4xl font-mono font-black">{loading ? '...' : formatCurrency(totalMined)}</p>
        </div>
      </div>

      <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors whitespace-nowrap ${activeTab === 'users' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
        >
          Users
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
                onClick={() => {
                  const header = ['UID', 'Name', 'Email', 'Country', 'CM Coins', 'USDT', 'Referral Code', 'Referred By', 'Ref Count', 'Joined At'];
                  const rows = users.map(u => [
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
                  
                  try {
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
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">Ads Watched</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">Status</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">CM Balance</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest text-green-500">USDT Balance</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">Role</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => {
                if (!searchQuery.trim()) return true;
                const lowerQ = searchQuery.toLowerCase();
                const userName = u.name || '';
                const userEmail = u.email || '';
                return userName.toLowerCase().includes(lowerQ) || userEmail.toLowerCase().includes(lowerQ);
              }).map((u) => (
                <tr key={u.uid} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-sm truncate max-w-[150px]">{u.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono truncate max-w-[150px]">{u.email}</div>
                  </td>
                  <td className="p-3 text-xs font-bold text-gray-300 uppercase tracking-widest">{u.country || 'N/A'}</td>
                  <td className="p-3 font-mono font-bold text-[#FFD700]">{u.totalAdsWatched || 0}</td>
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
                        if (newBalance > Number(user.balance || 0)) { updates.balance = newBalance; needsUpdate = true; }
                        
                        const newUsdt = Math.max(Number(user.usdtBalance || 0), Number(row.usdt || row.usdtBalance || row.usdtbalance || 0));
                        if (newUsdt > Number(user.usdtBalance || 0)) { updates.usdtBalance = newUsdt; needsUpdate = true; }

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
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-full">Score = Ads Watched + Tasks Completed</p>
          </div>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {users.slice().sort((a,b) => {
              const scoreA = (a.totalAdsWatched || 0) + (a.totalTasksCompleted || 0);
              const scoreB = (b.totalAdsWatched || 0) + (b.totalTasksCompleted || 0);
              return scoreB - scoreA;
            }).map((u, idx) => {
              const score = (u.totalAdsWatched || 0) + (u.totalTasksCompleted || 0);
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
            
            {users.filter(u => ((u.totalAdsWatched || 0) + (u.totalTasksCompleted || 0)) > 0).length === 0 && !loading && (
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
                  <p className="font-bold text-sm text-[#FFD700] uppercase tracking-widest">{log.reward > 0.01 ? 'CM Ad' : 'USDT Ad'} - {log.adNetwork}</p>
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
