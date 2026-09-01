/**
 * Hyper-Realistic Three.js Ocean Water & Golden Sandy Beach Shaders
 * Inspired by Dan Greenheck's Three.js Water Pro.
 * Features bright golden sand, seafloor light caustics, micro-ripple specular sparkles, and shallow transparency.
 */

// Photorealistic Gerstner Wave Ocean Shader
const GerstnerOceanShader = {
  uniforms: {
    uTime: { value: 0 },
    uWaveHeight: { value: 1.8 },
    uWaveSpeed: { value: 1.0 },
    uFoamIntensity: { value: 1.0 },
    uSunPosition: { value: new THREE.Vector3(100, 120, -200) },
    uSunColor: { value: new THREE.Color(0xfff5ea) },
    uWaterDeepColor: { value: new THREE.Color(0x006699) },
    uWaterShallowColor: { value: new THREE.Color(0x40e0d0) } // Crystal Turquoise
  },
  vertexShader: `
    uniform float uTime;
    uniform float uWaveHeight;
    uniform float uWaveSpeed;

    varying vec3 vWorldPos;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vWaveDepth;

    // Sum of 4 Gerstner Wave Cascades
    vec3 gerstnerWave(vec4 wave, vec3 p, inout vec3 tangent, inout vec3 binormal) {
      float steepness = wave.x;
      float amplitude = wave.y * uWaveHeight;
      vec2 dir = normalize(wave.zw);
      float wavelength = 32.0;
      float k = 6.28318 / wavelength;
      float c = sqrt(9.8 / k) * uWaveSpeed;
      float f = k * (dot(dir, p.xz) - c * uTime);

      tangent += vec3(
        -dir.x * dir.x * (steepness * sin(f)),
        dir.x * (steepness * cos(f)),
        -dir.x * dir.y * (steepness * sin(f))
      );
      binormal += vec3(
        -dir.x * dir.y * (steepness * sin(f)),
        dir.y * (steepness * cos(f)),
        -dir.y * dir.y * (steepness * sin(f))
      );

      return vec3(
        dir.x * (amplitude * cos(f)),
        amplitude * sin(f),
        dir.y * (amplitude * cos(f))
      );
    }

    void main() {
      vUv = uv;
      vec3 gridPoint = position;
      vec3 tangent = vec3(1.0, 0.0, 0.0);
      vec3 binormal = vec3(0.0, 0.0, 1.0);
      vec3 p = gridPoint;

      p += gerstnerWave(vec4(0.25, 0.65, 1.0, 0.2), gridPoint, tangent, binormal);
      p += gerstnerWave(vec4(0.20, 0.45, 0.8, 0.6), gridPoint, tangent, binormal);
      p += gerstnerWave(vec4(0.15, 0.30, 0.3, 0.9), gridPoint, tangent, binormal);
      p += gerstnerWave(vec4(0.10, 0.15, -0.5, 0.5), gridPoint, tangent, binormal);

      vNormal = normalize(cross(binormal, tangent));
      vec4 worldPos = modelMatrix * vec4(p, 1.0);
      vWorldPos = worldPos.xyz;
      vWaveDepth = p.y;

      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uFoamIntensity;
    uniform vec3 uSunPosition;
    uniform vec3 uSunColor;
    uniform vec3 uWaterDeepColor;
    uniform vec3 uWaterShallowColor;

    varying vec3 vWorldPos;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vWaveDepth;

    // High-frequency procedural micro-ripple noise for water surface sparkles
    float microRipple(vec2 p) {
      return sin(p.x * 25.0 + uTime * 3.0) * cos(p.y * 25.0 + uTime * 2.5) * 0.15;
    }

    void main() {
      vec3 lightDir = normalize(uSunPosition - vWorldPos);
      vec3 viewDir = normalize(cameraPosition - vWorldPos);

      // Micro-ripple perturbation to normal for sparkling water surface
      vec3 normal = normalize(vNormal + vec3(microRipple(vWorldPos.xz * 0.1), 0.0, microRipple(vWorldPos.zx * 0.1)));

      // Fresnel Light Reflection
      float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.5);

      // GGX Sun Specular Glint & Sparkles
      vec3 halfDir = normalize(lightDir + viewDir);
      float spec = pow(max(dot(normal, halfDir), 0.0), 160.0) * 3.5;

      // Shallow vs Deep Water Color Transition
      float shoreDist = smoothstep(-50.0, 70.0, vWorldPos.z);
      vec3 waterBase = mix(uWaterShallowColor, uWaterDeepColor, shoreDist);

      // Shoreline Breaking Sea Foam & Crest Whitecaps
      float crestFoam = smoothstep(0.7, 2.2, vWaveDepth);
      float shoreFoam = smoothstep(15.0, 48.0, vWorldPos.z) * sin(vWorldPos.x * 0.25 + uTime * 2.5) * 0.5 + 0.5;
      float foam = clamp((crestFoam + shoreFoam * 0.7) * uFoamIntensity, 0.0, 1.0);

      vec3 foamColor = vec3(0.98, 1.0, 1.0);
      vec3 finalColor = mix(waterBase, foamColor, foam) + uSunColor * spec * (1.0 - foam * 0.8) + vec3(0.2, 0.5, 0.7) * fresnel * 0.4;

      // Water Transparency: Shallow water near beach is translucent (alpha 0.70), deep water is opaque (0.95)
      float alpha = mix(0.72, 0.95, shoreDist);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

// Bright Golden Tropical Sandy Beach Shader (with Seafloor Caustics)
const SandyBeachShader = {
  uniforms: {
    uTime: { value: 0 },
    uSunPosition: { value: new THREE.Vector3(100, 120, -200) },
    uSunColor: { value: new THREE.Color(0xfff5ea) }
  },
  vertexShader: `
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uSunPosition;
    uniform vec3 uSunColor;

    varying vec3 vWorldPos;
    varying vec3 vNormal;
    varying vec2 vUv;

    // Procedural Seafloor Light Caustics
    float caustics(vec2 p) {
      float c = sin(p.x * 0.4 + uTime * 1.5) * cos(p.y * 0.4 + uTime * 1.2);
      c += sin(p.x * 0.8 - uTime * 1.8) * cos(p.y * 0.7 + uTime * 1.4) * 0.5;
      return pow(c * 0.5 + 0.5, 2.0);
    }

    void main() {
      vec3 lightDir = normalize(uSunPosition - vWorldPos);
      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      vec3 normal = normalize(vNormal);

      float diff = max(dot(normal, lightDir), 0.0);

      // Bright Golden Tropical Beach Sand Palette
      vec3 dryGoldenSand = vec3(0.96, 0.90, 0.76); // Bright golden white sand
      vec3 wetGoldenSand = vec3(0.78, 0.68, 0.52); // Warm wet sand at shoreline

      // Receding wave wetness boundary
      float waveWash = sin(vWorldPos.x * 0.15 + uTime * 1.8) * 5.0;
      float wetness = smoothstep(12.0 + waveWash, 42.0 + waveWash, vWorldPos.z);

      vec3 sandBase = mix(dryGoldenSand, wetGoldenSand, wetness);

      // Underwater Seafloor Light Caustics (dancing light on shallow sand under water)
      float underwaterMask = smoothstep(10.0, 60.0, vWorldPos.z);
      float causticPattern = caustics(vWorldPos.xz) * underwaterMask * 0.4;
      sandBase += vec3(0.3, 0.7, 0.9) * causticPattern;

      // Wet Sand Specular Mirror Reflection
      vec3 halfDir = normalize(lightDir + viewDir);
      float wetSpec = pow(max(dot(normal, halfDir), 0.0), 40.0) * wetness * 1.5;

      vec3 finalColor = sandBase * (diff * 0.65 + 0.35) + uSunColor * wetSpec;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};
