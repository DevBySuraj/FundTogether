import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env';
import { User } from '../models/User';
import { Campaign } from '../models/Campaign';
import { logger } from '../utils/logger';

// Force Node.js to use IPv4 first for DNS SRV records (fixes querySrv ECONNREFUSED on Windows DNS)
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignore if not supported
}

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
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const primaryUri = env.mongoUri || 'mongodb://127.0.0.1:27017/fundtogether';
  const localFallbackUri = 'mongodb://127.0.0.1:27017/fundtogether';
  const isAtlas = primaryUri.includes('mongodb+srv') || primaryUri.includes('mongodb.net');
  const isProd = env.nodeEnv === 'production' || process.env.NODE_ENV === 'production';

  logger.info(`[MongoDB] Connecting to ${isAtlas ? 'MongoDB Atlas Cloud Database' : 'Database'}...`);

  try {
    const conn = await mongoose.connect(primaryUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });

    logger.info(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    await syncCollectionIndexes();
    return conn;
  } catch (primaryErr: any) {
    logger.warn(`[MongoDB Primary Error]: ${primaryErr.message}`);

    // If Atlas primary connection failed (e.g. DNS SRV failure or IP block), attempt Google DNS lookup retry
    if (isAtlas && primaryErr.message?.includes('querySrv')) {
      try {
        logger.info('[MongoDB] Retrying SRV DNS lookup via Google DNS (8.8.8.8)...');
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        const conn = await mongoose.connect(primaryUri, {
          autoIndex: true,
          serverSelectionTimeoutMS: 5000,
        });
        logger.info(`[MongoDB] Connected successfully via Google DNS to host: ${conn.connection.host}`);
        await syncCollectionIndexes();
        return conn;
      } catch (dnsErr: any) {
        logger.warn(`[MongoDB Google DNS Error]: ${dnsErr.message}`);
      }
    }

    // Only fallback to local MongoDB if NOT in production cloud environment
    if (isAtlas && !isProd) {
      try {
        logger.info('[MongoDB Fallback] Connecting to local MongoDB instance (mongodb://127.0.0.1:27017/fundtogether)...');
        const conn = await mongoose.connect(localFallbackUri, {
          autoIndex: true,
          serverSelectionTimeoutMS: 3000,
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
