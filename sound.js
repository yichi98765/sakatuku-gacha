// === Sound Effects (Web Audio API) - Rich Game Audio ===

class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.35;
    this.reverb = null;
    this.compressor = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._setupEffects();
    }
  }

  _setupEffects() {
    // Compressor for cleaner mix
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -20;
    this.compressor.ratio.value = 4;
    this.compressor.connect(this.ctx.destination);

    // Simple reverb via convolver
    this._createReverb();
  }

  _createReverb() {
    const rate = this.ctx.sampleRate;
    const length = rate * 1.5;
    const buffer = this.ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }
    this.reverb = this.ctx.createConvolver();
    this.reverb.buffer = buffer;

    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = 0.15;
    this.reverb.connect(this.reverbGain);
    this.reverbGain.connect(this.compressor);
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Get output node (dry + reverb send)
  _out() { return this.compressor; }
  _reverbSend() { return this.reverb; }

  // Enhanced tone with ADSR envelope
  _playNote(freq, duration, type = 'sine', delay = 0, vol = this.volume, opts = {}) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime + delay;

    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);

    if (opts.pitchSlide) {
      osc.frequency.linearRampToValueAtTime(opts.pitchSlide, t + duration * 0.5);
    }
    if (opts.vibrato) {
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = opts.vibrato.rate || 5;
      lfoGain.gain.value = opts.vibrato.depth || 8;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + duration);
    }

    const env = this.ctx.createGain();
    const attack = opts.attack || 0.01;
    const decay = opts.decay || duration * 0.3;
    const sustain = opts.sustain || 0.6;
    const release = opts.release || duration * 0.4;

    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(vol, t + attack);
    env.gain.linearRampToValueAtTime(vol * sustain, t + attack + decay);
    env.gain.linearRampToValueAtTime(0.001, t + duration);

    osc.connect(env);
    env.connect(this._out());

    if (opts.reverb !== false && this.reverb) {
      const reverbSend = this.ctx.createGain();
      reverbSend.gain.value = opts.reverbAmount || 0.3;
      env.connect(reverbSend);
      reverbSend.connect(this._reverbSend());
    }

    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  // Play a chord (multiple notes)
  _playChord(freqs, duration, type, delay, vol, opts = {}) {
    freqs.forEach(f => this._playNote(f, duration, type, delay, vol / freqs.length * 1.5, opts));
  }

  // Shimmer / sparkle effect
  _sparkle(delay = 0, count = 6) {
    for (let i = 0; i < count; i++) {
      const freq = 2000 + Math.random() * 3000;
      this._playNote(freq, 0.06 + Math.random() * 0.08, 'sine', delay + i * 0.04, 0.06, {
        attack: 0.005, reverb: true, reverbAmount: 0.5
      });
    }
  }

  // Whoosh / sweep
  _sweep(startFreq, endFreq, duration, delay = 0, vol = 0.08) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(vol, t);
    env.gain.linearRampToValueAtTime(0, t + duration);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(startFreq * 2, t);
    filter.frequency.exponentialRampToValueAtTime(endFreq * 2, t + duration);

    osc.connect(filter);
    filter.connect(env);
    env.connect(this._out());
    osc.start(t);
    osc.stop(t + duration + 0.01);
  }

  // Impact boom
  _boom(delay = 0, vol = 0.25) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime + delay;

    // Sub bass hit
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.5);
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(vol, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc.connect(env);
    env.connect(this._out());
    osc.start(t);
    osc.stop(t + 0.7);

    // Noise layer
    const bufLen = this.ctx.sampleRate * 0.15;
    const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 3);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const nGain = this.ctx.createGain();
    nGain.gain.value = vol * 0.4;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this._out());
    noise.start(t);
  }

  // ===================== PUBLIC METHODS =====================

  // Card flip - crisp paper/card sound
  cardFlip() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    // Short noise burst (paper sound)
    const bufLen = this.ctx.sampleRate * 0.04;
    const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 5);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    filter.Q.value = 1;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.15;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this._out());
    noise.start(t);

    // Tiny tonal click
    this._playNote(1800, 0.03, 'sine', 0, 0.05, { attack: 0.002, reverb: false });
  }

  // ★1 reveal - modest short jingle
  star1Reveal() {
    this._playNote(392, 0.15, 'sine', 0, 0.15, { attack: 0.01 });
    this._playNote(440, 0.2, 'triangle', 0.1, 0.12, { attack: 0.01 });
  }

  // ★2 reveal - brighter ascending arpeggio
  star2Reveal() {
    const notes = [523, 659, 784];
    notes.forEach((f, i) => {
      this._playNote(f, 0.25, 'sine', i * 0.1, 0.15, { attack: 0.01, reverbAmount: 0.3 });
      this._playNote(f * 2, 0.2, 'triangle', i * 0.1 + 0.02, 0.05, { attack: 0.01 });
    });
    this._sparkle(0.25, 4);
  }

  // ★3 reveal - epic fanfare with harmonies
  star3Reveal() {
    // Brass-like fanfare (C major -> G -> Am -> C climax)
    const sequence = [
      { freqs: [523, 659, 784], dur: 0.18, delay: 0 },        // C major
      { freqs: [587, 740, 880], dur: 0.18, delay: 0.15 },     // D -> build
      { freqs: [659, 784, 1047], dur: 0.22, delay: 0.30 },    // E minor feel
      { freqs: [784, 988, 1175], dur: 0.15, delay: 0.50 },    // G rise
      { freqs: [880, 1047, 1319], dur: 0.15, delay: 0.62 },   // A
      { freqs: [1047, 1319, 1568], dur: 0.5, delay: 0.75 },   // C octave climax!
    ];

    sequence.forEach(({ freqs, dur, delay }) => {
      // Main voice (triangle = brass-like)
      this._playChord(freqs, dur, 'triangle', delay, 0.22, {
        attack: 0.02, sustain: 0.7, reverbAmount: 0.4,
        vibrato: delay > 0.6 ? { rate: 5, depth: 6 } : null
      });
      // Octave shimmer layer
      this._playChord(freqs.map(f => f * 2), dur * 0.7, 'sine', delay + 0.01, 0.06, {
        attack: 0.01, reverbAmount: 0.5
      });
    });

    // Sparkle on climax
    this._sparkle(0.8, 10);

    // Sustaining pad under climax
    this._playNote(523, 1.2, 'sine', 0.75, 0.08, { attack: 0.1, sustain: 0.8, reverbAmount: 0.6 });
    this._playNote(784, 1.2, 'sine', 0.75, 0.06, { attack: 0.1, sustain: 0.8, reverbAmount: 0.6 });
  }

  // ★3 flash - cinematic impact
  star3Flash() {
    this._boom(0, 0.3);
    this._sweep(200, 2000, 0.4, 0, 0.1);

    // Rising tension tone
    this._playNote(200, 0.8, 'sawtooth', 0, 0.05, {
      pitchSlide: 800, attack: 0.01, reverbAmount: 0.4
    });
  }

  // Button click - soft UI tap
  click() {
    this._playNote(900, 0.04, 'sine', 0, 0.06, { attack: 0.003, reverb: false });
    this._playNote(1200, 0.03, 'sine', 0.015, 0.04, { attack: 0.003, reverb: false });
  }

  // Gacha start - cinematic riser with anticipation
  gachaStart() {
    // Rising sweep
    this._sweep(100, 1500, 0.6, 0, 0.1);

    // Rhythmic hits building up
    for (let i = 0; i < 6; i++) {
      const t = i * 0.07;
      const vol = 0.04 + i * 0.015;
      this._playNote(300 + i * 80, 0.06, 'triangle', t, vol, { attack: 0.005, reverb: false });
    }

    // Sparkle at end
    this._sparkle(0.4, 3);
  }

  // Exchange success - magical chime cascade
  exchangeSuccess() {
    const chime = [784, 988, 1175, 1319, 1568, 1760, 2093];
    chime.forEach((freq, i) => {
      this._playNote(freq, 0.4 + i * 0.05, 'sine', i * 0.08, 0.12, {
        attack: 0.005, sustain: 0.5, reverbAmount: 0.5
      });
    });
    // Warm base chord
    this._playChord([523, 659, 784], 1.0, 'triangle', 0.1, 0.1, {
      attack: 0.05, sustain: 0.8, reverbAmount: 0.6
    });
    this._sparkle(0.5, 8);
  }
}

const soundManager = new SoundManager();
