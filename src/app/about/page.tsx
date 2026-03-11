/**
 * About page — split layout with 3D logo and content.
 *
 * @module app/about
 */
import AboutSection from '@/components/about/AboutSection';
import { getAbout } from '@/lib/api';
import { REVALIDATE_INTERVAL } from '@/config/constants';

export default async function AboutPage() {
  const about = await getAbout();

  return <AboutSection about={about} />;
}

export const metadata = {
  title: 'About | Bryan Photography',
  description: 'Conoce más sobre Bryan Photography',
};

export const revalidate = REVALIDATE_INTERVAL;
