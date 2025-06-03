#!/usr/bin/env node

// CLI entry point for the package
import('../dist/cli.js').then(module => {
  module.runCli();
}).catch(error => {
  console.error('Failed to start microCMS MCP Server:', error.message);
  process.exit(1);
});