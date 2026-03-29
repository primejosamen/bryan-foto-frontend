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
   LogoAboutScene — fix2.glb with glass shader
   ───────────────────────────────────────────── */
function LogoAboutScene({ input }: { input: SceneInputState }) {
  const groupRef = useRef<THREE.Group>(null);
  const matsRef = useRef<THREE.ShaderMaterial[]>([]);
  const { camera, gl, scene } = useThree();

  //#region Environment
  const envMap = useCubeTexture(
    ['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'],
    { path: '/textures/cubemap/' },
  );

  useEffect(() => {
    envMap.colorSpace = THREE.SRGBColorSpace;
    scene.environment = envMap;
    scene.environmentRotation = new THREE.Euler(0, 0.6, 0);
  }, [envMap, scene]);
  //#endregion Environment

  //#region Renderer
  useEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.35;
    gl.setClearColor(0x000000, 0);
  }, [gl]);
  //#endregion Renderer

  //#region Camera
  const cameraBasePos = useMemo(() => new THREE.Vector3(0, 1.1, 5.8), []);
  const parallaxStrength = useMemo(() => ({ x: 0.8, y: 0.4 }), []);
  const cameraLerp = 0.05;
  //#endregion Camera

  //#region Model
  const { scene: gltfScene } = useGLTF('/cdcase/fix2.glb');
  const logo = useMemo(() => gltfScene.clone(true), [gltfScene]);
  //#endregion Model

  //#region Glass Material
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
  //#endregion Glass Material

  //#region Positioning
  useEffect(() => {
    logo.traverse((child: any) => {
      if (!child?.isMesh) return;
      child.material = createGlassMaterial();
      child.renderOrder = 10;
    });

    logo.position.set(0, 0, 0);
    logo.rotation.set(0, 0, 0);
    logo.scale.set(5.1, 5.1, 5.1);

    if (groupRef.current) {
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0]);
      }
      groupRef.current.add(logo);
    }
  }, [logo, createGlassMaterial]);
  //#endregion Positioning

  //#region Cleanup
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
  //#endregion Cleanup

  //#region Animation — parallax + orbit (same as Logo3D)
  const persp = camera as THREE.PerspectiveCamera;

  useFrame(() => {
    if (!input.isOrbiting) {
      const targetX = cameraBasePos.x + input.x * parallaxStrength.x;
      const targetY = cameraBasePos.y + input.y * parallaxStrength.y;
      persp.position.x += (targetX - persp.position.x) * cameraLerp;
      persp.position.y += (targetY - persp.position.y) * cameraLerp;
      persp.position.z = cameraBasePos.z;
      persp.lookAt(0, 0.6, 0);
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = input.rotationY;
      groupRef.current.rotation.x = input.rotationX;
    }

    for (const mat of matsRef.current) {
      (mat.uniforms.uCameraPos.value as THREE.Vector3).copy(persp.position);
    }
  });
  //#endregion Animation

  return <group ref={groupRef} />;
}

/* ─────────────────────────────────────────────
   LogoAbout3D — Full-screen fixed canvas
   with orbit/drag interaction zone
   ───────────────────────────────────────────── */
export default function LogoAbout3D() {
  const inputRef = useRef<SceneInputState | null>(null);
  if (!inputRef.current) inputRef.current = createInputState();
  const input = inputRef.current;

  const { isDragging, startOrbit, requestOrientationPermission } =
    useSceneInteraction(input);

  return (
    <>
      {/* CANVAS — full-screen fixed, behind content */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <Canvas
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 1.1, 5.8], fov: 60, near: 0.1, far: 100 }}
          style={{
            background: 'transparent',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
          dpr={[1, 2]}
        >
          <LogoAboutScene input={input} />
        </Canvas>
      </div>

      {/* INTERACTION ZONE — left half, allows drag/orbit + touch */}
      <div
        onMouseDown={(e) => startOrbit(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          requestOrientationPermission();
          if (e.touches[0])
            startOrbit(e.touches[0].clientX, e.touches[0].clientY);
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '50vw',
          height: '100vh',
          zIndex: 10,
          pointerEvents: 'auto',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
      />
    </>
  );
}

useGLTF.preload('/cdcase/fix2.glb');
