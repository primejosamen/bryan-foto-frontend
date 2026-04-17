'use client';

import { useEffect, useRef, useCallback } from 'react';

import navVertex from '@/shaders/nav/nav_vertex.glsl';
import loupeFragment from '@/shaders/loupe/loupe_glass_fragment.glsl';

/* ──────────────────────────────────────────────────
   GlassLoupe — single WebGL canvas that renders the
   zoomed image with barrel distortion, chromatic
   aberration, and liquid-glass highlights.
   ────────────────────────────────────────────────── */
export default function GlassLoupe({
  className = '',
  imageSrc,
  zoomCenter,
  zoomLevel = 3,
  imageAspect = 1,
}: {
  className?: string;
  imageSrc: string;
  zoomCenter: { x: number; y: number };
  zoomLevel?: number;
  imageAspect?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  const rafRef = useRef(0);
  const zoomRef = useRef(zoomCenter);
  zoomRef.current = zoomCenter;
  const aspectRef = useRef(imageAspect);
  aspectRef.current = imageAspect;

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
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, loupeFragment);
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

    // Create texture (placeholder — loaded below)
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // 1x1 placeholder
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    textureRef.current = tex;

    return () => {
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
      if (tex) gl.deleteTexture(tex);
      programRef.current = null;
      glRef.current = null;
      textureRef.current = null;
    };
  }, [compileShader]);

  /* ── Load image as texture ── */
  useEffect(() => {
    const gl = glRef.current;
    const tex = textureRef.current;
    if (!gl || !tex || !imageSrc) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    };
    img.src = imageSrc;
  }, [imageSrc]);

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

      // Bind texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
      gl.uniform1i(gl.getUniformLocation(program, 'uTexture'), 0);

      gl.uniform2f(gl.getUniformLocation(program, 'uResolution'), w, h);
      gl.uniform1f(gl.getUniformLocation(program, 'uTime'), time * 0.001);
      gl.uniform2f(
        gl.getUniformLocation(program, 'uZoomCenter'),
        zoomRef.current.x / 100,
        1.0 - zoomRef.current.y / 100,
      );
      gl.uniform1f(gl.getUniformLocation(program, 'uZoomLevel'), zoomLevel);
      gl.uniform1f(gl.getUniformLocation(program, 'uImageAspect'), aspectRef.current);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [zoomLevel]);

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
        borderRadius: '9999px',
      }}
    />
  );
}
