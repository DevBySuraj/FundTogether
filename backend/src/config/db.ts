import mongoose from 'mongoose';
import { env } from './env';
import { User } from '../models/User';
import { Campaign } from '../models/Campaign';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<typeof mongoose | null> => {
  try {
    const uri = env.mongoUri;
    const isAtlas = uri.includes('mongodb+srv') || uri.includes('mongodb.net');

    logger.info(`[MongoDB] Connecting to ${isAtlas ? 'MongoDB Atlas Cloud Database' : 'Local MongoDB Database'}...`);

    const conn = await mongoose.connect(uri, {
      autoIndex: true, // Auto-build indexes in MongoDB Atlas
    });

    const host = conn.connection.host;
    logger.info(`[MongoDB] Connected successfully to host: ${host}`);

    // Drop legacy non-sparse walletAddress_1 index on MongoDB Atlas if present
    try {
      await User.collection.dropIndex('walletAddress_1');
      logger.info('[MongoDB] Legacy non-sparse walletAddress_1 index dropped.');
    } catch (e: any) {
      // Ignore if index doesn't exist
    }

    // Ensure models initialize sparse unique indexes
    await User.syncIndexes();
    await Campaign.syncIndexes();

    return conn;
  } catch (error: any) {
    logger.error('[MongoDB Atlas Connection Error]:', error.message || error);
    return null;
  }
};
