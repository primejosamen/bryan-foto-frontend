'use client';

/**
 * Section 6 — Bottom Hero: a large full-width image at the bottom of the page.
 * Supports multiple images with arrow carousel.
 *
 * @module components/home/HomeBottomHero
 */

import type { StrapiImage } from '@/models';
import ScrollReveal from './ScrollReveal';
import ImageCarousel from '@/components/ui/ImageCarousel';

const TOTAL_W = 1436;
const IMG_H = 900;

interface Props {
  image: StrapiImage | StrapiImage[];
}

export default function HomeBottomHero({ image }: Props) {
  return (
    <section
      className="w-full px-4 md:px-0"
      style={{ maxWidth: `${TOTAL_W}px` }}
    >
      <ScrollReveal>
        <div
          className="group relative w-full overflow-hidden"
          style={{ aspectRatio: `${TOTAL_W} / ${IMG_H}` }}
        >
          <ImageCarousel
            images={image}
            alt="Bottom hero"
            sizes="(max-width: 768px) 100vw, 1436px"
          />
        </div>
      </ScrollReveal>
    </section>
  );
}
