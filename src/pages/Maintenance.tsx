import React from 'react';
import { Wrench } from 'lucide-react';

export function Maintenance() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center z-[9999] fixed inset-0">
      <div className="w-24 h-24 mb-6 rounded-full bg-[#FFD700]/10 flex items-center justify-center">
        <Wrench className="w-12 h-12 text-[#FFD700]" />
      </div>
      
      <h1 className="text-2xl font-bold text-white mb-4">
        CM Network is temporarily under maintenance.
      </h1>
      
      <p className="text-gray-400 mb-2 max-w-md">
        The app will be back online with a new update within the next 60 minutes.
      </p>
      
      <p className="text-gray-500 text-sm mb-10 max-w-md">
        Follow the CM Network channel on WhatsApp and X for updates:
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <a 
          href="https://whatsapp.com/channel/0029Vb92OHY6BIEm6VDrL82g"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white font-bold py-4 px-8 rounded-full hover:bg-[#20BE5A] transition-colors shadow-lg shadow-[#25D366]/20"
        >
          WhatsApp Channel
        </a>
        <a 
          href="https://x.com/cmnetwork112"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-black border border-white/20 text-white font-bold py-4 px-8 rounded-full hover:bg-white/10 transition-colors shadow-lg shadow-white/5"
        >
          Follow on X
        </a>
      </div>
    </div>
  );
}
