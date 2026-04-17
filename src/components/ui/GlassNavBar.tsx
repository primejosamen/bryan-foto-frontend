'use client';

import { useEffect, useRef, useCallback } from 'react';

import navVertex from '@/shaders/nav/nav_vertex.glsl';
import navFragment from '@/shaders/nav/nav_glass_fragment.glsl';

/* ──────────────────────────────────────────────────
   GlassNavBar — liquid glass highlight overlay (WebGL)
   Renders the Shadertoy rounded-box lighting, border
   glow & shimmer. Composites over a backdrop-filter
   parent that handles the actual frosted-glass blur.
   ────────────────────────────────────────────────── */
export default function GlassNavBar({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const rafRef = useRef(0);

  const compileShader = useCallback(
    (gl: WebGLRenderingContext, type: number, source: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    },
    [],
  );

  /* ── Init WebGL ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    });
    if (!gl) return;
    gl.getExtension('OES_standard_derivatives');
    glRef.current = gl;

    const vs = compileShader(gl, gl.VERTEX_SHADER, navVertex);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, navFragment);
    if (!vs || !fs) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    programRef.current = program;

    // Fullscreen quad (clip space -1..1, uv 0..1)
    const verts = new Float32Array([
      -1, -1, 0, 0, 0,
       1, -1, 0, 1, 0,
       1,  1, 0, 1, 1,
      -1, -1, 0, 0, 0,
       1,  1, 0, 1, 1,
      -1,  1, 0, 0, 1,
    ]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'position');
    const uvLoc = gl.getAttribLocation(program, 'uv');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 20, 0);
    if (uvLoc >= 0) {
      gl.enableVertexAttribArray(uvLoc);
      gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 20, 12);
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    return () => {
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
      programRef.current = null;
      glRef.current = null;
    };
  }, [compileShader]);

  /* ── Render loop ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const render = (time: number) => {
      rafRef.current = requestAnimationFrame(render);

      const gl = glRef.current;
      const program = programRef.current;
      if (!gl || !program) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      const uRes = gl.getUniformLocation(program, 'uResolution');
      const uTime = gl.getUniformLocation(program, 'uTime');
      gl.uniform2f(uRes, w, h);
      gl.uniform1f(uTime, time * 0.001);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}
