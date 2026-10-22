import React, { useState, useRef, useEffect } from 'react';
import type {
  CrackerType,
  BombVariant,
  RocketVariant,
  ChakriVariant,
  AnaarVariant,
  FuljhadiVariant,
  SkyshotVariant,
  LadiVariant,
} from '../types/diwali';
import { ChevronDown } from 'lucide-react';

export interface CrackerOption {
  type: CrackerType;
  name: string;
  hindiName: string;
  duration?: number;
  scale: number;
  color: string;
  badge: string;
  description: string;
  bombVariant?: BombVariant;
  rocketVariant?: RocketVariant;
  chakriVariant?: ChakriVariant;
  anaarVariant?: AnaarVariant;
  fuljhadiVariant?: FuljhadiVariant;
  skyshotVariant?: SkyshotVariant;
  ladiVariant?: LadiVariant;
  totalShots?: number;
  totalLadiCount?: number;
}

export type CrackerCategoryKey =
  | 'bomb'
  | 'ladi'
  | 'skyshot'
  | 'fuljhadi'
  | 'rocket'
  | 'chakri'
  | 'anaar';

export const CRACKER_CATEGORIES: Record<
  CrackerCategoryKey,
  { label: string; hindi: string; icon: string; options: CrackerOption[] }
> = {
  // 1. LADI / MULTI-BOMBS (MURGACHAP CHATAI STRIPS)
  ladi: {
    label: 'Murgachap Ladi',
    hindi: 'मुर्गा छाप लड़ी',
    icon: '🧨',
    options: [
      {
        type: 'ladi',
        ladiVariant: '50-ladi',
        name: '50 in One Ladi',
        hindiName: '50 लड़ी चटाई',
        totalLadiCount: 50,
        scale: 0.9,
        color: '#dc2626',
        badge: '50 Bombs • Rapid Pop',
        description: '50 authentic red firecrackers linked in a row, bursting in fast machine-gun sequence with red paper shreds',
      },
      {
        type: 'ladi',
        ladiVariant: '100-ladi',
        name: '100 in One Murgachap',
        hindiName: '100 लड़ी मुर्गा छाप',
        totalLadiCount: 100,
        scale: 1.05,
        color: '#dc2626',
        badge: '100 Bombs • Traditional',
        description: '100 red Murgachap crackers bound with twine, continuous rapid popping and festive smoke trail',
      },
      {
        type: 'ladi',
        ladiVariant: '200-ladi',
        name: '200 in One Super Chatai',
        hindiName: '200 लड़ी सुपर चटाई',
        totalLadiCount: 200,
        scale: 1.25,
        color: '#b91c1c',
        badge: '200 Bombs • Long Strip',
        description: 'Double-row red cracker mat with non-stop staccato explosions and flying red paper confetti',
      },
      {
        type: 'ladi',
        ladiVariant: '500-ladi',
        name: '500 in One Maha Chatai',
        hindiName: '500 लड़ी महा चटाई',
        totalLadiCount: 500,
        scale: 1.45,
        color: '#991b1b',
        badge: '500 Bombs • Grand Finale',
        description: 'Colossal 500-cracker red carpet strip with high-octane rapid-fire thunder barrage',
      },
    ],
  },

  // 2. SKYSHOTS (MULTI-SHOT REPEATER CAKES)
  skyshot: {
    label: 'Sky Shots',
    hindi: 'आसमानी स्काई शॉट',
    icon: '🎆',
    options: [
      {
        type: 'skyshot',
        skyshotVariant: '12-shots',
        name: '12 Shots Color Repeater',
        hindiName: '12 शॉट्स स्काई केक',
        totalShots: 12,
        scale: 1.0,
        color: '#f59e0b',
        badge: '12 Shots • Multi-Color',
        description: 'Ground launcher cake firing 12 sequential mortar shells into the night sky with aerial bursts',
      },
      {
        type: 'skyshot',
        skyshotVariant: '25-shots',
        name: '25 Shots Royal Comet',
        hindiName: '25 शॉट्स शाही धमाका',
        totalShots: 25,
        scale: 1.2,
        color: '#8b5cf6',
        badge: '25 Shots • Peony & Willow',
        description: '25 high-altitude mortar shells launching rhythmically with sparkling gold and violet canopies',
      },
      {
        type: 'skyshot',
        skyshotVariant: '50-shots',
        name: '50 Shots Mega Galaxy',
        hindiName: '50 शॉट्स महा उत्सव',
        totalShots: 50,
        scale: 1.4,
        color: '#ec4899',
        badge: '50 Shots • Massive Show',
        description: 'Full celebration fireworks cake firing 50 consecutive aerial mortar shells filling the sky with festive glory',
      },
    ],
  },

  // 3. FULJHADI (SPARKLERS)
  fuljhadi: {
    label: 'Fuljhadi',
    hindi: 'फुलझड़ी',
    icon: '✨',
    options: [
      {
        type: 'fuljhadi',
        fuljhadiVariant: 'mini-10s',
        name: '10 Sec Sparkler',
        hindiName: '10 सेकंड फुलझड़ी',
        duration: 10000,
        scale: 0.85,
        color: '#facc15',
        badge: '⏱️ 10 Sec • Gold Sparks',
        description: 'Classic slender steel rod sparkler emitting bright crackling golden star sparks for 10 seconds',
      },
      {
        type: 'fuljhadi',
        fuljhadiVariant: 'standard-20s',
        name: '20 Sec Electric Fuljhadi',
        hindiName: '20 सेकंड इलेक्ट्रिक फुलझड़ी',
        duration: 20000,
        scale: 1.0,
        color: '#38bdf8',
        badge: '⏱️ 20 Sec • Multicolor',
        description: 'Longer burning festive sparkler with dense showering embers and crackling sizzle',
      },
      {
        type: 'fuljhadi',
        fuljhadiVariant: 'jumbo-30s',
        name: '30 Sec Jumbo Sparkler',
        hindiName: '30 सेकंड महा फुलझड़ी',
        duration: 30000,
        scale: 1.25,
        color: '#ec4899',
        badge: '⏱️ 30 Sec • Jumbo Stick',
        description: 'Thick heavy iron sparkler that burns for a full 30 seconds with dazzling stars and color shifts',
      },
    ],
  },

  // 4. BOMBS
  bomb: {
    label: 'Bombs',
    hindi: 'पटाखे / बम',
    icon: '💥',
    options: [
      {
        type: 'bomb',
        bombVariant: 'mirchi',
        name: 'Mirchi Bomb',
        hindiName: 'मिर्ची बम',
        scale: 0.65,
        color: '#ef4444',
        badge: 'Small • Snappy Pop',
        description: 'Mini red chilli bomb with quick sharp crackle and red paper confetti',
      },
      {
        type: 'bomb',
        bombVariant: 'sutli',
        name: 'Sutli Bomb',
        hindiName: 'सुतली बम',
        scale: 1.0,
        color: '#16a34a',
        badge: 'Medium • 10,000W',
        description: 'Classic woven green jute twine cylinder with heavy thunder boom',
      },
      {
        type: 'bomb',
        bombVariant: 'atom',
        name: 'Atom Bomb',
        hindiName: 'एटम बम',
        scale: 1.05,
        color: '#15803d',
        badge: 'Triangle • Metallic Punch',
        description: 'Traditional triangular folded origami packet with sharp metallic shockwave',
      },
      {
        type: 'bomb',
        bombVariant: 'hydrogen',
        name: 'Hydrogen Bomb',
        hindiName: 'हाइड्रोजन बम',
        scale: 1.4,
        color: '#dc2626',
        badge: 'Jumbo • 50,000W Boom',
        description: 'Heavy gold-collared cylinder with deep earthquake sub-bass rumble & smoke',
      },
      {
        type: 'bomb',
        bombVariant: 'gola',
        name: 'Coconut Gola Bomb',
        hindiName: 'नारियल गोला बम',
        scale: 1.55,
        color: '#b45309',
        badge: 'Colossal • Fiery Dome',
        description: 'Giant spherical hemp-wound shell with massive blinding fireball detonation',
      },
    ],
  },

  // 5. ROCKETS
  rocket: {
    label: 'Rockets',
    hindi: 'रॉकेट',
    icon: '🚀',
    options: [
      {
        type: 'rocket',
        rocketVariant: 'mini-whistle-3s',
        name: 'Mini Whistle Rocket',
        hindiName: 'सीटी रॉकेट',
        duration: 3000,
        scale: 0.72,
        color: '#38bdf8',
        badge: '⏱️ 3 Secs • Small & Fast',
        description: 'Small bottle & dart that screeches rapidly into mid-air with crackling stars',
      },
      {
        type: 'rocket',
        rocketVariant: 'sky-star-5s',
        name: 'Sky Star Comet',
        hindiName: 'आसमानी तारा रॉकेट',
        duration: 5000,
        scale: 1.0,
        color: '#f59e0b',
        badge: '⏱️ 5 Secs • Gold Comet',
        description: 'Classic festive bottle rocket with sparkling golden tail and celestial burst',
      },
      {
        type: 'rocket',
        rocketVariant: 'heavy-missile-8s',
        name: 'Heavy Sky Missile',
        hindiName: 'महा मिसाइल रॉकेट',
        duration: 8000,
        scale: 1.45,
        color: '#ec4899',
        badge: '⏱️ 8 Secs • High Altitude',
        description: 'Jumbo aerobatic rocket that soars high above the rooftops before a thundering blast',
      },
    ],
  },

  // 6. CHAKRI
  chakri: {
    label: 'Chakri',
    hindi: 'जमीन चकरी',
    icon: '🌀',
    options: [
      {
        type: 'chakri',
        chakriVariant: 'mini-5s',
        name: 'Mini Speed Chakri',
        hindiName: 'छोटी चकरी',
        duration: 5000,
        scale: 0.75,
        color: '#38bdf8',
        badge: '⏱️ 5 Secs • Fast Spinner',
        description: 'Compact ground spinner with high rotational speed and electric blue sparks',
      },
      {
        type: 'chakri',
        chakriVariant: 'standard-10s',
        name: 'Zameen Chakkar',
        hindiName: 'जमीन चकरी',
        duration: 10000,
        scale: 1.0,
        color: '#f59e0b',
        badge: '⏱️ 10 Secs • Classic Golden',
        description: 'Traditional circular fire spinner creating a dazzling ground wheel of golden sparks',
      },
      {
        type: 'chakri',
        chakriVariant: 'jumbo-16s',
        name: 'Mega Cyclone Chakri',
        hindiName: 'महा चक्रवात चकरी',
        duration: 16000,
        scale: 1.4,
        color: '#ec4899',
        badge: '⏱️ 16 Secs • Giant Wheel',
        description: 'Large heavy wheel spinner with wide sparkling perimeter and multi-color rings',
      },
    ],
  },

  // 7. ANAAR
  anaar: {
    label: 'Anaar',
    hindi: 'अनार (फव्वारा)',
    icon: '🌋',
    options: [
      {
        type: 'anaar',
        anaarVariant: 'small-6s',
        name: 'Mini Sparkler Anaar',
        hindiName: 'छोटा अनार',
        duration: 6000,
        scale: 0.75,
        color: '#10b981',
        badge: '⏱️ 6 Secs • Emerald Gold',
        description: 'Gentle festive fountain rising 8-10 feet with emerald and golden stars',
      },
      {
        type: 'anaar',
        anaarVariant: 'medium-10s',
        name: 'Royal Gold Anaar',
        hindiName: 'शाही अनार',
        duration: 10000,
        scale: 1.0,
        color: '#f59e0b',
        badge: '⏱️ 10 Secs • High Fountain',
        description: 'Classic clay pot fountain shooting dense golden showers high into the night',
      },
      {
        type: 'anaar',
        anaarVariant: 'jumbo-15s',
        name: 'Volcanic Jumbo Anaar',
        hindiName: 'विशाल महा अनार',
        duration: 15000,
        scale: 1.45,
        color: '#d97706',
        badge: '⏱️ 15 Secs • Sky Reaching',
        description: 'Heavy terracotta cone generating an eruption of gold and white embers reaching the stars',
      },
    ],
  },
};

