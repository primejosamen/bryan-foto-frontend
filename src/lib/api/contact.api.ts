/**
 * API functions for contact information.
 *
 * @module lib/api/contact
 */

import type { ContactInfo } from '@/models';
import { strapiGet } from './strapi-client';

/** Fetches contact information (email, phone, social, location) */
export async function getContact(): Promise<ContactInfo | null> {
  return strapiGet<ContactInfo>('/api/contacto?populate=*');
}
