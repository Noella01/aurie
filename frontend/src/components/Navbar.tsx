import React, { useEffect, useState } from 'react';
import { ShoppingBag, Heart, Search, Menu, X, ArrowUpRight, UserRound } from 'lucide-react';
import { MonveMark } from './MonveMark';
import type { CategoryType } from '../types';

interface NavbarProps {
  customerName?: string;
  activeView: string;
  onNavigate: (view: string, categoryFilter?: CategoryType) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ customerName, activeView, onNavigate, cartCount, wishlistCount, onOpenCart, onOpenWishlist, onOpenSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = (view: string, category?: CategoryType) => { onNavigate(view, category); setMobileMenuOpen(false); };
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileMenuOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  return (
    <header className={`monve-header ${activeView === 'home' ? 'monve-header-home' : ''}`}>
      <div className="monve-nav-row">
        <button className="monve-menu-toggle monve-icon-button" aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuOpen} aria-controls="monve-mobile-menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}</button>
        <nav className="monve-nav-links" aria-label="Collections">
          <button onClick={() => navigate('shop', 'Men')}>Men</button><button onClick={() => navigate('shop', 'Women')}>Women</button><button onClick={() => navigate('shop', 'Unisex')}>Unisex</button><button onClick={() => navigate('shop', 'Culture')}>Culture</button>
          <button aria-current={activeView === 'custom' ? 'page' : undefined} onClick={() => navigate('custom')}>Customs</button>
        </nav>
        <button className="monve-brand" aria-label="Monvé home" onClick={() => navigate('home')}><MonveMark className="monve-brand-mark" /></button>
        <div className="monve-nav-actions">
          <button aria-label="Search collection" onClick={onOpenSearch}><Search size={17} /><span>Search</span></button>
          <button className="monve-desktop-action" aria-label={customerName ? 'My account' : 'Log in'} onClick={() => navigate(customerName ? 'account' : 'login')}><UserRound size={17} /><span>{customerName ? 'Account' : 'Log in'}</span></button>
          <button className="monve-desktop-action" aria-label={`Wishlist (${wishlistCount})`} onClick={onOpenWishlist}><Heart size={17} /><span>Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}</span>{wishlistCount > 0 && <small className="monve-icon-count">{wishlistCount}</small>}</button>
          <button aria-label={`Cart (${cartCount})`} onClick={onOpenCart}><ShoppingBag size={17} /><span>Cart ({cartCount})</span>{cartCount > 0 && <small className="monve-icon-count">{cartCount}</small>}</button>
        </div>
      </div>
      {mobileMenuOpen && <nav id="monve-mobile-menu" className="monve-mobile-menu" aria-label="Mobile navigation">
        <button onClick={() => navigate('shop', 'All')}>Shop all <ArrowUpRight size={18} /></button>
        {(['Men', 'Women', 'Unisex', 'Culture'] as CategoryType[]).map(category => <button key={category} onClick={() => navigate('shop', category)}>{category}<ArrowUpRight size={18} /></button>)}
        <button aria-current={activeView === 'custom' ? 'page' : undefined} onClick={() => navigate('custom')}>Customs <ArrowUpRight size={18} /></button>
        <div className="monve-mobile-utilities">
          <button onClick={() => navigate(customerName ? 'account' : 'login')}><UserRound size={17} />{customerName ? 'My account' : 'Log in / Sign up'}</button>
          <button onClick={() => { onOpenWishlist(); setMobileMenuOpen(false); }}><Heart size={17} />Wishlist ({wishlistCount})</button>
        </div>
      </nav>}
    </header>
  );
};
