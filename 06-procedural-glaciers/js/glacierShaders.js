/**
 * GLACIER Procedural GLSL Shaders
 * Includes Subsurface Scattering Glacial Ice, Aurora Borealis, and Arctic Water shaders.
 */

// Subsurface Scattering Glacial Ice Shader
const GlacialIceShader = {
  uniforms: {
    uTime: { value: 0 },
    uIceGlow: { value: 1.0 },
    uLightPos: { value: new THREE.Vector3(50, 100, 50) }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uIceGlow;
    uniform vec3 uLightPos;
    
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    varying vec2 vUv;
    
    void main() {
      vec3 lightDir = normalize(uLightPos - vWorldPos);
      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      
      // Standard Diffuse
      float diff = max(dot(vNormal, lightDir), 0.0);
      
      // Subsurface Scattering Glow (Light penetrating deep into ancient ice)
      float sss = pow(max(dot(-viewDir, lightDir + vNormal * 0.4), 0.0), 3.0) * 1.8;
      
      // Fresnel Rim Light
      float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 4.0);
      
      // Ice Palette: Snow White top, Deep Cyan Azure core
      vec3 snowColor = vec3(0.92, 0.96, 1.0);
      vec3 deepIceColor = vec3(0.05, 0.65, 0.85);
      vec3 sssGlowColor = vec3(0.0, 0.85, 0.95);
      
      vec3 base = mix(deepIceColor, snowColor, clamp(vWorldPos.y * 0.02 + 0.5, 0.0, 1.0));
      vec3 finalColor = base * (diff * 0.6 + 0.4) + sssGlowColor * sss * uIceGlow + vec3(0.8, 0.95, 1.0) * fresnel * 0.6;
      
      gl_FragColor = vec4(finalColor, 0.92);
    }
  `
};

// Aurora Borealis Night Sky Shader
const AuroraSkyShader = {
  uniforms: {
    uTime: { value: 0 },
    uAuroraIntensity: { value: 1.0 }
  },
  vertexShader: `
    varying vec3 vWorldPos;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uAuroraIntensity;
    varying vec3 vWorldPos;
    
    void main() {
      vec3 dir = normalize(vWorldPos);
      float h = max(dir.y, 0.0);
      
      // Night Sky Base
      vec3 skyColor = mix(vec3(0.01, 0.03, 0.08), vec3(0.0, 0.01, 0.03), h);
      
      // Aurora Curtain Wave Equations
      float wave1 = sin(dir.x * 6.0 + uTime * 0.8 + sin(dir.z * 8.0)) * 0.5 + 0.5;
      float wave2 = cos(dir.z * 10.0 - uTime * 1.2 + cos(dir.x * 4.0)) * 0.5 + 0.5;
      float auroraMask = smoothstep(0.1, 0.6, h) * smoothstep(0.9, 0.4, h);
      
      vec3 auroraGreen = vec3(0.1, 0.95, 0.55);
      vec3 auroraViolet = vec3(0.65, 0.15, 0.9);
      
      vec3 aurora = mix(auroraGreen, auroraViolet, wave2) * wave1 * auroraMask * 1.5 * uAuroraIntensity;
      
      gl_FragColor = vec4(skyColor + aurora, 1.0);
    }
  `
};
