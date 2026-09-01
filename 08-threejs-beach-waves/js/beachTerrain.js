/**
 * Procedural Sandy Beach Slope Terrain & Floating Buoy Physics
 */

// Generate 3D Sandy Beach Slope Mesh
function createSandyBeachTerrain(width = 300, depth = 200) {
  let geo = new THREE.PlaneGeometry(width, depth, 64, 64);
  geo.rotateX(-Math.PI * 0.5);

  let pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let z = pos.getZ(i);

    // Slope terrain connecting beach dunes to ocean floor
    let height = mapRange(z, -depth * 0.5, depth * 0.5, -25, 18);
    let noiseDune = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2.5;

    pos.setY(i, height + noiseDune);
  }

  geo.computeVertexNormals();
  return geo;
}

// Generate Floating Buoys for Wave Physics Testing
function createFloatingBuoy() {
  let group = new THREE.Group();

  let buoyMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    roughness: 0.3,
    metalness: 0.2
  });

  let stripeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3
  });

  let buoyGeo = new THREE.SphereGeometry(3.5, 24, 24);
  let buoyMesh = new THREE.Mesh(buoyGeo, buoyMat);
  group.add(buoyMesh);

  let ringGeo = new THREE.TorusGeometry(3.6, 0.6, 16, 32);
  let ringMesh = new THREE.Mesh(ringGeo, stripeMat);
  ringMesh.rotation.x = Math.PI * 0.5;
  group.add(ringMesh);

  let flagStaffGeo = new THREE.CylinderGeometry(0.3, 0.3, 10, 12);
  let flagStaffMesh = new THREE.Mesh(flagStaffGeo, stripeMat);
  flagStaffMesh.position.y = 5;
  group.add(flagStaffMesh);

  let flagGeo = new THREE.BoxGeometry(4, 2.5, 0.2);
  let flagMesh = new THREE.Mesh(flagGeo, buoyMat);
  flagMesh.position.set(2, 9, 0);
  group.add(flagMesh);

  return group;
}

function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}
