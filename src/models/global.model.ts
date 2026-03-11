/**
 * Data models for global site configuration from Strapi CMS.
 *
 * @module models/global
 */

//#region DTOs

import type { StrapiImage } from './project.model';

/** Global site configuration from Strapi CMS */
export interface GlobalConfig {
  id: number;
  siteName: string;
  siteDescription?: string;
  favicon?: StrapiImage;
}

//#endregion DTOs
