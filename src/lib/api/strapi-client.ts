/**
 * Base HTTP client for Strapi CMS API calls.
 * Provides a generic fetch wrapper with ISR revalidation and error handling.
 *
 * All domain-specific API files (projects, about, contact, global) use this client.
 *
 * @module lib/api/strapi-client
 */

import { STRAPI_URL, REVALIDATE_INTERVAL } from '@/config/constants';

/**
 * Generic GET request to Strapi API with Next.js ISR revalidation.
 * Returns parsed `data` field from Strapi v5 response format.
 *
 * @param path - API endpoint path (e.g. '/api/portafoliov1s?populate=*')
 * @param revalidate - ISR revalidation interval in seconds
 * @returns Parsed response data or null on failure
 */
export async function strapiGet<T>(
  path: string,
  revalidate: number = REVALIDATE_INTERVAL,
): Promise<T | null> {
  try {
    const res = await fetch(`${STRAPI_URL}${path}`, {
      next: { revalidate },
    });

    if (!res.ok) {
      throw new Error(`Strapi ${path}: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    return json.data ?? null;
  } catch (error) {
    console.error(`[Strapi] ${path}:`, error);
    return null;
  }
}
