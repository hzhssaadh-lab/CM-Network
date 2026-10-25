import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../hooks/useAppStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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
  CheckCircle2,
  Eye,
  X,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export function Kyc() {
  const { user, updateUser } = useApp();
  const navigate = useNavigate();

  // Selected fee chain: BNB, ETH, SOL
  const [selectedChain, setSelectedChain] = useState<'BNB' | 'ETH' | 'SOL'>('SOL');
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

  // Image zoom modal for submitted proofs
  const [zoomImage, setZoomImage] = useState<{ url: string; title: string } | null>(null);

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
      fee: '0.004 SOL',
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
      const now = Date.now();
      const userUid = user?.uid || (user as any)?.UID || 'miner_' + now;

      const kycData = {
        kycStatus: 'pending' as const,
        kycSubmittedAt: now,
        kycPhotoUrl: selfieData,
        kycChain: selectedChain,
        kycPaymentProofUrl: proofData,
        kycTxHash: txHash.trim() || undefined
      };

      const submissionRecord = {
        userId: userUid,
        userEmail: user?.email || '',
        userName: user?.name || '',
        ...kycData,
        status: 'pending'
      };

      // 1. Save directly to settings table in Supabase so Admin can immediately view it
      try {
        await supabase.from('settings').upsert({
          id: `kyc_${userUid}`,
          adsterraSnippet: JSON.stringify(submissionRecord)
        });
      } catch (dbErr) {
        console.warn("Settings upsert notice:", dbErr);
      }

      // 2. Save in localStorage for immediate client-side instant access
      localStorage.setItem(`cm_kyc_submission_${userUid}`, JSON.stringify(submissionRecord));

      // 3. Update application state & user record
      await updateUser(kycData);

      confetti({ particleCount: 75, spread: 75, origin: { y: 0.6 } });
      toast.success('KYC application submitted! 24-Hour Review has started.', { icon: '🛡️', duration: 4000 });
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to submit KYC application: ' + (err?.message || 'Please retry.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVerified = (user?.kycStatus === 'verified' || (user as any)?.kycstatus === 'verified');
  const isPending = !isVerified && Boolean(
    user?.kycStatus === 'pending' || 
    (user as any)?.kycstatus === 'pending' || 
    user?.kycSubmittedAt || 
    user?.kycPhotoUrl || 
    user?.kycPaymentProofUrl
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-500">
      
      {/* Proof Zoom Modal */}
      {zoomImage && (
        <div 
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl w-full bg-[#12110c] border border-white/20 rounded-3xl p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h4 className="text-sm font-bold text-white">{zoomImage.title}</h4>
              <button 
                onClick={() => setZoomImage(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img src={zoomImage.url} alt={zoomImage.title} className="max-h-[75vh] w-full object-contain rounded-2xl mx-auto" />
          </div>
        </div>
      )}

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
              <div className="px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black flex items-center gap-2 animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>24 HOURS REVIEW ⏳</span>
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

      {/* STATE 1: OFFICIALLY VERIFIED */}
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
      ) : isPending ? (

        /* STATE 2: 24-HOUR KYC REVIEW SCREEN (REQUESTED BY USER) */
        <div className="space-y-6">
          
          {/* Main 24-Hour Review Hero Card */}
          <div className="bg-gradient-to-b from-[#18150c] via-[#100f0b] to-[#0a0a07] border-2 border-amber-500/50 rounded-[32px] p-6 sm:p-10 text-center relative overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(245,158,11,0.15)]">
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              
              <div className="w-20 h-20 rounded-3xl bg-amber-500/15 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-pulse">
                <Clock className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase tracking-widest mb-2">
                  <Clock className="w-3.5 h-3.5" /> 24 Hours Review Active
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  KYC Under Verification (24 Hours)
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
                  Your KYC verification request and payment proof have been successfully received and submitted to the CM Network Compliance Team. Reviews are processed within <strong className="text-amber-400">24 hours</strong>.
                </p>
              </div>

              {/* 24-Hour Review Notice Bar */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-left flex items-start gap-3">
                <Info className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-200">What happens next?</p>
                  <p className="text-[11px] text-amber-300/80 mt-0.5">
                    Our compliance administrators verify your live front camera selfie against your blockchain fee transaction. Once approved, your account receives full verified status, and Node Operator eligibility is unlocked.
                  </p>
                </div>
              </div>

            </div>

            {/* 4-Step Verification Timeline */}
            <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4 text-left">
                Verification Progress Status
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-left">
                
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Step 1: Submitted</span>
                  </div>
                  <p className="text-[11px] text-gray-300 font-medium">Selfie & Proof Received</p>
                  <span className="text-[9px] text-emerald-400/80 font-mono">Completed ✓</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 animate-pulse">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Step 2: Biometric</span>
                  </div>
                  <p className="text-[11px] text-gray-300 font-medium">Front Camera Match</p>
                  <span className="text-[9px] text-amber-400 font-mono">In Progress ⏳</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Step 3: Gas Fee</span>
                  </div>
                  <p className="text-[11px] text-gray-300 font-medium">On-Chain Ledger Check</p>
                  <span className="text-[9px] text-amber-400 font-mono">In Progress ⏳</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 opacity-70">
                  <div className="flex items-center gap-1.5 text-gray-400 font-bold text-xs mb-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Step 4: Grant Status</span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium">P2P & Node Unlocked</p>
                  <span className="text-[9px] text-gray-500 font-mono">Within 24 Hours</span>
                </div>

              </div>
            </div>

          </div>

          {/* Submitted Application Details Card */}
          <div className="bg-[#0f0e0c] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Your Submitted Application Proofs</span>
              </h3>
              <span className="text-[10px] font-mono text-gray-400">
                Submitted: {user?.kycSubmittedAt ? new Date(user.kycSubmittedAt).toLocaleDateString() : 'Today'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Selfie Thumbnail */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  1. Front Camera Selfie
                </span>
                {user?.kycPhotoUrl ? (
                  <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/80 aspect-video flex items-center justify-center">
                    <img 
                      src={user.kycPhotoUrl} 
                      alt="Front Camera Selfie" 
                      className="max-h-full max-w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setZoomImage({ url: user.kycPhotoUrl!, title: "Front Camera Selfie" })}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white text-xs font-bold transition-opacity"
                    >
                      <Eye className="w-4 h-4 text-[#FFD700]" />
                      <span>Click to Enlarge</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 text-xs text-gray-500 font-mono text-center">Selfie saved</div>
                )}
              </div>

              {/* Payment Proof Thumbnail */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  2. Blockchain Fee Screenshot
                </span>
                {user?.kycPaymentProofUrl ? (
                  <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/80 aspect-video flex items-center justify-center">
                    <img 
                      src={user.kycPaymentProofUrl} 
                      alt="Payment Proof Screenshot" 
                      className="max-h-full max-w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setZoomImage({ url: user.kycPaymentProofUrl!, title: "Payment Proof Screenshot" })}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white text-xs font-bold transition-opacity"
                    >
                      <Eye className="w-4 h-4 text-[#FFD700]" />
                      <span>Click to Enlarge</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 text-xs text-gray-500 font-mono text-center">Payment screenshot saved</div>
                )}
              </div>

            </div>

            {/* Application Data summary */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-gray-400">Selected Blockchain:</span>
                <span className="font-bold text-white uppercase">{user?.kycChain || selectedChain} Network</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-gray-400">Required Fee:</span>
                <span className="font-mono font-bold text-amber-400">{CHAIN_CONFIG[selectedChain]?.fee || '0.004 SOL'}</span>
              </div>
              {user?.kycTxHash && (
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-400">Transaction ID / Hash:</span>
                  <span className="font-mono text-white text-[11px] truncate max-w-[200px]">{user.kycTxHash}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400">Expected Approval:</span>
                <span className="font-bold text-emerald-400">Within 24 Hours ✓</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-500 text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all text-center shadow-md"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => navigate('/mining')}
                className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all text-center"
              >
                Mine CM Coins (0.5 CM / 12h)
              </button>
            </div>

          </div>

        </div>

      ) : (

        /* STATE 3: KYC APPLICATION FORM (WHEN NOT YET SUBMITTED) */
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
                  Capture a clear live front-facing photo of your face or upload a front camera screenshot.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Photo Display / Live Video Area */}
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#FFD700]/30 rounded-2xl p-4 bg-black/40 min-h-[220px] relative overflow-hidden">
                {isCameraActive ? (
                  <div className="relative w-full h-full flex flex-col items-center">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full max-h-56 rounded-xl object-cover border border-[#FFD700]"
                    />
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-4 py-2 rounded-xl bg-[#FFD700] text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Snap Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-2 rounded-xl bg-white/10 text-white font-bold text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : selfieData ? (
                  <div className="relative group text-center">
                    <img 
                      src={selfieData} 
                      alt="Front Camera Selfie" 
                      className="max-h-48 rounded-xl object-contain border border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => setSelfieData(null)}
                      className="mt-2 text-xs text-gray-400 hover:text-white underline block mx-auto"
                    >
                      Retake Photo
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <Camera className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-400 font-medium">No front selfie captured yet</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
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

          {/* STEP 2: VERIFICATION FEE (SOL / BNB / ETH) */}
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
                  Select Solana, BNB, or Ethereum. <strong className="text-amber-400">USDT is NOT accepted</strong> — only native gas coins.
                </p>
              </div>
            </div>

            {/* Chain Selector Tabs */}
            <div className="grid grid-cols-3 gap-2.5">
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
                <p className="text-sm font-mono font-black text-purple-400 mt-1">0.004 SOL</p>
                <span className="text-[10px] text-gray-500 block">Solana SPL</span>
              </button>

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
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] text-black font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,215,0,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{isSubmitting ? 'Submitting Application...' : 'Submit KYC Verification'}</span>
          </button>
        </form>
      )}

    </div>
  );
}
