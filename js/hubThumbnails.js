/**
 * Procedural Thumbnail Banner Generator for threejs.org-Style Gallery Grid
 * Generates 20 high-resolution 16:9 preview images for all projects.
 */

function generateProjectThumbnails() {
  let thumbData = {};

  let configs = [
    { id: 'wavy', title: '🌊 Wavy Structure Studio', bg: '#030712', c1: '#38bdf8', c2: '#0284c7', type: 'lines' },
    { id: 'pixel', title: '🖼️ Pixelated Image Elastic Grid', bg: '#0f172a', c1: '#fbbf24', c2: '#38bdf8', type: 'grid' },
    { id: 'bounce', title: '🏀 OpenProcessing Grid Bounce', bg: '#f0f0f0', c1: '#ED4141', c2: '#FECA16', type: 'grid' },
    { id: 'cursive', title: '✍️ Cursive Name Morphing', bg: '#030712', c1: '#f472b6', c2: '#38bdf8', type: 'lines' },
    { id: 'car', title: '🏎️ Rogue Red Car Smasher', bg: '#0f172a', c1: '#ef4444', c2: '#facc15', type: 'city' },
    { id: 'map3d', title: '🗺️ Map to 3D City', bg: '#020617', c1: '#0284c7', c2: '#38bdf8', type: 'city' },
    { id: 'city3d', title: '🏙️ Real-World City', bg: '#0f172a', c1: '#38bdf8', c2: '#facc15', type: 'city' },
    { id: 'beach', title: '🏖️ Three.js Ocean Beach', bg: '#0284c7', c1: '#00b4d8', c2: '#fef08a', type: 'beach' },
    { id: 'owl', title: '🦉 Celestial 3D Owl', bg: '#090d16', c1: '#38bdf8', c2: '#facc15', type: 'owl' },
    { id: 'glacier', title: '🧊 GLACIER Arctic', bg: '#030712', c1: '#38bdf8', c2: '#a855f7', type: 'glacier' },
    { id: 'forest', title: '🌲 Endless POV Forest', bg: '#022c22', c1: '#10b981', c2: '#34d399', type: 'forest' },
    { id: 'fibonacci', title: '🌀 Fibonacci Spiral', bg: '#0f172a', c1: '#eab308', c2: '#38bdf8', type: 'spiral' },
    { id: 'grid', title: '✂️ Grid Line Splitter', bg: '#030712', c1: '#38bdf8', c2: '#ec4899', type: 'grid' },
    { id: 'draw', title: '✏️ Draw-to-Generate', bg: '#030712', c1: '#f472b6', c2: '#8b5cf6', type: 'draw' },
    { id: 'glsl', title: '⚡ Infinite GLSL Lines', bg: '#0c0414', c1: '#ff00ff', c2: '#00ffcc', type: 'lines' },
    { id: 'angel', title: '👼 Sea Angels Flocking', bg: '#020617', c1: '#38bdf8', c2: '#ff5533', type: 'angel' },
    { id: 'okazz', title: '🌀 Okazz Wigglers', bg: '#030712', c1: '#10b981', c2: '#f59e0b', type: 'wiggler' },
    { id: 'abyssal', title: '🌊 ABYSSAL Deep', bg: '#020617', c1: '#0284c7', c2: '#ff9900', type: 'deep' },
    { id: 'tsubuyaki', title: '✨ #つぶやきGLSL', bg: '#0f172a', c1: '#ec4899', c2: '#38bdf8', type: 'glsl' },
    { id: 'aquarium', title: '🐠 Full Aquarium', bg: '#020617', c1: '#0284c7', c2: '#10b981', type: 'aqua' }
  ];

  for (let cfg of configs) {
    let canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 225;
    let ctx = canvas.getContext('2d');

    let grad = ctx.createLinearGradient(0, 0, 400, 225);
    grad.addColorStop(0, cfg.bg);
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 225);

    ctx.save();
    if (cfg.type === 'grid') {
      ctx.fillStyle = '#232323';
      for (let x = 40; x < 360; x += 60) {
        for (let y = 30; y < 200; y += 50) {
          ctx.fillRect(x, y, 40, 40);
          ctx.fillStyle = cfg.c1;
          ctx.beginPath(); ctx.arc(x + 20, y + 10, 15, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#232323';
        }
      }
    } else if (cfg.type === 'city') {
      ctx.fillStyle = cfg.c1;
      for (let x = 30; x < 370; x += 40) {
        let h = 40 + Math.sin(x * 0.1) * 60 + 50;
        ctx.fillRect(x, 225 - h, 30, h);
        ctx.fillStyle = cfg.c2;
        ctx.fillRect(x + 5, 225 - h + 10, 8, 8);
        ctx.fillStyle = cfg.c1;
      }
    } else if (cfg.type === 'beach') {
      ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(320, 50, 30, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = cfg.c1; ctx.beginPath(); ctx.ellipse(200, 180, 220, 60, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#eab308'; ctx.beginPath(); ctx.ellipse(100, 210, 180, 40, 0, 0, Math.PI * 2); ctx.fill();
    } else if (cfg.type === 'spiral') {
      ctx.strokeStyle = cfg.c1; ctx.lineWidth = 4;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 6; a += 0.1) {
        let r = a * 10;
        let x = 200 + Math.cos(a) * r;
        let y = 112 + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else if (cfg.type === 'lines' || cfg.type === 'draw') {
      ctx.strokeStyle = cfg.c1; ctx.lineWidth = 4;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        for (let x = 0; x < 400; x += 10) {
          let y = 112 + Math.sin(x * 0.02 + i * 0.5) * (30 + i * 10);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    } else {
      for (let i = 0; i < 5; i++) {
        let cx = 80 + i * 60;
        let cy = 112 + Math.sin(i * 1.2) * 40;
        let r = 25 + Math.cos(i) * 10;
        ctx.fillStyle = i % 2 === 0 ? cfg.c1 : cfg.c2;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();

    let vign = ctx.createRadialGradient(200, 112, 100, 200, 112, 220);
    vign.addColorStop(0, 'transparent');
    vign.addColorStop(1, 'rgba(2, 6, 23, 0.75)');
    ctx.fillStyle = vign;
    ctx.fillRect(0, 0, 400, 225);

    thumbData[cfg.id] = canvas.toDataURL('image/png');
  }

  return thumbData;
}
