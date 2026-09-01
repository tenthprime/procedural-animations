/**
 * Endless POV 3D Forest Flight Simulator Main Controller
 */

let trees = [];
let cameraZ = 0;
let flightSpeed = 6.0;
let fogDistance = 1200;
let treeCount = 40;

let enableSteer = true;
let enableSway = true;

let targetCamRotX = 0;
let targetCamRotY = 0;
let currentCamRotX = 0;
let currentCamRotY = 0;

// Color Themes
const THEMES = {
  abyssal: {
    bg: [2, 6, 23],
    trunk: [15, 23, 42],
    foliage: [56, 189, 248]
  },
  neon: {
    bg: [15, 5, 25],
    trunk: [30, 10, 50],
    foliage: [236, 72, 153]
  },
  emerald: {
    bg: [2, 20, 15],
    trunk: [6, 40, 30],
    foliage: [74, 222, 128]
  },
  violet: {
    bg: [10, 5, 25],
    trunk: [25, 15, 50],
    foliage: [168, 85, 247]
  }
};

let currentTheme = THEMES.abyssal;

function setup() {
  let container = document.getElementById('canvas-container');
  let canvas = createCanvas(container.clientWidth, container.clientHeight, WEBGL);
  canvas.parent('canvas-container');

  generateForestChunk();
  initUI();
}

function generateForestChunk() {
  trees = [];
  let corridorWidth = 600;
  let forestLength = 3000;

  for (let i = 0; i < treeCount; i++) {
    // Keep central pathway clear for POV flight
    let side = random() > 0.5 ? 1 : -1;
    let x = side * random(140, corridorWidth);
    let y = 120; // Ground level
    let z = random(-forestLength, 200);

    trees.push(new ProceduralTree(x, y, z));
  }
}

function draw() {
  // Continuously fly forward along Z-axis into the infinite horizon
  cameraZ -= flightSpeed;

  let bg = currentTheme.bg;
  background(bg[0], bg[1], bg[2]);

  // Infinite Z-Recycling: Move trees that pass behind camera to the front distance
  for (let t of trees) {
    if (t.pos.z - cameraZ > 300) {
      t.pos.z -= 3000;
      let side = random() > 0.5 ? 1 : -1;
      t.pos.x = side * random(140, 600);
    }
  }

  // POV First-Person Camera Steering via Mouse Position
  if (enableSteer) {
    targetCamRotY = map(mouseX, 0, width, 0.4, -0.4);
    targetCamRotX = map(mouseY, 0, height, -0.3, 0.3);
  } else {
    targetCamRotX = 0;
    targetCamRotY = 0;
  }

  currentCamRotX = lerp(currentCamRotX, targetCamRotX, 0.05);
  currentCamRotY = lerp(currentCamRotY, targetCamRotY, 0.05);

  // Apply Camera Transform
  rotateX(currentCamRotX);
  rotateY(currentCamRotY);

  // Render Infinite Ground Grid & Forest
  drawGroundGrid();

  let time = millis() * 0.001;
  for (let t of trees) {
    t.display(cameraZ, fogDistance, time, currentTheme, enableSway);
  }

  // Update HUD Stats
  if (frameCount % 10 === 0) {
    document.getElementById('stat-dist').innerText = Math.round(abs(cameraZ) * 0.1);
    document.getElementById('stat-fps').innerText = Math.round(frameRate());
  }
}

function drawGroundGrid() {
  push();
  stroke(currentTheme.foliage[0], currentTheme.foliage[1], currentTheme.foliage[2], 30);
  strokeWeight(1);
  noFill();

  translate(0, 120, cameraZ);
  rotateX(HALF_PI);

  let gridSize = 3000;
  let spacing = 100;
  for (let x = -gridSize * 0.5; x <= gridSize * 0.5; x += spacing) {
    line(x, -gridSize, x, 0);
  }
  for (let z = -gridSize; z <= 0; z += spacing) {
    line(-gridSize * 0.5, z, gridSize * 0.5, z);
  }
  pop();
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

  document.getElementById('speed-slider').addEventListener('input', (e) => {
    flightSpeed = parseFloat(e.target.value);
    document.getElementById('val-speed').innerText = flightSpeed.toFixed(1);
  });

  document.getElementById('density-slider').addEventListener('input', (e) => {
    treeCount = parseInt(e.target.value);
    document.getElementById('val-density').innerText = treeCount;
    generateForestChunk();
  });

  document.getElementById('fog-slider').addEventListener('input', (e) => {
    fogDistance = parseInt(e.target.value);
    document.getElementById('val-fog').innerText = fogDistance;
  });

  document.getElementById('select-theme').addEventListener('change', (e) => {
    currentTheme = THEMES[e.target.value];
  });

  document.getElementById('chk-steer').addEventListener('change', (e) => enableSteer = e.target.checked);
  document.getElementById('chk-sway').addEventListener('change', (e) => enableSway = e.target.checked);
}
