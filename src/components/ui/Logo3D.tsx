'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useCubeTexture } from '@react-three/drei';
import * as THREE from 'three';

import vertexShader from '@/shaders/test/vertex.glsl';
import glassFragment from '@/shaders/case/case_glass_fragment.glsl';

// Estado global del mouse para parallax y orbit
const mouseState = { x: 0, y: 0 };
const orbitState = { 
  isOrbiting: false, 
  rotationY: 0, 
  rotationX: 0,
  lastX: 0,
  lastY: 0
};

/* ─────────────────────────────────────────────
   LogoScene — SOLO el logo GRANDE para el HOME
   ───────────────────────────────────────────── */
function LogoScene() {
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

  // Renderer
  useEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.35;
    gl.setClearColor(0x000000, 0);
  }, [gl]);

  // Camera
  const cameraBasePos = useMemo(() => new THREE.Vector3(0, 1.1, 5.8), []);
  const parallaxStrength = useMemo(() => ({ x: 0.8, y: 0.4 }), []);
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

    // ✅ Posición del logo GRANDE del diseñador
    logo.position.set(2.6, 3.3, 0.1);
    logo.rotation.set(0, 0, 0);
    logo.scale.set(1.1, 1.1, 1.1);

    if (groupRef.current) {
      // Limpiar TODO antes de agregar — previene duplicados
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0]);
      }
      groupRef.current.add(logo);
    }
  }, [logo, createGlassMaterial]);

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
    if (!orbitState.isOrbiting) {
      const targetX = cameraBasePos.x + mouseState.x * parallaxStrength.x;
      const targetY = cameraBasePos.y + mouseState.y * parallaxStrength.y;
      persp.position.x += (targetX - persp.position.x) * cameraLerp;
      persp.position.y += (targetY - persp.position.y) * cameraLerp;
      persp.position.z = cameraBasePos.z;
      persp.lookAt(0, 0.6, 0);
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = orbitState.rotationY;
      groupRef.current.rotation.x = orbitState.rotationX;
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
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseState.x = (e.clientX / window.innerWidth - 0.5);
      mouseState.y = (e.clientY / window.innerHeight - 0.5);

      if (orbitState.isOrbiting) {
        const dx = e.clientX - orbitState.lastX;
        const dy = e.clientY - orbitState.lastY;
        const orbitStrength = 0.005;
        orbitState.rotationY += dx * orbitStrength;
        orbitState.rotationX += dy * orbitStrength;
        orbitState.rotationX = Math.max(-Math.PI * 0.25, Math.min(Math.PI * 0.25, orbitState.rotationX));
        orbitState.lastX = e.clientX;
        orbitState.lastY = e.clientY;
      }
    };

    const handleMouseUp = () => {
      orbitState.isOrbiting = false;
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    orbitState.isOrbiting = true;
    orbitState.lastX = e.clientX;
    orbitState.lastY = e.clientY;
    setIsDragging(true);
  };

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
          <LogoScene />
        </Canvas>
      </div>

      {/* Zona interactiva del header */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '270px',
          zIndex: 3,
          pointerEvents: 'auto',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      />
    </>
  );
}

useGLTF.preload('/cdcase/logobt2.glb');
