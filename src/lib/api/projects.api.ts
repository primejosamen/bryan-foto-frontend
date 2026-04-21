/**
 * API functions for portfolio project data.
 *
 * @module lib/api/projects
 */

import type { Project } from '@/models';
import { strapiGet } from './strapi-client';

/** Fetches all portfolio projects sorted by display order */
export async function getProjects(): Promise<Project[]> {
  return (await strapiGet<Project[]>('/api/portafoliov1s?sort=orden:asc')) ?? [];
}

/** Fetches a single project by its URL slug */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const results = await strapiGet<Project[]>(
    `/api/portafoliov1s?filters[slug][$eq]=${slug}`,
  );
  return results?.[0] ?? null;
}
