import React, { useState } from 'react';
import { Heart, Eye, Plus, Check } from 'lucide-react';
import { Product, ProductColor } from '../types';
import { ImagePlaceholder } from './ImagePlaceholder';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: ProductColor) => void;
  onUpdateProductImage?: (productId: string, imageUrl: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onSelectProduct,
  onAddToCart,
  onUpdateProductImage
}) => {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0] || { name: 'Black', hex: '#000000' });
  const [addedAnimation, setAddedAnimation] = useState(false);

  const formattedPrice = new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0
  }).format(product.price);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedSize, selectedColor);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group cursor-pointer bg-[var(--tone-151515)] border border-[var(--tone-222222)] hover:border-[var(--tone-383838)] transition-all duration-300 flex flex-col justify-between"
    >
      {/* Top Image area */}
      <div className="relative overflow-hidden">
        <ImagePlaceholder
          imageUrl={product.image_url}
          alt={product.name}
          category={product.category}
          aspectRatio="portrait"
          allowEdit={true}
          onImageChange={(newUrl) => onUpdateProductImage?.(product.id, newUrl)}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
          {product.is_new_arrival && (
            <span className="bg-[var(--tone-000000)]/80 text-[var(--tone-ffffff)] text-[9px] uppercase tracking-widest px-2 py-0.5 border border-[var(--tone-333333)] backdrop-blur-sm">
              New
            </span>
          )}
          {product.category === 'Culture' && (
            <span className="bg-amber-950/80 text-amber-200 text-[9px] uppercase tracking-widest px-2 py-0.5 border border-amber-800/40 backdrop-blur-sm">
              Heritage
            </span>
          )}
        </div>

        {/* Top-Right Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all z-10 ${
            isWishlisted
              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
              : 'bg-[var(--tone-000000)]/60 text-[var(--tone-d4d4d4)] hover:text-[var(--tone-ffffff)] border border-[var(--tone-ffffff)]/10 hover:border-[var(--tone-ffffff)]/30'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={14} className={isWishlisted ? 'fill-red-400' : ''} />
        </button>

        {/* Hover Quick View overlay button */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 bg-[var(--tone-0a0a0a)]/90 hover:bg-[var(--tone-000000)] text-[var(--tone-f5f5f5)] text-xs py-2 px-3 border border-[var(--tone-333333)] flex items-center justify-center gap-1.5 backdrop-blur-sm uppercase tracking-wider font-medium"
          >
            <Eye size={13} />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between text-[10px] tracking-widest uppercase text-[var(--tone-888888)] mb-1">
            <span>{product.category} · {product.subcategory}</span>
            <span>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
          </div>

          <h3 className="font-heading text-sm sm:text-base font-semibold text-[var(--tone-f5f5f5)] group-hover:text-[var(--tone-ffffff)] transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-[var(--tone-999999)] line-clamp-1 mt-1 font-light">
            {product.tagline || product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[var(--tone-222222)]">
          {/* Sizes */}
          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
            {product.sizes.slice(0, 4).map((size) => (
              <button
                key={size}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSize(size);
                }}
                className={`text-[10px] px-2 py-0.5 border rounded-none uppercase transition-all ${
                  selectedSize === size
                    ? 'border-[var(--tone-ffffff)] text-[var(--tone-ffffff)] bg-[var(--tone-ffffff)]/10'
                    : 'border-[var(--tone-2e2e2e)] text-[var(--tone-a3a3a3)] hover:border-[var(--tone-737373)]'
                }`}
              >
                {size}
              </button>
            ))}
            {product.sizes.length > 4 && (
              <span className="text-[9px] text-[var(--tone-737373)]">+{product.sizes.length - 4}</span>
            )}
          </div>

          {/* Price & Add to Cart button */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-[var(--tone-a3a3a3)] block font-light text-[10px] uppercase tracking-wider">
                Price
              </span>
              <span className="text-sm font-semibold tracking-wide text-[var(--tone-ffffff)]">
                {formattedPrice}
              </span>
            </div>

            <button
              onClick={handleQuickAdd}
              disabled={product.stock <= 0}
              className={`p-2 transition-all flex items-center gap-1 text-xs uppercase tracking-wider font-semibold border ${
                addedAnimation
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-[var(--tone-1c1c1c)] hover:bg-[var(--tone-ffffff)] hover:text-[var(--tone-000000)] text-[var(--tone-ffffff)] border-[var(--tone-333333)]'
              }`}
              title="Add to cart"
            >
              {addedAnimation ? (
                <>
                  <Check size={14} />
                  <span className="hidden sm:inline text-[10px]">Added</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span className="hidden sm:inline text-[10px]">Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
