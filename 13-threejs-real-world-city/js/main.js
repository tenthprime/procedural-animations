/**
 * Three.js Real-World 3D City & Traffic Main Controller
 */

let scene, camera, renderer, controls;
let sunLight, ambLight;
let trafficMgr;
let clock = new THREE.Clock();

let uiSpeed = 1.0;
let uiCarCount = 40;
let enableHeadlights = true;
let enableStreetLamps = true;
let autoRotate = false;

const PRESETS = {
  daylight: {
    sunPos: new THREE.Vector3(150, 200, 100),
    sunColor: new THREE.Color(0xfffbef),
    sunIntensity: 1.6,
    ambColor: new THREE.Color(0x38bdf8),
    ambIntensity: 0.6,
    skyBg: 0x38bdf8,
    headlights: false,
    streetlamps: false
  },
  sunset: {
    sunPos: new THREE.Vector3(200, 40, -150),
    sunColor: new THREE.Color(0xff7700),
    sunIntensity: 1.8,
    ambColor: new THREE.Color(0x4a0e4e),
    ambIntensity: 0.4,
    skyBg: 0x4a0e4e,
    headlights: true,
    streetlamps: true
  },
  night: {
    sunPos: new THREE.Vector3(80, 150, -150),
    sunColor: new THREE.Color(0x38bdf8),
    sunIntensity: 0.3,
    ambColor: new THREE.Color(0x020617),
    ambIntensity: 0.2,
    skyBg: 0x020617,
    headlights: true,
    streetlamps: true
  }
};

let currentPreset = PRESETS.daylight;

function init() {
  let container = document.getElementById('canvas-container');
  let width = container.clientWidth || window.innerWidth;
  let height = container.clientHeight || window.innerHeight;

  // Scene & Camera
  scene = new THREE.Scene();
  scene.background = new THREE.Color(currentPreset.skyBg);
  scene.fog = new THREE.FogExp2(currentPreset.skyBg, 0.002);

  camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1000);
  camera.position.set(120, 90, 160);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // 360 OrbitControls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.target.set(0, 20, 0);

  // Sun Light
  sunLight = new THREE.DirectionalLight(currentPreset.sunColor, currentPreset.sunIntensity);
  sunLight.position.copy(currentPreset.sunPos);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  scene.add(sunLight);

  ambLight = new THREE.AmbientLight(currentPreset.ambColor, currentPreset.ambIntensity);
  scene.add(ambLight);

  // Build Procedural City Buildings & Roads
  let buildingCount = createCityEnvironment(scene);
  document.getElementById('stat-buildings').innerText = buildingCount;

  // Initialize Dynamic Traffic Engine
  trafficMgr = new TrafficManager(scene);

  // Window Resize & UI
  window.addEventListener('resize', onWindowResize);
  initUI();

  animate();
}

function animate() {
  requestAnimationFrame(animate);

  let delta = clock.getDelta();
  let time = clock.getElapsedTime();

  // Update Vehicle Traffic Physics
  if (trafficMgr) {
    trafficMgr.update(uiSpeed);
  }

  // 360 Camera Auto Rotation
  if (autoRotate) {
    scene.rotation.y = time * 0.05;
  } else {
    scene.rotation.y = 0;
  }

  controls.update();
  renderer.render(scene, camera);

  if (Math.floor(time * 10) % 5 === 0) {
    document.getElementById('stat-fps').innerText = Math.round(1 / delta);
  }
}

function onWindowResize() {
  let container = document.getElementById('canvas-container');
  let width = container.clientWidth || window.innerWidth;
  let height = container.clientHeight || window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
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

  document.getElementById('speed-slider').addEventListener('input', (e) => {
    uiSpeed = parseFloat(e.target.value);
    document.getElementById('val-speed').innerText = uiSpeed.toFixed(1);
  });

  document.getElementById('cars-slider').addEventListener('input', (e) => {
    uiCarCount = parseInt(e.target.value);
    document.getElementById('val-cars').innerText = uiCarCount;
    trafficMgr.initTraffic(uiCarCount);
  });

  document.getElementById('chk-headlights').addEventListener('change', (e) => {
    enableHeadlights = e.target.checked;
    trafficMgr.toggleLights(enableHeadlights);
  });

  document.getElementById('chk-streetlamps').addEventListener('change', (e) => {
    enableStreetLamps = e.target.checked;
    scene.traverse((child) => {
      if (child.name === 'streetlamp') child.visible = enableStreetLamps;
    });
  });

  document.getElementById('chk-rotate').addEventListener('change', (e) => autoRotate = e.target.checked);

  // Lighting Preset Selector
  document.getElementById('select-preset').addEventListener('change', (e) => {
    currentPreset = PRESETS[e.target.value];

    scene.background.setHex(currentPreset.skyBg);
    scene.fog.color.setHex(currentPreset.skyBg);

    sunLight.position.copy(currentPreset.sunPos);
    sunLight.color.copy(currentPreset.sunColor);
    sunLight.intensity = currentPreset.sunIntensity;

    ambLight.color.copy(currentPreset.ambColor);
    ambLight.intensity = currentPreset.ambIntensity;

    document.getElementById('chk-headlights').checked = currentPreset.headlights;
    document.getElementById('chk-streetlamps').checked = currentPreset.streetlamps;
    trafficMgr.toggleLights(currentPreset.headlights);
    scene.traverse((child) => {
      if (child.name === 'streetlamp') child.visible = currentPreset.streetlamps;
    });
  });

  // Camera View Preset Selector
  document.getElementById('select-camera').addEventListener('change', (e) => {
    let mode = e.target.value;
    if (mode === 'drone') {
      camera.position.set(120, 90, 160);
      controls.target.set(0, 20, 0);
    } else if (mode === 'street') {
      camera.position.set(35, 6, 80);
      controls.target.set(0, 6, -20);
    } else if (mode === 'chase') {
      camera.position.set(-10, 12, 120);
      controls.target.set(-10, 2, 0);
    }
  });

  // Download HD City Snapshot
  document.getElementById('btn-download').addEventListener('click', () => {
    let link = document.createElement('a');
    link.download = 'ThreeJS_RealWorld_City.png';
    link.href = renderer.domElement.toDataURL('image/png');
    link.click();
  });
}

window.onload = init;
