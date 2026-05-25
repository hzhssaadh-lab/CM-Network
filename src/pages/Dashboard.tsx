import { useState, useEffect, useRef } from 'react';
import { useApp } from '../hooks/useAppStore';
import { formatCurrency } from '../lib/utils';
import { Info } from 'lucide-react';
import { doc, runTransaction, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BannerAd } from '../components/BannerAd';
import { InterstitialAd } from '../components/InterstitialAd';
import { AdDisplay } from '../components/AdDisplay';

export function Dashboard() {
  const { user, updateUser } = useApp();
  const [timeLeft, setTimeLeft] = useState<string>("00:00:00");
  const [isMining, setIsMining] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(user?.balance || 0);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const claimInProgress = useRef(false);

  const requestMiningStart = () => {
    if (!user || isMining) return;
    setShowInterstitial(true);
  };

  const startMining = async () => {
    setShowInterstitial(false);
    if (!user || isMining) return;
    const startTime = Date.now();
    const endTime = startTime + 24 * 60 * 60 * 1000; // 24 hours
    await updateUser({
      miningSessionStartTime: startTime,
      miningSessionEndTime: endTime
    });
  };

  useEffect(() => {
    if (user && !isMining) {
      setCurrentBalance(user.balance);
    }
  }, [user?.balance, isMining]);

  const handleClaim = async (userId: string, earned: number) => {
    if (claimInProgress.current) return;
    claimInProgress.current = true;
    try {
        await runTransaction(db, async (t) => {
          const userRef = doc(db, 'users', userId);
          const userDoc = await t.get(userRef);
          if (!userDoc.exists()) return;
          
          const dbData = userDoc.data();
          if (!dbData.miningSessionStartTime) return; // already claimed

          t.update(userRef, {
              balance: (dbData.balance || 0) + earned,
              totalMined: (dbData.totalMined || 0) + earned,
              miningSessionStartTime: null,
              miningSessionEndTime: null
          });
          
          const txRef = doc(collection(db, 'transactions'));
          t.set(txRef, {
            type: 'mining_reward',
            amount: earned,
            timestamp: Date.now(),
            status: 'completed',
            receiverUid: userId
          });
        });
    } catch(e) { 
        console.error('claim error', e)
    } finally {
        claimInProgress.current = false;
        setIsMining(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    let interval: ReturnType<typeof setInterval>;

    const updateMiningState = () => {
      if (user.miningSessionEndTime && user.miningSessionStartTime) {
        const now = Date.now();
        if (now < user.miningSessionEndTime) {
          setIsMining(true);
          const remaining = user.miningSessionEndTime - now;
          const h = Math.floor((remaining / (1000 * 60 * 60)) % 24);
          const m = Math.floor((remaining / 1000 / 60) % 60);
          const s = Math.floor((remaining / 1000) % 60);
          setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);

          const elapsed = now - user.miningSessionStartTime;
          const minedNow = (user.miningRate / 3600000) * elapsed;
          setCurrentBalance(user.balance + minedNow);
        } else {
          setIsMining(false);
          setTimeLeft("00:00:00");
          // Auto claim when time is up
          const totalEarned = user.miningRate * 24;
          handleClaim(user.uid, totalEarned);
        }
      } else {
        setIsMining(false);
        setTimeLeft("24:00:00");
        setCurrentBalance(user.balance);
      }
    };

    updateMiningState();
    interval = setInterval(updateMiningState, 1000);

    return () => clearInterval(interval);
  }, [user?.miningSessionStartTime, user?.miningSessionEndTime, user?.balance, user?.uid, user?.miningRate]);

  if (!user) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      <section className="lg:col-span-7 bg-white/5 rounded-[32px] border border-white/10 p-8 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden min-h-[440px]">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#FFD700] opacity-10 blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#FFD700] opacity-5 blur-[100px] pointer-events-none"></div>
        
        <div className="relative w-56 h-56 md:w-64 md:h-64 mb-8">
          {/* Radiating Aura Effect */}
          <div className={`absolute inset-0 rounded-full bg-[#FFD700] transition-all duration-1000 ${isMining ? 'opacity-10 blur-2xl animate-pulse' : 'opacity-0'}`}></div>
          <div className={`absolute inset-0 rounded-full border border-[#FFD700]/50 transition-all duration-1000 ${isMining ? 'animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]' : 'opacity-0'}`}></div>
          
          {/* Existing Rings */}
          <div className={`absolute inset-0 rounded-full border-2 border-dashed border-[#FFD700]/30 transition-all duration-1000 ${isMining ? 'animate-[spin_10s_linear_infinite]' : ''}`}></div>
          <div className={`absolute inset-4 rounded-full border border-[#FFD700]/50 transition-all duration-700 ${isMining ? 'bg-[#FFD700]/5 shadow-[0_0_40px_rgba(212,175,55,0.15)] animate-pulse' : ''}`}></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs md:text-sm text-gray-400 font-medium mb-1">{isMining ? "MINING SESSION" : "READY TO MINE"}</p>
            <h2 className="text-4xl md:text-5xl font-black text-[#FFD700] my-2 font-mono tracking-tighter">
              {isMining ? timeLeft : "24:00:00"}
            </h2>
            <p className="text-[10px] md:text-xs text-[#FFD700]/60 tracking-widest uppercase">{isMining ? "Active Engine" : "Engine Standby"}</p>
          </div>
        </div>

        {!isMining ? (
          <button 
            onClick={requestMiningStart}
            className="w-full max-w-sm bg-gradient-to-r from-[#FFD700] to-[#B8860B] text-black font-black py-4 md:py-5 rounded-2xl shadow-[0_10px_40px_rgba(212,175,55,0.3)] text-lg md:text-xl tracking-tighter active:scale-95 transition-all outline-none"
          >
            START EXTRACTION
          </button>
        ) : (
          <button 
            disabled
            className="w-full max-w-sm bg-white/10 text-white/50 font-black py-4 md:py-5 rounded-2xl text-lg md:text-xl tracking-tighter cursor-not-allowed border border-white/5"
          >
            EXTRACTING...
          </button>
        )}
        
        <div className="mt-8 flex space-x-6 sm:space-x-12 w-full justify-center">
          <div className="text-center relative group cursor-help">
            <div className="flex items-center justify-center space-x-1 text-gray-500 text-[10px] uppercase font-bold mb-1 tracking-widest">
              <span>Rate / hr</span>
              <Info className="w-3 h-3 text-gray-400" />
            </div>
            <p className="text-lg md:text-xl font-bold">{formatCurrency((user?.miningRate || 0))} CM</p>

            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 opacity-0 transition-opacity group-hover:opacity-100 z-20">
              <div className="bg-gray-900 border border-white/10 rounded-xl p-4 shadow-2xl text-left">
                <p className="text-xs text-white font-bold mb-1">Mining Rate Formula</p>
                <p className="text-[10px] text-gray-400 mb-2">Base node extraction rate is currently 0.05 CM every 24 hours.</p>
                <p className="text-[10px] text-[#FFD700] mb-1 font-bold">Acceleration Methods:</p>
                <ul className="text-[10px] text-gray-400 list-disc pl-3 space-y-1">
                  <li>Recruit associates to earn +10% of their active yield.</li>
                  <li>Complete auxiliary contracts in the Tasks sector.</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="h-10 w-px bg-white/10"></div>
          <div className="text-center">
            <p className="text-gray-500 text-[10px] uppercase font-bold mb-1 tracking-widest">Daily Yield</p>
            <p className="text-lg md:text-xl font-bold text-[#FFD700]">{(user?.miningRate || 0) * 24} CM</p>
          </div>
        </div>
      </section>

      <div className="lg:col-span-5 flex flex-col space-y-8">
        <section className="bg-gradient-to-br from-gray-900 to-black rounded-[32px] border border-[#FFD700]/20 p-8 flex flex-col justify-between min-h-[220px] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <div className="w-32 h-32 border-4 border-[#FFD700] rounded-full translate-x-16 -translate-y-16"></div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-xs text-[#FFD700] font-bold uppercase tracking-widest">Main Asset Balance</p>
              <span className="px-3 py-1 bg-[#FFD700]/10 text-[#FFD700] rounded-full text-[10px] font-bold border border-[#FFD700]/20 tracking-widest">LIVE</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-4xl md:text-5xl font-black tracking-tighter font-mono">{formatCurrency(currentBalance)} <span className="text-xl md:text-2xl text-[#FFD700] font-sans">CM</span></h3>
              <p className="text-gray-500 font-mono text-lg md:text-xl mt-2">≈ ${(currentBalance * 6.00).toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
            </div>
          </div>
        </section>

         <section className="flex-1 bg-white/5 rounded-[32px] border border-white/10 p-8 flex flex-col min-h-[200px]">
          <h4 className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">Network Stats</h4>
          <div className="grid grid-cols-2 gap-4 h-full">
             <div className="bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center justify-center p-4 text-center">
                <span className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-2">Total Mined</span>
                <span className="text-xl font-bold text-white">{formatCurrency(user.totalMined)} <span className="text-xs text-gray-400">CM</span></span>
             </div>
             <div className="bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center justify-center p-4 text-center">
                <span className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-2">Current Price</span>
                <span className="text-xl font-bold text-[#FFD700]">$6.00</span>
             </div>
             <div className="col-span-2 bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center justify-center p-4 text-center">
                <span className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-2">Total Supply</span>
                <span className="text-xl font-bold text-white">10,000,000 <span className="text-xs text-gray-400">CM</span></span>
             </div>
          </div>
         </section>
      </div>

      <div className="lg:col-span-12 mt-4">
        <AdDisplay type="banner" />
        <BannerAd slot="8492118164" />
      </div>

      {showInterstitial && (
        <InterstitialAd slot="8049721886" onClose={startMining} />
      )}
    </div>
  );
}
