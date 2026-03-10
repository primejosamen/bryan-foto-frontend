// src/app/page.tsx
import HomeRotatingSlots from '@/components/HomeRotatingSlots';
import { getProyectos } from '@/lib/strapi';

export default async function HomePage() {
  const proyectos = await getProyectos();
  return <HomeRotatingSlots proyectos={proyectos} />;
}

export const revalidate = 60;