/**
 * Barrel export for all API functions.
 * Import from '@/lib/api' throughout the application.
 *
 * @module lib/api
 */

export { strapiGet } from './strapi-client';
export { getProjects, getProjectBySlug } from './projects.api';
export { getAbout } from './about.api';
export { getContact } from './contact.api';
export { getGlobalConfig } from './global.api';
export { getHomePage } from './home-page.api';
