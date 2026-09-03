/**
 * Bioluminescent Aurora Lights Flow Studio Main Controller
 */

let flowSpeed = 1.0;
let curtainCount = 4;
let rayTurbulence = 1.2;
let currentTheme = 'emerald';
let enableStars = true;
let enableMountains = true;
let enableMouseWind = true;

let stars = [];
let mouseWindX = 0;
let mouseWindY = 0;

function setup() {
  let container = document.getElementById('canvas-container');
  let w = container.clientWidth || windowWidth;
  let h = container.clientHeight || windowHeight;

  let canvas = createCanvas(w, h);
  canvas.parent('canvas-container');

  initStarfield(300);
  initUI();
}

function initStarfield(count) {
  stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: random(width),
      y: random(height * 0.7),
      size: random(1, 2.8),
      alpha: random(100, 255),
      twinkleSpeed: random(0.02, 0.08)
    });
  }
  document.getElementById('stat-stars').innerText = stars.length;
}

function draw() {
  // Midnight Arctic Night Sky Gradient
  background(2, 6, 23);

  // 1. Render Twinkling Celestial Starfield
  if (enableStars) {
    push();
    noStroke();
    for (let star of stars) {
      star.alpha += Math.sin(frameCount * star.twinkleSpeed) * 3;
      fill(248, 250, 252, constrain(star.alpha, 50, 255));
      ellipse(star.x, star.y, star.size);
    }
    pop();
  }

  // 2. Interactive Mouse Wind Physics
  if (enableMouseWind && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    mouseWindX = lerp(mouseWindX, mouseX, 0.1);
    mouseWindY = lerp(mouseWindY, (mouseY - height * 0.5), 0.1);
  } else {
    mouseWindX = lerp(mouseWindX, width * 0.5, 0.05);
    mouseWindY = lerp(mouseWindY, 0, 0.05);
  }

  // 3. Render Flowing Aurora Curtains & Light Rays
  renderAuroraCurtains(currentTheme, flowSpeed, curtainCount, rayTurbulence, mouseWindX, mouseWindY);

  // 4. Render Silhouetted Mountain Horizon
  if (enableMountains) {
    renderMountainSilhouette();
  }
}

function windowResized() {
  let container = document.getElementById('canvas-container');
  resizeCanvas(container.clientWidth || windowWidth, container.clientHeight || windowHeight);
  initStarfield(300);
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

  document.getElementById('select-theme').addEventListener('change', (e) => currentTheme = e.target.value);

  document.getElementById('speed-slider').addEventListener('input', (e) => {
    flowSpeed = parseFloat(e.target.value);
    document.getElementById('val-speed').innerText = flowSpeed.toFixed(1);
  });

  document.getElementById('curtain-slider').addEventListener('input', (e) => {
    curtainCount = parseInt(e.target.value);
    document.getElementById('val-curtains').innerText = curtainCount;
  });

  document.getElementById('wave-slider').addEventListener('input', (e) => {
    rayTurbulence = parseFloat(e.target.value);
    document.getElementById('val-wave').innerText = rayTurbulence.toFixed(1);
  });

  document.getElementById('chk-stars').addEventListener('change', (e) => enableStars = e.target.checked);
  document.getElementById('chk-mountains').addEventListener('change', (e) => enableMountains = e.target.checked);
  document.getElementById('chk-mouse-wind').addEventListener('change', (e) => enableMouseWind = e.target.checked);

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
            gifWidth: 400,
            gifHeight: 250,
            interval: 0.1
          }, function (obj) {
            if (!obj.error) {
              let a = document.createElement('a');
              a.download = 'Bioluminescent_Aurora_Lights_Flow.gif';
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
    saveCanvas('Bioluminescent_Aurora_Lights_Flow', 'png');
  });
}
