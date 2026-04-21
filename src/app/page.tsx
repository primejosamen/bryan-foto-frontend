// src/app/page.tsx
import HomeContent from '@/components/home/HomeContent';
import NavFooter from '@/components/layout/NavFooter';
import HomeShell from '@/components/home/HomeShell';
import { getHomePage, getProjects } from '@/lib/api';

/**
 * Home page — rotating slots + editorial sections in a unified container
 * that shares the same width constraint.
 */
export default async function HomePage() {
  const [homeData, proyectos] = await Promise.all([
    getHomePage(),
    getProjects(),
  ]);

  return (
    <HomeShell>
      <HomeContent homeData={homeData} proyectos={proyectos} />
      <NavFooter />
    </HomeShell>
  );
}

export const revalidate = 60;