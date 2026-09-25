import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { Product, CategoryType, ProductColor } from '../types';
import { ProductCard } from '../components/ProductCard';

interface ShopViewProps {
  products: Product[];
  initialCategory?: CategoryType;
  wishlistIds: string[];
  onToggleWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product, size: string, color: ProductColor) => void;
  onUpdateProductImage?: (productId: string, imageUrl: string) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  products,
  initialCategory = 'All',
  wishlistIds,
  onToggleWishlist,
  onQuickView,
  onSelectProduct,
  onAddToCart,
  onUpdateProductImage
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(initialCategory);
  const [selectedSize, setSelectedSize] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categories: CategoryType[] = ['All', 'Men', 'Women', 'Unisex', 'Culture'];
  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
        if (selectedSize !== 'All' && !p.sizes.includes(selectedSize)) return false;
        if (inStockOnly && p.stock <= 0) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [products, selectedCategory, selectedSize, inStockOnly, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-10 text-center sm:text-left">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#888888] font-semibold">
          LENO’S CATALOGUE
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-1">
          {selectedCategory === 'All' ? 'ALL COLLECTIONS' : `${selectedCategory.toUpperCase()} COLLECTION`}
        </h1>
        <p className="text-xs text-neutral-400 mt-2 max-w-xl font-light">
          {selectedCategory === 'Culture'
            ? 'Rwandan ceremonial ensembles, contemporary Umushanana, and geometric embroideries.'
            : 'Minimalist silhouettes and tailored wardrobe essentials constructed with premium textiles.'}
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-4 border-b border-[#222222] scrollbar-none mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs uppercase tracking-[0.2em] font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-white text-black font-bold'
                : 'bg-[#151515] text-neutral-400 hover:text-white border border-[#262626] hover:border-neutral-500'
            }`}
          >
            {cat === 'Culture' ? 'Traditional / Culture' : cat}
          </button>
        ))}
      </div>

      {/* Filter and Sorting Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-[#121212] border border-[#222222] p-4 text-xs">
        {/* Left Filter summary & Mobile toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 text-neutral-300 hover:text-white py-1 px-3 border border-[#333333] rounded"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>

          {/* Desktop Size Pills */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-neutral-400 text-[11px] uppercase tracking-wider mr-1">Size:</span>
            {sizes.map((sz) => (
              <button
                key={sz}
                onClick={() => setSelectedSize(sz)}
                className={`px-2 py-0.5 text-[11px] uppercase border transition-colors ${
                  selectedSize === sz
                    ? 'border-white text-white bg-[#222222]'
                    : 'border-[#2A2A2A] text-neutral-400 hover:border-neutral-500'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>

          <label className="hidden sm:flex items-center gap-2 cursor-pointer select-none text-neutral-300">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-white"
            />
            <span className="text-[11px] uppercase tracking-wider">In Stock Only</span>
          </label>
        </div>

        {/* Right Sorting dropdown */}
        <div className="flex items-center gap-2 ml-auto">
          <ArrowUpDown size={14} className="text-neutral-400" />
          <span className="text-neutral-400 text-[11px] uppercase tracking-wider">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#1C1C1C] border border-[#2E2E2E] text-xs text-white px-2.5 py-1.5 rounded focus:outline-none focus:border-white"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="md:hidden bg-[#161616] border border-[#2A2A2A] p-4 mb-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#2A2A2A]">
            <span className="text-xs uppercase tracking-widest font-semibold text-white">Filters</span>
            <button onClick={() => setMobileFilterOpen(false)} className="text-neutral-400">
              <X size={16} />
            </button>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 block mb-2">Size</span>
            <div className="flex flex-wrap gap-2">
              {sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-2.5 py-1 text-xs border ${
                    selectedSize === sz
                      ? 'border-white text-white bg-[#222]'
                      : 'border-[#333] text-neutral-400'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="accent-white"
              />
              <span>Show in-stock items only</span>
            </label>
          </div>
        </div>
      )}

      {/* Product Count Indicator */}
      <div className="text-right text-[11px] text-neutral-500 uppercase tracking-widest mb-6">
        Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'Piece' : 'Pieces'}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-24 bg-[#111111] border border-[#222222]">
          <p className="font-heading text-base text-neutral-300">No garments match your filters</p>
          <p className="text-xs text-neutral-500 mt-1 mb-6">
            Try resetting your size or category selection.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedSize('All');
              setInStockOnly(false);
            }}
            className="bg-white text-black text-xs font-semibold px-6 py-2.5 uppercase tracking-widest hover:bg-neutral-200 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              onQuickView={onQuickView}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
              onUpdateProductImage={onUpdateProductImage}
            />
          ))}
        </div>
      )}
    </div>
  );
};
