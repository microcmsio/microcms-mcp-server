import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import type { FullAppConfig } from '../types.js';
import { startHttpTransport } from './http.js';
import { startStdioTransport } from './stdio.js';

export async function startTransport(
  serverFactory: () => Server,
  config: FullAppConfig
): Promise<void> {
  if (config.transport.mode === 'http') {
    await startHttpTransport(serverFactory, config);
  } else {
    const server = serverFactory();
    await startStdioTransport(server);
  }
}
