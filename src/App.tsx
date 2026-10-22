import React, { useState, useEffect, useRef, useCallback } from 'react';
import type {
  CrackerItemData,
  FlyingRocket,
  GroundChakri,
  ActiveAnaar,
  BombExplosionEvent,
  SpentMatchstickData,
  ActiveFuljhadi,
} from './types/diwali';
import { CrackerItem } from './components/CrackerItem';
import { LitMatchstick, type MatchState, type ToolType } from './components/LitMatchstick';
import { PeacockRangoli } from './components/PeacockRangoli';
import { DiwaliCanvas } from './components/DiwaliCanvas';
import { CelebrationWishes } from './components/CelebrationWishes';
import { FestiveDustbin } from './components/FestiveDustbin';
import { CrackerPickerDropdown, type CrackerOption } from './components/CrackerPickerDropdown';
import { soundEngine } from './utils/soundEngine';
import {
  Sparkles,
  Flame,
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
  Heart,
  Info
} from 'lucide-react';
import './App.css';

// Initial curated placement of authentic Diwali crackers across courtyard & black blasting arena
// Strictly placed in safe zones outside the central Peacock Rangoli
const createInitialCrackers = (): CrackerItemData[] => [
  // 1. Varied authentic bombs in Courtyard (Mirchi, Sutli, Atom, Coconut Gola, Hydrogen)
  {
    id: 'bomb-1',
    type: 'bomb',
    bombVariant: 'mirchi',
    name: 'Mirchi Bomb',
    hindiName: 'मिर्ची बम',
    scale: 0.65,
    x: 14,
    y: 72,
    state: 'idle',
    color: '#ef4444',
    section: 'courtyard',
  },
  {
    id: 'bomb-2',
    type: 'bomb',
    bombVariant: 'sutli',
    name: 'Sutli Bomb',
    hindiName: 'सुतली बम',
    scale: 1.0,
    x: 22,
    y: 74,
    state: 'idle',
    color: '#16a34a',
    section: 'courtyard',
  },
  {
    id: 'bomb-3',
    type: 'bomb',
    bombVariant: 'atom',
    name: 'Atom Bomb',
    hindiName: 'एटम बम',
    scale: 1.05,
    x: 78,
    y: 74,
    state: 'idle',
    color: '#15803d',
    section: 'courtyard',
  },
  {
    id: 'bomb-4',
    type: 'bomb',
    bombVariant: 'gola',
    name: 'Coconut Gola Bomb',
    hindiName: 'गोला बम',
    scale: 1.35,
    x: 86,
    y: 72,
    state: 'idle',
    color: '#854d0e',
    section: 'courtyard',
  },

  // 2. Rockets in launch stands / bottles (Small 3s, Standard 5s)
  {
    id: 'rocket-1',
    type: 'rocket',
    rocketVariant: 'mini-whistle-3s',
    name: 'Mini Whistle Rocket',
    hindiName: 'व्हिसल रॉकेट',
    duration: 3000,
    scale: 0.72,
    x: 26,
    y: 58,
    state: 'idle',
    color: '#ef4444',
    section: 'courtyard',
  },
  {
    id: 'rocket-2',
    type: 'rocket',
    rocketVariant: 'sky-star-5s',
    name: 'Golden Comet Rocket',
    hindiName: 'गोल्डन रॉकेट',
    duration: 5000,
    scale: 1.0,
    x: 74,
    y: 58,
    state: 'idle',
    color: '#f59e0b',
    section: 'courtyard',
  },

  // 3. Chakris in Courtyard (Small 5s, Standard 10s)
  {
    id: 'chakri-1',
    type: 'chakri',
    chakriVariant: 'mini-5s',
    name: 'Mini Speed Chakri',
    hindiName: 'मिनी चकरी',
    duration: 5000,
    scale: 0.75,
    x: 10,
    y: 82,
    state: 'idle',
    color: '#38bdf8',
    section: 'courtyard',
  },
  {
    id: 'chakri-2',
    type: 'chakri',
    chakriVariant: 'standard-10s',
    name: 'Zameen Chakkar',
    hindiName: 'जमीन चकरी',
    duration: 10000,
    scale: 1.0,
    x: 88,
    y: 82,
    state: 'idle',
    color: '#f59e0b',
    section: 'courtyard',
  },

  // 4. Anaars in Courtyard (Small 6s, Medium 10s)
  {
    id: 'anaar-1',
    type: 'anaar',
    anaarVariant: 'small-6s',
    name: 'Mini Sparkler Anaar',
    hindiName: 'छोटा अनार',
    duration: 6000,
    scale: 0.75,
    x: 18,
    y: 64,
    state: 'idle',
    color: '#10b981',
    section: 'courtyard',
  },
  {
    id: 'anaar-2',
    type: 'anaar',
    anaarVariant: 'medium-10s',
    name: 'Royal Gold Anaar',
    hindiName: 'शाही अनार',
    duration: 10000,
    scale: 1.0,
    x: 82,
    y: 64,
    state: 'idle',
    color: '#d97706',
    section: 'courtyard',
  },

  // 5. Traditional Terracotta Diyas in Courtyard
  {
    id: 'diya-1',
    type: 'diya',
    name: 'Sacred Diya',
    hindiName: 'शुभ दिया',
    x: 8,
    y: 86,
    state: 'active',
    section: 'courtyard',
  },
  {
    id: 'diya-2',
    type: 'diya',
    name: 'Lakshmi Diya',
    hindiName: 'लक्ष्मी दिया',
    x: 92,
    y: 86,
    state: 'idle',
    section: 'courtyard',
  },
  {
    id: 'diya-3',
    type: 'diya',
    name: 'Courtyard Diya',
    hindiName: 'आंगन दिया',
    x: 70,
    y: 86,
    state: 'active',
    section: 'courtyard',
  },

  // 6. Courtyard Ladi, Skyshot, and Fuljhadi
  {
    id: 'ladi-1',
    type: 'ladi',
    ladiVariant: '100-ladi',
    name: '100 in One Murgachap',
    hindiName: '100 लड़ी मुर्गा छाप',
    totalLadiCount: 100,
    scale: 1.05,
    x: 32,
    y: 84,
    state: 'idle',
    color: '#dc2626',
    section: 'courtyard',
  },
  {
    id: 'skyshot-1',
    type: 'skyshot',
    skyshotVariant: '12-shots',
    name: '12 Shots Sky Cake',
    hindiName: '12 शॉट्स स्काई शॉट',
    totalShots: 12,
    shotsRemaining: 12,
    scale: 1.0,
    x: 70,
    y: 68,
    state: 'idle',
    color: '#f59e0b',
    section: 'courtyard',
  },
  {
    id: 'fuljhadi-1',
    type: 'fuljhadi',
    fuljhadiVariant: 'standard-20s',
    name: '20 Sec Electric Fuljhadi',
    hindiName: '20 सेकंड फुलझड़ी',
    duration: 20000,
    scale: 1.0,
    x: 14,
    y: 60,
    state: 'idle',
    color: '#facc15',
    section: 'courtyard',
  },

  // 6. Black Blasting Arena Initial Heavy & Jumbo Crackers
  {
    id: 'bomb-arena-1',
    type: 'bomb',
    bombVariant: 'hydrogen',
    name: 'Hydrogen Mega Bomb',
    hindiName: 'हाइड्रोजन बम',
    scale: 1.5,
    x: 18,
    y: 72,
    state: 'idle',
    color: '#dc2626',
    section: 'arena',
  },
  {
    id: 'bomb-arena-2',
    type: 'bomb',
    bombVariant: 'gola',
    name: 'Coconut Gola Bomb',
    hindiName: 'गोला बम',
    scale: 1.35,
    x: 32,
    y: 74,
    state: 'idle',
    color: '#854d0e',
    section: 'arena',
  },
  {
    id: 'rocket-arena-1',
    type: 'rocket',
    rocketVariant: 'heavy-missile-8s',
    name: 'Heavy Sky Missile',
    hindiName: 'मिसाइल रॉकेट',
    duration: 8000,
    scale: 1.45,
    x: 48,
    y: 60,
    state: 'idle',
    color: '#8b5cf6',
    section: 'arena',
  },
  {
    id: 'chakri-arena-1',
    type: 'chakri',
    chakriVariant: 'jumbo-16s',
    name: 'Mega Cyclone Chakri',
    hindiName: 'महा चक्रवात चकरी',
    duration: 16000,
    scale: 1.4,
    x: 64,
    y: 76,
    state: 'idle',
    color: '#ec4899',
    section: 'arena',
  },
  {
    id: 'anaar-arena-1',
    type: 'anaar',
    anaarVariant: 'jumbo-15s',
    name: 'Volcanic Jumbo Anaar',
    hindiName: 'विशाल महा अनार',
    duration: 15000,
    scale: 1.45,
    x: 80,
    y: 64,
    state: 'idle',
    color: '#d97706',
    section: 'arena',
  },
  {
    id: 'diya-arena-1',
    type: 'diya',
    name: 'Arena Perimeter Diya',
    hindiName: 'एरीना दिया',
    x: 8,
    y: 84,
    state: 'active',
    section: 'arena',
  },
  {
    id: 'diya-arena-2',
    type: 'diya',
    name: 'Arena Perimeter Diya',
    hindiName: 'एरीना दिया',
    x: 92,
    y: 84,
    state: 'active',
    section: 'arena',
  },

  // 8. Black Arena Heavy Ladi, Skyshot, and Fuljhadi
  {
    id: 'ladi-arena-1',
    type: 'ladi',
    ladiVariant: '500-ladi',
    name: '500 in One Maha Chatai',
    hindiName: '500 लड़ी महा चटाई',
    totalLadiCount: 500,
    scale: 1.35,
    x: 52,
    y: 82,
    state: 'idle',
    color: '#991b1b',
    section: 'arena',
  },
  {
    id: 'skyshot-arena-1',
    type: 'skyshot',
    skyshotVariant: '50-shots',
    name: '50 Shots Mega Galaxy',
    hindiName: '50 शॉट्स महा उत्सव',
    totalShots: 50,
    shotsRemaining: 50,
    scale: 1.35,
    x: 22,
    y: 64,
    state: 'idle',
    color: '#ec4899',
    section: 'arena',
  },
  {
    id: 'fuljhadi-arena-1',
    type: 'fuljhadi',
    fuljhadiVariant: 'jumbo-30s',
    name: '30 Sec Jumbo Fuljhadi',
    hindiName: '30 सेकंड महा फुलझड़ी',
    duration: 30000,
    scale: 1.25,
    x: 82,
    y: 76,
    state: 'idle',
    color: '#ec4899',
    section: 'arena',
  },
];

