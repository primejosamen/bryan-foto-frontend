'use client';

/**
 * Section 2 — Featured Duo: 2 large images side by side.
 * Each image takes roughly half the total width.
 *
 * @module components/home/HomeFeaturedDuo
 */

import Image from 'next/image';
import type { StrapiImage } from '@/models';
import { getStrapiImageUrl } from '@/lib/helpers/image.helpers';
import ScrollReveal from './ScrollReveal';

const TOTAL_W = 1436;
const GAP = 10;
const HALF_W = (TOTAL_W - GAP) / 2; // 713
const IMG_H = 860;

interface Props {
  imageLeft: StrapiImage;
  imageRight: StrapiImage;
}

export default function HomeFeaturedDuo({ imageLeft, imageRight }: Props) {
  return (
    <section
      style={{
        width: `${TOTAL_W}px`,
        display: 'flex',
        gap: `${GAP}px`,
      }}
    >
      <ScrollReveal delay={0}>
        <div
          style={{
            width: `${HALF_W}px`,
            height: `${IMG_H}px`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Image
            src={getStrapiImageUrl(imageLeft)}
            alt="Featured left"
            fill
            style={{ objectFit: 'cover' }}
            sizes={`${HALF_W}px`}
            quality={100}
          />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <div
          style={{
            width: `${HALF_W}px`,
            height: `${IMG_H}px`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Image
            src={getStrapiImageUrl(imageRight)}
            alt="Featured right"
            fill
            style={{ objectFit: 'cover' }}
            sizes={`${HALF_W}px`}
            quality={100}
          />
        </div>
      </ScrollReveal>
    </section>
  );
}
