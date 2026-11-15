/**
 * Project Artemis: Mission Gear & Equipment Loadout Catalog
 * Definitive equipment configurations, stat bonuses, and loadout mechanics.
 */

import { GearItem, GearLoadout, MissionModule } from '../types/game.ts';

export const MISSION_MODULES: MissionModule[] = [
  // ================= POWER (3) =================
  {
    id: 'solar_array',
    name: 'Deployable Solar Array',
    category: 'POWER',
    categoryLabel: 'Power',
    weightKg: 220,
    image: '/assets/gear/solar_array.png',
    defaultPacked: true,
    shortBenefit: '+15 kW High-Yield Solar Day Generation',
    detailedEffect: 'Deploys twin ultra-light solar wings generating up to 15 kW during sunlit periods. Provides 0 kW during the freezing dark intervals.',
  },
  {
    id: 'battery_bank',
    name: 'Solid-State Battery Bank',
    category: 'POWER',
    categoryLabel: 'Power',
    weightKg: 200,
    image: '/assets/gear/battery_bank.png',
    defaultPacked: true,
    shortBenefit: '+250 kWh Reserve (750 kWh Max Battery)',
    detailedEffect: 'Expands energy storage from 500 kWh to 750 kWh. Critical buffer for sustaining life support through polar dark intervals.',
  },
  {
    id: 'kilopower',
    name: 'Kilopower Fission Reactor',
    category: 'POWER',
    categoryLabel: 'Power',
    weightKg: 600,
    image: '/assets/gear/kilopower.png',
    defaultPacked: false,
    shortBenefit: '+10.0 kW Constant Stirling Nuclear Power',
    detailedEffect: 'Enriched uranium-hydride Stirling generator delivering 10 kW continuous power 24/7, completely immune to dark-interval brownouts. Planned technology.',
  },

  // ================= LIFE SUPPORT (4) =================
  {
    id: 'water_recycler',
    name: 'Urine & Condensate Water Recycler',
    category: 'LIFE_SUPPORT',
    categoryLabel: 'Life support',
    weightKg: 250,
    image: '/assets/gear/water_recycler.png',
    defaultPacked: true,
    shortBenefit: '98.4% Closed-Loop Moisture Recovery',
    detailedEffect: 'Multistage distillation unit purifying urine, sweat, and atmospheric moisture. Cuts net base water consumption by 35%.',
  },
  {
    id: 'o2_generator',
    name: 'Water Electrolysis O2 Generator',
    category: 'LIFE_SUPPORT',
    categoryLabel: 'Life support',
    weightKg: 180,
    image: '/assets/gear/o2_generator.png',
    defaultPacked: true,
    shortBenefit: '+25% Metabolic Oxygen Reclamation',
    detailedEffect: 'High-pressure proton exchange membrane splitting recovered water into breathable O2. Shields crew from asphyxiation risks.',
  },
  {
    id: 'co2_scrubber',
    name: 'CO₂ Removal & Reduction Unit',
    category: 'LIFE_SUPPORT',
    categoryLabel: 'Life support',
    weightKg: 160,
    image: '/assets/gear/avionics_kit.png',
    defaultPacked: true,
    shortBenefit: 'Catalytic Sabatier CO₂ Scrubbing',
    detailedEffect: 'Removes crew metabolic CO₂ and returns breathable oxygen. Essential for cabin atmosphere; without it CO₂ climbs rapidly (DR-04).',
  },
  {
    id: 'hydroponics',
    name: 'Hydroponic Growth Chamber',
    category: 'LIFE_SUPPORT',
    categoryLabel: 'Life support',
    weightKg: 120,
    image: '/assets/gear/hydroponics.png',
    defaultPacked: false,
    shortBenefit: '+35% Fresh Crops & +10% Crew Morale',
    detailedEffect: 'LED-illuminated aeroponic growth pods cultivating microgreens and nutrient-rich spirulina. Stretches packaged rations across 90 days.',
  },

  // ================= SAFETY (3) =================
  {
    id: 'storm_shelter',
    name: 'Regolith Storm Shelter Vault',
    category: 'SAFETY',
    categoryLabel: 'Safety',
    weightKg: 200,
    image: '/assets/gear/storm_shelter.png',
    defaultPacked: true,
    shortBenefit: '-90% Radiation Dose in Class-X CME Storms',
    detailedEffect: 'Reinforced subterranean habitat bunker capped with 2 meters of sintered lunar regolith and hydrogen liner (D-07). Essential shelter against flares.',
  },
  {
    id: 'warning_array',
    name: 'Advanced Dosimeter & Solar Warning Array',
    category: 'SAFETY',
    categoryLabel: 'Safety',
    weightKg: 50,
    image: '/assets/gear/warning_array.png',
    defaultPacked: false,
    shortBenefit: '+1.5 Day Advance Crisis & CME Alert',
    detailedEffect: 'Deep-space sensor mast and directional antenna detecting solar proton spikes and micro-meteorite storms hours before impact.',
  },
  {
    id: 'medical_bay',
    name: 'Medical Kit & Treatment Bay',
    category: 'SAFETY',
    categoryLabel: 'Safety',
    weightKg: 90,
    image: '/assets/gear/avionics_kit.png',
    defaultPacked: true,
    shortBenefit: 'Accelerated Crew Recovery & Trauma Care',
    detailedEffect: 'Emergency pharmaceutical synthesizers, diagnostic telemetry, and splints to treat illness or injury (EV-14) and prevent vital loss.',
  },

  // ================= SYSTEMS (2) =================
  {
    id: 'avionics_kit',
    name: 'Modular Avionics Pump Spare Kit',
    category: 'SYSTEMS',
    categoryLabel: 'Systems',
    weightKg: 100,
    image: '/assets/gear/avionics_kit.png',
    defaultPacked: false,
    shortBenefit: '+50% Faster Exterior EVA Repairs',
    detailedEffect: 'Rugged titanium tool case with replacement cryogenic valves, backup seals, and bypass solenoids for instant field repairs.',
  },
  {
    id: 'lunar_rover',
    name: 'Pressurized Lunar Rover',
    category: 'SYSTEMS',
    categoryLabel: 'Systems',
    weightKg: 300,
    image: '/assets/gear/solar_array.png',
    defaultPacked: false,
    shortBenefit: 'Extends Surface EVA Range & Science Yield',
    detailedEffect: 'Electric all-terrain exploration rover with enclosed life support. Extends scientific sample radius; draws 500 W in transit (GM-12).',
  },
];

