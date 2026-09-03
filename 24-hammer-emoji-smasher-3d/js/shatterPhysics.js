/**
 * 3D Mesh Object Fracture Shattering Physics & Spark Particle Engine
 */

class ShatterPhysicsEngine {
  constructor(scene) {
    this.scene = scene;
    this.activeDebris = [];
    this.sparkParticles = [];
  }

  shatterTargetMesh(targetMesh, hitPoint, shatterForceMult = 1.5) {
    let position = targetMesh.position.clone();
    let bgHex = targetMesh.userData.bgHex || "#f59e0b";
    let material = targetMesh.material.clone();

    // Create 35+ physical 3D polygon debris fragments
    let fragmentCount = 35;
    for (let i = 0; i < fragmentCount; i++) {
      let fragSize = Math.random() * 8 + 4;
      let geometry = new THREE.TetrahedronGeometry(fragSize);

      let fragment = new THREE.Mesh(geometry, material);
      fragment.position.copy(position);

      // Random explosion velocity vector pushing away from hit point
      let dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2.0,
        Math.random() * 1.5 + 0.5,
        (Math.random() - 0.5) * 2.0
      ).normalize();

      let speed = (Math.random() * 12 + 6) * shatterForceMult;
      let velocity = dir.clone().multiplyScalar(speed);

      fragment.userData = {
        velocity: velocity,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.4
        ),
        life: 1.0,
        decay: Math.random() * 0.02 + 0.015
      };

      this.scene.add(fragment);
      this.activeDebris.push(fragment);
    }

    // Spark particles explosion
    this.createSparks(hitPoint);
  }

  createSparks(point, count = 25) {
    let pGeometry = new THREE.BufferGeometry();
    let pPositions = [];
    let pVelocities = [];

    for (let i = 0; i < count; i++) {
      pPositions.push(point.x, point.y, point.z);
      pVelocities.push(
        (Math.random() - 0.5) * 15,
        Math.random() * 12 + 4,
        (Math.random() - 0.5) * 15
      );
    }

    pGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pPositions, 3));
    let pMaterial = new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 4,
      transparent: true,
      opacity: 1.0
    });

    let particleSystem = new THREE.Points(pGeometry, pMaterial);
    particleSystem.userData = { velocities: pVelocities, life: 1.0 };

    this.scene.add(particleSystem);
    this.sparkParticles.push(particleSystem);
  }

  update(delta) {
    // 1. Update 3D Debris Polygon Fragments (Gravity & Spin)
    for (let i = this.activeDebris.length - 1; i >= 0; i--) {
      let frag = this.activeDebris[i];
      let data = frag.userData;

      data.velocity.y -= 0.38; // Gravity acceleration
      frag.position.add(data.velocity);

      frag.rotation.x += data.rotSpeed.x;
      frag.rotation.y += data.rotSpeed.y;
      frag.rotation.z += data.rotSpeed.z;

      data.life -= data.decay;
      frag.scale.multiplyScalar(0.96);

      if (data.life <= 0 || frag.position.y < -200) {
        this.scene.remove(frag);
        frag.geometry.dispose();
        this.activeDebris.splice(i, 1);
      }
    }

    // 2. Update Spark Particles
    for (let i = this.sparkParticles.length - 1; i >= 0; i--) {
      let pSys = this.sparkParticles[i];
      let posAttr = pSys.geometry.attributes.position;
      let vels = pSys.userData.velocities;

      for (let j = 0; j < vels.length / 3; j++) {
        let idx = j * 3;
        vels[idx + 1] -= 0.5; // Gravity
        posAttr.array[idx] += vels[idx] * delta;
        posAttr.array[idx + 1] += vels[idx + 1] * delta;
        posAttr.array[idx + 2] += vels[idx + 2] * delta;
      }
      posAttr.needsUpdate = true;

      pSys.userData.life -= delta * 2.0;
      pSys.material.opacity = pSys.userData.life;

      if (pSys.userData.life <= 0) {
        this.scene.remove(pSys);
        pSys.geometry.dispose();
        pSys.material.dispose();
        this.sparkParticles.splice(i, 1);
      }
    }
  }
}
