import { useEffect, useRef } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { CategoryType } from '../types';

export function FashionHero({ onNavigate }: { onNavigate: (view: string, category?: CategoryType) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersDataSaving = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    const syncPlayback = () => {
      if (motionPreference.matches || prefersDataSaving) {
        video.pause();
        return;
      }
      void video.play().catch(() => undefined);
    };

    syncPlayback();
    motionPreference.addEventListener?.('change', syncPlayback);
    return () => motionPreference.removeEventListener?.('change', syncPlayback);
  }, []);

  return (
    <section className="monve-hero" aria-label="Monvé collection introduction">
      <div className="monve-hero-media" aria-hidden="true">
        <video ref={videoRef} className="monve-hero-video" muted loop playsInline preload="metadata" tabIndex={-1}>
          <source src="/media/monve-hero.mp4" type="video/mp4" />
        </video>
        <div className="monve-hero-overlay" />
      </div>
      <div className="monve-hero-copy">
        <p className="monve-hero-description">Contemporary silhouettes. <span>Cultural soul.</span><br />Pieces made to feel like you.</p>
        <div className="monve-hero-actions">
          <button className="monve-button" onClick={() => onNavigate('shop', 'All')}>Shop the edit <ArrowUpRight size={15} /></button>
          <button className="monve-text-link" onClick={() => onNavigate('custom')}>Create a custom piece <ArrowRight size={14} /></button>
        </div>
      </div>
    </section>
  );
}
