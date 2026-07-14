export class SoundEngine {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();

    const len = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noiseBuf = buf;

    this.strainSrc = this.ctx.createBufferSource();
    this.strainSrc.buffer = buf;
    this.strainSrc.loop = true;
    this.bp = this.ctx.createBiquadFilter();
    this.bp.type = "bandpass";
    this.bp.frequency.value = 700;
    this.bp.Q.value = 3;
    this.strainGain = this.ctx.createGain();
    this.strainGain.gain.value = 0;
    this.strainSrc.connect(this.bp);
    this.bp.connect(this.strainGain);
    this.strainGain.connect(this.ctx.destination);
    this.strainSrc.start();
  }

  strain(v) {
    if (!this.ctx || !this.enabled) return;
    const g = Math.max(0, Math.min(1, v));
    this.strainGain.gain.setTargetAtTime(g * g * 0.045, this.ctx.currentTime, 0.05);
    this.bp.frequency.setTargetAtTime(500 + g * 900, this.ctx.currentTime, 0.05);
  }

  stopStrain() {
    if (!this.ctx) return;
    this.strainGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.03);
  }

  crack() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const hp = this.ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1800;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    src.connect(hp);
    hp.connect(g);
    g.connect(this.ctx.destination);
    src.start(t, Math.random(), 0.2);

    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.12);
    const og = this.ctx.createGain();
    og.gain.setValueAtTime(0.18, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc.connect(og);
    og.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  thud() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.15);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  tick() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    [1180, 1560].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t + i * 0.09);
      g.gain.exponentialRampToValueAtTime(0.07, t + i * 0.09 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.09 + 0.25);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(t + i * 0.09);
      osc.stop(t + i * 0.09 + 0.3);
    });
  }
}
