import { useEffect, useState } from 'react';

interface InterstitialAdProps {
  onClose: () => void;
}

export function InterstitialAd({ onClose }: InterstitialAdProps) {
  const [canClose, setCanClose] = useState(true);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute top-6 right-6 flex items-center z-50">
        <button
          onClick={onClose}
          className="w-12 h-12 bg-white/10 hover:bg-white/20 active:bg-[#FFD700] active:text-black rounded-full flex items-center justify-center text-white transition-all font-black text-xl border border-white/20 shadow-xl"
          title="Close & Claim Reward"
        >
          ✕
        </button>
      </div>
      
      <div className="w-full h-full max-h-[80vh] max-w-4xl rounded-3xl border-2 border-white/10 overflow-hidden bg-black flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none flex items-center justify-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/40 mt-2">Sponsored Advertisement</span>
        </div>
        
        <div className="w-full h-full relative z-0">
           <iframe 
             src="https://omg10.com/4/11069214" 
             className="w-full h-full absolute inset-0 border-0 pointer-events-auto"
             title="Sponsor Advertisement"
             sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
           ></iframe>
           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -z-10 bg-[#0a0a0a]">
             <div className="w-8 h-8 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-[#FFD700]/50 text-xs uppercase tracking-widest font-bold">Loading Ad...</p>
           </div>
        </div>
      </div>
    </div>
  );
}
