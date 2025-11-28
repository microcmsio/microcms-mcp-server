#!/usr/bin/env node

import { parseArgs } from 'node:util';

export function showHelp() {
  // eslint-disable-next-line no-console
  console.log(`
microCMS MCP Server

A Model Context Protocol server for microCMS API integration.

Usage:
  npx microcms-mcp-server [options]

Options:
  --service-id <service-id>  microCMS service ID (for single service mode)
  --api-key <key>           microCMS API key (for single service mode)
  --help                    Show this help message
  --version                 Show version information

Environment Variables:
  Single service mode:
    MICROCMS_SERVICE_ID      Service ID
    MICROCMS_API_KEY         API key

  Multi service mode:
    MICROCMS_SERVICES        JSON array of services
                             Example: '[{"id":"blog","apiKey":"xxx"},{"id":"shop","apiKey":"yyy"}]'

Examples:
  # Single service mode
  npx microcms-mcp-server --service-id my-blog --api-key your-key
  
  # Using environment variables (single service)
  export MICROCMS_SERVICE_ID=my-blog
  export MICROCMS_API_KEY=your-key
  npx microcms-mcp-server

  # Multi service mode
  export MICROCMS_SERVICES='[{"id":"blog","apiKey":"xxx"},{"id":"shop","apiKey":"yyy"}]'
  npx microcms-mcp-server

Claude Desktop Configuration (Single Service):
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

Claude Desktop Configuration (Multi Service):
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
        'help': {
          type: 'boolean',
          short: 'h',
        }
      },
      allowPositionals: true,
    });

    if (values.help) {
      showHelp();
      process.exit(0);
    }

    // 設定を環境変数に設定（既存のサーバーコードが使用するため）
    if (values['service-id']) {
      process.env.MICROCMS_SERVICE_ID = values['service-id'];
    }
    if (values['api-key']) {
      process.env.MICROCMS_API_KEY = values['api-key'];
    }

    // 設定の検証
    // MICROCMS_SERVICES が設定されている場合はマルチサービスモード（単一サービス設定は不要）
    const hasMultiServiceConfig = !!process.env.MICROCMS_SERVICES;
    const hasSingleServiceConfig = !!(process.env.MICROCMS_SERVICE_ID && process.env.MICROCMS_API_KEY);
    
    if (!hasMultiServiceConfig && !hasSingleServiceConfig) {
      console.error('Error: microCMS credentials are required.');
      console.error('');
      console.error('Provide them via:');
      console.error('  Single service mode:');
      console.error('    --service-id <service-id> --api-key <key>');
      console.error('    or environment variables MICROCMS_SERVICE_ID and MICROCMS_API_KEY');
      console.error('');
      console.error('  Multi service mode:');
      console.error('    environment variable MICROCMS_SERVICES (JSON array)');
      console.error('    Example: MICROCMS_SERVICES=\'[{"id":"blog","apiKey":"xxx"}]\'');
      console.error('');
      console.error('Run with --help for more information.');
      process.exit(1);
    }

    // サーバーを起動
    const { startServer } = await import('./server.js');
    await startServer();

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Unknown error occurred');
    }
    process.exit(1);
  }
}

// 直接実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  runCli();
}