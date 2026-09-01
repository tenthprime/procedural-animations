/**
 * OpenProcessing Elastic Grid Bounce Main Controller
 */

let GRID_SIZE = 10;
let ANIMATION_LENGTH = 80;
let MIRROR_SCALE = 0.9;
let currentPaletteKey = 'original';
let squishMultiplier = 1.5;
let enableMirror = true;
let enableMouseWave = true;

let balls = [];
let gridRects = [];

function setup() {
  let container = document.getElementById('canvas-container');
  let w = container.clientWidth || windowWidth;
  let h = container.clientHeight || windowHeight;
  let minDim = min(w, h);

  let canvas = createCanvas(minDim, minDim);
  canvas.parent('canvas-container');
  rectMode(CENTER);

  initGrid();
  initUI();
}

function initGrid() {
  const cellSize = width / GRID_SIZE;
  balls = [];
  gridRects = [];

  for (let col = 0; col < GRID_SIZE; col++) {
    for (let row = 0; row < GRID_SIZE; row++) {
      const x = (col + 0.5) * cellSize;
      const y = (row + 0.5) * cellSize;
      const rectSize = cellSize * 0.9;

      balls.push(new OpenProcessingBall(
        x, y,
        rectSize * 0.5,
        rectSize * 0.45,
        currentPaletteKey,
        ANIMATION_LENGTH,
        squishMultiplier
      ));

      gridRects.push({ x, y, size: rectSize });
    }
  }

  document.getElementById('stat-cells').innerText = GRID_SIZE * GRID_SIZE;
}

function draw() {
  background("#f0f0f0");

  push();
  if (enableMirror) {
    translate(width / 2, height / 2);
    scale(-MIRROR_SCALE);
    translate(-width / 2, -height / 2);
  }

  fill("#232323");
  noStroke();

  // Render Grid Cells
  for (const rectInfo of gridRects) {
    rect(rectInfo.x, rectInfo.y, rectInfo.size);
  }

  // Interactive Mouse Wave Proximity Trigger
  if (enableMouseWave && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    for (let ball of balls) {
      let d = dist(mouseX, mouseY, ball.x, ball.y);
      if (d < width / GRID_SIZE * 1.5 && Math.random() > 0.6) {
        ball.triggerRipple();
      }
    }
  }

  // Update & Render Elastic Squish Balls
  for (const ball of balls) {
    ball.run();
  }

  pop();
}

function windowResized() {
  let container = document.getElementById('canvas-container');
  let w = container.clientWidth || windowWidth;
  let h = container.clientHeight || windowHeight;
  let minDim = min(w, h);
  resizeCanvas(minDim, minDim);
  initGrid();
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

  document.getElementById('grid-size-slider').addEventListener('input', (e) => {
    GRID_SIZE = parseInt(e.target.value);
    document.getElementById('val-grid').innerText = GRID_SIZE;
    document.getElementById('val-grid-2').innerText = GRID_SIZE;
    initGrid();
  });

  document.getElementById('select-palette').addEventListener('change', (e) => {
    currentPaletteKey = e.target.value;
    initGrid();
  });

  document.getElementById('squish-slider').addEventListener('input', (e) => {
    squishMultiplier = parseFloat(e.target.value);
    document.getElementById('val-squish').innerText = squishMultiplier.toFixed(1);
    initGrid();
  });

  document.getElementById('speed-slider').addEventListener('input', (e) => {
    ANIMATION_LENGTH = parseInt(e.target.value);
    document.getElementById('val-speed').innerText = ANIMATION_LENGTH;
    initGrid();
  });

  document.getElementById('chk-mirror').addEventListener('change', (e) => {
    enableMirror = e.target.checked;
    document.getElementById('stat-scale').innerText = enableMirror ? '-0.9x' : '1.0x';
  });

  document.getElementById('chk-mouse').addEventListener('change', (e) => enableMouseWave = e.target.checked);

  // Download HD Snapshot
  document.getElementById('btn-download').addEventListener('click', () => {
    saveCanvas('OpenProcessing_Elastic_Grid_Bounce', 'png');
  });
}
