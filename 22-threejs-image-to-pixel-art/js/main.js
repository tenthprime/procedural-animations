/**
 * Three.js 3D Image-to-Pixel Art Main Controller
 */

let app3d = null;

window.addEventListener('DOMContentLoaded', () => {
  app3d = new Pixel3DEngine('canvas-container');

  // Load default artwork (CORS safe)
  let defaultCvs = createDefaultArtworkCanvas();
  app3d.targetCanvas = defaultCvs;
  app3d.build3DPixelMesh();

  // Load local artwork image asynchronously
  let img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = 'assets/artwork.png';
  img.onload = () => {
    let cvs = document.createElement('canvas');
    cvs.width = img.width;
    cvs.height = img.height;
    let ctx = cvs.getContext('2d');
    ctx.drawImage(img, 0, 0);
    app3d.targetCanvas = cvs;
    app3d.build3DPixelMesh();
  };

  initUI();
});

function createDefaultArtworkCanvas(size = 400) {
  let canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  let ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#0284c7'; ctx.beginPath(); ctx.arc(200, 180, 110, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(200, 140, 75, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ef4444'; ctx.fillRect(195, 110, 10, 25);

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
          cvs.width = img.width;
          cvs.height = img.height;
          let ctx = cvs.getContext('2d');
          ctx.drawImage(img, 0, 0);
          app3d.targetCanvas = cvs;
          app3d.build3DPixelMesh();
        };
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('select-shape').addEventListener('change', (e) => {
    app3d.shapeType = e.target.value;
    app3d.build3DPixelMesh();
  });

  document.getElementById('select-material').addEventListener('change', (e) => {
    app3d.materialType = e.target.value;
    app3d.build3DPixelMesh();
  });

  document.getElementById('grid-size-slider').addEventListener('input', (e) => {
    app3d.gridSize = parseInt(e.target.value);
    document.getElementById('val-grid').innerText = app3d.gridSize;
    document.getElementById('val-grid-2').innerText = app3d.gridSize;
    app3d.build3DPixelMesh();
  });

  document.getElementById('wave-amp-slider').addEventListener('input', (e) => {
    app3d.waveAmplitude = parseFloat(e.target.value);
    document.getElementById('val-wave').innerText = app3d.waveAmplitude;
  });

  document.getElementById('dot-float-slider').addEventListener('input', (e) => {
    app3d.dotFloatSpeed = parseFloat(e.target.value);
    document.getElementById('val-float').innerText = app3d.dotFloatSpeed.toFixed(1);
  });

  document.getElementById('depth-extrude-slider').addEventListener('input', (e) => {
    app3d.depthExtrude = parseFloat(e.target.value);
    document.getElementById('val-extrude').innerText = app3d.depthExtrude.toFixed(1);
    app3d.build3DPixelMesh();
  });

  document.getElementById('chk-auto-rotate').addEventListener('change', (e) => app3d.autoRotate = e.target.checked);
  document.getElementById('chk-waves').addEventListener('change', (e) => app3d.enableWaves = e.target.checked);

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
              a.download = 'ThreeJS_3D_Image_Pixel_Art.gif';
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
      a.download = 'ThreeJS_3D_Image_Pixel_Art.png';
      a.href = canvasEl.toDataURL('image/png');
      a.click();
    }
  });
}
