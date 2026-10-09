import { useState } from 'react';
import { useApp } from '../hooks/useAppStore';
import { formatCurrency } from '../lib/utils';
import { 
  CheckCircle2, 
  Rocket, 
  Coins, 
  Wallet as WalletIcon, 
  Users, 
  Lock, 
  ArrowRightLeft, 
  History as HistoryIcon, 
  Send, 
  QrCode, 
  Sparkles,
  TrendingUp,
  Share2
} from 'lucide-react';
import { SocialChannels } from '../components/SocialChannels';
import toast from 'react-hot-toast';

export function Wallet() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<'wallet' | 'swap' | 'history' | 'send'>('wallet');

  if (!user) return null;

  const currentBalance = user.balance || 0;
  const usdtBalance = user.usdtBalance || 0;
  const referralCount = user.referralCount || 0;
  const referralCode = user.referralCode || user.uid?.substring(0, 8).toUpperCase() || 'CMNETWORK';

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-500 pb-12 space-y-6">
      
      {/* Phase 1 Complete / Phase 2 Started Banner */}
      <div className="bg-gradient-to-r from-[#141414] via-[#1A1A1A] to-[#141414] border border-[#FFD700]/30 rounded-3xl p-6 relative overflow-hidden shadow-[0_4px_30px_rgba(255,215,0,0.05)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" /> Phase 1 Completed ✅
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-black uppercase tracking-widest animate-pulse">
                <Rocket className="w-3.5 h-3.5" /> Phase 2 Active 🚀
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              CM Asset Custody & Portfolio
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Your Phase 1 balances and referral network are secured. Web3 wallet transfers, DEX swap, and history are coming soon in Phase 2.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PHASE 2 ACTIVE STATS: ONLY ALL COIN, USDT, AND REFERRAL (AS REQUESTED)
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* All Coins (CM Coins) */}
        <div className="bg-[#111] border border-[#FFD700]/30 rounded-3xl p-6 relative overflow-hidden group hover:border-[#FFD700]/60 transition-all">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-[#FFD700]" /> Total CM Coins
            </span>
            <span className="px-2 py-0.5 bg-[#FFD700]/10 text-[#FFD700] text-[10px] font-black rounded border border-[#FFD700]/20">
              ALL COIN
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white font-mono tracking-tight">
              {formatCurrency(currentBalance)} <span className="text-base text-[#FFD700] font-sans">CM</span>
            </h3>
            <p className="text-gray-500 font-mono text-xs mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              ≈ ${(currentBalance * 6.00).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>Status</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Preserved
            </span>
          </div>
        </div>

        {/* USDT Balance */}
        <div className="bg-[#111] border border-emerald-500/30 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/60 transition-all">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <WalletIcon className="w-4 h-4 text-emerald-400" /> USDT Balance
            </span>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded border border-emerald-500/20">
              STABLE
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
              ${formatCurrency(usdtBalance)} <span className="text-xs font-bold text-gray-400 font-sans">USDT</span>
            </h3>
            <p className="text-gray-500 text-xs mt-1">
              Tether USD Balance
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>Status</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ready
            </span>
          </div>
        </div>

        {/* Total Referrals */}
        <div className="bg-[#111] border border-blue-500/30 rounded-3xl p-6 relative overflow-hidden group hover:border-blue-500/60 transition-all">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-400" /> Total Referrals
            </span>
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded border border-blue-500/20">
              NETWORK
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white font-mono tracking-tight">
              {referralCount} <span className="text-base text-blue-400 font-sans">Friends</span>
            </h3>
            <p className="text-gray-500 text-xs mt-1">
              Code: <span className="font-mono text-gray-300 font-bold">{referralCode}</span>
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>Network</span>
            <span className="text-blue-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Active
            </span>
          </div>
        </div>

      </div>

      {/* Tabs navigation */}
      <div className="flex bg-white/5 p-1 rounded-2xl overflow-x-auto custom-scrollbar">
        <button 
          onClick={() => setActiveTab('wallet')} 
          className={`flex-1 py-3 px-4 min-w-max text-xs font-bold tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'wallet' ? 'bg-[#FFD700] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          <WalletIcon className="w-4 h-4" />
          <span>Web3 Wallet</span>
          <span className="text-[9px] bg-black/20 px-1.5 py-0.2 rounded font-black">Soon</span>
        </button>
        <button 
          onClick={() => setActiveTab('swap')} 
          className={`flex-1 py-3 px-4 min-w-max text-xs font-bold tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'swap' ? 'bg-[#FFD700] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>CM Swap</span>
          <span className="text-[9px] bg-black/20 px-1.5 py-0.2 rounded font-black">Soon</span>
        </button>
        <button 
          onClick={() => setActiveTab('send')} 
          className={`flex-1 py-3 px-4 min-w-max text-xs font-bold tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'send' ? 'bg-[#FFD700] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          <Send className="w-4 h-4" />
          <span>Send / Receive</span>
          <span className="text-[9px] bg-black/20 px-1.5 py-0.2 rounded font-black">Soon</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`flex-1 py-3 px-4 min-w-max text-xs font-bold tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-[#FFD700] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          <HistoryIcon className="w-4 h-4" />
          <span>History</span>
          <span className="text-[9px] bg-black/20 px-1.5 py-0.2 rounded font-black">Soon</span>
        </button>
      </div>

      {/* =========================================================================
          COMING SOON DISPLAY IN WALLET (AS REQUESTED: WALLET, SWAP, HISTORY COMING SOON)
         ========================================================================= */}
      <div className="bg-[#111] rounded-[32px] border border-white/10 p-8 sm:p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-80 h-80 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/5 border border-[#FFD700]/30 mx-auto mb-6 flex items-center justify-center text-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.1)]">
          {activeTab === 'swap' ? (
            <ArrowRightLeft className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
          ) : activeTab === 'history' ? (
            <HistoryIcon className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />
          ) : (
            <WalletIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#FFD700]" />
          )}
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Lock className="w-3.5 h-3.5" /> Coming Soon in Phase 2 ⏳
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          {activeTab === 'swap' 
            ? 'CM ⇄ USDT Swap Engine' 
            : activeTab === 'history' 
            ? 'Transaction & Earning Ledger' 
            : activeTab === 'send'
            ? 'On-Chain Transfers & Withdrawals'
            : 'Non-Custodial Web3 Wallet'}
        </h3>

        <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed mb-8">
          {activeTab === 'swap'
            ? 'Instant decentralized swap from CM Coins to USDT is scheduled for Phase 2. All your Phase 1 coins are safely recorded.'
            : activeTab === 'history'
            ? 'Full verifiable on-chain audit records, mining yield history, and referral activity are being indexed for Phase 2.'
            : 'Transfer, send, receive, and withdrawal functions will unlock during the official Phase 2 rollout.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
          <div className="bg-black/50 border border-white/5 rounded-2xl p-4">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">CM Coins Status</span>
            <span className="text-white font-mono font-bold text-sm">{formatCurrency(currentBalance)} CM Secured</span>
          </div>
          <div className="bg-black/50 border border-white/5 rounded-2xl p-4">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">USDT Status</span>
            <span className="text-emerald-400 font-mono font-bold text-sm">${formatCurrency(usdtBalance)} Ready</span>
          </div>
          <div className="bg-black/50 border border-white/5 rounded-2xl p-4">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Referral Status</span>
            <span className="text-blue-400 font-mono font-bold text-sm">{referralCount} Connected</span>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={() => toast('Feature will unlock with Phase 2 release!', { icon: '⏳' })}
            className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-xs font-bold text-gray-300 transition-all"
          >
            Notify Me on Launch
          </button>
        </div>
      </div>

      {/* Official Community Channels: WhatsApp, X, Telegram */}
      <SocialChannels 
        title="Official Community & Channels"
        subtitle="Follow WhatsApp, X, and Telegram for Phase 2 wallet activation & swap pool alerts"
      />

    </div>
  );
}
