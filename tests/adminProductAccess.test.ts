import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

test('only an authenticated admin can change products', { timeout: 30000 }, async () => {
  const reservation = createServer().listen(0, '127.0.0.1');
  await new Promise<void>(resolve => reservation.once('listening', resolve));
  const port = (reservation.address() as { port: number }).port;
  await new Promise<void>(resolve => reservation.close(() => resolve()));
  const password = 'test-admin-password-12345';
  const server = spawn(process.execPath, ['--import', 'tsx', 'backend/server.ts', '--api-only'], {
    env: { ...process.env, NODE_ENV: 'development', PORT: String(port), ADMIN_PASSWORD: password },
    stdio: 'pipe',
  });
  let output = '';
  server.stderr.on('data', chunk => { output += chunk; });
  const base = `http://127.0.0.1:${port}`;
  try {
    let ready = false;
    for (let i = 0; i < 100; i++) {
      try { ready = (await fetch(`${base}/api/health`)).ok; } catch {}
      if (ready) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(ready, output || 'Backend did not start');
    const product = { name: 'Admin Test Garment', price: 1000, image_url: 'https://example.test/photo.jpg' };
    const json = { 'Content-Type': 'application/json' };
    assert.equal((await fetch(`${base}/api/products`, { method: 'POST', headers: json, body: JSON.stringify(product) })).status, 401);
    assert.equal((await fetch(`${base}/api/products/prod-001`, { method: 'PUT', headers: json, body: JSON.stringify({ image_url: 'changed' }) })).status, 401);
    assert.equal((await fetch(`${base}/api/products/prod-001`, { method: 'DELETE' })).status, 401);
    assert.equal((await fetch(`${base}/api/admin/login`, { method: 'POST', headers: json, body: JSON.stringify({ password: '2026' }) })).status, 401);
    const login = await fetch(`${base}/api/admin/login`, { method: 'POST', headers: json, body: JSON.stringify({ password }) });
    assert.equal(login.status, 200);
    const cookie = login.headers.get('set-cookie')!.split(';')[0];
    const create = await fetch(`${base}/api/products`, { method: 'POST', headers: { ...json, Cookie: cookie }, body: JSON.stringify(product) });
    assert.equal(create.status, 201, await create.clone().text());
    const saved = await create.json();
    assert.equal((await fetch(`${base}/api/products/${saved.id}`, { method: 'PUT', headers: { ...json, Cookie: cookie }, body: JSON.stringify({ image_url: 'changed' }) })).status, 200);
    assert.equal((await fetch(`${base}/api/products/${saved.id}`, { method: 'DELETE', headers: { Cookie: cookie } })).status, 200);
  } finally {
    if (server.exitCode === null) {
      const exited = new Promise(resolve => server.once('exit', resolve));
      server.kill();
      await exited;
    }
  }
});
