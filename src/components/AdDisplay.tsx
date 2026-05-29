import React from 'react';
import { ExternalLink, Star } from 'lucide-react';

interface AdDisplayProps {
  className?: string;
  type?: 'banner' | 'rectangle';
  title?: string;
  subtitle?: string;
}

export function AdDisplay({ className = '', title = "Sponsored Content", subtitle = "Click to visit our sponsor & support the app!" }: AdDisplayProps) {
  const handleClick = () => {
    window.open('https://omg10.com/4/11069214', '_blank');
  };

  return (
    <div className={`w-full flex flex-col items-center justify-center gap-4 my-4 ${className}`}>
      <button 
        onClick={handleClick}
        className="w-full h-full min-h-[250px] flex flex-col items-center justify-center relative bg-gradient-to-br from-indigo-900 via-purple-900 to-black overflow-hidden z-10 rounded-xl border border-indigo-500/40 group transition-all hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] shadow-lg"
      >
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
        <div className="absolute top-0 right-0 p-3 flex gap-2">
           <span className="bg-black/80 border border-white/10 text-white/70 text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded">Ad</span>
        </div>
        
        <Star className="w-16 h-16 text-[#FFD700] mb-4 drop-shadow-[0_0_15px_rgba(255,215,0,0.4)] group-hover:animate-pulse transition-all" />
        <h4 className="text-white font-black uppercase tracking-widest text-2xl mb-2 drop-shadow-md px-4 text-center">{title}</h4>
        <p className="text-indigo-200 text-sm font-medium mb-8 px-6 text-center max-w-sm">{subtitle}</p>
        
        <div className="bg-[#FFD700] text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 group-hover:bg-white transition-colors shadow-xl tracking-widest uppercase text-sm">
          Visit Sponsor <ExternalLink className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
}
