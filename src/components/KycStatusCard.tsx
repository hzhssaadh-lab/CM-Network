import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Zap, 
  Lock, 
  RefreshCw, 
  Wallet, 
  Sparkles,
  Camera
} from 'lucide-react';
import { KycRecord } from '../lib/kycConfig';

export interface KycStatusCardProps {
  kycRecord?: KycRecord | null;
  userKycStatus?: string; // 'verified' | 'pending' | 'rejected' | 'unverified'
  onRetry?: () => void;
  onStartVerification?: () => void;
  onPayFee?: () => void;
}

export const KycStatusCard: React.FC<KycStatusCardProps> = ({
  kycRecord,
  userKycStatus,
  onRetry,
  onStartVerification,
  onPayFee,
}) => {
  // Resolve primary status
  const isApproved = 
    userKycStatus === 'verified' || 
    kycRecord?.status === 'KYC_APPROVED';

  const isRejected = 
    userKycStatus === 'rejected' || 
    kycRecord?.status === 'KYC_REJECTED' || 
    kycRecord?.status === 'VERIFICATION_FAILED';

  const isPending = 
    userKycStatus === 'pending' || 
    kycRecord?.status === 'MANUAL_REVIEW' || 
    kycRecord?.status === 'FACE_VERIFICATION_PENDING';

  const isPaymentConfirmed = Boolean(
    kycRecord?.paymentConfirmedAt || 
    kycRecord?.paymentStatus === 'PAYMENT_CONFIRMED' || 
    kycRecord?.status === 'PAYMENT_CONFIRMED' || 
    kycRecord?.status === 'KYC_UNLOCKED' || 
    kycRecord?.status === 'FACE_VERIFIED' || 
    isApproved
  );

  const txHash = kycRecord?.paymentTxHash;
  const paymentAmount = kycRecord?.paymentAmount ?? 0.5;
  const failureReason = kycRecord?.failureReason;

  return (
    <div className="w-full rounded-3xl bg-black/70 border border-white/10 p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-5">
      {/* Glow highlight */}
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
        isApproved ? 'bg-emerald-500/10' :
        isPending ? 'bg-amber-500/10' :
        isRejected ? 'bg-red-500/10' :
        'bg-[#FFD700]/10'
      }`} />

      {/* Header Row: Title & Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10 border-b border-white/5 pb-4">
        <div className="flex items-center space-x-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
            isApproved ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
            isPending ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
            isRejected ? 'bg-red-500/15 text-red-400 border-red-500/30' :
            'bg-[#FFD700]/15 text-[#FFD700] border-[#FFD700]/30'
          }`}>
            {isApproved ? <ShieldCheck className="w-6 h-6" /> :
             isPending ? <Clock className="w-6 h-6 animate-pulse" /> :
             isRejected ? <AlertCircle className="w-6 h-6" /> :
             <Lock className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                Identity Protocol
              </span>
              <span className="text-gray-600">•</span>
              <span className="text-[10px] font-bold text-gray-500 font-mono">
                BNB Smart Chain (ID: 56)
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              KYC Application Status
            </h3>
          </div>
        </div>

        {/* Dynamic Status Badge */}
        <div className="self-start sm:self-auto shrink-0">
          {isApproved ? (
            <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>APPROVED & VERIFIED</span>
            </div>
          ) : isPending ? (
            <div className="px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-black flex items-center gap-1.5 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>PENDING REVIEW</span>
            </div>
          ) : isRejected ? (
            <div className="px-3.5 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>VERIFICATION REJECTED</span>
            </div>
          ) : isPaymentConfirmed ? (
            <div className="px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 text-xs font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>PAYMENT CONFIRMED</span>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 rounded-full bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/40 text-xs font-black flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#FFD700]" />
              <span>PAYMENT REQUIRED</span>
            </div>
          )}
        </div>
      </div>

      {/* Informative Notice Box */}
      <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
        isApproved ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' :
        isPending ? 'bg-amber-500/10 border-amber-500/25 text-amber-300' :
        isRejected ? 'bg-red-500/10 border-red-500/25 text-red-300' :
        'bg-white/[0.03] border-white/10 text-gray-300'
      }`}>
        {isApproved ? (
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-white block mb-0.5">Identity Verification Complete</strong>
              Your account has full Level 2 KYC clearance. Node Operator eligibility, P2P network transactions, and elevated daily mining limits are permanently unlocked.
            </div>
          </div>
        ) : isPending ? (
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-white block mb-0.5">Verification Under Review</strong>
              Your fee payment was confirmed and biometric verification data is pending final review by protocol administrators. Verification typically completes within 10–30 minutes.
            </div>
          </div>
        ) : isRejected ? (
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-white block mb-0.5">KYC Application Rejected</strong>
              {failureReason ? (
                <span>Reason: {failureReason}. You can retry face verification with better lighting.</span>
              ) : (
                <span>Biometric liveness or gas fee verification did not meet the security threshold. Please retry verification.</span>
              )}
            </div>
          </div>
        ) : isPaymentConfirmed ? (
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-white block mb-0.5">USDT Fee Payment Verified</strong>
              Payment of {paymentAmount} USDT BEP-20 is confirmed on BNB Smart Chain. You are authorized to begin Live Biometric Face Verification.
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#FFD700] shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-white block mb-0.5">Strict Payment-First KYC</strong>
              A one-time verification fee of {paymentAmount} USDT BEP-20 must be paid from Trust Wallet or MetaMask to unlock real-time live biometric face verification.
            </div>
          </div>
        )}
      </div>

      {/* Metadata Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">
            Payment Status
          </span>
          <p className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
            {isPaymentConfirmed ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
              </span>
            ) : txHash ? (
              <span className="text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Pending
              </span>
            ) : (
              <span className="text-gray-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Required
              </span>
            )}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">
            KYC Protocol Fee
          </span>
          <p className="text-xs font-mono font-bold text-[#FFD700]">
            {paymentAmount} USDT <span className="text-[10px] text-gray-500">BEP-20</span>
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">
            Biometric Liveness
          </span>
          <p className="text-xs font-mono font-bold">
            {isApproved ? (
              <span className="text-emerald-400">Passed (96%+)</span>
            ) : isPaymentConfirmed ? (
              <span className="text-blue-400">Camera Unlocked</span>
            ) : (
              <span className="text-gray-500">Locked</span>
            )}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">
            Node Eligibility
          </span>
          <p className="text-xs font-mono font-bold">
            {isApproved ? (
              <span className="text-emerald-400 font-black">Eligible ✓</span>
            ) : (
              <span className="text-gray-500">Requires KYC</span>
            )}
          </p>
        </div>
      </div>

      {/* Transaction Hash Row if available */}
      {txHash && (
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-gray-400 font-mono text-[11px]">BNB Chain TX:</span>
            <span className="text-[#FFD700] font-mono text-[11px] truncate max-w-[200px] sm:max-w-[280px]">
              {txHash}
            </span>
          </div>
          <a
            href={`https://bscscan.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 font-bold text-[11px] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View on BscScan</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Action Decision Button */}
      <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
        {isApproved ? (
          <div className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>KYC Verified Miner</span>
          </div>
        ) : isRejected ? (
          <button
            onClick={onRetry}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Face Verification</span>
          </button>
        ) : isPaymentConfirmed ? (
          <button
            onClick={onStartVerification}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Start Live Face Verification</span>
          </button>
        ) : (
          <button
            onClick={onPayFee}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FFD700] hover:brightness-110 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
          >
            <Wallet className="w-4 h-4" />
            <span>Pay {paymentAmount} USDT Fee</span>
          </button>
        )}
      </div>
    </div>
  );
};
