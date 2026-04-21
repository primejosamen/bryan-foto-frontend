'use client';

import { useEffect, useState } from 'react';

interface Props {
  /** When true, the splash begins its exit animation */
  ready: boolean;
  /** Minimum time (ms) the splash stays visible even if ready=true early */
  minDisplayMs?: number;
}

export default function SplashScreen({ ready, minDisplayMs = 1200 }: Props) {
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [visible, setVisible] = useState(true);

  // Ensure splash stays at least minDisplayMs
  useEffect(() => {
    const t = setTimeout(() => setMinTimePassed(true), minDisplayMs);
    return () => clearTimeout(t);
  }, [minDisplayMs]);

  const shouldExit = ready && minTimePassed;

  // After exit animation completes, remove from DOM
  useEffect(() => {
    if (!shouldExit) return;
    const t = setTimeout(() => setVisible(false), 800); // match CSS transition
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
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
        opacity: shouldExit ? 0 : 1,
        transition: 'opacity 0.7s ease-out',
        pointerEvents: shouldExit ? 'none' : 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          opacity: shouldExit ? 0 : 1,
          transform: shouldExit ? 'translateY(-12px)' : 'translateY(0)',
          transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
        }}
      >
        {/* Loader bar */}
        <div
          style={{
            width: '48px',
            height: '2px',
            background: 'rgba(255,0,0,0.15)',
            borderRadius: '1px',
            overflow: 'hidden',
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
