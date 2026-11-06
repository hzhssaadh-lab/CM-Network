import { ethers } from 'ethers';
import { BSC_CONFIG, OFFICIAL_USDT_BEP20_CONTRACT, ERC20_ABI } from './kycConfig';

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isBsc: boolean;
  usdtBalance: number;
  bnbBalance: number;
}

declare global {
  interface Window {
    ethereum?: any;
    trustwallet?: any;
    binancew3w?: any;
  }
}

/**
 * Detect Trust Wallet or any EVM compatible Web3 provider.
 * Trust Wallet in mobile dApp browsers or extensions exposes window.trustwallet or window.ethereum.
 */
export function getEthereumProvider(): any {
  if (typeof window === 'undefined') return null;

  // Dedicated Trust Wallet provider
  if (window.trustwallet) return window.trustwallet;

  // Window.ethereum with providers array (multi-wallet)
  if (window.ethereum?.providers?.length) {
    const tw = window.ethereum.providers.find((p: any) => p.isTrust || p.isTrustWallet);
    if (tw) return tw;
    return window.ethereum.providers[0];
  }

  // Window.ethereum single
  if (window.ethereum) return window.ethereum;

  // Binance Web3 Wallet
  if (window.binancew3w?.ethereum) return window.binancew3w.ethereum;

  return null;
}

export function isTrustWallet(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.trustwallet ||
    window.ethereum?.isTrust ||
    window.ethereum?.isTrustWallet
  );
}

/**
 * Connect to user's Trust Wallet or EVM wallet.
 */
export async function connectWallet(): Promise<{
  address: string;
  chainId: number;
  provider: ethers.BrowserProvider;
}> {
  const eth = getEthereumProvider();
  if (!eth) {
    // If mobile user has no in-app browser or extension, provide deep link to Trust Wallet
    const currentUrl = encodeURIComponent(window.location.href);
    const trustDeepLink = `https://link.trustwallet.com/open_url?coin_id=20000714&url=${currentUrl}`;
    
    // Throw descriptive error with deep link option
    const err: any = new Error('No Web3 wallet found. Please open this page inside Trust Wallet Browser or MetaMask.');
    err.deepLink = trustDeepLink;
    throw err;
  }

  // Request accounts
  const accounts = await eth.request({ method: 'eth_requestAccounts' });
  if (!accounts || accounts.length === 0) {
    throw new Error('No account authorized from Trust Wallet.');
  }

  const rawChainId = await eth.request({ method: 'eth_chainId' });
  const chainId = parseInt(rawChainId, 16);

  const browserProvider = new ethers.BrowserProvider(eth);

  return {
    address: ethers.getAddress(accounts[0]),
    chainId,
    provider: browserProvider,
  };
}

/**
 * Switch chain to BNB Smart Chain Mainnet (Chain ID 56).
 * Adds the chain automatically if not yet configured in Trust Wallet.
 */
export async function switchToBscNetwork(): Promise<boolean> {
  const eth = getEthereumProvider();
  if (!eth) return false;

  try {
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BSC_CONFIG.chainIdHex }],
    });
    return true;
  } catch (switchError: any) {
    // 4902 code indicates chain is not added to wallet yet
    if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      try {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: BSC_CONFIG.chainIdHex,
              chainName: BSC_CONFIG.chainName,
              nativeCurrency: BSC_CONFIG.nativeCurrency,
              rpcUrls: BSC_CONFIG.rpcUrls,
              blockExplorerUrls: BSC_CONFIG.blockExplorerUrls,
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Failed to add BNB Smart Chain:', addError);
        throw addError;
      }
    }
    throw switchError;
  }
}

/**
 * Fetch real-time BNB and USDT BEP-20 balance for a given wallet address.
 */
export async function fetchWalletBalances(address: string): Promise<{ bnb: number; usdt: number }> {
  try {
    const eth = getEthereumProvider();
    const provider = eth ? new ethers.BrowserProvider(eth) : new ethers.JsonRpcProvider(BSC_CONFIG.rpcUrls[0]);

    // 1. Native BNB balance
    const bnbBalanceRaw = await provider.getBalance(address);
    const bnb = Number(ethers.formatEther(bnbBalanceRaw));

    // 2. USDT BEP-20 balance
    const usdtContract = new ethers.Contract(OFFICIAL_USDT_BEP20_CONTRACT, ERC20_ABI, provider);
    const usdtBalanceRaw = await usdtContract.balanceOf(address);
    const usdt = Number(ethers.formatUnits(usdtBalanceRaw, 18));

    return { bnb, usdt };
  } catch (err) {
    console.warn('Could not query wallet balances:', err);
    return { bnb: 0, usdt: 0 };
  }
}

/**
 * Sign an ownership verification message with Trust Wallet to confirm wallet control.
 */
export async function signWalletOwnership(
  address: string,
  userUid: string
): Promise<{ signature: string; message: string }> {
  const eth = getEthereumProvider();
  if (!eth) throw new Error('Wallet provider not available.');

  const provider = new ethers.BrowserProvider(eth);
  const signer = await provider.getSigner();

  const timestamp = Date.now();
  const message = `CM Network Identity KYC Verification\n\nI confirm ownership of wallet ${address} for user ${userUid} on BNB Smart Chain.\nTimestamp: ${timestamp}`;

  const signature = await signer.signMessage(message);

  return { signature, message };
}

/**
 * Execute real USDT BEP-20 transfer using Trust Wallet.
 * Only sends the EXACT required KYC fee to the official receiving wallet.
 * Never requests unlimited approval.
 */
export async function executeUsdtTransfer(
  receivingWallet: string,
  amountUsdt: number
): Promise<{ txHash: string }> {
  const eth = getEthereumProvider();
  if (!eth) throw new Error('Trust Wallet or Web3 provider not connected.');

  // Ensure network is BSC
  await switchToBscNetwork();

  const provider = new ethers.BrowserProvider(eth);
  const signer = await provider.getSigner();

  // USDT BEP-20 Contract instance connected to signer
  const usdtContract = new ethers.Contract(OFFICIAL_USDT_BEP20_CONTRACT, ERC20_ABI, signer);

  // Convert amount into 18 decimals BigInt
  const valueWei = ethers.parseUnits(amountUsdt.toString(), 18);

  // Execute standard ERC-20 transfer
  const tx = await usdtContract.transfer(receivingWallet, valueWei);

  return { txHash: tx.hash };
}
