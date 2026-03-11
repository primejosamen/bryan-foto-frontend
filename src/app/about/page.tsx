// src/app/about/page.tsx
import AboutSection from '@/components/about/AboutSection';
import { getAbout } from '@/lib/api';

export default async function AboutPage() {
  const about = await getAbout();

  return (
    <div className="pt-24">
      <AboutSection about={about} />
    </div>
  );
}

export const metadata = {
  title: 'About | Bryan Photography',
  description: 'Conoce más sobre Bryan Photography',
};

export const revalidate = 60;
