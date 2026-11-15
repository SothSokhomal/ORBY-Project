/**
 * Project Artemis: NASA Dataset Integration Adapter
 *
 * Decouples raw NASA scientific telemetry (DONKI, ECLSS, KRUSTY, RadLab, NTRS geology)
 * from the deterministic simulation loop.
 *
 * Data sources used:
 *   DONKI CMEAnalysis : api.nasa.gov/DONKI/CMEAnalysis
 *   Solar flare ref   : X8.7 flare 2024-05-14 (Solar Cycle 25 peak, NOAA AR 13664)
 *   ECLSS baselines   : NASA AES JSC-20584
 *   Kilopower         : KRUSTY demonstration 2018, NASA Glenn
 *   RadLab            : NASA OSDR RadLab ISS dosimetry + GCR lunar surface models
 *   Geology           : NASA NTRS + LCROSS + LRO LOLA/LAMP/Mini-RF + Clementine UVVIS
 */

import { GameSimulationState, ColonyResources, GeologyDiscovery } from '../types/game.ts';

// ---------------------------------------------------------------------------
// FLIGHT ENGINEER DATASET (Cmdr. Sarah Chen — power_grid task)
// Sources: NASA NTRS VSAT + BVAD + LROC WAC illumination + OSDR biology
// ---------------------------------------------------------------------------

export interface NasaLunarThermalData {
  /** Source: NASA LRO Diviner Lunar Radiometer Experiment */
  craterName: string;
  latitude: number;
  longitude: number;
  noonTempKelvin: number;             // LRO Diviner: ~374 K (+101°C)
  midnightTempKelvin: number;         // LRO Diviner: ~112 K (-161°C)
  permanentlyShadowedKelvin: number;  // LRO Diviner PSR: down to 40 K (-233°C)
}

export interface NasaSpaceWeatherData {
  /** Source: NASA DONKI CMEAnalysis + X8.7 flare reference (Solar Cycle 25) */
  cmeEventId: string;
  flareClass: 'C' | 'M' | 'X';
  classType: string;                        // e.g. "X8.7"
  peakRadiationFluxMsvPerHour: number;      // mSv/hr unshielded on lunar surface
  arrivalWindowSols: [number, number];      // days until CME plasma arrives at Moon
  geomagneticStormKpIndex: number;          // 0–9 Kp scale
  cmeSpeedKmS?: number;                     // km/s CME speed from DONKI
  sourceFlareId?: string | null;            // DONKI flrID or reference event ID
  observedAt?: string | null;               // ISO peak time of associated flare
}

export interface NasaEclssMassBalance {
  /** Source: NASA AES Human Metabolic Baseline JSC-20584 */
  humanO2KgPerPersonDay: number;             // 0.84 kg/person/day
  humanWaterLitersPerPersonDay: number;      // 2.50 L/person/day
  humanFoodKcalPerPersonDay: number;         // 2800 kcal/person/day
  sabatierWaterRecoveryEfficiency: number;   // ISS WRS: 0.92
  boschCarbonDioxideScrubRate: number;
}

export interface NasaKilopowerReactorProfile {
  /** Source: KRUSTY Demonstration (2018), NASA Glenn Research Center — Poston et al. */
  coreThermalKw: number;              // 40 kW thermal
  electricOutputKw: number;           // 10–18 kW electric (game: 12 kW)
  sodiumHeatPipeTempKelvin: number;   // 1073 K Na heat pipe operating temp
  shieldRadiationAttenuationRatio: number;
}

export interface NasaRadLabData {
  /**
   * Source: NASA OSDR RadLab ISS Dosimetry Database
   * Lunar values extrapolated: ISS 0.2 mSv/day × 1.9 (no magnetosphere at south pole)
   * Reference: Zeitlin et al. 2013, Reitz 2009, NASA OCHMO TB-REQ-1012
   */
  nominalInteriorMsvPerDay: number;  // 0.38 mSv/day inside lunar habitat (GCR)
  evaExposureMsvPerDay: number;      // 0.65 mSv/day EVA on surface
  shelterAttenuationFactor: number;  // 0.05 — H-rich liner cuts ~95% of dose
  annualLimitMsv: number;            // 500 mSv NASA career limit
  mission90DayEstimateMsv: number;   // calculated: nominalInteriorMsvPerDay × 90
}

export interface NasaTelemetryDataset {
  datasetId: string;
  releaseDate: string;
  sourceMission: string;
  thermal: NasaLunarThermalData;
  spaceWeather?: NasaSpaceWeatherData;
  eclss: NasaEclssMassBalance;
  kilopower: NasaKilopowerReactorProfile;
  radlab?: NasaRadLabData;
}

/**
 * Fallback NASA baseline telemetry.
 * Overridden at game startup by /data/nasa-baseline.json (from normalize-dataset.ts).
 */
