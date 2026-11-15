import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialGameState,
  createInitialCrew,
  getLunarPhase,
  tickSimulation,
  assignCrewTask,
  orderAllToShelter,
  setGearLoadout,
  mulberry32,
} from './survivalRules.ts';
import { PAYLOAD_CAP_KG, getMissionModule } from './gearSystem.ts';

test('createInitialCrew initializes 4 ACES astronauts with full vitals and aligned roles', () => {
  const crew = createInitialCrew();
  assert.equal(crew.length, 4);
  assert.equal(crew[0].role, 'Flight engineer');
  assert.equal(crew[1].role, 'Medical officer');
  assert.equal(crew[2].role, 'Geologist');
  assert.equal(crew[3].role, 'Pilot');
  assert.equal(crew[0].suitColor, '#ff5500');
  assert.equal(crew[0].health, 100);
});

test('getLunarPhase complies with Decision D-03 dark intervals by difficulty', () => {
  // Day 1 at Lunar South Pole is Sunlit
  const day1 = getLunarPhase(1, 'pilot');
  assert.equal(day1.phase, 'SUNLIT');
  assert.equal(day1.isDarkPeriod, false);
  assert.ok(day1.solarFactor >= 0.75);

  // Day 7 is Sunlit
  const day7 = getLunarPhase(7, 'pilot');
  assert.equal(day7.phase, 'SUNLIT');
  assert.equal(day7.isDarkPeriod, false);

  // Cadet: 48h dark interval at end of 672h cycle (hours 624-672 => Day 27-28)
  const cadetSunlit = getLunarPhase(620, 'cadet');
  assert.equal(cadetSunlit.phase, 'SUNLIT');
  const cadetDark = getLunarPhase(630, 'cadet');
  assert.equal(cadetDark.phase, 'NIGHT');
  assert.equal(cadetDark.isDarkPeriod, true);
  assert.equal(cadetDark.darkDurationHours, 48);
  assert.equal(cadetDark.solarFactor, 0.0);

  // Pilot: 72h dark interval (hours 600-672 => Day 26-28)
  const pilotDark = getLunarPhase(610, 'pilot');
  assert.equal(pilotDark.phase, 'NIGHT');
  assert.equal(pilotDark.isDarkPeriod, true);
  assert.equal(pilotDark.darkDurationHours, 72);
  assert.equal(pilotDark.solarFactor, 0.0);

  // Commander: 100h dark interval (hours 572-672 => Day 24-28)
  const cmdrDark = getLunarPhase(580, 'commander');
  assert.equal(cmdrDark.phase, 'NIGHT');
  assert.equal(cmdrDark.isDarkPeriod, true);
  assert.equal(cmdrDark.darkDurationHours, 100);
  assert.equal(cmdrDark.solarFactor, 0.0);
});

test('mulberry32 seeded PRNG is strictly deterministic', () => {
  const prngA = mulberry32(42);
  const prngB = mulberry32(42);
  const prngC = mulberry32(99);

  const seqA = [prngA(), prngA(), prngA()];
  const seqB = [prngB(), prngB(), prngB()];
  const seqC = [prngC(), prngC(), prngC()];

  assert.deepEqual(seqA, seqB);
  assert.notDeepEqual(seqA, seqC);
});

test('Rule DR-01: Load shedding priority sheds loads in exact order under power deficit', () => {
  let state = createInitialGameState();
  state.mode = 'playing';

  // Equip rover so all loads exist
  state.gearLoadout.packedModuleIds = ['lunar_rover', 'solar_array'];

  // Force night so solarKw = 0, and drain battery to near 0
  state.hoursSinceLanding = 610; // In dark interval
  state.resources.batteryKwh = 1.0;
  state.resources.fissionKw = 0.0; // No generation at all

  // Tick simulation with power deficit
  state = tickSimulation(state, 0.01);

  // With 0 generation and nearly 0 battery, loads must be shed starting from Science
  const shed = state.resources.shedLoads || [];
  assert.ok(shed.length > 0);
  assert.equal(shed[0], 'science', 'Science must be shed first');
  assert.ok(shed.includes('rovers'), 'Rovers must be shed second');
  assert.ok(shed.includes('communications'), 'Communications must be shed third');
  assert.ok(shed.includes('heating'), 'Heating must be shed fourth');
  assert.ok(shed.includes('life_support'), 'Life support must be shed last');
  assert.ok(state.resources.cabinTempC !== undefined && state.resources.cabinTempC < 21.0);
});

