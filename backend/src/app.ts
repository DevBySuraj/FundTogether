import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import { errorHandler } from './middleware/error';
import { swaggerSpec } from './swagger/swagger';

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
    timestamp: new Date().toISOString(),
  });
});

// Primary API Router (Mount on both '/' and '/api' for complete compatibility)
app.use('/api', routes);
app.use('/', routes);

// Global Error Handling Middleware
app.use(errorHandler);

export default app;
