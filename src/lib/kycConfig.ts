// Official BNB Smart Chain & USDT BEP-20 Constants
export const BSC_CONFIG = {
  chainId: 56,
  chainIdHex: '0x38',
  chainName: 'BNB Smart Chain Mainnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: [
    'https://bsc-dataseed.binance.org/',
    'https://bsc-dataseed1.defibit.io/',
    'https://bsc-dataseed1.ninicoin.io/',
    'https://rpc.ankr.com/bsc',
  ],
  blockExplorerUrls: ['https://bscscan.com'],
};

// Official USDT BEP-20 Contract on BSC Mainnet
export const OFFICIAL_USDT_BEP20_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';

// Official CM Network Receiving Wallet for KYC Fees
export const OFFICIAL_RECEIVING_WALLET = '0x7CFD255CA3FE95e88BDFdFAb44d12d92F0f2A120';

// Default KYC Fee in USDT BEP-20 (Configurable by Admin)
export const DEFAULT_KYC_USDT_FEE = 1.0; // 1 USDT BEP-20

// Standard ERC-20 Minimal ABI for transfer & balance
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

export type AutomaticKycStatus =
  | 'NOT_STARTED'
  | 'PAYMENT_REQUIRED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_CONFIRMED'
  | 'KYC_UNLOCKED'
  | 'FACE_VERIFICATION_PENDING'
  | 'FACE_VERIFIED'
  | 'VERIFICATION_FAILED'
  | 'MANUAL_REVIEW'
  | 'KYC_APPROVED'
  | 'KYC_REJECTED';

export interface KycRecord {
  userId: string;
  userEmail?: string;
  userName?: string;
  status: AutomaticKycStatus;
  
  // Payment Verification fields
  paymentTxHash?: string;
  paymentAmount?: number;
  paymentToken?: string;
  paymentNetwork?: string;
  paymentWallet?: string;
  paymentConfirmedAt?: number;
  paymentBlockNumber?: number;
  
  // Liveness / Face Verification fields
  verificationSessionId?: string;
  providerReference?: string;
  livenessStatus?: 'pending' | 'passed' | 'failed' | 'manual_review';
  livenessScore?: number;
  livenessResult?: any;
  failureReason?: string;
  attemptCount?: number;
  maxAttempts?: number;
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
  approvedAt?: number;
  rejectedAt?: number;
  rejectionReason?: string;
  adminNotes?: string;
}

export interface KycGlobalConfig {
  feeUsdt: number;
  receivingWallet: string;
  usdtContract: string;
  chainId: number;
  autoApproveOnLivenessPass: boolean;
  maxRetryAttempts: number;
  maintenanceNotice?: string;
  updatedAt?: number;
}
