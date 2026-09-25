import React from 'react';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { CategoryType } from '../types';

interface FooterProps {
  onNavigate: (view: string, cat?: CategoryType) => void;
  onSwitchRole: (role: 'customer' | 'admin') => void;
  currentRole: 'customer' | 'admin';
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSwitchRole, currentRole }) => {
  return (
    <footer className="bg-[#050505] border-t border-[#1F1F1F] text-[#A0A0A0] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Manifesto */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <span className="font-heading text-2xl font-bold tracking-[0.25em] text-[#F5F5F5] block">
                LENO’S
              </span>
              <span className="text-[10px] tracking-[0.35em] uppercase text-neutral-400 font-light block mt-1">
                Style With No Limits.
              </span>
            </div>

            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed font-light">
              LENO’S is a contemporary unisex fashion brand founded in Rwanda, combining modern bespoke silhouettes, architectural tailoring, and Rwandan cultural wear reinterpreted for the world.
            </p>

            <div className="pt-2 flex items-center gap-3 text-[11px] text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Kigali Atelier · Worldwide & Rwanda Dispatch</span>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-[#F5F5F5] font-semibold mb-4">
              Shop Collection
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('shop', 'Men')}
                  className="hover:text-white transition-colors"
                >
                  Men
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', 'Women')}
                  className="hover:text-white transition-colors"
                >
                  Women
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', 'Unisex')}
                  className="hover:text-white transition-colors"
                >
                  Unisex
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', 'Culture')}
                  className="hover:text-white transition-colors text-amber-400/90"
                >
                  Traditional / Culture
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('custom')}
                  className="hover:text-white transition-colors"
                >
                  Custom Made Tailoring
                </button>
              </li>
            </ul>
          </div>

          {/* Client Experience */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-[#F5F5F5] font-semibold mb-4">
              Client Care
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('track-order')}
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Real-Time Order Tracking</span>
                  <ArrowUpRight size={12} />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('custom')}
                  className="hover:text-white transition-colors"
                >
                  Bespoke Consultation
                </button>
              </li>
              <li>
                <span className="text-neutral-500">Kigali Delivery Guidelines</span>
              </li>
              <li>
                <span className="text-neutral-500">Flutterwave Payment Security</span>
              </li>
              <li>
                <span className="text-neutral-500">Size & Fitting Guide</span>
              </li>
            </ul>
          </div>

          {/* Social & Admin Portal */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-[#F5F5F5] font-semibold mb-4">
              Connect & Admin
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="#instagram"
                  onClick={(e) => e.preventDefault()}
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Instagram</span>
                  <ArrowUpRight size={12} />
                </a>
              </li>
              <li>
                <a
                  href="#tiktok"
                  onClick={(e) => e.preventDefault()}
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>TikTok</span>
                  <ArrowUpRight size={12} />
                </a>
              </li>
              <li className="pt-3 border-t border-[#1F1F1F]">
                <button
                  onClick={() => onSwitchRole(currentRole === 'customer' ? 'admin' : 'customer')}
                  className="flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors text-xs"
                >
                  <ShieldCheck size={14} className="text-amber-400" />
                  <span>
                    {currentRole === 'customer' ? 'Open Admin Portal (/admin)' : 'Customer Storefront (/)'}
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and legal */}
        <div className="mt-14 pt-8 border-t border-[#1A1A1A] flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-4">
          <div>
            © 2026 LENO’S — All Rights Reserved. Kigali, Rwanda.
          </div>
          <div className="flex items-center gap-6">
            <span>Powered by Flutterwave RWF Gateway</span>
            <span>·</span>
            <span>Style With No Limits</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
