/**
 * Three.js 3D Volumetric Voxel Cube Main Controller
 * 100% CORS-safe image resizer & instant 3D voxel cube builder.
 */

let appCube = null;

window.addEventListener('DOMContentLoaded', () => {
  appCube = new VoxelCubeEngine('canvas-container');

  // Initial procedural artwork canvas
  let defaultCvs = createDefaultArtworkCanvas();
  appCube.targetCanvas = defaultCvs;
  appCube.build3DVolumetricCube();

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
    appCube.targetCanvas = cvs;
    appCube.build3DVolumetricCube();
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
          cvs.width = 400;
          cvs.height = 400;
          let ctx = cvs.getContext('2d');
          ctx.drawImage(img, 0, 0, 400, 400);
          appCube.targetCanvas = cvs;
          appCube.build3DVolumetricCube();
        };
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('select-depth-mode').addEventListener('change', (e) => {
    appCube.depthMode = e.target.value;
    appCube.build3DVolumetricCube();
  });

  document.getElementById('select-shape').addEventListener('change', (e) => {
    appCube.shapeType = e.target.value;
    appCube.build3DVolumetricCube();
  });

  document.getElementById('select-material').addEventListener('change', (e) => {
    appCube.materialType = e.target.value;
    appCube.build3DVolumetricCube();
  });

  document.getElementById('depth-layers-slider').addEventListener('input', (e) => {
    appCube.depthLayers = parseInt(e.target.value);
    document.getElementById('val-layers').innerText = appCube.depthLayers;
    appCube.build3DVolumetricCube();
  });

  document.getElementById('grid-size-slider').addEventListener('input', (e) => {
    appCube.gridSize = parseInt(e.target.value);
    document.getElementById('val-grid').innerText = appCube.gridSize;
    document.getElementById('val-grid-2').innerText = appCube.gridSize;
    appCube.build3DVolumetricCube();
  });

  document.getElementById('extrude-scale-slider').addEventListener('input', (e) => {
    appCube.extrudeScale = parseFloat(e.target.value);
    document.getElementById('val-scale').innerText = appCube.extrudeScale.toFixed(1);
    appCube.build3DVolumetricCube();
  });

  document.getElementById('wave-3d-slider').addEventListener('input', (e) => {
    appCube.wave3D = parseFloat(e.target.value);
    document.getElementById('val-wave').innerText = appCube.wave3D.toFixed(1);
  });

  document.getElementById('chk-auto-rotate').addEventListener('change', (e) => appCube.autoRotate = e.target.checked);
  document.getElementById('chk-waves').addEventListener('change', (e) => appCube.enableWaves = e.target.checked);

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
              a.download = 'ThreeJS_3D_Volumetric_Voxel_Cube.gif';
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
      a.download = 'ThreeJS_3D_Volumetric_Voxel_Cube.png';
      a.href = canvasEl.toDataURL('image/png');
      a.click();
    }
  });
}
