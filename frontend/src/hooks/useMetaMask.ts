import { useState, useCallback } from 'react';
import { ethers } from 'ethers';

// ─── Polygon Amoy Testnet Configuration ──────────────────────────────────────
export const POLYGON_AMOY_CHAIN_ID = 80002;
export const POLYGON_AMOY_CONFIG = {
  chainId: '0x13882', // 80002 in hex
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
  rpcUrls: ['https://rpc-amoy.polygon.technology'],
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
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts authorized. Please unlock MetaMask.');
      }

      const account = accounts[0].toLowerCase();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

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
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_AMOY_CONFIG.chainId }],
      });
      setState((s) => ({ ...s, chainId: POLYGON_AMOY_CHAIN_ID, error: null }));
      return true;
    } catch (switchError: any) {
      // Error code 4902: chain not added to MetaMask — add it
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [POLYGON_AMOY_CONFIG],
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
