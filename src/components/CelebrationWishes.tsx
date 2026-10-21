import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Copy, Check, Flame, Award, HeartHandshake, Volume2 } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface WishOption {
  category: string;
  hindi: string;
  english: string;
}

const diwaliWishes: WishOption[] = [
  {
    category: 'Lakshmi & Ganesh Blessings',
    hindi: 'माँ लक्ष्मी और भगवान श्री गणेश की कृपा से आपके घर में सुख, शांति, समृद्धि और अपार खुशियों का वास हो। शुभ दीपावली!',
    english: 'May Goddess Lakshmi and Lord Ganesha shower their divine blessings of boundless wealth, wisdom, and eternal prosperity upon your family. Happy Diwali!',
  },
  {
    category: 'Victory of Divine Light',
    hindi: 'दीपों का यह पावन पर्व आपके जीवन से अंधकार, नकारात्मकता और कष्टों को मिटाकर प्रकाश और सकारात्मक ऊर्जा से भर दे।',
    english: 'May the radiant glow of countless diyas banish all darkness and negativity, illuminating your life with hope, peace, and triumphant light.',
  },
  {
    category: 'Joy & Prosperity',
    hindi: 'रोशन हो दीपक सारा जग जगमगाए, इस दिवाली आपके घर सुख-संपत्ति और खुशियों की बहार आए। दीपावली की हार्दिक शुभकामनाएं!',
    english: 'May this sparkling festival of lights bring good health, overflowing laughter, and dazzling success to every endeavor you undertake!',
  },
  {
    category: 'Love & Family Harmony',
    hindi: 'मिठाइयों की मिठास, पटाखों की चमक और अपनों का प्यार, सदा महकता रहे आपका संसार। शुभ दीपावली!',
    english: 'Cherishing sweet moments, glowing fireworks, and the warm embrace of loved ones. Wishing you and your family a safe, colorful, and Happy Diwali!',
  },
];

export const CelebrationWishes: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const triggerGrandFireworks = () => {
    soundEngine.playBombExplosion();
    soundEngine.playRocketBurst();

    // Multicolored celestial confetti & firework sparkles
    const count = 220;
    const defaults = {
      origin: { y: 0.65 },
      colors: ['#f59e0b', '#fbbf24', '#ef4444', '#f97316', '#38bdf8', '#a855f7', '#ffffff'],
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 30, startVelocity: 55 });
    fire(0.2, { spread: 65 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 30, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 130, startVelocity: 45 });
  };

  const playTempleChime = () => {
    soundEngine.playDiwaliChime();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const currentWish = diwaliWishes[selectedIdx];

  return (
    <div className="celebration-wishes-section">
      <div className="interactive-celebration-hero">
        <div className="celebration-actions">
          <button className="burst-fireworks-btn" onClick={triggerGrandFireworks}>
            <Sparkles className="icon spin" />
            <span>Burst Grand Celebration Sparks 🎆</span>
          </button>
          <button className="shankh-btn" onClick={playTempleChime}>
            <Volume2 className="icon" />
            <span>Ring Auspicious Diwali Chimes 🔔</span>
          </button>
        </div>
      </div>

      <div className="wishes-card-wrapper">
        <div className="wishes-nav">
          {diwaliWishes.map((item, idx) => (
            <button
              key={idx}
              className={`wish-tab ${selectedIdx === idx ? 'active' : ''}`}
              onClick={() => setSelectedIdx(idx)}
            >
              {idx === 0 && <Award size={14} />}
              {idx === 1 && <Flame size={14} />}
              {idx === 2 && <Sparkles size={14} />}
              {idx === 3 && <HeartHandshake size={14} />}
              <span>{item.category}</span>
            </button>
          ))}
        </div>

        <div className="wish-content-box">
          <p className="wish-hindi">&ldquo;{currentWish.hindi}&rdquo;</p>
          <p className="wish-english">{currentWish.english}</p>

          <div className="wish-actions">
            <button
              className="copy-wish-btn"
              onClick={() =>
                handleCopy(
                  `${currentWish.hindi}\n\n${currentWish.english}\n\n🪔 Shubh Deepavali! Wishing you a joyous and blessed Diwali! ✨`
                )
              }
            >
              {copied ? (
                <>
                  <Check size={16} className="text-emerald-400" />
                  <span>Blessing Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy Diwali Greeting</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
