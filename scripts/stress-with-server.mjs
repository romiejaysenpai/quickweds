#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const port = Number(process.env.STRESS_PORT || 3001);
const host = process.env.STRESS_HOST || '127.0.0.1';
const baseUrl = `http://${host}:${port}`;
const startupTimeoutMs = Number(process.env.STRESS_SERVER_STARTUP_MS || 30_000);

function findStandaloneServer() {
  const standaloneDir = join('.next', 'standalone');
  const rootServer = join(standaloneDir, 'server.js');
  if (existsSync(rootServer)) return rootServer;

  if (!existsSync(standaloneDir)) return rootServer;

  const appEntry = readdirSync(standaloneDir, { withFileTypes: true }).find((entry) => {
    return entry.isDirectory() && existsSync(join(standaloneDir, entry.name, 'server.js'));
  });

  return appEntry ? join(standaloneDir, appEntry.name, 'server.js') : rootServer;
}

function parseEnvFile(path) {
  if (!existsSync(path)) return {};

  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=');
        const key = line.slice(0, index).trim();
        const rawValue = line.slice(index + 1).trim();
        const value = rawValue.replace(/^['"]|['"]$/g, '');
        return [key, value];
      }),
  );
}

const localEnv = {
  ...parseEnvFile('.env'),
  ...parseEnvFile('.env.local'),
};

function spawnProcess(command, args, options = {}) {
  return spawn(command, args, {
    stdio: options.stdio || 'inherit',
    shell: false,
    env: {
      ...localEnv,
      ...process.env,
      ...options.env,
    },
  });
}

async function waitForServer() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < startupTimeoutMs) {
    try {
      const response = await fetch(baseUrl, { redirect: 'manual' });
      if (response.status < 500) return;
    } catch {
      // Server is still booting.
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${baseUrl}`);
}

function runStressTest() {
  return new Promise((resolve) => {
    const stress = spawnProcess('node', ['scripts/stress-test.mjs'], {
      env: {
        BASE_URL: baseUrl,
      },
    });

    stress.on('exit', (code) => {
      resolve(code || 0);
    });
  });
}

const server = spawnProcess('node', [findStandaloneServer()], {
  env: {
    PORT: String(port),
    HOSTNAME: host,
  },
});

let exitCode = 1;

try {
  await waitForServer();
  exitCode = await runStressTest();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
} finally {
  server.kill('SIGTERM');
}

process.exit(exitCode);
