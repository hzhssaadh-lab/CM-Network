import React, { useState, useRef } from 'react';
import { useApp } from '../hooks/useAppStore';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Camera, 
  Upload, 
  Copy, 
  Check, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  ExternalLink,
  Lock,
  Sparkles,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export function Kyc() {
  const { user, updateUser } = useApp();
  const navigate = useNavigate();

  // Selected fee chain: BNB, ETH, SOL
  const [selectedChain, setSelectedChain] = useState<'BNB' | 'ETH' | 'SOL'>('BNB');
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Front camera selfie capture / upload
  const [selfieData, setSelfieData] = useState<string | null>(user?.kycPhotoUrl || null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Payment proof
  const [proofData, setProofData] = useState<string | null>(user?.kycPaymentProofUrl || null);
  const [txHash, setTxHash] = useState(user?.kycTxHash || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const CHAIN_CONFIG = {
    BNB: {
      name: 'BNB (Binance Smart Chain)',
      fee: '0.00053 BNB',
      address: '0x7CFD255CA3FE95e88BDFdFAb44d12d92F0f2A120',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      qrText: 'BNB Smart Chain (BEP20)'
    },
    ETH: {
      name: 'Ethereum (ERC-20)',
      fee: '0.00001245 ETH',
      address: '0x7CFD255CA3FE95e88BDFdFAb44d12d92F0f2A120',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      qrText: 'Ethereum Mainnet (ERC20)'
    },
    SOL: {
      name: 'Solana (SPL)',
      fee: '0.00041 SOL',
      address: '2z8hTr7ccNH6bq2kyjS9cvH9d8XFMESaWFaD9z5HSr1D',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      qrText: 'Solana Network (SPL)'
    }
  };

  const currentChain = CHAIN_CONFIG[selectedChain];

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(currentChain.address);
    setCopiedAddress(true);
    toast.success(`${selectedChain} payment address copied!`, { icon: '📋' });
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Start front camera webcam
  const startFrontCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      toast.error('Could not access front camera. Please upload a screenshot instead.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelfieData(dataUrl);
      toast.success('Front camera selfie captured! ✓', { icon: '📸' });
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'selfie' | 'proof') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error('File size must be under 8MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (target === 'selfie') {
        setSelfieData(result);
        toast.success('Front camera photo uploaded! ✓');
      } else {
        setProofData(result);
        toast.success('Payment screenshot uploaded! ✓');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selfieData) {
      toast.error('Please capture or upload your front camera selfie!');
      return;
    }
    if (!proofData) {
      toast.error('Please upload your payment screenshot!');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUser({
        kycStatus: 'pending',
        kycSubmittedAt: Date.now(),
        kycPhotoUrl: selfieData,
        kycChain: selectedChain,
        kycPaymentProofUrl: proofData,
        kycTxHash: txHash.trim() || undefined
      });

      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      toast.success('KYC application submitted successfully! Under review.', { icon: '🛡️' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit KYC application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVerified = user?.kycStatus === 'verified' && Boolean((user as any).kycApprovedAt || (user as any).kyc_approved_at);
  const isPending = user?.kycStatus === 'pending' && Boolean(user?.kycSubmittedAt || user?.kycPhotoUrl || (user as any).kyc_submitted_at || (user as any).kyc_photo_url);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#17140c] via-[#12110c] to-[#17140c] border border-[#FFD700]/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-black uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Protocol Identity Verification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              CM Network KYC Verification
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
              Verify your miner identity to unlock Node Operator eligibility, P2P Escrow Trading, and on-chain crypto withdrawals.
            </p>
          </div>

          <div className="shrink-0">
            {isVerified ? (
              <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-black flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>KYC VERIFIED ✓</span>
              </div>
            ) : isPending ? (
              <div className="px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black flex items-center gap-2 animate-pulse">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>UNDER REVIEW ⏳</span>
              </div>
            ) : (
              <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-gray-300 text-xs font-black flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#FFD700]" />
                <span>NOT VERIFIED</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {isVerified ? (
        <div className="bg-[#0f0e0c] border border-emerald-500/30 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Your KYC is Verified!</h2>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Your CM account identity is officially verified on-chain. You now meet the KYC criteria for Node Operator status and full P2P privileges.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-3 rounded-xl bg-[#FFD700] text-black font-black text-xs uppercase tracking-wider hover:brightness-110"
            >
              View Node Status in Profile
            </button>
            <button
              onClick={() => navigate('/p2p')}
              className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/15"
            >
              Check P2P Desk
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmitKyc} className="space-y-6">
          
          {/* STEP 1: FRONT CAMERA PHOTO */}
          <div className="bg-[#0f0e0c] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <span className="w-7 h-7 rounded-full bg-[#FFD700] text-black font-black text-xs flex items-center justify-center">
                1
              </span>
              <div>
                <h3 className="text-lg font-black text-white">
                  Front Camera Selfie Verification
                </h3>
                <p className="text-xs text-gray-400">
                  Open your front camera to take a clear live selfie snapshot, or upload a front camera screenshot.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Camera Preview Area */}
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#FFD700]/30 rounded-2xl p-4 bg-black/40 min-h-[260px] relative overflow-hidden">
                {isCameraActive ? (
                  <div className="w-full flex flex-col items-center">
                    <video 
                      ref={videoRef} 
                      className="w-full max-w-[280px] h-[240px] rounded-2xl object-cover border border-[#FFD700]"
                      playsInline
                    />
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-4 py-2 rounded-xl bg-[#FFD700] text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Take Snapshot</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-2 rounded-xl bg-white/10 text-white text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : selfieData ? (
                  <div className="relative group">
                    <img 
                      src={selfieData} 
                      alt="Front Camera Selfie" 
                      className="w-48 h-48 rounded-2xl object-cover border-2 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                    />
                    <span className="absolute -top-2 -right-2 bg-emerald-500 text-black p-1 rounded-full text-xs font-black">
                      ✓
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelfieData(null)}
                      className="mt-3 block mx-auto text-xs text-gray-400 hover:text-white underline"
                    >
                      Retake Photo
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] mx-auto">
                      <Camera className="w-7 h-7" />
                    </div>
                    <p className="text-xs text-gray-400 max-w-[220px]">
                      Capture front camera face photo with good lighting
                    </p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={startFrontCamera}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-500 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-md"
                >
                  <Camera className="w-4 h-4" />
                  <span>Open Front Camera</span>
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-white/10 w-full" />
                  <span className="bg-[#0f0e0c] px-3 text-[10px] text-gray-500 font-bold uppercase">or upload file</span>
                </div>

                <label className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all">
                  <Upload className="w-4 h-4 text-[#FFD700]" />
                  <span>Upload Front Camera Screenshot</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'selfie')}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* STEP 2: VERIFICATION FEE (BNB / ETH / SOL - NO USDT) */}
          <div className="bg-[#0f0e0c] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <span className="w-7 h-7 rounded-full bg-[#FFD700] text-black font-black text-xs flex items-center justify-center">
                2
              </span>
              <div>
                <h3 className="text-lg font-black text-white">
                  Send Network Verification Fee
                </h3>
                <p className="text-xs text-gray-400">
                  Select BNB, Ethereum, or Solana. <strong className="text-amber-400">USDT is NOT accepted</strong> — only native gas coins.
                </p>
              </div>
            </div>

            {/* Chain Selector Tabs */}
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedChain('BNB')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedChain === 'BNB' 
                    ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                    : 'bg-black/40 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white">BNB Coin</span>
                  {selectedChain === 'BNB' && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                </div>
                <p className="text-sm font-mono font-black text-amber-400 mt-1">0.00053 BNB</p>
                <span className="text-[10px] text-gray-500 block">BEP-20 Chain</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChain('ETH')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedChain === 'ETH' 
                    ? 'bg-blue-500/15 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                    : 'bg-black/40 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white">Ethereum</span>
                  {selectedChain === 'ETH' && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                </div>
                <p className="text-sm font-mono font-black text-blue-400 mt-1">0.00001245 ETH</p>
                <span className="text-[10px] text-gray-500 block">ERC-20 Chain</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChain('SOL')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedChain === 'SOL' 
                    ? 'bg-purple-500/15 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
                    : 'bg-black/40 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white">Solana Coin</span>
                  {selectedChain === 'SOL' && <span className="w-2 h-2 rounded-full bg-purple-400" />}
                </div>
                <p className="text-sm font-mono font-black text-purple-400 mt-1">0.00041 SOL</p>
                <span className="text-[10px] text-gray-500 block">Solana SPL</span>
              </button>
            </div>

            {/* Official Deposit Address Card */}
            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                  Official {selectedChain} Deposit Address
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${currentChain.badgeColor}`}>
                  Fee Amount: {currentChain.fee}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 gap-2">
                <p className="font-mono text-xs sm:text-sm text-[#FFD700] font-bold break-all">
                  {currentChain.address}
                </p>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="px-3 py-1.5 rounded-lg bg-[#FFD700] text-black text-xs font-black flex items-center gap-1 shrink-0 active:scale-95 transition-all"
                >
                  {copiedAddress ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAddress ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Notice: Send exact fee ({currentChain.fee}). Do not send USDT.</span>
              </div>
            </div>
          </div>

          {/* STEP 3: PAYMENT PROOF & TXID */}
          <div className="bg-[#0f0e0c] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <span className="w-7 h-7 rounded-full bg-[#FFD700] text-black font-black text-xs flex items-center justify-center">
                3
              </span>
              <div>
                <h3 className="text-lg font-black text-white">
                  Payment Proof & Screenshot
                </h3>
                <p className="text-xs text-gray-400">
                  Upload screenshot of your transaction and provide the transaction hash / ID.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Screenshot Upload Preview */}
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#FFD700]/30 rounded-2xl p-4 bg-black/40 min-h-[180px]">
                {proofData ? (
                  <div className="relative group text-center">
                    <img 
                      src={proofData} 
                      alt="Payment Screenshot" 
                      className="max-h-40 rounded-xl object-contain border border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => setProofData(null)}
                      className="mt-2 text-xs text-gray-400 hover:text-white underline block mx-auto"
                    >
                      Change Screenshot
                    </button>
                  </div>
                ) : (
                  <label className="text-center cursor-pointer p-4">
                    <Upload className="w-8 h-8 text-[#FFD700] mx-auto mb-2" />
                    <span className="text-xs font-bold text-white block">Upload Payment Screenshot</span>
                    <span className="text-[10px] text-gray-500">PNG, JPG, or WEBP up to 8MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'proof')}
                    />
                  </label>
                )}
              </div>

              {/* TX Hash Input */}
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                    Transaction Hash / TXID (Optional but Recommended)
                  </label>
                  <input
                    type="text"
                    placeholder="0x... or Solana signature"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-[#FFD700] focus:outline-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Selected Asset:</span>
                    <strong className="text-white">{selectedChain}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Verification Fee:</span>
                    <strong className="text-[#FFD700] font-mono">{currentChain.fee}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] text-black font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,215,0,0.35)] flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{isSubmitting ? 'Submitting Application...' : 'Submit KYC Verification'}</span>
          </button>
        </form>
      )}

    </div>
  );
}
