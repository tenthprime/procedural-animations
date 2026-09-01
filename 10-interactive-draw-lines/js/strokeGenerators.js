/**
 * Stroke Recording & Generative Pattern Generators
 * Replicates user-drawn strokes into Radial Symmetries, Ribbon Flow Fields & 3D Tunnels.
 */

class StrokeRecorder {
  constructor() {
    this.strokes = [];
    this.currentStroke = null;
  }

  beginStroke(x, y) {
    this.currentStroke = [];
    this.currentStroke.push(createVector(x, y));
  }

  addPoint(x, y) {
    if (!this.currentStroke) return;
    let prev = this.currentStroke[this.currentStroke.length - 1];
    if (p5.Vector.dist(prev, createVector(x, y)) > 6) {
      this.currentStroke.push(createVector(x, y));
    }
  }

  endStroke() {
    if (this.currentStroke && this.currentStroke.length > 1) {
      this.strokes.push(this.currentStroke);
    }
    this.currentStroke = null;
  }

  clear() {
    this.strokes = [];
    this.currentStroke = null;
  }

  addDemoSeed() {
    let demo = [];
    let cx = width * 0.5;
    let cy = height * 0.5;
    for (let a = 0; a < TWO_PI; a += 0.2) {
      let r = 80 + sin(a * 4) * 40;
      demo.push(createVector(cx + cos(a) * r, cy + sin(a) * r));
    }
    this.strokes.push(demo);
  }
}

// Render Generative Replications based on user strokes
function renderGenerativeStrokes(strokeList, mode, numSymmetry, speed, glowMult, theme) {
  let cx = width * 0.5;
  let cy = height * 0.5;
  let time = millis() * 0.001 * speed;

  push();
  colorMode(HSB, 360, 100, 100, 1.0);

  if (mode === 'kaleido') {
    // Mode 1: 🌀 Radial Kaleido-Symmetry
    translate(cx, cy);
    let angleStep = TWO_PI / numSymmetry;

    for (let sIdx = 0; sIdx < strokeList.length; sIdx++) {
      let strokePts = strokeList[sIdx];
      let hueVal = (sIdx * 40 + time * 50) % 360;

      for (let sym = 0; sym < numSymmetry; sym++) {
        push();
        rotate(sym * angleStep + sin(time * 0.5 + sym) * 0.05);

        // Draw glowing symmetry strand
        noFill();
        stroke(hueVal, 85, 100, 0.8 * (glowMult > 0 ? 1 : 0.4));
        strokeWeight(3 * glowMult);

        beginShape();
        for (let i = 0; i < strokePts.length; i++) {
          let pt = strokePts[i];
          let relX = pt.x - cx;
          let relY = pt.y - cy;
          let wave = sin(time * 3.0 + i * 0.3) * 6;
          curveVertex(relX + wave, relY + wave);
        }
        endShape();
        pop();
      }
    }
  } else if (mode === 'ribbon') {
    // Mode 2: 🌊 Flowing Ribbon Waves
    for (let sIdx = 0; sIdx < strokeList.length; sIdx++) {
      let strokePts = strokeList[sIdx];
      let hueVal = (sIdx * 50 + time * 60) % 360;

      for (let r = 0; r < 6; r++) {
        noFill();
        stroke((hueVal + r * 25) % 360, 90, 100, map(r, 0, 6, 0.8, 0.2));
        strokeWeight(map(r, 0, 6, 4, 1.5) * glowMult);

        beginShape();
        for (let i = 0; i < strokePts.length; i++) {
          let pt = strokePts[i];
          let waveX = sin(time * 2.5 + i * 0.2 + r * 0.4) * (15 + r * 8);
          let waveY = cos(time * 2.0 + i * 0.2 + r * 0.4) * (15 + r * 8);
          curveVertex(pt.x + waveX, pt.y + waveY);
        }
        endShape();
      }
    }
  } else if (mode === 'tunnel') {
    // Mode 3: ⚡ 3D Holographic Tunnel
    translate(cx, cy);
    let layers = 16;

    for (let l = layers; l >= 1; l--) {
      let scaleFactor = map(l, 1, layers, 1.8, 0.1);
      let zAlpha = map(l, 1, layers, 0.9, 0.1);
      let hueVal = (l * 18 + time * 80) % 360;

      push();
      scale(scaleFactor);
      rotate(sin(time * 0.8 + l * 0.2) * 0.3);

      noFill();
      stroke(hueVal, 90, 100, zAlpha);
      strokeWeight(2 / scaleFactor);

      for (let strokePts of strokeList) {
        beginShape();
        for (let pt of strokePts) {
          curveVertex(pt.x - cx, pt.y - cy);
        }
        endShape();
      }
      pop();
    }
  } else if (mode === 'particles') {
    // Mode 4: ✨ Bioluminescent Emitter
    for (let sIdx = 0; sIdx < strokeList.length; sIdx++) {
      let strokePts = strokeList[sIdx];
      let hueVal = (sIdx * 45 + time * 70) % 360;

      noStroke();
      for (let i = 0; i < strokePts.length; i += 2) {
        let pt = strokePts[i];
        let pSize = (8 + sin(time * 5 + i) * 4) * glowMult;
        fill((hueVal + i * 3) % 360, 85, 100, 0.8);
        ellipse(pt.x + sin(time * 3 + i) * 10, pt.y + cos(time * 3 + i) * 10, pSize);
      }
    }
  }

  pop();
}
