import React, { useState } from 'react';
import { ShoppingBag, Heart, Search, Menu, X, ArrowRight, Sun, Moon } from 'lucide-react';
import type { Theme } from '../useTheme';
import { CategoryType } from '../types';

interface NavbarProps {
  customerName?: string;
  theme: Theme;
  onToggleTheme: () => void;
  currentRole: 'customer' | 'admin';
  onSwitchRole: (role: 'customer' | 'admin') => void;
  activeView: string;
  onNavigate: (view: string, categoryFilter?: CategoryType) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  customerName,
  theme,
  onToggleTheme,
  activeView,
  onNavigate,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Main Navigation Header */}
      <header className={`customer-header ${activeView === 'home' ? 'customer-header-overlay' : 'customer-header-solid'}`}>
        <div className="customer-header-inner">
          {/* Mobile hamburger */}
          <div className="order-3 flex items-center xl:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[var(--tone-f5f5f5)] p-2 hover:bg-[var(--tone-1c1c1c)] rounded-md transition-colors"
              aria-label="Toggle menu" aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Brand Logo & Tagline */}
          <div
            onClick={() => onNavigate('home')}
            className="customer-brand cursor-pointer text-left select-none group"
          >
            <span className="font-heading text-2xl sm:text-3xl font-bold tracking-[0.12em] text-[var(--tone-f5f5f5)] group-hover:text-[var(--tone-ffffff)] transition-colors">
              LENO’S
            </span>
            <span className="block text-[8px] sm:text-[9px] tracking-[0.2em] text-[var(--tone-a0a0a0)] uppercase font-medium">
              Style With No Limits
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="customer-nav hidden xl:flex items-center uppercase font-medium">
            <button
              onClick={() => onNavigate('home')}
              className={`transition-colors py-2 relative ${
                activeView === 'home' ? 'text-[var(--tone-ffffff)] font-semibold' : 'text-[var(--tone-a0a0a0)] hover:text-[var(--tone-ffffff)]'
              }`}
            >
              Home
              {activeView === 'home' && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[var(--tone-ffffff)]"></span>
              )}
            </button>

            <button
              onClick={() => onNavigate('shop', 'All')}
              className={`transition-colors py-2 relative ${
                activeView === 'shop' ? 'text-[var(--tone-ffffff)] font-semibold' : 'text-[var(--tone-a0a0a0)] hover:text-[var(--tone-ffffff)]'
              }`}
            >
              Collection
              {activeView === 'shop' && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[var(--tone-ffffff)]"></span>
              )}
            </button>







            <button
              onClick={() => onNavigate('shop', 'Culture')}
              className="text-[var(--tone-a0a0a0)] hover:text-[var(--tone-ffffff)] transition-colors py-2 flex items-center gap-1"
            >
              <span className="text-amber-400/90 font-semibold">Culture</span>
            </button>

            <button
              onClick={() => onNavigate('custom')}
              className={`transition-colors py-2 relative flex items-center gap-1 ${
                activeView === 'custom' ? 'text-[var(--tone-ffffff)] font-semibold' : 'text-[var(--tone-a0a0a0)] hover:text-[var(--tone-ffffff)]'
              }`}
            >
              <span>Custom Tailoring</span>
              {activeView === 'custom' && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[var(--tone-ffffff)]"></span>
              )}
            </button>

            <button
              onClick={() => onNavigate('track-order')}
              className={`transition-colors py-2 relative flex items-center gap-1 ${
                activeView === 'track-order' ? 'text-[var(--tone-ffffff)] font-semibold' : 'text-[var(--tone-a0a0a0)] hover:text-[var(--tone-ffffff)]'
              }`}
            >
              <span>Live Tracking</span>
              {activeView === 'track-order' && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[var(--tone-ffffff)]"></span>
              )}
            </button>
          </nav>

          <div className="customer-auth-links hidden xl:flex">
            {customerName ? <button onClick={() => onNavigate('account')}>My account</button> : <>
              <button onClick={() => onNavigate('login')}>Log in</button>
              <button className="customer-signup" onClick={() => onNavigate('signup')}>Sign up</button>
            </>}
          </div>
          {/* Right Action Icons */}
          <div className="customer-actions flex items-center gap-0 sm:gap-1">
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 text-[var(--tone-a0a0a0)] hover:text-[var(--tone-ffffff)] hover:bg-[var(--tone-1c1c1c)] rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={onOpenSearch}
              className="p-2 text-[var(--tone-a0a0a0)] hover:text-[var(--tone-ffffff)] hover:bg-[var(--tone-1c1c1c)] rounded-full transition-colors"
              title="Search collection"
            >
              <Search size={18} />
            </button>

            <button
              onClick={onOpenWishlist}
              className="p-2 text-[var(--tone-a0a0a0)] hover:text-[var(--tone-ffffff)] hover:bg-[var(--tone-1c1c1c)] rounded-full transition-colors relative"
              title="Wishlist"
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-[var(--tone-ffffff)] text-[var(--tone-000000)] text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenCart}
              className="p-2 text-[var(--tone-f5f5f5)] hover:bg-[var(--tone-1c1c1c)] rounded-full transition-colors relative"
              title="Cart"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[var(--tone-ffffff)] text-[var(--tone-000000)] text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-[var(--tone-0d0d0d)] border-b border-[var(--tone-2a2a2a)] px-6 py-6 animate-fade-in">
            <div className="flex flex-col space-y-4 text-sm uppercase tracking-[0.06em] font-medium">
              <div className="customer-auth-links">
                {customerName ? <button onClick={() => { onNavigate('account'); setMobileMenuOpen(false); }}>My account</button> : <>
                  <button onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}>Log in</button>
                  <button className="customer-signup" onClick={() => { onNavigate('signup'); setMobileMenuOpen(false); }}>Sign up</button>
                </>}
              </div>
              <button
                onClick={() => {
                  onNavigate('home');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-[var(--tone-d4d4d4)] hover:text-[var(--tone-ffffff)] py-1 flex items-center justify-between"
              >
                <span>Home</span>
                <ArrowRight size={14} className="text-[var(--tone-525252)]" />
              </button>
              <button
                onClick={() => {
                  onNavigate('shop', 'All');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-[var(--tone-d4d4d4)] hover:text-[var(--tone-ffffff)] py-1 flex items-center justify-between"
              >
                <span>All Products</span>
                <ArrowRight size={14} className="text-[var(--tone-525252)]" />
              </button>



              <button
                onClick={() => {
                  onNavigate('shop', 'Culture');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-amber-400 hover:text-amber-300 py-1 flex items-center justify-between"
              >
                <span>Traditional & Culture</span>
                <ArrowRight size={14} className="text-amber-600" />
              </button>
              <button
                onClick={() => {
                  onNavigate('custom');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-[var(--tone-d4d4d4)] hover:text-[var(--tone-ffffff)] py-1 flex items-center justify-between"
              >
                <span>Custom Tailoring Request</span>
                <ArrowRight size={14} className="text-[var(--tone-525252)]" />
              </button>
              <button
                onClick={() => {
                  onNavigate('track-order');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-[var(--tone-d4d4d4)] hover:text-[var(--tone-ffffff)] py-1 flex items-center justify-between"
              >
                <span>Live Order Tracking</span>
                <ArrowRight size={14} className="text-[var(--tone-525252)]" />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
