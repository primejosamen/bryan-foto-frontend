'use client';

import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import type { Project, StrapiImage } from '@/models';
import { getOptimizedImageUrl } from '@/lib/helpers/image.helpers';
import GlassNavBar from '@/components/ui/GlassNavBar';
import GlassChevron from '@/components/ui/GlassChevron';
import BackButton from '@/components/ui/BackButton';

/* ───────────────────────────── props ─────────────────────────── */
interface Props {
  proyecto: Project;
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

  const imageContainerStyle: React.CSSProperties =
    foto.width && foto.height
      ? { width: '100%', aspectRatio: `${foto.width} / ${foto.height}` }
      : { width: '100%', aspectRatio: '4 / 5' };

  return (
    <motion.div
      ref={ref}
      className="relative w-full overflow-hidden cursor-pointer"
      style={imageContainerStyle}
      onClick={onClick}
    >
      <motion.div
        className="relative w-full h-full will-change-transform transform-[translateZ(0)] backface-hidden"
        style={{ y }}
      >
        <Image
          src={getOptimizedImageUrl(foto, 1200)}
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

  /* ── Lightweight preload around active image ── */
  useEffect(() => {
    if (typeof window === 'undefined' || todasLasFotos.length === 0) return;

    const candidates = [
      activeIndex,
      activeIndex + 1,
      activeIndex + 2,
      activeIndex - 1,
    ].filter((i) => i >= 0 && i < todasLasFotos.length);

    candidates.forEach((i) => {
      const img = new window.Image();
      img.src = getOptimizedImageUrl(todasLasFotos[i], 1200);
    });
  }, [activeIndex, todasLasFotos]);

  /* ── Lightbox navigation ── */
  const goLightbox = useCallback(
    (dir: -1 | 1) => {
      setLightboxIndex((prev) => {
        if (prev === null) return null;
        const next = prev + dir;
        if (next < 0 || next >= todasLasFotos.length) return prev;
        return next;
      });
    },
    [todasLasFotos.length],
  );

  /* ── Lock body scroll when lightbox is open ── */
  useEffect(() => {
    if (lightboxIndex === null) return;
    const prev = document.body.style.overflow;
    const prevTouch = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    return () => {
      document.body.style.overflow = prev;
      document.body.style.touchAction = prevTouch;
    };
  }, [lightboxIndex]);

  /* ── Keyboard nav for lightbox ── */
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goLightbox(1);
      else if (e.key === 'ArrowLeft') goLightbox(-1);
      else if (e.key === 'Escape') setLightboxIndex(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIndex, goLightbox]);

  /* ── Click thumbnail → scroll to section ── */
  const scrollTo = useCallback((i: number) => {
    sectionRefs.current[i]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, []);

  return (
    <div className="relative bg-white min-h-screen">
      {/* Back link with traveling glass */}
      <BackButton />

      {/* Session info bar */}
      <div className="fixed z-10 left-0 right-0 top-1/2 -translate-y-1/2 flex flex-col items-end pointer-events-none px-4 md:items-stretch md:px-10 md:grid md:grid-cols-[1fr_2fr_1fr] md:gap-10">
        <div className="flex items-center self-start md:self-auto">
          <h1 className="font-ibm-mono text-xl font-bold leading-tight text-red-500 tracking-[-0.085em]">
            {proyecto.titulo}
          </h1>
        </div>

        <div className="flex items-center">
          {proyecto.descripcion && (
            <p className="font-ibm-mono text-lg font-regular text-red-500 tracking-[-0.05em]">
              {proyecto.descripcion}
            </p>
          )}
        </div>


      </div>

      {/* Images + Thumbnails grid */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-2 md:gap-10 px-4 md:px-10 py-4 md:py-20 overflow-visible">
        {/* Column 1 */}
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

        {/* Column 3: Thumbnail nav */}
        <div className="relative hidden md:block">
          <div className="sticky top-20">
            <div className="absolute right-0 flex flex-col gap-2 p-3 items-end">
              {todasLasFotos.map((foto, i) => {
                const isActive = i === activeIndex;

                return (
                  <div
                    key={foto.id}
                    className="relative overflow-hidden w-32.5 h-20.5"
                  >
                    <motion.button
                      type="button"
                      onClick={() => scrollTo(i)}
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0.55,
                        scale: isActive ? 1 : 0.985,
                      }}
                      whileHover={{
                        opacity: 0.9,
                        scale: 1.02,
                      }}
                      transition={{
                        duration: 0.28,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="absolute top-0 right-0 block overflow-hidden will-change-transform transform-[translateZ(0)] backface-hidden w-32.5 h-20.5"
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={getOptimizedImageUrl(foto, 260)}
                          alt={`Miniatura ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="130px"
                          quality={68}
                          loading={i < 2 ? 'eager' : 'lazy'}
                        />
                      </div>
                    </motion.button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>



      {/* Lightbox dialog */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setLightboxIndex(null)}
          >
            {/* Semi-transparent backdrop with blur */}
            <motion.div
              className="absolute inset-0 bg-black/30 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Image — auto-scaled to photo aspect ratio */}
            {(() => {
              const foto = todasLasFotos[lightboxIndex];
              const fw = foto.width || 4;
              const fh = foto.height || 5;
              const aspect = fw / fh;
              return (
                <motion.div
                  className="relative z-10 flex items-center justify-center"
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: `min(96vw, calc(96vh * ${aspect}))`,
                    height: `min(96vh, calc(96vw / ${aspect}))`,
                    maxWidth: '96vw',
                    maxHeight: '96vh',
                  }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={getOptimizedImageUrl(foto, 1800)}
                      alt={`${proyecto.titulo} — ${lightboxIndex + 1}`}
                      fill
                      className="object-contain"
                      sizes="96vw"
                      quality={95}
                      draggable={false}
                    />
                  </div>

            </motion.div>
              );
            })()}

              {/* Prev arrow */}
              {lightboxIndex > 0 && (
                <button
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    goLightbox(-1);
                  }}
                >
                  <div className="relative w-12 h-12">
                    <GlassChevron direction="left" />
                  </div>
                </button>
              )}

              {/* Next arrow */}
              {lightboxIndex < todasLasFotos.length - 1 && (
                <button
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    goLightbox(1);
                  }}
                >
                  <div className="relative w-12 h-12">
                    <GlassChevron direction="right" />
                  </div>
                </button>
              )}

            <button
              className="absolute top-8 right-8 z-20 text-black/50 hover:text-black transition-colors"
              onClick={() => setLightboxIndex(null)}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

