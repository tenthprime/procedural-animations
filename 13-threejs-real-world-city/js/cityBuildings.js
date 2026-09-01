/**
 * Procedural Skyscraper & Road Network Mesh Generator for Real-World City
 */

function createCityEnvironment(scene) {
  let group = new THREE.Group();

  // Textures
  let roadTex = createRoadTexture();
  roadTex.repeat.set(1, 16);

  let glassTex = createBuildingTexture('glass');
  glassTex.repeat.set(2, 8);

  let brickTex = createBuildingTexture('brick');
  brickTex.repeat.set(2, 6);

  let concreteTex = createBuildingTexture('concrete');
  concreteTex.repeat.set(2, 10);

  let sidewalkTex = createSidewalkTexture();
  sidewalkTex.repeat.set(8, 8);

  // 1. Ground & Sidewalk Base
  let groundGeo = new THREE.PlaneGeometry(600, 600);
  let groundMat = new THREE.MeshStandardMaterial({
    map: sidewalkTex,
    roughness: 0.8,
    metalness: 0.1
  });
  let groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.rotation.x = -Math.PI * 0.5;
  groundMesh.position.y = -0.1;
  groundMesh.receiveShadow = true;
  group.add(groundMesh);

  // 2. Main Avenue & Cross Streets Road Network
  let roadMat = new THREE.MeshStandardMaterial({
    map: roadTex,
    roughness: 0.4, // Slightly wet asphalt gloss
    metalness: 0.1
  });

  // Main Boulevard Avenue (North-South)
  let mainRoadGeo = new THREE.PlaneGeometry(60, 600);
  let mainRoadMesh = new THREE.Mesh(mainRoadGeo, roadMat);
  mainRoadMesh.rotation.x = -Math.PI * 0.5;
  mainRoadMesh.position.y = 0.05;
  mainRoadMesh.receiveShadow = true;
  group.add(mainRoadMesh);

  // Cross Street (East-West)
  let crossRoadGeo = new THREE.PlaneGeometry(600, 60);
  let crossRoadMesh = new THREE.Mesh(crossRoadGeo, roadMat);
  crossRoadMesh.rotation.x = -Math.PI * 0.5;
  crossRoadMesh.position.y = 0.06;
  crossRoadMesh.receiveShadow = true;
  group.add(crossRoadMesh);

  // 3. Skyscraper City Blocks
  let buildingCount = 0;

  // Grid layout of 4 quadrants around the main avenue intersection
  let quadOffsets = [
    { minX: -260, maxX: -40, minZ: -260, maxZ: -40 },
    { minX: 40, maxX: 260, minZ: -260, maxZ: -40 },
    { minX: -260, maxX: -40, minZ: 40, maxZ: 260 },
    { minX: 40, maxX: 260, minZ: 40, maxZ: 260 }
  ];

  let buildingMaterials = [
    new THREE.MeshStandardMaterial({ map: glassTex, roughness: 0.2, metalness: 0.8 }),
    new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.7, metalness: 0.1 }),
    new THREE.MeshStandardMaterial({ map: concreteTex, roughness: 0.5, metalness: 0.3 })
  ];

  for (let quad of quadOffsets) {
    for (let x = quad.minX + 30; x <= quad.maxX - 30; x += 65) {
      for (let z = quad.minZ + 30; z <= quad.maxZ - 30; z += 65) {
        let bHeight = Math.random() * 90 + 40; // 40m to 130m tall skyscrapers
        let bWidth = Math.random() * 15 + 35;
        let bDepth = Math.random() * 15 + 35;

        let bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
        let mat = buildingMaterials[Math.floor(Math.random() * buildingMaterials.length)];

        let bMesh = new THREE.Mesh(bGeo, mat);
        bMesh.position.set(x, bHeight * 0.5, z);
        bMesh.castShadow = true;
        bMesh.receiveShadow = true;
        group.add(bMesh);

        // Roof Helipad / Air Conditioner units on tall towers
        if (bHeight > 80) {
          let roofGeo = new THREE.BoxGeometry(bWidth * 0.4, 4, bDepth * 0.4);
          let roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
          let roofMesh = new THREE.Mesh(roofGeo, roofMat);
          roofMesh.position.set(x, bHeight + 2, z);
          group.add(roofMesh);
        }

        buildingCount++;
      }
    }
  }

  // 4. Street Lamps along the Avenue
  let streetLampGroup = new THREE.Group();
  let lampMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
  let bulbMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });

  for (let z = -250; z <= 250; z += 50) {
    for (let side of [-33, 33]) {
      // Pole
      let poleGeo = new THREE.CylinderGeometry(0.5, 0.7, 18, 12);
      let poleMesh = new THREE.Mesh(poleGeo, lampMat);
      poleMesh.position.set(side, 9, z);
      streetLampGroup.add(poleMesh);

      // Bulb Light Fixture
      let bulbGeo = new THREE.SphereGeometry(1.5, 12, 12);
      let bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
      bulbMesh.position.set(side, 18, z);
      streetLampGroup.add(bulbMesh);

      // Point Light
      let pLight = new THREE.PointLight(0xffedd5, 1.2, 45);
      pLight.position.set(side, 17, z);
      pLight.name = 'streetlamp';
      streetLampGroup.add(pLight);
    }
  }
  group.add(streetLampGroup);

  scene.add(group);
  return buildingCount;
}
