import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useAppStore';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Users, Coins, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import toast from 'react-hot-toast';

export function Squads() {
  const { user, claimSquadBonus } = useApp();
  const [squadMembers, setSquadMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  
  useEffect(() => {
    fetchSquad();
    // eslint-disable-next-line
  }, [user?.referralCode]);
  
  const fetchSquad = async () => {
    if (!user || !user.referralCode) {
      setLoading(false);
      return;
    }
    
    try {
      const q = query(
        collection(db, 'users'), 
        where('referredBy', '==', user.referralCode)
      );
      const qs = await getDocs(q);
      const data = qs.docs.map(d => d.data() as UserProfile);
      setSquadMembers(data);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (squadMembers.length === 0) {
      toast.error("You need at least one squad member to claim!");
      return;
    }
    
    setClaiming(true);
    const result = await claimSquadBonus(squadMembers.length);
    if (result.success) {
      toast.success(`Claimed ${result.reward} CM successfully!`);
    } else {
      toast.error(result.message);
    }
    setClaiming(false);
  };

  if (!user) return null;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const hasClaimedToday = user.lastSquadClaim && user.lastSquadClaim >= startOfDay;

  const calcReward = Math.min(0.2, Math.max(0.01, squadMembers.length * 0.01));

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col pt-8 pb-32 px-4">
      <div className="flex flex-col items-center mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 bg-[#FFD700]/10 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-[#FFD700]" />
        </div>
        <h1 className="text-4xl font-black mb-2 uppercase tracking-tight">Your Squad</h1>
        <p className="text-gray-400 font-mono text-xs max-w-[280px]">Your squad is built from the friends you invite. Mine together and claim daily squad rewards!</p>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-[32px] p-6 sm:p-8 border border-[#FFD700]/30 mb-8 relative overflow-hidden animate-in fade-in duration-700">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700] opacity-10 blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex justify-between items-start mb-6">
           <div>
             <h2 className="text-[#FFD700] font-black text-xs uppercase tracking-widest mb-1">Squad Stats</h2>
             <h3 className="text-3xl font-black tracking-tight">{squadMembers.length} Members</h3>
           </div>
        </div>
        
        <div className="bg-black/60 rounded-3xl p-6 border border-white/10 flex flex-col items-center mb-6">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">Daily Squad Bonus</p>
          <div className="text-4xl font-black text-[#FFD700] mb-1">{calcReward.toFixed(2)} CM</div>
          <p className="text-xs text-gray-400">Earn up to 0.2 CM max based on your squad size</p>
        </div>

        <button 
          onClick={handleClaim}
          disabled={claiming || hasClaimedToday || squadMembers.length === 0}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest transition-all ${
            hasClaimedToday 
              ? 'bg-white/10 text-gray-500 cursor-not-allowed' 
              : squadMembers.length === 0 
                ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'
                : 'bg-[#FFD700] text-black hover:bg-yellow-400 active:scale-95 shadow-[0_0_20px_rgba(255,215,0,0.3)]'
          }`}
        >
          {claiming ? (
             <span className="flex items-center gap-2">
               <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
               Claiming...
             </span>
          ) : hasClaimedToday ? (
             'Come back tomorrow'
          ) : (
            <>
              <Coins className="w-4 h-4" /> Claim Bonus
            </>
          )}
        </button>
      </div>

      <h3 className="font-black text-lg mb-4 flex items-center gap-2">
        Squad Members
      </h3>
      
      {loading ? (
        <div className="flex justify-center py-8">
           <div className="w-8 h-8 border-4 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin"></div>
        </div>
      ) : squadMembers.length === 0 ? (
        <div className="bg-white/5 rounded-3xl p-8 border border-white/5 text-center flex flex-col items-center">
            <UserPlus className="w-12 h-12 text-gray-600 mb-4" />
            <p className="text-gray-400 text-sm font-medium">No squad members yet.</p>
            <p className="text-gray-500 text-xs mt-2">Go to the Friends tab and invite people with your code.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {squadMembers.map((member, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={member.uid}
                className="w-full bg-black/40 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border border-white/5"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center flex-shrink-0 text-white font-black text-lg">
                  {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate">{member.name || 'Anonymous User'}</h4>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider">
                    Joined Date: {new Date(member.joinDate).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
