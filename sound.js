// === Sound Effects (Web Audio API) ===
// No external files needed - generates sounds programmatically

class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.3;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Play a note
  playTone(freq, duration, type = 'sine', delay = 0, vol = this.volume) {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, this.ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(this.ctx.currentTime + delay);
    osc.stop(this.ctx.currentTime + delay + duration);
  }

  // Card flip sound
  cardFlip() {
    this.playTone(800, 0.08, 'square', 0, 0.1);
    this.playTone(1200, 0.06, 'square', 0.05, 0.08);
  }

  // Normal pull (★1)
  star1Reveal() {
    this.playTone(440, 0.15, 'sine');
    this.playTone(520, 0.15, 'sine', 0.1);
  }

  // Silver pull (★2)
  star2Reveal() {
    this.playTone(523, 0.2, 'sine');
    this.playTone(659, 0.2, 'sine', 0.12);
    this.playTone(784, 0.3, 'sine', 0.24);
  }

  // Gold pull (★3) - fanfare
  star3Reveal() {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    const durations = [0.15, 0.15, 0.15, 0.3, 0.1, 0.15, 0.5];
    let time = 0;
    notes.forEach((freq, i) => {
      this.playTone(freq, durations[i], 'sine', time, 0.25);
      this.playTone(freq * 1.5, durations[i], 'triangle', time, 0.1);
      time += durations[i] * 0.7;
    });
  }

  // Star3 flash impact
  star3Flash() {
    if (!this.enabled || !this.ctx) return;
    // White noise burst
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.15;
    source.connect(gain);
    gain.connect(this.ctx.destination);
    source.start();

    // Low boom
    this.playTone(80, 0.5, 'sine', 0, 0.3);
    this.playTone(60, 0.6, 'sine', 0.05, 0.2);
  }

  // Button click
  click() {
    this.playTone(600, 0.05, 'square', 0, 0.08);
  }

  // Gacha start (drum roll feel)
  gachaStart() {
    for (let i = 0; i < 8; i++) {
      this.playTone(200 + i * 50, 0.08, 'square', i * 0.06, 0.08);
    }
  }

  // Exchange success
  exchangeSuccess() {
    const notes = [523, 659, 784, 1047, 1319, 1568];
    notes.forEach((freq, i) => {
      this.playTone(freq, 0.3, 'sine', i * 0.1, 0.2);
      this.playTone(freq * 0.5, 0.3, 'triangle', i * 0.1, 0.1);
    });
  }
}

const soundManager = new SoundManager();
