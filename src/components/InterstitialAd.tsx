import { useEffect, useState } from 'react';
import { BannerAd } from './BannerAd';

interface InterstitialAdProps {
  slot: string;
  onClose: () => void;
}

export function InterstitialAd({ slot, onClose }: InterstitialAdProps) {
  const [canClose, setCanClose] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5); // 5 sec forced view

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex items-center space-x-3">
        {!canClose && (
          <span className="text-gray-400 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full">
            Reward in {timeLeft}s
          </span>
        )}
        {canClose && (
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
            title="Close Ad"
          >
            ✕
          </button>
        )}
      </div>
      
      <div className="w-full max-w-sm rounded-[32px] border border-white/10 p-2 overflow-hidden bg-black flex flex-col items-center min-h-[300px] justify-center">
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-4">Advertisement</p>
        {/* We use the interstitial slot as a banner here to ensure it displays something in the web view */}
        <BannerAd slot={slot} />
      </div>
    </div>
  );
}
