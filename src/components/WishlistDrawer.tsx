import React from 'react';
import { X, Heart, Trash2, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { ImagePlaceholder } from './ImagePlaceholder';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlist,
  onRemoveFromWishlist,
  onSelectProduct
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div onClick={onClose} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0F0F0F] border-l border-[#262626] flex flex-col justify-between shadow-2xl">
          <div className="p-5 border-b border-[#222222] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart size={18} className="text-red-400" />
              <h2 className="font-heading text-base font-semibold tracking-wider text-white">
                SAVED PIECES ({wishlist.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-[#1C1C1C]"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {wishlist.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 text-neutral-500">
                <Heart size={28} className="mb-3 text-neutral-600" />
                <p className="text-xs uppercase tracking-widest text-neutral-400">
                  No saved items in your wishlist
                </p>
                <p className="text-[11px] text-neutral-500 mt-1 max-w-xs">
                  Save pieces while exploring our latest drops and cultural designs.
                </p>
              </div>
            ) : (
              wishlist.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onClose();
                    onSelectProduct(product);
                  }}
                  className="flex gap-4 p-3 bg-[#151515] border border-[#222222] hover:border-[#383838] cursor-pointer transition-colors group"
                >
                  <div className="w-16 h-20 flex-shrink-0 bg-neutral-900 border border-[#2A2A2A]">
                    <ImagePlaceholder
                      imageUrl={product.image_url}
                      alt={product.name}
                      category={product.category}
                      aspectRatio="portrait"
                      allowEdit={false}
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-semibold text-white truncate pr-2">
                          {product.name}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFromWishlist(product.id);
                          }}
                          className="text-neutral-500 hover:text-red-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mt-0.5">
                        {product.category} · {product.subcategory}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-semibold text-white">
                        {new Intl.NumberFormat('en-RW', {
                          style: 'currency',
                          currency: 'RWF',
                          maximumFractionDigits: 0
                        }).format(product.price)}
                      </span>
                      <span className="text-[10px] text-neutral-400 group-hover:text-white flex items-center gap-1">
                        <ShoppingBag size={11} />
                        <span>View</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-[#222222] bg-[#121212]">
            <button
              onClick={onClose}
              className="w-full bg-[#1C1C1C] hover:bg-[#252525] border border-[#333333] text-neutral-200 py-2.5 text-xs uppercase tracking-widest font-semibold transition-colors"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
