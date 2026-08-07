import { User } from '../models/User';
import { Campaign } from '../models/Campaign';
import { DocumentModel } from '../models/Document';
import { Transaction } from '../models/Transaction';
import { Notification } from '../models/Notification';
import { verifyGoogleIdToken } from '../utils/google';
import { generateJwt } from '../utils/jwt';
import { UserRole, IUser } from '../interfaces/user.interface';
import { Types } from 'mongoose';

export interface GoogleLoginParams {
  idToken: string;
  role?: string;
}

export interface AuthResult {
  token: string;
  user: any;
  isNewUser: boolean;
}

export class AuthService {
  /**
   * Google OAuth Login & Automatic Registration
   * - First time sign-in: Creates user and sets role (recipient or donor).
   * - Subsequent sign-ins: Ignores request role, uses immutable role stored in MongoDB.
   */
  public async googleLogin({ idToken, role }: GoogleLoginParams): Promise<AuthResult> {
    // 1. Verify Google ID Token
    const googlePayload = await verifyGoogleIdToken(idToken);

    // 2. Search existing user in MongoDB by googleId or email
    let user = await User.findOne({
      $or: [{ googleId: googlePayload.googleId }, { email: googlePayload.email }],
    });

    let isNewUser = false;

    if (!user) {
      // 3. FIRST TIME REGISTRATION: Determine initial role (Recipient or Donor only)
      let initialRole: UserRole = 'donor';
      if (role) {
        const lowerRole = role.toLowerCase();
        if (lowerRole === 'recipient' || lowerRole === 'user') {
          initialRole = 'recipient';
        } else if (lowerRole === 'donor') {
          initialRole = 'donor';
        }
      }

      // Create new user in DB with immutable initial role
      user = await User.create({
        googleId: googlePayload.googleId,
        name: googlePayload.name,
        email: googlePayload.email,
        profilePicture: googlePayload.profilePicture,
        role: initialRole,
        isVerified: false,
      });

      // Create welcome notification
      await Notification.create({
        userId: user._id,
        title: `Welcome to FundTogether!`,
        message: `Your ${initialRole.toUpperCase()} account has been successfully initialized.`,
        type: 'info',
      });

      isNewUser = true;
    } else {
      // 4. SUBSEQUENT LOGINS: Ignore frontend role param, preserve DB stored role
      if (!user.googleId) user.googleId = googlePayload.googleId;
      if (googlePayload.profilePicture && !user.profilePicture) {
        user.profilePicture = googlePayload.profilePicture;
      }
      await user.save();
    }

    // 5. Generate signed JWT containing stored DB user role
    const token = generateJwt({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // 6. Aggregate user-specific profile data
    const fullProfile = await this.getUserProfile(user._id.toString());

    return { token, user: fullProfile || user, isNewUser };
  }

  /**
   * Get Relational User Profile by User ID
   * Retrieves data strictly belonging to the authenticated user ID:
   * - Recipient: Profile, Campaigns, Campaign Status, Verification Status, Total Funds Raised, Uploaded Documents, Notifications
   * - Donor: Profile, Donation History, Total Donated, Wallet Info, Notifications
   */
  public async getUserProfile(userId: string): Promise<any> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }

    const user = await User.findById(userId).select('-password');
    if (!user) return null;

    const userObj = user.toObject();

    // Fetch user-specific notifications
    const notifications = await Notification.find({ userId: user._id }).sort({ createdAt: -1 });

    if (user.role === 'recipient' || user.role === 'user') {
      // Query recipient's campaigns
      const queryFilter: any = {
        $or: [
          { userId: user._id },
          ...(user.walletAddress ? [{ recipientWallet: user.walletAddress.toLowerCase() }] : []),
        ],
      };

      const campaigns = await Campaign.find(queryFilter)
        .populate('verificationId')
        .sort({ createdAt: -1 });

      const campaignIds = campaigns.map((c) => c._id);
      const totalFundsRaised = campaigns.reduce((sum, c) => sum + (c.currentAmount || 0), 0);

      // Fetch uploaded documents for recipient's campaigns / account
      const documents = await DocumentModel.find({
        $or: [
          { userId: user._id },
          { campaignId: { $in: campaignIds } },
          ...(user.walletAddress ? [{ uploadedBy: user.walletAddress.toLowerCase() }] : []),
        ],
      }).sort({ createdAt: -1 });

      return {
        ...userObj,
        role: 'recipient',
        campaigns,
        campaignCount: campaigns.length,
        totalFundsRaised,
        uploadedDocuments: documents,
        notifications,
      };
    } else if (user.role === 'donor') {
      // Query donor's transactions
      const donorFilter: any = {
        $or: [
          { donorId: user._id },
          ...(user.walletAddress ? [{ donorWallet: user.walletAddress.toLowerCase() }] : []),
        ],
      };

      const donationHistory = await Transaction.find(donorFilter)
        .populate('campaignId')
        .sort({ createdAt: -1 });

      const totalDonated = donationHistory.reduce((sum, t) => sum + (parseFloat(t.amountEth) || 0), 0);

      return {
        ...userObj,
        role: 'donor',
        walletInformation: {
          walletAddress: user.walletAddress || null,
          isVerified: user.isVerified,
        },
        donationHistory,
        totalDonated,
        notifications,
      };
    }

    return {
      ...userObj,
      notifications,
    };
  }
}

export const authService = new AuthService();
