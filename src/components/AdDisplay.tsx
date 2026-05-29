import React from 'react';

interface AdDisplayProps {
  className?: string;
  type?: 'banner' | 'rectangle';
}

export function AdDisplay({ className = '', type = 'banner' }: AdDisplayProps) {
  return (
    <div className={`w-full flex flex-col items-center justify-center gap-4 my-4 ${className}`}>
      <div className={`w-full flex flex-col items-center justify-center relative bg-black overflow-hidden rounded-xl border border-white/10 ${type === 'banner' ? 'min-h-[80px]' : 'min-h-[250px]'}`}>
        <iframe 
          src="https://omg10.com/4/11069214" 
          className="w-full h-full absolute inset-0 border-0 z-20"
          title="Sponsor Ad"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
        ></iframe>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 text-center p-4 bg-black/50">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Loading Ad...</p>
        </div>
      </div>
    </div>
  );
}
