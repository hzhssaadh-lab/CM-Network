import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useAppStore';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { 
  Zap, 
  Wallet, 
  Users, 
  Menu, 
  Home, 
  Pickaxe, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import cmLogo from '../assets/images/cm_official_logo.jpg';

interface MobileDashboardMockupProps {
  onOpenAuth?: () => void;
}

export function MobileDashboardMockup({ onOpenAuth }: MobileDashboardMockupProps) {
  const { user, startMining } = useApp();
  const navigate = useNavigate();
  const [isMiningLoading, setIsMiningLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("12:00:00");
  const [isMiningActive, setIsMiningActive] = useState<boolean>(false);

  // Check user mining session
  useEffect(() => {
    const updateMiningTimer = () => {
      if (!user?.miningSessionEndTime) {
        setTimeRemaining("12:00:00");
        setIsMiningActive(false);
        return;
      }

      const diff = user.miningSessionEndTime - Date.now();
      if (diff <= 0) {
        setTimeRemaining("12:00:00");
        setIsMiningActive(false);
      } else {
        setIsMiningActive(true);
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeRemaining(
          `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        );
      }
    };

    updateMiningTimer();
    const timer = setInterval(updateMiningTimer, 1000);
    return () => clearInterval(timer);
  }, [user?.miningSessionEndTime]);

  const handleStartMining = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      else navigate('/login');
      return;
    }

    if (isMiningActive) {
      toast("Mining is currently active! Session is in progress.", { icon: "⛏️" });
      return;
    }

    setIsMiningLoading(true);
    const res = await startMining();
    setIsMiningLoading(false);

    if (res.success) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      toast.success(res.message, { icon: "⛏️" });
    } else {
      toast.error(res.message);
    }
  };

  const handleAction = (path: string) => {
    if (!user && onOpenAuth) {
      onOpenAuth();
    } else {
      navigate(path);
    }
  };

  const currentBalance = user?.balance != null ? user.balance : 0.00;

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      {/* Golden pedestal glow underneath the phone */}
      <div className="absolute -bottom-10 w-72 h-16 sm:w-96 sm:h-20 bg-gradient-to-r from-transparent via-[#FFD700]/30 to-transparent rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-4 w-60 h-8 sm:w-80 sm:h-10 border border-[#FFD700]/40 rounded-full bg-gradient-to-b from-[#FFD700]/10 to-transparent pointer-events-none" />

      {/* Realistic Smartphone Chassis */}
      <div className="relative w-[290px] sm:w-[320px] rounded-[48px] p-3.5 bg-gradient-to-b from-[#2a2416] via-[#15130f] to-[#0a0907] border-2 border-[#FFD700]/50 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(255,215,0,0.18)] transition-transform duration-500 hover:scale-[1.02]">
        
        {/* Speaker / Front camera punch hole */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-30 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1c1c1c] mr-2" />
          <div className="w-8 h-1 rounded-full bg-[#1c1c1c]" />
        </div>

        {/* Screen Bezel */}
        <div className="w-full h-[580px] sm:h-[620px] rounded-[38px] bg-[#0c0c0d] overflow-hidden flex flex-col relative border border-white/10 select-none">
          
          {/* Status Bar */}
          <div className="h-10 w-full flex items-center justify-between px-6 pt-3 text-[10px] font-bold text-gray-400 z-20">
            <span>9:41</span>
            <div className="flex items-center space-x-1.5">
              <span>5G</span>
              <div className="w-5 h-2.5 border border-gray-400 rounded-sm p-0.5">
                <div className="w-full h-full bg-[#FFD700] rounded-2xs" />
              </div>
            </div>
          </div>

          {/* App Header Inside Mockup */}
          <div className="px-5 py-2.5 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center space-x-2">
              <img src={cmLogo} alt="CM" className="w-6 h-6 rounded-md bg-black object-contain border border-[#FFD700]/50" />
              <span className="font-black text-xs tracking-wider text-white">CM NETWORK</span>
            </div>
            <button className="text-gray-400 hover:text-white">
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Screen Content Body */}
          <div className="flex-1 p-4 space-y-3.5 overflow-y-auto no-scrollbar">
            
            {/* Total Balance Card */}
            <div className="bg-gradient-to-b from-[#181818] to-[#101010] border border-[#FFD700]/30 rounded-2xl p-4 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFD700]/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.15)]">
                  <span className="font-black text-base">⬡</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Balance</p>
                  <h4 className="text-xl font-black text-white font-mono tracking-tight">
                    <span className="text-[#FFD700] mr-1.5 font-sans">CM</span>
                    {formatCurrency(currentBalance)}
                  </h4>
                </div>
              </div>

              {user && (
                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400">
                  <span>USDT: ${(user.usdtBalance || 0).toFixed(2)}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                </div>
              )}
            </div>

            {/* Mining Card */}
            <div className="bg-gradient-to-br from-[#1b170e] via-[#12100a] to-[#0d0c08] border border-[#FFD700]/40 rounded-2xl p-3.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-9 h-9 rounded-xl ${isMiningActive ? 'bg-amber-500/20 text-[#FFD700] animate-pulse' : 'bg-white/5 text-gray-400'} border border-[#FFD700]/30 flex items-center justify-center`}>
                    <Pickaxe className={`w-4 h-4 ${isMiningActive ? 'animate-bounce' : ''}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-extrabold text-white">Mining</span>
                      {isMiningActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      )}
                    </div>
                    <p className="text-xs font-mono font-bold text-[#FFD700] tracking-wider">
                      {timeRemaining}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleStartMining}
                  disabled={isMiningLoading || isMiningActive}
                  className={`px-3.5 py-2 rounded-xl text-[11px] font-black transition-all ${
                    isMiningActive 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                      : 'bg-gradient-to-r from-[#FFD700] to-amber-500 text-black hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(255,215,0,0.25)]'
                  }`}
                >
                  {isMiningLoading ? 'Starting...' : isMiningActive ? 'Mining...' : 'Start Mining'}
                </button>
              </div>
            </div>

            {/* Quick 3-Action Column */}
            <div className="grid grid-cols-3 gap-2">
              {/* Tasks */}
              <button 
                onClick={() => handleAction('/tasks')}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FFD700]/40 rounded-2xl p-2.5 flex flex-col items-center justify-center text-center transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-white">Tasks</span>
                <span className="text-[8px] text-gray-400">Earn More</span>
              </button>

              {/* Wallet */}
              <button 
                onClick={() => handleAction('/wallet')}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 rounded-2xl p-2.5 flex flex-col items-center justify-center text-center transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-white">Wallet</span>
                <span className="text-[8px] text-gray-400">Manage Funds</span>
              </button>

              {/* Referral */}
              <button 
                onClick={() => handleAction('/friends')}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/40 rounded-2xl p-2.5 flex flex-col items-center justify-center text-center transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-white">Referral</span>
                <span className="text-[8px] text-gray-400">Invite Friends</span>
              </button>
            </div>

            {/* Micro banner inside phone */}
            <div className="bg-gradient-to-r from-[#161616] to-[#0f0f0f] border border-white/5 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[9px] text-[#FFD700] font-black uppercase tracking-widest">Phase 2 Protocol</p>
                <p className="text-[10px] text-white font-bold">25-Day Countdown Live</p>
              </div>
              <span className="text-[10px] text-[#FFD700] font-mono font-bold">LOCKED</span>
            </div>

          </div>

          {/* Bottom Bar in Phone Screen */}
          <div className="h-14 bg-[#121214] border-t border-white/10 flex items-center justify-around px-2 text-[9px] font-bold text-gray-400">
            <button onClick={() => handleAction('/')} className="flex flex-col items-center text-[#FFD700]">
              <Home className="w-3.5 h-3.5" />
              <span className="text-[8px] mt-0.5">Home</span>
            </button>
            <button onClick={handleStartMining} className="flex flex-col items-center hover:text-white">
              <Pickaxe className="w-3.5 h-3.5" />
              <span className="text-[8px] mt-0.5">Mining</span>
            </button>
            <button onClick={() => handleAction('/tasks')} className="flex flex-col items-center hover:text-white">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-[8px] mt-0.5">Tasks</span>
            </button>
            <button onClick={() => handleAction('/wallet')} className="flex flex-col items-center hover:text-white">
              <Wallet className="w-3.5 h-3.5" />
              <span className="text-[8px] mt-0.5">Wallet</span>
            </button>
            <button onClick={() => handleAction('/profile')} className="flex flex-col items-center hover:text-white">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[8px] mt-0.5">Profile</span>
            </button>
          </div>

          {/* iPhone Home Indicator bar */}
          <div className="h-4 w-full flex items-center justify-center bg-[#121214]">
            <div className="w-24 h-1 bg-white/20 rounded-full" />
          </div>

        </div>
      </div>
    </div>
  );
}
