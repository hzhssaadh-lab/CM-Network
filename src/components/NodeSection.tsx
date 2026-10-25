import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useAppStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRightLeft, 
  Coins, 
  MessageSquare, 
  Sparkles, 
  Users, 
  AlertCircle, 
  Check, 
  Lock,
  ExternalLink,
  Zap,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export function NodeSection() {
  const { user, updateUser } = useApp();
  const navigate = useNavigate();

  const [loadingFriends, setLoadingFriends] = useState(true);
  const [totalFriends, setTotalFriends] = useState(0);
  const [kycVerifiedCount, setKycVerifiedCount] = useState(0);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const fetchReferralStats = async () => {
      if (!user) return;
      try {
        const code = user.referralCode || user.uid?.substring(0, 8).toUpperCase();
        const ids = Array.from(new Set([user.uid, code, code?.toLowerCase(), code?.toUpperCase()].filter(Boolean))) as string[];
        const { data } = await supabase
          .from('users')
          .select('uid, kycStatus')
          .in('referredBy', ids);

        if (data && data.length > 0) {
          const count = Math.max(data.length, user.referralCount || 0);
          setTotalFriends(count);
          const verified = data.filter((u: any) => u.kycStatus === 'verified').length;
          setKycVerifiedCount(verified);
        } else {
          setTotalFriends(user.referralCount || 0);
          setKycVerifiedCount(0);
        }
      } catch (e) {
        console.error(e);
        setTotalFriends(user?.referralCount || 0);
      } finally {
        setLoadingFriends(false);
      }
    };

    fetchReferralStats();
  }, [user]);

  if (!user) return null;

  const nodeStatus = user.nodeStatus || 'none';
  const hasMinReferrals = totalFriends >= 140;
  const allKycComplete = totalFriends > 0 && kycVerifiedCount >= totalFriends;
  const isEligible = hasMinReferrals && allKycComplete;

  const handleApplyNode = async () => {
    if (!isEligible) {
      toast.error('You do not meet all criteria yet (140+ referrals with all KYC verified).');
      return;
    }

    setIsApplying(true);
    try {
      await updateUser({
        nodeStatus: 'applied',
        nodeAppliedAt: Date.now()
      });
      confetti({ particleCount: 70, spread: 80 });
      toast.success('Node Operator application submitted! Core team will review your node license.', { icon: '🚀' });
    } catch (e) {
      toast.error('Failed to submit node application.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#14120c] via-[#0f0e0a] to-[#0a0a07] border-2 border-[#FFD700]/40 rounded-[32px] p-6 sm:p-8 space-y-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-black uppercase tracking-wider mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>CM Network Validator Node License</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Node Operator Program
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Become an official CM Node Operator to unlock P2P escrow trading, yield boosts, and direct core chat.
          </p>
        </div>

        <div>
          {nodeStatus === 'approved' ? (
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-black flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Node Active (P2P Unlocked) ✓</span>
            </span>
          ) : nodeStatus === 'applied' ? (
            <span className="px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black flex items-center gap-1.5 animate-pulse">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Application Under Review ⏳</span>
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-bold">
              License Status: Not Active
            </span>
          )}
        </div>
      </div>

      {/* 4 Node Operator Benefits */}
      <div>
        <h4 className="text-xs font-black uppercase tracking-wider text-[#FFD700] mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
          <span>Exclusive Node Operator Benefits</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Benefit 1: P2P Trading */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 hover:border-[#FFD700]/40 transition-colors space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-black text-white">1. Unlock P2P Trading</h5>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Exclusive 3-month access to trade CM Coins directly against USDT on the P2P Escrow Desk before public launch.
            </p>
          </div>

          {/* Benefit 2: Extra Coin Yield */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 hover:border-[#FFD700]/40 transition-colors space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-black text-white">2. Extra Coin Yield Multiplier</h5>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Earn elevated mining rates and automated node validation staking dividends every 12 hours.
            </p>
          </div>

          {/* Benefit 3: Direct Core Chat */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 hover:border-[#FFD700]/40 transition-colors space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-black text-white">3. Direct Chat with CM Network</h5>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Direct 1-on-1 private VIP chat channel with the CM Network leadership and blockchain engineering core.
            </p>
          </div>

          {/* Benefit 4: Governance & Airdrops */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 hover:border-[#FFD700]/40 transition-colors space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-black text-white">4. Node Governance & Airdrops</h5>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Priority whitelist allocation for future mainnet token airdrops and protocol upgrade voting power.
            </p>
          </div>

        </div>
      </div>

      {/* Mandatory Criteria & Live Progress */}
      <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">
          Node Application Criteria
        </h4>

        {/* Criteria 1: 140+ Referrals */}
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
              hasMinReferrals ? 'bg-emerald-500 text-black' : 'bg-white/10 text-gray-400'
            }`}>
              {hasMinReferrals ? '✓' : '1'}
            </div>
            <div>
              <p className="text-xs font-bold text-white">Criteria 1: 140+ Direct Referrals</p>
              <p className="text-[10px] text-gray-500">Your network must reach at least 140 invited members.</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-xs font-mono font-bold ${hasMinReferrals ? 'text-emerald-400' : 'text-[#FFD700]'}`}>
              {totalFriends} / 140
            </span>
            <span className="block text-[9px] text-gray-500">
              {hasMinReferrals ? 'Passed ✓' : `${140 - totalFriends} remaining`}
            </span>
          </div>
        </div>

        {/* Criteria 2: All Referrals KYC Complete */}
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
              allKycComplete ? 'bg-emerald-500 text-black' : 'bg-white/10 text-gray-400'
            }`}>
              {allKycComplete ? '✓' : '2'}
            </div>
            <div>
              <p className="text-xs font-bold text-white">Criteria 2: All Referrals KYC Verified</p>
              <p className="text-[10px] text-gray-500">Every single referred member must complete identity KYC.</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-xs font-mono font-bold ${allKycComplete ? 'text-emerald-400' : 'text-amber-400'}`}>
              {kycVerifiedCount} / {Math.max(totalFriends, 1)} KYC Done
            </span>
            <span className="block text-[9px] text-gray-500">
              {allKycComplete ? 'Passed ✓' : `${totalFriends - kycVerifiedCount} pending`}
            </span>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-1 flex flex-col sm:flex-row items-center gap-3">
        {nodeStatus === 'approved' ? (
          <button
            onClick={() => navigate('/p2p')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-600 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 shadow"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Launch P2P Trading Desk</span>
          </button>
        ) : nodeStatus === 'applied' ? (
          <button
            disabled
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-default"
          >
            <Clock className="w-4 h-4 animate-spin" />
            <span>Application Under Protocol Review</span>
          </button>
        ) : (
          <button
            onClick={handleApplyNode}
            disabled={!isEligible || isApplying}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              isEligible 
                ? 'bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] text-black hover:brightness-110 active:scale-95 shadow-[0_0_25px_rgba(255,215,0,0.35)]' 
                : 'bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>{isApplying ? 'Submitting Application...' : isEligible ? 'Apply for CM Node License Now' : 'Criteria Not Met (140+ Referrals & All KYC)'}</span>
          </button>
        )}

        <button
          onClick={() => navigate('/friends')}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all"
        >
          Check Referral KYC Status
        </button>
      </div>

    </div>
  );
}
