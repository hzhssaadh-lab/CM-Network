import React, { useState } from 'react';
import { useApp } from '../hooks/useAppStore';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRightLeft, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  Users, 
  Coins, 
  CheckCircle2, 
  ExternalLink,
  PlusCircle,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';
import { CmPriceChart } from '../components/CmPriceChart';

export function P2P() {
  const { user } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const hasNode = user?.nodeStatus === 'approved';

  // Sample orderbook for node operators
  const [orders] = useState([
    { id: 'p2p-101', seller: 'Node_Validator_Alpha', cmAmount: 50, priceUsdt: 5.20, minLimit: 10, maxLimit: 50, payment: 'Binance Pay / USDT' },
    { id: 'p2p-102', seller: 'Genesis_Node_07', cmAmount: 120, priceUsdt: 5.15, minLimit: 20, maxLimit: 120, payment: 'USDT TRC20 / BEP20' },
    { id: 'p2p-103', seller: 'CM_Whale_Node', cmAmount: 300, priceUsdt: 5.25, minLimit: 50, maxLimit: 300, payment: 'USDT / Bank' },
    { id: 'p2p-104', seller: 'CryptoMiner_Node_9', cmAmount: 85, priceUsdt: 5.18, minLimit: 15, maxLimit: 85, payment: 'USDT BEP20' },
  ]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-16 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#17140c] via-[#12110c] to-[#17140c] border border-[#FFD700]/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-black uppercase tracking-wider mb-2">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Decentralized Escrow Marketplace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              CM Peer-to-Peer (P2P) Trading Desk
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
              Direct peer-to-peer cryptocurrency escrow desk to exchange CM Coins and USDT at live community rates.
            </p>
          </div>

          <div className="shrink-0">
            {hasNode ? (
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-black flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Node Operator Verified ✓</span>
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Invited Only (Node Exclusive)</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CM / USDT REAL-TIME PRICE CHART (BOUNDED BETWEEN $2.00 AND $6.00) */}
      <CmPriceChart />

      {/* ACCESS GATE: IF NOT A NODE OPERATOR, SHOW "INVITED ONLY" 3-MONTH NOTICE */}
      {!hasNode ? (
        <div className="bg-gradient-to-b from-[#14120d] via-[#0f0e0a] to-[#0a0a07] border-2 border-amber-500/40 rounded-[32px] p-6 sm:p-12 text-center relative overflow-hidden shadow-[0_15px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(245,158,11,0.15)]">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Golden Shield & Lock Icon */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#2a2212] via-[#1a170d] to-black border-2 border-[#FFD700] flex items-center justify-center text-[#FFD700] mx-auto mb-6 shadow-[0_0_40px_rgba(255,215,0,0.3)]">
            <Lock className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest mb-3">
            <Clock className="w-3.5 h-3.5" />
            <span>3 Months Exclusive Period • Invited Only</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase max-w-xl mx-auto">
            P2P Trading is Currently Invited Only
          </h2>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto mt-4 leading-relaxed font-medium">
            During the first <strong className="text-[#FFD700]">3 months of Phase 2</strong>, P2P Escrow Trading is strictly restricted to verified <strong className="text-white">CM Node Operators</strong> who hold an active node license.
          </p>

          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto mt-2 leading-relaxed">
            All other users must wait for upcoming open updates and remain daily active on the network.
          </p>

          {/* Criteria to unlock Node Card */}
          <div className="max-w-xl mx-auto mt-8 p-6 rounded-2xl bg-black/60 border border-white/10 text-left space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFD700]" />
              <span>How to Unlock P2P Access via Node Operator License</span>
            </h4>
            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#FFD700]/10 text-[#FFD700] flex items-center justify-center font-bold shrink-0 mt-0.5">1</span>
                <p>Have <strong>140+ direct referrals</strong> connected to your referral code.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#FFD700]/10 text-[#FFD700] flex items-center justify-center font-bold shrink-0 mt-0.5">2</span>
                <p>Ensure <strong>all referred users have completed KYC verification</strong>.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#FFD700]/10 text-[#FFD700] flex items-center justify-center font-bold shrink-0 mt-0.5">3</span>
                <p>Apply for Node verification in your <strong>Profile Section</strong> to get instant P2P approval.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => navigate('/profile')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(255,215,0,0.3)] flex items-center justify-center gap-2"
            >
              <span>View Node Criteria in Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/kyc')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Complete Your KYC</span>
            </button>
          </div>

        </div>
      ) : (
        /* P2P DESK FOR APPROVED NODE OPERATORS */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('buy')}
                className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                  activeTab === 'buy' ? 'bg-[#FFD700] text-black shadow-md' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Buy CM Coins
              </button>
              <button
                onClick={() => setActiveTab('sell')}
                className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                  activeTab === 'sell' ? 'bg-[#FFD700] text-black shadow-md' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Sell CM Coins
              </button>
            </div>

            <button
              onClick={() => toast.success('Order placement enabled for Node Operators!', { icon: '⚡' })}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 hover:brightness-110 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New P2P Offer</span>
            </button>
          </div>

          {/* Orders List */}
          <div className="space-y-3">
            {orders.map((order) => (
              <div 
                key={order.id}
                className="p-5 rounded-2xl bg-[#0f0e0c] border border-white/10 hover:border-[#FFD700]/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{order.seller}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                      Node ✓
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Payment Method: <span className="text-gray-200">{order.payment}</span>
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Limit: {order.minLimit} - {order.maxLimit} CM
                  </p>
                </div>

                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">Unit Price</span>
                    <p className="text-lg font-mono font-black text-emerald-400">
                      ${order.priceUsdt.toFixed(2)} <span className="text-xs text-gray-400 font-sans">USDT</span>
                    </p>
                  </div>
                  <button
                    onClick={() => toast.success(`Escrow initialized with ${order.seller}!`, { icon: '🤝' })}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-500 text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 shadow"
                  >
                    {activeTab === 'buy' ? 'Buy CM' : 'Sell CM'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
