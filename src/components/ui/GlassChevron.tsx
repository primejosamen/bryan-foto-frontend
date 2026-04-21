'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { View, useCubeTexture } from '@react-three/drei';
import * as THREE from 'three';

import vertexShader from '@/shaders/test/vertex.glsl';
import glassFragment from '@/shaders/case/case_glass_fragment.glsl';

export { GlassChevronMesh };

/* ──────────────────────────────────────────────────
   Build a chevron shape as an extruded + bevelled mesh
   so the glass shader has real curved 3D normals.
   direction: 'left' | 'right'
   ────────────────────────────────────────────────── */
function buildChevronGeo(direction: 'left' | 'right') {
  const shape = new THREE.Shape();

  /* Chevron "<" — thin, elegant */
  const stroke = 0.08;  // visible stroke thickness
  const h  = 0.65;      // arm half-height
  const tip = 0.40;     // horizontal depth of the V

  // Outer V
  shape.moveTo(-tip, 0);          // left tip
  shape.lineTo(0, -h);            // top-right outer
  shape.lineTo(stroke, -h);       // top-right inner
  shape.lineTo(-tip + stroke, 0); // inner tip
  shape.lineTo(stroke, h);        // bottom-right inner
  shape.lineTo(0, h);             // bottom-right outer
  shape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.30,
    bevelEnabled: true,
    bevelThickness: 0.22,
    bevelSize: 0.06,
    bevelOffset: 0,
    bevelSegments: 20,
    curveSegments: 1,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.computeVertexNormals();
  geo.center();

  /* Base shape points left "<". Rotate 180° around Y for right chevron ">" */
  if (direction === 'right') {
    geo.rotateY(Math.PI);
  }

  return geo;
}

/* ──────────────────────────────────────────────────
   GlassChevronMesh — 3D extruded chevron with the
   same glass shader as Logo3D
   ────────────────────────────────────────────────── */
function GlassChevronMesh({ direction }: { direction: 'left' | 'right' }) {
  const { camera, scene } = useThree();

  const envMap = useCubeTexture(
    ['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'],
    { path: '/textures/cubemap/' },
  );

  useEffect(() => {
    envMap.colorSpace = THREE.SRGBColorSpace;
    scene.environment = envMap;
  }, [envMap, scene]);

  const mat = useMemo(
    () => {
      const m = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: glassFragment,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uEnvMap: { value: envMap },
          uEnvIntensity: { value: 9.0 },
          uTint: { value: new THREE.Color('#ffffff') },
          uOpacity: { value: 0.45 },
          uCameraPos: { value: new THREE.Vector3() },
          uIorBase: { value: 1.25 },
          uDispersion: { value: 0.12 },
          uThickness: { value: 0.06 },
          uRoughness: { value: 0.001 },
          uSpecBoost: { value: 2.2 },
          uFilmStrength: { value: 0.65 },
          uFilmScale: { value: 2.24 },
          uEnvRotation: { value: 0.0 },
        },
      });
      m.toneMapped = false;
      return m;
    },
    [envMap],
  );

  const meshRef = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => buildChevronGeo(direction), [direction]);

  useFrame(() => {
    mat.uniforms.uCameraPos.value.copy(camera.position);
    const elapsed = performance.now() / 1000;
    // Env Y rotation (same as Logo3D)
    mat.uniforms.uEnvRotation.value = elapsed * 0.20;
    // Gentle mesh wobble on X & Y for multi-axis light sweep
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(elapsed * 0.35) * 0.12;
      meshRef.current.rotation.y = Math.cos(elapsed * 0.25) * 0.15;
    }
  });

  return <mesh ref={meshRef} geometry={geo} material={mat} />;
}

/* ──────────────────────────────────────────────────
   GlassChevron — renders into the global SharedCanvas
   via a <View> portal. No extra WebGL context needed.
   ────────────────────────────────────────────────── */
export default function GlassChevron({
  className = '',
  direction = 'left',
}: {
  className?: string;
  direction?: 'left' | 'right';
}) {
  return (
    <View
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <GlassChevronMesh direction={direction} />
    </View>
  );
}
