import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a plaintext password securely using bcryptjs
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare a plaintext password against a stored bcrypt hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
};