export const DEFAULT_NASA_TELEMETRY: NasaTelemetryDataset = {
  datasetId: 'NASA-ARTEMIS-III-BASELINE',
  releaseDate: '2026-11-01',
  sourceMission: 'NASA DONKI (Solar Cycle 25) + AES ECLSS + KRUSTY + OSDR RadLab',
  thermal: {
    craterName: 'Shackleton Crater Rim (South Pole)',
    latitude: -89.9,
    longitude: 0.0,
    noonTempKelvin: 374,
    midnightTempKelvin: 112,
    permanentlyShadowedKelvin: 40,
  },
  spaceWeather: {
    // X8.7 reference: Solar Cycle 25 peak, NOAA AR 13664, May 14 2024
    cmeEventId: 'DONKI-CME-2024-12-17T16:56Z',
    flareClass: 'X',
    classType: 'X8.7',
    peakRadiationFluxMsvPerHour: 12.35,
    arrivalWindowSols: [1, 2],
    geomagneticStormKpIndex: 9,
    cmeSpeedKmS: 3161,
    sourceFlareId: 'FLR-2024-05-14T00:08:00-R001',
    observedAt: '2024-05-14T00:08Z',
  },
  eclss: {
    humanO2KgPerPersonDay: 0.84,
    humanWaterLitersPerPersonDay: 2.50,
    humanFoodKcalPerPersonDay: 2800,
    sabatierWaterRecoveryEfficiency: 0.92,
    boschCarbonDioxideScrubRate: 1.0,
  },
  kilopower: {
    coreThermalKw: 40.0,
    electricOutputKw: 12.0,
    sodiumHeatPipeTempKelvin: 1073,
    shieldRadiationAttenuationRatio: 0.95,
  },
  radlab: {
    nominalInteriorMsvPerDay: 0.38,
    evaExposureMsvPerDay: 0.65,
    shelterAttenuationFactor: 0.05,
    annualLimitMsv: 500,
    mission90DayEstimateMsv: 34.2,
  },
};

/**
 * Load the NASA baseline dataset at game startup.
 * Tries /data/nasa-baseline.json (pre-generated by scripts/normalize-dataset.ts),
 * then falls back to DEFAULT_NASA_TELEMETRY. Never throws.
 */
export async function loadNasaDataset(): Promise<NasaTelemetryDataset> {
  try {
    const res = await fetch('/data/nasa-baseline.json');
    if (!res.ok) return DEFAULT_NASA_TELEMETRY;
    const json = await res.json() as Partial<NasaTelemetryDataset>;
    return {
      ...DEFAULT_NASA_TELEMETRY,
      ...json,
      thermal: { ...DEFAULT_NASA_TELEMETRY.thermal, ...(json.thermal ?? {}) },
      eclss: { ...DEFAULT_NASA_TELEMETRY.eclss, ...(json.eclss ?? {}) },
      kilopower: { ...DEFAULT_NASA_TELEMETRY.kilopower, ...(json.kilopower ?? {}) },
      radlab: { ...(DEFAULT_NASA_TELEMETRY.radlab!), ...(json.radlab ?? {}) },
    } as NasaTelemetryDataset;
  } catch {
    return DEFAULT_NASA_TELEMETRY;
  }
}

/**
 * Inject a NASA dataset into the active game state.
 * Updates Kilopower output, solar storm flux, and writes a data-sync log entry.
 */
export function injectNasaDataset(
  currentState: GameSimulationState,
  dataset: Partial<NasaTelemetryDataset>
): GameSimulationState {
  const merged: NasaTelemetryDataset = {
    ...DEFAULT_NASA_TELEMETRY,
    ...dataset,
    thermal: { ...DEFAULT_NASA_TELEMETRY.thermal, ...(dataset.thermal ?? {}) },
    eclss: { ...DEFAULT_NASA_TELEMETRY.eclss, ...(dataset.eclss ?? {}) },
    kilopower: { ...DEFAULT_NASA_TELEMETRY.kilopower, ...(dataset.kilopower ?? {}) },
    radlab: { ...(DEFAULT_NASA_TELEMETRY.radlab!), ...(dataset.radlab ?? {}) },
  };

  const updatedResources: ColonyResources = {
    ...currentState.resources,
    fissionKw: merged.kilopower.electricOutputKw,
  };

  const fluxMsvPerHr = merged.spaceWeather?.peakRadiationFluxMsvPerHour;
  const dataLabel = merged.spaceWeather?.classType
    ? `${merged.spaceWeather.classType}-class flare — ${fluxMsvPerHr?.toFixed(1) ?? '?'} mSv/hr peak`
    : 'no active flare on record';

  return {
    ...currentState,
    resources: updatedResources,
    nasaStormFluxMsvPerHr: fluxMsvPerHr,
    logs: [
      {
        id: `nasa-sync-${Date.now()}`,
        day: currentState.day,
        timestamp: 'T+DATA-SYNC',
        sender: 'NASA DATA TELEMETRY',
        message: `Dataset [${merged.datasetId}] loaded. Solar ref: ${dataLabel}. ECLSS O₂: ${merged.eclss.humanO2KgPerPersonDay} kg/person/day. Kilopower: ${merged.kilopower.electricOutputKw} kWe. RadLab: ${merged.radlab?.nominalInteriorMsvPerDay ?? 0.38} mSv/day nominal.`,
        type: 'info',
      },
      ...currentState.logs,
    ],
  };
}

