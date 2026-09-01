/**
 * Sea Angels Flocking & Feeding Simulator Main Sketch
 */

let boids = [];
let planktonList = [];
let currentClickMode = 'spawn';

let uiFlockSize = 12;
let uiFlapSpeed = 1.0;
let uiGlow = 1.0;
let enableFlock = true;
let enableTentacles = true;

function setup() {
  let container = document.getElementById('canvas-container');
  let canvas = createCanvas(container.clientWidth, container.clientHeight);
  canvas.parent('canvas-container');

  for (let i = 0; i < uiFlockSize; i++) {
    boids.push(new SeaAngelBoid(random(width * 0.2, width * 0.8), random(height * 0.2, height * 0.8)));
  }

  initUI();
}

function draw() {
  background(2, 6, 23);

  // Deep underwater light gradient
  push();
  noStroke();
  let ctx = drawingContext;
  let gradient = ctx.createRadialGradient(width * 0.5, height * 0.2, 50, width * 0.5, height * 0.5, width * 0.8);
  gradient.addColorStop(0, 'rgba(14, 165, 233, 0.25)');
  gradient.addColorStop(1, 'rgba(2, 6, 23, 0.95)');
  ctx.fillStyle = gradient;
  rect(0, 0, width, height);
  pop();

  // Draw Plankton Prey
  for (let i = planktonList.length - 1; i >= 0; i--) {
    let p = planktonList[i];
    if (p.eaten) {
      planktonList.splice(i, 1);
      continue;
    }
    p.y += sin(frameCount * 0.05 + p.x) * 0.3;
    fill(74, 222, 128, 220); // Glowing green plankton
    noStroke();
    ellipse(p.pos.x, p.pos.y, 8, 8);
    fill(74, 222, 128, 60);
    ellipse(p.pos.x, p.pos.y, 18, 18);
  }

  // Update & Draw Sea Angels Boids
  for (let b of boids) {
    b.flock(boids, enableFlock);
    b.update(uiFlapSpeed, enableFlock, planktonList);
    b.display(uiGlow, enableTentacles);
  }

  // Stats
  if (frameCount % 10 === 0) {
    document.getElementById('stat-count').innerText = boids.length;
    document.getElementById('stat-prey').innerText = planktonList.length;
  }
}

function mouseClicked() {
  // Prevent canvas spawning if clicking on panel or toggle button
  let panel = document.getElementById('control-panel');
  let isPanelCollapsed = panel.classList.contains('collapsed');

  if (!isPanelCollapsed && mouseX > width - 340 && mouseY < 520) return;
  if (mouseX > width - 150 && mouseY < 80) return; // Toggle button area

  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    if (currentClickMode === 'spawn') {
      boids.push(new SeaAngelBoid(mouseX, mouseY));
    } else if (currentClickMode === 'feed') {
      planktonList.push({ pos: createVector(mouseX, mouseY), eaten: false });
    }
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

  let btnSpawn = document.getElementById('btn-mode-spawn');
  let btnFeed = document.getElementById('btn-mode-feed');

  btnSpawn.addEventListener('click', () => { currentClickMode = 'spawn'; btnSpawn.classList.add('active'); btnFeed.classList.remove('active'); });
  btnFeed.addEventListener('click', () => { currentClickMode = 'feed'; btnFeed.classList.add('active'); btnSpawn.classList.remove('active'); });

  document.getElementById('flock-slider').addEventListener('input', (e) => {
    uiFlockSize = parseInt(e.target.value);
    document.getElementById('val-flock').innerText = uiFlockSize;
    adjustFlockSize(uiFlockSize);
  });

  document.getElementById('flap-slider').addEventListener('input', (e) => {
    uiFlapSpeed = parseFloat(e.target.value);
    document.getElementById('val-flap').innerText = uiFlapSpeed.toFixed(1);
  });

  document.getElementById('glow-slider').addEventListener('input', (e) => {
    uiGlow = parseFloat(e.target.value) / 100;
    document.getElementById('val-glow').innerText = e.target.value;
  });

  document.getElementById('chk-boids').addEventListener('change', (e) => enableFlock = e.target.checked);
  document.getElementById('chk-tentacles').addEventListener('change', (e) => enableTentacles = e.target.checked);
  document.getElementById('btn-clear').addEventListener('click', () => { boids = []; planktonList = []; });
}

function adjustFlockSize(targetSize) {
  while (boids.length < targetSize) boids.push(new SeaAngelBoid(random(width), random(height)));
  while (boids.length > targetSize) boids.pop();
}
