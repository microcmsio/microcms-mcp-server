#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

export function showHelp() {
  console.log(`
microCMS MCP Server

A Model Context Protocol server for microCMS API integration.

Usage:
  npx microcms-mcp-server [options]

Options:
  --service-id <service-id>  microCMS service ID (for single service mode)
  --api-key <key>           microCMS API key (for single service mode)
  --transport <mode>        Transport mode: "stdio" (default) or "http"
  --port <port>             HTTP server port (default: 3000)
  --host <host>             HTTP server host (default: 0.0.0.0)
  --help                    Show this help message
  --version                 Show version information

Environment Variables:
  Single service mode:
    MICROCMS_SERVICE_ID      Service ID
    MICROCMS_API_KEY         API key

  Multi service mode:
    MICROCMS_SERVICES        JSON array of services
                             Example: '[{"id":"blog","apiKey":"xxx"},{"id":"shop","apiKey":"yyy"}]'

  Transport:
    MCP_TRANSPORT            Transport mode: "stdio" or "http"
    MCP_HTTP_PORT            HTTP server port
    MCP_HTTP_HOST            HTTP server host

  Authentication (HTTP mode):
    MCP_AUTH_TOKEN            Bearer token for HTTP authentication

Examples:
  # Local single service (stdio, default)
  npx microcms-mcp-server --service-id my-blog --api-key your-key

  # Local multi service (stdio)
  export MICROCMS_SERVICES='[{"id":"blog","apiKey":"xxx"},{"id":"shop","apiKey":"yyy"}]'
  npx microcms-mcp-server

  # Remote single service (HTTP)
  npx microcms-mcp-server --service-id my-blog --api-key xxx --transport http --port 3000

  # Remote multi service (HTTP with auth)
  MCP_AUTH_TOKEN=my-secret npx microcms-mcp-server --transport http

Claude Desktop Configuration (Single Service, stdio):
{
  "mcpServers": {
    "microcms": {
      "command": "npx",
      "args": ["-y", "microcms-mcp-server"],
      "env": {
        "MICROCMS_SERVICE_ID": "your-service-id",
        "MICROCMS_API_KEY": "your-api-key"
      }
    }
  }
}

Claude Desktop Configuration (Multi Service, stdio):
{
  "mcpServers": {
    "microcms": {
      "command": "npx",
      "args": ["-y", "microcms-mcp-server"],
      "env": {
        "MICROCMS_SERVICES": "[{\\"id\\":\\"blog\\",\\"apiKey\\":\\"xxx\\"},{\\"id\\":\\"shop\\",\\"apiKey\\":\\"yyy\\"}]"
      }
    }
  }
}

Claude Desktop Configuration (Remote via mcp-remote):
{
  "mcpServers": {
    "microcms-remote": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "http://your-server:3000/mcp",
        "--header", "Authorization:Bearer my-shared-secret"
      ]
    }
  }
}
`);
}

export async function runCli() {
  try {
    const { values } = parseArgs({
      args: process.argv.slice(2),
      options: {
        'service-id': {
          type: 'string',
          short: 's',
        },
        'api-key': {
          type: 'string',
          short: 'k',
        },
        transport: {
          type: 'string',
          short: 't',
        },
        port: {
          type: 'string',
          short: 'p',
        },
        host: {
          type: 'string',
        },
        help: {
          type: 'boolean',
          short: 'h',
        },
        version: {
          type: 'boolean',
          short: 'v',
        },
      },
      allowPositionals: true,
    });

    if (values.help) {
      showHelp();
      process.exit(0);
    }

    if (values.version) {
      const __dirname = dirname(fileURLToPath(import.meta.url));
      const pkg = JSON.parse(
        readFileSync(join(__dirname, '..', 'package.json'), 'utf-8')
      );
      console.log(`microcms-mcp-server v${pkg.version}`);
      process.exit(0);
    }

    // Set CLI args as env vars (for config.ts to consume)
    if (values['service-id']) {
      process.env.MICROCMS_SERVICE_ID = values['service-id'];
    }
    if (values['api-key']) {
      process.env.MICROCMS_API_KEY = values['api-key'];
    }
    if (values.transport) {
      process.env.MCP_TRANSPORT = values.transport;
    }
    if (values.port) {
      process.env.MCP_HTTP_PORT = values.port;
    }
    if (values.host) {
      process.env.MCP_HTTP_HOST = values.host;
    }

    // Validate service configuration
    const hasMultiServiceConfig = !!process.env.MICROCMS_SERVICES;
    const hasSingleServiceConfig = !!(
      process.env.MICROCMS_SERVICE_ID && process.env.MICROCMS_API_KEY
    );

    if (!hasMultiServiceConfig && !hasSingleServiceConfig) {
      console.error('Error: microCMS credentials are required.');
      console.error('');
      console.error('Provide them via:');
      console.error('  Single service mode:');
      console.error('    --service-id <service-id> --api-key <key>');
      console.error(
        '    or environment variables MICROCMS_SERVICE_ID and MICROCMS_API_KEY'
      );
      console.error('');
      console.error('  Multi service mode:');
      console.error('    environment variable MICROCMS_SERVICES (JSON array)');
      console.error(
        '    Example: MICROCMS_SERVICES=\'[{"id":"blog","apiKey":"xxx"}]\''
      );
      console.error('');
      console.error('Run with --help for more information.');
      process.exit(1);
    }

    // Import index.ts which auto-runs main()
    await import('./index.js');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Unknown error occurred');
    }
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCli();
}
