import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer as createNetServer } from 'node:net';
import { createServer as createViteServer } from 'vite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('frontend proxy connects to backend and forwards customer session cookies', { timeout: 30000 }, async () => {
  const reservation = createNetServer().listen(0, '127.0.0.1');
  await new Promise<void>(resolve => reservation.once('listening', resolve));
  const port = (reservation.address() as { port: number }).port;
  await new Promise<void>(resolve => reservation.close(() => resolve()));
  const dir = mkdtempSync(path.join(tmpdir(), 'lenos-proxy-test-'));
  const backend = spawn(process.execPath, ['--import', 'tsx', 'backend/server.ts', '--api-only'], {
    env: { ...process.env, NODE_ENV: 'development', PORT: String(port), ACCOUNT_DATA_DIR: dir }, stdio: 'pipe',
  });
  const target = `http://127.0.0.1:${port}`;
  let output = '';
  backend.stderr.on('data', chunk => { output += chunk; });
  let frontend: Awaited<ReturnType<typeof createViteServer>> | undefined;
  try {
    let ready = false;
    for (let i = 0; i < 80; i++) {
      try { ready = (await fetch(`${target}/api/health`)).ok; } catch {}
      if (ready) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(ready, output || 'Backend did not start');
    frontend = await createViteServer({ configFile: 'frontend/vite.config.ts', server: { host: '127.0.0.1', port: 0, strictPort: false, proxy: { '/api': { target, changeOrigin: false } } } });
    await frontend.listen();
    const frontPort = (frontend.httpServer!.address() as { port: number }).port;
    const origin = `http://127.0.0.1:${frontPort}`;
    assert.equal((await fetch(origin)).status, 200);
    assert.equal((await (await fetch(`${origin}/api/health`)).json()).service, 'lenos-backend');
    const signup = await fetch(`${origin}/api/account/signup`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Proxy Test', email: 'proxy@example.test', password: 'proxy-test-password-123' }) });
    assert.equal(signup.status, 200, await signup.clone().text());
    const cookie = signup.headers.get('set-cookie')!.split(';')[0];
    const session = await (await fetch(`${origin}/api/account/session`, { headers: { Cookie: cookie } })).json();
    assert.equal(session.customer.email, 'proxy@example.test');
    assert.equal((await fetch(`${origin}/api/does-not-exist`)).status, 404);
  } finally {
    await frontend?.close();
    if (backend.exitCode === null) {
      const exited = new Promise(resolve => backend.once('exit', resolve));
      backend.kill(); await exited;
    }
    // Only remove the exact temporary directory created above.
    rmSync(dir, { recursive: true, force: true });
  }
});
