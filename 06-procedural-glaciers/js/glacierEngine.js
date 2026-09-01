/**
 * 3D Procedural Glacier Engine & Geometry Generators
 */

// Generate 100% Math-Based Procedural Glacier Cliff & Iceberg Mesh
function createProceduralGlacierGeometry(width = 120, height = 45, depth = 80) {
  let geo = new THREE.BoxGeometry(width, height, depth, 64, 32, 48);
  let pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Multi-frequency noise displacement for jagged ice cliffs & crevasses
    let n1 = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 8.0;
    let n2 = Math.cos(x * 0.2 + y * 0.1) * Math.sin(z * 0.2) * 3.5;
    let n3 = Math.sin(x * 0.5) * 1.2;

    // Displace top and front cliff face
    if (y > 0) {
      pos.setY(i, y + n1 + n2);
    }
    pos.setX(i, x + n2 + n3);
    pos.setZ(i, z + n1 * 0.5);
  }

  geo.computeVertexNormals();
  return geo;
}

// Generate Floating Iceberg Crags
function createProceduralIcebergGeometry(size = 25) {
  let geo = new THREE.DodecahedronGeometry(size, 3);
  let pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    let n = Math.sin(x * 0.15) * Math.cos(y * 0.2) * Math.sin(z * 0.15) * 5.0;
    pos.setX(i, x + n);
    pos.setY(i, y + n * 0.8);
    pos.setZ(i, z + n);
  }

  geo.computeVertexNormals();
  return geo;
}

// Blizzard Snow Particle System
function createBlizzardParticles(count = 2000) {
  let geo = new THREE.BufferGeometry();
  let positions = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 400;
    positions[i + 1] = Math.random() * 150;
    positions[i + 2] = (Math.random() - 0.5) * 400;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  let mat = new THREE.PointsMaterial({
    color: 0xe0f2fe,
    size: 1.2,
    transparent: true,
    opacity: 0.8
  });

  return new THREE.Points(geo, mat);
}
