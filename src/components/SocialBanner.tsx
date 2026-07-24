import React from 'react';
import { motion } from 'motion/react';
import { Twitter, MessageCircle } from 'lucide-react';

export const SocialBanner: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-4">
      <a 
        href="https://x.com/cmnetwork112" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center justify-between p-6 bg-gradient-to-r from-black to-[#1DA1F2]/10 border border-[#1DA1F2]/30 rounded-[24px] hover:bg-[#1DA1F2]/10 transition-all group"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-[#1DA1F2]/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Twitter className="w-6 h-6 text-[#1DA1F2]" />
          </div>
          <div>
            <h3 className="font-black text-white text-lg">Follow on X</h3>
            <p className="text-gray-400 text-xs mt-1 font-mono uppercase tracking-widest">@cmnetwork112</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-[#1DA1F2] text-white text-xs font-black rounded-full uppercase tracking-widest hover:bg-[#1a91da]">
          Follow
        </div>
      </a>
      
      <a 
        href="https://whatsapp.com/channel/0029Vb92OHY6BIEm6VDrL82g" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center justify-between p-6 bg-gradient-to-r from-black to-[#25D366]/10 border border-[#25D366]/30 rounded-[24px] hover:bg-[#25D366]/10 transition-all group"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-[#25D366]/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <MessageCircle className="w-6 h-6 text-[#25D366]" />
          </div>
          <div>
            <h3 className="font-black text-white text-lg">WhatsApp</h3>
            <p className="text-gray-400 text-xs mt-1 font-mono uppercase tracking-widest">Join Channel</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-[#25D366] text-white text-xs font-black rounded-full uppercase tracking-widest hover:bg-[#22c55e]">
          Join
        </div>
      </a>
    </div>
  );
};
