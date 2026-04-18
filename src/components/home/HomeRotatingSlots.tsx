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
const MOBILE_MAX = 767;

/* Timing base */
const ROTATION_INTERVAL = 3000;
const STAGGER_DELAY = 800;

/* Crossfade (CSS transition, no flash) */
const CROSSFADE_MS = 1400;

/* Ken Burns — longer than display time so zoom never fully completes */
const KB_DURATION_MS = 10000;
const KB_VARIANT_COUNT = 5;

/* ═══════════════════════ KEYFRAMES CSS ═══════════════════════ */
const STYLE_ID = 'slot-kenburns-keyframes';

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes kb-v0 {
      from { transform: scale(1) translate(0%, 0%); }
      to   { transform: scale(1.08) translate(-1.5%, -1%); }
    }
    @keyframes kb-v1 {
      from { transform: scale(1) translate(0%, 0%); }
      to   { transform: scale(1.06) translate(1%, -1.5%); }
    }
    @keyframes kb-v2 {
      from { transform: scale(1) translate(0%, 0%); }
      to   { transform: scale(1.07) translate(-0.5%, 1.2%); }
    }
    @keyframes kb-v3 {
      from { transform: scale(1.06) translate(1%, 0.5%); }
      to   { transform: scale(1) translate(0%, 0%); }
    }
    @keyframes kb-v4 {
      from { transform: scale(1.05) translate(-1%, -0.8%); }
      to   { transform: scale(1) translate(0.5%, 0.5%); }
    }
  `;
  document.head.appendChild(style);
}

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
  onPrev,
  onNext,
}: {
  slot: Slot;
  activeIndex: number;
  slotIndex: number;
  slotTick: number;
  fullWidth?: boolean;
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

  useEffect(() => injectKeyframes(), []);

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

  const getKbVariant = (tick: number) => (tick + slotIndex) % KB_VARIANT_COUNT;

  const sizeStr = fullWidth ? '(max-width: 767px) 100vw, 90vw' : `${SLOT_W}px`;

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
        <div
          key={`kb-${layer.tick}`}
          className="absolute inset-0"
          style={{
            animation: `kb-v${getKbVariant(layer.tick)} ${KB_DURATION_MS}ms ease-out both`,
            willChange: 'transform',
          }}
        >
          <Image
            src={getStrapiImageUrl(project.foto_portada)}
            alt={project.titulo}
            fill
            className="object-cover"
            sizes={sizeStr}
            quality={100}
            priority={slotIndex < 3 || fullWidth}
          />
        </div>
      </div>
    );
  };

  return (
    <Link
      href={`/proyecto/${activeProject.slug}`}
      className={`relative z-10 block h-full overflow-visible cursor-pointer ${
        fullWidth ? 'min-w-0 flex-1 shrink' : 'flex-1 min-w-0 shrink'
      }`}
      style={{ cursor: 'pointer', maxWidth: fullWidth ? undefined : `${SLOT_W}px` }}
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
