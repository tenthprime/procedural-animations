/**
 * Three.js 3D Image-to-Pixel Art Engine
 * Implements THREE.InstancedMesh Voxelization, 3D Wave Displacement, Kinetic Floating Dots & Material Themes.
 */

class Pixel3DEngine {
  constructor(containerId) {
    this.container = document.getElementById(containerId);

    this.gridSize = 40;
    this.shapeType = 'sphere';
    this.materialType = 'standard';
    this.waveAmplitude = 25;
    this.dotFloatSpeed = 1.0;
    this.depthExtrude = 1.5;
    this.autoRotate = true;
    this.enableWaves = true;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.instancedMesh = null;

    this.targetCanvas = null;
    this.instancesData = [];
    this.dummy = new THREE.Object3D();

    this.initScene();
    this.initLights();
    this.animate();
  }

  initScene() {
    let w = this.container.clientWidth || window.innerWidth;
    let h = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020617);

    this.camera = new THREE.PerspectiveCamera(45, w / h, 1, 3000);
    this.camera.position.set(0, 0, 450);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = this.autoRotate;
    this.controls.autoRotateSpeed = 1.2;

    window.addEventListener('resize', () => this.onWindowResize());
  }

  initLights() {
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    let dirLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight1.position.set(200, 300, 400);
    this.scene.add(dirLight1);

    let dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.8);
    dirLight2.position.set(-200, -200, 200);
    this.scene.add(dirLight2);
  }

  getGeometry(shape) {
    let size = (350 / this.gridSize) * 0.45;
    if (shape === 'box') {
      return new THREE.BoxGeometry(size * 1.6, size * 1.6, size * 1.6);
    } else if (shape === 'cylinder') {
      return new THREE.CylinderGeometry(size, size, size * 2.2, 12);
    } else if (shape === 'cone') {
      return new THREE.ConeGeometry(size * 1.2, size * 2.5, 4);
    } else {
      return new THREE.SphereGeometry(size * 1.1, 12, 12);
    }
  }

  getMaterial(matType) {
    if (matType === 'metallic') {
      return new THREE.MeshStandardMaterial({ roughness: 0.1, metalness: 0.9 });
    } else if (matType === 'neon') {
      return new THREE.MeshStandardMaterial({ roughness: 0.2, metalness: 0.3, emissive: 0x112233 });
    } else if (matType === 'glass') {
      return new THREE.MeshPhysicalMaterial({ roughness: 0.1, transmission: 0.6, thickness: 1.2 });
    } else {
      return new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.1 });
    }
  }

  build3DPixelMesh() {
    if (!this.targetCanvas) return;

    if (this.instancedMesh) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh.geometry.dispose();
      this.instancedMesh.material.dispose();
    }

    this.instancesData = sampleImageFor3D(this.targetCanvas, this.gridSize);
    let count = this.instancesData.length;

    let geometry = this.getGeometry(this.shapeType);
    let material = this.getMaterial(this.materialType);

    this.instancedMesh = new THREE.InstancedMesh(geometry, material, count);

    for (let i = 0; i < count; i++) {
      let data = this.instancesData[i];
      let posX = data.normX * 360;
      let posY = data.normY * 360;
      let posZ = (data.brightness - 0.5) * 60 * this.depthExtrude;

      this.dummy.position.set(posX, posY, posZ);
      this.dummy.updateMatrix();

      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
      this.instancedMesh.setColorAt(i, data.color);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) this.instancedMesh.instanceColor.needsUpdate = true;

    this.scene.add(this.instancedMesh);

    document.getElementById('stat-voxels').innerText = count;
    document.getElementById('stat-draw').innerText = '1';
  }

  updatePhysics(time) {
    if (!this.instancedMesh || !this.instancesData.length) return;

    let count = this.instancesData.length;

    for (let i = 0; i < count; i++) {
      let data = this.instancesData[i];
      let posX = data.normX * 360;
      let posY = data.normY * 360;
      let posZ = (data.brightness - 0.5) * 60 * this.depthExtrude;

      // 1. 3D Wave Displacement Fields (Sine waves & diagonal ripples)
      if (this.enableWaves) {
        let wave = Math.sin(data.normX * 10 + data.normY * 10 + time * 3.0);
        posZ += wave * this.waveAmplitude;
      }

      // 2. Kinetic Floating Dots Swarm Turbulence (Floating dots physics)
      if (this.dotFloatSpeed > 0.01) {
        let floatX = Math.sin(time * 2.0 + data.col * 0.3) * 8 * this.dotFloatSpeed;
        let floatY = Math.cos(time * 2.0 + data.row * 0.3) * 8 * this.dotFloatSpeed;
        let floatZ = Math.sin(time * 3.0 + (data.col + data.row) * 0.2) * 15 * this.dotFloatSpeed;

        posX += floatX;
        posY += floatY;
        posZ += floatZ;
      }

      this.dummy.position.set(posX, posY, posZ);

      // Subtle rotation for 3D kinetic dots
      if (this.shapeType !== 'sphere') {
        this.dummy.rotation.x = Math.sin(time + i) * 0.2;
        this.dummy.rotation.y = Math.cos(time + i) * 0.2;
      } else {
        this.dummy.rotation.set(0, 0, 0);
      }

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

    this.updatePhysics(time);

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
