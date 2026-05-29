import React from 'react';

interface AdDisplayProps {
  className?: string;
  type?: 'banner' | 'rectangle';
}

export function AdDisplay({ className = '' }: AdDisplayProps) {
  return (
    <div className={`w-full flex flex-col items-center justify-center gap-4 my-4 ${className}`}>
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center relative bg-black overflow-hidden z-10 rounded-xl border border-green-500/20">
        <iframe 
          src="https://omg10.com/4/11069214" 
          className="w-full h-full min-h-[300px] border-0 relative z-20"
          title="Sponsor Ad"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
        ></iframe>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 text-center p-6 bg-black/80">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h4 className="text-green-500 font-bold uppercase tracking-widest text-sm mb-2">Loading Ad...</h4>
          <p className="text-gray-400 text-xs font-medium">Please wait for the sponsor ad to load.</p>
        </div>
      </div>
    </div>
  );
}
