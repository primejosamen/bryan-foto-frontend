precision highp float;

uniform vec2  uResolution;
uniform float uTime;

varying vec2 vUv;

#define PI 3.14159265
#define S  smoothstep

float Box(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

void main() {
    vec2 uv = vUv;
    vec2 st = uv - 0.5;                       /* centered -0.5..0.5 */

    float aspect = uResolution.x / uResolution.y;
    st.x *= aspect;

    /* ── Circle SDF ── */
    float radius  = 0.42;
    float box     = length(st) - radius;

    float shape   = S(0.01, -0.01, box);      /* filled shape       */

    /* ── Multi-layer bevel — thick, prominent, glassy ── */
    float edge1   = S(0.02, 0.0, abs(box + 0.003));   /* sharp outer rim    */
    float edge2   = S(0.08, 0.0, abs(box + 0.035));   /* wide mid bevel     */
    float edge3   = S(0.18, 0.0, abs(box + 0.09));    /* deep inner glow    */
    float edge4   = S(0.25, 0.0, abs(box + 0.13));    /* broadest cushion   */
    float edge    = edge1 * 1.2 + edge2 * 0.8 + edge3 * 0.45 + edge4 * 0.2;

    /* Inner depth — inflated bubble look */
    float innerDepth = S(0.0, 0.38, length(st)) * shape;

    if (shape <= 0.001) {
        discard;
    }

    /* ── 3D bevel / depth lighting ── */
    vec2 lightDir = normalize(vec2(-0.5, 0.8));
    float bevel   = dot(normalize(st), lightDir);
    float topHL   = S(-0.2, 0.7, bevel);         /* broad top-left highlight */
    float botSH   = S(0.2, -0.6, bevel) * 0.35;  /* bottom-right shadow     */

    /* Specular hotspot — sharp glint near top */
    float spec = pow(max(S(-0.1, 0.5, bevel), 0.0), 4.0) * 0.6;

    /* Vertical gradient — brighter at top like real glass */
    float vGrad = S(-0.35, 0.45, st.y) * 0.6 + 0.15;

    /* Fresnel — edges much brighter than center */
    float dist01  = clamp(length(st) / 0.45, 0.0, 1.0);
    float fresnel = S(0.15, 0.85, dist01) * 0.6;

    /* ── Liquid glass distortion (stronger, more visible) ── */
    float n1 = sin(st.x * 22.0 + uTime * 1.8) * cos(st.y * 18.0 - uTime * 1.2);
    float n2 = sin((st.x + st.y) * 14.0 + uTime * 0.9) * 0.6;
    float n3 = cos(st.x * 8.0 - st.y * 12.0 + uTime * 2.0) * 0.3;
    float liquid = (n1 + n2 + n3) * 0.05 * shape;

    /* ── Compose highlight color ── */
    float highlight = 0.0;
    highlight += topHL * 0.8;                 /* directional light  */
    highlight += spec;                         /* specular glint     */
    highlight += vGrad * 0.65;                /* vertical gradient  */
    highlight += fresnel * 1.4;               /* edge fresnel       */
    highlight += edge * 1.1;                  /* thick bevel layers */
    highlight += innerDepth * 0.6;            /* inflated depth     */
    highlight += liquid;                       /* liquid distortion  */
    highlight -= botSH * 0.3;                 /* subtle shadow      */

    /* Shimmer animation — more visible */
    float shimmer = sin(uTime * 2.0 + uv.x * 16.0 + uv.y * 10.0) * 0.05 + 0.04;
    highlight += shimmer * shape;

    /* Base brightness boost */
    highlight += 0.3 * shape;

    highlight = clamp(highlight, 0.0, 1.0);

    /* ── Output: bright white glass with controlled alpha ── */
    vec3 col = vec3(1.0) * highlight;

    /* Glass alpha: semi-transparent fill + stronger bevel edges */
    float alpha = shape * (0.45 + highlight * 0.5) + edge * 0.6;
    alpha = clamp(alpha, 0.0, 0.9);

    gl_FragColor = vec4(col, alpha);
}
