import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../hooks/useAppStore';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { supabase } from '../lib/supabase';
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
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Clock,
  Sparkles,
  Lock,
  Filter
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

  const isKycVerified = user.kycStatus === 'verified' || user.role === 'admin';
  const currentBalance = user.balance || 0;
  const usdtBalance = user.usdtBalance || 0;
  const referralCount = user.referralCount || 0;
  const referralCode = user.referralCode || user.uid?.substring(0, 8).toUpperCase() || 'CMNETWORK';
  const walletAddress = user.walletAddress || `0x${user.uid?.replace(/[^a-fA-F0-9]/g, '').padEnd(40, '7a9c').substring(0, 40)}`;

  // Tab switch
  const handleTabChange = (tab: 'send' | 'receive' | 'history') => {
    setActiveTab(tab);
  };

  // Database & Local CM Transaction History
  const [dbTransactions, setDbTransactions] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  // Fetch transfer logs from Supabase database
  const fetchTransferHistory = useCallback(async () => {
    if (!user?.uid) return;
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .or(`senderUid.eq.${user.uid},receiverUid.eq.${user.uid}`)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (!error && Array.isArray(data)) {
        setDbTransactions(data);
      }
    } catch (err) {
      console.warn('Error fetching transactions from database:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [user?.uid]);

  // Load transactions whenever tab becomes history or user changes
  useEffect(() => {
    fetchTransferHistory();
  }, [fetchTransferHistory, activeTab]);

  // Retrieve cached local transfers
  const localTransactions: any[] = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(`cm_tx_${user.uid}`) || '[]');
    } catch {
      return [];
    }
  }, [user.uid]);

  // Filter exclusively CM token sends and receives, strictly chronological
  const cmTransfers = useMemo(() => {
    const rawList: Array<{
      id: string;
      direction: 'sent' | 'received';
      amount: number;
      asset: string;
      counterparty: string;
      timestamp: number;
      status: string;
      hash: string;
      description?: string;
    }> = [];
    const seenIds = new Set<string>();

    // 1. Process Database transactions
    for (const tx of dbTransactions) {
      const type = (tx.type || '').toLowerCase();
      // Strictly CM transfers: sender or receiver
      const isSend = type === 'transfer_sent' || (type === 'send' && tx.senderUid === user.uid);
      const isReceive = type === 'transfer_received' || (type === 'receive' && tx.receiverUid === user.uid);

      if (!isSend && !isReceive) continue;

      const direction: 'sent' | 'received' = isSend ? 'sent' : 'received';
      const rawAmount = Math.abs(Number(tx.amount || 0));
      if (rawAmount <= 0) continue;

      const id = tx.id || `db_${tx.timestamp}_${direction}_${rawAmount}`;
      if (seenIds.has(id)) continue;
      seenIds.add(id);

      const timestamp = typeof tx.timestamp === 'number'
        ? tx.timestamp
        : new Date(tx.timestamp || tx.created_at || Date.now()).getTime();

      let counterparty = '';
      if (direction === 'sent') {
        counterparty = tx.receiverUid ? `UID: ${tx.receiverUid}` : (tx.description?.replace(/Sent .* to /, '') || 'Recipient');
      } else {
        counterparty = tx.senderUid ? `UID: ${tx.senderUid}` : (tx.description?.replace(/Received .* from /, '') || 'Sender');
      }

      rawList.push({
        id,
        direction,
        amount: rawAmount,
        asset: 'CM',
        counterparty,
        timestamp: isNaN(timestamp) ? Date.now() : timestamp,
        status: tx.status || 'Completed',
        hash: tx.hash || `0x${id.replace(/[^a-fA-F0-9]/g, '').padEnd(32, 'a71b').substring(0, 32)}`,
        description: tx.description
      });
    }

    // 2. Process Local Storage transactions (immediate optimistic update or offline cache)
    for (const tx of localTransactions) {
      const type = (tx.type || '').toLowerCase();
      const isSend = type === 'send' || type === 'transfer_sent';
      const isReceive = type === 'receive' || type === 'transfer_received';

      if (!isSend && !isReceive) continue;
      // Exclude USDT or non-CM
      if (tx.asset && tx.asset !== 'CM') continue;

      const direction: 'sent' | 'received' = isSend ? 'sent' : 'received';
      const rawAmount = Math.abs(Number(tx.amount || 0));
      if (rawAmount <= 0) continue;

      const id = tx.id || `loc_${tx.timestamp}_${direction}_${rawAmount}`;
      if (seenIds.has(id)) continue;
      seenIds.add(id);

      const timestamp = typeof tx.timestamp === 'number'
        ? tx.timestamp
        : new Date(tx.timestamp || Date.now()).getTime();

      rawList.push({
        id,
        direction,
        amount: rawAmount,
        asset: 'CM',
        counterparty: tx.recipient || (direction === 'sent' ? 'Recipient' : 'Sender'),
        timestamp: isNaN(timestamp) ? Date.now() : timestamp,
        status: tx.status || 'Completed',
        hash: tx.hash || `0x${id.replace(/[^a-fA-F0-9]/g, '').padEnd(32, 'a71b').substring(0, 32)}`,
        description: tx.description
      });
    }

    // Sort strictly chronological (most recent first)
    return rawList.sort((a, b) => b.timestamp - a.timestamp);
  }, [dbTransactions, localTransactions, user.uid]);

  // Filtered view
  const filteredTransfers = useMemo(() => {
    if (historyFilter === 'all') return cmTransfers;
    return cmTransfers.filter(t => t.direction === historyFilter);
  }, [cmTransfers, historyFilter]);

  // Aggregate stats for CM transfers
  const totalReceived = useMemo(() => {
    return cmTransfers.filter(t => t.direction === 'received').reduce((sum, t) => sum + t.amount, 0);
  }, [cmTransfers]);

  const totalSent = useMemo(() => {
    return cmTransfers.filter(t => t.direction === 'sent').reduce((sum, t) => sum + t.amount, 0);
  }, [cmTransfers]);

  // Monthly transfer tracking: Maximum 10% of CM balance in one month
  const sentThisMonth = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return cmTransfers
      .filter(t => t.direction === 'sent' && t.timestamp >= startOfMonth)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [cmTransfers]);

  const maxMonthlyAllowed = useMemo(() => {
    return Number((currentBalance * 0.10).toFixed(4));
  }, [currentBalance]);

  const remainingMonthlyQuota = useMemo(() => {
    return Math.max(0, Number((maxMonthlyAllowed - sentThisMonth).toFixed(4)));
  }, [maxMonthlyAllowed, sentThisMonth]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopiedAddress(true);
    toast.success('Wallet address copied!', { icon: '📋' });
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCopyTxHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedTxId(id);
    toast.success('Transaction Hash Copied!', { icon: '📋' });
    setTimeout(() => setCopiedTxId(null), 2000);
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

    if (user.role !== 'admin' && numAmount > remainingMonthlyQuota + 0.0001) {
      if (remainingMonthlyQuota <= 0) {
        toast.error(`Monthly limit reached: You have already sent ${sentThisMonth.toFixed(2)} CM this month (Max 10% limit: ${maxMonthlyAllowed.toFixed(2)} CM).`, {
          icon: '⚠️'
        });
      } else {
        toast.error(`Monthly Transfer Limit: You can only send up to 10% of your CM balance in one month. Remaining quota: ${remainingMonthlyQuota.toFixed(2)} CM!`, {
          icon: '⚠️'
        });
      }
      return;
    }

    setIsSending(true);
    const res = await sendCryptoTransfer(recipient, numAmount, 'CM');
    setIsSending(false);

    if (res.success) {
      confetti({ particleCount: 50, spread: 60 });
      toast.success(res.message, { icon: '🚀' });
      setAmount('');
      setRecipient('');
      fetchTransferHistory();
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
          TAB 1: SEND ASSETS FORM (CM COIN ONLY)
         ========================================================================= */}
      {activeTab === 'send' && (
        <div className="bg-[#11100d] border border-[#FFD700]/30 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-black text-white">Transfer CM Coins</h2>
            <p className="text-xs text-gray-400 mt-0.5">Send CM Coins to any CM Network wallet address, recipient UID, or registered email with instant settlement.</p>
          </div>

          <form onSubmit={handleSendSubmit} className="space-y-4 max-w-xl">
            {/* Asset Selection (CM Coin Only) */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Asset</label>
              <div className="p-3.5 rounded-2xl border border-[#FFD700] bg-[#FFD700]/10 flex items-center justify-between shadow-[0_0_15px_rgba(255,215,0,0.15)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FFD700] to-amber-500 text-black font-black flex items-center justify-center text-xs shadow-md">
                    CM
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block">CM Coin (BEP-20)</span>
                    <span className="text-[10px] text-gray-400">CM Smart Chain</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Available Balance</span>
                  <span className="text-xs font-mono text-[#FFD700] font-black">{formatCurrency(currentBalance)} CM</span>
                </div>
              </div>
            </div>

            {/* Recipient Address */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Recipient Wallet Address, UID, or Email</label>
              <input
                type="text"
                required
                placeholder="0x... or CM User UID / registered email"
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
                    setAmount(remainingMonthlyQuota.toFixed(2));
                  }}
                  className="text-[10px] font-bold text-[#FFD700] hover:underline"
                >
                  Use Monthly Quota ({remainingMonthlyQuota.toFixed(2)} CM)
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
              <div className="text-[11px] text-amber-400 font-medium mt-1.5 space-y-1.5 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                <div className="flex items-center justify-between font-bold">
                  <span>🛡️ Monthly Transfer Policy:</span>
                  <span className="text-white font-mono">Max 10% in 1 Month</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-white/5 font-mono text-[10px]">
                  <div className="bg-white/5 p-1.5 rounded-lg">
                    <span className="text-gray-400 block text-[9px] uppercase">10% Limit</span>
                    <span className="text-white font-bold">{maxMonthlyAllowed.toFixed(2)} CM</span>
                  </div>
                  <div className="bg-white/5 p-1.5 rounded-lg">
                    <span className="text-gray-400 block text-[9px] uppercase">Sent This Mo.</span>
                    <span className="text-amber-300 font-bold">{sentThisMonth.toFixed(2)} CM</span>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-1.5 rounded-lg">
                    <span className="text-emerald-400 block text-[9px] uppercase">Remaining</span>
                    <span className="text-emerald-400 font-bold">{remainingMonthlyQuota.toFixed(2)} CM</span>
                  </div>
                </div>
              </div>
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
              {isSending ? 'Broadcasting Transfer...' : 'Send CM Coins Instantly'}
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
              <span>Official CM Deposit Gateway</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Receive CM Coins</h2>
            <p className="text-xs text-gray-400 mt-1">
              Scan with any Web3 wallet or receive via your CM User UID with zero network fees.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <PremiumReceiveQr walletAddress={walletAddress} />
            
            {/* CM User UID Sharing Card */}
            <div className="max-w-sm mx-auto p-3.5 rounded-2xl bg-black/70 border border-[#FFD700]/30 flex items-center justify-between text-left">
              <div>
                <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest block">
                  Your CM User UID (Fast Receive)
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
                className="ml-2 px-3 py-1.5 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/40 text-[#FFD700] text-[10px] font-bold hover:bg-[#FFD700]/25 transition-all whitespace-nowrap"
              >
                Copy UID
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: DEDICATED CM TOKEN TRANSACTION HISTORY (SENDS & RECEIVES ONLY)
         ========================================================================= */}
      {activeTab === 'history' && (
        <div className="bg-[#11100d] border border-[#FFD700]/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-black uppercase tracking-wider">
                  <Coins className="w-3.5 h-3.5" />
                  CM Token Ledger
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  {cmTransfers.length} {cmTransfers.length === 1 ? 'Transfer' : 'Transfers'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Transaction History
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Real-time chronological database logs of CM token sends and receives.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => fetchTransferHistory()}
                disabled={loadingHistory}
                className="px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#FFD700]/40 text-gray-300 hover:text-[#FFD700] text-xs font-bold transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin text-[#FFD700]' : ''}`} />
                <span>{loadingHistory ? 'Refreshing...' : 'Refresh Logs'}</span>
              </button>
            </div>
          </div>

          {/* Transfer Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Total Received</span>
              </div>
              <p className="text-base sm:text-lg font-black font-mono text-emerald-400">
                +{formatCurrency(totalReceived)} CM
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Total Sent</span>
              </div>
              <p className="text-base sm:text-lg font-black font-mono text-amber-400">
                -{formatCurrency(totalSent)} CM
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                <HistoryIcon className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>Transfers Count</span>
              </div>
              <p className="text-base sm:text-lg font-black font-mono text-white">
                {cmTransfers.length} Transactions
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 border-b border-white/5 pb-3 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setHistoryFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                historyFilter === 'all'
                  ? 'bg-[#FFD700] text-black shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>All Transfers</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                historyFilter === 'all' ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-300'
              }`}>
                {cmTransfers.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setHistoryFilter('received')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                historyFilter === 'received'
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <ArrowDownLeft className="w-3 h-3" />
              <span>Received</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                historyFilter === 'received' ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-300'
              }`}>
                {cmTransfers.filter(t => t.direction === 'received').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setHistoryFilter('sent')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                historyFilter === 'sent'
                  ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <ArrowUpRight className="w-3 h-3" />
              <span>Sent</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                historyFilter === 'sent' ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-300'
              }`}>
                {cmTransfers.filter(t => t.direction === 'sent').length}
              </span>
            </button>
          </div>

          {/* Transaction List */}
          <div className="space-y-3">
            {filteredTransfers.length > 0 ? (
              filteredTransfers.map((tx) => {
                const isSent = tx.direction === 'sent';
                return (
                  <div
                    key={tx.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#FFD700]/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start sm:items-center space-x-3.5 min-w-0 flex-1">
                      {/* Direction Icon */}
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                          isSent
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {isSent ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownLeft className="w-5 h-5" />
                        )}
                      </div>

                      {/* Direction & Counterparty Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-white">
                            {isSent ? 'Sent CM Token' : 'Received CM Token'}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isSent
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {isSent ? 'Outgoing' : 'Incoming'}
                          </span>
                        </div>

                        <p className="text-xs text-gray-300 font-medium truncate mt-0.5">
                          <span className="text-gray-400">{isSent ? 'To: ' : 'From: '}</span>
                          <span className="font-mono text-white font-semibold">
                            {tx.counterparty}
                          </span>
                        </p>

                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {new Date(tx.timestamp).toLocaleString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="font-mono text-gray-400">
                            Tx: {tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 6)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyTxHash(tx.hash, tx.id)}
                            className="text-gray-400 hover:text-[#FFD700] transition-colors p-0.5"
                            title="Copy transaction hash"
                          >
                            {copiedTxId === tx.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Amount & Status */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 shrink-0">
                      <span
                        className={`text-base sm:text-lg font-mono font-black ${
                          isSent ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {isSent ? '-' : '+'}{formatCurrency(tx.amount)} CM
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mt-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Empty State */
              <div className="text-center py-12 px-4 rounded-2xl bg-white/[0.01] border border-dashed border-white/10 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center mx-auto text-[#FFD700]">
                  <Coins className="w-7 h-7" />
                </div>
                <div className="max-w-sm mx-auto space-y-1">
                  <h4 className="text-base font-bold text-white">
                    {historyFilter === 'all'
                      ? 'No CM Token Transfers Found'
                      : `No CM Token ${historyFilter === 'sent' ? 'Sends' : 'Receives'} Found`}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {historyFilter === 'all'
                      ? 'You have not sent or received any CM tokens yet. All transfers are recorded to the database ledger.'
                      : `No ${historyFilter} transfers recorded for your account yet.`}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('send')}
                    className="px-4 py-2 rounded-xl bg-[#FFD700] text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,215,0,0.2)]"
                  >
                    Send CM Token
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('receive')}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/10 active:scale-95 transition-all"
                  >
                    Receive CM Token
                  </button>
                </div>
              </div>
            )}
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
