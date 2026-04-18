'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '@/models';
import { getStrapiImageUrl } from '@/lib/helpers/image.helpers';
import GlassChevron from '@/components/ui/GlassChevron';

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
const ROTATION_INTERVAL = 3000;  // pausa entre rondas
const STAGGER_DELAY = 800;       // pausa entre slots dentro de una ronda

/* Duración de transición */
const TRANSITION_MS = 1200;      // duración de la animación CSS

/* Hold visual (mini pausa perceptual antes del cambio) */
const HOLD_MS = 60;              // anticipación muy breve

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
      }
      100% {
        opacity: 1;
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

        {/* MAIN — márgenes laterales consistentes */}
        <div
          className="relative z-5 px-4 md:px-6"
          style={{ height: `calc(100vh - ${headerH}px)` }}
        >
          <div
            className={`flex h-full ${isSingleSlot ? 'w-full max-w-full' : 'w-full'}`}
            style={{
              gap: `${SLOT_GAP}px`,
              maxWidth: isSingleSlot ? '100%' : `${slotsBlockWidthPx}px`,
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

  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const prevActiveRef = useRef(safeIndex);

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

  return (
    <Link
      href={`/proyecto/${activeProject.slug}`}
      className={`relative z-10 block h-full overflow-visible cursor-pointer ${
        fullWidth ? 'min-w-0 flex-1 shrink' : 'flex-1 min-w-0 shrink'
      }`}
      style={{ cursor: 'pointer', maxWidth: fullWidth ? undefined : `${SLOT_W}px` }}
    >
      <div className="group/cover absolute inset-0 z-0 overflow-hidden cursor-pointer">
        {/* Imagen anterior — se queda estática debajo */}
        {prevIndex !== null && (
          <div
            key={`bg-${animKey}`}
            className="absolute inset-0"
            style={{ zIndex: 1 }}
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

        {/* Imagen nueva — fade-in suave encima */}
        <div
          key={`enter-${animKey}`}
          className="absolute inset-0"
          style={{
            animation:
              animKey > 0
                ? `slot-enter ${TRANSITION_MS}ms ease-out forwards`
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
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex items-center justify-center pointer-events-auto"
              aria-label="Anterior"
            >
              <div className="relative w-12 h-12">
                <GlassChevron direction="left" />
              </div>
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onNext(); }}
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex items-center justify-center pointer-events-auto"
              aria-label="Siguiente"
            >
              <div className="relative w-12 h-12">
                <GlassChevron direction="right" />
              </div>
            </button>
          </>
        )}

        {/* Indicadores */}
        {hasMultiple && (
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1">
            {slot.projects.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === safeIndex ? 'w-3 bg-white' : 'w-1 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

    </Link>
  );
}
