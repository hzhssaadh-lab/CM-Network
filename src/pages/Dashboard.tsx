import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useAppStore';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { 
  CheckCircle2, 
  Rocket, 
  Coins, 
  Wallet, 
  Users, 
  Copy, 
  Check, 
  Flame, 
  Pickaxe, 
  Send, 
  QrCode, 
  History, 
  TrendingUp, 
  Sparkles,
  Share2,
  Clock,
  User as UserIcon,
  Camera,
  Edit2,
  ShieldCheck,
  ArrowRightLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { OFFICIAL_SOCIALS } from '../components/SocialChannels';
import { ReferralFriendsList } from './Friends';
import { NodeSection } from '../components/NodeSection';
import { PremiumReceiveQr } from '../components/PremiumReceiveQr';

const AVATAR_OPTIONS = [
  { id: 'cap', url: 'https://i.pinimg.com/474x/61/4d/9a/614d9a5679cf070455092347cb4ec5e3.jpg', label: 'Cap Miner' },
  { id: 'goggles', url: 'https://i.pinimg.com/474x/7d/1a/3c/7d1a3c05f0376bd67f6bb178b66807d3.jpg', label: 'Cool Goggles' },
  { id: 'panda', url: 'https://i.pinimg.com/474x/92/df/31/92df31b40b1df8e98327d92f97da64c7.jpg', label: 'Panda' },
  { id: 'anime', url: 'https://i.pinimg.com/474x/b8/b6/42/b8b642e557876a9c7ebbb4ff90ff8a7a.jpg', label: 'Anime Star' },
  { id: 'hoodie', url: 'https://i.pinimg.com/474x/cb/09/be/cb09be4d0e657682f9d8ffb2067786bf.jpg', label: 'Black Hoodie' },
  { id: 'astronaut', url: 'https://i.pinimg.com/474x/24/73/80/2473809df6ebdfb19f170e7041a7e283.jpg', label: 'Astronaut' },
  { id: 'shinigami', url: 'https://i.pinimg.com/474x/d5/a2/12/d5a212264bbdc591a27e023f0df682e1.jpg', label: 'Shinigami' },
  { id: 'mask', url: 'https://i.pinimg.com/474x/bf/53/7d/bf537d7a46985012cf19fcf45da7990c.jpg', label: 'Mask Boy' }
];

interface DashboardProps {
  defaultTab?: 'overview' | 'mining' | 'wallet' | 'referrals' | 'profile';
}

