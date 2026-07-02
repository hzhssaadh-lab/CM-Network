import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useAppStore';
import { InterstitialAd } from '../components/InterstitialAd';
import confetti from 'canvas-confetti';
import { PlaySquare, Gift, Wallet, Clock, CheckCircle2, XCircle, Grid } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Ads() {
  const { user, claimUsdtAdReward, claimAdReward, requestUsdtWithdrawal } = useApp();
  const [watching, setWatching] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [fetchingCm, setFetchingCm] = useState(false);
  const [successMsgCm, setSuccessMsgCm] = useState('');

  const [activeAdTab, setActiveAdTab] = useState<'usdt' | 'cm'>('cm');

  const [withdrawMode, setWithdrawMode] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState('Binance UID');
  const [walletAddr, setWalletAddr] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const totalUsdtEarned = (user?.totalAdsWatched || 0) * 0.001;
  const totalCmEarned = (user?.totalCmAdsWatched || 0) * 0.002;

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user?.uid, withdrawMode]);

  const fetchHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('withdrawals_usdt')
        .select('*')
        .eq('userId', user.uid)
        .order('requestedAt', { ascending: false });
        
      if (data) {
        setHistory(data);
      }
    } catch (e) {
      console.error("Error fetching withdrawal history:", e);
    }
    setLoadingHistory(false);
  };

  if (!user) return null;

  const handleWatchAd = () => {
    window.open("https://omg10.com/4/11069214", "_blank");
    processAdReward();
  };

  const processAdReward = async () => {
    if (fetching) return;
    setFetching(true);
    const res = await claimUsdtAdReward();
    setFetching(false);
    setWatching(false);

    if (res.success) {
       setSuccessMsg(`+${res.reward} USDT!`);
       confetti({
         particleCount: 150,
         spread: 80,
         origin: { y: 0.6 },
         colors: ['#22c55e', '#ffffff', '#16a34a']
       });
       setTimeout(() => setSuccessMsg(''), 3000);
    } else {
       alert(res.message);
    }
  };

  const handleWatchCmAd = () => {
    window.open("https://omg10.com/4/11069214", "_blank");
    processCmAdReward();
  };

  const processCmAdReward = async () => {
    if (fetchingCm) return;
    setFetchingCm(true);
    const res = await claimAdReward();
    setFetchingCm(false);

    if (res.success) {
       setSuccessMsgCm(`+${res.reward} CM!`);
       confetti({
         particleCount: 150,
         spread: 80,
         origin: { y: 0.6 },
         colors: ['#3b82f6', '#ffffff', '#2563eb']
       });
       setTimeout(() => setSuccessMsgCm(''), 3000);
    } else {
       alert(res.message);
    }
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
    const res = await requestUsdtWithdrawal(amount, walletAddr.trim(), withdrawMethod);
    if (res.success) {
      setSuccess(res.message);
      setWithdrawAmount('');
      setWalletAddr('');
      fetchHistory();
    } else {
      setError(res.message);
    }
    setWithdrawing(false);
  };

  const now = new Date();
  const today = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;

  const adsWatchedToday = user.lastAdWatchDate === today ? (user.adsWatchedToday || 0) : 0;
  const remainingAdsToday = Math.max(0, 100 - adsWatchedToday);
  
  const cmAdsWatchedToday = user.lastCmAdWatchDate === today ? (user.cmAdsWatchedToday || 0) : 0;
  const remainingCmAdsToday = Math.max(0, 50 - cmAdsWatchedToday);

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 px-4">
      
      {/* Wallet Heading Hero Card */}
      <div className="mb-6 p-8 bg-white/5 border border-white/10 rounded-[32px] relative overflow-hidden text-center">
        {activeAdTab === 'usdt' ? (
          <>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-500 opacity-10 blur-[80px] pointer-events-none"></div>
            <h2 className="text-3xl font-black tracking-tight mb-2">My <span className="text-green-500">USDT</span> Dashboard</h2>
            <p className="text-4xl font-mono text-white font-bold tracking-tight">${(user.usdtBalance || 0).toFixed(4)}</p>
            <button 
              onClick={() => setWithdrawMode(!withdrawMode)}
              className="mt-6 px-6 py-2 bg-white/10 border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-colors inline-flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" /> {withdrawMode ? 'Back to Ads' : 'Withdraw USDT'}
            </button>
          </>
        ) : (
          <>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500 opacity-10 blur-[80px] pointer-events-none"></div>
            <h2 className="text-3xl font-black tracking-tight mb-2">My <span className="text-blue-500">CM</span> Dashboard</h2>
            <p className="text-4xl font-mono text-white font-bold tracking-tight">{(user.balance || 0).toFixed(4)} <span className="text-xl text-blue-500">CM</span></p>
            <button 
              disabled={true}
              className="mt-6 px-6 py-2 bg-white/10 border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest transition-colors inline-flex items-center gap-2 opacity-50 cursor-not-allowed"
              title="CM withdrawal is in Tasks section"
            >
              <Wallet className="w-4 h-4" /> Withdraw CM
            </button>
          </>
        )}
      </div>

      {/* Dynamic Real-Time Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/40 border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Wallet Balance</span>
            <Wallet className={`w-4 h-4 ${activeAdTab === 'usdt' ? 'text-green-500' : 'text-blue-500'}`} />
          </div>
          <div>
            <p className="text-xl font-mono font-black text-white">{activeAdTab === 'usdt' ? `$${(user.usdtBalance || 0).toFixed(4)}` : `${(user.balance || 0).toFixed(4)} CM`}</p>
            <p className={`text-[9px] font-bold uppercase mt-1 ${activeAdTab === 'usdt' ? 'text-green-400' : 'text-blue-400'}`}>Available Now</p>
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Remaining Today</span>
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <p className="text-xl font-mono font-black text-white">{activeAdTab === 'usdt' ? remainingAdsToday : remainingCmAdsToday}</p>
            <p className="text-[9px] text-gray-400 font-medium uppercase mt-1">Limit: {activeAdTab === 'usdt' ? '100' : '50'} Daily</p>
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Ads Watched</span>
            <PlaySquare className={`w-4 h-4 ${activeAdTab === 'usdt' ? 'text-blue-500' : 'text-blue-500'}`} />
          </div>
          <div>
            <p className="text-xl font-mono font-black text-white">{activeAdTab === 'usdt' ? (user.totalAdsWatched || 0) : (user.totalCmAdsWatched || 0)}</p>
            <p className="text-[9px] text-gray-400 font-medium uppercase mt-1">All-Time Views</p>
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{activeAdTab === 'usdt' ? 'Total USDT Earned' : 'Total CM Earned'}</span>
            <Gift className="w-4 h-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-xl font-mono font-black text-white">{activeAdTab === 'usdt' ? `$${totalUsdtEarned.toFixed(4)}` : `${totalCmEarned.toFixed(4)}`}</p>
            <p className={`text-[9px] font-bold uppercase mt-1 ${activeAdTab === 'usdt' ? 'text-green-400' : 'text-blue-400'}`}>Direct Ad Revenue</p>
          </div>
        </div>
      </div>

      {withdrawMode && (
        <>
          <div className="mb-8 p-6 sm:p-8 bg-black/40 border border-white/10 rounded-[32px] relative overflow-hidden animate-in fade-in slide-in-from-top-4">
            <h3 className="text-xl font-bold font-black tracking-tight mb-2">Withdraw USDT</h3>
            <p className="text-gray-400 text-sm mb-6">Minimum withdrawal is <span className="text-green-500 font-bold">2.00 USDT</span>.</p>
            
            {user.transactionsBlocked ? (
               <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center mb-6">
                 <p className="text-red-500 font-bold text-lg mb-2">Transactions Blocked</p>
                 <p className="text-red-400 text-sm">Your account has been restricted from sending or receiving coins. Please contact support at cmnetwork122@gmail.com.</p>
               </div>
             ) : (
                <>
                   {error && <p className="text-red-400 text-sm mb-4 bg-red-400/10 p-4 rounded-xl border border-red-400/20 font-medium">{error}</p>}
                   {success && <p className="text-green-400 text-sm mb-4 bg-green-400/10 p-4 rounded-xl border border-green-400/20 font-medium">{success}</p>}
                   
                   <form onSubmit={handleWithdraw} className="space-y-6">
                     <div>
                       <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Withdrawal Method</label>
                       <select 
                         value={withdrawMethod}
                         onChange={(e) => setWithdrawMethod(e.target.value)}
                         className="w-full bg-black/40 border border-green-500/30 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-green-500 transition-colors placeholder:text-gray-600 focus:ring-1 focus:ring-green-500/50 appearance-none font-bold"
                       >
                         <option value="Binance UID">Binance UID</option>
                         <option value="MEXC UID">MEXC UID</option>
                         <option value="TRC20 Address">TRC20 Address</option>
                         <option value="Aptos Address">Aptos Address</option>
                         <option value="Polygon Address">Polygon Address</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Wallet Address or UID</label>
                       <input 
                         type="text" 
                         value={walletAddr}
                         onChange={(e) => setWalletAddr(e.target.value)}
                         className="w-full bg-black/40 border border-green-500/30 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-green-500 transition-colors placeholder:text-gray-600 focus:ring-1 focus:ring-green-500/50 font-mono" 
                         placeholder="Enter Address or UID"
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

          <div className="mb-8 p-6 sm:p-8 bg-black/40 border border-white/10 rounded-[32px] relative overflow-hidden">
            <h3 className="text-xl font-bold font-black tracking-tight mb-6">Withdrawal History</h3>
            
            {loadingHistory ? (
              <div className="flex justify-center py-6">
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center bg-white/5 rounded-2xl border border-white/10 p-8">
                <p className="text-gray-500 font-medium tracking-wide text-sm">No withdrawals yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((tx) => (
                  <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/60 rounded-2xl border border-white/5 gap-3">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        tx.status === 'approved' ? 'bg-green-500/20 text-green-500' : 
                        tx.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                        'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {tx.status === 'approved' ? <CheckCircle2 className="w-5 h-5" /> : 
                         tx.status === 'rejected' ? <XCircle className="w-5 h-5" /> :
                         <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-white mb-0.5">{tx.amount.toFixed(2)} USDT</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{tx.method || 'Unknown Method'}</p>
                        <p className="text-[10px] text-gray-500 font-mono break-all">{tx.wallet}</p>
                        <p className="text-[10px] text-gray-600 mt-0.5">{new Date(tx.requestedAt).toLocaleString()}</p>
                        {tx.status === 'approved' && tx.txHash && (
                           <p className="text-[10px] text-green-500 font-mono mt-1 break-all">TXID: {tx.txHash}</p>
                        )}
                        {tx.status === 'rejected' && tx.rejectionReason && (
                           <p className="text-[10px] text-red-500 font-medium mt-1">Reason: {tx.rejectionReason}</p>
                        )}
                      </div>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <span className={`text-[10px] px-3 py-1 rounded-full uppercase font-bold tracking-widest ${
                        tx.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                        tx.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Ad Section - only show if not in withdraw mode */}
      {!withdrawMode && (
        <>
          {/* Ad Type Tabs */}
          <div className="flex gap-2 mb-6">
            <button 
              onClick={() => setActiveAdTab('cm')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeAdTab === 'cm' ? 'bg-blue-500 text-black shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
              CM Coins Ads
            </button>
            <button 
              onClick={() => setActiveAdTab('usdt')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeAdTab === 'usdt' ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
              USDT Ads
            </button>
          </div>

          {activeAdTab === 'cm' && (
            <>
              {/* CM Coins Ad Block */}
              <div className="mb-6 p-6 sm:p-8 bg-gradient-to-br from-[#0f172a] to-black border border-blue-500/30 rounded-[32px] relative overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.05)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-20 blur-[50px] pointer-events-none"></div>
            
            {successMsgCm && (
              <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl text-center animate-in fade-in slide-in-from-top-2 relative z-20">
                <p className="text-blue-500 font-bold tracking-widest">{successMsgCm}</p>
              </div>
            )}

            {cmAdsWatchedToday >= 50 ? (
              <div className="text-center relative z-10 py-6">
                <Gift className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-black tracking-tight text-white mb-2">Daily CM Ad Limit Reached</h3>
                <p className="text-gray-400 text-sm">You have watched 50 ads today. Come back tomorrow for more CM rewards!</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-white mb-1 flex items-center gap-3">
                    <PlaySquare className="text-blue-500 w-6 h-6" /> Watch & Earn <span className="text-blue-500 text-xs px-2 py-1 bg-blue-500/10 rounded">CM COINS</span>
                  </h3>
                  <p className="text-blue-100/70 text-sm mt-2">Watch sponsor ads. Every ad gives you 0.002 CM Coins!</p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-bold text-blue-500">
                    <span className="bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                      {remainingCmAdsToday} ADS REMAINING TODAY
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleWatchCmAd}
                  disabled={fetchingCm}
                  className="w-full sm:w-auto px-8 py-4 bg-blue-500 text-black font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-blue-400 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlaySquare className="w-5 h-5 animate-pulse" /> {fetchingCm ? 'PROCESSING...' : 'WATCH NOW'}
                </button>
              </div>
            )}
          </div>

          <div className="p-6 mb-10 bg-black/40 border border-white/10 rounded-3xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
              <Grid className="w-4 h-4 text-blue-500" /> CM Ad Tracker Progress (50 Ads)
            </h4>
            
            <div className="grid grid-cols-10 gap-2">
              {Array.from({ length: 50 }).map((_, idx) => {
                const isCompleted = idx < cmAdsWatchedToday;
                const isNext = idx === cmAdsWatchedToday;
                
                return (
                  <div 
                    key={idx}
                    title={
                      isCompleted ? `Ad #${idx + 1} Completed` : 
                      isNext ? `Ad #${idx + 1} - Next Up!` : 
                      `Ad #${idx + 1} Locked`
                    }
                    onClick={() => {
                      if (isCompleted) {
                        alert(`Ad #${idx + 1} is already completed! You cannot receive the reward again for the same ad.`);
                      } else if (isNext) {
                        handleWatchCmAd();
                      }
                    }}
                    className={`aspect-square rounded-md text-[8px] font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                      isCompleted 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 hover:bg-blue-500/30' 
                        : isNext 
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/60 animate-pulse font-extrabold shadow-[0_0_8px_rgba(249,115,22,0.3)] hover:scale-105' 
                          : 'bg-white/5 text-gray-600 border border-white/5 hover:bg-white/10 hover:text-gray-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                );
              })}
            </div>
          </div>
            </>
          )}

          {activeAdTab === 'usdt' && (
            <>
              {/* USDT Ads Block */}
              <div className="mb-6 p-6 sm:p-8 bg-gradient-to-br from-[#052e16] to-black border border-green-500/30 rounded-[32px] relative overflow-hidden shadow-[0_0_30px_rgba(34,197,94,0.05)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 opacity-20 blur-[50px] pointer-events-none"></div>
            
            {successMsg && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-center animate-in fade-in slide-in-from-top-2 relative z-20">
                <p className="text-green-500 font-bold tracking-widest">{successMsg}</p>
              </div>
            )}

            {adsWatchedToday >= 100 ? (
              <div className="text-center relative z-10 py-6">
                <Gift className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-black tracking-tight text-white mb-2">Daily Ad Limit Reached</h3>
                <p className="text-gray-400 text-sm">You have watched 100 ads today. Come back tomorrow for more USDT rewards!</p>
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
                      {remainingAdsToday} ADS REMAINING TODAY
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleWatchAd}
                  disabled={fetching}
                  className="w-full sm:w-auto px-8 py-4 bg-green-500 text-black font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] shrink-0 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlaySquare className="w-5 h-5 animate-pulse" /> {fetching ? 'PROCESSING...' : 'WATCH NOW'}
                </button>
              </div>
            )}
          </div>

          {/* Elegant Visual Sequences Progress Indicator of 100 ads */}
          <div className="p-6 bg-black/40 border border-white/10 rounded-3xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
              <Grid className="w-4 h-4 text-green-500" /> Daily Ad Tracker Progress (100 Ads)
            </h4>
            
            <div className="grid grid-cols-10 gap-2">
              {Array.from({ length: 100 }).map((_, idx) => {
                const isCompleted = idx < adsWatchedToday;
                const isNext = idx === adsWatchedToday;
                
                return (
                  <div 
                    key={idx}
                    title={
                      isCompleted ? `Ad #${idx + 1} Completed` : 
                      isNext ? `Ad #${idx + 1} - Next Up!` : 
                      `Ad #${idx + 1} Locked`
                    }
                    onClick={() => {
                      if (isCompleted) {
                        alert(`Ad #${idx + 1} is already completed! You cannot receive the reward again for the same ad.`);
                      } else if (isNext) {
                        handleWatchAd();
                      }
                    }}
                    className={`aspect-square rounded-md text-[8px] font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                      isCompleted 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30' 
                        : isNext 
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/60 animate-pulse font-extrabold shadow-[0_0_8px_rgba(249,115,22,0.3)] hover:scale-105' 
                          : 'bg-white/5 text-gray-600 border border-white/5 hover:bg-white/10 hover:text-gray-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                );
              })}
            </div>
            
            <div className="flex gap-4 mt-4 text-[10px] justify-center items-center">
              <div className="flex items-center gap-1.5 text-green-400">
                <span className="w-2.5 h-2.5 bg-green-500/20 border border-green-500/40 rounded-sm inline-block"></span>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1.5 text-orange-400">
                <span className="w-2.5 h-2.5 bg-orange-500/10 border border-orange-500/60 rounded-sm inline-block"></span>
                <span>Next Up</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <span className="w-2.5 h-2.5 bg-white/5 border border-white/5 rounded-sm inline-block"></span>
                <span>Locked</span>
              </div>
            </div>
          </div>
            </>
          )}

        </>
      )}
    </div>
  );
}
