// src/app/page.tsx
import HomeScrollPage from '@/components/home/HomeScrollPage';
import HomeRotatingSlots from '@/components/home/HomeRotatingSlots';
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
    </>
  );
}

export const revalidate = 60;