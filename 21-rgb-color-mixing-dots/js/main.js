/**
 * Additive RGB Color Mixing Growing Dot Grid Studio Main Controller
 * Fixed Instant Restart Button & Dynamic Palette Shift Engine.
 */

let GRID_SIZE = 12;
let blendModeType = 'add';
let paletteKey = 'rgb';
let maxExpandRatio = 3.0;
let speedMult = 1.0;
let autoLoop = true;
let enableMouseRipple = true;

let dots = [];

function setup() {
  let container = document.getElementById('canvas-container');
  let w = container.clientWidth || windowWidth;
  let h = container.clientHeight || windowHeight;
  let minDim = min(w, h);

  let canvas = createCanvas(minDim, minDim);
  canvas.parent('canvas-container');

  initGrid();
  initUI();
}

function initGrid() {
  dots = [];
  let cellSize = width / GRID_SIZE;

  for (let col = 0; col < GRID_SIZE; col++) {
    for (let row = 0; row < GRID_SIZE; row++) {
      let x = (col + 0.5) * cellSize;
      let y = (row + 0.5) * cellSize;

      dots.push(new GrowingRGBDot(x, y, cellSize, maxExpandRatio, paletteKey, col, row));
    }
  }

  document.getElementById('stat-dots').innerText = dots.length;
}

function restartGrowthCycle(shiftColor = true) {
  for (let dot of dots) {
    dot.resetGrowth(shiftColor);
  }
}

function applyBlendMode(modeStr) {
  if (modeStr === 'add') {
    blendMode(ADD);
    background(0); // Pitch Black for Additive RGB Synthesis
  } else if (modeStr === 'multiply') {
    blendMode(MULTIPLY);
    background(255); // Pure White for Subtractive CMYK
  } else if (modeStr === 'difference') {
    blendMode(DIFFERENCE);
    background(0);
  } else if (modeStr === 'exclusion') {
    blendMode(EXCLUSION);
    background(0);
  } else {
    blendMode(BLEND);
    background(15, 23, 42);
  }
}

function draw() {
  // Apply WebGL Canvas Color Blending Mode
  applyBlendMode(blendModeType);

  // Interactive Mouse Growth Ripple Trigger
  if (enableMouseRipple && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    let cellSize = width / GRID_SIZE;
    for (let dot of dots) {
      let d = dist(mouseX, mouseY, dot.x, dot.y);
      if (d < cellSize * 2.2) {
        dot.triggerPulse(map(d, 0, cellSize * 2.2, 1.2, 0.1));
      }
    }
  }

  // Update & Render All Growing Dots
  let maxProgress = 0;
  for (let dot of dots) {
    dot.run(speedMult, maxExpandRatio, autoLoop);
    if (dot.growthProgress > maxProgress) maxProgress = dot.growthProgress;
  }

  // Update UI Growth Progress Stat
  let pct = Math.min(100, Math.floor(maxProgress * 100));
  document.getElementById('stat-progress').innerText = pct + '%';
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

  // 🔄 Restart Growth Cycle & Shift Colors Button with visual feedback
  let btnRestart = document.getElementById('btn-restart');
  btnRestart.addEventListener('click', () => {
    restartGrowthCycle(true);
    btnRestart.innerText = '✨ Growth Restarted!';
    setTimeout(() => {
      btnRestart.innerText = '🔄 Restart Growth Cycle';
    }, 1200);
  });

  document.getElementById('select-blend').addEventListener('change', (e) => {
    blendModeType = e.target.value;
    let names = { add: 'Additive RGB', multiply: 'Subtractive CMYK', difference: 'Difference', exclusion: 'Exclusion' };
    document.getElementById('stat-blend').innerText = names[blendModeType];
  });

  document.getElementById('select-palette').addEventListener('change', (e) => {
    paletteKey = e.target.value;
    initGrid();
  });

  document.getElementById('grid-size-slider').addEventListener('input', (e) => {
    GRID_SIZE = parseInt(e.target.value);
    document.getElementById('val-grid').innerText = GRID_SIZE;
    document.getElementById('val-grid-2').innerText = GRID_SIZE;
    initGrid();
  });

  document.getElementById('radius-slider').addEventListener('input', (e) => {
    maxExpandRatio = parseFloat(e.target.value);
    document.getElementById('val-radius').innerText = maxExpandRatio.toFixed(1);
  });

  document.getElementById('speed-slider').addEventListener('input', (e) => {
    speedMult = parseFloat(e.target.value);
    document.getElementById('val-speed').innerText = speedMult.toFixed(1);
  });

  document.getElementById('chk-auto-loop').addEventListener('change', (e) => autoLoop = e.target.checked);
  document.getElementById('chk-mouse').addEventListener('change', (e) => enableMouseRipple = e.target.checked);

  // 🎞️ Download Animated GIF Exporter Handler
  let btnGif = document.getElementById('btn-gif');
  btnGif.addEventListener('click', () => {
    restartGrowthCycle(false);
    btnGif.innerText = '⌛ Recording GIF (3s)...';
    btnGif.disabled = true;

    let frames = [];
    let recordCount = 0;

    let interval = setInterval(() => {
      let canvasEl = document.querySelector('#canvas-container canvas');
      if (canvasEl) {
        frames.push(canvasEl.toDataURL('image/png'));
      }
      recordCount++;
      if (recordCount >= 24) {
        clearInterval(interval);
        btnGif.innerText = '⚙️ Encoding GIF...';

        if (window.gifshot) {
          gifshot.createGIF({
            images: frames,
            gifWidth: 360,
            gifHeight: 360,
            interval: 0.1
          }, function (obj) {
            if (!obj.error) {
              let a = document.createElement('a');
              a.download = 'Additive_RGB_Color_Mixing_Dots.gif';
              a.href = obj.image;
              a.click();
            }
            btnGif.innerText = '🎞️ Download Animated GIF';
            btnGif.disabled = false;
          });
        } else {
          btnGif.innerText = '🎞️ Download Animated GIF';
          btnGif.disabled = false;
        }
      }
    }, 100);
  });

  // Download HD PNG Snapshot
  document.getElementById('btn-download').addEventListener('click', () => {
    saveCanvas('Additive_RGB_Color_Mixing_Dots', 'png');
  });
}
