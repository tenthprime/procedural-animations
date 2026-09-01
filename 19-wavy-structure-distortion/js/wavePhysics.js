/**
 * Wavy Structure & Wavefront Interference Physics Engine
 * Computes Diagonal Wave Bands, Concentric Ripple Rings, Perlin Fluid Vortex, and Wave Crest Highlights.
 */

class WavyStructureBall {
  constructor(x, y, cellSize, cellColor, col, row) {
    this.x = x;
    this.y = y;
    this.col = col;
    this.row = row;
    this.cellSize = cellSize;
    this.baseDiameter = cellSize * 0.45;
    this.color = cellColor;

    this.offsetY = 0;
    this.baseWidth = this.baseDiameter;
    this.baseHeight = this.baseDiameter;
    this.angle = 0;
    this.crestHighlight = 0;
    this.splashForce = 0;
  }

  triggerSplash(force = 1.0) {
    this.splashForce = force;
  }

  update(mode, amplitude, wavelength, waveAngleRad, time, enableGlow, enableStretch) {
    let waveVal = 0;

    if (mode === 'diagonal') {
      // 🌊 1. Diagonal Wave Bands (Matching user screenshot)
      let proj = (this.x * Math.cos(waveAngleRad) + this.y * Math.sin(waveAngleRad));
      waveVal = Math.sin(proj * wavelength - time * 3.0);
    } else if (mode === 'concentric') {
      // 🌀 2. Concentric Ripple Rings
      let dx = this.x - width * 0.5;
      let dy = this.y - height * 0.5;
      let distCenter = Math.hypot(dx, dy);
      waveVal = Math.sin(distCenter * wavelength - time * 4.0);
    } else {
      // 🌪️ 3. Perlin Fluid Vortex
      let n = noise(this.x * wavelength * 0.4, this.y * wavelength * 0.4, time * 0.5);
      waveVal = Math.sin(n * Math.PI * 4.0 + time * 2.0);
    }

    // Add Interactive Mouse Splash Ripple
    if (this.splashForce > 0.01) {
      waveVal += Math.sin(this.splashForce * Math.PI * 2) * this.splashForce;
      this.splashForce *= 0.92;
    }

    // Wavefront Height & Angle Rotation
    this.offsetY = waveVal * this.cellSize * 0.4 * amplitude;
    this.angle = waveAngleRad + waveVal * Math.PI * 0.25;

    // Wave Crest Stretch into Lengthy Ribbon
    if (enableStretch) {
      let stretchFactor = map(Math.abs(waveVal), 0, 1, 1.0, 1.8 * amplitude);
      this.baseWidth = this.baseDiameter * stretchFactor;
      this.baseHeight = this.baseDiameter / Math.sqrt(stretchFactor);
    } else {
      this.baseWidth = this.baseDiameter;
      this.baseHeight = this.baseDiameter;
    }

    // Wave Crest Glowing Highlights
    this.crestHighlight = enableGlow ? map(waveVal, 0.5, 1.0, 0, 100, true) : 0;
  }

  display() {
    push();
    translate(this.x, this.y + this.offsetY);
    rotate(this.angle);
    noStroke();

    // Base sampled color
    let r = red(this.color);
    let g = green(this.color);
    let b = blue(this.color);

    // Apply Wave Crest Highlight
    if (this.crestHighlight > 0) {
      r = min(255, r + this.crestHighlight * 1.5);
      g = min(255, g + this.crestHighlight * 1.5);
      b = min(255, b + this.crestHighlight * 1.5);
    }

    fill(r, g, b);
    ellipse(0, 0, this.baseWidth, this.baseHeight);
    pop();
  }

  run(mode, amplitude, wavelength, waveAngleRad, time, enableGlow, enableStretch) {
    this.update(mode, amplitude, wavelength, waveAngleRad, time, enableGlow, enableStretch);
    this.display();
  }
}
