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
  connectWalletWithRole: (role: 'user' | 'donor') => Promise<void>;
  setRole: (role: 'user' | 'donor') => void;
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
        setAccount(parsed.walletAddress);
      } catch (err) {
        localStorage.removeItem('trustchain_user');
        localStorage.removeItem('trustchain_token');
      }
    } else {
      // Default to Donor role initially so all published campaigns are visible
      const demoAccount = '0x71c7656ec7ab88b098defb751B7401b5f6d8976f';
      const demoUser: User = {
        id: 'demo-user-123',
        walletAddress: demoAccount,
        role: 'donor',
      };
      setUser(demoUser);
      setAccount(demoAccount);
      localStorage.setItem('trustchain_user', JSON.stringify(demoUser));
      localStorage.setItem('trustchain_token', 'demo_jwt_token_123');
    }
  }, []);

  const setRole = (role: 'user' | 'donor') => {
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
      localStorage.setItem('trustchain_user', JSON.stringify(updated));
    }
  };

  const connectWalletWithRole = async (role: 'user' | 'donor') => {
    await connectWallet();
    setRole(role);
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!(window as any).ethereum) {
        // Fallback demo wallet mode if MetaMask extension is not installed
        const demoAccount = '0x71c7656ec7ab88b098defb751B7401b5f6d8976f';
        setAccount(demoAccount);
        const demoUser: User = {
          id: 'demo-user-123',
          walletAddress: demoAccount,
          role: user?.role || 'donor',
        };
        setUser(demoUser);
        localStorage.setItem('trustchain_user', JSON.stringify(demoUser));
        localStorage.setItem('trustchain_token', 'demo_jwt_token_123');
        return;
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);

      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet accounts authorized.');
      }

      const selectedAccount = accounts[0].toLowerCase();
      setAccount(selectedAccount);

      // 1. Fetch challenge nonce from backend
      const nonceRes = await authAPI.connectWallet(selectedAccount);
      const nonce = nonceRes.data.nonce;

      // 2. Request user signature via Ethers signer
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(nonce);

      // 3. Verify signature on backend & obtain JWT
      const verifyRes = await authAPI.verifySignature(selectedAccount, signature);

      const token = verifyRes.data.token;
      const userData: User = { ...verifyRes.data.user, role: user?.role || 'donor' };

      localStorage.setItem('trustchain_token', token);
      localStorage.setItem('trustchain_user', JSON.stringify(userData));

      setUser(userData);
    } catch (err: any) {
      console.error('Wallet connection error, using demo wallet fallback:', err);
      const demoAccount = '0x71c7656ec7ab88b098defb751B7401b5f6d8976f';
      setAccount(demoAccount);
      const demoUser: User = {
        id: 'demo-user-123',
        walletAddress: demoAccount,
        role: user?.role || 'donor',
      };
      setUser(demoUser);
      localStorage.setItem('trustchain_user', JSON.stringify(demoUser));
      localStorage.setItem('trustchain_token', 'demo_jwt_token_123');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setUser(null);
    localStorage.removeItem('trustchain_token');
    localStorage.removeItem('trustchain_user');
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
        setRole,
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
