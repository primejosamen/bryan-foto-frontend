'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import type { StrapiImage } from '@/models';
import { getStrapiImageUrl } from '@/lib/helpers/image.helpers';

interface Props {
  images: StrapiImage | StrapiImage[];
  alt: string;
  sizes: string;
  quality?: number;
}

/** Normalise single-or-array into a guaranteed array. */
function normalizeImages(input: StrapiImage | StrapiImage[]): StrapiImage[] {
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
          <Image
            src={getStrapiImageUrl(images[idx])}
            alt={`${alt} — ${idx + 1}`}
            fill
            style={{ objectFit: 'cover' }}
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
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 text-red-500 transition-colors hover:text-red-700 cursor-pointer"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Right arrow */}
          <button
            type="button"
            onClick={next}
            aria-label="Siguiente imagen"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 text-red-500 transition-colors hover:text-red-700 cursor-pointer"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
