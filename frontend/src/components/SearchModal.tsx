import React, { useState, useMemo } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { ImagePlaceholder } from './ImagePlaceholder';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct
}) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tagline && p.tagline.toLowerCase().includes(q))
    );
  }, [query, products]);

  if (!isOpen) return null;

  const popularSearches = ['Blazer', 'Traditional', 'Umushanana', 'Tee', 'Hoodie', 'Dress', 'Trousers'];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-2xl bg-[var(--tone-121212)] border border-[var(--tone-2b2b2b)] shadow-2xl p-6 relative animate-fade-in text-[var(--tone-f5f5f5)]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[var(--tone-a3a3a3)] hover:text-[var(--tone-ffffff)]"
        >
          <X size={20} />
        </button>

        <div className="relative mb-5">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tone-a3a3a3)]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shirts, dresses, traditional wear, jackets..."
            className="w-full bg-[var(--tone-181818)] border border-[var(--tone-333333)] pl-10 pr-4 py-3 text-sm text-[var(--tone-ffffff)] placeholder-[var(--tone-737373)] rounded focus:outline-none focus:border-[var(--tone-ffffff)] transition-colors"
          />
        </div>

        {/* Quick Suggestion Tags */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <span className="text-[10px] uppercase tracking-wider text-[var(--tone-737373)]">Popular:</span>
          {popularSearches.map((term) => (
            <button
              key={term}
              onClick={() => setQuery(term)}
              className="text-[11px] px-2.5 py-1 rounded bg-[var(--tone-1a1a1a)] hover:bg-[var(--tone-252525)] text-[var(--tone-d4d4d4)] border border-[var(--tone-2e2e2e)] transition-colors"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto space-y-3">
          {query.trim() && filtered.length === 0 ? (
            <div className="text-center py-10 text-[var(--tone-737373)] text-xs">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  onClose();
                  onSelectProduct(product);
                }}
                className="flex items-center gap-4 p-2.5 bg-[var(--tone-171717)] hover:bg-[var(--tone-202020)] border border-[var(--tone-242424)] hover:border-[var(--tone-525252)] cursor-pointer transition-colors"
              >
                <div className="w-14 h-16 flex-shrink-0 bg-[var(--tone-171717)] border border-[var(--tone-2a2a2a)]">
                  <ImagePlaceholder
                    imageUrl={product.image_url}
                    alt={product.name}
                    category={product.category}
                    aspectRatio="portrait"
                    allowEdit={false}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] uppercase tracking-widest text-[var(--tone-888888)]">
                    {product.category} · {product.subcategory}
                  </div>
                  <h4 className="text-xs font-semibold text-[var(--tone-ffffff)] truncate">{product.name}</h4>
                  <p className="text-xs font-medium text-[var(--tone-d4d4d4)] mt-0.5">
                    {new Intl.NumberFormat('en-RW', {
                      style: 'currency',
                      currency: 'RWF',
                      maximumFractionDigits: 0
                    }).format(product.price)}
                  </p>
                </div>
                <ArrowRight size={14} className="text-[var(--tone-737373)] pr-2" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
