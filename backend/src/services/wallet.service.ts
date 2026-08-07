import crypto from 'crypto';
import { verifyMessage } from 'ethers';
import { User } from '../models/User';
import { Campaign } from '../models/Campaign';
import { Notification } from '../models/Notification';
import { Types } from 'mongoose';

export interface VerifyWalletParams {
  userId: string;
  walletAddress: string;
  signature: string;
  campaignId?: string;
}

export class WalletService {
  /**
   * Step 1 & 2: Generate a secure 10-minute random nonce for Recipient wallet verification
   */
  public async generateNonce(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'recipient' && user.role !== 'user') {
      throw new Error('Wallet ownership verification is restricted to Recipient accounts only.');
    }

    // Generate secure random UUID nonce
    const nonce = crypto.randomUUID();
    const nonceExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes TTL

    user.walletNonce = nonce;
    user.walletNonceExpires = nonceExpires;
    await user.save();

    return {
      message: 'FundTogether Wallet Verification',
      nonce,
      expiresAt: nonceExpires.toISOString(),
    };
  }

  /**
   * Step 4 & 5 & 6: Recreate message, verify signature using ethers.js, update Recipient, and activate Campaign
   */
  public async verifyWalletSignature({ userId, walletAddress, signature, campaignId }: VerifyWalletParams) {
    if (!walletAddress || !signature) {
      throw new Error('walletAddress and signature are required');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'recipient' && user.role !== 'user') {
      throw new Error('Only Recipient accounts can verify wallet ownership.');
    }

    // Check nonce availability & 10-minute expiration
    if (!user.walletNonce || !user.walletNonceExpires) {
      throw new Error('No active verification nonce found. Please request a new nonce.');
    }

    if (new Date() > new Date(user.walletNonceExpires)) {
      user.walletNonce = undefined;
      user.walletNonceExpires = undefined;
      await user.save();
      throw new Error('Verification nonce has expired (10 minutes limit). Please request a new nonce.');
    }

    // Recreate exact signed message format
    const message = `FundTogether Wallet Verification\n\nNonce: ${user.walletNonce}`;

    // Recover address using ethers.js v6
    let recoveredAddress: string;
    try {
      recoveredAddress = verifyMessage(message, signature);
    } catch (err: any) {
      throw new Error(`Invalid signature format: ${err.message || 'Signature recovery failed'}`);
    }

    const cleanWallet = walletAddress.toLowerCase().trim();
    const cleanRecovered = recoveredAddress.toLowerCase().trim();

    // Strict wallet ownership comparison
    if (cleanRecovered !== cleanWallet) {
      throw new Error(`Wallet ownership verification failed. Recovered signature address (${cleanRecovered}) does not match submitted wallet address (${cleanWallet}).`);
    }

    // Step 5: Update Recipient user model in MongoDB
    user.walletAddress = cleanWallet;
    user.walletVerified = true;
    user.isVerified = true;
    user.walletVerifiedAt = new Date();
    user.walletNonce = undefined;
    user.walletNonceExpires = undefined;
    await user.save();

    // Step 6: Campaign Activation (Change status from APPROVED / DRAFT / PENDING_VERIFICATION to ACTIVE)
    let activatedCampaign: any = null;

    if (campaignId && Types.ObjectId.isValid(campaignId)) {
      activatedCampaign = await Campaign.findById(campaignId);
      if (activatedCampaign) {
        activatedCampaign.recipientWallet = cleanWallet;
        activatedCampaign.status = 'ACTIVE';
        await activatedCampaign.save();
      }
    } else {
      // Activate recipient's latest campaign
      activatedCampaign = await Campaign.findOneAndUpdate(
        {
          $or: [{ userId: user._id }, { recipientWallet: cleanWallet }],
          status: { $in: ['APPROVED', 'PENDING_VERIFICATION', 'DRAFT'] },
        },
        {
          recipientWallet: cleanWallet,
          status: 'ACTIVE',
        },
        { new: true, sort: { createdAt: -1 } }
      );
    }

    // Create notification
    await Notification.create({
      userId: user._id,
      title: 'MetaMask Wallet Verified & Campaign Activated!',
      message: `Wallet ${cleanWallet.substring(0, 6)}...${cleanWallet.substring(cleanWallet.length - 4)} successfully linked and verified. Your campaign is now ACTIVE and visible to Donors!`,
      type: 'success',
    });

    return {
      walletConnected: true,
      walletVerified: true,
      isVerified: true,
      walletAddress: cleanWallet,
      walletVerifiedAt: user.walletVerifiedAt,
      campaignActivated: !!activatedCampaign,
      activeCampaignId: activatedCampaign?._id || null,
    };
  }

  /**
   * GET /wallet/status
   */
  public async getWalletStatus(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      walletConnected: !!user.walletAddress,
      walletVerified: !!user.walletVerified,
      isVerified: !!user.isVerified,
      walletAddress: user.walletAddress || null,
      walletVerifiedAt: user.walletVerifiedAt || null,
    };
  }
}

export const walletService = new WalletService();
