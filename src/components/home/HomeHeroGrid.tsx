'use client';

/**
 * Section 1 — Hero Grid: 3 individual images in a row.
 * Each image is a separate Strapi field for independent control.
 *
 * @module components/home/HomeHeroGrid
 */

import Image from 'next/image';
import type { StrapiImage } from '@/models';
import { getStrapiImageUrl } from '@/lib/helpers/image.helpers';
import ScrollReveal from './ScrollReveal';

const SLOT_W = 472;
const GAP = 10;
const IMG_H = 320;
const TOTAL_W = SLOT_W * 3 + GAP * 2; // 1436

interface Props {
  image1: StrapiImage;
  image2: StrapiImage;
  image3: StrapiImage;
}

export default function HomeHeroGrid({ image1, image2, image3 }: Props) {
  const images = [image1, image2, image3];

  return (
    <section
      style={{
        width: `${TOTAL_W}px`,
        display: 'flex',
        gap: `${GAP}px`,
      }}
    >
      {images.map((img, i) => (
        <ScrollReveal key={i} delay={i * 150}>
          <div
            style={{
              width: `${SLOT_W}px`,
              height: `${IMG_H}px`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Image
              src={getStrapiImageUrl(img)}
              alt={`Hero ${i + 1}`}
              fill
              style={{ objectFit: 'cover' }}
              sizes={`${SLOT_W}px`}
              quality={100}
            />
          </div>
        </ScrollReveal>
      ))}
    </section>
  );
}
