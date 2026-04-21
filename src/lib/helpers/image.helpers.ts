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

/**
 * Applies Cloudinary on-the-fly transforms to a Cloudinary URL.
 * Converts raw URLs like:
 *   https://res.cloudinary.com/xxx/image/upload/v123/foto.jpg
 * Into optimized URLs like:
 *   https://res.cloudinary.com/xxx/image/upload/f_auto,q_auto,w_800/v123/foto.jpg
 *
 * Non-Cloudinary URLs are returned unchanged.
 */
export function getOptimizedImageUrl(
  image: StrapiImage | StrapiMedia | undefined,
  width: number = 800,
): string {
  const url = getStrapiImageUrl(image);

  // Only transform Cloudinary URLs
  if (!url.includes('res.cloudinary.com')) return url;

  // Don't apply image transforms to video URLs
  if (url.includes('/video/upload/')) return url;

  // Insert transforms before /v<number>/ or the filename segment
  const match = url.match(/(\/image\/upload\/)(v\d+\/)/);
  if (match) {
    return url.replace(
      match[0],
      `${match[1]}f_auto,q_auto,w_${width}/${match[2]}`,
    );
  }

  // Fallback: insert before last path segment
  const uploadIdx = url.indexOf('/image/upload/');
  if (uploadIdx !== -1) {
    const insertAt = uploadIdx + '/image/upload/'.length;
    return `${url.slice(0, insertAt)}f_auto,q_auto,w_${width}/${url.slice(insertAt)}`;
  }

  return url;
}

const VIDEO_EXTS = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
const GIF_EXT = 'gif';

/** Returns true if the media asset is a video (checks mime then URL extension) */
export function isVideo(media: StrapiMedia | undefined): boolean {
  if (media?.mime?.startsWith('video/')) return true;
  const ext = media?.url?.split('.')?.pop()?.split('?')[0]?.toLowerCase();
  return VIDEO_EXTS.includes(ext ?? '');
}

/** Returns true if the media asset is an animated gif (checks mime then URL extension) */
export function isGif(media: StrapiMedia | undefined): boolean {
  if (media?.mime === 'image/gif') return true;
  const ext = media?.url?.split('.')?.pop()?.split('?')[0]?.toLowerCase();
  return ext === GIF_EXT;
}
