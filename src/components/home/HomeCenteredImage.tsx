'use client';

/**
 * Section 4 — Centered Image: aligned to the middle slot (col2) of the 3-slot grid.
 * Grid: col1(472) | gap(10) | col2(472) | gap(10) | col3(472)
 *
 * @module components/home/HomeCenteredImage
 */

import type { StrapiMedia } from '@/models';
import StrapiMediaRenderer from '@/components/ui/StrapiMediaRenderer';
import ScrollReveal from './ScrollReveal';

const SLOT_W = 472;
const SLOT_GAP = 10;
const TOTAL_W = SLOT_W * 3 + SLOT_GAP * 2; // 1436
const LEFT_OFFSET = SLOT_W + SLOT_GAP; // 482px — start of col2
const IMG_H = 480;

interface Props {
  image: StrapiMedia;
}

export default function HomeCenteredImage({ image }: Props) {
  return (
    <section
      className="w-full px-4 md:px-0"
      style={{ maxWidth: `${TOTAL_W}px` }}
    >
      <ScrollReveal>
        <div
          className="group relative w-full overflow-hidden md:w-[472px] md:ml-[482px]"
          style={{ aspectRatio: `${SLOT_W} / ${IMG_H}` }}
        >
          <StrapiMediaRenderer
            media={image}
            alt="Centered feature"
            className=""
            sizes="(max-width: 768px) 100vw, 472px"
          />
        </div>
      </ScrollReveal>
    </section>
  );
}
