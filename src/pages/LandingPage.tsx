import React, { useState } from 'react';
import { useApp } from '../hooks/useAppStore';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Cinematic3DCoin } from '../components/Cinematic3DCoin';
import { MobileDashboardMockup } from '../components/MobileDashboardMockup';
import { Phase2Banner } from '../components/Phase2Banner';
import { AuthModal } from '../components/AuthModal';
import { formatCurrency } from '../lib/utils';
import { 
  ShieldCheck, 
  Clock, 
  Globe, 
  Users, 
  Pickaxe, 
  PlayCircle, 
  Share2, 
  Wallet, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  ChevronRight,
  Network,
  Cpu,
  Coins,
  Lock,
  Layers
} from 'lucide-react';
import cmLogo from '../assets/images/cm_official_logo.jpg';
import toast from 'react-hot-toast';

export function LandingPage() {
  const { user } = useApp();
  const navigate = useNavigate();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState<'landing' | 'stats'>('landing');

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleProtectedAction = (path: string) => {
    if (!user) {
      handleOpenAuth('login');
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col selection:bg-[#FFD700] selection:text-black font-sans relative overflow-x-hidden">
      
      {/* Background Starfield & Subtle Gold Mesh Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#FFD700]/10 via-[#FFA500]/5 to-transparent blur-[140px]" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-[#FFD700]/5 rounded-full blur-[130px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[130px]" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 1px 1px, #FFD700 1px, transparent 0)`,
            backgroundSize: '36px 36px' 
          }} 
        />
      </div>

      {/* Auth Modal Overlay */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Top Navbar matching Reference Design */}
      <Navbar onOpenAuth={handleOpenAuth} />

      {/* User Quick Switcher Bar (if logged in) */}
      {user && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 mb-4 relative z-20">
          <div className="bg-gradient-to-r from-[#18150f] via-[#12110d] to-[#18150f] border border-[#FFD700]/30 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-[0_0_20px_rgba(255,215,0,0.08)]">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs text-gray-300">
                Logged in as <strong className="text-white">{user.name || user.email}</strong> • Balance: <span className="font-mono text-[#FFD700] font-black">{formatCurrency(user.balance || 0)} CM</span> (${((user.balance || 0) * 6).toFixed(2)})
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('landing')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'landing' ? 'bg-[#FFD700] text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                Website View
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'stats' ? 'bg-[#FFD700] text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                Detailed Stats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 relative z-10 flex flex-col space-y-20 sm:space-y-28 pb-20">
        
        {/* VIEW 1: DETAILED STATS (Preserving full user balances & referral data) */}
        {user && activeTab === 'stats' ? (
          <div className="pt-4 space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* CM Coins */}
              <div className="bg-[#111] border border-[#FFD700]/40 rounded-3xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-[#FFD700]" /> Total CM Coins
                  </span>
                  <span className="px-2 py-0.5 bg-[#FFD700]/10 text-[#FFD700] text-[10px] font-black rounded-md border border-[#FFD700]/20">
                    ALL COIN
                  </span>
                </div>
                <h3 className="text-3xl font-mono font-black text-white">
                  {formatCurrency(user.balance || 0)} <span className="text-base text-[#FFD700] font-sans">CM</span>
                </h3>
                <p className="text-emerald-400 font-mono text-sm mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  ≈ ${((user.balance || 0) * 6.00).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                </p>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                  <span>Phase 1 Balance</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Preserved
                  </span>
                </div>
              </div>

              {/* USDT Balance */}
              <div className="bg-[#111] border border-emerald-500/40 rounded-3xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-400" /> USDT Balance
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-md border border-emerald-500/20">
                    STABLE
                  </span>
                </div>
                <h3 className="text-3xl font-mono font-black text-emerald-400">
                  ${formatCurrency(user.usdtBalance || 0)} <span className="text-sm font-bold text-gray-400 font-sans">USDT</span>
                </h3>
                <p className="text-gray-400 text-xs mt-1">Tether USD Liquidity</p>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                  <span>Phase 2 Ready</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                </div>
              </div>

              {/* Referrals */}
              <div className="bg-[#111] border border-blue-500/40 rounded-3xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-400" /> Total Referrals
                  </span>
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-md border border-blue-500/20">
                    REFERRAL
                  </span>
                </div>
                <h3 className="text-3xl font-mono font-black text-white">
                  {user.referralCount || 0} <span className="text-sm text-blue-400 font-sans">Friends</span>
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  Code: <code className="text-white font-mono font-bold bg-white/5 px-2 py-0.5 rounded">{user.referralCode || 'CMNETWORK'}</code>
                </p>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                  <span>Invite Network</span>
                  <span className="text-blue-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Synced
                  </span>
                </div>
              </div>

            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => navigate('/tasks')}
                className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FFD700]/50 text-white font-bold text-xs flex items-center gap-2 hover:bg-white/10 transition-colors"
              >
                <Zap className="w-4 h-4 text-[#FFD700]" />
                <span>Tasks</span>
              </button>
              <button
                onClick={() => navigate('/wallet')}
                className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 text-white font-bold text-xs flex items-center gap-2 hover:bg-white/10 transition-colors"
              >
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Wallet Withdrawals</span>
              </button>
              <button
                onClick={() => navigate('/friends')}
                className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 text-white font-bold text-xs flex items-center gap-2 hover:bg-white/10 transition-colors"
              >
                <Users className="w-4 h-4 text-blue-400" />
                <span>Invite Friends</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* SECTION 1: HERO SECTION MATCHING REFERENCE DESIGN */}
        <section className="relative pt-6 sm:pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left z-20">
              
              {/* Pill Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-[#FFD700]/50 shadow-[0_0_15px_rgba(255,215,0,0.15)]">
                <span className="text-[#FFD700] text-xs">⚡</span>
                <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-white">
                  NEXT GEN CRYPTO COMMUNITY
                </span>
              </div>

              {/* Massive Hero Headline */}
              <div className="space-y-1">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
                  Mine Today.
                </h1>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFB700] bg-clip-text text-transparent drop-shadow-[0_4px_25px_rgba(255,215,0,0.3)]">
                  Build Tomorrow.
                </h2>
              </div>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl font-medium">
                CM Network is more than just a coin — it's a movement. Join a global community, mine CM coins, complete tasks, and unlock endless opportunities in Web3.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                {user ? (
                  <>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(255,215,0,0.35)]"
                    >
                      <span>Start Mining (0.5 CM)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate('/wallet')}
                      className="px-7 py-3.5 rounded-full bg-black/60 border border-[#FFD700]/50 hover:border-[#FFD700] text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 hover:bg-white/5 active:scale-95 transition-all shadow-sm"
                    >
                      <span>Open Wallet</span>
                      <ArrowRight className="w-4 h-4 text-[#FFD700]" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleOpenAuth('signup')}
                      className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(255,215,0,0.35)]"
                    >
                      <span>Start Mining Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenAuth('login')}
                      className="px-7 py-3.5 rounded-full bg-black/60 border border-[#FFD700]/50 hover:border-[#FFD700] text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 hover:bg-white/5 active:scale-95 transition-all shadow-sm"
                    >
                      <span>Open Wallet (Sign In)</span>
                      <ArrowRight className="w-4 h-4 text-[#FFD700]" />
                    </button>
                  </>
                )}
              </div>

              {/* 4 Trust Badges under Buttons matching Reference Design */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 max-w-xl">
                
                {/* 1. Secure */}
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Secure</h4>
                    <p className="text-[10px] text-gray-400">Your Data is Safe</p>
                  </div>
                </div>

                {/* 2. Fast */}
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Fast</h4>
                    <p className="text-[10px] text-gray-400">Smooth & Reliable</p>
                  </div>
                </div>

                {/* 3. Global */}
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Global</h4>
                    <p className="text-[10px] text-gray-400">Join Worldwide</p>
                  </div>
                </div>

                {/* 4. Community */}
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Community</h4>
                    <p className="text-[10px] text-gray-400">Grow Together</p>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Hero Cinematic 3D Coin & Orbital Rings */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <Cinematic3DCoin />
            </div>

          </div>
        </section>

        {/* SECTION 2: MAIN FEATURES MATCHING REFERENCE DESIGN */}
        <section className="relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.25em] text-[#FFD700] mb-2">
                <span>—</span>
                <span>MAIN FEATURES</span>
                <span>—</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Everything You Need in One Place
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 max-w-xl mt-1.5">
                CM Network gives you the tools to mine, earn, and grow — all in a simple and secure platform.
              </p>
            </div>

            <button
              onClick={() => {
                const el = document.getElementById('why-cm');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#FFD700]/50 text-xs font-bold text-gray-300 hover:text-white transition-all self-start md:self-auto"
            >
              <span>Explore All Features</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FFD700]" />
            </button>
          </div>

          {/* 3 Gold-Bordered Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Mining */}
            <div 
              onClick={() => {
                const el = document.getElementById('mining');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-gradient-to-b from-[#14120c] via-[#0f0e0a] to-[#0a0a07] border border-[#FFD700]/30 hover:border-[#FFD700] rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(255,215,0,0.15)] group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700] mb-5 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,215,0,0.15)]">
                <Pickaxe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white mb-1.5">Mining</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-6 min-h-[36px]">
                Mine CM coins every 12 hours and grow your balance with zero battery drain.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#FFD700] group-hover:gap-2.5 transition-all">
                <span>Start Mining</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 2: Referral Rewards */}
            <div 
              onClick={() => handleProtectedAction('/friends')}
              className="bg-gradient-to-b from-[#14120c] via-[#0f0e0a] to-[#0a0a07] border border-[#FFD700]/30 hover:border-[#FFD700] rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(255,215,0,0.15)] group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700] mb-5 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,215,0,0.15)]">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white mb-1.5">Referral Rewards</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-6 min-h-[36px]">
                Invite friends and earn more together. Multi-tier commissions and team bonuses.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#FFD700] group-hover:gap-2.5 transition-all">
                <span>Invite Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 3: CM Wallet */}
            <div 
              onClick={() => handleProtectedAction('/wallet')}
              className="bg-gradient-to-b from-[#14120c] via-[#0f0e0a] to-[#0a0a07] border border-[#FFD700]/30 hover:border-[#FFD700] rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(255,215,0,0.15)] group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700] mb-5 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,215,0,0.15)]">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white mb-1.5">CM Wallet</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-6 min-h-[36px]">
                Manage your balance, transactions, and digital assets with instant audit records.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#FFD700] group-hover:gap-2.5 transition-all">
                <span>Open Wallet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 3: "WHY CM NETWORK? MORE THAN MINING. IT'S A MOVEMENT." & PHONE SHOWCASE */}
        <section id="why-cm" className="relative pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left 3 Pillars */}
            <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
              
              {/* Pillar 1 */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#FFD700]/40 transition-all flex items-center space-x-4 group">
                <div className="w-14 h-14 rounded-full border-2 border-[#FFD700]/60 bg-gradient-to-br from-[#FFD700]/20 via-[#18150d] to-black flex items-center justify-center text-[#FFD700] shrink-0 shadow-[0_0_20px_rgba(255,215,0,0.2)] group-hover:scale-105 transition-transform">
                  <Pickaxe className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">User Friendly</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Simple • Clean • Modern</p>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#FFD700]/40 transition-all flex items-center space-x-4 group">
                <div className="w-14 h-14 rounded-full border-2 border-[#FFD700]/60 bg-gradient-to-br from-[#FFD700]/20 via-[#18150d] to-black flex items-center justify-center text-[#FFD700] shrink-0 shadow-[0_0_20px_rgba(255,215,0,0.2)] group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Secure & Reliable</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Your Data, Our Priority</p>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#FFD700]/40 transition-all flex items-center space-x-4 group">
                <div className="w-14 h-14 rounded-full border-2 border-[#FFD700]/60 bg-gradient-to-br from-[#FFD700]/20 via-[#18150d] to-black flex items-center justify-center text-[#FFD700] shrink-0 shadow-[0_0_20px_rgba(255,215,0,0.2)] group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Global Community</h4>
                  <p className="text-xs text-gray-400 mt-0.5">United by CM Network</p>
                </div>
              </div>

            </div>

            {/* Center Live Price Chart & Real User Mining Showcase */}
            <div id="mining" className="lg:col-span-6 flex justify-center order-1 lg:order-2">
              <MobileDashboardMockup onOpenAuth={handleOpenAuth} />
            </div>

            {/* Right "Why CM Network?" Content & 4 Grid Badges */}
            <div className="lg:col-span-3 space-y-6 order-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-[#FFD700] mb-2">
                  WHY CM NETWORK?
                </p>
                <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                  More Than Mining.
                </h3>
                <h3 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFD700] bg-clip-text text-transparent leading-tight">
                  It's a Movement.
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
                CM Network builds a global community where people come together to earn, grow, and create a better future with Web3 technology.
              </p>

              {/* 4 Feature Badges Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FFD700]/40 transition-colors">
                  <Network className="w-5 h-5 text-[#FFD700] mb-2" />
                  <h5 className="text-xs font-bold text-white leading-snug">Decentralized Network</h5>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FFD700]/40 transition-colors">
                  <Users className="w-5 h-5 text-[#FFD700] mb-2" />
                  <h5 className="text-xs font-bold text-white leading-snug">Community Driven</h5>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FFD700]/40 transition-colors">
                  <Coins className="w-5 h-5 text-[#FFD700] mb-2" />
                  <h5 className="text-xs font-bold text-white leading-snug">Real Rewards & Utility</h5>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FFD700]/40 transition-colors">
                  <Layers className="w-5 h-5 text-[#FFD700] mb-2" />
                  <h5 className="text-xs font-bold text-white leading-snug">Web3 Ecosystem</h5>
                </div>

              </div>

              {/* Gold Handwritten Script Accent */}
              <div className="pt-2 text-right">
                <p className="font-serif italic text-lg sm:text-xl text-[#FFD700] tracking-wide drop-shadow-[0_2px_10px_rgba(255,215,0,0.3)]">
                  Together We Build a Stronger Future
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* SECTION 4: PHASE 2 BANNER & ROADMAP COUNTDOWN */}
        <section className="relative">
          <Phase2Banner onOpenAuth={handleOpenAuth} />
        </section>

      </main>

      {/* PROFESSIONAL FOOTER MATCHING REFERENCE DESIGN */}
      <footer className="w-full bg-[#080807] border-t border-white/10 pt-12 pb-16 px-4 sm:px-8 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          
          {/* Logo & Slogan */}
          <div className="flex items-center space-x-3">
            <img 
              src={cmLogo} 
              alt="CM Network" 
              className="w-10 h-10 rounded-xl bg-black object-contain border border-[#FFD700]/50 shadow-[0_0_15px_rgba(255,215,0,0.25)]" 
            />
            <div>
              <span className="text-base font-black tracking-tight text-white">CM NETWORK</span>
              <p className="text-[9px] text-[#FFD700] tracking-[0.2em] font-extrabold uppercase">
                CONNECT • MINE • GROW
              </p>
            </div>
          </div>

          {/* Footer Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-xs font-bold text-gray-400">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">Home</button>
            <button onClick={() => {
              const el = document.getElementById('mining');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} className="hover:text-white transition-colors">Mining</button>
            <button onClick={() => handleProtectedAction('/tasks')} className="hover:text-white transition-colors">Tasks</button>
            <button onClick={() => handleProtectedAction('/wallet')} className="hover:text-white transition-colors">Wallet</button>
            <button onClick={() => handleProtectedAction('/profile')} className="hover:text-white transition-colors">Profile</button>
          </nav>

          {/* Official Social Links: WhatsApp, X, and Telegram */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs font-bold text-gray-400 mr-1 hidden sm:inline">Official Community:</span>
            
            {/* WhatsApp */}
            <a 
              href="https://whatsapp.com/channel/0029Vb92OHY6BIEm6VDrL82g" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="WhatsApp Channel"
              title="Official WhatsApp Channel"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/70 text-gray-300 hover:text-emerald-400 transition-all hover:scale-105 shadow-sm group"
            >
              <svg className="w-4 h-4 fill-current text-emerald-400" viewBox="0 0 24 24">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.5C9.36 7.5 9.09 7.57 8.87 7.8C8.65 8.04 8.04 8.61 8.04 9.77C8.04 10.93 8.88 12.05 9 12.21C9.12 12.37 10.63 14.82 13.01 15.75C14.98 16.53 15.38 16.37 15.82 16.33C16.26 16.29 17.24 15.75 17.44 15.18C17.65 14.61 17.65 14.13 17.59 14.02C17.52 13.92 17.35 13.86 17.1 13.73C16.85 13.61 15.61 13 15.38 12.91C15.15 12.83 14.98 12.79 14.81 13.04C14.64 13.29 14.16 13.86 14.01 14.02C13.87 14.19 13.72 14.21 13.47 14.08C13.22 13.96 12.43 13.7 11.49 12.86C10.75 12.2 10.26 11.39 10.12 11.14C9.97 10.89 10.1 10.76 10.23 10.63C10.34 10.52 10.48 10.34 10.61 10.19C10.74 10.04 10.79 9.94 10.87 9.77C10.95 9.61 10.91 9.46 10.85 9.34C10.79 9.22 10.29 8 10.08 7.5"/>
              </svg>
              <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">WhatsApp</span>
            </a>

            {/* X (Twitter) */}
            <a 
              href="https://x.com/cmnetwork112" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              title="Official X Channel"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/15 hover:border-white/50 text-gray-300 hover:text-white transition-all hover:scale-105 shadow-sm group"
            >
              <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-xs font-bold text-white group-hover:text-[#FFD700] transition-colors">X</span>
            </a>

            {/* Telegram */}
            <a 
              href="https://t.me/OfficialCMNetwork" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Telegram"
              title="Official Telegram Channel"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/30 hover:border-[#0088cc]/70 text-gray-300 hover:text-[#0088cc] transition-all hover:scale-105 shadow-sm group"
            >
              <svg className="w-4 h-4 fill-current text-[#0088cc]" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
              <span className="text-xs font-bold text-white group-hover:text-[#0088cc] transition-colors">Telegram</span>
            </a>
          </div>

        </div>

        {/* Copyright and Legal */}
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-3 text-center sm:text-left">
          <p>© 2025 CM Network. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="hover:text-gray-300 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-gray-300 cursor-pointer">Terms & Conditions</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
