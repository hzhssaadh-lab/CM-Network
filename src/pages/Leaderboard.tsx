import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { formatCurrency } from '../lib/utils';
import { useApp } from '../hooks/useAppStore';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Zap, 
  Flame, 
  Users, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles,
  Award
} from 'lucide-react';

export function Leaderboard() {
  const { user } = useApp();
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLeaders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('balance', { ascending: false })
        .limit(500);

      if (error) throw error;

      if (data) {
        // Balance verification: filter corrupt/fake balances, validate real positive numbers
        const sanitized = (data as any[])
          .map((u) => {
            const rawBal = Number(u.balance ?? u['CM Coins'] ?? u.cm_coins ?? 0);
            const validBal = !isNaN(rawBal) && isFinite(rawBal) && rawBal >= 0 ? rawBal : 0;
            const isExplicitlyApproved = u.kycStatus === 'verified' && Boolean(u.kycApprovedAt || u.kyc_approved_at);
            const hasSubmission = Boolean(u.kycPhotoUrl || u.kycSubmittedAt || u.kyc_photo_url || u.kyc_submitted_at);
            const sanitizedKycStatus: any = isExplicitlyApproved ? 'verified' : (hasSubmission && u.kycStatus === 'pending' ? 'pending' : 'unverified');

            return {
              ...u,
              uid: u.uid || u.UID || `u_${Math.random()}`,
              name: u.name || 'Anonymous Miner',
              email: u.email || 'user@cmnetwork.io',
              balance: validBal,
              kycStatus: sanitizedKycStatus,
              referralCount: Number(u.referralCount || 0)
            } as UserProfile;
          })
          // Remove duplicate UIDs
          .filter((u, index, self) => index === self.findIndex((t) => t.uid === u.uid))
          // Sort accurately by genuine CM balance
          .sort((a, b) => (b.balance || 0) - (a.balance || 0));

        setAllUsers(sanitized);
      }
    } catch (e) {
      console.error("Failed to fetch leaderboard", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaders();
  }, []);

  // Top 6 Miners
  const top6Miners = useMemo(() => allUsers.slice(0, 6), [allUsers]);

  // Other Miners (from #7 onwards)
  const remainingMiners = useMemo(() => allUsers.slice(6), [allUsers]);

  // Filtered remaining miners based on search
  const filteredRemaining = useMemo(() => {
    if (!searchQuery.trim()) return remainingMiners;
    const q = searchQuery.toLowerCase().trim();
    return remainingMiners.filter(m => 
      (m.name || '').toLowerCase().includes(q) || 
      (m.email || '').toLowerCase().includes(q) || 
      (m.uid || '').toLowerCase().includes(q)
    );
  }, [remainingMiners, searchQuery]);

  // Find logged in user's rank
  const myRank = useMemo(() => {
    if (!user) return null;
    const index = allUsers.findIndex(u => u.uid === user.uid || (u.email && u.email.toLowerCase() === user.email?.toLowerCase()));
    return index !== -1 ? index + 1 : null;
  }, [allUsers, user]);

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#17140c] via-[#12110c] to-[#17140c] border border-[#FFD700]/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-black uppercase tracking-wider mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>Official Global Miners Ranking</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              CM Network <span className="text-[#FFD700]">Leaderboard</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
              Verified CM Coin balances. Featuring the Top 6 Network Leaders and all registered active miners.
            </p>
          </div>

          <button
            onClick={fetchLeaders}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FFD700]' : ''}`} />
            <span>Refresh Ranks</span>
          </button>
        </div>
      </div>

      {/* User's Personal Rank Card */}
      {user && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#15130d] via-[#1c180e] to-[#15130d] border border-[#FFD700]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(255,215,0,0.1)]">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/20 border border-[#FFD700]/40 flex items-center justify-center font-black text-[#FFD700] text-lg shrink-0">
              {myRank ? `#${myRank}` : '—'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-sm sm:text-base">Your Mining Position</span>
                <span className="px-2 py-0.5 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] text-[10px] font-bold uppercase">
                  You
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                {user.name} ({user.email})
              </p>
            </div>
          </div>

          <div className="text-right self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 flex sm:flex-col justify-between sm:justify-center items-center sm:items-end">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Verified Balance</span>
            <span className="text-base sm:text-lg font-black text-[#FFD700] font-mono">
              {formatCurrency(user.balance || 0)} <span className="text-xs text-white font-sans">CM</span>
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: TOP 6 USERS OF CM NETWORK (PROMINENT PODIUM / GRID)
         ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#FFD700]" />
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
              Top 6 Network Miners
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-[#FFD700] bg-[#FFD700]/10 px-2.5 py-1 rounded-full border border-[#FFD700]/20">
            Elite Tier
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 p-8 rounded-3xl bg-black/40 border border-white/5 text-gray-400 text-xs">
            Verifying and loading Top 6 rankings...
          </div>
        ) : top6Miners.length === 0 ? (
          <div className="text-center py-12 p-8 rounded-3xl bg-black/40 border border-white/5 text-gray-400 text-xs">
            No miners found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {top6Miners.map((miner, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;
              const isMe = user?.uid === miner.uid;

              const rankBadge = isFirst
                ? { label: '#1 Champion', color: 'from-[#FFD700] to-amber-500 text-black', border: 'border-[#FFD700]', icon: <Crown className="w-4 h-4 text-black" /> }
                : isSecond
                ? { label: '#2 Runner-Up', color: 'from-slate-200 to-gray-400 text-black', border: 'border-slate-300', icon: <Medal className="w-4 h-4 text-black" /> }
                : isThird
                ? { label: '#3 Bronze', color: 'from-amber-600 to-amber-800 text-white', border: 'border-amber-600', icon: <Medal className="w-4 h-4 text-white" /> }
                : { label: `#${index + 1} Elite`, color: 'from-purple-500 to-indigo-600 text-white', border: 'border-purple-500/40', icon: <Award className="w-4 h-4 text-white" /> };

              return (
                <div
                  key={miner.uid}
                  className={`relative p-5 rounded-3xl border transition-all overflow-hidden ${
                    isFirst 
                      ? 'bg-gradient-to-b from-[#221c0e] via-[#141209] to-[#0a0905] border-[#FFD700] shadow-[0_10px_35px_rgba(255,215,0,0.2)]'
                      : isSecond
                      ? 'bg-gradient-to-b from-[#1b1c20] via-[#101114] to-[#090a0d] border-slate-300/60 shadow-[0_10px_25px_rgba(200,200,200,0.1)]'
                      : isThird
                      ? 'bg-gradient-to-b from-[#1e150f] via-[#130d09] to-[#090604] border-amber-600/60'
                      : 'bg-black/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Top Rank Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r ${rankBadge.color} flex items-center gap-1.5 shadow`}>
                      {rankBadge.icon}
                      <span>{rankBadge.label}</span>
                    </span>

                    {isMe && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FFD700] text-black text-[10px] font-black uppercase tracking-widest">
                        YOU
                      </span>
                    )}
                  </div>

                  {/* Miner Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${
                      isFirst ? 'bg-[#FFD700] text-black shadow-[0_0_15px_rgba(255,215,0,0.4)]' :
                      isSecond ? 'bg-slate-200 text-black shadow' :
                      isThird ? 'bg-amber-600 text-white shadow' :
                      'bg-white/10 text-white'
                    }`}>
                      {miner.name ? miner.name.charAt(0).toUpperCase() : 'M'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-black text-base truncate flex items-center gap-1.5">
                        <span>{miner.name}</span>
                        {miner.kycStatus === 'verified' && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                      </h3>
                      <p className="text-xs text-gray-400 font-mono truncate">
                        {miner.email ? miner.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'miner@cmnetwork.io'}
                      </p>
                    </div>
                  </div>

                  {/* Coin Balance & Stats */}
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">Verified Coins</span>
                      <p className="text-lg font-black text-[#FFD700] font-mono leading-none mt-1">
                        {formatCurrency(miner.balance)} <span className="text-xs text-gray-400 font-sans">CM</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">Referrals</span>
                      <p className="text-xs font-bold text-blue-400 font-mono leading-none mt-1">
                        {miner.referralCount || 0} Friends
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 2: ALL USERS LIST (FROM #7 ONWARDS)
         ========================================================================= */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>All Network Miners ({allUsers.length})</span>
            </h3>
            <p className="text-xs text-gray-400">Complete community ranking ordered by genuine liquid balance</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search miners by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-gray-500 focus:border-[#FFD700] focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 text-xs">Loading all users...</div>
        ) : filteredRemaining.length === 0 ? (
          <div className="p-8 rounded-2xl bg-black/40 border border-white/5 text-center text-xs text-gray-400">
            {searchQuery ? 'No miners matching your search query.' : 'All users are in the Top 6!'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRemaining.map((miner, idx) => {
              const rankNumber = 7 + idx;
              const isMe = user?.uid === miner.uid;

              return (
                <div
                  key={miner.uid}
                  className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    isMe
                      ? 'bg-[#FFD700]/10 border-[#FFD700]/40 shadow-[0_0_15px_rgba(255,215,0,0.1)]'
                      : 'bg-black/40 border-white/5 hover:border-white/15 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <span className="w-8 font-black text-xs sm:text-sm font-mono text-gray-400 text-center shrink-0">
                      #{rankNumber}
                    </span>

                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-xs shrink-0">
                      {miner.name ? miner.name.charAt(0).toUpperCase() : 'M'}
                    </div>

                    <div className="min-w-0">
                      <h4 className={`font-bold text-xs sm:text-sm truncate flex items-center gap-1.5 ${isMe ? 'text-[#FFD700]' : 'text-white'}`}>
                        <span className="truncate">{miner.name}</span>
                        {isMe && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#FFD700] text-black font-black uppercase">
                            YOU
                          </span>
                        )}
                        {miner.kycStatus === 'verified' && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-mono truncate">
                        {miner.email ? miner.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'miner@cmnetwork.io'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right ml-4 shrink-0">
                    <div className="font-black text-[#FFD700] font-mono text-xs sm:text-sm">
                      {formatCurrency(miner.balance)} <span className="text-[10px] text-gray-400 font-sans">CM</span>
                    </div>
                    <div className="text-[10px] text-gray-500 font-bold">
                      {miner.referralCount || 0} refs
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
