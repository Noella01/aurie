import { ArrowUpRight } from 'lucide-react';
import type { CategoryType } from '../types';

export function FashionHero({ onNavigate }: { onNavigate: (view: string, category?: CategoryType) => void }) {
  return (
    <section className="aurie-hero" aria-labelledby="aurie-hero-title">
      <p className="aurie-hero-note">FASHION<br />THAT MOVES<br />WITH YOU.<span /></p>
      <h1 id="aurie-hero-title" className="aurie-hero-wordmark">AURIE</h1>
      <div className="aurie-hero-shadow" aria-hidden="true" />
      <img className="aurie-hero-model" src="/images/aurie-hero.png" alt="Aurie campaign: an oversized coat and relaxed tailoring in motion" fetchPriority="high" width="1024" height="1536" />
      <div className="aurie-hero-actions">
        <button className="aurie-button" onClick={() => onNavigate('shop', 'All')}>Shop now <ArrowUpRight size={15} /></button>
        <a className="aurie-text-link" href="#new-season">Explore the new <ArrowUpRight size={14} /></a>
      </div>
      <p className="aurie-hero-edition">THE NEW<br />PERSPECTIVE<br /><span>COLLECTION — 01</span></p>
    </section>
  );
}
