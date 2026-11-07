import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Gem, 
  Lock, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Flame, 
  Crown,
  BellRing,
  Layers,
  Coins,
  Trophy,
  Users,
  Award,
  ChevronRight,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useApp } from '../hooks/useAppStore';

export function Nfts() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [isWhitelisted, setIsWhitelisted] = useState(() => {
    return localStorage.getItem(`cm_nft_whitelist_${user?.uid || 'guest'}`) === 'true';
  });

  const verifiedReferrals = (user?.referralCount || 0);
  const isPremiumEligible = verifiedReferrals >= 200;
  const progressPercent = Math.min(100, Math.round((verifiedReferrals / 200) * 100));

  const handleJoinWhitelist = () => {
    if (isWhitelisted) {
      toast('You are already registered for early access NFT minting!', { icon: '✨' });
      return;
    }

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setIsWhitelisted(true);
    localStorage.setItem(`cm_nft_whitelist_${user?.uid || 'guest'}`, 'true');
    toast.success("You're on the exclusive NFT Whitelist! You'll get priority mint access when launched.", {
      duration: 5000,
      icon: '🎉'
    });
  };

  const collections = [
    {
      id: 'cm-dragon',
      title: 'CM Dragon NFT',
      badge: 'Mythic • Supreme Tier',
      supply: '75 Total Editions',
      allocation: '50 Premium (200+ Referrals) • 25 General Community',
      network: 'BNB Smart Chain (BEP-721)',
      perks: '+100% Supreme Cloud Mining Hashrate, Dragon VIP Mining Club, Guaranteed CM Token Airdrop Multiplier',
      rarity: 'Mythic Legendary',
      emoji: '🐉',
      color: 'from-amber-500/25 via-red-500/10 to-transparent',
      borderColor: 'border-[#FFD700]/50 hover:border-[#FFD700]',
      tagColor: 'text-[#FFD700] bg-[#FFD700]/10 border-[#FFD700]/30',
      gradient: 'from-amber-400 via-yellow-500 to-orange-600',
      icon: Flame,
    },
    {
      id: 'cm-markhor',
      title: 'CM Markhor NFT',
      badge: 'National Pride • Apex Tier',
      supply: '125 Total Editions',
      allocation: '35 Premium (200+ Referrals) • 90 General Community',
      network: 'Solana (Metaplex)',
      perks: 'Zero P2P Escrow Platform Fees, Automatic 24H Cloud Mining Auto-Claim, Node Validation Governance Rights',
      rarity: 'Apex Legendary',
      emoji: '🐐',
      color: 'from-purple-500/25 via-indigo-500/10 to-transparent',
      borderColor: 'border-purple-500/50 hover:border-purple-400',
      tagColor: 'text-purple-300 bg-purple-500/10 border-purple-500/30',
      gradient: 'from-purple-500 via-indigo-500 to-indigo-700',
      icon: Crown,
    },
    {
      id: 'cm-penguin',
      title: 'CM Penguin NFT',
      badge: 'Frost Mascot • Rare Tier',
      supply: '100 Total Editions',
      allocation: '15 Premium (200+ Referrals) • 85 General Community',
      network: 'Dual Chain (BSC & Solana)',
      perks: '+35% Continuous Hashrate Boost, Animated CM Penguin Profile Avatar, Staking APY Boost',
      rarity: 'Frost Rare',
      emoji: '🐧',
      color: 'from-cyan-500/25 via-blue-500/10 to-transparent',
      borderColor: 'border-cyan-500/50 hover:border-cyan-400',
      tagColor: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30',
      gradient: 'from-cyan-400 via-teal-500 to-blue-600',
      icon: Zap,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#FFD700] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FFD700] via-amber-500 to-orange-500 flex items-center justify-center text-black font-black shadow-[0_0_20px_rgba(255,215,0,0.4)]">
              <Gem className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <span>NFT Marketplace</span>
                <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/40 text-purple-300 text-xs font-black uppercase tracking-wider animate-pulse">
                  Coming Soon
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Official CM Network Collectibles: 300 Total NFT Distribution Protocol.
              </p>
            </div>
          </div>
        </div>

        {/* Priority Whitelist Button */}
        <button
          onClick={handleJoinWhitelist}
          className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 shadow-lg shrink-0 ${
            isWhitelisted
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
              : 'bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] hover:brightness-110 text-black shadow-[0_0_25px_rgba(255,215,0,0.35)]'
          }`}
        >
          {isWhitelisted ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Whitelist Registered ✓</span>
            </>
          ) : (
            <>
              <BellRing className="w-4 h-4 fill-black" />
              <span>Get Priority Whitelist Access</span>
            </>
          )}
        </button>
      </div>

      {/* Hero "COMING SOON" Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12100a] via-[#0d0d0f] to-[#140f1a] border border-[#FFD700]/30 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#FFD700]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-[#FFD700]/40 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-[#FFD700] animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-xs font-black text-[#FFD700] uppercase tracking-widest">
            Total Distribution: 300 Exclusive NFTs • Launching Soon
          </span>
        </div>

        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            CM Network NFTs <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#FFD700] via-amber-300 to-purple-400 bg-clip-text text-transparent">
              Coming Soon!
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-lg mx-auto">
            A strictly limited distribution of <strong>300 NFTs</strong> across BNB Smart Chain and Solana. 100 NFTs are reserved for Premium Miners (200+ verified referrals), and 200 NFTs for the wider CM Network mining community.
          </p>
        </div>

        {/* 300 TOTAL DISTRIBUTION PROTOCOL ALLOCATION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto text-left pt-2">
          
          {/* Allocation Box 1: 100 NFTs for Premium Users */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-black to-yellow-500/5 border border-[#FFD700]/40 space-y-3 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Crown className="w-3 h-3 text-[#FFD700]" />
                <span>100 NFTs • Premium Pool</span>
              </span>
              <span className="text-xs font-mono font-black text-[#FFD700]">33.3% Supply</span>
            </div>
            <div>
              <h4 className="text-base font-black text-white flex items-center gap-1.5">
                <span>Premium User Allocation</span>
              </h4>
              <p className="text-xs text-gray-300 mt-1">
                Reserved exclusively for miners with <strong>200+ Verified Referrals</strong>. Guarantees priority zero-cost mint pass.
              </p>
            </div>
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-gray-400">Requirement:</span>
              <span className="text-[#FFD700] font-black">200 Verified Referrals</span>
            </div>
          </div>

          {/* Allocation Box 2: 200 NFTs for General Community */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/15 via-black to-indigo-500/5 border border-purple-500/40 space-y-3 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3 text-purple-400" />
                <span>200 NFTs • Community Pool</span>
              </span>
              <span className="text-xs font-mono font-black text-purple-300">66.7% Supply</span>
            </div>
            <div>
              <h4 className="text-base font-black text-white flex items-center gap-1.5">
                <span>General Users Allocation</span>
              </h4>
              <p className="text-xs text-gray-300 mt-1">
                Distributed among all active CM Network miners and community members through fair whitelist lottery.
              </p>
            </div>
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-gray-400">Eligibility:</span>
              <span className="text-purple-300 font-black">All Active Community Miners</span>
            </div>
          </div>

        </div>

        {/* User's Live Referral Progress Toward 100 Premium NFTs Pool */}
        <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-black/60 border border-white/10 text-left space-y-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Trophy className={`w-4 h-4 ${isPremiumEligible ? 'text-emerald-400' : 'text-[#FFD700]'}`} />
              <span className="font-bold text-white">Your Premium Pool Status:</span>
              <span className={`px-2 py-0.5 rounded-full font-black text-[10px] uppercase ${
                isPremiumEligible ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-white/5 text-gray-400 border border-white/10'
              }`}>
                {isPremiumEligible ? 'Eligible for Premium Pool ✓' : 'Eligible for Community Pool'}
              </span>
            </div>
            <div className="font-mono text-xs">
              <span className={isPremiumEligible ? 'text-emerald-400 font-bold' : 'text-[#FFD700] font-bold'}>
                {verifiedReferrals}
              </span>
              <span className="text-gray-500"> / 200 Verified Referrals</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
            <div 
              className={`h-full transition-all duration-500 ${
                isPremiumEligible 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                  : 'bg-gradient-to-r from-[#FFD700] via-amber-400 to-orange-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-400 block">
            {isPremiumEligible 
              ? 'Congratulations! You have 200+ verified referrals and qualify for the exclusive 100 Premium NFTs pool!'
              : `Invite and verify ${Math.max(0, 200 - verifiedReferrals)} more friends to unlock the exclusive 100 Premium NFT pool.`}
          </span>
        </div>

        {/* Whitelist CTA Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleJoinWhitelist}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,215,0,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>{isWhitelisted ? 'Whitelist Access Active ✓' : 'Join Free Early Access Whitelist'}</span>
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>

      {/* FEATURED NFT COLLECTIONS SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FFD700]" />
              <span>Official CM Network NFT Collections</span>
            </h3>
            <p className="text-xs text-gray-400">
              Details and allocation of upcoming collections. Minting will go live in the upcoming protocol update.
            </p>
          </div>
          <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30 font-bold">
            Total Supply: 300 NFTs
          </span>
        </div>

        {/* 3 Main Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {collections.map((col) => {
            const IconComponent = col.icon;
            return (
              <div
                key={col.id}
                onClick={() => {
                  toast(`"${col.title}" is coming soon! Total distribution: 300 NFTs.`, {
                    icon: col.emoji,
                    duration: 3500
                  });
                }}
                className={`group relative rounded-3xl bg-black/60 border ${col.borderColor} p-6 space-y-4 hover:border-[#FFD700] transition-all hover:scale-[1.02] cursor-pointer overflow-hidden shadow-xl`}
              >
                {/* Background decorative gradient */}
                <div className={`absolute inset-0 bg-gradient-to-b ${col.color} pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity`} />

                {/* Card Header */}
                <div className="flex items-center justify-between relative z-10">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${col.tagColor}`}>
                    {col.badge}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 text-[10px] font-mono text-gray-300">
                    {col.rarity}
                  </span>
                </div>

                {/* Visual NFT Placeholder with Emblem & Emoji */}
                <div className="relative aspect-square w-full rounded-2xl bg-gradient-to-br from-black via-[#141416] to-[#0a0a0c] border border-white/10 flex flex-col items-center justify-center p-6 text-center space-y-3 overflow-hidden group-hover:border-[#FFD700]/50 transition-colors">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${col.gradient} flex items-center justify-center text-black shadow-2xl group-hover:scale-110 transition-transform relative`}>
                    <span className="text-4xl select-none">{col.emoji}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Supply</span>
                    <span className="text-xs font-mono font-black text-white">{col.supply}</span>
                  </div>

                  {/* "Coming Soon" Floating Overlay Tag */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <div className="px-4 py-2 rounded-xl bg-[#FFD700] text-black font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Coming Soon</span>
                    </div>
                  </div>
                </div>

                {/* NFT Details & Allocation Breakdown */}
                <div className="space-y-2 relative z-10">
                  <h4 className="text-sm font-black text-white group-hover:text-[#FFD700] transition-colors flex items-center gap-1.5">
                    <span>{col.title}</span>
                    <span className="text-base">{col.emoji}</span>
                  </h4>
                  <div className="text-[11px] text-gray-400 space-y-1">
                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
                      <span className="text-[10px] text-gray-400 font-bold block uppercase">Allocation:</span>
                      <span className="text-[#FFD700] font-mono text-[11px] font-bold block">{col.allocation}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-gray-500">Network:</span>
                      <span className="text-gray-200 font-mono font-bold">{col.network}</span>
                    </div>
                    <div className="text-[11px] text-gray-300 pt-1 leading-snug">
                      <strong className="text-[#FFD700]">Utility:</strong> {col.perks}
                    </div>
                  </div>
                </div>

                {/* Coming Soon Button */}
                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 group-hover:bg-[#FFD700]/20 text-white group-hover:text-[#FFD700] font-bold text-xs uppercase tracking-wider border border-white/10 group-hover:border-[#FFD700]/40 transition-all flex items-center justify-center gap-1.5 relative z-10"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Coming Soon • Preview</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* "MORE NFTS COMING SOON" CARD */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/30 via-black to-indigo-950/30 border border-dashed border-purple-500/40 text-center space-y-3 relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Upcoming Releases</span>
          </div>
          <h4 className="text-lg font-black text-white">More NFTs Coming Soon...</h4>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Additional Cyber Miner series, Node Guardian avatars, and Guild Crests will be announced in upcoming protocol milestones. Keep mining and building your referral squad!
          </p>
        </div>

      </div>

    </div>
  );
}
