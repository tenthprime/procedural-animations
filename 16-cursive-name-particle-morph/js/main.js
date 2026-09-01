/**
 * Procedural Cursive Name Particle Engine (3-Phase State Machine)
 * Phase 1: Dots Flow In -> Phase 2: Collide & Form Lines -> Phase 3: Form Lengthy Cursive Name
 */

let particles = [];
let cursivePath = [];
let numParticles = 1200;
let numColors = 6;
let currentTheme = 'rainbow';
let flowSpeed = 1.0;
let connectLines = true;
let enableGlow = true;
let currentText = 'Antigravity';

// 3-Phase State Machine: 1: INFLOW, 2: COLLIDE_LINES, 3: WRITE_NAME
let phase = 1; 
let phaseTimer = 0;
let writeProgress = 0;

class MorphParticle {
  constructor(index, total) {
    this.index = index;
    this.resetInflow();
    this.colorIdx = index % numColors;
    this.size = random(4, 7);
    this.connected = false;
    this.strokeTarget = createVector(0, 0);
  }

  resetInflow() {
    let angle = random(TWO_PI);
    let dist = max(width, height) * 0.7;
    this.pos = createVector(width * 0.5 + cos(angle) * dist, height * 0.5 + sin(angle) * dist);
    this.vel = p5.Vector.random2D().mult(random(3, 7));
    this.target = createVector(width * 0.5 + random(-200, 200), height * 0.5 + random(-150, 150));
  }

  update(currentPhase, writeProgressRatio) {
    if (currentPhase === 1) {
      // Phase 1: Inflow Swarm from outer edges towards random collision center
      let dir = p5.Vector.sub(this.target, this.pos);
      dir.setMag(3.5 * flowSpeed);
      let noiseAngle = noise(this.pos.x * 0.005, this.pos.y * 0.005, frameCount * 0.02) * TWO_PI * 2;
      let noiseVec = p5.Vector.fromAngle(noiseAngle).mult(2.0 * flowSpeed);

      this.vel.lerp(dir.add(noiseVec), 0.15);
      this.pos.add(this.vel);

    } else if (currentPhase === 2) {
      // Phase 2: Collide & Form Lengthy Line Strokes
      this.pos.add(p5.Vector.mult(this.vel, 0.4 * flowSpeed));
      this.vel.mult(0.96);

    } else if (currentPhase === 3) {
      // Phase 3: Morph onto Cursive Handwriting Path
      let pathIdx = Math.floor((this.index / numParticles) * cursivePath.length);
      let maxActiveIdx = Math.floor(writeProgressRatio * cursivePath.length);

      if (pathIdx <= maxActiveIdx) {
        let pt = cursivePath[pathIdx];
        let cursiveTarget = createVector(width * 0.5 + pt.x, height * 0.5 + pt.y);
        let force = p5.Vector.sub(cursiveTarget, this.pos);
        force.setMag(6.0 * flowSpeed);
        this.vel.lerp(force, 0.2);
        this.pos.add(this.vel);
      }
    }
  }

  getColor(theme, numCols) {
    let ratio = (this.colorIdx % numCols) / numCols;
    colorMode(HSB, 360, 100, 100, 1.0);

    if (theme === 'rainbow') {
      return color((ratio * 360 + frameCount * 2) % 360, 85, 100);
    } else if (theme === 'cyber') {
      return color(ratio > 0.5 ? 320 : 190, 90, 100);
    } else if (theme === 'gold') {
      return color(mixHue(45, 280, ratio), 85, 100);
    } else {
      return color(mixHue(140, 75, ratio), 90, 100);
    }
  }
}

function mixHue(h1, h2, r) {
  return (h1 + (h2 - h1) * r + 360) % 360;
}

function setup() {
  let container = document.getElementById('canvas-container');
  let canvas = createCanvas(container.clientWidth, container.clientHeight);
  canvas.parent('canvas-container');

  initEngine(currentText);
  initUI();
}

function initEngine(textStr) {
  currentText = textStr;
  cursivePath = extractSequentialCursivePath(textStr, numParticles);

  phase = 1;
  phaseTimer = 0;
  writeProgress = 0;

  particles = [];
  for (let i = 0; i < numParticles; i++) {
    particles.push(new MorphParticle(i, numParticles));
  }
}

