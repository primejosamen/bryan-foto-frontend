/**
 * Utility helpers for Strapi image URLs.
 *
 * @module lib/helpers/image
 */

import { STRAPI_URL } from '@/config/constants';
import type { StrapiImage } from '@/models';

/**
 * Builds a full URL for a Strapi image asset.
 * Handles both absolute URLs (external storage) and relative URLs (local uploads).
 *
 * @param image - Strapi image object
 * @returns Full image URL or placeholder fallback
 */
export function getStrapiImageUrl(image: StrapiImage | undefined): string {
  if (!image?.url) return '/placeholder.jpg';
  if (image.url.startsWith('http')) return image.url;
  return `${STRAPI_URL}${image.url}`;
}
