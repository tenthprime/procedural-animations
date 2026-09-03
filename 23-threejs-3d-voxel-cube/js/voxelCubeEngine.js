/**
 * Three.js 3D Volumetric Voxel Cube Engine
 * Fully visible light setup, double-sided materials, and scale resets.
 */

class VoxelCubeEngine {
  constructor(containerId) {
    this.container = document.getElementById(containerId);

    this.gridSize = 35;
    this.depthLayers = 8;
    this.depthMode = 'solid'; // 'solid', 'terrain', 'hollow', 'globe'
    this.shapeType = 'box';
    this.materialType = 'standard';
    this.extrudeScale = 1.5;
    this.wave3D = 1.0;
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
    this.camera.position.set(280, 220, 420); // 3D Isometric Viewpoint

    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = this.autoRotate;
    this.controls.autoRotateSpeed = 1.4;

    window.addEventListener('resize', () => this.onWindowResize());
  }

  initLights() {
    // 6-directional lights for 360-degree full visibility
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    let dirLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight1.position.set(300, 400, 300);
    this.scene.add(dirLight1);

    let dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.8);
    dirLight2.position.set(-300, -200, -200);
    this.scene.add(dirLight2);

    let dirLight3 = new THREE.DirectionalLight(0xf59e0b, 0.6);
    dirLight3.position.set(0, -300, 300);
    this.scene.add(dirLight3);
  }

  getGeometry(shape) {
    let size = (320 / this.gridSize) * 0.75;
    if (shape === 'sphere') {
      return new THREE.SphereGeometry(size * 0.85, 10, 10);
    } else if (shape === 'cylinder') {
      return new THREE.CylinderGeometry(size * 0.7, size * 0.7, size * 1.6, 10);
    } else if (shape === 'cone') {
      return new THREE.ConeGeometry(size * 0.9, size * 1.8, 4);
    } else {
      return new THREE.BoxGeometry(size * 1.2, size * 1.2, size * 1.2);
    }
  }

  getMaterial(matType) {
    if (matType === 'metallic') {
      return new THREE.MeshStandardMaterial({ roughness: 0.2, metalness: 0.8, side: THREE.DoubleSide });
    } else if (matType === 'neon') {
      return new THREE.MeshStandardMaterial({ roughness: 0.2, metalness: 0.3, emissive: 0x332211, side: THREE.DoubleSide });
    } else if (matType === 'glass') {
      return new THREE.MeshPhysicalMaterial({ roughness: 0.1, transmission: 0.6, thickness: 1.5, side: THREE.DoubleSide });
    } else {
      return new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.1, side: THREE.DoubleSide });
    }
  }

  build3DVolumetricCube() {
    if (!this.targetCanvas) return;

    if (this.instancedMesh) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh.geometry.dispose();
      this.instancedMesh.material.dispose();
    }

    this.instancesData = sampleVolumetricCubeData(this.targetCanvas, this.gridSize, this.depthLayers);
    let count = this.instancesData.length;

    let geometry = this.getGeometry(this.shapeType);
    let material = this.getMaterial(this.materialType);

    this.instancedMesh = new THREE.InstancedMesh(geometry, material, count);

    let depthSize = 220 * this.extrudeScale;

    for (let i = 0; i < count; i++) {
      let data = this.instancesData[i];
      let posX = data.normX * 320;
      let posY = data.normY * 320;
      let posZ = data.normZ * depthSize;

      this.dummy.scale.set(1, 1, 1);

      if (this.depthMode === 'terrain') {
        posZ = (data.brightness - 0.5) * depthSize;
      } else if (this.depthMode === 'hollow') {
        if (data.layer > 0 && data.layer < this.depthLayers - 1 && data.col > 1 && data.col < this.gridSize - 2 && data.row > 1 && data.row < this.gridSize - 2) {
          this.dummy.scale.set(0, 0, 0); // Carve out hollow interior
        }
      } else if (this.depthMode === 'globe') {
        let r = 160;
        let phi = (data.normY + 0.5) * Math.PI;
        let theta = (data.normX + 0.5) * Math.PI * 2;
        posX = r * Math.sin(phi) * Math.cos(theta);
        posY = r * Math.cos(phi);
        posZ = r * Math.sin(phi) * Math.sin(theta) + data.normZ * 30;
      }

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
    let depthSize = 220 * this.extrudeScale;

    for (let i = 0; i < count; i++) {
      let data = this.instancesData[i];
      let posX = data.normX * 320;
      let posY = data.normY * 320;
      let posZ = data.normZ * depthSize;

      this.dummy.scale.set(1, 1, 1);

      if (this.depthMode === 'terrain') {
        posZ = (data.brightness - 0.5) * depthSize;
      } else if (this.depthMode === 'hollow') {
        if (data.layer > 0 && data.layer < this.depthLayers - 1 && data.col > 1 && data.col < this.gridSize - 2 && data.row > 1 && data.row < this.gridSize - 2) {
          this.dummy.scale.set(0, 0, 0);
        }
      } else if (this.depthMode === 'globe') {
        let r = 160;
        let phi = (data.normY + 0.5) * Math.PI;
        let theta = (data.normX + 0.5) * Math.PI * 2;
        posX = r * Math.sin(phi) * Math.cos(theta);
        posY = r * Math.cos(phi);
        posZ = r * Math.sin(phi) * Math.sin(theta) + data.normZ * 30;
      }

      // 3D Wave Undulation across X, Y, Z axes
      if (this.enableWaves && this.wave3D > 0.01) {
        let waveX = Math.sin(data.normY * 8 + time * 2.5) * 10 * this.wave3D;
        let waveY = Math.cos(data.normX * 8 + time * 2.5) * 10 * this.wave3D;
        let waveZ = Math.sin((data.normX + data.normY) * 6 + time * 3.0) * 14 * this.wave3D;

        posX += waveX;
        posY += waveY;
        posZ += waveZ;
      }

      this.dummy.position.set(posX, posY, posZ);
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
