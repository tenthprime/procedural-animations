/**
 * Canvas Pixel Color Sampler Math
 * Samples average RGB colors from any HTML Canvas onto an N x N matrix grid.
 */

function sampleCanvasColors(canvasEl, gridSize) {
  let gridColors = [];
  let ctx = canvasEl.getContext('2d');

  let imgW = canvasEl.width;
  let imgH = canvasEl.height;
  let imgData = ctx.getImageData(0, 0, imgW, imgH);
  let pixels = imgData.data;

  let cellW = imgW / gridSize;
  let cellH = imgH / gridSize;

  for (let col = 0; col < gridSize; col++) {
    let colColors = [];
    for (let row = 0; row < gridSize; row++) {
      let sampleX = Math.floor((col + 0.5) * cellW);
      let sampleY = Math.floor((row + 0.5) * cellH);

      let idx = (sampleY * imgW + sampleX) * 4;
      let r = pixels[idx];
      let g = pixels[idx + 1];
      let b = pixels[idx + 2];

      if (r === undefined) { r = 245; g = 158; b = 11; }

      colColors.push(color(r, g, b));
    }
    gridColors.push(colColors);
  }

  return gridColors;
}
