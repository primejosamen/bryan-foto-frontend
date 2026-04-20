'use client';

/**
 * HomeContent — Unified container for the home page.
 * Both the rotating slots (first screen) and the scroll sections
 * share the same width constraint via --home-right-reserve.
 */

import { useLayoutEffect, useState } from 'react';
import type { HomePage, Project } from '@/models';
import HomeRotatingSlots from './HomeRotatingSlots';
import HomeScrollPage from './HomeScrollPage';

interface Props {
  homeData: HomePage | null;
  proyectos: Project[];
}

export default function HomeContent({ homeData, proyectos }: Props) {
  const [rightReserve, setRightReserve] = useState(0);

  useLayoutEffect(() => {
    const update = () => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue('--home-right-reserve');
      const n = Number.parseFloat(raw);
      setRightReserve(Number.isFinite(n) ? n : 0);
    };

    update();
    // Re-read whenever --home-right-reserve changes (set by HomeRotatingSlots on resize)
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    window.addEventListener('resize', update);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      style={{
        maxWidth: rightReserve > 0
          ? `calc(100vw - ${rightReserve}px)`
          : undefined,
      }}
    >
      <HomeRotatingSlots proyectos={proyectos} />
      {homeData && <HomeScrollPage data={homeData} />}
    </div>
  );
}
