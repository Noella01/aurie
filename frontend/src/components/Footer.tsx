import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { CategoryType } from '../types';
import { MonveMark } from './MonveMark';
interface FooterProps {
  onNavigate: (view: string, cat?: CategoryType) => void;
}
export const Footer: React.FC<FooterProps> = ({ onNavigate }) => (
  <footer className="monve-footer">
    <div className="monve-footer-top">
      <div className="monve-footer-manifesto">
        <div className="monve-footer-signature">
          <div className="monve-footer-brand"><MonveMark className="monve-footer-mark" /></div>
          <p className="monve-eyebrow">STYLE WITH NO LIMITS.</p>
        </div>
        <h2>Wear what moves you.</h2>
        <p>Contemporary form. Cultural soul. From Kigali, Rwanda.</p>
      </div>
      <div className="monve-footer-links">
        <h3>Explore</h3>
        {(['Men', 'Women', 'Unisex', 'Culture'] as CategoryType[]).map(category => <button key={category} onClick={() => onNavigate('shop', category)}>{category}<ArrowUpRight size={12} /></button>)}
      </div>
      <div className="monve-footer-links">
        <h3>Made personal</h3>
        <button onClick={() => onNavigate('custom')}>Customs<ArrowUpRight size={12} /></button>
        <button onClick={() => onNavigate('account')}>My account<ArrowUpRight size={12} /></button>
        <button onClick={() => onNavigate('account')}>My orders<ArrowUpRight size={12} /></button>
        <button onClick={() => onNavigate('signup')}>Join Monvé<ArrowUpRight size={12} /></button>
      </div>
    </div>
    <div className="monve-footer-bottom"><span>© {new Date().getFullYear()} MONVÉ. ALL RIGHTS RESERVED.</span><span>KIGALI, RWANDA</span></div>
  </footer>
);
