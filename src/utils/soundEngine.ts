import ladiSoundUrl from '../sounds/murgachap ladi.mp3';
import skyshotSoundUrl from '../sounds/skyshots.mp3';
import bombSoundUrl from '../sounds/bomb.mp3';

// Web Audio API Synthesizer for Authentic Diwali Crackers Experience
// Offline-first with integrated authentic fireworks audio recordings

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
  private brownianNoiseBuffer: AudioBuffer | null = null;
  private distortionCurve: Float32Array | null = null;

  // Authentic Murgachap Ladi Audio Buffer & Peak Timestamps
  private ladiAudioBuffer: AudioBuffer | null = null;
  private ladiPeaks: number[] = [];
  private isLadiLoading: boolean = false;
  private activeLadiSource: AudioBufferSourceNode | null = null;
  private activeLadiRafId: number | null = null;

  // Authentic Skyshot Multi-Burst Audio Buffer & Peak Timestamps
  private skyshotAudioBuffer: AudioBuffer | null = null;
  private skyshotPeaks: number[] = [];
  private isSkyshotLoading: boolean = false;
  private skyshotPeakIndex: number = 0;

  // Authentic Bomb Audio Recording Buffer (from src/sounds/bomb.mp3)
  private bombAudioBuffer: AudioBuffer | null = null;
  private isBombLoading: boolean = false;

  // Active Rocket Flight Instances (tracks screeching flight whoosh & ascending whistle per flying rocket)
  private activeRocketFlights: Map<
    string,
    {
      carrier: OscillatorNode;
      mod: OscillatorNode;
      carrierGain: GainNode;
      noiseSource: AudioBufferSourceNode | null;
      noiseGain: GainNode;
      masterGain: GainNode;
      stopTimer: ReturnType<typeof setTimeout>;
    }
  > = new Map();

  // High-precision transient peak finder to sync cracker explosions with real audio
  private extractPeaks(buffer: AudioBuffer, minDistanceSec: number = 0.08, thresholdRatio: number = 0.22): number[] {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    const minDistanceSamples = Math.floor(sampleRate * minDistanceSec);
    const peaks: number[] = [];

    let maxAmp = 0;
    const step = 25;
    for (let i = 0; i < data.length; i += step) {
      const v = Math.abs(data[i]);
      if (v > maxAmp) maxAmp = v;
    }

    const threshold = maxAmp * thresholdRatio;
    let lastPeakSample = -minDistanceSamples;
    const windowSize = Math.floor(sampleRate * 0.005); // 5ms window

    for (let i = 0; i < data.length - windowSize; i += windowSize) {
      let winMax = 0;
      for (let j = 0; j < windowSize; j++) {
        const absVal = Math.abs(data[i + j]);
        if (absVal > winMax) winMax = absVal;
      }
      if (winMax > threshold && (i - lastPeakSample) > minDistanceSamples) {
        peaks.push(i / sampleRate);
        lastPeakSample = i;
      }
    }
    return peaks;
  }

  // Preload and decode user's audio recordings (murgachap ladi.mp3, skyshots.mp3, & bomb.mp3)
  public async preloadAudioFiles() {
    this.init();
    if (!this.ctx) return;

    // 1. Decode Murgachap Ladi
    if (!this.ladiAudioBuffer && !this.isLadiLoading) {
      this.isLadiLoading = true;
      try {
        const resp = await fetch(ladiSoundUrl);
        const arrayBuf = await resp.arrayBuffer();
        this.ladiAudioBuffer = await this.ctx.decodeAudioData(arrayBuf);
        this.ladiPeaks = this.extractPeaks(this.ladiAudioBuffer, 0.075, 0.20);
      } catch (e) {
        console.warn('Ladi audio load notice:', e);
      } finally {
        this.isLadiLoading = false;
      }
    }

    // 2. Decode Skyshots
    if (!this.skyshotAudioBuffer && !this.isSkyshotLoading) {
      this.isSkyshotLoading = true;
      try {
        const resp = await fetch(skyshotSoundUrl);
        const arrayBuf = await resp.arrayBuffer();
        this.skyshotAudioBuffer = await this.ctx.decodeAudioData(arrayBuf);
        this.skyshotPeaks = this.extractPeaks(this.skyshotAudioBuffer, 0.40, 0.22);
      } catch (e) {
        console.warn('Skyshots audio load notice:', e);
      } finally {
        this.isSkyshotLoading = false;
      }
    }

    // 3. Decode Authentic Bomb Audio
    if (!this.bombAudioBuffer && !this.isBombLoading) {
      this.isBombLoading = true;
      try {
        const resp = await fetch(bombSoundUrl);
        const arrayBuf = await resp.arrayBuffer();
        this.bombAudioBuffer = await this.ctx.decodeAudioData(arrayBuf);
      } catch (e) {
        console.warn('Bomb audio load notice:', e);
      } finally {
        this.isBombLoading = false;
      }
    }
  }

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

  // Brownian noise (1/f² integration): mimics turbulent expanding combustion gases
  private getBrownianNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    if (!this.brownianNoiseBuffer) {
      const size = Math.floor(this.ctx.sampleRate * 2.5);
      this.brownianNoiseBuffer = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
      const data = this.brownianNoiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < size; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.028 * white) / 1.028;
        data[i] = lastOut * 3.6;
      }
    }
    return this.brownianNoiseBuffer;
  }

  // Shock impulse generator: sub-millisecond pressure rise simulating casing rupture
  private createCrackImpulseBuffer(durationSec: number = 0.045): AudioBuffer | null {
    if (!this.ctx) return null;
    const size = Math.floor(this.ctx.sampleRate * durationSec);
    const buffer = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) {
      const progress = i / size;
      const envelope = Math.exp(-progress * 26.0) * (1 - progress);
      data[i] = (Math.random() * 2 - 1) * envelope;
    }
    return buffer;
  }

  // Soft-saturation / tanh non-linear wave shaper for authentic concussive air pressure clipping
  private getDistortionCurve(amount: number = 60): Float32Array {
    if (!this.distortionCurve) {
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      for (let i = 0; i < n_samples; ++i) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = Math.tanh(x * (amount * 0.08));
      }
      this.distortionCurve = curve;
    }
    return this.distortionCurve;
  }

  // Realistic open-air courtyard / terrace flutter echo network
  private createCourtyardReverb(now: number, duration: number, gainLevel: number = 0.24): GainNode | null {
    if (!this.ctx) return null;
    const outputGain = this.ctx.createGain();
    outputGain.gain.setValueAtTime(gainLevel, now);
    outputGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    outputGain.connect(this.ctx.destination);

    // Multi-tap early reflections simulating brick walls and terrace boundaries
    const delays = [0.034, 0.078, 0.138];
    const decays = [0.42, 0.24, 0.12];

    delays.forEach((delayTime, idx) => {
      if (!this.ctx) return;
      const delay = this.ctx.createDelay();
      delay.delayTime.setValueAtTime(delayTime, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100 - idx * 250, now);

      const tapGain = this.ctx.createGain();
      tapGain.gain.setValueAtTime(decays[idx], now);

      delay.connect(filter);
      filter.connect(tapGain);
      tapGain.connect(outputGain);
    });

    return outputGain;
  }


  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.ladiAudioBuffer && !this.isLadiLoading) {
      this.preloadAudioFiles();
    }
  }

  public toggleMute(): boolean {
    this.init();
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopDrone();
      this.stopAnaarSound();
      this.stopChakriSound();
      this.stopAllRocketFlights();
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
      const duration = 0.38;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Authentic electric iron sparkler: sharp microscopic crackle grain with sputtering pops
      for (let i = 0; i < bufferSize; i++) {
        const isSpur = Math.random() > 0.86;
        const spike = isSpur ? (Math.random() * 2 - 1) * 2.2 : (Math.random() * 0.32 - 0.16);
        data[i] = spike * Math.pow(1 - i / bufferSize, 0.4);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(4200, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.20, now);
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

  // Skyshot Mortar Launch Tube Thud (Deep column acoustic thump + propellant gas ejection)
  public playSkyshotLaunch() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    if (!this.skyshotAudioBuffer && !this.isSkyshotLoading) {
      this.preloadAudioFiles();
    }

    try {
      const now = this.ctx.currentTime;
      // 1. Resonant mortar tube acoustic impulse (heavy air column displacement)
      const subKick = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subKick.type = 'sine';
      subKick.frequency.setValueAtTime(56, now);
      subKick.frequency.exponentialRampToValueAtTime(32, now + 0.075);

      subGain.gain.setValueAtTime(0.55, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      subKick.connect(subGain);
      subGain.connect(this.ctx.destination);
      subKick.start(now);
      subKick.stop(now + 0.085);

      // 2. Propellant chamber gas blast (deep whoosh from mortar muzzle)
      const brownian = this.getBrownianNoiseBuffer();
      if (brownian) {
        const blast = this.ctx.createBufferSource();
        blast.buffer = brownian;
        blast.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.exponentialRampToValueAtTime(140, now + 0.22);
        filter.Q.setValueAtTime(2.0, now);

        const blastGain = this.ctx.createGain();
        blastGain.gain.setValueAtTime(0.45, now);
        blastGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

        blast.connect(filter);
        filter.connect(blastGain);
        blastGain.connect(this.ctx.destination);
        blast.start(now);
        blast.stop(now + 0.25);
      }
    } catch {
      // Audio safety
    }
  }

  // Skyshot Aerial Burst: Seamlessly triggered right when skyshot shells reach apex and detonate in the sky
  // Uses authentic recordings from src/sounds/skyshots.mp3
  public playSkyshotBlast() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    if (!this.skyshotAudioBuffer && !this.isSkyshotLoading) {
      this.preloadAudioFiles();
    }

    if (this.skyshotAudioBuffer) {
      try {
        const now = this.ctx.currentTime;
        const source = this.ctx.createBufferSource();
        source.buffer = this.skyshotAudioBuffer;

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(1.15, now);

        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        source.onended = () => {
          try {
            source.disconnect();
            gainNode.disconnect();
          } catch {
            // noop
          }
        };

        // If audio peaks were extracted from user's skyshots.mp3, pick the next authentic explosion peak
        if (this.skyshotPeaks.length > 0) {
          const peakTime = this.skyshotPeaks[this.skyshotPeakIndex % this.skyshotPeaks.length];
          this.skyshotPeakIndex++;
          // Start 40ms before transient peak so the explosion hits immediately with zero latency!
          const startOffset = Math.max(0, peakTime - 0.04);
          source.start(now, startOffset, 2.2);
          return;
        }

        // Generic cuts fallback from skyshots.mp3
        const cuts = [1.2, 3.5, 6.0, 9.2, 12.5, 16.0, 20.8, 26.2];
        const offset = cuts[this.skyshotPeakIndex % cuts.length];
        this.skyshotPeakIndex++;
        source.start(now, offset, 2.2);
        return;
      } catch (err) {
        console.warn('Error playing skyshots audio buffer:', err);
      }
    }

    // High-fidelity procedural fallback if buffer is still loading
    this.playRocketBurst();
  }

  // Audio-reactive Murgachap Ladi: synchronizes visual bomb bursts with the exact audio peaks of murgachap ladi.mp3
  public playLadiPerformance(options: {
    onPop: (index: number) => void;
    onComplete: () => void;
    maxPops?: number;
  }): () => void {
    this.stopLadiPerformance();
    this.init();

    if (!this.ladiAudioBuffer && !this.isLadiLoading) {
      this.preloadAudioFiles();
    }

    let isStopped = false;
    const maxPops = options.maxPops || 120;

    // If audio buffer is loaded and sound is unmuted, play user's murgachap ladi.mp3
    if (this.ctx && this.ladiAudioBuffer && !this.isMuted) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = this.ladiAudioBuffer;

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(1.1, this.ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        const startTime = this.ctx.currentTime;
        source.start(startTime);
        this.activeLadiSource = source;

        // Use extracted audio peaks or fall back to high-tempo 75ms bursts
        const peaks = this.ladiPeaks.length > 5 ? this.ladiPeaks : Array.from({ length: maxPops }, (_, i) => i * 0.085);
        let currentPeakIdx = 0;
        let totalPopsTriggered = 0;

        const checkFrame = () => {
          if (isStopped || !this.ctx) return;
          const elapsed = this.ctx.currentTime - startTime;

          while (
            currentPeakIdx < peaks.length &&
            elapsed >= peaks[currentPeakIdx] &&
            totalPopsTriggered < maxPops
          ) {
            options.onPop(totalPopsTriggered);
            totalPopsTriggered++;
            currentPeakIdx++;
          }

          const isFinished =
            totalPopsTriggered >= maxPops ||
            (currentPeakIdx >= peaks.length && elapsed > (peaks[peaks.length - 1] || 0) + 0.3) ||
            elapsed >= (this.ladiAudioBuffer?.duration || 28);

          if (isFinished) {
            this.stopLadiPerformance();
            options.onComplete();
            return;
          }

          this.activeLadiRafId = requestAnimationFrame(checkFrame);
        };

        this.activeLadiRafId = requestAnimationFrame(checkFrame);

        return () => {
          isStopped = true;
          this.stopLadiPerformance();
        };
      } catch (err) {
        console.warn('Ladi buffer play fallback:', err);
      }
    }

    // Procedural fallback if audio buffer is still decoding
    let popCount = 0;
    const tickMs = 85;
    const interval = setInterval(() => {
      if (isStopped) {
        clearInterval(interval);
        return;
      }
      this.playLadiPop();
      options.onPop(popCount);
      popCount++;
      if (popCount >= maxPops) {
        clearInterval(interval);
        options.onComplete();
      }
    }, tickMs);

    return () => {
      isStopped = true;
      clearInterval(interval);
      this.stopLadiPerformance();
    };
  }

  // Stop active Murgachap Ladi playback and cancel animation loops
  public stopLadiPerformance() {
    if (this.activeLadiRafId !== null) {
      cancelAnimationFrame(this.activeLadiRafId);
      this.activeLadiRafId = null;
    }
    if (this.activeLadiSource) {
      try {
        this.activeLadiSource.stop();
        this.activeLadiSource.disconnect();
      } catch {
        // noop
      }
      this.activeLadiSource = null;
    }
  }

  // Rapid Ladi (Murgachap Chatai) Firecracker Pop (Authentic rapid-fire paper burst)
  public playLadiPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // 1. Razor-sharp red paper casing burst crack (supersonic snap)
      const crackBuffer = this.createCrackImpulseBuffer(0.024);
      if (crackBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = crackBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        const jitter = (Math.random() - 0.5) * 800;
        filter.frequency.setValueAtTime(3600 + jitter, now);
        filter.Q.setValueAtTime(3.8, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.55 + Math.random() * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.024);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
      }

      // 2. Micro gunpowder burst pop (tight non-linear noise pop, ZERO synthetic pitch oscillator)
      const brownian = this.getBrownianNoiseBuffer();
      if (brownian) {
        const pop = this.ctx.createBufferSource();
        pop.buffer = brownian;
        pop.loop = true;

        const popFilter = this.ctx.createBiquadFilter();
        popFilter.type = 'bandpass';
        popFilter.frequency.setValueAtTime(160 + (Math.random() - 0.5) * 40, now);
        popFilter.Q.setValueAtTime(2.2, now);

        const popGain = this.ctx.createGain();
        popGain.gain.setValueAtTime(0.48 + Math.random() * 0.12, now);
        popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

        pop.connect(popFilter);
        popFilter.connect(popGain);
        popGain.connect(this.ctx.destination);
        pop.start(now);
        pop.stop(now + 0.040);
      }
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
      const duration = 1.3;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Authentic gun-cotton sizzling fuse with rhythmic combustion surges and sputtering sparks
      for (let i = 0; i < bufferSize; i++) {
        const t = i / this.ctx.sampleRate;
        const surge = 0.7 + 0.3 * Math.sin(t * 24);
        const spark = Math.random() > 0.84 ? (Math.random() * 2 - 1) * 2.0 : (Math.random() * 0.35 - 0.17);
        data[i] = spark * surge;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, now);
      filter.frequency.exponentialRampToValueAtTime(4800, now + duration);
      filter.Q.setValueAtTime(2.2, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.7);
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

  // Authentic Multi-Layer Bomb Explosion (Sutli, Atom, Mirchi, Hydrogen, or Gola Bomb)
  // Merges real audio recording from src/sounds/bomb.mp3 with physical shockwave & sub-bass synthesis
  // Perceived volume and concussive intensity get progressively louder and louder according to bomb type!
  public playBombExplosion(
    variant: import('../types/diwali').BombVariant = 'sutli',
    scale: number = 1.0
  ) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    if (!this.bombAudioBuffer && !this.isBombLoading) {
      this.preloadAudioFiles();
    }

    try {
      const now = this.ctx.currentTime;

      // 1. Variant acoustic profiles & sample playback: LOUDER AND LOUDER per bomb type!
      // Hierarchy of loudness:
      // Mirchi Bomb (snappy pop) < Atom Bomb (metallic crack) < Sutli Bomb (King of Diwali) < Hydrogen Mega Bomb (deep earthquake) < Coconut Gola Bomb (colossal fiery blast)
      let sampleVol = 2.4;
      let samplePlaybackRate = 0.98;
      let sampleFilterType: BiquadFilterType = 'peaking';
      let sampleFilterFreq = 650;
      let sampleFilterQ = 1.5;
      let sampleFilterGain = 3;

      let crackFreq = 2500;
      let crackQ = 3.0;
      let crackVol = 2.1;
      let bodyCutoff = 72;
      let bodyVol = 2.0;
      let subKickFreq = 35;
      let subKickVol = 1.5;
      let subKickDur = 0.070;
      let duration = 2.1;
      let distortionAmount = 78;
      let flutterTailVol = 0.60;
      let masterGain = 1.9;

      if (variant === 'mirchi') {
        // Mirchi Bomb: Mini snappy pop, sharp paper crack, light crisp blast
        sampleVol = 0.95;
        samplePlaybackRate = 1.22;
        sampleFilterType = 'highpass';
        sampleFilterFreq = 220;
        sampleFilterQ = 1.0;
        sampleFilterGain = 0;

        crackFreq = 4200;
        crackQ = 2.4;
        crackVol = 1.1;
        bodyCutoff = 135;
        bodyVol = 0.85;
        subKickFreq = 52;
        subKickVol = 0.65;
        subKickDur = 0.045;
        duration = 0.75;
        distortionAmount = 45;
        flutterTailVol = 0.22;
        masterGain = 1.0;
      } else if (variant === 'atom') {
        // Atom Bomb: Concussive metallic triangle packet, sharp acoustic pressure
        sampleVol = 1.6;
        samplePlaybackRate = 1.08;
        sampleFilterType = 'peaking';
        sampleFilterFreq = 2400;
        sampleFilterQ = 2.0;
        sampleFilterGain = 4;

        crackFreq = 3400;
        crackQ = 3.6;
        crackVol = 1.65;
        bodyCutoff = 100;
        bodyVol = 1.4;
        subKickFreq = 42;
        subKickVol = 1.05;
        subKickDur = 0.055;
        duration = 1.35;
        distortionAmount = 65;
        flutterTailVol = 0.38;
        masterGain = 1.4;
      } else if (variant === 'sutli') {
        // Sutli Bomb: The real King of Diwali! Thick jute cord blast, heavy acoustic wallop
        sampleVol = 2.4;
        samplePlaybackRate = 0.98;
        sampleFilterType = 'peaking';
        sampleFilterFreq = 650;
        sampleFilterQ = 1.5;
        sampleFilterGain = 3;

        crackFreq = 2500;
        crackQ = 3.0;
        crackVol = 2.1;
        bodyCutoff = 72;
        bodyVol = 2.0;
        subKickFreq = 35;
        subKickVol = 1.5;
        subKickDur = 0.070;
        duration = 2.1;
        distortionAmount = 78;
        flutterTailVol = 0.60;
        masterGain = 1.9;
      } else if (variant === 'hydrogen') {
        // Hydrogen Bomb: Massive seismic low-end detonation with deep rumbling shockwave
        sampleVol = 3.4;
        samplePlaybackRate = 0.84;
        sampleFilterType = 'lowshelf';
        sampleFilterFreq = 160;
        sampleFilterQ = 1.2;
        sampleFilterGain = 6;

        crackFreq = 2050;
        crackQ = 2.8;
        crackVol = 2.8;
        bodyCutoff = 56;
        bodyVol = 2.7;
        subKickFreq = 30;
        subKickVol = 2.1;
        subKickDur = 0.085;
        duration = 2.7;
        distortionAmount = 90;
        flutterTailVol = 0.85;
        masterGain = 2.5;
      } else if (variant === 'gola') {
        // Coconut Gola Bomb: Deepest hollow wooden boom, colossal air displacement, loudest blast!
        sampleVol = 4.4;
        samplePlaybackRate = 0.72;
        sampleFilterType = 'lowshelf';
        sampleFilterFreq = 140;
        sampleFilterQ = 1.2;
        sampleFilterGain = 8;

        crackFreq = 1750;
        crackQ = 2.5;
        crackVol = 3.5;
        bodyCutoff = 50;
        bodyVol = 3.4;
        subKickFreq = 25;
        subKickVol = 2.7;
        subKickDur = 0.095;
        duration = 3.3;
        distortionAmount = 95;
        flutterTailVol = 1.15;
        masterGain = 3.2;
      }

      const scaleMultiplier = Math.max(0.6, Math.min(2.0, scale));
      const effectiveMasterGain = masterGain * (0.6 + 0.4 * scaleMultiplier);

      // Dedicated dynamics compressor / limiter: combines real recording with synth layers
      // Prevents harsh clipping while enabling massive perceived acoustic loudness and punch
      const masterCompressor = this.ctx.createDynamicsCompressor();
      masterCompressor.threshold.setValueAtTime(-14, now);
      masterCompressor.knee.setValueAtTime(8, now);
      masterCompressor.ratio.setValueAtTime(14, now);
      masterCompressor.attack.setValueAtTime(0.001, now);
      masterCompressor.release.setValueAtTime(0.24, now);

      const masterBus = this.ctx.createGain();
      masterBus.gain.setValueAtTime(effectiveMasterGain, now);

      masterCompressor.connect(masterBus);
      masterBus.connect(this.ctx.destination);

      // LAYER 0: AUTHENTIC RECORDED AUDIO (src/sounds/bomb.mp3)
      if (this.bombAudioBuffer) {
        const bombSource = this.ctx.createBufferSource();
        bombSource.buffer = this.bombAudioBuffer;
        bombSource.playbackRate.setValueAtTime(samplePlaybackRate, now);

        const sampleFilter = this.ctx.createBiquadFilter();
        sampleFilter.type = sampleFilterType;
        sampleFilter.frequency.setValueAtTime(sampleFilterFreq, now);
        if (sampleFilterQ) sampleFilter.Q.setValueAtTime(sampleFilterQ, now);
        if (sampleFilterGain) sampleFilter.gain.setValueAtTime(sampleFilterGain, now);

        const sampleGainNode = this.ctx.createGain();
        sampleGainNode.gain.setValueAtTime(sampleVol, now);
        sampleGainNode.gain.exponentialRampToValueAtTime(
          0.001,
          now + Math.min(this.bombAudioBuffer.duration / samplePlaybackRate, duration)
        );

        bombSource.connect(sampleFilter);
        sampleFilter.connect(sampleGainNode);
        sampleGainNode.connect(masterCompressor);

        bombSource.start(now);
      }

      // LAYER 1: Supersonic Casing Rupture Shockwave Crack (< 45ms)
      const crackBuffer = this.createCrackImpulseBuffer(0.045);
      if (crackBuffer) {
        const crackSource = this.ctx.createBufferSource();
        crackSource.buffer = crackBuffer;

        const crackFilter = this.ctx.createBiquadFilter();
        crackFilter.type = 'bandpass';
        crackFilter.frequency.setValueAtTime(crackFreq, now);
        crackFilter.Q.setValueAtTime(crackQ, now);

        const crackGain = this.ctx.createGain();
        crackGain.gain.setValueAtTime(crackVol, now);
        crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.044);

        crackSource.connect(crackFilter);
        crackFilter.connect(crackGain);
        crackGain.connect(masterCompressor);
        crackSource.start(now);
      }

      // LAYER 2: Turbulent Gunpowder Deflagration Body (Brownian acoustic blast with soft-saturation)
      const brownian = this.getBrownianNoiseBuffer();
      if (brownian) {
        const bodySource = this.ctx.createBufferSource();
        bodySource.buffer = brownian;
        bodySource.loop = true;

        const bodyFilter = this.ctx.createBiquadFilter();
        bodyFilter.type = 'lowpass';
        bodyFilter.frequency.setValueAtTime(bodyCutoff * 2.2, now);
        bodyFilter.frequency.exponentialRampToValueAtTime(bodyCutoff * 0.8, now + 0.22);
        bodyFilter.Q.setValueAtTime(3.2, now);

        const waveShaper = this.ctx.createWaveShaper();
        waveShaper.curve = this.getDistortionCurve(distortionAmount) as Float32Array<ArrayBuffer>;
        waveShaper.oversample = '2x';

        const bodyGain = this.ctx.createGain();
        bodyGain.gain.setValueAtTime(bodyVol, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        bodySource.connect(bodyFilter);
        bodyFilter.connect(waveShaper);
        waveShaper.connect(bodyGain);
        bodyGain.connect(masterCompressor);

        bodySource.start(now);
        bodySource.stop(now + 0.40);
      }

      // LAYER 3: Subsonic Pressure Displacement Thump (Instant chest hit, zero pitch sweep)
      const subKick = this.ctx.createOscillator();
      const subKickGain = this.ctx.createGain();
      subKick.type = 'sine';
      subKick.frequency.setValueAtTime(subKickFreq, now); // Stable subsonic bass, NO sliding pitch!
      subKick.frequency.exponentialRampToValueAtTime(subKickFreq * 0.75, now + subKickDur);

      subKickGain.gain.setValueAtTime(subKickVol, now);
      subKickGain.gain.exponentialRampToValueAtTime(0.0001, now + subKickDur);

      subKick.connect(subKickGain);
      subKickGain.connect(masterCompressor);
      subKick.start(now);
      subKick.stop(now + subKickDur + 0.01);

      // LAYER 4: Jute Twine / Shredded Paper Debris Scatter Hiss
      const sharedNoise = this.getSharedNoiseBuffer();
      if (sharedNoise) {
        const tailSource = this.ctx.createBufferSource();
        tailSource.buffer = sharedNoise;
        tailSource.loop = true;

        const tailFilter = this.ctx.createBiquadFilter();
        tailFilter.type = 'bandpass';
        tailFilter.frequency.setValueAtTime(1400, now);
        tailFilter.Q.setValueAtTime(1.8, now);

        const tailGain = this.ctx.createGain();
        tailGain.gain.setValueAtTime(flutterTailVol, now + 0.02);
        tailGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.65);

        tailSource.connect(tailFilter);
        tailFilter.connect(tailGain);
        tailGain.connect(masterCompressor);

        tailSource.start(now + 0.02);
        tailSource.stop(now + duration * 0.70);
      }

      // LAYER 5: Outdoor Courtyard Flutter Decay (Terrace / alley acoustic reflections)
      this.createCourtyardReverb(now, duration, 0.28 * bodyVol);
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

  // Rocket Ascending Flight Sound (Continuous Screaming Whistle & Exhaust Jet Rush)
  public startRocketFlight(
    rocketId: string = 'default',
    durationSec: number = 3.0,
    variant?: import('../types/diwali').RocketVariant
  ) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // If an instance with this ID already exists, stop it cleanly first
    this.stopRocketFlight(rocketId);

    try {
      const now = this.ctx.currentTime;
      // Adjust flight acoustic duration matching rocket variant
      let actualDuration = Math.max(1.5, durationSec);
      let baseFreq = 620;
      let apexFreq = 4200;
      let whistleVol = 0.38;
      let jetVol = 0.42;

      if (variant === 'mini-whistle-3s') {
        baseFreq = 850;
        apexFreq = 4800;
        whistleVol = 0.44;
        jetVol = 0.34;
      } else if (variant === 'heavy-missile-8s') {
        baseFreq = 480;
        apexFreq = 3600;
        whistleVol = 0.35;
        jetVol = 0.52;
      }

      // Master gain for this rocket's flight audio instance
      const masterFlightGain = this.ctx.createGain();
      masterFlightGain.gain.setValueAtTime(0.01, now);
      masterFlightGain.gain.linearRampToValueAtTime(1.0, now + 0.12);
      masterFlightGain.connect(this.ctx.destination);

      // 1. Iconic Screaming Potassium-Benzoate Whistle
      const carrier = this.ctx.createOscillator();
      const carrierGain = this.ctx.createGain();
      carrier.type = 'sawtooth';
      carrier.frequency.setValueAtTime(baseFreq, now);
      carrier.frequency.exponentialRampToValueAtTime(baseFreq * 2.8, now + actualDuration * 0.45);
      carrier.frequency.exponentialRampToValueAtTime(apexFreq, now + actualDuration);

      // Rapid combustion jitter vibrato (FM modulation creates authentic high-speed scream)
      const mod = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();
      mod.type = 'sine';
      mod.frequency.setValueAtTime(135, now);
      modGain.gain.setValueAtTime(160, now);
      mod.connect(carrier.frequency);

      // Resonant formant filter for piercing whistle
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFreq * 1.8, now);
      filter.frequency.exponentialRampToValueAtTime(apexFreq * 0.9, now + actualDuration);
      filter.Q.setValueAtTime(4.8, now);

      carrierGain.gain.setValueAtTime(0.05, now);
      carrierGain.gain.linearRampToValueAtTime(whistleVol, now + 0.25);
      carrierGain.gain.setValueAtTime(whistleVol * 0.95, now + actualDuration * 0.8);
      carrierGain.gain.exponentialRampToValueAtTime(0.001, now + actualDuration + 0.1);

      carrier.connect(filter);
      filter.connect(carrierGain);
      carrierGain.connect(masterFlightGain);

      mod.start(now);
      carrier.start(now);

      // 2. High-Pressure Burning Propellant Jet Exhaust Roar
      let noiseSource: AudioBufferSourceNode | null = null;
      const noiseGain = this.ctx.createGain();
      const noiseBuffer = this.getSharedNoiseBuffer();
      if (noiseBuffer) {
        noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(800, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(2800, now + actualDuration * 0.5);
        noiseFilter.frequency.exponentialRampToValueAtTime(900, now + actualDuration);

        noiseGain.gain.setValueAtTime(0.08, now);
        noiseGain.gain.linearRampToValueAtTime(jetVol, now + 0.3);
        noiseGain.gain.setValueAtTime(jetVol * 0.9, now + actualDuration * 0.85);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + actualDuration + 0.1);

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterFlightGain);
        noiseSource.start(now);
      }

      // Safety timeout to automatically clean up resources if not stopped at burst
      const stopTimer = setTimeout(() => {
        this.stopRocketFlight(rocketId);
      }, (actualDuration + 0.2) * 1000);

      this.activeRocketFlights.set(rocketId, {
        carrier,
        mod,
        carrierGain,
        noiseSource,
        noiseGain,
        masterGain: masterFlightGain,
        stopTimer,
      });
    } catch {
      // Audio safety
    }
  }

  // Gracefully stops the flying sound when the rocket detonates in the sky
  public stopRocketFlight(rocketId: string = 'default') {
    const flight = this.activeRocketFlights.get(rocketId);
    if (!flight) return;

    this.activeRocketFlights.delete(rocketId);
    clearTimeout(flight.stopTimer);

    if (this.ctx) {
      try {
        const now = this.ctx.currentTime;
        // Fast 30ms ramp-out to transition seamlessly into the explosion with zero clicks
        flight.masterGain.gain.setValueAtTime(flight.masterGain.gain.value, now);
        flight.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

        setTimeout(() => {
          try {
            flight.carrier.stop();
            flight.mod.stop();
            flight.noiseSource?.stop();
            flight.carrier.disconnect();
            flight.mod.disconnect();
            flight.noiseSource?.disconnect();
            flight.masterGain.disconnect();
          } catch {
            // noop
          }
        }, 50);
      } catch {
        // noop
      }
    }
  }

  // Stops all flying rockets (e.g., on mute, screen reset, or arena clean)
  public stopAllRocketFlights() {
    this.activeRocketFlights.forEach((_, id) => {
      this.stopRocketFlight(id);
    });
    this.activeRocketFlights.clear();
  }

  // Rocket Launch Trigger (Plays screaming ascent flight sound)
  public playRocketLaunch(
    durationSec: number = 2.8,
    variant?: import('../types/diwali').RocketVariant
  ) {
    this.startRocketFlight('last-launch', durationSec, variant);
  }

  // Rocket Aerial Sky Burst (Merged with Authentic bomb.mp3 Audio & Sparkling Willow Cascades)
  public playRocketBurst(
    scale: number = 1.0,
    variant?: import('../types/diwali').RocketVariant
  ) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    if (!this.bombAudioBuffer && !this.isBombLoading) {
      this.preloadAudioFiles();
    }

    try {
      const now = this.ctx.currentTime;

      // Celestial blast profiles tailored to rocket type
      let samplePlaybackRate = 1.02;
      let sampleVol = 2.4;
      let crackVol = 1.6;
      let crackFreq = 2600;
      let subBoomVol = 1.5;
      let subBoomFreq = 54;
      let willowVol = 0.45;

      if (variant === 'mini-whistle-3s') {
        // Mini Whistle: Snappier, higher altitude celestial pop
        samplePlaybackRate = 1.15;
        sampleVol = 1.8;
        crackVol = 1.3;
        crackFreq = 3200;
        subBoomVol = 1.0;
        subBoomFreq = 64;
        willowVol = 0.35;
      } else if (variant === 'heavy-missile-8s') {
        // Heavy Missile: Deep, seismic, massive high-altitude detonation
        samplePlaybackRate = 0.85;
        sampleVol = 3.2;
        crackVol = 2.1;
        crackFreq = 2050;
        subBoomVol = 2.1;
        subBoomFreq = 42;
        willowVol = 0.60;
      }

      const effectiveScale = Math.max(0.6, Math.min(2.0, scale));
      const masterGainLevel = (0.75 + 0.35 * effectiveScale);

      // Mastering compressor: gives massive punch and prevents distortion
      const masterCompressor = this.ctx.createDynamicsCompressor();
      masterCompressor.threshold.setValueAtTime(-14, now);
      masterCompressor.knee.setValueAtTime(8, now);
      masterCompressor.ratio.setValueAtTime(12, now);
      masterCompressor.attack.setValueAtTime(0.001, now);
      masterCompressor.release.setValueAtTime(0.24, now);

      const masterBus = this.ctx.createGain();
      masterBus.gain.setValueAtTime(masterGainLevel, now);
      masterCompressor.connect(masterBus);
      masterBus.connect(this.ctx.destination);

      // LAYER 0: AUTHENTIC RECORDED AUDIO (src/sounds/bomb.mp3 for the Rocket Sky Burst!)
      if (this.bombAudioBuffer) {
        const bombSource = this.ctx.createBufferSource();
        bombSource.buffer = this.bombAudioBuffer;
        bombSource.playbackRate.setValueAtTime(samplePlaybackRate, now);

        // High-altitude atmospheric peaking filter for open-air sky acoustic projection
        const skyFilter = this.ctx.createBiquadFilter();
        skyFilter.type = 'peaking';
        skyFilter.frequency.setValueAtTime(1400, now);
        skyFilter.Q.setValueAtTime(1.2, now);
        skyFilter.gain.setValueAtTime(3.5, now);

        const sampleGain = this.ctx.createGain();
        sampleGain.gain.setValueAtTime(sampleVol, now);
        sampleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

        bombSource.connect(skyFilter);
        skyFilter.connect(sampleGain);
        sampleGain.connect(masterCompressor);

        bombSource.start(now);
      }

      // LAYER 1: Distant Atmospheric Supersonic Sky Crack
      const crackBuffer = this.createCrackImpulseBuffer(0.048);
      if (crackBuffer) {
        const crack = this.ctx.createBufferSource();
        crack.buffer = crackBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(crackFreq, now);
        filter.Q.setValueAtTime(2.6, now);

        const crackGain = this.ctx.createGain();
        crackGain.gain.setValueAtTime(crackVol, now);
        crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.046);

        crack.connect(filter);
        filter.connect(crackGain);
        crackGain.connect(masterCompressor);
        crack.start(now);
      }

      // LAYER 2: Low Rolling Atmospheric Sky Boom (Brownian deflagration)
      const brownian = this.getBrownianNoiseBuffer();
      if (brownian) {
        const sub = this.ctx.createBufferSource();
        sub.buffer = brownian;
        sub.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(subBoomFreq * 2.2, now);
        filter.frequency.exponentialRampToValueAtTime(subBoomFreq * 0.75, now + 0.45);
        filter.Q.setValueAtTime(2.6, now);

        const subGain = this.ctx.createGain();
        subGain.gain.setValueAtTime(subBoomVol, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);

        sub.connect(filter);
        filter.connect(subGain);
        subGain.connect(masterCompressor);
        sub.start(now);
        sub.stop(now + 0.62);
      }

      // LAYER 3: Cascading Sparkling Willow / Peony Crackle (Stars drifting down)
      const willowSize = Math.floor(this.ctx.sampleRate * 1.5);
      const willowBuffer = this.ctx.createBuffer(1, willowSize, this.ctx.sampleRate);
      const willowData = willowBuffer.getChannelData(0);
      for (let i = 0; i < willowSize; i++) {
        const progress = i / willowSize;
        const prob = 0.86 - progress * 0.12;
        const amp = Math.pow(1 - progress, 1.15);
        willowData[i] = Math.random() > prob ? (Math.random() * 2 - 1) * 1.9 * amp : (Math.random() * 0.06 - 0.03);
      }

      const willowSource = this.ctx.createBufferSource();
      willowSource.buffer = willowBuffer;

      const willowFilter = this.ctx.createBiquadFilter();
      willowFilter.type = 'highpass';
      willowFilter.frequency.setValueAtTime(3000, now);

      const willowGain = this.ctx.createGain();
      willowGain.gain.setValueAtTime(willowVol, now + 0.08);
      willowGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      willowSource.connect(willowFilter);
      willowFilter.connect(willowGain);
      willowGain.connect(masterCompressor);
      willowSource.start(now + 0.08);

      // LAYER 4: Open Sky Distant Reverb Echo
      this.createCourtyardReverb(now, 2.4, 0.28 * subBoomVol);
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

  // Selection / placement chime disabled per user instruction:
  // "remove the sound of selection of anything don't add any other sound"
  public playDiwaliChime() {
    // Intentionally silent
  }
}

export const soundEngine = new DiwaliSoundEngine();
