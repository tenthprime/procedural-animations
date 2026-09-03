/**
 * Additive RGB Color Mixing & Sequential Tiny-to-Large Growth Engine
 * Instant 100% Reliable Restart & Color Shift Logic.
 */

const PALETTE_TRIADS = [
  // 1. RGB Primary
  [[255, 0, 0], [0, 255, 0], [0, 0, 255]],
  // 2. CMYK Process
  [[0, 240, 255], [255, 0, 180], [255, 230, 0]],
  // 3. Cyberpunk Neon
  [[255, 0, 128], [0, 240, 255], [255, 220, 0]],
  // 4. Prismatic Rainbow
  [[255, 60, 0], [0, 230, 150], [140, 0, 255]]
];

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

class GrowingRGBDot {
  constructor(x, y, baseCellSize, maxExpandRatio = 3.0, paletteKey = 'rgb', col = 0, row = 0) {
    this.x = x;
    this.y = y;
    this.col = col;
    this.row = row;
    this.baseCellSize = baseCellSize;

    this.paletteIndex = 0;
    this.updateColorFromPalette();

    // Radial phase delay so growth ripples outwards from center
    this.delay = (Math.hypot(col - 6, row - 6) * 0.05);

    this.growthProgress = 0.0;
    this.currentRadius = 1.0; // Tiny pinprick dot (1px)
    this.ripplePulse = 0;
  }

  updateColorFromPalette() {
    let triad = PALETTE_TRIADS[this.paletteIndex % PALETTE_TRIADS.length];
    this.rgb = triad[(this.col + this.row) % triad.length];
  }

  resetGrowth(shiftColor = true) {
    this.growthProgress = 0.0;
    this.currentRadius = 1.0;
    this.ripplePulse = 0;
    if (shiftColor) {
      this.paletteIndex++;
      this.updateColorFromPalette();
    }
  }

  triggerPulse(force = 1.2) {
    this.ripplePulse = force;
  }

  update(speedMult, maxExpandRatio, autoLoop) {
    let effectiveProgress = Math.max(0.0, this.growthProgress - this.delay);

    if (effectiveProgress > 0.0) {
      let maxRadius = (this.baseCellSize * 0.5) * maxExpandRatio;
      let normProg = constrain(effectiveProgress, 0.0, 1.0);
      let eased = easeInOutCubic(normProg);

      // Slowly grow from tiny pinprick (1px) up to max overlapping radius (peaking in White)
      this.currentRadius = lerp(1.0, maxRadius, eased);

      // Add mouse proximity pulse
      if (this.ripplePulse > 0.01) {
        this.currentRadius += this.baseCellSize * this.ripplePulse * 0.8;
        this.ripplePulse *= 0.9;
      }
    } else {
      this.currentRadius = 1.0;
    }

    // Increment slow growth progress
    this.growthProgress += 0.006 * speedMult;

    // Auto-loop reset: Peak at white, then shrink & restart with NEW shifted colors!
    if (autoLoop && this.growthProgress > 1.5) {
      this.resetGrowth(true);
    }
  }

  display() {
    push();
    noStroke();
    fill(this.rgb[0], this.rgb[1], this.rgb[2], 220);
    ellipse(this.x, this.y, this.currentRadius * 2);
    pop();
  }

  run(speedMult, maxExpandRatio, autoLoop) {
    this.update(speedMult, maxExpandRatio, autoLoop);
    this.display();
  }
}
