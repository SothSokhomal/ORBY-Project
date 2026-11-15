/**
 * ORBY difficulty levels (D-03, D-09). Multipliers are sample game
 * assumptions, tuned by the balance script (docs/03, section 9).
 */

export type DifficultyId = 'cadet' | 'pilot' | 'commander';

export interface DifficultyConfig {
  id: DifficultyId;
  name: string;
  plainLabel: 'Easy' | 'Medium' | 'Hard';
  startingReservesMult: number;
  resourceBurnMult: number;
  eventFrequencyMult: number;
  failureSeverityMult: number;
  darkIntervalHours: number;
  gracePeriodHours: number;
}

export const DIFFICULTY_LEVELS: Record<DifficultyId, DifficultyConfig> = {
  cadet: {
    id: 'cadet',
    name: 'Cadet',
    plainLabel: 'Easy',
    startingReservesMult: 1.25,
    resourceBurnMult: 0.85,
    eventFrequencyMult: 0.7,
    failureSeverityMult: 0.7,
    darkIntervalHours: 48,
    gracePeriodHours: 48,
  },
  pilot: {
    id: 'pilot',
    name: 'Pilot',
    plainLabel: 'Medium',
    startingReservesMult: 1.0,
    resourceBurnMult: 1.0,
    eventFrequencyMult: 1.0,
    failureSeverityMult: 1.0,
    darkIntervalHours: 72,
    gracePeriodHours: 24,
  },
  commander: {
    id: 'commander',
    name: 'Commander',
    plainLabel: 'Hard',
    startingReservesMult: 0.8,
    resourceBurnMult: 1.15,
    eventFrequencyMult: 1.4,
    failureSeverityMult: 1.3,
    darkIntervalHours: 100,
    gracePeriodHours: 12,
  },
};

export const DEFAULT_DIFFICULTY: DifficultyId = 'pilot';
