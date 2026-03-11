'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project } from '@/models';
import { getStrapiImageUrl } from '@/lib/helpers/image.helpers';
import Logo3D from '@/components/ui/Logo3D';

/* ═══════════════════════ MEDIDAS DEL DISEÑO ═══════════════════ */
const SLOT_COUNT = 3;
const SLOT_W = 472;
const SLOT_GAP = 10;
const HEADER_H = 270;
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
  const proyectosVisibles = useMemo(() => {
    return proyectos.filter((p) => p.visible).sort((a, b) => a.orden - b.orden);
  }, [proyectos]);

  /* Distribuir 6 proyectos en 3 slots (2 por slot) */
  const slots = useMemo<Slot[]>(() => {
    const pool = proyectosVisibles.slice(0, SLOT_COUNT * 2);
    if (pool.length === 0) return [];

    const result: Slot[] = [];
    for (let i = 0; i < SLOT_COUNT; i++) {
      const slotProjects: Project[] = [];
      if (i < pool.length) slotProjects.push(pool[i]);
      if (i + SLOT_COUNT < pool.length) slotProjects.push(pool[i + SLOT_COUNT]);
      if (slotProjects.length > 0) result.push({ projects: slotProjects });
    }
    return result;
  }, [proyectosVisibles]);

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

  const slotsBlockWidth = SLOT_COUNT * SLOT_W + (SLOT_COUNT - 1) * SLOT_GAP;

  return (
    <section className="relative bg-white text-black" style={{ height: '100vh', overflow: 'hidden' }}>
      <Logo3D />

      {/* NAV fijo */}
      <div
        style={{
          position: 'fixed',
          left: slotsBlockWidth + NAV_GAP,
          right: 0,
          bottom: NAV_BOTTOM,
          zIndex: 9999,
          pointerEvents: 'auto',
          paddingRight: 58,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 40,
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginBottom: 10,
          }}
        >
          <HomeNavLink href="/about">About</HomeNavLink>
          <HomeNavLink href="/contacto">Contact</HomeNavLink>
        </div>

        <div style={{ height: 10, background: '#ff0000', width: '100%' }} />
      </div>

      <div className="sticky top-0 h-screen bg-white">
        {/* HEADER */}
        <div className="relative px-12 pt-8" style={{ height: `${HEADER_H}px` }}>
          <button
            aria-label="Menu"
            className="absolute left-12 top-10"
            style={{ zIndex: 100, position: 'relative' }}
          >
            <span className="block w-10 h-[6px] bg-black" />
          </button>

          <button
            aria-label="Open"
            className="absolute right-12 top-8"
            style={{ zIndex: 100, position: 'relative' }}
          >
            <span className="text-3xl leading-none select-none">+</span>
          </button>
        </div>

        {/* MAIN */}
        <div
          style={{
            position: 'relative',
            height: `calc(100vh - ${HEADER_H}px)`,
            zIndex: 5,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: `${SLOT_GAP}px`,
              height: '100%',
              width: `${slotsBlockWidth}px`,
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
}: {
  slot: Slot;
  activeIndex: number;
  slotIndex: number;
  slotTick: number;
  slotPhase: SlotPhase;
}) {
  const activeProject = slot.projects[activeIndex];
  const hasMultiple = slot.projects.length > 1;

  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
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
      style={{
        width: `${SLOT_W}px`,
        flexShrink: 0,
        position: 'relative',
        display: 'block',
        height: '100%',
        overflow: 'hidden',
        zIndex: 10,
      }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onPointerMove={onMove}
    >
      {/* Wrapper de HOLD visual: mini “suspensión” antes del slide */}
      <motion.div
        style={{ position: 'absolute', inset: 0, zIndex: 1 }}
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
            style={{
              position: 'absolute',
              inset: 0,
            }}
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
              style={{ objectFit: 'cover' }}
              sizes={`${SLOT_W}px`}
              quality={100}
              priority={slotIndex < 3}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Overlay sutil de hold (apenas perceptible, editorial) */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          background:
            'linear-gradient(to top, rgba(0,0,0,0.08), rgba(0,0,0,0.02) 30%, rgba(0,0,0,0))',
        }}
        animate={{ opacity: slotPhase === 'hold' ? 0.55 : 0.25 }}
        transition={{ duration: 0.18, ease: 'easeInOut' }}
      />

      {/* Indicadores */}
      {hasMultiple && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            display: 'flex',
            gap: 6,
          }}
        >
          {slot.projects.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === activeIndex ? 16 : 6,
                height: 6,
                borderRadius: 3,
                background: i === activeIndex ? '#ff0000' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* Título — solo hover */}
      <AnimatePresence>
        {hover && (
          <motion.div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 30,
              padding: 16,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <span
              style={{
                display: 'inline-block',
                fontFamily: 'var(--font-ibm-plex-sans), IBM Plex Sans, sans-serif',
                fontSize: 16,
                fontWeight: 600,
                color: '#ffffff',
                background: '#ff0000',
                padding: '8px 12px',
                lineHeight: 1,
              }}
            >
              {activeProject.titulo}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cursor follower */}
      <motion.div
        style={{
          position: 'absolute',
          left: pos.x,
          top: pos.y,
          transform: 'translate(12px, 12px)',
          zIndex: 40,
          pointerEvents: 'none',
        }}
        animate={{
          opacity: hover ? 1 : 0,
          scale: hover ? 1 : 0.96,
        }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontFamily: 'var(--font-ibm-plex-sans), IBM Plex Sans, sans-serif',
            fontSize: 13,
            fontWeight: 500,
            color: '#ffffff',
            background: 'rgba(0,0,0,0.8)',
            padding: '6px 10px',
            lineHeight: 1,
            letterSpacing: '0.04em',
          }}
        >
          Ver proyecto →
        </span>
      </motion.div>
    </Link>
  );
}

/* ═══════════════════════ NAV LINK ════════════════════════════ */
function HomeNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'IBM Plex Sans, sans-serif',
        fontSize: 16,
        fontWeight: 600,
        color: '#ffffff',
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: -12,
          right: -12,
          top: -8,
          bottom: -8,
          background: '#ff0000',
          pointerEvents: 'none',
        }}
      />
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </Link>
  );
}