/**
 * SeaAngel Class (Clione limacina)
 * Inspired by Ann Nguyen's p5.js Sea Angel creation.
 * Features translucent gelatinous body, glowing organ core, sinusoidal flapping wings, and head cones.
 */
class SeaAngel {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(0.8);
    this.acc = createVector(0, 0);
    this.angle = this.vel.heading() + HALF_PI;
    
    this.size = random(35, 55);
    this.wingPhase = random(100);
    this.wingSpeed = 0.08;
    this.timeOffset = random(1000);
    
    // Core glow colors (visceral organ mass)
    this.coreColor = [255, 90 + random(60), 40];
    this.bodyAlpha = 180;
    this.maxSpeed = 1.6;
  }

  update(speedMult = 1.0, mouseTarget = null) {
    this.timeOffset += 0.01;
    this.wingPhase += this.wingSpeed * speedMult;

    // Autonomous wandering + boundary steer
    let steer = getNoiseSteering(this.pos, this.timeOffset, 0.003, 0.15);
    let bound = getBoundaryForce(this.pos, width, height, 120, 0.6);
    this.acc.add(steer);
    this.acc.add(bound);

    // Mouse attraction if dragging
    if (mouseTarget) {
      let mForce = p5.Vector.sub(mouseTarget, this.pos);
      let dist = mForce.mag();
      if (dist < 300) {
        mForce.setMag(map(dist, 0, 300, 0.4, 0.05));
        this.acc.add(mForce);
      }
    }

    // Velocity update
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed * speedMult);
    this.pos.add(this.vel);
    this.acc.mult(0);

    // Smooth heading rotation towards velocity
    let targetAngle = this.vel.heading() + HALF_PI;
    this.angle = lerpAngle(this.angle, targetAngle, 0.08);
  }

  display(glowMult = 1.0, showDebug = false) {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);

    let h = this.size;
    let w = h * 0.45;

    // 1. Glowing Visceral Core Organ (Internal Organs)
    let organPulse = sin(this.timeOffset * 4) * 2;
    drawGlow(0, -h * 0.1, (w * 0.45 + organPulse) * (glowMult * 0.8), this.coreColor, glowMult);

    push();
    noStroke();
    fill(this.coreColor[0], this.coreColor[1], this.coreColor[2], 220);
    ellipse(0, -h * 0.1, w * 0.4, h * 0.25);
    pop();

    // 2. Translucent Gelatinous Spindle Body
    push();
    stroke(186, 230, 253, 160);
    strokeWeight(1.2);
    fill(186, 230, 253, 40);

    beginShape();
    // Head top
    vertex(0, -h * 0.5);
    // Right neck & body bulge
    bezierVertex(w * 0.6, -h * 0.35, w * 0.5, h * 0.1, 0, h * 0.5);
    // Left body bulge & neck
    bezierVertex(-w * 0.5, h * 0.1, -w * 0.6, -h * 0.35, 0, -h * 0.5);
    endShape(CLOSE);
    pop();

    // 3. Flapping Parapodia (Wings)
    let flapAngle = sin(this.wingPhase) * 0.7; // Wing flap rotation
    let wingLen = h * 0.65;

    // Right Wing
    push();
    translate(w * 0.25, -h * 0.2);
    rotate(flapAngle);
    stroke(186, 230, 253, 200);
    strokeWeight(1.5);
    fill(186, 230, 253, 70 * (glowMult > 0 ? 1 : 0.5));
    beginShape();
    vertex(0, 0);
    bezierVertex(wingLen * 0.6, -wingLen * 0.4, wingLen, 0, wingLen * 0.8, wingLen * 0.4);
    bezierVertex(wingLen * 0.4, wingLen * 0.3, wingLen * 0.2, wingLen * 0.1, 0, 0);
    endShape(CLOSE);
    pop();

    // Left Wing
    push();
    translate(-w * 0.25, -h * 0.2);
    rotate(-flapAngle);
    stroke(186, 230, 253, 200);
    strokeWeight(1.5);
    fill(186, 230, 253, 70 * (glowMult > 0 ? 1 : 0.5));
    beginShape();
    vertex(0, 0);
    bezierVertex(-wingLen * 0.6, -wingLen * 0.4, -wingLen, 0, -wingLen * 0.8, wingLen * 0.4);
    bezierVertex(-wingLen * 0.4, wingLen * 0.3, -wingLen * 0.2, -wingLen * 0.1, 0, 0);
    endShape(CLOSE);
    pop();

    // 4. Buccal Cones / Head Tentacles
    push();
    stroke(255, 120, 100, 200);
    strokeWeight(1.5);
    noFill();
    let coneSway = sin(this.timeOffset * 5) * 3;
    line(-w * 0.15, -h * 0.48, -w * 0.25 + coneSway, -h * 0.62);
    line(w * 0.15, -h * 0.48, w * 0.25 + coneSway, -h * 0.62);
    pop();

    // Debug View
    if (showDebug) {
      push();
      noFill();
      stroke(239, 68, 68, 200);
      ellipse(0, 0, h, h);
      line(0, 0, 0, -h * 0.6);
      pop();
    }

    pop();
  }
}

// Lerp angle helper to handle wraparound
function lerpAngle(a, b, step) {
  let diff = (b - a) % TWO_PI;
  if (diff < -PI) diff += TWO_PI;
  if (diff > PI) diff -= TWO_PI;
  return a + diff * step;
}
