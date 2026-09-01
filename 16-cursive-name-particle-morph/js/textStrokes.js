/**
 * Sequential Cursive Handwriting Vector Path Extractor
 * Extracts ordered sequential stroke points (letter-by-letter path) for progressive line growth.
 */

function extractSequentialCursivePath(textString, totalPoints = 1200) {
  let canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 400;
  let ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 1200, 400);

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let fontSize = Math.min(130, Math.floor(950 / (textString.length * 0.65)));
  ctx.font = `italic bold ${fontSize}px "Brush Script MT", "Dancing Script", "Caveat", "Segoe Script", cursive, sans-serif`;
  ctx.fillText(textString, 600, 200);

  let imgData = ctx.getImageData(0, 0, 1200, 400);
  let pixels = imgData.data;
  let rawPoints = [];

  let step = 3;
  for (let x = 0; x < 1200; x += step) {
    for (let y = 0; y < 400; y += step) {
      let idx = (y * 1200 + x) * 4;
      if (pixels[idx] > 120) {
        rawPoints.push({ x: x - 600, y: y - 200 });
      }
    }
  }

  if (rawPoints.length === 0) {
    for (let i = 0; i < totalPoints; i++) {
      let a = (i / totalPoints) * Math.PI * 2;
      rawPoints.push({ x: Math.cos(a) * 150, y: Math.sin(a) * 150 });
    }
  }

  // Sort points horizontally & vertically to mimic natural cursive handwriting flow
  rawPoints.sort((a, b) => a.x !== b.x ? a.x - b.x : a.y - b.y);

  // Resample evenly to match totalPoints
  let pathPoints = [];
  for (let i = 0; i < totalPoints; i++) {
    let index = Math.floor((i / totalPoints) * rawPoints.length);
    pathPoints.push(rawPoints[index]);
  }

  return pathPoints;
}