// ---------------------------------------------------------------------------
// LUNAR GEOLOGY DATASET (Dr. Elena Rostova — research task)
// Source: NASA NTRS + LCROSS + LRO LOLA/LAMP/Mini-RF + Clementine UVVIS
// ---------------------------------------------------------------------------

interface NtrsCitation {
  id: string;
  title: string;
  date: string;
  authors: string[];
}

export interface NasaLunarGeologyData {
  datasetId: string;
  releaseDate: string;

  /** Shackleton Crater geometry — LRO LOLA (Zuber et al. 2012, Nature 486) */
  craterGeometry: {
    name: string;
    diameterKm: number;      // 21.0 km
    depthM: number;          // 4,200 m
    rimElevationM: number;   // ~150 m above surrounding terrain
    psrTempKelvin: number;   // ~90 K permanently shadowed region
    rimSunlightPct: number;  // 86% — rim in sunlight 86% of time
  };

  /** Water ice — LCROSS (Colaprete et al. 2010, Science 330) + LRO LAMP (Hayne et al. 2015) */
  waterIce: {
    lcrossIceMassPct: number;      // 5.6% by mass in Cabeus ejecta
    lcrossIceSite: string;         // "Cabeus Crater"
    lampFrostCoveragePct: number;  // 20% frost area in Shackleton PSR
    miniRfIceSignature: boolean;   // LRO Mini-RF CPR anomaly
    volatiles: string[];           // H₂O, CO₂, CH₃OH, etc.
  };

  /** Regolith composition — Clementine UVVIS (Lucey et al. 2000, JGR Planets) */
  regolithComposition: {
    SiO2Pct: number;      // 45%
    FeOPct: number;       // 8%
    Al2O3Pct: number;     // 22%
    TiO2Pct: number;      // 0.5%
    CaOPct: number;       // 14%
    MgOPct: number;       // 7.5%
    maturityIndex: number; // 0.65 (IS/FeO ratio)
  };

  /** Research yield derived from real LCROSS ice data */
  researchValue: {
    yieldMultiplier: number;      // 1.56 for 5.6% ice concentration
    scientificRationale: string;
    isruPotentialRating: 'LOW' | 'MEDIUM' | 'HIGH';
  };

  /** Discovery schedule — findings Dr. Rostova makes if assigned to research */
  geologyDiscoveries: GeologyDiscovery[];

  /** Live NASA NTRS paper citations fetched at normalize time */
  ntrsCitations: {
    lcross: NtrsCitation[];
    shackleton: NtrsCitation[];
    frost: NtrsCitation[];
    viper: NtrsCitation[];
  };
}

