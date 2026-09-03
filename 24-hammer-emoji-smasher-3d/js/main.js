/**
 * 3D POV Hammer Emoji Smasher Game Main Controller
 * 1-to-1 Cursor Tracking & Direct Impact Contact Point Physics.
 */

let scene, camera, renderer;
let hammerGroup, targetMesh, shatterEngine, audioEngine;

let gameScore = 0;
let smashedCount = 0;
let comboStreak = 1;
let lastHitTime = 0;

let currentEmojiIndex = 0;
let gameMode = 'pedestal';
let hammerScale = 0.5;
let shatterForceMult = 1.8;
let enableAudio = true;
let isSwinging = false;
let swingProgress = 0;

let mousePos = new THREE.Vector2();
let worldMouse = new THREE.Vector3();
let raycaster = new THREE.Raycaster();

window.addEventListener('DOMContentLoaded', () => {
  initScene();
  initLights();
  initHammer();
  initTargetPedestal();

  audioEngine = new AudioEngine();
  shatterEngine = new ShatterPhysicsEngine(scene);

  spawnEmojiTarget(currentEmojiIndex);
  populateEmojiDropdown();
  initUI();

  animate();
});

function initScene() {
  let container = document.getElementById('canvas-container');
  let w = container.clientWidth || window.innerWidth;
  let h = container.clientHeight || window.innerHeight;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020617);

  camera = new THREE.PerspectiveCamera(48, w / h, 1, 1500);
  camera.position.set(0, 25, 170);

  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('pointerdown', onCanvasClick);
}

function initLights() {
  let ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  let dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight1.position.set(100, 200, 150);
  scene.add(dirLight1);

  let dirLight2 = new THREE.DirectionalLight(0xef4444, 0.6);
  dirLight2.position.set(-150, -50, 100);
  scene.add(dirLight2);
}

function initTargetPedestal() {
  let pGeo = new THREE.CylinderGeometry(45, 55, 20, 32);
  let pMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.8 });
  let pedestal = new THREE.Mesh(pGeo, pMat);
  pedestal.position.set(0, -35, 0);
  scene.add(pedestal);

  let ringGeo = new THREE.TorusGeometry(46, 2, 16, 32);
  let ringMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, roughness: 0.2 });
  let ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, -25, 0);
  scene.add(ring);
}

function initHammer() {
  hammerGroup = new THREE.Group();

  // Handle
  let handleGeo = new THREE.CylinderGeometry(2.2, 2.8, 55, 16);
  let handleMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
  let handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.set(-10, -18, -10);
  handle.rotation.z = 0.4;
  hammerGroup.add(handle);

  // Metallic Hammer Head (Centering striking head at cursor tip)
  let headGeo = new THREE.BoxGeometry(28, 16, 16);
  let headMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
  let head = new THREE.Mesh(headGeo, headMat);
  head.position.set(0, 0, 0);
  hammerGroup.add(head);

  // Golden Striking Face Plate (Facing forward)
  let faceGeo = new THREE.BoxGeometry(4, 18, 18);
  let faceMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8, roughness: 0.1 });
  let face = new THREE.Mesh(faceGeo, faceMat);
  face.position.set(-14, 0, 0);
  hammerGroup.add(face);

  hammerGroup.scale.set(hammerScale, hammerScale, hammerScale);
  hammerGroup.position.set(0, 0, 70);

  scene.add(hammerGroup);
}

function spawnEmojiTarget(index) {
  if (targetMesh) {
    scene.remove(targetMesh);
    if (targetMesh.geometry) targetMesh.geometry.dispose();
    if (targetMesh.material) targetMesh.material.dispose();
  }

  targetMesh = build3DEmojiMesh(index);
  targetMesh.position.set(0, 10, 0);
  scene.add(targetMesh);

  document.getElementById('stat-target').innerText = targetMesh.userData.emojiChar + " #" + (index + 1);
}

function onMouseMove(e) {
  mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;

  // Unproject 2D mouse coordinates into 3D camera space for 1-to-1 cursor alignment
  let vec = new THREE.Vector3(mousePos.x, mousePos.y, 0.5);
  vec.unproject(camera);
  let dir = vec.sub(camera.position).normalize();
  let distance = (70 - camera.position.z) / dir.z;
  worldMouse = camera.position.clone().add(dir.multiplyScalar(distance));

  // Move 3D Hammer directly to 3D mouse cursor position
  if (hammerGroup && !isSwinging) {
    hammerGroup.position.x = THREE.MathUtils.lerp(hammerGroup.position.x, worldMouse.x, 0.35);
    hammerGroup.position.y = THREE.MathUtils.lerp(hammerGroup.position.y, worldMouse.y, 0.35);
    hammerGroup.position.z = THREE.MathUtils.lerp(hammerGroup.position.z, worldMouse.z + 55, 0.35);
  }
}

