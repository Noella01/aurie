import React from 'react';
import { ArrowRight, Sparkles, Compass, Shield, Scissors } from 'lucide-react';
import { Product, CategoryType, ProductColor } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ImagePlaceholder } from '../components/ImagePlaceholder';

interface HomeViewProps {
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product, size: string, color: ProductColor) => void;
  onNavigate: (view: string, cat?: CategoryType) => void;
  onUpdateProductImage?: (productId: string, imageUrl: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  wishlistIds,
  onToggleWishlist,
  onQuickView,
  onSelectProduct,
  onAddToCart,
  onNavigate,
  onUpdateProductImage
}) => {
  const newArrivals = products.filter((p) => p.is_new_arrival).slice(0, 4);

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Large Fashion Hero Banner */}
      <section className="relative min-h-[82vh] flex items-center justify-center bg-[#070707] border-b border-[#222222] overflow-hidden px-4">
        {/* Architectural grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#222222_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 py-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#2E2E2E] bg-[#111111]/80 backdrop-blur-sm text-[10px] uppercase tracking-[0.25em] text-neutral-300">
            <Sparkles size={12} className="text-amber-400" />
            <span>RWANDA ATELIER · 2026 COLLECTION</span>
          </div>

          <div className="space-y-4">
            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-bold tracking-[0.15em] text-[#F5F5F5] uppercase leading-tight">
              STYLE WITH NO LIMITS
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto font-light tracking-wide leading-relaxed">
              Where contemporary tailoring converges with Rwandan cultural heritage. High-concept silhouettes crafted for men, women, and the limitless expression of identity.
            </p>
          </div>

          {/* Three Strong CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
            <button
              onClick={() => onNavigate('shop', 'Men')}
              className="bg-white hover:bg-neutral-200 text-black px-6 sm:px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 hover:shadow-lg hover:shadow-white/10"
            >
              Shop Men
            </button>
            <button
              onClick={() => onNavigate('shop', 'Women')}
              className="bg-transparent hover:bg-white hover:text-black text-white border border-[#404040] hover:border-white px-6 sm:px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300"
            >
              Shop Women
            </button>
            <button
              onClick={() => onNavigate('shop', 'Culture')}
              className="bg-[#1C1C1C] hover:bg-amber-400 hover:text-black text-amber-300 border border-amber-500/30 px-6 sm:px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 flex items-center gap-2"
            >
              <span>Explore Culture</span>
              <Compass size={14} />
            </button>
          </div>
        </div>

        {/* Bottom subtle scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-neutral-600 flex flex-col items-center gap-1 text-[9px] uppercase tracking-widest pointer-events-none">
          <span>Scroll to explore</span>
          <div className="w-[1px] h-6 bg-gradient-to-b from-neutral-600 to-transparent" />
        </div>
      </section>

      {/* 2. Explore LENO’S — Three Entry Points: Men, Women, Culture */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#888888] font-semibold">
            THE ARCHITECTURE OF IDENTITY
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-1">
            EXPLORE THE HOUSES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Men Block */}
          <div
            onClick={() => onNavigate('shop', 'Men')}
            className="group cursor-pointer bg-[#141414] border border-[#242424] hover:border-neutral-500 transition-all p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">01 · COLLECTION</span>
                <ArrowRight size={16} className="text-neutral-500 group-hover:text-white transition-colors group-hover:translate-x-1" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-white mb-2">MEN</h3>
              <p className="text-xs text-neutral-400 font-light mb-6">
                Sharp blazers, poplin shirts, architectural pleated trousers, and custom jackets designed with confident minimalism.
              </p>
            </div>
            <div className="mt-4">
              <ImagePlaceholder
                alt="LENO’S Men Collection"
                category="MEN"
                aspectRatio="square"
                allowEdit={false}
              />
              <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-neutral-300 group-hover:text-white flex items-center gap-2">
                <span>View Men's Collection</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>

          {/* Women Block */}
          <div
            onClick={() => onNavigate('shop', 'Women')}
            className="group cursor-pointer bg-[#141414] border border-[#242424] hover:border-neutral-500 transition-all p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">02 · COLLECTION</span>
                <ArrowRight size={16} className="text-neutral-500 group-hover:text-white transition-colors group-hover:translate-x-1" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-white mb-2">WOMEN</h3>
              <p className="text-xs text-neutral-400 font-light mb-6">
                Sculptural evening gowns, drape tops, fluid tailored trousers, and empowering modern silhouettes.
              </p>
            </div>
            <div className="mt-4">
              <ImagePlaceholder
                alt="LENO’S Women Collection"
                category="WOMEN"
                aspectRatio="square"
                allowEdit={false}
              />
              <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-neutral-300 group-hover:text-white flex items-center gap-2">
                <span>View Women's Collection</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>

          {/* Culture Block */}
          <div
            onClick={() => onNavigate('shop', 'Culture')}
            className="group cursor-pointer bg-[#171512] border border-amber-900/30 hover:border-amber-500/60 transition-all p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] uppercase tracking-[0.25em] text-amber-400 font-semibold">03 · HERITAGE</span>
                <ArrowRight size={16} className="text-amber-500 group-hover:text-amber-300 transition-colors group-hover:translate-x-1" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-amber-200 mb-2">CULTURE</h3>
              <p className="text-xs text-neutral-400 font-light mb-6">
                Rwandan traditional wear, modern Umushanana ensembles, Imigongo embroidery, and bespoke ceremonial wear.
              </p>
            </div>
            <div className="mt-4">
              <ImagePlaceholder
                alt="LENO’S Cultural Collection"
                category="RWANDA × LENO'S"
                aspectRatio="square"
                allowEdit={false}
              />
              <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-amber-400 group-hover:text-amber-300 flex items-center gap-2">
                <span>Explore Cultural Wear</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. New Arrivals Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-[#222222]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#888888] font-semibold">
              KIGALI ATELIER RELEASES
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-1">
              NEW ARRIVALS
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop', 'All')}
            className="mt-3 sm:mt-0 text-xs uppercase tracking-widest text-neutral-400 hover:text-white flex items-center gap-2 transition-colors font-medium"
          >
            <span>View All Pieces</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
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
      </section>

      {/* 4. Culture Section: Rwanda × LENO’S */}
      <section className="bg-[#111111] border-y border-[#262626] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-950/40 border border-amber-800/50 text-[10px] uppercase tracking-[0.2em] text-amber-300 font-semibold">
                <span>RWANDA × LENO’S</span>
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-wide">
                HERITAGE REINTERPRETED THROUGH CONTEMPORARY FORM
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
                At LENO’S, our roots in Rwanda are not merely an inspiration — they are our structural blueprint. From the fluid grace of the <em>Umushanana</em> to the rhythmic geometry of historic <em>Imigongo</em> patterns, we translate ceremonial elegance into sharp, gender-neutral sartorial mastery.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-[#181818] border border-[#2B2B2B]">
                  <div className="text-amber-400 font-bold font-heading text-xl">100%</div>
                  <div className="text-[11px] text-neutral-400 mt-1 uppercase tracking-wider">
                    Rwandan Atelier Tailoring
                  </div>
                </div>
                <div className="p-4 bg-[#181818] border border-[#2B2B2B]">
                  <div className="text-white font-bold font-heading text-xl">RWF</div>
                  <div className="text-[11px] text-neutral-400 mt-1 uppercase tracking-wider">
                    Flutterwave MoMo & Card
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('shop', 'Culture')}
                  className="bg-white hover:bg-neutral-200 text-black px-6 py-3 text-xs uppercase tracking-[0.2em] font-semibold transition-colors"
                >
                  Discover Cultural Pieces
                </button>
              </div>
            </div>

            {/* Cultural visual placeholder frame */}
            <div className="relative">
              <div className="p-2 border border-[#2E2E2E] bg-[#161616]">
                <ImagePlaceholder
                  alt="Umushanana and Rwandan Heritage"
                  category="RWANDAN ATELIER"
                  aspectRatio="portrait"
                  allowEdit={false}
                  className="w-full"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-[#0A0A0A] border border-[#333333] p-4 hidden sm:block max-w-xs">
                <p className="text-[10px] tracking-widest uppercase text-neutral-400">
                  CEREMONIAL & BESPOKE
                </p>
                <p className="text-xs font-semibold text-white mt-1">
                  Wedding ensembles, Gusaba attire, and dignitary garments tailored to your exact measurements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Custom Clothing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#171717] to-[#0D0D0D] border border-[#2A2A2A] p-8 sm:p-14 relative overflow-hidden">
          <div className="max-w-2xl space-y-5 relative z-10">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-neutral-400">
              <Scissors size={14} className="text-neutral-300" />
              <span>BESPOKE SARTORIAL SERVICE</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-wide">
              CUSTOM MADE FOR YOUR OCCASION
            </h2>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
              Have a unique vision for an upcoming wedding, gala, or personal wardrobe piece? Work directly with our Kigali master tailors. Submit your measurements, choose your preferred fabrics, and track the entire production pipeline.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => onNavigate('custom')}
                className="bg-white hover:bg-neutral-200 text-black px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-bold transition-colors flex items-center gap-2"
              >
                <span>Request Custom Clothing</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => onNavigate('track-order')}
                className="bg-[#242424] hover:bg-[#303030] text-neutral-200 px-6 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold transition-colors"
              >
                Track Existing Request
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. About LENO’S & Core Philosophy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-t border-[#222222]">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full border border-[#333333] flex items-center justify-center text-white mb-3">
              <Shield size={18} />
            </div>
            <h4 className="font-heading text-sm font-bold text-white tracking-wider uppercase">
              Dark & Editorial Aesthetic
            </h4>
            <p className="text-xs text-neutral-400 font-light leading-relaxed">
              Fashion label first, store second. Pure focus on fabric, cut, and silhouette without visual noise or excessive decorative clutter.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full border border-[#333333] flex items-center justify-center text-white mb-3">
              <Scissors size={18} />
            </div>
            <h4 className="font-heading text-sm font-bold text-white tracking-wider uppercase">
              Gender-Neutral Freedom
            </h4>
            <p className="text-xs text-neutral-400 font-light leading-relaxed">
              Unisex cuts engineered for both men and women with adjustable drape, boxy geometry, and effortless ease of wear.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full border border-[#333333] flex items-center justify-center text-white mb-3">
              <Sparkles size={18} />
            </div>
            <h4 className="font-heading text-sm font-bold text-white tracking-wider uppercase">
              Live Order Engine
            </h4>
            <p className="text-xs text-neutral-400 font-light leading-relaxed">
              Full real-time visibility from Kigali atelier cutting table to courier delivery right at your door via seamless live updates.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
