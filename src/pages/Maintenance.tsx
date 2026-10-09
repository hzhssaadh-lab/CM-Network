import React, { useState } from 'react';
import { 
  Rocket, 
  Wallet, 
  Users, 
  Copy, 
  CheckCircle2, 
  ShieldCheck, 
  Star, 
  Zap, 
  ArrowRightLeft, 
  History, 
  Clock, 
  Lock, 
  Share2, 
  Coins, 
  Flame, 
  Check,
  TrendingUp,
  Sparkles,
  User as UserIcon,
  LogOut
} from 'lucide-react';
import { useApp } from '../hooks/useAppStore';
import { formatCurrency } from '../lib/utils';
import { SocialChannels } from '../components/SocialChannels';
import toast from 'react-hot-toast';

interface MaintenanceProps {
  onMaintenanceEnd?: () => void;
}

export function Maintenance({ onMaintenanceEnd }: MaintenanceProps) {
  const { user, logout } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const referralCode = user?.referralCode || user?.uid?.substring(0, 8).toUpperCase() || 'CMNETWORK';
  const referralLink = `${window.location.origin}/?ref=${referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    toast.success('Referral Code copied!', { icon: '📋' });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast.success('Referral Link copied to clipboard!', { icon: '🔗' });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'CM Network Phase 2',
        text: `Join CM Network Phase 2 with my referral code ${referralCode}!`,
        url: referralLink,
      }).catch(() => handleCopyLink());
    } else {
      handleCopyLink();
    }
  };

  const comingSoonFeatures = [
    {
      id: 'mining',
      icon: Flame,
      title: 'Phase 2 Mining Engine',
      category: 'MINING',
      description: 'Upgraded cloud & node extraction protocol with dynamic hashrates, boosted yields, and auto-staking.',
      badge: 'Coming Soon',
      color: 'from-amber-500/20 to-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      iconColor: 'text-[#FFD700]',
    },
    {
      id: 'wallet',
      icon: Wallet,
      title: 'CM Web3 Wallet',
      category: 'WALLET',
      description: 'Non-custodial on-chain wallet for direct deposit, secure holding, and multi-network transfers.',
      badge: 'Coming Soon',
      color: 'from-blue-500/20 to-cyan-500/10',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      id: 'swap',
      icon: ArrowRightLeft,
      title: 'CM ⇄ USDT Instant Swap',
      category: 'SWAP',
      description: 'Decentralized automated liquidity pool to swap accumulated CM Coins into USDT with zero slippage.',
      badge: 'Coming Soon',
      color: 'from-emerald-500/20 to-green-500/10',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-[#00FF66]',
    },
    {
      id: 'history',
      icon: History,
      title: 'Ledger & Transaction History',
      category: 'HISTORY',
      description: 'Comprehensive verifiable transaction audit log for Phase 1 migrations, rewards, and transfers.',
      badge: 'Coming Soon',
      color: 'from-purple-500/20 to-pink-500/10',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
    },
    {
      id: 'tasks',
      icon: Zap,
      title: 'Phase 2 Quests & Rewards',
      category: 'TASKS & ADS',
      description: 'Verified sponsor missions, daily streak challenges, and interactive video rewards system.',
      badge: 'Coming Soon',
      color: 'from-orange-500/20 to-red-500/10',
      borderColor: 'border-orange-500/30',
      iconColor: 'text-orange-400',
    },
    {
      id: 'p2p',
      icon: Users,
      title: 'P2P Trading & Leaderboard',
      category: 'TRADING & RANKS',
      description: 'Peer-to-peer escrow marketplace and global community leaderboards with seasonal prize pools.',
      badge: 'Coming Soon',
      color: 'from-indigo-500/20 to-blue-500/10',
      borderColor: 'border-indigo-500/30',
      iconColor: 'text-indigo-400',
    },
  ];

  return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center p-3 sm:p-6 text-center z-[9999] fixed inset-0 overflow-y-auto overflow-x-hidden selection:bg-[#FFD700]/30 font-sans">
      
      {/* Background Lighting Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#FFD700]/5 rounded-full blur-[140px] opacity-70 mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#00FF66]/5 rounded-full blur-[120px] opacity-40 mix-blend-screen" />
        <div className="absolute top-[40%] right-[-10%] w-[450px] h-[450px] bg-blue-500/5 rounded-full blur-[120px] opacity-30 mix-blend-screen" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMCA0MEwwIDBINDBMMCA0MFoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiIvPgo8L3N2Zz4=')] opacity-25" />
      </div>

      <div className="max-w-3xl w-full py-6 sm:py-10 px-2 sm:px-4 flex flex-col items-center relative z-10 space-y-6 sm:space-y-8">
        
        {/* Phase Status Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Phase 1 Completed ✅</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FFD700]/20 to-amber-500/20 border border-[#FFD700]/40 text-[#FFD700] text-xs font-black tracking-widest uppercase backdrop-blur-md shadow-[0_0_20px_rgba(255,215,0,0.2)] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-ping" />
            <Rocket className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Phase 2 Started 🚀</span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="flex flex-col items-center w-full">
          <div className="w-20 h-20 sm:w-28 sm:h-28 mb-4 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700] via-amber-400 to-[#00FF66] rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 animate-pulse" />
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#050505] border-2 border-[#FFD700]/50 flex items-center justify-center relative shadow-[0_0_50px_rgba(255,215,0,0.25)]">
              <div className="absolute inset-1 rounded-full border border-[#FFD700]/30 border-dashed animate-[spin_12s_linear_infinite]" />
              <Rocket className="w-10 h-10 sm:w-14 sm:h-14 text-[#FFD700] drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]" />
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FFD700] to-white tracking-tight mb-2 text-center leading-tight">
            CM NETWORK PHASE 2 IS LIVE
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm md:text-base font-medium tracking-wide max-w-lg leading-relaxed">
            Phase 1 is officially completed ✅. Phase 2 initialization has started. All your coins, USDT balances, and referral networks are secure and active below.
          </p>
        </div>

        {/* Logged-in Pioneer User Account Card */}
        <div className="w-full bg-[#0D0D0D] border border-white/10 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left shadow-lg">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#FFD700] to-amber-600 p-0.5 relative flex-shrink-0">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-full h-full rounded-[14px] object-cover" />
              ) : (
                <div className="w-full h-full rounded-[14px] bg-[#1A1A1A] flex items-center justify-center text-[#FFD700] font-black text-lg">
                  {(user?.displayName || user?.email || 'CM')[0].toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-black rounded-full" />
            </div>

            <div className="overflow-hidden">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-white font-extrabold text-sm sm:text-base truncate">
                  {user?.displayName || user?.email?.split('@')[0] || 'CM Pioneer'}
                </h3>
                <span className="bg-[#FFD700]/15 text-[#FFD700] text-[9px] font-black px-2 py-0.5 rounded-full border border-[#FFD700]/30 tracking-wider">
                  PHASE 1 PIONEER
                </span>
              </div>
              <p className="text-gray-400 text-xs truncate mt-0.5">
                {user?.email || 'cm.network.user@node'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="bg-black/60 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">UID:</span>
              <span className="text-white font-mono text-xs font-bold">{referralCode}</span>
            </div>
            <button
              onClick={() => logout()}
              className="px-3 py-1.5 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/20 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            PHASE 2 ACTIVE STATS: ONLY ALL COIN, USDT, AND REFERRAL (AS REQUESTED)
           ========================================================================= */}
        <div className="w-full">
          <div className="flex items-center justify-between px-2 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFD700]" />
              <h2 className="text-white text-sm sm:text-base font-bold tracking-tight uppercase">
                Active Portfolio & Network
              </h2>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live & Synced
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            
            {/* 1. All Coins (CM Balance) */}
            <div className="bg-gradient-to-b from-[#141414] to-[#0A0A0A] border border-[#FFD700]/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between text-left relative overflow-hidden group hover:border-[#FFD700]/60 transition-all shadow-[0_4px_24px_rgba(255,215,0,0.06)]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFD700]/5 rounded-full blur-2xl group-hover:bg-[#FFD700]/10 transition-all pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-[#FFD700]" /> Total CM Coins
                </span>
                <span className="text-[10px] font-black text-[#FFD700] bg-[#FFD700]/10 px-2 py-0.5 rounded border border-[#FFD700]/20">
                  ALL COINS
                </span>
              </div>
              <div>
                <div className="text-white font-black text-2xl sm:text-3xl tracking-tight flex items-baseline gap-1.5">
                  {formatCurrency(user?.balance || 0)} <span className="text-[#FFD700] text-sm sm:text-base font-bold">CM</span>
                </div>
                <div className="text-gray-500 text-xs font-mono mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>≈ ${( (user?.balance || 0) * 6.00 ).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                <span>Phase 1 Holdings</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Preserved
                </span>
              </div>
            </div>

            {/* 2. USDT Balance */}
            <div className="bg-gradient-to-b from-[#141414] to-[#0A0A0A] border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between text-left relative overflow-hidden group hover:border-emerald-500/60 transition-all shadow-[0_4px_24px_rgba(16,185,129,0.06)]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-400" /> USDT Balance
                </span>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  STABLE
                </span>
              </div>
              <div>
                <div className="text-emerald-400 font-black text-2xl sm:text-3xl tracking-tight flex items-baseline gap-1.5">
                  ${formatCurrency(user?.usdtBalance || 0)} <span className="text-xs sm:text-sm font-bold text-gray-400">USDT</span>
                </div>
                <div className="text-gray-500 text-xs font-mono mt-1">
                  Tether USD Asset
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                <span>Phase 2 Ready</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>
            </div>

            {/* 3. Total Referrals */}
            <div className="bg-gradient-to-b from-[#141414] to-[#0A0A0A] border border-blue-500/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between text-left relative overflow-hidden group hover:border-blue-500/60 transition-all shadow-[0_4px_24px_rgba(59,130,246,0.06)]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-400" /> Total Referrals
                </span>
                <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  NETWORK
                </span>
              </div>
              <div>
                <div className="text-white font-black text-2xl sm:text-3xl tracking-tight flex items-baseline gap-1.5">
                  {user?.referralCount || 0} <span className="text-blue-400 text-sm sm:text-base font-bold">Friends</span>
                </div>
                <div className="text-gray-500 text-xs font-mono mt-1">
                  Active Referral Team
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                <span>Network Bonus</span>
                <span className="text-blue-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              </div>
            </div>

          </div>

          {/* Referral Link & Share Box (Users can invite friends in Phase 2) */}
          <div className="mt-3 bg-[#0F0F0F] border border-white/10 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400">
                <Share2 className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <span className="text-gray-400 text-[11px] uppercase font-bold tracking-wider block">Your Referral Code</span>
                <span className="text-white font-mono font-black text-sm tracking-wider">{referralCode}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleCopyCode}
                className="flex-1 sm:flex-none px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-200 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                <span>{copiedCode ? 'Copied Code' : 'Copy Code'}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-[#FFD700] to-amber-500 text-black rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,215,0,0.2)] active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Invite Friends</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            COMING SOON SECTION: MINING, WALLET, SWAP, HISTORY, AND OTHERS
           ========================================================================= */}
        <div className="w-full">
          <div className="flex items-center justify-between px-2 mb-3.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="text-white text-sm sm:text-base font-bold tracking-tight uppercase">
                Phase 2 Modules
              </h2>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3" /> Coming Soon
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {comingSoonFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.id}
                  className={`bg-[#0D0D0D] border ${item.borderColor} rounded-2xl p-4 sm:p-5 flex flex-col justify-between text-left relative overflow-hidden group hover:scale-[1.01] transition-all`}
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} rounded-full blur-xl pointer-events-none opacity-40`} />
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center">
                        <Icon className={`w-4 h-4 ${item.iconColor}`} />
                      </div>
                      <span className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-amber-300/90 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        {item.badge}
                      </span>
                    </div>

                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-0.5">
                      {item.category}
                    </span>
                    <h3 className="text-white font-bold text-sm sm:text-base tracking-tight mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-gray-500">Phase 2 Deployment</span>
                    <button 
                      onClick={() => toast('This module will unlock during Phase 2 feature release!', { icon: '⏳' })}
                      className="text-[10px] font-bold text-gray-300 hover:text-[#FFD700] transition-colors flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg"
                    >
                      <span>Details</span>
                      <Star className="w-2.5 h-2.5 text-[#FFD700]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase Transition Progress Bar */}
        <div className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 sm:p-5 text-left">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="text-white text-xs sm:text-sm font-bold block">Phase 2 Initialization Progress</span>
              <span className="text-gray-400 text-[11px]">Phase 1 Complete ✅ | Deploying Phase 2 ecosystem</span>
            </div>
            <span className="text-[#00FF66] font-mono font-black text-sm sm:text-base">LIVE</span>
          </div>
          <div className="w-full h-2.5 bg-black rounded-full overflow-hidden border border-white/5 mt-2">
            <div className="h-full bg-gradient-to-r from-emerald-400 via-[#FFD700] to-emerald-400 w-full relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cGF0aCBkPSJNMCA4TDggMEg4TDAgOFoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4yIi8+Cjwvc3ZnPg==')] animate-[slide_1s_linear_infinite]" />
            </div>
          </div>
        </div>

        {/* Official Contract Address Banner */}
        <div className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#FFD700]" />
            </div>
            <div>
              <span className="text-white text-xs sm:text-sm font-bold block">Official CM Smart Contract</span>
              <span className="text-gray-400 text-[11px]">On-chain verification and contract deployment</span>
            </div>
          </div>
          <div className="bg-black/60 border border-white/5 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-pulse" />
            <span className="text-[#FFD700] font-mono text-xs font-bold uppercase tracking-wider">Phase 2 Announcement Coming Soon</span>
          </div>
        </div>

        {/* Official Community Channels: WhatsApp, X, Telegram (Placed at the bottom / last as requested) */}
        <SocialChannels 
          title="Official Community & Channels"
          subtitle="Join our official channels for Phase 2 updates, contract announcements & rewards"
        />
        
        {/* Footer status notice */}
        <div className="pb-8 pt-2">
          <p className="text-gray-500 text-[11px] font-semibold tracking-wider flex items-center justify-center gap-2">
            <span>CM Network Phase 2 Core Engine</span>
            <span className="w-1 h-1 rounded-full bg-[#FFD700]" />
            <span className="text-[#FFD700]">All assets secured</span>
          </p>
        </div>

      </div>
    </div>
  );
}




