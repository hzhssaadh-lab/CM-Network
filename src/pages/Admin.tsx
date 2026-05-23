import { useApp } from '../hooks/useAppStore';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, updateDoc, setDoc, deleteDoc, writeBatch, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { formatCurrency } from '../lib/utils';
import { UserProfile, Task as AppTask, TaskClaim } from '../types';
import { runTransaction } from 'firebase/firestore';

export function Admin() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tasks, setTasks] = useState<AppTask[]>([]);
  const [claims, setClaims] = useState<TaskClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'tasks' | 'approvals'>('users');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit User State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [editMiningRate, setEditMiningRate] = useState('');

  // Edit Task State
  const [editingTask, setEditingTask] = useState<AppTask | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskReward, setTaskReward] = useState('');
  const [taskType, setTaskType] = useState<AppTask['type']>('daily');
  const [taskUrl, setTaskUrl] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const q = query(collection(db, 'users'));
      const snap = await getDocs(q);
      const userData: UserProfile[] = [];
      snap.docs.forEach(d => userData.push(d.data() as UserProfile));
      setUsers(userData);

      const tq = query(collection(db, 'tasks'));
      const tSnap = await getDocs(tq);
      const tasksData: AppTask[] = [];
      tSnap.docs.forEach(d => tasksData.push({ id: d.id, ...d.data() } as AppTask));
      setTasks(tasksData);

      const cQ = query(collection(db, 'taskClaims'));
      const cSnap = await getDocs(cQ);
      const claimsData: TaskClaim[] = [];
      cSnap.docs.forEach(d => claimsData.push({ id: d.id, ...d.data() } as TaskClaim));
      setClaims(claimsData.sort((a, b) => b.timestamp - a.timestamp));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      await updateDoc(doc(db, 'users', editingUser.uid), {
        balance: parseFloat(editBalance) || 0,
        miningRate: parseFloat(editMiningRate) || 0,
      });
      setEditingUser(null);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleUserStatus = async (uid: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        isActive: !currentStatus
      });
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
        await updateDoc(doc(db, 'tasks', editingTask.id), taskData);
      } else {
        const newRef = doc(collection(db, 'tasks'));
        await setDoc(newRef, { id: newRef.id, ...taskData });
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
      await deleteDoc(doc(db, 'tasks', id));
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveClaim = async (claim: TaskClaim) => {
    try {
      const batch = writeBatch(db);
      
      const userRef = doc(db, 'users', claim.userId);
      batch.update(userRef, { balance: increment(claim.reward) });
      
      const txRef = doc(collection(db, 'transactions'));
      batch.set(txRef, {
        type: 'task_reward',
        amount: claim.reward,
        timestamp: Date.now(),
        status: 'completed',
        receiverUid: claim.userId,
        description: `Admin approved task: ${claim.taskTitle}`
      });
      
      const completedTaskRef = doc(db, 'users', claim.userId, 'completedTasks', claim.taskId);
      batch.set(completedTaskRef, {
        status: 'completed',
        taskId: claim.taskId,
        completedAt: Date.now()
      }, { merge: true });
      
      const claimRef = doc(db, 'taskClaims', claim.id);
      batch.update(claimRef, {
        status: 'approved'
      });

      await batch.commit();
      fetchData();
    } catch (e: any) {
      console.error('Error approving task:', e);
    }
  };

  const handleRejectClaim = async (claim: TaskClaim) => {
    try {
      const batch = writeBatch(db);

      const completedTaskRef = doc(db, 'users', claim.userId, 'completedTasks', claim.taskId);
      batch.delete(completedTaskRef); // Delete so they can try again if they want
      
      const claimRef = doc(db, 'taskClaims', claim.id);
      batch.update(claimRef, {
        status: 'rejected'
      });

      await batch.commit();
      fetchData();
    } catch (e: any) {
      console.error('Error rejecting task:', e);
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
          <p className="text-4xl font-black">{loading ? '...' : users.length}</p>
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

      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors ${activeTab === 'users' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
        >
          Users
        </button>
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors ${activeTab === 'tasks' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
        >
          Tasks
        </button>
        <button 
          onClick={() => setActiveTab('approvals')}
          className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors ${activeTab === 'approvals' ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
        >
          Approvals
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 overflow-x-auto">
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
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">User</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">Status</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">Balance</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">Mining / hr</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest">Role</th>
                <th className="p-3 text-[10px] text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => {
                if (!searchQuery.trim()) return true;
                const lowerQ = searchQuery.toLowerCase();
                return u.name.toLowerCase().includes(lowerQ) || u.email.toLowerCase().includes(lowerQ);
              }).map((u) => (
                <tr key={u.uid} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-sm truncate max-w-[150px]">{u.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono truncate max-w-[150px]">{u.email}</div>
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold ${u.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {u.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-[#FFD700]">{formatCurrency(u.balance)}</td>
                  <td className="p-3 font-mono font-bold">{formatCurrency(u.miningRate)}</td>
                  <td className="p-3">
                    <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold ${u.role === 'admin' ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-gray-300'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button 
                      onClick={() => handleToggleUserStatus(u.uid, u.isActive)}
                      className="text-[10px] font-bold tracking-widest uppercase bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {u.isActive ? 'Block' : 'Unblock'}
                    </button>
                    <button 
                      onClick={() => {
                        setEditingUser(u);
                        setEditBalance(u.balance.toString());
                        setEditMiningRate(u.miningRate.toString());
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
          
          <div className="space-y-4">
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
                      setTaskTitle(task.title);
                      setTaskReward(task.reward.toString());
                      setTaskType(task.type);
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
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#FFD700]">Pending Task Approvals</h3>
          </div>
          
          <div className="space-y-4">
            {claims.filter(c => c.status === 'pending').map(claim => (
              <div key={claim.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 gap-4">
                <div>
                  <p className="font-bold text-sm">{claim.taskTitle}</p>
                  <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">USER: {claim.userName} ({claim.userEmail})</p>
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
            ))}
            {claims.filter(c => c.status === 'pending').length === 0 && !loading && (
              <p className="text-center text-sm text-gray-500 uppercase tracking-widest font-bold">No pending approvals</p>
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
                <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Balance</label>
                <input 
                  type="number" 
                  value={editBalance} 
                  onChange={(e) => setEditBalance(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 focus:border-[#FFD700] outline-none transition-colors"
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
