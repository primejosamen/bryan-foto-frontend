'use client';

import { useState, useCallback, useMemo } from 'react';
import type { StrapiMedia } from '@/models';
import StrapiMediaRenderer from '@/components/ui/StrapiMediaRenderer';
import GlassChevron from '@/components/ui/GlassChevron';

interface Props {
  images: StrapiMedia | StrapiMedia[];
  alt: string;
  sizes: string;
  quality?: number;
}

/** Normalise single-or-array into a guaranteed array. */
function normalizeImages(input: StrapiMedia | StrapiMedia[]): StrapiMedia[] {
  return Array.isArray(input) ? input : [input];
}

export default function ImageCarousel({
  images: raw,
  alt,
  sizes,
  quality = 100,
}: Props) {
  const images = normalizeImages(raw);
  const [idx, setIdx] = useState(0);

  const hasMultiple = images.length > 1;

  const prev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIdx((i) => (i === 0 ? images.length - 1 : i - 1));
    },
    [images.length],
  );

  const next = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIdx((i) => (i === images.length - 1 ? 0 : i + 1));
    },
    [images.length],
  );

  /* Only mount active image + immediate neighbours for pre-warm */
  const visibleIndices = useMemo(() => {
    const set = new Set<number>();
    set.add(idx);
    if (hasMultiple) {
      set.add((idx - 1 + images.length) % images.length);
      set.add((idx + 1) % images.length);
    }
    return set;
  }, [idx, images.length, hasMultiple]);

  return (
    <div className="relative w-full h-full">
      {/* Only mount active + neighbours — active gets opacity 1 */}
      {images.map((img, i) => {
        if (!visibleIndices.has(i)) return null;
        return (
          <div
            key={img.id ?? i}
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: i === idx ? 1 : 0,
              zIndex: i === idx ? 2 : 1,
            }}
          >
            <StrapiMediaRenderer
              media={img}
              alt={`${alt} — ${i + 1}`}
              className=""
              sizes={sizes}
              quality={quality}
            />
          </div>
        );
      })}

      {hasMultiple && (
        <>
          {/* Left arrow */}
          <button
            type="button"
            onClick={prev}
            aria-label="Imagen anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-auto"
          >
            <div className="relative w-9 h-9">
              <GlassChevron direction="left" />
            </div>
          </button>

          {/* Right arrow */}
          <button
            type="button"
            onClick={next}
            aria-label="Siguiente imagen"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-auto"
          >
            <div className="relative w-9 h-9">
              <GlassChevron direction="right" />
            </div>
          </button>
        </>
      )}
    </div>
  );
}
