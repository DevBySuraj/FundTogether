import { ethers } from 'ethers';
import { User } from '../../models/User';
import { generateNonce } from '../../utils/crypto';
import { normalizeWalletAddress, isValidEthereumAddress } from '../../utils/validator';
import { logger } from '../../utils/logger';

export class WalletService {
  /**
   * Generates or retrieves existing nonce for wallet authentication.
   */
  public async getOrCreateNonce(walletAddress: string): Promise<string> {
    if (!isValidEthereumAddress(walletAddress)) {
      throw new Error('Invalid Ethereum wallet address format.');
    }

    const normalized = normalizeWalletAddress(walletAddress);
    let user = await User.findOne({ walletAddress: normalized });

    const nonce = generateNonce();

    if (!user) {
      user = await User.create({
        walletAddress: normalized,
        nonce,
        role: 'user',
      });
      logger.info(`[Wallet Service] Registered new user with wallet: ${normalized}`);
    } else {
      user.nonce = nonce;
      await user.save();
    }

    return nonce;
  }

  /**
   * Verifies signed message signature from wallet using ethers.js.
   */
  public async verifySignature(walletAddress: string, signature: string): Promise<boolean> {
    if (!isValidEthereumAddress(walletAddress)) {
      return false;
    }

    const normalized = normalizeWalletAddress(walletAddress);
    const user = await User.findOne({ walletAddress: normalized });

    if (!user || !user.nonce) {
      return false;
    }

    try {
      const recoveredAddress = ethers.verifyMessage(user.nonce, signature);
      const isMatch = normalizeWalletAddress(recoveredAddress) === normalized;

      if (isMatch) {
        // Rotate nonce after successful verification to prevent replay attacks
        user.nonce = generateNonce();
        await user.save();
      }

      return isMatch;
    } catch (error) {
      logger.warn('[Wallet Service] Signature verification error:', error);
      return false;
    }
  }
}

export const walletService = new WalletService();
