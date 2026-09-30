import { Router, type Request } from 'express';
import { randomBytes, scryptSync, timingSafeEqual, createHash, randomUUID } from 'node:crypto';
import { mkdirSync, existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import path from 'node:path';
import type { CartItem, Product, Order } from '../shared/types';

type Customer = { id: string; name: string; email: string; salt: string; hash: string; cart: CartItem[]; wishlist: Product[]; orders: Order[]; checkoutKeys?: Record<string, string> };
type Session = { customerId: string; expires: number };
export function customerAccounts(getProducts: () => Product[]) {
  const router = Router();
  const directory = process.env.ACCOUNT_DATA_DIR || path.resolve('.data');
  const enabled = process.env.NODE_ENV !== 'production' || Boolean(process.env.ACCOUNT_DATA_DIR);
  const file = path.join(directory, 'customers.json');
  const db: { customers: Customer[]; sessions: Record<string, Session> } = enabled && existsSync(file)
    ? JSON.parse(readFileSync(file, 'utf8')) : { customers: [], sessions: {} };
  const save = () => {
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    writeFileSync(file + '.tmp', JSON.stringify(db), { mode: 0o600 });
    renameSync(file + '.tmp', file);
  };
  const tokenHash = (value: string) => createHash('sha256').update(value).digest('hex');
  const token = (req: Request) => (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('lenos_session='))?.slice(14) || '';
  const current = (req: Request) => {
    const session = db.sessions[tokenHash(token(req))];
    return session && session.expires > Date.now() ? db.customers.find(c => c.id === session.customerId) : undefined;
  };
  const publicCustomer = (c: Customer) => ({ id: c.id, name: c.name, email: c.email });
  const snapshot = (c: Customer) => ({ customer: publicCustomer(c), cart: c.cart, wishlist: c.wishlist, orders: c.orders });
  const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/' };
  const attempts = new Map<string, { count: number; expires: number }>();
  router.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    if (!enabled) return res.status(503).json({ error: 'Customer accounts are not available yet. Please try again later.' });
    if (req.method !== 'GET' && (!req.is('application/json') || (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host))) {
      return res.status(403).json({ error: 'Request not allowed.' });
    }
    next();
  });
  router.get('/session', (req, res) => {
    const customer = current(req);
    res.json(customer ? snapshot(customer) : { customer: null });
  });
  router.post(['/signup', '/login'], (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = req.body.password;
    const key = `${req.ip}:${email}`;
    for (const [key, value] of attempts) if (value.expires < Date.now()) attempts.delete(key);
    const attempt = attempts.get(key) || { count: 0, expires: Date.now() + 15 * 60_000 };
    if (++attempt.count > 10) return res.status(429).json({ error: 'Too many attempts. Please try again in 15 minutes.' });
    attempts.set(key, attempt);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || typeof password !== 'string' || password.length < 12 || password.length > 128) {
      return res.status(400).json({ error: 'Enter a valid email and a password of 12–128 characters.' });
    }
    let customer = db.customers.find(c => c.email === email);
    if (req.path === '/signup') {
      const name = String(req.body.name || '').trim();
      if (!name || name.length > 100) return res.status(400).json({ error: 'Enter your name (up to 100 characters).' });
      if (customer) return res.status(409).json({ error: 'Unable to create this account. Try logging in instead.' });
      const salt = randomBytes(16).toString('hex');
      customer = { id: randomUUID(), name, email, salt, hash: scryptSync(password, salt, 64).toString('hex'), cart: [], wishlist: [], orders: [] };
      db.customers.push(customer);
    } else {
      const hash = scryptSync(password, customer?.salt || 'invalid-account-salt', 64);
      if (!customer || !timingSafeEqual(hash, Buffer.from(customer.hash, 'hex'))) return res.status(401).json({ error: 'Email or password is incorrect.' });
    }
    delete db.sessions[tokenHash(token(req))];
    for (const [key, session] of Object.entries(db.sessions)) if (session.expires < Date.now()) delete db.sessions[key];
    const sessionToken = randomBytes(32).toString('hex');
    db.sessions[tokenHash(sessionToken)] = { customerId: customer.id, expires: Date.now() + 7 * 86400_000 };
    save();
    res.cookie('lenos_session', sessionToken, { ...cookieOptions, maxAge: 7 * 86400_000 });
    res.json(snapshot(customer));
  });
  router.post('/logout', (req, res) => {
    delete db.sessions[tokenHash(token(req))];
    save();
    res.clearCookie('lenos_session', cookieOptions).json({ ok: true });
  });
  router.use((req, res, next) => {
    const customer = current(req);
    if (!customer) return res.status(401).json({ error: 'Please log in to access your account.' });
    res.locals.customer = customer;
    next();
  });
  router.put('/shopping', (req, res) => {
    const customer: Customer = res.locals.customer;
    const { cart, wishlist } = req.body;
    const products = getProducts();
    if (!Array.isArray(cart) || !Array.isArray(wishlist) || cart.length > 100 || wishlist.length > 100) return res.status(400).json({ error: 'Invalid shopping list.' });
    const normalized: CartItem[] = [];
    for (const item of cart) {
      const product = products.find(p => p.id === item?.product?.id);
      const color = product?.colors.find(c => c.name === item?.selectedColor?.name);
      if (!product || !color || !product.sizes.includes(item.selectedSize) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) return res.status(400).json({ error: 'A cart item is no longer available. Please update your cart.' });
      normalized.push({ product, selectedColor: color, selectedSize: item.selectedSize, quantity: item.quantity });
    }
    customer.cart = normalized;
    customer.wishlist = products.filter(p => wishlist.some(w => w?.id === p.id));
    save();
    res.json({ ok: true });
  });
  // Account orders never enter the public demo order feed or its broadcasts.
  router.post('/orders', (req, res) => {
    const customer: Customer = res.locals.customer;
    const checkoutKey = req.body.checkout_key;
    if (typeof checkoutKey !== 'string' || !/^[a-zA-Z0-9-]{16,64}$/.test(checkoutKey)) return res.status(400).json({ error: 'Invalid checkout. Please reopen your cart.' });
    const existingId = customer.checkoutKeys?.[checkoutKey];
    if (existingId) return res.json(customer.orders.find(order => order.id === existingId));
    const products = getProducts();
    if (!Array.isArray(req.body.items) || !req.body.items.length || req.body.items.length > 100) return res.status(400).json({ error: 'Your cart is empty or invalid.' });
    const items: Order['items'] = [];
    for (const item of req.body.items) {
      const product = products.find(p => p.id === item.product_id);
      if (!product || !product.sizes.includes(item.size) || !product.colors.some(c => c.name === item.color) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > product.stock) return res.status(400).json({ error: 'Please review the availability of your cart items.' });
      items.push({ product_id: product.id, product_name: product.name, product_image: product.image_url, size: item.size, color: item.color, quantity: item.quantity, price: product.price });
    }
    const contact = ['customer_phone', 'delivery_province', 'delivery_district', 'delivery_sector', 'delivery_street'] as const;
    if (contact.some(key => typeof req.body[key] !== 'string' || !req.body[key].trim() || req.body[key].length > 250)) return res.status(400).json({ error: 'Please complete your delivery address and phone number.' });
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryFee = subtotal > 120000 ? 0 : 2500;
    const now = new Date().toISOString();
    const order: Order = {
      id: randomUUID(), order_number: `LEN-${randomBytes(8).toString('hex').toUpperCase()}`,
      customer_name: customer.name, customer_email: customer.email,
      customer_phone: req.body.customer_phone, delivery_province: req.body.delivery_province,
      delivery_district: req.body.delivery_district, delivery_sector: req.body.delivery_sector,
      delivery_street: req.body.delivery_street, items, subtotal, delivery_fee: deliveryFee,
      total: subtotal + deliveryFee, currency: 'RWF', status: 'PENDING', payment_status: 'PENDING',
      payment_method: ['flutterwave_momo', 'flutterwave_card', 'airtel_money'].includes(req.body.payment_method) ? req.body.payment_method : 'flutterwave_momo',
      transaction_reference: '', created_at: now, updated_at: now,
      timeline: [{ status: 'PENDING', timestamp: now, title: 'Order saved', description: 'Awaiting payment. No payment has been collected.' }],
    };
    customer.orders.unshift(order);
    customer.checkoutKeys = { ...customer.checkoutKeys, [checkoutKey]: order.id };
    customer.cart = [];
    save();
    res.status(201).json(order);
  });
  return router;
}
