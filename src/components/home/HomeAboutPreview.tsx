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
      style={{
        width: `${TOTAL_W}px`,
        display: 'flex',
        alignItems: 'flex-start',
      }}
    >
      {/* Col 1: Imagen (472px) */}
      <ScrollReveal delay={0}>
        <div
          style={{
            width: `${SLOT_W}px`,
            height: `${IMG_H}px`,
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <Image
            src={getStrapiImageUrl(image)}
            alt="About preview"
            fill
            style={{ objectFit: 'cover' }}
            sizes={`${SLOT_W}px`}
            quality={100}
          />
        </div>
      </ScrollReveal>

      {/* Col 2: Espacio vacío (gap + 472 + gap = 492px) */}
      <div style={{ width: `${SLOT_GAP + SLOT_W + SLOT_GAP}px`, flexShrink: 0 }} />

      {/* Col 3: Texto (472px) */}
      <ScrollReveal delay={300}>
        <div
          style={{
            width: `${SLOT_W}px`,
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '15px',
            lineHeight: 1.7,
            color: '#1a1a1a',
            paddingTop: '60px',
          }}
        >
          {renderBlocks(text)}
        </div>
      </ScrollReveal>
    </section>
  );
}
