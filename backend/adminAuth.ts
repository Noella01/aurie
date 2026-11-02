import { Router, type Request, type Response, type NextFunction } from 'express';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const sessions = new Map<string, number>();
const attempts = new Map<string, { count: number; until: number }>();
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const cookieValue = (req: Request) => (req.headers.cookie || '').split(';').map(part => part.trim())
  .find(part => part.startsWith('lenos_admin_session='))?.slice('lenos_admin_session='.length) || '';
const cookieSettings = { httpOnly: true, sameSite: 'strict' as const, secure: process.env.NODE_ENV === 'production', path: '/' };

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) return res.status(403).json({ error: 'Request not allowed.' });
  const expires = sessions.get(hash(cookieValue(req)));
  if (!expires || expires < Date.now()) return res.status(401).json({ error: 'Admin sign-in required.' });
  next();
}

export const adminAuth = Router();
adminAuth.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
adminAuth.get('/session', (req, res) => {
  const expires = sessions.get(hash(cookieValue(req)));
  res.json({ authenticated: Boolean(expires && expires > Date.now()) });
});
adminAuth.post('/login', (req, res) => {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured || configured.length < 12) return res.status(503).json({ error: 'Admin password is not configured on the server.' });
  if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) return res.status(403).json({ error: 'Request not allowed.' });
  const key = req.ip || 'unknown';
  const old = attempts.get(key);
  const state = old && old.until > Date.now() ? old : { count: 0, until: Date.now() + 15 * 60_000 };
  if (++state.count > 10) return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  attempts.set(key, state);
  const supplied = typeof req.body?.password === 'string' ? req.body.password : '';
  const expected = createHash('sha256').update(configured).digest();
  const received = createHash('sha256').update(supplied).digest();
  if (!timingSafeEqual(received, expected)) return res.status(401).json({ error: 'Incorrect admin password.' });
  attempts.delete(key);
  const token = randomBytes(32).toString('hex');
  sessions.set(hash(token), Date.now() + 8 * 60 * 60_000);
  res.cookie('lenos_admin_session', token, { ...cookieSettings, maxAge: 8 * 60 * 60_000 });
  res.json({ authenticated: true });
});
adminAuth.post('/logout', (req, res) => {
  sessions.delete(hash(cookieValue(req)));
  res.clearCookie('lenos_admin_session', cookieSettings).json({ authenticated: false });
});
