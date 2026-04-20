// src/app/page.tsx
import HomeContent from '@/components/home/HomeContent';
import NavFooter from '@/components/layout/NavFooter';
import Logo3D from '@/components/ui/Logo3D';
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
    <>
      <HomeContent homeData={homeData} proyectos={proyectos} />

      {/* Por encima del hero (z-5) para que el logo 3D sea visible; footer encima de todo */}
      <Logo3D />
      <NavFooter />
    </>
  );
}

export const revalidate = 60;