/**
 * SeaAngelBoid Class - Advanced Clione limacina Flocking & Feeding Boid AI
 */
class SeaAngelBoid {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 2));
    this.acc = createVector(0, 0);

    this.maxSpeed = 2.4;
    this.maxForce = 0.08;
    this.size = random(38, 54);

    this.wingPhase = random(100);
    this.timeOffset = random(1000);
    this.angle = this.vel.heading() + HALF_PI;

    // Feeding state: 0 = swimming, 1 = striking prey with buccal cones
    this.strikeProgress = 0;
    this.targetPrey = null;

    // Visceral glowing core organ colors
    this.coreColor = [255, 90 + random(60), 30];
  }

  flock(boids, enableFlocking = true) {
    if (!enableFlocking) return;
    let sep = this.separate(boids).mult(1.5);
    let ali = this.align(boids).mult(1.0);
    let coh = this.cohere(boids).mult(1.0);
    
    this.acc.add(sep);
    this.acc.add(ali);
    this.acc.add(coh);
  }

  seekPrey(planktonList) {
    let closest = null;
    let recordDist = 280;

    for (let p of planktonList) {
      let d = p5.Vector.dist(this.pos, p.pos);
      if (d < recordDist) {
        recordDist = d;
        closest = p;
      }
    }

    if (closest) {
      let desired = p5.Vector.sub(closest.pos, this.pos);
      desired.setMag(this.maxSpeed * 1.4);
      let steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxForce * 2.0);
      this.acc.add(steer);

      // Trigger buccal cone strike if close enough
      if (recordDist < 40) {
        this.strikeProgress = 1.0;
        closest.eaten = true; // Consumed plankton
      }
    }
  }

  update(flapSpeedMult = 1.0, enableFlock = true, planktonList = []) {
    this.timeOffset += 0.01;
    this.wingPhase += 0.08 * flapSpeedMult;

    if (planktonList.length > 0) {
      this.seekPrey(planktonList);
    }

    // Wandering noise & screen boundaries
    let steer = p5.Vector.fromAngle(noise(this.pos.x * 0.005, this.pos.y * 0.005, this.timeOffset) * TWO_PI * 2).mult(0.12);
    this.acc.add(steer);
    this.boundaries();

    // Physics integration
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);

    let targetAngle = this.vel.heading() + HALF_PI;
    this.angle = lerpAngle(this.angle, targetAngle, 0.1);

    if (this.strikeProgress > 0) {
      this.strikeProgress -= 0.03;
    }
  }

  boundaries() {
    let margin = 80;
    let force = createVector(0, 0);
    if (this.pos.x < margin) force.x = 0.5;
    if (this.pos.x > width - margin) force.x = -0.5;
    if (this.pos.y < margin) force.y = 0.5;
    if (this.pos.y > height - margin) force.y = -0.5;
    this.acc.add(force);
  }

  separate(boids) {
    let desiredSep = 45;
    let steer = createVector(0, 0);
    let count = 0;
    for (let other of boids) {
      let d = p5.Vector.dist(this.pos, other.pos);
      if (d > 0 && d < desiredSep) {
        let diff = p5.Vector.sub(this.pos, other.pos).normalize().div(d);
        steer.add(diff);
        count++;
      }
    }
    if (count > 0) steer.div(count);
    if (steer.mag() > 0) {
      steer.setMag(this.maxSpeed);
      steer.sub(this.vel);
      steer.limit(this.maxForce);
    }
    return steer;
  }

  align(boids) {
    let neighborDist = 90;
    let sum = createVector(0, 0);
    let count = 0;
    for (let other of boids) {
      let d = p5.Vector.dist(this.pos, other.pos);
      if (d > 0 && d < neighborDist) {
        sum.add(other.vel);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count).setMag(this.maxSpeed);
      let steer = p5.Vector.sub(sum, this.vel);
      steer.limit(this.maxForce);
      return steer;
    }
    return createVector(0, 0);
  }

  cohere(boids) {
    let neighborDist = 100;
    let sum = createVector(0, 0);
    let count = 0;
    for (let other of boids) {
      let d = p5.Vector.dist(this.pos, other.pos);
      if (d > 0 && d < neighborDist) {
        sum.add(other.pos);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      let desired = p5.Vector.sub(sum, this.pos).setMag(this.maxSpeed);
      let steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxForce);
      return steer;
    }
    return createVector(0, 0);
  }

  display(glowMult = 1.0, showTentacles = true) {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);

    let h = this.size;
    let w = h * 0.45;

    // Glowing organ core
    let r = this.coreColor[0], g = this.coreColor[1], b = this.coreColor[2];
    push();
    noStroke();
    for (let i = w * 0.5 * glowMult; i > 0; i -= 3) {
      fill(r, g, b, map(i, 0, w * 0.5 * glowMult, 150 * glowMult, 0));
      ellipse(0, -h * 0.1, i * 2);
    }
    fill(r, g, b, 230);
    ellipse(0, -h * 0.1, w * 0.38, h * 0.24);
    pop();

    // Translucent gelatinous mantle
    push();
    stroke(186, 230, 253, 160);
    strokeWeight(1.2);
    fill(186, 230, 253, 40);
    beginShape();
    vertex(0, -h * 0.5);
    bezierVertex(w * 0.6, -h * 0.35, w * 0.5, h * 0.1, 0, h * 0.5);
    bezierVertex(-w * 0.5, h * 0.1, -w * 0.6, -h * 0.35, 0, -h * 0.5);
    endShape(CLOSE);
    pop();

    // Sinusoidal Flapping Wings
    let flapAngle = sin(this.wingPhase) * 0.75;
    let wingLen = h * 0.65;

    // Right wing
    push();
    translate(w * 0.25, -h * 0.2);
    rotate(flapAngle);
    stroke(186, 230, 253, 200);
    fill(186, 230, 253, 80);
    beginShape();
    vertex(0, 0);
    bezierVertex(wingLen * 0.6, -wingLen * 0.4, wingLen, 0, wingLen * 0.8, wingLen * 0.4);
    bezierVertex(wingLen * 0.4, wingLen * 0.3, wingLen * 0.2, wingLen * 0.1, 0, 0);
    endShape(CLOSE);
    pop();

    // Left wing
    push();
    translate(-w * 0.25, -h * 0.2);
    rotate(-flapAngle);
    stroke(186, 230, 253, 200);
    fill(186, 230, 253, 80);
    beginShape();
    vertex(0, 0);
    bezierVertex(-wingLen * 0.6, -wingLen * 0.4, -wingLen, 0, -wingLen * 0.8, wingLen * 0.4);
    bezierVertex(-wingLen * 0.4, wingLen * 0.3, -wingLen * 0.2, -wingLen * 0.1, 0, 0);
    endShape(CLOSE);
    pop();

    // Buccal Feeding Cones (Tentacles)
    if (showTentacles) {
      push();
      stroke(255, 90, 70, 220);
      strokeWeight(1.8);
      noFill();
      let strikeExt = this.strikeProgress * 15; // Extends tentacles forward during prey strike
      let sway = sin(this.timeOffset * 6) * 3;

      // 6 buccal cones popping out from head
      line(-w * 0.15, -h * 0.48, -w * 0.3 + sway, -h * 0.6 - strikeExt);
      line(w * 0.15, -h * 0.48, w * 0.3 + sway, -h * 0.6 - strikeExt);
      line(0, -h * 0.48, sway, -h * 0.65 - strikeExt);
      pop();
    }

    pop();
  }
}

function lerpAngle(a, b, step) {
  let diff = (b - a) % TWO_PI;
  if (diff < -PI) diff += TWO_PI;
  if (diff > PI) diff -= TWO_PI;
  return a + diff * step;
}
