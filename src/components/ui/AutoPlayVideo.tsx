'use client';

/**
 * Video element that reliably autoplays on mobile and desktop,
 * including in-app browsers (Instagram, Facebook, TikTok, etc.).
 *
 * Strategy:
 *  1. HTML attributes: autoPlay + muted + playsInline + preload="auto".
 *  2. Programmatic `.play()` on mount and on `canplay`/`loadeddata`.
 *  3. Forces `video.muted = true` via JS (iOS sometimes ignores the attribute).
 *  4. IntersectionObserver: play when in viewport, pause when out.
 *  5. `visibilitychange`: retry play when tab/webview becomes visible
 *     (covers Instagram opening the page in background).
 *  6. Global first-touch listener: in-app browsers often unlock autoplay
 *     only after the first user interaction — we retry all paused videos.
 *
 * @module components/ui/AutoPlayVideo
 */

import { useEffect, useRef, useCallback } from 'react';

/* ── Global first-interaction unlock ──────────────────────────────── */
const pendingVideos = new Set<HTMLVideoElement>();
let listenerAttached = false;

function attachFirstInteractionListener() {
  if (listenerAttached) return;
  listenerAttached = true;

  const unlock = () => {
    pendingVideos.forEach((v) => {
      if (v.paused) {
        v.muted = true;
        v.play().catch(() => {});
      }
    });
    // One unlock is enough — remove listeners.
    window.removeEventListener('touchstart', unlock, { capture: true });
    window.removeEventListener('click', unlock, { capture: true });
    window.removeEventListener('scroll', unlock, { capture: true });
  };

  window.addEventListener('touchstart', unlock, { capture: true, passive: true });
  window.addEventListener('click', unlock, { capture: true });
  window.addEventListener('scroll', unlock, { capture: true, passive: true });
}

/* ── Component ────────────────────────────────────────────────────── */

interface Props {
  src: string;
  poster?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function AutoPlayVideo({ src, poster, className = '', style }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  /** Safely attempt play, swallowing AbortError / NotAllowedError. */
  const tryPlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;

    v.muted = true;

    if (!v.paused) return;

    v.play().catch(() => {
      /* Browser blocked autoplay — will retry on user interaction. */
    });
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // Register for global first-interaction unlock.
    pendingVideos.add(v);
    attachFirstInteractionListener();

    // Attempt immediate play.
    tryPlay();

    // Retry when browser has decoded enough data.
    const onReady = () => tryPlay();
    v.addEventListener('canplay', onReady);
    v.addEventListener('loadeddata', onReady);

    // Play/pause as the video enters or leaves the viewport.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          tryPlay();
        } else {
          v.pause();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(v);

    // Retry when the page becomes visible (Instagram opens pages in background).
    const onVisibility = () => {
      if (document.visibilityState === 'visible') tryPlay();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      pendingVideos.delete(v);
      v.removeEventListener('canplay', onReady);
      v.removeEventListener('loadeddata', onReady);
      document.removeEventListener('visibilitychange', onVisibility);
      observer.disconnect();
    };
  }, [tryPlay]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      preload="auto"
      autoPlay
      loop
      muted
      playsInline
      webkit-playsinline=""
      className={className}
      style={style}
    />
  );
}
