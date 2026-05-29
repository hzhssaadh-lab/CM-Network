import React from 'react';
import { ExternalLink } from 'lucide-react';

interface BannerAdProps {
  slot?: string;
  className?: string;
}

export function BannerAd({ className = '' }: BannerAdProps) {
  const handleClick = () => {
    window.open('https://omg10.com/4/11069214', '_blank');
  };

  return (
    <div className={`w-full overflow-hidden flex justify-center my-2 ${className}`}>
      <button 
        onClick={handleClick}
        className="w-full min-h-[80px] flex flex-col sm:flex-row items-center justify-between p-4 relative bg-gradient-to-r from-purple-900 to-indigo-900 overflow-hidden z-10 rounded-xl border border-white/10 group hover:border-[#FFD700]/50 transition-all shadow-lg"
      >
        <div className="flex items-center gap-4 z-20">
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
            <span className="text-[#FFD700] text-xs font-black">AD</span>
          </div>
          <div className="text-left">
            <h4 className="text-white font-bold text-sm tracking-wide">Premium Partner Offer</h4>
            <p className="text-indigo-200 text-xs">Tap here to view our sponsor's page</p>
          </div>
        </div>
        
        <div className="mt-3 sm:mt-0 bg-[#FFD700] text-black px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1 group-hover:bg-white transition-colors tracking-widest uppercase shadow-md z-20">
          View <ExternalLink className="w-3 h-3" />
        </div>
      </button>
    </div>
  );
}
