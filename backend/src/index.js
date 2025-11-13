/**
 * Main server entry point
 */
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import rateLimit from '@fastify/rate-limit';
import { PrismaClient } from '@prisma/client';

import { config } from './config.js';
import authPlugin from './plugins/auth.plugin.js';
import { authRoutes } from './routes/auth.routes.js';
import { chatRoutes } from './routes/chat.routes.js';
import { handleMobileConnection } from './websocket/mobile.handler.js';
import { handleWrapperConnection, wrapperBroadcast } from './websocket/wrapper.handler.js';

const prisma = new PrismaClient();

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: config.nodeEnv === 'production' ? 'info' : 'debug',
  },
});

// Register plugins
await fastify.register(cors, {
  origin: config.allowedOrigins,
  credentials: true,
});

await fastify.register(jwt, {
  secret: config.jwtSecret,
});

await fastify.register(websocket);

await fastify.register(rateLimit, {
  max: config.rateLimitMax,
  timeWindow: config.rateLimitWindow,
});

await fastify.register(authPlugin);

// Decorate with Prisma
fastify.decorate('prisma', prisma);

// Initialize wrapper and mobile connections
fastify.decorate('wrapperConnections', new Map());
fastify.decorate('mobileConnections', new Map());

// Decorate with wrapper broadcast
fastify.decorate('wrapperBroadcast', (message) => wrapperBroadcast(fastify, message));

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
await fastify.register(authRoutes, { prefix: '/api/auth' });
await fastify.register(chatRoutes, { prefix: '/api/chat' });

// WebSocket routes
fastify.register(async function (fastify) {
  fastify.get('/mobile', { websocket: true }, (connection, request) => {
    handleMobileConnection(connection, request, fastify);
  });

  fastify.get('/wrapper', { websocket: true }, (connection, request) => {
    handleWrapperConnection(connection, request, fastify);
  });
});

// Graceful shutdown
const closeListeners = async () => {
  await prisma.$disconnect();
  await fastify.close();
};

process.on('SIGINT', closeListeners);
process.on('SIGTERM', closeListeners);

// Start server
try {
  await fastify.listen({
    port: config.port,
    host: config.host,
  });

  fastify.log.info(`Server running at http://${config.host}:${config.port}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
