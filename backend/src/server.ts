import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { eventListener } from './services/blockchain/eventListener';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    // 1. Connect MongoDB Database
    await connectDB();

    // 2. Initialize Blockchain Event Listener
    eventListener.init();

    // 3. Start Express HTTP Server
    app.listen(env.port, () => {
      logger.info(`=================================================`);
      logger.info(`🚀 TrustChain Backend running on port ${env.port}`);
      logger.info(`📚 Swagger API Docs available at http://localhost:${env.port}/api-docs`);
      logger.info(`❤️ Health check endpoint at http://localhost:${env.port}/health`);
      logger.info(`=================================================`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
