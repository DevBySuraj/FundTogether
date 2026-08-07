import fs from 'fs';
import path from 'path';
import { logger } from '../../utils/logger';

export class UploadService {
  public deleteLocalFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`[Upload Service] Cleaned up temp file: ${filePath}`);
      }
    } catch (err) {
      logger.warn(`[Upload Service] Failed to remove temp file ${filePath}:`, err);
    }
  }

  public getFileAbsolutePath(filename: string): string {
    return path.resolve(process.cwd(), 'uploads', filename);
  }
}

export const uploadService = new UploadService();