export const DEFAULT_GEOLOGY_DATA: NasaLunarGeologyData = {
  datasetId: 'NASA-GEOLOGY-BASELINE',
  releaseDate: '2026-11-01',
  craterGeometry: {
    name: 'Shackleton Crater',
    diameterKm: 21.0,
    depthM: 4200,
    rimElevationM: 150,
    psrTempKelvin: 90,
    rimSunlightPct: 86,
  },
  waterIce: {
    lcrossIceMassPct: 5.6,
    lcrossIceSite: 'Cabeus Crater',
    lampFrostCoveragePct: 20.0,
    miniRfIceSignature: true,
    volatiles: ['H₂O', 'CO₂', 'CO', 'H₂S', 'SO₂', 'CH₃OH', 'NH₃', 'C₂H₄'],
  },
  regolithComposition: {
    SiO2Pct: 45.0,
    FeOPct: 8.0,
    Al2O3Pct: 22.0,
    TiO2Pct: 0.5,
    CaOPct: 14.0,
    MgOPct: 7.5,
    maturityIndex: 0.65,
  },
  researchValue: {
    yieldMultiplier: 1.56,
    scientificRationale: 'Ice concentration 5.6% (LCROSS) gives 1.56× research yield vs average lunar site',
    isruPotentialRating: 'HIGH',
  },
  geologyDiscoveries: [
    {
      day: 7,
      title: 'Regolith Baseline Completed',
      finding: 'South Pole regolith: SiO₂ 45%, Al₂O₃ 22%, FeO 8%. Confirms anorthositic highlands composition.',
      source: 'Clementine UVVIS (Lucey et al. 2000)',
      bonusScore: 500,
    },
    {
      day: 14,
      title: 'Hydrogen Signal Detected',
      finding: 'Neutron spectrometer detects elevated hydrogen in adjacent PSR — possible subsurface ice.',
      source: 'LRO LEND (Mitrofanov et al. 2010, Science 330)',
      bonusScore: 750,
    },
    {
      day: 21,
      title: 'Water Ice Confirmed',
      finding: 'Ice core: 5.6% water ice by mass in permanently shadowed regolith. ISRU potential HIGH.',
      source: 'LCROSS (Colaprete et al. 2010, Science 330)',
      bonusScore: 1500,
    },
    {
      day: 35,
      title: 'Radar Ice Signature',
      finding: 'Circular polarization anomaly in Shackleton interior consistent with ice layers (1–3 m depth).',
      source: 'LRO Mini-RF (Spudis et al. 2010, GRL)',
      bonusScore: 1000,
    },
    {
      day: 50,
      title: 'Volatiles Survey Complete',
      finding: 'H₂O, CO₂, CH₃OH, SO₂ mapped across 2 km PSR transect. Full volatile inventory submitted.',
      source: 'LRO LAMP (Hayne et al. 2015, Icarus 255)',
      bonusScore: 1200,
    },
    {
      day: 70,
      title: 'Full Geological Survey Uplinked',
      finding: '10 km radius survey complete. Rim in sunlight 86% of time. Data sent to Houston.',
      source: 'LRO LOLA (Zuber et al. 2012, Nature 486)',
      bonusScore: 2000,
    },
  ],
  ntrsCitations: { lcross: [], shackleton: [], frost: [], viper: [] },
};

/**
 * Load the geology dataset at game startup.
 * Reads /data/geology-baseline.json (from scripts/normalize-geology.ts),
 * falls back to DEFAULT_GEOLOGY_DATA. Never throws.
 */
export async function loadGeologyDataset(): Promise<NasaLunarGeologyData> {
  try {
    const res = await fetch('/data/geology-baseline.json');
    if (!res.ok) return DEFAULT_GEOLOGY_DATA;
    const json = await res.json() as Partial<NasaLunarGeologyData>;
    return {
      ...DEFAULT_GEOLOGY_DATA,
      ...json,
      craterGeometry: { ...DEFAULT_GEOLOGY_DATA.craterGeometry, ...(json.craterGeometry ?? {}) },
      waterIce: { ...DEFAULT_GEOLOGY_DATA.waterIce, ...(json.waterIce ?? {}) },
      regolithComposition: { ...DEFAULT_GEOLOGY_DATA.regolithComposition, ...(json.regolithComposition ?? {}) },
      researchValue: { ...DEFAULT_GEOLOGY_DATA.researchValue, ...(json.researchValue ?? {}) },
      geologyDiscoveries: json.geologyDiscoveries ?? DEFAULT_GEOLOGY_DATA.geologyDiscoveries,
    } as NasaLunarGeologyData;
  } catch {
    return DEFAULT_GEOLOGY_DATA;
  }
}

/**
 * Inject geology dataset into game state.
 * Sets researchYieldMultiplier and geologyDiscoveries from loaded data.
 */
export function injectGeologyDataset(
  currentState: GameSimulationState,
  geology: NasaLunarGeologyData
): GameSimulationState {
  return {
    ...currentState,
    researchYieldMultiplier: geology.researchValue.yieldMultiplier,
    geologyDiscoveries: geology.geologyDiscoveries,
    logs: [
      {
        id: `geology-sync-${Date.now()}`,
        day: currentState.day,
        timestamp: 'T+GEO-SYNC',
        sender: 'DR. ELENA ROSTOVA',
        message: `Lunar geology dataset [${geology.datasetId}] loaded. Shackleton Crater: ${geology.craterGeometry.diameterKm} km dia, ${geology.craterGeometry.depthM} m deep. Ice: ${geology.waterIce.lcrossIceMassPct}% by mass (LCROSS). Research yield: ${geology.researchValue.yieldMultiplier}× nominal. ${geology.ntrsCitations.lcross.length + geology.ntrsCitations.viper.length} NASA papers cited.`,
        type: 'info',
      },
      ...currentState.logs,
    ],
  };
}

// ---------------------------------------------------------------------------
// FLIGHT ENGINEER DATASET (Cmdr. Sarah Chen — power_grid task)
// Sources: NTRS VSAT + BVAD + LRO WAC illumination + OSDR biology
// ---------------------------------------------------------------------------

export interface NasaFlightEngineerData {
  datasetId: string;
  releaseDate: string;

