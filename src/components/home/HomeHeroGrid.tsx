'use client';

/**
 * Section 1 — Hero Grid: 3 individual images in a row.
 * Each image is a separate Strapi field for independent control.
 *
 * @module components/home/HomeHeroGrid
 */

import type { StrapiMedia } from '@/models';
import StrapiMediaRenderer from '@/components/ui/StrapiMediaRenderer';
import ScrollReveal from './ScrollReveal';

const SLOT_W = 472;
const GAP = 10;
const IMG_H = 320;
const TOTAL_W = SLOT_W * 3 + GAP * 2; // 1436

interface Props {
  image1: StrapiMedia;
  image2: StrapiMedia;
  image3: StrapiMedia;
}

export default function HomeHeroGrid({ image1, image2, image3 }: Props) {
  const images = [image1, image2, image3];

  return (
    <section
      className="w-full flex flex-col gap-2.5 md:flex-row md:gap-2.5"
    >
      {images.map((img, i) => (
        <ScrollReveal key={i} delay={i * 150} className="md:flex-1 md:basis-0 md:min-w-0">
          <div
            className="group relative w-full overflow-hidden"
            style={{ aspectRatio: `${SLOT_W} / ${IMG_H}` }}
          >
            <StrapiMediaRenderer
              media={img}
              alt={`Hero ${i + 1}`}
              className=""
              sizes="(max-width: 800px) 100vw, 472px"
            />
          </div>
        </ScrollReveal>
      ))}
    </section>
  );
}
