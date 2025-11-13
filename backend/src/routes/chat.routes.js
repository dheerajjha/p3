/**
 * Chat routes
 */
import { SessionService } from '../services/session.service.js';
import { sendMessageSchema } from '../schemas.js';

export async function chatRoutes(fastify) {
  /**
   * Send message
   */
  fastify.post('/send', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const data = sendMessageSchema.parse(request.body);
      const userId = request.user.userId;

      let sessionId = data.sessionId;

      // Create new session if not provided
      if (!sessionId) {
        const session = await SessionService.createSession(userId);
        sessionId = session.id;
      }

      // Verify session belongs to user
      await SessionService.getSession(sessionId, userId);

      // Add user message
      const userMessage = await SessionService.addMessage(
        sessionId,
        'user',
        data.content
      );

      // Send to wrapper via WebSocket
      const wrapperCommand = {
        type: 'execute',
        session_id: sessionId,
        command: 'query',
        payload: {
          prompt: data.content,
        },
      };

      // Broadcast to wrapper
      fastify.log.info('Broadcasting command to wrapper:', wrapperCommand);
      fastify.wrapperBroadcast(JSON.stringify(wrapperCommand));

      return {
        success: true,
        sessionId,
        message: userMessage,
      };
    } catch (error) {
      reply.code(400).send({ error: error.message });
    }
  });

  /**
   * Get chat history
   */
  fastify.get('/history/:sessionId', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { sessionId } = request.params;
      const userId = request.user.userId;

      const session = await SessionService.getSession(sessionId, userId);

      return { session };
    } catch (error) {
      reply.code(404).send({ error: error.message });
    }
  });

  /**
   * Get all sessions
   */
  fastify.get('/sessions', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const userId = request.user.userId;
    const sessions = await SessionService.getUserSessions(userId);

    return { sessions };
  });

  /**
   * Create new session
   */
  fastify.post('/sessions', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const userId = request.user.userId;
    const { title } = request.body;

    const session = await SessionService.createSession(userId, title);

    return { session };
  });

  /**
   * Delete session
   */
  fastify.delete('/sessions/:sessionId', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { sessionId } = request.params;
      const userId = request.user.userId;

      await SessionService.deleteSession(sessionId, userId);

      return { success: true };
    } catch (error) {
      reply.code(404).send({ error: error.message });
    }
  });
}
