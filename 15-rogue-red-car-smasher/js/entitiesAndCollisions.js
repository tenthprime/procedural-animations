/**
 * Entity Spawner & Collision Physics Engine
 * Spawns Pedestrians, Animals, Traffic Cars & Handles Ragdoll Impact Knockbacks.
 */

class EntityCollisionManager {
  constructor(scene) {
    this.scene = scene;
    this.entities = [];
    this.sparks = [];
    this.score = 0;
    this.combo = 1;
    this.initEntities(50);
  }

  initEntities(count) {
    // Clear existing
    for (let e of this.entities) this.scene.remove(e.mesh);
    this.entities = [];

    let types = ['pedestrian', 'animal', 'trafficCar'];

    for (let i = 0; i < count; i++) {
      let type = types[Math.floor(Math.random() * types.length)];
      let posX = (Math.random() * 80) - 40;
      let posZ = (Math.random() * 600) - 100;

      let e = this.createEntity(type, posX, posZ);
      this.entities.push(e);
      this.scene.add(e.mesh);
    }
  }

  createEntity(type, x, z) {
    let group = new THREE.Group();
    group.position.set(x, 1.2, z);

    if (type === 'pedestrian') {
      // Pedestrian Human Mesh
      let bodyGeo = new THREE.CylinderGeometry(0.6, 0.6, 3.2, 8);
      let bodyMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.6 });
      let body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.6;
      group.add(body);

      let headGeo = new THREE.SphereGeometry(0.8, 12, 12);
      let headMat = new THREE.MeshStandardMaterial({ color: 0xfef08a });
      let head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 3.6;
      group.add(head);
    } else if (type === 'animal') {
      // Wildlife Animal (Deer / Wolf) Mesh
      let bodyGeo = new THREE.BoxGeometry(1.6, 1.8, 3.2);
      let bodyMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.8 });
      let body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.4;
      group.add(body);

      let headGeo = new THREE.BoxGeometry(1.2, 1.2, 1.4);
      let head = new THREE.Mesh(headGeo, bodyMat);
      head.position.set(0, 2.4, 1.8);
      group.add(head);
    } else {
      // Traffic Vehicle Mesh
      let bodyGeo = new THREE.BoxGeometry(4.2, 2.0, 8.0);
      let bodyMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3, metalness: 0.7 });
      let body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.0;
      group.add(body);
    }

    return {
      type,
      mesh: group,
      vel: new THREE.Vector3(0, 0, 0),
      hit: false
    };
  }

  update(car) {
    let carBox = new THREE.Box3().setFromObject(car.mesh);

    for (let i = this.entities.length - 1; i >= 0; i--) {
      let e = this.entities[i];

      // Ragdoll Knockback Movement after being smashed!
      if (e.hit) {
        e.mesh.position.add(e.vel);
        e.mesh.rotation.x += 0.2;
        e.mesh.rotation.y += 0.3;
        e.vel.y -= 0.15; // Gravity acceleration

        if (e.mesh.position.y < -20) {
          this.scene.remove(e.mesh);
          this.entities.splice(i, 1);
          // Respawn entity further ahead
          let newE = this.createEntity(e.type, (Math.random() * 80) - 40, car.position.z + 400);
          this.entities.push(newE);
          this.scene.add(newE.mesh);
        }
        continue;
      }

      // Check Collision with Rogue Red Car
      let eBox = new THREE.Box3().setFromObject(e.mesh);
      if (carBox.intersectsBox(eBox)) {
        // SMASH IMPACT!
        e.hit = true;
        this.score += 100 * this.combo;
        this.combo++;

        // Ragdoll Impulse Force vector
        let impactDir = e.mesh.position.clone().sub(car.position).normalize();
        e.vel.set(impactDir.x * 2.5, 3.5, impactDir.z * 2.5);

        // Apply Dent Deformation to Rogue Red Car
        car.applyImpactDent(e.mesh.position, 1.4);

        // Emit Spark Particle Burst
        this.spawnSparks(e.mesh.position);

        // Update HUD
        document.getElementById('hud-score').innerText = this.score;
        document.getElementById('hud-combo').innerText = this.combo + 'x';
      }
    }

    // Update Spark Particles
    this.updateSparks();
  }

  spawnSparks(pos) {
    let mat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

    for (let i = 0; i < 16; i++) {
      let pMesh = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6), mat);
      pMesh.position.copy(pos);
      let vel = new THREE.Vector3(
        (Math.random() - 0.5) * 4.0,
        Math.random() * 4.0 + 1.0,
        (Math.random() - 0.5) * 4.0
      );
      this.sparks.push({ mesh: pMesh, vel, life: 1.0 });
      this.scene.add(pMesh);
    }
  }

  updateSparks() {
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      let s = this.sparks[i];
      s.mesh.position.add(s.vel);
      s.life -= 0.05;

      if (s.life <= 0) {
        this.scene.remove(s.mesh);
        this.sparks.splice(i, 1);
      }
    }
  }
}
