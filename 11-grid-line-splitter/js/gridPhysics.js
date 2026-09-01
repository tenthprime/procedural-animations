/**
 * Grid Line Splitter & Weaver Physics Engine
 * Handles Dot Grid Matrix, Weaver Traversal, Cutter Line & Segment Splitting Math.
 */

// Matrix Grid Dot Node
class GridDot {
  constructor(x, y, gridX, gridY) {
    this.pos = createVector(x, y);
    this.gridX = gridX;
    this.gridY = gridY;
    this.activeTimer = 0;
  }

  pulse() {
    this.activeTimer = 1.0;
  }

  update() {
    if (this.activeTimer > 0) {
      this.activeTimer -= 0.03;
    }
  }

  display(theme) {
    push();
    noStroke();
    let col = theme.dot;

    if (this.activeTimer > 0) {
      fill(col[0], col[1], col[2], 220 * this.activeTimer);
      ellipse(this.pos.x, this.pos.y, 10 + this.activeTimer * 6);
    } else {
      fill(col[0], col[1], col[2], 80);
      ellipse(this.pos.x, this.pos.y, 4);
    }
    pop();
  }
}

// Weaver Line Segment
class WeaverSegment {
  constructor(startPt, dir) {
    this.points = [startPt.copy()];
    this.head = startPt.copy();
    this.dir = dir.copy();
    this.speed = 3.0;
    this.active = true;
    this.maxPoints = 40;
  }

  update(gridDots, speedMult = 1.0) {
    if (!this.active) return;

    let step = p5.Vector.mult(this.dir, this.speed * speedMult);
    this.head.add(step);
    this.points.push(this.head.copy());

    if (this.points.length > this.maxPoints) {
      this.points.shift();
    }

    // Touch & activate grid dots
    for (let dot of gridDots) {
      if (p5.Vector.dist(this.head, dot.pos) < 18) {
        dot.pulse();

        // 90 degree grid turn
        if (random() < 0.15) {
          let turnAngles = [HALF_PI, -HALF_PI];
          this.dir.rotate(random(turnAngles));
        }
      }
    }

    // Screen bounds bounce
    if (this.head.x < 50 || this.head.x > width - 50) this.dir.x *= -1;
    if (this.head.y < 50 || this.head.y > height - 50) this.dir.y *= -1;
  }

  display(theme) {
    push();
    stroke(theme.weaver[0], theme.weaver[1], theme.weaver[2], 220);
    strokeWeight(3.5);
    noFill();

    beginShape();
    for (let p of this.points) {
      vertex(p.x, p.y);
    }
    endShape();

    // Glowing head tip
    fill(theme.weaver[0], theme.weaver[1], theme.weaver[2]);
    noStroke();
    ellipse(this.head.x, this.head.y, 8, 8);
    pop();
  }
}

// Secondary Cutter Line (Different Color, Slices Weaver Lines)
class CutterLine {
  constructor() {
    this.p1 = createVector(0, random(height));
    this.p2 = createVector(width, random(height));
    this.dir = createVector(0, random([-1, 1]));
    this.speed = 2.5;
  }

  update(speedMult = 1.0) {
    this.p1.y += this.dir.y * this.speed * speedMult;
    this.p2.y += this.dir.y * this.speed * speedMult;

    if (this.p1.y < 50 || this.p1.y > height - 50) this.dir.y *= -1;
  }

  display(theme) {
    push();
    stroke(theme.cutter[0], theme.cutter[1], theme.cutter[2], 240);
    strokeWeight(3.0);
    line(this.p1.x, this.p1.y, this.p2.x, this.p2.y);

    // Glowing laser beam line
    stroke(255, 255, 255, 180);
    strokeWeight(1.2);
    line(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
    pop();
  }
}

// Line-Line Segment Intersection Solver (Line Slicing Math)
function checkIntersection(p1, p2, q1, q2) {
  let d = (p2.x - p1.x) * (q2.y - q1.y) - (p2.y - p1.y) * (q2.x - q1.x);
  if (d === 0) return null; // Parallel lines

  let u = ((q1.x - p1.x) * (q2.y - q1.y) - (q1.y - p1.y) * (q2.x - q1.x)) / d;
  let v = ((q1.x - p1.x) * (p2.y - p1.y) - (q1.y - p1.y) * (p2.x - p1.x)) / d;

  if (u >= 0 && u <= 1 && v >= 0 && v <= 1) {
    return createVector(p1.x + u * (p2.x - p1.x), p1.y + u * (p2.y - p1.y));
  }
  return null;
}
