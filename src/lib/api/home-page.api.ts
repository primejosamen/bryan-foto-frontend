/**
 * API functions for the Home Page single type.
 *
 * @module lib/api/home-page
 */

import type { HomePage } from '@/models';
import { strapiGet } from './strapi-client';

/** Fetches the Home Page single type with all media populated */
export async function getHomePage(): Promise<HomePage | null> {
  return await strapiGet<HomePage>('/api/home-page?populate=*');
}