interface CrackerPickerDropdownProps {
  category: CrackerCategoryKey;
  onSelectOption: (option: CrackerOption) => void;
  isArena?: boolean;
}

export const CrackerPickerDropdown: React.FC<CrackerPickerDropdownProps> = React.memo(({
  category,
  onSelectOption,
  isArena = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const cat = CRACKER_CATEGORIES[category] || CRACKER_CATEGORIES.bomb;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleChoose = (opt: CrackerOption) => {
    setIsOpen(false);
    onSelectOption(opt);
  };

  return (
    <div className="cracker-picker-dropdown-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className={`cracker-picker-trigger ${isOpen ? 'active-open' : ''} ${isArena ? 'arena-trigger' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={`Choose different types and timings of ${cat.label}`}
      >
        <span className="trigger-icon">{cat.icon}</span>
        <span className="trigger-label">+ {cat.label}</span>
        <ChevronDown size={14} className={`trigger-chevron ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`cracker-picker-menu ${isArena ? 'arena-menu-down' : 'tray-menu-up'}`}>
          <div className="menu-header">
            <span className="menu-title">{cat.icon} Choose {cat.label}</span>
            <span className="menu-hindi">({cat.hindi})</span>
          </div>

          <div className="menu-options-list">
            {cat.options.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                className="picker-option-item"
                onClick={() => handleChoose(opt)}
              >
                <div className="option-row-top">
                  <span className="opt-name">{opt.name}</span>
                  <span className="opt-badge">{opt.badge}</span>
                </div>
                <div className="option-row-sub">
                  <span className="opt-hindi">{opt.hindiName}</span>
                  <span className="opt-desc">{opt.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
