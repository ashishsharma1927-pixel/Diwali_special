export type CrackerType = 'bomb' | 'rocket' | 'chakri' | 'anaar' | 'diya' | 'fuljhadi' | 'skyshot' | 'ladi';

export type CrackerState = 'idle' | 'burning' | 'active' | 'exploded' | 'done';

export type BombVariant = 'mirchi' | 'sutli' | 'atom' | 'hydrogen' | 'gola';
export type RocketVariant = 'mini-whistle-3s' | 'sky-star-5s' | 'heavy-missile-8s';
export type ChakriVariant = 'mini-5s' | 'standard-10s' | 'jumbo-16s';
export type AnaarVariant = 'small-6s' | 'medium-10s' | 'jumbo-15s';
export type FuljhadiVariant = 'mini-10s' | 'standard-20s' | 'jumbo-30s';
export type SkyshotVariant = '12-shots' | '25-shots' | '50-shots';
export type LadiVariant = '50-ladi' | '100-ladi' | '200-ladi' | '500-ladi';

export interface CrackerItemData {
  id: string;
  type: CrackerType;
  name: string;
  hindiName: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  state: CrackerState;
  color?: string;
  fuseLength?: number;
  burnStartTime?: number;
  activeStartTime?: number;
  rotation?: number;
  scale?: number; // visual scale based on duration / bomb type
  duration?: number; // duration in ms for timed crackers
  bombVariant?: BombVariant;
  rocketVariant?: RocketVariant;
  chakriVariant?: ChakriVariant;
  anaarVariant?: AnaarVariant;
  fuljhadiVariant?: FuljhadiVariant;
  skyshotVariant?: SkyshotVariant;
  ladiVariant?: LadiVariant;
  shotsRemaining?: number;
  totalShots?: number;
  ladiBurntCount?: number;
  totalLadiCount?: number;
  // Chakri runtime dynamic position
  currentX?: number;
  currentY?: number;
  vx?: number;
  vy?: number;
  angle?: number;
  angularVelocity?: number;
  isDisappearing?: boolean;
  section?: 'courtyard' | 'arena';
}

export interface ActiveFuljhadi {
  id: string;
  x: number;
  y: number;
  startTime: number;
  duration: number;
  color: string;
  variant?: FuljhadiVariant;
}

export interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  gravity: number;
  flicker?: boolean;
}

export interface FlyingRocket {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  trailColor: string;
  targetY?: number;
  exploded: boolean;
  flightTime?: number;
  maxFlightTime?: number;
  heading?: number;
  wobblePhase?: number;
  variant?: RocketVariant;
  scale?: number;
}

export interface GroundChakri {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  rotSpeed: number;
  color: string;
  duration: number;
  startTime: number;
  scale?: number;
  variant?: ChakriVariant;
}

export interface ActiveAnaar {
  id: string;
  x: number;
  y: number;
  color: string;
  secondaryColor: string;
  startTime: number;
  duration: number;
  scale?: number;
  variant?: AnaarVariant;
}

export interface BombExplosionEvent {
  id: string;
  x: number;
  y: number;
  time: number;
  variant?: BombVariant;
  scale?: number;
}

export interface SpentMatchstickData {
  id: string;
  x: number; // percentage (0-100) or client px
  y: number; // percentage (0-100) or client px
  rotation: number; // degrees
  section?: 'courtyard' | 'arena';
}


