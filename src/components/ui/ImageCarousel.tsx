'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { StrapiMedia } from '@/models';
import StrapiMediaRenderer from '@/components/ui/StrapiMediaRenderer';
import GlassChevron from '@/components/ui/GlassChevron';
import { getOptimizedImageUrl } from '@/lib/helpers/image.helpers';

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
  const [direction, setDirection] = useState(0); // -1 prev, 1 next

  const hasMultiple = images.length > 1;

  // Preload adjacent images so transitions are instant
  useEffect(() => {
    if (!hasMultiple) return;
    const adjacentIndices = [
      (idx + 1) % images.length,
      (idx - 1 + images.length) % images.length,
    ];
    adjacentIndices.forEach((i) => {
      const img = new window.Image();
      img.src = getOptimizedImageUrl(images[i], 1200);
    });
  }, [idx, images, hasMultiple]);

  const prev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setDirection(-1);
      setIdx((i) => (i === 0 ? images.length - 1 : i - 1));
    },
    [images.length],
  );

  const next = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setDirection(1);
      setIdx((i) => (i === images.length - 1 ? 0 : i + 1));
    },
    [images.length],
  );

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
  };

  return (
    <div className="relative w-full h-full">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={images[idx].id ?? idx}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <StrapiMediaRenderer
            media={images[idx]}
            alt={`${alt} — ${idx + 1}`}
            className=""
            sizes={sizes}
            quality={quality}
          />
        </motion.div>
      </AnimatePresence>

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
