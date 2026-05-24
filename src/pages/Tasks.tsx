import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useAppStore';
import { collection, query, getDocs, doc, runTransaction, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task as AppTask } from '../types';
import { AdDisplay } from '../components/AdDisplay';

export function Tasks() {
  const { user, adSettings } = useApp();
  const [tasks, setTasks] = useState<AppTask[]>([]);
  const [completedTaskMap, setCompletedTaskMap] = useState<Map<string, string>>(new Map());
  const [claiming, setClaiming] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adModalTask, setAdModalTask] = useState<AppTask | null>(null);

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
    
    // If task has URL, simulate they have to click it?
    // Actually we will provide an "Open Link" button next to "Claim" in UI.
    
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
        
        // Don't update balance yet. Add to completedTasks as pending.
        t.set(completedRef, {
          completedAt: Date.now(),
          taskId: task.id,
          status: 'pending'
        });
        
        // Add a claim for admin to approve
        const claimRef = doc(collection(db, 'taskClaims'));
        t.set(claimRef, {
          userId: user.uid,
          userEmail: user.email,
          userName: user.name || 'Anonymous',
          taskId: task.id,
          taskTitle: task.title,
          reward: task.reward,
          status: 'pending',
          timestamp: Date.now()
        });
      });
      
      setCompletedTaskMap(prev => new Map(prev).set(task.id, 'pending'));
    } catch (err) {
      console.error(err);
      alert('Failed to claim task. You may have already claimed it.');
    } finally {
      setClaiming(null);
    }
  };

  const handleClaimClick = (task: AppTask) => {
    if (adSettings?.showAds) {
      setAdModalTask(task);
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
                     : "bg-white text-black hover:bg-gray-200 active:scale-95"
                   }`}
                 >
                   {claiming === task.id ? '...' : 'CLAIM'}
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

      {adModalTask && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-[#0a0a0a] border border-white/20 rounded-3xl p-6 flex flex-col items-center shadow-[0_0_50px_rgba(255,215,0,0.1)] overflow-hidden relative">
            <h3 className="text-sm uppercase tracking-widest font-bold mb-4 text-[#FFD700]">Sponsor Advertisement</h3>
            <div className="w-full h-auto min-h-[250px] flex items-center justify-center mb-6 bg-black/50 rounded-xl overflow-hidden relative z-10">
               <AdDisplay type="rectangle" />
            </div>
            <div className="flex gap-4 w-full relative z-10">
              <button 
                onClick={() => setAdModalTask(null)}
                className="flex-1 bg-white/5 text-white text-xs font-bold py-4 rounded-xl hover:bg-white/10 transition-colors uppercase tracking-widest border border-white/10"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const t = adModalTask;
                  setAdModalTask(null);
                  processClaim(t);
                }}
                className="flex-1 bg-[#FFD700] text-black text-xs font-bold py-4 rounded-xl hover:bg-[#FFD700]/80 transition-colors uppercase tracking-widest"
              >
                Claim Reward
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
