import mongoose from 'mongoose';
import { env } from './env';
import { User } from '../models/User';
import { Campaign } from '../models/Campaign';
import { logger } from '../utils/logger';

const syncCollectionIndexes = async () => {
  try {
    await User.collection.dropIndex('walletAddress_1');
    logger.info('[MongoDB] Legacy non-sparse walletAddress_1 index dropped.');
  } catch {
    // Ignore if index doesn't exist
  }
  await User.syncIndexes();
  await Campaign.syncIndexes();
};

export const connectDB = async (): Promise<typeof mongoose | null> => {
  const primaryUri = env.mongoUri || 'mongodb://127.0.0.1:27017/fundtogether';
  const localFallbackUri = 'mongodb://127.0.0.1:27017/fundtogether';

  const isAtlas = primaryUri.includes('mongodb+srv') || primaryUri.includes('mongodb.net');

  logger.info(`[MongoDB] Connecting to ${isAtlas ? 'MongoDB Atlas Cloud Database' : 'Database'}...`);

  try {
    const conn = await mongoose.connect(primaryUri, {
      autoIndex: true,
    });

    logger.info(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    await syncCollectionIndexes();
    return conn;
  } catch (primaryErr: any) {
    logger.warn(`[MongoDB Primary Error]: ${primaryErr.message}`);

    // If Atlas primary connection failed (e.g. offline dev), attempt local MongoDB fallback
    if (isAtlas) {
      try {
        logger.info('[MongoDB Fallback] Connecting to local MongoDB instance (mongodb://127.0.0.1:27017/fundtogether)...');
        const conn = await mongoose.connect(localFallbackUri, {
          autoIndex: true,
        });
        logger.info(`[MongoDB Fallback] Connected successfully to local host: ${conn.connection.host}`);
        await syncCollectionIndexes();
        return conn;
      } catch (fallbackErr: any) {
        logger.error('[MongoDB Fallback Error]: Could not connect to local MongoDB either.', fallbackErr.message);
      }
    }
    return null;
  }
};
