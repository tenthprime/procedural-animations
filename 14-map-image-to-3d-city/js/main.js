/**
 * Map Image to 3D Real-World City Main Controller
 */

let scene, camera, renderer, controls;
let sunLight, ambLight;
let currentWorldGroup = null;
let currentMapGrid = null;
let parser = new MapImageParser();
let clock = new THREE.Clock();

let uiHeightMult = 1.0;
let enableWater = true;
let enableTrees = true;
let autoRotate = false;

function init() {
  let container = document.getElementById('canvas-container');
  let width = container.clientWidth || window.innerWidth;
  let height = container.clientHeight || window.innerHeight;

  // Scene & Camera
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020617);
  scene.fog = new THREE.FogExp2(0x020617, 0.0015);

  camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1000);
  camera.position.set(160, 140, 200);

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

  // Sun Light & Atmosphere
  sunLight = new THREE.DirectionalLight(0xfffbef, 1.6);
  sunLight.position.set(150, 220, 100);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  scene.add(sunLight);

  ambLight = new THREE.AmbientLight(0x38bdf8, 0.6);
  scene.add(ambLight);

  // Load Initial Sample Map Layout (Downtown River Peninsula)
  loadSampleMap('riverpeninsula');

  // Window Resize & UI
  window.addEventListener('resize', onWindowResize);
  initUI();

  animate();
}

function loadSampleMap(layoutType) {
  let sampleCanvas = parser.createSampleMapCanvas(layoutType);
  parser.parseImage(sampleCanvas, (grid, bCount, wCount) => {
    currentMapGrid = grid;
    rebuild3DWorld();

    document.getElementById('stat-buildings').innerText = bCount;
    document.getElementById('stat-water').innerText = wCount;
  });
}

function rebuild3DWorld() {
  if (currentWorldGroup) {
    scene.remove(currentWorldGroup);
  }
  if (currentMapGrid) {
    currentWorldGroup = build3DWorldFromMapGrid(scene, currentMapGrid, uiHeightMult, enableWater, enableTrees);
  }
}

function animate() {
  requestAnimationFrame(animate);

  let delta = clock.getDelta();
  let time = clock.getElapsedTime();

  // Animated Water Wave Ripple Effect
  if (currentWorldGroup && enableWater) {
    let waterMesh = currentWorldGroup.getObjectByName('waterMesh');
    if (waterMesh) {
      waterMesh.position.y = 0.5 + Math.sin(time * 2.0) * 0.4;
    }
  }

  // 360 Camera Auto Rotation
  if (autoRotate) {
    scene.rotation.y = time * 0.05;
  } else {
    scene.rotation.y = 0;
  }

  controls.update();
  renderer.render(scene, camera);
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

  // 📁 Custom Map Image File Upload Handler
  let uploadInput = document.getElementById('map-upload-input');
  uploadInput.addEventListener('change', (e) => {
    let file = e.target.files[0];
    if (file) {
      let reader = new FileReader();
      reader.onload = (event) => {
        let img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          parser.parseImage(img, (grid, bCount, wCount) => {
            currentMapGrid = grid;
            rebuild3DWorld();

            document.getElementById('stat-buildings').innerText = bCount;
            document.getElementById('stat-water').innerText = wCount;
          });
        };
      };
      reader.readAsDataURL(file);
    }
  });

  // Sample Selector
  document.getElementById('select-sample').addEventListener('change', (e) => {
    loadSampleMap(e.target.value);
  });

  document.getElementById('height-slider').addEventListener('input', (e) => {
    uiHeightMult = parseFloat(e.target.value);
    document.getElementById('val-height').innerText = uiHeightMult.toFixed(1);
    rebuild3DWorld();
  });

  document.getElementById('chk-water').addEventListener('change', (e) => {
    enableWater = e.target.checked;
    rebuild3DWorld();
  });

  document.getElementById('chk-trees').addEventListener('change', (e) => {
    enableTrees = e.target.checked;
    rebuild3DWorld();
  });

  document.getElementById('chk-rotate').addEventListener('change', (e) => autoRotate = e.target.checked);

  // Camera View Preset Selector
  document.getElementById('select-camera').addEventListener('change', (e) => {
    let mode = e.target.value;
    if (mode === 'drone') {
      camera.position.set(160, 140, 200);
      controls.target.set(0, 20, 0);
    } else if (mode === 'street') {
      camera.position.set(30, 8, 60);
      controls.target.set(0, 8, -20);
    }
  });

  // Download HD City Snapshot
  document.getElementById('btn-download').addEventListener('click', () => {
    let link = document.createElement('a');
    link.download = 'MapImage_3D_City.png';
    link.href = renderer.domElement.toDataURL('image/png');
    link.click();
  });
}

window.onload = init;
