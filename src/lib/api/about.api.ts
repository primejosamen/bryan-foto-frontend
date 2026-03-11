/**
 * API functions for About page content.
 *
 * @module lib/api/about
 */

import type { About } from '@/models';
import { strapiGet } from './strapi-client';

/** Fetches the About page content with all dynamic blocks */
export async function getAbout(): Promise<About | null> {
  return strapiGet<About>('/api/about?populate=*');
}
