/**
 * Configuration management
 */
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // Wrapper
  wrapperApiKey: process.env.WRAPPER_API_KEY || 'change-me-in-production',

  // CORS
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:*')
    .split(',')
    .map(o => o.trim()),

  // Rate limiting
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
};
