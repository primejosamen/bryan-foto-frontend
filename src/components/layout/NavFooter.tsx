'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { NAV_LINKS } from '@/config/navigation';
import GlassNavBar from '@/components/ui/GlassNavBar';

/**
 * Shared navigation footer — single glass square travels from center to hovered link.
 */
export default function NavFooter() {
  const pathname = usePathname();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLElement | null>>({});
  const centerRef = useRef<HTMLDivElement>(null);
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTouchRef = useRef(false);

  /* Glass position as state so it re-renders properly */
  const [glassPos, setGlassPos] = useState({ x: 0, y: 0, width: 40, height: 40 });

  /* Measure and update glass position */
  const measureGlass = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (hoveredHref && linkRefs.current[hoveredHref]) {
      const linkEl = linkRefs.current[hoveredHref]!;
      const cRect = container.getBoundingClientRect();
      const lRect = linkEl.getBoundingClientRect();
      setGlassPos({
        x: lRect.left - cRect.left,
        y: lRect.top - cRect.top,
        width: lRect.width,
        height: lRect.height,
      });
      return;
    }

    if (centerRef.current) {
      const cRect = container.getBoundingClientRect();
      const mRect = centerRef.current.getBoundingClientRect();
      setGlassPos({
        x: mRect.left - cRect.left,
        y: mRect.top - cRect.top,
        width: mRect.width,
        height: mRect.height,
      });
    }
  }, [hoveredHref]);

  /* Re-measure when hover changes or after DOM paint */
  useLayoutEffect(() => {
    measureGlass();
  }, [measureGlass, pathname]);

  /* Force reset on route change */
  useEffect(() => {
    setHoveredHref(null);
    // Also clear any pending touch timer
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  }, [pathname]);

  /* Also reset on browser back/forward */
  useEffect(() => {
    const reset = () => {
      setHoveredHref(null);
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
    };
    window.addEventListener('popstate', reset);
    return () => window.removeEventListener('popstate', reset);
  }, []);

  /* On touch: flash the glass to link, then return to center */
  const handleTouch = useCallback((href: string) => {
    isTouchRef.current = true;
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    setHoveredHref(href);
    touchTimerRef.current = setTimeout(() => setHoveredHref(null), 600);
  }, []);

  /* Mouse handlers — ignored on touch devices */
  const onEnter = useCallback((href: string) => {
    if (isTouchRef.current) return;
    setHoveredHref(href);
  }, []);
  const onLeave = useCallback(() => {
    if (isTouchRef.current) return;
    setHoveredHref(null);
  }, []);

  return (
    <nav className="fixed inset-x-0 bottom-3 z-[9999] pointer-events-none flex justify-center px-6 md:justify-end md:pr-8">
      <div ref={containerRef} className="pointer-events-auto relative flex h-9 items-center gap-1.5 px-1 md:gap-3">

        {/* Traveling glass */}
        <motion.div
          className="absolute overflow-hidden rounded-lg"
          animate={{
            x: glassPos.x,
            y: glassPos.y,
            width: glassPos.width,
            height: glassPos.height,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          style={{ top: 0, left: 0 }}
        >
          <GlassNavBar />
        </motion.div>

        {/* Left links (internal) */}
        {NAV_LINKS.filter((l) => !l.external).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            ref={(el) => { linkRefs.current[link.href] = el; }}
            className="relative inline-flex items-center font-ibm-mono text-[0.85rem] font-semibold leading-none md:text-[1.05rem] tracking-[-0.07em] px-2 py-1.5"
            onMouseEnter={() => onEnter(link.href)}
            onMouseLeave={onLeave}
            onTouchStart={() => handleTouch(link.href)}
          >
            <span className="relative z-10 text-red-500">{link.label}</span>
          </Link>
        ))}

        {/* Invisible center spacer — rest position */}
        <div ref={centerRef} className="mx-0.5 h-7 w-7 shrink-0" />

        {/* Right links (external) */}
        {NAV_LINKS.filter((l) => l.external).map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            ref={(el) => { linkRefs.current[link.href] = el; }}
            className="relative inline-flex items-center font-ibm-mono text-[0.85rem] font-semibold leading-none md:text-[1.05rem] tracking-[-0.07em] px-2 py-1.5"
            onMouseEnter={() => onEnter(link.href)}
            onMouseLeave={onLeave}
            onTouchStart={() => handleTouch(link.href)}
          >
            <span className="relative z-10 text-red-500">{link.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
