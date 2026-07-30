import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../hooks/useAppStore';
import { PlaySquare, DollarSign, Coins, ArrowUpRight, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../lib/utils';

export function Ads() {
  const { user, claimAdReward, claimUsdtAdReward, requestUsdtWithdrawal } = useApp();
  const [isClaiming, setIsClaiming] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.dataset.cfasync = 'false';
    script.src = 'https://dcbbwymp1bhlf.cloudfront.net/?wbbcd=1468520';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const watchAd = async (type: 'CM' | 'USDT') => {
    if (isClaiming) return;
    setIsClaiming(true);

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

  const handleWithdraw = async (e: any) => {
    e.preventDefault();
    if (isWithdrawing) return;

    if (!withdrawAddress.trim()) {
      toast.error('Please enter a wallet address');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount < 12) {
      toast.error('Minimum withdrawal is 12 USDT');
      return;
    }

    if (amount > (user?.usdtBalance || 0)) {
      toast.error('Insufficient USDT balance');
      return;
    }

    setIsWithdrawing(true);
    try {
      const result = await requestUsdtWithdrawal(amount, withdrawAddress, 'USDT-TRC20');
      if (result.success) {
        toast.success(result.message || 'Withdrawal requested successfully');
        setWithdrawAmount('');
        setWithdrawAddress('');
      } else {
        toast.error(result.message || 'Withdrawal failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during withdrawal');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="text-center mb-8 relative">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 tracking-tighter mb-2">EARN</h1>
        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Watch ads & Withdraw</p>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-[#FFD700]/20 p-5 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total CM Coins</div>
          <div className="text-xl font-black text-[#FFD700] tracking-tighter flex items-center gap-1">
            <Coins className="w-4 h-4" />
            {formatCurrency(user?.balance || 0)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-green-500/20 p-5 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total USDT</div>
          <div className="text-xl font-black text-green-400 tracking-tighter flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            {formatCurrency(user?.usdtBalance || 0)}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* CM Coin Reward Section */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-[32px] border border-[#FFD700]/20 p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#FFD700]/40 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
          
          <div className="w-16 h-16 bg-[#FFD700]/10 rounded-full flex items-center justify-center mb-4">
            <Coins className="w-8 h-8 text-[#FFD700]" />
          </div>
          
          <h2 className="text-2xl font-black text-white tracking-tighter mb-1">Earn CM Coins</h2>
          <p className="text-sm text-gray-400 mb-4 text-center">Watch a short ad and earn CM Coins directly to your balance.</p>
          
          <div className="w-full flex justify-between items-center mb-6 bg-black/40 rounded-2xl p-4 border border-white/5">
            <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Today's Progress</span>
            <span className="text-white font-black font-mono">{user?.cmAdsWatchedToday || 0} / 40</span>
          </div>
          
          <div className="w-full flex justify-between items-center mb-6 bg-black/40 rounded-2xl p-4 border border-white/5">
            <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Reward</span>
            <span className="text-[#FFD700] font-black font-mono">+0.01 CM</span>
          </div>

          <button 
            onClickCapture={() => watchAd('CM')}
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
          <p className="text-sm text-gray-400 mb-4 text-center">Watch a short ad and earn USDT directly to your balance.</p>
          
          <div className="w-full flex justify-between items-center mb-6 bg-black/40 rounded-2xl p-4 border border-white/5">
            <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Today's Progress</span>
            <span className="text-white font-black font-mono">{user?.adsWatchedToday || 0} / 40</span>
          </div>
          
          <div className="w-full flex justify-between items-center mb-6 bg-black/40 rounded-2xl p-4 border border-white/5">
            <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Reward</span>
            <span className="text-green-400 font-black font-mono">+0.001 USDT</span>
          </div>

          <button 
            onClickCapture={() => watchAd('USDT')}
            disabled={isClaiming}
            className="w-full bg-gradient-to-r from-green-400 to-green-600 text-black font-black py-4 rounded-2xl shadow-[0_10px_40px_rgba(34,197,94,0.3)] text-lg tracking-tighter active:scale-95 transition-all outline-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlaySquare className="w-5 h-5" />
            {isClaiming ? 'WAITING...' : 'WATCH NOW'}
          </button>
        </div>

        {/* USDT Withdrawal Section */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-[32px] border border-blue-500/20 p-6 flex flex-col relative overflow-hidden group hover:border-blue-500/40 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tighter">USDT Withdrawal</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Min. 12 USDT</p>
            </div>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Amount (USDT)</label>
              <div className="relative">
                <input 
                  type="number"
                  min="12"
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 px-4 pl-10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
                />
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <button 
                  type="button"
                  onClick={() => setWithdrawAmount((user?.usdtBalance || 0).toString())}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors"
                >
                  Max
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Wallet Address (TRC20)</label>
              <input 
                type="text"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder="Enter TRC20 address"
                className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors font-mono text-sm"
              />
            </div>

            <button 
              type="submit"
              disabled={isWithdrawing || !withdrawAmount || !withdrawAddress}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-black py-4 rounded-2xl shadow-[0_10px_40px_rgba(59,130,246,0.3)] text-lg tracking-tighter active:scale-95 transition-all outline-none flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpRight className="w-5 h-5" />
              {isWithdrawing ? 'PROCESSING...' : 'WITHDRAW USDT'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

