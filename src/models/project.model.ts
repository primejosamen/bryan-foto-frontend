/**
 * Data models for portfolio projects from Strapi CMS.
 *
 * @module models/project
 */

//#region DTOs

/** Responsive image format variant from Strapi media library */
export interface ImageFormat {
  url: string;
  width: number;
  height: number;
}

/** Strapi media asset with responsive format variants */
export interface StrapiImage {
  id: number;
  url: string;
  width: number;
  height: number;
  formats?: {
    thumbnail?: ImageFormat;
    small?: ImageFormat;
    medium?: ImageFormat;
    large?: ImageFormat;
  };
}

/** Portfolio project entry from Strapi CMS */
export interface Project {
  id: number;
  documentId: string;
  titulo: string;
  slug: string;
  descripcion?: string;
  foto_portada: StrapiImage;
  galeria?: StrapiImage[];
  orden: number;
  visible: boolean;
}

//#endregion DTOs
