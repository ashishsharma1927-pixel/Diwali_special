import React, { useEffect, useRef } from 'react';
import type {
  ActiveAnaar,
  FlyingRocket,
  GroundChakri,
  BombExplosionEvent,
  ActiveFuljhadi,
} from '../types/diwali';
import { soundEngine } from '../utils/soundEngine';

interface DiwaliCanvasProps {
  rockets: FlyingRocket[];
  onRocketExplode: (rocket: FlyingRocket) => void;
  anaars: ActiveAnaar[];
  chakris: GroundChakri[];
  fuljhadis?: ActiveFuljhadi[];
  onChakriUpdate?: (id: string, x: number, y: number) => void;
  onChakriComplete?: (id: string, x?: number, y?: number) => void;
  bombExplosions: BombExplosionEvent[];
  screenShake: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  gravity: number;
  drag?: number;
  flicker?: boolean;
  trail?: { x: number; y: number }[];
  isSpark?: boolean;
  isScrap?: boolean;
  width?: number;
  height?: number;
  angle?: number;
  vAngle?: number;
  targetGroundY?: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
}

interface FloatingLantern {
  x: number;
  y: number;
  vy: number;
  vx: number;
  swayPhase: number;
  size: number;
  color: string;
}

interface LightFlash {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

const getIsMobileOrLowRAM = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.innerWidth < 768 ||
    (typeof navigator !== 'undefined' &&
      typeof navigator.hardwareConcurrency === 'number' &&
      navigator.hardwareConcurrency <= 4)
  );
};

