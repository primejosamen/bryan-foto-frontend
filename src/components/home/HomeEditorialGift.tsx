'use client';

/**
 * Section 5 — Editorial + Gif/Video: rich text spanning col1+col2,
 * gif/video in col3. Aligned to the 3-slot grid.
 *
 * @module components/home/HomeEditorialGift
 */

import Image from 'next/image';
import type { StrapiMedia, StrapiBlock } from '@/models';
import { STRAPI_URL } from '@/config/constants';
import { renderBlocks } from '@/lib/helpers/rich-text.helpers';
import ScrollReveal from './ScrollReveal';

const SLOT_W = 472;
const SLOT_GAP = 10;
const TOTAL_W = SLOT_W * 3 + SLOT_GAP * 2; // 1436
const MEDIA_H = 400;

interface Props {
  text: StrapiBlock[];
  media: StrapiMedia;
}

function getMediaUrl(media: StrapiMedia): string {
  if (media.url.startsWith('http')) return media.url;
  return `${STRAPI_URL}${media.url}`;
}

function isVideo(media: StrapiMedia): boolean {
  return media.mime?.startsWith('video/') ?? false;
}

export default function HomeEditorialGift({ text, media }: Props) {
  const url = getMediaUrl(media);
  const video = isVideo(media);

  return (
    <section
      className="w-full flex flex-col gap-6 px-4 md:px-0 md:flex-row md:gap-0 md:items-start"
      style={{ maxWidth: `${TOTAL_W}px` }}
    >
      {/* Col 1: Texto editorial */}
      <ScrollReveal delay={0}>
        <div
          className="w-full md:w-[472px]"
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

      {/* Col 2: Espacio vacío (solo desktop) */}
      <div className="hidden md:block md:shrink-0" style={{ width: `${SLOT_GAP + SLOT_W + SLOT_GAP}px` }} />

      {/* Col 3: Gif / Video */}
      <ScrollReveal delay={250}>
        <div
          className="w-full md:w-[472px] flex justify-center items-start"
        >
          {video ? (
            <video
              src={url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full md:w-[472px]"
              style={{
                aspectRatio: `${SLOT_W} / ${MEDIA_H}`,
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              className="group relative w-full overflow-hidden md:w-[472px]"
              style={{ aspectRatio: `${SLOT_W} / ${MEDIA_H}` }}
            >
              {media.mime === 'image/gif' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt="Animated content"
                  className=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Image
                  src={url}
                  alt="Media content"
                  fill
                  className=""
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 472px"
                  quality={100}
                />
              )}
            </div>
          )}
        </div>
      </ScrollReveal>
    </section>
  );
}
