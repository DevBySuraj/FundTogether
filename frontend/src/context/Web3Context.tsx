import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { authAPI } from '../services/api';
import { User } from '../types';

interface Web3ContextType {
  account: string | null;
  user: User | null;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  connectWalletWithRole: (role: 'user' | 'donor' | 'admin') => Promise<void>;
  setUserSession: (user: User, token: string) => void;
  disconnectWallet: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('trustchain_user');
    const token = localStorage.getItem('trustchain_token');
    if (savedUser && token) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setAccount(parsed.walletAddress || null);
      } catch (err) {
        localStorage.removeItem('trustchain_user');
        localStorage.removeItem('trustchain_token');
        setUser(null);
        setAccount(null);
      }
    } else {
      setUser(null);
      setAccount(null);
    }
  }, []);

  const setUserSession = (loggedUser: User, token: string) => {
    // Strictly preserve role stored in DB from backend JWT/User payload
    setUser(loggedUser);
    setAccount(loggedUser.walletAddress || null);
    localStorage.setItem('trustchain_user', JSON.stringify(loggedUser));
    localStorage.setItem('trustchain_token', token);
  };

  const connectWalletWithRole = async (role: 'user' | 'donor' | 'admin') => {
    await connectWallet();
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!(window as any).ethereum) {
        throw new Error('MetaMask is not installed in your browser. Please install MetaMask to connect your wallet.');
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);

      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet accounts authorized.');
      }

      const selectedAccount = accounts[0].toLowerCase();
      setAccount(selectedAccount);

      const nonceRes = await authAPI.connectWallet(selectedAccount);
      const nonce = nonceRes.data.nonce;

      const signer = await provider.getSigner();
      const signature = await signer.signMessage(nonce);

      const verifyRes = await authAPI.verifySignature(selectedAccount, signature);

      if (verifyRes.data && verifyRes.data.token) {
        setUserSession(verifyRes.data.user, verifyRes.data.token);
      }
    } catch (err: any) {
      console.error('Wallet connect error:', err);
      setError(err.message || 'Failed to connect Metamask wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setUser(null);
    localStorage.removeItem('trustchain_user');
    localStorage.removeItem('trustchain_token');
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        user,
        isConnecting,
        error,
        connectWallet,
        connectWalletWithRole,
        setUserSession,
        disconnectWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
