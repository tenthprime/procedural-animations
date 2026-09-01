/**
 * Main p5.js Sketch & Aquarium Controller
 */

let creatures = [];
let marineSnow = [];
let lightRays = [];

// Selected spawn type: 'angel', 'wiggler', 'jelly'
let currentSpawnType = 'angel';

// UI State
let uiSpeed = 1.0;
let uiGlow = 1.0;
let uiSegments = 24;
let showDebug = false;
let showSnow = true;
let showLightRays = true;

let mouseAttractPos = null;

function setup() {
  let container = document.getElementById('canvas-container');
  let canvas = createCanvas(container.clientWidth, container.clientHeight);
  canvas.parent('canvas-container');

  // Initialize Marine Snow Particles
  for (let i = 0; i < 140; i++) {
    marineSnow.push({
      x: random(width),
      y: random(height),
      size: random(1.5, 4.5),
      speedY: random(0.1, 0.4),
      noiseSeed: random(1000)
    });
  }

  // Initialize Volumetric Light Rays
  for (let i = 0; i < 6; i++) {
    lightRays.push({
      x: random(width * 0.1, width * 0.9),
      widthTop: random(20, 60),
      widthBottom: random(120, 260),
      alpha: random(15, 35),
      speed: random(0.005, 0.015),
      phase: random(PI)
    });
  }

  // Populate Initial Aquarium Creatures
  spawnInitialFauna();

  // Attach UI Event Listeners
  initUI();
}

function spawnInitialFauna() {
  creatures = [];
  // 3 Sea Angels
  for (let i = 0; i < 3; i++) {
    creatures.push(new SeaAngel(random(width * 0.2, width * 0.8), random(height * 0.2, height * 0.8)));
  }
  // 2 Okazz Segment Wigglers
  for (let i = 0; i < 2; i++) {
    creatures.push(new SegmentWiggler(random(width * 0.2, width * 0.8), random(height * 0.2, height * 0.8), uiSegments));
  }
  // 3 Comb Jellies
  for (let i = 0; i < 3; i++) {
    creatures.push(new CombJelly(random(width * 0.2, width * 0.8), random(height * 0.3, height * 0.8)));
  }
}

function draw() {
  // Deep Abyssal Ocean Background Gradient
  drawAbyssalBackground();

  // Draw Light Rays
  if (showLightRays) {
    drawVolumetricRays();
  }

  // Mouse Drag Attraction
  if (mouseIsPressed && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    mouseAttractPos = createVector(mouseX, mouseY);
    // Draw mouse pulse ring
    push();
    noFill();
    stroke(56, 189, 248, 150);
    strokeWeight(2);
    ellipse(mouseX, mouseY, 30 + sin(frameCount * 0.2) * 10);
    pop();
  } else {
    mouseAttractPos = null;
  }

  // Update & Display Creatures
  for (let i = 0; i < creatures.length; i++) {
    let creature = creatures[i];
    if (creature instanceof SegmentWiggler) {
      creature.update(uiSpeed, mouseAttractPos, uiSegments);
    } else {
      creature.update(uiSpeed, mouseAttractPos);
    }
    creature.display(uiGlow, showDebug);
  }

  // Draw Marine Snow Particles
  if (showSnow) {
    drawMarineSnow();
  }

  // Update Stats Display
  if (frameCount % 10 === 0) {
    document.getElementById('stat-count').innerText = creatures.length;
    document.getElementById('stat-fps').innerText = Math.round(frameRate());
  }
}

function drawAbyssalBackground() {
  background(3, 8, 20); // Abyssal night blue

  // Radial depth gradient glow at top center
  push();
  noStroke();
  let ctx = drawingContext;
  let gradient = ctx.createRadialGradient(width * 0.5, 0, 50, width * 0.5, 0, height * 0.9);
  gradient.addColorStop(0, 'rgba(8, 47, 73, 0.4)');
  gradient.addColorStop(0.6, 'rgba(3, 15, 38, 0.8)');
  gradient.addColorStop(1, 'rgba(2, 6, 18, 1)');
  ctx.fillStyle = gradient;
  rect(0, 0, width, height);
  pop();
}

