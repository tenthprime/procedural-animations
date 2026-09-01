/**
 * Vehicle Models & Multi-Lane Traffic Physics Engine for Real-World City
 */

class Vehicle {
  constructor(laneX, startZ, dir, speed, type = 'sedan') {
    this.laneX = laneX;
    this.dir = dir; // 1 (southbound) or -1 (northbound)
    this.speed = speed;
    this.type = type;

    this.mesh = this.createVehicleMesh(type);
    this.mesh.position.set(laneX, 1.8, startZ);
    if (dir === -1) {
      this.mesh.rotation.y = Math.PI;
    }

    this.headlights = [];
    this.taillights = [];
    this.attachLights();
  }

  createVehicleMesh(type) {
    let group = new THREE.Group();

    let carColors = [0xef4444, 0x3b82f6, 0x10b981, 0x64748b, 0xf8fafc, 0x0f172a, 0xeab308];
    let bodyColor = type === 'taxi' ? 0xeab308 : carColors[Math.floor(Math.random() * carColors.length)];

    let bodyMat = new THREE.MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.2,
      metalness: 0.8
    });

    let glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.8
    });

    let wheelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8
    });

    if (type === 'truck') {
      // Delivery Truck
      let cabinGeo = new THREE.BoxGeometry(6, 4.5, 5);
      let cabinMesh = new THREE.Mesh(cabinGeo, bodyMat);
      cabinMesh.position.set(0, 0.5, 3);
      group.add(cabinMesh);

      let cargoGeo = new THREE.BoxGeometry(6.2, 6, 12);
      let cargoMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
      let cargoMesh = new THREE.Mesh(cargoGeo, cargoMat);
      cargoMesh.position.set(0, 1.2, -4);
      group.add(cargoMesh);
    } else {
      // Sedan / Sports Car / Taxi
      let bodyGeo = new THREE.BoxGeometry(5.2, 2.2, 10);
      let bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(bodyMesh);

      let cabinGeo = new THREE.BoxGeometry(4.6, 1.8, 5.2);
      let cabinMesh = new THREE.Mesh(cabinGeo, glassMat);
      cabinMesh.position.set(0, 1.6, -0.5);
      group.add(cabinMesh);

      // Taxi Sign Roof Light
      if (type === 'taxi') {
        let signGeo = new THREE.BoxGeometry(2, 0.8, 1);
        let signMat = new THREE.MeshBasicMaterial({ color: 0xfff000 });
        let signMesh = new THREE.Mesh(signGeo, signMat);
        signMesh.position.set(0, 2.8, -0.5);
        group.add(signMesh);
      }
    }

    // 4 Wheels
    let wheelGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.8, 16);
    wheelGeo.rotateZ(Math.PI * 0.5);

    let wheelPositions = [
      [-2.8, -0.6, 3], [2.8, -0.6, 3],
      [-2.8, -0.6, -3], [2.8, -0.6, -3]
    ];

    for (let pos of wheelPositions) {
      let wMesh = new THREE.Mesh(wheelGeo, wheelMat);
      wMesh.position.set(pos[0], pos[1], pos[2]);
      group.add(wMesh);
    }

    return group;
  }

  attachLights() {
    let lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    let redMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    // Front LED Headlights
    for (let side of [-1.8, 1.8]) {
      let hMesh = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), lightMat);
      hMesh.position.set(side, 0, 5.1);
      this.mesh.add(hMesh);

      let pLight = new THREE.PointLight(0xfff5ea, 1.5, 30);
      pLight.position.set(side, 0, 5.3);
      pLight.name = 'carheadlight';
      this.mesh.add(pLight);
      this.headlights.push(pLight);
    }

    // Rear Red Taillights
    for (let side of [-1.8, 1.8]) {
      let tMesh = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), redMat);
      tMesh.position.set(side, 0, -5.1);
      this.mesh.add(tMesh);

      let pLight = new THREE.PointLight(0xff0000, 1.0, 15);
      pLight.position.set(side, 0, -5.3);
      pLight.name = 'cartaillight';
      this.mesh.add(pLight);
      this.taillights.push(pLight);
    }
  }

  update(speedMult = 1.0) {
    this.mesh.position.z += this.dir * this.speed * speedMult;

    if (this.dir === 1 && this.mesh.position.z > 280) {
      this.mesh.position.z = -280;
    } else if (this.dir === -1 && this.mesh.position.z < -280) {
      this.mesh.position.z = 280;
    }
  }
}

class TrafficManager {
  constructor(scene) {
    this.scene = scene;
    this.vehicles = [];
    this.lanes = [-20, -10, 10, 20];
    this.initTraffic(40);
  }

  initTraffic(count) {
    for (let v of this.vehicles) {
      this.scene.remove(v.mesh);
    }
    this.vehicles = [];

    let types = ['sedan', 'taxi', 'sports', 'truck'];

    for (let i = 0; i < count; i++) {
      let lane = this.lanes[i % this.lanes.length];
      let dir = lane > 0 ? 1 : -1;
      let startZ = (Math.random() * 540) - 270;
      let speed = Math.random() * 0.6 + 0.8;
      let type = types[Math.floor(Math.random() * types.length)];

      let v = new Vehicle(lane, startZ, dir, speed, type);
      this.vehicles.push(v);
      this.scene.add(v.mesh);
    }
  }

  update(speedMult = 1.0) {
    for (let v of this.vehicles) {
      v.update(speedMult);
    }
  }

  toggleLights(enableHeadlights) {
    for (let v of this.vehicles) {
      for (let hl of v.headlights) hl.visible = enableHeadlights;
      for (let tl of v.taillights) tl.visible = enableHeadlights;
    }
  }
}
