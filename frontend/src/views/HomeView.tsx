import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight, Image as ImageIcon } from 'lucide-react';
import { FashionHero } from '../components/FashionHero';
import { ProductCard } from '../components/ProductCard';
import type { Product, CategoryType, ProductColor } from '../types';

interface HomeViewProps {
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product, size: string, color: ProductColor) => void;
  onNavigate: (view: string, cat?: CategoryType) => void;
}
const collections: { name: CategoryType; description: string }[] = [
  { name: 'Men', description: 'Everyday, elevated.' },
  { name: 'Women', description: 'Effortless by nature.' },
  { name: 'Culture', description: 'Rooted in who we are.' },
];
export const HomeView: React.FC<HomeViewProps> = ({ products, wishlistIds, onToggleWishlist, onQuickView, onSelectProduct, onAddToCart, onNavigate }) => {
  const [editCategory, setEditCategory] = useState<CategoryType>('All');
  const categoryOrder: CategoryType[] = ['Women', 'Men', 'Unisex', 'Culture'];
  const catalogue = [...products.filter(product => product.is_featured), ...products.filter(product => !product.is_featured)];
  const featured = editCategory === 'All'
    ? categoryOrder.map(category => catalogue.find(product => product.category === category)).filter((product): product is Product => Boolean(product))
    : catalogue.filter(product => product.category === editCategory).slice(0, 4);
  return (
    <div className="monve-home">
      <FashionHero onNavigate={onNavigate} />
      <section className="monve-collection-strip" aria-label="Shop the collections">
        {collections.map(collection => <button className="monve-collection" key={collection.name} onClick={() => onNavigate('shop', collection.name)}>
          <div className="monve-collection-image monve-photo-placeholder" aria-hidden="true"><ImageIcon size={24} strokeWidth={1} /></div>
          <div><h2>{collection.name}</h2><p>{collection.description}</p><span>Shop {collection.name} <ArrowRight size={13} /></span></div>
          <ArrowUpRight className="monve-collection-arrow" size={23} strokeWidth={1} />
        </button>)}
      </section>
      <section className="monve-season" id="new-season" aria-labelledby="monve-season-title">
        <div className="monve-season-copy"><p className="monve-eyebrow">A NEW SEASON. A NEW FEELING.</p><h2 id="monve-season-title">NEW<br />ENERGY.</h2><p>Fresh silhouettes.<br />A style that's entirely yours.</p><button className="monve-button" onClick={() => onNavigate('shop', 'All')}>Explore collection <ArrowUpRight size={15} /></button></div>
        <span className="monve-season-caption">THE EVERYDAY, REIMAGINED.</span>
      </section>
      <section className="monve-featured" id="monve-edit" aria-labelledby="monve-edit-title">
        <div className="monve-section-heading">
          <div><p className="monve-eyebrow">A CONSIDERED WARDROBE</p><h2 id="monve-edit-title">THE MONVÉ EDIT</h2><p className="monve-edit-intro">Explore modern tailoring, everyday essentials, and pieces rooted in Rwandan culture.</p></div>
          <button className="monve-text-link" onClick={() => onNavigate('shop', 'All')}>View all pieces <ArrowUpRight size={16} /></button>
        </div>
        <div className="monve-edit-filters" role="group" aria-label="Filter the Monvé Edit by category">
          {(['All', ...categoryOrder] as CategoryType[]).map(category => <button key={category} type="button" aria-pressed={editCategory === category} onClick={() => setEditCategory(category)}>{category === 'All' ? 'All pieces' : category === 'Culture' ? 'Culture' : category}</button>)}
        </div>
        {featured.length > 0 ? <div className="monve-product-grid">{featured.map(product => <ProductCard key={product.id} product={product} isWishlisted={wishlistIds.includes(product.id)} onToggleWishlist={onToggleWishlist} onQuickView={onQuickView} onSelectProduct={onSelectProduct} onAddToCart={onAddToCart} />)}</div> : <p className="monve-empty-edit">There are no {editCategory.toLowerCase()} pieces in the edit right now. Browse all pieces or explore Customs for something made around you.</p>}
      </section>
      <section className="monve-atelier" aria-labelledby="monve-atelier-title">
        <div className="monve-atelier-image monve-photo-placeholder"><ImageIcon size={40} strokeWidth={1} aria-hidden="true" /><p>Photo coming soon</p></div>
        <div className="monve-atelier-copy"><p className="monve-eyebrow">YOUR IDEAS. OUR CRAFT.</p><h2 id="monve-atelier-title">CUSTOMS.<br />MADE FOR YOU.</h2><p>Clothes made around you. From everyday shirts and matching sets to dresses, suits and cultural pieces, share your idea and let us create something personal. Your style, your fit, your details.</p><div><button className="monve-button" onClick={() => onNavigate('custom')}>Explore Customs <ArrowUpRight size={15} /></button><button className="monve-text-link" onClick={() => onNavigate('shop', 'Culture')}>Explore our roots <ArrowRight size={14} /></button></div></div>
      </section>
    </div>
  );
};
