import { Campaign } from '../../models/Campaign';
import { Verification } from '../../models/Verification';
import { Transaction } from '../../models/Transaction';

export interface TrustReport {
  campaignId: string;
  campaignTitle: string;
  trustScore: number;
  verificationStatus: string;
  onChainVerified: boolean;
  documentHash?: string;
  ipfsCid?: string;
  ipfsUrl?: string;
  onChainTxHash?: string;
  aiVerificationDetails?: {
    documentType: string;
    confidence: number;
    risk: string;
    summary: string;
    recommendation: string;
  };
  metrics: {
    totalDonationsEth: number;
    donorCount: number;
    verificationCompletedAt?: Date;
  };
}

export class TrustScoreService {
  /**
   * Calculates dynamic Trust Score (0-100) and generates detailed transparency trust report.
   */
  public async generateTrustReport(campaignId: string): Promise<TrustReport> {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    let verificationDoc = null;
    if (campaign.verificationId) {
      verificationDoc = await Verification.findById(campaign.verificationId);
    }

    const transactions = await Transaction.find({ campaignId: campaign._id });
    const totalDonations = transactions.reduce((acc, tx) => acc + parseFloat(tx.amountEth || '0'), 0);
    const donorCount = new Set(transactions.map((tx) => tx.donorWallet)).size;

    let score = 30; // Base score for draft campaign

    if (verificationDoc) {
      if (verificationDoc.status === 'APPROVED') score += 40;
      else if (verificationDoc.status === 'PENDING') score += 15;

      // Add score based on AI confidence
      const aiBonus = Math.round((verificationDoc.confidence / 100) * 20);
      score += aiBonus;
    }

    if (campaign.ipfsCid && campaign.documentHash && campaign.txHash) {
      score += 10; // On-chain proof bonus
    }

    score = Math.min(100, Math.max(0, score));

    return {
      campaignId: campaign._id.toString(),
      campaignTitle: campaign.title,
      trustScore: score,
      verificationStatus: campaign.status,
      onChainVerified: !!(campaign.txHash && campaign.documentHash),
      documentHash: campaign.documentHash,
      ipfsCid: campaign.ipfsCid,
      ipfsUrl: campaign.ipfsCid ? `https://gateway.pinata.cloud/ipfs/${campaign.ipfsCid}` : undefined,
      onChainTxHash: campaign.txHash,
      aiVerificationDetails: verificationDoc
        ? {
            documentType: verificationDoc.documentType,
            confidence: verificationDoc.confidence,
            risk: verificationDoc.risk,
            summary: verificationDoc.summary,
            recommendation: verificationDoc.recommendation,
          }
        : undefined,
      metrics: {
        totalDonationsEth: totalDonations,
        donorCount,
        verificationCompletedAt: verificationDoc?.updatedAt,
      },
    };
  }
}

export const trustScoreService = new TrustScoreService();
