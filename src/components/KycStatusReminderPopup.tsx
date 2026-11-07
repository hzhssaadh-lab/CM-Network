import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  X, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../hooks/useAppStore';

export const KycStatusReminderPopup: React.FC = () => {
  const { user, refreshUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  const isVerified = user?.kycStatus === 'verified' || (user as any)?.kycstatus === 'verified';
  const isPending = 
    user?.kycStatus === 'pending' || 
    (user as any)?.kycstatus === 'pending' || 
    user?.autoKycStatus === 'MANUAL_REVIEW';

  // Calculate live 24-hour countdown based on submission time
  useEffect(() => {
    if (!isPending) return;

    const submittedAt = user?.kycSubmittedAt || Date.now();
    const reviewEndTime = submittedAt + 24 * 60 * 60 * 1000;

    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, reviewEndTime - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [user?.kycSubmittedAt, isPending]);

  // Trigger popup every 2 minutes (120,000 ms) for users with active KYC review or unverified
  useEffect(() => {
    if (isVerified) {
      setIsOpen(false);
      return;
    }

    // Initial display trigger after 30 seconds, then recurring every 2 minutes
    const initialTimer = setTimeout(() => {
      setIsOpen(true);
    }, 30000);

    const recurringInterval = setInterval(() => {
      // Check user fresh status in background
      refreshUser();
      setIsOpen(true);
    }, 120000); // exactly every 2 minutes (120 seconds)

    return () => {
      clearTimeout(initialTimer);
      clearInterval(recurringInterval);
    };
  }, [isVerified, refreshUser]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleGoToKyc = () => {
    setIsOpen(false);
    navigate('/kyc');
  };

  if (isVerified) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[998] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-[#181325] via-[#100d18] to-black border border-purple-500/40 rounded-[32px] p-6 sm:p-7 max-w-md w-full relative shadow-[0_0_50px_rgba(168,85,247,0.25)] space-y-5 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all z-10"
              title="Close (will remind in 2 minutes)"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top Indicator */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>KYC Review Status • 24h Window</span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Updates every 2 min</span>
            </div>

            {/* Main Header */}
            <div className="space-y-1 pr-6">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{isPending ? 'KYC Under Review' : 'KYC Verification Required'}</span>
                {isPending && <span className="text-amber-400">⏳</span>}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                {isPending 
                  ? 'Your manual KYC verification application has been received and is being processed by the security audit team.'
                  : 'Complete your KYC to unlock full node rewards, coin sending, and P2P exchange access.'}
              </p>
            </div>

            {/* 24-HOUR COUNTDOWN CLOCK BOX (WHEN PENDING) */}
            {isPending ? (
              <div className="p-4 rounded-2xl bg-black/60 border border-purple-500/30 space-y-2 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                  Estimated Maximum Approval Time (24 Hours)
                </span>
                <div className="flex items-center justify-center gap-3 font-mono font-black text-2xl sm:text-3xl text-purple-300">
                  <div className="bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-500/30">
                    <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[9px] font-sans font-normal text-gray-400 block -mt-1">HRS</span>
                  </div>
                  <span className="text-purple-500">:</span>
                  <div className="bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-500/30">
                    <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[9px] font-sans font-normal text-gray-400 block -mt-1">MIN</span>
                  </div>
                  <span className="text-purple-500">:</span>
                  <div className="bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-500/30">
                    <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="text-[9px] font-sans font-normal text-gray-400 block -mt-1">SEC</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 pt-1">
                  Average approval time: <strong className="text-white">within 24 hours</strong>. Our administrators approve requests in FIFO order.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-black/60 border border-[#FFD700]/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#FFD700]">⚡ Fast KYC: Instant (60s)</span>
                  <span className="text-purple-400">⏳ Manual KYC: 24 Hours</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Choose between fast automated on-chain verification or standard 24-hour manual review.
                </p>
              </div>
            )}

            {/* Fast Alternative Callout */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/30 flex items-start gap-3">
              <Zap className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5 fill-[#FFD700]" />
              <div className="space-y-0.5 text-xs">
                <span className="font-bold text-[#FFD700] block">Need Instant Approval?</span>
                <span className="text-gray-300 text-[11px]">
                  Use <strong>Fast Automatic KYC</strong> with real-time biometric face detection for instant approval in under 60 seconds.
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-1 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={handleGoToKyc}
                className="w-full sm:flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] hover:brightness-110 text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isPending ? 'Check KYC Page' : 'Verify KYC Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Dismiss (2m)
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
