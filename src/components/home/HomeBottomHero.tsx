'use client';

/**
 * Section 6 — Bottom Hero: a large full-width image at the bottom of the page.
 *
 * @module components/home/HomeBottomHero
 */

import Image from 'next/image';
import type { StrapiImage } from '@/models';
import { getStrapiImageUrl } from '@/lib/helpers/image.helpers';
import ScrollReveal from './ScrollReveal';

const TOTAL_W = 1436;
const IMG_H = 900;

interface Props {
  image: StrapiImage;
}

export default function HomeBottomHero({ image }: Props) {
  return (
    <section
      className="w-full px-4 md:px-0"
      style={{ maxWidth: `${TOTAL_W}px` }}
    >
      <ScrollReveal>
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: `${TOTAL_W} / ${IMG_H}` }}
        >
          <Image
            src={getStrapiImageUrl(image)}
            alt="Bottom hero"
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 1436px"
            quality={100}
          />
        </div>
      </ScrollReveal>
    </section>
  );
}
