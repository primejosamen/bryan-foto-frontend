'use client';

import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Project } from '@/models';
import { getStrapiImageUrl } from '@/lib/helpers/image.helpers';

/* ═══════════════════════ MEDIDAS DEL DISEÑO ═══════════════════ */
const SLOT_COUNT_DESKTOP = 3;
const SLOT_W = 472;
const SLOT_GAP = 10;
const HEADER_H = 170;
const HEADER_H_MOBILE = 120;
/** max-width 767px: un solo slot a ancho completo + header más bajo */
const MOBILE_MAX = 767;
const NAV_BOTTOM = 65;
const NAV_GAP = 10;

/* Timing base */
const ROTATION_INTERVAL = 1570;  // pausa entre rondas
const STAGGER_DELAY = 500;       // pausa entre slots dentro de una ronda

/* Duración de transición */
const TRANSITION_MS = 600;       // duración de la animación CSS

/* Hold visual (mini pausa perceptual antes del cambio) */
const HOLD_MS = 120;             // anticipación muy breve

/* ═══════════════════════ KEYFRAMES CSS ═══════════════════════ */
const STYLE_ID = 'slot-cinematic-keyframes';

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes slot-enter {
      0% {
        opacity: 0;
        transform: translateX(24px) scale(1.05);
        filter: blur(12px);
      }
      100% {
        opacity: 1;
        transform: translateX(0) scale(1);
        filter: blur(0);
      }
    }
    @keyframes slot-exit {
      0% {
        opacity: 1;
        transform: translateX(0) scale(1);
        filter: blur(0);
      }
      100% {
        opacity: 0;
        transform: translateX(-18px) scale(1.02);
        filter: blur(6px);
      }
    }
  `;
  document.head.appendChild(style);
}

/* ═══════════════════════ TIPOS ═══════════════════════════════ */
interface Slot {
  projects: Project[];
}

interface Props {
  proyectos: Project[];
}

type SlotPhase = 'idle' | 'hold';

/* ═══════════════════════ COMPONENTE PRINCIPAL ═════════════════ */
export default function HomeRotatingSlots({ proyectos }: Props) {
  const [slotCount, setSlotCount] = useState<1 | 3>(3);

  useLayoutEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`);
    const apply = () => setSlotCount(mq.matches ? 1 : SLOT_COUNT_DESKTOP);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const proyectosVisibles = useMemo(() => {
    return proyectos.filter((p) => p.visible).sort((a, b) => a.orden - b.orden);
  }, [proyectos]);

  /* Desktop: 6 proyectos en 3 slots (2 por slot). Móvil: todos en 1 slot rotativo */
  const slots = useMemo<Slot[]>(() => {
    if (proyectosVisibles.length === 0) return [];

    if (slotCount === 1) {
      return [{ projects: proyectosVisibles }];
    }

    const pool = proyectosVisibles.slice(0, slotCount * 2);
    if (pool.length === 0) return [];

    const result: Slot[] = [];
    for (let i = 0; i < slotCount; i++) {
      const slotProjects: Project[] = [];
      if (i < pool.length) slotProjects.push(pool[i]);
      if (i + slotCount < pool.length) slotProjects.push(pool[i + slotCount]);
      if (slotProjects.length > 0) result.push({ projects: slotProjects });
    }
    return result;
  }, [proyectosVisibles, slotCount]);

  const [activeIndices, setActiveIndices] = useState<number[]>(() => slots.map(() => 0));
  const [slotTicks, setSlotTicks] = useState<number[]>(() => slots.map(() => 0));
  const [slotPhases, setSlotPhases] = useState<SlotPhase[]>(() => slots.map(() => 'idle'));

  /* Sincronizar arrays si cambia la data */
  useEffect(() => {
    setActiveIndices((prev) =>
      slots.map((slot, i) => {
        const prevValue = prev[i] ?? 0;
        return slot.projects.length > 0 ? prevValue % slot.projects.length : 0;
      })
    );

    setSlotTicks((prev) => slots.map((_, i) => prev[i] ?? 0));
    setSlotPhases((prev) => slots.map((_, i) => prev[i] ?? 'idle'));
  }, [slots]);

  const [paused, setPaused] = useState(false);

  /* Scheduler secuencial: slot 0 → 1 → 2 → 0 → … con intervalos fijos */
  useEffect(() => {
    if (paused || slots.length === 0) return;

    const rotatableIndices = slots
      .map((s, i) => (s.projects.length > 1 ? i : -1))
      .filter((i) => i >= 0);

    if (rotatableIndices.length === 0) return;

    let pointer = 0;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (cancelled) return;
      const slotIdx = rotatableIndices[pointer];

      setSlotPhases((prev) => {
        const next = [...prev];
        next[slotIdx] = 'hold';
        return next;
      });

      timer = setTimeout(() => {
        if (cancelled) return;

        setActiveIndices((prev) => {
          const next = [...prev];
          if (!slots[slotIdx]) return prev;
          next[slotIdx] = (next[slotIdx] + 1) % slots[slotIdx].projects.length;
          return next;
        });

        setSlotTicks((prev) => {
          const next = [...prev];
          next[slotIdx] = (next[slotIdx] ?? 0) + 1;
          return next;
        });

        setSlotPhases((prev) => {
          const next = [...prev];
          next[slotIdx] = 'idle';
          return next;
        });

        pointer = (pointer + 1) % rotatableIndices.length;
        // Si completó una ronda, pausa larga; si no, stagger corto
        const nextDelay = pointer === 0 ? ROTATION_INTERVAL : STAGGER_DELAY;
        timer = setTimeout(tick, nextDelay);
      }, HOLD_MS);
    };

    timer = setTimeout(tick, ROTATION_INTERVAL);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [paused, slots]);

  if (slots.length === 0) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-white text-black">
        <p className="opacity-40">No hay proyectos disponibles</p>
      </section>
    );
  }

  const headerH = slotCount === 1 ? HEADER_H_MOBILE : HEADER_H;
  const slotsBlockWidthPx = slotCount * SLOT_W + (slotCount - 1) * SLOT_GAP;
  const isSingleSlot = slotCount === 1;

  return (
    <section className="relative h-screen overflow-hidden bg-white text-black" style={{ clipPath: 'inset(0)' }}>

      <div className="sticky top-0 h-screen bg-white">
        {/* HEADER — menos alto en móvil para dar más aire a la foto */}
        <div
          className="relative px-4 pt-6 md:px-12 md:pt-8"
          style={{ height: `${headerH}px` }}
        />

        {/* MAIN — móvil: márgenes laterales; desktop: ancho fijo como antes */}
        <div
          className="relative z-5 px-4 md:px-0"
          style={{ height: `calc(100vh - ${headerH}px)` }}
        >
          <div
            className={`flex h-full ${isSingleSlot ? 'w-full max-w-full' : ''}`}
            style={{
              gap: `${SLOT_GAP}px`,
              width: isSingleSlot ? '100%' : `${slotsBlockWidthPx}px`,
            }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {slots.map((slot, slotIdx) => (
              <CoverSlot
                key={slotIdx}
                slot={slot}
                activeIndex={activeIndices[slotIdx] ?? 0}
                slotIndex={slotIdx}
                slotTick={slotTicks[slotIdx] ?? 0}
                slotPhase={slotPhases[slotIdx] ?? 'idle'}
                fullWidth={isSingleSlot}
                onPrev={() => {
                  setActiveIndices((prev) => {
                    const next = [...prev];
                    const len = slots[slotIdx]?.projects.length ?? 1;
                    next[slotIdx] = (next[slotIdx] - 1 + len) % len;
                    return next;
                  });
                  setSlotTicks((prev) => {
                    const next = [...prev];
                    next[slotIdx] = (next[slotIdx] ?? 0) + 1;
                    return next;
                  });
                }}
                onNext={() => {
                  setActiveIndices((prev) => {
                    const next = [...prev];
                    const len = slots[slotIdx]?.projects.length ?? 1;
                    next[slotIdx] = (next[slotIdx] + 1) % len;
                    return next;
                  });
                  setSlotTicks((prev) => {
                    const next = [...prev];
                    next[slotIdx] = (next[slotIdx] ?? 0) + 1;
                    return next;
                  });
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ COVER SLOT ══════════════════════════ */
function CoverSlot({
  slot,
  activeIndex,
  slotIndex,
  slotTick,
  slotPhase,
  fullWidth,
  onPrev,
  onNext,
}: {
  slot: Slot;
  activeIndex: number;
  slotIndex: number;
  slotTick: number;
  slotPhase: SlotPhase;
  fullWidth?: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const safeIndex = activeIndex % slot.projects.length;
  const activeProject = slot.projects[safeIndex];
  if (!activeProject) return null;
  const hasMultiple = slot.projects.length > 1;

  const [hover, setHover] = useState(false);
  const [labelClient, setLabelClient] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const prevActiveRef = useRef(safeIndex);

  useEffect(() => setMounted(true), []);
  useEffect(() => injectKeyframes(), []);

  /* Detectar cambio de imagen y guardar la anterior */
  useEffect(() => {
    if (safeIndex !== prevActiveRef.current) {
      setPrevIndex(prevActiveRef.current);
      setAnimKey((k) => k + 1);
      prevActiveRef.current = safeIndex;

      const t = setTimeout(() => setPrevIndex(null), TRANSITION_MS);
      return () => clearTimeout(t);
    }
  }, [safeIndex]);

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    setLabelClient({ x: e.clientX + 12, y: e.clientY + 12 });
  };

  return (
    <Link
      href={`/proyecto/${activeProject.slug}`}
      className={`relative z-10 block h-full overflow-visible ${
        fullWidth ? 'min-w-0 flex-1 shrink' : 'w-[472px] shrink-0'
      }`}
      style={fullWidth ? { width: '100%', minWidth: 0 } : undefined}
      onPointerEnter={(e) => {
        setHover(true);
        setLabelClient({ x: e.clientX + 12, y: e.clientY + 12 });
      }}
      onPointerLeave={() => setHover(false)}
      onPointerMove={onMove}
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Imagen saliente — cinematic exit */}
        {prevIndex !== null && (
          <div
            key={`exit-${animKey}`}
            className="absolute inset-0"
            style={{
              animation: `slot-exit ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
              zIndex: 1,
            }}
          >
            <Image
              src={getStrapiImageUrl(slot.projects[prevIndex].foto_portada)}
              alt={slot.projects[prevIndex].titulo}
              fill
              className="object-cover"
              sizes={fullWidth ? '(max-width: 767px) 100vw, 90vw' : `${SLOT_W}px`}
              quality={100}
            />
          </div>
        )}

        {/* Imagen entrante — cinematic enter */}
        <div
          key={`enter-${animKey}`}
          className="absolute inset-0"
          style={{
            animation:
              animKey > 0
                ? `slot-enter ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`
                : undefined,
            zIndex: 2,
          }}
        >
          <Image
            src={getStrapiImageUrl(activeProject.foto_portada)}
            alt={activeProject.titulo}
            fill
            className="object-cover"
            sizes={fullWidth ? '(max-width: 767px) 100vw, 90vw' : `${SLOT_W}px`}
            quality={100}
            priority={slotIndex < 3 || fullWidth}
          />
        </div>

        {/* Overlay sutil editorial */}
        <div
          className="pointer-events-none absolute inset-0 z-3"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.08), rgba(0,0,0,0.02) 30%, rgba(0,0,0,0))',
            opacity: 0.25,
          }}
        />

        {/* Botones slider — prev / next */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPrev(); }}
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex items-center justify-center text-red-500 drop-shadow-lg transition-all hover:text-red-600 hover:scale-110 pointer-events-auto"
              aria-label="Anterior"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onNext(); }}
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex items-center justify-center text-red-500 drop-shadow-lg transition-all hover:text-red-600 hover:scale-110 pointer-events-auto"
              aria-label="Siguiente"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        {/* Indicadores */}
        {hasMultiple && (
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
            {slot.projects.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-[3px] transition-all duration-300 ${
                  i === safeIndex ? 'w-4 bg-accent' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cursor follower — portal para no recortar con section / clip-path */}
      {mounted &&
        createPortal(
          <motion.div
            className="pointer-events-none fixed z-[9999]"
            style={{ left: labelClient.x, top: labelClient.y }}
            animate={{
              opacity: hover ? 1 : 0,
              scale: hover ? 1 : 0.96,
            }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
          >
            <span className="inline-flex items-center bg-accent px-1.5 py-0.5 font-ibm-mono text-[23px] italic font-bold leading-none tracking-[-0.085em] text-white">
              {activeProject.titulo}
            </span>
          </motion.div>,
          document.body
        )}
    </Link>
  );
}
