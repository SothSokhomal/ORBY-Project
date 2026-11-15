/**
 * Project Artemis: 90 Days on the Lunar Frontier
 * Pure Simulation Rules, Math & Lifecycle Logic (Decoupled from Three.js & UI)
 */

import {
  AstronautCrew,
  ColonyResources,
  GameSimulationState,
  ActiveCrisis,
  MissionLog,
  GearLoadout,
  CrewTask,
} from '../types/game.ts';
import { getDefaultGearLoadout, getGearItem, PAYLOAD_CAP_KG, getMissionModule } from './gearSystem.ts';

/** Real-world seconds each task runs before completing and returning the crew to idle.
 *  Field/Engineering tasks: 2 min (120s). Standard/Quick tasks: 1 min (60s). */
export const TASK_DURATIONS: Record<string, number> = {
  eva_repair:    120, // 2 min — field/engineering
  power_grid:    120, // 2 min — field/engineering
  hydroponics:   120, // 2 min — field/engineering
  research:      120, // 2 min — field/engineering
  resting:        60, // 1 min — standard/quick
  storm_shelter:   0, // No timer — stays until crisis resolved
  idle:            0,
};
import { TOTAL_HOURS, MISSION_SECONDS, MISSION_DAYS, HOURS_PER_DAY, missionDay } from '../config/clock.ts';
import { DIFFICULTY_LEVELS, DEFAULT_DIFFICULTY, type DifficultyId } from '../config/difficulty.ts';

export function createInitialCrew(): AstronautCrew[] {
  return [
    {
      id: 'crew-1',
      name: 'Cmdr. Sarah Chen',
      role: 'Flight engineer',
      callsign: 'Valkyrie-1',
      suitColor: '#ff5500', // NASA ACES vibrant orange
      health: 100,
      morale: 95,
      oxygen: 100,
      radiationDose: 4.2, // mSv
      task: 'idle',
      assignedModule: 'Kilopower & Battery Grid',
      location: [-2.5, 0, 1.5],
      isWalking: false,
      specialty: 'Power Grid Calibration & EVA Repair',
      bio: 'Former Artemis test pilot with 1,200 hours in lunar orbit. Decorated aerospace engineer with exceptional calm under decompression alarms.',
    },
    {
      id: 'crew-2',
      name: 'Dr. Marcus Vance',
      role: 'Medical officer',
      callsign: 'Hydra-2',
      suitColor: '#ff5500',
      health: 98,
      morale: 90,
      oxygen: 100,
      radiationDose: 3.8,
      task: 'idle',
      assignedModule: 'Closed-Loop ECLSS & Greenhouse',
      location: [2.0, 0, -1.8],
      isWalking: false,
      specialty: 'Aviation Medicine & Closed-Loop Hydroponics',
      bio: 'Flight surgeon and MIT biochemical engineer who designed closed-loop hydroponic life support systems. Monitors crew health and radiation dose.',
    },
    {
      id: 'crew-3',
      name: 'Dr. Elena Rostova',
      role: 'Geologist',
      callsign: 'Aura-3',
      suitColor: '#ff5500',
      health: 100,
      morale: 92,
      oxygen: 100,
      radiationDose: 5.1,
      task: 'idle',
      assignedModule: 'Observatory & Sample Lab',
      location: [0.5, 0, -3.2],
      isWalking: false,
      specialty: 'Planetary Geology & Soil Science',
      bio: 'ESA planetary geologist specialized in lunar regolith volatile mapping, sample collection, and botanical substrate analysis.',
    },
    {
      id: 'crew-4',
      name: 'Lt. Tyler Hayes',
      role: 'Pilot',
      callsign: 'Atom-4',
      suitColor: '#ff5500',
      health: 96,
      morale: 88,
      oxygen: 100,
      radiationDose: 6.4,
      task: 'idle',
      assignedModule: 'Airlock & Rover Bay',
      location: [-4.0, 0, -2.0],
      isWalking: false,
      specialty: 'EVA Exterior Operations & Rover Navigation',
      bio: 'US Navy test pilot trained for lunar surface EVA repairs, airlock maintenance, and pressurized rover traversal.',
    },
  ];
}

export function createInitialResources(): ColonyResources {
  return {
    oxygenKg: 850,
    oxygenMax: 1000,
    waterLiters: 2100,
    waterMax: 2500,
    foodMeals: 680,
    foodMax: 720,
    batteryKwh: 450,
    batteryMax: 500,
    solarKw: 35.0, // Active during lunar daylight
    fissionKw: 12.0, // Constant baseline Kilopower
    demandKw: 22.0, // Base life support & thermal grid
    baseIntegrity: 100,
    shieldingActive: true,
  };
}

