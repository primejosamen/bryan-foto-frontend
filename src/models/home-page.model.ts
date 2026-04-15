/**
 * Data model for the Home Page single type from Strapi CMS.
 * Every image is a Single media field for independent control.
 *
 * @module models/home-page
 */

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

  /* Section 1: Hero Grid — 3 individual media */
  hero_image_1: StrapiMedia;
  hero_image_2: StrapiMedia;
  hero_image_3: StrapiMedia;

  /* Section 2: Featured Duo — 2 large media (or arrays for carousel) */
  featured_image_left: StrapiMedia | StrapiMedia[];
  featured_image_right: StrapiMedia | StrapiMedia[];

  /* Section 3: About Preview — media + text */
  about_image: StrapiMedia;
  about_text: StrapiBlock[];

  /* Section 4: Centered media */
  centered_image: StrapiMedia;

  /* Section 5: Editorial + Gif/Video */
  editorial_text: StrapiBlock[];
  gift_media: StrapiMedia;

  /* Section 6: Bottom Hero (single or array for carousel) */
  bottom_hero_image: StrapiMedia | StrapiMedia[];
}
