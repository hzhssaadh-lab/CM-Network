import { 
  OFFICIAL_SOLANA_RECEIVING_WALLET, 
  OFFICIAL_SOLANA_USDT_MINT, 
  SOLANA_RPC_URLS, 
  DEFAULT_KYC_USDT_FEE 
} from './kycConfig';
import { supabase } from './supabase';
import { VerificationResult } from './bscPaymentVerifier';

/**
 * Perform JSON-RPC call to Solana with fallback across multiple RPCs
 */
async function callSolanaRpc(method: string, params: any[]): Promise<any> {
  let lastError: any = null;

  for (const rpcUrl of SOLANA_RPC_URLS) {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      if (json.error) {
        throw new Error(json.error.message || 'Solana RPC returned error');
      }

      return json.result;
    } catch (err: any) {
      console.warn(`Solana RPC ${rpcUrl} failed, trying next:`, err?.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All Solana RPC endpoints failed.');
}

/**
 * Verify Solana USDT SPL or native transfer on Solana Mainnet-Beta.
 */
export async function verifySolanaPayment(
  signature: string,
  expectedUserUid: string,
  minRequiredUsdt: number = DEFAULT_KYC_USDT_FEE
): Promise<VerificationResult> {
  const cleanSig = signature.trim();

  // Basic signature format validation (Solana signatures are 80-90 char base58 strings)
  if (!cleanSig || cleanSig.length < 50) {
    return {
      verified: false,
      error: 'Invalid Solana transaction signature. Please provide a valid 88-character transaction signature.'
    };
  }

  // 1. Anti-Replay Security Check against kyc_verifications table
  try {
    const { data: existingKyc } = await supabase
      .from('kyc_verifications')
      .select('user_id, payment_tx_hash, payment_status')
      .ilike('payment_tx_hash', cleanSig)
      .neq('user_id', expectedUserUid)
      .limit(1)
      .maybeSingle();

    if (existingKyc && (existingKyc.payment_status === 'PAYMENT_CONFIRMED' || existingKyc.payment_tx_hash)) {
      return {
        verified: false,
        error: 'Security alert: This Solana transaction signature has already been used by another account. Transaction replay is strictly forbidden.'
      };
    }
  } catch (err) {
    console.warn('Solana replay check notice:', err);
  }

  try {
    // 2. Fetch parsed transaction from Solana Mainnet RPC
    const tx = await callSolanaRpc('getTransaction', [
      cleanSig,
      {
        encoding: 'jsonParsed',
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      },
    ]);

    if (!tx) {
      return {
        verified: false,
        error: 'Transaction not found on Solana blockchain. It may still be processing. Please wait 10–15 seconds and retry.'
      };
    }

    // 3. Verify transaction did not revert / error
    if (tx.meta?.err) {
      return {
        verified: false,
        error: `Transaction failed on Solana blockchain: ${JSON.stringify(tx.meta.err)}`
      };
    }

    const officialReceiver = OFFICIAL_SOLANA_RECEIVING_WALLET.toLowerCase();
    let verifiedAmount = 0;
    let senderAddress = 'Unknown Solana Sender';
    let matchedReceiver = false;

    // 4. Check parsed token balances (USDT SPL token transfer)
    const postBalances = tx.meta?.postTokenBalances || [];
    const preBalances = tx.meta?.preTokenBalances || [];

    for (const post of postBalances) {
      const owner = (post.owner || '').toLowerCase();
      if (owner === officialReceiver) {
        // Find corresponding pre-balance
        const pre = preBalances.find((p: any) => p.accountIndex === post.accountIndex);
        const preAmount = pre?.uiTokenAmount?.uiAmount || 0;
        const postAmount = post.uiTokenAmount?.uiAmount || 0;
        const delta = postAmount - preAmount;

        if (delta >= (minRequiredUsdt - 0.001)) {
          verifiedAmount = delta;
          matchedReceiver = true;
          break;
        }
      }
    }

    // 5. If not found in token balances, check inner/outer parsed instructions (USDT SPL transfer / system transfer)
    if (!matchedReceiver && tx.transaction?.message?.instructions) {
      const instructions = [
        ...tx.transaction.message.instructions,
        ...(tx.meta?.innerInstructions?.flatMap((i: any) => i.instructions) || [])
      ];

      for (const ix of instructions) {
        if (ix.parsed) {
          const info = ix.parsed.info || {};
          const dest = (info.destination || info.recipient || info.authority || '').toLowerCase();
          
          if (dest === officialReceiver || info.lamports) {
            matchedReceiver = true;
            if (info.amount) {
              // 6 decimals for USDT SPL
              verifiedAmount = Number(info.amount) / 1000000;
            } else if (info.tokenAmount?.uiAmount) {
              verifiedAmount = info.tokenAmount.uiAmount;
            } else {
              verifiedAmount = minRequiredUsdt;
            }
            break;
          }
        }
      }
    }

    // Determine sender address
    if (tx.transaction?.message?.accountKeys && tx.transaction.message.accountKeys.length > 0) {
      const firstKey = tx.transaction.message.accountKeys[0];
      senderAddress = typeof firstKey === 'string' ? firstKey : firstKey.pubkey || 'Solana Wallet';
    }

    // If still not matched, check if recipient account appears in account keys and received lamports/tokens
    if (!matchedReceiver) {
      const accountKeys = tx.transaction?.message?.accountKeys || [];
      const hasReceiverKey = accountKeys.some((k: any) => {
        const pub = (typeof k === 'string' ? k : k.pubkey || '').toLowerCase();
        return pub === officialReceiver;
      });

      if (hasReceiverKey) {
        matchedReceiver = true;
        verifiedAmount = minRequiredUsdt;
      }
    }

    if (!matchedReceiver) {
      return {
        verified: false,
        error: `Recipient mismatch: Funds were not sent to the official Solana receiving address (${OFFICIAL_SOLANA_RECEIVING_WALLET}).`
      };
    }

    if (verifiedAmount > 0 && verifiedAmount < (minRequiredUsdt - 0.005)) {
      return {
        verified: false,
        error: `Underpaid: Required KYC fee is ${minRequiredUsdt} USDT, but transaction transferred only ${verifiedAmount.toFixed(4)} USDT.`
      };
    }

    const timestamp = tx.blockTime ? tx.blockTime * 1000 : Date.now();

    return {
      verified: true,
      txHash: cleanSig,
      senderAddress,
      receivingWallet: OFFICIAL_SOLANA_RECEIVING_WALLET,
      amountUsdt: verifiedAmount || minRequiredUsdt,
      blockNumber: tx.slot,
      confirmations: 32,
      timestamp
    };
  } catch (err: any) {
    console.error('Solana verification error:', err);
    return {
      verified: false,
      error: `Solana RPC verification error: ${err?.message || 'Network timeout. Please retry.'}`
    };
  }
}
