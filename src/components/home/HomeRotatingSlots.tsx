'use client';

import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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
const ROTATION_INTERVAL = 4000;
const STAGGER_DELAY = 550;

/* Modulación suave (sin random agresivo) */
const TIME_WAVE_AMPLITUDE = 420;
const TIME_WAVE_SPEED = 0.9;
const TIME_WAVE_PHASE_STEP = 0.85;

/* Duración de transición */
const BASE_SLIDE_DURATION = 0.98;
const SLOT_DURATION_STEP = 0.08;
const DURATION_WAVE_AMPLITUDE = 0.06;

/* Hold visual (mini pausa perceptual antes del cambio) */
const HOLD_BASE_MS = 260;
const HOLD_SLOT_STEP_MS = 35;
const HOLD_WAVE_AMPLITUDE_MS = 25;

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

  /* Scheduler con modulación suave + stagger + hold perceptual */
  useEffect(() => {
    if (paused || slots.length === 0) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const cancelled = { current: false };

    slots.forEach((slot, slotIdx) => {
      if (slot.projects.length <= 1) return;

      let localTick = 0;

      const scheduleNext = () => {
        if (cancelled.current) return;

        const wave = Math.sin(localTick * TIME_WAVE_SPEED + slotIdx * TIME_WAVE_PHASE_STEP);

        const totalCycleDelay =
          ROTATION_INTERVAL +
          slotIdx * STAGGER_DELAY +
          TIME_WAVE_AMPLITUDE * wave;

        const holdMs =
          HOLD_BASE_MS +
          slotIdx * HOLD_SLOT_STEP_MS +
          HOLD_WAVE_AMPLITUDE_MS * Math.sin(localTick * 0.7 + slotIdx * 0.8);

        const visibleHoldDelay = Math.max(2200, totalCycleDelay - holdMs);

        // 1) espera principal (la portada “respira” normal)
        const t1 = setTimeout(() => {
          if (cancelled.current) return;

          // 2) entrar en fase HOLD (mini pausa perceptual / anticipación)
          setSlotPhases((prev) => {
            const next = [...prev];
            next[slotIdx] = 'hold';
            return next;
          });

          // 3) al terminar el hold, ejecutar el cambio
          const t2 = setTimeout(() => {
            if (cancelled.current) return;

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

            localTick += 1;
            scheduleNext();
          }, Math.max(180, holdMs));

          timeouts.push(t2);
        }, visibleHoldDelay);

        timeouts.push(t1);
      };

      const initialDelay = 450 + slotIdx * 300;
      const t0 = setTimeout(scheduleNext, initialDelay);
      timeouts.push(t0);
    });

    return () => {
      cancelled.current = true;
      timeouts.forEach(clearTimeout);
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
}: {
  slot: Slot;
  activeIndex: number;
  slotIndex: number;
  slotTick: number;
  slotPhase: SlotPhase;
  fullWidth?: boolean;
}) {
  const safeIndex = activeIndex % slot.projects.length;
  const activeProject = slot.projects[safeIndex];
  if (!activeProject) return null;
  const hasMultiple = slot.projects.length > 1;

  const [hover, setHover] = useState(false);
  const [labelClient, setLabelClient] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    setLabelClient({ x: e.clientX + 12, y: e.clientY + 12 });
  };

  /* Duración ligeramente distinta por slot + pequeña modulación */
  const durationWave = Math.sin(slotTick * 0.65 + slotIndex * 0.9);
  const slideDuration =
    BASE_SLIDE_DURATION +
    slotIndex * SLOT_DURATION_STEP +
    DURATION_WAVE_AMPLITUDE * durationWave;

  /* Easing estándar/suave */
  const softEases: [number, number, number, number][] = [
    [0.37, 0, 0.63, 1],
    [0.4, 0, 0.6, 1],
  ];
  const slideEase = softEases[(slotIndex + slotTick) % softEases.length];

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
        {/* Wrapper de HOLD visual: mini “suspensión” antes del slide */}
        <motion.div
          className="absolute inset-0 z-1"
          animate={
            slotPhase === 'hold'
              ? { scale: 1.006, y: -2, filter: 'brightness(0.985)' }
              : { scale: 1, y: 0, filter: 'brightness(1)' }
          }
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeProject.id}
              className="absolute inset-0"
              initial={{ y: '100%', opacity: 0.92, scale: 1.008 }}
              animate={{ y: '0%', opacity: 1, scale: 1 }}
              exit={{ y: '-100%', opacity: 0.92, scale: 1.004 }}
              transition={{
                duration: slideDuration,
                ease: slideEase,
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
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Overlay sutil de hold (apenas perceptible, editorial) */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-2"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.08), rgba(0,0,0,0.02) 30%, rgba(0,0,0,0))',
          }}
          animate={{ opacity: slotPhase === 'hold' ? 0.55 : 0.25 }}
          transition={{ duration: 0.18, ease: 'easeInOut' }}
        />

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
