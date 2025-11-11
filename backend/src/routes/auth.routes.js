/**
 * Authentication routes
 */
import { AuthService } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../schemas.js';

export async function authRoutes(fastify) {
  /**
   * Register new user
   */
  fastify.post('/register', async (request, reply) => {
    try {
      const data = registerSchema.parse(request.body);
      const user = await AuthService.register(data);

      const token = fastify.jwt.sign({ userId: user.id });

      return { user, token };
    } catch (error) {
      reply.code(400).send({ error: error.message });
    }
  });

  /**
   * Login user
   */
  fastify.post('/login', async (request, reply) => {
    try {
      const data = loginSchema.parse(request.body);
      const user = await AuthService.login(data);

      const token = fastify.jwt.sign({ userId: user.id });

      return { user, token };
    } catch (error) {
      reply.code(401).send({ error: error.message });
    }
  });

  /**
   * Get current user
   */
  fastify.get('/me', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const user = await AuthService.getUserById(request.user.userId);
    return { user };
  });
}
