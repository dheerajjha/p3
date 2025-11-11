/**
 * WebSocket handler for mobile clients
 */
import { SessionService } from '../services/session.service.js';

export async function handleMobileConnection(connection, request, fastify) {
  const { socket } = connection;

  // Authenticate
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      socket.close(4001, 'Unauthorized');
      return;
    }

    const decoded = fastify.jwt.verify(token);
    const userId = decoded.userId;

    fastify.log.info(`Mobile client connected: user ${userId}`);

    // Store connection
    if (!fastify.mobileConnections) {
      fastify.mobileConnections = new Map();
    }
    fastify.mobileConnections.set(userId, socket);

    // Handle messages from mobile
    socket.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        // Handle different message types
        if (data.type === 'ping') {
          socket.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (error) {
        fastify.log.error('Error handling mobile message:', error);
      }
    });

    // Handle disconnection
    socket.on('close', () => {
      fastify.log.info(`Mobile client disconnected: user ${userId}`);
      fastify.mobileConnections.delete(userId);
    });

  } catch (error) {
    fastify.log.error('Mobile WebSocket auth error:', error);
    socket.close(4001, 'Unauthorized');
  }
}

/**
 * Send update to mobile client
 */
export function sendToMobile(fastify, userId, data) {
  const socket = fastify.mobileConnections?.get(userId);
  if (socket && socket.readyState === 1) {
    socket.send(JSON.stringify(data));
  }
}
