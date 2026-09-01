/**
 * ABYSSAL Living Deep Vertical Ocean Main Controller
 */

let cameraDepth = 0; // 0m to 8000m
let autoDescent = false;

let anglerfishList = [];
let siphonophoreList = [];
let biolumPlankton = [];

function setup() {
  let container = document.getElementById('canvas-container');
  let canvas = createCanvas(container.clientWidth, container.clientHeight);
  canvas.parent('canvas-container');

  // Spawn depth fauna across vertical world
  for (let i = 0; i < 4; i++) {
    siphonophoreList.push(new Siphonophore(random(width * 0.2, width * 0.8), random(1000, 3000)));
  }
  for (let i = 0; i < 5; i++) {
    anglerfishList.push(new Anglerfish(random(width * 0.2, width * 0.8), random(2500, 7000)));
  }
  for (let i = 0; i < 150; i++) {
    biolumPlankton.push({
      x: random(width),
      y: random(0, 8500),
      size: random(2, 5),
      hue: random(160, 280)
    });
  }

  initUI();
}

function draw() {
  if (autoDescent) {
    cameraDepth += 1.5;
    if (cameraDepth > 8000) cameraDepth = 0;
    document.getElementById('camera-slider').value = cameraDepth;
  }

  updateHUD();

  // Dynamic Depth Color Gradient (Sunlight Blue -> Hadal Pitch Black)
  drawOceanDepthBackground();

  // Render Depth Bioluminescent Plankton
  push();
  colorMode(HSB, 360, 100, 100, 1.0);
  noStroke();
  for (let p of biolumPlankton) {
    let screenY = p.y - cameraDepth;
    if (screenY > -50 && screenY < height + 50) {
      fill(p.hue, 80, 100, 0.7);
      ellipse(p.x, screenY, p.size, p.size);
    }
  }
  pop();

  // Render Siphonophore Chains
  for (let s of siphonophoreList) {
    s.update();
    s.display(cameraDepth);
  }

  // Render Anglerfish
  for (let a of anglerfishList) {
    a.update();
    a.display(cameraDepth);
  }
}

function mouseWheel(event) {
  cameraDepth = constrain(cameraDepth + event.delta * 0.8, 0, 8000);
  document.getElementById('camera-slider').value = cameraDepth;
  return false;
}

function drawOceanDepthBackground() {
  let depthNorm = map(cameraDepth, 0, 8000, 0, 1);
  let topR = lerp(14, 1, depthNorm);
  let topG = lerp(165, 4, depthNorm);
  let topB = lerp(233, 9, depthNorm);

  let botR = lerp(3, 0, depthNorm);
  let botG = lerp(15, 0, depthNorm);
  let botB = lerp(38, 2, depthNorm);

  background(botR, botG, botB);

  push();
  noStroke();
  let ctx = drawingContext;
  let gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, `rgb(${topR}, ${topG}, ${topB})`);
  gradient.addColorStop(1, `rgb(${botR}, ${botG}, ${botB})`);
  ctx.fillStyle = gradient;
  rect(0, 0, width, height);
  pop();
}

function updateHUD() {
  let m = Math.round(cameraDepth);
  document.getElementById('hud-depth').innerText = m;
  document.getElementById('val-cam').innerText = m;
  document.getElementById('stat-atm').innerText = Math.round(1 + m / 10);

  let zoneText = "Sunlight Zone (Epipelagic)";
  if (m > 200 && m <= 1000) zoneText = "Twilight Zone (Mesopelagic)";
  else if (m > 1000 && m <= 4000) zoneText = "Midnight Zone (Bathypelagic)";
  else if (m > 4000) zoneText = "Hadal Deep Trench (Abyssopelagic)";
  document.getElementById('hud-zone').innerText = zoneText;
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

  document.getElementById('camera-slider').addEventListener('input', (e) => cameraDepth = parseFloat(e.target.value));
  document.getElementById('chk-auto').addEventListener('change', (e) => autoDescent = e.target.checked);

  document.getElementById('btn-z1').addEventListener('click', () => cameraDepth = 0);
  document.getElementById('btn-z2').addEventListener('click', () => cameraDepth = 500);
  document.getElementById('btn-z3').addEventListener('click', () => cameraDepth = 2000);
  document.getElementById('btn-z4').addEventListener('click', () => cameraDepth = 6000);
}
