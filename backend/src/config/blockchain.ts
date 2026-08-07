import { ethers } from 'ethers';
import { env } from './env';

export interface BlockchainConfig {
  provider: ethers.JsonRpcProvider | null;
  wallet: ethers.Wallet | null;
  contractAddress: string;
}

let configInstance: BlockchainConfig | null = null;

export const getBlockchainConfig = (): BlockchainConfig => {
  if (!configInstance) {
    let provider: ethers.JsonRpcProvider | null = null;
    let wallet: ethers.Wallet | null = null;

    if (env.rpcUrl && env.rpcUrl.startsWith('http')) {
      try {
        provider = new ethers.JsonRpcProvider(env.rpcUrl);
        if (env.privateKey && env.privateKey.startsWith('0x') && env.privateKey.length === 66) {
          wallet = new ethers.Wallet(env.privateKey, provider);
        }
      } catch (err) {
        console.warn('[Blockchain Config] Failed to initialize live JsonRpcProvider:', err);
      }
    }

    configInstance = {
      provider,
      wallet,
      contractAddress: env.contractAddress,
    };
  }
  return configInstance;
};
