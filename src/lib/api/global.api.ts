/**
 * API functions for global site configuration.
 *
 * @module lib/api/global
 */

import type { GlobalConfig } from '@/models';
import { strapiGet } from './strapi-client';

/** Fetches global site configuration (backend applies selective populate) */
export async function getGlobalConfig(): Promise<GlobalConfig | null> {
  return strapiGet<GlobalConfig>('/api/global');
}
