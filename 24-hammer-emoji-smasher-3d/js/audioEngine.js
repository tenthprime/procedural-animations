/**
 * Web Audio API Procedural Sound Synthesizer Engine for Hammer Smasher 3D
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      let AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playImpactThud() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playGlassShatter() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // White noise generator for glass/polygon shattering sound
    let bufferSize = this.ctx.sampleRate * 0.2;
    let buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    let output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    let whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    let filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    let gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start();
    whiteNoise.stop(this.ctx.currentTime + 0.2);
  }
}
