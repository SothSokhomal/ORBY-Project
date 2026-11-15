/**
 * Project Artemis: 90 Days on the Lunar Frontier
 * Core Game Engine Types & State Definitions
 */

export type GameLevel =
  | 'LEVEL_HANGAR'
  | 'LEVEL_ORRERY'
  | 'LEVEL_LAUNCH_PAD'
  | 'LEVEL_LUNAR_SURFACE'
  | 'LEVEL_HAB_INTERIOR';

export type GameStateMode = 'title' | 'playing' | 'paused' | 'gameover';

export type CrewRole =
  | 'Flight engineer'
  | 'Medical officer'
  | 'Geologist'
  | 'Pilot';

export type CrewTask =
  | 'eva_repair'
  | 'power_grid'
  | 'hydroponics'
  | 'research'
  | 'resting'
  | 'storm_shelter'
  | 'idle';

export interface AstronautCrew {
  id: string;
  name: string;
  role: CrewRole;
  callsign: string;
  suitColor: string; // NASA ACES orange
  health: number; // 0 - 100
  morale: number; // 0 - 100
  oxygen: number; // Suit tank 0 - 100%
  radiationDose: number; // mSv accumulated
  task: CrewTask;
  assignedModule: string;
  location: [number, number, number]; // 3D world pos
  targetLocation?: [number, number, number];
  isWalking: boolean;
  specialty: string;
  bio: string;
  /** Real-world seconds elapsed since the current task was assigned (independent of game speed) */
  taskSecondsElapsed?: number;
  /** Total real-world seconds this task runs before completing and returning to idle */
  taskDurationSeconds?: number;
}

export type CrisisType =
  | 'NONE'
  | 'SOLAR_STORM'
  | 'RECYCLER_BURST'
  | 'BROWNOUT_DEFICIT'
  | 'MICROMETEORITE_IMPACT';

export interface ActiveCrisis {
  type: CrisisType;
  title: string;
  description: string;
  timeRemainingDays: number; // Days remaining to resolve
  assignedAstronautId?: string;
  severity: 'CAUTION' | 'WARNING' | 'CRITICAL';
  resolved: boolean;
}

export interface ColonyResources {
  oxygenKg: number; // Max 1000 kg (~90 days for 4 crew)
  oxygenMax: number;
  waterLiters: number; // Max 2500 L
  waterMax: number;
  foodMeals: number; // Max 720 meals (4 crew * 2 meals * 90 days = 720)
  foodMax: number;
  batteryKwh: number; // Max 500 kWh
  batteryMax: number;
  solarKw: number; // Current solar generation
  solarArrayMaxKw?: number; // VSAT peak capacity (sourced: NASA Langley NTRS 20210011743; default 45 kW)
  fissionKw: number; // Kilopower baseline generation (e.g. 10 kW)
  demandKw: number; // Current total power consumption
  baseIntegrity: number; // 0 - 100%
  shieldingActive: boolean;
  cabinTempC?: number; // Nominal 21°C; drops when heating is shed (DR-07)
  co2Level?: number; // CO2 ppm or ratio; rises without GM-06 or power (DR-04)
  dustLevel?: number; // 0.0 to 1.0; accumulates on panels, cleaned by EVA (DR-05)
  shedLoads?: ('science' | 'rovers' | 'communications' | 'heating' | 'life_support')[]; // DR-01 keep-alive priority
}

export interface MissionLog {
  id: string;
  day: number;
  timestamp: string;
  sender: string;
  message: string;
  type: 'info' | 'alert' | 'crisis' | 'transmission';
}

export interface MissionModule {
  id: string;
  name: string;
  category: 'POWER' | 'LIFE_SUPPORT' | 'SAFETY' | 'SYSTEMS';
  categoryLabel: 'Power' | 'Life support' | 'Safety' | 'Systems';
  weightKg: number;
  image: string;
  defaultPacked: boolean;
  shortBenefit: string;
  detailedEffect: string;
}

export interface GearItem {
  id: string;
  name: string;
  category: 'ECLSS' | 'POWER' | 'SUIT' | 'PAYLOAD';
  tagline: string;
  description: string;
  perks: string[];
  statModifiers: {
    o2Efficiency?: number; // e.g. 0.8 = 20% less consumption
    waterEfficiency?: number;
    foodBonus?: number;
    fissionBonusKw?: number;
    batteryMaxBonusKwh?: number;
    radiationDefense?: number; // e.g. 0.5 = 50% radiation cut
    repairSpeedBonus?: number;
    crisisEarlyWarning?: boolean;
  };
}

export interface GearLoadout {
  packedModuleIds?: string[];
  eclssId: string;
  powerId: string;
  suitId: string;
  payloadId: string;
}

export interface GameSimulationState {
  mode: GameStateMode;
  level: GameLevel;
  day: number; // Mission Day (1 - 90) per Decision D-02
  hoursSinceLanding: number; // 0 to 2,160 hours (THE canonical time value)
  missionSecondsRemaining: number; // 600 at start (10:00) down to 0
  clockSpeed: number; // 1, 1.25, 1.5, 1.75, 2, 6 (Decision D-04)
  isPaused: boolean;
  lunarPhase: 'SUNLIT' | 'PENUMBRA' | 'NIGHT';
  sunAngle: number; // 0 to 360 degrees
  crew: AstronautCrew[];
  selectedCrewId: string | null;
  resources: ColonyResources;
  gearLoadout: GearLoadout;
  activeCrisis: ActiveCrisis | null;
  logs: MissionLog[];
  missionOutcome: 'IN_PROGRESS' | 'VICTORY' | 'DEFEAT';
  defeatReason?: string;
  /** Set on VICTORY: whether all 4 (FULL_CREW) or exactly 3 (MIN_CREW) astronauts survived to Day 90 */
  victoryType?: 'FULL_CREW' | 'MIN_CREW';
  callsign: string;
  highScore: number;
  /** True once any crew member has been assigned a non-idle task; never-assigned at Day 90 = DEFEAT */
  hasEverAssignedTask?: boolean;
  /** Peak radiation flux (mSv/hr) from loaded NASA DONKI dataset — used by solar storm crisis */
  nasaStormFluxMsvPerHr?: number;
  /** Research yield multiplier from LCROSS ice data (default 1.0, real: 1.56) */
  researchYieldMultiplier?: number;
  /** Geology discovery schedule loaded from nasa-geology dataset */
  geologyDiscoveries?: GeologyDiscovery[];
  /** Power engineering discovery schedule loaded from nasa-powereng dataset (Sarah Chen) */
  powerEngDiscoveries?: GeologyDiscovery[];
  /** SEP GaAs lattice damage per solar particle event (sourced: Sumita et al. 2003; default 5%) */
  sepDegradationPctPerEvent?: number;
  /** True after first SEP storm degrades the solar arrays — prevents double-applying */
  sepDamageApplied?: boolean;
  /** Medical officer discovery schedule loaded from nasa-medical dataset (Dr. Marcus Vance) */
  medicalDiscoveries?: GeologyDiscovery[];
  /** VEG-04 fresh crop yield per 28-day cycle (sourced: OSD-655, default 0.57 kg) */
  hydroponicsYieldKgPer28Days?: number;
  /** Morale boost per day when fresh crops supplement MRE rations (sourced: OSD-655 + CSA; default 2%) */
  moraleBoostFromHydroponics?: number;
}

export interface GeologyDiscovery {
  day: number;
  title: string;
  finding: string;
  source: string;
  bonusScore: number;
}
