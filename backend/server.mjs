import { createServer } from 'node:http';
import { randomBytes, randomUUID, createHmac, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvFile(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || Object.hasOwn(process.env, match[1])) continue;
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    else value = value.replace(/\s+#.*$/, '');
    process.env[match[1]] = value;
  }
}

loadEnvFile(path.join(root, '.env'));
loadEnvFile(path.join(root, '.env.local'));

const port = Number(process.env.API_PORT || 3001);
const publicApiUrl = (process.env.API_PUBLIC_URL || `http://localhost:${port}`).replace(/\/+$/, '');
const origins = new Set((process.env.APP_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(value => value.trim()).filter(Boolean));
const dataDir = path.resolve(root, process.env.PRODUCT_DATA_DIR || '.data/monve');
const uploadDir = path.join(dataDir, 'uploads');
const productsFile = path.join(dataDir, 'products.json');
const production = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET || (production ? '' : randomBytes(32).toString('hex'));
const sessions = new Map();
const loginAttempts = new Map();
const events = [];
let eventCursor = 0;
let products = [];
let writeQueue = Promise.resolve();

class HttpError extends Error {
  constructor(status, message, code) { super(message); this.status = status; this.code = code; }
}

function sendJson(res, status, value, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(JSON.stringify(value));
}

function fail(res, status, message, code) {
  sendJson(res, status, { error: message, ...(code ? { code } : {}) });
}

function withCors(req, res) {
  const origin = req.headers.origin;
  if (!origin || !origins.has(origin)) return !origin;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Aurie-Client, Idempotency-Key, X-Order-Token');
  res.setHeader('Vary', 'Origin');
  return true;
}

function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map(part => part.trim().split(/=(.*)/s).slice(0, 2)).filter(([key, value]) => key && value !== undefined));
}

function signSession(id) { return createHmac('sha256', sessionSecret).update(id).digest('base64url'); }

function currentSession(req) {
  if (!sessionSecret) return null;
  const token = parseCookies(req.headers.cookie).monve_admin_session;
  const [id, signature] = token?.split('.') || [];
  if (!id || !signature) return null;
  const expected = signSession(id);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  const session = sessions.get(id);
  if (!session || session.expiresAt <= Date.now()) { sessions.delete(id); return null; }
  return session;
}

function requireAdmin(req, res) {
  if (!process.env.ADMIN_PASSWORD) {
    fail(res, 503, 'Set ADMIN_PASSWORD in the server environment before using the admin portal.', 'ADMIN_NOT_CONFIGURED');
    return false;
  }
  if (!sessionSecret) {
    fail(res, 503, 'Set SESSION_SECRET in the server environment before using the admin portal.', 'SESSION_NOT_CONFIGURED');
    return false;
  }
  if (!currentSession(req)) {
    fail(res, 401, 'Sign in to the admin portal to continue.', 'ADMIN_AUTH_REQUIRED');
    return false;
  }
  return true;
}

function checkOrigin(req, res) {
  const origin = req.headers.origin;
  if (origin && !origins.has(origin)) {
    fail(res, 403, 'This site is not allowed to update the catalogue.', 'ORIGIN_NOT_ALLOWED');
    return false;
  }
  return true;
}

function readBody(req, maxBytes = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let rejected = false;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > maxBytes) {
        rejected = true;
        reject(new HttpError(413, 'The request is too large.', 'PAYLOAD_TOO_LARGE'));
        req.resume();
        return;
      }
      if (!rejected) chunks.push(chunk);
    });
    req.on('end', () => { if (!rejected) resolve(Buffer.concat(chunks)); });
    req.on('error', reject);
  });
}

async function readJson(req) {
  const body = await readBody(req);
  try { return JSON.parse(body.toString('utf8')); }
  catch { throw new HttpError(400, 'Send a valid JSON request body.', 'INVALID_JSON'); }
}

function normalizeImages(input) {
  const candidates = Array.isArray(input.image_urls) ? input.image_urls : [];
  const urls = [...new Set([input.image_url, ...candidates].map(value => typeof value === 'string' ? value.trim() : '').filter(Boolean))];
  if (urls.length > 7) throw new HttpError(400, 'A piece can have at most seven images.', 'TOO_MANY_IMAGES');
  for (const value of urls) {
    if (value.startsWith('/media/')) continue;
    let parsed;
    try { parsed = new URL(value); } catch { throw new HttpError(400, 'Product image URLs must use HTTP or HTTPS.', 'INVALID_IMAGE_URL'); }
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new HttpError(400, 'Product image URLs must use HTTP or HTTPS.', 'INVALID_IMAGE_URL');
  }
  return urls;
}

