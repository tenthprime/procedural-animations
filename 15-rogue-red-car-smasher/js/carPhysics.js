/**
 * Rogue Red Car Vehicle Physics & Mesh Dent Deformation Engine
 * Features Responsive Steering, Turbo Acceleration & Impact Dent Mechanics.
 */

class RogueRedCar {
  constructor(scene) {
    this.scene = scene;
    this.position = new THREE.Vector3(0, 1.2, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.heading = 0; // Orientation angle
    this.speed = 1.2; // Base driving speed
    this.maxSpeed = 2.5; // Top turbo speed
    this.accel = 0.05;
    this.friction = 0.98;
    this.turnSpeed = 0.055;
    this.dentCount = 0;

    this.mesh = this.buildCarMesh();
    this.scene.add(this.mesh);

    // Save original vertex positions for dent calculation & repair
    this.bodyMesh = this.mesh.getObjectByName('carBodyMesh');
    if (this.bodyMesh) {
      let posAttr = this.bodyMesh.geometry.attributes.position;
      this.originalVertices = posAttr.array.slice();
    }
  }

  buildCarMesh() {
    let group = new THREE.Group();

    // Red Metallic Body Paint
    let bodyMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.15,
      metalness: 0.85,
      name: 'carPaint'
    });

    // Dark Tinted Glass
    let glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.8
    });

    // 1. Car Body Box (Subdivided for Dent Deformation Vertex Physics)
    let bodyGeo = new THREE.BoxGeometry(4.8, 1.8, 9.6, 8, 4, 12);
    let bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.name = 'carBodyMesh';
    bodyMesh.position.y = 0.6;
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    // 2. Muscle Car Roof Cabin
    let cabinGeo = new THREE.BoxGeometry(4.2, 1.5, 5.0);
    let cabinMesh = new THREE.Mesh(cabinGeo, glassMat);
    cabinMesh.position.set(0, 2.0, -0.6);
    cabinMesh.castShadow = true;
    group.add(cabinMesh);

    // 3. Engine Hood Scoop
    let scoopGeo = new THREE.BoxGeometry(2.0, 0.5, 3.0);
    let scoopMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
    let scoopMesh = new THREE.Mesh(scoopGeo, scoopMat);
    scoopMesh.position.set(0, 1.6, 2.0);
    group.add(scoopMesh);

    // 4. Wheels
    let wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    let wheelGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.7, 16);
    wheelGeo.rotateZ(Math.PI * 0.5);

    let wheelPositions = [
      [-2.6, 0.4, 2.8], [2.6, 0.4, 2.8],
      [-2.6, 0.4, -2.8], [2.6, 0.4, -2.8]
    ];

    for (let pos of wheelPositions) {
      let wMesh = new THREE.Mesh(wheelGeo, wheelMat);
      wMesh.position.set(pos[0], pos[1], pos[2]);
      group.add(wMesh);
    }

    // 5. Twin Front Headlights (Spotlights)
    let lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let side of [-1.6, 1.6]) {
      let hMesh = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), lightMat);
      hMesh.position.set(side, 0.8, 4.9);
      group.add(hMesh);
    }

    return group;
  }

  update(keys) {
    // Responsive Acceleration & Brakes
    if (keys.up || keys.w || keys.gas) {
      this.speed = Math.min(this.speed + this.accel, this.maxSpeed);
    } else if (keys.down || keys.s) {
      this.speed = Math.max(this.speed - this.accel * 2, -1.0);
    } else {
      // Auto-cruise forward base speed in smasher mode
      if (this.speed < 1.2) this.speed += 0.02;
      this.speed *= this.friction;
    }

    // Responsive Steering
    let turnMult = this.speed >= 0 ? 1 : -1;
    if (keys.left || keys.a) {
      this.heading += this.turnSpeed * turnMult;
    }
    if (keys.right || keys.d) {
      this.heading -= this.turnSpeed * turnMult;
    }

    // Vehicle Movement Vector
    this.mesh.rotation.y = this.heading;
    this.position.x += Math.sin(this.heading) * this.speed;
    this.position.z += Math.cos(this.heading) * this.speed;
    this.mesh.position.copy(this.position);
  }

  // Visual Mesh Dent Physics (Pushes vertices inward upon impact)
  applyImpactDent(hitPoint, impactForce = 1.2) {
    if (!this.bodyMesh) return;

    this.dentCount++;
    let posAttr = this.bodyMesh.geometry.attributes.position;
    let localHit = this.bodyMesh.worldToLocal(hitPoint.clone());

    let radius = 2.5;
    for (let i = 0; i < posAttr.count; i++) {
      let vx = posAttr.getX(i);
      let vy = posAttr.getY(i);
      let vz = posAttr.getZ(i);
      let v = new THREE.Vector3(vx, vy, vz);

      let dist = v.distanceTo(localHit);
      if (dist < radius) {
        let pushAmount = (radius - dist) * 0.25 * impactForce;
        let dir = v.clone().sub(localHit).normalize().negate();

        posAttr.setXYZ(i, vx + dir.x * pushAmount, vy + dir.y * pushAmount, vz + dir.z * pushAmount);
      }
    }

    posAttr.needsUpdate = true;
    this.bodyMesh.geometry.computeVertexNormals();

    // Update Dent Status HUD
    let statusText = 'Pristine';
    if (this.dentCount > 25) statusText = '💥 Totaled (Invincible)';
    else if (this.dentCount > 12) statusText = '🔨 Heavily Dented';
    else if (this.dentCount > 3) statusText = '⚡ Light Dents';

    document.getElementById('val-dent').innerText = statusText;
  }

  // Repair Dents back to original geometry
  repairDents() {
    if (!this.bodyMesh || !this.originalVertices) return;

    let posAttr = this.bodyMesh.geometry.attributes.position;
    for (let i = 0; i < posAttr.count * 3; i++) {
      posAttr.array[i] = this.originalVertices[i];
    }
    posAttr.needsUpdate = true;
    this.bodyMesh.geometry.computeVertexNormals();
    this.dentCount = 0;
    document.getElementById('val-dent').innerText = 'Pristine';
  }
}
