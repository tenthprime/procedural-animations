/**
 * Map Image Pixel Parser & Procedural Map Layout Generators
 * Analyzes RGB color channels of user uploaded or sample 2D map images.
 */

class MapImageParser {
  constructor() {
    this.gridWidth = 64;
    this.gridHeight = 64;
  }

  // Parse Image or Canvas Element into 2D Grid Matrix
  parseImage(imgOrCanvas, callback) {
    let canvas = document.createElement('canvas');
    canvas.width = this.gridWidth;
    canvas.height = this.gridHeight;
    let ctx = canvas.getContext('2d');

    ctx.drawImage(imgOrCanvas, 0, 0, this.gridWidth, this.gridHeight);
    let imgData = ctx.getImageData(0, 0, this.gridWidth, this.gridHeight);
    let pixels = imgData.data;

    let mapGrid = [];
    let buildingCount = 0;
    let waterCount = 0;

    for (let y = 0; y < this.gridHeight; y++) {
      let row = [];
      for (let x = 0; x < this.gridWidth; x++) {
        let idx = (y * this.gridWidth + x) * 4;
        let r = pixels[idx];
        let g = pixels[idx + 1];
        let b = pixels[idx + 2];

        // Classification Rules based on RGB color channels
        let type = 'ground';
        let height = 0;
        let color = 0x334155;

        if (b > 140 && r < 120) {
          // 🟦 Blue Pixel -> Water Body (River / Lake / Bay)
          type = 'water';
          waterCount++;
        } else if (r < 60 && g < 60 && b < 60) {
          // ⬛ Black/Dark Gray Pixel -> Asphalt Road
          type = 'road';
        } else if (g > 120 && r < 120) {
          // 🟩 Green Pixel -> Grass Park & Tree Cluster
          type = 'park';
        } else {
          // 🏢 Colored Pixel -> Extruded 3D Building Block
          type = 'building';
          let brightness = (r + g + b) / 3;
          height = mapRange(brightness, 60, 255, 20, 110);
          color = (r << 16) | (g << 8) | b;
          buildingCount++;
        }

        row.push({ type, height, color, x, y });
      }
      mapGrid.push(row);
    }

    if (callback) callback(mapGrid, buildingCount, waterCount);
  }

  // Generate Sample Drawn Map Canvas (Downtown River Peninsula, Central Park, Coastal Bay)
  createSampleMapCanvas(layoutType = 'riverpeninsula') {
    let canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    let ctx = canvas.getContext('2d');

    if (layoutType === 'riverpeninsula') {
      // 1. Downtown River Peninsula Layout
      ctx.fillStyle = '#475569'; ctx.fillRect(0, 0, 256, 256); // City ground

      // Curved Blue River
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(0, 80);
      ctx.bezierCurveTo(90, 60, 140, 180, 256, 170);
      ctx.lineTo(256, 256);
      ctx.lineTo(0, 256);
      ctx.fill();

      // Black Asphalt Roads
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(100, 0, 30, 256); // Main Avenue
      ctx.fillRect(0, 110, 256, 25); // Cross Street

      // Green Park
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(20, 20, 60, 60);

      // Building Blocks (Various Colors)
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(140, 20, 45, 70);
      ctx.fillStyle = '#f59e0b'; ctx.fillRect(195, 20, 45, 45);
      ctx.fillStyle = '#ec4899'; ctx.fillRect(20, 140, 65, 45);
      ctx.fillStyle = '#8b5cf6'; ctx.fillRect(140, 140, 50, 60);

    } else if (layoutType === 'centralpark') {
      // 2. Central Park City Grid
      ctx.fillStyle = '#334155'; ctx.fillRect(0, 0, 256, 256);

      // Central Park
      ctx.fillStyle = '#15803d'; ctx.fillRect(70, 70, 116, 116);
      ctx.fillStyle = '#0369a1'; ctx.beginPath(); ctx.arc(128, 128, 30, 0, Math.PI * 2); ctx.fill(); // Park Lake

      // Surrounding Road Ring
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(55, 55, 146, 12);
      ctx.fillRect(55, 189, 146, 12);
      ctx.fillRect(55, 55, 12, 146);
      ctx.fillRect(189, 55, 12, 146);

      // Buildings
      ctx.fillStyle = '#6366f1'; ctx.fillRect(10, 10, 35, 35);
      ctx.fillStyle = '#a855f7'; ctx.fillRect(210, 10, 35, 35);
      ctx.fillStyle = '#ef4444'; ctx.fillRect(10, 210, 35, 35);
      ctx.fillStyle = '#10b981'; ctx.fillRect(210, 210, 35, 35);

    } else {
      // 3. Coastal Island Bay Layout
      ctx.fillStyle = '#0284c7'; ctx.fillRect(0, 0, 256, 256); // Sea Water

      // Island Landmass
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(128, 128, 90, 0, Math.PI * 2);
      ctx.fill();

      // Island Roads
      ctx.fillStyle = '#1e293b';
      ctx.beginPath(); ctx.arc(128, 128, 70, 0, Math.PI * 2); ctx.stroke();
      ctx.fillRect(115, 40, 26, 176);

      // Resort Buildings
      ctx.fillStyle = '#f43f5e'; ctx.fillRect(80, 80, 30, 30);
      ctx.fillStyle = '#3b82f6'; ctx.fillRect(146, 80, 30, 30);
      ctx.fillStyle = '#eab308'; ctx.fillRect(80, 146, 30, 30);
      ctx.fillStyle = '#10b981'; ctx.fillRect(146, 146, 30, 30);
    }

    return canvas;
  }
}

function mapRange(val, inMin, inMax, outMin, outMax) {
  return outMin + (outMax - outMin) * (val - inMin) / (inMax - inMin);
}