export function createInitialGameState(customCallsign = 'ARTEMIS-III'): GameSimulationState {
  const defaultGear = getDefaultGearLoadout();
  return {
    mode: 'title',
    level: 'LEVEL_HANGAR',
    day: 1,
    hoursSinceLanding: 0,
    missionSecondsRemaining: MISSION_SECONDS,
    clockSpeed: 1.0,
    isPaused: false,
    lunarPhase: 'SUNLIT',
    sunAngle: 45,
    crew: createInitialCrew(),
    selectedCrewId: null,
    resources: createInitialResources(),
    // Packed mission modules reset to empty — player packs gear in the Hangar
    gearLoadout: { ...defaultGear, packedModuleIds: [] },
    activeCrisis: null,
    logs: [
      {
        id: 'log-init',
        day: 1,
        timestamp: 'T+00:00:00',
        sender: 'HOUSTON CAPCOM',
        message: 'Artemis Base Camp is fully pressurized. All 4 crew members accounted for. Mission clock has commenced: 90-day survival protocol active.',
        type: 'info',
      },
    ],
    missionOutcome: 'IN_PROGRESS',
    callsign: customCallsign,
    highScore: 0,
    hasEverAssignedTask: false,
  };
}

export function setGearLoadout(
  state: GameSimulationState,
  newLoadout: GearLoadout
): GameSimulationState {
  const packed = newLoadout.packedModuleIds || [];

  // Enforce Decision D-06: 1,800 kg payload cap
  let validPacked = packed;
  const totalMass = packed.reduce((sum, id) => {
    const mod = getMissionModule(id);
    return sum + (mod?.weightKg || 0);
  }, 0);

  if (totalMass > PAYLOAD_CAP_KG) {
    const trimmed: string[] = [];
    let curMass = 0;
    for (const id of packed) {
      const mod = getMissionModule(id);
      const m = mod?.weightKg || 0;
      if (curMass + m <= PAYLOAD_CAP_KG) {
        trimmed.push(id);
        curMass += m;
      }
    }
    validPacked = trimmed;
  }

  let batteryMaxBonus = 0;
  let fissionBonus = 0;

  if (validPacked.length > 0) {
    if (validPacked.includes('battery_bank')) batteryMaxBonus += 250;
    if (validPacked.includes('kilopower')) fissionBonus += 6.0;
  } else {
    const powerGear = getGearItem(newLoadout.powerId);
    batteryMaxBonus = powerGear.statModifiers.batteryMaxBonusKwh || 0;
    fissionBonus = powerGear.statModifiers.fissionBonusKw || 0;
  }

  const batteryMax = 500 + batteryMaxBonus;
  const fissionKw = 12.0 + fissionBonus;

  const summary =
    validPacked.length > 0
      ? `${validPacked.length} modules packed`
      : `${getGearItem(newLoadout.eclssId).name} / ${getGearItem(newLoadout.powerId).name}`;

  return {
    ...state,
    gearLoadout: { ...newLoadout, packedModuleIds: validPacked },
    resources: {
      ...state.resources,
      batteryMax,
      batteryKwh: Math.min(state.resources.batteryKwh, batteryMax),
      fissionKw,
    },
    logs: [
      {
        id: `gear-${Date.now()}`,
        day: state.day,
        timestamp: 'GEAR CALIBRATION',
        sender: 'PAYLOAD BAY',
        message: `Equipment loadout re-calibrated: ${summary}.`,
        type: 'info',
      },
      ...state.logs,
    ],
  };
}

/**
 * Mulberry32 32-bit deterministic seeded random generator (D-10, Section 13)
 * Pure TypeScript with zero DOM/Three.js dependencies.
 */
export function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Calculates current Lunar day/night cycle based on difficulty dark intervals (Decision D-03).
 * South Pole crater rims have continuous sunlight with periodic shadow intervals:
 * - Cadet: 48h (2 days)
 * - Pilot: 72h (3 days)
 * - Commander: 100h (4 days 4 hours)
 * Dark intervals replace the old lunar night model (locked decision D-03).
 */
export function getLunarPhase(
  hoursSinceLanding: number,
  difficulty: DifficultyId = DEFAULT_DIFFICULTY
): {
  phase: 'SUNLIT' | 'PENUMBRA' | 'NIGHT';
  sunAngle: number;
  solarFactor: number;
  isDarkPeriod: boolean;
  hoursUntilNextDark: number;
  darkDurationHours: number;
} {
  const darkDurationHours = DIFFICULTY_LEVELS[difficulty].darkIntervalHours;

  // 28-day lunar rotational period = 672 hours
  const cycleHours = 672;
  const cycleTime = hoursSinceLanding % cycleHours;
  const sunlitHours = cycleHours - darkDurationHours;

  const sunAngle = (cycleTime / cycleHours) * 360;

  if (cycleTime >= sunlitHours) {
    return {
      phase: 'NIGHT',
      sunAngle,
      solarFactor: 0.0,
      isDarkPeriod: true,
      hoursUntilNextDark: 0,
      darkDurationHours,
    };
  } else {
    const hoursUntilNextDark = sunlitHours - cycleTime;
    const peakProgress = Math.sin((cycleTime / sunlitHours) * Math.PI);
    return {
      phase: 'SUNLIT',
      sunAngle,
      solarFactor: Math.max(0.75, 0.75 + 0.25 * peakProgress),
      isDarkPeriod: false,
      hoursUntilNextDark,
      darkDurationHours,
    };
  }
}

