import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useAppStore';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { Users, Plus, Medal, Search, LogOut, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../lib/utils';
import { Squad } from '../types';
import toast from 'react-hot-toast';

export function Squads() {
  const { user, updateUser } = useApp();
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [mySquad, setMySquad] = useState<Squad | null>(null);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newSquadName, setNewSquadName] = useState('');
  const [newSquadDesc, setNewSquadDesc] = useState('');
  const [joining, setJoining] = useState(false);
  
  useEffect(() => {
    fetchSquads();
    // eslint-disable-next-line
  }, [user?.squadId]);
  
  const fetchSquads = async () => {
    try {
      if (user?.squadId) {
        const docRef = doc(db, 'squads', user.squadId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMySquad({ id: docSnap.id, ...docSnap.data() } as Squad);
        } else {
          await updateUser({ squadId: null });
        }
      } else {
        setMySquad(null);
      }
      
      const q = query(collection(db, 'squads'), orderBy('totalBalance', 'desc'), limit(50));
      const qs = await getDocs(q);
      const data = qs.docs.map(d => ({ id: d.id, ...d.data() } as Squad));
      setSquads(data);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSquad = async () => {
    if (!newSquadName.trim() || !user) return;
    setJoining(true);
    try {
      const squadId = 'sq_' + Date.now() + Math.random().toString(36).substring(2, 7);
      const newSquad = {
        name: newSquadName.trim(),
        description: newSquadDesc.trim(),
        ownerId: user.uid,
        members: 1,
        totalBalance: user.balance || 0,
        createdAt: Date.now()
      };
      
      await setDoc(doc(db, 'squads', squadId), newSquad);
      await updateUser({ squadId });
      toast.success("Squad created successfully!");
      setIsCreating(false);
      setNewSquadName('');
      setNewSquadDesc('');
      fetchSquads();
    } catch(e) {
      toast.error("Failed to create squad");
      console.error(e);
    } finally {
      setJoining(false);
    }
  };

  const handleJoinSquad = async (squadId: string) => {
    if (!user) return;
    if (user.squadId) {
       toast.error("You are already in a squad");
       return;
    }
    setJoining(true);
    try {
      await updateDoc(doc(db, 'squads', squadId), {
        members: increment(1),
        totalBalance: increment(user.balance || 0)
      });
      await updateUser({ ...user, squadId });
      toast.success("Joined squad!");
      fetchSquads();
    } catch(e) {
      toast.error("Failed to join squad");
      console.error(e);
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveSquad = async () => {
    if (!user?.squadId) return;
    setJoining(true);
    try {
      const squadRef = doc(db, 'squads', user.squadId);
      await updateDoc(squadRef, {
        members: increment(-1),
        totalBalance: increment(-(user.balance || 0))
      });
      await updateUser({ squadId: null });
      setMySquad(null);
      toast.success("Left squad");
      fetchSquads();
    } catch(e) {
      toast.error("Failed to leave squad");
      console.error(e);
    } finally {
      setJoining(false);
    }
  };

  if (loading && !squads.length) {
    return (
      <div className="flex-1 flex justify-center items-center">
         <div className="w-12 h-12 border-4 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col pt-8 pb-32">
      <div className="flex flex-col items-center mb-8 px-4 text-center">
        <h1 className="text-4xl font-black mb-2 uppercase tracking-tight flex items-center justify-center gap-3">
          <Users className="w-8 h-8 text-[#FFD700]" />
          Squads
        </h1>
        <p className="text-gray-400 font-mono text-sm max-w-sm">Join a squad to compete, mine together, and climb the leaderboard.</p>
      </div>

      <div className="px-4 w-full">
        <AnimatePresence mode="wait">
          {mySquad ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-[#FFD700]/30 mb-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#FFD700] blur-3xl opacity-5 rounded-full"></div>
              
              <div className="flex justify-between items-start mb-6">
                 <div>
                   <h2 className="text-[#FFD700] font-black text-xs uppercase tracking-widest mb-1">Your Squad</h2>
                   <h3 className="text-2xl font-black capitalize tracking-tight">{mySquad.name}</h3>
                   <p className="text-gray-400 text-sm mt-1">{mySquad.description || "No description provided."}</p>
                 </div>
                 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-900 to-black border-2 border-[#FFD700]/30 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-black text-[#FFD700]">{mySquad.name.charAt(0)}</span>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                   <div className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-1">Members</div>
                   <div className="text-xl font-black flex items-center gap-2">
                     <Users className="w-4 h-4 text-[#FFD700]" />
                     {mySquad.members}
                   </div>
                 </div>
                 <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                   <div className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-1">Total Balance</div>
                   <div className="text-xl font-black text-[#FFD700]">
                     {formatCurrency(mySquad.totalBalance)}
                   </div>
                 </div>
              </div>

              <div className="flex gap-3">
                 <button 
                   onClick={handleLeaveSquad}
                   disabled={joining}
                   className="flex-1 bg-red-500/10 text-red-500 font-bold uppercase tracking-wider text-xs py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors border border-red-500/30"
                 >
                   <LogOut className="w-4 h-4" />
                   {joining ? "Leaving..." : "Leave Squad"}
                 </button>
              </div>
            </motion.div>
          ) : isCreating ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 mb-8"
            >
              <h3 className="font-black text-xl mb-4 text-[#FFD700]">Create New Squad</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Squad Name</label>
                  <input
                    type="text"
                    value={newSquadName}
                    onChange={(e) => setNewSquadName(e.target.value)}
                    placeholder="Enter squad name"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700]/50 font-bold"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Description (Optional)</label>
                  <input
                    type="text"
                    value={newSquadDesc}
                    onChange={(e) => setNewSquadDesc(e.target.value)}
                    placeholder="What is this squad about?"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700]/50 font-medium"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button disabled={joining} onClick={handleCreateSquad} className="flex-1 bg-[#FFD700] text-black font-black uppercase text-sm py-3 rounded-xl hover:bg-yellow-400 transition-colors">
                    {joining ? "Creating..." : "Create"}
                  </button>
                  <button onClick={() => setIsCreating(false)} className="px-6 bg-white/5 text-gray-400 font-bold uppercase text-sm rounded-xl hover:bg-white/10 hover:text-white transition-colors border border-white/10">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setIsCreating(true)}
              className="w-full bg-gradient-to-r from-[#FFD700]/10 to-[#FFD700]/5 border border-[#FFD700]/20 rounded-3xl p-5 flex items-center justify-between mb-8 hover:bg-[#FFD700]/20 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FFD700]/20 flex items-center justify-center text-[#FFD700] group-hover:bg-[#FFD700] group-hover:text-black transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-black text-lg text-white">Create a Squad</h3>
                  <p className="text-gray-400 text-xs font-mono">Lead your own team to the top</p>
                </div>
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        <h3 className="font-black text-lg mb-4 flex items-center gap-2">
          <Medal className="w-5 h-5 text-[#FFD700]" />
          Top Squads
        </h3>
        
        <div className="space-y-3">
          {squads.length === 0 && !loading && (
            <div className="text-center py-10 text-gray-500 font-medium text-sm">
              No squads found. Be the first to create one!
            </div>
          )}
          {squads.map((squad, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={squad.id}
              className={`w-full bg-black/40 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border ${squad.id === user?.squadId ? 'border-[#FFD700]/50 bg-[#FFD700]/5' : 'border-white/5'} transition-all`}
            >
              <div className="font-black text-gray-500 w-6 text-center text-sm">
                #{index + 1}
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center flex-shrink-0">
                <span className="font-black text-[#FFD700] text-lg">{squad.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white truncate capitalize">{squad.name}</h4>
                <div className="flex items-center gap-3 text-xs text-gray-400 font-mono mt-0.5">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#FFD700]" /> {squad.members}
                  </span>
                  <span>{formatCurrency(squad.totalBalance)} CM</span>
                </div>
              </div>
              
              {!mySquad && (
                <button 
                  onClick={() => handleJoinSquad(squad.id)}
                  disabled={joining}
                  className="bg-white/10 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-[#FFD700] hover:text-black transition-colors"
                >
                  Join
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
