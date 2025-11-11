/**
 * WebSocket handler for wrapper connections
 */
import { WrapperService } from '../services/wrapper.service.js';
import { SessionService } from '../services/session.service.js';
import { wrapperUpdateSchema } from '../schemas.js';
import { config } from '../config.js';

export async function handleWrapperConnection(connection, request, fastify) {
  const { socket } = connection;

  // Authenticate wrapper
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    const wrapperId = request.headers['x-wrapper-id'];

    if (!token || token !== config.wrapperApiKey) {
      socket.close(4001, 'Unauthorized');
      return;
    }

    if (!wrapperId) {
      socket.close(4002, 'Missing wrapper ID');
      return;
    }

    fastify.log.info(`Wrapper connected: ${wrapperId}`);

    // Store connection
    if (!fastify.wrapperConnections) {
      fastify.wrapperConnections = new Map();
    }
    fastify.wrapperConnections.set(wrapperId, socket);

    // Handle messages from wrapper
    socket.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        const validated = wrapperUpdateSchema.parse(data);

        await handleWrapperUpdate(fastify, validated);

      } catch (error) {
        fastify.log.error('Error handling wrapper message:', error);
      }
    });

    // Handle disconnection
    socket.on('close', () => {
      fastify.log.info(`Wrapper disconnected: ${wrapperId}`);
      fastify.wrapperConnections.delete(wrapperId);
      WrapperService.updateWrapperStatus(wrapperId, 'disconnected');
    });

  } catch (error) {
    fastify.log.error('Wrapper WebSocket error:', error);
    socket.close(4000, 'Internal error');
  }
}

/**
 * Handle updates from wrapper
 */
async function handleWrapperUpdate(fastify, update) {
  switch (update.type) {
    case 'status':
      await WrapperService.updateWrapperStatus(
        update.wrapper_id,
        update.status
      );
      fastify.log.info(`Wrapper ${update.wrapper_id} status: ${update.status}`);
      break;

    case 'message':
      await handleMessageUpdate(fastify, update);
      break;

    case 'tool_execution':
      await handleToolExecutionUpdate(fastify, update);
      break;

    case 'error':
      await handleErrorUpdate(fastify, update);
      break;

    case 'complete':
      await handleCompleteUpdate(fastify, update);
      break;
  }
}

/**
 * Handle message update from wrapper
 */
async function handleMessageUpdate(fastify, update) {
  const { session_id, data } = update;

  // Save assistant message
  if (data.role === 'assistant' && data.content) {
    await SessionService.addMessage(
      session_id,
      'assistant',
      data.content,
      data
    );
  }

  // Forward to mobile client
  await forwardToMobileClient(fastify, session_id, {
    type: 'message',
    data,
  });
}

/**
 * Handle tool execution update
 */
async function handleToolExecutionUpdate(fastify, update) {
  const { session_id, data } = update;

  // Forward to mobile client with friendly formatting
  const friendlyUpdate = formatToolUpdate(data);

  await forwardToMobileClient(fastify, session_id, {
    type: 'tool_execution',
    data: friendlyUpdate,
  });
}

/**
 * Handle error update
 */
async function handleErrorUpdate(fastify, update) {
  const { session_id, error, details } = update;

  fastify.log.error(`Error in session ${session_id}:`, error, details);

  // Save error as message
  await SessionService.addMessage(
    session_id,
    'system',
    `Error: ${error}`,
    { error, details }
  );

  // Forward friendly error to mobile
  await forwardToMobileClient(fastify, session_id, {
    type: 'error',
    message: formatErrorMessage(error),
  });
}

/**
 * Handle complete update
 */
async function handleCompleteUpdate(fastify, update) {
  const { session_id } = update;

  await forwardToMobileClient(fastify, session_id, {
    type: 'complete',
  });
}

/**
 * Forward update to mobile client
 */
async function forwardToMobileClient(fastify, sessionId, data) {
  try {
    // Get session to find user
    const session = await fastify.prisma.session.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });

    if (!session) return;

    // Send to mobile client
    const socket = fastify.mobileConnections?.get(session.userId);
    if (socket && socket.readyState === 1) {
      socket.send(JSON.stringify({
        sessionId,
        ...data,
      }));
    }
  } catch (error) {
    fastify.log.error('Error forwarding to mobile:', error);
  }
}

/**
 * Format tool update with friendly language
 */
function formatToolUpdate(data) {
  const toolNames = {
    write: 'Creating file',
    read: 'Reading file',
    edit: 'Editing file',
    bash: 'Running command',
    grep: 'Searching',
    glob: 'Finding files',
  };

  return {
    ...data,
    friendlyName: toolNames[data.tool_name] || data.tool_name,
    icon: getToolIcon(data.tool_name),
  };
}

/**
 * Get icon for tool
 */
function getToolIcon(toolName) {
  const icons = {
    write: '📝',
    read: '📖',
    edit: '✏️',
    bash: '🏃',
    grep: '🔍',
    glob: '📁',
  };
  return icons[toolName] || '⚙️';
}

/**
 * Format error message to be user-friendly
 */
function formatErrorMessage(error) {
  if (error.includes('file not found')) {
    return "Oops! I couldn't find that file.";
  }
  if (error.includes('permission')) {
    return "I don't have permission to do that.";
  }
  if (error.includes('timeout')) {
    return "This is taking longer than expected. Let's try again.";
  }
  return "Something went wrong. Let me try a different approach.";
}

/**
 * Broadcast to all wrappers
 */
export function wrapperBroadcast(fastify, message) {
  if (!fastify.wrapperConnections) return;

  for (const [wrapperId, socket] of fastify.wrapperConnections.entries()) {
    if (socket.readyState === 1) {
      socket.send(message);
    }
  }
}
