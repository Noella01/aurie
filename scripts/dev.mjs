import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readEnvFile(filename) {
  const fullPath = path.join(root, filename);
  if (!existsSync(fullPath)) return {};
  const values = {};
  for (const line of readFileSync(fullPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    else value = value.replace(/\s+#.*$/, '');
    values[match[1]] = value;
  }
  return values;
}

const env = { ...readEnvFile('.env'), ...readEnvFile('.env.local'), ...process.env };
const apiPort = env.API_PORT || '3001';
const apiOrigin = `http://localhost:${apiPort}`;
const configuredApi = (env.VITE_API_BASE_URL || '').trim();
const usesLocalApi = !configuredApi || configuredApi === apiOrigin || configuredApi === `http://127.0.0.1:${apiPort}`;
const children = [];
let stopping = false;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (child.exitCode === null) child.kill('SIGTERM');
  setTimeout(() => process.exit(code), 300);
}

function run(label, script, childEnv, args = []) {
  const child = spawn(process.execPath, [script, ...args], { cwd: root, env: childEnv, stdio: 'inherit' });
  children.push(child);
  child.on('error', error => { console.error(`${label} failed to start: ${error.message}`); stop(1); });
  child.on('exit', code => {
    if (!stopping && code !== 0) {
      console.error(`${label} stopped with code ${code}.`);
      stop(code || 1);
    }
  });
  return child;
}

if (usesLocalApi) run('Monve product API', 'backend/server.mjs', env);
const frontendEnv = { ...env, VITE_API_BASE_URL: configuredApi || apiOrigin };
run('Vite frontend', path.join(root, 'node_modules/vite/bin/vite.js'), frontendEnv, ['--config', 'frontend/vite.config.ts']);

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
