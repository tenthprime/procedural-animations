/**
 * OpenProcessing Elastic Ball & Squish Physics Engine
 * Implements easeInOutQuart lift deformation, squish ratios, and 4-way random orientation.
 */

const PALETTES = {
  original: ["#ED4141", "#FECA16", "#2B8BDF", "#159670", "#f65698", "#17bebb", "#e97b32"],
  cyber: ["#ff007f", "#00f0ff", "#ffe600", "#7000ff", "#00ff66"],
  sunset: ["#f97316", "#ef4444", "#ec4899", "#8b5cf6", "#3b82f6"],
  emerald: ["#10b981", "#059669", "#34d399", "#6ee7b7", "#a7f3d0"],
  mono: ["#ffffff", "#cbd5e1", "#94a3b8", "#64748b", "#334155"]
};

function easeInOutQuart(x) {
  return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
}

class OpenProcessingBall {
  constructor(x, y, maxLift, diameter, paletteKey = 'original', phaseLen = 80, squishMult = 1.5) {
    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.baseWidth = diameter;
    this.baseHeight = diameter;
    this.offsetY = 0;
    this.maxLift = maxLift * 0.9;
    this.phaseLength = phaseLen;
    this.squishMult = squishMult;

    this.t = floor(random(this.phaseLength));
    this.angle = floor(random(4)) * (HALF_PI);
    this.palette = PALETTES[paletteKey] || PALETTES.original;
    this.color = random(this.palette);
  }

  triggerRipple() {
    this.t = 1; // Force immediate lift & squish cycle
  }

  update() {
    if (0 < this.t && this.t < this.phaseLength) {
      const nrm = norm(this.t, 0, this.phaseLength - 1);
      const eased = easeInOutQuart(nrm);

      this.offsetY = lerp(0, this.maxLift - this.baseHeight / 3, sin(eased * PI));

      if (this.offsetY + this.diameter / 2 > this.maxLift) {
        const amt = norm(this.offsetY - this.diameter / 2, 0, this.maxLift);
        this.baseHeight = lerp(this.diameter, 0, amt);
        this.baseWidth = lerp(this.diameter, this.diameter * this.squishMult, amt);
      } else {
        this.baseWidth = this.diameter;
        this.baseHeight = this.diameter;
      }
    }

    if (this.t > this.phaseLength) {
      this.resetMotion();
    }

    this.t++;
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    noStroke();
    fill(this.color);
    ellipse(0, this.offsetY, this.baseWidth, this.baseHeight);
    pop();
  }

  resetMotion() {
    this.t = 0;
    this.angle = floor(random(4)) * (HALF_PI);
    this.color = random(this.palette);
  }

  run() {
    this.update();
    this.display();
  }
}
