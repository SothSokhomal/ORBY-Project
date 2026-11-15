/**
 * ORBY mission clock constants (D-02, D-04).
 * The simulation stores ONE value: hoursSinceLanding (0 to TOTAL_HOURS).
 * DAY is for the Moon. SOL is for Mars only (Season 02).
 */

export const HOURS_PER_DAY = 24; // Calculated: one Earth day
export const HOURS_PER_SOL = 24.66; // Sourced: NASA Mars24 (Season 02 only)

export const MISSION_DAYS = 90; // Game assumption (scenario)
export const TOTAL_HOURS = MISSION_DAYS * HOURS_PER_DAY; // 2,160 ticks

export const MISSION_SECONDS = 600; // D-04: full mission in 10 minutes at 1x
export const GAME_HOURS_PER_REAL_SECOND = TOTAL_HOURS / MISSION_SECONDS; // 3.6

export const CLOCK_SPEEDS = [1, 1.25, 1.5, 1.75, 2, 6] as const;
export const DEFAULT_CLOCK_SPEED = 1;

export function missionDay(hoursSinceLanding: number): number {
  return Math.floor(hoursSinceLanding / HOURS_PER_DAY) + 1;
}

export function missionSol(hoursSinceLanding: number): number {
  return Math.floor(hoursSinceLanding / HOURS_PER_SOL) + 1;
}
