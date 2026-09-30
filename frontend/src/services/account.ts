import type { CartItem, Product, Order } from '../types';
export type Customer = { id: string; name: string; email: string };
export type Account = { customer: Customer; cart: CartItem[]; wishlist: Product[]; orders: Order[] };
export async function accountRequest<T>(path: string, body?: unknown, method = 'POST'): Promise<T> {
  const res = await fetch(`/api/account/${path}`, {
    credentials: 'same-origin',
    method: body === undefined ? 'GET' : method,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Unable to reach your account. Please try again.');
  return data;
}
