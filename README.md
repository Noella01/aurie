# AURIE

## Project structure

```text
frontend/                  React pages, navigation, cart, customer dashboard
  src/
  public/                  Images and public assets
  index.html
  vite.config.ts
backend/
  server.ts                Express APIs and production web server
  customerAccounts.ts      Login, sessions, saved shopping lists and account orders
  scripts/                 Local development utilities
shared/types.ts            Types shared by frontend and backend
tests/                     API integration tests
package.json               Commands and dependencies for both applications
.env                       Private backend environment settings (not committed)
.data/                     Local account storage (not committed)
```

Both applications share one dependency installation and lockfile at the root. No source code is lost when moving between development and deployment.

## Run locally

Run `npm ci` once from the project root. Use `npm run dev` for the combined development server at http://localhost:3000.

To run the frontend and backend independently, use two terminals at the root:

1. `npm run dev:backend` — API at http://localhost:3000.
2. `npm run dev:frontend` — website at http://localhost:5173.

Open the **frontend URL** in your browser. Its Vite proxy sends `/api/*` requests to the backend, including secure session cookies. This avoids cross-origin cookie configuration. If changing the backend port, set `API_PROXY_TARGET` for the frontend process accordingly.

You can also run `npm run dev` inside `frontend/` to start only the frontend, or inside `backend/` to start only the backend. These folder commands delegate to the root scripts and shared dependency installation. Use either the combined server or the separate servers; do not start a second backend on port 3000.

## Local customer login

With other backend processes stopped, run `npm run account:demo` once. It creates a local test customer and prints its generated credentials, also saved in ignored `.data/demo-login.json`. Then start the application and visit `/login`. This is a customer account, not an administrator account. It is not created automatically on Render. Live customers use Sign up.

Never commit `.data`, private `.env` files, passwords or database connection strings.

## Build and Render

- Root directory: project root (leave Render's Root Directory blank).
- Build command: `npm ci --include=dev && npm run build`.
- Start command: `npm start`.
- Environment: `NODE_ENV=production`, `NODE_VERSION=22`.

The frontend builds to `frontend/dist`; the backend serves it and `/api` from the same public URL. Source folders are separate even though one Render service runs the site. Existing GitHub Actions build/start commands still apply. `npm run preview` only previews built frontend assets; use the backend for full account testing.

Account endpoints currently require `ACCOUNT_DATA_DIR` on a persistent disk in production. See CUSTOMER-ACCOUNTS.md for the current storage limitations and remaining production work.

## Recommended database

Use PostgreSQL for the live store. It is suitable for customers, unique email addresses, products, inventory, carts, orders, order lines, payment attempts and sessions. Database transactions help keep related updates consistent.

Since the application is on Render, Render Postgres is the simplest hosting match. Create it in the backend's region and use its internal connection URL **only on the backend**. Do not put database credentials into frontend variables prefixed with `VITE_`.

PostgreSQL is a recommendation, not an already connected dependency: the application still uses `.data/customers.json` for accounts and in-memory legacy catalogue/demo data. A PostgreSQL migration needs tables, a backend database driver, data migration, and replacing the current file/in-memory repositories. Merely setting `DATABASE_URL` will not perform that migration.

## Verification

`npm run lint`, `npm run test:accounts`, `npm run build`.
