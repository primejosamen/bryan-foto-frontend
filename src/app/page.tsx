// src/app/page.tsx
import HomeRotatingSlots from '@/components/home/HomeRotatingSlots';
import { getProjects } from '@/lib/api';

export default async function HomePage() {
  const proyectos = await getProjects();
  return <HomeRotatingSlots proyectos={proyectos} />;
}

export const revalidate = 60;