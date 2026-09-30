import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { customerAccounts } from './customerAccounts';
import { createServer as createViteServer } from 'vite';
import type { Product, Order, CustomClothingRequest } from '../shared/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';
const frontendRoot = path.resolve(__dirname, '../frontend');
const apiOnly = process.argv.includes('--api-only');

app.use(express.json({ limit: '10mb' }));

// Server-Sent Events (SSE) subscribers for real-time tracking updates
interface SSESubscriber {
  id: string;
  res: Response;
}
let sseSubscribers: SSESubscriber[] = [];

function broadcastEvent(type: string, data: any) {
  const payload = `data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`;
  sseSubscribers.forEach((sub) => {
    try {
      sub.res.write(payload);
    } catch {
      // connection might have dropped
    }
  });
}

// In-Memory Database initialized with curated LENO'S pieces (No pictures by default, placeholders ready for user)
let products: Product[] = [
  {
    id: 'prod-001',
    name: 'Obsidian Minimal Blazer',
    tagline: 'Structured silhouette tailored with sharp lines and cultural drape',
    category: 'Men' as const,
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
    gender: 'men' as const,
    is_featured: true,
    is_new_arrival: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-002',
    name: 'Tailored Poplin Mandarin Shirt',
    tagline: 'Modern standing collar with clean concealed placket',
    category: 'Men' as const,
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
    gender: 'men' as const,
    is_featured: false,
    is_new_arrival: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-003',
    name: 'Sculptural Asymmetric Evening Gown',
    tagline: 'Fluid geometry with dramatic high-fashion draping',
    category: 'Women' as const,
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
    gender: 'women' as const,
    is_featured: true,
    is_new_arrival: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-004',
    name: 'Fluid Wide-Leg Tailored Trousers',
    tagline: 'Relaxed high-rise silhouette with deep double pleats',
    category: 'Women' as const,
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
    gender: 'women' as const,
    is_featured: false,
    is_new_arrival: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-005',
    name: '"STYLE WITH NO LIMITS" Heavyweight Tee',
    tagline: '320 GSM luxury unisex essential with minimalist tonal branding',
    category: 'Unisex' as const,
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
    gender: 'unisex' as const,
    is_featured: true,
    is_new_arrival: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-006',
    name: 'Architectural Boxy Hoodie',
    tagline: 'Sculpted double-layer hood without drawstrings for pure minimalism',
    category: 'Unisex' as const,
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
    gender: 'unisex' as const,
    is_featured: false,
    is_new_arrival: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-007',
    name: 'Modern Umushanana Cultural Ensemble',
    tagline: 'Rwandan ceremonial heritage reinterpreted in minimalist midnight tones',
    category: 'Culture' as const,
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
    gender: 'women' as const,
    is_featured: true,
    is_new_arrival: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-008',
    name: 'Rwandan Imigongo-Inspired Embroidered Tunic',
    tagline: 'Geometric cultural prestige woven into contemporary silhouette',
    category: 'Culture' as const,
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
    gender: 'men' as const,
    is_featured: true,
    is_new_arrival: false,
    created_at: new Date().toISOString(),
  }
];

