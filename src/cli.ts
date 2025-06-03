#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

export function showHelp() {
  console.log(`
microCMS MCP Server

A Model Context Protocol server for microCMS API integration.

Usage:
  npx microcms-mcp-server [options]

Options:
  --service-id <service-id>  microCMS service ID (required)
  --api-key <key>           microCMS API key (required)
  --help                    Show this help message
  --version                 Show version information

Environment Variables:
  MICROCMS_SERVICE_ID      Service ID (fallback)
  MICROCMS_API_KEY         API key (fallback)

Examples:
  npx microcms-mcp-server --service-id my-blog --api-key your-key
  
  # Using environment variables
  export MICROCMS_SERVICE_ID=my-blog
  export MICROCMS_API_KEY=your-key
  npx microcms-mcp-server

Claude Desktop Configuration:
{
  "mcpServers": {
    "microcms": {
      "command": "npx",
      "args": [
        "-y",
        "microcms-mcp-server",
        "--service-id", "your-service-id", 
        "--api-key", "your-api-key"
      ]
    }
  }
}
`);
}

export async function runCli() {
  try {
    const { values, positionals } = parseArgs({
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
    if (!process.env.MICROCMS_SERVICE_ID || !process.env.MICROCMS_API_KEY) {
      console.error('Error: microCMS credentials are required.');
      console.error('');
      console.error('Provide them via:');
      console.error('  --service-id <service-id> --api-key <key>');
      console.error('  or environment variables MICROCMS_SERVICE_ID and MICROCMS_API_KEY');
      console.error('');
      console.error('Run with --help for more information.');
      process.exit(1);
    }

    // サーバーを起動（既存のロジックを使用）
    const { startServer } = await import('./index.js');
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