'use client';

/**
 * Section 3 — About Preview: image on the left (col1), text on the right (col3).
 * Aligned to the main 3-slot grid: 472 | 10 | 472 | 10 | 472
 *
 * @module components/home/HomeAboutPreview
 */

import Image from 'next/image';
import type { StrapiImage, StrapiBlock } from '@/models';
import { getStrapiImageUrl } from '@/lib/helpers/image.helpers';
import { renderBlocks } from '@/lib/helpers/rich-text.helpers';
import ScrollReveal from './ScrollReveal';

const SLOT_W = 472;
const SLOT_GAP = 10;
const TOTAL_W = SLOT_W * 3 + SLOT_GAP * 2; // 1436
const IMG_H = 620;

interface Props {
  image: StrapiImage;
  text: StrapiBlock[];
}

export default function HomeAboutPreview({ image, text }: Props) {
  return (
    <section
      className="w-full flex flex-col gap-6 px-4 md:px-0 md:flex-row md:gap-0 md:items-start"
      style={{ maxWidth: `${TOTAL_W}px` }}
    >
      {/* Col 1: Imagen */}
      <ScrollReveal delay={0}>
        <div
          className="relative w-full overflow-hidden md:w-[472px] md:shrink-0"
          style={{ aspectRatio: `${SLOT_W} / ${IMG_H}` }}
        >
          <Image
            src={getStrapiImageUrl(image)}
            alt="About preview"
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 472px"
            quality={100}
          />
        </div>
      </ScrollReveal>

      {/* Col 2: Espacio vacío (solo desktop) */}
      <div className="hidden md:block md:shrink-0" style={{ width: `${SLOT_GAP + SLOT_W + SLOT_GAP}px` }} />

      {/* Col 3: Texto */}
      <ScrollReveal delay={300}>
        <div
          className="w-full md:w-[472px]"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '16px',
            lineHeight: 1.35,
            letterSpacing: '-0.05em',
            color: '#ff0000',
            paddingTop: '60px',
          }}
        >
          {renderBlocks(text)}
        </div>
      </ScrollReveal>
    </section>
  );
}
