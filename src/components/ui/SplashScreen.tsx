'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  /** When true, the splash begins its exit animation */
  ready: boolean;
  /** Minimum time (ms) the splash stays visible even if ready=true early */
  minDisplayMs?: number;
}

export default function SplashScreen({ ready, minDisplayMs = 1200 }: Props) {
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [visible, setVisible] = useState(true);
  const [needsBlend, setNeedsBlend] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Detect if browser falls back to MP4 (no WebM alpha support → iOS Safari)
  useEffect(() => {
    const v = document.createElement('video');
    const canWebm = v.canPlayType('video/webm; codecs="vp8"') ||
                     v.canPlayType('video/webm; codecs="vp9"');
    if (!canWebm) setNeedsBlend(true);
  }, []);

  // Ensure splash stays at least minDisplayMs
  useEffect(() => {
    const t = setTimeout(() => setMinTimePassed(true), minDisplayMs);
    return () => clearTimeout(t);
  }, [minDisplayMs]);

  const shouldExit = ready && minTimePassed;

  // After exit animation completes, remove from DOM
  useEffect(() => {
    if (!shouldExit) return;
    const t = setTimeout(() => setVisible(false), 800);
    return () => clearTimeout(t);
  }, [shouldExit]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
        opacity: shouldExit ? 0 : 1,
        transition: 'opacity 0.7s ease-out',
        pointerEvents: shouldExit ? 'none' : 'auto',
      }}
    >
      {/* Animated 3D logo */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: 'min(60vw, 480px)',
          height: 'auto',
          opacity: shouldExit ? 0 : 1,
          transform: shouldExit ? 'scale(1.05)' : 'scale(1)',
          transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
          /* On iOS Safari MP4 has black bg (no alpha) — screen blend removes it */
          mixBlendMode: needsBlend ? 'screen' : undefined,
        }}
      >
        <source src="/splash-logo.webm" type="video/webm" />
        <source src="/splash-logo.mp4" type="video/mp4" />
      </video>

      {/* Loader bar below the logo */}
      <div
        style={{
          marginTop: '24px',
          width: '48px',
          height: '2px',
          background: 'rgba(255,0,0,0.15)',
          borderRadius: '1px',
          overflow: 'hidden',
          opacity: shouldExit ? 0 : 1,
          transition: 'opacity 0.4s ease-out',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#ff0000',
            transformOrigin: 'left',
            animation: 'splash-bar 1.4s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes splash-bar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
