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
      style={{
        width: `${TOTAL_W}px`,
        display: 'flex',
        alignItems: 'flex-start',
      }}
    >
      {/* Col 1: Texto editorial (472px) */}
      <ScrollReveal delay={0}>
        <div
          style={{
            width: `${SLOT_W}px`,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '16px',
            lineHeight: 1.35,
            letterSpacing: '-0.05em',
            color: '#1a1a1a',
          }}
        >
          {renderBlocks(text)}
        </div>
      </ScrollReveal>

      {/* Col 2: Espacio vacío (gap + 472 + gap) */}
      <div style={{ width: `${SLOT_GAP + SLOT_W + SLOT_GAP}px`, flexShrink: 0 }} />

      {/* Col 3: Gif / Video (472px) */}
      <ScrollReveal delay={250}>
        <div
          style={{
            width: `${SLOT_W}px`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          {video ? (
            <video
              src={url}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: `${SLOT_W}px`,
                height: `${MEDIA_H}px`,
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: `${SLOT_W}px`,
                height: `${MEDIA_H}px`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {media.mime === 'image/gif' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt="Animated content"
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
                  style={{ objectFit: 'cover' }}
                  sizes={`${SLOT_W}px`}
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
