/**
 * Data model for the Home Page single type from Strapi CMS.
 * Every image is a Single media field for independent control.
 *
 * @module models/home-page
 */

import type { StrapiImage } from './project.model';

/** Strapi media asset that can be image, gif, or video */
export interface StrapiMedia {
  id: number;
  url: string;
  width?: number;
  height?: number;
  mime: string; // e.g. 'image/gif', 'video/mp4', 'image/png'
  formats?: {
    thumbnail?: { url: string; width: number; height: number };
    small?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    large?: { url: string; width: number; height: number };
  };
}

/** Rich text block from Strapi v5 Blocks editor */
export interface StrapiBlock {
  type: string;
  children: StrapiBlockChild[];
  level?: number;
}

export interface StrapiBlockChild {
  type: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  url?: string;
  children?: StrapiBlockChild[];
}

/** Home Page single type from Strapi CMS */
export interface HomePage {
  id: number;
  documentId: string;

  /* Section 1: Hero Grid — 3 individual images */
  hero_image_1: StrapiImage;
  hero_image_2: StrapiImage;
  hero_image_3: StrapiImage;

  /* Section 2: Featured Duo — 2 large images */
  featured_image_left: StrapiImage;
  featured_image_right: StrapiImage;

  /* Section 3: About Preview — image + text */
  about_image: StrapiImage;
  about_text: StrapiBlock[];

  /* Section 4: Centered Image */
  centered_image: StrapiImage;

  /* Section 5: Editorial + Gif/Video */
  editorial_text: StrapiBlock[];
  gift_media: StrapiMedia;

  /* Section 6: Bottom Hero */
  bottom_hero_image: StrapiImage;
}
