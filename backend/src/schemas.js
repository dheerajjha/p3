/**
 * Validation schemas using Zod
 */
import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Message schemas
export const sendMessageSchema = z.object({
  sessionId: z.string().uuid().optional(),
  content: z.string().min(1),
});

// Session schemas
export const createSessionSchema = z.object({
  title: z.string().optional(),
});

export const updateSessionSchema = z.object({
  title: z.string().min(1),
});

// Wrapper schemas
export const executeCommandSchema = z.object({
  type: z.literal('execute'),
  session_id: z.string().uuid(),
  command: z.enum(['query', 'stop']),
  payload: z.record(z.any()),
});

export const wrapperUpdateSchema = z.union([
  z.object({
    type: z.literal('message'),
    session_id: z.string().uuid(),
    data: z.record(z.any()),
    timestamp: z.string().datetime().optional(),
  }),
  z.object({
    type: z.literal('tool_execution'),
    session_id: z.string().uuid(),
    data: z.record(z.any()),
    timestamp: z.string().datetime().optional(),
  }),
  z.object({
    type: z.literal('error'),
    session_id: z.string().uuid(),
    error: z.string(),
    details: z.record(z.any()).optional(),
    timestamp: z.string().datetime().optional(),
  }),
  z.object({
    type: z.literal('status'),
    wrapper_id: z.string(),
    status: z.enum(['connected', 'disconnected', 'ready', 'busy']),
    timestamp: z.string().datetime().optional(),
  }),
  z.object({
    type: z.literal('complete'),
    session_id: z.string().uuid(),
    timestamp: z.string().datetime().optional(),
  }),
]);
