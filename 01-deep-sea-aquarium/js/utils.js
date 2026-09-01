/**
 * Utility functions for inverse kinematics, vector steering, and procedural animation.
 */

// Solve distance constraint between two points (Okazz style constrain helper)
function solveDistanceConstraint(pA, pB, targetDist) {
  let delta = p5.Vector.sub(pB, pA);
  let dist = delta.mag();
  if (dist === 0) return;
  
  // Bring pB to targetDist distance relative to pA
  delta.setMag(targetDist);
  pB.set(p5.Vector.add(pA, delta));
}

// Map value smoothly with sine easing
function easeInOutSine(x) {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

// Generate organic 2D steering vector using Perlin Noise
function getNoiseSteering(pos, time, noiseScale = 0.005, force = 0.2) {
  let angle = noise(pos.x * noiseScale, pos.y * noiseScale, time * 0.5) * TWO_PI * 2;
  return p5.Vector.fromAngle(angle).mult(force);
}

// Keep a position within canvas bounds with soft boundary steering
function getBoundaryForce(pos, width, height, margin = 100, strength = 0.5) {
  let force = createVector(0, 0);
  
  if (pos.x < margin) force.x += map(pos.x, 0, margin, strength, 0);
  if (pos.x > width - margin) force.x -= map(pos.x, width - margin, width, 0, strength);
  if (pos.y < margin) force.y += map(pos.y, 0, margin, strength, 0);
  if (pos.y > height - margin) force.y -= map(pos.y, height - margin, height, 0, strength);
  
  return force;
}

// Draw a glowing circle / light aura
function drawGlow(x, y, radius, colorRgb, intensity = 1.0) {
  push();
  noStroke();
  let r = colorRgb[0], g = colorRgb[1], b = colorRgb[2];
  for (let i = radius; i > 0; i -= 4) {
    let alpha = map(i, 0, radius, 120 * intensity, 0);
    fill(r, g, b, alpha);
    ellipse(x, y, i * 2);
  }
  pop();
}
