precision highp float;

#extension GL_OES_standard_derivatives : enable

uniform sampler2D uTexture;
uniform vec2  uResolution;
uniform float uTime;
uniform vec2  uZoomCenter;   // 0..1 where cursor points in the image
uniform float uZoomLevel;    // e.g. 3.0
uniform float uImageAspect;  // image width / height

varying vec2 vUv;

/* ── Ellipse SDF (approximate, fast) ── */
float sdfEllipse(vec2 center, vec2 radii, vec2 p) {
  vec2 q = (p - center) / radii;
  float d = length(q) - 1.0;
  return d * min(radii.x, radii.y);
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
  vec2 uv = vUv;

  // ── Glass parameters ──
  float thickness = 50.0;
  float ior = 1.10;
  float baseHeight = thickness * 15.0;
  float colorMix = 0.18;         // how much white tint
  vec3 colorBase = vec3(1.0);    // glass tint color

  // ── Ellipse SDF centered on canvas ──
  vec2 center = uResolution * 0.5;
  vec2 radii = uResolution * 0.48;
  float sd = sdfEllipse(center, radii, fragCoord);

  // ── Anti-aliased background (outside glass) ──
  float bgAlpha = smoothstep(-3.0, 0.0, sd);
  if (bgAlpha >= 1.0) discard;

  // ── Normal from SDF ──
  vec3 normal = getNormal(sd, thickness);

  // ── Refraction: only use for subtle distortion ──
  vec3 incident = vec3(0.0, 0.0, -1.0);
  vec3 refractVec = refract(incident, normal, 1.0 / ior);
  float h = glassHeight(sd, thickness);
  float refractLen = (h + baseHeight) / dot(vec3(0.0, 0.0, -1.0), refractVec);
  // Small refraction displacement in normalized coords
  vec2 refractDisplace = refractVec.xy * refractLen / min(uResolution.x, uResolution.y);

  // ── Map to image: correct aspect ratio so image is not stretched ──
  float shortSide = min(uResolution.x, uResolution.y);
  vec2 baseOffset = (fragCoord - uResolution * 0.5) / shortSide;
  // Correct for image aspect ratio: ensure square sampling in pixel space
  vec2 aspectCorrection = vec2(
    min(1.0, 1.0 / uImageAspect),
    min(1.0, uImageAspect)
  );
  float invZoom = 1.0 / uZoomLevel;
  vec2 imgUv = uZoomCenter + (baseOffset * aspectCorrection + refractDisplace * aspectCorrection) * invZoom;
  vec4 refractColor = texture2D(uTexture, imgUv);

  // ── Reflection ──
  vec3 reflectVec = reflect(incident, normal);
  float c = clamp(abs(reflectVec.x - reflectVec.y), 0.0, 1.0);
  vec4 reflectColor = vec4(c, c, c, 0.0);

  // ── Fresnel-like mix: more reflection at glancing angles ──
  float fresnel = (1.0 - normal.z) * 2.0;
  vec3 glass = mix(refractColor.rgb, reflectColor.rgb, fresnel);

  // ── Final: mix glass with background for anti-aliasing ──
  glass = clamp(glass, 0.0, 1.0);
  float alpha = 1.0 - bgAlpha;

  gl_FragColor = vec4(glass, alpha);
}
