'use client';

import { usePathname } from 'next/navigation';
import Logo3D from '@/components/ui/Logo3D';
import LogoAbout3D from '@/components/ui/LogoAbout3D';
import LogoSmall3D from '@/components/ui/LogoSmall3D';

/**
 * Shared site header — renders the appropriate 3D logo
 * based on the current route. Persists across navigations.
 */
export default function SiteHeader() {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isAboutOrContact = pathname === '/about' || pathname === '/contacto';
  const isProject = pathname.startsWith('/proyecto/');

  return (
    <>
      {isHome && <Logo3D />}
      {isAboutOrContact && <LogoAbout3D />}
      {isProject && <LogoSmall3D />}
    </>
  );
}
