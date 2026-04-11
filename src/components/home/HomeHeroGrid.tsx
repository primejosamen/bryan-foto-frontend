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
      className="w-full flex flex-col gap-2 px-4 md:px-0 md:flex-row md:gap-[10px]"
      style={{ maxWidth: `${TOTAL_W}px` }}
    >
      {images.map((img, i) => (
        <ScrollReveal key={i} delay={i * 150}>
          <div
            className="group relative w-full overflow-hidden md:w-[472px]"
            style={{ aspectRatio: `${SLOT_W} / ${IMG_H}` }}
          >
            <Image
              src={getStrapiImageUrl(img)}
              alt={`Hero ${i + 1}`}
              fill
              className="transition-transform duration-500 ease-out group-hover:scale-110"
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 472px"
              quality={100}
            />
          </div>
        </ScrollReveal>
      ))}
    </section>
  );
}
