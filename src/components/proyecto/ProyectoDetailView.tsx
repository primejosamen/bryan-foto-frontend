'use client';

import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from 'framer-motion';
import type { Project, StrapiImage } from '@/models';
import { getStrapiImageUrl } from '@/lib/helpers/image.helpers';
import LogoSmall3D from '@/components/ui/LogoSmall3D';

/* ───────────────────────────── props ─────────────────────────── */
interface Props {
  proyecto: Project;
}

/* ─────────── Thumbnail strip (top-left filmstrip) ────────────── */
function ThumbnailStrip({
  fotos,
  activeIndex,
  onSelect,
}: {
  fotos: StrapiImage[];
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="fixed top-10 left-8 z-30 flex gap-2">
      {fotos.map((foto, i) => (
        <button
          key={foto.id}
          onClick={() => onSelect(i)}
          className={`relative block overflow-hidden transition-all duration-300 border-b-2 ${
            i === activeIndex
              ? 'h-12 w-18 border-white opacity-100'
              : 'h-9.5 w-14 border-transparent opacity-45'
          }`}
        >
          <Image
            src={getStrapiImageUrl(foto)}
            alt={`Miniatura ${i + 1}`}
            fill
            className="object-cover"
            sizes="72px"
          />
        </button>
      ))}
    </div>
  );
}

