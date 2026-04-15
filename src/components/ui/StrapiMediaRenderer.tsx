'use client';

/**
 * Universal renderer for Strapi media assets.
 * Renders <Image>, <img> (for gifs), or <video> based on mime type.
 *
 * @module components/ui/StrapiMediaRenderer
 */

import Image from 'next/image';
import type { StrapiMedia } from '@/models';
import { getStrapiImageUrl, isVideo, isGif } from '@/lib/helpers/image.helpers';

interface Props {
  media: StrapiMedia;
  alt: string;
  sizes: string;
  quality?: number;
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function StrapiMediaRenderer({
  media,
  alt,
  sizes,
  quality = 100,
  fill = true,
  className = '',
  style,
}: Props) {
  const url = getStrapiImageUrl(media);

  if (isVideo(media)) {
    return (
      <video
        src={url}
        autoPlay
        loop
        muted
        playsInline
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          ...style,
        }}
      />
    );
  }

  if (isGif(media)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          ...style,
        }}
      />
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      fill={fill}
      className={className}
      style={{ objectFit: 'cover', ...style }}
      sizes={sizes}
      quality={quality}
    />
  );
}
