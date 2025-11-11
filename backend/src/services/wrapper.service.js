/**
 * Wrapper service for managing wrapper connections
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WrapperService {
  /**
   * Register or update wrapper connection
   */
  static async updateWrapperStatus(wrapperId, status, metadata = null) {
    return await prisma.wrapperConnection.upsert({
      where: { wrapperId },
      update: {
        status,
        lastPing: new Date(),
        metadata,
      },
      create: {
        wrapperId,
        status,
        metadata,
      },
    });
  }

  /**
   * Get wrapper connection
   */
  static async getWrapper(wrapperId) {
    return await prisma.wrapperConnection.findUnique({
      where: { wrapperId },
    });
  }

  /**
   * Get all active wrappers
   */
  static async getActiveWrappers() {
    // Consider wrappers active if pinged within last 30 seconds
    const threshold = new Date(Date.now() - 30000);

    return await prisma.wrapperConnection.findMany({
      where: {
        lastPing: {
          gte: threshold,
        },
        status: {
          in: ['connected', 'ready', 'busy'],
        },
      },
    });
  }

  /**
   * Find available wrapper
   */
  static async findAvailableWrapper() {
    const wrappers = await this.getActiveWrappers();
    return wrappers.find(w => w.status === 'ready') || wrappers[0] || null;
  }
}
