'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* ── Mutable state read per-frame by R3F scenes ── */
export interface SceneInputState {
  /** Normalized parallax position [-0.5, 0.5] */
  x: number;
  y: number;
  /** Orbit / drag rotation */
  isOrbiting: boolean;
  rotationY: number;
  rotationX: number;
  /** Last pointer position (for delta calculation) */
  lastX: number;
  lastY: number;
  /** Hover state for zoom effect */
  isHovered: boolean;
}

export function createInputState(): SceneInputState {
  return {
    x: 0,
    y: 0,
    isOrbiting: false,
    rotationY: 0,
    rotationX: 0,
    lastX: 0,
    lastY: 0,
    isHovered: false,
  };
}

/* ── Constants ── */
const ORBIT_STRENGTH = 0.005;
const ORBIT_X_CLAMP = Math.PI * 0.25;
const ORIENTATION_LERP = 0.08;
const ORIENTATION_RANGE = 60; // degrees mapped to [-0.5, 0.5]
const REDUCED_MOTION_DAMP = 0.1;

/**
 * Manages mouse, touch-drag, and device-orientation input for a 3D scene.
 *
 * - **Desktop**: mouse → parallax; click-drag → orbit within ±45°.
 * - **Mobile / tablet**: device orientation → parallax (with lerp smoothing);
 *   touch-drag → orbit (fallback when orientation is unavailable or denied).
 * - **iOS Safari**: exposes `requestOrientationPermission` to call after a user
 *   gesture (required by iOS 13+).
 * - **Accessibility**: if `prefers-reduced-motion: reduce`, passive motion
 *   (parallax + orientation) is strongly dampened; user-initiated drag still works.
 *
 * Writes to a mutable `SceneInputState` that R3F scenes read in `useFrame`.
 */
export function useSceneInteraction(state: SceneInputState) {
  const [isDragging, setIsDragging] = useState(false);
  const orientationGranted = useRef(false);
  const reducedMotion = useRef(false);
  const orientationHandlerRef = useRef<
    ((e: DeviceOrientationEvent) => void) | null
  >(null);

  useEffect(() => {
    const s = state;

    /* ── Reduced motion preference ── */
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.current = mql.matches;
    const onMotionPref = (e: MediaQueryListEvent) => {
      reducedMotion.current = e.matches;
    };
    mql.addEventListener('change', onMotionPref);

    /* ── Mouse: parallax + orbit ── */
    const onMouseMove = (e: MouseEvent) => {
      const damp = reducedMotion.current ? REDUCED_MOTION_DAMP : 1;
      s.x = (e.clientX / window.innerWidth - 0.5) * damp;
      s.y = (e.clientY / window.innerHeight - 0.5) * damp;

      if (s.isOrbiting) {
        const dx = e.clientX - s.lastX;
        const dy = e.clientY - s.lastY;
        s.rotationY += dx * ORBIT_STRENGTH;
        s.rotationX = Math.max(
          -ORBIT_X_CLAMP,
          Math.min(ORBIT_X_CLAMP, s.rotationX + dy * ORBIT_STRENGTH),
        );
        s.lastX = e.clientX;
        s.lastY = e.clientY;
      }
    };

    const onMouseUp = () => {
      s.isOrbiting = false;
      setIsDragging(false);
    };

    /* ── Touch: drag/orbit ── */
    const onTouchMove = (e: TouchEvent) => {
      if (!s.isOrbiting || !e.touches[0]) return;
      const t = e.touches[0];
      const dx = t.clientX - s.lastX;
      const dy = t.clientY - s.lastY;
      s.rotationY += dx * ORBIT_STRENGTH;
      s.rotationX = Math.max(
        -ORBIT_X_CLAMP,
        Math.min(ORBIT_X_CLAMP, s.rotationX + dy * ORBIT_STRENGTH),
      );
      s.lastX = t.clientX;
      s.lastY = t.clientY;
    };

    const onTouchEnd = () => {
      s.isOrbiting = false;
      setIsDragging(false);
    };

    /* ── Device orientation (gyroscope) ── */
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (reducedMotion.current || s.isOrbiting) return;
      const beta = e.beta ?? 0; // front-to-back [-180, 180]
      const gamma = e.gamma ?? 0; // left-to-right [-90, 90]
      const targetX = Math.max(
        -0.5,
        Math.min(0.5, gamma / ORIENTATION_RANGE),
      );
      const targetY = Math.max(
        -0.5,
        Math.min(0.5, (beta - 45) / ORIENTATION_RANGE),
      );
      s.x += (targetX - s.x) * ORIENTATION_LERP;
      s.y += (targetY - s.y) * ORIENTATION_LERP;
    };
    orientationHandlerRef.current = onOrientation;

    // Non-iOS: add orientation listener directly
    if (typeof window.DeviceOrientationEvent !== 'undefined') {
      const DOE = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };
      if (typeof DOE.requestPermission !== 'function') {
        window.addEventListener('deviceorientation', onOrientation);
        orientationGranted.current = true;
      }
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      mql.removeEventListener('change', onMotionPref);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('deviceorientation', onOrientation);
    };
  }, [state]);

  /** Start an orbit drag — call from onMouseDown / onTouchStart */
  const startOrbit = useCallback(
    (clientX: number, clientY: number) => {
      state.isOrbiting = true;
      state.lastX = clientX;
      state.lastY = clientY;
      setIsDragging(true);
    },
    [state],
  );

  /** iOS Safari: request DeviceOrientationEvent permission (must be called from a user gesture) */
  const requestOrientationPermission = useCallback(async () => {
    if (orientationGranted.current) return;
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (typeof DOE.requestPermission !== 'function') return;
    try {
      const response = await DOE.requestPermission();
      if (response === 'granted' && orientationHandlerRef.current) {
        window.addEventListener(
          'deviceorientation',
          orientationHandlerRef.current,
        );
        orientationGranted.current = true;
      }
    } catch {
      // Permission denied — touch-drag fallback remains active
    }
  }, []);

  return { isDragging, startOrbit, requestOrientationPermission };
}
