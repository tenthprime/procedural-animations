/**
 * OpenProcessing Elastic Image Pixel Ball & Squish Physics Engine
 * Directional Cursor Wave Push Physics & Elastic Spring Return.
 */

function easeInOutQuart(x) {
  return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
}

class OpenProcessingImageBall {
  constructor(x, y, maxLift, diameter, cellColor, phaseLen = 80, squishMult = 1.5, col = 0, row = 0) {
    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.baseWidth = diameter;
    this.baseHeight = diameter;
    this.offsetY = 0;
    this.maxLift = maxLift * 0.95;
    this.phaseLength = phaseLen;
    this.squishMult = squishMult;
    this.originalColor = cellColor;
    this.currentColor = cellColor;

    // Directional Cursor Wave Push Vectors
    this.pushX = 0;
    this.pushY = 0;

    // Continuous wave phase offset based on grid position
    this.t = Math.floor((col * 3 + row * 2 + Math.random() * 15) % this.phaseLength);
    this.angle = floor(random(4)) * (HALF_PI);
  }

  // Trigger Directional Wave Push in the direction of cursor movement
  triggerDirectionalPush(dirX, dirY, force = 12) {
    this.pushX += dirX * force;
    this.pushY += dirY * force;
    this.t = 1; // Force immediate lift & squish cycle
  }

  update() {
    // Continuous Lift & Squish Animation Cycle
    const nrm = norm(this.t, 0, this.phaseLength - 1);
    const eased = easeInOutQuart(nrm);

    this.offsetY = lerp(0, this.maxLift - this.baseHeight / 3, sin(eased * PI));

    if (this.offsetY + this.diameter / 2 > this.maxLift) {
      const amt = norm(this.offsetY - this.diameter / 2, 0, this.maxLift);
      this.baseHeight = lerp(this.diameter, this.diameter * 0.2, amt);
      this.baseWidth = lerp(this.diameter, this.diameter * this.squishMult, amt);
    } else {
      this.baseWidth = this.diameter;
      this.baseHeight = this.diameter;
    }

    // Elastic Spring Return for Cursor Wave Push
    this.pushX *= 0.88;
    this.pushY *= 0.88;

    this.t++;
    if (this.t >= this.phaseLength) {
      this.resetMotion();
    }
  }

  display() {
    push();
    // Offset by directional cursor push
    translate(this.x + this.pushX, this.y + this.pushY);
    rotate(this.angle);
    noStroke();
    fill(this.currentColor);
    ellipse(0, this.offsetY, this.baseWidth, this.baseHeight);
    pop();
  }

  resetMotion() {
    this.t = 0;
    this.angle = floor(random(4)) * (HALF_PI);
  }

  run() {
    this.update();
    this.display();
  }
}
