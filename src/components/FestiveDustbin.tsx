import React, { useState } from 'react';
import { Trash2, Sparkles, Check } from 'lucide-react';

interface FestiveDustbinProps {
  cleanedCount: number;
  isDragOver: boolean;
  onSweepAllBurnt: () => void;
}

export const FestiveDustbin: React.FC<FestiveDustbinProps> = React.memo(({
  cleanedCount,
  isDragOver,
  onSweepAllBurnt,
}) => {
  const [showSweepFeedback, setShowSweepFeedback] = useState(false);

  const handleClick = () => {
    onSweepAllBurnt();
    setShowSweepFeedback(true);
    setTimeout(() => {
      setShowSweepFeedback(false);
    }, 1500);
  };

  return (
    <div
      id="festive-dustbin-station"
      className={`festive-dustbin-container ${isDragOver ? 'drag-over-active' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      title="Clean Up Dustbin: Drag any burnt cracker or ash mark here, or Click to sweep all leftovers!"
    >
      {/* Animated Dustbin Body */}
      <div className="dustbin-brass-can">
        {/* Animated Tilting Lid */}
        <div className={`dustbin-lid ${isDragOver ? 'lid-open' : ''}`}>
          <div className="lid-handle" />
          <div className="lid-rim" />
        </div>

        {/* Cylinder Body */}
        <div className="dustbin-body-cylinder">
          <div className="dustbin-metallic-glare" />
          <div className="dustbin-icon-badge">
            <Trash2 size={20} className="trash-icon text-amber-300" />
          </div>

          <div className="dustbin-brass-label">
            <span className="bin-hindi">कचरा पेटी</span>
            <span className="bin-eng">CLEANUP BIN</span>
          </div>

          <div className="dustbin-fluted-grooves" />
        </div>

        {/* Glowing Disposal Suction Hole / Flare */}
        {isDragOver && (
          <div className="dustbin-suction-glow">
            <div className="suction-ring" />
            <span className="drop-here-text">Drop to Clean! 📥</span>
          </div>
        )}
      </div>

      {/* Floating Counter Badge */}
      <div className="dustbin-counter-pill">
        {showSweepFeedback ? (
          <span className="sweep-feedback-text">
            <Check size={13} className="text-emerald-400" /> Swept Clean!
          </span>
        ) : (
          <>
            <Sparkles size={13} className="text-amber-400" />
            <span>Cleaned: <strong>{cleanedCount}</strong></span>
          </>
        )}
      </div>
    </div>
  );
});
