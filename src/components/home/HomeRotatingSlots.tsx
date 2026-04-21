'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '@/models';
import { getOptimizedImageUrl } from '@/lib/helpers/image.helpers';
import GlassChevron from '@/components/ui/GlassChevron';

/* ═══════════════════════ MEDIDAS DEL DISEÑO ═══════════════════ */
const SLOT_COUNT_DESKTOP = 3;
const SLOT_W = 472;
const SLOT_GAP = 10;
const HEADER_H = 170;
const HEADER_H_MOBILE = 120;
const MOBILE_MAX = 767;

/* Desktop: reservamos canvas a la derecha para el logo */
const DESKTOP_RIGHT_RESERVE_MIN = 240;
const DESKTOP_RIGHT_RESERVE_MAX = 820;
const DESKTOP_RIGHT_RESERVE_VW = 0.3; // ~30vw como en otras secciones
const DESKTOP_SIDE_PADDING_PX = 48; // md:px-6 (24px por lado)
const DESKTOP_SLOT_W_MIN = 160;
const WIDE_SCREEN_BP = 2000;
const WIDE_SCREEN_EXTRA_RIGHT_RESERVE = 80;

/* Timing base */
const ROTATION_INTERVAL = 3000;
const STAGGER_DELAY = 800;

/* Crossfade (CSS transition, no flash) */
const CROSSFADE_MS = 600;



/* ═══════════════════════ STAGGER PATTERNS ════════════════════ */
const STAGGER_PATTERNS = [
  [0, 1, 2], // ida: 1→2→3
  [2, 1, 0], // vuelta: 3→2→1
  [1, 0, 2], // centro hacia afuera: 2→1→3
];

/* ═══════════════════════ TIPOS ═══════════════════════════════ */
interface Slot {
  projects: Project[];
}

interface Props {
  proyectos: Project[];
}

