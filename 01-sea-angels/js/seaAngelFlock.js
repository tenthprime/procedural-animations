/**
 * SeaAngelBoid Class - Advanced Clione limacina Flocking & Feeding Boid AI
 * Enhanced with High-Speed Food Pursuit & Dynamic Eating Growth Mechanics.
 */
class SeaAngelBoid {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 2));
    this.acc = createVector(0, 0);

    this.maxSpeed = 2.4;
    this.maxForce = 0.08;
    this.baseSize = random(38, 52);
    this.size = this.baseSize;
    this.growthScale = 1.0;
    this.growTextTimer = 0;

    this.wingPhase = random(100);
    this.timeOffset = random(1000);
    this.angle = this.vel.heading() + HALF_PI;

    // Feeding state: 0 = swimming, 1 = striking prey with buccal cones
    this.strikeProgress = 0;
    this.targetPrey = null;
    this.isHunting = false;

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
    let recordDist = 800; // Screen-wide food detection radius

    for (let p of planktonList) {
      if (p.eaten) continue;
      let d = p5.Vector.dist(this.pos, p.pos);
      if (d < recordDist) {
        recordDist = d;
        closest = p;
      }
    }

    if (closest) {
      this.isHunting = true;
      let desired = p5.Vector.sub(closest.pos, this.pos);

      // High-speed food pursuit ("Run for it!")
      desired.setMag(this.maxSpeed * 3.0);
      let steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxForce * 4.0);
      this.acc.add(steer);

      // Rapid wing flapping during sprint pursuit
      this.wingPhase += 0.20;

      // Trigger buccal cone strike & eating growth if close enough
      if (recordDist < 45) {
        this.strikeProgress = 1.0;
        closest.eaten = true; // Consumed plankton

        // Growth Evolution: Size increases upon eating food!
        this.growthScale = min(this.growthScale + 0.15, 3.2);
        this.size = min(this.size * 1.12, 160);
        this.growTextTimer = 60; // Show "+GROW!" text
      }
    } else {
      this.isHunting = false;
    }
  }

  update(flapSpeedMult = 1.0, enableFlock = true, planktonList = []) {
    this.timeOffset += 0.01;
    this.wingPhase += 0.08 * flapSpeedMult;

    if (planktonList.length > 0) {
      this.seekPrey(planktonList);
    } else {
      this.isHunting = false;
    }

    // Wandering noise & screen boundaries
    let steer = p5.Vector.fromAngle(noise(this.pos.x * 0.005, this.pos.y * 0.005, this.timeOffset) * TWO_PI * 2).mult(0.12);
    this.acc.add(steer);
    this.boundaries();

    // Physics integration
    this.vel.add(this.acc);
    let speedLimit = this.isHunting ? this.maxSpeed * 2.8 : this.maxSpeed;
    this.vel.limit(speedLimit);
    this.pos.add(this.vel);
    this.acc.mult(0);

    let targetAngle = this.vel.heading() + HALF_PI;
    this.angle = lerpAngle(this.angle, targetAngle, 0.12);

    if (this.strikeProgress > 0) {
      this.strikeProgress -= 0.03;
    }

    if (this.growTextTimer > 0) {
      this.growTextTimer--;
    }
  }

  boundaries() {
    let margin = 60;
    let force = createVector(0, 0);
    if (this.pos.x < margin) force.x = 0.6;
    if (this.pos.x > width - margin) force.x = -0.6;
    if (this.pos.y < margin) force.y = 0.6;
    if (this.pos.y > height - margin) force.y = -0.6;
    this.acc.add(force);
  }

  separate(boids) {
    let desiredSep = 45 * this.growthScale;
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
    strokeWeight(1.2 * this.growthScale);
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
    if (showTentacles || this.isHunting || this.strikeProgress > 0) {
      push();
      stroke(255, 90, 70, 230);
      strokeWeight(1.8 * this.growthScale);
      noFill();
      let strikeExt = (this.strikeProgress > 0 ? this.strikeProgress : (this.isHunting ? 0.6 : 0.2)) * 20 * this.growthScale;
      let sway = sin(this.timeOffset * 6) * 3;

      // 6 buccal cones popping out from head
      line(-w * 0.15, -h * 0.48, -w * 0.3 + sway, -h * 0.6 - strikeExt);
      line(w * 0.15, -h * 0.48, w * 0.3 + sway, -h * 0.6 - strikeExt);
      line(0, -h * 0.48, sway, -h * 0.65 - strikeExt);
      pop();
    }

    // Floating "+GROW!" indicator text over head upon eating food
    if (this.growTextTimer > 0) {
      push();
      noStroke();
      fill(74, 222, 128, map(this.growTextTimer, 0, 60, 0, 255));
      textAlign(CENTER);
      textSize(14 * this.growthScale);
      textStyle(BOLD);
      text("+GROW!", 0, -h * 0.65 - (60 - this.growTextTimer) * 0.5);
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