export const DiwaliCanvas: React.FC<DiwaliCanvasProps> = ({
  rockets,
  onRocketExplode,
  anaars,
  chakris,
  fuljhadis = [],
  onChakriUpdate,
  onChakriComplete,
  bombExplosions,
  screenShake,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const flashesRef = useRef<LightFlash[]>([]);
  const starsRef = useRef<Star[]>([]);
  const lanternsRef = useRef<FloatingLantern[]>([]);
  const handledExplosionsRef = useRef<Set<string>>(new Set());
  const shakeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  // Keep dynamic props in ref so the animation loop runs uninterrupted
  const propsRef = useRef({
    rockets,
    onRocketExplode,
    anaars,
    chakris,
    fuljhadis,
    onChakriUpdate,
    onChakriComplete,
  });

  useEffect(() => {
    propsRef.current = {
      rockets,
      onRocketExplode,
      anaars,
      chakris,
      fuljhadis,
      onChakriUpdate,
      onChakriComplete,
    };
  }, [rockets, onRocketExplode, anaars, chakris, fuljhadis, onChakriUpdate, onChakriComplete]);

  useEffect(() => {
    if (screenShake > 0) {
      shakeRef.current = Math.max(shakeRef.current, screenShake);
    }
  }, [screenShake]);

  // Initialize background celestial stars & sky lanterns (optimized for device capability)
  useEffect(() => {
    const isMobile = getIsMobileOrLowRAM();
    const stars: Star[] = [];
    const count = isMobile ? 32 : 80;
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random() * 0.75, // Upper 75% of sky
        radius: Math.random() * 1.5 + 0.6,
        baseAlpha: Math.random() * 0.6 + 0.3,
        twinkleSpeed: Math.random() * 0.05 + 0.02,
        phase: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;

    // Floating festive sky lanterns (Akash Kandils)
    const lanterns: FloatingLantern[] = [];
    const lanternCount = isMobile ? 3 : 6;
    for (let i = 0; i < lanternCount; i++) {
      lanterns.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.5 + 40,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(Math.random() * 0.25 + 0.15),
        swayPhase: Math.random() * Math.PI * 2,
        size: Math.random() * 10 + 16,
        color: ['#f97316', '#fbbf24', '#ef4444', '#ec4899'][i % 4],
      });
    }
    lanternsRef.current = lanterns;
  }, []);

  // Spawn Bomb Explosion Particles when a bomb explodes
  // Spawn Bomb Explosion Particles when a bomb explodes (Tailored to variant & scale, optimized budget)
  useEffect(() => {
    if (bombExplosions.length === 0) return;

    // Prune handled cache to prevent memory buildup
    if (handledExplosionsRef.current.size > 60) {
      handledExplosionsRef.current.clear();
    }

    // Adaptive particle limits based on device capability (low-RAM friendly)
    const isMobile = getIsMobileOrLowRAM();
    const MAX_PARTICLES = isMobile ? 220 : 480;
    if (particlesRef.current.length > MAX_PARTICLES) {
      // Trim oldest particles to keep frame budget snappy and eliminate GC stutter
      particlesRef.current.splice(0, particlesRef.current.length - (isMobile ? 150 : 320));
    }

    bombExplosions.forEach((exp) => {
      if (handledExplosionsRef.current.has(exp.id)) return;
      handledExplosionsRef.current.add(exp.id);

      const px = exp.x;
      const py = exp.y;
      const variant = exp.variant || 'sutli';
      const bScale = exp.scale || (variant === 'mirchi' ? 0.65 : variant === 'hydrogen' ? 1.4 : variant === 'gola' ? 1.55 : 1.0);

      // Keep maximum 2 concurrent light flashes
      if (flashesRef.current.length >= 2) {
        flashesRef.current.shift();
      }

      // 0. High-Intensity Explosive Light Flash
      const flashMaxRadius = Math.round(280 * bScale);
      flashesRef.current.push({
        x: px,
        y: py,
        radius: 25 * bScale,
        maxRadius: flashMaxRadius,
        alpha: variant === 'gola' || variant === 'hydrogen' ? 0.95 : 0.82,
        color: variant === 'mirchi' ? '#fee2e2' : variant === 'atom' ? '#fef08a' : '#ffedd5',
      });

      // Keep maximum 4 concurrent shockwaves
      if (shockwavesRef.current.length >= 4) {
        shockwavesRef.current.shift();
      }

      // 1. Concentric Shockwave Ring
      shockwavesRef.current.push({
        x: px,
        y: py,
        radius: 10,
        maxRadius: 220 * bScale,
        alpha: 0.95,
        color: variant === 'atom' ? '#facc15' : variant === 'mirchi' ? '#ef4444' : '#ffffff',
      });

      if (!isMobile && (variant === 'gola' || variant === 'hydrogen')) {
        shockwavesRef.current.push({
          x: px,
          y: py,
          radius: 5,
          maxRadius: 280 * bScale,
          alpha: 0.85,
          color: '#fbbf24',
        });
      }

      // 2. High-speed explosive fire sparks & blazing embers (Vivid, punchy, optimized count)
      const baseSpark = variant === 'mirchi' ? 32 : variant === 'atom' ? 44 : variant === 'hydrogen' ? 56 : variant === 'gola' ? 62 : 46;
      const sparkCount = Math.round(baseSpark * (isMobile ? 0.55 : 1.0));
      const sparkColors = variant === 'mirchi'
        ? ['#ffffff', '#fecaca', '#ef4444', '#dc2626', '#f59e0b']
        : variant === 'atom'
        ? ['#ffffff', '#fef08a', '#22c55e', '#16a34a', '#facc15', '#ef4444']
        : variant === 'gola'
        ? ['#ffffff', '#fef08a', '#f59e0b', '#ea580c', '#dc2626', '#b45309']
        : ['#ffffff', '#fffbeb', '#fef08a', '#facc15', '#fbbf24', '#f97316', '#ef4444'];

      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 32 + 24) * Math.min(1.45, bScale);
        particlesRef.current.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (Math.random() * 6 * bScale),
          color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
          size: (Math.random() * 3.5 + 1.5) * Math.min(1.3, bScale),
          alpha: 1,
          decay: Math.random() * 0.024 + 0.016, // Majestic lingering explosive sparkles
          gravity: 0.65,
          drag: 0.988,
          isSpark: true,
          flicker: Math.random() > 0.4,
        });
      }

      // 3. Shrapnel, Confetti, Jute fibers & Flying Murgachap Red Paper Shreds
      const isLadiPop = exp.id.includes('ladi') || variant === 'mirchi';
      const shrapnelCount = isLadiPop ? (isMobile ? 4 : 7) : Math.round((isMobile ? 8 : 16) * bScale);

      for (let i = 0; i < shrapnelCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Fragments spread widely around the screen
        const speed = isLadiPop
          ? Math.random() * 18 + 8 // Fluttering spread across surrounding screen
          : (Math.random() * 22 + 14) * bScale;

        const shrapnelColor = isLadiPop
          ? (Math.random() < 0.70 ? '#dc2626' : (Math.random() < 0.85 ? '#b91c1c' : '#facc15')) // Red firecracker paper with gold rooster label shreds
          : variant === 'atom'
          ? (Math.random() > 0.5 ? '#16a34a' : '#f59e0b')
          : (Math.random() > 0.5 ? '#16a34a' : '#b45309');

        // For ladi fragments, they flutter, land on the screen floor, and automatically disappear after 5 seconds (decay: 0.0033 = ~5000ms at 60fps)
        const decayRate = isLadiPop ? 0.0033 : (Math.random() * 0.024 + 0.016);
        const groundY = isLadiPop ? py + (Math.random() * 90 - 20) : undefined;

        particlesRef.current.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (isLadiPop ? 4.5 : 5.0),
          color: shrapnelColor,
          size: (Math.random() * 3.5 + 2) * bScale,
          alpha: 1.0,
          decay: decayRate,
          gravity: isLadiPop ? 0.28 : 0.75, // Paper flutters down gently like real torn firecracker wraps
          drag: isLadiPop ? 0.94 : 0.985,
          isScrap: isLadiPop,
          width: isLadiPop ? (Math.random() * 5 + 4) : undefined,
          height: isLadiPop ? (Math.random() * 4 + 3) : undefined,
          angle: Math.random() * Math.PI * 2,
          vAngle: (Math.random() - 0.5) * 0.25,
          targetGroundY: groundY,
        });
      }

      // 4. Expanding smoke puffs
      const smokeCount = Math.round(10 * bScale);
      for (let i = 0; i < smokeCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 6 + 3) * bScale;
        particlesRef.current.push({
          x: px + (Math.random() - 0.5) * 16 * bScale,
          y: py + (Math.random() - 0.5) * 16 * bScale,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.0,
          color: variant === 'gola' ? 'rgba(180, 150, 140, 0.5)' : 'rgba(210, 210, 225, 0.45)',
          size: (Math.random() * 20 + 14) * bScale,
          alpha: 0.55,
          decay: Math.random() * 0.018 + 0.012,
          gravity: -0.010,
          drag: 0.978,
        });
      }
    });
  }, [bombExplosions]);

  // Main 60FPS animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      const now = performance.now();
      const elapsedMs = lastFrameTimeRef.current === 0 ? 16.67 : Math.min(now - lastFrameTimeRef.current, 100);
      lastFrameTimeRef.current = now;
      // Realistic, natural physics action tempo
      const dt = Math.max(0.75, Math.min(elapsedMs / 16.67, 1.5)) * 0.95;

      const { rockets, onRocketExplode, anaars, chakris, onChakriUpdate, onChakriComplete } = propsRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Canvas-level screen shake (smooth 60FPS frame decay)
      if (shakeRef.current > 0.04) {
        const shakeAmp = Math.min(shakeRef.current * 8, 12);
        ctx.translate((Math.random() - 0.5) * shakeAmp, (Math.random() - 0.5) * shakeAmp);
        shakeRef.current *= Math.pow(0.88, dt);
      }

      // Render Twinkling Stars
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const alpha = s.baseAlpha + Math.sin(now * s.twinkleSpeed + s.phase) * 0.3;
        ctx.fillStyle = `rgba(255, 250, 230, ${Math.max(0.1, Math.min(1, alpha))})`;
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render Floating Sky Lanterns (Akash Kandils)
      const lanterns = lanternsRef.current;
      for (let i = 0; i < lanterns.length; i++) {
        const l = lanterns[i];
        l.y += l.vy * dt;
        l.swayPhase += 0.02 * dt;
        l.x += (l.vx + Math.sin(l.swayPhase) * 0.3) * dt;

        // Wrap around if floating off top
        if (l.y < -40) {
          l.y = canvas.height + 20;
          l.x = Math.random() * canvas.width;
        }

        // Glow gradient
        const rad = l.size;
        const glow = ctx.createRadialGradient(l.x, l.y, 2, l.x, l.y, rad * 1.8);
        glow.addColorStop(0, 'rgba(255, 220, 120, 0.9)');
        glow.addColorStop(0.4, 'rgba(249, 115, 22, 0.4)');
        glow.addColorStop(1, 'rgba(249, 115, 22, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(l.x, l.y, rad * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Lantern body
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.fillStyle = l.color;
        ctx.beginPath();
        ctx.roundRect(-rad * 0.45, -rad * 0.6, rad * 0.9, rad * 1.2, 4);
        ctx.fill();

        // Golden tassel
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, rad * 0.6);
        ctx.lineTo(Math.sin(l.swayPhase * 1.5) * 3, rad * 0.6 + rad * 0.5);
        ctx.stroke();
        ctx.restore();
      }

      // -------------------------------------------------------------
      // 1. ANAAR (FLOWERPOT FOUNTAIN) - High-velocity vertical eruption
      // -------------------------------------------------------------
      const isMobile = getIsMobileOrLowRAM();
      anaars.forEach((anaar) => {
        const elapsed = now - anaar.startTime;
        const totalDuration = anaar.duration || 15000;
        if (elapsed > totalDuration) return;

        // Use pre-computed coordinates directly: zero layout thrashing (no getBoundingClientRect in RAF)
        const anaarX = anaar.x;
        const anaarY = anaar.y;

        const progress = elapsed / totalDuration;
        const aScale = anaar.scale || (totalDuration > 12000 ? 1.4 : totalDuration < 8000 ? 0.75 : 1.0);

        let intensity = 1.0;
        let speedMultiplier = 1.0;
        let particlesPerFrame = Math.round((isMobile ? 7 : 16) * aScale);

        if (progress < 0.12) {
          intensity = progress / 0.12;
          speedMultiplier = 0.65 + 0.35 * intensity;
          particlesPerFrame = Math.floor((isMobile ? 4 : (7 + 8 * intensity)) * aScale);
        } else if (progress > 0.82) {
          const coolDown = (progress - 0.82) / 0.18;
          intensity = Math.max(0.05, 1 - coolDown);
          speedMultiplier = Math.max(0.45, 1 - coolDown * 0.55);
          particlesPerFrame = Math.floor((isMobile ? 5 : 14) * intensity * aScale);
        } else {
          intensity = 1.0;
          speedMultiplier = 1.35 * (0.8 + 0.3 * aScale);
          particlesPerFrame = Math.round((isMobile ? 8 : 20) * aScale);
        }

        const colors = [
          '#ffffff',
          '#fef08a',
          '#facc15',
          '#fbbf24',
          '#f97316',
          '#ff4500',
          anaar.color,
          anaar.secondaryColor,
        ];

        for (let i = 0; i < particlesPerFrame; i++) {
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * (0.35 * intensity);
          const launchSpeed = (Math.random() * 26 + 36) * speedMultiplier;

          particlesRef.current.push({
            x: anaarX + (Math.random() - 0.5) * (12 * aScale),
            y: anaarY - 18 * aScale,
            vx: Math.cos(angle) * launchSpeed + (Math.random() - 0.5) * 4,
            vy: Math.sin(angle) * launchSpeed,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: (Math.random() * 3.5 + 1.5) * aScale,
            alpha: 1.0,
            decay: Math.random() * 0.038 + 0.024,
            gravity: 0.96,
            drag: 0.988,
            isSpark: true,
          });
        }

        // Anaar cone base light wash (desktop only to protect mobile fill rate)
        if (!isMobile) {
          const baseGlow = ctx.createRadialGradient(anaarX, anaarY, 8, anaarX, anaarY, 260 * intensity * aScale);
          baseGlow.addColorStop(0, 'rgba(255, 235, 160, 0.55)');
          baseGlow.addColorStop(0.5, 'rgba(249, 115, 22, 0.25)');
          baseGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = baseGlow;
          ctx.beginPath();
          ctx.arc(anaarX, anaarY, 260 * intensity * aScale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // -------------------------------------------------------------
      // 1.5 FULJHADI (SPARKLERS) - Starburst iron spark spraying
      // -------------------------------------------------------------
      const activeFuljhadis = propsRef.current.fuljhadis || [];
      activeFuljhadis.forEach((f) => {
        const elapsed = now - f.startTime;
        if (elapsed > f.duration) return;

        // Use pre-computed coordinates directly: zero layout thrashing
        const fx = f.x;
        const fy = f.y;

        // Branching starry iron sparks
        const sparkCount = isMobile ? 4 : 8;
        const sparkColors = ['#ffffff', '#fffbeb', '#fef08a', '#facc15', '#f97316', f.color];
        for (let i = 0; i < sparkCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const spd = Math.random() * 12 + 6;
          particlesRef.current.push({
            x: fx + (Math.random() - 0.5) * 6,
            y: fy + (Math.random() - 0.5) * 6,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd + 0.4,
            color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
            size: Math.random() * 2.8 + 1.2,
            alpha: 1,
            decay: Math.random() * 0.045 + 0.030,
            gravity: 0.35,
            drag: 0.965,
            isSpark: true,
            flicker: true,
          });
        }

        // Core incandescent aura (desktop only for low-RAM performance)
        if (!isMobile) {
          const aura = ctx.createRadialGradient(fx, fy, 2, fx, fy, 45);
          aura.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          aura.addColorStop(0.35, 'rgba(250, 204, 21, 0.65)');
          aura.addColorStop(0.75, 'rgba(249, 115, 22, 0.25)');
          aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = aura;
          ctx.beginPath();
          ctx.arc(fx, fy, 45, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // -------------------------------------------------------------
      // 2. CHAKRI (GROUND SPINNER) - High-speed dynamic spin & ground run
      // -------------------------------------------------------------
      chakris.forEach((chk) => {
        const elapsed = now - chk.startTime;
        const totalDuration = chk.duration || 13000;
        if (elapsed > totalDuration) {
          if (onChakriComplete) onChakriComplete(chk.id, chk.x, chk.y);
          return;
        }

        const remainingRatio = 1 - elapsed / totalDuration;
        const speedFactor = Math.max(0.70, Math.pow(remainingRatio, 0.35));
        const spinSpeed = chk.rotSpeed * speedFactor;

        chk.angle += spinSpeed * dt;
        chk.x += chk.vx * speedFactor * dt;
        chk.y += chk.vy * speedFactor * dt;

        // Bounce smoothly off active screen edges
        const marginX = 40;
        const marginTop = 40;
        const marginBottom = canvas.height - 40;
        if (chk.x < marginX) {
          chk.x = marginX;
          chk.vx = Math.abs(chk.vx);
        } else if (chk.x > canvas.width - marginX) {
          chk.x = canvas.width - marginX;
          chk.vx = -Math.abs(chk.vx);
        }
        if (chk.y < marginTop) {
          chk.y = marginTop;
          chk.vy = Math.abs(chk.vy);
        } else if (chk.y > marginBottom) {
          chk.y = marginBottom;
          chk.vy = -Math.abs(chk.vy);
        }

        if (onChakriUpdate) {
          onChakriUpdate(chk.id, chk.x, chk.y);
        }

        // Spew rotating spiral arms of high-speed sparks!
        const cScale = chk.scale || (totalDuration > 12000 ? 1.35 : totalDuration < 8000 ? 0.75 : 1.0);
        const numArms = isMobile ? 2 : 3;
        const chkColors = ['#fde047', '#fbbf24', '#f97316', '#ffffff', '#38bdf8'];
        const sparksPerArm = isMobile ? 2 : Math.max(2, Math.round(3 * cScale));

        for (let a = 0; a < numArms; a++) {
          const armAngle = chk.angle + (a * Math.PI * 2) / numArms;
          for (let s = 0; s < sparksPerArm; s++) {
            const spread = (Math.random() - 0.5) * 0.3;
            const spd = (Math.random() * 20 + 24) * speedFactor * (0.85 + 0.25 * cScale);
            particlesRef.current.push({
              x: chk.x,
              y: chk.y,
              vx: Math.cos(armAngle + spread) * spd,
              vy: Math.sin(armAngle + spread) * spd * 0.5,
              color: chkColors[Math.floor(Math.random() * chkColors.length)],
              size: (Math.random() * 2.8 + 1.2) * cScale,
              alpha: 1,
              decay: Math.random() * 0.055 + 0.038,
              gravity: 0.65,
              drag: 0.982,
              isSpark: true,
            });
          }
        }

        // Draw spinning luminous core circle on ground
        ctx.save();
        ctx.translate(chk.x, chk.y);
        ctx.rotate(chk.angle);
        if (!isMobile) {
          const coreGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, 45 * speedFactor * cScale);
          coreGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          coreGlow.addColorStop(0.3, 'rgba(251, 191, 36, 0.7)');
          coreGlow.addColorStop(0.7, 'rgba(239, 68, 68, 0.3)');
          coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = coreGlow;
        } else {
          ctx.fillStyle = 'rgba(251, 191, 36, 0.6)';
        }
        ctx.beginPath();
        ctx.arc(0, 0, (isMobile ? 28 : 45) * speedFactor * cScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // -------------------------------------------------------------
      // 3. ROCKETS IN FLIGHT - High-Speed screaming thrust & grand blast
      // -------------------------------------------------------------
      rockets.forEach((rkt) => {
        if (rkt.exploded) return;

        // Initialize dynamic flight timers & heading
        rkt.flightTime = (rkt.flightTime || 0) + 1 * dt;
        rkt.wobblePhase = (rkt.wobblePhase || Math.random() * Math.PI * 2) + 0.18 * dt;
        const maxFlight = rkt.maxFlightTime || 95;

        // Skyshot mortar shells shoot straight up; rockets have aerobatic flight
        if (rkt.id.includes('skyshot')) {
          rkt.heading = -Math.PI / 2 + Math.sin(rkt.wobblePhase * 0.8) * 0.05;
        } else if (rkt.flightTime < 14) {
          rkt.heading = -Math.PI / 2 + Math.sin(rkt.wobblePhase) * 0.10;
        } else {
          let desiredHeading = rkt.heading ?? -Math.PI / 2;
          desiredHeading += Math.sin(rkt.wobblePhase * 1.5) * 0.30;

          const marginX = 70;
          const marginTop = 60;
          const marginBottom = canvas.height * 0.80;
          
          if (rkt.x < marginX) {
            desiredHeading = (Math.random() * 0.5) - 0.25;
          } else if (rkt.x > canvas.width - marginX) {
            desiredHeading = Math.PI + (Math.random() * 0.5 - 0.25);
          }
          if (rkt.y < marginTop) {
            desiredHeading = Math.PI / 2 + (Math.random() * 0.6 - 0.3);
          } else if (rkt.y > marginBottom) {
            desiredHeading = -Math.PI / 2 + (Math.random() * 0.6 - 0.3);
          }

          let angleDiff = desiredHeading - (rkt.heading ?? -Math.PI / 2);
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          rkt.heading = (rkt.heading ?? -Math.PI / 2) + Math.max(-0.48, Math.min(0.48, angleDiff)) * dt;
        }

        // Pacing: Skyshots ascend slowly and gracefully (6-7.5px/frame); rockets soar fast at 13-16px/frame
        const isSkyShot = rkt.id.includes('skyshot');
        const baseSpeed = isSkyShot ? 6.8 : 13.5;
        const flightSpeed = baseSpeed + Math.sin(rkt.flightTime * 0.2) * (isSkyShot ? 0.8 : 2.5);
        rkt.vx = Math.cos(rkt.heading) * flightSpeed;
        rkt.vy = Math.sin(rkt.heading) * flightSpeed;
        rkt.x += rkt.vx * dt;
        rkt.y += rkt.vy * dt;

        // Rocket exhaust sparks
        const exhaustAngle = rkt.heading + Math.PI;
        for (let i = 0; i < 5; i++) {
          const spread = (Math.random() - 0.5) * 0.55;
          const sparkSpeed = Math.random() * 12 + 8;
          particlesRef.current.push({
            x: rkt.x + (Math.random() - 0.5) * 6,
            y: rkt.y + (Math.random() - 0.5) * 6,
            vx: Math.cos(exhaustAngle + spread) * sparkSpeed,
            vy: Math.sin(exhaustAngle + spread) * sparkSpeed,
            color: Math.random() > 0.35 ? '#ffffff' : (Math.random() > 0.5 ? rkt.trailColor : '#ff9900'),
            size: Math.random() * 3.5 + 1.5,
            alpha: 1,
            decay: 0.055,
            gravity: 0.35,
            drag: 0.980,
            isSpark: true,
          });
        }

        // Draw Rocket Model
        ctx.save();
        ctx.translate(rkt.x, rkt.y);
        ctx.rotate(rkt.heading + Math.PI / 2);

        const rktGlow = ctx.createRadialGradient(0, 0, 5, 0, 0, 36);
        rktGlow.addColorStop(0, 'rgba(255, 235, 150, 0.5)');
        rktGlow.addColorStop(0.5, 'rgba(249, 115, 22, 0.2)');
        rktGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = rktGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 36, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 16);
        ctx.lineTo(0, 65);
        ctx.stroke();

        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(-7, 20);
        ctx.lineTo(-16, 32);
        ctx.lineTo(-7, 32);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(7, 20);
        ctx.lineTo(16, 32);
        ctx.lineTo(7, 32);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = rkt.color;
        ctx.fillRect(-7, -18, 14, 38);

        ctx.fillStyle = '#fde047';
        ctx.fillRect(-7, -6, 14, 7);
        ctx.fillRect(-7, 10, 14, 6);

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(0, -36);
        ctx.lineTo(-9, -18);
        ctx.lineTo(9, -18);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(-6, 20);
        ctx.lineTo(0, 44 + Math.random() * 12);
        ctx.lineTo(6, 20);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.moveTo(-4, 20);
        ctx.lineTo(0, 32 + Math.random() * 8);
        ctx.lineTo(4, 20);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-2, 20);
        ctx.lineTo(0, 20 + Math.random() * 6);
        ctx.lineTo(2, 20);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // Rocket Blast: High-Speed Celestial Peony Burst
        const rScale = rkt.scale || (maxFlight > 300 ? 1.35 : maxFlight < 200 ? 0.75 : 1.0);
        if (rkt.flightTime >= maxFlight) {
          rkt.exploded = true;
          onRocketExplode(rkt);
          soundEngine.playRocketBurst();

          const burstColors = [
            rkt.color,
            '#fde047',
            '#ffffff',
            '#ec4899',
            '#06b6d4',
            '#a855f7',
            '#10b981',
            '#f97316',
            '#f43f5e',
          ];
          const count = Math.round(75 * rScale);
          for (let p = 0; p < count; p++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = (Math.random() * 32 + 24) * Math.min(1.4, rScale);
            particlesRef.current.push({
              x: rkt.x,
              y: rkt.y,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              color: burstColors[Math.floor(Math.random() * burstColors.length)],
              size: (Math.random() * 3.8 + 1.8) * rScale,
              alpha: 1,
              decay: Math.random() * 0.022 + 0.014, // Rich, lingering celestial peony flower
              gravity: 0.58,
              drag: 0.985,
              isSpark: true,
            });
          }

          // Willow Sparkles
          const willowCount = Math.round(28 * rScale);
          for (let s = 0; s < willowCount; s++) {
            const ang = Math.random() * Math.PI * 2;
            const v = (Math.random() * 18 + 6) * rScale;
            particlesRef.current.push({
              x: rkt.x,
              y: rkt.y,
              vx: Math.cos(ang) * v,
              vy: Math.sin(ang) * v,
              color: '#fef08a',
              size: (Math.random() * 3 + 1.2) * rScale,
              alpha: 1,
              decay: Math.random() * 0.020 + 0.012,
              gravity: 0.40,
              drag: 0.982,
              isSpark: true,
              flicker: true,
            });
          }

          shockwavesRef.current.push({
            x: rkt.x,
            y: rkt.y,
            radius: 12,
            maxRadius: 210 * rScale,
            alpha: 1.0,
            color: '#fef08a',
          });
          shockwavesRef.current.push({
            x: rkt.x,
            y: rkt.y,
            radius: 6,
            maxRadius: 150 * rScale,
            alpha: 0.85,
            color: '#ffffff',
          });
        }
      });

      // -------------------------------------------------------------
      // 4. SHOCKWAVES (Optimized high-speed blast ring)
      // -------------------------------------------------------------
      const shockwaves = shockwavesRef.current;
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += (38 + (sw.maxRadius - sw.radius) * 0.35) * dt;
        sw.alpha *= Math.pow(0.72, dt);

        if (sw.alpha < 0.03 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = sw.color;
        ctx.lineWidth = Math.max(1, 4 * sw.alpha);
        ctx.globalAlpha = sw.alpha;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      // -------------------------------------------------------------
      // 4.5. EXPLOSIVE LIGHT FLASHES (Fast ~3 frame flash)
      // -------------------------------------------------------------
      const flashes = flashesRef.current;
      for (let i = flashes.length - 1; i >= 0; i--) {
        const fl = flashes[i];
        fl.radius += 48 * dt;
        fl.alpha *= Math.pow(0.50, dt);

        if (fl.alpha <= 0.03 || fl.radius >= fl.maxRadius) {
          flashes.splice(i, 1);
          continue;
        }

        const grad = ctx.createRadialGradient(fl.x, fl.y, 4, fl.x, fl.y, fl.radius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${fl.alpha * 0.95})`);
        grad.addColorStop(0.35, `rgba(254, 240, 138, ${fl.alpha * 0.6})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(fl.x, fl.y, fl.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // -------------------------------------------------------------
      // 5. UPDATE & RENDER ALL PARTICLES (Delta-time integrated 60FPS loop)
      // -------------------------------------------------------------
      const MAX_ACTIVE = isMobile ? 220 : 480;
      if (particlesRef.current.length > MAX_ACTIVE) {
        particlesRef.current.splice(0, particlesRef.current.length - (isMobile ? 150 : 320));
      }

      const particles = particlesRef.current;
      let aliveCount = 0;
      const pLen = particles.length;
      const cHeight = canvas.height + 30;

      for (let i = 0; i < pLen; i++) {
        const p = particles[i];

        if (p.isScrap) {
          // Paper shreds flutter down and settle on the floor
          if (p.targetGroundY && p.y >= p.targetGroundY) {
            p.vx *= 0.70;
            p.vy = 0;
            p.gravity = 0;
          } else {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += p.gravity * dt;
            if (p.drag) {
              p.vx *= Math.pow(p.drag, dt);
              p.vy *= Math.pow(p.drag, dt);
            }
          }
          if (p.vAngle && (!p.targetGroundY || p.y < p.targetGroundY)) {
            p.angle = (p.angle || 0) + p.vAngle * dt;
          }
        } else {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += p.gravity * dt;
          if (p.drag) {
            p.vx *= Math.pow(p.drag, dt);
            p.vy *= Math.pow(p.drag, dt);
          }
        }

        p.alpha -= p.decay * dt;

        if (p.alpha > 0.02 && p.y <= cHeight) {
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;

          if (p.isScrap) {
            // Render authentic fluttering rectangular paper scrap
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle || 0);
            const w = p.width || 6;
            const h = p.height || 4;
            ctx.fillRect(-w / 2, -h / 2, w, h);
            ctx.restore();
          } else if (p.isSpark || isMobile || p.size <= 3.8) {
            // High-speed GPU quads: completely bypasses expensive arc() triangulation on mobile/low-RAM!
            ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }

          particles[aliveCount++] = p;
        }
      }
      particles.length = aliveCount;
      ctx.globalAlpha = 1.0;

      // Restore screen shake translation
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="diwali-particle-canvas"
    />
  );
};