function draw() {
  background(3, 7, 18);

  // Background radial glow
  push();
  noStroke();
  let ctx = drawingContext;
  let gradient = ctx.createRadialGradient(width * 0.5, height * 0.5, 50, width * 0.5, height * 0.5, width * 0.8);
  gradient.addColorStop(0, 'rgba(30, 27, 75, 0.4)');
  gradient.addColorStop(1, 'rgba(3, 7, 18, 0.98)');
  ctx.fillStyle = gradient;
  rect(0, 0, width, height);
  pop();

  phaseTimer++;

  // 3-Phase Progression State Timers
  if (phase === 1 && phaseTimer > 90) {
    phase = 2; // Move to Collision & Line Formation Phase
  } else if (phase === 2 && phaseTimer > 180) {
    phase = 3; // Move to Cursive Name Writing Phase
  }

  if (phase === 3 && writeProgress < 1.0) {
    writeProgress = min(1.0, writeProgress + 0.01 * flowSpeed);
  }

  // Update HUD Phase Status
  let phaseText = '1️⃣ Dots Inflow Swarm';
  if (phase === 2) phaseText = '2️⃣ Colliding & Forming Lengthy Lines';
  if (phase === 3) phaseText = `3️⃣ Writing Cursive Name (${Math.round(writeProgress * 100)}%)`;
  document.getElementById('hud-phase').innerText = phaseText;

  let lineCount = 0;

  // 1. Update Particles & Check Collisions
  for (let i = 0; i < particles.length; i++) {
    let p1 = particles[i];
    p1.update(phase, writeProgress);

    // Phase 2 & 3: Connect colliding particles into lengthy ribbon lines
    if (connectLines && (phase >= 2)) {
      for (let j = i + 1; j < min(i + 14, particles.length); j++) {
        let p2 = particles[j];
        let d = p5.Vector.dist(p1.pos, p2.pos);
        let maxDist = phase === 2 ? 55 : 35;

        if (d < maxDist) {
          lineCount++;
          let c = p1.getColor(currentTheme, numColors);
          stroke(hue(c), saturation(c), brightness(c), map(d, 0, maxDist, 0.8, 0.15));
          strokeWeight(phase === 2 ? 2.5 : 2.0);
          line(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y);
        }
      }
    }
  }

  // 2. Render Glowing Dots
  for (let p of particles) {
    let c = p.getColor(currentTheme, numColors);

    if (enableGlow) {
      fill(hue(c), saturation(c), brightness(c), 0.3);
      noStroke();
      ellipse(p.pos.x, p.pos.y, p.size * 2.5);
    }

    fill(hue(c), saturation(c), brightness(c), 0.95);
    noStroke();
    ellipse(p.pos.x, p.pos.y, p.size);
  }

  // Stats Display
  if (frameCount % 10 === 0) {
    document.getElementById('stat-dots').innerText = particles.length;
    document.getElementById('stat-lines').innerText = lineCount;
  }
}

function windowResized() {
  let container = document.getElementById('canvas-container');
  resizeCanvas(container.clientWidth, container.clientHeight);
  initEngine(currentText);
}

function initUI() {
  // Slide-in drawer toggle
  let toggleBtn = document.getElementById('toggle-panel-btn');
  let panel = document.getElementById('control-panel');

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('collapsed');
    let isCollapsed = panel.classList.contains('collapsed');
    toggleBtn.innerHTML = isCollapsed ? '⚙️ Controls' : '✕ Close';
  });

  let nameInput = document.getElementById('name-input');
  let btnMorph = document.getElementById('btn-morph');

  btnMorph.addEventListener('click', () => {
    let textStr = nameInput.value.trim() || 'Antigravity';
    initEngine(textStr);
  });

  nameInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      let textStr = nameInput.value.trim() || 'Antigravity';
      initEngine(textStr);
    }
  });

  document.getElementById('num-colors-slider').addEventListener('input', (e) => {
    numColors = parseInt(e.target.value);
    document.getElementById('val-colors').innerText = numColors;
  });

  document.getElementById('select-theme').addEventListener('change', (e) => currentTheme = e.target.value);

  document.getElementById('particles-slider').addEventListener('input', (e) => {
    numParticles = parseInt(e.target.value);
    document.getElementById('val-particles').innerText = numParticles;
    initEngine(currentText);
  });

  document.getElementById('speed-slider').addEventListener('input', (e) => {
    flowSpeed = parseFloat(e.target.value);
    document.getElementById('val-speed').innerText = flowSpeed.toFixed(1);
  });

  document.getElementById('chk-lines').addEventListener('change', (e) => connectLines = e.target.checked);
  document.getElementById('chk-glow').addEventListener('change', (e) => enableGlow = e.target.checked);

  // Download HD Snapshot
  document.getElementById('btn-download').addEventListener('click', () => {
    saveCanvas('Cursive_Name_Particle_Morph', 'png');
  });
}