function normalizeProduct(input, existing = {}) {
  const value = { ...existing, ...input };
  const name = typeof value.name === 'string' ? value.name.trim() : '';
  const category = value.category;
  const subcategory = typeof value.subcategory === 'string' ? value.subcategory.trim() : '';
  const sku = typeof value.sku === 'string' ? value.sku.trim() : '';
  const price = Number(value.price);
  const stock = Number(value.stock);
  const gender = value.gender || (category === 'Women' ? 'women' : category === 'Unisex' ? 'unisex' : 'men');
  if (!name || name.length > 160) throw new HttpError(400, 'Enter a piece name of up to 160 characters.', 'INVALID_NAME');
  if (!['Men', 'Women', 'Unisex', 'Culture'].includes(category)) throw new HttpError(400, 'Choose a valid product category.', 'INVALID_CATEGORY');
  if (!subcategory || subcategory.length > 100) throw new HttpError(400, 'Enter a subcategory of up to 100 characters.', 'INVALID_SUBCATEGORY');
  if (!sku || sku.length > 64) throw new HttpError(400, 'Enter a SKU of up to 64 characters.', 'INVALID_SKU');
  if (!Number.isFinite(price) || price < 0) throw new HttpError(400, 'Price must be a non-negative number.', 'INVALID_PRICE');
  if (!Number.isInteger(stock) || stock < 0) throw new HttpError(400, 'Stock must be a non-negative whole number.', 'INVALID_STOCK');
  if (!['men', 'women', 'unisex'].includes(gender)) throw new HttpError(400, 'Choose a valid gender.', 'INVALID_GENDER');
  const sizes = Array.isArray(value.sizes) ? [...new Set(value.sizes.map(item => String(item).trim()).filter(Boolean))].slice(0, 40) : [];
  if (!sizes.length) throw new HttpError(400, 'Add at least one size or fit option.', 'INVALID_SIZES');
  const colors = Array.isArray(value.colors) ? value.colors.slice(0, 20).map(color => ({ name: String(color?.name || '').trim(), hex: String(color?.hex || '').trim() })) : [];
  if (!colors.length || colors.some(color => !color.name || !/^#[0-9a-fA-F]{6}$/.test(color.hex))) throw new HttpError(400, 'Add at least one color using a valid six-digit hex value.', 'INVALID_COLORS');
  const image_urls = normalizeImages(value);
  const text = (field, max) => typeof value[field] === 'string' ? value[field].trim().slice(0, max) : '';
  return {
    ...existing,
    id: existing.id || value.id || randomUUID(),
    name,
    tagline: text('tagline', 220),
    category,
    subcategory,
    price,
    stock,
    sku,
    gender,
    description: text('description', 5000),
    materials: text('materials', 1200),
    sizes,
    colors,
    image_url: image_urls[0] || '',
    image_urls,
    is_featured: Boolean(value.is_featured),
    is_new_arrival: Boolean(value.is_new_arrival),
    created_at: existing.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: existing.id ? (existing.version || 1) + 1 : 1,
  };
}

async function withProductLock(operation) {
  const previous = writeQueue;
  let release;
  writeQueue = new Promise(resolve => { release = resolve; });
  await previous;
  try {
    const result = await operation();
    const tempFile = `${productsFile}.${randomUUID()}.tmp`;
    await writeFile(tempFile, `${JSON.stringify(products, null, 2)}\n`, { mode: 0o600 });
    await rename(tempFile, productsFile);
    return result;
  } finally { release(); }
}

function recordEvent(type, product) {
  const event = { type, data: product, version: product.version || 1, cursor: ++eventCursor };
  events.push(event);
  if (events.length > 500) events.shift();
}

function checkUniqueSku(sku, currentId = '') {
  if (products.some(product => product.id !== currentId && product.sku.toLowerCase() === sku.toLowerCase())) {
    throw new HttpError(409, 'That SKU is already in use.', 'SKU_CONFLICT');
  }
}

function extensionFor(contentType) {
  return ({ 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' })[contentType];
}

function imageBytesAreValid(contentType, buffer) {
  if (contentType === 'image/jpeg') return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (contentType === 'image/png') return buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (contentType === 'image/webp') return buffer.length > 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  return false;
}

async function uploadProductImage(req) {
  const type = req.headers['content-type'] || '';
  const boundary = type.match(/boundary=(?:"([^"]+)"|([^;]+))/i)?.slice(1).find(Boolean)?.trim();
  if (!boundary) throw new HttpError(400, 'Choose an image file to upload.', 'MISSING_UPLOAD');
  const body = await readBody(req, 5 * 1024 * 1024 + 64 * 1024);
  const first = body.indexOf(Buffer.from(`--${boundary}\r\n`));
  const headerEnd = body.indexOf(Buffer.from('\r\n\r\n'), first);
  const dataStart = headerEnd + 4;
  const dataEnd = body.indexOf(Buffer.from(`\r\n--${boundary}`), dataStart);
  if (first < 0 || headerEnd < 0 || dataEnd < 0) throw new HttpError(400, 'Could not read the uploaded image.', 'INVALID_UPLOAD');
  const headers = body.subarray(first, headerEnd).toString('latin1');
  if (!/content-disposition:\s*form-data;[^\r\n]*name="file"/i.test(headers)) throw new HttpError(400, 'Upload the image in the file field.', 'INVALID_UPLOAD');
  const contentType = headers.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim().toLowerCase() || '';
  const extension = extensionFor(contentType);
  const file = body.subarray(dataStart, dataEnd);
  if (!extension || file.length > 5 * 1024 * 1024 || !imageBytesAreValid(contentType, file)) {
    throw new HttpError(400, 'Choose a valid JPEG, PNG or WebP image up to 5 MB.', 'INVALID_IMAGE');
  }
  const filename = `${randomUUID()}${extension}`;
  await writeFile(path.join(uploadDir, filename), file, { flag: 'wx', mode: 0o644 });
  return { media_id: filename, url: `${publicApiUrl}/media/${filename}`, upload_token: randomBytes(24).toString('base64url') };
}

async function serveImage(res, filename) {
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(filename)) throw new HttpError(404, 'Image not found.');
  let body;
  try { body = await readFile(path.join(uploadDir, filename)); }
  catch { throw new HttpError(404, 'Image not found.'); }
  const extension = path.extname(filename);
  const contentType = extension === '.jpg' ? 'image/jpeg' : extension === '.png' ? 'image/png' : 'image/webp';
  res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' });
  res.end(body);
}

async function handle(req, res) {
  if (!withCors(req, res)) return fail(res, 403, 'This site is not allowed to access the product service.', 'ORIGIN_NOT_ALLOWED');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const method = req.method || 'GET';

  if (method === 'GET' && url.pathname === '/health/ready') return sendJson(res, 200, { ready: true, products: products.length });
  if (method === 'GET' && url.pathname === '/api/admin/session') return sendJson(res, 200, { authenticated: Boolean(currentSession(req)), ...(process.env.ADMIN_PASSWORD ? {} : { needs_setup: true }) });

  if (method === 'POST' && url.pathname === '/api/admin/login') {
    if (!checkOrigin(req, res)) return;
    if (!process.env.ADMIN_PASSWORD) return fail(res, 503, 'Set ADMIN_PASSWORD in the server environment before using the admin portal.', 'ADMIN_NOT_CONFIGURED');
    if (!sessionSecret) return fail(res, 503, 'Set SESSION_SECRET in the server environment before using the admin portal.', 'SESSION_NOT_CONFIGURED');
    const ip = req.socket.remoteAddress || 'unknown';
    const attempt = loginAttempts.get(ip) || { count: 0, blockedUntil: 0 };
    if (attempt.blockedUntil > Date.now()) return fail(res, 429, 'Too many sign-in attempts. Please wait before trying again.', 'LOGIN_RATE_LIMITED');
    const body = await readJson(req);
    const supplied = Buffer.from(String(body.password || ''));
    const expected = Buffer.from(process.env.ADMIN_PASSWORD);
    const passwordMatches = supplied.length === expected.length && timingSafeEqual(supplied, expected);
    const emailMatches = !process.env.ADMIN_EMAIL || String(body.email || '').trim().toLowerCase() === process.env.ADMIN_EMAIL.trim().toLowerCase();
    if (!passwordMatches || !emailMatches) {
      attempt.count += 1;
      if (attempt.count >= 8) { attempt.count = 0; attempt.blockedUntil = Date.now() + 15 * 60 * 1000; }
      loginAttempts.set(ip, attempt);
      return fail(res, 401, 'The email or password is incorrect.', 'INVALID_ADMIN_CREDENTIALS');
    }
    loginAttempts.delete(ip);
    const id = randomBytes(32).toString('base64url');
    const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
    sessions.set(id, { expiresAt });
    const secure = production ? '; Secure' : '';
    res.setHeader('Set-Cookie', `monve_admin_session=${id}.${signSession(id)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=43200${secure}`);
    return sendJson(res, 200, { authenticated: true });
  }

  if (method === 'POST' && url.pathname === '/api/admin/logout') {
    if (!checkOrigin(req, res)) return;
    const token = parseCookies(req.headers.cookie).monve_admin_session;
    if (token) sessions.delete(token.split('.')[0]);
    res.setHeader('Set-Cookie', 'monve_admin_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
    res.writeHead(204);
    return res.end();
  }

  if (method === 'GET' && url.pathname === '/api/products') return sendJson(res, 200, products);
  if (method === 'GET' && url.pathname === '/api/events') {
    const requestedCursor = Number(url.searchParams.get('after') || 0);
    const safeCursor = requestedCursor > eventCursor ? 0 : requestedCursor;
    const selected = events.filter(event => event.cursor > safeCursor);
    return sendJson(res, 200, { events: selected.map(({ type, data, version }) => ({ type, data, version })), cursor: eventCursor });
  }

  if (method === 'POST' && url.pathname === '/api/uploads') {
    if (!checkOrigin(req, res) || !requireAdmin(req, res)) return;
    if (url.searchParams.get('purpose') !== 'product') return fail(res, 400, 'Only product image uploads are available in this product service.', 'UNSUPPORTED_UPLOAD_PURPOSE');
    return sendJson(res, 201, await uploadProductImage(req));
  }

  if (url.pathname.startsWith('/media/') && method === 'GET') return serveImage(res, path.basename(url.pathname));

  const productId = url.pathname.match(/^\/api\/products\/([^/]+)$/)?.[1];
  if (productId) {
    const id = decodeURIComponent(productId);
    const index = products.findIndex(product => product.id === id);
    if (method === 'GET') return index < 0 ? fail(res, 404, 'Piece not found.', 'PRODUCT_NOT_FOUND') : sendJson(res, 200, products[index]);
    if (!['PUT', 'DELETE'].includes(method)) return fail(res, 405, 'Method not allowed.');
    if (!checkOrigin(req, res) || !requireAdmin(req, res)) return;
    if (method === 'DELETE') {
      await withProductLock(async () => {
        const currentIndex = products.findIndex(product => product.id === id);
        if (currentIndex < 0) throw new HttpError(404, 'Piece not found.', 'PRODUCT_NOT_FOUND');
        products = products.filter(product => product.id !== id);
      });
      recordEvent('product_deleted', { id });
      res.writeHead(204);
      return res.end();
    }
    const body = await readJson(req);
    let updated;
    await withProductLock(async () => {
      const currentIndex = products.findIndex(product => product.id === id);
      if (currentIndex < 0) throw new HttpError(404, 'Piece not found.', 'PRODUCT_NOT_FOUND');
      const current = products[currentIndex];
      if (body.expected_version !== undefined && Number(body.expected_version) !== Number(current.version)) throw new HttpError(409, 'This piece changed since it was opened. Refresh and try again.', 'VERSION_CONFLICT');
      updated = normalizeProduct(body, current);
      checkUniqueSku(updated.sku, id);
      products[currentIndex] = updated;
    });
    recordEvent('product_updated', updated);
    return sendJson(res, 200, updated);
  }

  if (method === 'POST' && url.pathname === '/api/products') {
    if (!checkOrigin(req, res) || !requireAdmin(req, res)) return;
    const body = await readJson(req);
    let created;
    await withProductLock(async () => {
      created = normalizeProduct(body);
      checkUniqueSku(created.sku);
      products.unshift(created);
    });
    recordEvent('product_created', created);
    return sendJson(res, 201, created);
  }

  return fail(res, 404, 'This API route is not available in the product service.', 'NOT_FOUND');
}

await mkdir(uploadDir, { recursive: true });
try {
  const contents = await readFile(productsFile, 'utf8');
  const stored = JSON.parse(contents);
  if (Array.isArray(stored)) products = stored;
  else throw new Error('The product data file must contain a JSON array.');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  const seed = JSON.parse(await readFile(path.join(root, 'backend/seed-products.json'), 'utf8'));
  products = seed.map(product => ({
    ...product,
    image_urls: Array.isArray(product.image_urls) ? product.image_urls : (product.image_url ? [product.image_url] : []),
    version: product.version || 1,
  }));
  await writeFile(productsFile, `${JSON.stringify(products, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
}

const server = createServer((req, res) => {
  handle(req, res).catch(error => {
    if (res.headersSent) { res.destroy(); return; }
    if (error instanceof HttpError) return fail(res, error.status, error.message, error.code);
    console.error('Product API request failed:', error.message);
    return fail(res, 500, 'The product service could not complete the request.', 'INTERNAL_ERROR');
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Monvé product API listening on port ${port}`);
  if (!process.env.ADMIN_PASSWORD) console.warn('Admin login is disabled: set ADMIN_PASSWORD in .env.');
  if (production && !process.env.SESSION_SECRET) console.warn('Admin login is disabled: set SESSION_SECRET in the server environment.');
});

function closeServer() { server.close(() => process.exit(0)); }
process.on('SIGINT', closeServer);
process.on('SIGTERM', closeServer);
