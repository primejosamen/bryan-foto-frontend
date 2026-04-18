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
import { getStrapiImageUrl } from '@/lib/helpers/image.helpers';
import GlassNavBar from '@/components/ui/GlassNavBar';
import GlassChevron from '@/components/ui/GlassChevron';
import GlassLoupe from '@/components/ui/GlassLoupe';
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
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.5, 0.85, 1],
    [0, 1, 1, 1, 0]
  );

  const imageContainerStyle: React.CSSProperties =
    foto.width && foto.height
      ? { width: '100%', aspectRatio: `${foto.width} / ${foto.height}` }
      : { width: '100%', aspectRatio: '4 / 5' };

  return (
    <motion.div
      ref={ref}
      className="relative w-full overflow-hidden cursor-pointer"
      style={{ ...imageContainerStyle, opacity }}
      onClick={onClick}
    >
      <motion.div
        className="relative w-full h-full will-change-transform transform-[translateZ(0)] backface-hidden"
        style={{ y }}
      >
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
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [mouseClient, setMouseClient] = useState({ cx: 0, cy: 0 });
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTouchZoomRef = useRef(false);

  const todasLasFotos = useMemo(
    () =>
      [proyecto.foto_portada, ...(proyecto.galeria || [])].filter(
        Boolean
      ) as StrapiImage[],
    [proyecto]
  );

  /**
   * Convert a client (x, y) hit on the imgContainer to image-space 0–100 coords,
   * accounting for object-contain letterboxing.
   */
  const clientToImagePercent = useCallback(
    (clientX: number, clientY: number) => {
      const el = imgContainerRef.current;
      if (!el || lightboxIndex === null) return { x: 50, y: 50 };
      const rect = el.getBoundingClientRect();
      const foto = todasLasFotos[lightboxIndex];
      const imgW = foto.width || 4;
      const imgH = foto.height || 5;
      const imgAspect = imgW / imgH;
      const contAspect = rect.width / rect.height;

      // Compute the rendered image rect inside the container (object-contain)
      let renderedW: number, renderedH: number, offsetX: number, offsetY: number;
      if (imgAspect > contAspect) {
        // Image wider than container → pillarboxed top/bottom
        renderedW = rect.width;
        renderedH = rect.width / imgAspect;
        offsetX = 0;
        offsetY = (rect.height - renderedH) / 2;
      } else {
        // Image taller than container → letterboxed left/right
        renderedH = rect.height;
        renderedW = rect.height * imgAspect;
        offsetX = (rect.width - renderedW) / 2;
        offsetY = 0;
      }

      const x = ((clientX - rect.left - offsetX) / renderedW) * 100;
      const y = ((clientY - rect.top - offsetY) / renderedH) * 100;
      return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
    },
    [lightboxIndex, todasLasFotos],
  );

  /* ── Non-passive touchmove so preventDefault() works for loupe drag ── */
  useEffect(() => {
    const el = imgContainerRef.current;
    if (!el) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouchZoomRef.current && touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
        return;
      }
      if (isTouchZoomRef.current) {
        e.preventDefault();
        const touch = e.touches[0];
        setZoomPos(clientToImagePercent(touch.clientX, touch.clientY));
        setMouseClient({ cx: touch.clientX, cy: touch.clientY });
      }
    };

    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', handleTouchMove);
  });

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
      img.src = getStrapiImageUrl(todasLasFotos[i]);
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

  /* ── Reset zoom when image changes ── */
  useEffect(() => {
    setZoom(false);
    setZoomPos({ x: 50, y: 50 });
  }, [lightboxIndex]);

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
      else if (e.key === 'Escape') {
        if (zoom) {
          setZoom(false);
          setZoomPos({ x: 50, y: 50 });
        } else {
          setLightboxIndex(null);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIndex, goLightbox, zoom]);

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
                          src={getStrapiImageUrl(foto)}
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
            {/* Semi-transparent backdrop (no blur — blur is on the card) */}
            <motion.div
              className="absolute inset-0 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Glass card — auto-scaled to photo aspect ratio */}
            {(() => {
              const foto = todasLasFotos[lightboxIndex];
              const fw = foto.width || 4;
              const fh = foto.height || 5;
              const aspect = fw / fh;
              // Responsive padding: smaller on mobile
              const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;
              const pad = isMobileView ? 20 : 95;
              const p2 = pad * 2;
              return (
                <motion.div
                  className="relative z-10 flex items-center justify-center"
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: `min(98vw, calc((96vh - ${p2}px) * ${aspect} + ${p2}px))`,
                    height: `min(96vh, calc((98vw - ${p2}px) / ${aspect} + ${p2}px))`,
                    maxWidth: '99vw',
                    maxHeight: '98vh',
                  }}
                >
                  {/* Frosted glass background */}
                  <div
                    className="absolute inset-0 rounded-2xl overflow-hidden"
                    style={{
                      backdropFilter: 'blur(24px) saturate(1.4)',
                      WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                      background: 'rgba(255,255,255,0.25)',
                      border: '1px solid rgba(255,255,255,0.35)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    }}
                  />
                  {/* Image fills card minus padding */}
                  <div
                    ref={imgContainerRef}
                    className="relative overflow-hidden"
                    style={{
                      width: `calc(100% - ${pad * 2}px)`,
                      height: `calc(100% - ${pad * 2}px)`,
                      cursor: zoom ? 'none' : 'zoom-in',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!zoom) {
                        setZoom(true);
                        setZoomPos(clientToImagePercent(e.clientX, e.clientY));
                        setMouseClient({ cx: e.clientX, cy: e.clientY });
                      } else {
                        setZoom(false);
                        setZoomPos({ x: 50, y: 50 });
                      }
                    }}
                    onMouseMove={(e) => {
                      if (!zoom) return;
                      setZoomPos(clientToImagePercent(e.clientX, e.clientY));
                      setMouseClient({ cx: e.clientX, cy: e.clientY });
                    }}
                    onMouseLeave={() => {
                      if (zoom) {
                        setZoom(false);
                        setZoomPos({ x: 50, y: 50 });
                      }
                    }}
                    onTouchStart={(e) => {
                      // Long-press to activate loupe on mobile
                      const touch = e.touches[0];
                      const startX = touch.clientX;
                      const startY = touch.clientY;
                      touchTimerRef.current = setTimeout(() => {
                        isTouchZoomRef.current = true;
                        setZoom(true);
                        setZoomPos(clientToImagePercent(startX, startY));
                        setMouseClient({ cx: startX, cy: startY });
                      }, 300);
                    }}
                    onTouchMove={undefined}
                    onTouchEnd={() => {
                      if (touchTimerRef.current) {
                        clearTimeout(touchTimerRef.current);
                        touchTimerRef.current = null;
                      }
                      if (isTouchZoomRef.current) {
                        isTouchZoomRef.current = false;
                        setZoom(false);
                        setZoomPos({ x: 50, y: 50 });
                      }
                    }}
                    onTouchCancel={() => {
                      if (touchTimerRef.current) {
                        clearTimeout(touchTimerRef.current);
                        touchTimerRef.current = null;
                      }
                      if (isTouchZoomRef.current) {
                        isTouchZoomRef.current = false;
                        setZoom(false);
                        setZoomPos({ x: 50, y: 50 });
                      }
                    }}
                  >
                    <Image
                      src={getStrapiImageUrl(foto)}
                      alt={`${proyecto.titulo} — ${lightboxIndex + 1}`}
                      fill
                      className="object-contain"
                      sizes="90vw"
                      quality={95}
                      draggable={false}
                    />
                  </div>

                  {/* Floating loupe — follows cursor when zoomed */}
                  {zoom && (() => {
                    const vw = typeof window !== 'undefined' ? window.innerWidth : 1000;
                    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
                    const isMobile = vw < 768;
                    const loupeW = isMobile ? Math.min(180, vw * 0.45) : 900;
                    const loupeH = isMobile ? Math.min(180, vw * 0.45) : 580;
                    const zoomLevel = isMobile ? 2.5 : 1.8;
                    // Mobile: appear above finger; Desktop: offset left
                    const offsetX = isMobile ? 0 : -500;
                    const offsetY = isMobile ? -(loupeH / 2 + 20) : 1;
                    // Clamp loupe position to viewport
                    const rawLeft = mouseClient.cx - loupeW / 2 + offsetX;
                    const rawTop = mouseClient.cy - loupeH / 2 + offsetY;
                    const clampedLeft = Math.max(4, Math.min(rawLeft, vw - loupeW - 4));
                    const clampedTop = Math.max(4, Math.min(rawTop, vh - loupeH - 4));
                    return (
                      <div
                        className="fixed z-50 overflow-hidden pointer-events-none"
                        style={{
                          width: loupeW,
                          height: loupeH,
                          left: clampedLeft,
                          top: clampedTop,
                          borderRadius: '50%',
                          background: 'transparent',
                        }}
                      >
                        <GlassLoupe
                          imageSrc={getStrapiImageUrl(foto)}
                          zoomCenter={zoomPos}
                          zoomLevel={zoomLevel}
                          imageAspect={(foto.width || 1) / (foto.height || 1)}
                        />
                      </div>
                    );
                  })()}

              {/* Prev arrow — on top of the photo */}
              {lightboxIndex > 0 && (
                <button
                  className="absolute left-8 top-1/2 -translate-y-1/2 z-20 cursor-pointer"
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

              {/* Next arrow — on top of the photo */}
              {lightboxIndex < todasLasFotos.length - 1 && (
                <button
                  className="absolute right-8 top-1/2 -translate-y-1/2 z-20 cursor-pointer"
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
            </motion.div>
              );
            })()}

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

