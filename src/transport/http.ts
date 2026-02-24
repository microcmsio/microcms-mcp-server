import { bearerAuth, StreamableHTTPTransport } from '@hono/mcp';
import { serve } from '@hono/node-server';
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { FullAppConfig } from '../types.js';

export async function startHttpTransport(
  serverFactory: () => Server,
  config: FullAppConfig
): Promise<void> {
  const app = new Hono();

  // CORS
  app.use('/mcp', cors());

  // Bearer token auth (only if configured)
  if (config.auth.enabled && config.auth.bearerToken) {
    app.use('/mcp', bearerAuth({ token: config.auth.bearerToken }));
  }

  // Health check
  app.get('/health', (c) => c.json({ status: 'ok' }));

  // Session management for stateful mode
  const activeSessions = new Map<string, StreamableHTTPTransport>();
  const sessionLastAccess = new Map<string, number>();

  // Session timeout: clean up abandoned sessions (30 minutes)
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [sessionId, lastAccess] of sessionLastAccess) {
      if (now - lastAccess > SESSION_TIMEOUT_MS) {
        activeSessions.delete(sessionId);
        sessionLastAccess.delete(sessionId);
      }
    }
  }, 60 * 1000);
  cleanupInterval.unref();

  // MCP endpoint (stateful: session management)
  app.all('/mcp', async (c) => {
    const sessionId = c.req.header('mcp-session-id');

    // Route to existing session
    if (sessionId) {
      const existingTransport = activeSessions.get(sessionId);
      if (existingTransport) {
        sessionLastAccess.set(sessionId, Date.now());
        return existingTransport.handleRequest(c);
      }
    }

    // Create new session
    const transport = new StreamableHTTPTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
      onsessioninitialized: (newSessionId) => {
        activeSessions.set(newSessionId, transport);
        sessionLastAccess.set(newSessionId, Date.now());
      },
      onsessionclosed: (closedSessionId) => {
        activeSessions.delete(closedSessionId);
        sessionLastAccess.delete(closedSessionId);
      },
    });

    const server = serverFactory();
    await server.connect(transport);
    return transport.handleRequest(c);
  });

  const { host, port } = config.transport;
  serve({ fetch: app.fetch, hostname: host, port }, (info) => {
    console.error(
      `microCMS MCP Server (HTTP) listening on http://${info.address}:${info.port}/mcp`
    );
  });
}
