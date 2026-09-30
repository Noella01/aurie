import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, Clock, PackageCheck, AlertCircle, RefreshCw, MapPin, Phone, ShieldCheck, ArrowRight } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { getOrders, trackOrderByNumber, subscribeToStoreEvents } from '../services/api';

interface OrderTrackingViewProps {
  initialOrderNumber?: string;
  onNavigateShop: () => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialOrderNumber = '',
  onNavigateShop
}) => {
  const [orderQuery, setOrderQuery] = useState(initialOrderNumber || 'LEN-2026-0001');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lastLiveUpdate, setLastLiveUpdate] = useState<string | null>(null);

  const fetchOrder = async (queryNum: string) => {
    if (!queryNum.trim()) return;
    setLoading(true);
    setError('');

    try {
      const order = await trackOrderByNumber(queryNum);
      if (order) {
        setCurrentOrder(order);
      } else {
        setError(`No order found matching "${queryNum}". Please check the number.`);
        setCurrentOrder(null);
      }
    } catch {
      setError('Error retrieving order. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    getOrders().then((all) => {
      setRecentOrders(all.slice(0, 4));
      if (orderQuery) {
        fetchOrder(orderQuery);
      } else if (all.length > 0) {
        setOrderQuery(all[0].order_number);
        fetchOrder(all[0].order_number);
      }
    });

    // Real-Time SSE / Event Subscription!
    const unsubscribe = subscribeToStoreEvents('order_updated', (updatedOrder: Order) => {
      if (currentOrder && updatedOrder.id === currentOrder.id) {
        setCurrentOrder(updatedOrder);
        setLastLiveUpdate(new Date().toLocaleTimeString());
      }
      // Also update recent orders list
      setRecentOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
    });

    return () => {
      unsubscribe();
    };
  }, [currentOrder?.id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderQuery);
  };

  const steps: { status: OrderStatus; label: string; desc: string }[] = [
    { status: 'PENDING', label: 'Order Placed', desc: 'Order received into atelier system' },
    { status: 'CONFIRMED', label: 'Payment Verified', desc: 'Flutterwave gateway verified' },
    { status: 'PROCESSING', label: 'Atelier Packaging', desc: 'Garment steaming & quality check' },
    { status: 'SHIPPED', label: 'Out for Delivery', desc: 'Kigali express courier in transit' },
    { status: 'DELIVERED', label: 'Delivered', desc: 'Safely handed over to recipient' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    const map: Record<OrderStatus, number> = {
      PENDING: 0,
      CONFIRMED: 1,
      PROCESSING: 2,
      SHIPPED: 3,
      DELIVERED: 4,
      CANCELLED: -1,
    };
    return map[status] ?? 0;
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--tone-ffffff)] uppercase tracking-wide">
          LIVE ORDER DISPATCH
        </h1>
        <p className="text-xs text-[var(--tone-a3a3a3)] max-w-md mx-auto font-light">
          Track your bespoke garments in real time from our Kigali atelier to your door anywhere in Rwanda.
        </p>
      </div>

      {/* Lookup Bar */}
      <div className="bg-[var(--tone-141414)] border border-[var(--tone-262626)] p-6 shadow-xl">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Truck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--tone-a3a3a3)]" />
            <input
              type="text"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="Enter your order number (e.g. LEN-2026-0001)"
              className="w-full bg-[var(--tone-1a1a1a)] border border-[var(--tone-2e2e2e)] pl-10 pr-4 py-3 text-xs text-[var(--tone-ffffff)] rounded font-mono uppercase focus:outline-none focus:border-[var(--tone-ffffff)] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[var(--tone-ffffff)] hover:bg-[var(--tone-e5e5e5)] text-[var(--tone-000000)] px-8 py-3 text-xs uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Locating...</span>
              </>
            ) : (
              <span>Track Order</span>
            )}
          </button>
        </form>

        {/* Quick Recent Orders */}
        {recentOrders.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[var(--tone-222222)] flex items-center gap-2 flex-wrap text-[11px]">
            <span className="text-[var(--tone-737373)] uppercase tracking-wider text-[10px]">Recent Orders:</span>
            {recentOrders.map((ord) => (
              <button
                key={ord.id}
                onClick={() => {
                  setOrderQuery(ord.order_number);
                  fetchOrder(ord.order_number);
                }}
                className={`px-2.5 py-1 font-mono text-[10px] rounded transition-colors ${
                  currentOrder?.id === ord.id
                    ? 'bg-[var(--tone-ffffff)] text-[var(--tone-000000)] font-bold'
                    : 'bg-[var(--tone-1c1c1c)] text-[var(--tone-d4d4d4)] hover:text-[var(--tone-ffffff)] border border-[var(--tone-2a2a2a)]'
                }`}
              >
                #{ord.order_number}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-950/30 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {currentOrder && (
        <div className="space-y-8 animate-fade-in">
          {/* Live Sync Banner */}
          <div className="bg-[var(--tone-121212)] border border-[var(--tone-2a2a2a)] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <span className="text-[var(--tone-ffffff)] font-semibold">Live Real-Time Socket Active</span>
                <span className="text-[var(--tone-a3a3a3)] block text-[11px]">
                  Updates automatically when Kigali dispatch team updates status
                </span>
              </div>
            </div>

            {lastLiveUpdate && (
              <div className="text-[11px] text-emerald-400 bg-emerald-950/40 px-2.5 py-1 border border-emerald-800/40 rounded">
                Live Status Updated at {lastLiveUpdate}
              </div>
            )}
          </div>

          {/* Stepper Progress Bar */}
          <div className="bg-[var(--tone-141414)] border border-[var(--tone-262626)] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--tone-222222)] gap-2">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[var(--tone-a3a3a3)]">Order Reference</span>
                <h2 className="font-heading text-xl font-bold text-[var(--tone-ffffff)] tracking-wide">
                  #{currentOrder.order_number}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-wider text-[var(--tone-a3a3a3)]">Status:</span>
                <span
                  className={`px-3 py-1 font-bold text-xs uppercase tracking-wider ${
                    currentOrder.status === 'DELIVERED'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                      : currentOrder.status === 'SHIPPED'
                      ? 'bg-blue-950/60 text-blue-400 border border-blue-500/40'
                      : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {currentOrder.status}
                </span>
              </div>
            </div>

            {/* Stepper Visual */}
            <div className="py-8">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                {steps.map((st, idx) => {
                  const currentIdx = getStepIndex(currentOrder.status);
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={st.status} className="flex md:flex-col items-center md:items-center gap-4 md:gap-2 text-left md:text-center relative">
                      {/* Circle indicator */}
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all z-10 ${
                          isDone
                            ? 'bg-[var(--tone-ffffff)] text-[var(--tone-000000)] border-[var(--tone-ffffff)]'
                            : 'bg-[var(--tone-181818)] text-[var(--tone-525252)] border-[var(--tone-333333)]'
                        } ${isCurrent ? 'ring-4 ring-emerald-500/30 border-emerald-400' : ''}`}
                      >
                        {isDone ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>

                      <div className="flex-1 md:flex-initial">
                        <div
                          className={`text-xs font-bold uppercase tracking-wider ${
                            isCurrent
                              ? 'text-emerald-400'
                              : isDone
                              ? 'text-[var(--tone-ffffff)]'
                              : 'text-[var(--tone-737373)]'
                          }`}
                        >
                          {st.label}
                        </div>
                        <div className="text-[10px] text-[var(--tone-a3a3a3)] mt-0.5 line-clamp-2 font-light">
                          {st.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Estimated Delivery Note */}
            <div className="bg-[var(--tone-181818)] border border-[var(--tone-262626)] p-4 text-xs text-[var(--tone-d4d4d4)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-amber-400" />
                <span>
                  {currentOrder.status === 'DELIVERED'
                    ? 'Delivered to recipient in Rwanda.'
                    : currentOrder.status === 'SHIPPED'
                    ? 'Kigali Dispatch in progress · Expected delivery within 2 hours.'
                    : 'Crafting in Atelier · Scheduled courier dispatch today.'}
                </span>
              </div>
              <span className="text-[10px] text-[var(--tone-737373)] uppercase tracking-widest font-mono">
                Order Total: {formatCurrency(currentOrder.total)}
              </span>
            </div>
          </div>

          {/* Details Grid: Destination & Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Destination */}
            <div className="bg-[var(--tone-141414)] border border-[var(--tone-262626)] p-6 space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-[var(--tone-a3a3a3)] font-semibold flex items-center gap-1.5">
                <MapPin size={14} />
                <span>Rwanda Delivery Destination</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[var(--tone-737373)] block text-[10px] uppercase">Recipient:</span>
                  <span className="text-[var(--tone-ffffff)] font-medium">{currentOrder.customer_name}</span>
                </div>
                <div>
                  <span className="text-[var(--tone-737373)] block text-[10px] uppercase">Phone:</span>
                  <span className="text-[var(--tone-ffffff)] font-mono">{currentOrder.customer_phone}</span>
                </div>
                <div>
                  <span className="text-[var(--tone-737373)] block text-[10px] uppercase">Address:</span>
                  <span className="text-[var(--tone-e5e5e5)]">
                    {currentOrder.delivery_street}, {currentOrder.delivery_sector}, {currentOrder.delivery_district}, {currentOrder.delivery_province}
                  </span>
                </div>
                {currentOrder.delivery_notes && (
                  <div>
                    <span className="text-[var(--tone-737373)] block text-[10px] uppercase">Instructions:</span>
                    <span className="text-[var(--tone-a3a3a3)] italic">{currentOrder.delivery_notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment & Order Summary */}
            <div className="bg-[var(--tone-141414)] border border-[var(--tone-262626)] p-6 space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-[var(--tone-a3a3a3)] font-semibold flex items-center gap-1.5">
                <ShieldCheck size={14} />
                <span>Payment & Verification</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--tone-a3a3a3)]">Payment Gateway:</span>
                  <span className="text-[var(--tone-ffffff)] font-medium">Flutterwave RWF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--tone-a3a3a3)]">Payment Status:</span>
                  <span className="text-emerald-400 font-bold uppercase">{currentOrder.payment_status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--tone-a3a3a3)]">Transaction Ref:</span>
                  <span className="text-[var(--tone-d4d4d4)] font-mono text-[11px]">{currentOrder.transaction_reference}</span>
                </div>
                <div className="flex justify-between border-t border-[var(--tone-222222)] pt-2">
                  <span className="text-[var(--tone-a3a3a3)]">Subtotal:</span>
                  <span className="text-[var(--tone-ffffff)]">{formatCurrency(currentOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--tone-a3a3a3)]">Delivery Fee:</span>
                  <span className="text-[var(--tone-ffffff)]">
                    {currentOrder.delivery_fee === 0 ? 'Complimentary' : formatCurrency(currentOrder.delivery_fee)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[var(--tone-222222)] pt-2 font-bold text-sm">
                  <span className="text-[var(--tone-ffffff)]">Total:</span>
                  <span className="text-[var(--tone-ffffff)]">{formatCurrency(currentOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Timeline Logs */}
          <div className="bg-[var(--tone-141414)] border border-[var(--tone-262626)] p-6 space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-[var(--tone-a3a3a3)] font-semibold flex items-center gap-1.5">
              <PackageCheck size={14} />
              <span>Full Atelier Milestone Log</span>
            </h3>

            <div className="space-y-4 border-l border-[var(--tone-2e2e2e)] ml-2 pl-4">
              {currentOrder.timeline.map((evt, idx) => (
                <div key={idx} className="relative space-y-1">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--tone-ffffff)] border-2 border-[var(--tone-000000)]" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--tone-ffffff)] uppercase tracking-wider">{evt.title}</span>
                    <span className="text-[10px] text-[var(--tone-737373)] font-mono">
                      {new Date(evt.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--tone-a3a3a3)] font-light">{evt.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
