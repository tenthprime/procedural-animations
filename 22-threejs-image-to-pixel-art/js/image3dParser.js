/**
 * 3D Image Pixel & Luminance Sampler for Three.js InstancedMesh Matrix
 */

function sampleImageFor3D(canvasEl, gridSize) {
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
      let r = pixels[idx] || 255;
      let g = pixels[idx + 1] || 255;
      let b = pixels[idx + 2] || 255;

      // Normalize color RGB [0, 1]
      let color = new THREE.Color(r / 255, g / 255, b / 255);

      // Luminance / Brightness calculation for 3D Extrusion Height
      let brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

      instancesData.push({
        col: col,
        row: row,
        normX: (col / (gridSize - 1)) - 0.5,
        normY: 0.5 - (row / (gridSize - 1)),
        color: color,
        brightness: brightness
      });
    }
  }

  return instancesData;
}
