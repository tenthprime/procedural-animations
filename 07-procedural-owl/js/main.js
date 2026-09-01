/**
 * Celestial 3D Owl & Tree Perch Main Controller
 */

let scene, camera, renderer, controls;
let owlData, treeGroup, moonMesh, fireflies;
let clock = new THREE.Clock();

let uiEyeGlow = 1.0;
let headSpeed = 1.0;
let enableHeadTrack = true;
let autoRotate = true;
let enableFireflies = true;

let targetHeadRotY = 0;
let targetHeadRotX = 0;

const THEME_COLORS = {
  gold: { eye: 0xfacc15, emissive: 0xeab308, bg: 0x030712 },
  cyan: { eye: 0x38bdf8, emissive: 0x0284c7, bg: 0x020a19 },
  emerald: { eye: 0x4ade80, emissive: 0x16a34a, bg: 0x02120c },
  ruby: { eye: 0xf43f5e, emissive: 0xe11d48, bg: 0x18040c }
};

let currentTheme = THEME_COLORS.gold;

function init() {
  let container = document.getElementById('canvas-container');

  // Scene & Camera
  scene = new THREE.Scene();
  scene.background = new THREE.Color(currentTheme.bg);

  camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 25, 100);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // 360° OrbitControls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 30;  // Close zoom-in to owl head
  controls.maxDistance = 250; // Zoom out view

  // Lighting
  let dirLight = new THREE.DirectionalLight(0xfff5ea, 1.2);
  dirLight.position.set(40, 80, 60);
  scene.add(dirLight);

  let ambLight = new THREE.AmbientLight(0x1e293b, 0.7);
  scene.add(ambLight);

  // 1. Build 3D Tree Perch Branch
  treeGroup = create3DTreePerch();
  scene.add(treeGroup);

  // 2. Build 3D Celestial Owl
  owlData = create3DOwlGroup();
  scene.add(owlData.owlGroup);

  // 3. Moon Background
  let moonGeo = new THREE.SphereGeometry(40, 32, 32);
  let moonMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.15 });
  moonMesh = new THREE.Mesh(moonGeo, moonMat);
  moonMesh.position.set(0, 50, -140);
  scene.add(moonMesh);

  // 4. Fireflies
  fireflies = createFireflyParticles(80);
  scene.add(fireflies);

  // Event Listeners
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', onMouseMove);
  initUI();

  animate();
}

function createFireflyParticles(count = 80) {
  let geo = new THREE.BufferGeometry();
  let positions = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 160;
    positions[i + 1] = Math.random() * 100 - 20;
    positions[i + 2] = (Math.random() - 0.5) * 160;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  let mat = new THREE.PointsMaterial({ color: 0xfacc15, size: 2.2, transparent: true, opacity: 0.8 });
  return new THREE.Points(geo, mat);
}

function onMouseMove(event) {
  if (!enableHeadTrack) return;
  // Convert mouse X, Y to normalized head rotation angles
  targetHeadRotY = THREE.MathUtils.mapLinear(event.clientX, 0, window.innerWidth, 0.8, -0.8);
  targetHeadRotX = THREE.MathUtils.mapLinear(event.clientY, 0, window.innerHeight, -0.3, 0.3);
}

function animate() {
  requestAnimationFrame(animate);

  let delta = clock.getDelta();
  let time = clock.getElapsedTime();

  // 360° Auto-Rotate Camera around Owl & Tree
  if (autoRotate) {
    scene.rotation.y = time * 0.05;
  } else {
    scene.rotation.y = 0;
  }

  // Dynamic 3D Owl Head Turn & Nod Movement
  if (owlData && owlData.headGroup) {
    let head = owlData.headGroup;
    let autoNod = Math.sin(time * 1.5 * headSpeed) * 0.08;
    let autoTurn = Math.sin(time * 0.7 * headSpeed) * 0.2;

    let finalRotY = enableHeadTrack ? targetHeadRotY : autoTurn;
    let finalRotX = (enableHeadTrack ? targetHeadRotX : 0) + autoNod;

    head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, finalRotY, 0.08);
    head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, finalRotX, 0.08);

    // Pupil Tracking Offset inside Eyes
    owlData.leftPupil.position.x = -5.5 + head.rotation.y * 1.5;
    owlData.leftPupil.position.y = -head.rotation.x * 1.5;
    owlData.rightPupil.position.x = 5.5 + head.rotation.y * 1.5;
    owlData.rightPupil.position.y = -head.rotation.x * 1.5;
  }

  // Update Eye Emissive Intensity
  if (owlData && owlData.goldEyeMat) {
    owlData.goldEyeMat.emissiveIntensity = uiEyeGlow * 0.8;
  }

  // Fireflies Floating Motion
  if (fireflies) {
    let pPos = fireflies.geometry.attributes.position;
    for (let i = 0; i < pPos.count * 3; i += 3) {
      pPos.setY(i + 1, pPos.getY(i + 1) + Math.sin(time * 2 + i) * 0.1);
      pPos.setX(i, pPos.getX(i) + Math.cos(time * 1.5 + i) * 0.08);
    }
    fireflies.geometry.attributes.position.needsUpdate = true;
    fireflies.visible = enableFireflies;
  }

  controls.update();
  renderer.render(scene, camera);

  // HUD Stats
  if (Math.floor(time * 10) % 5 === 0) {
    let zoomPct = Math.round(THREE.MathUtils.mapLinear(camera.position.distanceTo(controls.target), 30, 250, 200, 30));
    document.getElementById('stat-zoom').innerText = zoomPct;
    document.getElementById('stat-fps').innerText = Math.round(1 / delta);
  }
}

function onWindowResize() {
  let container = document.getElementById('canvas-container');
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
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

  document.getElementById('select-theme').addEventListener('change', (e) => {
    currentTheme = THEME_COLORS[e.target.value];
    scene.background.setHex(currentTheme.bg);
    owlData.goldEyeMat.color.setHex(currentTheme.eye);
    owlData.goldEyeMat.emissive.setHex(currentTheme.emissive);
  });

  document.getElementById('eye-glow-slider').addEventListener('input', (e) => {
    uiEyeGlow = parseFloat(e.target.value) / 100;
    document.getElementById('val-eye-glow').innerText = e.target.value;
  });

  document.getElementById('head-turn-slider').addEventListener('input', (e) => {
    headSpeed = parseFloat(e.target.value);
    document.getElementById('val-head').innerText = headSpeed.toFixed(1);
  });

  document.getElementById('chk-headtrack').addEventListener('change', (e) => enableHeadTrack = e.target.checked);
  document.getElementById('chk-rotate').addEventListener('change', (e) => autoRotate = e.target.checked);
  document.getElementById('chk-fireflies').addEventListener('change', (e) => enableFireflies = e.target.checked);

  // Download HD Wallpaper Snapshot
  document.getElementById('btn-download').addEventListener('click', () => {
    renderer.render(scene, camera);
    let dataURL = renderer.domElement.toDataURL('image/png');
    let link = document.createElement('a');
    link.download = 'Celestial_3D_Owl_Wallpaper.png';
    link.href = dataURL;
    link.click();
  });
}

window.onload = init;
