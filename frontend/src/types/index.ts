export type CampaignStatus = 'DRAFT' | 'PENDING_VERIFICATION' | 'ACTIVE' | 'REJECTED' | 'COMPLETED';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REUPLOAD_REQUESTED';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Campaign {
  _id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  recipientWallet: string;
  status: CampaignStatus;
  verificationId?: string | any;
  documentHash?: string;
  ipfsCid?: string;
  txHash?: string;
  createdAt: string;
}

export interface AIVerificationResult {
  documentType: string;
  confidence: number;
  risk: RiskLevel;
  summary: string;
  recommendation: string;
  extractedText?: string;
}

export interface VerificationRecord {
  _id: string;
  campaignId?: string;
  documentId: string;
  documentType: string;
  confidence: number;
  risk: RiskLevel;
  summary: string;
  recommendation: string;
  extractedText?: string;
  status: VerificationStatus;
  reviewedBy?: string;
  reviewNotes?: string;
  onChainTxHash?: string;
  createdAt: string;
}

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
    risk: RiskLevel;
    summary: string;
    recommendation: string;
  };
  metrics: {
    totalDonationsEth: number;
    donorCount: number;
    verificationCompletedAt?: string;
  };
}

export interface User {
  id?: string;
  _id?: string;
  walletAddress: string;
  role: 'user' | 'donor' | 'admin';
}
