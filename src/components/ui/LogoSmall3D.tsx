'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useCubeTexture } from '@react-three/drei';
import * as THREE from 'three';

import vertexShader from '@/shaders/test/vertex.glsl';
import glassFragment from '@/shaders/case/case_glass_fragment.glsl';
import {
  createInputState,
  useSceneInteraction,
  type SceneInputState,
} from '@/lib/hooks/useSceneInteraction';

/* ─────────────────────────────────────────────
   LogoSmallScene — logo PEQUEÑO para detalle
   ───────────────────────────────────────────── */
function LogoSmallScene({ input }: { input: SceneInputState }) {
  const groupRef = useRef<THREE.Group>(null);
  const matsRef = useRef<THREE.ShaderMaterial[]>([]);

  const { camera, gl, scene } = useThree();

  // Env map
  const envMap = useCubeTexture(
    ['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'],
    { path: '/textures/cubemap/' }
  );

  useEffect(() => {
    envMap.colorSpace = THREE.SRGBColorSpace;
    scene.environment = envMap;
    scene.environmentRotation = new THREE.Euler(0, 0.6, 0);
  }, [envMap, scene]);

  useEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.35;
    gl.setClearColor(0x000000, 0);
  }, [gl]);

  // GLB
  const { scene: gltfScene } = useGLTF('/cdcase/logobt2.glb');
  const logo = useMemo(() => gltfScene.clone(true), [gltfScene]);

  // Glass material — idéntico al diseñador
  const createGlassMaterial = useMemo(() => {
    matsRef.current = [];
    return () => {
      const mat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: glassFragment,
        side: THREE.FrontSide,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        uniforms: {
          uEnvMap: { value: envMap },
          uEnvIntensity: { value: 4.0 },
          uTint: { value: new THREE.Color('#f6fbff') },
          uOpacity: { value: 0.22 },
          uCameraPos: { value: new THREE.Vector3() },
          uIorBase: { value: 1.45 },
          uDispersion: { value: 0.34 },
          uThickness: { value: 0.16 },
          uRoughness: { value: 0.01 },
          uSpecBoost: { value: 1.10 },
          uFilmStrength: { value: 0.65 },
          uFilmScale: { value: 2.24 },
        },
      });
      mat.toneMapped = false;
      matsRef.current.push(mat);
      return mat;
    };
  }, [envMap]);

  // Posicionar: centrar y escalar
  useEffect(() => {
    logo.traverse((child: any) => {
      if (!child?.isMesh) return;
      child.material = createGlassMaterial();
      child.renderOrder = 10;
    });

    // Centrar geometría
    const box = new THREE.Box3().setFromObject(logo);
    const center = box.getCenter(new THREE.Vector3());

    logo.position.set(-center.x, -center.y, -center.z);
    logo.rotation.set(0, 0, 0);
    logo.scale.set(1, 1, 1);

    if (groupRef.current) {
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0]);
      }
      groupRef.current.add(logo);
    }
  }, [logo, createGlassMaterial]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (groupRef.current) {
        while (groupRef.current.children.length > 0) {
          groupRef.current.remove(groupRef.current.children[0]);
        }
      }
      matsRef.current.forEach((mat) => mat.dispose());
      matsRef.current = [];
    };
  }, []);

  // Parallax — uses shared input state (mouse + orientation)
  const persp = camera as THREE.PerspectiveCamera;
  useFrame(() => {
    const targetX = input.x * 0.15;
    const targetY = input.y * 0.08;
    persp.position.x += (targetX - persp.position.x) * 0.05;
    persp.position.y += (targetY - persp.position.y) * 0.05;
    persp.lookAt(0, 0, 0);

    for (const mat of matsRef.current) {
      (mat.uniforms.uCameraPos.value as THREE.Vector3).copy(persp.position);
    }
  });

  return <group ref={groupRef} />;
}

/* ─────────────────────────────────────────────
   LogoSmall3D — Componente exportado
   Alineado con el título/subtítulo en la
   esquina superior izquierda del detalle
   ───────────────────────────────────────────── */
export default function LogoSmall3D() {
  const inputRef = useRef<SceneInputState | null>(null);
  if (!inputRef.current) inputRef.current = createInputState();
  const input = inputRef.current;

  // Parallax-only: no orbit interaction zone, but orientation + reduced-motion handled
  useSceneInteraction(input);

  return (
    <div
      style={{
        position: 'absolute',
        top: 55,
        left: -195,
        width: '1000px',
        height: '200px',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 5.5], fov: 45, near: 0.1, far: 50 }}
        style={{
          background: 'transparent',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
        dpr={[1, 2]}
      >
        <LogoSmallScene input={input} />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/cdcase/logobt2.glb');
