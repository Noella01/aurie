import 'dotenv/config';
import express from 'express';
import { randomBytes } from 'node:crypto';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { customerAccounts } from '../customerAccounts';

if (process.env.NODE_ENV === 'production') throw new Error('Demo customers can only be created locally.');
const directory = fileURLToPath(new URL('../../.data/', import.meta.url));
process.env.ACCOUNT_DATA_DIR = directory;
const credentialsFile = `${directory}/demo-login.json`;
if (existsSync(credentialsFile)) {
  console.log(readFileSync(credentialsFile, 'utf8'));
} else {
  const credentials = { email: 'customer@lenos.test', password: randomBytes(18).toString('base64url') };
  const app = express(); app.use(express.json()); app.use('/api/account', customerAccounts(() => []));
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  try {
    const { port } = server.address() as { port: number };
    const res = await fetch(`http://127.0.0.1:${port}/api/account/signup`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...credentials, name: 'Test Customer' }),
    });
    if (!res.ok) throw new Error(`Could not create test account: ${await res.text()}`);
    mkdirSync(directory, { recursive: true });
    writeFileSync(credentialsFile, JSON.stringify(credentials, null, 2), { mode: 0o600 });
    console.log(JSON.stringify(credentials, null, 2));
  } finally { server.close(); }
}