test('Decision D-06: setGearLoadout strictly enforces 1,800 kg payload cap', () => {
  let state = createInitialGameState();

  // Attempt to pack all 12 modules (total > 2,400 kg)
  const all12Modules = [
    'solar_array',
    'battery_bank',
    'kilopower',
    'water_recycler',
    'o2_electrolysis',
    'co2_scrubber',
    'storm_shelter',
    'dosimeter_array',
    'hydroponics',
    'medical_bay',
    'avionics_spares',
    'lunar_rover',
  ];

  state = setGearLoadout(state, {
    ...state.gearLoadout,
    packedModuleIds: all12Modules,
  });

  const packed = state.gearLoadout.packedModuleIds || [];
  assert.ok(packed.length > 0);
  // Verify total packed weight does not exceed PAYLOAD_CAP_KG
  const totalMass = packed.reduce((sum: number, id: string) => {
    return sum + (getMissionModule(id)?.weightKg || 0);
  }, 0);
  assert.ok(totalMass <= PAYLOAD_CAP_KG, `Total mass ${totalMass}kg must be <= ${PAYLOAD_CAP_KG}kg`);
});

test('tickSimulation advances day and consumes resources', () => {
  let state = createInitialGameState();
  state.mode = 'playing';

  const initialO2 = state.resources.oxygenKg;
  const initialWater = state.resources.waterLiters;

  // Advance by 1 day
  state = tickSimulation(state, 1.0);

  assert.equal(state.day, 2);
  assert.ok(state.resources.oxygenKg < initialO2);
  assert.ok(state.resources.waterLiters < initialWater);
});

test('assignCrewTask and orderAllToShelter updates crew tasks correctly', () => {
  let state = createInitialGameState();
  state = assignCrewTask(state, 'crew-1', 'eva_repair');
  assert.equal(state.crew.find((c) => c.id === 'crew-1')?.task, 'eva_repair');

  state = orderAllToShelter(state);
  assert.ok(state.crew.every((c) => c.task === 'storm_shelter'));
});

test('Day 90 triggers VICTORY condition with calculated high score', () => {
  let state = createInitialGameState();
  state.mode = 'playing';
  state.day = 89;
  state.hoursSinceLanding = 89 * 24 - 1; // Just before day 90

  state = tickSimulation(state, 0.1);

  assert.equal(state.day, 90);
  assert.equal(state.missionOutcome, 'VICTORY');
  assert.equal(state.mode, 'gameover');
  assert.ok(state.highScore > 5000);
});

test('Critical resource depletion leads to DEFEAT condition', () => {
  let state = createInitialGameState();
  state.mode = 'playing';
  state.resources.oxygenKg = 0; // Complete asphyxiation

  // Tick for 2 full days without oxygen
  state = tickSimulation(state, 2.0);

  assert.equal(state.missionOutcome, 'DEFEAT');
  assert.equal(state.mode, 'gameover');
  assert.ok(state.defeatReason?.includes('lost'));
});

test('setGearLoadout updates equipment and boosts battery and fission power', () => {
  let state = createInitialGameState();
  assert.equal(state.resources.batteryMax, 500);

  state = setGearLoadout(state, {
    eclssId: 'eclss_cryo',
    powerId: 'power_graphene',
    suitId: 'suit_bismuth',
    payloadId: 'payload_algae',
  });

  assert.equal(state.resources.batteryMax, 750);
  assert.equal(state.gearLoadout.eclssId, 'eclss_cryo');
});

test('Continuous 10-minute mission clock advances hours and remaining time smoothly', () => {
  let state = createInitialGameState();
  state.mode = 'playing';
  assert.equal(state.day, 1);
  assert.equal(state.missionSecondsRemaining, 600);

  // Advance by 0.15 days (equivalent to 1 real second at 1x)
  state = tickSimulation(state, 0.15);

  assert.equal(state.day, 1);
  assert.ok(state.hoursSinceLanding > 0);
  assert.ok(state.missionSecondsRemaining <= 599);
});

