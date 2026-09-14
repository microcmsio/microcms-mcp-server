import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { startHttpTransport } from '../dist/transport/http.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const token = 'test-secret-token';
const configError = 'MCP_AUTH_TOKEN is required for HTTP transport.';

function environment(authToken) {
  const env = {
    ...process.env,
    MICROCMS_SERVICE_ID: 'test-service',
    MICROCMS_API_KEY: 'test-api-key',
    MCP_TRANSPORT: 'http',
    MCP_HTTP_HOST: '127.0.0.1',
    MCP_HTTP_PORT: '0',
  };
  delete env.MICROCMS_SERVICES;
  delete env.MCP_AUTH_TOKEN;
  if (authToken !== undefined) env.MCP_AUTH_TOKEN = authToken;
  return env;
}

function launch(t, entry, authToken) {
  const child = spawn(process.execPath, [entry], {
    cwd: root,
    env: environment(authToken),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stderr = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  const closed = once(child, 'close');
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
    await closed;
  });
  return { child, closed, stderr: () => stderr };
}

for (const [name, value] of [
  ['unset', undefined], ['empty', ''], ['whitespace', ' \t\n '],
]) {
  test(`HTTP rejects ${name} token before creating a server`, async () => {
    await assert.rejects(startHttpTransport(() => {
      assert.fail('Server factory must not run');
    }, { auth: { bearerToken: value } }), { message: configError });
  });

  for (const entry of ['dist/index.js', 'bin/microcms-mcp-server.js']) {
    test(`${entry}: HTTP exits with configuration error for ${name} token`, { timeout: 10000 }, async (t) => {
      const proc = launch(t, entry, value);
      const [code] = await proc.closed;
      assert.equal(code, 1, proc.stderr());
      assert.ok(proc.stderr().includes(`Configuration Error: ${configError}`));
      assert.doesNotMatch(proc.stderr(), /listening on/);
    });
  }
}

test('HTTP authenticates new and existing sessions; health remains public', { timeout: 15000 }, async (t) => {
  const proc = launch(t, 'dist/index.js', token);
  const endpoint = await new Promise((resolve, reject) => {
    proc.child.stderr.on('data', () => {
      const match = proc.stderr().match(/listening on (http:\/\/[^\s]+\/mcp)/);
      if (match) resolve(new URL(match[1]));
    });
    proc.closed.then(() => reject(new Error(proc.stderr())));
  });
  const health = await fetch(new URL('/health', endpoint));
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: 'ok' });

  async function assertUnauthorized(sessionId) {
    for (const method of ['POST', 'GET', 'DELETE']) {
      for (const authorization of [undefined, 'Bearer wrong-token']) {
        const headers = { Accept: 'application/json, text/event-stream' };
        if (authorization) headers.Authorization = authorization;
        if (sessionId) headers['mcp-session-id'] = sessionId;
        const response = await fetch(endpoint, { method, headers });
        assert.equal(response.status, 401, `${method}, ${authorization}, session=${sessionId}`);
        await response.body?.cancel();
      }
    }
  }

  await assertUnauthorized();
  const client = new Client({ name: 'auth-test', version: '1.0.0' });
  const transport = new StreamableHTTPClientTransport(endpoint, {
    requestInit: { headers: { Authorization: `Bearer ${token}` } },
  });
  t.after(() => client.close());
  await client.connect(transport);
  assert.ok(transport.sessionId);
  assert.ok((await client.listTools()).tools.some((tool) => tool.name === 'microcms_get_list'));
  await assertUnauthorized(transport.sessionId);
  assert.ok((await client.listTools()).tools.length > 0);
  await transport.terminateSession();
});

test('stdio initializes and lists tools without an auth token', { timeout: 10000 }, async (t) => {
  const env = environment();
  delete env.MCP_TRANSPORT;
  const client = new Client({ name: 'stdio-test', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['dist/index.js'],
    cwd: root,
    env,
    stderr: 'pipe',
  });
  t.after(() => client.close());
  await client.connect(transport);
  assert.ok((await client.listTools()).tools.some((tool) => tool.name === 'microcms_get_list'));
});
