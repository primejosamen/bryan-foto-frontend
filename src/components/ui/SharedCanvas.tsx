'use client';

import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { View } from '@react-three/drei';
import * as THREE from 'three';

/** Apply renderer settings once for the shared canvas */
function RendererConfig() {
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.35;
    gl.setClearColor(0x000000, 0);
  }, [gl]);

  return null;
}

/**
 * Global R3F canvas that renders all <View> portals.
 * Wraps page content so inline <View> elements share
 * a **single WebGL context**.
 */
export default function SharedCanvas({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative' }}>
      {children}
      <Canvas
        gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
        camera={{ position: [0, 0, 3], fov: 40 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      >
        <RendererConfig />
        <View.Port />
      </Canvas>
    </div>
  );
}
