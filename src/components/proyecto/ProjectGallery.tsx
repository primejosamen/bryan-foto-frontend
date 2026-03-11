'use client';

import { useRef, useLayoutEffect, useState, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ProjectCard from './ProjectCard';
import type { Project } from '@/models';

interface ProjectGalleryProps {
  proyectos: Project[];
}

export default function ProjectGallery({ proyectos }: ProjectGalleryProps) {
  const containerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const proyectosVisibles = useMemo(() => {
    return proyectos
      .filter((p) => p.visible)
      .sort((a, b) => a.orden - b.orden);
  }, [proyectos]);

  const [scrollDistance, setScrollDistance] = useState(0);
  const [sectionHeightPx, setSectionHeightPx] = useState<number>(0);

  // Medir ancho real del track (scrollWidth) y calcular distancia horizontal exacta
  useLayoutEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;

      const total = trackRef.current.scrollWidth; // ancho real de todos los cards + gaps
      const viewport = window.innerWidth;

      const dist = Math.max(0, total - viewport);
      setScrollDistance(dist);

      // 1px scroll vertical = 1px movimiento horizontal
      // altura total = viewportHeight + distanciaHorizontal
      setSectionHeightPx(window.innerHeight + dist);
    };

    // Medir ahora y luego en resize
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [proyectosVisibles.length]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Scroll progress (0..1) -> translateX (0..-scrollDistance)
  const x = useTransform(scrollYProgress, (v) => -v * scrollDistance);

  if (proyectosVisibles.length === 0) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-white/50">No hay proyectos disponibles</p>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative bg-black"
      style={{
        height: sectionHeightPx ? `${sectionHeightPx}px` : '200vh',
      }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <motion.div
          ref={trackRef}
          className="flex items-center gap-16 px-20"
          style={{ x, willChange: 'transform' }}
        >
          {proyectosVisibles.map((proyecto, index) => (
            <ProjectCard key={proyecto.id} proyecto={proyecto} index={index} />
          ))}

          {/* aire final para que el último respire */}
          <div className="flex-shrink-0 w-24" />
        </motion.div>
      </div>

      {/* Indicador opcional */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="text-white/40 text-sm">Scroll para explorar</div>
      </div>
    </section>
  );
}
