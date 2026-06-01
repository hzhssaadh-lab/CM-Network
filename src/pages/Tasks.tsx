import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useAppStore';
import { collection, query, getDocs, doc, writeBatch, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task as AppTask } from '../types';
import { AdDisplay } from '../components/AdDisplay';
import confetti from 'canvas-confetti';
import { PlaySquare, Gift, X } from 'lucide-react';

function DailyRewards() {
  const { user, claimDailyCheckIn } = useApp();
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<{success: boolean, message: string} | null>(null);
  
  if (!user) return null;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  const hasClaimedToday = user.lastCheckIn ? user.lastCheckIn >= startOfDay : false;
  
  const currentStreak = user.dailyStreak || 0;
  let displayedStreak = currentStreak;
  const startOfYesterday = startOfDay - 24 * 60 * 60 * 1000;
  // If missed a day and haven't claimed today, the streak reset visual
  if (user.lastCheckIn && user.lastCheckIn < startOfYesterday && !hasClaimedToday) {
    displayedStreak = 0;
  }
  
  const currentIndex = hasClaimedToday ? (currentStreak - 1) % 5 : displayedStreak % 5;
  
  const handleClaim = async () => {
    setClaiming(true);
    const res = await claimDailyCheckIn();
    setClaimResult({ success: res.success, message: res.message });
    if (res.success) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#ffffff']
      });
    }
    setTimeout(() => setClaimResult(null), 3000);
    setClaiming(false);
  };

  const days = [
    { day: 1, reward: 0.02 },
    { day: 2, reward: 0.04 },
    { day: 3, reward: 0.06 },
    { day: 4, reward: 0.08 },
    { day: 5, reward: 0.10 },
  ];

  return (
    <div className="mb-8 p-6 bg-black/40 border border-white/10 rounded-[32px] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700] opacity-[0.03] blur-[40px] pointer-events-none"></div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-black tracking-tight text-white">Daily Check-In</h3>
          <p className="text-gray-400 text-xs mt-1">Claim your daily CM reward</p>
        </div>
        <button
          onClick={handleClaim}
          disabled={hasClaimedToday || claiming}
          className={`text-xs font-black px-6 py-3 rounded-xl transition-all tracking-widest uppercase shrink-0 ${
            hasClaimedToday 
            ? "bg-white/5 text-green-500 border border-green-500/20" 
            : claiming 
              ? "bg-white/10 text-gray-500 cursor-wait"
              : "bg-[#FFD700] text-black hover:bg-[#FFD700]/80 shadow-[0_0_15px_rgba(255,215,0,0.3)]"
          }`}
        >
          {hasClaimedToday ? 'Claimed' : claiming ? '...' : 'Claim'}
        </button>
      </div>

      {claimResult && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-xs font-bold text-center ${claimResult.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {claimResult.message}
        </div>
      )}

      <div className="grid grid-cols-5 gap-2">
        {days.map((item, index) => {
          const isClaimed = index < currentIndex || (index === currentIndex && hasClaimedToday);
          const isToday = index === currentIndex && !hasClaimedToday;
          return (
            <div 
              key={item.day} 
              className={`flex flex-col items-center justify-center p-2 rounded-xl border relative overflow-hidden transition-all ${
                isClaimed 
                ? 'bg-white/5 border-white/10 opacity-60' 
                : isToday
                  ? 'bg-black border-[#FFD700]/50 shadow-[0_0_10px_rgba(255,215,0,0.1)]'
                  : 'bg-black/20 border-white/5'
              }`}
            >
              <span className="text-[10px] sm:text-xs text-gray-500 font-bold mb-1">Day {item.day}</span>
              <span className={`text-xs sm:text-sm font-black ${isToday ? 'text-[#FFD700]' : isClaimed ? 'text-gray-400' : 'text-white'}`}>
                {item.reward}
              </span>
              {isClaimed && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
                  <span className="text-green-500 font-black text-lg">✓</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Tasks() {
  const { user, adSettings } = useApp();
  const [tasks, setTasks] = useState<AppTask[]>([]);
  const [completedTaskMap, setCompletedTaskMap] = useState<Map<string, string>>(new Map());
  const [claiming, setClaiming] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      try {
        const q = query(collection(db, 'tasks'));
        const snap = await getDocs(q);
        const tasksData: AppTask[] = [];
        snap.docs.forEach(d => {
          const t = { id: d.id, ...d.data() } as AppTask;
          if (t.isActive) tasksData.push(t);
        });
        setTasks(tasksData);

        const completionsSnap = await getDocs(collection(db, 'users', user.uid, 'completedTasks'));
        const completedMap = new Map<string, string>();
        completionsSnap.forEach(d => {
          const data = d.data();
          completedMap.set(d.id, data.status || 'completed');
        });
        setCompletedTaskMap(completedMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  const processClaim = async (task: AppTask) => {
    if (!user || claiming) return;
    
    setClaiming(task.id);
    try {
      await runTransaction(db, async (t) => {
        const completedRef = doc(db, 'users', user.uid, 'completedTasks', task.id);
        const completedDoc = await t.get(completedRef);
        if (completedDoc.exists()) {
          throw new Error('Task already claimed');
        }

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await t.get(userRef);
        if (!userDoc.exists()) return;
        
        // Add to completedTasks as pending.
        t.set(completedRef, {
          completedAt: Date.now(),
          taskId: task.id,
          status: 'pending'
        });
        
        // Add a claim for admin to approve
        const claimRef = doc(collection(db, 'taskClaims'));
        t.set(claimRef, {
          userId: user.uid,
          userEmail: user.email || '',
          userName: user.name || 'Anonymous',
          taskId: task.id,
          taskTitle: task.title || '',
          reward: task.reward || 0,
          status: 'pending',
          timestamp: Date.now()
        });
      });
      
      setCompletedTaskMap(prev => new Map(prev).set(task.id, 'pending'));
    } catch (err: any) {
      console.error(err);
      if (err.message === 'Task already claimed') {
        setCompletedTaskMap(prev => new Map(prev).set(task.id, 'completed'));
      } else {
        alert('Failed to claim task. You may have already claimed it.');
      }
    } finally {
      setClaiming(null);
    }
  };

  const [openedAdTasks, setOpenedAdTasks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('openedAdTasks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleClaimClick = (task: AppTask) => {
    if (!openedAdTasks[task.id]) {
      window.open("https://omg10.com/4/11069214", "_blank");
      const newState = { ...openedAdTasks, [task.id]: true };
      setOpenedAdTasks(newState);
      localStorage.setItem('openedAdTasks', JSON.stringify(newState));
    } else {
      processClaim(task);
    }
  };

  const getTaskIcon = (type: AppTask['type']) => {
    switch(type) {
      case 'twitter': return { icon: '🐦', bg: 'bg-blue-500/20', text: 'text-blue-400' };
      case 'youtube': return { icon: '▶️', bg: 'bg-red-500/20', text: 'text-red-400' };
      case 'tiktok': return { icon: '🎵', bg: 'bg-pink-500/20', text: 'text-pink-400' };
      case 'instagram': return { icon: '📸', bg: 'bg-purple-500/20', text: 'text-purple-400' };
      case 'ad': return { icon: '📺', bg: 'bg-orange-500/20', text: 'text-orange-400' };
      default: return { icon: '⭐', bg: 'bg-yellow-500/20', text: 'text-yellow-400' };
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="mb-8 p-8 bg-white/5 border border-white/10 rounded-[32px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700] opacity-5 blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <h2 className="text-3xl font-black tracking-tight mb-2">Earn Extra <span className="text-[#FFD700]">CM</span></h2>
        <p className="text-gray-400 text-sm">Complete simple tasks to boost your balance and earn immediate rewards.</p>
      </div>

      <DailyRewards />

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No active tasks available right now.</div>
        ) : tasks.map(task => {
          const style = getTaskIcon(task.type);
          const status = completedTaskMap.get(task.id);
          
          return (
           <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-black/40 hover:bg-black/60 rounded-2xl border border-white/5 transition-all gap-4">
             <div className="flex items-center space-x-4">
               <div className={`shrink-0 w-12 h-12 ${style.bg} ${style.text} rounded-xl flex items-center justify-center text-2xl`}>{style.icon}</div>
               <div>
                 <p className="font-bold text-sm sm:text-base">{task.title}</p>
                 <p className="text-[10px] sm:text-xs text-[#FFD700] font-bold tracking-widest mt-1">REWARD: +{task.reward} CM</p>
               </div>
             </div>
             
             <div className="flex items-center space-x-2 self-end sm:self-auto">
               {task.url && status !== 'completed' && (
                 <a 
                   href={task.url}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-xs font-black px-4 py-2.5 rounded-xl transition-all tracking-widest uppercase bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:bg-blue-500/30"
                 >
                   LINK
                 </a>
               )}
               {status === 'completed' ? (
                 <button 
                   disabled
                   className="text-xs font-black px-4 py-2.5 rounded-xl transition-all tracking-widest uppercase bg-white/5 text-green-500 border border-green-500/20 shrink-0"
                 >
                   DONE
                 </button>
               ) : status === 'pending' ? (
                 <button 
                   disabled
                   className="text-xs font-black px-4 py-2.5 rounded-xl transition-all tracking-widest uppercase bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20 shrink-0"
                 >
                   PENDING
                 </button>
               ) : (
                 <button 
                   onClick={() => handleClaimClick(task)}
                   disabled={claiming === task.id}
                   className={`text-xs font-black px-4 py-2.5 rounded-xl transition-all tracking-widest uppercase whitespace-nowrap shrink-0 ${
                     claiming === task.id 
                     ? "bg-white/10 text-gray-500 cursor-wait" 
                     : openedAdTasks[task.id]
                       ? "bg-[#FFD700] text-black hover:bg-[#FFD700]/80 shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                       : "bg-white text-black hover:bg-gray-200 active:scale-95"
                   }`}
                 >
                   {claiming === task.id ? '...' : openedAdTasks[task.id] ? 'VERIFY' : 'CLAIM'}
                 </button>
               )}
             </div>
           </div>
          )
        })}
      </div>
      <div className="mt-8">
        <AdDisplay type="rectangle" />
      </div>
    </div>
  );
}
