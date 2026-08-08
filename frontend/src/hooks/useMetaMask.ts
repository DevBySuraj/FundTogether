import { useState, useCallback } from 'react';
import { ethers } from 'ethers';

// ─── Polygon Amoy Testnet Configuration ──────────────────────────────────────
export const POLYGON_AMOY_CHAIN_ID = 80002;

// Multiple reliable public RPCs — MetaMask picks the first one that responds.
// Ordered by reliability: Ankr > dRPC > official (rate-limited)
export const POLYGON_AMOY_CONFIG = {
  chainId: '0x13882', // 80002 in hex
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
  rpcUrls: [
    'https://rpc.ankr.com/polygon_amoy',        // Ankr — high rate limit, no key needed
    'https://polygon-amoy.drpc.org',             // dRPC — decentralized, reliable
    'https://rpc-amoy.polygon.technology',       // Official — fallback (rate-limited)
  ],
  blockExplorerUrls: ['https://amoy.polygonscan.com'],
};

// Contract address from env (Vite)
export const CONTRACT_ADDRESS =
  (import.meta.env.VITE_CONTRACT_ADDRESS as string) || '';

export interface MetaMaskState {
  isInstalled: boolean;
  account: string | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
}

export interface UseMetaMaskReturn extends MetaMaskState {
  connectWallet: () => Promise<string | null>;
  switchToPolygonAmoy: () => Promise<boolean>;
  getProvider: () => ethers.BrowserProvider | null;
  getSigner: () => Promise<ethers.Signer | null>;
  isCorrectNetwork: boolean;
}

// ─── Read chainId directly from MetaMask without an RPC round-trip ───────────
// eth_chainId is answered by MetaMask locally — no network call, no rate limit.
const getChainIdFromMetaMask = async (): Promise<number | null> => {
  try {
    const chainIdHex = await (window as any).ethereum.request({
      method: 'eth_chainId',
    });
    return parseInt(chainIdHex, 16);
  } catch {
    return null;
  }
};

export const useMetaMask = (): UseMetaMaskReturn => {
  const [state, setState] = useState<MetaMaskState>({
    isInstalled: typeof window !== 'undefined' && !!(window as any).ethereum,
    account: null,
    chainId: null,
    isConnecting: false,
    error: null,
  });

  const isCorrectNetwork = state.chainId === POLYGON_AMOY_CHAIN_ID;

  const getProvider = useCallback((): ethers.BrowserProvider | null => {
    if (!(window as any).ethereum) return null;
    return new ethers.BrowserProvider((window as any).ethereum);
  }, []);

  const getSigner = useCallback(async (): Promise<ethers.Signer | null> => {
    const provider = getProvider();
    if (!provider) return null;
    try {
      return await provider.getSigner();
    } catch {
      return null;
    }
  }, [getProvider]);

  const connectWallet = useCallback(async (): Promise<string | null> => {
    if (!(window as any).ethereum) {
      setState((s) => ({
        ...s,
        error: 'MetaMask is not installed. Please install MetaMask from metamask.io',
        isInstalled: false,
      }));
      return null;
    }

    setState((s) => ({ ...s, isConnecting: true, error: null }));

    try {
      // eth_requestAccounts — answered by MetaMask locally, no RPC call
      const accounts: string[] = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts authorized. Please unlock MetaMask.');
      }

      const account = accounts[0].toLowerCase();

      // eth_chainId — also answered locally by MetaMask wallet, zero RPC traffic
      const chainId = await getChainIdFromMetaMask();

      setState((s) => ({
        ...s,
        account,
        chainId,
        isConnecting: false,
        error: null,
        isInstalled: true,
      }));

      return account;
    } catch (err: any) {
      const msg =
        err.code === 4001
          ? 'Connection rejected. Please accept the MetaMask prompt.'
          : err.message || 'Failed to connect MetaMask.';
      setState((s) => ({ ...s, isConnecting: false, error: msg }));
      return null;
    }
  }, []);

  const switchToPolygonAmoy = useCallback(async (): Promise<boolean> => {
    if (!(window as any).ethereum) return false;
    try {
      // wallet_switchEthereumChain — local MetaMask call, no RPC
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_AMOY_CONFIG.chainId }],
      });
      setState((s) => ({ ...s, chainId: POLYGON_AMOY_CHAIN_ID, error: null }));
      return true;
    } catch (switchError: any) {
      // 4902: chain not added yet — add with better RPC URLs
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [POLYGON_AMOY_CONFIG], // includes Ankr + dRPC + official
          });
          setState((s) => ({ ...s, chainId: POLYGON_AMOY_CHAIN_ID, error: null }));
          return true;
        } catch (addError: any) {
          setState((s) => ({
            ...s,
            error: 'Failed to add Polygon Amoy network to MetaMask.',
          }));
          return false;
        }
      }
      if (switchError.code === 4001) {
        setState((s) => ({ ...s, error: 'Network switch rejected by user.' }));
      } else {
        setState((s) => ({ ...s, error: 'Failed to switch network.' }));
      }
      return false;
    }
  }, []);

  return {
    ...state,
    isCorrectNetwork,
    connectWallet,
    switchToPolygonAmoy,
    getProvider,
    getSigner,
  };
};
