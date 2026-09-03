/**
 * Procedural Aurora Lights fBm Noise & Ray Scattering Physics Engine
 */

const AURORA_THEMES = {
  emerald: { c1: [16, 185, 129], c2: [56, 189, 248], c3: [168, 85, 247] },
  violet: { c1: [168, 85, 247], c2: [236, 72, 153], c3: [56, 189, 248] },
  cyan: { c1: [6, 182, 212], c2: [59, 130, 246], c3: [16, 185, 129] },
  solar: { c1: [239, 68, 68], c2: [245, 158, 11], c3: [16, 185, 129] }
};

// Fractional Brownian Motion (fBm) noise generator
function fBm(x, y, octaves = 4) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1.0;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise(x * frequency, y * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

function renderAuroraCurtains(themeKey, flowSpeed, curtainCount, rayTurbulence, mouseWindX, mouseWindY) {
  let colors = AURORA_THEMES[themeKey] || AURORA_THEMES.emerald;
  let time = millis() * 0.0004 * flowSpeed;

  push();
  colorMode(RGB, 255);

  // Render multiple layered glowing aurora curtains
  for (let c = 0; c < curtainCount; c++) {
    let yBase = height * (0.15 + c * 0.12);
    let alphaMult = map(c, 0, curtainCount, 0.4, 0.15);

    beginShape();
    noStroke();

    for (let x = 0; x <= width; x += 15) {
      let xNorm = x / width;

      // Mouse Wind Force Distortion
      let mouseDist = Math.abs(x - mouseWindX);
      let mouseForce = mouseDist < 200 ? map(mouseDist, 0, 200, mouseWindY * 0.2, 0) : 0;

      // Layered fBm Domain Warping for fluid flowing curtains
      let noiseVal = fBm(xNorm * 2.5 + time + c * 0.4, time * 0.8 + c * 0.2);
      let yOffset = Math.sin(xNorm * Math.PI * 3.0 + time + c) * 60 * rayTurbulence + (noiseVal - 0.5) * 160 + mouseForce;

      let yPos = yBase + yOffset;

      // Color Gradient Interpolation along width
      let colRatio = (xNorm + c * 0.25 + time * 0.1) % 1.0;
      let rgb = blendAuroraColors(colors, colRatio);

      fill(rgb[0], rgb[1], rgb[2], alphaMult * 255);
      vertex(x, yPos);
    }

    // Extend curtain downwards for vertical volumetric light ray scattering
    for (let x = width; x >= 0; x -= 15) {
      vertex(x, height * 0.85);
    }
    endShape(CLOSE);
  }

  pop();
}

function blendAuroraColors(colors, ratio) {
  let c1 = colors.c1;
  let c2 = colors.c2;
  let c3 = colors.c3;

  if (ratio < 0.5) {
    let t = ratio * 2.0;
    return [
      lerp(c1[0], c2[0], t),
      lerp(c1[1], c2[1], t),
      lerp(c1[2], c2[2], t)
    ];
  } else {
    let t = (ratio - 0.5) * 2.0;
    return [
      lerp(c2[0], c3[0], t),
      lerp(c2[1], c3[1], t),
      lerp(c2[2], c3[2], t)
    ];
  }
}

// Render Silhouetted Mountain Horizon Line
function renderMountainSilhouette() {
  push();
  fill(2, 6, 23);
  noStroke();

  beginShape();
  vertex(0, height);
  for (let x = 0; x <= width; x += 10) {
    let n = noise(x * 0.004, 99.0);
    let y = height - (n * 120 + 30);
    vertex(x, y);
  }
  vertex(width, height);
  endShape(CLOSE);
  pop();
}
