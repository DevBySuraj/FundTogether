import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import mongoose from 'mongoose';
import routes from './routes';
import { errorHandler } from './middleware/error';
import { swaggerSpec } from './swagger/swagger';
import { connectDB } from './config/db';

const app: Application = express();

// Security and utility middleware
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve API documentation via Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    service: 'TrustChain Backend API',
    dbState: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString(),
  });
});

// Database Connection Assurance Middleware for Serverless & Cloud Hosts
app.use(async (req: Request, res: Response, next: NextFunction) => {
  // Allow health check endpoint without blocking
  if (req.path === '/health') return next();

  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err: any) {
      console.error('[Database Assurance Middleware Error]:', err.message);
    }
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection to MongoDB Atlas Cloud is not ready. Please verify your MONGODB_URI on hosting provider.',
    });
  }

  next();
});

// Primary API Router (Mount on both '/' and '/api' for complete compatibility)
app.use('/api', routes);
app.use('/', routes);

// Global Error Handling Middleware
app.use(errorHandler);

export default app;