/* ═══════════════════════ COMPONENTE PRINCIPAL ═════════════════ */
export default function HomeRotatingSlots({ proyectos }: Props) {
  const [slotCount, setSlotCount] = useState<1 | 3>(3);
  const [desktopSlotW, setDesktopSlotW] = useState(SLOT_W);

  useLayoutEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`);
    const apply = () => {
      const isMobile = mq.matches;
      setSlotCount(isMobile ? 1 : SLOT_COUNT_DESKTOP);

      if (!isMobile) {
        const vw = window.innerWidth;
        const extra = vw >= WIDE_SCREEN_BP ? WIDE_SCREEN_EXTRA_RIGHT_RESERVE : 0;
        const rightReserve = Math.min(
          DESKTOP_RIGHT_RESERVE_MAX,
          Math.max(
            DESKTOP_RIGHT_RESERVE_MIN,
            Math.round(vw * DESKTOP_RIGHT_RESERVE_VW) + extra
          )
        );

        // Compartimos con Logo3D para ubicar el logo en el "aire" de la derecha
        document.documentElement.style.setProperty('--home-right-reserve', `${rightReserve}px`);

        const availableLeft = Math.max(0, vw - DESKTOP_SIDE_PADDING_PX - rightReserve);
        const computed = Math.floor(
          (availableLeft - (SLOT_COUNT_DESKTOP - 1) * SLOT_GAP) / SLOT_COUNT_DESKTOP
        );

        const nextW = Math.min(SLOT_W, Math.max(DESKTOP_SLOT_W_MIN, computed || DESKTOP_SLOT_W_MIN));
        setDesktopSlotW(nextW);
      } else {
        document.documentElement.style.removeProperty('--home-right-reserve');
        setDesktopSlotW(SLOT_W);
      }
    };
    apply();
    mq.addEventListener('change', apply);
    window.addEventListener('resize', apply);
    return () => {
      mq.removeEventListener('change', apply);
      window.removeEventListener('resize', apply);
      document.documentElement.style.removeProperty('--home-right-reserve');
    };
  }, []);

  const proyectosVisibles = useMemo(() => {
    return proyectos.filter((p) => p.visible).sort((a, b) => a.orden - b.orden);
  }, [proyectos]);

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

  useEffect(() => {
    setActiveIndices((prev) =>
      slots.map((slot, i) => {
        const prevValue = prev[i] ?? 0;
        return slot.projects.length > 0 ? prevValue % slot.projects.length : 0;
      })
    );
    setSlotTicks((prev) => slots.map((_, i) => prev[i] ?? 0));
  }, [slots]);

  const [paused, setPaused] = useState(false);

  /* ── Scheduler con patrones de stagger alternados ── */
  useEffect(() => {
    if (paused || slots.length === 0) return;

    const rotatableIndices = slots
      .map((s, i) => (s.projects.length > 1 ? i : -1))
      .filter((i) => i >= 0);

    if (rotatableIndices.length === 0) return;

    let patternIdx = 0;
    let pointer = 0;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const getCurrentOrder = (): number[] => {
      if (rotatableIndices.length <= 1) return rotatableIndices;
      const pattern = STAGGER_PATTERNS[patternIdx % STAGGER_PATTERNS.length];
      return pattern
        .filter((i) => i < rotatableIndices.length)
        .map((i) => rotatableIndices[i]);
    };

    let currentOrder = getCurrentOrder();

    const tick = () => {
      if (cancelled) return;
      const slotIdx = currentOrder[pointer];

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

      pointer += 1;

      if (pointer >= currentOrder.length) {
        pointer = 0;
        patternIdx += 1;
        currentOrder = getCurrentOrder();
        timer = setTimeout(tick, ROTATION_INTERVAL);
      } else {
        timer = setTimeout(tick, STAGGER_DELAY);
      }
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
  const slotW = slotCount === 1 ? SLOT_W : desktopSlotW;
  const slotsBlockWidthPx = slotCount * slotW + (slotCount - 1) * SLOT_GAP;
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
          className={`relative z-5 px-4 md:px-6 min-w-0 overflow-hidden`}
          style={{ height: `calc(100vh - ${headerH}px)` }}
        >
          <div
            className={`flex h-full ${isSingleSlot ? 'w-full max-w-full' : 'shrink-0'}`}
            style={{
              gap: `${SLOT_GAP}px`,
              ...(isSingleSlot
                ? { width: '100%', maxWidth: '100%' }
                : {}),
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
                fullWidth={isSingleSlot}
                slotW={slotW}
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

/* ═══════════════════════ COVER SLOT (double-buffered Ken Burns) ═══ */
interface LayerState {
  imgIndex: number;
  tick: number;
}

function CoverSlot({
  slot,
  activeIndex,
  slotIndex,
  slotTick,
  fullWidth,
  slotW,
  onPrev,
  onNext,
}: {
  slot: Slot;
  activeIndex: number;
  slotIndex: number;
  slotTick: number;
  fullWidth?: boolean;
  slotW: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const safeIndex = activeIndex % slot.projects.length;
  const activeProject = slot.projects[safeIndex];
  if (!activeProject) return null;
  const hasMultiple = slot.projects.length > 1;

  const [layerA, setLayerA] = useState<LayerState>({ imgIndex: safeIndex, tick: 0 });
  const [layerB, setLayerB] = useState<LayerState>({ imgIndex: safeIndex, tick: 0 });
  const [front, setFront] = useState<'A' | 'B'>('A');
  const frontRef = useRef<'A' | 'B'>('A');
  const prevSafeRef = useRef(safeIndex);

  useEffect(() => {
    if (safeIndex !== prevSafeRef.current) {
      prevSafeRef.current = safeIndex;

      if (frontRef.current === 'A') {
        setLayerB((prev) => ({ imgIndex: safeIndex, tick: prev.tick + 1 }));
        setFront('B');
        frontRef.current = 'B';
      } else {
        setLayerA((prev) => ({ imgIndex: safeIndex, tick: prev.tick + 1 }));
        setFront('A');
        frontRef.current = 'A';
      }
    }
  }, [safeIndex]);

  /* Móvil: ancho pantalla; escritorio: ancho fijo del diseño (evita pedir src enorme en monitores anchos) */
  const sizeStr = fullWidth
    ? `(max-width: ${MOBILE_MAX}px) 100vw, min(100vw, ${SLOT_W}px)`
    : `${slotW}px`;

  const renderLayer = (layer: LayerState, isFront: boolean) => {
    const project = slot.projects[layer.imgIndex];
    if (!project) return null;

    return (
      <div
        className="absolute inset-0"
        style={{
          opacity: isFront ? 1 : 0,
          transition: `opacity ${CROSSFADE_MS}ms ease-in-out`,
          zIndex: isFront ? 2 : 1,
        }}
      >
        {/* Only mount <Image> for the front layer; back layer stays as
            an empty div so the CSS opacity transition has a target,
            but we avoid decoding an invisible image. */}
        {isFront && (
          <Image
            src={getOptimizedImageUrl(project.foto_portada, 800)}
            alt={project.titulo}
            fill
            className="object-cover"
            sizes={sizeStr}
            quality={80}
            priority={slotIndex < 3 || fullWidth}
          />
        )}
      </div>
    );
  };

  return (
    <Link
      href={`/proyecto/${activeProject.slug}`}
      className={`relative z-10 block h-full overflow-visible cursor-pointer ${
        fullWidth ? 'min-w-0 w-full flex-1 shrink' : 'flex-1 min-w-0'
      }`}
      style={{
        cursor: 'pointer',
        ...(fullWidth ? {} : { maxWidth: slotW }),
      }}
    >
      <div className="group/cover absolute inset-0 z-0 overflow-hidden cursor-pointer">
        {/* Layer A */}
        {renderLayer(layerA, front === 'A')}
        {/* Layer B */}
        {renderLayer(layerB, front === 'B')}

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
