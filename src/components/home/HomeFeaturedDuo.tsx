'use client';

/**
 * Section 2 — Featured Duo: 2 large images side by side.
 * Each image takes roughly half the total width.
 * Supports multiple images per side with arrow carousel.
 *
 * @module components/home/HomeFeaturedDuo
 */

import type { StrapiMedia } from '@/models';
import ScrollReveal from './ScrollReveal';
import ImageCarousel from '@/components/ui/ImageCarousel';

const TOTAL_W = 1436;
const GAP = 10;
const HALF_W = (TOTAL_W - GAP) / 2; // 713
const IMG_H = 860;

interface Props {
  imageLeft: StrapiMedia | StrapiMedia[];
  imageRight: StrapiMedia | StrapiMedia[];
}

export default function HomeFeaturedDuo({ imageLeft, imageRight }: Props) {
  return (
    <section
      className="w-full flex flex-col gap-2 px-4 md:px-0 md:flex-row md:gap-2.5"
      style={{ maxWidth: `${TOTAL_W}px` }}
    >
      <ScrollReveal delay={0} className="md:flex-1 md:basis-0 md:min-w-0">
        <div
          className="group relative w-full overflow-hidden"
          style={{ aspectRatio: `${HALF_W} / ${IMG_H}` }}
        >
          <ImageCarousel
            images={imageLeft}
            alt="Featured left"
            sizes="(max-width: 768px) 100vw, 713px"
          />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200} className="md:flex-1 md:basis-0 md:min-w-0">
        <div
          className="group relative w-full overflow-hidden"
          style={{ aspectRatio: `${HALF_W} / ${IMG_H}` }}
        >
          <ImageCarousel
            images={imageRight}
            alt="Featured right"
            sizes="(max-width: 768px) 100vw, 713px"
          />
        </div>
      </ScrollReveal>
    </section>
  );
}
