/**
 * Three.js Quantum Hyper-Dimensional Face Engine
 * 4 Spiral Movement Patterns & Smooth Slower Speed Controls.
 */

function lerpVal(a, b, t) {
  return a + (b - a) * t;
}

class HyperEngine {
  constructor(containerId) {
    this.container = document.getElementById(containerId);

    this.gridSize = 45;
    this.physicsMode = 'vortex';
    this.spiralPattern = 'harmonic'; // 'harmonic', 'helix', 'breathing', 'stringwave'
    this.shapeType = 'cube';
    this.movementSpeed = 0.25; // Slower, graceful default speed
    this.vortexForce = 1.5;
    this.glowRadiance = 1.2;
    this.autoRotate = true;
    this.enableSingularity = true;
    this.showPhotoOverlay = false;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.instancedMesh = null;
    this.singularityMesh = null;
    this.photoOverlayMesh = null;

    this.targetCanvas = null;
    this.instancesData = [];
    this.dummy = new THREE.Object3D();

    this.detonateProgress = 0.0;
    this.isDetonating = false;

    this.initScene();
    this.initLights();
    this.initSingularity();
    this.animate();
  }

  initScene() {
    let w = this.container.clientWidth || window.innerWidth;
    let h = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020617);

    this.camera = new THREE.PerspectiveCamera(45, w / h, 1, 3000);
    this.camera.position.set(0, 0, 480);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = this.autoRotate;
    this.controls.autoRotateSpeed = 0.8; // Smooth, slow camera rotation

