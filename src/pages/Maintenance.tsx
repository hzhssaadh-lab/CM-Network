import React, { useState, useEffect } from 'react';
import { Wrench, Send, MessageCircle, Twitter, Clock } from 'lucide-react';
import { AdBanner } from '../components/AdBanner';
import { UNIVERSAL_MAINTENANCE_END_MS } from '../lib/utils';

interface MaintenanceProps {
  onMaintenanceEnd?: () => void;
}

export function Maintenance({ onMaintenanceEnd }: MaintenanceProps) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 5,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const diff = UNIVERSAL_MAINTENANCE_END_MS - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        if (onMaintenanceEnd) {
          onMaintenanceEnd();
        } else {
          window.location.reload();
        }
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [onMaintenanceEnd]);

  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-3 sm:p-6 text-center z-[9999] fixed inset-0 overflow-y-auto">
      <div className="max-w-xl w-full py-4 sm:py-6 px-2 sm:px-4 flex flex-col items-center my-auto">
        
        {/* Top Header & Wrench */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-[#FFD700]/15 flex items-center justify-center border border-[#FFD700]/30 shadow-[0_0_20px_rgba(255,215,0,0.2)]">
            <Wrench className="w-6 h-6 text-[#FFD700] animate-pulse" />
          </div>
          <div className="text-left">
            <div className="inline-block bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-full px-2.5 py-0.5 mb-1">
              <span className="text-[#FFD700] text-[10px] font-bold uppercase tracking-wider">System Notice</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-none">
              CM Network Maintenance
            </h1>
          </div>
        </div>

        {/* Live Countdown Timer */}
        <div className="w-full bg-gradient-to-b from-[#FFD700]/15 to-transparent border border-[#FFD700]/30 rounded-xl p-3 sm:p-4 mb-4 shadow-[0_0_20px_rgba(255,215,0,0.1)]">
          <div className="flex items-center justify-center space-x-1.5 text-[#FFD700] mb-2">
            <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="text-[11px] uppercase font-extrabold tracking-widest">Auto Re-Opening In</span>
          </div>
          
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 text-white">
            <div className="flex flex-col items-center">
              <div className="bg-black/80 border border-[#FFD700]/40 rounded-lg w-14 h-12 sm:w-16 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-black text-[#FFD700] shadow-inner">
                {pad(timeLeft.hours)}
              </div>
              <span className="text-[9px] uppercase tracking-wider text-gray-400 mt-1 font-bold">Hours</span>
            </div>

            <span className="text-xl sm:text-2xl font-black text-[#FFD700] -mt-4">:</span>

            <div className="flex flex-col items-center">
              <div className="bg-black/80 border border-[#FFD700]/40 rounded-lg w-14 h-12 sm:w-16 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-black text-[#FFD700] shadow-inner">
                {pad(timeLeft.minutes)}
              </div>
              <span className="text-[9px] uppercase tracking-wider text-gray-400 mt-1 font-bold">Minutes</span>
            </div>

            <span className="text-xl sm:text-2xl font-black text-[#FFD700] -mt-4">:</span>

            <div className="flex flex-col items-center">
              <div className="bg-black/80 border border-[#FFD700]/40 rounded-lg w-14 h-12 sm:w-16 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-black text-[#FFD700] shadow-inner">
                {pad(timeLeft.seconds)}
              </div>
              <span className="text-[9px] uppercase tracking-wider text-gray-400 mt-1 font-bold">Seconds</span>
            </div>
          </div>

          <div className="mt-3 flex justify-center">
            <button
              onClick={() => {
                if (onMaintenanceEnd) onMaintenanceEnd();
                window.location.reload();
              }}
              className="bg-[#FFD700]/20 hover:bg-[#FFD700]/30 border border-[#FFD700]/50 text-[#FFD700] px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              🔄 Check if App is Live / Refresh
            </button>
          </div>
        </div>
        
        {/* Notice Card */}
        <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 sm:p-4 mb-4 text-left backdrop-blur-md shadow-xl">
          <p className="text-gray-100 font-bold text-xs sm:text-sm mb-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-ping inline-block"></span>
            Important Update & Notification:
          </p>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-2">
            CM Network is currently upgrading our servers to enhance your experience. As soon as the maintenance finishes, the app will reopen automatically.
          </p>
          <p className="text-[#FFD700] font-semibold text-xs sm:text-sm">
            ⚡ Please join our official channels below so you don't miss important updates!
          </p>
        </div>
        
        <p className="text-gray-400 text-[11px] uppercase tracking-widest font-extrabold mb-2.5">
          👉 Join Official Social Media Channels 👈
        </p>
        
        {/* Compact Social Media Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full mb-4">
          <a 
            href="https://t.me/OfficialCMNetwork"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 bg-[#0088cc] text-white font-bold py-2.5 px-2 rounded-xl hover:bg-[#0077b5] transition-all shadow-md shadow-[#0088cc]/20 text-xs sm:text-sm"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Telegram</span>
          </a>

          <a 
            href="https://whatsapp.com/channel/0029Vb92OHY6BIEm6VDrL82g"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 bg-[#25D366] text-white font-bold py-2.5 px-2 rounded-xl hover:bg-[#20BE5A] transition-all shadow-md shadow-[#25D366]/20 text-xs sm:text-sm"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>WhatsApp</span>
          </a>

          <a 
            href="https://x.com/cmnetwork112"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 bg-neutral-900 border border-white/20 text-white font-bold py-2.5 px-2 rounded-xl hover:bg-neutral-800 transition-all shadow-md shadow-white/5 text-xs sm:text-sm"
          >
            <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Follow X</span>
          </a>
        </div>

        {/* Banner Ad Placement */}
        <div className="w-full pt-3 border-t border-white/10">
          <AdBanner />
        </div>
      </div>
    </div>
  );
}



