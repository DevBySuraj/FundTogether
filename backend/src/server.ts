import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { eventListener } from './services/blockchain/eventListener';
import { logger } from './utils/logger';
import { User } from './models/User';
import bcrypt from 'bcryptjs';

const ensureAdminExists = async () => {
  try {
    const adminEmail = (env.adminEmail || 'admin@fundtogether.org').toLowerCase();
    const adminPassword = env.adminPassword || 'AdminSecurePass2026!';
    const adminName = env.adminName || 'Platform Administrator';

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    let admin = await User.findOne({
      $or: [{ email: adminEmail }, { role: 'admin' }],
    });

    if (!admin) {
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
      });
      logger.info(`[ADMIN SEED] Production admin account created: ${admin.email}`);
    } else {
      admin.name = adminName;
      admin.email = adminEmail;
      admin.password = hashedPassword;
      admin.role = 'admin';
      admin.isVerified = true;
      await admin.save();
      logger.info(`[ADMIN SEED] Production admin credentials synchronized: ${admin.email}`);
    }
  } catch (e: any) {
    logger.warn('[ADMIN SEED] Auto-seed notice:', e.message);
  }
};

const startServer = async () => {
  try {
    // 1. Connect MongoDB Database asynchronously
    await connectDB();

    // 2. Automatically ensure production Admin account exists in database
    await ensureAdminExists();

    // 3. Initialize Blockchain Event Listener
    eventListener.init();

    // 4. Start Express HTTP Server bound to 0.0.0.0 for cloud compatibility
    const serverPort = env.port;
    app.listen(serverPort, '0.0.0.0', () => {
      logger.info(`=================================================`);
      logger.info(`🚀 TrustChain Backend running on port ${serverPort}`);
      logger.info(`📚 Swagger API Docs available at http://localhost:${serverPort}/api-docs`);
      logger.info(`❤️ Health check endpoint at http://localhost:${serverPort}/health`);
      logger.info(`=================================================`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