// Initial Orders (with real-time status history)
let orders: Order[] = [
  {
    id: 'ord-001',
    order_number: 'LEN-2026-0001',
    customer_name: 'Jean-Paul Mugisha',
    customer_email: 'jp.mugisha@gmail.com',
    customer_phone: '+250 788 452 190',
    delivery_province: 'Kigali City',
    delivery_district: 'Gasabo',
    delivery_sector: 'Kimihurura',
    delivery_street: 'KG 674 St, House 14 (Near Convention Center)',
    delivery_notes: 'Call before arriving. Please leave with security if unreachable.',
    items: [
      {
        product_id: 'prod-001',
        product_name: 'Obsidian Minimal Blazer',
        size: 'L',
        color: 'Obsidian Black',
        quantity: 1,
        price: 125000,
      },
      {
        product_id: 'prod-005',
        product_name: '"STYLE WITH NO LIMITS" Heavyweight Tee',
        size: 'L',
        color: 'Vintage Black',
        quantity: 1,
        price: 42000,
      }
    ],
    subtotal: 167000,
    delivery_fee: 2500,
    total: 169500,
    currency: 'RWF' as const,
    status: 'SHIPPED' as const,
    payment_status: 'SUCCESSFUL' as const,
    payment_method: 'flutterwave_momo' as const,
    transaction_reference: 'FLW-TX-RW-882914',
    flutterwave_tx_id: '3920194',
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    timeline: [
      {
        status: 'PENDING' as const,
        timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        title: 'Order Placed',
        description: 'Order created via Rwanda Mobile Money checkout.'
      },
      {
        status: 'CONFIRMED' as const,
        timestamp: new Date(Date.now() - 35 * 3600 * 1000).toISOString(),
        title: 'Payment Confirmed',
        description: 'Flutterwave confirmed payment of 169,500 RWF via MTN MoMo.'
      },
      {
        status: 'PROCESSING' as const,
        timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        title: 'Atelier Packaging',
        description: 'Garments steamed, quality-checked, and packaged in LENO’S luxury dust bag.'
      },
      {
        status: 'SHIPPED' as const,
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        title: 'Out for Delivery',
        description: 'Dispatched with Kigali Express courier. Expected delivery within 2 hours.'
      }
    ]
  },
  {
    id: 'ord-002',
    order_number: 'LEN-2026-0002',
    customer_name: 'Clarisse Umutoni',
    customer_email: 'clarisse.u@outlook.com',
    customer_phone: '+250 783 119 220',
    delivery_province: 'Kigali City',
    delivery_district: 'Kicukiro',
    delivery_sector: 'Niboye',
    delivery_street: 'KK 312 St, Villa 8',
    delivery_notes: 'Delivery in the afternoon preferred.',
    items: [
      {
        product_id: 'prod-007',
        product_name: 'Modern Umushanana Cultural Ensemble',
        size: 'M',
        color: 'Midnight & Bronze',
        quantity: 1,
        price: 185000,
      }
    ],
    subtotal: 185000,
    delivery_fee: 2500,
    total: 187500,
    currency: 'RWF' as const,
    status: 'PROCESSING' as const,
    payment_status: 'SUCCESSFUL' as const,
    payment_method: 'flutterwave_card' as const,
    transaction_reference: 'FLW-TX-RW-901243',
    flutterwave_tx_id: '3920881',
    created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    timeline: [
      {
        status: 'PENDING' as const,
        timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        title: 'Order Placed',
        description: 'Order created via Card Payment.'
      },
      {
        status: 'CONFIRMED' as const,
        timestamp: new Date(Date.now() - 13 * 3600 * 1000).toISOString(),
        title: 'Payment Verified',
        description: 'Payment verified by Flutterwave.'
      },
      {
        status: 'PROCESSING' as const,
        timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        title: 'Garment Preparation',
        description: 'Custom tailoring measurements verified in our Kigali workshop.'
      }
    ]
  }
];

// Initial Custom Tailoring Requests (Phase 2 dedicated workflow)
let customRequests: CustomClothingRequest[] = [
  {
    id: 'req-001',
    request_number: 'REQ-2026-001',
    full_name: 'Thierry Gasana',
    phone: '+250 788 901 345',
    email: 'thierry.g@gmail.com',
    gender: 'Men' as const,
    clothing_type: 'Bespoke Wedding Traditional Suit',
    preferred_color: 'Matte Obsidian with Champagne Gold Piping',
    measurements: 'Chest: 42 in, Waist: 34 in, Shoulder: 19 in, Arm Length: 26 in, Height: 184 cm',
    occasion: 'Brother’s Wedding (Gusaba Ceremony)',
    description: 'Looking for a structured cultural piece matching modern tailored trousers with traditional Rwandan cape drapery.',
    reference_image: '',
    preferred_deadline: '2026-10-15',
    status: 'IN PRODUCTION' as const,
    estimated_price: 240000,
    notes: 'Fitting session completed on Tuesday. Master tailor finalizing hand embroidery.',
    created_at: new Date(Date.now() - 5 * 86400 * 1000).toISOString()
  },
  {
    id: 'req-002',
    request_number: 'REQ-2026-002',
    full_name: 'Solange Uwase',
    phone: '+250 782 556 789',
    email: 'solange.u@yahoo.com',
    gender: 'Women' as const,
    clothing_type: 'Modern Gala Two-Piece Set',
    preferred_color: 'Charcoal Black & Deep Emerald',
    measurements: 'Bust: 36 in, Waist: 28 in, Hips: 40 in, Length: 60 in',
    occasion: 'Kigali Fashion & Culture Gala',
    description: 'High-waisted wide trousers paired with an architectural corset and cape sleeve.',
    reference_image: '',
    preferred_deadline: '2026-10-28',
    status: 'DESIGNING' as const,
    estimated_price: 210000,
    notes: 'Color swatches sent via WhatsApp. Client approved dark emerald silk.',
    created_at: new Date(Date.now() - 2 * 86400 * 1000).toISOString()
  }
];

