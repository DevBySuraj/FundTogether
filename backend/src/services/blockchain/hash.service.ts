import { calculateFileSha256, calculateBufferSha256 } from '../../utils/crypto';

export class HashService {
  public async generateDocumentHash(filePath: string): Promise<string> {
    return calculateFileSha256(filePath);
  }

  public generateBufferHash(buffer: Buffer): string {
    return calculateBufferSha256(buffer);
  }
}

export const hashService = new HashService();
