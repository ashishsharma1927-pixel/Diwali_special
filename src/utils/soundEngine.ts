// Web Audio API Synthesizer for Authentic Diwali Crackers Experience
// 100% offline-first, zero external audio dependency, rich physical audio synthesis

class DiwaliSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private anaarNoiseGain: GainNode | null = null;
  private anaarFilter: BiquadFilterNode | null = null;
  private anaarSource: AudioBufferSourceNode | null = null;
  private chakriGain: GainNode | null = null;
  private chakriOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private sharedNoiseBuffer: AudioBuffer | null = null;

  private getSharedNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    if (!this.sharedNoiseBuffer) {
      const size = Math.floor(this.ctx.sampleRate * 2.0);
      this.sharedNoiseBuffer = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
      const data = this.sharedNoiseBuffer.getChannelData(0);
      for (let i = 0; i < size; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    return this.sharedNoiseBuffer;
  }

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.init();
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopDrone();
      this.stopAnaarSound();
      this.stopChakriSound();
    } else {
      this.startDrone();
      this.playDiwaliChime();
    }
    return !this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.init();
    this.isMuted = muted;
    if (this.isMuted) {
      this.stopDrone();
      this.stopAnaarSound();
      this.stopChakriSound();
    } else {
      this.startDrone();
    }
  }

  // Meditative Diwali Sitar / Tanpura celebration drone
  public startDrone() {
    if (this.isMuted || !this.ctx) return;
    try {
      this.stopDrone();

      const master = this.ctx.createGain();
      master.gain.setValueAtTime(0.005, this.ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.04, this.ctx.currentTime + 3);
      master.connect(this.ctx.destination);
      this.droneGain = master;

      // Indian classical Sa root (146.83 Hz - D3)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(146.83, this.ctx.currentTime);

      const filter1 = this.ctx.createBiquadFilter();
      filter1.type = 'lowpass';
      filter1.frequency.setValueAtTime(320, this.ctx.currentTime);

      osc1.connect(filter1);
      filter1.connect(master);
      osc1.start();
      this.droneOsc1 = osc1;

      // Harmonic Pa fifth (220 Hz - A3)
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(220, this.ctx.currentTime);

      const filter2 = this.ctx.createBiquadFilter();
      filter2.type = 'lowpass';
      filter2.frequency.setValueAtTime(450, this.ctx.currentTime);

      osc2.connect(filter2);
      filter2.connect(master);
      osc2.start();
      this.droneOsc2 = osc2;
    } catch {
      // AudioContext fallback
    }
  }

  public stopDrone() {
    if (this.droneGain && this.ctx) {
      try {
        this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, this.ctx.currentTime);
        this.droneGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
      } catch {
        // noop
      }
    }
    setTimeout(() => {
      if (this.droneOsc1) {
        try { this.droneOsc1.stop(); this.droneOsc1.disconnect(); } catch { /* noop */ }
        this.droneOsc1 = null;
      }
      if (this.droneOsc2) {
        try { this.droneOsc2.stop(); this.droneOsc2.disconnect(); } catch { /* noop */ }
        this.droneOsc2 = null;
      }
    }, 600);
  }

  // Matchstick Strike & Light Sound
  public playMatchStrike() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // 1. Friction strike scratch (Bandpass noise)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.18);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 0.7);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
      filter.Q.setValueAtTime(4.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);

      // 2. Flame ignition flare (Low whoosh)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);

      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.setValueAtTime(0.12, now + 0.08);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now + 0.08);
      osc.stop(now + 0.46);
    } catch {
      // Audio safety
    }
  }

  // Flame Extinguish / Smoke Puff Sound
  public playMatchExtinguish() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Soft hiss / air puff
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.22);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.8);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.2);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + 0.23);
    } catch {
      // Audio safety
    }
  }

  // Wooden Matchstick Drop / Tap on ground
  public playWoodDrop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Audio safety
    }
  }

  // Flame Lighter Click (Snappy piezoelectric metallic snap + butane hiss)
  public playLighterClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // 1. Sharp metallic piezo click
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(3200, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.04);

      oscGain.gain.setValueAtTime(0.28, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);

      // 2. Butane gas rush
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 0.85);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.Q.setValueAtTime(2.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.20, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now + 0.01);
    } catch {
      // Audio safety
    }
  }

  // Fuljhadi (Sparkler) Sizzle & Iron Spark Crackle
  public playFuljhadiSparkle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const duration = 0.35;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // High density metallic crackles
        data[i] = Math.random() > 0.82 ? (Math.random() * 2 - 1) * 1.5 : (Math.random() * 0.2 - 0.1);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(4500, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + duration);
    } catch {
      // Audio safety
    }
  }

  // Skyshot Mortar Launch Tube Thud
  public playSkyshotLaunch() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      // Audio safety
    }
  }

  // Rapid Ladi (Murgachap Chatai) Firecracker Pop
  public playLadiPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Sharp staccato paper crack
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.06);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 0.4);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800 + Math.random() * 800, now);
      filter.Q.setValueAtTime(3.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.22 + Math.random() * 0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.058);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + 0.06);
    } catch {
      // Audio safety
    }
  }

  // Fuse Wick Sizzle Sound (tsss-tss-tsss)
  public playFuseBurn() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const duration = 1.1;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Crackling stochastic pulse
        const crackle = Math.random() > 0.88 ? (Math.random() * 2 - 1) * 2 : (Math.random() * 0.4 - 0.2);
        data[i] = crackle;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3500, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + duration);
    } catch {
      // Audio safety
    }
  }

  // Bomb Explosion (Dynamically tailored for Mirchi, Sutli, Atom, Hydrogen, or Gola Bomb)
  public playBombExplosion(variant: import('../types/diwali').BombVariant = 'sutli') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Variant parameter calibration
      let startFreq = 170;
      let endFreq = 28;
      let subVol = 0.65;
      let noiseFilterFreq = 1400;
      let duration = 1.4;

      if (variant === 'mirchi') {
        // High-pitch snappy crackle
        startFreq = 380;
        endFreq = 95;
        subVol = 0.35;
        noiseFilterFreq = 3400;
        duration = 0.7;
      } else if (variant === 'atom') {
        // Sharp metallic punch
        startFreq = 260;
        endFreq = 45;
        subVol = 0.55;
        noiseFilterFreq = 2200;
        duration = 1.1;
      } else if (variant === 'hydrogen') {
        // Deep thunderous 50,000 watt roar
        startFreq = 120;
        endFreq = 20;
        subVol = 0.85;
        noiseFilterFreq = 1100;
        duration = 1.8;
      } else if (variant === 'gola') {
        // Colossal volcanic coconut bomb detonation
        startFreq = 90;
        endFreq = 14;
        subVol = 0.95;
        noiseFilterFreq = 850;
        duration = 2.2;
      }

      // Sub-bass concussive blast
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(startFreq, now);
      subOsc.frequency.exponentialRampToValueAtTime(endFreq, now + duration * 0.9);

      subGain.gain.setValueAtTime(subVol, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + duration + 0.05);

      // High-impact noise crack & shockwave (Instant zero-allocation via shared buffer)
      const noiseBuffer = this.getSharedNoiseBuffer();
      if (noiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(noiseFilterFreq, now);
        filter.frequency.exponentialRampToValueAtTime(120, now + duration * 0.7);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(subVol * 0.9, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + duration + 0.05);
      }

      // Shrapnel & ringing tail
      const ringOsc = this.ctx.createOscillator();
      const ringGain = this.ctx.createGain();
      ringOsc.type = variant === 'atom' ? 'triangle' : 'sine';
      ringOsc.frequency.setValueAtTime(variant === 'atom' ? 1200 : 880, now);
      ringOsc.frequency.exponentialRampToValueAtTime(260, now + 0.6);

      ringGain.gain.setValueAtTime(0.08, now);
      ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      ringOsc.connect(ringGain);
      ringGain.connect(this.ctx.destination);
      ringOsc.start(now);
      ringOsc.stop(now + 0.75);
    } catch {
      // Audio safety
    }
  }

  // Dustbin Drop Sound (Satisfying metallic clink & receptacle drop)
  public playDustbinDrop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // 1. Metallic lid clank
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);

      // 2. Hollow paper / ash drop thump
      const sub = this.ctx.createOscillator();
      const subG = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(120, now + 0.05);
      sub.frequency.exponentialRampToValueAtTime(40, now + 0.28);

      subG.gain.setValueAtTime(0.25, now + 0.05);
      subG.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      sub.connect(subG);
      subG.connect(this.ctx.destination);
      sub.start(now + 0.05);
      sub.stop(now + 0.34);
    } catch {
      // Audio fallback
    }
  }

  // Dustbin Sweep All Sound (Broom sweep + sparkle chime)
  public playDustbinSweep() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Broom whoosh noise
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.4);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);

      // Pleasant chime
      this.playDiwaliChime();
    } catch {
      // Audio fallback
    }
  }

  // Rocket Launch (High-Speed Screaming Thrust Whoosh)
  public playRocketLaunch() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const duration = 1.4;

      // Rocket whistle oscillator (rises rapidly in pitch)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(2600, now + 0.9);
      osc.frequency.exponentialRampToValueAtTime(3400, now + duration);

      oscGain.gain.setValueAtTime(0.01, now);
      oscGain.gain.exponentialRampToValueAtTime(0.22, now + 0.4);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.05);

      // Rocket propellant jet roar
      const noiseBuffer = this.getSharedNoiseBuffer();
      if (noiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(700, now);
        filter.frequency.exponentialRampToValueAtTime(2200, now + duration);
        filter.Q.setValueAtTime(2.5, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.02, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.25, now + 0.5);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + duration + 0.05);
      }
    } catch {
      // Audio safety
    }
  }

  // Rocket Aerial Sky Burst (Pop & Sparkling Peony)
  public playRocketBurst() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Sky burst pop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.5);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);

      // Sparkle cascade crackle (Instant zero-allocation via shared buffer)
      const noiseBuffer = this.getSharedNoiseBuffer();
      if (noiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2800, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.2, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + 1.25);
      }
    } catch {
      // Audio safety
    }
  }

  // Chakri (Ground Spinner) Spinning Whirring Buzz
  public startChakriSound() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      this.stopChakriSound();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      // Whirring rotation frequency for extended spin (13s)
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(780, now + 1.5);
      osc.frequency.linearRampToValueAtTime(980, now + 5.0);
      osc.frequency.linearRampToValueAtTime(850, now + 9.0);
      osc.frequency.linearRampToValueAtTime(420, now + 12.5);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(3.5, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.8);
      gain.gain.linearRampToValueAtTime(0.18, now + 9.0);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 13.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      this.chakriOsc = osc;
      this.chakriGain = gain;
    } catch {
      // Audio safety
    }
  }

  public stopChakriSound() {
    if (this.chakriGain) {
      try { this.chakriGain.disconnect(); } catch { /* noop */ }
      this.chakriGain = null;
    }
    if (this.chakriOsc) {
      try {
        this.chakriOsc.stop();
        this.chakriOsc.disconnect();
      } catch { /* noop */ }
      this.chakriOsc = null;
    }
  }

  // Anaar (Flowerpot Fountain) - Extended 15 seconds of roaring, sparkling fountain!
  public startAnaarSound() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      this.stopAnaarSound();

      const duration = 15.0;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Create realistic volcanic sizzling fountain noise:
      // Starts gentle, roars to peak between 2.5s and 11s, then descends smoothly till 15s
      for (let i = 0; i < bufferSize; i++) {
        const t = i / this.ctx.sampleRate;
        let intensity = 1.0;
        if (t < 2.0) {
          intensity = 0.2 + 0.8 * (t / 2.0);
        } else if (t > 11.5) {
          intensity = Math.max(0.01, 1 - (t - 11.5) / 3.5);
        }
        // Dense crackles + continuous flame hiss
        const crackle = Math.random() > 0.82 ? (Math.random() * 2 - 1) * 1.8 : (Math.random() * 2 - 1) * 0.4;
        data[i] = crackle * intensity;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(3900, this.ctx.currentTime + 3.5);
      filter.frequency.linearRampToValueAtTime(1400, this.ctx.currentTime + 14.5);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.34, this.ctx.currentTime + 2.0);
      gain.gain.linearRampToValueAtTime(0.35, this.ctx.currentTime + 10.5);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 14.8);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      this.anaarSource = noise;
      this.anaarNoiseGain = gain;
      this.anaarFilter = filter;
    } catch {
      // Audio safety
    }
  }

  public stopAnaarSound() {
    if (this.anaarNoiseGain) {
      try { this.anaarNoiseGain.disconnect(); } catch { /* noop */ }
      this.anaarNoiseGain = null;
    }
    if (this.anaarFilter) {
      try { this.anaarFilter.disconnect(); } catch { /* noop */ }
      this.anaarFilter = null;
    }
    if (this.anaarSource) {
      try {
        this.anaarSource.stop();
        this.anaarSource.disconnect();
      } catch { /* noop */ }
      this.anaarSource = null;
    }
  }

  // Festive Diwali Temple Chimes / Joyful Auspicious Bell Harmony
  public playDiwaliChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Raga Bhupali notes (Pentatonic C, D, E, G, A, C)
      const freqs = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.09, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 2.0);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 2.05);
      });
    } catch {
      // Audio safety
    }
  }
}

export const soundEngine = new DiwaliSoundEngine();
