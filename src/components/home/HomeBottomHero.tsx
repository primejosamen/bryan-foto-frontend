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
    <section style={{ width: `${TOTAL_W}px` }}>
      <ScrollReveal>
        <div
          style={{
            width: '100%',
            height: `${IMG_H}px`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Image
            src={getStrapiImageUrl(image)}
            alt="Bottom hero"
            fill
            style={{ objectFit: 'cover' }}
            sizes={`${TOTAL_W}px`}
            quality={100}
          />
        </div>
      </ScrollReveal>
    </section>
  );
}
