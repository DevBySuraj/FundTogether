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

    const rpcUrl = env.rpcUrl ? env.rpcUrl.trim() : '';
    const isPlaceholderRpc = !rpcUrl ||
      rpcUrl.includes('your_infura_key') ||
      rpcUrl.includes('your_rpc_url') ||
      rpcUrl.includes('your_key');

    if (rpcUrl && rpcUrl.startsWith('http') && !isPlaceholderRpc) {
      try {
        // Option static network prevents background retries if network detection fails
        provider = new ethers.JsonRpcProvider(rpcUrl, undefined, { staticNetwork: true });
        if (env.privateKey && env.privateKey.startsWith('0x') && env.privateKey.length === 66 && !env.privateKey.includes('00000000000000')) {
          wallet = new ethers.Wallet(env.privateKey, provider);
        }
      } catch (err) {
        console.warn('[Blockchain Config] Failed to initialize live JsonRpcProvider:', err);
      }
    } else {
      console.log('[Blockchain Config] RPC_URL unconfigured or using placeholder template. Operating in local dev mode with simulated on-chain proofs.');
    }

    configInstance = {
      provider,
      wallet,
      contractAddress: env.contractAddress,
    };
  }
  return configInstance;
};
