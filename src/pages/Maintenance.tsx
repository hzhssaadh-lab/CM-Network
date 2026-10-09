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
  LogOut,
  Bell,
  Settings,
  X,
  ExternalLink,
  ChevronRight,
  Shield,
  Home
} from 'lucide-react';
import { useApp } from '../hooks/useAppStore';
import { formatCurrency } from '../lib/utils';
import { SocialChannels, OFFICIAL_SOCIALS } from '../components/SocialChannels';
import toast from 'react-hot-toast';

interface MaintenanceProps {
  onMaintenanceEnd?: () => void;
}

export function Maintenance({ onMaintenanceEnd }: MaintenanceProps) {
  const { user, logout } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'referrals' | 'wallet' | 'tasks' | 'profile'>('home');

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
      title: 'Phase 2 Cloud Mining',
      category: 'EXTRACTION ENGINE',
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
      category: 'ON-CHAIN STORAGE',
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
      category: 'LIQUIDITY POOL',
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
      category: 'BLOCKCHAIN AUDIT',
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
      category: 'SPONSOR MISSIONS',
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
      category: 'DECENTRALIZED ESCROW',
      description: 'Peer-to-peer escrow marketplace and global community leaderboards with seasonal prize pools.',
      badge: 'Coming Soon',
      color: 'from-indigo-500/20 to-blue-500/10',
      borderColor: 'border-indigo-500/30',
      iconColor: 'text-indigo-400',
    },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center z-[9999] fixed inset-0 overflow-y-auto overflow-x-hidden selection:bg-[#FFD700]/30 font-sans pb-28">
      
      {/* Background Lighting Gradients & Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#FFD700]/8 rounded-full blur-[140px] opacity-80" />
        <div className="absolute top-[40%] -left-32 w-[500px] h-[500px] bg-[#00FF66]/5 rounded-full blur-[140px] opacity-50" />
        <div className="absolute bottom-10 -right-32 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px] opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* =========================================================================
          TOP APP HEADER BAR (MATCHING SCREENSHOT)
         ========================================================================= */}
      <header className="w-full max-w-2xl px-4 pt-4 sm:pt-6 pb-3 sticky top-0 bg-black/80 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar with gold ring & status */}
          <div className="relative">
            <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-[#FFD700] via-amber-400 to-[#00FF66] shadow-[0_0_15px_rgba(255,215,0,0.3)]">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover bg-black" />
              ) : (
                <div className="w-full h-full rounded-full bg-[#151515] flex items-center justify-center text-[#FFD700] font-black text-sm">
                  {(user?.displayName || user?.email || 'CM')[0].toUpperCase()}
                </div>
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-black rounded-full" />
          </div>

          {/* User info & VIP badge */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-extrabold text-sm sm:text-base tracking-tight truncate max-w-[140px] sm:max-w-[200px]">
                {user?.displayName || user?.email?.split('@')[0] || 'Saad Sheikh'}
              </span>
              <span className="bg-gradient-to-r from-[#FFD700]/20 to-amber-500/20 text-[#FFD700] border border-[#FFD700]/40 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(255,215,0,0.15)]">
                <Shield className="w-2.5 h-2.5 text-[#FFD700]" />
                VIP 0
              </span>
            </div>

            {/* UID with copy button */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-gray-400 text-xs font-mono font-medium">
                UID: {referralCode}
              </span>
              <button 
                onClick={handleCopyCode}
                className="text-gray-500 hover:text-[#FFD700] transition-colors p-0.5"
                title="Copy UID"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right header action buttons: Notification & Settings */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowNotifications(true)}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black animate-pulse" />
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all"
            title="Settings & Account"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-2xl w-full px-4 pt-4 flex flex-col items-center space-y-5">
        
        {/* Phase Transition Indicator */}
        <div className="w-full flex items-center justify-between bg-[#111114] border border-white/10 rounded-2xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Phase 1 Complete ✅</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase">
            <Rocket className="w-3 h-3" />
            <span>Phase 2 Active 🚀</span>
          </div>
        </div>

        {/* =========================================================================
            BIG LUXURY GOLD BALANCE HERO CARD (MATCHING SCREENSHOT)
           ========================================================================= */}
        <div className="w-full relative rounded-3xl p-[1.5px] bg-gradient-to-b from-[#FFD700]/60 via-[#FFD700]/20 to-white/10 shadow-[0_8px_35px_rgba(255,215,0,0.12)]">
          <div className="w-full bg-gradient-to-b from-[#141416] via-[#0E0E10] to-[#08080A] rounded-[23px] p-5 sm:p-6 relative overflow-hidden text-center sm:text-left">
            
            {/* Ambient gold glow in top right */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#FFD700]/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Card Header */}
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FFD700]/20 border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700]">
                  <Coins className="w-4 h-4" />
                </div>
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                  Total CM Assets
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Preserved & Live
              </span>
            </div>

            {/* Large Prominent Balance Display */}
            <div className="relative z-10 my-2">
              <div className="flex items-baseline justify-center sm:justify-start gap-2">
                <span className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-200 tracking-tight">
                  {formatCurrency(user?.balance || 0)}
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#FFD700] drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]">
                  CM
                </span>
              </div>
              <div className="mt-1 flex items-center justify-center sm:justify-start gap-2 text-xs font-mono text-gray-400">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>≈ ${( (user?.balance || 0) * 6.00 ).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
                  +100% Phase 1 Preserved
                </span>
              </div>
            </div>

            {/* Quick Action Buttons inside Card */}
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3 relative z-10">
              <button
                onClick={handleShare}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-500 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:brightness-110 active:scale-95 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Invite Friends</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                <span>{copiedLink ? 'Link Copied' : 'Copy Referral Link'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* =========================================================================
            ACTIVE STATS: ONLY 3 KEY METRICS AS REQUESTED (COIN, USDT, REFERRAL)
           ========================================================================= */}
        <div className="w-full space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
              Phase 2 Active Portfolio
            </h2>
            <span className="text-[10px] text-gray-500 font-semibold">Real-Time Sync</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* 1. All Coins (CM Balance) */}
            <div className="bg-[#0F0F12] border border-[#FFD700]/30 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-[#FFD700]/60 transition-all shadow-[0_4px_20px_rgba(255,215,0,0.05)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-[#FFD700]" /> Total Coins
                </span>
                <span className="text-[9px] font-black text-[#FFD700] bg-[#FFD700]/10 px-2 py-0.5 rounded border border-[#FFD700]/30">
                  ALL COINS
                </span>
              </div>
              <div>
                <div className="text-white font-black text-xl sm:text-2xl tracking-tight">
                  {formatCurrency(user?.balance || 0)} <span className="text-[#FFD700] text-xs font-bold">CM</span>
                </div>
                <div className="text-emerald-400 text-[11px] font-mono mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Phase 1 Preserved
                </div>
              </div>
            </div>

            {/* 2. USDT Balance */}
            <div className="bg-[#0F0F12] border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/60 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.05)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-400" /> USDT Balance
                </span>
                <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  STABLE
                </span>
              </div>
              <div>
                <div className="text-emerald-400 font-black text-xl sm:text-2xl tracking-tight">
                  ${formatCurrency(user?.usdtBalance || 0)} <span className="text-gray-400 text-xs font-bold">USDT</span>
                </div>
                <div className="text-emerald-400 text-[11px] font-mono mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready for Phase 2
                </div>
              </div>
            </div>

            {/* 3. Total Referrals (Real Count) */}
            <div className="bg-[#0F0F12] border border-blue-500/30 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/60 transition-all shadow-[0_4px_20px_rgba(59,130,246,0.05)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-400" /> Total Referrals
                </span>
                <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                  NETWORK
                </span>
              </div>
              <div>
                <div className="text-white font-black text-xl sm:text-2xl tracking-tight">
                  {user?.referralCount || 0} <span className="text-blue-400 text-xs font-bold">Pioneers</span>
                </div>
                <div className="text-blue-400 text-[11px] font-mono mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> All Referrals Active
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* =========================================================================
            PHASE 2 MODULES: COMING SOON (MINING, WALLET, SWAP, HISTORY, ETC.)
           ========================================================================= */}
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Phase 2 Ecosystem Modules
            </h2>
            <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> Coming Soon
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {comingSoonFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.id}
                  onClick={() => toast(`Phase 2 ${item.title} will unlock automatically upon smart contract deployment!`, { icon: '⏳' })}
                  className={`bg-[#0D0D10] border ${item.borderColor} hover:border-white/40 rounded-2xl p-4 flex flex-col justify-between text-left relative overflow-hidden group transition-all cursor-pointer`}
                >
                  <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${item.color} rounded-full blur-2xl pointer-events-none opacity-40`} />
                  
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="w-9 h-9 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center">
                        <Icon className={`w-4 h-4 ${item.iconColor}`} />
                      </div>
                      <span className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-amber-300 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        {item.badge}
                      </span>
                    </div>

                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-500 block mb-0.5">
                      {item.category}
                    </span>
                    <h3 className="text-white font-bold text-sm tracking-tight mb-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">Deployment Status</span>
                    <span className="text-[#FFD700] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Module Locked</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            OFFICIAL SOCIAL CHANNELS (AT THE BOTTOM / LAST AS REQUESTED)
            WHATSAPP, X, TELEGRAM
           ========================================================================= */}
        <div className="w-full pt-2">
          <SocialChannels 
            title="Official Contact & Social Channels"
            subtitle="Join our verified channels for Phase 2 smart contract updates, airdrop dates & mining launch"
          />
        </div>

        {/* Disclaimer / Footer tagline */}
        <div className="pt-2 pb-6 text-center">
          <p className="text-gray-500 text-[11px] font-medium tracking-wide">
            CM Network Core Protocol • All Phase 1 Data Securely Preserved
          </p>
        </div>

      </main>

      {/* =========================================================================
          SLEEK FLOATING BOTTOM NAVIGATION BAR (MATCHING SCREENSHOT)
         ========================================================================= */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-black/85 backdrop-blur-2xl border border-white/15 rounded-full px-3 py-2 flex items-center justify-between shadow-[0_10px_35px_rgba(0,0,0,0.8)] z-50">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center transition-all ${activeTab === 'home' ? 'text-[#FFD700] scale-105' : 'text-gray-400 hover:text-white'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase mt-0.5 tracking-tighter">Phase 2</span>
        </button>

        <button
          onClick={() => { setActiveTab('referrals'); handleShare(); }}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center transition-all ${activeTab === 'referrals' ? 'text-[#FFD700] scale-105' : 'text-gray-400 hover:text-white'}`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase mt-0.5 tracking-tighter">Friends</span>
        </button>

        <button
          onClick={() => { setActiveTab('wallet'); toast('CM Web3 Wallet will open with Phase 2 smart contract!', { icon: '💳' }); }}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center transition-all ${activeTab === 'wallet' ? 'text-[#FFD700] scale-105' : 'text-gray-400 hover:text-white'}`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase mt-0.5 tracking-tighter">Wallet</span>
        </button>

        <button
          onClick={() => { setActiveTab('tasks'); toast('Daily Quests & Tasks are updating for Phase 2!', { icon: '⚡' }); }}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center transition-all ${activeTab === 'tasks' ? 'text-[#FFD700] scale-105' : 'text-gray-400 hover:text-white'}`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase mt-0.5 tracking-tighter">Quests</span>
        </button>

        <button
          onClick={() => { setActiveTab('profile'); setShowSettings(true); }}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center transition-all ${activeTab === 'profile' ? 'text-[#FFD700] scale-105' : 'text-gray-400 hover:text-white'}`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase mt-0.5 tracking-tighter">Profile</span>
        </button>
      </nav>

      {/* =========================================================================
          SETTINGS & PROFILE MODAL
         ========================================================================= */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121215] border border-white/10 rounded-3xl max-w-sm w-full p-6 text-left relative shadow-2xl">
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-full bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-white mb-1">Account & Settings</h3>
            <p className="text-gray-400 text-xs mb-5">CM Network Pioneer Profile</p>

            <div className="space-y-3.5 mb-6">
              <div className="bg-black/50 border border-white/5 p-3.5 rounded-xl">
                <span className="text-gray-400 text-[10px] uppercase font-bold block">User Account</span>
                <span className="text-white text-xs font-bold truncate block">{user?.email || 'pioneer@cmnetwork.io'}</span>
              </div>

              <div className="bg-black/50 border border-white/5 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Referral UID</span>
                  <span className="text-[#FFD700] font-mono text-xs font-bold">{referralCode}</span>
                </div>
                <button 
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-xs rounded-lg text-gray-300"
                >
                  {copiedCode ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="bg-black/50 border border-white/5 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Phase Status</span>
                  <span className="text-emerald-400 text-xs font-bold">Phase 1 Complete ✅</span>
                </div>
                <span className="text-[10px] font-black text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 py-0.5 rounded">
                  VIP 0
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSettings(false);
                logout();
              }}
              className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Account</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          NOTIFICATIONS MODAL
         ========================================================================= */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121215] border border-white/10 rounded-3xl max-w-sm w-full p-6 text-left relative shadow-2xl">
            <button 
              onClick={() => setShowNotifications(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-full bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-white mb-1">Official Announcements</h3>
            <p className="text-gray-400 text-xs mb-4">Latest Phase 2 notifications</p>

            <div className="space-y-3">
              <div className="bg-white/5 border border-emerald-500/30 p-3.5 rounded-xl">
                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-wider block mb-1">Phase 1 Transition Complete ✅</span>
                <p className="text-gray-300 text-xs leading-relaxed">
                  All pioneer balances, CM coins, USDT funds, and referral network records have been migrated with 100% integrity into Phase 2.
                </p>
              </div>

              <div className="bg-white/5 border border-[#FFD700]/30 p-3.5 rounded-xl">
                <span className="text-[#FFD700] text-[10px] font-black uppercase tracking-wider block mb-1">Phase 2 Smart Contract & Modules</span>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Mining engine, Web3 Wallet, Swap, and P2P exchange will launch according to the Phase 2 roadmap. Stay tuned to our official channels!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowNotifications(false)}
              className="w-full mt-5 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
}





