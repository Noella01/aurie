import { Product, Order, CustomClothingRequest, FlutterwaveConfig, OrderStatus, PaymentStatus } from '../types';

// Fallback initial products in case backend is loading
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Obsidian Minimal Blazer',
    tagline: 'Structured silhouette tailored with sharp lines and cultural drape',
    category: 'Men',
    subcategory: 'Jackets',
    price: 125000,
    image_url: '',
    description: 'An architectural single-breasted blazer cut from premium structured wool-blend. Features sharp peaked lapels, hidden interior pocket, and subtle Rwandan woven trim detailing inside the cuff.',
    materials: '80% Refined Wool, 20% Silk Twill. Lining: 100% Cupro.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Obsidian Black', hex: '#0D0D0D' },
      { name: 'Charcoal Slate', hex: '#1C1C1C' }
    ],
    stock: 14,
    sku: 'LEN-M-BLZ-001',
    gender: 'men',
    is_featured: true,
    is_new_arrival: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-002',
    name: 'Tailored Poplin Mandarin Shirt',
    tagline: 'Modern standing collar with clean concealed placket',
    category: 'Men',
    subcategory: 'Shirts',
    price: 58000,
    image_url: '',
    description: 'Contemporary slim-fitting shirt featuring an understated Mandarin band collar, mother-of-pearl buttons, and tailored cuffs. Ideal for formal evenings or contemporary cultural events.',
    materials: '100% Long-Staple Egyptian Cotton',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Pitch Black', hex: '#080808' },
      { name: 'Pure Chalk', hex: '#F0F0F0' }
    ],
    stock: 22,
    sku: 'LEN-M-SHT-002',
    gender: 'men',
    is_featured: false,
    is_new_arrival: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-003',
    name: 'Sculptural Asymmetric Evening Gown',
    tagline: 'Fluid geometry with dramatic high-fashion draping',
    category: 'Women',
    subcategory: 'Dresses',
    price: 145000,
    image_url: '',
    description: 'Designed to elevate Rwandan contemporary gala attire. An asymmetric one-shoulder gown with cascading pleats, side-slit confidence, and an interior corset for effortless poise.',
    materials: 'Heavy Weight Silk Crepe de Chine',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Midnight Onyx', hex: '#0A0A0A' },
      { name: 'Deep Espresso', hex: '#1F1A17' }
    ],
    stock: 9,
    sku: 'LEN-W-DRS-003',
    gender: 'women',
    is_featured: true,
    is_new_arrival: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-004',
    name: 'Fluid Wide-Leg Tailored Trousers',
    tagline: 'Relaxed high-rise silhouette with deep double pleats',
    category: 'Women',
    subcategory: 'Trousers',
    price: 78000,
    image_url: '',
    description: 'Impeccably tailored trousers engineered for unrestricted movement. Sits high on the waist with a flowing wide leg, side slant pockets, and subtle button tab adjusters.',
    materials: 'Structured Gabardine Wool Blend',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Obsidian', hex: '#111111' },
      { name: 'Smoked Ash', hex: '#242424' }
    ],
    stock: 18,
    sku: 'LEN-W-TRS-004',
    gender: 'women',
    is_featured: false,
    is_new_arrival: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-005',
    name: '"STYLE WITH NO LIMITS" Heavyweight Tee',
    tagline: '320 GSM luxury unisex essential with minimalist tonal branding',
    category: 'Unisex',
    subcategory: 'T-Shirts',
    price: 42000,
    image_url: '',
    description: 'The defining everyday statement of LENO’S. Built with heavyweight French Terry cotton, drop shoulder boxy fit, thick ribbed collar, and high-density tonal rubberized logo print on the chest.',
    materials: '100% Combed Heavy Cotton (320 GSM)',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Vintage Black', hex: '#141414' },
      { name: 'Anthracite', hex: '#222222' }
    ],
    stock: 35,
    sku: 'LEN-U-TEE-005',
    gender: 'unisex',
    is_featured: true,
    is_new_arrival: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-006',
    name: 'Architectural Boxy Hoodie',
    tagline: 'Sculpted double-layer hood without drawstrings for pure minimalism',
    category: 'Unisex',
    subcategory: 'Hoodies',
    price: 92000,
    image_url: '',
    description: 'Clean geometry meets supreme luxury. Features hidden side-seam pockets instead of a pouch, seamless dropped shoulders, and a heavy double-lined hood that holds its structure.',
    materials: '480 GSM Heavyweight Brushed Fleece',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Raw Black', hex: '#0B0B0B' },
      { name: 'Graphite', hex: '#1A1A1A' }
    ],
    stock: 12,
    sku: 'LEN-U-HOD-006',
    gender: 'unisex',
    is_featured: false,
    is_new_arrival: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-007',
    name: 'Modern Umushanana Cultural Ensemble',
    tagline: 'Rwandan ceremonial heritage reinterpreted in minimalist midnight tones',
    category: 'Culture',
    subcategory: 'Complete traditional outfits',
    price: 185000,
    image_url: '',
    description: 'A contemporary evolution of the traditional Rwandan Umushanana. Features fluid silk satin sash drape, tailored wrap skirt, and metallic copper-black handcrafted embroidery inspired by sacred geometry.',
    materials: 'Hand-dyed Raw Silk & Metallic Thread Embellishments',
    sizes: ['Custom / Made-to-measure', 'S', 'M', 'L'],
    colors: [
      { name: 'Midnight & Bronze', hex: '#0F0F0F' },
      { name: 'Matte Onyx & Gold Accent', hex: '#1C1917' }
    ],
    stock: 6,
    sku: 'LEN-C-MSH-007',
    gender: 'women',
    is_featured: true,
    is_new_arrival: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-008',
    name: 'Rwandan Imigongo-Inspired Embroidered Tunic',
    tagline: 'Geometric cultural prestige woven into contemporary silhouette',
    category: 'Culture',
    subcategory: 'Traditional shirts',
    price: 110000,
    image_url: '',
    description: 'Men’s ceremonial tunic honoring Rwandan Imigongo patterns. Precise raised embroidery along the chest placket and collar, designed for weddings, cultural festivals, and dignitary occasions.',
    materials: 'Structured Linen & Cotton Blend with Silk Threading',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Ebony & Silver Thread', hex: '#0C0C0C' },
      { name: 'Deep Coffee & Gold', hex: '#1A1614' }
    ],
    stock: 8,
    sku: 'LEN-C-TNC-008',
    gender: 'men',
    is_featured: true,
    is_new_arrival: false,
    created_at: new Date().toISOString(),
  }
];

