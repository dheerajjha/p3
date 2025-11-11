/**
 * Session service
 */
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

export class SessionService {
  /**
   * Create a new session
   */
  static async createSession(userId, title = 'New Chat') {
    return await prisma.session.create({
      data: {
        userId,
        title,
      },
      include: {
        messages: true,
      },
    });
  }

  /**
   * Get user's sessions
   */
  static async getUserSessions(userId) {
    return await prisma.session.findMany({
      where: { userId },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Get session by ID
   */
  static async getSession(sessionId, userId) {
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    return session;
  }

  /**
   * Update session
   */
  static async updateSession(sessionId, userId, data) {
    return await prisma.session.update({
      where: {
        id: sessionId,
        userId,
      },
      data,
    });
  }

  /**
   * Delete session
   */
  static async deleteSession(sessionId, userId) {
    return await prisma.session.delete({
      where: {
        id: sessionId,
        userId,
      },
    });
  }

  /**
   * Add message to session
   */
  static async addMessage(sessionId, role, content, metadata = null) {
    return await prisma.message.create({
      data: {
        sessionId,
        role,
        content,
        metadata,
      },
    });
  }
}
