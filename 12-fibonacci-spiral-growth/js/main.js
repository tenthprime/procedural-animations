/**
 * Fibonacci Golden Spiral Box Expansion Main Controller
 */

let fSystem;
let growthSpeed = 1.0; // Seconds per step
let lastStepTime = 0;

let autoGrow = true;
let showNumbers = true;
let showArc = true;
let currentTheme = 'gold';

// Smooth camera zoom & pan lerp
let targetScale = 1.0;
let currentScale = 1.0;
let targetCamX = 0;
let targetCamY = 0;
let currentCamX = 0;
let currentCamY = 0;

function setup() {
  let container = document.getElementById('canvas-container');
  let w = container.clientWidth || window.innerWidth;
  let h = container.clientHeight || window.innerHeight;
  let canvas = createCanvas(w, h);
  canvas.parent('canvas-container');

  fSystem = new FibonacciBoxSystem();
  // Build initial 4 Fibonacci boxes: 1, 1, 2, 3
  for (let i = 0; i < 3; i++) fSystem.stepNext();

  initUI();
}

function draw() {
  background(3, 7, 18);

  // Background radial ambient glow
  push();
  noStroke();
  let ctx = drawingContext;
  let gradient = ctx.createRadialGradient(width * 0.5, height * 0.5, 50, width * 0.5, height * 0.5, width * 0.8);
  gradient.addColorStop(0, 'rgba(30, 27, 75, 0.4)');
  gradient.addColorStop(1, 'rgba(3, 7, 18, 0.98)');
  ctx.fillStyle = gradient;
  rect(0, 0, width, height);
  pop();

  // Auto-growth step timer
  if (autoGrow && millis() - lastStepTime > growthSpeed * 1000) {
    fSystem.stepNext();
    lastStepTime = millis();

    if (fSystem.boxes.length > 18) {
      fSystem.reset(); // Loop sequence to prevent overflow
      for (let i = 0; i < 3; i++) fSystem.stepNext();
    }
  }

  // Smooth Camera Zoom Out Calculation so expansion stays centered and visible
  targetCamX = fSystem.centerX;
  targetCamY = fSystem.centerY;

  let maxDim = max(fSystem.totalWidth, fSystem.totalHeight);
  if (maxDim > 0) {
    targetScale = min(width, height) / (maxDim * 1.35);
  }

  currentScale = lerp(currentScale, targetScale, 0.08);
  currentCamX = lerp(currentCamX, targetCamX, 0.08);
  currentCamY = lerp(currentCamY, targetCamY, 0.08);

  // Transform Camera Matrix
  push();
  translate(width * 0.5, height * 0.5);
  scale(currentScale);
  translate(-currentCamX, -currentCamY);

  // Display Fibonacci Boxes & Golden Arc
  fSystem.display(currentTheme, showNumbers, showArc);
  pop();

  // Update Stats Display
  if (frameCount % 10 === 0) {
    document.getElementById('stat-step').innerText = fSystem.boxes.length;
    let lastBox = fSystem.boxes[fSystem.boxes.length - 1];
    document.getElementById('stat-fn').innerText = lastBox ? lastBox.n : 1;
  }
}

function windowResized() {
  let container = document.getElementById('canvas-container');
  let w = container.clientWidth || window.innerWidth;
  let h = container.clientHeight || window.innerHeight;
  resizeCanvas(w, h);
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

  document.getElementById('select-theme').addEventListener('change', (e) => currentTheme = e.target.value);

  document.getElementById('speed-slider').addEventListener('input', (e) => {
    growthSpeed = parseFloat(e.target.value);
    document.getElementById('val-speed').innerText = growthSpeed.toFixed(1);
  });

  document.getElementById('chk-auto').addEventListener('change', (e) => autoGrow = e.target.checked);
  document.getElementById('chk-numbers').addEventListener('change', (e) => showNumbers = e.target.checked);
  document.getElementById('chk-arc').addEventListener('change', (e) => showArc = e.target.checked);

  document.getElementById('btn-step').addEventListener('click', () => {
    fSystem.stepNext();
    lastStepTime = millis();
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    fSystem.reset();
    for (let i = 0; i < 3; i++) fSystem.stepNext();
    lastStepTime = millis();
  });
}
