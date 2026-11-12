import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Play } from 'lucide-react';
import type { CategoryType } from '../types';

export function FashionHero({ onNavigate }: { onNavigate: (view: string, category?: CategoryType) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlaying = () => setPlaybackBlocked(false);
    const fallbackTimer = window.setTimeout(() => {
      if (video.paused) setPlaybackBlocked(true);
    }, 5000);

    video.addEventListener('playing', handlePlaying);

    return () => {
      window.clearTimeout(fallbackTimer);
      video.removeEventListener('playing', handlePlaying);
    };
  }, []);

  const handleManualPlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    void video.play().then(
      () => setPlaybackBlocked(false),
      () => setPlaybackBlocked(true),
    );
  };

  return (
    <section className="monve-hero" aria-label="Monvé collection introduction">
      <div className="monve-hero-media">
        <video ref={videoRef} className="monve-hero-video" autoPlay muted loop playsInline preload="auto" poster="/media/monve-hero-poster.jpg" tabIndex={-1} aria-hidden="true">
          <source src="/media/monve-hero.mp4" type="video/mp4" />
        </video>
        <div className="monve-hero-overlay" />
        {playbackBlocked && (
          <button className="monve-hero-playback" type="button" onClick={handleManualPlayback}>
            <Play size={14} aria-hidden="true" />
            Play film
          </button>
        )}
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
