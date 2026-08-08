import { User } from '../models/User';
import { Campaign } from '../models/Campaign';
import { DocumentModel } from '../models/Document';
import { Transaction } from '../models/Transaction';
import { Notification } from '../models/Notification';
import { verifyGoogleIdToken } from '../utils/google';
import { generateJwt } from '../utils/jwt';
import { hashPassword, comparePassword } from '../utils/password';
import { UserRole } from '../interfaces/user.interface';
import { Types } from 'mongoose';

export interface GoogleLoginParams {
  idToken: string;
  role?: string;
}

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: any;
  isNewUser?: boolean;
}

export class AuthService {
  /**
   * Register a new user with Email + Password
   * Allowed roles for public registration: 'recipient' or 'donor' (Reject 'admin')
   */
  public async register({ name, email, password, role }: RegisterParams): Promise<AuthResult> {
    if (!name || name.trim() === '') {
      throw new Error('Name is required');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Please provide a valid email address');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const cleanEmail = email.toLowerCase().trim();
    const requestedRole = (role || 'donor').toLowerCase();

    // STRICT ADMIN GUARD: Reject public admin registration
    if (requestedRole === 'admin') {
      throw new Error('Public registration for admin role is prohibited.');
    }

    let initialRole: UserRole = 'donor';
    if (requestedRole === 'recipient' || requestedRole === 'user') {
      initialRole = 'recipient';
    } else if (requestedRole === 'donor') {
      initialRole = 'donor';
    } else {
      throw new Error('Invalid role specified for registration.');
    }

    // Check if user already exists in MongoDB Atlas by email
    let existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      if (existingUser.password) {
        throw new Error('An account with this email address already exists. Please log in.');
      }

      // Existing Google-only account: Enable email/password on existing User document
      const hashedPassword = await hashPassword(password);
      existingUser.name = name || existingUser.name;
      existingUser.password = hashedPassword;
      existingUser.lastLoginAt = new Date();
      await existingUser.save();

      const token = generateJwt({
        id: existingUser._id.toString(),
        email: existingUser.email,
        role: existingUser.role,
      });

      const fullProfile = await this.getUserProfile(existingUser._id.toString());
      return { token, user: fullProfile || existingUser };
    }

    // Create new User in MongoDB Atlas
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: initialRole,
      isVerified: false,
      lastLoginAt: new Date(),
    });

    // Send Welcome Notification
    await Notification.create({
      userId: user._id,
      title: 'Welcome to FundTogether!',
      message: `Your ${initialRole.toUpperCase()} account has been successfully registered.`,
      type: 'info',
    });

    const token = generateJwt({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const fullProfile = await this.getUserProfile(user._id.toString());
    return { token, user: fullProfile || user, isNewUser: true };
  }

  /**
   * Login with Email + Password
   */
  public async login({ email, password }: LoginParams): Promise<AuthResult> {
    if (!email || !password) {
      throw new Error('Invalid email or password');
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    // Generic error message to prevent user enumeration
    if (!user || !user.password) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateJwt({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const fullProfile = await this.getUserProfile(user._id.toString());
    return { token, user: fullProfile || user };
  }

  /**
   * Set Password for an Authenticated User (Account Linking for Google-only users)
   */
  public async setPassword(userId: string, password: string): Promise<{ message: string; user: any }> {
    if (!userId || !Types.ObjectId.isValid(userId)) {
      throw new Error('Authentication required');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    await user.save();

    const fullProfile = await this.getUserProfile(user._id.toString());
    return {
      message: 'Password set successfully. You can now log in with email and password.',
      user: fullProfile || user,
    };
  }

  /**
   * Google OAuth Login & Automatic Registration
   * Preserves existing user document if user previously registered via email
   */
  public async googleLogin({ idToken, role }: GoogleLoginParams): Promise<AuthResult> {
    const googlePayload = await verifyGoogleIdToken(idToken);

    let user = await User.findOne({
      $or: [{ googleId: googlePayload.googleId }, { email: googlePayload.email }],
    });

    let isNewUser = false;

    if (!user) {
      let initialRole: UserRole = 'donor';
      if (role) {
        const lowerRole = role.toLowerCase();
        if (lowerRole === 'recipient' || lowerRole === 'user') {
          initialRole = 'recipient';
        } else if (lowerRole === 'donor') {
          initialRole = 'donor';
        }
      }

      user = await User.create({
        googleId: googlePayload.googleId,
        name: googlePayload.name,
        email: googlePayload.email,
        profilePicture: googlePayload.profilePicture,
        role: initialRole,
        isVerified: false,
        lastLoginAt: new Date(),
      });

      await Notification.create({
        userId: user._id,
        title: `Welcome to FundTogether!`,
        message: `Your ${initialRole.toUpperCase()} account has been successfully initialized.`,
        type: 'info',
      });

      isNewUser = true;
    } else {
      // Preserve existing user ID, update googleId and profilePicture if needed
      if (!user.googleId) user.googleId = googlePayload.googleId;
      if (googlePayload.profilePicture && !user.profilePicture) {
        user.profilePicture = googlePayload.profilePicture;
      }
      user.lastLoginAt = new Date();
      await user.save();
    }

    const token = generateJwt({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const fullProfile = await this.getUserProfile(user._id.toString());
    return { token, user: fullProfile || user, isNewUser };
  }

  /**
   * Get Relational User Profile by User ID (excludes password from output)
   */
  public async getUserProfile(userId: string): Promise<any> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }

    const user = await User.findById(userId).select('-password');
    if (!user) return null;

    const userObj = user.toObject();

    const notifications = await Notification.find({ userId: user._id }).sort({ createdAt: -1 });

    if (user.role === 'recipient' || user.role === 'user') {
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
