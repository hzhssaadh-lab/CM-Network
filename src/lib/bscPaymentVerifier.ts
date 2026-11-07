import { ethers } from 'ethers';
import { 
  BSC_CONFIG, 
  OFFICIAL_USDT_BEP20_CONTRACT, 
  OFFICIAL_RECEIVING_WALLET,
  ERC20_ABI,
  DEFAULT_KYC_USDT_FEE,
  KycGlobalConfig
} from './kycConfig';
import { supabase } from './supabase';

/**
 * Get the current global KYC configuration from Supabase settings.
 * Defaults to official specifications if not configured.
 */
export async function getKycGlobalConfig(): Promise<KycGlobalConfig> {
  try {
    const { data } = await supabase.from('settings').select('*').eq('id', 'kyc_config').maybeSingle();
    if (data && data.adsterraSnippet) {
      const parsed = JSON.parse(data.adsterraSnippet);
      return {
        feeUsdt: typeof parsed.feeUsdt === 'number' ? parsed.feeUsdt : DEFAULT_KYC_USDT_FEE,
        receivingWallet: (parsed.receivingWallet || OFFICIAL_RECEIVING_WALLET).trim(),
        usdtContract: (parsed.usdtContract || OFFICIAL_USDT_BEP20_CONTRACT).trim(),
        chainId: parsed.chainId || BSC_CONFIG.chainId,
        autoApproveOnLivenessPass: parsed.autoApproveOnLivenessPass !== false,
        maxRetryAttempts: parsed.maxRetryAttempts || 3,
        maintenanceNotice: parsed.maintenanceNotice,
        updatedAt: parsed.updatedAt
      };
    }
  } catch (e) {
    console.warn('Could not load kyc_config from settings:', e);
  }

  return {
    feeUsdt: DEFAULT_KYC_USDT_FEE,
    receivingWallet: OFFICIAL_RECEIVING_WALLET,
    usdtContract: OFFICIAL_USDT_BEP20_CONTRACT,
    chainId: BSC_CONFIG.chainId,
    autoApproveOnLivenessPass: true,
    maxRetryAttempts: 3
  };
}

/**
 * Save updated KYC configuration to Supabase settings.
 */
export async function saveKycGlobalConfig(config: Partial<KycGlobalConfig>): Promise<boolean> {
  try {
    const current = await getKycGlobalConfig();
    const updated: KycGlobalConfig = {
      ...current,
      ...config,
      updatedAt: Date.now()
    };

    const { error } = await supabase.from('settings').upsert({
      id: 'kyc_config',
      adsterraSnippet: JSON.stringify(updated)
    });

    return !error;
  } catch (e) {
    console.error('Error saving kyc_config:', e);
    return false;
  }
}

/**
 * Get an active working JsonRpcProvider across fallback nodes.
 */
export async function getBscProvider(): Promise<ethers.JsonRpcProvider> {
  for (const url of BSC_CONFIG.rpcUrls) {
    try {
      const provider = new ethers.JsonRpcProvider(url, BSC_CONFIG.chainId, { staticNetwork: true });
      // Quick ping test
      await provider.getBlockNumber();
      return provider;
    } catch {
      continue;
    }
  }
  // Default to primary
  return new ethers.JsonRpcProvider(BSC_CONFIG.rpcUrls[0], BSC_CONFIG.chainId, { staticNetwork: true });
}

export interface VerificationResult {
  verified: boolean;
  error?: string;
  txHash?: string;
  senderAddress?: string;
  receivingWallet?: string;
  amountUsdt?: number;
  blockNumber?: number;
  confirmations?: number;
  timestamp?: number;
  network?: string;
}

/**
 * Independently and strictly verify a USDT BEP-20 transfer on BNB Smart Chain.
 * Validates:
 * 1. Transaction receipt exists on-chain and status is 1 (success)
 * 2. Contract called is the official USDT BEP-20 contract (0x55d398326f99059fF775485246999027B3197955)
 * 3. Contains a valid ERC-20 Transfer event
 * 4. Recipient is the official receiving wallet (case-insensitive)
 * 5. Amount is greater than or equal to required KYC fee
 * 6. Ensures transaction hash has not already been claimed/replayed by another user
 */
