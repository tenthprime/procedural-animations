/**
 * #つぶやきGLSL WebGL Engine & Shader Compiler
 */

let canvas, gl;
let program, positionBuffer;
let locationResolution, locationTime;
let startTime;

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

  // Load Initial Preset
  let editor = document.getElementById('code-editor');
  editor.value = PRESETS.jelly;
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
    document.getElementById('error-log').innerText = '✨ Shader Compiled Successfully!';
    document.getElementById('error-log').style.color = '#00ffcc';
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

  let editor = document.getElementById('code-editor');
  let presetSelect = document.getElementById('select-preset');

  presetSelect.addEventListener('change', (e) => {
    editor.value = PRESETS[e.target.value];
    compileShaderFromEditor();
  });

  document.getElementById('btn-compile').addEventListener('click', compileShaderFromEditor);
  document.getElementById('btn-reset').addEventListener('click', () => {
    editor.value = PRESETS[presetSelect.value];
    compileShaderFromEditor();
  });

  editor.addEventListener('input', () => updateCharCounter(editor.value));
}

window.onload = initGL;
