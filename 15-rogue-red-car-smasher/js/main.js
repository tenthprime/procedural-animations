/**
 * Rogue Red Car Endless Smasher Main Controller
 */

let scene, camera, renderer, controls;
let car, streamer, entityMgr;
let keys = { w: false, a: false, s: false, d: false, up: false, down: false, left: false, right: false, gas: false };
let cameraMode = 'chase';
let clock = new THREE.Clock();

function init() {
  let container = document.getElementById('canvas-container');
  let width = container.clientWidth || window.innerWidth;
  let height = container.clientHeight || window.innerHeight;

  // Scene & Camera
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020617);
  scene.fog = new THREE.FogExp2(0x020617, 0.0018);

  camera = new THREE.PerspectiveCamera(50, width / height, 0.5, 1000);

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

  // Sun Lighting
  let sun = new THREE.DirectionalLight(0xfffbef, 1.8);
  sun.position.set(120, 180, 100);
  sun.castShadow = true;
  scene.add(sun);

  let amb = new THREE.AmbientLight(0x38bdf8, 0.5);
  scene.add(amb);

  // Initialize Core Systems
  car = new RogueRedCar(scene);
  streamer = new WorldStreamer(scene);
  entityMgr = new EntityCollisionManager(scene);

  // Keyboard Listeners
  window.addEventListener('keydown', (e) => handleKeyEvent(e, true));
  window.addEventListener('keyup', (e) => handleKeyEvent(e, false));
  window.addEventListener('resize', onWindowResize);

  initUI();
  animate();
}

function handleKeyEvent(e, isDown) {
  let key = e.key.toLowerCase();
  let code = e.code;

  if (key === 'w' || key === 'arrowup' || code === 'KeyW' || code === 'ArrowUp') keys.up = isDown;
  if (key === 's' || key === 'arrowdown' || code === 'KeyS' || code === 'ArrowDown') keys.down = isDown;
  if (key === 'a' || key === 'arrowleft' || code === 'KeyA' || code === 'ArrowLeft') keys.left = isDown;
  if (key === 'd' || key === 'arrowright' || code === 'KeyD' || code === 'ArrowRight') keys.right = isDown;
}

function animate() {
  requestAnimationFrame(animate);

  let delta = clock.getDelta();
  let time = clock.getElapsedTime();

  // 1. Update Vehicle Physics & Controls
  car.update(keys);

  // 2. Stream World Environment Chunks
  streamer.update(car.position.z);

  // 3. Update Entities & Slicing Collisions
  entityMgr.update(car);

  // 4. Update Camera View Modes
  if (cameraMode === 'chase') {
    let camOffset = new THREE.Vector3(
      car.position.x - Math.sin(car.heading) * 25,
      car.position.y + 12,
      car.position.z - Math.cos(car.heading) * 25
    );
    camera.position.lerp(camOffset, 0.1);
    camera.lookAt(car.position.x, car.position.y + 2, car.position.z + 10);
    controls.enabled = false;
  } else if (cameraMode === 'topdown') {
    camera.position.set(car.position.x, car.position.y + 75, car.position.z);
    camera.lookAt(car.position);
    controls.enabled = false;
  } else {
    controls.enabled = true;
    controls.update();
  }

  // Update Speedometer HUD
  document.getElementById('hud-speed').innerText = Math.round(Math.abs(car.speed) * 45);
  document.getElementById('hud-zone').innerText = streamer.activeZone === 'city' ? '🏙️ Downtown City' : '🌲 Forest Wilderness';

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

  // Touch Button Controls for Mobile/Mouse
  let btnL = document.getElementById('btn-left');
  let btnR = document.getElementById('btn-right');
  let btnG = document.getElementById('btn-gas');

  btnL.addEventListener('pointerdown', () => keys.left = true);
  btnL.addEventListener('pointerup', () => keys.left = false);
  btnR.addEventListener('pointerdown', () => keys.right = true);
  btnR.addEventListener('pointerup', () => keys.right = false);
  btnG.addEventListener('pointerdown', () => keys.gas = true);
  btnG.addEventListener('pointerup', () => keys.gas = false);

  document.getElementById('speed-slider').addEventListener('input', (e) => {
    car.maxSpeed = parseFloat(e.target.value) / 45;
    document.getElementById('val-speed').innerText = e.target.value;
  });

  document.getElementById('density-slider').addEventListener('input', (e) => {
    let count = parseInt(e.target.value);
    document.getElementById('val-density').innerText = count;
    entityMgr.initEntities(count);
  });

  document.getElementById('select-camera').addEventListener('change', (e) => cameraMode = e.target.value);

  document.getElementById('btn-repair').addEventListener('click', () => car.repairDents());
  document.getElementById('btn-reset').addEventListener('click', () => {
    car.position.set(0, 1.2, 0);
    car.speed = 1.2;
    car.heading = 0;
  });

  // Download HD Snapshot
  document.getElementById('btn-download').addEventListener('click', () => {
    let link = document.createElement('a');
    link.download = 'Rogue_Red_Car_Smasher.png';
    link.href = renderer.domElement.toDataURL('image/png');
    link.click();
  });
}

window.onload = init;