export async function verifyBscUsdtPayment(
  txHash: string,
  expectedUserUid: string,
  minRequiredUsdt?: number
): Promise<VerificationResult> {
  const cleanTxHash = (txHash || '').trim();

  // Basic hash format check
  if (!/^0x[0-9a-fA-F]{64}$/.test(cleanTxHash)) {
    return { verified: false, error: 'Invalid transaction hash format. Must be 0x followed by 64 hexadecimal characters.' };
  }

  // Anti-Replay check: verify if another user has already verified with this hash
  try {
    // 1. Check in kyc_verifications Supabase table
    const { data: existingKyc } = await supabase
      .from('kyc_verifications')
      .select('user_id, payment_tx_hash, payment_status')
      .ilike('payment_tx_hash', cleanTxHash)
      .neq('user_id', expectedUserUid)
      .limit(1)
      .maybeSingle();

    if (existingKyc && (existingKyc.payment_status === 'PAYMENT_CONFIRMED' || existingKyc.payment_tx_hash)) {
      return {
        verified: false,
        error: 'Security alert: This transaction hash has already been used by another account. Transaction replay is strictly forbidden.'
      };
    }

    // 2. Check in settings table (backward compatibility)
    const { data: existingRows } = await supabase
      .from('settings')
      .select('id, adsterraSnippet')
      .like('id', 'kyc_%')
      .limit(1000);

    if (existingRows) {
      for (const row of existingRows) {
        const rowUid = row.id.replace('kyc_', '');
        if (rowUid !== expectedUserUid && row.adsterraSnippet) {
          try {
            const parsed = JSON.parse(row.adsterraSnippet);
            const usedHash = (parsed.paymentTxHash || parsed.kycTxHash || '').trim().toLowerCase();
            if (usedHash === cleanTxHash.toLowerCase() && (parsed.paymentConfirmedAt || parsed.status === 'verified' || parsed.kycStatus === 'verified' || parsed.paymentStatus === 'PAYMENT_CONFIRMED')) {
              return {
                verified: false,
                error: 'Security alert: This transaction hash has already been used by another account. Transaction replay is strictly forbidden.'
              };
            }
          } catch {
            // ignore JSON parse error
          }
        }
      }
    }
  } catch (err) {
    console.warn('Replay check notice:', err);
  }

  const config = await getKycGlobalConfig();
  const requiredUsdt = minRequiredUsdt !== undefined ? minRequiredUsdt : config.feeUsdt;
  const officialReceiver = config.receivingWallet.toLowerCase();
  const officialContract = config.usdtContract.toLowerCase();

  const provider = await getBscProvider();

  try {
    // 1. Fetch transaction receipt from on-chain RPC
    const receipt = await provider.getTransactionReceipt(cleanTxHash);
    if (!receipt) {
      return { 
        verified: false, 
        error: 'Transaction not found on BNB Smart Chain. It may still be pending in the mempool. Please wait a few seconds and retry.' 
      };
    }

    // 2. Check transaction status
    if (receipt.status !== 1) {
      return { verified: false, error: 'Transaction failed on-chain on BNB Smart Chain (reverted by EVM).' };
    }

    // 3. Confirm contract address matches USDT BEP-20
    const toAddress = (receipt.to || '').toLowerCase();
    if (toAddress !== officialContract) {
      return { 
        verified: false, 
        error: `Transaction was not executed on the official USDT BEP-20 contract (${config.usdtContract}).` 
      };
    }

    // 4. Parse ERC-20 Transfer events from the logs
    // Transfer(address indexed from, address indexed to, uint256 value)
    // Topic0: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
    const transferEventSignature = ethers.id('Transfer(address,address,uint256)');
    const transferLog = receipt.logs.find(
      (log) => log.topics[0] === transferEventSignature && log.address.toLowerCase() === officialContract
    );

    if (!transferLog || transferLog.topics.length < 3) {
      return { verified: false, error: 'No standard ERC-20 Transfer event found in the transaction logs.' };
    }

    // Sender is in topic[1] (32 bytes padded)
    const sender = ethers.getAddress('0x' + transferLog.topics[1].slice(26));
    // Recipient is in topic[2] (32 bytes padded)
    const recipient = ethers.getAddress('0x' + transferLog.topics[2].slice(26));
    // Value is in data
    const rawValue = BigInt(transferLog.data);
    // USDT BEP-20 has 18 decimals
    const actualAmountUsdt = Number(ethers.formatUnits(rawValue, 18));

    // 5. Verify recipient matches official receiving wallet
    if (recipient.toLowerCase() !== officialReceiver) {
      return { 
        verified: false, 
        error: `USDT recipient address mismatch: Funds were sent to ${recipient}, but official receiving wallet is ${config.receivingWallet}.` 
      };
    }

    // 6. Verify amount (allowing tiny floating-point rounding tolerance 0.0001)
    if (actualAmountUsdt < requiredUsdt - 0.0001) {
      return { 
        verified: false, 
        error: `Underpaid: Required KYC fee is ${requiredUsdt} USDT, but transaction paid only ${actualAmountUsdt.toFixed(4)} USDT.` 
      };
    }

    // 7. Get block confirmations
    const currentBlock = await provider.getBlockNumber();
    const confirmations = Math.max(1, currentBlock - receipt.blockNumber + 1);

    const block = await provider.getBlock(receipt.blockNumber);
    const timestamp = block ? block.timestamp * 1000 : Date.now();

    return {
      verified: true,
      txHash: cleanTxHash,
      senderAddress: sender,
      receivingWallet: recipient,
      amountUsdt: actualAmountUsdt,
      blockNumber: receipt.blockNumber,
      confirmations,
      timestamp
    };
  } catch (err: any) {
    console.error('Error verifying BSC transaction:', err);
    return {
      verified: false,
      error: `Blockchain RPC verification error: ${err?.message || 'Network timeout. Please retry.'}`
    };
  }
}
