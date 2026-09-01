/**
 * Okazz Constrain Kinematics Main Sketch
 */

let wigglers = [];
let currentSpecies = 'ribbon';
let uiSegments = 32;
let uiJointDist = 14;
let uiWaveSpeed = 1.0;

let enableBounce = true;
let showFins = true;
let showDebug = false;

function setup() {
  let container = document.getElementById('canvas-container');
  let canvas = createCanvas(container.clientWidth, container.clientHeight);
  canvas.parent('canvas-container');

  // Spawn initial set of Okazz wigglers
  for (let i = 0; i < 3; i++) {
    wigglers.push(new OkazzWiggler(random(width * 0.3, width * 0.7), random(height * 0.3, height * 0.7), currentSpecies, uiSegments, uiJointDist));
  }

  initUI();
}

function draw() {
  background(9, 9, 11);

  let mouseTarget = null;
  if (mouseIsPressed && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    mouseTarget = createVector(mouseX, mouseY);
    fill(168, 85, 247, 100);
    noStroke();
    ellipse(mouseX, mouseY, 24, 24);
  }

  for (let w of wigglers) {
    w.update(uiWaveSpeed, enableBounce, mouseTarget);
    w.display(showFins, showDebug);
  }
}

function mouseClicked() {
  let panel = document.getElementById('control-panel');
  let isPanelCollapsed = panel.classList.contains('collapsed');

  if (!isPanelCollapsed && mouseX > width - 340 && mouseY < 520) return;
  if (mouseX > width - 150 && mouseY < 80) return;

  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    wigglers.push(new OkazzWiggler(mouseX, mouseY, currentSpecies, uiSegments, uiJointDist));
  }
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

  document.getElementById('select-species').addEventListener('change', (e) => currentSpecies = e.target.value);

  document.getElementById('seg-slider').addEventListener('input', (e) => {
    uiSegments = parseInt(e.target.value);
    document.getElementById('val-seg').innerText = uiSegments;
    wigglers.forEach(w => w.setSegments(uiSegments, uiJointDist));
  });

  document.getElementById('stiff-slider').addEventListener('input', (e) => {
    uiJointDist = parseInt(e.target.value);
    document.getElementById('val-dist').innerText = uiJointDist;
    wigglers.forEach(w => w.setSegments(uiSegments, uiJointDist));
  });

  document.getElementById('wave-slider').addEventListener('input', (e) => {
    uiWaveSpeed = parseFloat(e.target.value);
    document.getElementById('val-wave').innerText = uiWaveSpeed.toFixed(1);
  });

  document.getElementById('chk-bounce').addEventListener('change', (e) => enableBounce = e.target.checked);
  document.getElementById('chk-fins').addEventListener('change', (e) => showFins = e.target.checked);
  document.getElementById('chk-debug').addEventListener('change', (e) => showDebug = e.target.checked);

  document.getElementById('btn-spawn').addEventListener('click', () => {
    wigglers.push(new OkazzWiggler(random(width * 0.3, width * 0.7), random(height * 0.3, height * 0.7), currentSpecies, uiSegments, uiJointDist));
  });

  document.getElementById('btn-clear').addEventListener('click', () => wigglers = []);
}
