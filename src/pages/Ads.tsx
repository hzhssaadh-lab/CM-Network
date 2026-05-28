import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useAppStore';
import { AdDisplay } from '../components/AdDisplay';
import confetti from 'canvas-confetti';
import { PlaySquare, Gift, X, Wallet } from 'lucide-react';

function TasksAdNetwork() {
  useEffect(() => {
    const s1 = document.createElement('script');
    s1.dataset.zone = '11069542';
    s1.src = 'https://al5sm.com/tag.min.js';
    const parent1 = document.body || document.documentElement;
    parent1.appendChild(s1);

    const s2 = document.createElement('script');
    s2.dataset.zone = '243881';
    s2.src = 'https://quge5.com/88/tag.min.js';
    s2.async = true;
    s2.setAttribute('data-cfasync', 'false');
    const parent2 = document.head;
    parent2.appendChild(s2);

    const s3 = document.createElement('script');
    s3.dataset.zone = '243982';
    s3.src = 'https://quge5.com/88/tag.min.js';
    s3.async = true;
    s3.setAttribute('data-cfasync', 'false');
    const parent3 = document.head;
    parent3.appendChild(s3);

    return () => {
      if (parent1.contains(s1)) parent1.removeChild(s1);
      if (parent2.contains(s2)) parent2.removeChild(s2);
      if (parent3.contains(s3)) parent3.removeChild(s3);
    };
  }, []);

  return null;
}

function MonetagAdDisplay() {
  return <div className="text-gray-500 text-xs animate-pulse">Loading Sponsor Match...</div>;
}

