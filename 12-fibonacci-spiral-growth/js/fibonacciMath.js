/**
 * Fibonacci Sequence & Box Geometry Builder
 * Calculates Fibonacci numbers, box positions, number labels, and Golden Spiral arcs.
 */

class FibonacciBoxSystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.sequence = [1, 1];
    this.boxes = [];
    this.currentStep = 0;

    // Base unit box size
    let baseUnit = 25;

    // Initial 1x1 Box
    this.boxes.push({
      n: 1,
      x: 0,
      y: 0,
      w: baseUnit,
      h: baseUnit,
      dir: 0
    });

    this.updateBoundingBox();
  }

  stepNext() {
    let len = this.sequence.length;
    let nextNum = this.sequence[len - 1] + this.sequence[len - 2];
    this.sequence.push(nextNum);

    let baseUnit = 25;
    let size = nextNum * baseUnit;
    let dir = (len - 1) % 4; // Rotating direction: Right, Up, Left, Down

    let newX = 0;
    let newY = 0;

    // Attach next Fibonacci square around current bounding box
    if (dir === 0) {
      // Attach Right
      newX = this.minX + this.totalWidth;
      newY = this.minY;
    } else if (dir === 1) {
      // Attach Up
      newX = this.minX;
      newY = this.minY - size;
    } else if (dir === 2) {
      // Attach Left
      newX = this.minX - size;
      newY = this.minY + this.totalHeight - size;
    } else if (dir === 3) {
      // Attach Down
      newX = this.minX;
      newY = this.minY + this.totalHeight;
    }

    this.boxes.push({
      n: nextNum,
      x: newX,
      y: newY,
      w: size,
      h: size,
      dir: dir
    });

    this.updateBoundingBox();
    this.currentStep++;
  }

  updateBoundingBox() {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (let b of this.boxes) {
      if (b.x < minX) minX = b.x;
      if (b.y < minY) minY = b.y;
      if (b.x + b.w > maxX) maxX = b.x + b.w;
      if (b.y + b.h > maxY) maxY = b.y + b.h;
    }

    this.minX = minX;
    this.minY = minY;
    this.totalWidth = maxX - minX;
    this.totalHeight = maxY - minY;

    this.centerX = (minX + maxX) * 0.5;
    this.centerY = (minY + maxY) * 0.5;
  }

  display(theme, showNumbers = true, showArc = true) {
    push();
    colorMode(HSB, 360, 100, 100, 1.0);

    // 1. Draw Fibonacci Boxes & Number Labels
    for (let i = 0; i < this.boxes.length; i++) {
      let b = this.boxes[i];
      let hueVal = (i * 35) % 360;

      // Box Outline & Fill
      stroke(hueVal, 85, 100, 0.9);
      strokeWeight(2.5 / (currentScale || 1));
      fill(hueVal, 75, 40, 0.35);
      rect(b.x, b.y, b.w, b.h, 4);

      // Render Number Label On Top
      if (showNumbers) {
        push();
        noStroke();
        fill(255);
        textAlign(CENTER, CENTER);
        // Dynamic font size proportional to box scale
        let fontSize = constrain(b.w * 0.35, 12, 54);
        textSize(fontSize);
        textStyle(BOLD);
        text(b.n, b.x + b.w * 0.5, b.y + b.h * 0.5);
        pop();
      }
    }

    // 2. Draw Continuous Golden Ratio Spiral Arc
    if (showArc) {
      stroke(56, 189, 248, 240);
      strokeWeight(3.5 / (currentScale || 1));
      noFill();

      for (let i = 0; i < this.boxes.length; i++) {
        let b = this.boxes[i];
        let arcCenterX, arcCenterY, startA, endA;

        if (b.dir === 0) {
          arcCenterX = b.x; arcCenterY = b.y + b.h;
          startA = -HALF_PI; endA = 0;
        } else if (b.dir === 1) {
          arcCenterX = b.x; arcCenterY = b.y;
          startA = 0; endA = HALF_PI;
        } else if (b.dir === 2) {
          arcCenterX = b.x + b.w; arcCenterY = b.y;
          startA = HALF_PI; endA = PI;
        } else {
          arcCenterX = b.x + b.w; arcCenterY = b.y + b.h;
          startA = PI; endA = 1.5 * PI;
        }

        arc(arcCenterX, arcCenterY, b.w * 2, b.h * 2, startA, endA);
      }
    }

    pop();
  }
}
