/**
 * ABYSSAL Vertical Ocean Fauna Engine
 * Spawns depth-specific bioluminescent creatures across 4 depth zones.
 */

class Anglerfish {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-0.5, 0.5), random(-0.2, 0.2));
    this.size = random(55, 75);
    this.lureAngle = 0;
    this.timeOffset = random(1000);
  }

  update() {
    this.timeOffset += 0.02;
    this.lureAngle = sin(this.timeOffset * 2) * 0.3;
    this.pos.add(this.vel);

    if (this.pos.x < 100 || this.pos.x > width - 100) this.vel.x *= -1;
  }

  display(camY) {
    let screenY = this.pos.y - camY;
    push();
    translate(this.pos.x, screenY);
    let facing = this.vel.x >= 0 ? 1 : -1;
    scale(facing, 1);

    let h = this.size;

    // Glowing Esca Lure
    let lureX = h * 0.45;
    let lureY = -h * 0.55 + sin(this.timeOffset * 3) * 4;
    push();
    noStroke();
    fill(56, 189, 248, 180);
    ellipse(lureX, lureY, 18, 18);
    fill(255);
    ellipse(lureX, lureY, 8, 8);
    pop();

    // Lure Stalk
    stroke(56, 189, 248, 200);
    strokeWeight(2);
    noFill();
    bezier(0, -h * 0.2, lureX * 0.3, -h * 0.6, lureX * 0.7, -h * 0.6, lureX, lureY);

    // Dark Menacing Body & Teeth
    fill(15, 23, 42);
    stroke(56, 189, 248, 100);
    strokeWeight(1.5);
    ellipse(0, 0, h * 1.1, h * 0.85);

    // Glowing Eye
    fill(244, 63, 94);
    noStroke();
    ellipse(h * 0.25, -h * 0.15, 8, 8);

    // Sharp Teeth
    stroke(255);
    strokeWeight(1.5);
    line(h * 0.1, h * 0.1, h * 0.18, h * 0.28);
    line(h * 0.2, h * 0.1, h * 0.28, h * 0.25);
    line(h * 0.3, h * 0.1, h * 0.35, h * 0.22);
    pop();
  }
}

class Siphonophore {
  constructor(x, y, length = 18) {
    this.pos = createVector(x, y);
    this.length = length;
    this.nodes = [];
    for (let i = 0; i < length; i++) {
      this.nodes.push(createVector(x, y + i * 14));
    }
    this.timeOffset = random(1000);
  }

  update() {
    this.timeOffset += 0.015;
    let head = this.nodes[0];
    head.x += sin(this.timeOffset) * 0.8;
    head.y += cos(this.timeOffset * 0.7) * 0.4;

    for (let i = 1; i < this.nodes.length; i++) {
      let prev = this.nodes[i - 1];
      let curr = this.nodes[i];
      curr.x = lerp(curr.x, prev.x + sin(this.timeOffset + i * 0.3) * 3, 0.25);
      curr.y = lerp(curr.y, prev.y + 14, 0.25);
    }
  }

  display(camY) {
    push();
    stroke(168, 85, 247, 180);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let n of this.nodes) {
      curveVertex(n.x, n.y - camY);
    }
    endShape();

    // Glowing Zooid Nodes
    noStroke();
    for (let i = 0; i < this.nodes.length; i++) {
      let n = this.nodes[i];
      fill(168, 85, 247, 220);
      ellipse(n.x, n.y - camY, 8, 8);
      fill(236, 72, 153, 140);
      ellipse(n.x, n.y - camY, 16, 16);
    }
    pop();
  }
}
