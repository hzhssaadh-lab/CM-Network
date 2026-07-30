import React, { useState, useEffect } from 'react';
import { Send, MessageCircle, Twitter, Trophy, RefreshCcw, Rocket, Wallet, Users, Copy, CheckCircle2, ShieldCheck, ArrowRight, Activity, Award, Star, Zap } from 'lucide-react';
import { useApp } from '../hooks/useAppStore';
import { formatCurrency } from '../lib/utils';

interface MaintenanceProps {
  onMaintenanceEnd?: () => void;
}

export function Maintenance({ onMaintenanceEnd }: MaintenanceProps) {
  const { user } = useApp();
  const [copied, setCopied] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipped(prev => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText("0xCM...Network...Address");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center p-4 sm:p-6 text-center z-[9999] fixed inset-0 overflow-y-auto overflow-x-hidden selection:bg-[#FFD700]/30 font-sans">
      
      {/* Animated Particles & Glow Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#FFD700]/5 rounded-full blur-[120px] opacity-60 mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#00FF66]/5 rounded-full blur-[100px] opacity-40 mix-blend-screen" />
        <div className="absolute top-[30%] right-[-10%] w-[400px] h-[400px] bg-[#FFD700]/5 rounded-full blur-[100px] opacity-30 mix-blend-screen" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMCA0MEwwIDBINDBMMCA0MFoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiIvPgo8L3N2Zz4=')] opacity-20" />
      </div>

      <div className="max-w-2xl w-full py-6 sm:py-10 px-2 sm:px-4 flex flex-col items-center relative z-10 space-y-6 sm:space-y-8">
        
        {/* Top Hero Section */}
        <div className="flex flex-col items-center w-full">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mb-6 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700] to-[#FF8C00] rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-700 animate-pulse" />
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#050505] border border-[#FFD700]/40 flex items-center justify-center relative shadow-[0_0_40px_rgba(255,215,0,0.2)]">
              <div className="absolute inset-1 rounded-full border border-[#FFD700]/20 border-dashed animate-[spin_10s_linear_infinite]" />
              <Rocket className="w-12 h-12 sm:w-16 sm:h-16 text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FFD700] to-white tracking-tight mb-3 text-center leading-tight">
            PHASE 1 COMPLETED <span className="inline-block animate-bounce">🚀</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base font-medium tracking-wide max-w-md">
            Your CM Network journey has reached a new milestone
          </p>
        </div>

        {/* Flip Card Section */}
        <div 
          className="w-full relative cursor-pointer" 
          style={{ perspective: '1000px' }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div 
            className="w-full transition-all duration-700 ease-in-out grid"
            style={{ 
              transformStyle: 'preserve-3d', 
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front - Phase 1 */}
            <div 
              className="col-start-1 row-start-1 w-full"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="w-full h-full bg-[#0A0A0A]/60 border border-[#FFD700]/20 rounded-3xl p-5 sm:p-7 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent opacity-50" />
                
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 flex items-center justify-center border border-[#FFD700]/20">
                        <Activity className="w-5 h-5 text-[#FFD700]" />
                      </div>
                      <h3 className="text-white font-bold text-lg sm:text-xl tracking-tight">Your Progress</h3>
                    </div>
                    <span className="text-[#FFD700] text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 bg-[#FFD700]/10 px-2 py-1 rounded-lg border border-[#FFD700]/20"><RefreshCcw className="w-3 h-3 animate-spin" /> Auto</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-4 flex flex-col justify-center transition-all hover:border-[#FFD700]/30 hover:bg-[#151515]">
                      <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">CM Balance</span>
                      <div className="text-white font-black text-xl sm:text-2xl flex items-baseline gap-1">
                        {formatCurrency(user?.balance || 0)} <span className="text-[#FFD700] text-sm font-bold">CM</span>
                      </div>
                    </div>
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-4 flex flex-col justify-center transition-all hover:border-[#00FF66]/30 hover:bg-[#151515]">
                      <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">USDT Balance</span>
                      <div className="text-[#00FF66] font-black text-xl sm:text-2xl flex items-baseline gap-1">
                        ${formatCurrency(user?.usdtBalance || 0)} <span className="text-xs">USDT</span>
                      </div>
                    </div>
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-4 flex flex-col justify-center transition-all hover:border-white/20">
                      <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Active Mining</span>
                      <div className="text-white font-black text-lg sm:text-xl">
                        {user?.dailyStreak || 0} <span className="text-gray-400 text-sm font-medium">Days</span>
                      </div>
                    </div>
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-4 flex flex-col justify-center transition-all hover:border-white/20">
                      <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Referrals</span>
                      <div className="text-white font-black text-lg sm:text-xl flex items-baseline gap-1">
                        {user?.referralCount || 0} <span className="text-gray-400 text-sm font-medium">Friends</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Back - Phase 2 */}
            <div 
              className="col-start-1 row-start-1 w-full"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div className="w-full h-full bg-[#0A0A0A]/60 border border-white/10 rounded-3xl p-5 sm:p-7 backdrop-blur-xl shadow-2xl relative flex flex-col justify-between">
                <div className="absolute top-0 right-10 w-32 h-32 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />
                
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-bold text-lg sm:text-xl tracking-tight flex items-center gap-2">
                      <Star className="w-5 h-5 text-[#FFD700] fill-[#FFD700]/20" />
                      What's Coming in Phase 2
                    </h3>
                    <span className="text-[#FFD700] text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 bg-[#FFD700]/10 px-2 py-1 rounded-lg border border-[#FFD700]/20"><RefreshCcw className="w-3 h-3 animate-spin" /> Auto</span>
                  </div>

                  <div className="space-y-4 relative">
                    <div className="absolute left-[19px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-[#FFD700] via-[#00FF66] to-blue-500 opacity-20 rounded-full" />
                    
                    <div className="flex gap-4 relative z-10">
                      <div className="w-10 h-10 rounded-full bg-[#111] border border-[#FFD700]/30 flex-shrink-0 flex items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.1)]">
                        <span className="text-lg">🔥</span>
                      </div>
                      <div className="bg-[#111]/80 border border-white/5 rounded-2xl p-4 flex-1 hover:border-[#FFD700]/20 transition-colors text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-[#FFD700]/20 to-transparent px-3 py-1 rounded-bl-xl text-[#FFD700] text-[9px] uppercase font-bold tracking-widest">Coming Soon</div>
                        <h4 className="text-white font-bold text-sm sm:text-base mb-2 mt-1">New Reward System</h4>
                        <ul className="space-y-1.5 opacity-60">
                          <li className="text-gray-400 text-xs sm:text-sm flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#FFD700]" /> Daily reward upgrades</li>
                          <li className="text-gray-400 text-xs sm:text-sm flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#FFD700]" /> More earning opportunities</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex gap-4 relative z-10">
                      <div className="w-10 h-10 rounded-full bg-[#111] border border-[#00FF66]/30 flex-shrink-0 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,102,0.1)]">
                        <RefreshCcw className="w-4 h-4 text-[#00FF66]" />
                      </div>
                      <div className="bg-[#111]/80 border border-white/5 rounded-2xl p-4 flex-1 hover:border-[#00FF66]/20 transition-colors text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-[#00FF66]/20 to-transparent px-3 py-1 rounded-bl-xl text-[#00FF66] text-[9px] uppercase font-bold tracking-widest">Coming Soon</div>
                        <h4 className="text-white font-bold text-sm sm:text-base mb-2 mt-1">CM P2P Trading</h4>
                        <ul className="space-y-1.5 opacity-60">
                          <li className="text-gray-400 text-xs sm:text-sm flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00FF66]" /> Secure peer-to-peer trading</li>
                          <li className="text-gray-400 text-xs sm:text-sm flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00FF66]" /> Escrow protection system</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex gap-4 relative z-10">
                      <div className="w-10 h-10 rounded-full bg-[#111] border border-blue-500/30 flex-shrink-0 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        <Wallet className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="bg-[#111]/80 border border-white/5 rounded-2xl p-4 flex-1 hover:border-blue-500/20 transition-colors text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-500/20 to-transparent px-3 py-1 rounded-bl-xl text-blue-400 text-[9px] uppercase font-bold tracking-widest">Coming Soon</div>
                        <h4 className="text-white font-bold text-sm sm:text-base mb-2 mt-1">CM Web3 Wallet</h4>
                        <ul className="space-y-1.5 opacity-60">
                          <li className="text-gray-400 text-xs sm:text-sm flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Store CM & crypto assets</li>
                          <li className="text-gray-400 text-xs sm:text-sm flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Non-custodial security</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contract & Stats Grid */}
        <div className="w-full">
          {/* Contract Address */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between group w-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FFD700]" />
                <span className="text-gray-300 text-sm font-bold">Official Contract</span>
              </div>
              <span className="bg-[#FFD700]/10 text-[#FFD700] text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-[#FFD700]/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-pulse" /> Coming Soon
              </span>
            </div>
            <div className="bg-black/50 border border-white/5 rounded-xl p-3 flex items-center justify-center">
              <span className="text-gray-500 font-mono text-xs sm:text-sm tracking-widest font-bold uppercase">To Be Announced</span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-[#111] border border-white/10 rounded-2xl p-5">
          <div className="flex justify-between items-end mb-2">
            <span className="text-gray-300 text-sm font-bold">Phase 2 Launch Prep</span>
            <span className="text-[#00FF66] text-sm font-black">95%</span>
          </div>
          <div className="w-full h-2.5 bg-black rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-gradient-to-r from-[#FFD700] to-[#00FF66] w-[95%] relative">
              <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cGF0aCBkPSJNMCA4TDggMEg4TDAgOFoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4yIi8+Cjwvc3ZnPg==')] animate-[slide_1s_linear_infinite]" />
            </div>
          </div>
        </div>

        {/* Bottom Socials */}
        <div className="w-full pt-4">
          <div className="flex items-center justify-center gap-4 mb-5 opacity-50">
            <div className="h-px bg-gradient-to-r from-transparent to-white/20 w-full" />
            <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-bold whitespace-nowrap">
              Join The Movement
            </p>
            <div className="h-px bg-gradient-to-l from-transparent to-white/20 w-full" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
            <a href="https://t.me/OfficialCMNetwork" target="_blank" rel="noopener noreferrer"
              className="bg-[#111] border border-white/5 hover:border-[#0088cc]/50 py-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:bg-[#0088cc]/5 group">
              <Send className="w-5 h-5 text-[#0088cc] group-hover:scale-110 transition-transform" />
              <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase">Telegram</span>
            </a>
            <a href="https://whatsapp.com/channel/0029Vb92OHY6BIEm6VDrL82g" target="_blank" rel="noopener noreferrer"
              className="bg-[#111] border border-white/5 hover:border-[#25D366]/50 py-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:bg-[#25D366]/5 group">
              <MessageCircle className="w-5 h-5 text-[#25D366] group-hover:scale-110 transition-transform" />
              <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase">WhatsApp</span>
            </a>
            <a href="https://x.com/cmnetwork112" target="_blank" rel="noopener noreferrer"
              className="bg-[#111] border border-white/5 hover:border-white/30 py-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:bg-white/5 group">
              <Twitter className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase">X (Twitter)</span>
            </a>
            <button
              className="bg-[#111] border border-[#FFD700]/20 hover:border-[#FFD700]/50 py-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:bg-[#FFD700]/5 group relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#FFD700] text-black px-1.5 py-0.5 rounded-bl-lg text-[7px] font-black uppercase tracking-widest">Soon</div>
              <Wallet className="w-5 h-5 text-[#FFD700] group-hover:scale-110 transition-transform mt-2" />
              <span className="text-[#FFD700] text-[10px] font-bold tracking-wider uppercase">CM Wallet</span>
            </button>
          </div>
        </div>
        
        {/* Glow CTA at bottom */}
        <div className="pb-8 pt-4">
          <p className="text-[#FFD700] text-xs font-bold uppercase tracking-[0.3em] animate-pulse flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> Enter Phase 2 Soon <Zap className="w-3.5 h-3.5" />
          </p>
        </div>

      </div>
    </div>
  );
}




