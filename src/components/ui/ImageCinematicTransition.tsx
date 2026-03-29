'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

/* ═══════════════════════ CONFIG ═══════════════════════════════ */
const TRANSITION_MS = 900;
const AUTO_INTERVAL_MS = 4000;

/* ═══════════════════════ KEYFRAMES (inyectados una vez) ═══════ */
const STYLE_ID = 'cinematic-transition-keyframes';

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes cinematic-enter {
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

    @keyframes cinematic-exit {
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

/* ═══════════════════════ TIPOS ════════════════════════════════ */
interface ImageItem {
  src: string;
  alt?: string;
}

interface Props {
  images: ImageItem[];
  /** Rotación automática (default: true) */
  autoPlay?: boolean;
  /** Intervalo en ms (default: 4000) */
  interval?: number;
  /** Clase extra para el contenedor */
  className?: string;
  /** Aspect ratio CSS (default: 16/9) */
  aspectRatio?: string;
}

/* ═══════════════════════ COMPONENTE ══════════════════════════ */
export default function ImageCinematicTransition({
  images,
  autoPlay = true,
  interval = AUTO_INTERVAL_MS,
  className = '',
  aspectRatio = '16 / 9',
}: Props) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    injectKeyframes();
  }, []);

  const goTo = useCallback(
    (next: number) => {
      if (next === current || images.length <= 1) return;
      setPrev(current);
      setCurrent(next);
      setAnimKey((k) => k + 1);
    },
    [current, images.length],
  );

  const goNext = useCallback(() => {
    goTo((current + 1) % images.length);
  }, [current, images.length, goTo]);

  /* Auto-play */
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    timerRef.current = setTimeout(goNext, interval);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoPlay, interval, goNext, images.length]);

  /* Limpiar prev después de que termine la animación */
  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), TRANSITION_MS);
    return () => clearTimeout(t);
  }, [prev, animKey]);

  if (images.length === 0) return null;

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ aspectRatio }}
    >
      {/* Imagen saliente */}
      {prev !== null && (
        <div
          key={`exit-${animKey}`}
          className="absolute inset-0"
          style={{
            animation: `cinematic-exit ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
            zIndex: 1,
          }}
        >
          <Image
            src={images[prev].src}
            alt={images[prev].alt ?? ''}
            fill
            className="object-cover"
            sizes="100vw"
            quality={90}
          />
        </div>
      )}

      {/* Imagen entrante */}
      <div
        key={`enter-${animKey}`}
        className="absolute inset-0"
        style={{
          animation:
            animKey > 0
              ? `cinematic-enter ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`
              : undefined,
          zIndex: 2,
        }}
      >
        <Image
          src={images[current].src}
          alt={images[current].alt ?? ''}
          fill
          className="object-cover"
          sizes="100vw"
          quality={90}
          priority={current === 0}
        />
      </div>

      {/* Indicadores */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
