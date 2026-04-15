/**
 * Utility helpers for Strapi image URLs.
 *
 * @module lib/helpers/image
 */

import { STRAPI_URL } from '@/config/constants';
import type { StrapiImage } from '@/models';
import type { StrapiMedia } from '@/models';

/**
 * Builds a full URL for a Strapi media asset.
 * Handles both absolute URLs (external storage) and relative URLs (local uploads).
 */
export function getStrapiImageUrl(image: StrapiImage | StrapiMedia | undefined): string {
  if (!image?.url) return '/placeholder.jpg';
  if (image.url.startsWith('http')) return image.url;
  return `${STRAPI_URL}${image.url}`;
}

/** Returns true if the media asset is a video based on its mime type */
export function isVideo(media: StrapiMedia | undefined): boolean {
  return media?.mime?.startsWith('video/') ?? false;
}

/** Returns true if the media asset is an animated gif */
export function isGif(media: StrapiMedia | undefined): boolean {
  return media?.mime === 'image/gif';
}
