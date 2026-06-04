import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useAppStore';
import { supabase } from '../lib/supabase';
import { Users, Coins, UserPlus, Shield, Check, Plus, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Squad } from '../types';
import toast from 'react-hot-toast';

export function Squads() {
  const { user, claimSquadBonus } = useApp();
  const [mySquad, setMySquad] = useState<Squad | null>(null);
  const [squadMembers, setSquadMembers] = useState<UserProfile[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [creating, setCreating] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [addingFriend, setAddingFriend] = useState<string | null>(null);
  
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [user?.uid]);
  
  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const { data: squadRes } = await supabase.from('squads').select('*').contains('memberUids', [user.uid]);
      
      let fetchedSquad: Squad | null = null;
      if (squadRes && squadRes.length > 0) {
        fetchedSquad = squadRes[0] as Squad;
        setMySquad(fetchedSquad);
        
        if (fetchedSquad.memberUids && fetchedSquad.memberUids.length > 0) {
          const { data: membersRes } = await supabase.from('users').select('*').in('uid', fetchedSquad.memberUids.slice(0, 10));
          if (membersRes) setSquadMembers(membersRes as UserProfile[]);
        }
      } else {
        setMySquad(null);
        setSquadMembers([]);
      }
      
      if (user.uid && user.referralCode) {
        const { data: friendsRes } = await supabase.from('users').select('*').in('referredBy', [user.uid, user.referralCode]).limit(200);
        if (friendsRes) setFriends(friendsRes as UserProfile[]);
      }
      
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSquad = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const squadId = 'sq_' + Date.now();
      const newSquad = {
        name: `${user.name || 'User'}'s Squad`,
        description: "",
        ownerId: user.uid,
        members: 1,
        memberUids: [user.uid],
        totalBalance: 0,
        createdAt: Date.now()
      };
      
      await supabase.from('squads').insert([{ id: squadId, ...newSquad }]);
      toast.success("Squad created successfully!");
      fetchData();
    } catch (e: any) {
      toast.error(`Failed to create squad: ${e.message || 'Unknown'}`);
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleAddFriend = async (friendUid: string) => {
    if (!mySquad || mySquad.ownerId !== user?.uid) return;
    
    setAddingFriend(friendUid);
    try {
      const newUids = [...(mySquad.memberUids || []), friendUid];
      await supabase.from('squads').update({
        memberUids: newUids,
        members: (mySquad.members || 1) + 1
      }).eq('id', mySquad.id);
      
      toast.success("Friend added to squad!");
      fetchData();
    } catch(e) {
      toast.error("Failed to add friend");
      console.error(e);
    } finally {
      setAddingFriend(null);
    }
  };

  const handleLeaveSquad = async () => {
    if (!mySquad || !user) return;
    
    if (mySquad.ownerId === user.uid) {
      toast.error("Squad owners cannot leave. You must delete the squad or transfer ownership.");
      return;
    }

    setLeaving(true);
    try {
      const newUids = (mySquad.memberUids || []).filter(u => u !== user.uid);
      await supabase.from('squads').update({
        memberUids: newUids,
        members: Math.max(0, (mySquad.members || 1) - 1)
      }).eq('id', mySquad.id);
      
      toast.success("You have left the squad");
      setMySquad(null);
      setSquadMembers([]);
      fetchData();
    } catch(e) {
      toast.error("Failed to leave squad");
      console.error(e);
    } finally {
      setLeaving(false);
    }
  };

  const handleClaim = async () => {
    if (!mySquad) {
      toast.error("You need a squad to claim!");
      return;
    }
    
    setClaiming(true);
    const result = await claimSquadBonus(mySquad.memberUids.length);
    if (result.success) {
      toast.success(`Claimed ${result.reward.toFixed(2)} CM successfully!`);
    } else {
      toast.error(result.message);
    }
    setClaiming(false);
  };

  if (!user || loading) {
    return (
      <div className="flex-1 flex justify-center py-20 pb-32">
         <div className="w-12 h-12 border-4 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin"></div>
      </div>
    );
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const hasClaimedToday = user.lastSquadClaim && user.lastSquadClaim >= startOfDay;
  const squadSize = mySquad?.memberUids?.length || 0;
  const calcReward = Math.min(0.2, Math.max(0.01, squadSize * 0.01));

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col pt-8 pb-32 px-4">
      <div className="flex flex-col items-center mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 bg-[#FFD700]/10 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-[#FFD700]" />
        </div>
        <h1 className="text-4xl font-black mb-2 uppercase tracking-tight">Squads</h1>
        <p className="text-gray-400 font-mono text-xs max-w-[280px]">Create your own squad, invite your friends, and mine together for extra rewards!</p>
      </div>

      {!mySquad ? (
        <div className="bg-white/5 backdrop-blur-md rounded-[32px] p-8 border border-[#FFD700]/30 mb-8 flex flex-col items-center text-center">
          <h2 className="text-2xl font-black mb-2">No Squad Yet</h2>
          <p className="text-gray-400 text-sm mb-6">Create a squad and add your invited friends to start earning daily bonuses together.</p>
          <button 
            onClick={handleCreateSquad}
            disabled={creating}
            className="w-full bg-[#FFD700] text-black font-black uppercase text-sm py-4 rounded-xl hover:bg-yellow-400 transition-all flex justify-center items-center gap-2"
          >
            {creating ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <><Plus className="w-5 h-5" /> Create My Squad</>
            )}
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white/5 backdrop-blur-md rounded-[32px] p-6 sm:p-8 border border-[#FFD700]/30 mb-8 relative overflow-hidden animate-in fade-in duration-700">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700] opacity-10 blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-[#FFD700] font-black text-xs uppercase tracking-widest mb-1">{mySquad.name}</h2>
                <h3 className="text-3xl font-black tracking-tight">{squadSize} Members</h3>
              </div>
            </div>
            
            <div className="bg-black/60 rounded-3xl p-6 border border-white/10 flex flex-col items-center mb-6">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">Daily Squad Bonus</p>
              <div className="text-4xl font-black text-[#FFD700] mb-1">{calcReward.toFixed(2)} CM</div>
              <p className="text-xs text-gray-400">Earn 0.01 CM per member (up to 0.20 CM max)</p>
            </div>

            <button 
              onClick={handleClaim}
              disabled={claiming || hasClaimedToday || squadSize === 0}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest transition-all ${
                hasClaimedToday 
                  ? 'bg-white/10 text-gray-500 cursor-not-allowed' 
                  : squadSize === 0 
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
                <><Coins className="w-4 h-4" /> Claim Bonus</>
              )}
            </button>
          </div>

          {/* Friends List to Add */}
          {mySquad.ownerId === user.uid && friends.length > 0 && (
            <div className="mb-8">
              <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#FFD700]" />
                Add Friends
              </h3>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-2 space-y-2">
                {friends.filter(f => !mySquad.memberUids.includes(f.uid)).length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    All your referred friends are already in your squad! Invite more friends to add them.
                  </div>
                ) : (
                  friends
                    .filter(f => !mySquad.memberUids.includes(f.uid))
                    .map((friend) => (
                      <div key={friend.uid} className="bg-black/40 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center font-bold">
                          {friend.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">{friend.name}</h4>
                          <p className="text-[10px] text-gray-500 font-mono">Joined {new Date(friend.joinDate).toLocaleDateString()}</p>
                        </div>
                        <button
                          onClick={() => handleAddFriend(friend.uid)}
                          disabled={addingFriend === friend.uid}
                          className="bg-white/10 hover:bg-[#FFD700] hover:text-black transition-colors px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
                        >
                          {addingFriend === friend.uid ? "Adding..." : "Add"}
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* Squad Roster */}
          <h3 className="font-black text-lg mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#FFD700]" />
            Squad Members
          </h3>
          
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
                    <h4 className="font-bold text-white truncate flex items-center gap-2">
                      {member.name || 'Anonymous User'}
                      {member.uid === mySquad.ownerId && (
                        <span className="bg-[#FFD700]/20 text-[#FFD700] text-[8px] uppercase px-2 py-0.5 rounded-full font-bold">Owner</span>
                      )}
                    </h4>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider">
                      Joined Squad {new Date(mySquad.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {mySquad.ownerId !== user.uid && (
            <div className="mt-8">
              <button
                onClick={handleLeaveSquad}
                disabled={leaving}
                className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest transition-all bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
              >
                {leaving ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    Leaving...
                  </span>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" /> Leave Squad
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
