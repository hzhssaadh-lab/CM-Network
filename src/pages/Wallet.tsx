import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useAppStore';
import { formatCurrency } from '../lib/utils';
import { collection, query, where, orderBy, getDocs, limit, runTransaction, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Transaction } from '../types';

export function Wallet() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<'send'|'receive'|'history'|'tasks'>('send');
  const [receiverUid, setReceiverUid] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'mining' | 'task' | 'referral' | 'transfer'>('all');
  const [completedTasksHistory, setCompletedTasksHistory] = useState<any[]>([]);
  const [tasksMetaMap, setTasksMetaMap] = useState<Map<string, any>>(new Map());
  const [loadingTasksHistory, setLoadingTasksHistory] = useState(false);

  useEffect(() => {
    if (user && activeTab === 'history') {
      fetchHistory();
    } else if (user && activeTab === 'tasks') {
      fetchTasksHistory();
    }
  }, [user, activeTab]);

  const fetchTasksHistory = async () => {
    if (!user) return;
    setLoadingTasksHistory(true);
    try {
      // Fetch all tasks first to build a map for title/reward lookups
      const tp = await getDocs(collection(db, 'tasks'));
      const tMap = new Map();
      tp.docs.forEach(d => tMap.set(d.id, { id: d.id, ...d.data() }));
      setTasksMetaMap(tMap);

      // Fetch completedTasks
      const q = query(collection(db, 'users', user.uid, 'completedTasks'), orderBy('completedAt', 'desc'));
      const snap = await getDocs(q);
      const ct: any[] = [];
      snap.docs.forEach(d => ct.push(d.data()));
      setCompletedTasksHistory(ct);
    } catch (e) {
      console.error('Failed to fetch task history', e);
    }
    setLoadingTasksHistory(false);
  };

  const fetchHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const q = query(collection(db, 'transactions'), where('senderUid', '==', user.uid));
      const q2 = query(collection(db, 'transactions'), where('receiverUid', '==', user.uid));
      const [snap1, snap2] = await Promise.all([getDocs(q), getDocs(q2)]);
      
      let txs: any[] = [];
      snap1.docs.forEach(d => txs.push({id: d.id, ...d.data()}));
      snap2.docs.forEach(d => txs.push({id: d.id, ...d.data()}));
      
      const unique = txs.filter((v,i,a)=>a.findIndex(v2=>(v2.id===v.id))===i);
      unique.sort((a,b) => b.timestamp - a.timestamp);
      setHistory(unique);
    } catch (e) {
      console.error(e);
    }
    setLoadingHistory(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    
    if (!user) return;
    const sendAmount = parseFloat(amount);
    if (!receiverUid || receiverUid === user.uid) {
      setError("Invalid receiver UID"); return;
    }
    if (isNaN(sendAmount) || sendAmount <= 0) {
      setError("Invalid amount"); return;
    }
    if (sendAmount > user.balance) {
      setError("Insufficient balance"); return;
    }

    setSending(true);
    try {
      await runTransaction(db, async (t) => {
        const senderRef = doc(db, 'users', user.uid);
        const receiverRef = doc(db, 'users', receiverUid);
        
        const senderDoc = await t.get(senderRef);
        const receiverDoc = await t.get(receiverRef);
        
        if (!receiverDoc.exists()) {
          throw new Error("Receiver does not exist");
        }
        
        const currentSenderBalance = senderDoc.data().balance;
        if (currentSenderBalance < sendAmount) {
          throw new Error("Insufficient balance during transaction");
        }
        const currentReceiverBalance = receiverDoc.data().balance;
        
        t.update(senderRef, { balance: currentSenderBalance - sendAmount });
        t.update(receiverRef, { balance: currentReceiverBalance + sendAmount });
        
        const txRef = doc(collection(db, 'transactions'));
        t.set(txRef, {
          type: 'transfer_sent',
          amount: sendAmount,
          timestamp: Date.now(),
          status: 'completed',
          senderUid: user.uid,
          receiverUid: receiverUid
        });
      });
      setSuccess(`Successfully sent ${sendAmount} CM!`);
      setAmount('');
      setReceiverUid('');
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
    }
    setSending(false);
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-500 pb-10">
       <section className="bg-gradient-to-br from-gray-900 to-black rounded-[32px] border border-[#FFD700]/20 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700] opacity-5 blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10">
            <p className="text-xs text-[#FFD700] font-bold uppercase tracking-widest mb-4">Total Liquid Assets</p>
            <h3 className="text-5xl md:text-6xl font-black tracking-tighter font-mono">{formatCurrency(user.balance)} <span className="text-2xl text-[#FFD700] font-sans">CM</span></h3>
            <p className="text-gray-500 font-mono text-xl mt-2">≈ ${(user.balance * 6.00).toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
          </div>
       </section>

       <div className="flex bg-white/5 p-1 rounded-2xl mb-8 overflow-x-auto custom-scrollbar">
         <button onClick={() => setActiveTab('send')} className={`flex-1 py-3 px-4 min-w-max text-[10px] font-bold tracking-widest uppercase rounded-xl transition-all ${activeTab === 'send' ? 'bg-[#FFD700] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>Send</button>
         <button onClick={() => setActiveTab('receive')} className={`flex-1 py-3 px-4 min-w-max text-[10px] font-bold tracking-widest uppercase rounded-xl transition-all ${activeTab === 'receive' ? 'bg-[#FFD700] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>Receive</button>
         <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 px-4 min-w-max text-[10px] font-bold tracking-widest uppercase rounded-xl transition-all ${activeTab === 'history' ? 'bg-[#FFD700] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>Tx History</button>
         <button onClick={() => setActiveTab('tasks')} className={`flex-1 py-3 px-4 min-w-max text-[10px] font-bold tracking-widest uppercase rounded-xl transition-all ${activeTab === 'tasks' ? 'bg-[#FFD700] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>Tasks</button>
       </div>

       {activeTab === 'send' && (
         <div className="bg-white/5 rounded-[32px] border border-white/10 p-8">
           <h3 className="text-xl font-bold mb-6">Send CM Coins</h3>
           {error && <p className="text-red-400 text-sm mb-4 bg-red-400/10 p-4 rounded-xl border border-red-400/20 font-medium">{error}</p>}
           {success && <p className="text-green-400 text-sm mb-4 bg-green-400/10 p-4 rounded-xl border border-green-400/20 font-medium">{success}</p>}
           <form onSubmit={handleSend} className="space-y-6">
             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Recipient UID</label>
               <input 
                 type="text" 
                 value={receiverUid}
                 onChange={(e) => setReceiverUid(e.target.value)}
                 className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#FFD700]/50 transition-colors placeholder:text-gray-600 focus:ring-1 focus:ring-[#FFD700]/50 font-mono" 
                 placeholder="Enter Recipient UID"
                 required
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Amount (CM)</label>
               <div className="relative">
                 <input 
                   type="number" 
                   value={amount}
                   onChange={(e) => setAmount(e.target.value)}
                   step="0.01"
                   min="0.01"
                   className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white pl-4 pr-20 focus:outline-none focus:border-[#FFD700]/50 transition-colors font-mono focus:ring-1 focus:ring-[#FFD700]/50" 
                   placeholder="0.00"
                   required
                 />
                 <button type="button" onClick={() => setAmount(user.balance.toString())} className="absolute right-4 text-xs top-1/2 -translate-y-1/2 font-bold text-[#FFD700] hover:text-white transition-colors bg-[#FFD700]/10 px-3 py-1 rounded-md">MAX</button>
               </div>
             </div>
             <button disabled={sending} className="w-full bg-[#FFD700] text-black font-black py-4 rounded-xl shadow-[0_5px_20px_rgba(212,175,55,0.2)] active:scale-95 transition-all outline-none tracking-widest mt-4">
               {sending ? 'PROCESSING...' : 'CONFIRM TRANSFER'}
             </button>
           </form>
         </div>
       )}

       {activeTab === 'receive' && (
         <div className="bg-white/5 rounded-[32px] border border-white/10 p-8 flex flex-col items-center justify-center min-h-[400px]">
           <p className="text-gray-400 mb-8 text-center max-w-sm text-sm">Share your unique UID with other users to receive CM coins instantly. Transactions are processed securely.</p>
           
           <div className="bg-white p-6 rounded-3xl mb-8">
             <div className="w-48 h-48 bg-black/5 flex flex-col items-center justify-center border-4 border-dashed border-[#FFD700] rounded-xl">
               <span className="text-2xl mb-2">📷</span>
               <span className="text-black font-bold text-sm text-center">QR Code<br/>Coming Soon</span>
             </div>
           </div>

           <div className="bg-black/60 border border-white/10 rounded-2xl p-6 w-full max-w-md flex flex-col items-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Your Unique UID</p>
              <p className="font-mono text-xl md:text-2xl font-black tracking-tight text-[#FFD700] break-all text-center selection:bg-[#FFD700]/30">{user.uid}</p>
              <button 
                onClick={() => { navigator.clipboard.writeText(user.uid); alert('Copied to clipboard'); }}
                className="mt-6 border border-[#FFD700]/50 text-[#FFD700] px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#FFD700]/10 transition-colors"
               >
                Copy UID
              </button>
           </div>
         </div>
       )}

       {activeTab === 'history' && (
         <div className="space-y-4">
           {/* Filters */}
           <div className="flex flex-wrap gap-2 mb-6">
             {(['all', 'mining', 'task', 'referral', 'transfer'] as const).map(f => (
               <button 
                 key={f}
                 onClick={() => setHistoryFilter(f)}
                 className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${historyFilter === f ? 'bg-[#FFD700] text-black shadow-sm' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
               >
                 {f}
               </button>
             ))}
           </div>

           {loadingHistory ? (
             <div className="flex justify-center py-12">
               <div className="w-8 h-8 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
             </div>
           ) : history.filter(tx => {
             if (historyFilter === 'all') return true;
             if (historyFilter === 'mining') return tx.type === 'mining_reward';
             if (historyFilter === 'task') return tx.type === 'task_reward';
             if (historyFilter === 'referral') return tx.type === 'referral_bonus' || tx.type.toString() === 'referral_bonus_received';
             if (historyFilter === 'transfer') return tx.type === 'transfer_sent' || tx.type === 'transfer_received';
             return true;
           }).length === 0 ? (
             <div className="text-center bg-white/5 rounded-[32px] border border-white/10 p-12">
               <span className="text-4xl mb-4 block opacity-50">📝</span>
               <p className="text-gray-500 font-medium tracking-wide">No transactions found for this filter.</p>
             </div>
           ) : (
             history.filter(tx => {
               if (historyFilter === 'all') return true;
               if (historyFilter === 'mining') return tx.type === 'mining_reward';
               if (historyFilter === 'task') return tx.type === 'task_reward';
               if (historyFilter === 'referral') return tx.type === 'referral_bonus' || tx.type.toString() === 'referral_bonus_received';
               if (historyFilter === 'transfer') return tx.type === 'transfer_sent' || tx.type === 'transfer_received';
               return true;
             }).map((tx) => {
               const isMining = tx.type === 'mining_reward';
               const isTask = tx.type === 'task_reward';
               const isReferral = tx.type === 'referral_bonus';
               const isReceived = tx.receiverUid === user.uid || isMining || isTask || isReferral;
               
               let title = 'Transaction';
               let detail = '';

               if (isMining) title = 'Mining Reward';
               else if (isTask) title = 'Task Reward';
               else if (isReferral) title = 'Referral Bonus';
               else if (isReceived) {
                 title = 'Received CM';
                 if (tx.senderUid) detail = `From: ${tx.senderUid}`;
               } else {
                 title = 'Sent CM';
                 if (tx.receiverUid) detail = `To: ${tx.receiverUid}`;
               }

               const sign = isReceived ? '+' : '-';
               const colorClass = isReceived ? 'text-green-400' : 'text-white';
               const icon = (isMining || isTask || isReferral) ? '⛏️' : (isReceived ? '↓' : '↑');
               
               return (
                 <div key={tx.id} className="flex items-center justify-between p-5 bg-black/40 rounded-2xl border border-white/5">
                   <div className="flex items-center space-x-4">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${isReceived ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white'}`}>
                       {icon}
                     </div>
                     <div>
                       <p className="font-bold text-sm sm:text-base">{title}</p>
                       {detail && <p className="text-[10px] text-gray-400 font-mono mt-0.5 break-all">UID: {detail.replace('From: ', '').replace('To: ', '')}</p>}
                       <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-wider">{new Date(tx.timestamp).toLocaleString()}</p>
                     </div>
                   </div>
                   <p className={`font-mono font-bold sm:text-lg ${colorClass}`}>
                     {sign}{formatCurrency(tx.amount)}
                   </p>
                 </div>
               );
             })
           )}
         </div>
       )}

       {activeTab === 'tasks' && (
         <div className="space-y-4">
           {loadingTasksHistory ? (
             <div className="flex justify-center py-12">
               <div className="w-8 h-8 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
             </div>
           ) : completedTasksHistory.length === 0 ? (
             <div className="text-center bg-white/5 rounded-[32px] border border-white/10 p-12">
               <span className="text-4xl mb-4 block opacity-50">✅</span>
               <p className="text-gray-500 font-medium tracking-wide">No completed tasks yet.</p>
             </div>
           ) : (
             completedTasksHistory.map((ct, idx) => {
               const meta = tasksMetaMap.get(ct.taskId);
               const taskName = meta ? meta.title : 'Unknown Task';
               const taskReward = meta ? meta.reward : 0;
               return (
                 <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-black/40 rounded-2xl border border-white/5 gap-4">
                   <div className="flex items-center space-x-4">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg bg-green-500/20 text-green-400`}>
                       ✓
                     </div>
                     <div>
                       <p className="font-bold text-sm sm:text-base text-white">{taskName}</p>
                       <p className="text-[10px] sm:text-xs text-gray-500 font-mono mt-1 uppercase tracking-wider">{new Date(ct.completedAt).toLocaleString()}</p>
                     </div>
                   </div>
                   <div className="flex flex-col sm:items-end">
                     <p className={`font-mono font-bold sm:text-lg text-[#FFD700]`}>
                       +{formatCurrency(taskReward)}
                     </p>
                     <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${ct.status === 'completed' ? 'text-green-400' : ct.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}`}>
                       {ct.status}
                     </p>
                   </div>
                 </div>
               );
             })
           )}
         </div>
       )}
    </div>
  );
}