  /** LRO WAC polar illumination product (WAC_POLE_ILL_PCT_SOUTH_100M) */
  lrocIllumination: {
    shackletonRimPct: number;    // 86% mean illumination, 2 lunar years baseline
    nobileRidgePct: number;      // 89% (best site near south pole)
    craterFloorPct: number;      // 0% (permanently shadowed)
    mapResolutionM: number;      // 100 m/pixel
  };

  /** VSAT solar array specs — NASA Langley, Kerslake et al. NTRS 20210011743 */
  vsatSpecs: {
    powerPerArrayKw: number;           // 10 kW per VSAT unit
    arraysDeployed: number;            // 4 arrays (default loadout)
    peakOutputKw: number;              // 45 kW (geometry-adjusted)
    massPerArrayKg: number;            // ~180 kg per unit
    sunElevationAngleDeg: number;      // 1.5° at south pole rim
    sepDegradationPctPerEvent: number; // 5% per SEP event (GaAs lattice damage)
  };

  /** BVAD life support baselines — NASA/TP-2015-218570 Table 4.1 */
  bvadBaselines: {
    o2KgPerPersonDay: number;      // 0.84 kg
    waterLPerPersonDay: number;    // 2.50 L
    foodKcalPerPersonDay: number;  // 2800 kcal
    co2KgPerPersonDay: number;     // 1.0 kg exhaled
  };

  /** OSDR spaceflight biology — physiological stakes when power systems fail */
  osdrBioConsequences: {
    boneDensityLossPctPerMonth: number;  // 1.5% avg (ISS OSDR studies)
    muscleMassLossPctPerMonth: number;   // 2.0% avg
    hypoxiaCognitiveOnsetH: number;      // 4h at <19.5 kPa O2
    dehydrationKidneyRiskH: number;      // 48h water rationing → nephrolithiasis risk
    accessions: string[];                // OSD accession numbers from OSDR
  };

  /** Sarah Chen's power grid discovery schedule (Days 5–80) */
  powerEngDiscoveries: GeologyDiscovery[];

  ntrsCitations: {
    bvad: { id: string; title: string; date: string; authors: string[] }[];
    vsat: { id: string; title: string; date: string; authors: string[] }[];
    dust: { id: string; title: string; date: string; authors: string[] }[];
  };
  osdrStudies: { accession: string; title: string; date: string }[];
}

export const DEFAULT_FLIGHT_ENGINEER_DATA: NasaFlightEngineerData = {
  datasetId: 'NASA-POWERENG-BASELINE',
  releaseDate: '2026-11-01',
  lrocIllumination: {
    shackletonRimPct: 86,
    nobileRidgePct: 89,
    craterFloorPct: 0,
    mapResolutionM: 100,
  },
  vsatSpecs: {
    powerPerArrayKw: 10.0,
    arraysDeployed: 4,
    peakOutputKw: 45.0,
    massPerArrayKg: 180,
    sunElevationAngleDeg: 1.5,
    sepDegradationPctPerEvent: 5.0,
  },
  bvadBaselines: {
    o2KgPerPersonDay: 0.84,
    waterLPerPersonDay: 2.50,
    foodKcalPerPersonDay: 2800,
    co2KgPerPersonDay: 1.0,
  },
  osdrBioConsequences: {
    boneDensityLossPctPerMonth: 1.5,
    muscleMassLossPctPerMonth: 2.0,
    hypoxiaCognitiveOnsetH: 4,
    dehydrationKidneyRiskH: 48,
    accessions: [],
  },
  powerEngDiscoveries: [
    {
      day: 5,
      title: 'LROC Illumination Survey Complete',
      finding: 'Shackleton rim: 86% mean solar illumination over 2-year LRO baseline. Optimal VSAT array placement confirmed at ridge crest.',
      source: 'LRO WAC WAC_POLE_ILL_PCT_SOUTH_100M (pgda.gsfc.nasa.gov/products/54)',
      bonusScore: 500,
    },
    {
      day: 10,
      title: 'VSAT Array Efficiency Baseline',
      finding: '4 × 10 kW vertical solar arrays producing 45 kW peak at 1.5° sun elevation. GaAs triple-junction cells at nominal efficiency.',
      source: 'NASA Langley NTRS 20210011743 — Kerslake et al. 2021',
      bonusScore: 600,
    },
    {
      day: 25,
      title: 'SEP Proton Flux Detected',
      finding: 'Solar energetic particle event: 10 MeV proton fluence measured. GaAs photovoltaic lattice displacement damage estimated at 5% output loss.',
      source: 'GaAs proton damage model, Sumita et al. 2003; VSAT specs NTRS 20210011743',
      bonusScore: 800,
    },
    {
      day: 44,
      title: 'CME Grid Report Filed',
      finding: 'Class-X storm aftermath: Faraday isolation protocol held. Fission reactor maintained 12 kW through storm. Solar arrays de-rated 5% from SEP damage. All bus circuits nominal.',
      source: 'NASA KRUSTY (Kilopower) + DONKI CME data + NTRS VSAT specs',
      bonusScore: 1200,
    },
    {
      day: 60,
      title: 'Battery Efficiency Measured',
      finding: '500 kWh solid-state battery bank cycle efficiency: 94%. Deep-cycle charge retained through all 3 dark intervals. BVAD life support power draw within budget.',
      source: 'NASA BVAD Table 4.1 (NASA/TP-2015-218570); Battery GM-02 performance',
      bonusScore: 900,
    },
    {
      day: 80,
      title: '90-Day Power Budget Projection',
      finding: 'Mission total generation: 12,960 kWh solar + 25,920 kWh fission = 38,880 kWh. Margin: POSITIVE. Full power budget submitted to Houston.',
      source: 'NASA Langley VSAT + KRUSTY Kilopower; BVAD total crew consumption',
      bonusScore: 1500,
    },
  ],
  ntrsCitations: { bvad: [], vsat: [], dust: [] },
  osdrStudies: [],
};