    window.addEventListener('resize', () => this.onWindowResize());
  }

  initLights() {
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambientLight);

    let dirLight1 = new THREE.DirectionalLight(0xc084fc, 1.4);
    dirLight1.position.set(200, 300, 300);
    this.scene.add(dirLight1);

    let dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.0);
    dirLight2.position.set(-200, -200, -200);
    this.scene.add(dirLight2);
  }

  initSingularity() {
    let sGeo = new THREE.SphereGeometry(18, 32, 32);
    let sMat = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0x9333ea,
      emissiveIntensity: 0.8,
      roughness: 0.1
    });
    this.singularityMesh = new THREE.Mesh(sGeo, sMat);
    this.singularityMesh.position.set(0, 0, 0);
    this.scene.add(this.singularityMesh);
  }

  triggerSupernovaDetonation() {
    this.detonateProgress = 1.0;
    this.isDetonating = true;
  }

  getGeometry(shape) {
    let size = (340 / this.gridSize) * 0.48;
    if (shape === 'orb') {
      return new THREE.SphereGeometry(size * 0.9, 10, 10);
    } else if (shape === 'pyramid') {
      return new THREE.ConeGeometry(size * 1.0, size * 2.0, 4);
    } else if (shape === 'dust') {
      return new THREE.TetrahedronGeometry(size * 0.7);
    } else {
      return new THREE.BoxGeometry(size * 1.3, size * 1.3, size * 1.3);
    }
  }

  buildQuantumFaceMesh() {
    if (!this.targetCanvas) return;

    if (this.instancedMesh) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh.geometry.dispose();
      this.instancedMesh.material.dispose();
    }

    if (this.photoOverlayMesh) {
      this.scene.remove(this.photoOverlayMesh);
      this.photoOverlayMesh.geometry.dispose();
      this.photoOverlayMesh.material.dispose();
    }

    let photoTex = new THREE.CanvasTexture(this.targetCanvas);
    photoTex.needsUpdate = true;
    let oGeo = new THREE.PlaneGeometry(360, 360);
    let oMat = new THREE.MeshBasicMaterial({
      map: photoTex,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    this.photoOverlayMesh = new THREE.Mesh(oGeo, oMat);
    this.photoOverlayMesh.position.set(0, 0, -30);
    this.photoOverlayMesh.visible = this.showPhotoOverlay;
    this.scene.add(this.photoOverlayMesh);

    this.instancesData = sampleQuantumFaceData(this.targetCanvas, this.gridSize);
    let count = this.instancesData.length;

    let geometry = this.getGeometry(this.shapeType);
    let material = new THREE.MeshStandardMaterial({
      roughness: 0.25,
      metalness: 0.35,
      side: THREE.DoubleSide
    });

    this.instancedMesh = new THREE.InstancedMesh(geometry, material, count);

    for (let i = 0; i < count; i++) {
      let data = this.instancesData[i];
      let posX = data.normX * 360;
      let posY = data.normY * 360;
      let posZ = (data.brightness - 0.5) * 60;

      this.dummy.position.set(posX, posY, posZ);
      this.dummy.updateMatrix();

      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
      this.instancedMesh.setColorAt(i, data.color);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) this.instancedMesh.instanceColor.needsUpdate = true;

    this.scene.add(this.instancedMesh);

    document.getElementById('stat-particles').innerText = count;
  }

  updateQuantumPhysics(time) {
    if (!this.instancedMesh || !this.instancesData.length) return;

    if (this.photoOverlayMesh) {
      this.photoOverlayMesh.visible = this.showPhotoOverlay;
    }

    let count = this.instancesData.length;
    // Slower, graceful animation time factor
    let cycleTime = (time * 0.8 * this.movementSpeed) % (Math.PI * 4);

    if (this.singularityMesh) {
      let sScale = 1.0 + Math.sin(time * 1.5) * 0.15;
      this.singularityMesh.scale.set(sScale, sScale, sScale);
      this.singularityMesh.visible = this.enableSingularity;
    }

    if (this.isDetonating) {
      this.detonateProgress *= 0.94;
      if (this.detonateProgress < 0.01) {
        this.isDetonating = false;
        this.detonateProgress = 0;
      }
    }

    for (let i = 0; i < count; i++) {
      let data = this.instancesData[i];
      let origX = data.normX * 360;
      let origY = data.normY * 360;
      let origZ = (data.brightness - 0.5) * 60;

      let posX = origX;
      let posY = origY;
      let posZ = origZ;

      if (this.physicsMode === 'vortex') {
        let distCenter = Math.hypot(origX, origY);
        let angle = Math.atan2(origY, origX);

        if (this.spiralPattern === 'helix') {
          // ☯️ 2. Dual Counter-Rotating Double Helix
          let side = (data.col + data.row) % 2 === 0 ? 1 : -1;
          let blendFactor = (Math.sin(cycleTime - distCenter * 0.006) + 1.0) * 0.5;
          let spiralAngle = angle + side * (1.0 - blendFactor) * Math.PI * 2.5;
          let spiralRadius = lerpVal(distCenter, 35 + distCenter * 0.4, (1.0 - blendFactor) * this.vortexForce * 0.7);

          posX = Math.cos(spiralAngle) * spiralRadius;
          posY = Math.sin(spiralAngle) * spiralRadius;
          posZ = lerpVal(origZ, Math.sin(spiralAngle * 3.0 + time) * 60, 1.0 - blendFactor);
        } else if (this.spiralPattern === 'breathing') {
          // 💓 3. Quantum Orbital Breathing Pulse
          let pulseWave = Math.sin(cycleTime * 1.5 - distCenter * 0.01);
          let blendFactor = (pulseWave + 1.0) * 0.5;
          let spiralAngle = angle + pulseWave * Math.PI * 1.5;
          let spiralRadius = lerpVal(distCenter, distCenter * (1.2 + pulseWave * 0.5), (1.0 - blendFactor) * 0.6);

          posX = Math.cos(spiralAngle) * spiralRadius;
          posY = Math.sin(spiralAngle) * spiralRadius;
          posZ = lerpVal(origZ, Math.cos(pulseWave * Math.PI) * 70, 1.0 - blendFactor);
        } else if (this.spiralPattern === 'stringwave') {
          // 〰️ 4. Cosmic String Wave Undulation
          let wavePhase = Math.sin(data.normX * 6.0 + cycleTime) * Math.cos(data.normY * 6.0 + cycleTime);
          let blendFactor = (wavePhase + 1.0) * 0.5;
          let spiralAngle = angle + wavePhase * Math.PI * 2.0;

          posX = origX + Math.sin(spiralAngle) * 45 * (1.0 - blendFactor);
          posY = origY + Math.cos(spiralAngle) * 45 * (1.0 - blendFactor);
          posZ = origZ + wavePhase * 75 * this.vortexForce * 0.5;
        } else {
          // 🌀 1. Harmonic Spiral Vortex (Default Smooth Disassembly & Re-assembly)
          let blendFactor = (Math.sin(cycleTime - distCenter * 0.008) + 1.0) * 0.5;
          let spiralAngle = angle + (1.0 - blendFactor) * Math.PI * 3.0;
          let spiralRadius = lerpVal(distCenter, 40 + distCenter * 0.3, (1.0 - blendFactor) * this.vortexForce * 0.7);

          posX = Math.cos(spiralAngle) * spiralRadius;
          posY = Math.sin(spiralAngle) * spiralRadius;
          posZ = lerpVal(origZ, Math.sin(spiralAngle * 2.0 + time * 0.8) * 70, 1.0 - blendFactor);
        }
      } else if (this.physicsMode === 'wave') {
        let wave = Math.sin(data.normX * 10 + data.normY * 10 + time * 1.5) * 30;
        posZ += wave;
      } else if (this.physicsMode === 'supernova') {
        let dirX = data.normX;
        let dirY = data.normY;
        let dist = Math.hypot(dirX, dirY) + 0.1;
        let pulse = (Math.sin(time * 1.8 + dist * 4.0) + 1.0) * 0.5;

        posX += (dirX / dist) * pulse * 90 * this.vortexForce;
        posY += (dirY / dist) * pulse * 90 * this.vortexForce;
        posZ += Math.sin(time * 2.0 + i) * 40;
      } else if (this.physicsMode === 'hologram') {
        let scanline = Math.sin(data.normY * 24 + time * 3.0);
        posZ += scanline * 15;
      }

      if (this.detonateProgress > 0.001) {
        let explDist = Math.hypot(origX, origY) + 0.1;
        posX += (origX / explDist) * this.detonateProgress * 260;
        posY += (origY / explDist) * this.detonateProgress * 260;
        posZ += (Math.random() - 0.5) * this.detonateProgress * 280;
      }

      this.dummy.position.set(posX, posY, posZ);
      this.dummy.rotation.x = Math.sin(time * 0.5 + i * 0.1) * 0.2;
      this.dummy.rotation.y = Math.cos(time * 0.5 + i * 0.1) * 0.2;

      this.dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    let time = performance.now() * 0.001;

    this.controls.autoRotate = this.autoRotate;
    this.controls.update();

    this.updateQuantumPhysics(time);

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    let w = this.container.clientWidth || window.innerWidth;
    let h = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(w, h);
  }
}
