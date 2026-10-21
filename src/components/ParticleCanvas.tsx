import React, { useEffect, useRef } from 'react';

interface ParticleCanvasProps {
  scrollProgress: number; // 0.0 to 1.0
  isImpacted: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'spark' | 'glyph' | 'speedline' | 'lantern' | 'shockwave';
  text?: string;
  length?: number;
  radius?: number;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ scrollProgress, isImpacted }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const progressRef = useRef(scrollProgress);
  progressRef.current = scrollProgress;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const glyphs = ['ॐ', 'राम', 'ध', 'र', 'म', '★', '✦', '🏹', '⚡'];
    const colors = ['#f59e0b', '#fbbf24', '#ef4444', '#f97316', '#fb7185', '#ffffff'];

    // Spawn initial atmospheric floating embers
    for (let i = 0; i < 45; i++) {
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.4 - Math.random() * 0.8,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.7 + 0.3,
        life: Math.random() * 200,
        maxLife: 200,
        shape: 'circle',
      });
    }

    let frameCount = 0;

    const render = () => {
      frameCount++;
      const p = progressRef.current;
      ctx.clearRect(0, 0, width, height);

      // 1. Arrow Flight Mode (0.24 to 0.76): Cinematic Supersonic Speed Lines & Fire Trail
      if (p >= 0.26 && p <= 0.74) {
        // High-speed motion blur lines rushing across screen
        for (let i = 0; i < 4; i++) {
          particlesRef.current.push({
            x: width + Math.random() * 100,
            y: Math.random() * height,
            vx: -22 - Math.random() * 25,
            vy: (Math.random() - 0.5) * 1.5,
            size: Math.random() * 2 + 1,
            length: 80 + Math.random() * 180,
            color: Math.random() > 0.4 ? '#fde047' : '#f97316',
            alpha: 0.65,
            life: 0,
            maxLife: 40,
            shape: 'speedline',
          });
        }

        // Arrow Position calculation matching DivineArrow EXACTLY
        const flightT = Math.max(0, Math.min(1, (p - 0.26) / 0.46));
        const currentXPercent = 20 + flightT * (51.5 - 20);
        const wave = flightT < 1.0 ? Math.sin(flightT * Math.PI * 2.5) * (1 - flightT) * 3 : 0;
        const currentYPercent = 48 + flightT * (46 - 48) + wave;

        const arrowX = width * (currentXPercent / 100);
        const arrowY = height * (currentYPercent / 100);

        // Blazing comet fire and mantra glyphs trailing behind the arrow tip
        for (let i = 0; i < 5; i++) {
          particlesRef.current.push({
            x: arrowX - 50 - Math.random() * 100,
            y: arrowY + (Math.random() - 0.5) * 16,
            vx: -5 - Math.random() * 7,
            vy: (Math.random() - 0.5) * 3,
            size: Math.random() * 6 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            life: 0,
            maxLife: 40,
            shape: Math.random() > 0.82 ? 'glyph' : 'spark',
            text: glyphs[Math.floor(Math.random() * glyphs.length)],
          });
        }
      }

      // 2. Aiming Bow Stage (0.18 to 0.32): Swirling fiery vortex of power
      if (p >= 0.18 && p < 0.32) {
        const bowX = width * 0.65;
        const bowY = height * 0.46;
        for (let i = 0; i < 3; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 70 + Math.random() * 100;
          particlesRef.current.push({
            x: bowX + Math.cos(angle) * dist,
            y: bowY + Math.sin(angle) * dist,
            vx: -Math.cos(angle) * 3.5,
            vy: -Math.sin(angle) * 3.5,
            size: Math.random() * 3.5 + 1.5,
            color: '#fde047',
            alpha: 0.95,
            life: 0,
            maxLife: 32,
            shape: 'spark',
          });
        }
      }

      // 3. Arrow Impact & Golden Lightning Explosion (0.71 to 0.81)
      if (p >= 0.71 && p <= 0.81) {
        const impactX = width * 0.515;
        const impactY = height * 0.46;

        // Shockwave rings expanding from Ravana's chest
        if (frameCount % 5 === 0) {
          particlesRef.current.push({
            x: impactX,
            y: impactY,
            vx: 0,
            vy: 0,
            size: 2,
            radius: 10,
            color: '#fbbf24',
            alpha: 1,
            life: 0,
            maxLife: 35,
            shape: 'shockwave',
          });
        }

        // Violent divine lightning sparks radiating from impact point
        for (let i = 0; i < 8; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 4 + Math.random() * 9;
          particlesRef.current.push({
            x: impactX,
            y: impactY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 5 + 2,
            color: Math.random() > 0.3 ? '#ffffff' : '#f59e0b',
            alpha: 1,
            life: 0,
            maxLife: 35 + Math.random() * 20,
            shape: 'spark',
          });
        }
      }

      // 4. Grand Dussehra Celebration (0.79 to 1.0): Fireworks & Glowing Sky Lanterns
      if (p >= 0.79) {
        // Continuous fireworks salvos
        if (frameCount % 7 === 0) {
          const cx = Math.random() * width;
          const cy = height * 0.15 + Math.random() * (height * 0.45);
          const fColor = colors[Math.floor(Math.random() * colors.length)];
          const count = 22;
          for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = 2.5 + Math.random() * 5;
            particlesRef.current.push({
              x: cx,
              y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: Math.random() * 4 + 1.5,
              color: fColor,
              alpha: 1,
              life: 0,
              maxLife: 55 + Math.random() * 25,
              shape: 'spark',
            });
          }
        }

        // Sky lanterns rising slowly to the heavens
        if (frameCount % 40 === 0 && particlesRef.current.length < 180) {
          particlesRef.current.push({
            x: Math.random() * width,
            y: height + 20,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -0.8 - Math.random() * 0.6,
            size: 14 + Math.random() * 10,
            color: '#fbbf24',
            alpha: 0.85,
            life: 0,
            maxLife: 350,
            shape: 'lantern',
          });
        }
      }

      // Ambient Rising Golden Embers
      if (particlesRef.current.length < 90 && Math.random() > 0.45) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: height + 10,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -1 - Math.random() * 1.5,
          size: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.75 + 0.25,
          life: 0,
          maxLife: 160 + Math.random() * 80,
          shape: 'circle',
        });
      }

      // 5. Update and Draw Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life++;

        const lifeRatio = 1 - pt.life / pt.maxLife;
        const currentAlpha = Math.max(0, pt.alpha * lifeRatio);

        if (pt.life >= pt.maxLife || currentAlpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = currentAlpha;

        if (pt.shape === 'speedline' && pt.length) {
          // Draw motion blur speedline
          const grad = ctx.createLinearGradient(pt.x, pt.y, pt.x + pt.length, pt.y);
          grad.addColorStop(0, pt.color);
          grad.addColorStop(1, 'transparent');
          ctx.strokeStyle = grad;
          ctx.lineWidth = pt.size;
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt.x + pt.length, pt.y);
          ctx.stroke();
        } else if (pt.shape === 'shockwave') {
          pt.radius = (pt.radius || 10) + 7;
          ctx.strokeStyle = pt.color;
          ctx.lineWidth = 3;
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
          ctx.stroke();
        } else if (pt.shape === 'lantern') {
          // Glowing flying diya / sky lantern
          ctx.fillStyle = '#f59e0b';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 16;
          ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size * 0.7, pt.size, pt.size * 1.3);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size * 0.25, 0, Math.PI * 2);
          ctx.fill();
        } else if (pt.shape === 'glyph' && pt.text) {
          ctx.fillStyle = pt.color;
          ctx.font = 'bold 18px "Rozha One", serif';
          ctx.fillText(pt.text, pt.x, pt.y);
        } else if (pt.shape === 'spark') {
          ctx.fillStyle = pt.color;
          ctx.shadowColor = pt.color;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = pt.color;
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [isImpacted]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 25,
        width: '100vw',
        height: '100vh',
      }}
    />
  );
};
