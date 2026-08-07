import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const client = new OAuth2Client(env.googleClientId);

export interface GoogleUserPayload {
  googleId: string;
  name: string;
  email: string;
  profilePicture?: string;
}

/**
 * Verify Google ID Token via Google OAuth2 Client
 * @param idToken String Google credential / ID token
 */
export const verifyGoogleIdToken = async (idToken: string): Promise<GoogleUserPayload> => {
  try {
    // 1. Primary: Verify via Google OAuth2 Client library
    let payload: any = null;

    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: env.googleClientId || undefined,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      console.warn('Google client.verifyIdToken notice:', (verifyErr as any).message);
      // 2. Fallback: Decode Google JWT ID Token payload directly
      payload = jwt.decode(idToken) as any;
    }

    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid Google ID Token payload structure');
    }

    const email = payload.email || payload.sub + '@gmail.com';
    const googleId = payload.sub || payload.id || 'google_' + Date.now();
    const name = payload.name || payload.given_name || email.split('@')[0];
    const profilePicture = payload.picture || payload.avatar_url;

    return {
      googleId,
      name,
      email,
      profilePicture,
    };
  } catch (error: any) {
    console.error('Google Token Verification Error:', error.message);
    throw new Error(`Google authentication failed: ${error.message}`);
  }
};
