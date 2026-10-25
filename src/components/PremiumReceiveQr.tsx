import React, { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface PremiumReceiveQrProps {
  walletAddress: string;
}

export function PremiumReceiveQr({ walletAddress }: PremiumReceiveQrProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast.success('Wallet address copied to clipboard!', { icon: '📋' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* Futuristic Scanner Frame with Gold Brackets & Centered CM Emblem */}
      <div className="relative inline-block">
        <div className="relative p-5 sm:p-6 rounded-[28px] bg-gradient-to-b from-[#1c1912] via-[#110f0b] to-[#0a0906] border-2 border-[#FFD700]/70 shadow-[0_0_40px_rgba(255,215,0,0.3)]">
          {/* Gold Corner Scanner Accents */}
          <div className="absolute top-2.5 left-2.5 w-5 h-5 border-t-2 border-l-2 border-[#FFD700] rounded-tl-lg" />
          <div className="absolute top-2.5 right-2.5 w-5 h-5 border-t-2 border-r-2 border-[#FFD700] rounded-tr-lg" />
          <div className="absolute bottom-2.5 left-2.5 w-5 h-5 border-b-2 border-l-2 border-[#FFD700] rounded-bl-lg" />
          <div className="absolute bottom-2.5 right-2.5 w-5 h-5 border-b-2 border-r-2 border-[#FFD700] rounded-br-lg" />

          {/* High-Contrast White Canvas with Embedded Center Monogram */}
          <div className="w-52 h-52 sm:w-60 sm:h-60 mx-auto bg-white p-3.5 rounded-2xl shadow-2xl relative flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* White background */}
              <rect x="0" y="0" width="100" height="100" fill="white" />
              
              {/* Top-Left Finder */}
              <rect x="4" y="4" width="28" height="28" rx="4" fill="#000" />
              <rect x="8" y="8" width="20" height="20" rx="2" fill="#fff" />
              <rect x="12" y="12" width="12" height="12" rx="2" fill="#000" />
              
              {/* Top-Right Finder */}
              <rect x="68" y="4" width="28" height="28" rx="4" fill="#000" />
              <rect x="72" y="8" width="20" height="20" rx="2" fill="#fff" />
              <rect x="76" y="12" width="12" height="12" rx="2" fill="#000" />
              
              {/* Bottom-Left Finder */}
              <rect x="4" y="68" width="28" height="28" rx="4" fill="#000" />
              <rect x="8" y="72" width="20" height="20" rx="2" fill="#fff" />
              <rect x="12" y="76" width="12" height="12" rx="2" fill="#000" />

              {/* Micro Matrix Data Points */}
              <rect x="36" y="6" width="6" height="6" rx="1" fill="#000" />
              <rect x="46" y="6" width="6" height="6" rx="1" fill="#000" />
              <rect x="56" y="6" width="6" height="6" rx="1" fill="#000" />
              <rect x="36" y="16" width="8" height="6" rx="1" fill="#000" />
              <rect x="52" y="16" width="8" height="6" rx="1" fill="#000" />
              <rect x="40" y="26" width="6" height="6" rx="1" fill="#000" />
              <rect x="54" y="26" width="8" height="6" rx="1" fill="#000" />

              {/* Left & Right Columns */}
              <rect x="6" y="38" width="6" height="8" rx="1" fill="#000" />
              <rect x="16" y="42" width="8" height="6" rx="1" fill="#000" />
              <rect x="6" y="52" width="8" height="8" rx="1" fill="#000" />
              <rect x="20" y="54" width="6" height="6" rx="1" fill="#000" />

              <rect x="86" y="38" width="8" height="8" rx="1" fill="#000" />
              <rect x="74" y="44" width="8" height="6" rx="1" fill="#000" />
              <rect x="86" y="52" width="8" height="8" rx="1" fill="#000" />
              <rect x="72" y="56" width="8" height="6" rx="1" fill="#000" />

              {/* Bottom Data Matrix */}
              <rect x="36" y="70" width="8" height="6" rx="1" fill="#000" />
              <rect x="50" y="70" width="6" height="8" rx="1" fill="#000" />
              <rect x="42" y="82" width="8" height="6" rx="1" fill="#000" />
              <rect x="56" y="80" width="8" height="8" rx="1" fill="#000" />
              <rect x="70" y="72" width="6" height="8" rx="1" fill="#000" />
              <rect x="82" y="72" width="8" height="8" rx="1" fill="#000" />
              <rect x="74" y="84" width="8" height="8" rx="1" fill="#000" />
              <rect x="86" y="84" width="6" height="8" rx="1" fill="#000" />
            </svg>

            {/* Embedded Center Gold CM Monogram Badge */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#1b170e] via-[#292212] to-black border-2 border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.7)] flex flex-col items-center justify-center">
                <span className="text-[8px] sm:text-[9px] font-black tracking-widest text-[#FFD700] uppercase leading-none">
                  ★ CM ★
                </span>
                <span className="text-[10px] sm:text-xs font-black text-white font-mono tracking-tighter mt-0.5">
                  COIN
                </span>
              </div>
            </div>
          </div>

          {/* Network tag */}
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-mono font-bold text-gray-300">
              CM Smart Chain (BEP-20)
            </span>
          </div>
        </div>
      </div>

      {/* Address display bar */}
      <div className="w-full max-w-sm p-3 rounded-xl bg-black/70 border border-[#FFD700]/30 text-left">
        <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest block mb-0.5">
          Your Web3 Deposit Address
        </span>
        <p className="text-xs font-mono text-[#FFD700] font-bold break-all select-all">
          {walletAddress}
        </p>
      </div>

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="w-full max-w-sm py-3.5 rounded-xl bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,215,0,0.35)]"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        <span>{copied ? 'Address Copied!' : 'Copy Deposit Address'}</span>
      </button>

      {/* Contract Address Status */}
      <div className="w-full max-w-sm p-3 rounded-xl bg-white/[0.03] border border-amber-500/30 flex items-center justify-between text-left">
        <div>
          <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider block">
            CM Contract Address
          </span>
          <span className="text-xs font-mono font-bold text-amber-400">
            Coming Soon ⏳
          </span>
        </div>
        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
          In Audit
        </span>
      </div>
    </div>
  );
}
