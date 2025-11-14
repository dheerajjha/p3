#!/usr/bin/env node

import WebSocket from 'ws';
import { spawn } from 'child_process';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

const settings = {
  backendUrl: process.env.BACKEND_URL || 'ws://localhost:3300/wrapper',
  backendApiKey: process.env.BACKEND_API_KEY,
  workspaceDir: process.env.WORKSPACE_DIR || process.cwd(),
  wrapperId: process.env.WRAPPER_ID || 'wrapper-01',
  logLevel: process.env.LOG_LEVEL || 'info',
  maxReconnectAttempts: parseInt(process.env.MAX_RECONNECT_ATTEMPTS) || 5,
  reconnectDelay: parseInt(process.env.RECONNECT_DELAY) || 5,
};

class WrapperClient {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.isRunning = true;
    this.activeProcesses = new Map();
  }

  log(level, ...args) {
    const levels = ['error', 'warn', 'info', 'debug'];
    const configLevel = levels.indexOf(settings.logLevel);
    const msgLevel = levels.indexOf(level);

    if (msgLevel <= configLevel) {
      console.log(`[${new Date().toISOString()}] [${level.toUpperCase()}]`, ...args);
    }
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.log('info', `Connecting to backend: ${settings.backendUrl}`);

      try {
        this.ws = new WebSocket(settings.backendUrl, {
          headers: {
            'Authorization': `Bearer ${settings.backendApiKey}`,
            'X-Wrapper-ID': settings.wrapperId,
          },
        });

        this.ws.on('open', () => {
          this.log('info', 'Connected to backend successfully');
          this.reconnectAttempts = 0;

          // Send status updates
          this.sendStatus('connected');
          this.sendStatus('ready');

          resolve();
        });

        this.ws.on('message', async (data) => {
          try {
            const message = JSON.parse(data.toString());
            this.log('debug', 'Received message:', message);
            await this.handleMessage(message);
          } catch (error) {
            this.log('error', 'Error handling message:', error.message);
          }
        });

        this.ws.on('close', () => {
          this.log('warn', 'Connection closed by backend');
          reject(new Error('Connection closed'));
        });

        this.ws.on('error', (error) => {
          this.log('error', 'WebSocket error:', error.message);
          reject(error);
        });

      } catch (error) {
        this.log('error', 'Connection failed:', error.message);
        reject(error);
      }
    });
  }

  sendStatus(status) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const message = {
      type: 'status',
      wrapper_id: settings.wrapperId,
      status: status,
      timestamp: new Date().toISOString(), // Always UTC with Z suffix
    };

    this.ws.send(JSON.stringify(message));
    this.log('debug', `Sent status: ${status}`);
  }

  sendMessage(sessionId, data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.log('warn', 'Cannot send message: WebSocket not open');
      return;
    }

    const message = {
      type: 'message',
      session_id: sessionId,
      data: data,
      timestamp: new Date().toISOString(),
    };

    this.log('info', `Sending message for session ${sessionId}`, JSON.stringify(message).substring(0, 200));
    this.ws.send(JSON.stringify(message));
    this.log('info', 'Message sent successfully');
  }

  sendError(sessionId, error, details = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const message = {
      type: 'error',
      session_id: sessionId,
      error: error,
      details: details,
      timestamp: new Date().toISOString(),
    };

    this.ws.send(JSON.stringify(message));
    this.log('error', `Sent error for session ${sessionId}:`, error);
  }

  sendComplete(sessionId) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const message = {
      type: 'complete',
      session_id: sessionId,
      timestamp: new Date().toISOString(),
    };

    this.ws.send(JSON.stringify(message));
    this.log('debug', `Sent complete for session ${sessionId}`);
  }

  async handleMessage(message) {
    if (message.type !== 'execute') {
      this.log('warn', 'Unknown message type:', message.type);
      return;
    }

    const { session_id, command, payload } = message;
    this.log('info', `Executing command: ${command} for session ${session_id}`);

    try {
      await this.sendStatus('busy');

      if (command === 'query') {
        await this.executeQuery(session_id, payload.prompt);
      } else if (command === 'stop') {
        await this.stopExecution(session_id);
      }

      await this.sendStatus('ready');

    } catch (error) {
      this.log('error', `Error handling command ${command}:`, error.message);
      this.sendError(session_id, error.message, { command });
      await this.sendStatus('ready');
    }
  }

  async executeQuery(sessionId, prompt) {
    this.log('info', `Executing query for session ${sessionId}`);
    this.log('debug', `Prompt: ${prompt}`);

    return new Promise((resolve, reject) => {
      // Execute claude CLI in non-interactive mode with prompt as argument
      const claudeProcess = spawn('claude', ['--print', prompt], {
        cwd: settings.workspaceDir,
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'], // ignore stdin, pipe stdout and stderr
      });

      this.activeProcesses.set(sessionId, claudeProcess);

      let stdoutBuffer = '';
      let stderrBuffer = '';

      claudeProcess.stdout.on('data', (data) => {
        const chunk = data.toString();
        stdoutBuffer += chunk;
        this.log('debug', 'Claude stdout chunk:', chunk.substring(0, 100));
      });

      claudeProcess.stderr.on('data', (data) => {
        const chunk = data.toString();
        stderrBuffer += chunk;
        this.log('debug', 'Claude stderr chunk:', chunk.substring(0, 100));
      });

      claudeProcess.on('close', (code) => {
        this.activeProcesses.delete(sessionId);
        this.log('info', `Claude CLI exited with code ${code}`);
        this.log('info', `stdout buffer length: ${stdoutBuffer.length}`);
        this.log('info', `stderr buffer length: ${stderrBuffer.length}`);
        this.log('info', `stdout content: ${stdoutBuffer.substring(0, 200)}`);

        if (code === 0 && stdoutBuffer.trim()) {
          // Send response
          this.sendMessage(sessionId, {
            role: 'assistant',
            content: stdoutBuffer.trim(),
            type: 'text',
          });
          this.sendComplete(sessionId);
          resolve();
        } else {
          const errorMsg = stderrBuffer.trim() || stdoutBuffer.trim() || `Claude CLI exited with code ${code}`;
          this.log('error', 'Claude CLI error:', errorMsg);
          this.sendError(sessionId, errorMsg);
          this.sendComplete(sessionId);
          reject(new Error(errorMsg));
        }
      });

      claudeProcess.on('error', (error) => {
        this.activeProcesses.delete(sessionId);
        this.log('error', 'Failed to start Claude CLI:', error.message);
        this.sendError(sessionId, `Failed to start Claude CLI: ${error.message}`);
        this.sendComplete(sessionId);
        reject(error);
      });

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        if (claudeProcess && !claudeProcess.killed) {
          this.log('warn', `Claude CLI timeout for session ${sessionId}`);
          claudeProcess.kill('SIGTERM');
        }
      }, 120000); // 2 minute timeout

      claudeProcess.on('close', () => {
        clearTimeout(timeout);
      });
    });
  }

  async stopExecution(sessionId) {
    const process = this.activeProcesses.get(sessionId);
    if (process) {
      process.kill('SIGTERM');
      this.activeProcesses.delete(sessionId);
      this.log('info', `Stopped execution for session ${sessionId}`);
    }
    this.sendComplete(sessionId);
  }

  async run() {
    while (this.isRunning) {
      try {
        await this.connect();

        // Keep the connection alive
        await new Promise((resolve, reject) => {
          this.ws.on('close', resolve);
          this.ws.on('error', reject);
        });

      } catch (error) {
        this.log('error', 'Connection error:', error.message);

        if (this.reconnectAttempts < settings.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = settings.reconnectDelay * this.reconnectAttempts;
          this.log('info', `Reconnecting in ${delay} seconds (attempt ${this.reconnectAttempts})`);
          await new Promise(resolve => setTimeout(resolve, delay * 1000));
        } else {
          this.log('error', 'Max reconnection attempts reached. Exiting.');
          break;
        }
      } finally {
        if (this.ws) {
          this.ws.close();
          this.ws = null;
        }
      }
    }
  }

  async shutdown() {
    this.log('info', 'Shutting down wrapper...');
    this.isRunning = false;

    // Kill all active processes
    for (const [sessionId, process] of this.activeProcesses.entries()) {
      process.kill('SIGTERM');
      this.log('info', `Killed process for session ${sessionId}`);
    }
    this.activeProcesses.clear();

    if (this.ws) {
      this.sendStatus('disconnected');
      this.ws.close();
    }
  }
}

// Main
const client = new WrapperClient();

process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down...');
  await client.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down...');
  await client.shutdown();
  process.exit(0);
});

client.run().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
