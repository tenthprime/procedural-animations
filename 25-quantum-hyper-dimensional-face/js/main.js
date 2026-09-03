/**
 * Quantum Hyper-Dimensional Face Main Controller
 * 4 Spiral Movement Patterns & Movement Speed Controls.
 */

let appHyper = null;

window.addEventListener('DOMContentLoaded', () => {
  appHyper = new HyperEngine('canvas-container');

  // Initial procedural face artwork canvas
  let defaultCvs = createDefaultQuantumCanvas();
  appHyper.targetCanvas = defaultCvs;
  appHyper.buildQuantumFaceMesh();

  // Populate Real Photo Preview Thumbnail
  let previewEl = document.getElementById('real-photo-preview');
  if (previewEl) previewEl.src = defaultCvs.toDataURL('image/png');

  // Load local artwork image asynchronously
  let img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = 'assets/artwork.png';
  img.onload = () => {
    let cvs = document.createElement('canvas');
    cvs.width = 400;
    cvs.height = 400;
    let ctx = cvs.getContext('2d');
    ctx.drawImage(img, 0, 0, 400, 400);

    appHyper.targetCanvas = cvs;
    appHyper.buildQuantumFaceMesh();

    if (previewEl) previewEl.src = cvs.toDataURL('image/png');
  };

  initUI();
});

function createDefaultQuantumCanvas(size = 400) {
  let canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  let ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#c084fc'; ctx.beginPath(); ctx.arc(200, 180, 110, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(200, 140, 75, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f59e0b'; ctx.fillRect(195, 110, 10, 25);

  return canvas;
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

  // Canvas click triggers Supernova explosion shockwave
  let canvasContainer = document.getElementById('canvas-container');
  canvasContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    appHyper.triggerSupernovaDetonation();
  });

  document.getElementById('btn-trigger-detonate').addEventListener('click', () => {
    appHyper.triggerSupernovaDetonation();
  });

  // Toggle 3D Photo Overlay
  let btnPhotoOverlay = document.getElementById('btn-toggle-photo-overlay');
  btnPhotoOverlay.addEventListener('click', () => {
    appHyper.showPhotoOverlay = !appHyper.showPhotoOverlay;
    btnPhotoOverlay.innerText = appHyper.showPhotoOverlay ? '👁️ Hide 3D Photo Overlay' : '👁️ Toggle 3D Photo Overlay';
  });

  // Custom Image File Upload Handler (FileReader DataURL - 100% CORS Safe!)
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
          cvs.width = 400;
          cvs.height = 400;
          let ctx = cvs.getContext('2d');
          ctx.drawImage(img, 0, 0, 400, 400);

          appHyper.targetCanvas = cvs;
          appHyper.buildQuantumFaceMesh();

          let previewEl = document.getElementById('real-photo-preview');
          if (previewEl) previewEl.src = evt.target.result;
        };
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('select-spiral-pattern').addEventListener('change', (e) => {
    appHyper.spiralPattern = e.target.value;
  });

  document.getElementById('select-mode').addEventListener('change', (e) => {
    appHyper.physicsMode = e.target.value;
  });

  document.getElementById('select-shape').addEventListener('change', (e) => {
    appHyper.shapeType = e.target.value;
    appHyper.buildQuantumFaceMesh();
  });

  document.getElementById('speed-slider').addEventListener('input', (e) => {
    appHyper.movementSpeed = parseFloat(e.target.value);
    document.getElementById('val-speed').innerText = appHyper.movementSpeed.toFixed(2);
  });

  document.getElementById('grid-size-slider').addEventListener('input', (e) => {
    appHyper.gridSize = parseInt(e.target.value);
    document.getElementById('val-grid').innerText = appHyper.gridSize;
    document.getElementById('val-grid-2').innerText = appHyper.gridSize;
    appHyper.buildQuantumFaceMesh();
  });

  document.getElementById('vortex-force-slider').addEventListener('input', (e) => {
    appHyper.vortexForce = parseFloat(e.target.value);
    document.getElementById('val-vortex').innerText = appHyper.vortexForce.toFixed(1);
  });

  document.getElementById('chk-auto-rotate').addEventListener('change', (e) => appHyper.autoRotate = e.target.checked);
  document.getElementById('chk-singularity').addEventListener('change', (e) => appHyper.enableSingularity = e.target.checked);

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
            gifHeight: 400,
            interval: 0.1
          }, function (obj) {
            if (!obj.error) {
              let a = document.createElement('a');
              a.download = 'Quantum_Hyper_Dimensional_Face.gif';
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
    let canvasEl = document.querySelector('#canvas-container canvas');
    if (canvasEl) {
      let a = document.createElement('a');
      a.download = 'Quantum_Hyper_Dimensional_Face.png';
      a.href = canvasEl.toDataURL('image/png');
      a.click();
    }
  });
}