export function App() {
  // Start with clean screen showcasing only the Peacock Rangoli on first visit
  // The user can add any cracker of their choice according to them!
  const [crackers, setCrackers] = useState<CrackerItemData[]>([]);
  const [matchPos, setMatchPos] = useState({ x: 300, y: 300 });
  const [matchState, setMatchState] = useState<MatchState>('docked');
  const [activeTool, setActiveTool] = useState<ToolType>('match');
  const [isNearFuse, setIsNearFuse] = useState(false);
  const [hoveredCrackerId, setHoveredCrackerId] = useState<string | null>(null);
  const [spentMatchsticks, setSpentMatchsticks] = useState<SpentMatchstickData[]>([]);
  const [activeFuljhadis, setActiveFuljhadis] = useState<ActiveFuljhadi[]>([]);

  // Dynamic flying & active cracker states
  const [flyingRockets, setFlyingRockets] = useState<FlyingRocket[]>([]);
  const [activeAnaars, setActiveAnaars] = useState<ActiveAnaar[]>([]);
  const [groundChakris, setGroundChakris] = useState<GroundChakri[]>([]);
  const [bombExplosions, setBombExplosions] = useState<BombExplosionEvent[]>([]);

  // Feedback & Stats
  const [burstCount, setBurstCount] = useState(0);
  const [screenShake, setScreenShake] = useState(0);
  const [isMuted, setIsMuted] = useState(soundEngine.getIsMuted());
  const [showWishes, setShowWishes] = useState(false);

  // Dustbin & Cleanup States
  const [cleanedCount, setCleanedCount] = useState(0);
  const [isDustbinHovered, setIsDustbinHovered] = useState(false);

  // Move Cracker Interactive States (Move ANY cracker anywhere on screen)
  const [draggingCrackerId, setDraggingCrackerId] = useState<string | null>(null);
  const [isPlacingDiyaMode, setIsPlacingDiyaMode] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const crackerPointerStartRef = useRef<{ id: string; x: number; y: number; time: number } | null>(null);
  const matchTipRef = useRef({ x: 300, y: 300 });
  const lastFuseCheckTimeRef = useRef<number>(0);
  const dragRafRef = useRef<number | null>(null);
  const crackersRef = useRef<CrackerItemData[]>(crackers);
  const draggingCrackerIdRef = useRef<string | null>(null);
  const currentPointerPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    crackersRef.current = crackers;
  }, [crackers]);

  useEffect(() => {
    draggingCrackerIdRef.current = draggingCrackerId;
  }, [draggingCrackerId]);

  // Strike fresh match from matchbox (Lights 1 Cracker)
  const handlePickUpMatch = () => {
    setActiveTool('match');
    soundEngine.playMatchStrike();
    setMatchState('lit');
    setIsNearFuse(false);
  };

  // Dock or put away matchstick into stand
  const handlePutDownMatch = () => {
    setMatchState('docked');
    setIsNearFuse(false);
    setHoveredCrackerId(null);
  };

  // Pick up Gas Lighter (Double-click triggered: can light everything non-stop!)
  const handlePickUpLighter = () => {
    setActiveTool('lighter');
    soundEngine.playLighterClick();
    setIsNearFuse(false);
  };

  // Put Lighter back onto lighter stand above matchbox
  const handlePutDownLighter = () => {
    setActiveTool('match');
    setMatchState('docked');
    setIsNearFuse(false);
    setHoveredCrackerId(null);
  };

  // Extinguish match flame immediately after lighting 1 cracker (ONLY if using matchstick)
  const handleExtinguishMatch = useCallback(() => {
    if (activeTool === 'match') {
      soundEngine.playMatchExtinguish();
      setMatchState('spent');
      setIsNearFuse(false);
      setHoveredCrackerId(null);
    }
  }, [activeTool]);

  // Throw or drop spent burnt matchstick onto the screen floor
  const handleDropSpentMatchAt = useCallback((clientX: number, clientY: number) => {
    const arenaStage = document.getElementById('arena-stage');
    const arenaRect = arenaStage?.getBoundingClientRect();

    let isOverArena = false;
    if (arenaRect && clientY >= arenaRect.top - 60) {
      isOverArena = true;
    }

    const activeStage = isOverArena
      ? arenaStage
      : document.querySelector('.diwali-courtyard-stage');
    const rect = activeStage?.getBoundingClientRect() || containerRef.current?.getBoundingClientRect();

    if (rect) {
      const x = Math.max(4, Math.min(96, ((clientX - rect.left) / rect.width) * 100));
      const y = Math.max(8, Math.min(94, ((clientY - rect.top) / rect.height) * 100));
      const rotation = Math.floor(Math.random() * 90) - 45;

      const newMatch: SpentMatchstickData = {
        id: `spent-match-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        x,
        y,
        rotation,
        section: isOverArena ? 'arena' : 'courtyard',
      };

      setSpentMatchsticks((prev) => [...prev, newMatch]);
      soundEngine.playWoodDrop();
      setMatchState('docked');
    }
  }, []);

  // Click on a dropped spent matchstick to sweep it into the dustbin
  const handleSweepSpentMatch = useCallback((id: string) => {
    soundEngine.playDustbinDrop();
    setSpentMatchsticks((prev) => prev.filter((m) => m.id !== id));
    setCleanedCount((prev) => prev + 1);
  }, []);

  // Screen shake reset (Canvas handles smooth 60FPS decay internally without DOM churn)
  useEffect(() => {
    if (screenShake <= 0) return;
    const timer = setTimeout(() => {
      setScreenShake(0);
    }, 200);
    return () => clearTimeout(timer);
  }, [screenShake]);

  // Audio Toggle
  const toggleAudio = () => {
    const active = soundEngine.toggleMute();
    setIsMuted(!active);
  };

  // Convert cracker ID to live viewport client pixels (handles live drag, drop, and scroll!)
  const getCrackerCoordsById = useCallback((id: string) => {
    // 1. If currently being dragged, use the live pointer coordinates!
    if (draggingCrackerIdRef.current === id && currentPointerPosRef.current) {
      return {
        x: currentPointerPosRef.current.x,
        y: currentPointerPosRef.current.y,
      };
    }

    // 2. Query real-time DOM element
    const el = document.getElementById(`cracker-${id}`);
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        return {
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
        };
      }
    }

    // 3. Fallback: calculate using latest state from crackersRef on active stage
    const cracker = crackersRef.current.find((c) => c.id === id);
    if (cracker) {
      const arenaStage = document.getElementById('arena-stage');
      const activeStage = cracker.section === 'arena'
        ? arenaStage
        : document.querySelector('.diwali-courtyard-stage');
      const rect = activeStage?.getBoundingClientRect() || containerRef.current?.getBoundingClientRect();
      if (rect) {
        return {
          x: rect.left + (cracker.x / 100) * rect.width,
          y: rect.top + (cracker.y / 100) * rect.height,
        };
      }
    }

    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }, []);

  // Convert cracker coordinates to viewport client pixels (supports scrolling!)
  const getCrackerCoords = useCallback((cracker: CrackerItemData) => {
    return getCrackerCoordsById(cracker.id);
  }, [getCrackerCoordsById]);

  // Ignite Cracker Core Logic
  const igniteCracker = useCallback((crackerId: string) => {
    const target = crackersRef.current.find((c) => c.id === crackerId);
    if (!target || target.state !== 'idle') return;

    // Start burning fuse
    soundEngine.playMatchStrike();
    soundEngine.playFuseBurn();

    // Immediately extinguish the matchstick - it spent its flame on this 1 cracker!
    handleExtinguishMatch();

    // Slower, authentic fuse timings so the player sees and hears the sizzling anticipation!
    const fuseTime = target.type === 'bomb' ? 1600 : target.type === 'rocket' ? 1400 : target.type === 'chakri' ? 1300 : target.type === 'anaar' ? 1500 : target.type === 'ladi' ? 1500 : target.type === 'skyshot' ? 1300 : target.type === 'fuljhadi' ? 350 : 450;

    setCrackers((prev) =>
      prev.map((c) => (c.id === crackerId ? { ...c, state: 'burning' } : c))
    );

    setTimeout(() => {
      // Live current position where the cracker is NOW (dragged, dropped, or still holding)
      const coords = getCrackerCoordsById(crackerId);
      const latestCracker = crackersRef.current.find((c) => c.id === crackerId) || target;

      if (latestCracker.type === 'bomb') {
        // --- BOMB EXPLOSION (MULTI-VARIANT: Mirchi, Sutli, Atom, Gola, Hydrogen) ---
        const variant = latestCracker.bombVariant || 'sutli';
        const bScale = latestCracker.scale || 1.0;
        soundEngine.playBombExplosion(variant);
        setScreenShake(0.85 * bScale);

        const expId = `${latestCracker.id}-${Date.now()}`;
        setBombExplosions((exps) => [
          ...exps,
          {
            id: expId,
            x: coords.x,
            y: coords.y,
            time: Date.now(),
            variant,
            scale: bScale,
          },
        ]);

        // Auto-clean explosion event after canvas processes it to prevent state memory buildup
        setTimeout(() => {
          setBombExplosions((curr) => curr.filter((e) => e.id !== expId));
        }, 450);

        // If user was actively dragging this bomb when it detonates, commit final coordinates and end drag
        if (draggingCrackerIdRef.current === crackerId && currentPointerPosRef.current) {
          const px = currentPointerPosRef.current.x;
          const py = currentPointerPosRef.current.y;
          const arenaStage = document.getElementById('arena-stage');
          const arenaRect = arenaStage?.getBoundingClientRect();
          let isOverArena = false;
          if (arenaRect && py >= arenaRect.top - 60) {
            isOverArena = true;
          }
          const activeStage = isOverArena
            ? arenaStage
            : document.querySelector('.diwali-courtyard-stage');
          const rect = activeStage?.getBoundingClientRect() || containerRef.current?.getBoundingClientRect();
          if (rect) {
            const x = Math.max(3, Math.min(97, ((px - rect.left) / rect.width) * 100));
            const y = Math.max(8, Math.min(94, ((py - rect.top) / rect.height) * 100));
            setCrackers((curr) =>
              curr.map((c) => (c.id === crackerId ? { ...c, x, y, section: isOverArena ? 'arena' : 'courtyard', state: 'exploded' } : c))
            );
          } else {
            setCrackers((curr) =>
              curr.map((c) => (c.id === crackerId ? { ...c, state: 'exploded' } : c))
            );
          }
          setDraggingCrackerId(null);
          crackerPointerStartRef.current = null;
        } else {
          setCrackers((curr) =>
            curr.map((c) => (c.id === crackerId ? { ...c, state: 'exploded' } : c))
          );
        }
        setBurstCount((b) => b + 1);

        // Bomb scorch mark automatically disappears or can be dragged to dustbin
        setTimeout(() => {
          setCrackers((curr) =>
            curr.map((c) => (c.id === crackerId ? { ...c, isDisappearing: true } : c))
          );
          setTimeout(() => {
            setCrackers((curr) => curr.filter((c) => c.id !== crackerId));
          }, 1200);
        }, 6500);
      } else if (latestCracker.type === 'rocket') {
        // --- ROCKET LAUNCH & FLIGHT (AEROBATIC RUN ALL AROUND SCREEN, SCALED & TIMED) ---
        soundEngine.playRocketLaunch();
        const targetSkyY = Math.random() * (window.innerHeight * 0.28) + 50;
        const rktScale = latestCracker.scale || 1.0;
        const rktDurationMs = latestCracker.duration || 5000;
        const maxFlight = Math.round((rktDurationMs / 1000) * 22);

        setFlyingRockets((rktList) => [
          ...rktList,
          {
            id: `${latestCracker.id}-${Date.now()}`,
            x: coords.x,
            y: coords.y,
            vx: 0,
            vy: -15,
            color: latestCracker.color || '#f59e0b',
            trailColor: '#fde047',
            targetY: targetSkyY,
            exploded: false,
            flightTime: 0,
            maxFlightTime: maxFlight,
            heading: -Math.PI / 2,
            wobblePhase: Math.random() * Math.PI * 2,
            scale: rktScale,
            variant: latestCracker.rocketVariant,
          },
        ]);
        setCrackers((curr) =>
          curr.map((c) => (c.id === crackerId ? { ...c, state: 'active' } : c))
        );
        setBurstCount((b) => b + 1);

        // Rocket bottle disappears 10 seconds after its use or can be put in dustbin
        setTimeout(() => {
          setCrackers((curr) =>
            curr.map((c) => (c.id === crackerId ? { ...c, isDisappearing: true } : c))
          );
          setTimeout(() => {
            setCrackers((curr) => curr.filter((c) => c.id !== crackerId));
          }, 1200);
        }, 8800);
      } else if (latestCracker.type === 'chakri') {
        // --- CHAKRI: NORMALIZED, GROUNDED SPEED & ROTATION ---
        soundEngine.startChakriSound();
        const speed = 4.2; // Realistic, gentle ground sliding speed
        const randomAngle = Math.random() * Math.PI * 2;
        const chkDurationMs = latestCracker.duration || 10000;
        const chkScale = latestCracker.scale || 1.0;

        setGroundChakris((chks) => [
          ...chks,
          {
            id: latestCracker.id,
            x: coords.x,
            y: coords.y,
            vx: Math.cos(randomAngle) * speed,
            vy: Math.sin(randomAngle) * speed * 0.65,
            angle: 0,
            rotSpeed: 2.4,
            color: latestCracker.color || '#f59e0b',
            duration: chkDurationMs,
            startTime: performance.now(),
            scale: chkScale,
            variant: latestCracker.chakriVariant,
          },
        ]);
        setCrackers((curr) =>
          curr.map((c) => (c.id === crackerId ? { ...c, state: 'active' } : c))
        );
        setBurstCount((b) => b + 1);
      } else if (latestCracker.type === 'anaar') {
        // --- ANAAR FOUNTAIN: RISES BOTTOM TO TOP THEN COMES DOWN (TIMED & SCALED) ---
        soundEngine.startAnaarSound();
        const anaarDurationMs = latestCracker.duration || 10000;
        const anaarScale = latestCracker.scale || 1.0;

        setActiveAnaars((anaarList) => [
          ...anaarList,
          {
            id: latestCracker.id,
            x: coords.x,
            y: coords.y,
            color: latestCracker.color || '#f59e0b',
            secondaryColor: '#facc15',
            startTime: performance.now(),
            duration: anaarDurationMs,
            scale: anaarScale,
            variant: latestCracker.anaarVariant,
          },
        ]);
        setCrackers((curr) =>
          curr.map((c) => (c.id === crackerId ? { ...c, state: 'active' } : c))
        );
        setBurstCount((b) => b + 1);

        // Once fountain finishes, anaar pot burns out, and disappears or can be dropped in dustbin
        setTimeout(() => {
          soundEngine.stopAnaarSound();
          setActiveAnaars((list) => list.filter((a) => a.id !== latestCracker.id));
          setCrackers((curr) =>
            curr.map((c) => (c.id === crackerId ? { ...c, state: 'done' } : c))
          );

          // Disappear the burnt anaar pot 10 seconds after completion
          setTimeout(() => {
            setCrackers((curr) =>
              curr.map((c) => (c.id === crackerId ? { ...c, isDisappearing: true } : c))
            );
            setTimeout(() => {
              setCrackers((curr) => curr.filter((c) => c.id !== crackerId));
            }, 1200);
          }, 8800);
        }, anaarDurationMs);
      } else if (latestCracker.type === 'diya') {
        // --- DIYA SACRED FLAME ---
        soundEngine.playDiwaliChime();
        setCrackers((curr) =>
          curr.map((c) => (c.id === crackerId ? { ...c, state: 'active' } : c))
        );
      } else if (latestCracker.type === 'skyshot') {
        // --- SKYSHOT: MULTI-SHOT REPEATER CAKE (12, 25, 50 SHELLS - ONE BY ONE SLOW & MAJESTIC) ---
        const totalShots = latestCracker.totalShots || 12;
        let shotsFired = 0;

        setCrackers((curr) =>
          curr.map((c) => (c.id === crackerId ? { ...c, state: 'active', shotsRemaining: totalShots } : c))
        );

        // Pacing: 1400ms spacing between shots so each shell shoots out one-by-one, ascends slowly, and detonates grandly
        const intervalTime = 1400;
        const skyshotTimer = setInterval(() => {
          shotsFired++;
          const remaining = Math.max(0, totalShots - shotsFired);

          soundEngine.playSkyshotLaunch();
          setScreenShake(0.24);
          setBurstCount((b) => b + 1);

          // Launch glowing mortar shell straight up into the high sky from current location of skyshot box
          const currentCoords = getCrackerCoordsById(crackerId);
          const targetSkyY = Math.random() * (window.innerHeight * 0.20) + 45;
          const shellColors = ['#f59e0b', '#ec4899', '#38bdf8', '#10b981', '#f43f5e', '#a855f7', '#fbbf24'];
          const shellColor = shellColors[shotsFired % shellColors.length];

          setFlyingRockets((rktList) => [
            ...rktList,
            {
              id: `${latestCracker.id}-shot-${shotsFired}-${Date.now()}`,
              x: currentCoords.x + (Math.random() - 0.5) * 12,
              y: currentCoords.y - 12,
              vx: (Math.random() - 0.5) * 1.5,
              vy: -9.0, // Stately vertical ascent
              color: shellColor,
              trailColor: '#fef08a',
              targetY: targetSkyY,
              exploded: false,
              flightTime: 0,
              maxFlightTime: 52, // Longer, majestic ascent time before apex detonation
              heading: -Math.PI / 2 + (Math.random() - 0.5) * 0.08,
              wobblePhase: 0,
              scale: 1.25,
            },
          ]);

          setCrackers((curr) =>
            curr.map((c) => (c.id === crackerId ? { ...c, shotsRemaining: remaining } : c))
          );

          if (shotsFired >= totalShots) {
            clearInterval(skyshotTimer);
            setTimeout(() => {
              setCrackers((curr) =>
                curr.map((c) => (c.id === crackerId ? { ...c, state: 'done' } : c))
              );
              // Box scorch disappears automatically after 5 seconds
              setTimeout(() => {
                setCrackers((curr) =>
                  curr.map((c) => (c.id === crackerId ? { ...c, isDisappearing: true } : c))
                );
                setTimeout(() => {
                  setCrackers((curr) => curr.filter((c) => c.id !== crackerId));
                }, 800);
              }, 5000);
            }, 1200);
          }
        }, intervalTime);
      } else if (latestCracker.type === 'ladi') {
        // --- LADI: MURGACHAP CHATAI (Audio-reactive synchronized burst with murgachap ladi.mp3) ---
        const totalCount = latestCracker.totalLadiCount || 100;

        setCrackers((curr) =>
          curr.map((c) => (c.id === crackerId ? { ...c, state: 'active' } : c))
        );

        // Audio-reactive Murgachap ladi performance:
        // Every pop sound in murgachap ladi.mp3 triggers an explosion flash, screen shake, and paper fragments!
        soundEngine.playLadiPerformance({
          maxPops: totalCount,
          onPop: (popIdx) => {
            setScreenShake(0.14);
            setBurstCount((b) => b + 1);

            const currentCoords = getCrackerCoordsById(crackerId);
            // Pop mini firecrackers and red paper shreds around the mat at its current location
            const jitterX = (Math.random() - 0.5) * 65;
            const jitterY = (Math.random() - 0.5) * 28;
            const expId = `${latestCracker.id}-pop-${popIdx}-${Date.now()}`;

            setBombExplosions((exps) => [
              ...exps,
              {
                id: expId,
                x: currentCoords.x + jitterX,
                y: currentCoords.y + jitterY,
                time: Date.now(),
                variant: 'mirchi',
                scale: 0.38,
              },
            ]);

            setTimeout(() => {
              setBombExplosions((curr) => curr.filter((e) => e.id !== expId));
            }, 280);
          },
          onComplete: () => {
            setCrackers((curr) =>
              curr.map((c) => (c.id === crackerId ? { ...c, state: 'exploded' } : c))
            );

            // Scraps spread around and disappear automatically after 5 seconds
            setTimeout(() => {
              setCrackers((curr) =>
                curr.map((c) => (c.id === crackerId ? { ...c, isDisappearing: true } : c))
              );
              setTimeout(() => {
                setCrackers((curr) => curr.filter((c) => c.id !== crackerId));
              }, 800);
            }, 5000);
          },
        });
      } else if (latestCracker.type === 'fuljhadi') {
        // --- FULJHADI: 10s, 20s, 30s SPARKLER WITH IRON CRACKLE ---
        const duration = latestCracker.duration || 10000;
        const newFuljhadi: ActiveFuljhadi = {
          id: latestCracker.id,
          x: coords.x,
          y: coords.y,
          startTime: performance.now(),
          duration,
          color: latestCracker.color || '#facc15',
          variant: latestCracker.fuljhadiVariant,
        };

        setActiveFuljhadis((list) => [...list, newFuljhadi]);
        setCrackers((curr) =>
          curr.map((c) => (c.id === crackerId ? { ...c, state: 'active' } : c))
        );
        setBurstCount((b) => b + 1);

        const soundInterval = setInterval(() => {
          soundEngine.playFuljhadiSparkle();
        }, 280);

        setTimeout(() => {
          clearInterval(soundInterval);
          setActiveFuljhadis((list) => list.filter((f) => f.id !== latestCracker.id));
          setCrackers((curr) =>
            curr.map((c) => (c.id === crackerId ? { ...c, state: 'done' } : c))
          );
          setTimeout(() => {
            setCrackers((curr) =>
              curr.map((c) => (c.id === crackerId ? { ...c, isDisappearing: true } : c))
            );
            setTimeout(() => {
              setCrackers((curr) => curr.filter((c) => c.id !== crackerId));
            }, 1200);
          }, 7000);
        }, duration);
      }
    }, fuseTime);
  }, [getCrackerCoordsById, handleExtinguishMatch]);

  // Rocket sky explosion callback
  const handleRocketExplode = useCallback((rkt: FlyingRocket) => {
    setFlyingRockets((list) => list.filter((r) => r.id !== rkt.id));
  }, []);

  // Chakri completion callback
  const handleChakriComplete = useCallback((id: string, finalX?: number, finalY?: number) => {
    soundEngine.stopChakriSound();
    setGroundChakris((list) => list.filter((c) => c.id !== id));
    setCrackers((curr) =>
      curr.map((c) => {
        if (c.id === id) {
          const updated: CrackerItemData = { ...c, state: 'done' };
          if (finalX !== undefined && finalY !== undefined) {
            const arenaStage = document.getElementById('arena-stage');
            const arenaRect = arenaStage?.getBoundingClientRect();
            let isOverArena = false;
            if (arenaRect && finalY >= arenaRect.top - 60) {
              isOverArena = true;
            }
            const activeStage = isOverArena
              ? arenaStage
              : document.querySelector('.diwali-courtyard-stage');
            const rect = activeStage?.getBoundingClientRect() || containerRef.current?.getBoundingClientRect();
            if (rect) {
              updated.x = Math.max(3, Math.min(97, ((finalX - rect.left) / rect.width) * 100));
              updated.y = Math.max(8, Math.min(94, ((finalY - rect.top) / rect.height) * 100));
              updated.section = isOverArena ? 'arena' : 'courtyard';
            }
          }
          return updated;
        }
        return c;
      })
    );

    // Chakri ground mark automatically disappears after its use or can be dropped in dustbin
    setTimeout(() => {
      setCrackers((curr) =>
        curr.map((c) => (c.id === id ? { ...c, isDisappearing: true } : c))
      );
      setTimeout(() => {
        setCrackers((curr) => curr.filter((c) => c.id !== id));
      }, 1200);
    }, 6000);
  }, []);

  // Check collision between lit tool (matchstick or gas lighter) tip and cracker fuses
  const checkFuseIgnition = useCallback(
    (pointerX: number, pointerY: number) => {
      const canIgnite = (activeTool === 'match' && matchState === 'lit') || activeTool === 'lighter';
      if (!canIgnite) return;

      const ignitionRadius = activeTool === 'lighter' ? 78 : 68; // Lighter has broader torch flame reach
      let foundNear = false;
      let nearId: string | null = null;

      crackers.forEach((cracker) => {
        if (cracker.state !== 'idle') return;

        const coords = getCrackerCoords(cracker);
        // Fuse offset relative to cracker body center for larger sizes
        const fuseOffsetY = cracker.type === 'bomb' ? -42 : cracker.type === 'rocket' ? -25 : cracker.type === 'anaar' ? -55 : -16;
        const fuseX = coords.x;
        const fuseY = coords.y + fuseOffsetY;

        const dist = Math.hypot(pointerX - fuseX, pointerY - fuseY);
        if (dist <= ignitionRadius) {
          foundNear = true;
          nearId = cracker.id;
          igniteCracker(cracker.id);
        }
      });

      setIsNearFuse((prev) => (prev !== foundNear ? foundNear : prev));
      setHoveredCrackerId((prev) => (prev !== nearId ? nearId : prev));
    },
    [crackers, matchState, activeTool, getCrackerCoords, igniteCracker]
  );

  // Handle moving ANY cracker (bombs, rockets, chakris, anaars, diyas) across courtyard / arena
  const handleCrackerPointerDown = (id: string, e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.stopPropagation();
    currentPointerPosRef.current = { x: e.clientX, y: e.clientY };
    crackerPointerStartRef.current = { id, x: e.clientX, y: e.clientY, time: Date.now() };
    setDraggingCrackerId(id);
    draggingCrackerIdRef.current = id;
  };

  // Mouse & Touch movement tracking: High performance, zero unnecessary React state churn
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const px = e.clientX;
    const py = e.clientY;
    currentPointerPosRef.current = { x: px, y: py };
    matchTipRef.current = { x: px, y: py };

    // 1. Proximity detection to Festive Dustbin in bottom-left corner (functional state toggle only)
    const binLeft = 28;
    const binBottom = 85;
    const binX = binLeft + 45;
    const binY = window.innerHeight - binBottom - 45;
    const distToBin = Math.hypot(px - binX, py - binY);
    const isNearBin = distToBin <= 90;
    setIsDustbinHovered((prev) => (prev !== isNearBin ? isNearBin : prev));

    // 2. Dragging a Cracker with requestAnimationFrame throttling for smooth 60fps tracking
    if (draggingCrackerId && crackerPointerStartRef.current) {
      const start = crackerPointerStartRef.current;
      const moveDist = Math.hypot(px - start.x, py - start.y);

      // Keep active anaars and fuljhadis in sync immediately while dragging!
      setActiveAnaars((prev) =>
        prev.map((a) => (a.id === draggingCrackerId ? { ...a, x: px, y: py } : a))
      );
      setActiveFuljhadis((prev) =>
        prev.map((f) => (f.id === draggingCrackerId ? { ...f, x: px, y: py - 20 } : f))
      );

      if (moveDist > 5 && !dragRafRef.current) {
        dragRafRef.current = requestAnimationFrame(() => {
          dragRafRef.current = null;
          const targetCracker = crackersRef.current.find((c) => c.id === draggingCrackerId);
          if (targetCracker) {
            const arenaStage = document.getElementById('arena-stage');
            const arenaRect = arenaStage?.getBoundingClientRect();

            let isOverArena = false;
            if (arenaRect && py >= arenaRect.top - 60) {
              isOverArena = true;
            }

            const activeStage = isOverArena
              ? arenaStage
              : document.querySelector('.diwali-courtyard-stage');
            const rect = activeStage?.getBoundingClientRect() || containerRef.current?.getBoundingClientRect();

            if (rect) {
              const x = Math.max(3, Math.min(97, ((px - rect.left) / rect.width) * 100));
              const y = Math.max(8, Math.min(94, ((py - rect.top) / rect.height) * 100));
              setCrackers((prev) =>
                prev.map((c) =>
                  c.id === draggingCrackerId
                    ? { ...c, x, y, section: isOverArena ? 'arena' : 'courtyard' }
                    : c
                )
              );
            }
          }
        });
      }
      return;
    }

    // 3. Throttled fuse ignition check when holding lit tool (~40ms)
    // Note: Tool position follows cursor via hardware-accelerated direct DOM transform in LitMatchstick,
    // which completely eliminates full React re-renders on every mouse move!
    const isToolInHand = (activeTool === 'match' && matchState === 'lit') || activeTool === 'lighter';
    if (!isToolInHand) return;

    const now = performance.now();
    if (now - lastFuseCheckTimeRef.current >= 40) {
      lastFuseCheckTimeRef.current = now;
      checkFuseIgnition(px, py);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    // Check if user dropped spent matchstick into the Festive Dustbin!
    if (activeTool === 'match' && matchState === 'spent' && isDustbinHovered) {
      soundEngine.playDustbinDrop();
      setCleanedCount((prev) => prev + 1);
      setMatchState('docked');
      setIsDustbinHovered(false);
      return;
    }

    // Check if user dropped a dragged cracker directly into the Festive Dustbin!
    if (draggingCrackerId && isDustbinHovered) {
      soundEngine.playDustbinDrop();
      setCrackers((prev) => prev.filter((c) => c.id !== draggingCrackerId));
      setCleanedCount((prev) => prev + 1);
      setDraggingCrackerId(null);
      draggingCrackerIdRef.current = null;
      setIsDustbinHovered(false);
      crackerPointerStartRef.current = null;
      return;
    }

    if (crackerPointerStartRef.current) {
      const { id, x, y, time } = crackerPointerStartRef.current;
      const px = e.clientX;
      const py = e.clientY;
      const dist = Math.hypot(px - x, py - y);
      const elapsed = Date.now() - time;

      // Direct Click on Cracker: ignite if user is holding lit matchstick OR gas lighter!
      if (dist < 8 && elapsed < 450) {
        const target = crackersRef.current.find((c) => c.id === id);
        if (target && target.state === 'idle') {
          if ((activeTool === 'match' && matchState === 'lit') || activeTool === 'lighter') {
            igniteCracker(id);
          }
        } else if (target && (target.state === 'exploded' || target.state === 'done' || target.isDisappearing)) {
          // Clicking on burnt leftover/ash mark sweeps it into the dustbin!
          soundEngine.playDustbinDrop();
          setCrackers((curr) => curr.filter((c) => c.id !== id));
          setCleanedCount((prev) => prev + 1);
        }
      } else if (dist >= 8) {
        // Drag release: immediately commit the final coordinates of the cracker
        if (dragRafRef.current) {
          cancelAnimationFrame(dragRafRef.current);
          dragRafRef.current = null;
        }

        const arenaStage = document.getElementById('arena-stage');
        const arenaRect = arenaStage?.getBoundingClientRect();
        let isOverArena = false;
        if (arenaRect && py >= arenaRect.top - 60) {
          isOverArena = true;
        }
        const activeStage = isOverArena
          ? arenaStage
          : document.querySelector('.diwali-courtyard-stage');
        const rect = activeStage?.getBoundingClientRect() || containerRef.current?.getBoundingClientRect();
        if (rect) {
          const finalX = Math.max(3, Math.min(97, ((px - rect.left) / rect.width) * 100));
          const finalY = Math.max(8, Math.min(94, ((py - rect.top) / rect.height) * 100));
          setCrackers((prev) =>
            prev.map((c) =>
              c.id === id
                ? { ...c, x: finalX, y: finalY, section: isOverArena ? 'arena' : 'courtyard' }
                : c
            )
          );
        }

        // Keep active anaars / fuljhadis in sync with final drop location
        setTimeout(() => {
          const finalCoords = getCrackerCoordsById(id);
          setActiveAnaars((prev) =>
            prev.map((a) => (a.id === id ? { ...a, x: finalCoords.x, y: finalCoords.y } : a))
          );
          setActiveFuljhadis((prev) =>
            prev.map((f) => (f.id === id ? { ...f, x: finalCoords.x, y: finalCoords.y - 20 } : f))
          );
        }, 30);
      }
      // Note: No sound played on drag release / selection

      crackerPointerStartRef.current = null;
      setDraggingCrackerId(null);
      draggingCrackerIdRef.current = null;
      return;
    }

    if (draggingCrackerId) {
      setDraggingCrackerId(null);
      draggingCrackerIdRef.current = null;
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // If holding a spent burnt matchstick:
    if (matchState === 'spent') {
      // If clicking over the dustbin:
      if (isDustbinHovered) {
        soundEngine.playDustbinDrop();
        setCleanedCount((prev) => prev + 1);
        setMatchState('docked');
        return;
      }
      // Otherwise: throw / drop the spent matchstick anywhere on screen!
      handleDropSpentMatchAt(e.clientX, e.clientY);
      return;
    }

    // If in Place Diya Mode: place a new Diya at this exact clicked position!
    if (isPlacingDiyaMode) {
      const arenaStage = document.getElementById('arena-stage');
      const arenaRect = arenaStage?.getBoundingClientRect();

      if (arenaRect && e.clientY >= arenaRect.top && e.clientY <= arenaRect.bottom) {
        const x = Math.max(3, Math.min(97, ((e.clientX - arenaRect.left) / arenaRect.width) * 100));
        const y = Math.max(8, Math.min(94, ((e.clientY - arenaRect.top) / arenaRect.height) * 100));
        addDiyaAt(x, y, 'arena');
      } else {
        const courtyardStage = document.querySelector('.diwali-courtyard-stage');
        const courtRect = courtyardStage?.getBoundingClientRect() || containerRef.current?.getBoundingClientRect();
        if (courtRect) {
          const x = Math.max(3, Math.min(97, ((e.clientX - courtRect.left) / courtRect.width) * 100));
          const y = Math.max(8, Math.min(94, ((e.clientY - courtRect.top) / courtRect.height) * 100));
          addDiyaAt(x, y, 'courtyard');
        }
      }
      return;
    }

    if (matchState !== 'lit') return;
    const px = e.clientX;
    const py = e.clientY;
    setMatchPos({ x: px, y: py });
    checkFuseIgnition(px, py);
  };

  // Add Diya at exact coordinates
  const addDiyaAt = (x: number, y: number, section: 'courtyard' | 'arena' = 'courtyard') => {
    const newId = `diya-${Date.now()}`;
    const newDiya: CrackerItemData = {
      id: newId,
      type: 'diya',
      name: 'Sacred Diya',
      hindiName: 'शुभ दिया',
      x,
      y,
      state: 'active',
      color: '#fbbf24',
      section,
    };
    setCrackers((prev) => [...prev, newDiya]);
    soundEngine.playDiwaliChime();
  };

  // 1-Click Sweep All Burnt Crackers & Spent Matches into Dustbin
  const handleSweepAllBurnt = useCallback(() => {
    soundEngine.playDustbinSweep();
    setCrackers((prev) => {
      const burnt = prev.filter(
        (c) => c.state === 'exploded' || c.state === 'done' || c.isDisappearing
      );
      const sweepCount = Math.max(burnt.length + spentMatchsticks.length, 1);
      setCleanedCount((count) => count + sweepCount);
      return prev.filter(
        (c) => c.state !== 'exploded' && c.state !== 'done' && !c.isDisappearing
      );
    });
    setSpentMatchsticks([]);
  }, [spentMatchsticks.length]);

  // Clean / Replenish Courtyard
  const resetCourtyard = () => {
    soundEngine.stopAnaarSound();
    soundEngine.stopChakriSound();
    soundEngine.stopLadiPerformance();
    setActiveAnaars([]);
    setGroundChakris([]);
    setFlyingRockets([]);
    setBombExplosions([]);
    setSpentMatchsticks([]);
    setActiveFuljhadis([]);
    setCrackers(createInitialCrackers());
  };

  // Random courtyard placement strictly outside the central Peacock Rangoli
  const getSafeCourtyardSpawnCoords = useCallback(() => {
    const isLeft = Math.random() < 0.5;
    let x: number;
    if (isLeft) {
      x = Math.floor(Math.random() * 22) + 8; // 8% to 30%
    } else {
      x = Math.floor(Math.random() * 22) + 70; // 70% to 92%
    }
    const y = Math.floor(Math.random() * 27) + 58;
    return { x, y };
  }, []);

  // Add a cracker using rich dropdown option (custom bomb variants, timing, scale)
  const handleSelectCrackerOption = (
    option: CrackerOption,
    targetSection?: 'courtyard' | 'arena'
  ) => {
    const newId = `${option.type}-${Date.now()}`;
    const scrollPos = window.scrollY || document.documentElement.scrollTop;
    const isArena = targetSection ? targetSection === 'arena' : scrollPos > window.innerHeight * 0.45;
    const section: 'courtyard' | 'arena' = isArena ? 'arena' : 'courtyard';

    let x: number;
    let y: number;

    if (section === 'arena') {
      x = Math.floor(Math.random() * 70) + 15;
      y = Math.floor(Math.random() * 25) + 55;
    } else {
      const coords = getSafeCourtyardSpawnCoords();
      x = coords.x;
      y = coords.y;
    }

    const newCracker: CrackerItemData = {
      id: newId,
      type: option.type,
      name: option.name,
      hindiName: option.hindiName,
      x,
      y,
      state: 'idle',
      color: option.color,
      scale: option.scale,
      duration: option.duration,
      bombVariant: option.bombVariant,
      rocketVariant: option.rocketVariant,
      chakriVariant: option.chakriVariant,
      anaarVariant: option.anaarVariant,
      section,
    };

    setCrackers((prev) => [...prev, newCracker]);
    // Selection sound completely removed per user request: silent placement
  };

  // Light All with Magic Spark button
  const lightAllCrackers = () => {
    crackers.forEach((c, idx) => {
      if (c.state === 'idle') {
        setTimeout(() => {
          igniteCracker(c.id);
        }, idx * 450);
      }
    });
  };

  return (
    <div
      ref={containerRef}
      className={`diwali-app-container ${isPlacingDiyaMode ? 'cursor-diya-mode' : ''}`}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {/* 60FPS Fireworks, Spark, Rocket, Chakri, Anaar, and Fuljhadi Canvas */}
      <DiwaliCanvas
        rockets={flyingRockets}
        onRocketExplode={handleRocketExplode}
        anaars={activeAnaars}
        chakris={groundChakris}
        fuljhadis={activeFuljhadis}
        onChakriComplete={handleChakriComplete}
        bombExplosions={bombExplosions}
        screenShake={screenShake}
      />

      {/* Interactive Ignition Station: Matchbox + Gas Lighter Stand */}
      <LitMatchstick
        matchPos={matchPos}
        isNearFuse={isNearFuse}
        matchState={matchState}
        activeTool={activeTool}
        onPickUpMatch={handlePickUpMatch}
        onPutDownMatch={handlePutDownMatch}
        onPickUpLighter={handlePickUpLighter}
        onPutDownLighter={handlePutDownLighter}
      />

      {/* Authentic Corner Dustbin for leftover ashes, burnt crackers & bottles */}
      <FestiveDustbin
        cleanedCount={cleanedCount}
        isDragOver={isDustbinHovered}
        onSweepAllBurnt={handleSweepAllBurnt}
      />

      {/* Atmospheric Overhead Festive Garland & Fairy Lights */}
      <header className="festive-sky-header">
        <div className="fairy-lights-string" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="fairy-bulb"
              style={{
                animationDelay: `${(i % 5) * 0.3}s`,
                backgroundColor: ['#facc15', '#ef4444', '#38bdf8', '#22c55e', '#ec4899'][i % 5],
              }}
            />
          ))}
        </div>

        <div className="header-content-bar">
          <div className="title-group">
            <div className="badge-festive">
              <Sparkles size={16} className="text-amber-400" />
              <span>शुभ दीपावली • FESTIVAL OF LIGHTS</span>
            </div>
            <h1 className="diwali-main-title">
              Happy <span className="title-gradient">Diwali</span>
            </h1>
          </div>

          {/* Quick Action Bar */}
          <div className="top-action-bar">
            {/* Audio Toggle */}
            <button
              className={`action-btn audio-btn ${!isMuted ? 'active' : ''}`}
              onClick={toggleAudio}
              title={isMuted ? 'Unmute Festival Audio' : 'Mute Audio'}
            >
              {!isMuted ? <Volume2 size={18} /> : <VolumeX size={18} />}
              <span>{!isMuted ? 'Audio ON' : 'Audio OFF'}</span>
            </button>

            {/* Matchstick pick up / release toggle */}
            <button
              className={`action-btn match-btn ${matchState === 'lit' ? 'active' : ''}`}
              onClick={() => {
                if (matchState === 'docked') {
                  handlePickUpMatch();
                } else {
                  handlePutDownMatch();
                }
              }}
              title={matchState === 'lit' ? 'Put Down Matchstick' : 'Strike Fresh Matchstick from Box'}
            >
              <Flame size={18} className="text-amber-400" />
              <span>
                {matchState === 'lit'
                  ? 'Holding Match 🔥 (1 Cracker)'
                  : matchState === 'spent'
                  ? 'Spent Match 💨 (Drop/Clean)'
                  : 'Strike Match 🕯️'}
              </span>
            </button>

            {/* Clean / Reset */}
            <button
              className="action-btn reset-btn"
              onClick={resetCourtyard}
              title="Clean burnt crackers and lay fresh unlit ones"
            >
              <RotateCcw size={17} />
              <span>Clean & Reset</span>
            </button>

            {/* Light All Magic */}
            <button
              className="action-btn magic-light-btn"
              onClick={lightAllCrackers}
              title="Light all crackers in sequence"
            >
              <Zap size={18} />
              <span>Light All 🎆</span>
            </button>

            {/* Wishes Drawer Toggle */}
            <button
              className="action-btn wishes-btn"
              onClick={() => setShowWishes(!showWishes)}
            >
              <Heart size={18} />
              <span>Diwali Wishes</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Quick Instruction Banner */}
      <div className="interactive-guide-pill">
        <Info size={16} className="icon-pulse" />
        <span>
          <strong>How to Play:</strong> Click &amp; <strong>drag any Diya 🪔</strong> to place it anywhere you want (around Rangoli, floor, borders)! Pick the <strong>Matchstick</strong> on the side to ignite crackers!
        </span>
      </div>

      {/* Active Place Diya Mode Floating Banner */}
      {isPlacingDiyaMode && (
        <div className="placing-mode-banner">
          <Sparkles size={18} className="text-amber-300 icon-spin" />
          <span>
            <strong>Place Diya Mode Active:</strong> Click <strong>anywhere on the screen</strong> to place a glowing Diya!
          </span>
          <button
            type="button"
            className="placing-done-btn"
            onClick={() => setIsPlacingDiyaMode(false)}
          >
            Done ✓
          </button>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: UPPER FESTIVE COURTYARD (PEACOCK RANGOLI & SACRED DIYAS)
          ========================================================================= */}
      <section className="diwali-page-section courtyard-section" id="rangoli-courtyard">
        <main className={`diwali-courtyard-stage ${screenShake > 0.3 ? 'stage-shake-active' : ''}`}>
          {/* Exquisite Authentic Peacock Rangoli Centerpiece */}
          <div className="courtyard-rangoli-center" aria-hidden="true">
            <PeacockRangoli />
          </div>

          {/* Crackers Placed in the Courtyard */}
          {crackers
            .filter((c) => (c.section || 'courtyard') === 'courtyard')
            .map((cracker) => (
              <CrackerItem
                key={cracker.id}
                cracker={cracker}
                isMatchHovered={hoveredCrackerId === cracker.id}
                onCrackerPointerDown={handleCrackerPointerDown}
                isDragging={draggingCrackerId === cracker.id}
              />
            ))}

          {/* Dropped Spent Matchsticks on Courtyard Floor */}
          {spentMatchsticks
            .filter((m) => (m.section || 'courtyard') === 'courtyard')
            .map((m) => (
              <div
                key={m.id}
                className="spent-floor-matchstick"
                style={{
                  left: `${m.x}%`,
                  top: `${m.y}%`,
                  transform: `translate(-50%, -50%) rotate(${m.rotation}deg)`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSweepSpentMatch(m.id);
                }}
                title="Burnt Matchstick: Click to clean into the dustbin!"
              >
                <div className="charred-head" />
                <div className="burnt-shaft" />
              </div>
            ))}
        </main>

        {/* Scroll Down Cue to the Black Blasting Arena */}
        <div className="scroll-cue-wrapper">
          <button
            type="button"
            className="scroll-cue-btn"
            onClick={() => {
              const el = document.getElementById('black-blasting-arena');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span>⬇ Scroll Down to Black Blasting Arena 🎆</span>
            <span className="cue-pulse-arrow">▼</span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: BLACK SPACE / BLASTING ARENA (FOR MAXIMUM POPPING CONTRAST)
          ========================================================================= */}
      <section className="diwali-page-section black-arena-section" id="black-blasting-arena">
        <div className="arena-header-banner">
          <div className="arena-badge">
            <Sparkles size={16} className="text-amber-400" />
            <span>MIDNIGHT CRACKER BLASTING GROUND • खुली काली ज़मीन</span>
          </div>
          <h2 className="arena-title">
            The <span className="title-gradient">Black Space</span> Blasting Arena
          </h2>
          <p className="arena-subtitle">
            An open pitch-black terrace where you can place and pop bombs, rockets, chakris, and fountains with ultra-high contrast!
          </p>

          {/* Quick Arena Actions to place crackers in the arena */}
          <div className="arena-quick-actions">
            <CrackerPickerDropdown
              category="ladi"
              onSelectOption={(opt) => handleSelectCrackerOption(opt, 'arena')}
              isArena={true}
            />
            <CrackerPickerDropdown
              category="skyshot"
              onSelectOption={(opt) => handleSelectCrackerOption(opt, 'arena')}
              isArena={true}
            />
            <CrackerPickerDropdown
              category="fuljhadi"
              onSelectOption={(opt) => handleSelectCrackerOption(opt, 'arena')}
              isArena={true}
            />
            <CrackerPickerDropdown
              category="bomb"
              onSelectOption={(opt) => handleSelectCrackerOption(opt, 'arena')}
              isArena={true}
            />
            <CrackerPickerDropdown
              category="rocket"
              onSelectOption={(opt) => handleSelectCrackerOption(opt, 'arena')}
              isArena={true}
            />
            <CrackerPickerDropdown
              category="chakri"
              onSelectOption={(opt) => handleSelectCrackerOption(opt, 'arena')}
              isArena={true}
            />
            <CrackerPickerDropdown
              category="anaar"
              onSelectOption={(opt) => handleSelectCrackerOption(opt, 'arena')}
              isArena={true}
            />
          </div>
        </div>

        {/* Black Arena Stage Floor */}
        <div className={`black-arena-stage ${screenShake > 0.3 ? 'stage-shake-active' : ''}`} id="arena-stage">
          <div className="arena-floor-grid" />
          <div className="arena-blast-circle" />

          {/* Crackers Placed in the Black Arena */}
          {crackers
            .filter((c) => c.section === 'arena')
            .map((cracker) => (
              <CrackerItem
                key={cracker.id}
                cracker={cracker}
                isMatchHovered={hoveredCrackerId === cracker.id}
                onCrackerPointerDown={handleCrackerPointerDown}
                isDragging={draggingCrackerId === cracker.id}
              />
            ))}

          {/* Dropped Spent Matchsticks on Arena Floor */}
          {spentMatchsticks
            .filter((m) => m.section === 'arena')
            .map((m) => (
              <div
                key={m.id}
                className="spent-floor-matchstick"
                style={{
                  left: `${m.x}%`,
                  top: `${m.y}%`,
                  transform: `translate(-50%, -50%) rotate(${m.rotation}deg)`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSweepSpentMatch(m.id);
                }}
                title="Burnt Matchstick: Click to clean into the dustbin!"
              >
                <div className="charred-head" />
                <div className="burnt-shaft" />
              </div>
            ))}
        </div>

        {/* Scroll Back Up Cue to Rangoli Courtyard */}
        <div className="scroll-cue-wrapper up-wrapper">
          <button
            type="button"
            className="scroll-cue-btn up-cue-btn"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <span>⬆ Scroll Up to Peacock Rangoli Courtyard 🪔</span>
            <span className="cue-pulse-arrow">▲</span>
          </button>
        </div>
      </section>

      {/* Bottom Floating Toolbar: Inventory / Add More Crackers */}
      <footer className="festive-bottom-bar">
        <div className="cracker-stats-pill">
          <span className="stats-label">Crackers Burst:</span>
          <span className="stats-value">{burstCount} 💥</span>
        </div>

        {/* Cracker Placement Tray with Dropdowns for all categories */}
        <div className="add-cracker-tray">
          <span className="tray-label">Choose &amp; Place:</span>
          <CrackerPickerDropdown
            category="ladi"
            onSelectOption={(opt) => handleSelectCrackerOption(opt)}
          />
          <CrackerPickerDropdown
            category="skyshot"
            onSelectOption={(opt) => handleSelectCrackerOption(opt)}
          />
          <CrackerPickerDropdown
            category="fuljhadi"
            onSelectOption={(opt) => handleSelectCrackerOption(opt)}
          />
          <CrackerPickerDropdown
            category="bomb"
            onSelectOption={(opt) => handleSelectCrackerOption(opt)}
          />
          <CrackerPickerDropdown
            category="rocket"
            onSelectOption={(opt) => handleSelectCrackerOption(opt)}
          />
          <CrackerPickerDropdown
            category="chakri"
            onSelectOption={(opt) => handleSelectCrackerOption(opt)}
          />
          <CrackerPickerDropdown
            category="anaar"
            onSelectOption={(opt) => handleSelectCrackerOption(opt)}
          />
          <button
            className={`tray-item-btn diya-tray-action-btn ${isPlacingDiyaMode ? 'active-placing' : ''}`}
            onClick={() => {
              setIsPlacingDiyaMode((prev) => !prev);
            }}
            title="Click to toggle Place Diya Mode - then click anywhere on screen to place Diyas!"
          >
            <span>🪔 {isPlacingDiyaMode ? 'Click Screen to Place 🪔' : '+ Place Diya Anywhere'}</span>
          </button>
        </div>
      </footer>

      {/* Expandable Diwali Wishes Drawer */}
      {showWishes && (
        <div className="wishes-modal-backdrop" onClick={() => setShowWishes(false)}>
          <div className="wishes-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✨ Auspicious Diwali Blessings &amp; Wishes</h2>
              <button className="close-modal-btn" onClick={() => setShowWishes(false)}>✕</button>
            </div>
            <CelebrationWishes />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
