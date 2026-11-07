import React, { useState } from 'react';
import { 
  HelpCircle, 
  X, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Wallet, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight,
  Camera,
  Coins
} from 'lucide-react';
import { OFFICIAL_RECEIVING_WALLET, OFFICIAL_USDT_BEP20_CONTRACT } from '../lib/kycConfig';

export interface HowToVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeUsdt?: number;
}

export const HowToVerifyModal: React.FC<HowToVerifyModalProps> = ({
  isOpen,
  onClose,
  feeUsdt = 0.5,
}) => {
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: 'wallet' | 'contract') => {
    navigator.clipboard.writeText(text);
    if (type === 'wallet') {
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    } else {
      setCopiedContract(true);
      setTimeout(() => setCopiedContract(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0e0d0a] border border-[#FFD700]/40 p-6 sm:p-8 text-white shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-black uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Complete Verification Guide</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            How to Complete KYC Verification
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Follow this 4-step tutorial to pay the {feeUsdt} USDT fee, submit your transaction hash, and pass face verification.
          </p>
        </div>

        {/* Warning Callout */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-white block">Important Network Requirement:</span>
            <span>
              Supported networks: <strong>BNB Smart Chain (BEP-20)</strong> or <strong>Solana (SPL)</strong>. Do NOT send via Ethereum (ERC-20) or Tron (TRC-20) networks. Make sure you have a small amount of BNB or SOL for network gas.
            </span>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#FFD700] text-black font-black text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <h4 className="text-sm font-black text-white">Connect Your Web3 Wallet</h4>
            </div>
            <p className="text-xs text-gray-400 pl-9">
              Click <strong>&quot;Connect Trust Wallet&quot;</strong> or MetaMask on the KYC page. The app will automatically connect to your account and verify that you are on <strong>BNB Smart Chain (Chain ID: 56)</strong>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#FFD700] text-black font-black text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <h4 className="text-sm font-black text-white">Send the {feeUsdt} USDT (BEP-20) KYC Fee</h4>
            </div>
            
            <div className="pl-9 space-y-3 text-xs text-gray-400">
              <p>
                <strong>Method A (BNB Smart Chain):</strong> Click <strong>&quot;Pay {feeUsdt} USDT Fee&quot;</strong> via connected Trust Wallet or send {feeUsdt} USDT BEP-20 to the official BSC address:
              </p>

              {/* Copy BSC Address Box */}
              <div className="p-3 rounded-xl bg-black/80 border border-white/10 space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between text-gray-500 text-[10px]">
                  <span>BSC RECEIVING WALLET (USDT BEP-20):</span>
                  <span className="text-[#FFD700] font-bold">BNB Chain (ID: 56)</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#FFD700] truncate">{OFFICIAL_RECEIVING_WALLET}</span>
                  <button
                    onClick={() => copyToClipboard(OFFICIAL_RECEIVING_WALLET, 'wallet')}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold flex items-center gap-1 shrink-0 border border-white/10"
                  >
                    {copiedWallet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedWallet ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <p className="pt-1">
                <strong>Method B (Solana Network):</strong> Transfer exactly <strong>{feeUsdt} USDT (SPL)</strong> from Phantom, Solflare, or Trust Wallet to the official Solana address below:
              </p>

              {/* Copy Solana Address Box */}
              <div className="p-3 rounded-xl bg-black/80 border border-purple-500/30 space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between text-gray-500 text-[10px]">
                  <span>SOLANA RECEIVING WALLET (USDT SPL):</span>
                  <span className="text-purple-400 font-bold">Solana Mainnet</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-purple-300 truncate">2z8hTr7ccNH6bq2kyjS9cvH9d8XFMESaWFaD9z5HSr1D</span>
                  <button
                    onClick={() => copyToClipboard('2z8hTr7ccNH6bq2kyjS9cvH9d8XFMESaWFaD9z5HSr1D', 'contract')}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold flex items-center gap-1 shrink-0 border border-white/10"
                  >
                    {copiedContract ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedContract ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#FFD700] text-black font-black text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <h4 className="text-sm font-black text-white">Copy & Submit Your Transaction Hash</h4>
            </div>
            <div className="pl-9 space-y-1.5 text-xs text-gray-400">
              <p>
                After your transaction is broadcasted:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                <li>In Trust Wallet, open the completed USDT transfer.</li>
                <li>Tap <strong>&quot;View on BscScan&quot;</strong> or copy the <strong>Transaction Hash (TXID)</strong> (starts with <code className="text-emerald-400">0x...</code>).</li>
                <li>Paste the 66-character hash into the <strong>&quot;Enter Transaction Hash&quot;</strong> input on the KYC page.</li>
                <li>Click <strong>&quot;Verify Payment on BNB Chain&quot;</strong>.</li>
              </ul>
              <p className="text-[11px] text-gray-500 pt-1">
                The smart verifier independently checks the blockchain receipt, event logs, and recipient address on BNB Chain.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-400 text-black font-black text-xs flex items-center justify-center shrink-0">
                4
              </div>
              <h4 className="text-sm font-black text-white">Live Face Biometric Verification</h4>
            </div>
            <div className="pl-9 space-y-1.5 text-xs text-gray-400">
              <p>
                Once payment is confirmed, the Live Face Verification button unlocks:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                <li>Allow front-camera access on your phone or laptop.</li>
                <li>Center your face inside the green oval guide with adequate lighting.</li>
                <li>Follow the randomized active prompts (such as blinking or turning your head).</li>
              </ul>
              <p className="text-[11px] text-emerald-400 font-semibold pt-1">
                ✓ Once liveness is verified, your KYC status updates instantly to Approved across the entire network!
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note & Button */}
        <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-gray-500 text-center sm:text-left">
            Need help? Contact official CM Support in the community channels.
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#FFD700] hover:brightness-110 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
          >
            Got It, Let&apos;s Verify!
          </button>
        </div>
      </div>
    </div>
  );
};
