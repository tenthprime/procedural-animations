/**
 * 3D Procedural Infinite Forest Engine
 * Handles dynamic Z-chunking, tree generation, bioluminescent foliage, and fog fading.
 */

class ProceduralTree {
  constructor(x, y, z) {
    this.pos = createVector(x, y, z);
    this.height = random(180, 340);
    this.trunkRadius = random(8, 16);
    this.seed = random(1000);
    this.branches = [];

    // Generate branch hierarchy
    let numLevels = floor(random(3, 6));
    for (let i = 0; i < numLevels; i++) {
      let bHeight = map(i, 0, numLevels, this.height * 0.3, this.height * 0.9);
      let angle = random(TWO_PI);
      let len = random(40, 90) * (1 - i / numLevels);
      this.branches.push({
        y: bHeight,
        angle: angle,
        length: len,
        clusterSize: random(25, 45)
      });
    }
  }

  display(camZ, fogDist, time, theme, enableSway = true) {
    let relZ = this.pos.z - camZ;
    if (relZ > 200 || relZ < -fogDist) return; // Cull trees outside fog camera view

    // Depth fog fading alpha calculation
    let distAlpha = map(abs(relZ), 0, fogDist, 1.0, 0.0);
    if (distAlpha <= 0) return;

    push();
    translate(this.pos.x, this.pos.y, this.pos.z);

    // 1. Render Trunk Column
    noStroke();
    let tCol = theme.trunk;
    fill(tCol[0], tCol[1], tCol[2], 255 * distAlpha);

    push();
    translate(0, -this.height * 0.5, 0);
    cylinder(this.trunkRadius, this.height);
    pop();

    // 2. Render Swaying Bioluminescent Branches & Foliage Orbs
    let sway = enableSway ? sin(time * 2.0 + this.seed) * 8 : 0;

    for (let b of this.branches) {
      push();
      translate(0, -b.y, 0);
      rotateY(b.angle + sway * 0.02);

      // Branch arm
      fill(tCol[0], tCol[1], tCol[2], 200 * distAlpha);
      push();
      translate(b.length * 0.5, 0, 0);
      rotateZ(HALF_PI);
      cylinder(this.trunkRadius * 0.5, b.length);
      pop();

      // Glowing Foliage Canopy Cluster
      let fCol = theme.foliage;
      fill(fCol[0], fCol[1], fCol[2], 180 * distAlpha);
      push();
      translate(b.length, -10 + sway * 0.5, 0);
      sphere(b.clusterSize);

      // Inner glowing core
      fill(255, 255, 255, 220 * distAlpha);
      sphere(b.clusterSize * 0.4);
      pop();

      pop();
    }

    pop();
  }
}
