'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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

/* -- Constantes de altura del header -- */
const HEADER_H_DESKTOP = 170;
const HEADER_H_MOBILE  = 120;

/* ---------------------------------------------
   LogoAboutScene -- fix2.glb with glass shader
   (same behavior as Logo3D home scene)
   --------------------------------------------- */
function LogoAboutScene({ input }: { input: SceneInputState }) {
  const groupRef = useRef<THREE.Group>(null);
  const matsRef = useRef<THREE.ShaderMaterial[]>([]);
  const logoCenterRef = useRef(new THREE.Vector3());

  /* -- Intro animation: slow cinematic sweep + gentle spin -- */
  const INTRO_DELAY    = 0.5;
  const SWEEP_DURATION = 3.0;
  const SPIN_DURATION  = 3.0;
  const introStartRef  = useRef(-1);
  const introDoneRef   = useRef(false);
  const frameCountRef  = useRef(0);

  const { camera, gl, scene, size } = useThree();

  const isMobile = size.width < 768;

  const FOV = 60;
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = FOV;
    cam.aspect = size.width / Math.max(size.height, 1);
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  // Env map
  const envMap = useCubeTexture(
    ['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'],
    { path: '/textures/cubemap/' },
  );

  useEffect(() => {
    envMap.colorSpace = THREE.SRGBColorSpace;
    scene.environment = envMap;
    scene.environmentRotation = new THREE.Euler(0, 0.6, 0);
  }, [envMap, scene]);

  // Renderer
  useEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.35;
    gl.setClearColor(0x000000, 0);
  }, [gl]);

  // Camera
  const cameraBasePos = useMemo(() => new THREE.Vector3(0, 1.1, 5.8), []);
  const parallaxStrength = useMemo(
    () => (isMobile ? { x: 0.45, y: 0.28 } : { x: 0.8, y: 0.4 }),
    [isMobile],
  );
  const cameraLerp = 0.05;

  // GLB -- fix2.glb para about
  const { scene: gltfScene } = useGLTF('/cdcase/fix2.glb');
  const logo = useMemo(() => gltfScene.clone(true), [gltfScene]);

  // Glass material
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

  // Posicionar -- responsive, mismo sistema que Logo3D
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

      const box = new THREE.Box3().setFromObject(groupRef.current);
      box.getCenter(logoCenterRef.current);
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

  // Tick
  const persp = camera as THREE.PerspectiveCamera;
  useFrame(() => {
    const c = logoCenterRef.current;

    if (!input.isOrbiting) {
      const targetX = c.x + input.x * parallaxStrength.x;
      const targetY = c.y + input.y * parallaxStrength.y;
      persp.position.x += (targetX - persp.position.x) * cameraLerp;
      persp.position.y += (targetY - persp.position.y) * cameraLerp;

      // Hover zoom: dolly camera closer smoothly
      const targetZ = input.isHovered ? cameraBasePos.z - 0.8 : cameraBasePos.z;
      persp.position.z += (targetZ - persp.position.z) * 0.06;

      persp.lookAt(c);
    }

    // -- Intro: sweep from -45 to 0, then gentle 360 spin --
    const INTRO_START_ANGLE = -Math.PI / 4;
    const TOTAL_DURATION = INTRO_DELAY + SWEEP_DURATION + SPIN_DURATION;
    let introRotY = 0;
    if (!introDoneRef.current) {
      frameCountRef.current++;
      if (frameCountRef.current < 3) {
        introRotY = INTRO_START_ANGLE;
      } else {
        const now = performance.now() / 1000;
        if (introStartRef.current < 0) introStartRef.current = now;
        const elapsed = now - introStartRef.current;

        if (elapsed < INTRO_DELAY) {
          introRotY = INTRO_START_ANGLE;
        } else if (elapsed < INTRO_DELAY + SWEEP_DURATION) {
          const t = (elapsed - INTRO_DELAY) / SWEEP_DURATION;
          const ease = 1 - Math.pow(1 - t, 5);
          introRotY = INTRO_START_ANGLE * (1 - ease);
        } else if (elapsed < TOTAL_DURATION) {
          const t = (elapsed - INTRO_DELAY - SWEEP_DURATION) / SPIN_DURATION;
          const ease = 0.5 - 0.5 * Math.cos(Math.PI * t);
          introRotY = ease * Math.PI * 2;
        } else {
          introDoneRef.current = true;
        }
      }
    }

    // Rotar alrededor del centro del logo
    if (groupRef.current) {
      const c = logoCenterRef.current;
      groupRef.current.position.set(0, 0, 0);
      groupRef.current.rotation.set(0, 0, 0);

      groupRef.current.position.set(-c.x, -c.y, -c.z);
      groupRef.current.rotation.set(
        input.rotationX,
        input.rotationY + introRotY,
        0,
      );
      groupRef.current.position.applyEuler(groupRef.current.rotation);
      groupRef.current.position.add(c);
    }

    for (const mat of matsRef.current) {
      (mat.uniforms.uCameraPos.value as THREE.Vector3).copy(persp.position);
    }
  });

  return <group ref={groupRef} />;
}

/* ---------------------------------------------
   LogoAbout3D -- Full-screen fixed canvas
   with orbit/drag interaction zone
   --------------------------------------------- */
export default function LogoAbout3D() {
  const inputRef = useRef<SceneInputState | null>(null);
  if (!inputRef.current) inputRef.current = createInputState();
  const input = inputRef.current;

  const { isDragging, startOrbit, requestOrientationPermission } =
    useSceneInteraction(input);

  const [isMobileLayout, setIsMobileLayout] = useState(false);
  useLayoutEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const apply = () => setIsMobileLayout(mq.matches);
    apply();
    window.addEventListener('resize', apply);
    mq.addEventListener('change', apply);
    return () => {
      window.removeEventListener('resize', apply);
      mq.removeEventListener('change', apply);
    };
  }, []);

  return (
    <>
      {/* Canvas fullscreen */}
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

      {/* Zona interactiva del header */}
      <div
        onMouseDown={(e) => startOrbit(e.clientX, e.clientY)}
        onMouseEnter={() => { input.isHovered = true; }}
        onMouseLeave={() => { input.isHovered = false; }}
        onTouchStart={(e) => {
          requestOrientationPermission();
          if (e.touches[0])
            startOrbit(e.touches[0].clientX, e.touches[0].clientY);
        }}
        style={{
          position: 'fixed',
          top: 60,
          left: 0,
          right: 0,
          height: isMobileLayout ? HEADER_H_MOBILE : HEADER_H_DESKTOP,
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
