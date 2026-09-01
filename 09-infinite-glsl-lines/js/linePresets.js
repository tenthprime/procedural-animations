/**
 * Parametric GLSL Shader supporting customizable Number of Lines, Color Palettes, and Line Patterns.
 */

const MASTER_LINE_SHADER = `precision highp float;
uniform vec2 r;
uniform float t;

uniform float uLineCount;
uniform int uPattern;
uniform int uColorMode;
uniform float uSpeed;
uniform float uGlow;

// Dynamic Color Palette Generator
vec3 getColor(float i, float total) {
  float ratio = i / total;
  
  if (uColorMode == 0) {
    // 🌈 Rainbow Spectrum (7 Colors)
    return 0.5 + 0.5 * cos(t * uSpeed * 0.8 + ratio * 6.28318 + vec3(0.0, 2.0, 4.0));
  } else if (uColorMode == 1) {
    // 💖 Cyberpunk Cyan & Magenta
    return mix(vec3(0.0, 0.95, 0.95), vec3(1.0, 0.05, 0.65), sin(t * uSpeed + ratio * 3.14) * 0.5 + 0.5);
  } else if (uColorMode == 2) {
    // 💚 Emerald & Neon Lime
    return mix(vec3(0.1, 0.9, 0.3), vec3(0.7, 1.0, 0.1), cos(t * uSpeed + ratio * 4.0) * 0.5 + 0.5);
  } else if (uColorMode == 3) {
    // ✨ Celestial Gold & Violet
    return mix(vec3(0.98, 0.8, 0.2), vec3(0.65, 0.15, 0.95), sin(t * uSpeed + ratio * 5.0) * 0.5 + 0.5);
  } else {
    // 🔴 Electric Ruby & Amber
    return mix(vec3(1.0, 0.1, 0.3), vec3(1.0, 0.6, 0.1), cos(t * uSpeed + ratio * 3.14) * 0.5 + 0.5);
  }
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - r) / min(r.x, r.y);
  vec3 col = vec3(0.0);
  
  float numLines = clamp(uLineCount, 2.0, 24.0);
  
  for(float i = 1.0; i <= 24.0; i++) {
    if (i > numLines) break;
    
    float lineDist = 0.0;
    
    if (uPattern == 0) {
      // 1. ⚡ Hyper-Space Laser Tunnel
      float d = length(uv);
      float a = atan(uv.y, uv.x);
      lineDist = sin(d * 16.0 * (i * 0.4) - t * uSpeed * 3.5 + sin(a * 6.0) * 1.2);
    } else if (uPattern == 1) {
      // 2. 🌊 Flowing Neon Wave Ribbons
      lineDist = uv.y + sin(uv.x * i * 0.7 + t * uSpeed * 2.5 + i) * 0.35 * sin(t * uSpeed + i);
    } else if (uPattern == 2) {
      // 3. 🌀 Kaleidoscopic Prism Warp
      vec2 u = abs(uv) / (dot(uv, uv) + 0.1) - vec2(0.6 + sin(t * uSpeed * 0.4) * 0.1);
      lineDist = sin(length(u) * 10.0 * (i * 0.3) - t * uSpeed * 3.0);
    } else if (uPattern == 3) {
      // 4. 🧬 DNA Double Helix Strands
      float strand1 = uv.y - sin(uv.x * 4.0 + t * uSpeed * 3.0 + i * 0.5) * 0.4;
      float strand2 = uv.y + sin(uv.x * 4.0 + t * uSpeed * 3.0 + i * 0.5) * 0.4;
      lineDist = min(abs(strand1), abs(strand2));
    } else {
      // 5. 🌀 Radial Spiral Vortex
      float d = length(uv);
      float a = atan(uv.y, uv.x);
      lineDist = sin(a * (i * 2.0) + d * 12.0 - t * uSpeed * 4.0);
    }
    
    vec3 c = getColor(i, numLines);
    float glowFactor = (0.012 * uGlow) / abs(lineDist);
    col += glowFactor * c;
  }
  
  gl_FragColor = vec4(col, 1.0);
}`;
