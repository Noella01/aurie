import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { customerAccounts } from '../backend/customerAccounts';
import type { Product } from '../shared/types';

test('private accounts persist, isolate shopping and orders, and reject forged payments', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'lenos-accounts-test-'));
  process.env.ACCOUNT_DATA_DIR = dir;
  const product = { id: 'test', name: 'Test shirt', price: 5000, stock: 5, colors: [{ name: 'Black', hex: '#000' }], sizes: ['M'] } as Product;
  const app = express(); app.use(express.json()); app.use('/api/account', customerAccounts(() => [product]));
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const address = server.address() as { port: number };
  const base = `http://127.0.0.1:${address.port}/api/account/`;
  const request = (route: string, body?: unknown, cookie = '', method = 'POST') => fetch(base + route, { method: body === undefined ? 'GET' : method, headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: body === undefined ? undefined : JSON.stringify(body) });
  try {
    assert.equal((await request('shopping', { cart: [], wishlist: [] }, '', 'PUT')).status, 401);
    const alice = await request('signup', { name: 'Alice', email: 'alice@example.test', password: 'long-secure-test-password' });
    assert.equal(alice.status, 200);
    assert.match(alice.headers.get('set-cookie')!, /HttpOnly/);
    const cookie = alice.headers.get('set-cookie')!.split(';')[0];
    const account = await alice.json(); assert.equal(account.customer.email, 'alice@example.test'); assert.equal(account.customer.hash, undefined);
    assert.equal((await request('login', { email: 'alice@example.test', password: 'wrong-long-password' })).status, 401);
    const cart = [{ product, selectedSize: 'M', selectedColor: product.colors[0], quantity: 2 }];
    assert.equal((await request('shopping', { cart, wishlist: [product] }, cookie, 'PUT')).status, 200);
    const orderRes = await request('orders', { checkout_key: 'test-checkout-key-1234', customer_email: 'someone-else@example.test', customer_phone: '+250788000000', delivery_province: 'Kigali', delivery_district: 'Gasabo', delivery_sector: 'Kimironko', delivery_street: 'Test street', items: [{ product_id: 'test', quantity: 2, size: 'M', color: 'Black', price: 1 }], payment_status: 'SUCCESSFUL', total: 1 }, cookie);
    assert.equal(orderRes.status, 201);
    const order = await orderRes.json(); assert.equal(order.payment_status, 'PENDING'); assert.equal(order.total, 12500); assert.equal(order.customer_email, 'alice@example.test');
    const retry = await (await request('orders', { checkout_key: 'test-checkout-key-1234' }, cookie)).json(); assert.equal(retry.id, order.id);
    const bob = await request('signup', { name: 'Bob', email: 'bob@example.test', password: 'another-secure-password' });
    const bobCookie = bob.headers.get('set-cookie')!.split(';')[0];
    const bobSession = await (await request('session', undefined, bobCookie)).json();
    assert.deepEqual(bobSession.orders, []); assert.deepEqual(bobSession.cart, []);
    const disk = readFileSync(path.join(dir, 'customers.json'), 'utf8'); assert.ok(!disk.includes('long-secure-test-password'));
    // Reload the router from disk to verify restart persistence.
    const restored = express(); restored.use(express.json()); restored.use('/api/account', customerAccounts(() => [product]));
    const restoredServer = restored.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => restoredServer.once('listening', resolve));
    try {
      const result = await fetch(`http://127.0.0.1:${(restoredServer.address() as { port: number }).port}/api/account/session`, { headers: { Cookie: cookie } });
      const session = await result.json(); assert.equal(session.orders.length, 1); assert.equal(session.wishlist.length, 1);
    } finally { restoredServer.close(); }
    await request('logout', {}, cookie);
    assert.equal((await (await request('session', undefined, cookie)).json()).customer, null);
  } finally {
    server.close(); delete process.env.ACCOUNT_DATA_DIR;
    // This exact directory was created by this test under the OS temporary directory.
    rmSync(dir, { recursive: true, force: true });
  }
});
