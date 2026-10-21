import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export const AudioControl: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(!soundEngine.getIsMuted());

  const handleToggle = () => {
    const active = soundEngine.toggleMute();
    setIsPlaying(active);
  };

  return (
    <button
      onClick={handleToggle}
      className={`audio-toggle-btn ${isPlaying ? 'active' : ''}`}
      title={isPlaying ? 'Mute Divine Audio' : 'Play Divine Audio & Ambient Soundscape'}
      aria-label="Toggle Sound"
    >
      {isPlaying ? (
        <>
          <div className="audio-wave">
            <span />
            <span />
            <span />
          </div>
          <Volume2 size={20} className="icon active-icon" />
          <span className="btn-label">Divine Sound ON</span>
        </>
      ) : (
        <>
          <VolumeX size={20} className="icon" />
          <span className="btn-label">Sound OFF</span>
          <Sparkles size={14} className="sparkle-hint" />
        </>
      )}
    </button>
  );
};
