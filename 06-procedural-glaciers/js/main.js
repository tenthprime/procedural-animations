/**
 * GLACIER - The Living Arctic Main Controller
 */

let scene, camera, renderer, controls;
let glacierMesh, icebergMesh1, icebergMesh2, skyMesh, waterMesh, blizzard;
let iceMaterial, skyMaterial;
let clock = new THREE.Clock();

let uiIceGlow = 1.0;
let uiBlizzard = 0.5;
let uiAurora = 1.0;
let autoRotate = true;
let enableWaves = true;

function init() {
  let container = document.getElementById('canvas-container');

  // Scene & Camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 30, 110);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // OrbitControls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI * 0.48; // Don't clip below water

  // Lighting
  let dirLight = new THREE.DirectionalLight(0xe0f2fe, 1.2);
  dirLight.position.set(50, 100, 50);
  scene.add(dirLight);

  let ambLight = new THREE.AmbientLight(0x0c2340, 0.6);
  scene.add(ambLight);

  // 1. Aurora Borealis Sky Dome
  let skyGeo = new THREE.SphereGeometry(300, 32, 32);
  skyMaterial = new THREE.ShaderMaterial({
    uniforms: AuroraSkyShader.uniforms,
    vertexShader: AuroraSkyShader.vertexShader,
    fragmentShader: AuroraSkyShader.fragmentShader,
    side: THREE.BackSide
  });
  skyMesh = new THREE.Mesh(skyGeo, skyMaterial);
  scene.add(skyMesh);

  // 2. Subsurface Scattering Glacial Ice Shelf
  let glacierGeo = createProceduralGlacierGeometry(140, 50, 90);
  iceMaterial = new THREE.ShaderMaterial({
    uniforms: GlacialIceShader.uniforms,
    vertexShader: GlacialIceShader.vertexShader,
    fragmentShader: GlacialIceShader.fragmentShader,
    transparent: true
  });
  glacierMesh = new THREE.Mesh(glacierGeo, iceMaterial);
  glacierMesh.position.set(-20, 10, -30);
  scene.add(glacierMesh);

  // 3. Floating Icebergs
  let bergGeo1 = createProceduralIcebergGeometry(20);
  icebergMesh1 = new THREE.Mesh(bergGeo1, iceMaterial);
  icebergMesh1.position.set(45, -4, 20);
  scene.add(icebergMesh1);

  let bergGeo2 = createProceduralIcebergGeometry(14);
  icebergMesh2 = new THREE.Mesh(bergGeo2, iceMaterial);
  icebergMesh2.position.set(-50, -3, 30);
  scene.add(icebergMesh2);

  // 4. Arctic Ocean Water Surface
  let waterGeo = new THREE.PlaneGeometry(350, 350, 64, 64);
  let waterMat = new THREE.MeshPhongMaterial({
    color: 0x052a4a,
    emissive: 0x021528,
    specular: 0x80e5ff,
    shininess: 90,
    transparent: true,
    opacity: 0.88,
    flatShading: true
  });
  waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.rotation.x = -Math.PI * 0.5;
  waterMesh.position.y = -6;
  scene.add(waterMesh);

  // 5. Blizzard Snow Particles
  blizzard = createBlizzardParticles(2500);
  scene.add(blizzard);

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
  GlacialIceShader.uniforms.uTime.value = time;
  GlacialIceShader.uniforms.uIceGlow.value = uiIceGlow;
  AuroraSkyShader.uniforms.uTime.value = time;
  AuroraSkyShader.uniforms.uAuroraIntensity.value = uiAurora;

  // Orbit Auto-Rotate
  if (autoRotate) {
    scene.rotation.y = time * 0.05;
  }

  // Floating Iceberg Bobbing
  icebergMesh1.position.y = -4 + Math.sin(time * 1.2) * 1.5;
  icebergMesh1.rotation.y = time * 0.08;
  icebergMesh2.position.y = -3 + Math.cos(time * 1.5) * 1.2;

  // Ocean Water Wave Animation
  if (enableWaves) {
    let pos = waterMesh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let u = pos.getX(i);
      let v = pos.getY(i);
      let z = Math.sin(u * 0.1 + time * 1.5) * Math.cos(v * 0.1 + time * 1.2) * 1.8;
      pos.setZ(i, z);
    }
    waterMesh.geometry.attributes.position.needsUpdate = true;
  }

  // Blizzard Particle Motion
  let pPos = blizzard.geometry.attributes.position;
  for (let i = 0; i < pPos.count * 3; i += 3) {
    pPos.setY(i + 1, pPos.getY(i + 1) - (1.5 + uiBlizzard * 2.0));
    pPos.setX(i, pPos.getX(i) - (0.8 + uiBlizzard));
    if (pPos.getY(i + 1) < -10) {
      pPos.setY(i + 1, 150);
      pPos.setX(i, (Math.random() - 0.5) * 400);
    }
  }
  blizzard.geometry.attributes.position.needsUpdate = true;
  blizzard.visible = uiBlizzard > 0;

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

  document.getElementById('ice-glow-slider').addEventListener('input', (e) => {
    uiIceGlow = parseFloat(e.target.value) / 100;
    document.getElementById('val-ice-glow').innerText = e.target.value;
  });

  document.getElementById('blizzard-slider').addEventListener('input', (e) => {
    uiBlizzard = parseFloat(e.target.value) / 100;
    document.getElementById('val-blizzard').innerText = e.target.value;
  });

  document.getElementById('aurora-slider').addEventListener('input', (e) => {
    uiAurora = parseFloat(e.target.value) / 100;
    document.getElementById('val-aurora').innerText = e.target.value;
  });

  document.getElementById('chk-rotate').addEventListener('change', (e) => autoRotate = e.target.checked);
  document.getElementById('chk-waves').addEventListener('change', (e) => enableWaves = e.target.checked);

  // Preset Switcher
  document.getElementById('select-preset').addEventListener('change', (e) => {
    let mode = e.target.value;
    if (mode === 'aurora') {
      uiAurora = 1.2; uiBlizzard = 0.3; uiIceGlow = 1.0;
    } else if (mode === 'blizzard') {
      uiAurora = 0.2; uiBlizzard = 1.0; uiIceGlow = 0.6;
    } else if (mode === 'sunlight') {
      uiAurora = 0.0; uiBlizzard = 0.1; uiIceGlow = 1.8;
    }
    document.getElementById('val-aurora').innerText = Math.round(uiAurora * 100);
    document.getElementById('val-blizzard').innerText = Math.round(uiBlizzard * 100);
    document.getElementById('val-ice-glow').innerText = Math.round(uiIceGlow * 100);
  });
}

window.onload = init;
