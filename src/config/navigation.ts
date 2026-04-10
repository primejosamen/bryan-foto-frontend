/**
 * Navigation configuration for the application.
 * Centralizes all route paths and navigation link definitions.
 *
 * @module config/navigation
 */

//#region Routes

/** Application route paths */
export const ROUTES = {
  home: '/',
  about: '/about',
  contact: '/contacto',
  project: (slug: string) => `/proyecto/${slug}`,
} as const;

//#endregion Routes

//#region Navigation links

/** Navigation link definition */
export interface NavLink {
  href: string;
  label: string;
  external?: boolean;
}

/** Main site navigation links */
export const NAV_LINKS: NavLink[] = [
  { href: ROUTES.about, label: 'About' },
  { href: 'https://www.instagram.com/bryantorres.a/', label: 'Instagram', external: true },
] as const;

/** Header navigation links (includes Work/Home) */
export const HEADER_NAV_LINKS: NavLink[] = [
  { href: ROUTES.home, label: 'Work' },
  ...NAV_LINKS,
] as const;

//#endregion Navigation links
