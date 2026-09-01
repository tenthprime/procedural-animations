/**
 * Interactive Draw-to-Generate Neon Line Studio Main Controller
 */

let strokeRecorder;
let currentMode = 'kaleido';
let uiSymmetry = 8;
let uiSpeed = 1.0;
let uiGlow = 1.0;
let currentTheme = 'cyber';

function setup() {
  let container = document.getElementById('canvas-container');
  let canvas = createCanvas(container.clientWidth, container.clientHeight);
  canvas.parent('canvas-container');

  strokeRecorder = new StrokeRecorder();
  strokeRecorder.addDemoSeed(); // Add initial demo seed pattern

  initUI();
}

function draw() {
  background(3, 7, 18);

  // Deep canvas background glow
  push();
  noStroke();
  let ctx = drawingContext;
  let gradient = ctx.createRadialGradient(width * 0.5, height * 0.5, 50, width * 0.5, height * 0.5, width * 0.8);
  gradient.addColorStop(0, 'rgba(30, 27, 75, 0.4)');
  gradient.addColorStop(1, 'rgba(3, 7, 18, 0.98)');
  ctx.fillStyle = gradient;
  rect(0, 0, width, height);
  pop();

  // Handle Active Drawing Input
  if (mouseIsPressed && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    // Check if user is clicking on slide-in panel area
    let panel = document.getElementById('control-panel');
    let isCollapsed = panel.classList.contains('collapsed');
    if (isCollapsed || mouseX < width - 340 || mouseY > 520) {
      if (!strokeRecorder.currentStroke) {
        strokeRecorder.beginStroke(mouseX, mouseY);
      } else {
        strokeRecorder.addPoint(mouseX, mouseY);
      }
    }
  }

  // Render Generative Pattern Replications
  let allStrokes = [...strokeRecorder.strokes];
  if (strokeRecorder.currentStroke) {
    allStrokes.push(strokeRecorder.currentStroke);
  }

  renderGenerativeStrokes(allStrokes, currentMode, uiSymmetry, uiSpeed, uiGlow, currentTheme);

  // Render Current Drawing Trail Cursor Line
  if (strokeRecorder.currentStroke) {
    push();
    stroke(255, 255, 255, 220);
    strokeWeight(3);
    noFill();
    beginShape();
    for (let pt of strokeRecorder.currentStroke) {
      vertex(pt.x, pt.y);
    }
    endShape();
    pop();
  }

  // Stats Display
  if (frameCount % 10 === 0) {
    document.getElementById('stat-strokes').innerText = strokeRecorder.strokes.length;
    document.getElementById('stat-fps').innerText = Math.round(frameRate());
  }
}

function mouseReleased() {
  strokeRecorder.endStroke();
}

function windowResized() {
  let container = document.getElementById('canvas-container');
  resizeCanvas(container.clientWidth, container.clientHeight);
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

  document.getElementById('select-mode').addEventListener('change', (e) => currentMode = e.target.value);
  document.getElementById('select-theme').addEventListener('change', (e) => currentTheme = e.target.value);

  document.getElementById('symmetry-slider').addEventListener('input', (e) => {
    uiSymmetry = parseInt(e.target.value);
    document.getElementById('val-sym').innerText = uiSymmetry;
  });

  document.getElementById('speed-slider').addEventListener('input', (e) => {
    uiSpeed = parseFloat(e.target.value);
    document.getElementById('val-speed').innerText = uiSpeed.toFixed(1);
  });

  document.getElementById('glow-slider').addEventListener('input', (e) => {
    uiGlow = parseFloat(e.target.value) / 100;
    document.getElementById('val-glow').innerText = e.target.value;
  });

  document.getElementById('btn-clear').addEventListener('click', () => strokeRecorder.clear());
  document.getElementById('btn-preset').addEventListener('click', () => strokeRecorder.addDemoSeed());

  // Download HD Snapshot
  document.getElementById('btn-download').addEventListener('click', () => {
    saveCanvas('Draw_Neon_Pattern_Art', 'png');
  });
}
