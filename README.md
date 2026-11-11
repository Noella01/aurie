# MONVÉ storefront

The site is a React/Vite storefront with a small Node product service for local catalogue management. The service persists products and product images on disk, authenticates the admin product area, and sends catalogue updates to the customer portal. It does not implement orders, customer accounts, Customs requests, checkout or payments; those still need a full replacement service.

## Website and backend documentation

The 4 November 2026 source snapshot is documented in [Website current state](docs/website-current-state.md). Use [Backend requirements](docs/backend-requirements.md) for the complete feature mapping, API contracts, data model, integration changes and acceptance checklist. The [AI backend build prompt](docs/backend-ai-prompt.md) is ready to copy into a development AI with access to this repository.

## Run locally

From the project root:

```sh
npm ci
npm run dev
```

`npm run dev` starts the product API on port 3001 and the storefront on port 5173. Copy `.env.example` to `.env` if needed, then set a private `ADMIN_PASSWORD` before signing in at `/admin`. The development API creates an unpredictable session secret at startup when `SESSION_SECRET` is not set.

Products are stored in `.data/monve/products.json`; uploaded product images are stored in `.data/monve/uploads/`. Both paths are ignored by Git. The first start seeds the file with the sample catalogue from the storefront.

## Scope of the local product service

- Admin login, product list, category filters, product create/edit/delete, and product image uploads.
- The public catalogue reads the same saved product file, so a product added in Admin appears in the storefront and survives a server restart.
- The service is a single-process, JSON-file implementation for local use and small single-instance deployments. Keep its data directory on persistent storage and back it up. Do not run multiple API replicas against the same JSON files.

This local service intentionally returns an unavailable route for orders, customer accounts, Customs requests, and payments. Deploy a full backend for those features.

## Production deployment

Deploy `backend/server.mjs` as a Node service with a persistent data volume (start it with `npm run start:backend`). Set `ADMIN_PASSWORD`, `SESSION_SECRET`, `API_PUBLIC_URL`, `APP_ORIGINS`, and `VITE_API_BASE_URL` in the appropriate server/build environments. Keep the frontend and API on the same site (for example, `shop.example.com` and `api.example.com`) so the admin session cookie works. Never put server secrets in a `VITE_` variable.

For a larger or multi-instance deployment, replace the JSON-file store with a transactional database and shared media storage before adding replicas.

## Connect your replacement

The frontend integration boundary is `frontend/src/services/`:

- `api.ts`: catalogue, orders, Customs, store settings and events.
- `account.ts`: account/session operations.
- `http.ts`: optional HTTP transport, availability flag and response errors.
- `shared/types.ts`: the data shapes consumed by the pages.

To use a different API, set `VITE_API_BASE_URL` in the root `.env` to its origin, then restart Vite or rebuild. The origin must serve the routes below. Requests include cookies; configure the replacement service for the frontend origin and its authentication approach.

| Frontend operation | Current HTTP contract |
| --- | --- |
| Catalogue | `GET /api/products` returns `Product[]` |
| Product management | `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id` |
| Orders | `GET/POST /api/orders`, `PATCH /api/orders/:id/status` |
| Customs | `GET/POST /api/custom-requests`, `PATCH /api/custom-requests/:id/status` |
| Customer accounts | `/api/account/session`, `/signup`, `/login`, `/logout`, `/shopping`, `/orders` |
| Admin authentication | `/api/admin/session`, `/login`, `/logout` |
| Admin email | `/api/admin/customers`, `/api/admin/emails/status`, `/api/admin/emails`, `/api/admin/emails/send` |
| Existing payment settings UI | `GET/POST /api/flutterwave/config` |

Successful responses contain the relevant JSON data (or HTTP 204 for void operations). Errors may return `{ "error": "message" }`. Customer sign-in returns `{ customer, cart, wishlist, orders }`; a guest session returns `{ customer: null }`. Admin session/sign-in returns `{ authenticated: boolean }`.

The local product service supports product events at `GET /api/events`; the frontend polls this route so the customer catalogue updates after a product change. A replacement service can provide the same route or configure an SSE endpoint.

The replacement service must own authentication, permissions, durable storage, pricing and payment verification. The retained checkout payload contains simulated payment-success fields, including when the signed-in screen says the order is unpaid; replace this behavior before accepting real orders. The current admin settings form shows non-secret fields, but the shared configuration type still includes `secret_key`. Remove that field from the browser contract and never return payment secrets to the frontend. Never put passwords or secret keys in `VITE_` variables, which are public browser configuration.

The admin email panel sends individual plain-text messages via the connected backend. Configure Brevo only in the backend's private environment; signup, delivery-status and abandoned-cart automations are not enabled yet.

## Existing data

Ignored `.data/` files are preserved for migration and are not used by the standalone frontend. If an old local server was running during removal, its available catalogue, orders and Customs records were exported to `.data/legacy-backend-export.json` before shutdown. Existing guest carts and wishlists remain in browser storage. The old admin password and server-only environment settings are no longer used.

## Build and deploy

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

The build output is `frontend/dist`. Deploy it to a static host and configure an SPA fallback to `index.html` for routes such as `/shop`, `/customs`, `/account` and `/admin`. `npm run preview` is a local build preview, not a production application server.
