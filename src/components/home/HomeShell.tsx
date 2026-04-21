'use client';

import { useCallback, useState } from 'react';
import Logo3D from '@/components/ui/Logo3D';
import SplashScreen from '@/components/ui/SplashScreen';

export default function HomeShell({ children }: { children: React.ReactNode }) {
  const [logoReady, setLogoReady] = useState(false);

  const handleLogoReady = useCallback(() => {
    setLogoReady(true);
  }, []);

  return (
    <>
      <SplashScreen ready={logoReady} />
      {children}
      <Logo3D onReady={handleLogoReady} />
    </>
  );
}
