/**
 * Authentication plugin
 */
import fp from 'fastify-plugin';

async function authPlugin(fastify) {
  // Decorate fastify with authenticate function
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });
}

export default fp(authPlugin);