/**
 * Load the flight engineer dataset at game startup.
 * Reads /data/powereng-baseline.json (from scripts/normalize-powereng.ts),
 * falls back to DEFAULT_FLIGHT_ENGINEER_DATA. Never throws.
 */
export async function loadFlightEngineerDataset(): Promise<NasaFlightEngineerData> {
  try {
    const res = await fetch('/data/powereng-baseline.json');
    if (!res.ok) return DEFAULT_FLIGHT_ENGINEER_DATA;
    const json = await res.json() as Partial<NasaFlightEngineerData>;
    return {
      ...DEFAULT_FLIGHT_ENGINEER_DATA,
      ...json,
      lrocIllumination: { ...DEFAULT_FLIGHT_ENGINEER_DATA.lrocIllumination, ...(json.lrocIllumination ?? {}) },
      vsatSpecs: { ...DEFAULT_FLIGHT_ENGINEER_DATA.vsatSpecs, ...(json.vsatSpecs ?? {}) },
      bvadBaselines: { ...DEFAULT_FLIGHT_ENGINEER_DATA.bvadBaselines, ...(json.bvadBaselines ?? {}) },
      osdrBioConsequences: { ...DEFAULT_FLIGHT_ENGINEER_DATA.osdrBioConsequences, ...(json.osdrBioConsequences ?? {}) },
      powerEngDiscoveries: json.powerEngDiscoveries ?? DEFAULT_FLIGHT_ENGINEER_DATA.powerEngDiscoveries,
    } as NasaFlightEngineerData;
  } catch {
    return DEFAULT_FLIGHT_ENGINEER_DATA;
  }
}

// ---------------------------------------------------------------------------
// MEDICAL OFFICER DATASET (Dr. Marcus Vance — hydroponics task)
// Sources: OSDR OSD-575 (blood/cytokines) + OSD-655 (VEG-04 hydro) + LRO CRaTER
// ---------------------------------------------------------------------------

export interface NasaMedicalData {
  datasetId: string;
  releaseDate: string;

  /** OSD-575 CMP + EvePanel cytokine flight shifts — sourced: NASA OSDR LSDS-8 */
  osd575Cmp: {
    studyAccession: string;
    serumCalciumBaselineMgDl: number;    // 9.2 mg/dL pre-flight
    serumCalciumFlightMgDl: number;      // 10.4 mg/dL flight (+13% bone resorption)
    bunBaselineMgDl: number;             // 14 mg/dL
    bunFlightMgDl: number;               // 19 mg/dL (+35% renal stress during EVA)
    il6BaselinePgMl: number;             // 1.8 pg/mL
    il6FlightPgMl: number;               // 4.2 pg/mL (+133% inflammation)
    inflammatoryRatioPct: number;        // 34% above baseline
  };

  /** OSD-655 VEG-04 hydroponic yield — sourced: NASA OSDR Mizuna mustard greens */
  osd655Veg: {
    studyAccession: string;
    freshMassPerPillowG: number;          // 142.4 g/pillow (N=8 valid pillows)
    harvestCycleDays: number;             // 28 days per grow cycle
    yieldKgPer28Days: number;             // 0.57 kg per tray (4 pillows)
    micronutrientCoveragePct: number;     // 35% of daily needs
    vitaminCMgPer100g: number;            // 48.2 mg vitamin C
    potassiumMgPer100g: number;           // 320 mg K+
    moraleBoostPctPerDay: number;         // +2%/day morale when hydroponics running
  };

