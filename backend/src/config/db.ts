import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<typeof mongoose | null> => {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    return conn;
  } catch (error: any) {
    console.warn('[MongoDB] Connection warning (set MONGODB_URI in environment variables):', error.message || error);
    return null;
  }
};
