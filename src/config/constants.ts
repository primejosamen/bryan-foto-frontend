/**
 * Application-wide constants.
 * Centralizes magic strings, numbers, and configuration values
 * to avoid scattered literals across the codebase.
 *
 * @module config/constants
 */

//#region Environment

/** Strapi CMS backend URL */
export const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

/** ISR revalidation interval in seconds */
export const REVALIDATE_INTERVAL = 60;

//#endregion Environment

//#region Site defaults

/** Fallback site information when CMS data is unavailable */
export const SITE_DEFAULTS = {
  name: 'Bryan',
  description: 'Photography',
} as const;

//#endregion Site defaults

//#region Design tokens

/** Brand color palette */
export const COLORS = {
  accent: '#ff0000',
  black: '#000000',
  white: '#ffffff',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  textSubtle: 'rgba(255, 255, 255, 0.3)',
  overlayLight: 'rgba(0, 0, 0, 0.08)',
  overlayDark: 'rgba(0, 0, 0, 0.8)',
} as const;

/** Typography scale from the design spec (pt → px conversions) */
export const FONT_SIZES = {
  body: '24px',
  title: '57px',
  small: '14px',
  nav: '16px',
  label: '13px',
  caption: '11px',
} as const;

/** Font family stack */
export const FONT_FAMILY = "var(--font-ibm-plex-sans), 'IBM Plex Sans', sans-serif";

//#endregion Design tokens

//#region Layout

/** Home page slot carousel dimensions (px) */
export const HOME_SLOTS = {
  count: 3,
  width: 472,
  gap: 10,
  headerHeight: 270,
  navBottom: 65,
  navGap: 10,
} as const;

/** Project card frame dimensions (px) */
export const PROJECT_CARD = {
  width: 472,
  height: 810,
} as const;

//#endregion Layout

//#region Animation

/** Home slot rotation timing (ms) */
export const ROTATION_TIMING = {
  interval: 4000,
  staggerDelay: 550,
  waveAmplitude: 420,
  waveSpeed: 0.9,
  wavePhaseStep: 0.85,
} as const;

/** Slide transition durations (s) */
export const SLIDE_DURATION = {
  base: 0.98,
  slotStep: 0.08,
  waveAmplitude: 0.06,
} as const;

/** Hold phase timing (ms) — perceptual pause before slide change */
export const HOLD_TIMING = {
  baseMs: 260,
  slotStepMs: 35,
  waveAmplitudeMs: 25,
} as const;

//#endregion Animation
