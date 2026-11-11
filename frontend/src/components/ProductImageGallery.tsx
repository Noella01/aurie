import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../types';

type Props = {
  product: Pick<Product, 'name' | 'category' | 'subcategory' | 'image_url' | 'image_urls'>;
  onActivate?: () => void;
  className?: string;
};

export function productImages(product: Pick<Product, 'image_url' | 'image_urls'>): string[] {
  return Array.from(new Set([product.image_url, ...(product.image_urls || [])]
    .map(url => url?.trim())
    .filter((url): url is string => Boolean(url)))).slice(0, 7);
}

export function ProductImageGallery({ product, onActivate, className = '' }: Props) {
  const images = productImages(product);
  const sourceKey = images.join('\u0000');
  const [index, setIndex] = useState(0);
  const touchStart = useRef<number | null>(null);

  useEffect(() => setIndex(0), [sourceKey]);

  const move = (direction: number) => {
    if (images.length < 2) return;
    setIndex(current => (current + direction + images.length) % images.length);
  };

  const image = images[index]
    ? <img src={images[index]} alt={`${product.name}, image ${index + 1} of ${images.length}`} draggable={false} />
    : <div className={`monve-editorial-cover monve-editorial-cover--${product.category.toLowerCase()}`} role="img" aria-label={`${product.name}, ${product.category} ${product.subcategory}`}>
        <span className="monve-editorial-cover-index">MONVÉ / SELECTED PIECE</span>
        <span className="monve-editorial-cover-shape" aria-hidden="true" />
        <span className="monve-editorial-cover-copy"><small>{product.category} / {product.subcategory}</small><strong>{product.name}</strong></span>
        <span className="monve-editorial-cover-signature">ART OF ELEGANCE</span>
      </div>;

  return (
    <div
      className={`monve-gallery ${className}`}
      onTouchStart={event => { touchStart.current = event.changedTouches[0]?.clientX ?? null; }}
      onTouchEnd={event => {
        const start = touchStart.current;
        const end = event.changedTouches[0]?.clientX;
        touchStart.current = null;
        if (start !== null && end !== undefined && Math.abs(end - start) > 42) move(end < start ? 1 : -1);
      }}
      onKeyDown={event => {
        if (event.key === 'ArrowRight') move(1);
        if (event.key === 'ArrowLeft') move(-1);
      }}
    >
      {onActivate
        ? <button type="button" className="monve-gallery-main" onClick={onActivate} aria-label={`View ${product.name}`}>{image}</button>
        : <div className="monve-gallery-main">{image}</div>}
      {images.length > 1 && <>
        <button type="button" className="monve-gallery-arrow monve-gallery-previous" aria-label="Previous image" onClick={() => move(-1)}><ChevronLeft size={17} /></button>
        <button type="button" className="monve-gallery-arrow monve-gallery-next" aria-label="Next image" onClick={() => move(1)}><ChevronRight size={17} /></button>
        <span className="monve-gallery-count" aria-live="polite">{index + 1} / {images.length}</span>
        <div className="monve-gallery-dots" aria-label="Choose product image">
          {images.map((_, imageIndex) => <button key={imageIndex} type="button" aria-label={`Show image ${imageIndex + 1}`} aria-current={index === imageIndex ? 'true' : undefined} onClick={() => setIndex(imageIndex)} />)}
        </div>
      </>}
    </div>
  );
}
