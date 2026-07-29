import { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../hooks/useAppStore';
import { PlaySquare, DollarSign, Coins } from 'lucide-react';
import toast from 'react-hot-toast';

export function Ads() {
  const { user, claimAdReward, claimUsdtAdReward } = useApp();
  const [isClaiming, setIsClaiming] = useState(false);

  const watchAd = async (type: 'CM' | 'USDT') => {
    if (isClaiming) return;
    setIsClaiming(true);

    const AD_URL = "https://cabinetavidgrasp.com/b9gv8i3egz?key=a6284cca79326b8b45f522cad8bae99f";
    
    // Open ad URL in a new tab
    window.open(AD_URL, '_blank');

    // Automatically give the reward after a short delay to simulate watching
    setTimeout(async () => {
      try {
        let result;
        if (type === 'CM') {
          result = await claimAdReward();
        } else {
          result = await claimUsdtAdReward();
        }
        
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("An error occurred while claiming your reward.");
      } finally {
        setIsClaiming(false);
      }
    }, 5000); // 5 seconds delay before claiming
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="text-center mb-8 relative">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 tracking-tighter mb-2">EARN</h1>
        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Watch ads to earn rewards</p>
      </div>

      <div className="space-y-4">
        {/* CM Coin Reward Section */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-[32px] border border-[#FFD700]/20 p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#FFD700]/40 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
          
          <div className="w-16 h-16 bg-[#FFD700]/10 rounded-full flex items-center justify-center mb-4">
            <Coins className="w-8 h-8 text-[#FFD700]" />
          </div>
          
          <h2 className="text-2xl font-black text-white tracking-tighter mb-1">Earn CM Coins</h2>
          <p className="text-sm text-gray-400 mb-6 text-center">Watch a short ad and earn CM Coins directly to your balance.</p>
          
          <div className="w-full flex justify-between items-center mb-6 bg-black/40 rounded-2xl p-4 border border-white/5">
            <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Reward</span>
            <span className="text-[#FFD700] font-black font-mono">+0.01 CM</span>
          </div>

          <button 
            onClick={() => watchAd('CM')}
            disabled={isClaiming}
            className="w-full bg-gradient-to-r from-[#FFD700] to-[#B8860B] text-black font-black py-4 rounded-2xl shadow-[0_10px_40px_rgba(212,175,55,0.3)] text-lg tracking-tighter active:scale-95 transition-all outline-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlaySquare className="w-5 h-5" />
            {isClaiming ? 'WAITING...' : 'WATCH NOW'}
          </button>
        </div>

        {/* USDT Reward Section */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-[32px] border border-green-500/20 p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:border-green-500/40 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
          
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
          
          <h2 className="text-2xl font-black text-white tracking-tighter mb-1">Earn USDT</h2>
          <p className="text-sm text-gray-400 mb-6 text-center">Watch a short ad and earn USDT directly to your balance.</p>
          
          <div className="w-full flex justify-between items-center mb-6 bg-black/40 rounded-2xl p-4 border border-white/5">
            <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Reward</span>
            <span className="text-green-400 font-black font-mono">+0.001 USDT</span>
          </div>

          <button 
            onClick={() => watchAd('USDT')}
            disabled={isClaiming}
            className="w-full bg-gradient-to-r from-green-400 to-green-600 text-black font-black py-4 rounded-2xl shadow-[0_10px_40px_rgba(34,197,94,0.3)] text-lg tracking-tighter active:scale-95 transition-all outline-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlaySquare className="w-5 h-5" />
            {isClaiming ? 'WAITING...' : 'WATCH NOW'}
          </button>
        </div>
      </div>
    </div>
  );
}
