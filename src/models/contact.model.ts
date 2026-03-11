/**
 * Data models for contact information from Strapi CMS.
 *
 * @module models/contact
 */

//#region DTOs

/** Contact information from Strapi CMS */
export interface ContactInfo {
  id: number;
  email: string;
  telefono?: string;
  instagram?: string;
  ubicacion?: string;
}

//#endregion DTOs
