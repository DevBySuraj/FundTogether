import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { eventListener } from './services/blockchain/eventListener';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    // 1. Connect MongoDB Database asynchronously
    connectDB();

    // 2. Initialize Blockchain Event Listener
    eventListener.init();

    // 3. Start Express HTTP Server bound to 0.0.0.0 for cloud compatibility
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
