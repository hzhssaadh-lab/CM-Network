import { useState } from 'react';
import { useApp } from '../hooks/useAppStore';
import { formatCurrency } from '../lib/utils';
import { 
  CheckCircle2, 
  Rocket, 
  Coins, 
  Wallet, 
  Users, 
  Copy, 
  Check, 
  Flame, 
  Lock, 
  ArrowRightLeft, 
  History, 
  Zap, 
  TrendingUp, 
  Sparkles,
  Share2,
  ShieldCheck
} from 'lucide-react';
import { SocialChannels } from '../components/SocialChannels';
import toast from 'react-hot-toast';

export function Dashboard() {
  const { user } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!user) return null;

  const currentBalance = user.balance || 0;
  const usdtBalance = user.usdtBalance || 0;
  const referralCount = user.referralCount || 0;
  const referralCode = user.referralCode || user.uid?.substring(0, 8).toUpperCase() || 'CMNETWORK';
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
    toast.success('Referral link copied!', { icon: '🔗' });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500 w-full max-w-7xl mx-auto pb-10">
      
      {/* Phase 1 Completed / Phase 2 Started Hero Banner */}
      <div className="bg-gradient-to-r from-[#141414] via-[#1A1A1A] to-[#141414] border border-[#FFD700]/30 rounded-3xl p-5 sm:p-7 relative overflow-hidden shadow-[0_4px_30px_rgba(255,215,0,0.05)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" /> Phase 1 Completed ✅
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-black uppercase tracking-widest animate-pulse">
                <Rocket className="w-3.5 h-3.5" /> Phase 2 Started 🚀
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              CM Network Phase 2 Hub
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-xl">
              Phase 1 is complete! In Phase 2, your total coins, USDT balance, and referrals are actively displayed. Mining, Wallet, Swap, and History are coming soon!
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-[#FFD700] to-amber-500 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,215,0,0.2)] active:scale-95 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Invite Friends</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PHASE 2 ACTIVE STATS: ONLY ALL COIN, USDT, AND REFERRALS (AS REQUESTED)
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. All Coins (CM Coins) */}
        <div className="bg-[#111] border border-[#FFD700]/30 rounded-3xl p-6 relative overflow-hidden group hover:border-[#FFD700]/60 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-[#FFD700]" /> Total CM Coins
            </span>
            <span className="px-2.5 py-0.5 bg-[#FFD700]/10 text-[#FFD700] text-[10px] font-black rounded-md border border-[#FFD700]/20 tracking-wider">
              ALL COIN
            </span>
          </div>
          <div>
            <h3 className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              {formatCurrency(currentBalance)} <span className="text-lg text-[#FFD700] font-sans">CM</span>
            </h3>
            <p className="text-gray-500 font-mono text-sm mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              ≈ ${(currentBalance * 6.00).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>Phase 1 Balance</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Preserved
            </span>
          </div>
        </div>

        {/* 2. USDT Balance */}
        <div className="bg-[#111] border border-emerald-500/30 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/60 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" /> USDT Balance
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-md border border-emerald-500/20 tracking-wider">
              STABLE
            </span>
          </div>
          <div>
            <h3 className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
              ${formatCurrency(usdtBalance)} <span className="text-sm font-bold text-gray-400 font-sans">USDT</span>
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Tether USD Balance
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>Phase 2 Ready</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Active
            </span>
          </div>
        </div>

        {/* 3. Total Referrals */}
        <div className="bg-[#111] border border-blue-500/30 rounded-3xl p-6 relative overflow-hidden group hover:border-blue-500/60 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-400" /> Total Referrals
            </span>
            <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-md border border-blue-500/20 tracking-wider">
              REFERRAL
            </span>
          </div>
          <div>
            <h3 className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              {referralCount} <span className="text-lg text-blue-400 font-sans">Friends</span>
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-500 text-xs">Code:</span>
              <button 
                onClick={handleCopyCode}
                className="text-white text-xs font-mono font-bold bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded border border-white/10 flex items-center gap-1"
              >
                <span>{referralCode}</span>
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
              </button>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>Invite Network</span>
            <span className="text-blue-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Synced
            </span>
          </div>
        </div>

      </div>

      {/* =========================================================================
          COMING SOON SECTORS: MINING, WALLET, SWAP, HISTORY, AND OTHERS
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Mining Sector - Coming Soon */}
        <section className="lg:col-span-7 bg-white/5 rounded-[32px] border border-white/10 p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[420px] text-center">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#FFD700] opacity-10 blur-[100px] pointer-events-none"></div>
          
          <div className="relative w-48 h-48 md:w-56 md:h-56 mb-6">
            <div className="absolute inset-0 rounded-full border border-yellow-500/20"></div>
            <div className="absolute inset-3 rounded-full border-2 border-dashed border-[#FFD700]/30 animate-[spin_20s_linear_infinite]"></div>
            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#FFD700]/30 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.1)]">
              <Flame className="w-10 h-10 text-[#FFD700] mb-2" />
              <span className="text-[10px] font-black text-[#FFD700] tracking-widest uppercase">PHASE 2</span>
              <span className="text-xs font-bold text-gray-400">MINING ENGINE</span>
            </div>
          </div>

          <div className="max-w-md">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Lock className="w-3 h-3" /> Mining Coming Soon ⏳
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
              Phase 2 Mining Engine Upgrade
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-6">
              Old Phase 1 extraction has completed. Phase 2 cloud mining is being deployed with boosted multipliers, node staking, and zero battery drain.
            </p>
          </div>

          <button
            onClick={() => toast('Mining will be unlocked during Phase 2 feature release!', { icon: '⛏️' })}
            className="w-full max-w-sm bg-white/10 hover:bg-white/15 border border-white/10 text-gray-300 font-bold py-4 rounded-2xl text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Mining — Coming Soon ⏳</span>
          </button>
        </section>

        {/* Other Modules - Coming Soon */}
        <section className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-white/5 rounded-[32px] border border-white/10 p-6 flex flex-col flex-1">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" /> Phase 2 Ecosystem
              </h4>
              <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Coming Soon
              </span>
            </div>

            <div className="space-y-3 flex-1 flex flex-col justify-around">
              
              {/* Wallet Card */}
              <div 
                onClick={() => toast('Web3 Wallet is coming soon in Phase 2!', { icon: '💼' })}
                className="bg-black/40 hover:bg-black/60 border border-white/5 hover:border-blue-500/30 rounded-2xl p-4 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-sm">CM Web3 Wallet</h5>
                    <p className="text-gray-500 text-xs">Send, receive & hold assets</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Soon
                </span>
              </div>

              {/* Swap Card */}
              <div 
                onClick={() => toast('CM ⇄ USDT Swap is coming soon in Phase 2!', { icon: '🔄' })}
                className="bg-black/40 hover:bg-black/60 border border-white/5 hover:border-emerald-500/30 rounded-2xl p-4 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <ArrowRightLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-sm">CM ⇄ USDT Swap</h5>
                    <p className="text-gray-500 text-xs">Instant DEX token exchange</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Soon
                </span>
              </div>

              {/* History Card */}
              <div 
                onClick={() => toast('Transaction & Earning history is coming soon in Phase 2!', { icon: '📜' })}
                className="bg-black/40 hover:bg-black/60 border border-white/5 hover:border-purple-500/30 rounded-2xl p-4 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-sm">Ledger & History</h5>
                    <p className="text-gray-500 text-xs">On-chain transaction logs</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Soon
                </span>
              </div>

              {/* Tasks & Other Card */}
              <div 
                onClick={() => toast('Tasks, Ads & Other features are coming soon in Phase 2!', { icon: '⚡' })}
                className="bg-black/40 hover:bg-black/60 border border-white/5 hover:border-orange-500/30 rounded-2xl p-4 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-sm">Tasks & Earn</h5>
                    <p className="text-gray-500 text-xs">Sponsored quests & rewards</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Soon
                </span>
              </div>

            </div>
          </div>
        </section>

        {/* Official Smart Contract Banner */}
        <div className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#FFD700]" />
            </div>
            <div>
              <span className="text-white text-xs sm:text-sm font-bold block">Official CM Smart Contract</span>
              <span className="text-gray-400 text-[11px]">On-chain verification and audited deployment</span>
            </div>
          </div>
          <div className="bg-black/60 border border-white/5 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-pulse" />
            <span className="text-[#FFD700] font-mono text-xs font-bold uppercase tracking-wider">Phase 2 Announcement Coming Soon</span>
          </div>
        </div>

        {/* Official Community Channels: WhatsApp, X, Telegram (at the last / bottom) */}
        <SocialChannels 
          title="Official Community & Channels"
          subtitle="Join WhatsApp, X, and Telegram for Phase 2 smart contract updates, liquidity pool & token launch"
        />

      </div>

    </div>
  );
}
