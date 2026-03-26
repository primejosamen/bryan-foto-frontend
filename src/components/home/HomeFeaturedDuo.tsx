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
      className="w-full flex flex-col gap-2 px-4 md:px-0 md:flex-row md:gap-[10px]"
      style={{ maxWidth: `${TOTAL_W}px` }}
    >
      <ScrollReveal delay={0}>
        <div
          className="relative w-full overflow-hidden md:w-[713px]"
          style={{ aspectRatio: `${HALF_W} / ${IMG_H}` }}
        >
          <Image
            src={getStrapiImageUrl(imageLeft)}
            alt="Featured left"
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 713px"
            quality={100}
          />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <div
          className="relative w-full overflow-hidden md:w-[713px]"
          style={{ aspectRatio: `${HALF_W} / ${IMG_H}` }}
        >
          <Image
            src={getStrapiImageUrl(imageRight)}
            alt="Featured right"
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 713px"
            quality={100}
          />
        </div>
      </ScrollReveal>
    </section>
  );
}
