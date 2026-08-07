import crypto from 'crypto';
import fs from 'fs';

export const generateNonce = (): string => {
  return `TrustChain Authentication Nonce: ${crypto.randomBytes(16).toString('hex')}`;
};

export const calculateFileSha256 = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
};

export const calculateBufferSha256 = (buffer: Buffer): string => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};
