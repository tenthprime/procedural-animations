/**
 * Procedural PBR Canvas Texture Generators for Real-World City
 * Generates Asphalt Road Markings, Skyscraper Window Facades & Sidewalks.
 */

// Generate Dark Asphalt Texture with White/Yellow Lane Dividers & Zebra Crosswalks
function createRoadTexture(size = 512) {
  let canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  let ctx = canvas.getContext('2d');

  // 1. Dark Asphalt Base
  ctx.fillStyle = '#1e2025';
  ctx.fillRect(0, 0, size, size);

  // Fine Grain Asphalt Noise
  for (let i = 0; i < 4000; i++) {
    let x = Math.random() * size;
    let y = Math.random() * size;
    let gray = Math.floor(Math.random() * 40 + 20);
    ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // 2. Center Yellow Double Line
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 6;
  ctx.setLineDash([20, 15]);
  ctx.beginPath();
  ctx.moveTo(size * 0.5 - 5, 0);
  ctx.lineTo(size * 0.5 - 5, size);
  ctx.moveTo(size * 0.5 + 5, 0);
  ctx.lineTo(size * 0.5 + 5, size);
  ctx.stroke();

  // 3. Outer White Boundary Lines
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.lineTo(30, size);
  ctx.moveTo(size - 30, 0);
  ctx.lineTo(size - 30, size);
  ctx.stroke();

  // 4. Zebra Crosswalk Markings
  ctx.fillStyle = '#ffffff';
  for (let y = 40; y < size; y += 120) {
    for (let x = 60; x < size - 60; x += 35) {
      ctx.fillRect(x, y, 22, 40);
    }
  }

  let tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

// Generate Glass & Steel Skyscraper Window Facade Texture
function createBuildingTexture(type = 'glass', size = 512) {
  let canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  let ctx = canvas.getContext('2d');

  if (type === 'glass') {
    // Glass Skyscraper
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, size, size);

    let cols = 12;
    let rows = 24;
    let w = size / cols;
    let h = size / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let isLit = Math.random() > 0.3;
        ctx.fillStyle = isLit ? '#38bdf8' : '#1e293b';
        ctx.fillRect(c * w + 4, r * h + 4, w - 8, h - 8);

        if (isLit) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillRect(c * w + 4, r * h + 4, (w - 8) * 0.4, (h - 8) * 0.4);
        }
      }
    }
  } else if (type === 'brick') {
    // Warm Brick Office / Residential
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(0, 0, size, size);

    let cols = 8;
    let rows = 16;
    let w = size / cols;
    let h = size / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let isLit = Math.random() > 0.4;
        ctx.fillStyle = isLit ? '#fef08a' : '#451a03';
        ctx.fillRect(c * w + 6, r * h + 6, w - 12, h - 12);
      }
    }
  } else {
    // Concrete Tower
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, size, size);

    let cols = 10;
    let rows = 20;
    let w = size / cols;
    let h = size / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let isLit = Math.random() > 0.35;
        ctx.fillStyle = isLit ? '#e0f2fe' : '#1e293b';
        ctx.fillRect(c * w + 5, r * h + 5, w - 10, h - 10);
      }
    }
  }

  let tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

// Generate Concrete Sidewalk Pavement Texture
function createSidewalkTexture(size = 256) {
  let canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  let ctx = canvas.getContext('2d');

  ctx.fillStyle = '#475569';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  let step = size / 4;
  for (let x = 0; x <= size; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, x); ctx.lineTo(size, x); ctx.stroke();
  }

  let tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}
