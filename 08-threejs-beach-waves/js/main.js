/**
 * Three.js Ocean Beach & Shoreline Waves Main Controller
 * Inspired by Dan Greenheck's Three.js Water Pro.
 */

let scene, camera, renderer, controls;
let oceanMesh, beachMesh, sunLight, skyMesh, buoyMesh;
let oceanMaterial, beachMaterial;
let clock = new THREE.Clock();

let uiWaveHeight = 1.8;
let uiWaveSpeed = 1.0;
let uiFoamIntensity = 1.0;
let autoRotate = true;
let enableBuoy = true;

const PRESETS = {
  tropical: {
    sunPos: new THREE.Vector3(100, 120, -200),
    sunColor: new THREE.Color(0xfffbef),
    deepColor: new THREE.Color(0x005580),
    shallowColor: new THREE.Color(0x20b2aa), // Bright Light Turquoise
    skyBg: 0x38bdf8
  },
  sunset: {
    sunPos: new THREE.Vector3(100, 20, -250),
    sunColor: new THREE.Color(0xff7700),
    deepColor: new THREE.Color(0x3a0ca3),
    shallowColor: new THREE.Color(0xf72585),
    skyBg: 0x4a0e4e
  },
  twilight: {
    sunPos: new THREE.Vector3(80, 150, -150),
    sunColor: new THREE.Color(0x90e0ef),
    deepColor: new THREE.Color(0x03045e),
    shallowColor: new THREE.Color(0x0077b6),
    skyBg: 0x020617
  }
};

let currentPreset = PRESETS.tropical;

function init() {
  let container = document.getElementById('canvas-container');

  // Scene & Camera
  scene = new THREE.Scene();
  scene.background = new THREE.Color(currentPreset.skyBg);

  camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 25, 85);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // 360 OrbitControls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI * 0.48; // Don't clip below sea level
  controls.target.set(0, 0, -10);

  // Sun Light
  sunLight = new THREE.DirectionalLight(currentPreset.sunColor, 1.5);
  sunLight.position.copy(currentPreset.sunPos);
  scene.add(sunLight);

  let ambLight = new THREE.AmbientLight(0x38bdf8, 0.6);
  scene.add(ambLight);

  // 1. Procedural Sandy Beach Slope Terrain (Rendered First)
  let beachGeo = createSandyBeachTerrain(340, 240);
  beachMaterial = new THREE.ShaderMaterial({
    uniforms: SandyBeachShader.uniforms,
    vertexShader: SandyBeachShader.vertexShader,
    fragmentShader: SandyBeachShader.fragmentShader
  });
  beachMesh = new THREE.Mesh(beachGeo, beachMaterial);
  beachMesh.position.set(0, -6, 0);
  scene.add(beachMesh);

  // 2. Gerstner Wave Ocean Surface Plane (Rendered Over Sand with Transparency)
  let oceanGeo = new THREE.PlaneGeometry(340, 240, 128, 128);
  oceanGeo.rotateX(-Math.PI * 0.5);

  oceanMaterial = new THREE.ShaderMaterial({
    uniforms: GerstnerOceanShader.uniforms,
    vertexShader: GerstnerOceanShader.vertexShader,
    fragmentShader: GerstnerOceanShader.fragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  oceanMesh = new THREE.Mesh(oceanGeo, oceanMaterial);
  oceanMesh.position.set(0, -2, -20);
  scene.add(oceanMesh);

  // 3. Floating Buoy Physics Object
  buoyMesh = createFloatingBuoy();
  buoyMesh.position.set(-20, 0, -30);
  scene.add(buoyMesh);

  // Window Resize & UI
  window.addEventListener('resize', onWindowResize);
  initUI();

  animate();
}

function animate() {
  requestAnimationFrame(animate);

  let delta = clock.getDelta();
  let time = clock.getElapsedTime();

  // Update Shader Uniforms
  GerstnerOceanShader.uniforms.uTime.value = time;
  GerstnerOceanShader.uniforms.uWaveHeight.value = uiWaveHeight;
  GerstnerOceanShader.uniforms.uWaveSpeed.value = uiWaveSpeed;
  GerstnerOceanShader.uniforms.uFoamIntensity.value = uiFoamIntensity;
  SandyBeachShader.uniforms.uTime.value = time;

  // 360 Orbit Camera Auto-Rotation
  if (autoRotate) {
    scene.rotation.y = Math.sin(time * 0.08) * 0.25;
  } else {
    scene.rotation.y = 0;
  }

  // Buoy Floating Wave Physics Modulation
  if (buoyMesh) {
    let waveY = Math.sin(time * 2.0 * uiWaveSpeed) * (0.8 * uiWaveHeight);
    let wavePitch = Math.cos(time * 1.5 * uiWaveSpeed) * 0.15;
    buoyMesh.position.y = waveY;
    buoyMesh.rotation.z = wavePitch;
    buoyMesh.rotation.x = Math.sin(time * 1.8) * 0.12;
    buoyMesh.visible = enableBuoy;
  }

  controls.update();
  renderer.render(scene, camera);

  if (Math.floor(time * 10) % 5 === 0) {
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

  document.getElementById('wave-height-slider').addEventListener('input', (e) => {
    uiWaveHeight = parseFloat(e.target.value);
    document.getElementById('val-wave-height').innerText = uiWaveHeight.toFixed(1);
  });

  document.getElementById('wave-speed-slider').addEventListener('input', (e) => {
    uiWaveSpeed = parseFloat(e.target.value);
    document.getElementById('val-wave-speed').innerText = uiWaveSpeed.toFixed(1);
  });

  document.getElementById('foam-slider').addEventListener('input', (e) => {
    uiFoamIntensity = parseFloat(e.target.value) / 100;
    document.getElementById('val-foam').innerText = e.target.value;
  });

  document.getElementById('chk-rotate').addEventListener('change', (e) => autoRotate = e.target.checked);
  document.getElementById('chk-buoy').addEventListener('change', (e) => enableBuoy = e.target.checked);

  // Preset Selector
  document.getElementById('select-preset').addEventListener('change', (e) => {
    currentPreset = PRESETS[e.target.value];

    scene.background.setHex(currentPreset.skyBg);
    sunLight.position.copy(currentPreset.sunPos);
    sunLight.color.copy(currentPreset.sunColor);

    GerstnerOceanShader.uniforms.uSunPosition.value.copy(currentPreset.sunPos);
    GerstnerOceanShader.uniforms.uSunColor.value.copy(currentPreset.sunColor);
    GerstnerOceanShader.uniforms.uWaterDeepColor.value.copy(currentPreset.deepColor);
    GerstnerOceanShader.uniforms.uWaterShallowColor.value.copy(currentPreset.shallowColor);

    SandyBeachShader.uniforms.uSunPosition.value.copy(currentPreset.sunPos);
    SandyBeachShader.uniforms.uSunColor.value.copy(currentPreset.sunColor);
  });
}

window.onload = init;
