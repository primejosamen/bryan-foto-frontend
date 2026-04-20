'use client';

/**
 * Section 3 — About Preview: image on the left (col1), text on the right (col3).
 * Aligned to the main 3-slot grid: 472 | 10 | 472 | 10 | 472
 *
 * @module components/home/HomeAboutPreview
 */

import type { StrapiMedia, StrapiBlock } from '@/models';
import StrapiMediaRenderer from '@/components/ui/StrapiMediaRenderer';
import { renderBlocks } from '@/lib/helpers/rich-text.helpers';
import ScrollReveal from './ScrollReveal';

const SLOT_W = 472;
const SLOT_GAP = 10;
const TOTAL_W = SLOT_W * 3 + SLOT_GAP * 2; // 1436
const IMG_H = 620;

interface Props {
  image: StrapiMedia;
  text: StrapiBlock[];
}

export default function HomeAboutPreview({ image, text }: Props) {
  return (
    <section
      className="w-full flex flex-col gap-6 md:flex-row md:gap-0 md:items-start"
    >
      {/* Col 1: Imagen */}
      <ScrollReveal delay={0} className="md:flex-1 md:basis-0 md:min-w-0">
        <div
          className="group relative w-full overflow-hidden"
          style={{ aspectRatio: `${SLOT_W} / ${IMG_H}` }}
        >
          <StrapiMediaRenderer
            media={image}
            alt="About preview"
            className=""
            sizes="(max-width: 768px) 100vw, 472px"
          />
        </div>
      </ScrollReveal>

      {/* Col 2: Espacio vacío (solo desktop) */}
      <div className="hidden md:block md:flex-1 md:basis-0 md:min-w-0" />

      {/* Col 3: Texto */}
      <ScrollReveal delay={300} className="md:flex-1 md:basis-0 md:min-w-0">
        <div
          className="w-full"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '16px',
            lineHeight: 1.35,
            letterSpacing: '-0.05em',
            color: '#ff0000',
          }}
        >
          {renderBlocks(text)}
        </div>
      </ScrollReveal>
    </section>
  );
}
