import React from 'react';

interface DivineArrowProps {
  scrollProgress: number; // 0 to 1
}

export const DivineArrow: React.FC<DivineArrowProps> = ({ scrollProgress }) => {
  // Arrow is active from launch (0.24) through flight and impact until celebration fireworks ignite (0.83)
  const isVisible = scrollProgress >= 0.24 && scrollProgress <= 0.84;

  if (!isVisible) return null;

  // Normalized flight progress from bow release (0.26) to Ravana's chest impact (0.71)
  // At 0.71+, flightT = 1.0 (arrow has struck Ravana's chest and remains embedded)
  const flightT = Math.max(0, Math.min(1, (scrollProgress - 0.26) / 0.45));

  // Trajectory:
  // Starts at Rama's bow: 20vw, 48vh
  // Targets directly into Ravana's chest reticle: EXACTLY 51.5vw, 46vh
  const startX = 20;
  const endX = 51.5;
  const currentX = startX + flightT * (endX - startX);

  // Aerodynamic sine wave flight curve during flight (flattens upon impact)
  const wave = flightT < 1.0 ? Math.sin(flightT * Math.PI * 2.5) * (1 - flightT) * 3 : 0;
  const startY = 48;
  const endY = 46;
  const currentY = startY + flightT * (endY - startY) + wave;

  // Scale: zooms in flight, stays bold & large on impact
  const scale = flightT < 1.0 ? 0.95 + Math.sin(flightT * Math.PI) * 0.35 : 1.25;
  const rotation = flightT < 1.0 ? Math.cos(flightT * Math.PI * 2.5) * 2.5 * (1 - flightT) : 0;

  // Opacity: fades in cleanly at launch (0.24-0.27), stays 100% bright,
  // then seamlessly dissolves into the golden firework bursts (0.80-0.83)
  const opacity =
    scrollProgress < 0.27
      ? (scrollProgress - 0.24) / 0.03
      : scrollProgress > 0.80
      ? 1 - (scrollProgress - 0.80) / 0.03
      : 1;

  // Embedded vibration state during Ravana's death scene
  const isEmbedded = scrollProgress >= 0.71 && scrollProgress <= 0.82;

  // translate(-92%, -50%) places the exact sharp arrowhead tip directly onto (currentX, currentY)
  return (
    <div
      className={`divine-arrow-container ${isEmbedded ? 'arrow-embedded-impact' : ''}`}
      style={{
        position: 'fixed',
        left: `${currentX}vw`,
        top: `${currentY}vh`,
        transform: `translate(-92%, -50%) scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        pointerEvents: 'none',
        zIndex: 45,
        transition: isEmbedded ? 'none' : 'transform 0.02s linear',
        willChange: 'left, top, transform',
      }}
    >
      {/* Blazing Flame Core & Divine Mandalas */}
      <div className="arrow-glow-core">
        {/* Sacred Brahmastra Energy Rings */}
        <div className="sacred-yantra-ring ring-1" />
        <div className="sacred-yantra-ring ring-2" />
        <div className="sacred-yantra-ring ring-3" />

        {/* Dynamic SVG Arrow */}
        <svg
          width="380"
          height="100"
          viewBox="0 0 380 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="arrow-svg"
        >
          <defs>
            <linearGradient id="divineFlame" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
              <stop offset="30%" stopColor="#f97316" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#fbbf24" stopOpacity="1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="goldShaft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="30%" stopColor="#f59e0b" />
              <stop offset="60%" stopColor="#fde047" />
              <stop offset="90%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>

            <filter id="divineGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Trailing Fire Jet behind the arrow */}
          <path
            d="M 20 50 Q 70 25, 140 45 Q 70 75, 20 50"
            fill="url(#divineFlame)"
            filter="url(#divineGlow)"
            className="arrow-trailing-fire"
          />
          <path
            d="M 60 50 Q 100 38, 170 48 Q 100 62, 60 50"
            fill="#fef08a"
            opacity="0.95"
            filter="url(#divineGlow)"
          />

          {/* Arrow Shaft (Golden Kodanda Wood with Divine Inlay) */}
          <line
            x1="110"
            y1="50"
            x2="330"
            y2="50"
            stroke="url(#goldShaft)"
            strokeWidth="6"
            strokeLinecap="round"
            filter="url(#divineGlow)"
          />

          {/* Brahmastra Sacred Mantra Glyphs on Shaft */}
          <circle cx="160" cy="50" r="5" fill="#ffffff" />
          <circle cx="210" cy="50" r="6" fill="#fde047" />
          <circle cx="260" cy="50" r="6.5" fill="#ffffff" />
          <circle cx="300" cy="50" r="5" fill="#fde047" />

          {/* Ornate Arrowhead (Brahmastra Tip targeting Ravana) */}
          <path
            d="M 330 50 L 305 30 Q 340 47, 375 50 Q 340 53, 305 70 Z"
            fill="url(#goldShaft)"
            filter="url(#divineGlow)"
          />
          <path
            d="M 335 50 L 318 39 Q 345 48, 372 50 Q 345 52, 318 61 Z"
            fill="#ffffff"
          />

          {/* Fletchings */}
          <path
            d="M 120 50 L 90 26 Q 110 38, 130 50 Z"
            fill="#38bdf8"
            stroke="#f59e0b"
            strokeWidth="1.5"
          />
          <path
            d="M 120 50 L 90 74 Q 110 62, 130 50 Z"
            fill="#38bdf8"
            stroke="#f59e0b"
            strokeWidth="1.5"
          />
          <path
            d="M 115 50 L 80 35 Q 100 45, 125 50 Z"
            fill="#fbbf24"
          />
          <path
            d="M 115 50 L 80 65 Q 100 55, 125 50 Z"
            fill="#fbbf24"
          />
        </svg>

        {/* Blazing Comet Head Pulsar */}
        <div className="arrow-head-pulsar" />
      </div>
    </div>
  );
};
