export type CampaignStatus = 'DRAFT' | 'PENDING_VERIFICATION' | 'APPROVED' | 'ACTIVE' | 'REJECTED' | 'COMPLETED';
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
  campaignOnChainId?: number;
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
  email?: string;
  name?: string;
  profilePicture?: string;
  walletAddress?: string;
  walletVerified?: boolean;
  role: 'recipient' | 'user' | 'donor' | 'admin';
}

// ─── Donation Types ──────────────────────────────────────────────────────────

export type DonationStep =
  | 'idle'
  | 'connecting'
  | 'wrong_network'
  | 'entering_amount'
  | 'confirming'
  | 'mining'
  | 'notifying'
  | 'success'
  | 'error';

export interface DonationState {
  step: DonationStep;
  txHash: string | null;
  blockNumber: number | null;
  amount: string;
  error: string | null;
  onChainVerified: boolean;
}

export interface DonationRecord {
  _id?: string;
  campaignId: string;
  donorWallet: string;
  recipientWallet: string;
  amountEth: string;
  txHash: string;
  blockNumber?: number;
  timestamp: string;
}

export interface DonationConfirmPayload {
  campaignId: string;
  transactionHash: string;
  donorWallet: string;
  amount: string;
}

export interface DonationConfirmResult {
  txHash: string;
  blockNumber?: number;
  onChainVerified: boolean;
  campaignId: string;
  campaignTitle: string;
  donorWallet: string;
  amount: string;
}