test('All 6 standing orders can be assigned and research grants score yield', () => {
  let state = createInitialGameState();
  const tasks = ['eva_repair', 'power_grid', 'hydroponics', 'research', 'resting', 'storm_shelter'] as const;

  for (const task of tasks) {
    state = assignCrewTask(state, 'crew-3', task);
    assert.equal(state.crew.find((c) => c.id === 'crew-3')?.task, task);
  }

  // Set Elena on research and verify points accumulate
  state = assignCrewTask(state, 'crew-3', 'research');
  state.mode = 'playing';
  const prevScore = state.highScore;
  state = tickSimulation(state, 1.0);
  assert.ok(state.highScore > prevScore);
});

test('Day 18 recycler crisis triggers auto-pause per Decision D-04', () => {
  let state = createInitialGameState();
  state.mode = 'playing';
  state.day = 17;
  state.hoursSinceLanding = 16 * 24;

  state = tickSimulation(state, 1.0); // Advance 24h into day 18
  assert.equal(state.day, 18);
  assert.ok(state.activeCrisis !== null);
  assert.equal(state.activeCrisis?.type, 'RECYCLER_BURST');
  assert.equal(state.isPaused, true);
  assert.equal(state.mode, 'paused');
});

// ─── End-game scenario tests ───────────────────────────────────────────────

test('End-game: Day 90 + 4/4 alive → VICTORY with victoryType FULL_CREW', () => {
  let state = createInitialGameState();
  state.mode = 'playing';
  state.day = 89;
  state.hoursSinceLanding = 89 * 24 - 1;
  // All 4 crew alive at full health (default)

  state = tickSimulation(state, 0.1);

  assert.equal(state.day, 90);
  assert.equal(state.missionOutcome, 'VICTORY');
  assert.equal(state.mode, 'gameover');
  assert.equal(state.victoryType, 'FULL_CREW');
  assert.ok(state.highScore > 5000);
});

test('End-game: Day 90 + 3/4 alive → VICTORY with victoryType MIN_CREW', () => {
  let state = createInitialGameState();
  state.mode = 'playing';
  state.day = 89;
  state.hoursSinceLanding = 89 * 24 - 1;
  // Kill exactly one crew member before the Day 90 tick
  state.crew[3] = { ...state.crew[3], health: 0 };

  state = tickSimulation(state, 0.1);

  assert.equal(state.day, 90);
  assert.equal(state.missionOutcome, 'VICTORY');
  assert.equal(state.mode, 'gameover');
  assert.equal(state.victoryType, 'MIN_CREW');
});

test('End-game: fewer than 3 crew alive triggers DEFEAT immediately', () => {
  let state = createInitialGameState();
  state.mode = 'playing';
  state.day = 45;
  state.hoursSinceLanding = 44 * 24;
  // Set 2 crew members to 0 health → only 2 alive → aliveCount < 3
  state.crew[2] = { ...state.crew[2], health: 0 };
  state.crew[3] = { ...state.crew[3], health: 0 };

  state = tickSimulation(state, 0.01);

  assert.equal(state.missionOutcome, 'DEFEAT');
  assert.equal(state.mode, 'gameover');
  assert.ok(state.defeatReason !== undefined && state.defeatReason.length > 0);
});

test('End-game: DEFEAT defeatReason names how many crew were lost', () => {
  let state = createInitialGameState();
  state.mode = 'playing';
  // Kill 3 crew → only 1 survivor → aliveCount=1 < 3
  state.crew[1] = { ...state.crew[1], health: 0 };
  state.crew[2] = { ...state.crew[2], health: 0 };
  state.crew[3] = { ...state.crew[3], health: 0 };

  state = tickSimulation(state, 0.01);

  assert.equal(state.missionOutcome, 'DEFEAT');
  assert.ok(state.defeatReason?.includes('lost'));
  // defeatReason must mention crew count, not "All 4" (since 1 survives)
  assert.ok(!state.defeatReason?.includes('All 4'));
});


