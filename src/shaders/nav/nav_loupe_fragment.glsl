precision highp float;

#extension GL_OES_standard_derivatives : enable

uniform sampler2D uTexture;
uniform vec2  uResolution;
uniform float uTime;

varying vec2 vUv;

/* ── SDF of a rounded rectangle (IQ) ── */
float sdfRect(vec2 center, vec2 size, vec2 p, float r) {
  vec2 p_rel = p - center;
  vec2 q = abs(p_rel) - size;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

/* ── Surface normal from SDF ── */
vec3 getNormal(float sd, float thickness) {
  float dx = dFdx(sd);
  float dy = dFdy(sd);
  float n_cos = max(thickness + sd, 0.0) / thickness;
  float n_sin = sqrt(1.0 - n_cos * n_cos);
  return normalize(vec3(dx * n_cos, dy * n_cos, n_sin));
}

/* ── Height of the glass surface at sd ── */
float height(float sd, float thickness) {
  if (sd >= 0.0) return 0.0;
  if (sd < -thickness) return thickness;
  float x = thickness + sd;
  return sqrt(thickness * thickness - x * x);
}

void main() {
  vec2 fragCoord = vUv * uResolution;
  vec2 uv = fragCoord / uResolution;

  // ── Glass parameters (exact Shadertoy values) ──
  float thickness = 14.0;
  float index = 1.5;
  float base_height = thickness * 8.0;
  float color_mix = 0.3;
  vec4 color_base = vec4(1.0, 1.0, 1.0, 0.0);

  // ── Rounded-rect SDF: pill shape that fills the canvas ──
  vec2 center = uResolution * 0.5;
  float shortSide = min(uResolution.x, uResolution.y);
  float halfExtend = max(uResolution.x - uResolution.y, 0.0) * 0.5;
  float sd = sdfRect(center, vec2(halfExtend, 0.0), fragCoord, shortSide * 0.46);

  // ── Background pass-through with anti-aliasing (same as Shadertoy) ──
  vec4 bg_col = vec4(0.0);
  bg_col = texture2D(uTexture, uv);
  bg_col.a = smoothstep(-4.0, 0.0, sd);

  // Outside glass → fully transparent
  if (bg_col.a >= 1.0) discard;

  // ── Normal from SDF ──
  vec3 normal = getNormal(sd, thickness);

  // ── Refraction ──
  vec3 incident = vec3(0.0, 0.0, -1.0);
  vec3 refract_vec = refract(incident, normal, 1.0 / index);
  float h = height(sd, thickness);
  float refract_length = (h + base_height) / dot(vec3(0.0, 0.0, -1.0), refract_vec);
  vec2 coord1 = fragCoord + refract_vec.xy * refract_length;
  vec4 refract_color = texture2D(uTexture, coord1 / uResolution);

  // ── Reflection (exact Shadertoy formula) ──
  vec3 reflect_vec = reflect(incident, normal);
  float c = clamp(abs(reflect_vec.x - reflect_vec.y), 0.0, 1.0);
  vec4 reflect_color = vec4(c, c, c, 0.0);

  // ── Compose (exact Shadertoy formula) ──
  vec4 fragColor = mix(
    mix(refract_color, reflect_color, (1.0 - normal.z) * 2.0),
    color_base,
    color_mix
  );

  // ── Mix with bg for anti-aliasing (exact Shadertoy formula) ──
  fragColor = clamp(fragColor, 0.0, 1.0);
  bg_col = clamp(bg_col, 0.0, 1.0);
  fragColor = mix(fragColor, bg_col, bg_col.a);

  gl_FragColor = fragColor;
}
