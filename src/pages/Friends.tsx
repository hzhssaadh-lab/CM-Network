import { useApp } from '../hooks/useAppStore';
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';

function FriendLeaderboard({ userUid, userCode }: { userUid: string, userCode: string }) {
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('referredBy', 'in', [userUid, userCode]));
        const querySnapshot = await getDocs(q);
        
        const topFriends: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          topFriends.push(doc.data() as UserProfile);
        });
        
        // Sort by balance locally (since we don't have a composite index guaranteed) 
        topFriends.sort((a, b) => (b.balance || 0) - (a.balance || 0));
        
        setFriends(topFriends);
      } catch (error) {
        console.error("Error fetching friends", error);
      } finally {
        setLoading(false);
      }
    };

    if (userUid && userCode) {
      fetchFriends();
    }
  }, [userUid, userCode]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-[32px] p-6 sm:p-8 mt-8">
      <h3 className="text-xl sm:text-2xl font-black text-center text-white mb-6 uppercase tracking-widest">
        Your Friends Leaderboard
      </h3>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {friends.map((friend, index) => (
            <div 
              key={friend.uid} 
              className="flex items-center justify-between bg-black/40 rounded-2xl p-4 border border-white/5 hover:border-[#FFD700]/30 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm
                  ${index === 0 ? 'bg-[#FFD700] text-black shadow-[0_0_15px_rgba(255,215,0,0.5)]' : 
                    index === 1 ? 'bg-gray-300 text-black shadow-[0_0_15px_rgba(209,213,219,0.3)]' : 
                    index === 2 ? 'bg-[#CD7F32] text-white shadow-[0_0_15px_rgba(205,127,50,0.3)]' : 
                    'bg-white/10 text-white'}`}
                >
                  #{index + 1}
                </div>
                <div>
                  <p className="text-white font-bold">{friend.name || 'Anonymous'}</p>
                  <p className="text-xs text-gray-400">Join Date: {new Date(friend.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#FFD700] font-black text-lg">{friend.balance.toFixed(2)}</p>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Balance</p>
              </div>
            </div>
          ))}
          {friends.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">No friends added yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export function Friends() {
  const { user, submitReferralCode } = useApp();
  const [refCode, setRefCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  if (!user) return null;

  const handleRefSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refCode.trim()) return;
    setIsSubmitting(true);
    setMsg({ text: '', type: '' });
    
    const success = await submitReferralCode(refCode.trim());
    if (success) {
      setMsg({ text: 'Referral code applied successfully!', type: 'success' });
    } else {
      setMsg({ text: 'Invalid referral code or already applied.', type: 'error' });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in duration-500 pb-10">
      <div className="bg-gradient-to-br from-[#1a1a1a] to-black rounded-[32px] border border-[#FFD700]/20 p-8 mb-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700] opacity-10 blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <h2 className="text-3xl font-black mb-2 relative z-10 text-white">Invite & Earn <span className="text-[#FFD700]">0.08 CM</span></h2>
        <p className="text-gray-400 text-sm mx-auto max-w-sm relative z-10">Share your code with friends. When they join, you get 0.08 CM!</p>
        
        <div className="mt-8 bg-black/60 border border-white/10 rounded-3xl p-8 flex flex-col items-center max-w-sm mx-auto relative z-10">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-4">Your Referral Code</p>
          <div className="text-4xl sm:text-5xl font-black font-mono text-[#FFD700] tracking-widest selection:bg-[#FFD700]/30">{user.referralCode}</div>
          <button 
             onClick={() => { 
                const link = `${window.location.origin}/?ref=${user.referralCode}`;
                navigator.clipboard.writeText(link); 
                alert('Invite link copied!'); 
             }}
             className="mt-8 w-full bg-white text-black font-black py-4 rounded-xl hover:bg-gray-200 transition-colors text-xs tracking-widest uppercase active:scale-95 shadow-[0_5px_20px_rgba(255,255,255,0.1)]"
          >
            COPY INVITE LINK
          </button>
        </div>
      </div>

      {!user.referredBy && (
        <div className="bg-white/5 rounded-[32px] p-8 border border-white/10 mb-8 max-w-sm mx-auto relative z-10">
          <h3 className="text-xl font-bold mb-2 text-center text-white">Were you invited?</h3>
          <p className="text-xs text-gray-400 text-center mb-4">Enter a friend's referral code to link your accounts.</p>
          
          <form onSubmit={handleRefSubmit} className="flex flex-col space-y-3">
            <input 
              type="text" 
              placeholder="Enter Code" 
              value={refCode}
              onChange={(e) => setRefCode(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FFD700] transition-colors text-center font-mono tracking-widest uppercase"
            />
            <button 
              type="submit"
              disabled={isSubmitting || !refCode.trim()}
              className="w-full bg-[#FFD700] text-black font-bold py-3 rounded-xl hover:bg-[#e6c200] transition-colors text-xs tracking-widest uppercase active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Apply Code'}
            </button>
            {msg.text && (
              <p className={`text-xs text-center font-medium ${msg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {msg.text}
              </p>
            )}
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 col-span-2 mb-8">
        <div className="bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
           <span className="text-4xl md:text-5xl font-black text-white">{user.referralCount}</span>
           <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2 block">Active Friends</span>
        </div>
        <div className="bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
           <span className="text-4xl md:text-5xl font-black text-[#FFD700]">{Number((user.referralCount * 0.08).toFixed(2))}</span>
           <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2 block">CM Earned</span>
        </div>
      </div>

      <FriendLeaderboard userUid={user.uid} userCode={user.referralCode} />

    </div>
  );
}
