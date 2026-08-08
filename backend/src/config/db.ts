import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env';
import { User } from '../models/User';
import { Campaign } from '../models/Campaign';
import { logger } from '../utils/logger';

// STOP Mongoose from buffering queries for 10000ms when database is disconnected
mongoose.set('bufferCommands', false);

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

  const primaryUri = env.mongoUri;
  if (!primaryUri) {
    logger.error('[MongoDB Error] MONGODB_URI environment variable is missing.');
    return null;
  }

  const isAtlas = primaryUri.includes('mongodb+srv') || primaryUri.includes('mongodb.net');
  logger.info(`[MongoDB] Connecting to ${isAtlas ? 'MongoDB Atlas Cloud Database' : 'MongoDB Database'}...`);

  try {
    const conn = await mongoose.connect(primaryUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });

    logger.info(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    await syncCollectionIndexes();
    return conn;
  } catch (primaryErr: any) {
    logger.error(`[MongoDB Atlas Primary Error]: ${primaryErr.message}`);

    // If Atlas primary connection failed due to Windows DNS SRV lookup failure, retry via Google DNS (8.8.8.8)
    if (isAtlas && primaryErr.message?.includes('querySrv')) {
      try {
        logger.info('[MongoDB] Retrying SRV DNS lookup via Google Public DNS (8.8.8.8)...');
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        const conn = await mongoose.connect(primaryUri, {
          autoIndex: true,
          serverSelectionTimeoutMS: 5000,
        });
        logger.info(`[MongoDB] Connected successfully via Google DNS to host: ${conn.connection.host}`);
        await syncCollectionIndexes();
        return conn;
      } catch (dnsErr: any) {
        logger.error(`[MongoDB Google DNS Retry Error]: ${dnsErr.message}`);
      }
    }

    logger.error('========================================================================================');
    logger.error('❌ [MongoDB Atlas Connection Failure]: Could not establish connection to MongoDB Cloud Database.');
    logger.error('👉 Please verify:');
    logger.error('   1. Your MONGODB_URI connection string in backend/.env is correct.');
    logger.error('   2. Your IP Address is allowed in MongoDB Atlas → Network Access (0.0.0.0/0).');
    logger.error('   3. Local database fallback is DISABLED.');
    logger.error('========================================================================================');

    return null;
  }
};
