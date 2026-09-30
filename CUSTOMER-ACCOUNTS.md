# Customer accounts

Customers can browse and add items to their cart without signing in. The bag icon opens the cart and the heart opens favourites. Login and sign-up lead to `/account`, a separate page in the same storefront. On phones these links are in the navigation menu.

Signing in merges the guest cart and favourites into the account. Authenticated carts and favourites are saved on the server, and orders are bound to the authenticated customer ID, never a submitted email. Logging out clears the visible account's cart and favourites. The dashboard shows order history, unpaid orders, cart, favourites, and profile details. An unfinished cart is not counted as a purchase. Only account orders created while signed in appear in this history; old guest/demo orders are not claimed by email.

## Storage and deployment

Development stores account records in the ignored `.data/customers.json`. Passwords are salted and hashed with scrypt. Random session tokens are stored as hashes on the server and sent in HttpOnly, SameSite cookies; production cookies also require HTTPS. Sessions expire after seven days. Login attempts are rate limited within the running process.

Production account endpoints stay disabled unless `ACCOUNT_DATA_DIR` is set. On Render, mount persistent storage and set this variable to a writable folder on that mount, such as `/var/data/lenos-accounts`. An environment variable alone does not make storage persistent. Back up this directory and restrict its access. This implementation supports one server process; use a managed database/session store before running multiple instances.

## Remaining launch work

- Connect a real payment provider and verify payment webhooks on the server. New account orders are deliberately PENDING/unpaid regardless of client-supplied payment status or totals; prices are calculated from the server catalogue.
- Connect account orders to an authenticated fulfilment/admin workflow. They are intentionally separate from the legacy public demo orders and public event stream. They cannot currently be updated from the existing admin dashboard.
- Protect the existing admin APIs and replace demo/guest order handling before accepting real customer data. Those legacy routes are not made production-ready by this account feature.
- Add email verification and password reset via an email provider. These are not implemented yet.
- Add stock reservation, payment retry and inventory updates when real checkout is connected. Saved unpaid orders do not reserve stock.

Run `npm run test:accounts`, `npm run lint`, and `npm run build` to check the account implementation.
