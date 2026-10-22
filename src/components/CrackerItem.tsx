import React from 'react';
import type { CrackerItemData } from '../types/diwali';

interface CrackerItemProps {
  cracker: CrackerItemData;
  onFuseTouch?: (cracker: CrackerItemData) => void;
  isMatchHovered?: boolean;
  onCrackerPointerDown?: (id: string, e: React.PointerEvent) => void;
  isDragging?: boolean;
}

export const CrackerItem: React.FC<CrackerItemProps> = React.memo(({
  cracker,
  isMatchHovered,
  onCrackerPointerDown,
  isDragging,
}) => {
  const { id, type, x, y, state, color, scale, bombVariant } = cracker;

  const handlePointerDown = (e: React.PointerEvent) => {
    // Left-click / touch to move or pop (or drag spent leftovers to the dustbin!)
    if (onCrackerPointerDown) {
      onCrackerPointerDown(id, e);
    }
  };

  const itemScale = scale || 1;

  return (
    <div
      id={`cracker-${id}`}
      className={`cracker-node cracker-${type} state-${state} ${isMatchHovered ? 'match-hover' : ''} ${cracker.isDisappearing ? 'fade-disappear' : ''} ${isDragging ? 'is-dragging' : ''}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${itemScale})`,
      }}
      onPointerDown={handlePointerDown}
      role="button"
      tabIndex={0}
    >
      {/* -------------------- 1. BOMBS (MIRCHI, SUTLI, ATOM, HYDROGEN, GOLA) -------------------- */}
      {type === 'bomb' && (
        <div className={`bomb-visual-wrapper bomb-variant-${bombVariant || 'sutli'}`}>
          {state !== 'exploded' && state !== 'done' ? (
            <>
              {/* Realistic Twisted Fuse Wick */}
              <div className={`bomb-fuse ${state === 'burning' ? 'burning-fuse' : ''}`}>
                <svg viewBox="0 0 16 36" className="fuse-svg-rope">
                  <path
                    d="M 8 36 Q 4 20 10 10 Q 14 4 8 0"
                    fill="none"
                    stroke="#78716c"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray="2 1"
                  />
                </svg>
                {state === 'burning' && (
                  <div className="fuse-spark-head">
                    <div className="fuse-ember" />
                    <div className="spark-burst" />
                  </div>
                )}
                {state === 'idle' && <div className="fuse-target-indicator" />}
              </div>

              {/* 1A. MIRCHI BOMB (Mini Red Chilli) */}
              {bombVariant === 'mirchi' && (
                <div className="mirchi-bomb-body">
                  <div className="mirchi-cap" />
                  <div className="mirchi-tube" />
                </div>
              )}

              {/* 1B. TRIANGULAR ATOM BOMB */}
              {bombVariant === 'atom' && (
                <div className="atom-bomb-body">
                  <svg viewBox="0 0 74 68" className="atom-svg">
                    <polygon points="37,4 71,64 3,64" fill="#15803d" stroke="#facc15" strokeWidth="2.5" />
                    <polygon points="37,13 63,58 11,58" fill="#dc2626" />
                    <circle cx="37" cy="42" r="12" fill="#facc15" />
                  </svg>
                </div>
              )}

              {/* 1C. COCONUT GOLA BOMB (Spherical Hemp Bound) */}
              {bombVariant === 'gola' && (
                <div className="gola-bomb-body">
                  <div className="gola-sphere">
                    <div className="gola-mesh-h" />
                    <div className="gola-mesh-v" />
                    <div className="gola-seal" />
                  </div>
                </div>
              )}

              {/* 1D. HYDROGEN 50,000 WATT JUMBO BOMB */}
              {bombVariant === 'hydrogen' && (
                <div className="hydrogen-bomb-body">
                  <div className="hydrogen-metal-rim top" />
                  <div className="hydrogen-casing">
                    <div className="jute-woven-grid" />
                    <div className="hydrogen-seal" />
                  </div>
                  <div className="hydrogen-metal-rim btm" />
                </div>
              )}

              {/* 1E. CLASSIC GREEN JUTE SUTLI BOMB (Default) */}
              {(!bombVariant || bombVariant === 'sutli') && (
                <div
                  className="bomb-body"
                  style={{
                    background: color === '#dc2626' ? 'linear-gradient(135deg, #991b1b 0%, #450a0a 100%)' : 'linear-gradient(135deg, #166534 0%, #052e16 100%)',
                    borderColor: color === '#dc2626' ? '#ef4444' : '#22c55e',
                  }}
                >
                  <div className="jute-woven-grid" />
                  <div className="bomb-seal-band">
                    <div className="band-gold-trim top" />
                    <div className="band-content" />
                    <div className="band-gold-trim btm" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bomb-blast-mark">
              <div className="scorch-crater" />
              <div className="blast-smoke" />
              <div className="burnt-paper-shreds" />
            </div>
          )}
        </div>
      )}

      {/* -------------------- 2. ROCKET IN LAUNCH BOTTLE -------------------- */}
      {type === 'rocket' && (
        <div className="rocket-visual-wrapper">
          {/* Glass launch bottle with realistic neck, glare and amber tint */}
          <div className="launch-bottle">
            <div className="bottle-rim" />
            <div className="bottle-neck" />
            <div className="bottle-shoulder" />
            <div className="bottle-body">
              <div className="glass-reflection-glare" />
            </div>
            <div className="bottle-shadow" />
          </div>

          {/* Rocket projectile (visible while waiting or burning) */}
          {state === 'idle' || state === 'burning' ? (
            <div className="rocket-stand-item">
              {/* Rocket Fuse at base */}
              <div className={`rocket-fuse ${state === 'burning' ? 'burning-fuse' : ''}`}>
                <div className="fuse-string" />
                {state === 'burning' && <div className="fuse-spark-head"><div className="fuse-ember" /></div>}
                {state === 'idle' && <div className="fuse-target-indicator" />}
              </div>

              {/* Aerodynamic Rocket Fuselage with foil patterns */}
              <div className="rocket-fuselage" style={{ background: color || '#f59e0b' }}>
                {/* 3D Glossy Conical Nose Cone */}
                <div className="rocket-cone" />
                {/* Diagonal Festive Metallic Diamond Foil */}
                <div className="rocket-foil-wrap" />
                {/* Golden Fin Wings */}
                <div className="rocket-fin left" />
                <div className="rocket-fin right" />
                {/* Real Bamboo Guide Stick */}
                <div className="rocket-stick" />
              </div>
            </div>
          ) : (
            <div className="bottle-smoke-puff" />
          )}
        </div>
      )}

      {/* -------------------- 3. CHAKRI (GROUND SPINNER) -------------------- */}
      {type === 'chakri' && (
        <div className="chakri-visual-wrapper">
          {state !== 'done' ? (
            <div
              className={`chakri-disc ${state === 'active' ? 'spinning-disc active-hidden' : ''}`}
              style={state === 'active' ? { opacity: 0, pointerEvents: 'none' } : undefined}
            >
              {/* Protruding Fuse */}
              {state !== 'active' && (
                <div className={`chakri-fuse ${state === 'burning' ? 'burning-fuse' : ''}`}>
                  <div className="fuse-string" />
                  {state === 'burning' && <div className="fuse-spark-head" />}
                  {state === 'idle' && <div className="fuse-target-indicator" />}
                </div>
              )}

              {/* High-Fidelity Metallic Concentric Rings with Traditional Mandala Spiral */}
              <svg viewBox="0 0 100 100" className="chakri-svg-artwork">
                <circle cx="50" cy="50" r="48" fill="#78350f" stroke="#f59e0b" strokeWidth="4" />
                {/* Spiral decorative arms */}
                <path
                  d="M 50 10 A 40 40 0 0 1 90 50 A 40 40 0 0 1 50 90 A 40 40 0 0 1 10 50 A 40 40 0 0 1 50 10"
                  fill="#ea580c"
                  stroke="#fde047"
                  strokeWidth="3"
                />
                <circle cx="50" cy="50" r="32" fill="#0284c7" stroke="#38bdf8" strokeWidth="3" />
                <circle cx="50" cy="50" r="22" fill="#dc2626" stroke="#facc15" strokeWidth="2.5" />
                {/* Central brass dome rivet */}
                <circle cx="50" cy="50" r="10" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
                <circle cx="48" cy="48" r="3" fill="#ffffff" />
              </svg>
            </div>
          ) : (
            <div className="chakri-burnt-scorch" />
          )}
        </div>
      )}

      {/* -------------------- 4. ANAAR (FLOWERPOT FOUNTAIN) -------------------- */}
      {type === 'anaar' && (
        <div className="anaar-visual-wrapper">
          <div className={`anaar-cone ${state === 'active' ? 'erupting-cone' : ''} ${state === 'done' ? 'burnt-cone' : ''}`}>
            {/* Fuse at top apex */}
            {state !== 'active' && state !== 'done' && (
              <div className={`anaar-fuse ${state === 'burning' ? 'burning-fuse' : ''}`}>
                <div className="fuse-string" />
                {state === 'burning' && <div className="fuse-spark-head"><div className="fuse-ember" /></div>}
                {state === 'idle' && <div className="fuse-target-indicator" />}
              </div>
            )}

            {/* Handcrafted Terracotta Pot SVG with Golden Paisley / Floral Motifs */}
            <svg viewBox="0 0 100 120" className="anaar-svg-artwork">
              <defs>
                <linearGradient id={`anaarGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9a3412" />
                  <stop offset="35%" stopColor="#c2410c" />
                  <stop offset="70%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#7c2d12" />
                </linearGradient>
              </defs>

              {/* Conical Pot Body */}
              <polygon points="50,15 94,108 6,108" fill={`url(#anaarGrad-${id})`} stroke="#ca8a04" strokeWidth="3" />

              {/* Golden Gilded Neck Rim */}
              <rect x="42" y="10" width="16" height="8" rx="2" fill="#facc15" stroke="#854d0e" strokeWidth="1.5" />

              {/* Paisley & Floral Engravings on Cone Face */}
              <path d="M 50 35 Q 65 55 50 75 Q 35 55 50 35 Z" fill="#facc15" opacity="0.9" />
              <circle cx="50" cy="55" r="4" fill="#991b1b" />

              {/* Lower Decorative Golden Band */}
              <rect x="16" y="88" width="68" height="12" rx="3" fill="#facc15" stroke="#78350f" strokeWidth="1.5" />

              {/* Terracotta Pot Base */}
              <rect x="10" y="106" width="80" height="7" rx="3" fill="#78350f" />
            </svg>

            {state === 'active' && <div className="nozzle-fire-core" />}
          </div>
        </div>
      )}

      {/* -------------------- 5. DIYA (FESTIVE OIL LAMP) -------------------- */}
      {type === 'diya' && (
        <div className="diya-visual-wrapper">
          <svg viewBox="0 0 80 45" className="diya-svg-artwork">
            {/* Clay Bowl with fluted rim */}
            <path
              d="M 6 18 C 12 38, 68 38, 74 18 C 76 12, 68 14, 40 14 C 12 14, 4 12, 6 18 Z"
              fill="linear-gradient(180deg, #b45309 0%, #78350f 100%)"
              stroke="#d97706"
              strokeWidth="2"
            />
            {/* Ghee pool surface */}
            <ellipse cx="40" cy="18" rx="28" ry="7" fill="#facc15" opacity="0.85" />
            {/* Cotton Baati Wick */}
            <path d="M 40 18 Q 41 12 40 6" stroke="#292524" strokeWidth="3" strokeLinecap="round" />
          </svg>

          {/* Diya Flame */}
          {state === 'active' ? (
            <div className="diya-lit-flame">
              <div className="flame-outer" />
              <div className="flame-inner" />
              <div className="diya-warm-glow" />
            </div>
          ) : (
            <div className="diya-unlit-indicator">
              <span className="unlit-dot" />
            </div>
          )}
        </div>
      )}

      {/* -------------------- 6. LADI / MURGACHAP CHATAI (MULTI-BOMBS IN ONE) -------------------- */}
      {type === 'ladi' && (
        <div className={`ladi-visual-wrapper ladi-variant-${cracker.ladiVariant || '100-ladi'} ${state === 'active' ? 'ladi-active-bursting' : ''}`}>
          {state !== 'exploded' && state !== 'done' ? (
            <>
              {/* Ignition Fuse at the top end of the strip */}
              <div className={`ladi-fuse ${state === 'burning' ? 'burning-fuse' : ''}`}>
                <div className="fuse-string" />
                {state === 'burning' && <div className="fuse-spark-head"><div className="fuse-ember" /></div>}
                {state === 'idle' && <div className="fuse-target-indicator" />}
              </div>

              {/* Red Firecracker Roll Mat (Matching authentic reference photo) */}
              <div className="ladi-strip-mat">
                <div className="ladi-header-label" />
                {/* Rows of linked red firecrackers */}
                <div className="ladi-tubes-grid">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className={`mini-cracker-tube ${state === 'active' && i % 2 === 0 ? 'popping' : ''}`}
                    />
                  ))}
                </div>
                {/* Woven central white jute twine */}
                <div className="ladi-center-twine" />
              </div>
            </>
          ) : (
            <div className="ladi-burnt-debris">
              <div className="burnt-red-shreds-mat" />
              <div className="ash-smoke-haze" />
              {/* Leftover red firecracker paper pieces scattered radially across the surrounding floor */}
              <div className="scattered-scraps-cluster">
                {Array.from({ length: 28 }).map((_, i) => {
                  const angle = (i / 28) * Math.PI * 2 + (i % 3) * 0.4;
                  const dist = 35 + ((i * 17) % 75);
                  const dx = Math.cos(angle) * dist;
                  const dy = Math.sin(angle) * (dist * 0.55); // Isometric / 2.5D floor perspective
                  const rot = ((i * 37) % 180) - 90;
                  const w = 5 + (i % 6);
                  const h = 4 + ((i * 2) % 5);
                  return (
                    <div
                      key={i}
                      className="scattered-red-bit"
                      style={{
                        transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`,
                        width: `${w}px`,
                        height: `${h}px`,
                        animationDelay: `${(i % 5) * 40}ms`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------- 7. SKYSHOTS (MULTI-SHOT REPEATER CAKE) -------------------- */}
      {type === 'skyshot' && (
        <div className={`skyshot-visual-wrapper skyshot-variant-${cracker.skyshotVariant || '12-shots'}`}>
          {state !== 'done' ? (
            <div className={`skyshot-cake-box ${state === 'active' ? 'firing-skyshot-box' : ''}`}>
              {/* Fuse on top corner */}
              {state !== 'active' && (
                <div className={`skyshot-fuse ${state === 'burning' ? 'burning-fuse' : ''}`}>
                  <div className="fuse-string" />
                  {state === 'burning' && <div className="fuse-spark-head" />}
                  {state === 'idle' && <div className="fuse-target-indicator" />}
                </div>
              )}

              {/* Mortar Tube Top Grid */}
              <div className="skyshot-top-plate">
                <div className="mortar-tubes-pattern">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span key={i} className={`mortar-hole ${state === 'active' && i % 2 === 0 ? 'muzzle-flash' : ''}`} />
                  ))}
                </div>
              </div>

              {/* Golden Festive Packaging Box */}
              <div className="skyshot-box-casing">
                <div className="casing-foil-banner" />
              </div>
            </div>
          ) : (
            <div className="skyshot-spent-box">
              <div className="burnt-tube-sockets" />
              <div className="charred-casing" />
            </div>
          )}
        </div>
      )}

      {/* -------------------- 8. FULJHADI (SPARKLER) -------------------- */}
      {type === 'fuljhadi' && (
        <div className={`fuljhadi-visual-wrapper fuljhadi-variant-${cracker.fuljhadiVariant || '10s'} ${state === 'active' ? 'sparkling-active' : ''}`}>
          {/* Fuse/Target indicator at tip */}
          {state === 'idle' && <div className="fuljhadi-target-indicator" />}
          {state === 'burning' && <div className="fuljhadi-igniting-spark" />}

          <div className="fuljhadi-rod">
            {/* Top Coated Pyrotechnic Sparkler Head */}
            <div className={`sparkler-coated-portion ${state === 'active' ? 'incandescent-head' : state === 'done' ? 'charred-ash-rod' : ''}`}>
              <div className="sparkler-granule-texture" />
              {state === 'active' && (
                <div className="live-sparkler-core">
                  <div className="starburst-flash" />
                </div>
              )}
            </div>

            {/* Thin Bare Steel Wire Handle */}
            <div className="sparkler-wire-handle" />
          </div>
        </div>
      )}
    </div>
  );
});
