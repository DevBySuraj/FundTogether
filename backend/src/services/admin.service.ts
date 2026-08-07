import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Campaign } from '../models/Campaign';
import { Verification } from '../models/Verification';
import { generateJwt } from '../utils/jwt';
import { IUser } from '../interfaces/user.interface';

export interface AdminLoginParams {
  email: string;
  password: string;
}

export interface AdminAuthResult {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export class AdminService {
  /**
   * Admin Authentication Service
   * Verifies email + hashed password for admin accounts
   */
  public async adminLogin({ email, password }: AdminLoginParams): Promise<AdminAuthResult> {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Find user by email
    const user = await User.findOne({ email: cleanEmail });

    if (!user || user.role !== 'admin' || !user.password) {
      throw new Error('Invalid email or password');
    }

    // 2. Compare password hash using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // 3. Generate signed JWT containing admin role (7 day expiration)
    const token = generateJwt({
      id: user._id.toString(),
      email: user.email,
      role: 'admin',
    });

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name || 'Platform Administrator',
        email: user.email!,
        role: 'admin',
      },
    };
  }

  /**
   * Fetch Admin Profile by ID
   */
  public async getAdminProfile(adminId: string): Promise<IUser | null> {
    return await User.findById(adminId).select('-password');
  }

  /**
   * Get all pending campaigns and verifications for admin review
   */
  public async getPendingCampaigns(statusFilter?: string) {
    const queryFilter: any = {};
    if (statusFilter && statusFilter !== 'ALL') {
      queryFilter.status = statusFilter;
    }

    const verifications = await Verification.find(queryFilter)
      .populate('documentId')
      .populate('campaignId')
      .sort({ createdAt: -1 });

    const campaignFilter: any = {};
    if (statusFilter && statusFilter !== 'ALL') {
      campaignFilter.status = statusFilter;
    }

    const campaigns = await Campaign.find(campaignFilter)
      .populate('verificationId')
      .sort({ createdAt: -1 });

    // Combine verifications and standalone campaigns into a unified list
    const verificationCampaignIds = new Set(
      verifications.map((v: any) => v.campaignId?._id?.toString() || v.campaignId?.toString()).filter(Boolean)
    );

    const formattedVerifications = verifications.map((v: any) => ({
      _id: v._id,
      campaignId: v.campaignId?._id || v.campaignId || v._id,
      title: v.campaignId?.title || 'Medical Fundraiser Audit',
      description: v.campaignId?.description || v.summary || 'Uploaded for AI verification',
      targetAmount: v.campaignId?.targetAmount || 100000,
      currentAmount: v.campaignId?.currentAmount || 0,
      category: v.campaignId?.category || 'Medical',
      recipientWallet: v.campaignId?.recipientWallet || '0x...',
      status: v.campaignId?.status || v.status || 'PENDING_VERIFICATION',
      confidence: v.confidence || 92,
      risk: v.risk || 'Low',
      summary: v.summary,
      recommendation: v.recommendation,
      documentType: v.documentType,
      verificationRecord: v,
      createdAt: v.createdAt,
    }));

    const standaloneCampaigns = campaigns
      .filter((c) => !verificationCampaignIds.has(c._id.toString()))
      .map((c: any) => ({
        _id: c._id,
        campaignId: c._id,
        title: c.title,
        description: c.description,
        targetAmount: c.targetAmount,
        currentAmount: c.currentAmount,
        category: c.category,
        recipientWallet: c.recipientWallet,
        status: c.status,
        confidence: c.verificationId?.confidence || 90,
        risk: c.verificationId?.risk || 'Low',
        summary: c.verificationId?.summary || 'Campaign pending verification',
        recommendation: c.verificationId?.recommendation || 'REVIEW_DOCUMENTS',
        createdAt: c.createdAt,
      }));

    const unifiedList = [...formattedVerifications, ...standaloneCampaigns];

    return {
      verifications,
      pendingCampaigns: campaigns,
      unifiedList,
    };
  }

  /**
   * Approve a campaign verification & update recipient user verification flags
   */
  public async approveCampaign(campaignId: string, notes?: string, reviewer?: string) {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    campaign.status = 'ACTIVE';
    await campaign.save();

    await Verification.updateMany(
      { campaignId: campaign._id },
      { status: 'APPROVED', reviewNotes: notes || 'Approved by Admin', reviewedBy: reviewer }
    );

    // Update Recipient User verification status in MongoDB
    if (campaign.userId) {
      await User.findByIdAndUpdate(campaign.userId, {
        isVerified: true,
        walletVerified: true,
        walletVerifiedAt: new Date(),
      });
    }

    return campaign;
  }

  /**
   * Reject a campaign
   */
  public async rejectCampaign(campaignId: string, reason?: string, reviewer?: string) {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    campaign.status = 'REJECTED';
    await campaign.save();

    await Verification.updateMany(
      { campaignId: campaign._id },
      { status: 'REJECTED', reviewNotes: reason || 'Rejected during admin audit', reviewedBy: reviewer }
    );

    return campaign;
  }

  /**
   * Request document resubmission for a campaign
   */
  public async requestResubmission(campaignId: string, reason?: string, reviewer?: string) {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    campaign.status = 'PENDING_VERIFICATION';
    await campaign.save();

    await Verification.updateMany(
      { campaignId: campaign._id },
      { status: 'REUPLOAD_REQUESTED', reviewNotes: reason || 'Reupload requested by Admin', reviewedBy: reviewer }
    );

    return campaign;
  }
}

export const adminService = new AdminService();
