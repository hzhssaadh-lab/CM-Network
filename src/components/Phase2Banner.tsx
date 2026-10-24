import React, { useState, useEffect } from 'react';
import { getPhase2Countdown, PHASE_2_TOTAL_DAYS, PHASE_2_LAUNCH_DATE_STRING } from '../lib/utils';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Coins, 
  Wallet, 
  ArrowRightLeft, 
  Layers, 
  CheckCircle2, 
  Flame,
  X
} from 'lucide-react';

export function Phase2Banner() {
  const [countdown, setCountdown] = useState(getPhase2Countdown());
  const [showRoadmap, setShowRoadmap] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getPhase2Countdown());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
              <span className="px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-black uppercase tracking-widest">
                ✦ PHASE 2 ROADMAP
              </span>
              <span className="text-xs text-gray-400">Launch Date: {PHASE_2_LAUNCH_DATE_STRING}</span>
            </div>

            <h3 className="text-2xl font-black text-white tracking-tight mb-2">
              The Evolution of CM Network
            </h3>
            <p className="text-sm text-gray-300 mb-6">
              All Phase 1 balances are 100% safe and preserved. Phase 2 unlocks full Web3 liquidity, peer-to-peer exchange, and audited smart contracts.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-[#FFD700]/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FFD700]/10 text-[#FFD700] flex items-center justify-center shrink-0 mt-0.5">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">1. Smart Multiplier Reward Engine</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Automated yield multipliers, zero-battery cloud mining nodes, and daily check-in booster rewards.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-[#FFD700]/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FFD700]/10 text-[#FFD700] flex items-center justify-center shrink-0 mt-0.5">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">2. CM Peer-to-Peer (P2P) Trading Desk</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Direct buyer-to-seller escrow mechanism allowing community members to trade CM coins against USDT and local currencies safely.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-[#FFD700]/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FFD700]/10 text-[#FFD700] flex items-center justify-center shrink-0 mt-0.5">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">3. CM Non-Custodial Web3 Wallet</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Multi-chain EVM support (BSC, Polygon, Ethereum) with instant token wrapping and decentralized staking pools.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-[#FFD700]/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FFD700]/10 text-[#FFD700] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">4. Official Audited Contract Address</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Publishing verified BEP-20 / ERC-20 contract code with CertiK and Hacken audits, liquidity locks, and public tokenomics.</p>
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
      <div className="w-full relative rounded-[36px] bg-gradient-to-br from-[#12100a] via-[#0d0c09] to-[#070706] border border-[#FFD700]/30 p-6 sm:p-10 overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(255,215,0,0.06)]">
        {/* Ambient background gold glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-10 left-0 w-80 h-80 bg-amber-600/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Column: Countdown & CTA */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-[#FFD700]/40 text-[#FFD700] text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(255,215,0,0.15)]">
              <span>✦</span>
              <span>PHASE 2</span>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                COUNTDOWN STARTED
              </h3>
              <p className="text-base sm:text-lg font-bold bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFD700] bg-clip-text text-transparent mt-0.5">
                Bigger Features. More Opportunities.
              </p>
            </div>

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-md">
              Phase 2 will bring new features to take CM Network to the next level. Get ready for the next chapter! All Phase 1 balances remain fully intact.
            </p>

            {/* Universal Fixed 25-Day Countdown Display */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-sm pt-1">
              <div className="bg-black/60 border border-[#FFD700]/30 rounded-2xl p-2.5 text-center shadow-[inset_0_1px_1px_rgba(255,215,0,0.2)]">
                <span className="block text-xl sm:text-2xl font-mono font-black text-white">{countdown.days}</span>
                <span className="text-[9px] font-bold text-[#FFD700] uppercase tracking-wider">Days</span>
              </div>
              <div className="bg-black/60 border border-[#FFD700]/30 rounded-2xl p-2.5 text-center shadow-[inset_0_1px_1px_rgba(255,215,0,0.2)]">
                <span className="block text-xl sm:text-2xl font-mono font-black text-white">{countdown.hours}</span>
                <span className="text-[9px] font-bold text-[#FFD700] uppercase tracking-wider">Hours</span>
              </div>
              <div className="bg-black/60 border border-[#FFD700]/30 rounded-2xl p-2.5 text-center shadow-[inset_0_1px_1px_rgba(255,215,0,0.2)]">
                <span className="block text-xl sm:text-2xl font-mono font-black text-white">{countdown.minutes}</span>
                <span className="text-[9px] font-bold text-[#FFD700] uppercase tracking-wider">Mins</span>
              </div>
              <div className="bg-black/60 border border-[#FFD700]/30 rounded-2xl p-2.5 text-center shadow-[inset_0_1px_1px_rgba(255,215,0,0.2)]">
                <span className="block text-xl sm:text-2xl font-mono font-black text-[#FFD700]">{countdown.seconds}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Secs</span>
              </div>
            </div>

            <div>
              <button
                onClick={() => setShowRoadmap(true)}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FFD700] to-amber-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,215,0,0.25)]"
              >
                <span>View Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: 4 Coming Soon Cards */}
          <div className="lg:col-span-7 flex flex-col space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-black text-[#FFD700] uppercase tracking-[0.2em]">
                WHAT'S COMING IN PHASE 2?
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Card 1: New Reward System */}
              <div className="bg-white/5 border border-white/10 hover:border-[#FFD700]/50 rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.07] group">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-extrabold text-white">New Reward System</h5>
                    <p className="text-[11px] text-gray-400">More Ways to Earn</p>
                  </div>
                </div>
              </div>

              {/* Card 2: CM P2P Trading */}
              <div className="bg-white/5 border border-white/10 hover:border-[#FFD700]/50 rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.07] group">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] group-hover:scale-110 transition-transform">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-extrabold text-white">CM P2P Trading</h5>
                    <p className="text-[11px] text-gray-400">Buy & Sell CM Coins</p>
                  </div>
                </div>
              </div>

              {/* Card 3: CM Web3 Wallet */}
              <div className="bg-white/5 border border-white/10 hover:border-[#FFD700]/50 rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.07] group">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] group-hover:scale-110 transition-transform">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-extrabold text-white">CM Web3 Wallet</h5>
                    <p className="text-[11px] text-gray-400">Multi-Chain Support</p>
                  </div>
                </div>
              </div>

              {/* Card 4: Official Contract Address */}
              <div className="bg-white/5 border border-white/10 hover:border-[#FFD700]/50 rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.07] group">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-extrabold text-white">Official Contract Address</h5>
                    <p className="text-[11px] text-gray-400">Transparency & Trust</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Stepper Progress Line */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                <span className="text-[#FFD700]">Phase 1 Active</span>
                <span className="text-gray-400">Auditing</span>
                <span className="text-gray-400">P2P Testing</span>
                <span className="text-[#FFD700] font-black">Phase 2 • Coming Soon</span>
              </div>
              <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500 via-[#FFD700] to-amber-500 rounded-full"
                  style={{ width: `${Math.max(15, 100 - (countdown.totalMs / (25 * 24 * 60 * 60 * 1000)) * 100)}%` }}
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
