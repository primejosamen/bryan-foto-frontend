'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Proyecto } from '@/lib/strapi';
import HomeWorkCard from './HomeWorkCard';
import Logo3D from './Logo3D';


interface Props {
  proyectos: Proyecto[];
}

export default function HomeStickyWork({ proyectos }: Props) {
  const proyectosVisibles = useMemo(() => {
    return proyectos
      .filter((p) => p.visible)
      .sort((a, b) => a.orden - b.orden);
  }, [proyectos]);

  const containerRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [scrollDistance, setScrollDistance] = useState(0);
  const [sectionHeightPx, setSectionHeightPx] = useState<number>(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (!trackRef.current || !viewportRef.current) return;

      const total = trackRef.current.scrollWidth;
      const viewport = viewportRef.current.clientWidth;

      const dist = Math.max(0, total - viewport);
      setScrollDistance(dist);

      setSectionHeightPx(window.innerHeight + dist);
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [proyectosVisibles.length]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const x = useTransform(scrollYProgress, (v) => -v * scrollDistance);

  return (
    <section
      ref={containerRef}
      className="relative bg-white text-black"
      style={{ height: sectionHeightPx ? `${sectionHeightPx}px` : '200vh' }}
    >
      {/* ✅ Logo 3D - fullscreen con zona interactiva en el header */}
      <Logo3D />

      {/* NAV fijo abajo-derecha */}
      <div
        style={{
          position: 'fixed',
          right: 58,
          bottom: 10,
          zIndex: 9999,
          pointerEvents: 'auto',
        }}
      >
        <div style={{ position: 'relative', width: 'min(720px, 44vw)' }}>
          {/* links encima de la barra */}
          <div
            style={{
              display: 'flex',
              gap: 40,
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginBottom: 10,
            }}
          >
            <HomeNavLink href="/about">About</HomeNavLink>
            <HomeNavLink href="/contacto">Contact</HomeNavLink>
          </div>

          {/* barra roja */}
          <div 
            style={{ 
              height: 10, 
              background: '#ff0000', 
              width: '100%',
            }} 
          />
        </div>
      </div>

      <div className="sticky top-0 h-screen bg-white">
        {/* HEADER - espacio para el logo 3D */}
        <div className="relative px-12 pt-8" style={{ height: '270px' }}>
          {/* Botones con z-index MUY alto para estar sobre la zona interactiva del logo */}
          <button 
            aria-label="Menu" 
            className="absolute left-12 top-10" 
            style={{ zIndex: 100, position: 'relative' }}
          >
            <span className="block w-10 h-[6px] bg-black" />
          </button>

          <button 
            aria-label="Open" 
            className="absolute right-12 top-8" 
            style={{ zIndex: 100, position: 'relative' }}
          >
            <span className="text-3xl leading-none select-none">+</span>
          </button>
        </div>

        {/* MAIN - Contenedor de imágenes */}
        <div 
          className="relative px-12 pb-10" 
          style={{ 
            height: 'calc(100vh - 270px)',
            zIndex: 5,
            position: 'relative',
          }}
        >
          <div className="h-full flex gap-12">
            {/* IZQUIERDA - Galería de imágenes */}
            <div ref={viewportRef} className="relative flex-1 overflow-hidden">
              <motion.div
                ref={trackRef}
                className="absolute left-0 top-1/2 -translate-y-1/2 flex gap-[10px]"
                style={{ x, willChange: 'transform' }}
              >
                {proyectosVisibles.map((p, idx) => (
                  <HomeWorkCard key={p.id} proyecto={p} priority={idx < 3} />
                ))}
                <div className="flex-shrink-0 w-24" />
              </motion.div>
            </div>

            {/* DERECHA (aire blanco) */}
            <aside className="relative hidden lg:block w-[38vw] max-w-[560px] min-w-[360px] bg-white" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'IBM Plex Sans, sans-serif',
        fontSize: 16,
        fontWeight: 600,
        color: '#ffffff',
      }}
    >
      {/* recuadro rojo */}
      <span
        style={{
          position: 'absolute',
          left: -12,
          right: -12,
          top: -8,
          bottom: -8,
          background: '#ff0000',
          pointerEvents: 'none',
        }}
      />
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </Link>
  );
}
