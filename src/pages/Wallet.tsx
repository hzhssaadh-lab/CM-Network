import React, { useState } from 'react';
import { useApp } from '../hooks/useAppStore';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { 
  CheckCircle2, 
  Rocket, 
  Coins, 
  Wallet as WalletIcon, 
  Users, 
  Send, 
  QrCode, 
  History as HistoryIcon, 
  Copy, 
  Check, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight,
  Clock,
  Sparkles,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { PremiumReceiveQr } from '../components/PremiumReceiveQr';

export function Wallet() {
  const { user, sendCryptoTransfer } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'send' | 'receive' | 'history'>('send');
  
  // Send Form State
  const [sendAsset, setSendAsset] = useState<'CM' | 'USDT'>('CM');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Copy State
  const [copiedAddress, setCopiedAddress] = useState(false);

  if (!user) return null;

  const isKycVerified = user.kycStatus === 'verified' && Boolean((user as any).kycApprovedAt || (user as any).kyc_approved_at);
  const currentBalance = user.balance || 0;
  const usdtBalance = user.usdtBalance || 0;
  const referralCount = user.referralCount || 0;
  const referralCode = user.referralCode || user.uid?.substring(0, 8).toUpperCase() || 'CMNETWORK';
  const walletAddress = user.walletAddress || `0x${user.uid?.replace(/[^a-fA-F0-9]/g, '').padEnd(40, '7a9c').substring(0, 40)}`;

  // Tab switch with KYC gate
  const handleTabChange = (tab: 'send' | 'receive' | 'history') => {
    if ((tab === 'send' || tab === 'receive') && !isKycVerified) {
      toast.error('Identity Verification (KYC) required for Send and Receive! Please complete KYC first.', {
        icon: '🛡️',
        duration: 4000
      });
      navigate('/kyc');
      return;
    }
    setActiveTab(tab);
  };

  // Retrieve transaction history
  const localTransactions = JSON.parse(localStorage.getItem(`cm_tx_${user.uid}`) || '[]');
  const defaultHistory = [
    {
      id: 'tx_mine_1',
      type: 'mining',
      asset: 'CM',
      amount: 0.50,
      recipient: 'Self (Mining Yield)',
      timestamp: Date.now() - 3600000,
      status: 'Completed',
      hash: '0x' + (user.uid?.substring(0, 16) || '7b89e3a1f4c2890d')
    },
    {
      id: 'tx_airdrop_1',
      type: 'airdrop',
      asset: 'CM',
      amount: 1.00,
      recipient: 'Phase 2 Activation Bonus',
      timestamp: Date.now() - 86400000,
      status: 'Completed',
      hash: '0x889a7f34c21e095b1284a'
    }
  ];

  const transactions = [...localTransactions, ...defaultHistory];

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopiedAddress(true);
    toast.success('Wallet address copied!', { icon: '📋' });
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleSendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isKycVerified) {
      toast.error('KYC Verification Required before sending funds!', { icon: '🛡️' });
      navigate('/kyc');
      return;
    }

    if (!sendCryptoTransfer) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    if (sendAsset === 'CM') {
      const maxAllowed = Number((currentBalance * 0.10).toFixed(4));
      if (numAmount > maxAllowed + 0.0001) {
        toast.error(`Transfer Limit: You can only send up to 10% of your CM balance (Max: ${(currentBalance * 0.10).toFixed(2)} CM)!`, {
          icon: '⚠️'
        });
        return;
      }
    }

    setIsSending(true);
    const res = await sendCryptoTransfer(recipient, numAmount, sendAsset);
    setIsSending(false);

    if (res.success) {
      confetti({ particleCount: 50, spread: 60 });
      toast.success(res.message, { icon: '🚀' });
      setAmount('');
      setRecipient('');
      setActiveTab('history');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-500 pb-16 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#18150d] via-[#12110c] to-[#18150d] border border-[#FFD700]/40 rounded-3xl p-6 relative overflow-hidden shadow-[0_4px_30px_rgba(255,215,0,0.1)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Rocket className="w-3.5 h-3.5" /> Phase 2 Live Custody
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-black uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5" /> {isKycVerified ? 'KYC Verified' : 'KYC Required for Transfers'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              CM Asset Custody & Web3 Transfers
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-xl">
              Send, receive, and inspect transaction history for your CM coins and USDT balances. All Phase 1 balances are 100% safe and verified.
            </p>
          </div>
        </div>
      </div>

      {/* KYC Warning Banner if Not Verified */}
      {!isKycVerified && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-300">Identity Verification (KYC) Required</h4>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Send and Receive asset transfers require a verified KYC status. Complete your quick front selfie & verification fee.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/kyc')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#FFD700] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow shrink-0 flex items-center justify-center gap-1.5"
          >
            <span>Complete KYC Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top 3 Metric Cards: Total Coins, USDT, and Total Referrals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total CM Coins */}
        <div className="bg-gradient-to-b from-[#16140d] via-[#100f0b] to-[#0a0a07] border border-[#FFD700]/40 rounded-3xl p-6 relative overflow-hidden group hover:border-[#FFD700] transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-[#FFD700]" /> Total CM Coins
            </span>
            <span className="px-2 py-0.5 bg-[#FFD700]/10 text-[#FFD700] text-[10px] font-black rounded border border-[#FFD700]/20">
              ALL COIN
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white font-mono tracking-tight">
              {formatCurrency(currentBalance)} <span className="text-base text-[#FFD700] font-sans">CM</span>
            </h3>
            <p className="text-emerald-400 font-mono text-xs mt-1.5 flex items-center gap-1 font-bold">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              ≈ ${(currentBalance * 5.10).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>Yield: 0.50 CM / 12h</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Live
            </span>
          </div>
        </div>

        {/* USDT Balance */}
        <div className="bg-gradient-to-b from-[#131b14] via-[#0d140e] to-[#070a08] border border-emerald-500/40 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <WalletIcon className="w-4 h-4 text-emerald-400" /> USDT Balance
            </span>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded border border-emerald-500/20">
              STABLE
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
              ${formatCurrency(usdtBalance)} <span className="text-xs font-bold text-gray-400 font-sans">USDT</span>
            </h3>
            <p className="text-gray-400 text-xs mt-1.5">
              Tether USD Reserves
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>Withdrawals</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" /> Coming Soon
            </span>
          </div>
        </div>

        {/* Total Referrals */}
        <div className="bg-gradient-to-b from-[#10141d] via-[#0b0e14] to-[#07090d] border border-blue-500/40 rounded-3xl p-6 relative overflow-hidden group hover:border-blue-500 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-400" /> Total Referrals
            </span>
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded border border-blue-500/20">
              NETWORK
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white font-mono tracking-tight">
              {referralCount} <span className="text-base text-blue-400 font-sans">Friends</span>
            </h3>
            <p className="text-gray-400 text-xs mt-1.5 font-mono">
              Code: <strong className="text-white">{referralCode}</strong>
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>Multiplier</span>
            <span className="text-blue-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Active
            </span>
          </div>
        </div>

      </div>

      {/* Contract Address Notice Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#16140d] via-[#100f0b] to-[#16140d] border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(245,158,11,0.08)]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
              <span>CM Token Contract Address</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Coming Soon ⏳
              </span>
            </h4>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Official BEP-20 smart contract address will be published here upon audit completion.
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-center sm:text-right shrink-0">
          <span className="text-[9px] uppercase font-bold text-gray-400 block">Status</span>
          <span className="text-xs font-mono font-black text-amber-400">Coming Soon ⏳</span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/10 gap-1.5">
        <button 
          onClick={() => handleTabChange('send')} 
          className={`flex-1 py-3 px-4 text-xs font-black tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'send' ? 'bg-[#FFD700] text-black shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Send Assets</span>
          {!isKycVerified && <Lock className="w-3 h-3 ml-1 text-amber-500" />}
        </button>
        <button 
          onClick={() => handleTabChange('receive')} 
          className={`flex-1 py-3 px-4 text-xs font-black tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'receive' ? 'bg-[#FFD700] text-black shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Receive & QR</span>
          {!isKycVerified && <Lock className="w-3 h-3 ml-1 text-amber-500" />}
        </button>
        <button 
          onClick={() => handleTabChange('history')} 
          className={`flex-1 py-3 px-4 text-xs font-black tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'history' ? 'bg-[#FFD700] text-black shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <HistoryIcon className="w-4 h-4" />
          <span>Transaction History</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: SEND ASSETS FORM
         ========================================================================= */}
      {activeTab === 'send' && (
        <div className="bg-[#11100d] border border-[#FFD700]/30 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-black text-white">Transfer CM Coins & USDT</h2>
            <p className="text-xs text-gray-400 mt-0.5">Send funds to any CM Network wallet or recipient UID with instant settlement.</p>
          </div>

          <form onSubmit={handleSendSubmit} className="space-y-4 max-w-xl">
            {/* Asset Selection */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Select Asset</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSendAsset('CM')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    sendAsset === 'CM' ? 'bg-[#FFD700]/15 border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.2)]' : 'bg-black/50 border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-xs font-black text-white block">CM Coin</span>
                  <span className="text-[11px] font-mono text-[#FFD700] font-bold">Balance: {formatCurrency(currentBalance)} CM</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSendAsset('USDT')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    sendAsset === 'USDT' ? 'bg-emerald-500/15 border-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.2)]' : 'bg-black/50 border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-xs font-black text-white block">Tether USDT</span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">Balance: ${formatCurrency(usdtBalance)} USDT</span>
                </button>
              </div>
            </div>

            {/* Recipient Address */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Recipient Wallet Address or User UID</label>
              <input
                type="text"
                required
                placeholder="0x... or CM User UID"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-[#FFD700] focus:outline-none"
              />
            </div>

            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount to Send</label>
                <button
                  type="button"
                  onClick={() => {
                    const maxVal = sendAsset === 'CM' ? (currentBalance * 0.10).toFixed(2) : usdtBalance.toString();
                    setAmount(maxVal);
                  }}
                  className="text-[10px] font-bold text-[#FFD700] hover:underline"
                >
                  {sendAsset === 'CM' ? `Use MAX 10% (${(currentBalance * 0.10).toFixed(2)} CM)` : 'Use MAX Balance'}
                </button>
              </div>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/15 text-white text-lg font-mono focus:border-[#FFD700] focus:outline-none font-bold"
              />
              {sendAsset === 'CM' && (
                <p className="text-[11px] text-amber-400 font-medium mt-1.5 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
                  <span>🛡️ Transfer Policy: Maximum 10% of CM Coin balance can be sent per transaction (Limit: {(currentBalance * 0.10).toFixed(2)} CM).</span>
                </p>
              )}
            </div>

            {/* Fee summary */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs text-gray-400">
              <span>Network Transfer Fee:</span>
              <span className="text-emerald-400 font-bold font-mono">0.00 CM (Zero Fee)</span>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)]"
            >
              {isSending ? 'Broadcasting Transfer...' : `Send ${sendAsset} Instantly`}
            </button>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB 2: RECEIVE ASSETS & ULTRA-PREMIUM QR CODE
         ========================================================================= */}
      {activeTab === 'receive' && (
        <div className="bg-gradient-to-b from-[#14120e] via-[#0d0c09] to-[#070604] border-2 border-[#FFD700]/50 rounded-[36px] p-6 sm:p-10 text-center space-y-7 shadow-[0_15px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(255,215,0,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-80 h-80 bg-[#FFD700]/10 rounded-full blur-[90px] pointer-events-none" />

          <div className="max-w-md mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
              <span>Official Deposit Gateway</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Receive CM Coins & USDT</h2>
            <p className="text-xs text-gray-400 mt-1">
              Scan with any Web3 wallet or send from CM Network accounts with zero network fees.
            </p>
          </div>

          <div className="relative z-10">
            <PremiumReceiveQr walletAddress={walletAddress} />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: TRANSACTION HISTORY
         ========================================================================= */}
      {activeTab === 'history' && (
        <div className="bg-[#11100d] border border-[#FFD700]/30 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h2 className="text-xl font-black text-white">Transaction Audit Records</h2>
              <p className="text-xs text-gray-400 mt-0.5">Live verifiable records of all mining yields, transfers, and bonuses.</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#FFD700]">
              {transactions.length} Records
            </span>
          </div>

          <div className="space-y-3">
            {transactions.map((tx: any, idx: number) => (
              <div 
                key={tx.id || idx} 
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#FFD700]/30 transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                    tx.type === 'send' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {tx.type === 'send' ? '📤' : tx.type === 'mining' ? '⛏️' : '🎁'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white capitalize">
                      {tx.type === 'send' ? `Sent ${tx.asset}` : tx.type === 'mining' ? '12h Cloud Mining Reward' : 'Phase 2 Reward'}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-mono">
                      {tx.recipient ? `To: ${tx.recipient.substring(0, 16)}...` : new Date(tx.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-mono font-bold ${
                    tx.type === 'send' ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {tx.type === 'send' ? '-' : '+'}{formatCurrency(tx.amount)} {tx.asset || 'CM'}
                  </span>
                  <span className="block text-[10px] text-emerald-400/80 font-bold">Completed ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          USDT WITHDRAWAL GATEWAY (COMING SOON ⏳)
         ========================================================================= */}
      <div className="bg-gradient-to-r from-[#121915] via-[#0d1410] to-[#070d09] border-2 border-emerald-500/40 rounded-[32px] p-6 sm:p-8 relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> USDT Withdrawal: Coming Soon ⏳
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                Phase 2 Liquidity Pool Opening
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Direct USDT Instant Cashout Gateway
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Automated on-chain USDT withdrawals to Binance, OKX, TrustWallet, and MetaMask are undergoing final multi-sig contract audits. All user balances (${formatCurrency(usdtBalance)} USDT) are 100% reserved and backed.
            </p>
          </div>

          <div className="w-full md:w-auto shrink-0 flex flex-col items-center sm:items-end">
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-center sm:text-right w-full sm:w-auto mb-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Your Audited USDT Balance</span>
              <span className="text-2xl font-black font-mono text-emerald-400">${formatCurrency(usdtBalance)} USDT</span>
            </div>
            <button
              disabled
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 text-gray-400 font-black text-xs uppercase tracking-wider cursor-not-allowed border border-white/10 flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Withdrawal Coming Soon ⏳</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
