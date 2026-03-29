// src/app/page.tsx
import HomeScrollPage from '@/components/home/HomeScrollPage';
import HomeRotatingSlots from '@/components/home/HomeRotatingSlots';
import NavFooter from '@/components/layout/NavFooter';
import Logo3D from '@/components/ui/Logo3D';
import { getHomePage, getProjects } from '@/lib/api';

/**
 * Home page — first screen is the original rotating slots (100vh),
 * then scrolling down reveals the new editorial sections from Strapi.
 */
export default async function HomePage() {
  const [homeData, proyectos] = await Promise.all([
    getHomePage(),
    getProjects(),
  ]);

  return (
    <>
      {/* First screen: rotating slots carousel (100vh) */}
      <HomeRotatingSlots proyectos={proyectos} />

      {/* Below: new editorial sections (scroll to reveal) */}
      {homeData && <HomeScrollPage data={homeData} />}

      {/* Por encima del hero (z-5) para que el logo 3D sea visible; footer encima de todo */}
      <Logo3D />
      <NavFooter />
    </>
  );
}

export const revalidate = 60;