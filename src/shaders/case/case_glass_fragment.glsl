precision highp float;

uniform samplerCube uEnvMap;

uniform vec3  uTint;
uniform float uEnvIntensity;
uniform float uOpacity;

uniform float uIorBase;
uniform float uDispersion;
uniform float uThickness;
uniform float uRoughness;
uniform float uSpecBoost;

uniform float uFilmStrength;
uniform float uFilmScale;

uniform vec3 uCameraPos;
uniform float uEnvRotation;

varying vec3 vNormalW;
varying vec3 vPosW;

float saturate(float x) { return clamp(x, 0.0, 1.0); }

vec3 rotateY(vec3 v, float a) {
  float c = cos(a); float s = sin(a);
  return vec3(v.x * c + v.z * s, v.y, -v.x * s + v.z * c);
}

vec3 envSample(vec3 dir) {
  return textureCube(uEnvMap, rotateY(dir, uEnvRotation)).rgb * uEnvIntensity;
}

vec3 envSampleRough(vec3 dir, float roughness) {
  vec3 c = envSample(dir);
  if (roughness <= 0.001) return c;

  vec3 d = normalize(dir);
  vec3 up = abs(d.y) < 0.999 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 t = normalize(cross(up, d));
  vec3 b = cross(d, t);

  float r = roughness * 0.08;
  c += envSample(normalize(d + t * r));
  c += envSample(normalize(d - t * r));
  c += envSample(normalize(d + b * r));
  c += envSample(normalize(d - b * r));

  return c / 5.0;
}

vec3 fresnelSchlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(1.0 - saturate(cosTheta), 5.0);
}

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

void buildBasis(in vec3 N, out vec3 T, out vec3 B) {
  vec3 up = (abs(N.y) < 0.95) ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  T = normalize(cross(up, N));
  B = normalize(cross(N, T));
}

/* ======================================================
   SPECTRUM FRÍO (ANTI-MAGENTA)
   ====================================================== */
vec3 spectrumCold(float t) {
  // t 0..1
  float b = smoothstep(0.00, 0.35, t) * (1.0 - smoothstep(0.45, 0.65, t));
  float g = smoothstep(0.30, 0.55, t) * (1.0 - smoothstep(0.65, 0.78, t));
  float r = smoothstep(0.70, 0.92, t);

  // ❄️ BIAS FRÍO
  b *= 1.9;   // azul dominante
  g *= 0.0;   // baja verde (menos amarillo)
  r *= 0.0;   // rojo presente pero NO magenta

  return max(vec3(r, g, b), vec3(0.0));
}

void main() {
  vec3 N = normalize(vNormalW);
  if (!gl_FrontFacing) N = -N;

  vec3 V = normalize(uCameraPos - vPosW);
  vec3 I = -V;

  float NoV = max(dot(N, V), 0.0);

  // Fresnel
  float f0s = pow((1.0 - uIorBase) / (1.0 + uIorBase), 2.0);
  vec3 F0 = vec3(f0s);
  vec3 F  = fresnelSchlick(NoV, F0);

  // Reflection
  vec3 R = reflect(I, N);
  vec3 reflection = envSampleRough(R, max(uRoughness, 0.002));

  // -------- Prism setup --------
  vec3 Tn, Bn;
  buildBasis(N, Tn, Bn);

  vec3 prismDir = normalize(Tn * 0.95 + Bn * 0.30);

  float edge = pow(1.0 - NoV, 1.1);

  float noise = (hash13(vPosW * 18.0 + N * 6.0) - 0.5) * 0.18;

  float split = (0.045 + uDispersion * 0.22) * edge * (1.0 + noise);

  float iorR = uIorBase + uDispersion * 0.55;
  float iorG = uIorBase;
  float iorB = uIorBase - uDispersion * 0.65;

  vec3 Tr = refract(I, N, 1.0 / max(iorR, 1.01));
  vec3 Tg = refract(I, N, 1.0 / max(iorG, 1.01));
  vec3 Tb = refract(I, N, 1.0 / max(iorB, 1.01));

  vec3 thickPush = -N * uThickness;

  // Multi-tap diffuse prism
  vec3 refr = vec3(0.0);
  float w[5];
  w[0]=0.10; w[1]=0.22; w[2]=0.36; w[3]=0.22; w[4]=0.10;

  for (int i = 0; i < 5; i++) {
    float o = float(i - 2) * split * 0.9;

    vec3 dR = normalize(Tr + thickPush + prismDir * ( o));
    vec3 dG = normalize(Tg + thickPush + prismDir * ( o * 0.15));
    vec3 dB = normalize(Tb + thickPush + prismDir * (-o));

    vec3 eR = envSampleRough(dR, uRoughness);
    vec3 eG = envSampleRough(dG, uRoughness);
    vec3 eB = envSampleRough(dB, uRoughness);

    vec3 spec = spectrumCold(float(i) / 4.0);
    refr += (eR * spec.r + eG * spec.g + eB * spec.b) * w[i];
  }

  // Anti-dark
  refr *= (1.0 - pow(1.0 - NoV, 1.8) * 0.20);

  // Thin film MUY controlado (solo refuerza azul)
  vec3 film = spectrumCold(fract((1.0 - NoV) * uFilmScale));
  refr *= mix(vec3(1.0), film, uFilmStrength * edge * 0.18);

  // Highlight
  float specH = pow(1.0 - NoV, 6.0) * (0.25 + uSpecBoost * 0.75);
  vec3 highlight = reflection * specH;

  // Combine
  vec3 col = mix(refr, reflection, F);
  col += highlight;

  // Lift frío
  col += vec3(0.05, 0.05, 0.08);

  // Tint mínimo
  col *= mix(vec3(1.0), uTint, 0.03);

  // Soft clamp
  float m = max(max(col.r, col.g), col.b);
  col = col / (1.0 + m * 0.28);

  float alpha = mix(uOpacity, 0.96, pow(1.0 - NoV, 1.3));
  gl_FragColor = vec4(col, alpha);
}