function onCanvasClick(e) {
  if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

  // Trigger POV Hammer Swing
  if (!isSwinging) {
    isSwinging = true;
    swingProgress = 0;
  }

  // Guaranteed Hit Smash Detection at Cursor Location
  if (targetMesh && targetMesh.parent) {
    raycaster.setFromCamera(mousePos, camera);
    let intersects = raycaster.intersectObject(targetMesh, true);
    let screenDist = Math.hypot(mousePos.x, mousePos.y);

    if (intersects.length > 0 || screenDist < 0.65) {
      let hitPoint = intersects.length > 0 ? intersects[0].point : worldMouse.clone();
      triggerEmojiSmash(hitPoint);
    }
  }
}

function triggerEmojiSmash(hitPoint) {
  if (!targetMesh || !targetMesh.parent) return;

  let now = performance.now();
  if (now - lastHitTime < 1600) {
    comboStreak = Math.min(5, comboStreak + 1);
  } else {
    comboStreak = 1;
  }
  lastHitTime = now;

  let pts = 100 * comboStreak;
  gameScore += pts;
  smashedCount++;

  document.getElementById('hud-score').innerText = String(gameScore).padStart(6, '0');
  document.getElementById('hud-smashed').innerText = smashedCount + " / 100";
  document.getElementById('hud-combo').innerText = comboStreak + "x";

  // Audio & Fracture Shatter Physics
  if (enableAudio) {
    audioEngine.playImpactThud();
    audioEngine.playGlassShatter();
  }

  shatterEngine.shatterTargetMesh(targetMesh, hitPoint, shatterForceMult);

  // Remove smashed target mesh and auto-respawn next 3D Emoji
  scene.remove(targetMesh);
  currentEmojiIndex = (currentEmojiIndex + 1) % EMOJI_LIST.length;

  setTimeout(() => {
    spawnEmojiTarget(currentEmojiIndex);
  }, 350);
}

function animate() {
  requestAnimationFrame(animate);

  let delta = 0.016;

  // Target Floating Rotation Animation
  if (targetMesh && targetMesh.parent) {
    targetMesh.rotation.y += 0.018;
    targetMesh.position.y = 10 + Math.sin(performance.now() * 0.003) * 5;
  }

  // POV Hammer Swing Motion Physics directly at contact point
  if (isSwinging) {
    swingProgress += 0.18;
    let swingAngle = Math.sin(swingProgress * Math.PI) * 1.4;

    hammerGroup.rotation.x = -0.3 - swingAngle;
    hammerGroup.rotation.z = 0.2 + Math.sin(swingProgress * Math.PI) * 0.5;
    hammerGroup.position.z = (worldMouse.z + 55) - Math.sin(swingProgress * Math.PI) * 45;

    if (swingProgress >= 1.0) {
      isSwinging = false;
      swingProgress = 0;
      hammerGroup.rotation.set(-0.3, -0.4, -0.2);
    }
  }

  // Update Shatter Fragment Debris
  shatterEngine.update(delta);
  document.getElementById('stat-debris').innerText = shatterEngine.activeDebris.length;

  renderer.render(scene, camera);
}

function populateEmojiDropdown() {
  let select = document.getElementById('select-emoji-target');
  select.innerHTML = '';

  EMOJI_LIST.forEach((emoji, i) => {
    let opt = document.createElement('option');
    opt.value = i;
    opt.innerText = "#" + (i + 1) + " " + emoji + " Target";
    select.appendChild(opt);
  });

  select.addEventListener('change', (e) => {
    currentEmojiIndex = parseInt(e.target.value);
    spawnEmojiTarget(currentEmojiIndex);
  });
}

function onWindowResize() {
  let container = document.getElementById('canvas-container');
  let w = container.clientWidth || window.innerWidth;
  let h = container.clientHeight || window.innerHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
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

  document.getElementById('btn-respawn').addEventListener('click', () => {
    spawnEmojiTarget(currentEmojiIndex);
  });

  document.getElementById('btn-reset-game').addEventListener('click', () => {
    gameScore = 0;
    smashedCount = 0;
    comboStreak = 1;
    document.getElementById('hud-score').innerText = '000000';
    document.getElementById('hud-smashed').innerText = '0 / 100';
    document.getElementById('hud-combo').innerText = '1x';
    spawnEmojiTarget(0);
  });

  document.getElementById('select-game-mode').addEventListener('change', (e) => gameMode = e.target.value);

  document.getElementById('hammer-size-slider').addEventListener('input', (e) => {
    hammerScale = parseFloat(e.target.value);
    document.getElementById('val-hammer').innerText = hammerScale.toFixed(1);
    hammerGroup.scale.set(hammerScale, hammerScale, hammerScale);
  });

  document.getElementById('shatter-force-slider').addEventListener('input', (e) => {
    shatterForceMult = parseFloat(e.target.value);
    document.getElementById('val-shatter').innerText = shatterForceMult.toFixed(1);
  });

  document.getElementById('chk-audio').addEventListener('change', (e) => audioEngine.enabled = e.target.checked);

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
              a.download = '3D_POV_Hammer_Emoji_Smasher.gif';
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
      a.download = '3D_POV_Hammer_Emoji_Smasher.png';
      a.href = canvasEl.toDataURL('image/png');
      a.click();
    }
  });
}
