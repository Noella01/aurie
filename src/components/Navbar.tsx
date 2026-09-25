import React, { useState } from 'react';
import { ShoppingBag, Heart, Search, ShieldCheck, UserCheck, Menu, X, ArrowRight, Truck } from 'lucide-react';
import { CategoryType } from '../types';

interface NavbarProps {
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
  currentRole,
  onSwitchRole,
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
      {/* Top luxury announcement bar */}
      <div className="bg-[#050505] text-[#A0A0A0] text-[11px] py-2 px-4 border-b border-[#1F1F1F] flex justify-between items-center tracking-wider">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>RWANDA ATELIER · COMPLIMENTARY KIGALI DISPATCH OVER 100,000 RWF</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('track-order')}
            className="hover:text-white transition-colors flex items-center gap-1 text-[11px]"
          >
            <Truck size={12} />
            <span>Track Order</span>
          </button>
          <span className="text-[#333333]">|</span>
          {/* Quick Role Switcher Pill */}
          <button
            onClick={() => onSwitchRole(currentRole === 'customer' ? 'admin' : 'customer')}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-all ${
              currentRole === 'admin'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                : 'bg-[#1C1C1C] text-neutral-300 border border-[#2A2A2A] hover:text-white hover:border-neutral-500'
            }`}
          >
            {currentRole === 'admin' ? (
              <>
                <ShieldCheck size={12} className="text-amber-400" />
                <span>Admin Portal (/admin)</span>
              </>
            ) : (
              <>
                <UserCheck size={12} />
                <span>Admin Portal (/admin)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Mobile hamburger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#F5F5F5] p-2 hover:bg-[#1C1C1C] rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Brand Logo & Tagline */}
          <div
            onClick={() => onNavigate('home')}
            className="cursor-pointer text-center lg:text-left select-none group"
          >
            <span className="font-heading text-2xl sm:text-3xl font-bold tracking-[0.2em] text-[#F5F5F5] group-hover:text-white transition-colors">
              LENO’S
            </span>
            <span className="block text-[8px] sm:text-[9px] tracking-[0.35em] text-[#A0A0A0] uppercase font-light">
              Style With No Limits
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-xs tracking-[0.2em] uppercase font-medium">
            <button
              onClick={() => onNavigate('home')}
              className={`transition-colors py-2 relative ${
                activeView === 'home' ? 'text-white font-semibold' : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              Home
              {activeView === 'home' && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-white"></span>
              )}
            </button>

            <button
              onClick={() => onNavigate('shop', 'All')}
              className={`transition-colors py-2 relative ${
                activeView === 'shop' ? 'text-white font-semibold' : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              Collection
              {activeView === 'shop' && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-white"></span>
              )}
            </button>

            <button
              onClick={() => onNavigate('shop', 'Men')}
              className="text-[#A0A0A0] hover:text-white transition-colors py-2"
            >
              Men
            </button>

            <button
              onClick={() => onNavigate('shop', 'Women')}
              className="text-[#A0A0A0] hover:text-white transition-colors py-2"
            >
              Women
            </button>

            <button
              onClick={() => onNavigate('shop', 'Unisex')}
              className="text-[#A0A0A0] hover:text-white transition-colors py-2"
            >
              Unisex
            </button>

            <button
              onClick={() => onNavigate('shop', 'Culture')}
              className="text-[#A0A0A0] hover:text-white transition-colors py-2 flex items-center gap-1"
            >
              <span className="text-amber-400/90 font-semibold">Culture</span>
            </button>

            <button
              onClick={() => onNavigate('custom')}
              className={`transition-colors py-2 relative flex items-center gap-1 ${
                activeView === 'custom' ? 'text-white font-semibold' : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              <span>Custom Tailoring</span>
              {activeView === 'custom' && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-white"></span>
              )}
            </button>

            <button
              onClick={() => onNavigate('track-order')}
              className={`transition-colors py-2 relative flex items-center gap-1 ${
                activeView === 'track-order' ? 'text-white font-semibold' : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              <span>Live Tracking</span>
              {activeView === 'track-order' && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-white"></span>
              )}
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#A0A0A0] hover:text-white hover:bg-[#1C1C1C] rounded-full transition-colors"
              title="Search collection"
            >
              <Search size={18} />
            </button>

            <button
              onClick={onOpenWishlist}
              className="p-2 text-[#A0A0A0] hover:text-white hover:bg-[#1C1C1C] rounded-full transition-colors relative"
              title="Wishlist"
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-white text-black text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenCart}
              className="p-2 text-[#F5F5F5] hover:bg-[#1C1C1C] rounded-full transition-colors relative"
              title="Cart"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-white text-black text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0D0D0D] border-b border-[#2A2A2A] px-6 py-6 animate-fade-in">
            <div className="flex flex-col space-y-4 text-sm uppercase tracking-widest font-medium">
              <button
                onClick={() => {
                  onNavigate('home');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-neutral-300 hover:text-white py-1 flex items-center justify-between"
              >
                <span>Home</span>
                <ArrowRight size={14} className="text-neutral-600" />
              </button>
              <button
                onClick={() => {
                  onNavigate('shop', 'All');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-neutral-300 hover:text-white py-1 flex items-center justify-between"
              >
                <span>All Products</span>
                <ArrowRight size={14} className="text-neutral-600" />
              </button>
              <button
                onClick={() => {
                  onNavigate('shop', 'Men');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-neutral-300 hover:text-white py-1 flex items-center justify-between"
              >
                <span>Men</span>
                <ArrowRight size={14} className="text-neutral-600" />
              </button>
              <button
                onClick={() => {
                  onNavigate('shop', 'Women');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-neutral-300 hover:text-white py-1 flex items-center justify-between"
              >
                <span>Women</span>
                <ArrowRight size={14} className="text-neutral-600" />
              </button>
              <button
                onClick={() => {
                  onNavigate('shop', 'Unisex');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-neutral-300 hover:text-white py-1 flex items-center justify-between"
              >
                <span>Unisex</span>
                <ArrowRight size={14} className="text-neutral-600" />
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
                className="text-left text-neutral-300 hover:text-white py-1 flex items-center justify-between"
              >
                <span>Custom Tailoring Request</span>
                <ArrowRight size={14} className="text-neutral-600" />
              </button>
              <button
                onClick={() => {
                  onNavigate('track-order');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-neutral-300 hover:text-white py-1 flex items-center justify-between"
              >
                <span>Live Order Tracking</span>
                <ArrowRight size={14} className="text-neutral-600" />
              </button>

              <div className="pt-4 border-t border-[#222222]">
                <button
                  onClick={() => {
                    onSwitchRole(currentRole === 'customer' ? 'admin' : 'customer');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded bg-[#1C1C1C] border border-[#2A2A2A] text-xs font-semibold text-neutral-200 flex items-center justify-center gap-2 hover:bg-[#252525]"
                >
                  <ShieldCheck size={16} />
                  <span>
                    Switch to {currentRole === 'customer' ? 'Admin Dashboard' : 'Customer Storefront'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
