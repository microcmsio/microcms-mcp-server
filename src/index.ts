#!/usr/bin/env node

import { parseFullConfig } from './config.js';
import { createMcpServer, initializeClients } from './server.js';
import { startTransport } from './transport/index.js';

async function main() {
  try {
    // Parse full configuration (services + transport + auth)
    const fullConfig = parseFullConfig();

    // Initialize microCMS clients
    const serviceConfig = initializeClients();

    // Log mode information
    if (serviceConfig.mode === 'single') {
      // biome-ignore lint/suspicious/noConsole: intentional startup log to stderr
      console.error(
        `microCMS MCP Server starting in single-service mode (service: ${serviceConfig.serviceDomain})`
      );
    } else {
      const serviceIds = serviceConfig.services.map((s) => s.id).join(', ');
      // biome-ignore lint/suspicious/noConsole: intentional startup log to stderr
      console.error(
        `microCMS MCP Server starting in multi-service mode (services: ${serviceIds})`
      );
    }

    // Start transport
    await startTransport(createMcpServer, fullConfig);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('microCMS credentials') ||
        error.message.includes('MICROCMS_SERVICES'))
    ) {
      // biome-ignore lint/suspicious/noConsole: intentional error output to stderr
      console.error('Configuration Error:', error.message);
      process.exit(1);
    }
    throw error;
  }
}

main();
