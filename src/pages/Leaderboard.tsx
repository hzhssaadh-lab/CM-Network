import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { formatCurrency } from '../lib/utils';
import { useApp } from '../hooks/useAppStore';

export function Leaderboard() {
  const { user } = useApp();
  const [leaders, setLeaders] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaders() {
      try {
        const q = query(collection(db, 'users'), orderBy('balance', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const data: UserProfile[] = [];
        snapshot.forEach(doc => {
          data.push(doc.data() as UserProfile);
        });
        setLeaders(data);
      } catch (e) {
        console.error("Failed to fetch leaderboard", e);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaders();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="mb-8 p-8 bg-white/5 border border-white/10 rounded-[32px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700] opacity-5 blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <h2 className="text-3xl font-black tracking-tight mb-2">Global <span className="text-[#FFD700]">Rankings</span></h2>
        <p className="text-gray-400 text-sm">Top miners by current liquid balance</p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading rankings...</div>
        ) : (
          leaders.map((leader, index) => {
            const isMe = user?.uid === leader.uid;
            let rankColor = "text-gray-400";
            if (index === 0) rankColor = "text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]";
            else if (index === 1) rankColor = "text-gray-300 drop-shadow-[0_0_5px_rgba(200,200,200,0.3)]";
            else if (index === 2) rankColor = "text-amber-600 drop-shadow-[0_0_5px_rgba(180,80,0,0.3)]";

            return (
              <div 
                key={leader.uid} 
                className={`flex items-center p-4 rounded-2xl border transition-all ${
                  isMe 
                    ? 'bg-[#FFD700]/10 border-[#FFD700]/30 shadow-[0_0_15px_rgba(255,215,0,0.1)]' 
                    : 'bg-black/40 border-white/5 hover:bg-white/5'
                }`}
              >
                <div className={`w-8 font-black text-lg ${rankColor}`}>
                  #{index + 1}
                </div>
                
                <div className="flex-1 ml-4 min-w-0">
                  <h4 className={`font-bold truncate ${isMe ? 'text-[#FFD700]' : 'text-white'}`}>
                    {leader.name || "Anonymous Miner"}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {leader.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}
                  </p>
                </div>
                
                <div className="text-right ml-4">
                  <div className="font-black text-[#FFD700] font-mono">
                    {formatCurrency(leader.balance)}
                  </div>
                  <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">
                    CM
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