  /** LRO CRaTER dosimetry cross-calibration — sourced: Schwadron 2012, Zeitlin 2013 */
  radiationDosimetry: {
    lroCraterOrbitMsvPerDay: number;      // 1.52 mSv/day unshielded lunar orbit
    surfaceQuietMsvPerDay: number;        // 1.36 mSv/day unshielded surface
    acesEvaMsvPerDay: number;             // 1.22 mSv/day ACES suit EVA
    regolithVaultMsvPerDay: number;       // 0.08 mSv/day (3m vault, >95% attenuation)
    arsSafeZoneMsv: number;              // <50 mSv — no ARS symptoms
    arsAdvisoryMsv: number;              // 50–250 mSv — efficiency -15%
  };

  /** Marcus Vance's discovery schedule (hydroponics task, Days 3–75) */
  medicalDiscoveries: GeologyDiscovery[];

  ntrsCitations: { id: string; title: string; date: string; authors: string[] }[];
  osdrStudies: { accession: string; title: string; date: string }[];
}

export const DEFAULT_MEDICAL_DATA: NasaMedicalData = {
  datasetId: 'NASA-MEDICAL-BASELINE',
  releaseDate: '2026-11-01',
  osd575Cmp: {
    studyAccession: 'OSD-575',
    serumCalciumBaselineMgDl: 9.2,
    serumCalciumFlightMgDl: 10.4,
    bunBaselineMgDl: 14.0,
    bunFlightMgDl: 19.0,
    il6BaselinePgMl: 1.8,
    il6FlightPgMl: 4.2,
    inflammatoryRatioPct: 34,
  },
  osd655Veg: {
    studyAccession: 'OSD-655',
    freshMassPerPillowG: 142.4,
    harvestCycleDays: 28,
    yieldKgPer28Days: 0.57,
    micronutrientCoveragePct: 35,
    vitaminCMgPer100g: 48.2,
    potassiumMgPer100g: 320,
    moraleBoostPctPerDay: 2.0,
  },
  radiationDosimetry: {
    lroCraterOrbitMsvPerDay: 1.52,
    surfaceQuietMsvPerDay: 1.36,
    acesEvaMsvPerDay: 1.22,
    regolithVaultMsvPerDay: 0.08,
    arsSafeZoneMsv: 50,
    arsAdvisoryMsv: 250,
  },
  medicalDiscoveries: [
    {
      day: 3,
      title: 'First Mizuna Harvest Metrics',
      finding: 'VEG-04 Mizuna mustard greens: 142 g ± 18 g fresh mass per pillow. 28-day cycle yields 0.57 kg, covering 35% of daily micronutrient needs.',
      source: 'NASA OSDR OSD-655 VEG-04 (ISS Flight-Mass.csv, N=8 valid pillows)',
      bonusScore: 400,
    },
    {
      day: 20,
      title: 'Blood Chemistry Panel Filed',
      finding: 'Serum calcium elevated 10.4 mg/dL (+13% vs baseline). BUN up 35%. Hydration order: >2.5 L/day per crew member. BVAD water budget confirmed.',
      source: 'NASA OSDR OSD-575 (LSDS-8 CMP flight draw; BVAD NASA/TP-2015-218570)',
      bonusScore: 700,
    },
    {
      day: 30,
      title: 'Cytokine Inflammatory Ratio',
      finding: 'IL-6 elevated to 4.2 pg/mL (+133%). Overall inflammatory ratio 34% above baseline. Prescribing Rest & Recovery twice weekly.',
      source: 'NASA OSDR OSD-575 EvePanel (LSDS-8_Multiplex_serum_immune_EvePanel_TRANSFORMED.csv)',
      bonusScore: 800,
    },
    {
      day: 45,
      title: 'Radiation Dose Review',
      finding: 'Cumulative exposure within safe zone (<50 mSv). LRO CRaTER orbit: 1.52 mSv/day unshielded. Regolith vault cuts to <0.08 mSv/day (>95% attenuation).',
      source: 'LRO CRaTER (Schwadron et al. 2012, Space Weather); RadLab ISS OSD-452',
      bonusScore: 1000,
    },
    {
      day: 55,
      title: 'Hydroponics Nutrition Impact',
      finding: 'Fresh Mizuna greens: 48.2 mg vitamin C + 112 µmol anthocyanins per 100g. Radiation DNA damage scavenging active. Kidney stone risk reduced.',
      source: 'NASA OSDR OSD-655 Master Chem (VEG-04 nutritional chemistry data)',
      bonusScore: 1100,
    },
    {
      day: 75,
      title: 'Mission Health Summary',
      finding: '75-day health profile: bone loss within predicted range, IL-6 managed by rest schedule, vitamin C supply maintained. Crew cleared for final 15 days.',
      source: 'OSD-575 + OSD-655 + LRO CRaTER + BVAD (NASA/TP-2015-218570)',
      bonusScore: 1500,
    },
  ],
  ntrsCitations: [],
  osdrStudies: [],
};