function drawVolumetricRays() {
  push();
  noStroke();
  for (let ray of lightRays) {
    ray.phase += ray.speed;
    let currentAlpha = ray.alpha * (0.6 + sin(ray.phase) * 0.4);

    fill(56, 189, 248, currentAlpha);
    beginShape();
    vertex(ray.x - ray.widthTop * 0.5, 0);
    vertex(ray.x + ray.widthTop * 0.5, 0);
    vertex(ray.x + ray.widthBottom * 0.5, height);
    vertex(ray.x - ray.widthBottom * 0.5, height);
    endShape(CLOSE);
  }
  pop();
}

function drawMarineSnow() {
  push();
  noStroke();
  for (let p of marineSnow) {
    p.y += p.speedY * uiSpeed;
    p.x += sin(p.noiseSeed + frameCount * 0.01) * 0.3;

    if (p.y > height) {
      p.y = -10;
      p.x = random(width);
    }

    fill(224, 242, 254, map(p.size, 1.5, 4.5, 40, 140));
    ellipse(p.x, p.y, p.size);
  }
  pop();
}

// Canvas Click Event: Spawn selected creature
function mouseClicked() {
  // Prevent spawning if clicking on UI controls
  if (mouseX > width - 340 && mouseY < 480) return;
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    spawnCreatureAt(mouseX, mouseY);
  }
}

function spawnCreatureAt(x, y) {
  if (currentSpawnType === 'angel') {
    creatures.push(new SeaAngel(x, y));
  } else if (currentSpawnType === 'wiggler') {
    creatures.push(new SegmentWiggler(x, y, uiSegments));
  } else if (currentSpawnType === 'jelly') {
    creatures.push(new CombJelly(x, y));
  }
}

function windowResized() {
  let container = document.getElementById('canvas-container');
  resizeCanvas(container.clientWidth, container.clientHeight);
}

// UI Event Listeners Binding
function initUI() {
  // Spawn type buttons
  let btnAngel = document.getElementById('btn-spawn-angel');
  let btnWiggler = document.getElementById('btn-spawn-wiggler');
  let btnJelly = document.getElementById('btn-spawn-jelly');

  function setActiveBtn(activeBtn) {
    [btnAngel, btnWiggler, btnJelly].forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  btnAngel.addEventListener('click', () => { currentSpawnType = 'angel'; setActiveBtn(btnAngel); });
  btnWiggler.addEventListener('click', () => { currentSpawnType = 'wiggler'; setActiveBtn(btnWiggler); });
  btnJelly.addEventListener('click', () => { currentSpawnType = 'jelly'; setActiveBtn(btnJelly); });

  // Sliders
  document.getElementById('speed-slider').addEventListener('input', (e) => {
    uiSpeed = parseFloat(e.target.value);
    document.getElementById('val-speed').innerText = uiSpeed.toFixed(1);
  });

  document.getElementById('glow-slider').addEventListener('input', (e) => {
    uiGlow = parseFloat(e.target.value) / 100;
    document.getElementById('val-glow').innerText = e.target.value;
  });

  document.getElementById('segments-slider').addEventListener('input', (e) => {
    uiSegments = parseInt(e.target.value);
    document.getElementById('val-segments').innerText = uiSegments;
  });

  // Toggles
  document.getElementById('chk-debug').addEventListener('change', (e) => showDebug = e.target.checked);
  document.getElementById('chk-snow').addEventListener('change', (e) => showSnow = e.target.checked);
  document.getElementById('chk-lightrays').addEventListener('change', (e) => showLightRays = e.target.checked);

  // Clear & Reset
  document.getElementById('btn-clear').addEventListener('click', () => creatures = []);
  document.getElementById('btn-reset').addEventListener('click', spawnInitialFauna);
}
