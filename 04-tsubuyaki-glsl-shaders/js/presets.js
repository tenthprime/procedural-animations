/**
 * #つぶやきGLSL Raymarching Presets
 * Compressed, beautiful GLSL fragment shaders for WebGL rendering.
 */

const PRESETS = {
  jelly: `precision highp float;
uniform vec2 r;
uniform float t;

// #つぶやきGLSL - Raymarched Bioluminescent Jelly SDF
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - r) / min(r.x, r.y);
  vec3 ro = vec3(0.0, 0.0, -3.0);
  vec3 rd = normalize(vec3(p, 1.0));
  
  float d = 0.0;
  vec3 col = vec3(0.0);
  
  for(int i = 0; i < 40; i++) {
    vec3 pos = ro + rd * d;
    pos.y += sin(t * 2.0 + pos.x * 3.0) * 0.15;
    
    // Deformed sphere SDF
    float dist = length(pos) - 1.0 + sin(pos.x*8.0+t*4.0)*0.08*cos(pos.y*6.0);
    if(dist < 0.01) {
      col = vec3(0.1, 0.8, 0.9) * (1.0 - float(i)/40.0) + vec3(0.9, 0.2, 0.5) * sin(pos.y*10.0+t);
      break;
    }
    d += dist * 0.5;
  }
  gl_FragColor = vec4(col + vec3(0.02, 0.05, 0.12), 1.0);
}`,

  caustics: `precision highp float;
uniform vec2 r;
uniform float t;

// #つぶやきGLSL - Volumetric Ocean Caustics
void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - r) / min(r.x, r.y);
  vec3 c = vec3(0.0);
  
  for(float i = 1.0; i < 5.0; i++) {
    uv.x += sin(uv.y * i + t * 0.8) * 0.3;
    uv.y += cos(uv.x * i + t * 0.6) * 0.3;
    c += vec3(0.1, 0.6, 0.9) / length(sin(uv + t * 0.5) * 10.0);
  }
  gl_FragColor = vec4(c * 0.25, 1.0);
}`,

  plasma: `precision highp float;
uniform vec2 r;
uniform float t;

// #つぶやきGLSL - Constrained Plasma Wiggler
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - r) / min(r.x, r.y);
  float a = atan(p.y, p.x);
  float d = length(p);
  
  float w = sin(d * 12.0 - t * 4.0 + sin(a * 5.0) * 2.0);
  vec3 col = 0.5 + 0.5 * cos(t + a + vec3(0.0, 2.0, 4.0));
  
  gl_FragColor = vec4(col * (0.1 / abs(w)), 1.0);
}`
};
