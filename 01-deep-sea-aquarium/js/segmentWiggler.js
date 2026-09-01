/**
 * SegmentWiggler Class
 * Inspired by Okazz's constrain() procedural motion sketches on Twitter.
 * Uses distance-constrained segment joints, phase-offset lateral fins, and smooth undulation.
 */
class SegmentWiggler {
  constructor(x, y, segmentCount = 24) {
    this.numSegments = segmentCount;
    this.segLength = 12;
    this.joints = [];
    
    // Initialize head and trailing joints
    for (let i = 0; i < this.numSegments; i++) {
      this.joints.push(createVector(x - i * this.segLength, y));
    }

    this.vel = p5.Vector.random2D().mult(2.0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 3.0;
    this.timeOffset = random(1000);
    this.wavePhase = random(100);

    // Color theme (Cyan / Neon Emerald / Deep Purple)
    this.hue = random(160, 220); // Cyan to electric blue
  }

  update(speedMult = 1.0, mouseTarget = null, targetSegments = 24) {
    // Dynamically adjust segment count if slider changed
    if (targetSegments !== this.numSegments) {
      this.adjustSegmentCount(targetSegments);
    }

    this.timeOffset += 0.01;
    this.wavePhase += 0.12 * speedMult;

    // 1. Move Head Segment (joint[0]) using Steering Noise
    let head = this.joints[0];
    let steer = getNoiseSteering(head, this.timeOffset, 0.002, 0.35);
    let bound = getBoundaryForce(head, width, height, 100, 1.2);
    
    this.acc.add(steer);
    this.acc.add(bound);

    if (mouseTarget) {
      let mForce = p5.Vector.sub(mouseTarget, head);
      let dist = mForce.mag();
      if (dist < 400) {
        mForce.setMag(map(dist, 0, 400, 0.8, 0.1));
        this.acc.add(mForce);
      }
    }

    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed * speedMult);
    head.add(this.vel);
    this.acc.mult(0);

    // 2. Solve Distance Constraints along Spine Chain (Okazz style constrain logic)
    for (let i = 1; i < this.numSegments; i++) {
      solveDistanceConstraint(this.joints[i - 1], this.joints[i], this.segLength);
    }
  }

  adjustSegmentCount(newCount) {
    while (this.joints.length < newCount) {
      let last = this.joints[this.joints.length - 1];
      this.joints.push(last.copy().add(p5.Vector.random2D().mult(this.segLength)));
    }
    while (this.joints.length > newCount) {
      this.joints.pop();
    }
    this.numSegments = newCount;
  }

  display(glowMult = 1.0, showDebug = false) {
    push();

    // 1. Draw Undulating Lateral Ribbon Fins
    noFill();
    for (let i = 0; i < this.numSegments - 1; i++) {
      let pA = this.joints[i];
      let pB = this.joints[i + 1];

      // Segment heading angle & perpendicular normal vector
      let dir = p5.Vector.sub(pB, pA);
      let angle = dir.heading();
      let normal = p5.Vector.fromAngle(angle + HALF_PI);

      // Phase-delayed sine wave fin wiggle (Okazz undulating ribbon effect)
      let wave = sin(this.wavePhase - i * 0.3) * (1 - i / this.numSegments);
      let finLength = map(i, 0, this.numSegments, 36, 4) * (1 + wave * 0.4);

      let colorAlpha = map(i, 0, this.numSegments, 180, 40);
      stroke(56, 189, 248, colorAlpha * (glowMult > 0 ? 1 : 0.5));
      strokeWeight(map(i, 0, this.numSegments, 3, 1));

      // Right & Left Fin Rays
      let rightFin = p5.Vector.add(pA, p5.Vector.mult(normal, finLength));
      let leftFin = p5.Vector.sub(pA, p5.Vector.mult(normal, finLength));

      line(pA.x, pA.y, rightFin.x, rightFin.y);
      line(pA.x, pA.y, leftFin.x, leftFin.y);
    }

    // 2. Draw Tapered Spine Body Hull
    stroke(14, 165, 233, 220);
    fill(14, 165, 233, 50);
    beginShape();
    // Left side hull
    for (let i = 0; i < this.numSegments - 1; i++) {
      let pA = this.joints[i];
      let pB = this.joints[i + 1];
      let normal = p5.Vector.sub(pB, pA).heading() + HALF_PI;
      let r = map(i, 0, this.numSegments, 14, 2);
      vertex(pA.x + cos(normal) * r, pA.y + sin(normal) * r);
    }
    // Right side hull
    for (let i = this.numSegments - 2; i >= 0; i--) {
      let pA = this.joints[i];
      let pB = this.joints[i + 1];
      let normal = p5.Vector.sub(pB, pA).heading() - HALF_PI;
      let r = map(i, 0, this.numSegments, 14, 2);
      vertex(pA.x + cos(normal) * r, pA.y + sin(normal) * r);
    }
    endShape(CLOSE);

    // 3. Glowing Head Node
    let head = this.joints[0];
    drawGlow(head.x, head.y, 16 * glowMult, [56, 189, 248], glowMult);

    fill(255);
    noStroke();
    ellipse(head.x, head.y, 10, 10);

    // 4. Debug Joint Kinematics View
    if (showDebug) {
      stroke(239, 68, 68, 250);
      strokeWeight(2);
      noFill();
      for (let i = 0; i < this.numSegments; i++) {
        ellipse(this.joints[i].x, this.joints[i].y, 8, 8);
        if (i < this.numSegments - 1) {
          line(this.joints[i].x, this.joints[i].y, this.joints[i + 1].x, this.joints[i + 1].y);
        }
      }
    }

    pop();
  }
}
