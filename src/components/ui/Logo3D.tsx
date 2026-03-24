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

/* ─────────────────────────────────────────────
   LogoScene — SOLO el logo GRANDE para el HOME
   ───────────────────────────────────────────── */
function LogoScene({ input }: { input: SceneInputState }) {
  const groupRef = useRef<THREE.Group>(null);
  const matsRef = useRef<THREE.ShaderMaterial[]>([]);
  const logoCenterRef = useRef(new THREE.Vector3());

  const { camera, gl, scene, size } = useThree();

  /* ── Responsive: escalar logo según ancho del viewport ── */
  const BASE_WIDTH = 1920;
  const isMobile = size.width < 768;

  const responsiveScale = useMemo(() => {
    const w = size.width;
    if (w < 768) {
      // Móvil: proporción legible y centrado (antes quedaba fuera de encuadre por X alto)
      const ratio = Math.min(w / 420, 1.2);
      return Math.max(0.38, Math.min(ratio * 0.88, 1.05));
    }
    const ratio = Math.min(w / BASE_WIDTH, 1);
    return Math.max(0.45, ratio);
  }, [size.width]);

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
    [isMobile]
  );
  const cameraLerp = 0.05;

  /* Móvil: FOV algo más cerrado + aspect correcto para que el logo encaje en proporción */
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = isMobile ? 48 : 60;
    cam.aspect = size.width / Math.max(size.height, 1);
    cam.updateProjectionMatrix();
  }, [camera, isMobile, size.width, size.height]);

  // GLB — logo grande ÚNICO
  const { scene: gltfScene } = useGLTF('/cdcase/logobt2.glb');
  const logo = useMemo(() => {
    const clone = gltfScene.clone(true);
    return clone;
  }, [gltfScene]);

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
          uFilmScale: { value: 2.24 }
        },
      });
      mat.toneMapped = false;
      matsRef.current.push(mat);
      return mat;
    };
  }, [envMap]);

  // Posicionar SOLO el logo grande
  useEffect(() => {
    logo.traverse((child: any) => {
      if (!child?.isMesh) return;
      child.material = createGlassMaterial();
      child.renderOrder = 10;
    });

    // Desktop: logo desplazado a la derecha. Móvil: centrado en X para que no se salga del encuadre
    const s = (isMobile ? 1.58 : 1.7) * responsiveScale;
    const xPos = isMobile ? 0 : 4.05 * responsiveScale;
    const yPos = isMobile ? 4.42 : 5.5;
    logo.position.set(xPos, yPos, -5.0);
    logo.rotation.set(0, 0, 0);
    logo.scale.set(s, s, s);

    if (groupRef.current) {
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0]);
      }
      groupRef.current.add(logo);

      // Calcular y guardar el centro del logo en world space
      const box = new THREE.Box3().setFromObject(groupRef.current);
      box.getCenter(logoCenterRef.current);
    }
  }, [logo, createGlassMaterial, responsiveScale, size.width, isMobile]);

  // Limpiar al desmontar
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
      // En reposo la cámara se alinea al centro del logo (vista frontal)
      const targetX = c.x + input.x * parallaxStrength.x;
      const targetY = c.y + input.y * parallaxStrength.y;
      persp.position.x += (targetX - persp.position.x) * cameraLerp;
      persp.position.y += (targetY - persp.position.y) * cameraLerp;
      persp.position.z = cameraBasePos.z;
      persp.lookAt(c);
    }

    // Rotar alrededor del centro del logo (translate → rotate → translate back)
    if (groupRef.current) {
      const c = logoCenterRef.current;
      groupRef.current.position.set(0, 0, 0);
      groupRef.current.rotation.set(0, 0, 0);

      // Translate to center, rotate, translate back
      groupRef.current.position.set(-c.x, -c.y, -c.z);
      groupRef.current.rotation.set(input.rotationX, input.rotationY, 0);
      groupRef.current.position.applyEuler(groupRef.current.rotation);
      groupRef.current.position.add(c);
    }

    for (const mat of matsRef.current) {
      (mat.uniforms.uCameraPos.value as THREE.Vector3).copy(persp.position);
    }
  });

  return <group ref={groupRef} />;
}

/* ─────────────────────────────────────────────
   Logo3D — Componente exportado (HOME)
   ───────────────────────────────────────────── */
export default function Logo3D() {
  const inputRef = useRef<SceneInputState | null>(null);
  if (!inputRef.current) inputRef.current = createInputState();
  const input = inputRef.current;

  const { isDragging, startOrbit, requestOrientationPermission } =
    useSceneInteraction(input);

  /* Móvil: el offset -600 recortaba mal el frame; menos desplazamiento = logo visible en la franja superior */
  const [canvasTopOffset, setCanvasTopOffset] = useState(-600);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  useLayoutEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const apply = () => {
      const narrow = mq.matches;
      setIsMobileLayout(narrow);
      setCanvasTopOffset(narrow ? -240 : -600);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return (
    <>
      {/* Canvas fullscreen */}
      <div
        style={{
          position: 'fixed',
          top: canvasTopOffset,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 15,
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
          <LogoScene input={input} />
        </Canvas>
      </div>

      {/* Zona interactiva del header — drag/orbit + touch */}
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
          right: 0,
          height: isMobileLayout ? 160 : 270,
          zIndex: 16,
          pointerEvents: 'auto',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
      />
    </>
  );
}

useGLTF.preload('/cdcase/logobt2.glb');
