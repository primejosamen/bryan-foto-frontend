/**
 * Data models for the About page content from Strapi CMS.
 *
 * @module models/about
 */

//#region DTOs

import type { StrapiImage } from './project.model';

/** Dynamic zone block from Strapi About page */
export interface AboutBlock {
  __component: string;
  id: number;
  body?: string;
  title?: string;
  file?: StrapiImage;
}

/** About page content from Strapi CMS */
export interface About {
  id: number;
  title: string;
  blocks: AboutBlock[];
}

//#endregion DTOs