/**
 * Load the medical officer dataset at game startup.
 * Reads /data/medical-baseline.json (from scripts/normalize-medical.ts),
 * falls back to DEFAULT_MEDICAL_DATA. Never throws.
 */
export async function loadMedicalDataset(): Promise<NasaMedicalData> {
  try {
    const res = await fetch('/data/medical-baseline.json');
    if (!res.ok) return DEFAULT_MEDICAL_DATA;
    const json = await res.json() as Partial<NasaMedicalData>;
    return {
      ...DEFAULT_MEDICAL_DATA,
      ...json,
      osd575Cmp: { ...DEFAULT_MEDICAL_DATA.osd575Cmp, ...(json.osd575Cmp ?? {}) },
      osd655Veg: { ...DEFAULT_MEDICAL_DATA.osd655Veg, ...(json.osd655Veg ?? {}) },
      radiationDosimetry: { ...DEFAULT_MEDICAL_DATA.radiationDosimetry, ...(json.radiationDosimetry ?? {}) },
      medicalDiscoveries: json.medicalDiscoveries ?? DEFAULT_MEDICAL_DATA.medicalDiscoveries,
    } as NasaMedicalData;
  } catch {
    return DEFAULT_MEDICAL_DATA;
  }
}

/**
 * Inject medical officer dataset into game state.
 * Sets hydroponicsYieldKgPer28Days, moraleBoostFromHydroponics, and Marcus's discovery schedule.
 */
export function injectMedicalDataset(
  currentState: GameSimulationState,
  data: NasaMedicalData
): GameSimulationState {
  const osdrCount = data.osdrStudies?.length ?? 0;
  const ntrsCount = data.ntrsCitations?.length ?? 0;

  return {
    ...currentState,
    hydroponicsYieldKgPer28Days: data.osd655Veg.yieldKgPer28Days,
    moraleBoostFromHydroponics: data.osd655Veg.moraleBoostPctPerDay,
    medicalDiscoveries: data.medicalDiscoveries,
    logs: [
      {
        id: `medical-sync-${Date.now()}`,
        day: currentState.day,
        timestamp: 'T+MED-SYNC',
        sender: 'DR. MARCUS VANCE',
        message: `Medical dataset [${data.datasetId}] loaded. OSD-575: serum Ca²⁺ flight ${data.osd575Cmp.serumCalciumFlightMgDl} mg/dL, IL-6 ${data.osd575Cmp.il6FlightPgMl} pg/mL (+${data.osd575Cmp.inflammatoryRatioPct}%). OSD-655 VEG-04: ${data.osd655Veg.yieldKgPer28Days} kg/28d fresh greens. CRaTER orbit: ${data.radiationDosimetry.lroCraterOrbitMsvPerDay} mSv/day → vault <${data.radiationDosimetry.regolithVaultMsvPerDay} mSv/day. ${ntrsCount} NASA NTRS + ${osdrCount} OSDR studies.`,
        type: 'info',
      },
      ...currentState.logs,
    ],
  };
}

/**
 * Inject flight engineer dataset into game state.
 * Sets solarArrayMaxKw (from VSAT specs), SEP degradation rate, and
 * Sarah Chen's power grid discovery schedule.
 */
export function injectFlightEngineerDataset(
  currentState: GameSimulationState,
  data: NasaFlightEngineerData
): GameSimulationState {
  const updatedResources: ColonyResources = {
    ...currentState.resources,
    solarArrayMaxKw: data.vsatSpecs.peakOutputKw,
  };

  const osdrCount = data.osdrStudies?.length ?? 0;
  const ntrsCount = (data.ntrsCitations?.bvad?.length ?? 0)
    + (data.ntrsCitations?.vsat?.length ?? 0)
    + (data.ntrsCitations?.dust?.length ?? 0);

  return {
    ...currentState,
    resources: updatedResources,
    sepDegradationPctPerEvent: data.vsatSpecs.sepDegradationPctPerEvent,
    powerEngDiscoveries: data.powerEngDiscoveries,
    logs: [
      {
        id: `powereng-sync-${Date.now()}`,
        day: currentState.day,
        timestamp: 'T+PWR-SYNC',
        sender: 'CMDR. SARAH CHEN',
        message: `Power engineering dataset [${data.datasetId}] loaded. VSAT: 4 × ${data.vsatSpecs.powerPerArrayKw} kW = ${data.vsatSpecs.peakOutputKw} kW peak. LROC illumination: ${data.lrocIllumination.shackletonRimPct}% at Shackleton rim. SEP degradation: ${data.vsatSpecs.sepDegradationPctPerEvent}%/event. ${ntrsCount} NASA NTRS + ${osdrCount} OSDR studies cited.`,
        type: 'info',
      },
      ...currentState.logs,
    ],
  };
}
