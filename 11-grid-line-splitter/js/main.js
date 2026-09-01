/**
 * Grid Line Splitter & Weaver Physics Main Controller
 */

let gridDots = [];
let weaverSegments = [];
let cutterLine;
let sparks = [];

let uiGridSize = 16;
let uiWeaverSpeed = 1.0;
let uiCutterSpeed = 1.2;
let showSparks = true;
let totalCuts = 0;

const THEMES = {
  cyanpink: {
    dot: [56, 189, 248],
    weaver: [56, 189, 248],
    cutter: [236, 72, 153]
  },
  goldviolet: {
    dot: [250, 204, 21],
    weaver: [250, 204, 21],
    cutter: [168, 85, 247]
  },
  limeruby: {
    dot: [74, 222, 128],
    weaver: [74, 222, 128],
    cutter: [244, 63, 94]
  }
};

let currentTheme = THEMES.cyanpink;

function setup() {
  let container = document.getElementById('canvas-container');
  let canvas = createCanvas(container.clientWidth, container.clientHeight);
  canvas.parent('canvas-container');

  initGridAndLines();
  initUI();
}

function initGridAndLines() {
  gridDots = [];
  weaverSegments = [];
  sparks = [];
  totalCuts = 0;

  let stepX = (width - 120) / (uiGridSize - 1);
  let stepY = (height - 120) / (uiGridSize - 1);

  for (let gx = 0; gx < uiGridSize; gx++) {
    for (let gy = 0; gy < uiGridSize; gy++) {
      gridDots.push(new GridDot(60 + gx * stepX, 60 + gy * stepY, gx, gy));
    }
  }

  // Initial Primary Weaver Line
  weaverSegments.push(new WeaverSegment(createVector(width * 0.5, height * 0.5), p5.Vector.random2D()));

  // Secondary Cutter Line
  cutterLine = new CutterLine();
}

function draw() {
  background(3, 7, 18);

  // Background radial glow
  push();
  noStroke();
  let ctx = drawingContext;
  let gradient = ctx.createRadialGradient(width * 0.5, height * 0.5, 50, width * 0.5, height * 0.5, width * 0.8);
  gradient.addColorStop(0, 'rgba(15, 23, 42, 0.5)');
  gradient.addColorStop(1, 'rgba(3, 7, 18, 0.98)');
  ctx.fillStyle = gradient;
  rect(0, 0, width, height);
  pop();

  // 1. Update & Render Dot Grid Matrix
  for (let dot of gridDots) {
    dot.update();
    dot.display(currentTheme);
  }

  // 2. Update & Render Cutter Line
  cutterLine.update(uiCutterSpeed);
  cutterLine.display(currentTheme);

  // 3. Update & Render Weaver Line Segments
  for (let i = weaverSegments.length - 1; i >= 0; i--) {
    let seg = weaverSegments[i];
    seg.update(gridDots, uiWeaverSpeed);
    seg.display(currentTheme);

    // Check Intersection Slicing Collision with Cutter Line
    if (seg.points.length > 2 && weaverSegments.length < 16) {
      let headPrev = seg.points[seg.points.length - 2];
      let headCurr = seg.head;

      let hitPt = checkIntersection(headPrev, headCurr, cutterLine.p1, cutterLine.p2);
      if (hitPt) {
        // Line-Line Intersection Slicing Collision!
        performLineCut(seg, hitPt);
      }
    }
  }

  // 4. Update & Render Collision Spark Bursts
  if (showSparks) {
    drawSparks();
  }

  // Stats Display
  if (frameCount % 10 === 0) {
    document.getElementById('stat-lines').innerText = weaverSegments.length;
    document.getElementById('stat-cuts').innerText = totalCuts;
  }
}

function performLineCut(seg, hitPt) {
  totalCuts++;

  // Emit Collision Spark Bursts
  if (showSparks) {
    for (let s = 0; s < 18; s++) {
      sparks.push({
        pos: hitPt.copy(),
        vel: p5.Vector.random2D().mult(random(2, 6)),
        life: 1.0
      });
    }
  }

  // Slice segment into two half segments!
  let newDir1 = seg.dir.copy().rotate(HALF_PI);
  let newDir2 = seg.dir.copy().rotate(-HALF_PI);

  seg.dir = newDir1;
  seg.head = hitPt.copy();

  weaverSegments.push(new WeaverSegment(hitPt.copy(), newDir2));
}

function drawSparks() {
  push();
  noStroke();
  let col = currentTheme.cutter;
  for (let i = sparks.length - 1; i >= 0; i--) {
    let sp = sparks[i];
    sp.pos.add(sp.vel);
    sp.life -= 0.04;

    if (sp.life <= 0) {
      sparks.splice(i, 1);
      continue;
    }

    fill(col[0], col[1], col[2], 255 * sp.life);
    ellipse(sp.pos.x, sp.pos.y, sp.life * 6);
  }
  pop();
}

function windowResized() {
  let container = document.getElementById('canvas-container');
  resizeCanvas(container.clientWidth, container.clientHeight);
  initGridAndLines();
}

function initUI() {
  // Slide-in drawer toggle
  let toggleBtn = document.getElementById('toggle-panel-btn');
  let panel = document.getElementById('control-panel');

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('collapsed');
    let isCollapsed = panel.classList.contains('collapsed');
    toggleBtn.innerHTML = isCollapsed ? '⚙️ Controls' : '✕ Close';
  });

  document.getElementById('grid-slider').addEventListener('input', (e) => {
    uiGridSize = parseInt(e.target.value);
    document.getElementById('val-grid').innerText = uiGridSize;
    initGridAndLines();
  });

  document.getElementById('weaver-speed-slider').addEventListener('input', (e) => {
    uiWeaverSpeed = parseFloat(e.target.value);
    document.getElementById('val-weaver').innerText = uiWeaverSpeed.toFixed(1);
  });

  document.getElementById('cutter-speed-slider').addEventListener('input', (e) => {
    uiCutterSpeed = parseFloat(e.target.value);
    document.getElementById('val-cutter').innerText = uiCutterSpeed.toFixed(1);
  });

  document.getElementById('select-theme').addEventListener('change', (e) => {
    currentTheme = THEMES[e.target.value];
  });

  document.getElementById('chk-sparks').addEventListener('change', (e) => showSparks = e.target.checked);

  document.getElementById('btn-reset').addEventListener('click', initGridAndLines);
  document.getElementById('btn-cut').addEventListener('click', () => {
    if (weaverSegments.length > 0) {
      let targetSeg = weaverSegments[0];
      performLineCut(targetSeg, targetSeg.head.copy());
    }
  });
}
