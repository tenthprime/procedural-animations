/**
 * CombJelly Class (Ctenophora / Deep-Sea Jelly)
 * Features pulsing translucent bell, iridescent rainbow comb rows, and trailing tentacles.
 */
class CombJelly {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, -random(0.3, 0.8));
    this.size = random(40, 60);
    this.pulsePhase = random(100);
    this.timeOffset = random(1000);

    // Tentacle strands
    this.numTentacles = 6;
    this.tentacleLength = random(70, 120);
    this.tentacles = [];

    for (let i = 0; i < this.numTentacles; i++) {
      let strand = [];
      let segs = 10;
      for (let j = 0; j < segs; j++) {
        strand.push(this.pos.copy().add(0, j * (this.tentacleLength / segs)));
      }
      this.tentacles.push(strand);
    }
  }

  update(speedMult = 1.0, mouseTarget = null) {
    this.timeOffset += 0.01;
    this.pulsePhase += 0.04 * speedMult;

    // Rhythmic upward contraction pulse (jellyfish swim stroke)
    let pulse = sin(this.pulsePhase);
    let thrust = pulse > 0.5 ? map(pulse, 0.5, 1.0, 0, 0.8) * speedMult : 0;

    let steer = getNoiseSteering(this.pos, this.timeOffset, 0.002, 0.1);
    let bound = getBoundaryForce(this.pos, width, height, 100, 0.5);

    this.vel.add(steer);
    this.vel.add(bound);
    this.vel.y -= thrust * 0.05; // Upward pulse buoyancy

    if (mouseTarget) {
      let mForce = p5.Vector.sub(mouseTarget, this.pos);
      let dist = mForce.mag();
      if (dist < 300) {
        mForce.setMag(map(dist, 0, 300, 0.3, 0.02));
        this.vel.add(mForce);
      }
    }

    this.vel.mult(0.96); // Water fluid damping
    this.pos.add(this.vel);

    // Update Tentacle Drag Physics
    for (let t = 0; t < this.numTentacles; t++) {
      let strand = this.tentacles[t];
      let rootX = this.pos.x + map(t, 0, this.numTentacles - 1, -this.size * 0.4, this.size * 0.4);
      let rootY = this.pos.y + this.size * 0.3;

      strand[0].set(rootX, rootY);

      for (let j = 1; j < strand.length; j++) {
        let prev = strand[j - 1];
        let curr = strand[j];

        // Fluid sway displacement
        let sway = sin(this.timeOffset * 3 + j * 0.4 + t) * 1.5;
        curr.x = lerp(curr.x, prev.x + sway, 0.3);
        curr.y = lerp(curr.y, prev.y + (this.tentacleLength / strand.length), 0.25);
      }
    }
  }

  display(glowMult = 1.0, showDebug = false) {
    push();
    translate(this.pos.x, this.pos.y);

    let pulse = sin(this.pulsePhase);
    let bellW = this.size * (1 + pulse * 0.15);
    let bellH = this.size * (1 - pulse * 0.1);

    // 1. Glowing Inner Core Aura
    drawGlow(0, 0, bellW * 0.8 * glowMult, [236, 72, 153], glowMult);

    // 2. Translucent Deformed Bell Body
    push();
    stroke(244, 114, 182, 180);
    strokeWeight(1.2);
    fill(244, 114, 182, 35);

    beginShape();
    let numVerts = 20;
    for (let i = 0; i <= numVerts; i++) {
      let angle = map(i, 0, numVerts, -PI, 0);
      let n = noise(cos(angle) * 2 + this.timeOffset, sin(angle) * 2 + this.timeOffset) * 8;
      let rX = (bellW * 0.5) + n;
      let rY = (bellH * 0.6) + n;
      let x = cos(angle) * rX;
      let y = sin(angle) * rY;
      vertex(x, y);
    }
    // Bottom inner arch
    bezierVertex(bellW * 0.3, bellH * 0.2, -bellW * 0.3, bellH * 0.2, -bellW * 0.5, 0);
    endShape(CLOSE);
    pop();

    // 3. Iridescent Cilia Comb Rows (Rainbow light diffraction along ridges)
    push();
    colorMode(HSB, 360, 100, 100, 1.0);
    let combRows = 5;
    for (let c = 0; c < combRows; c++) {
      let xRatio = map(c, 0, combRows - 1, -0.4, 0.4);
      let ridgeX = bellW * xRatio;
      
      strokeWeight(2.5);
      for (let y = -bellH * 0.4; y < bellH * 0.1; y += 4) {
        let hueVal = (this.timeOffset * 200 + c * 40 + y * 2) % 360;
        stroke(hueVal, 80, 100, 0.8 * (glowMult > 0 ? 1 : 0.4));
        line(ridgeX - 3, y, ridgeX + 3, y);
      }
    }
    pop();

    pop(); // Reset translation for tentacles

    // 4. Draw Flowing Trailing Tentacles
    push();
    stroke(251, 207, 232, 140);
    strokeWeight(1.2);
    noFill();
    for (let t = 0; t < this.numTentacles; t++) {
      let strand = this.tentacles[t];
      beginShape();
      for (let j = 0; j < strand.length; j++) {
        curveVertex(strand[j].x, strand[j].y);
      }
      endShape();
    }
    pop();

    if (showDebug) {
      push();
      noFill();
      stroke(239, 68, 68, 200);
      rectMode(CENTER);
      rect(this.pos.x, this.pos.y, bellW, bellH);
      pop();
    }
  }
}