/**
 * Advance the simulation by deltaDays (e.g. 0.015 days per real 100ms tick at 1x)
 */
export function tickSimulation(
  state: GameSimulationState,
  deltaDays: number
): GameSimulationState {
  if (state.missionOutcome !== 'IN_PROGRESS' || state.mode !== 'playing') {
    return state;
  }

  // Clone state
  const newState = {
    ...state,
    resources: { ...state.resources },
    crew: state.crew.map((c) => ({ ...c })),
    logs: [...state.logs],
  };

  // Advance Hours & Days (D-02: 1 tick = 1 hour, 2,160 hours total, DAY X / 90)
  const deltaHours = deltaDays * HOURS_PER_DAY;
  const currentHours = state.hoursSinceLanding;
  const newHours = Math.min(TOTAL_HOURS, currentHours + deltaHours);
  const newDay = missionDay(newHours);
  const missionSecondsRemaining = Math.max(0, Math.round(((TOTAL_HOURS - newHours) / TOTAL_HOURS) * MISSION_SECONDS));

  const prevDay = state.day;
  if (newDay > prevDay) {
    newState.logs.unshift({
      id: `log-day-${newDay}`,
      day: newDay,
      timestamp: `DAY ${newDay} 06:00 UTC`,
      sender: 'ECLSS TELEMETRY',
      message: `Day ${newDay} routine diagnostics completed. Life support stability checked.`,
      type: 'info',
    });
  }

  newState.hoursSinceLanding = newHours;
  newState.day = newDay;
  newState.missionSecondsRemaining = missionSecondsRemaining;

  // Lunar Phase & Solar Calculation (pass hours directly)
  const { phase, sunAngle, solarFactor } = getLunarPhase(newHours);
  newState.lunarPhase = phase;
  newState.sunAngle = sunAngle;

  // Solar power output — peak from VSAT specs (sourced: NASA Langley NTRS 20210011743)
  // solarArrayMaxKw set by injectFlightEngineerDataset; default 45 kW (4 × 10 kW arrays)
  const baseSolarMax = newState.resources.solarArrayMaxKw ?? 45.0;
  newState.resources.solarKw = baseSolarMax * solarFactor;

  // Active Equipment Loadout Modifiers
  const packed = newState.gearLoadout?.packedModuleIds || [];
  const hasModule = (id: string) => packed.includes(id);

  // Power Demand & Load Shedding Priority (Rule DR-01)
  // Keep-alive priority (highest first): Life support (1), Heating (2), Comms (3), Rovers (4), Science (5)
  // When power is in deficit, shed lowest priority first: Science -> Rovers -> Communications -> Heating -> Life Support
  const hours = deltaDays * 24;
  const totalGenKw = newState.resources.solarKw + newState.resources.fissionKw;

  let gridEff = 1.0;
  const hasPowerSpecialist = newState.crew.some(
    (c) => c.task === 'power_grid' && c.health > 20
  );
  if (hasPowerSpecialist) {
    gridEff = 0.85; // 15% efficiency boost from Flight engineer
  }

  let stormExtra = (newState.activeCrisis?.type === 'SOLAR_STORM' && newState.resources.shieldingActive) ? 12.0 : 0.0;
  let demandScience = 3.5 * gridEff;
  let demandRovers = (hasModule('lunar_rover') ? 1.5 : 0.0) * gridEff;
  let demandComms = 2.0 * gridEff;
  let demandHeating = 5.0 * gridEff;
  let demandLifeSupport = (8.0 + stormExtra) * gridEff;

  let totalDemand = demandScience + demandRovers + demandComms + demandHeating + demandLifeSupport;
  let currentBattery = newState.resources.batteryKwh;

  const shedLoads: ('science' | 'rovers' | 'communications' | 'heating' | 'life_support')[] = [];
  let effectiveDemand = totalDemand;
  let cabinTemp = state.resources.cabinTempC ?? 21.0;

  // Check deficit helper: can generation + battery sustain this load over tick?
  const isDeficit = (dem: number) => {
    const net = totalGenKw - dem;
    return (currentBattery + net * hours) <= 0;
  };

  // 1. Shed Science (First)
  if (isDeficit(effectiveDemand)) {
    shedLoads.push('science');
    effectiveDemand -= demandScience;
  }

  // 2. Shed Rovers (Second)
  if (demandRovers > 0 && isDeficit(effectiveDemand)) {
    shedLoads.push('rovers');
    effectiveDemand -= demandRovers;
  }

  // 3. Shed Communications (Third)
  if (isDeficit(effectiveDemand)) {
    shedLoads.push('communications');
    effectiveDemand -= demandComms;
  }

  // 4. Shed Heating (Fourth - cabin freezes towards -20°C per DR-07)
  if (isDeficit(effectiveDemand)) {
    shedLoads.push('heating');
    effectiveDemand -= demandHeating;
    cabinTemp = Math.max(-20, cabinTemp - 6.0 * deltaDays);
  } else {
    cabinTemp = Math.min(21.0, cabinTemp + 12.0 * deltaDays);
  }

  // 5. Shed Life Support (Last - only if battery = 0 and gen < life support)
  let isBrownout = false;
  if (isDeficit(effectiveDemand)) {
    shedLoads.push('life_support');
    isBrownout = true;
  }

  newState.resources.demandKw = effectiveDemand;
  newState.resources.shedLoads = shedLoads;
  newState.resources.cabinTempC = cabinTemp;

  // Battery energy delta
  const netKw = totalGenKw - effectiveDemand;
  const batteryDelta = netKw * hours;
  currentBattery = Math.max(0, Math.min(newState.resources.batteryMax, currentBattery + batteryDelta));
  newState.resources.batteryKwh = currentBattery;

  const eclssGear = getGearItem(newState.gearLoadout?.eclssId || 'eclss_standard');
  const powerGear = getGearItem(newState.gearLoadout?.powerId || 'power_standard');
  const suitGear = getGearItem(newState.gearLoadout?.suitId || 'suit_standard');
  const payloadGear = getGearItem(newState.gearLoadout?.payloadId || 'payload_radar');

  // ECLSS Consumption rates per sol
  // 4 crew consume: ~3.3 kg O2/sol, ~10 L water/sol, ~8 meals/sol
  const livingCrewCount = newState.crew.filter((c) => c.health > 0).length;

  let baseO2Eff = eclssGear.statModifiers.o2Efficiency ?? 1.0;
  let baseWaterEff = eclssGear.statModifiers.waterEfficiency ?? 1.0;
  if (packed.length > 0) {
    if (hasModule('o2_generator')) baseO2Eff = Math.min(baseO2Eff, 0.85);
    if (hasModule('water_recycler')) baseWaterEff = Math.min(baseWaterEff, 0.70);
  }

  let o2BurnRate = livingCrewCount * 0.85 * deltaDays * baseO2Eff;
  let waterBurnRate = livingCrewCount * 2.5 * deltaDays * baseWaterEff;
  let foodBurnRate = livingCrewCount * 2.0 * deltaDays;

  // Hydroponics & payload mitigation
  // VEG-04 yield from OSD-655: 0.57 kg / 28-day cycle per tray (sourced: NASA OSDR Mizuna data)
  const hasHydroSpecialist = newState.crew.some(
    (c) => c.task === 'hydroponics' && c.health > 20
  );
  if (hasHydroSpecialist || hasModule('hydroponics')) {
    const foodYield = hasModule('hydroponics') ? 1.35 : (payloadGear.statModifiers.foodBonus ?? 1.0);
    foodBurnRate = (foodBurnRate * 0.7) / foodYield;
    waterBurnRate *= 0.8;
    // Fresh crop morale boost (sourced: OSD-655 + CSA Food Production — +2%/day when greens available)
    const hydroScienceShed = newState.resources.shedLoads?.includes('science');
    if (!hydroScienceShed && hasHydroSpecialist) {
      const moraleBoost = (state.moraleBoostFromHydroponics ?? 2.0) * deltaDays;
      newState.crew.forEach((c) => {
        if (c.health > 0) c.morale = Math.min(100, c.morale + moraleBoost);
      });
    }
  }

  // Closed loop recycler status
  if (newState.activeCrisis?.type === 'RECYCLER_BURST' && !newState.activeCrisis.resolved) {
    const leakFactor = payloadGear.id === 'payload_compressor' ? 1.4 : 2.2;
    o2BurnRate *= leakFactor;
    waterBurnRate *= (leakFactor * 0.9);
  }

  newState.resources.oxygenKg = Math.max(0, newState.resources.oxygenKg - o2BurnRate);
  newState.resources.waterLiters = Math.max(0, newState.resources.waterLiters - waterBurnRate);
  newState.resources.foodMeals = Math.max(0, newState.resources.foodMeals - foodBurnRate);

  // Resource-critical alert logs — fire once when each resource first hits zero
  if (state.resources.oxygenKg > 0 && newState.resources.oxygenKg <= 0) {
    newState.logs.unshift({
      id: `alert-o2-zero-${Date.now()}`,
      day: newDay,
      timestamp: `DAY ${newDay} — CRITICAL`,
      sender: 'ECLSS LIFE SUPPORT',
      message: 'OXYGEN DEPLETED! Crew entering hypoxia. Assign someone to EVA repair immediately or all crew will be lost.',
      type: 'crisis',
    });
  }
  if (state.resources.waterLiters > 0 && newState.resources.waterLiters <= 0) {
    newState.logs.unshift({
      id: `alert-water-zero-${Date.now()}`,
      day: newDay,
      timestamp: `DAY ${newDay} — CRITICAL`,
      sender: 'ECLSS WATER RECYCLER',
      message: 'WATER SUPPLY EXHAUSTED! Crew dehydration begins now. Health drops 40 points per day until water is restored.',
      type: 'crisis',
    });
  }
  if (state.resources.foodMeals > 0 && newState.resources.foodMeals <= 0) {
    newState.logs.unshift({
      id: `alert-food-zero-${Date.now()}`,
      day: newDay,
      timestamp: `DAY ${newDay} — WARNING`,
      sender: 'HYDROPONICS BAY',
      message: 'FOOD STORES EMPTY! Starvation sets in. Assign crew to Hydroponics to slow the decline.',
      type: 'alert',
    });
  }
  // Low-resource early warnings (fire once when crossing threshold)
  const o2Pct = newState.resources.oxygenKg / (newState.resources.oxygenMax ?? 1000);
  const waterPct = newState.resources.waterLiters / (newState.resources.waterMax ?? 2500);
  const foodPct = newState.resources.foodMeals / (newState.resources.foodMax ?? 720);
  if (state.resources.oxygenKg / (state.resources.oxygenMax ?? 1000) > 0.15 && o2Pct <= 0.15) {
    newState.logs.unshift({
      id: `warn-o2-low-${Date.now()}`,
      day: newDay,
      timestamp: `DAY ${newDay} — WARNING`,
      sender: 'ECLSS SENSOR',
      message: 'Oxygen below 15%. Check the O2 generator. Dark periods consume reserves fast.',
      type: 'alert',
    });
  }
  if (state.resources.waterLiters / (state.resources.waterMax ?? 2500) > 0.15 && waterPct <= 0.15) {
    newState.logs.unshift({
      id: `warn-water-low-${Date.now()}`,
      day: newDay,
      timestamp: `DAY ${newDay} — WARNING`,
      sender: 'WATER RECYCLER',
      message: 'Water below 15%. Assign Dr. Vance to Hydroponics to boost recycling efficiency.',
      type: 'alert',
    });
  }
  if (state.resources.foodMeals / (state.resources.foodMax ?? 720) > 0.20 && foodPct <= 0.20) {
    newState.logs.unshift({
      id: `warn-food-low-${Date.now()}`,
      day: newDay,
      timestamp: `DAY ${newDay} — WARNING`,
      sender: 'HYDROPONICS BAY',
      message: 'Food stores below 20%. Put a crew member on Hydroponics duty now.',
      type: 'alert',
    });
  }

  // Crisis Generation (Scheduled & Dynamic per Decision D-04: auto-pauses until player decides)
  if (!newState.activeCrisis) {
    // Day 18: Recycler Malfunction
    if (newDay === 18 && prevDay < 18) {
      newState.activeCrisis = {
        type: 'RECYCLER_BURST',
        title: 'ECLSS Sabatier Steam Rupture',
        description: 'High-pressure recycling pipe burst on Module 3 exterior. Oxygen venting rapidly into the vacuum!',
        timeRemainingDays: 2.5,
        severity: 'WARNING',
        resolved: false,
      };
      newState.isPaused = true;
      newState.mode = 'paused';
      newState.logs.unshift({
        id: `crisis-${Date.now()}`,
        day: newDay,
        timestamp: 'ALERT T+CRISIS',
        sender: 'ECLSS INTEGRITY SENSOR',
        message: 'PRESSURE DROP IN SABATIER RECYCLER. Exterior EVA repair required immediately!',
        type: 'crisis',
      });
    }
    // Day 42: Solar Storm CME
    else if (newDay === 42 && prevDay < 42) {
      newState.activeCrisis = {
        type: 'SOLAR_STORM',
        title: 'Class-X Coronal Mass Ejection Warning',
        description: 'Deep-space sensor buoy detected massive solar proton barrage arriving in 12 hours. All crew must enter the subterranean Storm Shelter!',
        timeRemainingDays: 3.0,
        severity: 'CRITICAL',
        resolved: false,
      };
      newState.isPaused = true;
      newState.mode = 'paused';
      newState.logs.unshift({
        id: `crisis-${Date.now()}`,
        day: newDay,
        timestamp: 'ALERT T+CME',
        sender: 'NOAA DEEP SPACE WEATHER',
        message: 'CLASS-X CME IMPACT IMMINENT. Radiation spike will exceed 800 mSv if unshielded.',
        type: 'crisis',
      });
    }
    // Day 65: Micrometeorite impact
    else if (newDay === 65 && prevDay < 65) {
      newState.activeCrisis = {
        type: 'MICROMETEORITE_IMPACT',
        title: 'Regolith Debris Impact on Solar Tracking Array',
        description: 'High-velocity micrometeorite struck Solar Array B gimbal gear, locking orientation.',
        timeRemainingDays: 2.0,
        severity: 'CAUTION',
        resolved: false,
      };
      newState.isPaused = true;
      newState.mode = 'paused';
    }
  }

  // Process Active Crisis Tick
  if (newState.activeCrisis && !newState.activeCrisis.resolved) {
    newState.activeCrisis.timeRemainingDays -= deltaDays;

    // Check crisis resolution conditions
    if (newState.activeCrisis.type === 'RECYCLER_BURST') {
      const isRepairing = newState.crew.some(
        (c) => c.task === 'eva_repair' && c.health > 20
      );
      if (isRepairing) {
        // Repair progress
        if (newState.activeCrisis.timeRemainingDays <= 1.5) {
          newState.activeCrisis.resolved = true;
          newState.logs.unshift({
            id: `crisis-resolved-${Date.now()}`,
            day: newDay,
            timestamp: 'REPAIR COMPLETE',
            sender: 'CMDR SARAH CHEN',
            message: 'Sabatier pipe weld sealed with titanium sleeve. Recycler pressure normalized.',
            type: 'alert',
          });
        }
      }
    } else if (newState.activeCrisis.type === 'SOLAR_STORM') {
      // Check if all crew are sheltered
      const allSheltered = newState.crew.every(
        (c) => c.task === 'storm_shelter' || c.health <= 0
      );
      if (newState.activeCrisis.timeRemainingDays <= 0) {
        newState.activeCrisis.resolved = true;
        // SEP proton damage: GaAs triple-junction cells lose 5% output (one-time, sourced: Sumita et al. 2003)
        if (!state.sepDamageApplied) {
          const degradPct = (state.sepDegradationPctPerEvent ?? 5.0) / 100;
          const prevMax = newState.resources.solarArrayMaxKw ?? 45.0;
          newState.resources.solarArrayMaxKw = parseFloat((prevMax * (1 - degradPct)).toFixed(2));
          newState.sepDamageApplied = true;
        }
        newState.logs.unshift({
          id: `crisis-storm-end-${Date.now()}`,
          day: newDay,
          timestamp: 'STORM SUBSIDED',
          sender: 'DR. ELENA ROSTOVA',
          message: `Solar proton flux decayed below safety threshold. Safe to resume nominal surface operations. Solar arrays de-rated to ${(newState.resources.solarArrayMaxKw ?? 45.0).toFixed(1)} kW (SEP lattice damage).`,
          type: 'info',
        });
      } else if (!allSheltered) {
        // Radiation dose from real DONKI storm flux (nasaStormFluxMsvPerHr).
        // Default: X8.7 reference = 12.35 mSv/hr × 24 = 296 mSv/day unshielded lunar surface.
        const stormFluxMsvPerDay = (state.nasaStormFluxMsvPerHr ?? 12.35) * 24;
        newState.crew.forEach((c) => {
          if (c.task !== 'storm_shelter' && c.health > 0) {
            c.health = Math.max(0, c.health - 25 * deltaDays);
            const radFactor = suitGear.statModifiers.radiationDefense ?? 1.0;
            c.radiationDose += stormFluxMsvPerDay * deltaDays * radFactor;
            c.morale = Math.max(10, c.morale - 30 * deltaDays);
          }
        });
      }
    } else if (newState.activeCrisis.type === 'MICROMETEORITE_IMPACT') {
      const isRepairing = newState.crew.some(
        (c) => c.task === 'eva_repair' && c.health > 20
      );
      if (isRepairing || newState.activeCrisis.timeRemainingDays <= 0) {
        newState.activeCrisis.resolved = true;
      }
    }

    // Crisis Timeout / Failure
    if (newState.activeCrisis.timeRemainingDays <= 0 && !newState.activeCrisis.resolved) {
      if (newState.activeCrisis.type === 'RECYCLER_BURST') {
        newState.resources.baseIntegrity = Math.max(0, newState.resources.baseIntegrity - 30);
        newState.resources.waterLiters = Math.max(0, newState.resources.waterLiters - 200);
      }
    }
  }

  // Real-time task timer — independent of game speed (Decision D-04 pacing)
  // deltaDays = 0.15 * (intervalMs/1000) * clockSpeed, so dtRealSec = deltaDays / (0.15 * clockSpeed).
  // At 1x with 100ms tick: deltaDays=0.015 → dtRealSec=0.1s per tick. A 120s task completes in 120s. ✓
  const dtRealSec = deltaDays / (0.15 * state.clockSpeed);
  newState.crew.forEach((c) => {
    if (c.health <= 0 || c.task === 'idle' || c.task === 'storm_shelter') return;
    const dur = c.taskDurationSeconds ?? 0;
    if (dur <= 0) return;
    const elapsed = (c.taskSecondsElapsed ?? 0) + dtRealSec;
    if (elapsed >= dur) {
      // Task complete — bonuses applied separately via completeCrewTask in the UI
      // Here we simply flag completion by marking elapsed == duration
      c.taskSecondsElapsed = dur;
    } else {
      c.taskSecondsElapsed = elapsed;
    }
  });

  // Crew Health & Morale Evaluation
  newState.crew.forEach((c) => {
    if (c.health <= 0) return;

    // Resting heals health
    if (c.task === 'resting') {
      c.health = Math.min(100, c.health + 8 * deltaDays);
      c.morale = Math.min(100, c.morale + 10 * deltaDays);
    }

    // Oxygen starvation
    if (newState.resources.oxygenKg <= 0) {
      c.health = Math.max(0, c.health - 80 * deltaDays);
      c.morale = 0;
    }

    // Water dehydration
    if (newState.resources.waterLiters <= 0) {
      c.health = Math.max(0, c.health - 40 * deltaDays);
      c.morale = Math.max(0, c.morale - 20 * deltaDays);
    }

    // Food starvation — 25 health/day: kills in ~4 days if unaddressed
    if (newState.resources.foodMeals <= 0) {
      c.health = Math.max(0, c.health - 25 * deltaDays);
      c.morale = Math.max(0, c.morale - 20 * deltaDays);
    }

    // Freezing habitat cold if heating shed (Rule DR-07)
    if (newState.resources.shedLoads?.includes('heating') || isBrownout) {
      c.health = Math.max(0, c.health - 20 * deltaDays);
      c.morale = Math.max(0, c.morale - 25 * deltaDays);
    }

    // Nominal lunar surface radiation accumulation (sourced: NASA OSDR RadLab)
    // Inside habitat: 0.38 mSv/day (ISS RadLab 0.2 × 1.9, no magnetosphere at south pole)
    // EVA surface: 0.65 mSv/day (GCR + SPE exposure, Zeitlin et al. 2013)
    const isOnEVA = c.task === 'eva_repair';
    c.radiationDose += (isOnEVA ? 0.65 : 0.38) * deltaDays;
  });

  // Research standing orders bonus (pauses if science load shed per Rule DR-01)
  // Yield multiplier driven by real LCROSS ice data: 1.56× at Shackleton (5.6% ice)
  const isScienceShed = newState.resources.shedLoads?.includes('science');
  const researchMultiplier = state.researchYieldMultiplier ?? 1.0;
  const activeResearchers = newState.crew.filter((c) => c.task === 'research' && c.health > 20).length;
  if (activeResearchers > 0 && !isScienceShed) {
    newState.highScore = (newState.highScore || 0) + Math.round(activeResearchers * 15 * deltaDays * researchMultiplier);
  }

  // Geological research discoveries (Dr. Rostova — only fires if she's researching + science not shed)
  // Findings are grounded in real NASA mission data (LCROSS, LRO LOLA, LAMP, Mini-RF, Clementine)
  const geologyDiscoveries = state.geologyDiscoveries ?? [];
  const rostova = newState.crew.find((c) => c.id === 'crew-3');
  const rostovIsResearching = rostova && rostova.task === 'research' && rostova.health > 20;
  if (rostovIsResearching && !isScienceShed) {
    for (const disc of geologyDiscoveries) {
      if (prevDay < disc.day && newDay >= disc.day) {
        newState.logs.unshift({
          id: `discovery-day${disc.day}-${Date.now()}`,
          day: newDay,
          timestamp: `DAY ${newDay} — GEOLOGY`,
          sender: 'DR. ELENA ROSTOVA',
          message: `${disc.title}: ${disc.finding} [${disc.source}]`,
          type: 'info',
        });
        newState.highScore = (newState.highScore || 0) + disc.bonusScore;
      }
    }
  }

  // Power engineering discoveries (Cmdr. Sarah Chen — fires when she's on power_grid)
  // Findings grounded in NASA NTRS VSAT + BVAD + LRO WAC illumination data
  const powerEngDiscoveries = state.powerEngDiscoveries ?? [];
  const sarah = newState.crew.find((c) => c.id === 'crew-1');
  const sarahIsOnPowerGrid = sarah && sarah.task === 'power_grid' && sarah.health > 20;
  if (sarahIsOnPowerGrid) {
    for (const disc of powerEngDiscoveries) {
      if (prevDay < disc.day && newDay >= disc.day) {
        newState.logs.unshift({
          id: `powerdisc-day${disc.day}-${Date.now()}`,
          day: newDay,
          timestamp: `DAY ${newDay} — POWER ENG`,
          sender: 'CMDR. SARAH CHEN',
          message: `${disc.title}: ${disc.finding} [${disc.source}]`,
          type: 'info',
        });
        newState.highScore = (newState.highScore || 0) + disc.bonusScore;
      }
    }
  }

  // Medical officer discoveries (Dr. Marcus Vance — fires when he's on hydroponics task)
  // Findings grounded in OSD-575 (blood/cytokines), OSD-655 (VEG-04 hydro), LRO CRaTER
  const medicalDiscoveries = state.medicalDiscoveries ?? [];
  const marcus = newState.crew.find((c) => c.id === 'crew-2');
  const marcusIsOnHydro = marcus && marcus.task === 'hydroponics' && marcus.health > 20;
  if (marcusIsOnHydro) {
    for (const disc of medicalDiscoveries) {
      if (prevDay < disc.day && newDay >= disc.day) {
        newState.logs.unshift({
          id: `meddisc-day${disc.day}-${Date.now()}`,
          day: newDay,
          timestamp: `DAY ${newDay} — MEDICAL`,
          sender: 'DR. MARCUS VANCE',
          message: `${disc.title}: ${disc.finding} [${disc.source}]`,
          type: 'info',
        });
        newState.highScore = (newState.highScore || 0) + disc.bonusScore;
      }
    }
  }

  // Check Win/Loss conditions (locked spec: victory requires Day 90 + ≥3 crew alive)
  const aliveCrew = newState.crew.filter((c) => c.health > 0);
  const aliveCount = aliveCrew.length;

  if (aliveCount < 3) {
    // Crew loss failure — fewer than 3 survivors cannot sustain outpost operations
    newState.missionOutcome = 'DEFEAT';
    newState.mode = 'gameover';
    newState.clockSpeed = 1;
    if (aliveCount === 0) {
      newState.defeatReason = 'All 4 crew members were lost due to life-support failure.';
    } else {
      const lost = 4 - aliveCount;
      newState.defeatReason =
        `${lost} crew member${lost > 1 ? 's' : ''} lost. ` +
        `Only ${aliveCount} survivor${aliveCount !== 1 ? 's' : ''} remain — ` +
        `3 or more are needed to keep the outpost running.`;
    }
  } else if (newState.resources.baseIntegrity <= 0) {
    newState.missionOutcome = 'DEFEAT';
    newState.mode = 'gameover';
    newState.clockSpeed = 1;
    newState.defeatReason = 'Catastrophic habitat structural decompression.';
  } else if (newDay >= MISSION_DAYS || newHours >= TOTAL_HOURS) {
    newState.mode = 'gameover';
    newState.clockSpeed = 1;
    if (!newState.hasEverAssignedTask) {
      // Never-assigned defeat: player reached Day 90 without giving a single task order
      newState.missionOutcome = 'DEFEAT';
      newState.defeatReason =
        'Your crew waited idle for all 90 days. No tasks were ever assigned. ' +
        'Next time: click each astronaut card at the bottom and pick a job for them!';
    } else {
      // Normal victory — aliveCount >= 3 guaranteed by earlier checks
      newState.missionOutcome = 'VICTORY';
      newState.victoryType = aliveCount === 4 ? 'FULL_CREW' : 'MIN_CREW';
      const healthScore = aliveCrew.reduce((acc, c) => acc + c.health, 0) * 10;
      const resourceScore = Math.floor(
        newState.resources.oxygenKg + newState.resources.waterLiters * 0.5 + newState.resources.foodMeals
      );
      newState.highScore = (newState.highScore || 0) + healthScore + resourceScore + 5000;
    }
  }

  return newState;
}

