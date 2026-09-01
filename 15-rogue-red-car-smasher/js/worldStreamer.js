/**
 * Endless Procedural Environment Streamer
 * Dynamically streams and recycles City Grid & Forest Wilderness Chunks.
 */

class WorldStreamer {
  constructor(scene) {
    this.scene = scene;
    this.chunks = [];
    this.chunkSize = 250;
    this.activeZone = 'city'; // 'city' or 'forest'
    this.zTracker = 0;

    // Build Initial 3 Chunks
    for (let i = -1; i <= 2; i++) {
      this.spawnChunk(i * this.chunkSize);
    }
  }

  spawnChunk(zPos) {
    let group = new THREE.Group();
    group.position.z = zPos;

    let isCity = Math.abs(zPos) % 1000 < 500;
    this.activeZone = isCity ? 'city' : 'forest';

    // Ground Plane
    let groundColor = isCity ? 0x1e293b : 0x14532d;
    let groundGeo = new THREE.PlaneGeometry(300, this.chunkSize);
    let groundMat = new THREE.MeshStandardMaterial({ color: groundColor, roughness: 0.8 });
    let groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI * 0.5;
    groundMesh.position.y = -0.1;
    group.add(groundMesh);

    if (isCity) {
      // 🏙️ City Chunk: Asphalt Road, Crosswalks & Skyscrapers
      let roadGeo = new THREE.PlaneGeometry(60, this.chunkSize);
      let roadMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
      let roadMesh = new THREE.Mesh(roadGeo, roadMat);
      roadMesh.rotation.x = -Math.PI * 0.5;
      roadMesh.position.y = 0.05;
      group.add(roadMesh);

      // Skyscrapers on sides
      for (let side of [-85, 85]) {
        for (let z = -this.chunkSize * 0.4; z <= this.chunkSize * 0.4; z += 65) {
          let bHeight = Math.random() * 80 + 35;
          let bGeo = new THREE.BoxGeometry(45, bHeight, 45);
          let bMat = new THREE.MeshStandardMaterial({
            color: Math.random() > 0.5 ? 0x38bdf8 : 0x475569,
            roughness: 0.3,
            metalness: 0.7
          });
          let bMesh = new THREE.Mesh(bGeo, bMat);
          bMesh.position.set(side, bHeight * 0.5, z);
          bMesh.name = 'building';
          group.add(bMesh);
        }
      }
    } else {
      // 🌲 Forest Chunk: Pine Trees & Boulders
      for (let side of [-90, -40, 40, 90]) {
        for (let z = -this.chunkSize * 0.4; z <= this.chunkSize * 0.4; z += 40) {
          if (Math.random() > 0.3) {
            let tree = this.createTreeMesh();
            tree.position.set(side + (Math.random() * 20 - 10), 0, z);
            tree.name = 'tree';
            group.add(tree);
          }
        }
      }
    }

    this.scene.add(group);
    this.chunks.push({ group, zPos, isCity });
  }

  createTreeMesh() {
    let tree = new THREE.Group();
    let trunkGeo = new THREE.CylinderGeometry(0.8, 1.2, 8, 8);
    let trunkMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.9 });
    let trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 4;
    tree.add(trunk);

    let leavesGeo = new THREE.ConeGeometry(5, 12, 8);
    let leavesMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 });
    let leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.y = 12;
    tree.add(leaves);

    return tree;
  }

  update(carZ) {
    // Stream chunks continuously as car moves forward/backward
    for (let i = this.chunks.length - 1; i >= 0; i--) {
      let chunk = this.chunks[i];
      if (chunk.zPos < carZ - this.chunkSize * 2) {
        this.scene.remove(chunk.group);
        this.chunks.splice(i, 1);

        let newZ = carZ + this.chunkSize * 2;
        this.spawnChunk(newZ);
      }
    }
  }
}
