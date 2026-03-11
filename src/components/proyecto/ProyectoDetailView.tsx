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
    <div className="fixed top-24 left-8 z-30 flex gap-2">
      {fotos.map((foto, i) => (
        <button
          key={foto.id}
          onClick={() => onSelect(i)}
          className="relative block overflow-hidden transition-all duration-300"
          style={{
            width: i === activeIndex ? 72 : 56,
            height: i === activeIndex ? 48 : 38,
            opacity: i === activeIndex ? 1 : 0.45,
            borderBottom:
              i === activeIndex ? '2px solid white' : '2px solid transparent',
          }}
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

/* ──────────── Single editorial slide (one per photo) ─────────── */
function EditorialSlide({
  foto,
  index,
  titulo,
  descripcion,
  total,
}: {
  foto: StrapiImage;
  index: number;
  titulo: string;
  descripcion?: string;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // parallax: image moves slower than scroll
  const y = useTransform(scrollYProgress, [0, 1], ['8%', '-8%']);
  // fade in / out as the slide enters / exits viewport
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.5, 0.8, 1],
    [0, 1, 1, 1, 0]
  );
  // subtle scale
  const scale = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.92, 1, 1, 0.96]
  );

  /* Determine image proportions to respect original aspect ratio */
  const isPortrait =
    foto.width && foto.height ? foto.height > foto.width : false;
  const isWide =
    foto.width && foto.height ? foto.width / foto.height > 1.6 : false;

  /* Image container sizing based on orientation */
  const imageContainerStyle: React.CSSProperties = isPortrait
    ? { width: '42vw', height: '75vh', maxHeight: '85vh' }
    : isWide
      ? { width: '65vw', height: '55vh', maxHeight: '70vh' }
      : { width: '55vw', height: '65vh', maxHeight: '80vh' };

  const isHero = index === 0;

  return (
    <motion.div
      ref={ref}
      className="relative min-h-screen flex items-center justify-center"
      style={{ opacity }}
    >
      {/* ── Editorial grid layout ── */}
      <div
        className="relative w-full flex items-center"
        style={{
          minHeight: '100vh',
          paddingLeft: 'clamp(2rem, 5vw, 5rem)',
          paddingRight: 'clamp(2rem, 5vw, 5rem)',
        }}
      >
        {/* Left column: title + meta (only on hero or every 3rd image) */}
        {(isHero || index % 3 === 0) && (
          <motion.div
            className="absolute z-20"
            style={{
              left: 'clamp(2rem, 5vw, 5rem)',
              bottom: isHero ? '12vh' : '15vh',
              maxWidth: '340px',
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: false, amount: 0.5 }}
          >
            {isHero && (
              <>
                {/* Decorative line */}
                <div
                  className="mb-4"
                  style={{
                    width: '100%',
                    height: '1px',
                    background:
                      'linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)',
                  }}
                />
                <h1
                  className="text-white font-medium leading-tight"
                  style={{
                    fontFamily: 'var(--font-ibm-plex-sans), IBM Plex Sans, sans-serif',
                    fontSize: 'clamp(28px, 4vw, 48px)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {titulo}
                </h1>
                {descripcion && (
                  <p
                    className="text-white/60 mt-2"
                    style={{
                      fontFamily:
                        'var(--font-ibm-plex-sans), IBM Plex Sans, sans-serif',
                      fontSize: 'clamp(14px, 1.4vw, 20px)',
                      fontWeight: 300,
                      fontStyle: 'italic',
                    }}
                  >
                    {descripcion}
                  </p>
                )}
              </>
            )}

            {!isHero && (
              <span
                className="text-white/30"
                style={{
                  fontFamily:
                    'var(--font-ibm-plex-sans), IBM Plex Sans, sans-serif',
                  fontSize: '13px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
            )}
          </motion.div>
        )}

        {/* Center: photo */}
        <motion.div
          className="relative mx-auto overflow-hidden"
          style={{
            ...imageContainerStyle,
            scale,
          }}
        >
          <motion.div className="relative w-full h-full" style={{ y }}>
            <Image
              src={getStrapiImageUrl(foto)}
              alt={`${titulo} — ${index + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 90vw, 65vw"
              priority={index < 2}
              quality={90}
            />
          </motion.div>
        </motion.div>

        {/* Right side: page indicator (on hero) */}
        {isHero && (
          <motion.div
            className="absolute z-20 hidden md:flex flex-col items-end"
            style={{
              right: 'clamp(2rem, 5vw, 5rem)',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: false, amount: 0.5 }}
          >
            {/* Vertical line */}
            <div
              style={{
                width: '1px',
                height: '120px',
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)',
              }}
            />
          </motion.div>
        )}
      </div>

      {/* Scroll-down hint on first slide only */}
      {isHero && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <span
            className="text-white/30"
            style={{
              fontFamily:
                'var(--font-ibm-plex-sans), IBM Plex Sans, sans-serif',
              fontSize: '11px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ════════════════════════ Main component ═════════════════════════ */
export default function ProyectoDetailView({ proyecto }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
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
    <div className="relative bg-black min-h-screen">
      {/* Logo pequeño 3D — arriba izquierda */}
      <LogoSmall3D />

      {/* Back link */}
      <div className="fixed top-8 left-8 z-40">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          style={{
            fontFamily: 'var(--font-ibm-plex-sans), IBM Plex Sans, sans-serif',
            fontSize: '13px',
            letterSpacing: '0.06em',
          }}
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

      {/* Thumbnail strip */}
      {todasLasFotos.length > 1 && (
        <ThumbnailStrip
          fotos={todasLasFotos}
          activeIndex={activeIndex}
          onSelect={scrollTo}
        />
      )}

      {/* Editorial slides */}
      <div className="relative">
        {todasLasFotos.map((foto, index) => (
          <div
            key={foto.id}
            ref={(el) => {
              sectionRefs.current[index] = el;
            }}
            data-index={index}
          >
            <EditorialSlide
              foto={foto}
              index={index}
              titulo={proyecto.titulo}
              descripcion={proyecto.descripcion}
              total={todasLasFotos.length}
            />
          </div>
        ))}
      </div>

      {/* Footer nav */}
      <footer className="relative z-20 px-8 md:px-20 py-20 border-t border-white/10">
        <Link
          href="/"
          className="inline-flex items-center gap-4 group"
          style={{
            fontFamily: 'var(--font-ibm-plex-sans), IBM Plex Sans, sans-serif',
            fontSize: '20px',
          }}
        >
          <span className="text-white/50 group-hover:text-white transition-colors">
            Ver todos los proyectos
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="transform group-hover:translate-x-2 transition-transform"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </footer>

      {/* Progress bar */}
      <ProgressBar total={todasLasFotos.length} activeIndex={activeIndex} />
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
    <div
      className="fixed bottom-8 right-8 z-40 flex items-center gap-3"
      style={{
        fontFamily: 'var(--font-ibm-plex-sans), IBM Plex Sans, sans-serif',
      }}
    >
      <span className="text-white/25 text-[11px] tracking-widest">
        {String(activeIndex + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
      </span>
      <div
        className="relative overflow-hidden"
        style={{ width: 60, height: 2, background: 'rgba(255,255,255,0.1)' }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 bg-white/50"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
