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

    const pendingCampaigns = await Campaign.find({
      status: { $in: ['DRAFT', 'PENDING_VERIFICATION'] },
    }).sort({ createdAt: -1 });

    return {
      verifications,
      pendingCampaigns,
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
