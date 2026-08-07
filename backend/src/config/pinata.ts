import { env } from './env';

export interface PinataConfig {
  apiKey: string;
  secretKey: string;
  jwt: string;
  gateway: string;
}

export const getPinataConfig = (): PinataConfig => {
  return {
    apiKey: env.pinataApiKey,
    secretKey: env.pinataSecretKey,
    jwt: env.pinataJwt,
    gateway: env.pinataGateway,
  };
};
