import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Gem, 
  Lock, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Flame, 
  ExternalLink, 
  ChevronRight,
  BellRing,
  Layers,
  Cpu,
  Coins
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useApp } from '../hooks/useAppStore';

export function Nfts() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [isWhitelisted, setIsWhitelisted] = useState(() => {
    return localStorage.getItem(`cm_nft_whitelist_${user?.uid || 'guest'}`) === 'true';
  });
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);

  const handleJoinWhitelist = () => {
    if (isWhitelisted) {
      toast('You are already registered for early access NFT minting!', { icon: '✨' });
      return;
    }

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setIsWhitelisted(true);
    localStorage.setItem(`cm_nft_whitelist_${user?.uid || 'guest'}`, 'true');
    toast.success("You're on the exclusive NFT Whitelist! You'll get priority mint access.", {
      duration: 5000,
      icon: '🎉'
    });
  };

  const upcomingCollections = [
    {
      id: 'genesis-node',
      title: 'CM Genesis Node Pass',
      badge: 'Tier 1 Protocol',
      supply: '1,000 Editions',
      network: 'BNB Smart Chain (BEP-721)',
      perks: '+50% Cloud Mining Hashrate, Zero P2P Trading Fees, VIP Governance Rights',
      rarity: 'Legendary',
      color: 'from-amber-500/20 via-yellow-500/10 to-transparent',
      borderColor: 'border-[#FFD700]/40',
      tagColor: 'text-[#FFD700] bg-[#FFD700]/10 border-[#FFD700]/30',
      icon: Cpu,
      gradient: 'from-yellow-400 to-amber-600',
    },
    {
      id: 'cyber-miner',
      title: 'Cyber Miner Pioneer',
      badge: 'Early Adopter',
      supply: '5,000 Editions',
      network: 'Solana (Metaplex)',
      perks: '+25% Daily Hashrate, Exclusive Animated Avatar, 10% Referral Boost',
      rarity: 'Rare',
      color: 'from-purple-500/20 via-indigo-500/10 to-transparent',
      borderColor: 'border-purple-500/40',
      tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      icon: Flame,
      gradient: 'from-purple-400 to-indigo-600',
    },
    {
      id: 'validator-sentinel',
      title: 'Solana Sentinel Key',
      badge: 'Cross-Chain Node',
      supply: '2,500 Editions',
      network: 'Dual Chain (BSC & Solana)',
      perks: 'Auto-claim 24H Mining cycles, Staking APR multiplier, Early Access to CM Token Launch',
      rarity: 'Epic',
      color: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderColor: 'border-emerald-500/40',
      tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      icon: ShieldCheck,
      gradient: 'from-emerald-400 to-teal-600',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header & Navigation Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#FFD700] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FFD700] via-amber-500 to-orange-500 flex items-center justify-center text-black font-black shadow-[0_0_20px_rgba(255,215,0,0.4)]">
              <Gem className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <span>NFT Marketplace</span>
                <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/40 text-purple-300 text-xs font-black uppercase tracking-wider animate-pulse">
                  Coming Soon
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Exclusive Web3 Digital Collectibles & Hashrate Boosters for CM Network Miners.
              </p>
            </div>
          </div>
        </div>

        {/* Whitelist Priority Button */}
        <button
          onClick={handleJoinWhitelist}
          className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 shadow-lg shrink-0 ${
            isWhitelisted
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
              : 'bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] hover:brightness-110 text-black shadow-[0_0_25px_rgba(255,215,0,0.35)]'
          }`}
        >
          {isWhitelisted ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Whitelist Registered ✓</span>
            </>
          ) : (
            <>
              <BellRing className="w-4 h-4 fill-black" />
              <span>Get Priority Whitelist Access</span>
            </>
          )}
        </button>
      </div>

      {/* Hero "COMING SOON" Showcase Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12100a] via-[#0d0d0f] to-[#140f1a] border border-[#FFD700]/30 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#FFD700]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-[#FFD700]/40 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-[#FFD700] animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-xs font-black text-[#FFD700] uppercase tracking-widest">
            Phase 2 Expansion • Web3 Collectibles
          </span>
        </div>

        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            CM Network NFTs <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#FFD700] via-amber-300 to-purple-400 bg-clip-text text-transparent">
              Are Coming Soon!
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-lg mx-auto">
            We are actively integrating smart contract standards for BNB Smart Chain (BEP-721) and Solana (Metaplex). CM Network NFTs will directly boost your cloud mining yields and grant special governance perks.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left pt-2">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-[#FFD700] flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-white">Yield Boosters</h4>
            <p className="text-[11px] text-gray-400">
              Hold exclusive NFTs to permanently increase your 12H mining coin rate.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Coins className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-white">P2P Fee Discounts</h4>
            <p className="text-[11px] text-gray-400">
              Enjoy up to 100% zero gas/platform fees across peer-to-peer trading.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-white">Tier 1 Node Status</h4>
            <p className="text-[11px] text-gray-400">
              Priority validation rights and automatic verification for CM Network nodes.
            </p>
          </div>
        </div>

        {/* Whitelist Call to Action */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleJoinWhitelist}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,215,0,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>{isWhitelisted ? 'You are Whitelisted (Early Access Active)' : 'Join Free Early Mint Whitelist'}</span>
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>

      {/* Sneak Peek: Upcoming NFT Collections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FFD700]" />
              <span>Upcoming NFT Collections (Sneak Peek)</span>
            </h3>
            <p className="text-xs text-gray-400">
              Minting will go live in the upcoming protocol update. Review upcoming utility and specs.
            </p>
          </div>
          <span className="text-xs font-mono text-gray-500">3 Collections Planned</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingCollections.map((col) => {
            const IconComponent = col.icon;
            return (
              <div
                key={col.id}
                onClick={() => {
                  setSelectedPreview(col.title);
                  toast(`"${col.title}" minting opens soon! Keep mining CM Coins.`, {
                    icon: '🚀',
                    duration: 3500
                  });
                }}
                className={`group relative rounded-3xl bg-black/60 border ${col.borderColor} p-6 space-y-4 hover:border-[#FFD700] transition-all hover:scale-[1.02] cursor-pointer overflow-hidden shadow-xl`}
              >
                {/* Background decorative gradient */}
                <div className={`absolute inset-0 bg-gradient-to-b ${col.color} pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity`} />

                {/* Card Header */}
                <div className="flex items-center justify-between relative z-10">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${col.tagColor}`}>
                    {col.badge}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 text-[10px] font-mono text-gray-300">
                    {col.rarity}
                  </span>
                </div>

                {/* NFT Visual Art Placeholder Preview */}
                <div className="relative aspect-square w-full rounded-2xl bg-gradient-to-br from-black via-[#141416] to-[#0a0a0c] border border-white/10 flex flex-col items-center justify-center p-6 text-center space-y-3 overflow-hidden group-hover:border-[#FFD700]/50 transition-colors">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${col.gradient} flex items-center justify-center text-black shadow-2xl group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-10 h-10" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Supply</span>
                    <span className="text-xs font-mono font-black text-white">{col.supply}</span>
                  </div>

                  {/* "Coming Soon" Floating Overlay Tag */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <div className="px-4 py-2 rounded-xl bg-[#FFD700] text-black font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Minting Coming Soon</span>
                    </div>
                  </div>
                </div>

                {/* NFT Details */}
                <div className="space-y-2 relative z-10">
                  <h4 className="text-sm font-black text-white group-hover:text-[#FFD700] transition-colors">
                    {col.title}
                  </h4>
                  <div className="text-[11px] text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Network:</span>
                      <span className="text-gray-200 font-mono font-bold">{col.network}</span>
                    </div>
                    <div className="text-[11px] text-gray-300 pt-1 leading-snug">
                      <strong className="text-[#FFD700]">Utility:</strong> {col.perks}
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 group-hover:bg-[#FFD700]/20 text-white group-hover:text-[#FFD700] font-bold text-xs uppercase tracking-wider border border-white/10 group-hover:border-[#FFD700]/40 transition-all flex items-center justify-center gap-1.5 relative z-10"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Coming Soon • Preview</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
