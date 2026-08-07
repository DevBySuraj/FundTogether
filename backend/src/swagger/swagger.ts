import swaggerJSDoc from 'swagger-jsdoc';
import { env } from '../config/env';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TrustChain Backend API Document',
      version: '1.0.0',
      description: 'API documentation for TrustChain transparent donation platform backend featuring AI verification, IPFS, and Blockchain integration.',
    },
    servers: [
      {
        url: `http://localhost:${env.port}`,
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
