import React from 'react';

interface BannerAdProps {
  slot?: string;
  className?: string;
}

export function BannerAd({ className = '' }: BannerAdProps) {
  return (
    <div className={`w-full overflow-hidden flex justify-center my-2 ${className}`}>
      <div className={`w-full relative bg-black overflow-hidden rounded-xl border border-white/10 min-h-[50px] md:min-h-[90px]`}>
        <iframe 
          src="https://omg10.com/4/11069214" 
          className="w-full h-[300px] -mt-[100px] border-0 relative z-20 pointer-events-auto opacity-90"
          title="Sponsor Banner"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
        ></iframe>
      </div>
    </div>
  );
}
