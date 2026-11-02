import React from 'react';
import { ArrowRight, ArrowUpRight, Truck, Scissors, BadgeCheck, LockKeyhole } from 'lucide-react';
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
const collections: { name: CategoryType; description: string; image: string; imageClass?: string }[] = [
  { name: 'Men', description: 'Everyday, elevated.', image: '/images/aurie-editorial.png', imageClass: 'aurie-collection-men' },
  { name: 'Women', description: 'Effortless by nature.', image: '/images/aurie-women.png' },
  { name: 'Culture', description: 'Rooted in who we are.', image: '/images/aurie-women.png', imageClass: 'aurie-collection-culture' },
];
export const HomeView: React.FC<HomeViewProps> = ({ products, wishlistIds, onToggleWishlist, onQuickView, onSelectProduct, onAddToCart, onNavigate }) => {
  const featured = [...products.filter(product => product.is_featured), ...products.filter(product => !product.is_featured)].slice(0, 4);
  return (
    <div className="aurie-home">
      <FashionHero onNavigate={onNavigate} />
      <section className="aurie-collection-strip" aria-label="Shop the collections">
        {collections.map(collection => <button className="aurie-collection" key={collection.name} onClick={() => onNavigate('shop', collection.name)}>
          <div className="aurie-collection-image"><img className={collection.imageClass} src={collection.image} alt={`${collection.name} campaign`} loading="lazy" width="120" height="150" /></div>
          <div><h2>{collection.name}</h2><p>{collection.description}</p><span>Shop {collection.name} <ArrowRight size={13} /></span></div>
          <ArrowUpRight className="aurie-collection-arrow" size={23} strokeWidth={1} />
        </button>)}
      </section>
      <section className="aurie-season" id="new-season" aria-labelledby="aurie-season-title">
        <img src="/images/aurie-editorial.png" alt="A fresh perspective on relaxed black tailoring" loading="lazy" width="1536" height="1024" />
        <div className="aurie-season-copy"><p className="aurie-eyebrow">A NEW SEASON. A NEW FEELING.</p><h2 id="aurie-season-title">NEW<br />ENERGY.</h2><p>Fresh silhouettes.<br />A style that's entirely yours.</p><button className="aurie-button" onClick={() => onNavigate('shop', 'All')}>Explore collection <ArrowUpRight size={15} /></button></div>
        <span className="aurie-season-caption">THE EVERYDAY, REIMAGINED.</span>
      </section>
      <section className="aurie-benefits" aria-label="The Aurie experience">
        <div><Truck size={27} strokeWidth={1.2} /><p><strong>FROM KIGALI, WITH CARE</strong><span>Our atelier to your wardrobe</span></p></div>
        <div><Scissors size={27} strokeWidth={1.2} /><p><strong>MADE FOR YOU</strong><span>Personal, made-to-measure pieces</span></p></div>
        <div><BadgeCheck size={27} strokeWidth={1.2} /><p><strong>DETAILS THAT MATTER</strong><span>Considered cuts. Beautiful fabrics.</span></p></div>
        <div><LockKeyhole size={27} strokeWidth={1.2} /><p><strong>YOUR WAY TO PAY</strong><span>Cards & mobile money</span></p></div>
      </section>
      <section className="aurie-featured" id="aurie-edit" aria-labelledby="aurie-edit-title">
        <div className="aurie-section-heading"><div><p className="aurie-eyebrow">GOOD STYLE STARTS HERE</p><h2 id="aurie-edit-title">THE AURIE EDIT</h2></div><button className="aurie-text-link" onClick={() => onNavigate('shop', 'All')}>View all <ArrowUpRight size={16} /></button></div>
        {featured.length > 0 ? <div className="aurie-product-grid">{featured.map(product => <ProductCard key={product.id} product={product} isWishlisted={wishlistIds.includes(product.id)} onToggleWishlist={onToggleWishlist} onQuickView={onQuickView} onSelectProduct={onSelectProduct} onAddToCart={onAddToCart} />)}</div> : <p className="aurie-empty-edit">A new chapter is taking shape. Explore our custom tailoring while the next collection arrives.</p>}
      </section>
      <section className="aurie-atelier" aria-labelledby="aurie-atelier-title">
        <div className="aurie-atelier-image"><img src="/images/aurie-women.png" alt="Sculptural draping from the Aurie campaign" loading="lazy" width="1024" height="1536" /><span>FORM. FEELING. FREEDOM.</span></div>
        <div className="aurie-atelier-copy"><p className="aurie-eyebrow">RWANDAN ROOTS. YOUR OWN EXPRESSION.</p><h2 id="aurie-atelier-title">NOT JUST WORN.<br />MADE YOURS.</h2><p>Modern silhouettes. A connection to culture. The freedom to make it your own. From everyday essentials to a piece for your biggest moment, this is Aurie.</p><div><button className="aurie-button" onClick={() => onNavigate('custom')}>Create your piece <ArrowUpRight size={15} /></button><button className="aurie-text-link" onClick={() => onNavigate('shop', 'Culture')}>Explore our roots <ArrowRight size={14} /></button></div></div>
      </section>
    </div>
  );
};
