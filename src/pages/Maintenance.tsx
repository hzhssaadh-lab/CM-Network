import React from 'react';
import { Wrench } from 'lucide-react';

export function Maintenance() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center z-[9999] fixed inset-0">
      <div className="w-24 h-24 mb-6 rounded-full bg-[#FFD700]/10 flex items-center justify-center">
        <Wrench className="w-12 h-12 text-[#FFD700]" />
      </div>
      
      <h1 className="text-2xl font-bold text-white mb-4">
        CM Network temporary maintenance par hai.
      </h1>
      
      <p className="text-gray-400 mb-2 max-w-md">
        Agle 24 ghante ke baad app dobara open hogi toh update mil jayega.
      </p>
      
      <p className="text-gray-500 text-sm mb-10 max-w-md">
        Follow the CM Network channel on WhatsApp:
      </p>
      
      <a 
        href="https://whatsapp.com/channel/0029Vb92OHY6BIEm6VDrL82g"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#25D366] text-white font-bold py-4 px-8 rounded-full hover:bg-[#20BE5A] transition-colors shadow-lg shadow-[#25D366]/20"
      >
        Join Our WhatsApp Channel
      </a>
    </div>
  );
}
