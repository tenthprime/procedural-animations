/**
 * Infinite Glowing Neon Lines WebGL Controller
 */

let canvas, gl;
let program, positionBuffer;
let locationResolution, locationTime;
let locLineCount, locPattern, locColorMode, locSpeed, locGlow;
let startTime;

let uiLineCount = 8;
let uiPattern = 0;
let uiColorMode = 0;
let uiSpeed = 1.0;
let uiGlow = 1.0;

const vertShaderSource = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

function initGL() {
  canvas = document.getElementById('gl-canvas');
  gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  if (!gl) {
    alert('WebGL not supported in browser!');
    return;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Fullscreen quad buffer
  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,
  ]), gl.STATIC_DRAW);

  startTime = Date.now();

  // Load Initial Shader
  let editor = document.getElementById('code-editor');
  editor.value = MASTER_LINE_SHADER;
  compileShaderFromEditor();

  initUI();
  requestAnimationFrame(render);
}

function compileShaderFromEditor() {
  let code = document.getElementById('code-editor').value;
  updateCharCounter(code);

  let vertShader = createShader(gl, gl.VERTEX_SHADER, vertShaderSource);
  let fragShader = createShader(gl, gl.FRAGMENT_SHADER, code);

  if (!fragShader) return;

  let newProgram = createProgram(gl, vertShader, fragShader);
  if (newProgram) {
    program = newProgram;
    locationResolution = gl.getUniformLocation(program, 'r');
    locationTime = gl.getUniformLocation(program, 't');
    locLineCount = gl.getUniformLocation(program, 'uLineCount');
    locPattern = gl.getUniformLocation(program, 'uPattern');
    locColorMode = gl.getUniformLocation(program, 'uColorMode');
    locSpeed = gl.getUniformLocation(program, 'uSpeed');
    locGlow = gl.getUniformLocation(program, 'uGlow');

    document.getElementById('error-log').innerText = '✨ GLSL Line Shader Compiled!';
    document.getElementById('error-log').style.color = '#ff00ff';
  }
}

function createShader(gl, type, source) {
  let shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    let err = gl.getShaderInfoLog(shader);
    document.getElementById('error-log').innerText = '❌ Shader Error: ' + err;
    document.getElementById('error-log').style.color = '#ff3366';
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vert, frag) {
  let prog = gl.createProgram();
  gl.attachShader(prog, vert);
  gl.attachShader(prog, frag);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    gl.deleteProgram(prog);
    return null;
  }
  return prog;
}

function render() {
  if (program) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(program);

    let posLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);

    let currentTime = (Date.now() - startTime) * 0.001;
    gl.uniform2f(locationResolution, canvas.width, canvas.height);
    gl.uniform1f(locationTime, currentTime);

    // Dynamic Parameter Uniforms
    if (locLineCount) gl.uniform1f(locLineCount, uiLineCount);
    if (locPattern) gl.uniform1i(locPattern, uiPattern);
    if (locColorMode) gl.uniform1i(locColorMode, uiColorMode);
    if (locSpeed) gl.uniform1f(locSpeed, uiSpeed);
    if (locGlow) gl.uniform1f(locGlow, uiGlow);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  requestAnimationFrame(render);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function updateCharCounter(code) {
  let len = code.replace(/\s+/g, ' ').trim().length;
  document.getElementById('char-count').innerText = len;
  let status = document.getElementById('tweet-status');
  if (len <= 280) {
    status.innerText = 'Valid Tweet! (Under 280 chars)';
    status.className = 'status-valid';
  } else {
    status.innerText = 'Over 280 limit';
    status.className = 'status-over';
  }
}

function initUI() {
  // Slide-in drawer toggle
  let toggleBtn = document.getElementById('toggle-panel-btn');
  let panel = document.getElementById('control-panel');

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('collapsed');
    let isCollapsed = panel.classList.contains('collapsed');
    toggleBtn.innerHTML = isCollapsed ? '⚙️ Controls' : '✕ Close';
  });

  document.getElementById('pattern-select').addEventListener('change', (e) => uiPattern = parseInt(e.target.value));
  document.getElementById('color-select').addEventListener('change', (e) => uiColorMode = parseInt(e.target.value));

  document.getElementById('lines-slider').addEventListener('input', (e) => {
    uiLineCount = parseFloat(e.target.value);
    document.getElementById('val-lines').innerText = uiLineCount;
  });

  document.getElementById('speed-slider').addEventListener('input', (e) => {
    uiSpeed = parseFloat(e.target.value);
    document.getElementById('val-speed').innerText = uiSpeed.toFixed(1);
  });

  document.getElementById('glow-slider').addEventListener('input', (e) => {
    uiGlow = parseFloat(e.target.value) / 100;
    document.getElementById('val-glow').innerText = e.target.value;
  });

  let editor = document.getElementById('code-editor');

  document.getElementById('btn-compile').addEventListener('click', compileShaderFromEditor);
  document.getElementById('btn-reset').addEventListener('click', () => {
    editor.value = MASTER_LINE_SHADER;
    compileShaderFromEditor();
  });

  editor.addEventListener('input', () => updateCharCounter(editor.value));
}

window.onload = initGL;
