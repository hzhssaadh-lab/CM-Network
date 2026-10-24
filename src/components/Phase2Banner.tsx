import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useAppStore';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Coins, 
  Wallet, 
  ArrowRightLeft, 
  Pickaxe, 
  CheckCircle2, 
  Flame,
  X,
  Rocket
} from 'lucide-react';

interface Phase2BannerProps {
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

export function Phase2Banner({ onOpenAuth }: Phase2BannerProps) {
  const { user } = useApp();
  const navigate = useNavigate();
  const [showRoadmap, setShowRoadmap] = useState(false);

  const handleLaunchPhase2 = () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth('signup');
      else navigate('/login');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <>
      {/* Roadmap Modal */}
      {showRoadmap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#12110e] border border-[#FFD700]/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full relative shadow-[0_0_50px_rgba(255,215,0,0.15)] max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowRoadmap(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5" /> PHASE 2 ROADMAP • LIVE
              </span>
            </div>

            <h3 className="text-2xl font-black text-white tracking-tight mb-2">
              Phase 2 Ecosystem Architecture
            </h3>
            <p className="text-sm text-gray-300 mb-6">
              Phase 2 is now activated! All balances are preserved and users can now mine 0.5 CM coins per 12 hours, transfer on-chain funds, and grow referral nodes.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-[#FFD700]/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FFD700]/10 text-[#FFD700] flex items-center justify-center shrink-0 mt-0.5">
                  <Pickaxe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">1. 12-Hour Cloud Mining Node (Live)</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Mine 0.50 CM Coins every 12-hour cycle with automated node synchronization and zero battery drain.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-[#FFD700]/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FFD700]/10 text-[#FFD700] flex items-center justify-center shrink-0 mt-0.5">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">2. Web3 Wallet & On-Chain Transfers (Live)</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Send and receive CM Coins and USDT with QR codes and verifiable on-chain transaction history.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-[#FFD700]/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FFD700]/10 text-[#FFD700] flex items-center justify-center shrink-0 mt-0.5">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">3. CM Peer-to-Peer (P2P) Desk</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Direct buyer-to-seller escrow mechanism allowing community members to trade CM coins against USDT safely.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-[#FFD700]/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FFD700]/10 text-[#FFD700] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">4. Audited Contract Address</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Verified BEP-20 / CM Smart Chain smart contract with transparent liquidity and public tokenomics.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowRoadmap(false)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-500 text-black font-black text-xs hover:brightness-110"
              >
                Close Roadmap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Phase 2 Section Banner */}
      <div className="w-full relative rounded-[36px] bg-gradient-to-br from-[#14120a] via-[#0d0c09] to-[#070706] border-2 border-[#FFD700]/40 p-6 sm:p-10 overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(255,215,0,0.12)]">
        {/* Ambient background gold glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FFD700]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-10 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Column: Announcement & CTAs */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(52,211,153,0.2)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>PHASE 2 IS NOW LIVE 🚀</span>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                PHASE 2 ACTIVATED
              </h3>
              <p className="text-base sm:text-lg font-bold bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFD700] bg-clip-text text-transparent mt-0.5">
                12h Mining Engine • Web3 Wallet • P2P
              </p>
            </div>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md font-medium">
              Phase 2 is fully operational! Earn 0.50 CM Coins every 12 hours, transfer assets seamlessly via Web3 Wallet, and scale your community referral earnings.
            </p>

            {/* 3 Metric Pills */}
            <div className="grid grid-cols-3 gap-2.5 max-w-sm pt-1">
              <div className="bg-black/60 border border-[#FFD700]/30 rounded-2xl p-2.5 text-center">
                <span className="block text-base sm:text-lg font-mono font-black text-[#FFD700]">0.5 CM</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase">12h Yield</span>
              </div>
              <div className="bg-black/60 border border-[#FFD700]/30 rounded-2xl p-2.5 text-center">
                <span className="block text-base sm:text-lg font-mono font-black text-emerald-400">Live</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase">Web3 Wallet</span>
              </div>
              <div className="bg-black/60 border border-[#FFD700]/30 rounded-2xl p-2.5 text-center">
                <span className="block text-base sm:text-lg font-mono font-black text-blue-400">100%</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase">Data Safe</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleLaunchPhase2}
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(255,215,0,0.35)]"
              >
                <span>{user ? 'Enter Phase 2 Hub' : 'Start Mining (0.5 CM)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowRoadmap(true)}
                className="px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Roadmap
              </button>
            </div>
          </div>

          {/* Right Column: 4 Feature Cards */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-black text-[#FFD700] uppercase tracking-[0.2em] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FFD700]" />
                <span>PHASE 2 LIVE PROTOCOLS</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Card 1: 12h Mining Engine */}
              <div 
                onClick={handleLaunchPhase2}
                className="bg-white/5 border border-white/10 hover:border-[#FFD700] rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.08] cursor-pointer group"
              >
                <div className="flex items-center space-x-3 mb-1.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700] group-hover:scale-110 transition-transform shadow-sm">
                    <Pickaxe className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-extrabold text-white">12-Hour Mining Engine</h5>
                    <p className="text-[11px] text-emerald-400 font-bold">0.50 CM / 12 Hours • Active ✓</p>
                  </div>
                </div>
              </div>

              {/* Card 2: CM P2P Trading */}
              <div 
                onClick={() => navigate('/wallet')}
                className="bg-white/5 border border-white/10 hover:border-emerald-500 rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.08] cursor-pointer group"
              >
                <div className="flex items-center space-x-3 mb-1.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-sm">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-extrabold text-white">Web3 Send & Receive</h5>
                    <p className="text-[11px] text-emerald-400 font-bold">Instant Transfers • Active ✓</p>
                  </div>
                </div>
              </div>

              {/* Card 3: CM Web3 Wallet */}
              <div 
                onClick={() => navigate('/wallet')}
                className="bg-white/5 border border-white/10 hover:border-[#FFD700] rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.08] cursor-pointer group"
              >
                <div className="flex items-center space-x-3 mb-1.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700] group-hover:scale-110 transition-transform shadow-sm">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-extrabold text-white">CM Web3 Wallet</h5>
                    <p className="text-[11px] text-emerald-400 font-bold">Audit History • Active ✓</p>
                  </div>
                </div>
              </div>

              {/* Card 4: Official Contract Address */}
              <div className="bg-white/5 border border-white/10 hover:border-blue-500 rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.08] group">
                <div className="flex items-center space-x-3 mb-1.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-extrabold text-white">Verified CM Contract</h5>
                    <p className="text-[11px] text-blue-400 font-bold">BEP-20 / Smart Chain • Synced ✓</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Live Progress Bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                <span className="text-emerald-400 font-black flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Phase 1 Completed
                </span>
                <span className="text-emerald-400 font-black flex items-center gap-1">
                  <Rocket className="w-3 h-3" /> Phase 2 Live (12h = 0.5 CM)
                </span>
              </div>
              <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/10">
                <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500 via-[#FFD700] to-amber-500 rounded-full w-full" />
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
