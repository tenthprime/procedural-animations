/**
 * Wavy Structure & Wavefront Studio Main Controller
 */

let GRID_SIZE = 45;
let waveMode = 'diagonal'; // 'diagonal', 'concentric', 'fluid'
let waveAmplitude = 1.5;
let wavelength = 0.05;
let waveAngleDeg = 45;
let enableGlow = true;
let enableStretch = true;

let targetCanvas = null;
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

  targetCanvas = createDefaultArtworkCanvas();

  let img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = 'assets/artwork.png';
  img.onload = () => {
    let cvs = document.createElement('canvas');
    cvs.width = img.width;
    cvs.height = img.height;
    let ctx = cvs.getContext('2d');
    ctx.drawImage(img, 0, 0);
    targetCanvas = cvs;
    initGrid();
  };

  initGrid();
  initUI();
}

function createDefaultArtworkCanvas(size = 450) {
  let canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  let ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#0284c7'; ctx.beginPath(); ctx.arc(225, 200, 130, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(225, 150, 85, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ef4444'; ctx.fillRect(220, 115, 10, 30);

  return canvas;
}

function sampleCanvasColors(canvasEl, gridSize) {
  let gridColors = [];
  let ctx = canvasEl.getContext('2d');

  let imgW = canvasEl.width;
  let imgH = canvasEl.height;
  let imgData = ctx.getImageData(0, 0, imgW, imgH);
  let pixels = imgData.data;

  let cellW = imgW / gridSize;
  let cellH = imgH / gridSize;

  for (let col = 0; col < gridSize; col++) {
    let colColors = [];
    for (let row = 0; row < gridSize; row++) {
      let sampleX = Math.floor((col + 0.5) * cellW);
      let sampleY = Math.floor((row + 0.5) * cellH);

      let idx = (sampleY * imgW + sampleX) * 4;
      let r = pixels[idx];
      let g = pixels[idx + 1];
      let b = pixels[idx + 2];

      if (r === undefined) { r = 56; g = 189; b = 248; }

      colColors.push(color(r, g, b));
    }
    gridColors.push(colColors);
  }

  return gridColors;
}

function initGrid() {
  if (!targetCanvas) return;

  const cellSize = width / GRID_SIZE;
  balls = [];
  gridRects = [];

  let sampledColors = sampleCanvasColors(targetCanvas, GRID_SIZE);

  for (let col = 0; col < GRID_SIZE; col++) {
    for (let row = 0; row < GRID_SIZE; row++) {
      const x = (col + 0.5) * cellSize;
      const y = (row + 0.5) * cellSize;
      const rectSize = cellSize * 0.92;

      let cellColor = sampledColors[col][row];

      balls.push(new WavyStructureBall(x, y, cellSize, cellColor, col, row));
      gridRects.push({ x, y, size: rectSize });
    }
  }

  document.getElementById('stat-cells').innerText = GRID_SIZE * GRID_SIZE;
}

function draw() {
  background("#030712");

  noStroke();

  // Render Grid Dark Cell Background Frames
  fill("#0f172a");
  for (const rectInfo of gridRects) {
    rect(rectInfo.x, rectInfo.y, rectInfo.size);
  }

  let time = millis() * 0.001;
  let waveAngleRad = radians(waveAngleDeg);

  // Interactive Mouse Ripple Splash Trigger
  if (mouseIsPressed && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    for (let ball of balls) {
      let d = dist(mouseX, mouseY, ball.x, ball.y);
      if (d < width / GRID_SIZE * 3.5) {
        ball.triggerSplash(map(d, 0, width / GRID_SIZE * 3.5, 1.0, 0.1));
      }
    }
  }

  // Update & Render Wavy Structure Wavefront Balls
  for (const ball of balls) {
    ball.run(waveMode, waveAmplitude, wavelength, waveAngleRad, time, enableGlow, enableStretch);
  }
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
  let toggleBtn = document.getElementById('toggle-panel-btn');
  let panel = document.getElementById('control-panel');

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('collapsed');
    let isCollapsed = panel.classList.contains('collapsed');
    toggleBtn.innerHTML = isCollapsed ? '⚙️ Controls' : '✕ Close';
  });

  let imgUploadInput = document.getElementById('img-upload-input');
  imgUploadInput.addEventListener('change', (e) => {
    let file = e.target.files[0];
    if (file) {
      let reader = new FileReader();
      reader.onload = (evt) => {
        let img = new Image();
        img.src = evt.target.result;
        img.onload = () => {
          let cvs = document.createElement('canvas');
          cvs.width = img.width;
          cvs.height = img.height;
          let ctx = cvs.getContext('2d');
          ctx.drawImage(img, 0, 0);
          targetCanvas = cvs;
          initGrid();
        };
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('select-wave-mode').addEventListener('change', (e) => {
    waveMode = e.target.value;
    let names = { diagonal: 'Diagonal Bands', concentric: 'Concentric Rings', fluid: 'Fluid Vortex' };
    document.getElementById('stat-wave').innerText = names[waveMode];
  });

  document.getElementById('amplitude-slider').addEventListener('input', (e) => {
    waveAmplitude = parseFloat(e.target.value);
    document.getElementById('val-amp').innerText = waveAmplitude.toFixed(1);
  });

  document.getElementById('wavelength-slider').addEventListener('input', (e) => {
    wavelength = parseFloat(e.target.value);
    document.getElementById('val-wave').innerText = wavelength.toFixed(3);
  });

  document.getElementById('angle-slider').addEventListener('input', (e) => {
    waveAngleDeg = parseInt(e.target.value);
    document.getElementById('val-angle').innerText = waveAngleDeg;
  });

  document.getElementById('grid-size-slider').addEventListener('input', (e) => {
    GRID_SIZE = parseInt(e.target.value);
    document.getElementById('val-grid').innerText = GRID_SIZE;
    document.getElementById('val-grid-2').innerText = GRID_SIZE;
    initGrid();
  });

  document.getElementById('chk-crest-glow').addEventListener('change', (e) => enableGlow = e.target.checked);
  document.getElementById('chk-stretch').addEventListener('change', (e) => enableStretch = e.target.checked);

  // Download HD PNG Snapshot
  document.getElementById('btn-download').addEventListener('click', () => {
    saveCanvas('Procedural_Wavy_Structure_Distortion', 'png');
  });
}
