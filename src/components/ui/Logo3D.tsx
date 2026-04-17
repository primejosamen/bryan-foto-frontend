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

/* ── Constantes de altura del header ── */
const HEADER_H_DESKTOP = 170;
const HEADER_H_MOBILE  = 120;

/* ─────────────────────────────────────────────
   LogoScene — SOLO el logo GRANDE para el HOME
   ───────────────────────────────────────────── */
function LogoScene({ input, scrollProgress }: { input: SceneInputState; scrollProgress: React.RefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const matsRef = useRef<THREE.ShaderMaterial[]>([]);
  const logoCenterRef = useRef(new THREE.Vector3());
  const baseScaleRef = useRef(1);
  const currentScaleRef = useRef(1);

  /* ── Intro animation: slow cinematic sweep + gentle spin ── */
  const INTRO_DELAY    = 0.5;          // wait for scene to settle
  const SWEEP_DURATION = 3.0;          // phase 1: -45° → 0°
  const SPIN_DURATION  = 3.0;          // phase 2: slow 180° rotation
  const introStartRef  = useRef(-1);   // -1 = not started yet
  const introDoneRef   = useRef(false);
  const frameCountRef  = useRef(0);    // skip first frames (GPU init)

  const { camera, gl, scene, size } = useThree();

  /* ── Responsive: escalar logo según el frustum visible de la cámara ── */
  const isMobile = size.width < 768;

  /* FOV fijo + aspect correcto */
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
          uFilmScale: { value: 2.24 },
          uEnvRotation: { value: 0.0 },
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

    // Calcular el ancho visible del frustum a la profundidad Z del logo
    // y escalar para que ocupe ~85% del ancho visible (funciona en todos los aspect ratios)
    const logoZ = -5.0;
    const camZ = cameraBasePos.z;
    const dist = camZ - logoZ;                                     // distancia cámara → logo
    const fovRad = THREE.MathUtils.degToRad(FOV);
    const aspect = size.width / Math.max(size.height, 1);
    const visibleHeight = 2 * Math.tan(fovRad / 2) * dist;
    const visibleWidth = visibleHeight * aspect;

    // Medir el ancho intrínseco del logo a escala 1
    logo.scale.set(1, 1, 1);
    const rawBox = new THREE.Box3().setFromObject(logo);
    const rawWidth = rawBox.max.x - rawBox.min.x;

    // Escalar para que el logo llene un % del ancho visible (responsive)
    const TARGET_FILL = isMobile ? 0.65 : size.width < 1024 ? 0.60 : 0.70;
    const s = (visibleWidth * TARGET_FILL) / Math.max(rawWidth, 0.01);

    // Centrar el logo en el frustum visible
    const rawCenter = rawBox.getCenter(new THREE.Vector3());
    const yPos = rawCenter.y;  // se centrará con lookAt de la cámara

    logo.position.set(-rawCenter.x * s, -rawCenter.y * s, logoZ);
    logo.scale.set(s, s, s);
    baseScaleRef.current = s;
    currentScaleRef.current = s;

    if (groupRef.current) {
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0]);
      }
      groupRef.current.add(logo);

      // Calcular y guardar el centro del logo en world space
      const box = new THREE.Box3().setFromObject(groupRef.current);
      box.getCenter(logoCenterRef.current);
    }
  }, [logo, createGlassMaterial, size.width, size.height]);

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

      // Hover zoom: dolly camera closer smoothly (scaled for screen size)
      const hoverDolly = isMobile ? 0.4 : 0.8;
      const targetZ = input.isHovered ? cameraBasePos.z - hoverDolly : cameraBasePos.z;
      persp.position.z += (targetZ - persp.position.z) * 0.06;

      persp.lookAt(c);
    } else {
      // During orbit, keep camera locked on the logo center
      persp.lookAt(c);
    }

    // ── Intro: sweep from -45° to 0°, then gentle 180° spin ──
    const INTRO_START_ANGLE = -Math.PI / 4;   // -45°
    const TOTAL_DURATION = INTRO_DELAY + SWEEP_DURATION + SPIN_DURATION;
    let introRotY = 0;
    if (!introDoneRef.current) {
      frameCountRef.current++;
      // Wait for a few frames so the GPU finishes compiling shaders
      if (frameCountRef.current < 3) {
        introRotY = INTRO_START_ANGLE;
      } else {
        const now = performance.now() / 1000;
        if (introStartRef.current < 0) introStartRef.current = now;
        const elapsed = now - introStartRef.current;

        if (elapsed < INTRO_DELAY) {
          // Hold at start angle during delay
          introRotY = INTRO_START_ANGLE;
        } else if (elapsed < INTRO_DELAY + SWEEP_DURATION) {
          // Phase 1: sweep -45° → 0° (quintic ease-out)
          const t = (elapsed - INTRO_DELAY) / SWEEP_DURATION;
          const ease = 1 - Math.pow(1 - t, 5);
          introRotY = INTRO_START_ANGLE * (1 - ease);
        } else if (elapsed < TOTAL_DURATION) {
          // Phase 2: gentle 180° spin (ease-in-out sinusoidal)
          const t = (elapsed - INTRO_DELAY - SWEEP_DURATION) / SPIN_DURATION;
          const ease = 0.5 - 0.5 * Math.cos(Math.PI * t);
          introRotY = ease * Math.PI * 2; // 0° → 360°
        } else {
          introDoneRef.current = true;
        }
      }
    }

    // Rotar alrededor del centro del logo (translate → rotate → translate back)
    if (groupRef.current) {
      // Reset group transform before recalculating center
      groupRef.current.position.set(0, 0, 0);
      groupRef.current.rotation.set(0, 0, 0);

      // Recalculate center from the actual logo mesh (accounts for scale changes)
      const box = new THREE.Box3().setFromObject(groupRef.current);
      box.getCenter(logoCenterRef.current);
      const c = logoCenterRef.current;

      // Pivot rotation: translate to origin, rotate, translate back
      groupRef.current.position.set(-c.x, -c.y, -c.z);
      groupRef.current.rotation.set(
        input.rotationX,
        input.rotationY + introRotY,
        0,
      );
      groupRef.current.position.applyEuler(groupRef.current.rotation);
      groupRef.current.position.add(c);
    }

    // ── Scroll-based scale + shift (desktop only) ──
    const sp = isMobile ? 0 : (scrollProgress.current ?? 0);

    // Scale down: desktop 100% → 35%, mobile 100% → 50%
    const shrinkFactor = isMobile ? 0.50 : 0.65;
    if (sp > 0 && logo) {
      const targetScale = baseScaleRef.current * (1 - sp * shrinkFactor);
      currentScaleRef.current += (targetScale - currentScaleRef.current) * 0.12;
      logo.scale.setScalar(currentScaleRef.current);
    } else if (logo) {
      currentScaleRef.current += (baseScaleRef.current - currentScaleRef.current) * 0.12;
      logo.scale.setScalar(currentScaleRef.current);
    }

    // ── Off-center projection: logo aparece en la franja del header ──
    const halfH = Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * persp.near;
    const halfW = halfH * persp.aspect;
    const headerCenter = isMobile ? HEADER_H_MOBILE / 2 : HEADER_H_DESKTOP / 2;
    const shiftFraction = (size.height / 2 - headerCenter) / size.height;
    const shift = shiftFraction * 2 * halfH;

    // ── Horizontal shift: center logo in the white space to the right of content ──
    const CONTENT_MAX_W = 1436;  // HomeHeroGrid maxWidth
    const PAD = 24;              // 1.5rem padding each side
    const contentW = Math.min(CONTENT_MAX_W, size.width - PAD * 2);
    const whiteSpaceW = size.width - PAD * 2 - contentW;
    let hShift = 0;
    if (!isMobile && whiteSpaceW > 40) {
      // Center of the white gap as a fraction of viewport (0 = left, 1 = right)
      const whiteCenter = (PAD + contentW + size.width - PAD) / 2;
      const shift01 = Math.min((whiteCenter / size.width - 0.5) * 2, 1.0);
      hShift = -sp * halfW * shift01;
    } else if (isMobile) {
      hShift = sp * halfW * -0.20;
    }

    persp.projectionMatrix.makePerspective(
      -halfW + hShift,
      halfW + hShift,
      halfH - shift,
      -halfH - shift,
      persp.near,
      persp.far,
    );
    persp.projectionMatrixInverse.copy(persp.projectionMatrix).invert();

    // ── Rotar iluminación del environment map (animada) ──
    const elapsed = performance.now() / 1000;
    const envAngle = elapsed * 0.20;

    for (const mat of matsRef.current) {
      (mat.uniforms.uCameraPos.value as THREE.Vector3).copy(persp.position);
      mat.uniforms.uEnvRotation.value = envAngle;
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

  const scrollProgressRef = useRef(0);

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

  /* ── Scroll tracking: 0 = top, 1 = scrolled past threshold ── */
  useEffect(() => {
    const SCROLL_THRESHOLD = 150; // px to fully transition
    let raf: number;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const raw = Math.min(window.scrollY / SCROLL_THRESHOLD, 1);
        // Smooth ease-out curve
        scrollProgressRef.current = 1 - Math.pow(1 - raw, 3);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Canvas fullscreen — cubre todo el viewport para evitar recorte */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
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
          <LogoScene input={input} scrollProgress={scrollProgressRef} />
        </Canvas>
      </div>

      {/* Zona interactiva del header — drag/orbit + hover zoom + touch */}
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
          top: 0,
          left: 0,
          right: 0,
          height: isMobileLayout ? HEADER_H_MOBILE : HEADER_H_DESKTOP,
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