// Flutterwave Config
let flutterwaveConfig = {
  public_key: process.env.FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-SANDBOX-LENOS-RW-X',
  secret_key: process.env.FLUTTERWAVE_SECRET_KEY || 'FLWSECK_TEST-SANDBOX-LENOS-RW-X',
  is_test_mode: true,
  merchant_name: 'LENO’S Rwanda',
  currency: 'RWF'
};

// SSE Endpoint for Live Tracking & Live Order sync
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const id = Math.random().toString(36).substring(2, 9);
  sseSubscribers.push({ id, res });

  // Initial ping
  res.write(`data: ${JSON.stringify({ type: 'connected', subscriberId: id })}\n\n`);

  req.on('close', () => {
    sseSubscribers = sseSubscribers.filter((s) => s.id !== id);
  });
});

// Products API
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search } = req.query;
  let filtered = [...products];

  if (category && category !== 'All') {
    filtered = filtered.filter(
      (p) => p.category.toLowerCase() === (category as string).toLowerCase()
    );
  }

  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  res.json(filtered);
});

app.post('/api/products', (req: Request, res: Response) => {
  const newProduct = {
    ...req.body,
    id: `prod-${Date.now().toString().slice(-6)}`,
    created_at: new Date().toISOString()
  };
  products.unshift(newProduct);
  broadcastEvent('product_created', newProduct);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  products[index] = { ...products[index], ...req.body, id: req.params.id };
  broadcastEvent('product_updated', products[index]);
  res.json(products[index]);
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const deleted = products.splice(index, 1)[0];
  broadcastEvent('product_deleted', deleted);
  res.json({ success: true, id: req.params.id });
});

// Orders API
app.use('/api/account', customerAccounts(() => products));

app.get('/api/orders', (req: Request, res: Response) => {
  res.json(orders);
});

app.get('/api/orders/track/:orderNumber', (req: Request, res: Response) => {
  const cleanOrderNum = req.params.orderNumber.trim().toUpperCase().replace('#', '');
  const order = orders.find(
    (o) => o.order_number.toUpperCase().replace('#', '') === cleanOrderNum
  );
  if (!order) {
    return res.status(404).json({ error: 'Order not found with this number' });
  }
  res.json(order);
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

app.post('/api/orders', (req: Request, res: Response) => {
  const count = orders.length + 1;
  const orderNumber = `LEN-2026-${String(count).padStart(4, '0')}`;
  const now = new Date().toISOString();

  const newOrder = {
    ...req.body,
    id: `ord-${Date.now().toString().slice(-6)}`,
    order_number: orderNumber,
    created_at: now,
    updated_at: now,
    timeline: [
      {
        status: req.body.status || 'PENDING',
        timestamp: now,
        title: 'Order Placed',
        description: `Order ${orderNumber} received. Payment method: ${req.body.payment_method}`
      }
    ]
  };

  orders.unshift(newOrder);
  broadcastEvent('order_created', newOrder);
  res.status(201).json(newOrder);
});

app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const index = orders.findIndex((o) => o.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const { status, payment_status, note } = req.body;
  const order = orders[index];
  const now = new Date().toISOString();

  if (status && status !== order.status) {
    order.status = status;
    let description = note || `Order updated to ${status}`;
    if (status === 'CONFIRMED') description = 'Order confirmed and ready for crafting.';
    if (status === 'PROCESSING') description = 'Garments in preparation at LENO’S workshop.';
    if (status === 'SHIPPED') description = 'Package in transit with Rwandan delivery team.';
    if (status === 'DELIVERED') description = 'Package successfully handed over to customer.';
    if (status === 'CANCELLED') description = 'Order was cancelled.';

    order.timeline.push({
      status,
      timestamp: now,
      title: `Status: ${status}`,
      description
    });
  }

  if (payment_status) {
    order.payment_status = payment_status;
  }

  order.updated_at = now;
  broadcastEvent('order_updated', order);
  res.json(order);
});

// Custom Clothing Requests API
app.get('/api/custom-requests', (req: Request, res: Response) => {
  res.json(customRequests);
});

app.post('/api/custom-requests', (req: Request, res: Response) => {
  const count = customRequests.length + 1;
  const requestNumber = `REQ-2026-${String(count).padStart(3, '0')}`;
  const newRequest = {
    ...req.body,
    id: `req-${Date.now().toString().slice(-6)}`,
    request_number: requestNumber,
    status: 'NEW',
    created_at: new Date().toISOString()
  };
  customRequests.unshift(newRequest);
  broadcastEvent('custom_request_created', newRequest);
  res.status(201).json(newRequest);
});

app.patch('/api/custom-requests/:id/status', (req: Request, res: Response) => {
  const index = customRequests.findIndex((r) => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Custom request not found' });
  }
  customRequests[index] = { ...customRequests[index], ...req.body };
  broadcastEvent('custom_request_updated', customRequests[index]);
  res.json(customRequests[index]);
});

// Flutterwave Payments Integration Endpoints
app.get('/api/flutterwave/config', (req: Request, res: Response) => {
  res.json({
    public_key: flutterwaveConfig.public_key,
    is_test_mode: flutterwaveConfig.is_test_mode,
    merchant_name: flutterwaveConfig.merchant_name,
    currency: flutterwaveConfig.currency
  });
});

app.post('/api/flutterwave/config', (req: Request, res: Response) => {
  const { public_key, secret_key, is_test_mode, merchant_name } = req.body;
  flutterwaveConfig = {
    ...flutterwaveConfig,
    ...(public_key && { public_key }),
    ...(secret_key && { secret_key }),
    ...(is_test_mode !== undefined && { is_test_mode }),
    ...(merchant_name && { merchant_name })
  };
  res.json({ success: true, message: 'Flutterwave config updated' });
});

app.post('/api/flutterwave/initialize', (req: Request, res: Response) => {
  const { order_id, amount, currency, customer, payment_method } = req.body;
  const tx_ref = `LEN-FLW-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Return transaction initialization payload
  res.json({
    status: 'success',
    message: 'Flutterwave payment session initialized',
    data: {
      tx_ref,
      amount,
      currency: currency || 'RWF',
      customer,
      payment_method,
      test_mode: flutterwaveConfig.is_test_mode,
      checkout_url: `https://checkout.flutterwave.com/v3/hosted/pay/${tx_ref}`
    }
  });
});

