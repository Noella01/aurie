import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, Shield, CreditCard, Smartphone, ArrowRight, Loader2, Truck } from 'lucide-react';
import { CartItem, Order, PaymentMethod } from '../types';
import { createOrder } from '../services/api';
import { accountRequest, type Customer } from '../services/account';

interface CheckoutModalProps {
  customer?: Customer | null;
  onLogin?: () => void;
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderSuccess: (order: Order) => void;
  onViewOrders: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  customer,
  onLogin,
  isOpen,
  onClose,
  cartItems,
  onOrderSuccess,
  onViewOrders
}) => {
  const [step, setStep] = useState<'details' | 'payment_prompt' | 'success'>('details');
  const [fullName, setFullName] = useState(customer?.name || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [phone, setPhone] = useState('+250 78');
  const [province, setProvince] = useState('Kigali City');
  const [district, setDistrict] = useState('Gasabo');
  const [sector, setSector] = useState('Kimihurura');
  const [street, setStreet] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('flutterwave_momo');
  const [momoNumber, setMomoNumber] = useState('');

  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const checkoutKey = useRef(crypto.randomUUID());
  useEffect(() => {
    if (!isOpen && !isProcessing) {
      setStep('details'); setCompletedOrder(null);
      checkoutKey.current = crypto.randomUUID();
    }
  }, [isOpen, isProcessing]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal > 120000 ? 0 : 2500;
  const total = subtotal + deliveryFee;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      maximumFractionDigits: 0
    }).format(val);

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !street) {
      alert('Please fill in your delivery contact and location in Rwanda.');
      return;
    }
    if (customer) { void handleSimulatePayment(); return; }
    setStep('payment_prompt');
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);

    try {
      const orderPayload: Partial<Order> = {
        customer_name: fullName,
        customer_email: email,
        customer_phone: phone,
        delivery_province: province,
        delivery_district: district,
        delivery_sector: sector,
        delivery_street: street,
        delivery_notes: deliveryNotes,
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          product_image: item.product.image_url || '',
          size: item.selectedSize,
          color: item.selectedColor.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        subtotal,
        delivery_fee: deliveryFee,
        total,
        currency: 'RWF',
        status: 'CONFIRMED',
        payment_status: 'SUCCESSFUL',
        payment_method: paymentMethod,
        transaction_reference: `FLW-TX-RW-${Date.now().toString().slice(-6)}`,
        flutterwave_tx_id: String(Math.floor(1000000 + Math.random() * 9000000)),
      };

      // Call API to create order
      const newOrder = customer
        ? await accountRequest<Order>('orders', { ...orderPayload, checkout_key: checkoutKey.current })
        : await createOrder(orderPayload);
      setCompletedOrder(newOrder);
      onOrderSuccess(newOrder);
      setStep('success');
    } catch (err) {
      console.error(err);
      alert((err as Error).message || 'Could not complete order. Please retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[var(--tone-121212)] border border-[var(--tone-2a2a2a)] w-full max-w-2xl max-h-[calc(100dvh-2rem)] rounded-none shadow-2xl overflow-y-auto relative animate-fade-in text-[var(--tone-f5f5f5)]">
        {/* Header */}
        <div className="p-6 border-b border-[var(--tone-222222)] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--tone-888888)] font-semibold">
              AURIE CHECKOUT
            </span>
            <h2 className="font-heading text-lg font-bold text-[var(--tone-ffffff)] tracking-wide">
              {step === 'details' && 'Shipping & Payment Information'}
              {step === 'payment_prompt' && 'Authorize Flutterwave Payment'}
              {step === 'success' && (customer ? 'Order saved · awaiting payment' : 'Order Successfully Confirmed')}
            </h2>
          </div>
          {step !== 'success' && (
            <button
              onClick={onClose}
              aria-label="Close checkout"
              className="text-[var(--tone-a3a3a3)] hover:text-[var(--tone-ffffff)] p-1 rounded hover:bg-[var(--tone-1e1e1e)]"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Step 1: Customer & Delivery Details */}
        {step === 'details' && (
          <form onSubmit={handleSubmitDetails} className="p-6 space-y-5">
            {!customer && <p className="text-sm"><button type="button" className="underline" onClick={onLogin}>Log in or create an account</button> to save your cart and see orders in My account. You can also continue as a guest.</p>}
            <p className="text-sm">{customer ? 'Your order will be saved as awaiting payment. No payment will be collected yet.' : 'Demo checkout: payments are simulated. Do not enter real card details.'}</p>
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[var(--tone-a3a3a3)] mb-3 font-semibold flex items-center gap-1.5">
                <Truck size={14} />
                <span>Customer & Delivery Details (Rwanda)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--tone-a3a3a3)] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jean-Paul Mugisha"
                    className="w-full bg-[var(--tone-181818)] border border-[var(--tone-2b2b2b)] text-xs px-3 py-2.5 rounded text-[var(--tone-ffffff)] focus:outline-none focus:border-[var(--tone-ffffff)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--tone-a3a3a3)] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. mugisha@domain.rw"
                    className="w-full bg-[var(--tone-181818)] border border-[var(--tone-2b2b2b)] text-xs px-3 py-2.5 rounded text-[var(--tone-ffffff)] focus:outline-none focus:border-[var(--tone-ffffff)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--tone-a3a3a3)] mb-1">
                    Rwanda Phone Number (for delivery & MoMo) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+250 788 123 456"
                    className="w-full bg-[var(--tone-181818)] border border-[var(--tone-2b2b2b)] text-xs px-3 py-2.5 rounded text-[var(--tone-ffffff)] focus:outline-none focus:border-[var(--tone-ffffff)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--tone-a3a3a3)] mb-1">
                    Province *
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full bg-[var(--tone-181818)] border border-[var(--tone-2b2b2b)] text-xs px-3 py-2.5 rounded text-[var(--tone-ffffff)] focus:outline-none focus:border-[var(--tone-ffffff)]"
                  >
                    <option value="Kigali City">Kigali City</option>
                    <option value="Northern Province">Northern Province (Amajyaruguru)</option>
                    <option value="Southern Province">Southern Province (Amajyepfo)</option>
                    <option value="Eastern Province">Eastern Province (Iburasirazuba)</option>
                    <option value="Western Province">Western Province (Iburengerazuba)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--tone-a3a3a3)] mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Gasabo, Kicukiro, Nyarugenge"
                    className="w-full bg-[var(--tone-181818)] border border-[var(--tone-2b2b2b)] text-xs px-3 py-2.5 rounded text-[var(--tone-ffffff)] focus:outline-none focus:border-[var(--tone-ffffff)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--tone-a3a3a3)] mb-1">
                    Sector & Cell *
                  </label>
                  <input
                    type="text"
                    required
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    placeholder="e.g. Kimihurura, Rugando"
                    className="w-full bg-[var(--tone-181818)] border border-[var(--tone-2b2b2b)] text-xs px-3 py-2.5 rounded text-[var(--tone-ffffff)] focus:outline-none focus:border-[var(--tone-ffffff)]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--tone-a3a3a3)] mb-1">
                    Street Address / House # / Landmark *
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. KG 674 St, Villa 12, Near Convention Center"
                    className="w-full bg-[var(--tone-181818)] border border-[var(--tone-2b2b2b)] text-xs px-3 py-2.5 rounded text-[var(--tone-ffffff)] focus:outline-none focus:border-[var(--tone-ffffff)]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--tone-a3a3a3)] mb-1">
                    Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Gate code, call security upon arrival"
                    className="w-full bg-[var(--tone-181818)] border border-[var(--tone-2b2b2b)] text-xs px-3 py-2.5 rounded text-[var(--tone-ffffff)] focus:outline-none focus:border-[var(--tone-ffffff)]"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-3 border-t border-[var(--tone-222222)]">
              <h3 className="text-xs uppercase tracking-widest text-[var(--tone-a3a3a3)] mb-3 font-semibold flex items-center gap-1.5">
                <Shield size={14} />
                <span>Select Payment Method (Flutterwave Gateway)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  onClick={() => setPaymentMethod('flutterwave_momo')}
                  className={`p-3.5 border cursor-pointer flex items-center justify-between transition-colors ${
                    paymentMethod === 'flutterwave_momo'
                      ? 'border-[var(--tone-ffffff)] bg-[var(--tone-1f1f1f)]'
                      : 'border-[var(--tone-262626)] bg-[var(--tone-161616)] hover:border-[var(--tone-737373)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone size={18} className="text-[var(--tone-f5f5f5)]" />
                    <div>
                      <div className="text-xs font-semibold text-[var(--tone-ffffff)]">Rwanda Mobile Money</div>
                      <div className="text-[10px] text-[var(--tone-a3a3a3)]">MTN MoMo & Airtel Money (RWF)</div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === 'flutterwave_momo'}
                    onChange={() => setPaymentMethod('flutterwave_momo')}
                    className="accent-white"
                  />
                </label>

                <label
                  onClick={() => setPaymentMethod('flutterwave_card')}
                  className={`p-3.5 border cursor-pointer flex items-center justify-between transition-colors ${
                    paymentMethod === 'flutterwave_card'
                      ? 'border-[var(--tone-ffffff)] bg-[var(--tone-1f1f1f)]'
                      : 'border-[var(--tone-262626)] bg-[var(--tone-161616)] hover:border-[var(--tone-737373)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard size={18} className="text-[var(--tone-e5e5e5)]" />
                    <div>
                      <div className="text-xs font-semibold text-[var(--tone-ffffff)]">Credit / Debit Card</div>
                      <div className="text-[10px] text-[var(--tone-a3a3a3)]">Visa, Mastercard (Flutterwave)</div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === 'flutterwave_card'}
                    onChange={() => setPaymentMethod('flutterwave_card')}
                    className="accent-white"
                  />
                </label>
              </div>
            </div>

            {/* Price review */}
            <div className="p-4 bg-[var(--tone-0a0a0a)] border border-[var(--tone-222222)] flex justify-between items-center text-xs">
              <div>
                <span className="text-[var(--tone-a3a3a3)]">Order Total ({cartItems.length} items): </span>
                <span className="font-heading font-bold text-base text-[var(--tone-ffffff)] ml-2">{formatCurrency(total)}</span>
              </div>
              <span className="text-[11px] text-[var(--tone-a3a3a3)]">{customer ? 'Payment pending' : 'Demo checkout'}</span>
            </div>

            <button
              type="submit"
              disabled={isProcessing || cartItems.length === 0}
              className="w-full bg-[var(--tone-ffffff)] hover:bg-[var(--tone-e5e5e5)] text-[var(--tone-000000)] py-3 px-4 font-semibold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors"
            >
              <span>{isProcessing ? 'Saving…' : customer ? 'Save order · pay later' : 'Continue to demo payment'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}

        {/* Step 2: Realistic Flutterwave Payment Prompt */}
        {step === 'payment_prompt' && (
          <div className="p-6 space-y-6">
            <div className="text-center py-4 bg-[var(--tone-0d0d0d)] border border-[var(--tone-262626)]">
              <div className="w-12 h-12 mx-auto rounded-full bg-[var(--tone-262626)] flex items-center justify-center text-[var(--tone-ffffff)] mb-2">
                {paymentMethod === 'flutterwave_momo' ? <Smartphone size={22} /> : <CreditCard size={22} />}
              </div>
              <h4 className="font-heading text-sm font-bold text-[var(--tone-ffffff)] uppercase tracking-wider">
                Flutterwave Secure Checkout
              </h4>
              <p className="text-xs text-[var(--tone-a3a3a3)] mt-1">
                Merchant: <span className="text-[var(--tone-ffffff)] font-medium">AURIE Rwanda</span>
              </p>
              <div className="font-heading text-2xl font-bold text-[var(--tone-ffffff)] mt-2">
                {formatCurrency(total)}
              </div>
            </div>

            {paymentMethod === 'flutterwave_momo' ? (
              <div className="space-y-4 bg-[var(--tone-161616)] p-4 border border-[var(--tone-282828)]">
                <div className="flex items-center gap-2 text-xs text-[var(--tone-f5f5f5)]">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span className="font-semibold">Rwanda Mobile Money (MTN / Airtel) Prompt</span>
                </div>
                <p className="text-xs text-[var(--tone-d4d4d4)]">
                  A USSD prompt will be sent to your phone to confirm debiting <strong>{formatCurrency(total)}</strong>.
                </p>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--tone-a3a3a3)] mb-1">
                    MoMo Number (MTN / Airtel Rwanda)
                  </label>
                  <input
                    type="tel"
                    value={momoNumber || phone}
                    onChange={(e) => setMomoNumber(e.target.value)}
                    placeholder="+250 788 000 000"
                    className="w-full bg-[var(--tone-0d0d0d)] border border-[var(--tone-333333)] text-sm px-3 py-2 text-[var(--tone-ffffff)] rounded font-mono"
                  />
                </div>

                <div className="text-[11px] text-[var(--tone-a3a3a3)] bg-[var(--tone-0a0a0a)] p-3 border border-[var(--tone-222222)]">
                  <strong>How it works:</strong> You will receive a prompt on your phone screen: <em>"Pay {formatCurrency(total)} to AURIE?"</em>. Enter your PIN to complete the transaction.
                </div>
              </div>
            ) : (
              <div className="space-y-4 bg-[var(--tone-161616)] p-4 border border-[var(--tone-282828)]">
                <div className="text-xs text-[var(--tone-d4d4d4)] font-semibold mb-2">Card Details Simulation</div>
                <div className="space-y-2">
                  <input
                    type="text"
                    disabled
                    value="•••• •••• •••• 4242 (Flutterwave Test Card)"
                    className="w-full bg-[var(--tone-0d0d0d)] border border-[var(--tone-333333)] text-xs px-3 py-2 text-[var(--tone-d4d4d4)] rounded font-mono"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      disabled
                      value="12/28"
                      className="w-1/2 bg-[var(--tone-0d0d0d)] border border-[var(--tone-333333)] text-xs px-3 py-2 text-[var(--tone-d4d4d4)] rounded font-mono"
                    />
                    <input
                      type="text"
                      disabled
                      value="CVC: •••"
                      className="w-1/2 bg-[var(--tone-0d0d0d)] border border-[var(--tone-333333)] text-xs px-3 py-2 text-[var(--tone-d4d4d4)] rounded font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('details')}
                disabled={isProcessing}
                className="w-1/3 py-3 px-4 border border-[var(--tone-333333)] text-xs uppercase tracking-wider text-[var(--tone-d4d4d4)] hover:text-[var(--tone-ffffff)] hover:bg-[var(--tone-1a1a1a)] transition-colors"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-[0.15em] py-3 px-4 flex items-center justify-center gap-2 transition-colors"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying Flutterwave Transaction...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Authorize & Pay {formatCurrency(total)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Order Confirmation as requested in PDF section 23 */}
        {step === 'success' && completedOrder && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs">
                {customer ? 'ORDER SAVED · AWAITING PAYMENT' : 'DEMO ORDER CONFIRMED'}
              </span>
              <h3 className="font-heading text-2xl font-bold text-[var(--tone-ffffff)] mt-1">
                Thank you for shopping with AURIE.
              </h3>
              <p className="text-xs text-[var(--tone-a3a3a3)] mt-2 max-w-md mx-auto">
                {customer ? 'Your order is in My account. No payment has been collected and dispatch has not been confirmed.' : 'This is a simulated order. No real payment has been collected.'}
              </p>
            </div>

            <div className="bg-[var(--tone-171717)] border border-[var(--tone-292929)] p-5 max-w-md mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--tone-a3a3a3)]">Order Number:</span>
                <span className="font-mono font-bold text-[var(--tone-ffffff)]">#{completedOrder.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--tone-a3a3a3)]">{customer ? 'Amount due:' : 'Simulated total:'}</span>
                <span className="font-bold text-emerald-400">{formatCurrency(completedOrder.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--tone-a3a3a3)]">Payment Gateway:</span>
                <span className="text-[var(--tone-ffffff)]">Flutterwave ({completedOrder.payment_method})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--tone-a3a3a3)]">Destination:</span>
                <span className="text-[var(--tone-ffffff)] line-clamp-1">{completedOrder.delivery_district}, {completedOrder.delivery_province}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-2">
              {customer && <button
                onClick={() => {
                  onClose();
                  onViewOrders();
                }}
                className="bg-[var(--tone-ffffff)] hover:bg-[var(--tone-e5e5e5)] text-[var(--tone-000000)] py-3 px-6 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <span>View my orders</span>
                <ArrowRight size={14} />
              </button>}

              <button
                onClick={onClose}
                className="border border-[var(--tone-333333)] hover:border-[var(--tone-737373)] text-[var(--tone-d4d4d4)] hover:text-[var(--tone-ffffff)] py-3 px-6 text-xs uppercase tracking-widest font-medium transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
