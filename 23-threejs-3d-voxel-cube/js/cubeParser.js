/**
 * 3D Volumetric Multi-Layer Z-Depth Voxel Parser
 * Vanilla JS compatible without p5 dependencies.
 */

function mapVal(val, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return outMin;
  return outMin + (val - inMin) * (outMax - outMin) / (inMax - inMin);
}

function sampleVolumetricCubeData(canvasEl, gridSize, depthLayers) {
  let ctx = canvasEl.getContext('2d');
  let imgW = canvasEl.width;
  let imgH = canvasEl.height;
  let imgData = ctx.getImageData(0, 0, imgW, imgH);
  let pixels = imgData.data;

  let cellW = imgW / gridSize;
  let cellH = imgH / gridSize;

  let instancesData = [];

  for (let col = 0; col < gridSize; col++) {
    for (let row = 0; row < gridSize; row++) {
      let sampleX = Math.floor((col + 0.5) * cellW);
      let sampleY = Math.floor((row + 0.5) * cellH);

      let idx = (sampleY * imgW + sampleX) * 4;
      let r = pixels[idx] !== undefined ? pixels[idx] : 255;
      let g = pixels[idx + 1] !== undefined ? pixels[idx + 1] : 255;
      let b = pixels[idx + 2] !== undefined ? pixels[idx + 2] : 255;

      let color = new THREE.Color(r / 255, g / 255, b / 255);
      let brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

      // Extrude across Z-axis layers to form a true 3D solid cube!
      for (let layer = 0; layer < depthLayers; layer++) {
        let normZ = depthLayers > 1 ? (layer / (depthLayers - 1)) - 0.5 : 0;

        // Darken deeper inner layers for rich volumetric shading
        let layerDarken = depthLayers > 1 ? mapVal(layer, 0, depthLayers - 1, 1.0, 0.4) : 1.0;
        let layerColor = color.clone().multiplyScalar(layerDarken);

        instancesData.push({
          col: col,
          row: row,
          layer: layer,
          normX: (col / (gridSize - 1)) - 0.5,
          normY: 0.5 - (row / (gridSize - 1)),
          normZ: normZ,
          color: layerColor,
          brightness: brightness
        });
      }
    }
  }

  return instancesData;
}