export function Ads() {
  const { user, claimUsdtAdReward, requestUsdtWithdrawal } = useApp();
  const [watching, setWatching] = useState(false);
  const [showBox, setShowBox] = useState(false);
  const [opening, setOpening] = useState(false);
  const [rewardAmount, setRewardAmount] = useState<number | null>(null);

  const [withdrawMode, setWithdrawMode] = useState(false);
  const [walletAddr, setWalletAddr] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) return null;

  const handleWatchAd = () => {
    setWatching(true);
  };

  const finishAdWatch = () => {
    setWatching(false);
    setShowBox(true); 
  };

  const handleOpenBox = async () => {
    setOpening(true);
    const res = await claimUsdtAdReward();
    if (res.success) {
       setRewardAmount(res.reward);
       confetti({
         particleCount: 150,
         spread: 80,
         origin: { y: 0.6 },
         colors: ['#22c55e', '#ffffff', '#16a34a']
       });
    } else {
       alert(res.message);
       setShowBox(false);
    }
    setOpening(false);
  };

  const handleClose = () => {
    setShowBox(false);
    setRewardAmount(null);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 2) {
      setError("Minimum withdrawal is 2 USDT"); return;
    }
    if (amount > (user.usdtBalance || 0)) {
      setError("Insufficient USDT balance"); return;
    }
    if (!walletAddr.trim()) {
      setError("Wallet address is required"); return;
    }

    setWithdrawing(true);
    const res = await requestUsdtWithdrawal(amount, walletAddr.trim());
    if (res.success) {
      setSuccess(res.message);
      setWithdrawAmount('');
      setWalletAddr('');
      setTimeout(() => {
        setWithdrawMode(false);
        setSuccess('');
      }, 3000);
    } else {
      setError(res.message);
    }
    setWithdrawing(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <TasksAdNetwork />
      
      <div className="mb-8 p-8 bg-white/5 border border-white/10 rounded-[32px] relative overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-500 opacity-10 blur-[80px] pointer-events-none"></div>
        <h2 className="text-3xl font-black tracking-tight mb-2">My <span className="text-green-500">USDT</span> Balance</h2>
        <p className="text-4xl font-mono text-white font-bold tracking-tight">${(user.usdtBalance || 0).toFixed(4)}</p>
        <button 
          onClick={() => setWithdrawMode(!withdrawMode)}
          className="mt-6 px-6 py-2 bg-white/10 border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-colors inline-flex items-center gap-2"
        >
          <Wallet className="w-4 h-4" /> {withdrawMode ? 'Cancel Withdrawal' : 'Withdraw USDT'}
        </button>
      </div>

      {withdrawMode && (
        <div className="mb-8 p-6 sm:p-8 bg-black/40 border border-white/10 rounded-[32px] relative overflow-hidden animate-in fade-in slide-in-from-top-4">
          <h3 className="text-xl font-bold font-black tracking-tight mb-2">Withdraw to TRC20</h3>
          <p className="text-gray-400 text-sm mb-6">Minimum withdrawal is <span className="text-green-500 font-bold">2.00 USDT</span>.</p>
          
          {user.transactionsBlocked ? (
             <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center mb-6">
               <p className="text-red-500 font-bold text-lg mb-2">Transactions Blocked</p>
               <p className="text-red-400 text-sm">Your account has been restricted from sending or receiving coins. Please contact support.</p>
             </div>
           ) : (
             <>
                {error && <p className="text-red-400 text-sm mb-4 bg-red-400/10 p-4 rounded-xl border border-red-400/20 font-medium">{error}</p>}
                {success && <p className="text-green-400 text-sm mb-4 bg-green-400/10 p-4 rounded-xl border border-green-400/20 font-medium">{success}</p>}
                
                <form onSubmit={handleWithdraw} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Wallet Address (TRC20 / Binance UID)</label>
                    <input 
                      type="text" 
                      value={walletAddr}
                      onChange={(e) => setWalletAddr(e.target.value)}
                      className="w-full bg-black/40 border border-green-500/30 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-green-500 transition-colors placeholder:text-gray-600 focus:ring-1 focus:ring-green-500/50 font-mono" 
                      placeholder="Enter exact TRC20 address or UID"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Amount (USDT)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        step="0.01"
                        min="2"
                        className="w-full bg-black/40 border border-green-500/30 rounded-xl px-4 py-4 text-white pl-4 pr-20 focus:outline-none focus:border-green-500 transition-colors font-mono focus:ring-1 focus:ring-green-500/50" 
                        placeholder="2.00"
                        required
                      />
                      <button type="button" onClick={() => setWithdrawAmount((user.usdtBalance || 0).toString())} className="absolute right-4 text-xs top-1/2 -translate-y-1/2 font-bold text-green-500 hover:text-white transition-colors bg-green-500/10 px-3 py-1 rounded-md">MAX</button>
                    </div>
                  </div>
                  <button disabled={withdrawing} className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-black font-black py-4 rounded-xl shadow-[0_5px_20px_rgba(34,197,94,0.2)] active:scale-95 transition-all outline-none tracking-widest mt-4">
                    {withdrawing ? 'PROCESSING REQUEST...' : 'REQUEST WITHDRAWAL'}
                  </button>
                </form>
             </>
           )}
        </div>
      )}

      <div className="mb-8 p-6 sm:p-8 bg-gradient-to-br from-[#052e16] to-black border border-green-500/30 rounded-[32px] relative overflow-hidden shadow-[0_0_30px_rgba(34,197,94,0.05)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 opacity-20 blur-[50px] pointer-events-none"></div>
        
        {user.adsWatchedToday! >= 30 ? (
          <div className="text-center relative z-10">
            <Gift className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-black tracking-tight text-white mb-2">Daily Ad Limit Reached</h3>
            <p className="text-gray-400 text-sm">You have watched 30 ads today. Come back tomorrow for more USDT rewards!</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div>
              <h3 className="text-2xl font-black tracking-tight text-white mb-1 flex items-center gap-3">
                <PlaySquare className="text-green-500 w-6 h-6" /> Watch & Earn <span className="text-green-500 text-xs px-2 py-1 bg-green-500/10 rounded">USDT</span>
              </h3>
              <p className="text-green-100/70 text-sm mt-2">Watch sponsor ads. Every ad gives you real USDT!</p>
              <div className="mt-3 flex items-center gap-2 text-xs font-bold text-green-500">
                <span className="bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                  {30 - (user.adsWatchedToday || 0)} ADS REMAINING TODAY
                </span>
              </div>
            </div>
            <button
              onClick={handleWatchAd}
              className="w-full sm:w-auto px-8 py-4 bg-green-500 text-black font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] shrink-0 active:scale-95 flex items-center justify-center gap-2"
            >
              <PlaySquare className="w-5 h-5" /> WATCH NOW
            </button>
          </div>
        )}

        {watching && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
             <div className="w-full max-w-sm bg-[#0a0a0a] border border-white/20 rounded-3xl p-6 flex flex-col items-center shadow-[0_0_50px_rgba(34,197,94,0.1)] overflow-hidden relative">
               <h3 className="text-sm uppercase tracking-widest font-bold mb-4 text-green-500">Sponsor Video</h3>
               <div className="w-full h-auto min-h-[250px] flex items-center justify-center mb-6 bg-black/50 rounded-xl overflow-hidden relative z-10 border border-white/10">
                  <MonetagAdDisplay />
               </div>
               <button 
                  onClick={finishAdWatch}
                  className="w-full bg-green-500 text-black text-sm font-black py-4 rounded-xl hover:bg-green-400 transition-colors uppercase tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                >
                  Close Ad & Get USDT
               </button>
             </div>
          </div>
        )}

        {showBox && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
             <div className="w-full max-w-sm bg-[#0a0a0a] border border-green-500/30 rounded-3xl p-8 flex flex-col items-center shadow-[0_0_50px_rgba(34,197,94,0.2)] text-center relative">
               
               {rewardAmount !== null && (
                 <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                   <X className="w-6 h-6" />
                 </button>
               )}

               {rewardAmount === null ? (
                 <>
                   <div className="w-32 h-32 bg-green-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                     <Gift className="w-16 h-16 text-green-500" />
                   </div>
                   <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Mystery Box!</h3>
                   <p className="text-gray-400 text-sm mb-8">Tap to open and reveal your reward.</p>
                   <button 
                      onClick={handleOpenBox}
                      disabled={opening}
                      className={`w-full text-black text-sm font-black py-4 rounded-xl uppercase tracking-widest transition-all ${opening ? 'bg-green-500/50 cursor-wait' : 'bg-green-500 hover:bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-105 active:scale-95'}`}
                    >
                      {opening ? 'Opening...' : 'OPEN BOX'}
                   </button>
                 </>
               ) : (
                 <>
                   <div className="w-32 h-32 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                     <div className="text-4xl font-black text-green-400">+${rewardAmount}</div>
                   </div>
                   <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Congratulations!</h3>
                   <p className="text-gray-400 text-sm mb-8">You found <span className="text-green-500 font-bold">{rewardAmount} USDT</span> in the mystery box!</p>
                   <button 
                      onClick={handleClose}
                      className="w-full bg-white/10 text-white border border-white/20 text-sm font-black py-4 rounded-xl hover:bg-white/20 transition-colors uppercase tracking-widest"
                    >
                      Awesome
                   </button>
                 </>
               )}

             </div>
          </div>
        )}
      </div>
    </div>
  );
}
