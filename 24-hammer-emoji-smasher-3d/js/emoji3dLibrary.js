/**
 * 100 Procedural 3D Emoji Target Library & Texture Generators
 */

const EMOJI_LIST = [
  "😄", "🗿", "💎", "💣", "🎁", "🥑", "🚀", "🧱", "🏆", "🎃",
  "👾", "🤖", "🔥", "🍕", "🍩", "🍔", "🍦", "🎈", "⚽", "🏀",
  "🎮", "🎲", "🎯", "🎨", "👑", "🦄", "🐶", "🐱", "🦁", "🐼",
  "🐸", "🐙", "🦑", "🦐", "🐠", "🐬", "🦈", "🦩", "🦉", "🦋",
  "🌺", "🌻", "🌴", "🌲", "🌵", "🍉", "🍓", "🍒", "🍇", "🍎",
  "🍋", "🍍", "🥥", "🥨", "🧀", "🌭", "🍿", "🍿", "🥞", "🍣",
  "🛸", "🛰️", "⛵", "🏎️", "🚔", "🚒", "🚑", "🚜", "🚲", "⚓",
  "🔮", "⏳", "💡", "💰", "🔑", "🛡️", "⚔️", "🧬", "🧪", "🧲",
  "☎️", "⏰", "⏳", "🧭", "📷", "🎥", "🎙️", "📻", "📺", "💻",
  "📱", "🔋", "🔌", "🛢️", "📦", "📫", "📌", "💎", "🔮", "🎉"
];

function createEmojiTexture(emojiChar, bgHex = "#f59e0b", size = 256) {
  let canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  let ctx = canvas.getContext('2d');

  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '140px sans-serif';
  ctx.fillText(emojiChar, size / 2, size / 2 + 10);

  let texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function build3DEmojiMesh(emojiIndex) {
  let emojiChar = EMOJI_LIST[emojiIndex % EMOJI_LIST.length] || "😄";
  let bgColors = ["#f59e0b", "#0284c7", "#ef4444", "#10b981", "#8b5cf6", "#ec4899"];
  let bgHex = bgColors[emojiIndex % bgColors.length];

  let texture = createEmojiTexture(emojiChar, bgHex);

  let shapeType = emojiIndex % 4;
  let geometry;

  if (shapeType === 0) {
    geometry = new THREE.SphereGeometry(35, 24, 24);
  } else if (shapeType === 1) {
    geometry = new THREE.BoxGeometry(55, 55, 55);
  } else if (shapeType === 2) {
    geometry = new THREE.CylinderGeometry(30, 30, 50, 24);
  } else {
    geometry = new THREE.DodecahedronGeometry(35);
  }

  let material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.25,
    metalness: 0.15
  });

  let mesh = new THREE.Mesh(geometry, material);
  mesh.userData = {
    emojiChar: emojiChar,
    index: emojiIndex,
    bgHex: bgHex
  };

  return mesh;
}
