/**
 * 3D Procedural Owl & Tree Perch Geometry Builder for Three.js
 */

function create3DOwlGroup() {
  let owlGroup = new THREE.Group();

  // Materials
  let featherMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.6,
    metalness: 0.2,
    flatShading: true
  });

  let whiteFeatherMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.4
  });

  let goldEyeMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xeab308,
    emissiveIntensity: 0.8,
    roughness: 0.1
  });

  let pupilMat = new THREE.MeshBasicMaterial({ color: 0x020617 });
  let beakMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });

  // 1. 3D Body Egg
  let bodyGeo = new THREE.SphereGeometry(14, 32, 32);
  bodyGeo.scale(1.0, 1.3, 0.9);
  let bodyMesh = new THREE.Mesh(bodyGeo, featherMat);
  bodyMesh.position.y = 12;
  owlGroup.add(bodyMesh);

  // White Breast Patch
  let breastGeo = new THREE.SphereGeometry(10, 24, 24);
  breastGeo.scale(0.85, 1.1, 0.5);
  let breastMesh = new THREE.Mesh(breastGeo, whiteFeatherMat);
  breastMesh.position.set(0, 11, 7);
  owlGroup.add(breastMesh);

  // Wings
  let wingGeo = new THREE.ConeGeometry(8, 26, 16);
  let leftWing = new THREE.Mesh(wingGeo, featherMat);
  leftWing.rotation.z = 0.3;
  leftWing.rotation.x = 0.2;
  leftWing.position.set(-13, 12, -2);
  owlGroup.add(leftWing);

  let rightWing = new THREE.Mesh(wingGeo, featherMat);
  rightWing.rotation.z = -0.3;
  rightWing.rotation.x = 0.2;
  rightWing.position.set(13, 12, -2);
  owlGroup.add(rightWing);

  // 2. 3D Head Group (Rotates and Nod dynamically)
  let headGroup = new THREE.Group();
  headGroup.position.set(0, 28, 0);

  let headGeo = new THREE.SphereGeometry(12, 32, 32);
  headGeo.scale(1.1, 1.0, 0.95);
  let headMesh = new THREE.Mesh(headGeo, featherMat);
  headGroup.add(headMesh);

  // Ear Tufts (Plumicorns)
  let tuftGeo = new THREE.ConeGeometry(3.5, 12, 12);

  let leftTuft = new THREE.Mesh(tuftGeo, featherMat);
  leftTuft.position.set(-8, 14, 0);
  leftTuft.rotation.z = -0.35;
  headGroup.add(leftTuft);

  let rightTuft = new THREE.Mesh(tuftGeo, featherMat);
  rightTuft.position.set(8, 14, 0);
  rightTuft.rotation.z = 0.35;
  headGroup.add(rightTuft);

  // Facial Mask Disk
  let maskGeo = new THREE.CylinderGeometry(10, 10, 1, 32);
  maskGeo.rotateX(Math.PI * 0.5);
  let leftMask = new THREE.Mesh(maskGeo, whiteFeatherMat);
  leftMask.position.set(-5.5, 0, 7.5);
  headGroup.add(leftMask);

  let rightMask = new THREE.Mesh(maskGeo, whiteFeatherMat);
  rightMask.position.set(5.5, 0, 7.5);
  headGroup.add(rightMask);

  // 3D Glowing Eyes
  let eyeGeo = new THREE.SphereGeometry(4.2, 24, 24);
  let pupilGeo = new THREE.SphereGeometry(2.2, 16, 16);

  let leftEye = new THREE.Mesh(eyeGeo, goldEyeMat);
  leftEye.position.set(-5.5, 0, 8.8);
  headGroup.add(leftEye);

  let leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
  leftPupil.position.set(-5.5, 0, 11.2);
  headGroup.add(leftPupil);

  let rightEye = new THREE.Mesh(eyeGeo, goldEyeMat);
  rightEye.position.set(5.5, 0, 8.8);
  headGroup.add(rightEye);

  let rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
  rightPupil.position.set(5.5, 0, 11.2);
  headGroup.add(rightPupil);

  // 3D Beak
  let beakGeo = new THREE.ConeGeometry(2.5, 9, 16);
  beakGeo.rotateX(Math.PI * 0.6);
  let beakMesh = new THREE.Mesh(beakGeo, beakMat);
  beakMesh.position.set(0, -3.5, 10);
  headGroup.add(beakMesh);

  owlGroup.add(headGroup);

  return { owlGroup, headGroup, goldEyeMat, leftPupil, rightPupil };
}

// Generate 3D Tree Perch Branch & Trunk
function create3DTreePerch() {
  let treeGroup = new THREE.Group();

  let barkMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.8,
    flatShading: true
  });

  let leafMat = new THREE.MeshStandardMaterial({
    color: 0x164e63,
    roughness: 0.5,
    emissive: 0x083344,
    emissiveIntensity: 0.3
  });

  // Main Trunk
  let trunkGeo = new THREE.CylinderGeometry(14, 18, 160, 24);
  let trunkMesh = new THREE.Mesh(trunkGeo, barkMat);
  trunkMesh.position.set(-60, -70, -30);
  trunkMesh.rotation.z = -0.15;
  treeGroup.add(trunkMesh);

  // Perch Branch (where Owl sits)
  let branchGeo = new THREE.CylinderGeometry(5.5, 8.5, 140, 20);
  branchGeo.rotateZ(Math.PI * 0.5);
  let branchMesh = new THREE.Mesh(branchGeo, barkMat);
  branchMesh.position.set(0, -2, -5);
  treeGroup.add(branchMesh);

  // Foliage Clusters
  for (let i = 0; i < 6; i++) {
    let leafGeo = new THREE.DodecahedronGeometry(12 + Math.random() * 8, 1);
    let leafMesh = new THREE.Mesh(leafGeo, leafMat);
    leafMesh.position.set(-80 + i * 30, 20 + Math.random() * 20, -40 + Math.random() * 20);
    treeGroup.add(leafMesh);
  }

  return treeGroup;
}