/**
 * Assign a task to an astronaut
 */
export function assignCrewTask(
  state: GameSimulationState,
  crewId: string,
  task: CrewTask
): GameSimulationState {
  const isActiveTask = task !== 'idle' && task !== 'storm_shelter';
  return {
    ...state,
    hasEverAssignedTask: state.hasEverAssignedTask || isActiveTask,
    crew: state.crew.map((c) => {
      if (c.id === crewId) {
        return {
          ...c,
          task,
          taskSecondsElapsed: 0,
          taskDurationSeconds: TASK_DURATIONS[task] ?? 0,
        };
      }
      return c;
    }),
  };
}

/**
 * Complete a crew task — applies one-time bonus, returns crew to idle
 */
export function completeCrewTask(
  state: GameSimulationState,
  crewId: string
): GameSimulationState {
  return {
    ...state,
    crew: state.crew.map((c) => {
      if (c.id !== crewId || c.health <= 0) return c;
      let bonus: Partial<typeof c> = {};
      if (c.task === 'eva_repair') {
        bonus = { health: Math.min(100, c.health + 5) };
      } else if (c.task === 'hydroponics') {
        bonus = { morale: Math.min(100, c.morale + 8) };
      } else if (c.task === 'resting') {
        bonus = { health: Math.min(100, c.health + 10), morale: Math.min(100, c.morale + 6) };
      } else if (c.task === 'research') {
        bonus = { morale: Math.min(100, c.morale + 4) };
      } else if (c.task === 'power_grid') {
        bonus = { health: Math.min(100, c.health + 3) };
      }
      return {
        ...c,
        ...bonus,
        task: 'idle' as CrewTask,
        taskSecondsElapsed: 0,
        taskDurationSeconds: 0,
        lastCompletedDay: state.day,
      };
    }),
  };
}

/**
 * Quick order: Everyone to storm shelter
 */
export function orderAllToShelter(state: GameSimulationState): GameSimulationState {
  return {
    ...state,
    crew: state.crew.map((c) => ({
      ...c,
      task: 'storm_shelter',
    })),
  };
}
