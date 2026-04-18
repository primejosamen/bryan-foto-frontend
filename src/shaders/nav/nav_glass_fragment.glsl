precision highp float;

#extension GL_OES_standard_derivatives : enable

uniform vec2 uResolution;
uniform float uTime;

varying vec2 vUv;

/* ── Rounded-rect SDF using IQ's method ── */
float sdfRoundedRect(vec2 center, vec2 size, vec2 p, float r) {
  vec2 q = abs(p - center) - size;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

/* ── Surface normal from SDF (optically correct) ── */
vec3 getNormal(float sd, float thickness) {
  float dx = dFdx(sd);
  float dy = dFdy(sd);
  float n_cos = max(thickness + sd, 0.0) / thickness;
  float n_sin = sqrt(1.0 - n_cos * n_cos);
  return normalize(vec3(dx * n_cos, dy * n_cos, n_sin));
}

/* ── Height of the glass surface at sd ── */
float glassHeight(float sd, float thickness) {
  if (sd >= 0.0) return 0.0;
  if (sd < -thickness) return thickness;
  float x = thickness + sd;
  return sqrt(thickness * thickness - x * x);
}

void main() {
  vec2 fragCoord = vUv * uResolution;

  // ── Glass parameters ──
  float thickness = 12.0;
  float ior = 1.35;
  float baseHeight = thickness * 8.0;

  // ── Capsule/pill SDF: auto-scales to canvas aspect ratio ──
  vec2 center = uResolution * 0.5;
  float shortSide = min(uResolution.x, uResolution.y);
  float radius = shortSide * 0.46;
  float halfExtend = max(uResolution.x - uResolution.y, 0.0) * 0.5;
  float sd = sdfRoundedRect(center, vec2(halfExtend, 0.0), fragCoord, radius);

  // ── Anti-aliased edge ──
  float bgAlpha = smoothstep(-2.0, 0.0, sd);
  if (bgAlpha >= 1.0) discard;

  // ── Normal from SDF ──
  vec3 normal = getNormal(sd, thickness);

  // ── Refraction → use as distortion direction for highlight ──
  vec3 incident = vec3(0.0, 0.0, -1.0);
  vec3 refractVec = refract(incident, normal, 1.0 / ior);
  float h = glassHeight(sd, thickness);

  // ── Reflection ──
  vec3 reflectVec = reflect(incident, normal);
  float c = clamp(abs(reflectVec.x - reflectVec.y), 0.0, 1.0);

  // ── Fresnel ──
  float fresnel = pow(1.0 - normal.z, 2.5);

  // ── Interior body: top-to-bottom gradient (like real glass catching light) ──
  vec2 m2 = vUv - 0.5;
  float bodyGradient = clamp(m2.y + 0.5, 0.0, 1.0) * 0.35;  // brighter at top
  float bodyFill = 1.0 - bgAlpha;  // 1 inside, 0 outside

  // ── Border glow from SDF ──
  float borderGlow = smoothstep(-thickness * 0.3, 0.0, sd) * (1.0 - smoothstep(-2.0, 0.0, sd));

  // ── Combine: body gradient + fresnel edges + border + reflection ──
  vec3 highlight = vec3(bodyGradient) * bodyFill
                 + vec3(c) * fresnel * 0.6
                 + vec3(fresnel * 0.3)
                 + vec3(borderGlow * 0.35);

  // ── Subtle shimmer ──
  float shimmer = sin(uTime * 0.8 + vUv.x * 12.0) * 0.02 + 0.02;
  highlight += vec3(shimmer) * bodyFill;

  // ── Output: highlights with alpha for compositing over backdrop-filter ──
  float alpha = bodyFill * clamp(length(highlight) * 1.8, 0.0, 0.6);

  gl_FragColor = vec4(highlight, alpha);
}
