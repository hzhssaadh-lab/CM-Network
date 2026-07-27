import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Twitter, MessageCircle, X, Send } from 'lucide-react';
import cmLogo from '../assets/images/cm_simple_logo_1785173778768.jpg';

export const SocialPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show on every open/refresh
    setIsOpen(true);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-gray-900 to-black border border-[#FFD700]/30 rounded-[32px] p-6 max-w-sm w-full relative shadow-[0_0_50px_rgba(255,215,0,0.15)]"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6 mt-2">
              <img src={cmLogo} alt="CM Network Logo" className="w-20 h-20 mx-auto mb-4 rounded-full drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]" />
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Welcome to<br/><span className="text-[#FFD700]">CM Network</span></h2>
              <p className="text-gray-400 text-sm mt-3">Follow us on our official channels to stay updated with the latest news!</p>
            </div>

            <div className="space-y-3">
              <a 
                href="https://t.me/OfficialCMNetwork" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-gradient-to-r from-black to-[#0088cc]/20 border border-[#0088cc]/30 rounded-2xl hover:bg-[#0088cc]/30 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#0088cc]/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Send className="w-5 h-5 text-[#0088cc]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-md">Telegram</h3>
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest">Join Channel</p>
                  </div>
                </div>
                <div className="px-4 py-1.5 bg-[#0088cc] text-white text-xs font-black rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(0,136,204,0.5)]">
                  Join
                </div>
              </a>

              <a 
                href="https://whatsapp.com/channel/0029Vb92OHY6BIEm6VDrL82g" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-gradient-to-r from-black to-[#25D366]/20 border border-[#25D366]/30 rounded-2xl hover:bg-[#25D366]/30 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#25D366]/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-md">WhatsApp</h3>
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest">Join Channel</p>
                  </div>
                </div>
                <div className="px-4 py-1.5 bg-[#25D366] text-white text-xs font-black rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(37,211,102,0.5)]">
                  Join
                </div>
              </a>

              <a 
                href="https://x.com/cmnetwork112" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-gradient-to-r from-black to-[#1DA1F2]/20 border border-[#1DA1F2]/30 rounded-2xl hover:bg-[#1DA1F2]/30 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#1DA1F2]/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-md">X (Twitter)</h3>
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest">Follow Us</p>
                  </div>
                </div>
                <div className="px-4 py-1.5 bg-[#1DA1F2] text-white text-xs font-black rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(29,161,242,0.5)]">
                  Follow
                </div>
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
