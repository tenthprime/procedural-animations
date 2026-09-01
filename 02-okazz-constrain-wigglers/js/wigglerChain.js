/**
 * Okazz Wiggler Joint Chain Solver & Kinematics Engine
 */
class OkazzWiggler {
  constructor(x, y, species = 'ribbon', numSegments = 32, segDist = 14) {
    this.species = species;
    this.numSegments = numSegments;
    this.segDist = segDist;
    this.joints = [];

    for (let i = 0; i < this.numSegments; i++) {
      this.joints.push(createVector(x - i * this.segDist, y));
    }

    this.vel = p5.Vector.random2D().mult(3);
    this.acc = createVector(0, 0);
    this.wavePhase = random(100);
    this.timeOffset = random(1000);

    // Color palettes
    if (this.species === 'ribbon') this.hue = random(180, 240); // Cyan/Electric Blue
    else if (this.species === 'centipede') this.hue = random(10, 45); // Electric Orange/Red
    else if (this.species === 'dragon') this.hue = random(270, 330); // Neon Purple/Magenta
    else if (this.species === 'neonworm') this.hue = random(100, 160); // Toxic Lime Green
  }

  update(waveSpeed = 1.0, enableBounce = true, mouseTarget = null) {
    this.timeOffset += 0.01;
    this.wavePhase += 0.14 * waveSpeed;

    let head = this.joints[0];

    // Autonomous wandering force
    let noiseAngle = noise(head.x * 0.003, head.y * 0.003, this.timeOffset) * TWO_PI * 3;
    let wander = p5.Vector.fromAngle(noiseAngle).mult(0.4);
    this.acc.add(wander);

    // Mouse spring tension attraction
    if (mouseTarget) {
      let pull = p5.Vector.sub(mouseTarget, head);
      let d = pull.mag();
      if (d < 350) {
        pull.setMag(map(d, 0, 350, 1.2, 0.1));
        this.acc.add(pull);
      }
    }

    // Okazz constrain() Screen Edge Bouncing Logic
    if (enableBounce) {
      let margin = 60;
      if (head.x < margin) { head.x = margin; this.vel.x *= -0.8; }
      if (head.x > width - margin) { head.x = width - margin; this.vel.x *= -0.8; }
      if (head.y < margin) { head.y = margin; this.vel.y *= -0.8; }
      if (head.y > height - margin) { head.y = height - margin; this.vel.y *= -0.8; }
    }

    // Move head
    this.vel.add(this.acc);
    this.vel.limit(3.5);
    head.add(this.vel);
    this.acc.mult(0);

    // Okazz Inverse Kinematics Distance Solver
    for (let i = 1; i < this.joints.length; i++) {
      let prev = this.joints[i - 1];
      let curr = this.joints[i];
      let dir = p5.Vector.sub(curr, prev);
      dir.setMag(this.segDist);
      curr.set(p5.Vector.add(prev, dir));
    }
  }

  setSegments(n, d) {
    this.segDist = d;
    while (this.joints.length < n) {
      let last = this.joints[this.joints.length - 1];
      this.joints.push(last.copy().add(this.segDist, 0));
    }
    while (this.joints.length > n) this.joints.pop();
    this.numSegments = n;
  }

  display(showFins = true, showDebug = false) {
    push();
    colorMode(HSB, 360, 100, 100, 1.0);

    // 1. Render Lateral Fins / Ribbons
    if (showFins) {
      noFill();
      for (let i = 0; i < this.joints.length - 1; i++) {
        let pA = this.joints[i];
        let pB = this.joints[i + 1];

        let angle = p5.Vector.sub(pB, pA).heading();
        let normal = p5.Vector.fromAngle(angle + HALF_PI);

        let wave = sin(this.wavePhase - i * 0.25) * (1 - i / this.joints.length);
        let finLength = map(i, 0, this.joints.length, 40, 2) * (1 + wave * 0.5);

        let strokeHue = (this.hue + i * 2) % 360;
        stroke(strokeHue, 80, 100, map(i, 0, this.joints.length, 0.9, 0.2));
        strokeWeight(map(i, 0, this.joints.length, 3, 1));

        let rightFin = p5.Vector.add(pA, p5.Vector.mult(normal, finLength));
        let leftFin = p5.Vector.sub(pA, p5.Vector.mult(normal, finLength));

        line(pA.x, pA.y, rightFin.x, rightFin.y);
        line(pA.x, pA.y, leftFin.x, leftFin.y);

        // Centipede Leg Hooks
        if (this.species === 'centipede') {
          ellipse(rightFin.x, rightFin.y, 3, 3);
          ellipse(leftFin.x, leftFin.y, 3, 3);
        }
      }
    }

    // 2. Spine Body Hull Contour
    stroke((this.hue + 20) % 360, 90, 100, 0.9);
    fill(this.hue, 80, 80, 0.25);
    strokeWeight(1.5);

    beginShape();
    for (let i = 0; i < this.joints.length - 1; i++) {
      let pA = this.joints[i];
      let pB = this.joints[i + 1];
      let normal = p5.Vector.sub(pB, pA).heading() + HALF_PI;
      let r = map(i, 0, this.joints.length, 16, 3);
      vertex(pA.x + cos(normal) * r, pA.y + sin(normal) * r);
    }
    for (let i = this.joints.length - 2; i >= 0; i--) {
      let pA = this.joints[i];
      let pB = this.joints[i + 1];
      let normal = p5.Vector.sub(pB, pA).heading() - HALF_PI;
      let r = map(i, 0, this.joints.length, 16, 3);
      vertex(pA.x + cos(normal) * r, pA.y + sin(normal) * r);
    }
    endShape(CLOSE);

    // 3. Head Glow
    let head = this.joints[0];
    fill(this.hue, 90, 100, 1.0);
    noStroke();
    ellipse(head.x, head.y, 14, 14);

    // 4. Debug Joint Overlay
    if (showDebug) {
      stroke(0, 100, 100, 0.9);
      strokeWeight(2);
      noFill();
      for (let i = 0; i < this.joints.length; i++) {
        ellipse(this.joints[i].x, this.joints[i].y, 6, 6);
        if (i < this.joints.length - 1) line(this.joints[i].x, this.joints[i].y, this.joints[i + 1].x, this.joints[i + 1].y);
      }
    }

    pop();
  }
}