/* ──────────── Single photo card (one per photo) ─────────── */
function PhotoCard({
  foto,
  index,
  titulo,
  onClick,
}: {
  foto: StrapiImage;
  index: number;
  titulo: string;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['4%', '-4%']);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.5, 0.85, 1],
    [0, 1, 1, 1, 0]
  );

  /* Determine image proportions to respect original aspect ratio */
  const isPortrait =
    foto.width && foto.height ? foto.height > foto.width : false;
  const isWide =
    foto.width && foto.height ? foto.width / foto.height > 1.6 : false;

  const imageContainerStyle: React.CSSProperties = isPortrait
    ? { width: '100%', aspectRatio: `${foto.width} / ${foto.height}` }
    : isWide
      ? { width: '100%', aspectRatio: `${foto.width} / ${foto.height}` }
      : { width: '100%', aspectRatio: `${foto.width} / ${foto.height}` };

  return (
    <motion.div
      ref={ref}
      className="relative w-full overflow-hidden cursor-pointer"
      style={{ ...imageContainerStyle, opacity }}
      onClick={onClick}
    >
      <motion.div className="relative w-full h-full" style={{ y }}>
        <Image
          src={getStrapiImageUrl(foto)}
          alt={`${titulo} — ${index + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 90vw, 50vw"
          priority={index < 2}
          quality={90}
        />
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════ Main component ═════════════════════════ */
export default function ProyectoDetailView({ proyecto }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const todasLasFotos = useMemo(
    () =>
      [proyecto.foto_portada, ...(proyecto.galeria || [])].filter(
        Boolean
      ) as StrapiImage[],
    [proyecto]
  );

  /* ── Track which slide is in view ── */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { threshold: 0.5 }
    );

    sectionRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [todasLasFotos.length]);

  /* ── Click thumbnail → scroll to section ── */
  const scrollTo = useCallback((i: number) => {
    sectionRefs.current[i]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, []);

  return (
    <div className="relative bg-white min-h-screen">
      {/* Back link */}
      <div className="fixed top-4 left-4 z-40 md:top-8 md:left-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-ibm-mono text-[16px] font-normal tracking-[-0.05em] text-red-500! transition-colors hover:text-red-700!"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver
        </Link>
      </div>

      {/* Thumbnail nav is now in column 3 of the grid */}

      {/* 3-column grid: title | images | thumbnails */}
      {/* Session info bar — fixed centered, 3 columns each left-aligned */}
      <div className="relative z-10 flex flex-col gap-2 px-4 pt-14 pb-4 md:fixed md:top-1/2 md:-translate-y-1/2 md:left-0 md:right-0 md:pointer-events-none md:px-10 md:pt-0 md:pb-0 md:grid md:grid-cols-[1fr_2fr_1fr] md:gap-10">
        <div className="flex items-center">
          <h1 className="font-ibm-mono text-[clamp(2rem,4.5vw,64px)] font-bold italic leading-tight text-red-500 tracking-[-0.085em]">
            {proyecto.titulo}
          </h1>
        </div>
        <div className="flex items-center">
          {proyecto.descripcion && (
            <p className="font-ibm-mono text-[clamp(0.75rem,1.2vw,16px)] font-bold italic text-red-500 tracking-[-0.05em]">
              {proyecto.descripcion}
            </p>
          )}
        </div>
        <div className="hidden md:flex items-center">
          <span className="font-ibm-mono font-bold text-[clamp(0.625rem,0.8vw,11px)] uppercase tracking-[0.12em] text-red-500">
            {todasLasFotos.length} fotos
          </span>
        </div>
      </div>

      {/* Images + Thumbnails grid */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-2 md:gap-10 px-4 md:px-10 py-4 md:py-20 overflow-visible">
        {/* Column 1: empty (hidden on mobile) */}
        <div className="hidden md:block" />

        {/* Column 2: Images */}
        <div className="flex flex-col items-start gap-2">
          {todasLasFotos.map((foto, index) => (
            <div
              key={foto.id}
              ref={(el) => {
                sectionRefs.current[index] = el;
              }}
              data-index={index}
              className="w-full"
            >
              <PhotoCard
                foto={foto}
                index={index}
                titulo={proyecto.titulo}
                onClick={() => setLightboxIndex(index)}
              />
            </div>
          ))}
        </div>

        {/* Column 3: Thumbnail nav (sticky, right) — hidden on mobile */}
        <div className="relative hidden md:block">
          <div className="sticky top-20">
            <motion.div
              className="absolute right-0 flex flex-col gap-2 p-3 items-end"
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {todasLasFotos.map((foto, i) => {
                const isActive = i === activeIndex;
                return (
                  <motion.button
                    key={foto.id}
                    onClick={() => scrollTo(i)}
                    layout
                    className="relative block overflow-hidden"
                    animate={{
                      width: isActive ? 600 : 130,
                      height: isActive ? 380 : 82,
                      opacity: isActive ? 1 : 0.5,
                    }}
                    whileHover={{ opacity: 0.85, scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <Image
                      src={getStrapiImageUrl(foto)}
                      alt={`Miniatura ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="600px"
                    />
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer nav */}
      <footer className="relative z-20 px-4 md:px-20 py-10 md:py-20 border-t border-black/10">
        <Link
          href="/"
          className="group inline-flex items-center gap-4 font-ibm-mono text-[16px]"
        >
          <span className="text-red-500 group-hover:text-red-700 transition-colors">
            Ver todos los proyectos
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="transform group-hover:translate-x-2 transition-transform text-red-500"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </footer>

      {/* Progress bar */}
      <ProgressBar total={todasLasFotos.length} activeIndex={activeIndex} />

      {/* Lightbox dialog */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setLightboxIndex(null)}
          >
            {/* Blurred backdrop */}
            <motion.div
              className="absolute inset-0 bg-white/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Image */}
            <motion.div
              className="relative z-10 w-[85vw] h-[85vh]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={getStrapiImageUrl(todasLasFotos[lightboxIndex])}
                alt={`${proyecto.titulo} — ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="85vw"
                quality={95}
              />
            </motion.div>

            {/* Close button */}
            <button
              className="absolute top-8 right-8 z-20 text-black/50 hover:text-black transition-colors"
              onClick={() => setLightboxIndex(null)}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────── Subtle progress bar (bottom-right) ────────── */
function ProgressBar({
  total,
  activeIndex,
}: {
  total: number;
  activeIndex: number;
}) {
  const pct = total > 1 ? ((activeIndex + 1) / total) * 100 : 100;

  return (
    <div className="fixed bottom-4 right-4 md:top-[40%] md:bottom-auto md:right-8 z-40 flex items-center gap-3 font-ibm-mono">
      <span className="text-red-500 text-[11px] tracking-widest">
        {String(activeIndex + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
      </span>
      <div className="relative h-0.5 w-15 overflow-hidden bg-transparent">
        <motion.div
          className="absolute inset-y-0 left-0 bg-red-500"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
