/**
 * Pixelated Image Elastic Grid Bounce Main Controller
 * Directional Cursor Wave Push Physics & Color Tint Customizer Engine.
 */

let GRID_SIZE = 40;
let ANIMATION_LENGTH = 80;
let MIRROR_SCALE = 0.9;
let zoomScale = 1.0;
let squishMultiplier = 1.5;
let enableMirror = false;
let enableMouseWave = true;
let currentTintTheme = 'original';
let customHexColor = '#f59e0b';

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

function createDefaultArtworkCanvas(size = 400) {
  let canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  let ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f59e0b'; ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#0284c7'; ctx.beginPath(); ctx.arc(200, 180, 110, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(200, 140, 75, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ef4444'; ctx.fillRect(195, 110, 10, 25);

  return canvas;
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

      let cellColor = applyColorTint(sampledColors[col][row], currentTintTheme, customHexColor);

      let ball = new OpenProcessingImageBall(
        x, y,
        rectSize * 0.5,
        rectSize * 0.45,
        cellColor,
        ANIMATION_LENGTH,
        squishMultiplier,
        col, row
      );
      ball.originalColor = sampledColors[col][row];
      balls.push(ball);

      gridRects.push({ x, y, size: rectSize, color: cellColor });
    }
  }

  document.getElementById('stat-cells').innerText = GRID_SIZE * GRID_SIZE;
}

function applyColorTint(origColor, theme, hexColor) {
  let r = red(origColor);
  let g = green(origColor);
  let b = blue(origColor);
  let brightnessVal = (r + g + b) / 3;

  if (theme === 'cyber') {
    return color(lerp(r, 236, 0.5), lerp(g, 72, 0.5), lerp(b, 153, 0.5));
  } else if (theme === 'gold') {
    return color(lerp(r, 245, 0.6), lerp(g, 158, 0.6), lerp(b, 11, 0.4));
  } else if (theme === 'emerald') {
    return color(lerp(r, 16, 0.5), lerp(g, 185, 0.5), lerp(b, 129, 0.5));
  } else if (theme === 'mono') {
    return color(brightnessVal, brightnessVal, brightnessVal);
  } else if (theme === 'custom') {
    let c = color(hexColor);
    return color(
      lerp(r, red(c), 0.7),
      lerp(g, green(c), 0.7),
      lerp(b, blue(c), 0.7)
    );
  } else {
    return origColor;
  }
}

function updateAllBallTints() {
  for (let ball of balls) {
    ball.currentColor = applyColorTint(ball.originalColor, currentTintTheme, customHexColor);
  }
}

function draw() {
  background("#0f172a");

  push();

  // Center Canvas Matrix Scale & Smooth Non-Clipping Zoom
  translate(width / 2, height / 2);
  if (enableMirror) {
    scale(-MIRROR_SCALE * zoomScale, -MIRROR_SCALE * zoomScale);
  } else {
    scale(zoomScale, zoomScale);
  }
  translate(-width / 2, -height / 2);

  noStroke();

  // Render Grid Cell Background Frames
  for (const rectInfo of gridRects) {
    fill("#1e293b");
    rect(rectInfo.x, rectInfo.y, rectInfo.size);
  }

  // Interactive Directional Cursor Wave Push Physics
  let mouseVelX = mouseX - pmouseX;
  let mouseVelY = mouseY - pmouseY;
  let mouseSpeed = Math.hypot(mouseVelX, mouseVelY);

  if (enableMouseWave && mouseSpeed > 1.0 && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    let mx = (mouseX - width / 2) / zoomScale + width / 2;
    let my = (mouseY - height / 2) / zoomScale + height / 2;

    let dirX = mouseVelX / mouseSpeed;
    let dirY = mouseVelY / mouseSpeed;

    for (let ball of balls) {
      let d = dist(mx, my, ball.x, ball.y);
      let influenceRadius = (width / GRID_SIZE) * 2.8;

      if (d < influenceRadius) {
        let forceMult = map(d, 0, influenceRadius, 1.0, 0.1);
        ball.triggerDirectionalPush(dirX * forceMult, dirY * forceMult, mouseSpeed * 0.4);
      }
    }
  }

  // Update & Render All 6,400 Pixelated Image Squish Balls (Continuous Motion)
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
          document.getElementById('stat-img').innerText = file.name;
        };
      };
      reader.readAsDataURL(file);
    }
  });

  let selectTint = document.getElementById('select-tint');
  let customGroup = document.getElementById('custom-tint-group');
  let tintPicker = document.getElementById('tint-picker');

  selectTint.addEventListener('change', (e) => {
    currentTintTheme = e.target.value;
    customGroup.style.display = currentTintTheme === 'custom' ? 'flex' : 'none';
    updateAllBallTints();
  });

  tintPicker.addEventListener('input', (e) => {
    customHexColor = e.target.value;
    updateAllBallTints();
  });

  document.getElementById('grid-size-slider').addEventListener('input', (e) => {
    GRID_SIZE = parseInt(e.target.value);
    document.getElementById('val-grid').innerText = GRID_SIZE;
    document.getElementById('val-grid-2').innerText = GRID_SIZE;
    initGrid();
  });

  document.getElementById('zoom-slider').addEventListener('input', (e) => {
    zoomScale = parseFloat(e.target.value);
    document.getElementById('val-zoom').innerText = zoomScale.toFixed(1);
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

  document.getElementById('chk-mirror').addEventListener('change', (e) => enableMirror = e.target.checked);
  document.getElementById('chk-mouse').addEventListener('change', (e) => enableMouseWave = e.target.checked);

  // 🎞️ Download Animated GIF Exporter Handler
  let btnGif = document.getElementById('btn-gif');
  btnGif.addEventListener('click', () => {
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
            gifWidth: 320,
            gifHeight: 320,
            interval: 0.1
          }, function (obj) {
            if (!obj.error) {
              let a = document.createElement('a');
              a.download = 'Pixelated_Image_Elastic_Bounce.gif';
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
    saveCanvas('Pixelated_Image_Elastic_Grid_Bounce', 'png');
  });
}