// Helper to broadcast changes locally across tabs
const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('lenos_sync') : null;

// Event listeners list for real-time order updates
type EventCallback = (data: any) => void;
const eventListeners: Record<string, EventCallback[]> = {};

export function subscribeToStoreEvents(event: string, callback: EventCallback) {
  if (!eventListeners[event]) {
    eventListeners[event] = [];
  }
  eventListeners[event].push(callback);
  return () => {
    eventListeners[event] = eventListeners[event].filter((cb) => cb !== callback);
  };
}

export function triggerStoreEvent(event: string, data: any) {
  if (eventListeners[event]) {
    eventListeners[event].forEach((cb) => cb(data));
  }
  if (broadcastChannel) {
    broadcastChannel.postMessage({ event, data });
  }
}

if (broadcastChannel) {
  broadcastChannel.onmessage = (msg) => {
    const { event, data } = msg.data || {};
    if (event && eventListeners[event]) {
      eventListeners[event].forEach((cb) => cb(data));
    }
  };
}

// Connect to Backend SSE for live order tracking
if (typeof window !== 'undefined') {
  try {
    const sse = new EventSource('/api/events');
    sse.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type && eventListeners[payload.type]) {
          eventListeners[payload.type].forEach((cb) => cb(payload.data));
        }
      } catch {
        // ignore parse error
      }
    };
    sse.onerror = () => {
      // will auto retry
    };
  } catch {
    // SSE optional fallback
  }
}

// REST API calls with local cache fallback
export async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    localStorage.setItem('lenos_products', JSON.stringify(data));
    return data;
  } catch {
    const cached = localStorage.getItem('lenos_products');
    return cached ? JSON.parse(cached) : INITIAL_PRODUCTS;
  }
}

export async function createProduct(productData: Partial<Product>): Promise<Product> {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!res.ok) throw new Error('Failed to create product');
    const created = await res.json();
    triggerStoreEvent('product_created', created);
    return created;
  } catch {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString()
    } as Product;
    const current = await getProducts();
    const updated = [newProd, ...current];
    localStorage.setItem('lenos_products', JSON.stringify(updated));
    triggerStoreEvent('product_created', newProd);
    return newProd;
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update product');
    const updated = await res.json();
    triggerStoreEvent('product_updated', updated);
    return updated;
  } catch {
    const current = await getProducts();
    const idx = current.findIndex((p) => p.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates };
      localStorage.setItem('lenos_products', JSON.stringify(current));
      triggerStoreEvent('product_updated', current[idx]);
      return current[idx];
    }
    throw new Error('Product not found');
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete product');
    triggerStoreEvent('product_deleted', { id });
    return true;
  } catch {
    const current = await getProducts();
    const updated = current.filter((p) => p.id !== id);
    localStorage.setItem('lenos_products', JSON.stringify(updated));
    triggerStoreEvent('product_deleted', { id });
    return true;
  }
}

// Orders API
export async function getOrders(): Promise<Order[]> {
  try {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    localStorage.setItem('lenos_orders', JSON.stringify(data));
    return data;
  } catch {
    const cached = localStorage.getItem('lenos_orders');
    return cached ? JSON.parse(cached) : [];
  }
}

