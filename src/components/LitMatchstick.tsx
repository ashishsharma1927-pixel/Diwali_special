import React, { useRef } from 'react';

export type MatchState = 'docked' | 'lit' | 'spent';
export type ToolType = 'match' | 'lighter';

interface LitMatchstickProps {
  matchPos: { x: number; y: number };
  isNearFuse: boolean;
  matchState: MatchState;
  activeTool: ToolType;
  onPickUpMatch: () => void;
  onPutDownMatch: () => void;
  onPickUpLighter: () => void;
  onPutDownLighter: () => void;
}

export const LitMatchstick: React.FC<LitMatchstickProps> = ({
  matchPos,
  isNearFuse,
  matchState,
  activeTool,
  onPickUpMatch,
  onPutDownMatch,
  onPickUpLighter,
  onPutDownLighter,
}) => {
  const lastMatchToggleRef = useRef<number>(0);
  const lastLighterClickRef = useRef<number>(0);

  // Matchbox single-click handler
  const handleMatchboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastMatchToggleRef.current < 280) return;
    lastMatchToggleRef.current = now;

    if (activeTool === 'lighter') {
      // Put lighter back on stand, pick up match
      onPutDownLighter();
      onPickUpMatch();
      return;
    }

    if (matchState === 'docked') {
      onPickUpMatch();
    } else if (matchState === 'spent') {
      onPickUpMatch();
    } else {
      onPutDownMatch();
    }
  };

  // Lighter double click handler
  const handleLighterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const timeSinceLast = now - lastLighterClickRef.current;
    lastLighterClickRef.current = now;

    // Double click detected (within 400ms)
    if (timeSinceLast < 400) {
      if (activeTool === 'lighter') {
        // Return lighter to stand
        onPutDownLighter();
      } else {
        // Pick up the lighter
        onPickUpLighter();
      }
    }
  };

  const isHoldingMatch = activeTool === 'match' && (matchState === 'lit' || matchState === 'spent');
  const isHoldingLighter = activeTool === 'lighter';

  const floatingMatchRef = useRef<HTMLDivElement | null>(null);
  const floatingLighterRef = useRef<HTMLDivElement | null>(null);

  // High-performance direct DOM transform tracking: follows cursor without triggering React re-renders!
  React.useEffect(() => {
    if (!isHoldingMatch && !isHoldingLighter) return;

    const handleWindowPointer = (e: PointerEvent) => {
      const transformStyle = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (floatingMatchRef.current) {
        floatingMatchRef.current.style.transform = transformStyle;
      }
      if (floatingLighterRef.current) {
        floatingLighterRef.current.style.transform = transformStyle;
      }
    };

    window.addEventListener('pointermove', handleWindowPointer, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handleWindowPointer);
    };
  }, [isHoldingMatch, isHoldingLighter]);

  return (
    <>
      {/* 1. RESTING STAND & DOCKS (Always anchored above bottom bar, right side) */}
      <div className="ignition-station-wrapper">
        {/* --- LIGHTER STAND (MOUNTED DIRECTLY ABOVE THE MATCHBOX) --- */}
        <div
          id="lighter-stand-dock"
          className={`lighter-dock-stand ${activeTool === 'lighter' ? 'lighter-in-hand' : 'lighter-resting'}`}
          onClick={handleLighterClick}
          role="button"
          tabIndex={0}
          title={
            activeTool === 'lighter'
              ? 'Lighter Active! Double-click here to place it back on the stand.'
              : '⚡ Turbo Gas Lighter: Double-click to pick up and light multiple crackers non-stop!'
          }
        >
          {activeTool !== 'lighter' ? (
            <div className="stand-lighter-preview">
              {/* Resting Metal Torch Lighter */}
              <div className="lighter-body">
                <div className="lighter-metal-nozzle" />
                <div className="lighter-ignition-trigger" />
                <div className="lighter-grip-lines" />
                <div className="lighter-brand-label">TURBO</div>
                <div className="lighter-fuel-gauge" />
              </div>
              <div className="lighter-double-click-badge">
                <span>⚡ Double-Click for Lighter</span>
              </div>
            </div>
          ) : (
            <div className="lighter-empty-stand">
              <div className="stand-hollow-slot" />
              <div className="lighter-in-use-badge pulse-glow">
                <span>🔥 Lighter in Hand (Double-Click to Dock)</span>
              </div>
            </div>
          )}
        </div>

        {/* --- MATCHBOX DOCK (BELOW THE LIGHTER) --- */}
        <div
          id="matchbox-dock-stand"
          className={`matchstick-home-stand ${activeTool === 'match' && matchState === 'docked' ? 'ready-to-pickup' : 'dock-holding-state'}`}
          onClick={handleMatchboxClick}
          role="button"
          tabIndex={0}
          title={
            matchState === 'docked'
              ? 'Click to strike a fresh lit matchstick (Lights 1 Cracker)!'
              : matchState === 'spent'
              ? 'Click to take a fresh match from the box!'
              : 'Matchbox: Holding lit match'
          }
        >
          <div className="stand-matchbox">
            <div className="matchbox-striker-strip" />
            <div className="matchbox-label">
              <span className="box-brand">SAFETY MATCHES</span>
              <span className="box-hindi">माचिस बॉक्स</span>
            </div>
          </div>

          {/* Resting Matchstick Preview tucked inside matchbox slot */}
          {activeTool === 'match' && matchState === 'docked' && (
            <div className="resting-matchstick-preview">
              <div className="resting-match-shaft" />
              <div className="resting-match-head" />
              <div className="match-flame-wrapper resting-flame">
                <div className="flame-layer outer" />
                <div className="flame-layer mid" />
                <div className="flame-layer inner" />
              </div>
            </div>
          )}

          {/* Clean helper badge placed neatly on bottom or center */}
          {activeTool === 'match' && matchState === 'docked' && (
            <div className="matchbox-helper-tag">
              <span>🔥 Tap for Match</span>
            </div>
          )}

          {/* Badge when holding active or spent match */}
          {activeTool === 'match' && matchState === 'lit' && (
            <div className="dock-landing-cradle">
              <div className="dock-cradle-slot" />
              <div className="pickup-pulse-badge in-hand-badge">
                <span>🕯️ 1 Cracker per Match</span>
              </div>
            </div>
          )}

          {activeTool === 'match' && matchState === 'spent' && (
            <div className="dock-landing-cradle">
              <div className="dock-cradle-slot" />
              <div className="pickup-pulse-badge new-match-badge pulse-glow">
                <span>🔥 Tap for New Match!</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. ACTIVE FLOATING MATCHSTICK (Follows cursor when match is picked up) */}
      {isHoldingMatch && (
        <div
          ref={floatingMatchRef}
          className={`lit-matchstick-container ${isNearFuse && matchState === 'lit' ? 'near-fuse' : ''} state-${matchState}`}
          style={{
            transform: `translate3d(${matchPos.x}px, ${matchPos.y}px, 0)`,
          }}
          aria-hidden="true"
        >
          {matchState === 'lit' && (
            <div
              className="match-light-halo"
              style={{
                transform: `scale(${isNearFuse ? 1.4 : 1.0})`,
              }}
            />
          )}

          <div className="matchstick-graphics">
            {matchState === 'lit' && (
              <div className="match-flame-wrapper">
                <div className="flame-layer outer" />
                <div className="flame-layer mid" />
                <div className="flame-layer inner" />
                <div className="match-spark spark-1" />
                <div className="match-spark spark-2" />
                <div className="match-spark spark-3" />
              </div>
            )}

            {matchState === 'spent' && (
              <div className="spent-smoke-wrapper">
                <div className="smoke-puff puff-1" />
                <div className="smoke-puff puff-2" />
                <div className="spent-ember-fade" />
              </div>
            )}

            <div className={`match-head ${matchState === 'spent' ? 'charred-spent-head' : ''}`} />
            <div className={`match-shaft ${matchState === 'spent' ? 'charred-shaft-top' : ''}`}>
              <div className="wood-grain" />
            </div>
          </div>

          {matchState === 'lit' && isNearFuse && (
            <div className="ignite-hint-bubble">
              <span>🔥 IGNITING FUSE!</span>
            </div>
          )}

          {matchState === 'spent' && (
            <div className="spent-match-hint-bubble">
              <span>💨 Burnt out! Click screen to throw, or drop in Clean Bin 🗑️</span>
            </div>
          )}
        </div>
      )}

      {/* 3. ACTIVE FLOATING GAS LIGHTER (Follows cursor when lighter is picked up - UNLIMITED MULTI-LIGHT) */}
      {isHoldingLighter && (
        <div
          ref={floatingLighterRef}
          className={`lit-lighter-floating-container ${isNearFuse ? 'lighter-near-fuse' : ''}`}
          style={{
            transform: `translate3d(${matchPos.x}px, ${matchPos.y}px, 0)`,
          }}
          aria-hidden="true"
        >
          {/* Intense radiant flame halo lighting the dark arena */}
          <div className="lighter-flame-halo" />

          {/* Realistic High-Temperature Torch Lighter Graphic */}
          <div className="floating-lighter-device">
            {/* Roaring Cyan/Orange Jet Torch Flame */}
            <div className="lighter-jet-flame-wrapper">
              <div className="jet-flame-core" />
              <div className="jet-flame-middle" />
              <div className="jet-flame-outer" />
              <div className="jet-flame-sparks" />
            </div>

            {/* Metal Torch Head */}
            <div className="device-metal-head">
              <div className="burner-nozzle-slit" />
            </div>

            {/* Ergonomic Lighter Body */}
            <div className="device-ergonomic-body">
              <div className="device-amber-window">
                <div className="butane-liquid-level" />
              </div>
              <div className="device-grip-grooves" />
              <span className="device-brand-print">DIWALI JET</span>
            </div>
          </div>

          {/* Contextual Lighter Guidance Toast */}
          <div className="lighter-status-bubble">
            <span>🔥 CONTINUOUS LIGHTER: Hover or click any cracker to ignite non-stop!</span>
          </div>
        </div>
      )}
    </>
  );
};