export function Dashboard({ defaultTab = 'overview' }: DashboardProps) {
  const { user, updateUser, startMining, claimMiningReward, sendCryptoTransfer } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'mining' | 'wallet' | 'referrals' | 'profile'>(defaultTab);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);

  // Profile editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Mining state
  const [isMiningLoading, setIsMiningLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("12:00:00");
  const [isMiningActive, setIsMiningActive] = useState<boolean>(false);
  const [canClaimReward, setCanClaimReward] = useState<boolean>(false);

  // Wallet Send Modal state
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendAsset, setSendAsset] = useState<'CM' | 'USDT'>('CM');
  const [sendRecipient, setSendRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Wallet Receive Modal state
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  // 12-Hour Mining Timer
  useEffect(() => {
    const updateMiningTimer = () => {
      if (!user?.miningSessionEndTime) {
        setTimeRemaining("12:00:00");
        setIsMiningActive(false);
        setCanClaimReward(false);
        return;
      }

      const diff = user.miningSessionEndTime - Date.now();
      if (diff <= 0) {
        setTimeRemaining("00:00:00");
        setIsMiningActive(false);
        setCanClaimReward(true);
      } else {
        setIsMiningActive(true);
        setCanClaimReward(false);
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeRemaining(
          `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        );
      }
    };

    updateMiningTimer();
    const timer = setInterval(updateMiningTimer, 1000);
    return () => clearInterval(timer);
  }, [user?.miningSessionEndTime]);

  if (!user) return null;

  const currentBalance = user.balance || 0;
  const usdtBalance = user.usdtBalance || 0;
  const referralCount = user.referralCount || 0;
  const referralCode = user.referralCode || user.uid?.substring(0, 8).toUpperCase() || 'CMNETWORK';
  const referralLink = `${window.location.origin}/?ref=${referralCode}`;
  const walletAddress = user.walletAddress || `0x${user.uid?.replace(/[^a-fA-F0-9]/g, '').padEnd(40, '7a9c').substring(0, 40)}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    toast.success('Referral code copied!', { icon: '📋' });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast.success('Invite link copied!', { icon: '🔗' });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopiedWallet(true);
    toast.success('Wallet address copied!', { icon: '📋' });
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const handleStartMining = async () => {
    if (isMiningActive) {
      toast("12-Hour Mining is currently active!", { icon: "⛏️" });
      return;
    }

    setIsMiningLoading(true);
    const res = await startMining();
    setIsMiningLoading(false);

    if (res.success) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success(res.message, { icon: "⛏️" });
    } else {
      toast.error(res.message);
    }
  };

  const handleClaimReward = async () => {
    if (!claimMiningReward) return;
    setIsMiningLoading(true);
    const res = await claimMiningReward();
    setIsMiningLoading(false);

    if (res.success) {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 }
      });
      toast.success(res.message, { icon: "🎉" });
    } else {
      toast.error(res.message);
    }
  };

  const isKycVerified = user.kycStatus === 'verified' || user.role === 'admin';

  const handleOpenSend = () => {
    if (!isKycVerified) {
      toast.error('Identity Verification (KYC) required to Send assets! Please complete KYC first.', {
        icon: '🛡️',
        duration: 4000
      });
      navigate('/kyc');
      return;
    }
    setShowSendModal(true);
  };

  const handleOpenReceive = () => {
    setShowReceiveModal(true);
  };

  const handleSendTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isKycVerified) {
      toast.error('Identity Verification (KYC) required before sending assets!');
      navigate('/kyc');
      return;
    }
    if (!sendCryptoTransfer) return;
    const numAmount = parseFloat(sendAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount!");
      return;
    }

    const maxAllowed = Number((currentBalance * 0.10).toFixed(4));
    if (user.role !== 'admin' && numAmount > maxAllowed + 0.0001) {
      toast.error(`Transfer Limit: You can only send up to 10% of your CM balance (Max: ${(currentBalance * 0.10).toFixed(2)} CM)!`, {
        icon: '⚠️'
      });
      return;
    }

    setIsSending(true);
    const res = await sendCryptoTransfer(sendRecipient, numAmount, 'CM');
    setIsSending(false);

    if (res.success) {
      confetti({ particleCount: 40, spread: 60 });
      toast.success(res.message, { icon: "🚀" });
      setShowSendModal(false);
      setSendAmount('');
      setSendRecipient('');
    } else {
      toast.error(res.message);
    }
  };

  const handleUpdateAvatar = async (url: string) => {
    try {
      setIsSavingProfile(true);
      await updateUser({ avatar: url });
      setShowAvatarPicker(false);
      toast.success('Profile avatar updated!', { icon: '📸' });
    } catch {
      toast.error('Failed to update avatar');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    try {
      setIsSavingProfile(true);
      await updateUser({ name: editedName.trim() });
      setIsEditingName(false);
      toast.success('Profile name updated!', { icon: '✅' });
    } catch {
      toast.error('Failed to update name');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500 w-full max-w-7xl mx-auto pb-12">
      
      {/* =========================================================================
          PHASE 2 LIVE USER DETAILS HEADER CARD
         ========================================================================= */}
      <div className="bg-gradient-to-r from-[#18150d] via-[#12110c] to-[#18150d] border border-[#FFD700]/40 rounded-3xl p-5 sm:p-7 relative overflow-hidden shadow-[0_4px_30px_rgba(255,215,0,0.1)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          {/* User Photo & Info */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name || 'User Profile'} 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#FFD700] shadow-[0_0_25px_rgba(255,215,0,0.3)] bg-black"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#2a2416] to-black border-2 border-[#FFD700] shadow-[0_0_25px_rgba(255,215,0,0.3)] flex items-center justify-center text-[#FFD700] font-black text-2xl">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center text-black text-[10px] font-black">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {user.name || 'CM Miner'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                  <Rocket className="w-3 h-3" /> Phase 2 Live 🚀
                </span>
              </div>
              <p className="text-gray-400 text-xs font-mono">
                {user.email || 'Web3 Account'} • UID: <span className="text-[#FFD700] font-bold">{user.uid?.substring(0, 10)}...</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300 text-[10px] font-bold">
                  Tier: Level {user.level || 1} Pioneer
                </span>
                <span className="px-2 py-0.5 rounded bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-[10px] font-bold">
                  Yield: 0.50 CM / 12h
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
            <button
              onClick={() => setActiveTab('mining')}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)]"
            >
              <Pickaxe className="w-4 h-4" />
              <span>{isMiningActive ? 'Mining Active' : 'Mine (0.5 CM)'}</span>
            </button>
            <button
              onClick={handleOpenSend}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)] border border-violet-400/40 active:scale-95"
            >
              <Send className="w-3.5 h-3.5 text-white" />
              <span>Send</span>
            </button>
            <button
              onClick={handleOpenReceive}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-300 active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5 text-black" />
              <span>Receive</span>
            </button>
            <button
              onClick={() => navigate('/p2p')}
              className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>P2P</span>
            </button>
            <button
              onClick={() => navigate('/kyc')}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>KYC</span>
            </button>
          </div>

        </div>
      </div>

      {/* =========================================================================
          HIGH-VISIBILITY ACTION BAR: MINING, SEND, AND RECEIVE (DISTINCT STYLES & COLORS)
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        {/* Action 1: 12H Cloud Mining (Vibrant Gold/Amber) */}
        <button
          onClick={() => {
            setActiveTab('mining');
            if (!isMiningActive) handleStartMining();
          }}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFA500] text-black font-black text-left relative overflow-hidden group shadow-[0_0_25px_rgba(255,215,0,0.35)] hover:shadow-[0_0_35px_rgba(255,215,0,0.5)] active:scale-[0.98] transition-all border border-amber-300 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-widest font-black uppercase text-black/75 bg-black/10 px-2 py-0.5 rounded">
              0.5 CM / 12H
            </span>
            <span className={`w-2.5 h-2.5 rounded-full ${isMiningActive ? 'bg-emerald-950 animate-ping' : 'bg-black/30'}`} />
          </div>
          <div className="mt-3 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-black text-[#FFD700] flex items-center justify-center shrink-0 shadow-md">
              <Pickaxe className={`w-5 h-5 ${isMiningActive ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-black leading-none">
                {isMiningActive ? 'Mining Active' : 'Start Mining'}
              </h3>
              <p className="text-[11px] font-bold text-black/75 mt-0.5 font-mono">
                {isMiningActive ? timeRemaining : '+0.50 CM Yield'}
              </p>
            </div>
          </div>
        </button>

        {/* Action 2: Send Assets (Electric Violet / Indigo) */}
        <button
          onClick={handleOpenSend}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 text-white font-black text-left relative overflow-hidden group shadow-[0_0_25px_rgba(124,58,237,0.35)] hover:shadow-[0_0_35px_rgba(124,58,237,0.5)] active:scale-[0.98] transition-all border border-violet-400/40 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-widest font-black uppercase text-white/80 bg-white/10 px-2 py-0.5 rounded">
              P2P & Web3
            </span>
            <span className="text-[10px] font-mono text-purple-200">Zero Fee</span>
          </div>
          <div className="mt-3 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white text-indigo-700 flex items-center justify-center shrink-0 shadow-md">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-white leading-none">
                Send Coins
              </h3>
              <p className="text-[11px] font-medium text-purple-100 mt-0.5">
                Instant Transfer to UID / Wallet
              </p>
            </div>
          </div>
        </button>

        {/* Action 3: Receive & QR Code (Neon Emerald / Teal) */}
        <button
          onClick={handleOpenReceive}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-black font-black text-left relative overflow-hidden group shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-all border border-emerald-300 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-widest font-black uppercase text-black/75 bg-black/10 px-2 py-0.5 rounded">
              Deposit & QR
            </span>
            <span className="text-[10px] font-mono text-black/80 font-bold">BEP-20</span>
          </div>
          <div className="mt-3 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-black text-emerald-400 flex items-center justify-center shrink-0 shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-black leading-none">
                Receive & QR
              </h3>
              <p className="text-[11px] font-bold text-black/75 mt-0.5">
                Deposit CM & USDT Assets
              </p>
            </div>
          </div>
        </button>

      </div>

      {/* =========================================================================
          TOP STATS CARDS: TOTAL CM COINS, USDT BALANCE, AND TOTAL REFERRALS
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Total CM Coins */}
        <div className="bg-gradient-to-b from-[#16140d] via-[#100f0b] to-[#0a0a07] border border-[#FFD700]/40 rounded-3xl p-6 relative overflow-hidden group hover:border-[#FFD700] transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-[#FFD700]" /> Total CM Coins
            </span>
            <span className="px-2.5 py-0.5 bg-[#FFD700]/10 text-[#FFD700] text-[10px] font-black rounded-md border border-[#FFD700]/30 tracking-wider">
              ALL COIN
            </span>
          </div>
          <div>
            <h3 className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              {formatCurrency(currentBalance)} <span className="text-lg text-[#FFD700] font-sans">CM</span>
            </h3>
            <p className="text-emerald-400 font-mono text-sm mt-1.5 flex items-center gap-1 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              ≈ ${(currentBalance * 5.10).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>Rate: 12h = 0.50 CM</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Live & Protected
            </span>
          </div>
        </div>

        {/* Card 2: USDT Balance */}
        <div className="bg-gradient-to-b from-[#131b14] via-[#0d140e] to-[#070a08] border border-emerald-500/40 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" /> USDT Balance
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-md border border-emerald-500/30 tracking-wider">
              STABLE
            </span>
          </div>
          <div>
            <h3 className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
              ${formatCurrency(usdtBalance)} <span className="text-sm font-bold text-gray-400 font-sans">USDT</span>
            </h3>
            <p className="text-gray-400 text-xs mt-1.5 font-medium">
              Available Tether Assets
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>Instant P2P Transfer</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Active
            </span>
          </div>
        </div>

        {/* Card 3: Total Referrals */}
        <div className="bg-gradient-to-b from-[#10141d] via-[#0b0e14] to-[#07090d] border border-blue-500/40 rounded-3xl p-6 relative overflow-hidden group hover:border-blue-500 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-400" /> Total Referrals
            </span>
            <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-md border border-blue-500/30 tracking-wider">
              NETWORK
            </span>
          </div>
          <div>
            <h3 className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              {referralCount} <span className="text-lg text-blue-400 font-sans">Friends</span>
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-gray-400 text-xs">Code:</span>
              <button 
                onClick={handleCopyCode}
                className="text-white text-xs font-mono font-bold bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg border border-white/15 flex items-center gap-1 transition-all"
              >
                <span>{referralCode}</span>
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
              </button>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>Network Rewards</span>
            <span className="text-blue-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Synced
            </span>
          </div>
        </div>

      </div>

      {/* =========================================================================
          SECTION TABS (OVERVIEW / ALL SECTIONS, MINING, WALLET, REFERRALS, PROFILE)
         ========================================================================= */}
      <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar gap-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 min-w-max ${
            activeTab === 'overview' ? 'bg-[#FFD700] text-black shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All Sections (Live Phase 2)</span>
        </button>
        <button
          onClick={() => setActiveTab('mining')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 min-w-max ${
            activeTab === 'mining' ? 'bg-[#FFD700] text-black shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Pickaxe className="w-3.5 h-3.5" />
          <span>12h Mining Engine</span>
          {isMiningActive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 min-w-max ${
            activeTab === 'wallet' ? 'bg-[#FFD700] text-black shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Wallet & Transfers</span>
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 min-w-max ${
            activeTab === 'referrals' ? 'bg-[#FFD700] text-black shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Referral Program</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 min-w-max ${
            activeTab === 'profile' ? 'bg-[#FFD700] text-black shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>Profile & Security</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: 12-HOUR MINING ENGINE SECTION (0.5 CM COIN IN 12 HOURS)
         ========================================================================= */}
      {(activeTab === 'overview' || activeTab === 'mining') && (
        <section className="bg-gradient-to-b from-[#1a170f] via-[#12110c] to-[#0a0a07] border-2 border-[#FFD700]/50 rounded-[32px] p-6 sm:p-10 relative overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(255,215,0,0.12)]">
          <div className="absolute top-0 right-1/3 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Visual 3D Mining Reactor Graphics */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-4">
                {/* Outer spinning gold ring */}
                <div className={`absolute inset-0 rounded-full border-2 border-[#FFD700]/30 ${isMiningActive ? 'animate-spin' : ''}`} style={{ animationDuration: '16s' }} />
                <div className={`absolute inset-3 rounded-full border border-dashed border-[#FFD700]/50 ${isMiningActive ? 'animate-spin' : ''}`} style={{ animationDirection: 'reverse', animationDuration: '24s' }} />
                
                {/* Glowing Core */}
                <div className="absolute inset-6 rounded-full bg-gradient-to-br from-[#2b2414] via-[#16140d] to-black border-2 border-[#FFD700]/60 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(255,215,0,0.25)]">
                  <Pickaxe className={`w-12 h-12 text-[#FFD700] mb-2 ${isMiningActive ? 'animate-bounce drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]' : ''}`} />
                  <span className="text-[10px] font-black tracking-widest text-[#FFD700] uppercase">
                    {isMiningActive ? 'MINING LIVE' : canClaimReward ? 'REWARD READY' : '12H ENGINE'}
                  </span>
                  <span className="text-xs font-mono font-black text-white mt-0.5">
                    +0.50 CM
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-[#FFD700]/40 shadow-sm">
                <span className={`w-2.5 h-2.5 rounded-full ${isMiningActive ? 'bg-emerald-400 animate-ping' : canClaimReward ? 'bg-amber-400 animate-pulse' : 'bg-gray-500'}`} />
                <span className="text-xs font-black text-white uppercase tracking-wider font-mono">
                  {isMiningActive ? `Active: ${timeRemaining}` : canClaimReward ? 'Session Complete (0.5 CM)' : 'Session Idle'}
                </span>
              </div>
            </div>

            {/* Mining Details and Start / Claim Controls */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5" />
                <span>Official Phase 2 Cloud Mining</span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Mine 0.50 CM Coins Every 12 Hours
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mt-1 font-medium">
                  Automated cloud mining node activated for Phase 2. Each 12-hour mining cycle credits 0.5 CM coins directly into your verified account balance without battery or hardware drain.
                </p>
              </div>

              {/* 3 Mining Engine Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-black/50 border border-white/10">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Session Duration</span>
                  <p className="text-sm font-black text-white font-mono mt-0.5">12 Hours</p>
                </div>
                <div className="p-3 rounded-2xl bg-black/50 border border-white/10">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Reward / Session</span>
                  <p className="text-sm font-black text-[#FFD700] font-mono mt-0.5">0.50 CM</p>
                </div>
                <div className="p-3 rounded-2xl bg-black/50 border border-white/10">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Cloud Hashrate</span>
                  <p className="text-sm font-black text-emerald-400 font-mono mt-0.5">12.5 MH/s</p>
                </div>
              </div>

              {/* Action Buttons: Start or Claim */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                {canClaimReward ? (
                  <button
                    onClick={handleClaimReward}
                    disabled={isMiningLoading}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-600 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(52,211,153,0.4)]"
                  >
                    <Coins className="w-5 h-5" />
                    <span>Claim 0.50 CM Coins Now!</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartMining}
                    disabled={isMiningLoading || isMiningActive}
                    className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      isMiningActive 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 cursor-default shadow-sm'
                        : 'bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] text-black hover:brightness-110 active:scale-95 shadow-[0_0_25px_rgba(255,215,0,0.35)]'
                    }`}
                  >
                    <Pickaxe className={`w-5 h-5 ${isMiningActive ? 'animate-bounce' : ''}`} />
                    <span>
                      {isMiningLoading ? 'Processing Node...' : isMiningActive ? `Mining In Progress (${timeRemaining})` : 'Start 12-Hour Mining (0.5 CM)'}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => navigate('/tasks')}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Boost Yield in Tasks
                </button>
              </div>

            </div>

          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 3: WALLET SECTION (SEND, RECEIVE, AND HISTORY)
         ========================================================================= */}
      {(activeTab === 'overview' || activeTab === 'wallet') && (
        <section className="bg-[#0f0e0c] border border-[#FFD700]/30 rounded-[32px] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#FFD700]">
                WEB3 ASSET CUSTODY
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                CM Network Wallet & Transfers
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Manage your CM coins, USDT funds, on-chain transfers, and audit records.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenSend}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(124,58,237,0.3)] border border-violet-400/40 active:scale-95 hover:brightness-110"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
              <button
                onClick={handleOpenReceive}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-300 active:scale-95 hover:brightness-110"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Receive</span>
              </button>
            </div>
          </div>

          {/* Wallet Address Bar */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Your Deposit Address</span>
              <p className="text-xs sm:text-sm font-mono text-[#FFD700] font-bold break-all mt-0.5">
                {walletAddress}
              </p>
            </div>
            <button
              onClick={handleCopyWallet}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-gray-300 font-bold flex items-center gap-1.5 transition-all shrink-0"
            >
              {copiedWallet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedWallet ? 'Copied' : 'Copy Address'}</span>
            </button>
          </div>

          {/* Transaction History Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[#FFD700]" />
                <span>Transaction & Mining History</span>
              </h3>
              <span className="text-xs text-gray-400 font-mono">Real-time ledger</span>
            </div>

            <div className="space-y-2.5">
              
              {/* Item 1: Active Mining Reward */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:border-[#FFD700]/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 text-[#FFD700] flex items-center justify-center font-black">
                    ⛏️
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">12-Hour Cloud Mining Reward</h4>
                    <p className="text-[10px] text-gray-400">Yield Cycle: 0.50 CM Coins</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-emerald-400">+0.50 CM</span>
                  <span className="block text-[10px] text-emerald-400/80 font-bold">Completed ✓</span>
                </div>
              </div>

              {/* Item 2: Phase 2 Early Supporter Bonus */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:border-[#FFD700]/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black">
                    🎁
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Phase 2 Activation Airdrop</h4>
                    <p className="text-[10px] text-gray-400">Community Pioneer Allocation</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-[#FFD700]">+1.00 CM</span>
                  <span className="block text-[10px] text-emerald-400/80 font-bold">Completed ✓</span>
                </div>
              </div>

              {/* Item 3: Referral Network Yield */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:border-[#FFD700]/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-black">
                    👥
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Referral Network Node Share</h4>
                    <p className="text-[10px] text-gray-400">Network Tier Bonus</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-blue-400">Synced</span>
                  <span className="block text-[10px] text-gray-400">{referralCount} Friends</span>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 4: REFERRAL SECTION (TOTAL REFERRALS & INVITE LINKS)
         ========================================================================= */}
      {(activeTab === 'overview' || activeTab === 'referrals') && (
        <section className="bg-[#0f0e0c] border border-blue-500/30 rounded-[32px] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-blue-400">
                GROW THE NETWORK
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                Referral Program & Friends Network
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Invite friends to CM Network to earn passive multipliers and extra CM tokens.
              </p>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-black font-mono">
              Total Referrals: {referralCount}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Referral Code Card */}
            <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Your Referral Code</span>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="font-mono font-black text-white text-base tracking-wider">{referralCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-[#FFD700] text-black text-xs font-black flex items-center gap-1 active:scale-95"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Invite Link Card */}
            <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Your Direct Invite Link</span>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="font-mono text-gray-300 text-xs truncate max-w-[200px]">{referralLink}</span>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-black flex items-center gap-1 active:scale-95"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Share'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real-Time Invited Friends & KYC Status Table */}
          <div className="pt-2">
            <ReferralFriendsList 
              userUid={user.uid} 
              userCode={referralCode} 
              expectedCount={referralCount || 0}
              userEmail={user.email || ''}
            />
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 5: PROFILE SECTION (WITH ALL PHASE 1 PROFILE FEATURES)
         ========================================================================= */}
      {(activeTab === 'overview' || activeTab === 'profile') && (
        <section className="bg-[#0f0e0c] border border-[#FFD700]/30 rounded-[32px] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-16 h-16 rounded-2xl object-cover border-2 border-[#FFD700] bg-black" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#FFD700]/10 border-2 border-[#FFD700] flex items-center justify-center text-[#FFD700] font-black text-2xl">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <button
                  onClick={() => setShowAvatarPicker(true)}
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-[#FFD700] text-black hover:brightness-110 shadow-md transition-all"
                  title="Change Avatar"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  {isEditingName ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-black/80 border border-[#FFD700] text-white text-sm font-bold focus:outline-none"
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={isSavingProfile}
                        className="p-1.5 rounded-lg bg-[#FFD700] text-black font-black text-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-black text-white">{user.name || 'CM Network Member'}</h2>
                      <button
                        onClick={() => {
                          setEditedName(user.name || '');
                          setIsEditingName(true);
                        }}
                        className="text-gray-400 hover:text-[#FFD700] p-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{user.email || 'Web3 Authenticated'}</p>
                <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3" /> KYC: Tier 1 Verified ✓
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowAvatarPicker(true)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Camera className="w-3.5 h-3.5 text-[#FFD700]" />
              <span>Change Photo Avatar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10">
              <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Account Role</span>
              <p className="text-sm font-bold text-white capitalize">{user.role || 'Verified Member'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10">
              <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Total CM Coins</span>
              <p className="text-sm font-mono font-bold text-[#FFD700]">{formatCurrency(currentBalance)} CM</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10">
              <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">USDT Balance</span>
              <p className="text-sm font-mono font-bold text-emerald-400">${formatCurrency(usdtBalance)} USDT</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10">
              <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Total Referrals</span>
              <p className="text-sm font-mono font-bold text-blue-400">{referralCount} Friends</p>
            </div>
          </div>

          {/* KYC Status & Action Banner */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isKycVerified ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                (user.kycStatus === 'pending' && (user.kycSubmittedAt || user.kycPhotoUrl)) ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                'bg-white/5 text-gray-400 border border-white/10'
              }`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Identity Verification (KYC)</span>
                  {isKycVerified ? (
                    <span className="text-[10px] text-emerald-400 font-bold">Verified ✓</span>
                  ) : (user.kycStatus === 'pending' && (user.kycSubmittedAt || user.kycPhotoUrl)) ? (
                    <span className="text-[10px] text-amber-400 font-bold">Pending Review ⏳</span>
                  ) : (
                    <span className="text-[10px] text-gray-400 font-bold">Not Verified</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">
                  {isKycVerified 
                    ? 'Verified miner profile. Node & P2P eligible.' 
                    : 'Front camera selfie & BNB/ETH/SOL network verification fee.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/kyc')}
              className="px-4 py-2 rounded-xl bg-[#FFD700] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow shrink-0"
            >
              {isKycVerified ? 'View KYC' : 'Verify KYC'}
            </button>
          </div>

          {/* Node Operator Program Section */}
          <div className="pt-2">
            <NodeSection />
          </div>

          {/* Social Channels in Profile */}
          <div className="pt-4 border-t border-white/5">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
              Official CM Support & Community Channels
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {OFFICIAL_SOCIALS.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#FFD700]/50 flex items-center space-x-3 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0" style={{ color: social.brandColor }}>
                    {social.icon}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{social.name}</h5>
                    <p className="text-[10px] text-gray-400">{social.actionText}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          SEND MODAL
         ========================================================================= */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#14120e] border border-[#FFD700]/50 rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(255,215,0,0.2)]">
            <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFD700]/10 text-[#FFD700] flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black text-white">Send CM Coins</h3>
              </div>
              <button 
                onClick={() => setShowSendModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendTransaction} className="space-y-4">
              {/* Asset (CM Coin Only) */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Asset</label>
                <div className="p-3 rounded-xl border border-[#FFD700] bg-[#FFD700]/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FFD700] to-amber-500 text-black font-black flex items-center justify-center text-[10px]">
                      CM
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block">CM Coin (BEP-20)</span>
                      <span className="text-[9px] text-gray-400">CM Smart Chain</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-gray-400 block uppercase font-bold">Balance</span>
                    <span className="text-xs font-mono text-[#FFD700] font-black">{formatCurrency(currentBalance)} CM</span>
                  </div>
                </div>
              </div>

              {/* Recipient Address */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Recipient Address / UID / Email</label>
                <input
                  type="text"
                  required
                  placeholder="0x... or CM User UID / registered email"
                  value={sendRecipient}
                  onChange={(e) => setSendRecipient(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-[#FFD700] focus:outline-none"
                />
              </div>

              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount</label>
                  <button
                    type="button"
                    onClick={() => {
                      const maxVal = (currentBalance * 0.10).toFixed(2);
                      setSendAmount(maxVal);
                    }}
                    className="text-[10px] font-bold text-[#FFD700] hover:underline"
                  >
                    Use MAX 10% ({(currentBalance * 0.10).toFixed(2)} CM)
                  </button>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-base font-mono focus:border-[#FFD700] focus:outline-none font-bold"
                />
                <p className="text-[10px] text-amber-400 font-medium mt-1.5 flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg">
                  <span>🛡️ Limit: You can send a maximum of 10% of your CM balance ({(currentBalance * 0.10).toFixed(2)} CM).</span>
                </p>
              </div>

              {/* Fee notice */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs text-gray-400">
                <span>Estimated Network Fee:</span>
                <span className="text-emerald-400 font-bold font-mono">0.00 CM (Free)</span>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-500 text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)]"
              >
                {isSending ? 'Broadcasting...' : 'Confirm & Send CM Coins'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          RECEIVE MODAL (CM COIN ONLY)
         ========================================================================= */}
      {showReceiveModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#14120e] border border-[#FFD700]/50 rounded-3xl p-6 sm:p-8 max-w-sm w-full relative shadow-[0_0_50px_rgba(255,215,0,0.2)] text-center">
            <button 
              onClick={() => setShowReceiveModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1"
            >
              ✕
            </button>

            <h3 className="text-xl font-black text-white mb-1">Receive CM Coins</h3>
            <p className="text-xs text-gray-400 mb-4">
              Scan or copy your personal deposit address or User UID
            </p>

            <PremiumReceiveQr walletAddress={walletAddress} />

            {/* CM User UID Quick Copy */}
            <div className="mt-4 p-3 rounded-xl bg-black/70 border border-[#FFD700]/30 flex items-center justify-between text-left">
              <div>
                <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest block">
                  Your CM User UID
                </span>
                <span className="text-xs font-mono text-white font-bold break-all">
                  {user.uid}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(user.uid);
                  toast.success('User UID copied!', { icon: '📋' });
                }}
                className="ml-2 px-2.5 py-1 rounded-lg bg-[#FFD700]/15 border border-[#FFD700]/30 text-[#FFD700] text-[10px] font-bold hover:bg-[#FFD700]/25 transition-all whitespace-nowrap"
              >
                Copy UID
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          AVATAR PICKER MODAL
         ========================================================================= */}
      {showAvatarPicker && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#14120e] border border-[#FFD700]/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-[0_0_50px_rgba(255,215,0,0.2)]">
            <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFD700]/10 text-[#FFD700] flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black text-white">Choose Profile Avatar</h3>
              </div>
              <button 
                onClick={() => setShowAvatarPicker(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              Select an official Phase 2 avatar badge to represent your miner profile across the CM Network.
            </p>

            <div className="grid grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1">
              {AVATAR_OPTIONS.map((avatar) => {
                const isSelected = user.avatar === avatar.url;
                return (
                  <button
                    key={avatar.id}
                    onClick={() => handleUpdateAvatar(avatar.url)}
                    disabled={isSavingProfile}
                    className={`relative p-1.5 rounded-2xl border transition-all flex flex-col items-center group ${
                      isSelected 
                        ? 'border-[#FFD700] bg-[#FFD700]/10 shadow-[0_0_15px_rgba(255,215,0,0.3)]' 
                        : 'border-white/10 hover:border-[#FFD700]/50 bg-black/40'
                    }`}
                  >
                    <img 
                      src={avatar.url} 
                      alt={avatar.label} 
                      className="w-16 h-16 rounded-xl object-cover mb-1 group-hover:scale-105 transition-transform" 
                    />
                    <span className="text-[10px] text-gray-300 font-bold truncate max-w-full">
                      {avatar.label}
                    </span>
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#FFD700] text-black text-[9px] font-black flex items-center justify-center shadow">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/15"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
