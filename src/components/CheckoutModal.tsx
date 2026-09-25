import React, { useState } from 'react';
import { X, CheckCircle2, Shield, CreditCard, Smartphone, ArrowRight, Loader2, Truck } from 'lucide-react';
import { CartItem, Order, PaymentMethod } from '../types';
import { createOrder } from '../services/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderSuccess: (order: Order) => void;
  onTrackOrder: (orderNumber: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderSuccess,
  onTrackOrder
}) => {
  const [step, setStep] = useState<'details' | 'payment_prompt' | 'success'>('details');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
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
      const newOrder = await createOrder(orderPayload);
      setCompletedOrder(newOrder);
      onOrderSuccess(newOrder);
      setStep('success');
    } catch (err) {
      console.error(err);
      alert('Could not complete order. Please retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-[#2A2A2A] w-full max-w-2xl rounded-none shadow-2xl overflow-hidden relative animate-fade-in text-[#F5F5F5]">
        {/* Header */}
        <div className="p-6 border-b border-[#222222] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#888888] font-semibold">
              LENO’S CHECKOUT
            </span>
            <h2 className="font-heading text-lg font-bold text-white tracking-wide">
              {step === 'details' && 'Shipping & Payment Information'}
              {step === 'payment_prompt' && 'Authorize Flutterwave Payment'}
              {step === 'success' && 'Order Successfully Confirmed'}
            </h2>
          </div>
          {step !== 'success' && (
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 rounded hover:bg-[#1E1E1E]"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Step 1: Customer & Delivery Details */}
        {step === 'details' && (
          <form onSubmit={handleSubmitDetails} className="p-6 space-y-5">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-neutral-400 mb-3 font-semibold flex items-center gap-1.5">
                <Truck size={14} />
                <span>Customer & Delivery Details (Rwanda)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jean-Paul Mugisha"
                    className="w-full bg-[#181818] border border-[#2B2B2B] text-xs px-3 py-2.5 rounded text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. mugisha@domain.rw"
                    className="w-full bg-[#181818] border border-[#2B2B2B] text-xs px-3 py-2.5 rounded text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Rwanda Phone Number (for delivery & MoMo) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+250 788 123 456"
                    className="w-full bg-[#181818] border border-[#2B2B2B] text-xs px-3 py-2.5 rounded text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Province *
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] text-xs px-3 py-2.5 rounded text-white focus:outline-none focus:border-white"
                  >
                    <option value="Kigali City">Kigali City</option>
                    <option value="Northern Province">Northern Province (Amajyaruguru)</option>
                    <option value="Southern Province">Southern Province (Amajyepfo)</option>
                    <option value="Eastern Province">Eastern Province (Iburasirazuba)</option>
                    <option value="Western Province">Western Province (Iburengerazuba)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Gasabo, Kicukiro, Nyarugenge"
                    className="w-full bg-[#181818] border border-[#2B2B2B] text-xs px-3 py-2.5 rounded text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Sector & Cell *
                  </label>
                  <input
                    type="text"
                    required
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    placeholder="e.g. Kimihurura, Rugando"
                    className="w-full bg-[#181818] border border-[#2B2B2B] text-xs px-3 py-2.5 rounded text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Street Address / House # / Landmark *
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. KG 674 St, Villa 12, Near Convention Center"
                    className="w-full bg-[#181818] border border-[#2B2B2B] text-xs px-3 py-2.5 rounded text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Gate code, call security upon arrival"
                    className="w-full bg-[#181818] border border-[#2B2B2B] text-xs px-3 py-2.5 rounded text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-3 border-t border-[#222222]">
              <h3 className="text-xs uppercase tracking-widest text-neutral-400 mb-3 font-semibold flex items-center gap-1.5">
                <Shield size={14} />
                <span>Select Payment Method (Flutterwave Gateway)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  onClick={() => setPaymentMethod('flutterwave_momo')}
                  className={`p-3.5 border cursor-pointer flex items-center justify-between transition-colors ${
                    paymentMethod === 'flutterwave_momo'
                      ? 'border-white bg-[#1F1F1F]'
                      : 'border-[#262626] bg-[#161616] hover:border-neutral-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone size={18} className="text-amber-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">Rwanda Mobile Money</div>
                      <div className="text-[10px] text-neutral-400">MTN MoMo & Airtel Money (RWF)</div>
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
                      ? 'border-white bg-[#1F1F1F]'
                      : 'border-[#262626] bg-[#161616] hover:border-neutral-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard size={18} className="text-neutral-200" />
                    <div>
                      <div className="text-xs font-semibold text-white">Credit / Debit Card</div>
                      <div className="text-[10px] text-neutral-400">Visa, Mastercard (Flutterwave)</div>
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
            <div className="p-4 bg-[#0A0A0A] border border-[#222222] flex justify-between items-center text-xs">
              <div>
                <span className="text-neutral-400">Order Total ({cartItems.length} items): </span>
                <span className="font-heading font-bold text-base text-white ml-2">{formatCurrency(total)}</span>
              </div>
              <span className="text-[11px] text-emerald-400">✓ Secure Encrypted Gateway</span>
            </div>

            <button
              type="submit"
              className="w-full bg-white hover:bg-neutral-200 text-black py-3 px-4 font-semibold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors"
            >
              <span>Continue to Flutterwave Payment</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}

        {/* Step 2: Realistic Flutterwave Payment Prompt */}
        {step === 'payment_prompt' && (
          <div className="p-6 space-y-6">
            <div className="text-center py-4 bg-[#0D0D0D] border border-[#262626]">
              <div className="w-12 h-12 mx-auto rounded-full bg-neutral-800 flex items-center justify-center text-white mb-2">
                {paymentMethod === 'flutterwave_momo' ? <Smartphone size={22} /> : <CreditCard size={22} />}
              </div>
              <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                Flutterwave Secure Checkout
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Merchant: <span className="text-white font-medium">LENO’S Rwanda</span>
              </p>
              <div className="font-heading text-2xl font-bold text-white mt-2">
                {formatCurrency(total)}
              </div>
            </div>

            {paymentMethod === 'flutterwave_momo' ? (
              <div className="space-y-4 bg-[#161616] p-4 border border-[#282828]">
                <div className="flex items-center gap-2 text-xs text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span className="font-semibold">Rwanda Mobile Money (MTN / Airtel) Prompt</span>
                </div>
                <p className="text-xs text-neutral-300">
                  A USSD prompt will be sent to your phone to confirm debiting <strong>{formatCurrency(total)}</strong>.
                </p>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    MoMo Number (MTN / Airtel Rwanda)
                  </label>
                  <input
                    type="tel"
                    value={momoNumber || phone}
                    onChange={(e) => setMomoNumber(e.target.value)}
                    placeholder="+250 788 000 000"
                    className="w-full bg-[#0D0D0D] border border-[#333333] text-sm px-3 py-2 text-white rounded font-mono"
                  />
                </div>

                <div className="text-[11px] text-neutral-400 bg-[#0A0A0A] p-3 border border-[#222222]">
                  <strong>How it works:</strong> You will receive a prompt on your phone screen: <em>"Pay {formatCurrency(total)} to LENO’S?"</em>. Enter your PIN to complete the transaction.
                </div>
              </div>
            ) : (
              <div className="space-y-4 bg-[#161616] p-4 border border-[#282828]">
                <div className="text-xs text-neutral-300 font-semibold mb-2">Card Details Simulation</div>
                <div className="space-y-2">
                  <input
                    type="text"
                    disabled
                    value="•••• •••• •••• 4242 (Flutterwave Test Card)"
                    className="w-full bg-[#0D0D0D] border border-[#333333] text-xs px-3 py-2 text-neutral-300 rounded font-mono"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      disabled
                      value="12/28"
                      className="w-1/2 bg-[#0D0D0D] border border-[#333333] text-xs px-3 py-2 text-neutral-300 rounded font-mono"
                    />
                    <input
                      type="text"
                      disabled
                      value="CVC: •••"
                      className="w-1/2 bg-[#0D0D0D] border border-[#333333] text-xs px-3 py-2 text-neutral-300 rounded font-mono"
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
                className="w-1/3 py-3 px-4 border border-[#333333] text-xs uppercase tracking-wider text-neutral-300 hover:text-white hover:bg-[#1A1A1A] transition-colors"
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
                ✓ ORDER CONFIRMED
              </span>
              <h3 className="font-heading text-2xl font-bold text-white mt-1">
                Thank you for shopping with LENO’S.
              </h3>
              <p className="text-xs text-neutral-400 mt-2 max-w-md mx-auto">
                Your order is confirmed and currently routed to our Kigali atelier for craftsmanship and dispatch.
              </p>
            </div>

            <div className="bg-[#171717] border border-[#292929] p-5 max-w-md mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Order Number:</span>
                <span className="font-mono font-bold text-white">#{completedOrder.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Total Paid:</span>
                <span className="font-bold text-emerald-400">{formatCurrency(completedOrder.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Payment Gateway:</span>
                <span className="text-white">Flutterwave ({completedOrder.payment_method})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Destination:</span>
                <span className="text-white line-clamp-1">{completedOrder.delivery_district}, {completedOrder.delivery_province}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-2">
              <button
                onClick={() => {
                  onClose();
                  onTrackOrder(completedOrder.order_number);
                }}
                className="bg-white hover:bg-neutral-200 text-black py-3 px-6 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Live Order Tracking</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={onClose}
                className="border border-[#333333] hover:border-neutral-500 text-neutral-300 hover:text-white py-3 px-6 text-xs uppercase tracking-widest font-medium transition-colors"
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
