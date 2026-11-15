/**
 * ORBY parameter registry seed values (docs/03, section 10).
 * Each value carries its label: Sourced, Calculated, Unverified or
 * Game assumption (D-17). The dataset adapter may override values and
 * the DATA SOURCE tag then shows where each came from.
 */

export type DataLabel = 'sourced' | 'calculated' | 'unverified' | 'game_assumption';

export interface GameParameter {
  value: number;
  unit: string;
  label: DataLabel;
}

export const PAYLOAD_CAP_KG = 1800; // Game assumption (D-06)
export const CREW_SIZE = 4; // Game assumption (D-13)
export const WIN_MIN_SURVIVORS = 1; // Game assumption (D-14)

export const PARAMETERS: Record<string, GameParameter> = {
  oxygen_kg_per_person_day: { value: 0.84, unit: 'kg', label: 'sourced' },
  oxygen_kg_per_person_day_high: { value: 1.2, unit: 'kg', label: 'game_assumption' },
  food_kg_per_person_day: { value: 0.62, unit: 'kg', label: 'sourced' },
  water_drinking_kg_per_person_day: { value: 1.62, unit: 'kg', label: 'sourced' },
  water_min_allocation_l: { value: 2.5, unit: 'L', label: 'sourced' },
  water_recovery_base: { value: 0.85, unit: 'ratio', label: 'game_assumption' },
  water_recovery_upgraded: { value: 0.98, unit: 'ratio', label: 'game_assumption' },
  o2_recovery_base: { value: 0.42, unit: 'ratio', label: 'game_assumption' },
  o2_recovery_upgraded: { value: 0.75, unit: 'ratio', label: 'game_assumption' },
  solar_output_kw: { value: 30, unit: 'kW', label: 'game_assumption' },
  battery_kwh: { value: 500, unit: 'kWh', label: 'game_assumption' },
  battery_kwh_upgraded: { value: 750, unit: 'kWh', label: 'game_assumption' },
  fission_output_kw: { value: 12, unit: 'kW', label: 'game_assumption' }, // Planned technology (D-08)
  fission_upgrade_kw: { value: 6, unit: 'kW', label: 'game_assumption' }, // Planned technology (D-08)
  rover_power_kw: { value: 0.5, unit: 'kW', label: 'sourced' },
  life_support_power_kw_low: { value: 1, unit: 'kW', label: 'unverified' },
  life_support_power_kw_high: { value: 3, unit: 'kW', label: 'unverified' },
  co2_kg_per_person_day: { value: 1, unit: 'kg', label: 'unverified' },
  surface_temp_min_c: { value: -173, unit: 'C', label: 'sourced' },
  surface_temp_max_c: { value: 127, unit: 'C', label: 'sourced' },
  cabin_temp_min_c: { value: 20, unit: 'C', label: 'sourced' },
  cabin_temp_max_c: { value: 25, unit: 'C', label: 'sourced' },
  comm_delay_s: { value: 1.3, unit: 's', label: 'sourced' },
};
