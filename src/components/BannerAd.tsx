import React from 'react';

interface BannerAdProps {
  slot: string;
  className?: string;
}

export function BannerAd({ className = '' }: BannerAdProps) {
  return (
    <div className={`w-full overflow-hidden flex justify-center ${className}`}>
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center relative bg-black overflow-hidden z-10 rounded-xl border border-green-500/20">
        <iframe 
          src="https://omg10.com/4/11069214" 
          className="w-full h-full min-h-[300px] border-0 relative z-20"
          title="Sponsor Ad"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
        ></iframe>
      </div>
    </div>
  );
}
