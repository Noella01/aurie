import React from 'react';
import { X, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';
import { ImagePlaceholder } from './ImagePlaceholder';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal > 120000 || subtotal === 0 ? 0 : 2500;
  const total = subtotal + deliveryFee;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      maximumFractionDigits: 0
    }).format(val);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0F0F0F] border-l border-[#262626] flex flex-col justify-between shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-[#222222] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-neutral-300" />
              <h2 className="font-heading text-base font-semibold tracking-wider text-white">
                YOUR SHOPPING BAG ({items.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#1C1C1C] rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 text-neutral-400">
                <div className="w-16 h-16 rounded-full border border-[#222222] flex items-center justify-center mb-4 text-neutral-500">
                  <ShoppingBag size={24} />
                </div>
                <p className="font-heading text-sm text-neutral-300 mb-1">Your bag is empty</p>
                <p className="text-xs text-neutral-500 max-w-xs mb-6">
                  Explore LENO’S menswear, womenswear, and contemporary cultural collections.
                </p>
                <button
                  onClick={onClose}
                  className="bg-white text-black px-6 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-neutral-200 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColor.name}-${idx}`}
                  className="flex gap-4 p-3 bg-[#151515] border border-[#222222] relative group"
                >
                  {/* Thumbnail / Minimal placeholder */}
                  <div className="w-20 h-24 flex-shrink-0 overflow-hidden bg-neutral-900 border border-[#2A2A2A]">
                    <ImagePlaceholder
                      imageUrl={item.product.image_url}
                      alt={item.product.name}
                      category={item.product.category}
                      aspectRatio="portrait"
                      allowEdit={false}
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-semibold text-white line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(idx)}
                          className="text-neutral-500 hover:text-red-400 transition-colors ml-2"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-wider">
                        Size: <span className="text-neutral-200">{item.selectedSize}</span> · Color:{' '}
                        <span className="text-neutral-200">{item.selectedColor.name}</span>
                      </p>

                      <p className="text-xs font-medium text-white mt-1">
                        {formatCurrency(item.product.price)}
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-[#2E2E2E] bg-[#111111]">
                        <button
                          onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-neutral-400 hover:text-white"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-medium text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-neutral-400 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-[11px] text-neutral-400 font-light ml-auto">
                        Subtotal: {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#222222] bg-[#121212] space-y-3">
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Subtotal</span>
                <span className="text-neutral-200">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Kigali Delivery Fee</span>
                <span className="text-neutral-200">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-400 font-medium">Complimentary</span>
                  ) : (
                    formatCurrency(deliveryFee)
                  )}
                </span>
              </div>

              <div className="border-t border-[#222222] pt-3 flex justify-between items-baseline">
                <span className="font-heading text-sm text-white font-semibold">Total</span>
                <span className="font-heading text-base font-bold text-white tracking-wide">
                  {formatCurrency(total)}
                </span>
              </div>

              <p className="text-[10px] text-neutral-500 text-center">
                Prices in Rwandan Francs (RWF) · Secure Flutterwave Payment
              </p>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full bg-white hover:bg-neutral-200 text-black py-3 px-4 font-semibold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
