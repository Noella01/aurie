import { ArrowUpRight, ArrowDown } from 'lucide-react';
import type { CategoryType } from '../types';

// Set this to the customer's campaign photo once supplied.
const campaignBackground = '';

export function FashionHero({ onNavigate }: { onNavigate: (view: string, category?: CategoryType) => void }) {
  return (
    <section className={`fashion-hero${campaignBackground ? ' fashion-hero-with-photo' : ''}`}
      style={campaignBackground ? { backgroundImage: `url("${campaignBackground}")` } : undefined}
      aria-labelledby="fashion-hero-title">
      <div className="fashion-hero-grid" aria-hidden="true" />
      <div className="fashion-hero-heading">
        <p className="fashion-eyebrow">CONTEMPORARY FORM. CULTURAL SOUL.</p>
        <h1 id="fashion-hero-title">STYLE<br />WITH NO<br />LIMITS<span>.</span></h1>
        <p className="fashion-intro">Rooted in Rwanda.<br />Designed for wherever you go.</p>
      </div>

      <div className="fashion-hero-aside">
        <span className="fashion-index">01 / THE LENO’S EDIT</span>
        <p>A NEW PERSPECTIVE<br />ON EVERYDAY FORM.<br />MADE FOR THE<br />LIMITLESS YOU.</p>
        <button className="fashion-explore" onClick={() => onNavigate('shop', 'All')}>
          <span className="fashion-explore-icon"><ArrowUpRight size={23} /></span>
          <span>Explore collection</span>
        </button>
      </div>

      <div className="fashion-wordmark" aria-hidden="true">LENO’S</div>
      <div className="fashion-hero-bottom">
        <div className="fashion-shopping" aria-label="Shop by collection">
          <button onClick={() => onNavigate('shop', 'Men')}>Shop men <ArrowUpRight size={14} /></button>
          <button onClick={() => onNavigate('shop', 'Women')}>Shop women <ArrowUpRight size={14} /></button>
          <button onClick={() => onNavigate('shop', 'Culture')}>Explore culture <ArrowUpRight size={14} /></button>
        </div>
        <span className="fashion-scroll">SCROLL TO DISCOVER <ArrowDown size={14} /></span>
      </div>
    </section>
  );
}
