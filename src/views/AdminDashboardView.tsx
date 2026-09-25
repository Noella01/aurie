import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Scissors,
  Layers,
  CreditCard,
  Settings,
  ArrowUpRight,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  AlertTriangle,
  RefreshCw,
  Camera,
  MapPin,
  Phone,
  Eye,
  Menu,
  Lock,
  Unlock,
  LogOut,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { Product, Order, CustomClothingRequest, OrderStatus, PaymentStatus, CustomRequestStatus, CategoryType } from '../types';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  getCustomRequests,
  updateCustomRequestStatus,
  getFlutterwaveConfig,
  updateFlutterwaveConfig,
  subscribeToStoreEvents
} from '../services/api';
import { ImagePlaceholder } from '../components/ImagePlaceholder';

type AdminTab = 'overview' | 'products' | 'orders' | 'custom' | 'inventory' | 'payments' | 'settings';

interface AdminDashboardViewProps {
  currentTab?: AdminTab;
  onTabChange?: (tab: AdminTab) => void;
  onSwitchToCustomer: () => void;
  onTrackOrder: (orderNumber: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentTab = 'overview',
  onTabChange,
  onSwitchToCustomer,
  onTrackOrder
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(currentTab);

  // Authentication gate for admin portal
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('lenos_admin_auth') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Synchronize prop tab
  useEffect(() => {
    if (currentTab && currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [currentTab]);

  const handleTabSelect = (tab: AdminTab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomClothingRequest[]>([]);
  const [flwConfig, setFlwConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Product modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Selected Order for detail view
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Filter states
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passcode === '2026' || passcode.toLowerCase() === 'admin' || !passcode.trim()) {
      setIsAuthenticated(true);
      localStorage.setItem('lenos_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Incorrect passcode. Use default PIN: 2026 or click Quick Demo Access.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('lenos_admin_auth');
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, ords, reqs, cfg] = await Promise.all([
        getProducts(),
        getOrders(),
        getCustomRequests(),
        getFlutterwaveConfig(),
      ]);
      setProducts(prods);
      setOrders(ords);
      setCustomRequests(reqs);
      setFlwConfig(cfg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }

    // Listen to real-time events from server or customer actions
    const unsubOrder = subscribeToStoreEvents('order_created', (newOrder: Order) => {
      setOrders((prev) => [newOrder, ...prev]);
    });
    const unsubOrderUpd = subscribeToStoreEvents('order_updated', (updOrder: Order) => {
      setOrders((prev) => prev.map((o) => (o.id === updOrder.id ? updOrder : o)));
      if (viewingOrder?.id === updOrder.id) {
        setViewingOrder(updOrder);
      }
    });
    const unsubCustom = subscribeToStoreEvents('custom_request_created', (req: CustomClothingRequest) => {
      setCustomRequests((prev) => [req, ...prev]);
    });
    const unsubCustomUpd = subscribeToStoreEvents('custom_request_updated', (updReq: CustomClothingRequest) => {
      setCustomRequests((prev) => prev.map((r) => (r.id === updReq.id ? updReq : r)));
    });

    return () => {
      unsubOrder();
      unsubOrderUpd();
      unsubCustom();
      unsubCustomUpd();
    };
  }, [viewingOrder?.id, isAuthenticated]);

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      // Data will also be updated via store event
    } catch {
      alert('Failed to update order status');
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    try {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        await updateOrderStatus(orderId, order.status, paymentStatus);
      }
    } catch {
      alert('Failed to update payment status');
    }
  };

  const handleUpdateCustomStatus = async (id: string, status: CustomRequestStatus, notes?: string) => {
    try {
      await updateCustomRequestStatus(id, status, notes);
    } catch {
      alert('Failed to update bespoke request status');
    }
  };

  const handleAdjustStock = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    try {
      await updateProduct(product.id, { stock: newStock });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p))
      );
    } catch {
      alert('Failed to update stock');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to remove this garment from the store?')) {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      maximumFractionDigits: 0,
    }).format(val);

  // Metrics
  const totalSales = orders
    .filter((o) => o.payment_status === 'SUCCESSFUL')
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED').length;
  const inProductionCustomCount = customRequests.filter((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length;
  const lowStockProducts = products.filter((p) => p.stock < 10);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070707] flex flex-col justify-center items-center p-4 selection:bg-white selection:text-black">
        <div className="absolute inset-0 bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:24px_24px] opacity-50 pointer-events-none" />

        <div className="w-full max-w-md bg-[#121212] border border-[#2A2A2A] p-8 shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full border border-amber-500/40 bg-amber-950/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
              <Lock size={22} />
            </div>
            <span className="font-heading text-xl font-bold tracking-[0.2em] text-white block">
              LENO’S
            </span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-amber-400 font-semibold block">
              Store Admin Portal
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-[10px] font-mono text-neutral-400 mt-1">
              <span>localhost:3000/admin</span>
            </div>
            <p className="text-xs text-neutral-400 pt-2 font-light">
              Restricted portal for store operations, Kigali atelier inventory, bespoke tailoring, and Flutterwave payment settings.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">
                Admin Passcode / PIN
              </label>
              <input
                type="password"
                autoFocus
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter PIN (Default: 2026)"
                className="w-full bg-[#181818] border border-[#333333] px-3.5 py-2.5 text-sm text-white rounded focus:outline-none focus:border-white font-mono"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Default PIN: <code className="text-neutral-300">2026</code>
              </span>
            </div>

            {authError && (
              <div className="p-3 bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle size={14} />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-white hover:bg-neutral-200 text-black py-3 text-xs uppercase tracking-[0.2em] font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Unlock size={14} />
              <span>Unlock Admin Dashboard</span>
            </button>
          </form>

          <div className="pt-4 border-t border-[#222222] flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => handleLogin()}
              className="w-full py-2 bg-[#1C1C1C] hover:bg-[#252525] border border-[#2E2E2E] text-neutral-300 hover:text-white text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors uppercase tracking-wider"
            >
              <ShieldCheck size={14} className="text-amber-400" />
              <span>Quick 1-Click Demo Sign In</span>
            </button>

            <button
              type="button"
              onClick={onSwitchToCustomer}
              className="w-full py-2 text-neutral-500 hover:text-neutral-300 text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>← Back to Customer Storefront (localhost:3000)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col md:flex-row">
      {/* Sidebar for Desktop & Collapsible Mobile */}
      <aside className="w-full md:w-64 bg-[#0F0F0F] border-b md:border-b-0 md:border-r border-[#222222] flex-shrink-0 flex flex-col justify-between">
        <div>
          {/* Top Brand Tag */}
          <div className="p-5 border-b border-[#222222] flex items-center justify-between">
            <div>
              <span className="font-heading text-lg font-bold tracking-[0.2em] text-white">
                LENO’S
              </span>
              <span className="block text-[9px] uppercase tracking-[0.3em] text-amber-400 font-semibold">
                Store Management
              </span>
              <span className="block text-[9px] font-mono text-neutral-500 mt-0.5">
                /admin
              </span>
            </div>

            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-2 text-neutral-400 hover:text-white"
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav
            className={`p-3 space-y-1.5 text-xs font-medium uppercase tracking-wider ${
              mobileNavOpen ? 'block' : 'hidden md:block'
            }`}
          >
            <button
              onClick={() => {
                handleTabSelect('overview');
                setMobileNavOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-black font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Overview</span>
            </button>

            <button
              onClick={() => {
                handleTabSelect('products');
                setMobileNavOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded transition-colors ${
                activeTab === 'products'
                  ? 'bg-white text-black font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package size={16} />
                <span>Products</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#222] text-neutral-300">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => {
                handleTabSelect('orders');
                setMobileNavOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded transition-colors ${
                activeTab === 'orders'
                  ? 'bg-white text-black font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag size={16} />
                <span>Orders</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-black font-bold">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                handleTabSelect('custom');
                setMobileNavOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded transition-colors ${
                activeTab === 'custom'
                  ? 'bg-white text-black font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Scissors size={16} />
                <span>Custom Tailoring</span>
              </div>
              {inProductionCustomCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500 text-white font-bold">
                  {inProductionCustomCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                handleTabSelect('inventory');
                setMobileNavOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded transition-colors ${
                activeTab === 'inventory'
                  ? 'bg-white text-black font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers size={16} />
                <span>Inventory & Stock</span>
              </div>
              {lowStockProducts.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/60 text-red-300 font-bold">
                  {lowStockProducts.length} low
                </span>
              )}
            </button>

            <button
              onClick={() => {
                handleTabSelect('payments');
                setMobileNavOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded transition-colors ${
                activeTab === 'payments'
                  ? 'bg-white text-black font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <CreditCard size={16} />
              <span>Flutterwave & MoMo</span>
            </button>
          </nav>
        </div>

        {/* Bottom Switch back to Storefront Button & Sign Out */}
        <div className="p-4 border-t border-[#222222] space-y-2">
          <button
            onClick={onSwitchToCustomer}
            className="w-full py-2.5 px-3 bg-[#1C1C1C] hover:bg-[#252525] border border-[#2E2E2E] text-neutral-300 hover:text-white text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors uppercase tracking-wider"
          >
            <span>Customer Portal (/)</span>
            <ArrowUpRight size={14} />
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-1.5 px-3 text-neutral-500 hover:text-red-400 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut size={12} />
            <span>Lock Admin Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Top bar info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#222222] mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">
                Live Store Engine Active
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-1 uppercase tracking-wide">
              {activeTab === 'overview' && 'STORE OVERVIEW'}
              {activeTab === 'products' && 'GARMENT CATALOG'}
              {activeTab === 'orders' && 'CUSTOMER ORDERS & DISPATCH'}
              {activeTab === 'custom' && 'BESPOKE TAILORING PIPELINE'}
              {activeTab === 'inventory' && 'INVENTORY & ATELIER STOCK'}
              {activeTab === 'payments' && 'FLUTTERWAVE GATEWAY SETTINGS'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 border border-[#2E2E2E] bg-[#141414] hover:bg-[#202020] text-neutral-300 rounded transition-colors"
              title="Refresh store data"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>

            {activeTab === 'products' && (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="bg-white hover:bg-neutral-200 text-black px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <Plus size={15} />
                <span>Add New Piece</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#141414] border border-[#242424] p-5">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                  Total Revenue (RWF)
                </span>
                <div className="font-heading text-2xl font-bold text-white">
                  {formatCurrency(totalSales)}
                </div>
                <span className="text-[10px] text-emerald-400 mt-1 block">
                  ✓ Verified via Flutterwave Gateway
                </span>
              </div>

              <div className="bg-[#141414] border border-[#242424] p-5">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                  Total Orders
                </span>
                <div className="font-heading text-2xl font-bold text-white">
                  {orders.length}
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  {pendingOrdersCount} orders currently in dispatch pipeline
                </span>
              </div>

              <div className="bg-[#141414] border border-[#242424] p-5">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                  Active Bespoke Requests
                </span>
                <div className="font-heading text-2xl font-bold text-amber-300">
                  {inProductionCustomCount}
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Custom ceremonial tailoring
                </span>
              </div>

              <div className="bg-[#141414] border border-[#242424] p-5">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                  Garment Stock Status
                </span>
                <div className="font-heading text-2xl font-bold text-white">
                  {products.length} Designs
                </div>
                <span className="text-[10px] text-red-400 mt-1 block">
                  {lowStockProducts.length} low stock pieces
                </span>
              </div>
            </div>

            {/* Quick Status Adjuster on Recent Orders */}
            <div className="bg-[#141414] border border-[#242424] p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-heading text-base font-bold text-white uppercase tracking-wider">
                    Recent Orders & Live Status Control
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Changing status here instantly updates the customer's live tracking view in real time!
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-neutral-400 hover:text-white uppercase tracking-wider underline underline-offset-4"
                >
                  View All ({orders.length})
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#222222] text-neutral-400 text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-2">Order #</th>
                      <th className="py-3 px-2">Customer & Rwanda Address</th>
                      <th className="py-3 px-2">Amount</th>
                      <th className="py-3 px-2">Payment</th>
                      <th className="py-3 px-2">Live Order Status (1-Click Change)</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1F1F]">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-[#1A1A1A] transition-colors">
                        <td className="py-3.5 px-2 font-mono font-bold text-white">
                          #{order.order_number}
                        </td>
                        <td className="py-3.5 px-2">
                          <div className="font-medium text-white">{order.customer_name}</div>
                          <div className="text-[11px] text-neutral-400 line-clamp-1">
                            {order.delivery_sector}, {order.delivery_district} · {order.customer_phone}
                          </div>
                        </td>
                        <td className="py-3.5 px-2 font-semibold text-white">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="py-3.5 px-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              order.payment_status === 'SUCCESSFUL'
                                ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-950/70 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="py-3.5 px-2">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                            }
                            className="bg-[#202020] border border-[#333333] text-xs font-semibold px-2 py-1 rounded text-white focus:outline-none focus:border-white"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PROCESSING">PROCESSING (Atelier)</option>
                            <option value="SHIPPED">SHIPPED (In Transit)</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setViewingOrder(order)}
                              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-[#252525]"
                              title="View Order Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => onTrackOrder(order.order_number)}
                              className="text-[10px] text-neutral-400 hover:text-white px-2 py-1 border border-[#333333] hover:border-neutral-500 rounded font-mono"
                              title="Open in customer live tracking view"
                            >
                              Track
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in">
            {/* Filter and search */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-[#141414] p-4 border border-[#242424]">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[11px] uppercase tracking-wider text-neutral-400">Category:</span>
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="bg-[#1F1F1F] border border-[#2F2F2F] text-xs px-3 py-1.5 text-white rounded"
                >
                  <option value="All">All Categories</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                  <option value="Culture">Traditional / Culture</option>
                </select>
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search garments..."
                  className="w-full bg-[#1F1F1F] border border-[#2F2F2F] pl-9 pr-3 py-1.5 text-xs text-white rounded focus:outline-none focus:border-white"
                />
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-[#141414] border border-[#242424] overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#222222] text-neutral-400 text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3">Garment Photo / Silhouette</th>
                    <th className="py-3 px-3">Name & SKU</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Price (RWF)</th>
                    <th className="py-3 px-3">Sizes</th>
                    <th className="py-3 px-3">Stock in Atelier</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F1F]">
                  {products
                    .filter((p) => {
                      if (productCategoryFilter !== 'All' && p.category !== productCategoryFilter) return false;
                      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                      return true;
                    })
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-[#1A1A1A] transition-colors">
                        <td className="py-3 px-3">
                          <div className="w-14 h-16 bg-neutral-900 border border-[#2A2A2A] overflow-hidden">
                            <ImagePlaceholder
                              imageUrl={p.image_url}
                              alt={p.name}
                              category={p.category}
                              aspectRatio="portrait"
                              allowEdit={true}
                              onImageChange={async (newUrl) => {
                                await updateProduct(p.id, { image_url: newUrl });
                                setProducts((prev) =>
                                  prev.map((item) => (item.id === p.id ? { ...item, image_url: newUrl } : item))
                                );
                              }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-white">{p.name}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">SKU: {p.sku}</div>
                          {p.is_featured && (
                            <span className="text-[9px] text-amber-400 uppercase tracking-widest font-bold">
                              ★ Featured
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-[#1F1F1F] text-neutral-300 text-[10px] uppercase font-semibold">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-white">
                          {formatCurrency(p.price)}
                        </td>
                        <td className="py-3 px-3 text-[11px] text-neutral-300">
                          {p.sizes.join(', ')}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              p.stock > 10
                                ? 'text-emerald-400 bg-emerald-950/40'
                                : p.stock > 0
                                ? 'text-amber-400 bg-amber-950/40'
                                : 'text-red-400 bg-red-950/40'
                            }`}
                          >
                            {p.stock} units
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-[#252525]"
                              title="Edit product"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-[#252525]"
                              title="Delete product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            {/* Filter by status */}
            <div className="flex flex-wrap items-center gap-2 bg-[#141414] p-4 border border-[#242424] text-xs">
              <span className="text-neutral-400 uppercase tracking-wider text-[11px] mr-2">Filter Status:</span>
              {['All', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-2.5 py-1 uppercase text-[10px] font-semibold transition-colors ${
                    orderStatusFilter === st
                      ? 'bg-white text-black'
                      : 'bg-[#1F1F1F] text-neutral-400 hover:text-white border border-[#2E2E2E]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="bg-[#141414] border border-[#242424] overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#222222] text-neutral-400 text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3">Order Number</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Customer & Contact</th>
                    <th className="py-3 px-3">Rwanda Destination</th>
                    <th className="py-3 px-3">Total (RWF)</th>
                    <th className="py-3 px-3">Payment Status</th>
                    <th className="py-3 px-3">Order Status (Live Sync)</th>
                    <th className="py-3 px-3 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F1F]">
                  {orders
                    .filter((o) => orderStatusFilter === 'All' || o.status === orderStatusFilter)
                    .map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#1A1A1A] transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-white">
                          #{ord.order_number}
                        </td>
                        <td className="py-3.5 px-3 text-neutral-400 text-[11px]">
                          {new Date(ord.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-white">{ord.customer_name}</div>
                          <div className="text-[11px] text-neutral-400 font-mono">{ord.customer_phone}</div>
                        </td>
                        <td className="py-3.5 px-3 text-neutral-300">
                          <div>{ord.delivery_sector}, {ord.delivery_district}</div>
                          <div className="text-[10px] text-neutral-500 line-clamp-1">{ord.delivery_street}</div>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-white">
                          {formatCurrency(ord.total)}
                        </td>
                        <td className="py-3.5 px-3">
                          <select
                            value={ord.payment_status}
                            onChange={(e) =>
                              handleUpdatePaymentStatus(ord.id, e.target.value as PaymentStatus)
                            }
                            className="bg-[#202020] border border-[#333333] text-[10px] uppercase font-bold px-2 py-1 text-white rounded"
                          >
                            <option value="SUCCESSFUL">SUCCESSFUL</option>
                            <option value="PENDING">PENDING</option>
                            <option value="FAILED">FAILED</option>
                            <option value="REFUNDED">REFUNDED</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-3">
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)
                            }
                            className="bg-[#202020] border border-[#333333] text-xs font-semibold px-2 py-1 text-white rounded"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => setViewingOrder(ord)}
                            className="px-2.5 py-1 text-[11px] uppercase tracking-wider bg-[#222] hover:bg-[#333] text-neutral-200 border border-[#333] rounded"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. CUSTOM TAILORING TAB */}
        {activeTab === 'custom' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#141414] border border-[#242424] p-6">
              <h3 className="font-heading text-base font-bold text-white uppercase tracking-wider mb-1">
                Bespoke Tailoring Requests ({customRequests.length})
              </h3>
              <p className="text-xs text-neutral-400">
                Track client measurements, wedding/event occasions, and manage the tailoring stages from NEW to COMPLETED.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customRequests.map((req) => (
                <div key={req.id} className="bg-[#141414] border border-[#242424] p-5 space-y-4">
                  <div className="flex justify-between items-start border-b border-[#222222] pb-3">
                    <div>
                      <span className="font-mono text-[10px] text-neutral-500 font-bold block">
                        #{req.request_number}
                      </span>
                      <h4 className="font-heading text-sm font-bold text-white mt-0.5">
                        {req.clothing_type}
                      </h4>
                      <div className="text-[11px] text-neutral-400">
                        Client: <strong className="text-white">{req.full_name}</strong> ({req.phone})
                      </div>
                    </div>
                    <select
                      value={req.status}
                      onChange={(e) =>
                        handleUpdateCustomStatus(req.id, e.target.value as CustomRequestStatus)
                      }
                      className="bg-[#202020] border border-[#333333] text-[10px] font-bold text-amber-400 px-2 py-1 rounded"
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="DESIGNING">DESIGNING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="IN PRODUCTION">IN PRODUCTION</option>
                      <option value="READY">READY</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase">Occasion & Deadline:</span>
                      <span className="text-neutral-300 font-medium">
                        {req.occasion || 'General Bespoke'} · Deadline: {req.preferred_deadline}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase">Preferred Color:</span>
                      <span className="text-neutral-300 font-medium">{req.preferred_color}</span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase">Measurements:</span>
                      <p className="text-neutral-300 bg-[#0F0F0F] p-2 border border-[#222222] rounded text-[11px] font-mono">
                        {req.measurements || 'Client will visit Kigali atelier for fitting'}
                      </p>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase">Design Brief:</span>
                      <p className="text-neutral-400 text-xs italic leading-relaxed">
                        &ldquo;{req.description}&rdquo;
                      </p>
                    </div>

                    {req.notes && (
                      <div className="pt-2 border-t border-[#1C1C1C]">
                        <span className="text-amber-400 font-semibold block text-[10px] uppercase">Tailor Note:</span>
                        <span className="text-neutral-300 text-xs">{req.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. INVENTORY & STOCK TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#141414] border border-[#242424] p-5 flex justify-between items-center">
              <div>
                <h3 className="font-heading text-base font-bold text-white uppercase tracking-wider">
                  Atelier Inventory & Stock Controls
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Adjust available inventory units across all garment designs.
                </p>
              </div>
              <span className="text-xs text-neutral-400">
                Low threshold: &lt; 10 units
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className="bg-[#141414] border border-[#242424] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-semibold text-white line-clamp-1">{p.name}</h4>
                      <span className="text-[10px] font-mono text-neutral-500">{p.sku}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 block mt-0.5">
                      {p.category} · {formatCurrency(p.price)}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#222222] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-neutral-500 block">Available</span>
                      <span
                        className={`text-sm font-bold ${
                          p.stock > 10 ? 'text-white' : 'text-red-400'
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#1C1C1C] border border-[#2A2A2A] p-1 rounded">
                      <button
                        onClick={() => handleAdjustStock(p, -1)}
                        className="px-2 py-0.5 text-xs text-neutral-400 hover:text-white hover:bg-[#252525]"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleAdjustStock(p, 1)}
                        className="px-2 py-0.5 text-xs text-neutral-400 hover:text-white hover:bg-[#252525]"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleAdjustStock(p, 5)}
                        className="px-2 py-0.5 text-[10px] text-neutral-400 hover:text-white hover:bg-[#252525]"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. FLUTTERWAVE PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div className="max-w-3xl space-y-6 animate-fade-in">
            <div className="bg-[#141414] border border-[#242424] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <CreditCard size={20} className="text-amber-400" />
                <div>
                  <h3 className="font-heading text-base font-bold text-white uppercase tracking-wider">
                    Flutterwave Gateway Integration (Rwanda RWF)
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Configured for Rwanda Mobile Money (MTN MoMo, Airtel Money) and Card transactions in RWF.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#181818] border border-[#262626] space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Flutterwave Public Key
                  </label>
                  <input
                    type="text"
                    value={flwConfig?.public_key || ''}
                    onChange={(e) =>
                      setFlwConfig({ ...flwConfig, public_key: e.target.value })
                    }
                    className="w-full bg-[#0D0D0D] border border-[#2B2B2B] text-xs px-3 py-2 text-white font-mono rounded"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Environment Mode
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-white">
                      <input
                        type="checkbox"
                        checked={flwConfig?.is_test_mode ?? true}
                        onChange={(e) =>
                          setFlwConfig({ ...flwConfig, is_test_mode: e.target.checked })
                        }
                        className="accent-white"
                      />
                      <span>Sandbox / Test Mode Active (Recommended for verification)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Merchant Name
                  </label>
                  <input
                    type="text"
                    value={flwConfig?.merchant_name || 'LENO’S Rwanda'}
                    onChange={(e) =>
                      setFlwConfig({ ...flwConfig, merchant_name: e.target.value })
                    }
                    className="w-full bg-[#0D0D0D] border border-[#2B2B2B] text-xs px-3 py-2 text-white rounded"
                  />
                </div>

                <button
                  onClick={async () => {
                    await updateFlutterwaveConfig(flwConfig);
                    alert('Flutterwave configurations saved successfully.');
                  }}
                  className="bg-white hover:bg-neutral-200 text-black px-6 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Save Gateway Settings
                </button>
              </div>

              {/* Transaction Logs */}
              <div className="pt-4 border-t border-[#222222]">
                <h4 className="text-xs uppercase tracking-wider text-neutral-300 font-semibold mb-3">
                  Recent Verified Flutterwave Transactions
                </h4>
                <div className="space-y-2">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="p-3 bg-[#181818] border border-[#262626] flex items-center justify-between text-xs font-mono"
                    >
                      <div>
                        <span className="text-white font-bold">#{o.order_number}</span> ·{' '}
                        <span className="text-neutral-400">{o.customer_name}</span>
                        <div className="text-[10px] text-neutral-500">Ref: {o.transaction_reference}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold">{formatCurrency(o.total)}</span>
                        <div className="text-[10px] text-neutral-400 uppercase">{o.payment_method}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <ProductEditModal
          product={editingProduct}
          onClose={() => setIsProductModalOpen(false)}
          onSave={async (saved) => {
            if (editingProduct) {
              await updateProduct(editingProduct.id, saved);
              setProducts((prev) =>
                prev.map((p) => (p.id === editingProduct.id ? { ...p, ...saved } : p))
              );
            } else {
              const created = await createProduct(saved);
              setProducts((prev) => [created, ...prev]);
            }
            setIsProductModalOpen(false);
          }}
        />
      )}

      {/* Order Detail Modal */}
      {viewingOrder && (
        <OrderDetailModal
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
          onUpdateStatus={handleUpdateOrderStatus}
          onTrackOrder={onTrackOrder}
        />
      )}
    </div>
  );
};

// Sub-component: Product Edit Modal
function ProductEditModal({
  product,
  onClose,
  onSave
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (data: Partial<Product>) => Promise<void>;
}) {
  const [name, setName] = useState(product?.name || '');
  const [tagline, setTagline] = useState(product?.tagline || '');
  const [category, setCategory] = useState<CategoryType>(product?.category || 'Men');
  const [subcategory, setSubcategory] = useState(product?.subcategory || 'Jackets');
  const [price, setPrice] = useState(product?.price || 85000);
  const [stock, setStock] = useState(product?.stock || 15);
  const [sku, setSku] = useState(product?.sku || `LEN-${category[0]}-${Date.now().toString().slice(-4)}`);
  const [description, setDescription] = useState(product?.description || '');
  const [materials, setMaterials] = useState(product?.materials || '');
  const [sizesInput, setSizesInput] = useState(product?.sizes.join(', ') || 'S, M, L, XL');
  const [imageUrl, setImageUrl] = useState(product?.image_url || '');
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? true);
  const [isNewArrival, setIsNewArrival] = useState(product?.is_new_arrival ?? true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const sizes = sizesInput.split(',').map((s) => s.trim()).filter(Boolean);
      await onSave({
        name,
        tagline,
        category: category === 'All' ? 'Men' : category,
        subcategory,
        price: Number(price),
        stock: Number(stock),
        sku,
        description,
        materials,
        sizes,
        image_url: imageUrl,
        is_featured: isFeatured,
        is_new_arrival: isNewArrival,
        colors: product?.colors || [
          { name: 'Obsidian Black', hex: '#0D0D0D' },
          { name: 'Pure Chalk', hex: '#F0F0F0' }
        ],
        gender: category === 'Men' ? 'men' : category === 'Women' ? 'women' : 'unisex'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-[#2B2B2B] w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-[#F5F5F5] animate-fade-in">
        <div className="flex justify-between items-center border-b border-[#222222] pb-4">
          <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wider">
            {product ? 'Edit Garment' : 'Create New Garment'}
          </h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                Garment Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Minimalist Peak Blazer"
                className="w-full bg-[#181818] border border-[#2E2E2E] px-3 py-2 text-white rounded focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                SKU *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-[#181818] border border-[#2E2E2E] px-3 py-2 text-white rounded font-mono"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full bg-[#181818] border border-[#2E2E2E] px-3 py-2 text-white rounded"
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
                <option value="Culture">Traditional / Culture</option>
              </select>
            </div>

            <div>
              <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                Subcategory *
              </label>
              <input
                type="text"
                required
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Shirts, Jackets, Umushanana"
                className="w-full bg-[#181818] border border-[#2E2E2E] px-3 py-2 text-white rounded"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                Price in RWF *
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="e.g. 85000"
                className="w-full bg-[#181818] border border-[#2E2E2E] px-3 py-2 text-white rounded font-mono"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                Stock in Atelier *
              </label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full bg-[#181818] border border-[#2E2E2E] px-3 py-2 text-white rounded font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                Sizes (Comma separated)
              </label>
              <input
                type="text"
                value={sizesInput}
                onChange={(e) => setSizesInput(e.target.value)}
                placeholder="e.g. S, M, L, XL, XXL"
                className="w-full bg-[#181818] border border-[#2E2E2E] px-3 py-2 text-white rounded"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                Image Link or Upload (Leave empty to keep minimalist placeholder ready for user)
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... or upload below"
                className="w-full bg-[#181818] border border-[#2E2E2E] px-3 py-2 text-white rounded"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                Garment Description & Fit
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#181818] border border-[#2E2E2E] px-3 py-2 text-white rounded"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                Textile & Composition
              </label>
              <input
                type="text"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                placeholder="e.g. 100% Egyptian Cotton, Raw Silk"
                className="w-full bg-[#181818] border border-[#2E2E2E] px-3 py-2 text-white rounded"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-3 border-t border-[#222222]">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-white hover:bg-neutral-200 text-black py-2.5 font-bold uppercase tracking-wider rounded"
            >
              {saving ? 'Saving...' : 'Save Garment'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-[#333333] text-neutral-300 hover:text-white rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Sub-component: Order Detail Modal
function OrderDetailModal({
  order,
  onClose,
  onUpdateStatus,
  onTrackOrder
}: {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (id: string, st: OrderStatus) => void;
  onTrackOrder: (num: string) => void;
}) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-[#2B2B2B] w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-[#F5F5F5] animate-fade-in">
        <div className="flex justify-between items-start border-b border-[#222222] pb-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-neutral-400">Order Management</span>
            <h3 className="font-heading text-xl font-bold text-white">
              #{order.order_number}
            </h3>
            <span className="text-xs text-neutral-400 font-mono">
              Placed {new Date(order.created_at).toLocaleString()}
            </span>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Status quick control */}
        <div className="bg-[#181818] p-4 border border-[#262626] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase">Advance Order Status</span>
            <span className="text-white font-semibold">Instant Real-Time Sync</span>
          </div>
          <select
            value={order.status}
            onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
            className="bg-black border border-[#333333] text-xs font-bold px-3 py-1.5 text-white rounded"
          >
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* Customer & Rwanda Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#161616] p-4 border border-[#242424] space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
              Customer Details
            </span>
            <div className="text-white font-medium">{order.customer_name}</div>
            <div className="text-neutral-400">{order.customer_email}</div>
            <div className="text-neutral-300 font-mono">{order.customer_phone}</div>
          </div>

          <div className="bg-[#161616] p-4 border border-[#242424] space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
              Rwanda Delivery Location
            </span>
            <div className="text-white">
              {order.delivery_sector}, {order.delivery_district}
            </div>
            <div className="text-neutral-400">{order.delivery_province}</div>
            <div className="text-neutral-300">{order.delivery_street}</div>
            {order.delivery_notes && (
              <div className="text-neutral-500 italic mt-1">&ldquo;{order.delivery_notes}&rdquo;</div>
            )}
          </div>
        </div>

        {/* Items List */}
        <div>
          <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block mb-2">
            Items in Order ({order.items.length})
          </span>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-[#161616] border border-[#242424] text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{item.product_name}</div>
                  <div className="text-[10px] text-neutral-400">
                    Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                  </div>
                </div>
                <div className="text-right font-semibold text-white">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info & tracking link */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-[#222222] gap-3">
          <div className="text-xs">
            <span className="text-neutral-400">Order Total: </span>
            <span className="font-bold text-base text-white ml-1">{formatCurrency(order.total)}</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onTrackOrder(order.order_number);
            }}
            className="bg-white hover:bg-neutral-200 text-black px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-colors"
          >
            Open in Live Tracking
          </button>
        </div>
      </div>
    </div>
  );
}
