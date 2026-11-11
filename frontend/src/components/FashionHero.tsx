import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { CategoryType } from '../types';

export function FashionHero({ onNavigate }: { onNavigate: (view: string, category?: CategoryType) => void }) {
  return (
    <section className="monve-hero">
      <div className="monve-hero-copy">
        <p className="monve-hero-description">Contemporary silhouettes. Cultural soul.<br />Pieces made to feel like you.</p>
        <div className="monve-hero-actions">
          <button className="monve-button" onClick={() => onNavigate('shop', 'All')}>Shop the edit <ArrowUpRight size={15} /></button>
          <button className="monve-text-link" onClick={() => onNavigate('custom')}>Create a custom piece <ArrowRight size={14} /></button>
        </div>
      </div>
    </section>
  );
}