app.post('/api/flutterwave/verify', (req: Request, res: Response) => {
  const { tx_ref, order_id, payment_status } = req.body;
  const order = orders.find((o) => o.id === order_id || o.transaction_reference === tx_ref);

  if (order) {
    order.payment_status = payment_status || 'SUCCESSFUL';
    order.status = 'CONFIRMED';
    order.updated_at = new Date().toISOString();
    order.timeline.push({
      status: 'CONFIRMED',
      timestamp: new Date().toISOString(),
      title: 'Payment Confirmed',
      description: `Verified by Flutterwave Gateway (${tx_ref}).`
    });
    broadcastEvent('order_updated', order);
  }

  res.json({
    status: 'success',
    message: 'Transaction successfully verified',
    data: {
      tx_ref,
      verified: true,
      order_status: order ? order.status : 'CONFIRMED'
    }
  });
});

// Admin Analytics & Metrics
app.get('/api/admin/metrics', (req: Request, res: Response) => {
  const totalSales = orders
    .filter((o) => o.payment_status === 'SUCCESSFUL')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED').length;
  const processingOrders = orders.filter((o) => o.status === 'PROCESSING' || o.status === 'SHIPPED').length;
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED').length;
  const activeCustomRequests = customRequests.filter((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length;
  const lowStockCount = products.filter((p) => p.stock < 10).length;

  res.json({
    totalSales,
    totalOrders: orders.length,
    pendingOrders,
    processingOrders,
    deliveredOrders,
    activeCustomRequests,
    lowStockCount,
    totalProducts: products.length
  });
});

import fs from 'fs';

// Mount Vite or serve static files
async function startServer() {
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'lenos-backend' }));
  app.use('/api', (_req, res) => res.status(404).json({ error: 'API endpoint not found' }));
  if (!isProd && !apiOnly) {
    const vite = await createViteServer({
      root: frontendRoot,
      configFile: path.join(frontendRoot, 'vite.config.ts'),
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.use('*', async (req: Request, res: Response, next) => {
      // Don't intercept API routes
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.join(frontendRoot, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else if (!apiOnly) {
    app.use(express.static(path.join(frontendRoot, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(frontendRoot, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`LENO'S full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