export async function trackOrderByNumber(orderNumber: string): Promise<Order | null> {
  try {
    const res = await fetch(`/api/orders/track/${encodeURIComponent(orderNumber)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    const orders = await getOrders();
    const cleanNum = orderNumber.trim().toUpperCase().replace('#', '');
    return orders.find((o) => o.order_number.toUpperCase().replace('#', '') === cleanNum) || null;
  }
}

export async function createOrder(orderPayload: Partial<Order>): Promise<Order> {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    if (!res.ok) throw new Error('Failed to create order');
    const created = await res.json();
    triggerStoreEvent('order_created', created);
    return created;
  } catch {
    const count = (await getOrders()).length + 1;
    const orderNumber = `LEN-2026-${String(count).padStart(4, '0')}`;
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...orderPayload,
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      currency: 'RWF',
      created_at: now,
      updated_at: now,
      timeline: [
        {
          status: orderPayload.status || 'PENDING',
          timestamp: now,
          title: 'Order Placed',
          description: `Order ${orderNumber} received. Payment method: ${orderPayload.payment_method}`
        }
      ]
    } as Order;

    const current = await getOrders();
    const updated = [newOrder, ...current];
    localStorage.setItem('lenos_orders', JSON.stringify(updated));
    triggerStoreEvent('order_created', newOrder);
    return newOrder;
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  paymentStatus?: PaymentStatus,
  note?: string
): Promise<Order> {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, payment_status: paymentStatus, note }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    const updated = await res.json();
    triggerStoreEvent('order_updated', updated);
    return updated;
  } catch {
    const current = await getOrders();
    const idx = current.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      const now = new Date().toISOString();
      current[idx].status = status;
      if (paymentStatus) current[idx].payment_status = paymentStatus;
      current[idx].updated_at = now;
      current[idx].timeline.push({
        status,
        timestamp: now,
        title: `Status: ${status}`,
        description: note || `Order updated to ${status}`
      });
      localStorage.setItem('lenos_orders', JSON.stringify(current));
      triggerStoreEvent('order_updated', current[idx]);
      return current[idx];
    }
    throw new Error('Order not found');
  }
}

// Custom Tailoring Requests
export async function getCustomRequests(): Promise<CustomClothingRequest[]> {
  try {
    const res = await fetch('/api/custom-requests');
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    localStorage.setItem('lenos_custom_requests', JSON.stringify(data));
    return data;
  } catch {
    const cached = localStorage.getItem('lenos_custom_requests');
    return cached ? JSON.parse(cached) : [];
  }
}

export async function createCustomRequest(data: Partial<CustomClothingRequest>): Promise<CustomClothingRequest> {
  try {
    const res = await fetch('/api/custom-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('API error');
    const created = await res.json();
    triggerStoreEvent('custom_request_created', created);
    return created;
  } catch {
    const count = (await getCustomRequests()).length + 1;
    const reqNum = `REQ-2026-${String(count).padStart(3, '0')}`;
    const newReq: CustomClothingRequest = {
      ...data,
      id: `req-${Date.now()}`,
      request_number: reqNum,
      status: 'NEW',
      created_at: new Date().toISOString()
    } as CustomClothingRequest;
    const current = await getCustomRequests();
    const updated = [newReq, ...current];
    localStorage.setItem('lenos_custom_requests', JSON.stringify(updated));
    triggerStoreEvent('custom_request_created', newReq);
    return newReq;
  }
}

export async function updateCustomRequestStatus(
  id: string,
  status: any,
  notes?: string
): Promise<CustomClothingRequest> {
  try {
    const res = await fetch(`/api/custom-requests/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    if (!res.ok) throw new Error('API error');
    const updated = await res.json();
    triggerStoreEvent('custom_request_updated', updated);
    return updated;
  } catch {
    const current = await getCustomRequests();
    const idx = current.findIndex((r) => r.id === id);
    if (idx !== -1) {
      current[idx].status = status;
      if (notes) current[idx].notes = notes;
      localStorage.setItem('lenos_custom_requests', JSON.stringify(current));
      triggerStoreEvent('custom_request_updated', current[idx]);
      return current[idx];
    }
    throw new Error('Custom request not found');
  }
}

// Flutterwave config
export async function getFlutterwaveConfig(): Promise<FlutterwaveConfig> {
  try {
    const res = await fetch('/api/flutterwave/config');
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    return {
      public_key: 'FLWPUBK_TEST-SANDBOX-LENOS-RW-X',
      secret_key: 'FLWSECK_TEST-SANDBOX-LENOS-RW-X',
      is_test_mode: true,
      merchant_name: 'LENO’S Rwanda',
      currency: 'RWF'
    };
  }
}

export async function updateFlutterwaveConfig(config: Partial<FlutterwaveConfig>): Promise<void> {
  await fetch('/api/flutterwave/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
}
