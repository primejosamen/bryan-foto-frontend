'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import GlassNavBar from '@/components/ui/GlassNavBar';

export default function BackButton() {
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const restRef = useRef<HTMLDivElement>(null);
  const isTouchRef = useRef(false);

  const [glassPos, setGlassPos] = useState({ x: 0, y: 0, width: 36, height: 36 });

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (hovered && linkRef.current) {
      const cRect = container.getBoundingClientRect();
      const lRect = linkRef.current.getBoundingClientRect();
      setGlassPos({
        x: lRect.left - cRect.left,
        y: lRect.top - cRect.top,
        width: lRect.width,
        height: lRect.height,
      });
      return;
    }

    if (restRef.current) {
      const cRect = container.getBoundingClientRect();
      const rRect = restRef.current.getBoundingClientRect();
      setGlassPos({
        x: rRect.left - cRect.left,
        y: rRect.top - cRect.top,
        width: rRect.width,
        height: rRect.height,
      });
    }
  }, [hovered]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  const onEnter = useCallback(() => {
    if (isTouchRef.current) return;
    setHovered(true);
  }, []);
  const onLeave = useCallback(() => {
    if (isTouchRef.current) return;
    setHovered(false);
  }, []);
  const onTouch = useCallback(() => {
    isTouchRef.current = true;
    setHovered(true);
    setTimeout(() => setHovered(false), 600);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed top-4 left-4 z-9999 md:top-8 md:left-8 pointer-events-auto"
    >
      <div className="relative flex items-center gap-0">
        {/* Traveling glass */}
        <motion.div
          className="absolute z-0 overflow-hidden rounded-lg"
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

        {/* Back link */}
        <Link
          href="/"
          ref={linkRef}
          className="relative z-10 inline-flex items-center gap-2 font-ibm-mono text-[16px] font-normal tracking-[-0.05em] text-red-500 cursor-pointer px-3 py-2"
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onTouchStart={onTouch}
        >
          <svg
            className="relative z-10 text-accent"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="relative z-10 text-accent">Back</span>
        </Link>

        {/* Rest spacer — glass sits here by default */}
        <div ref={restRef} className="h-9 w-9 shrink-0" />
      </div>
    </div>
  );
}
