import { ethers } from 'ethers';

export const isValidEthereumAddress = (address: string): boolean => {
  if (!address) return false;
  return ethers.isAddress(address);
};

export const normalizeWalletAddress = (address: string): string => {
  return address.trim().toLowerCase();
};