export const PAYLOAD_CAP_KG = 1800; // Decision D-06: 1,800 kg maximum payload cap

export function getDefaultPackedModuleIds(): string[] {
  return MISSION_MODULES.filter((m) => m.defaultPacked).map((m) => m.id);
}

export function getMissionModule(id: string): MissionModule | undefined {
  return MISSION_MODULES.find((m) => m.id === id);
}

export const GEAR_CATALOG: GearItem[] = [
  // ================= 1. ECLSS LIFE SUPPORT RIGS =================
  {
    id: 'eclss_standard',
    name: 'Bosch Catalytic Scrubber',
    category: 'ECLSS',
    tagline: 'Standard NASA Artemis Baseline',
    description: 'Proven iron-catalyst CO2 reduction system with balanced oxygen and water recovery ratios.',
    perks: ['Nominal 1.0x O2 Burn Rate', 'Stable Hydration Output', 'Standard Power Demand'],
    statModifiers: {
      o2Efficiency: 1.0,
      waterEfficiency: 1.0,
    },
  },
  {
    id: 'eclss_cryo',
    name: 'Cryogenic O2 Sublimator',
    category: 'ECLSS',
    tagline: 'Ultra-High Efficiency Oxygen Reclamation',
    description: 'Sub-zero fractional distillation column capturing 98.4% of exhaled metabolic oxygen.',
    perks: ['+25% Oxygen Reserve Efficiency', 'Extended Crew EVA Tank Duration', 'Lower Asphyxiation Risk'],
    statModifiers: {
      o2Efficiency: 0.75, // 25% reduction in O2 consumption
      waterEfficiency: 1.0,
    },
  },
  {
    id: 'eclss_ice',
    name: 'Regolith Ice Extraction Rig',
    category: 'ECLSS',
    tagline: 'In-Situ Lunar South Pole Hydration',
    description: 'Microwave sublimation drill extracting trapped water vapor from permanently shadowed craters.',
    perks: ['+35% Water Recovery Rate', 'Continuous Sabatier Feedstock', 'Reduces Hydroponic Thirst'],
    statModifiers: {
      o2Efficiency: 0.9,
      waterEfficiency: 0.65, // 35% reduction in net water burn
    },
  },

  // ================= 2. POWER GENERATION & STORAGE =================
  {
    id: 'power_standard',
    name: 'Kilopower 10kW Fission Baseline',
    category: 'POWER',
    tagline: 'Standard Stirling Engine Reactor',
    description: 'Enriched uranium hydride core with sodium heat pipes producing reliable continuous electricity.',
    perks: ['12.0 kW Constant Baseline', '500 kWh Battery Capacity', 'Low Thermal Signature'],
    statModifiers: {
      fissionBonusKw: 0,
      batteryMaxBonusKwh: 0,
    },
  },
  {
    id: 'power_highflux',
    name: 'High-Flux Stirling Overdrive',
    category: 'POWER',
    tagline: '+50% Continuous Fission Electricity',
    description: 'Quad-cylinder Stirling thermal convertor running at higher temperatures for uninterrupted 18 kW power.',
    perks: ['+6.0 kW Fission Generation (18 kW total)', 'Zero Brownout Risk During Dark Intervals', 'Runs Heavy Shielding Reliably'],
    statModifiers: {
      fissionBonusKw: 6.0,
      batteryMaxBonusKwh: 0,
    },
  },
  {
    id: 'power_graphene',
    name: 'Ultra-Capacitive Graphene Bank',
    category: 'POWER',
    tagline: '+50% Deep-Cycle Battery Reserve',
    description: 'Nanotube graphene solid-state electrolyte cells expanding base storage from 500 kWh to 750 kWh.',
    perks: ['+250 kWh Battery Storage (750 kWh Max)', 'Survives Polar Dark Interval Depletion', 'Instantaneous Surge Discharge'],
    statModifiers: {
      fissionBonusKw: 0,
      batteryMaxBonusKwh: 250,
    },
  },

  // ================= 3. SPACESUIT & EVA GEAR =================
  {
    id: 'suit_standard',
    name: 'ACES Mark-III Standard Rig',
    category: 'SUIT',
    tagline: 'NASA Certified Advanced Crew Escape Suit',
    description: 'Iconic high-visibility orange pressure garment with micro-meteorite thermal layers.',
    perks: ['Standard 1/6g Mobility', 'Gold Visor Reflectivity', 'Nominal Radiation Shielding'],
    statModifiers: {
      radiationDefense: 1.0,
      repairSpeedBonus: 1.0,
    },
  },
  {
    id: 'suit_bismuth',
    name: 'High-Z Bismuth Radiation Shield',
    category: 'SUIT',
    tagline: 'Class-X Solar Storm Protection',
    description: 'Dense non-toxic heavy metal composite interlock repelling solar proton event flux.',
    perks: ['-60% Radiation Dose in Space Weather', 'Prevents Morale Collapse in CME Storms', 'Protects DNA Telemetry'],
    statModifiers: {
      radiationDefense: 0.4, // 60% reduction in absorbed mSv
      repairSpeedBonus: 1.0,
    },
  },
  {
    id: 'suit_servos',
    name: 'Hydraulic High-Torque Servos',
    category: 'SUIT',
    tagline: 'Rapid Exterior Base Maintenance',
    description: 'Exoskeleton torque multiplier gloves and knee servos designed for high-stress EVA repairs.',
    perks: ['+50% Faster Exterior Conduit Welding', 'Halves Sabatier Crisis Repair Time', 'Reduces Physical Fatigue'],
    statModifiers: {
      radiationDefense: 0.9,
      repairSpeedBonus: 1.5,
    },
  },

  // ================= 4. SCIENTIFIC PAYLOAD & ROVER TOOLS =================
  {
    id: 'payload_radar',
    name: 'Ground-Penetrating Regolith Radar',
    category: 'PAYLOAD',
    tagline: 'Early Hazard & Anomaly Forecasting',
    description: 'Sub-surface chirp sounder scanning for seismic shifting and incoming coronal mass ejections.',
    perks: ['+1.0 Day Advance Warning on Crises', 'Early Solar Flare Telegraphing', 'Prevents Surprise Decompression'],
    statModifiers: {
      crisisEarlyWarning: true,
    },
  },
  {
    id: 'payload_compressor',
    name: 'Autonomous Sabatier Compressor',
    category: 'PAYLOAD',
    tagline: 'Self-Sealing Life Support Backup',
    description: 'Robotic bypass valves that isolate ruptured conduits automatically within seconds of a pressure drop.',
    perks: ['Cuts Recycler Leak Rate by 50%', 'Autonomous Pressure Isolation', 'Saves Hundreds of Liters of Water'],
    statModifiers: {
      waterEfficiency: 0.85,
    },
  },
  {
    id: 'payload_algae',
    name: 'Bioluminescent Spirulina Vats',
    category: 'PAYLOAD',
    tagline: '+35% Fresh Food Ration Yield',
    description: 'High-yield photobioreactor tubes cultivating nutrient-dense spirulina micro-algae in the Greenhouse.',
    perks: ['+35% Food Efficiency from Greenhouse', 'Fresh Nutrient Boost (+10% Morale Recovery)', 'Absorbs Excess Habitat Carbon'],
    statModifiers: {
      foodBonus: 1.35,
    },
  },
];

export function getDefaultGearLoadout(): GearLoadout {
  return {
    packedModuleIds: getDefaultPackedModuleIds(),
    eclssId: 'eclss_standard',
    powerId: 'power_standard',
    suitId: 'suit_standard',
    payloadId: 'payload_radar',
  };
}

export function getGearItem(id: string): GearItem {
  return GEAR_CATALOG.find((g) => g.id === id) || GEAR_CATALOG[0];
}
