/**
 * ORBY Lunar Geology Dataset Normalizer
 * Fetches real NASA NTRS citations for lunar south pole science
 * and writes public/data/geology-baseline.json.
 *
 * Run with: npx tsx scripts/normalize-geology.ts
 *
 * Sources fetched live:
 *   NASA NTRS API — ntrs.nasa.gov/api/citations/search
 *
 * Published values used (static, well-sourced):
 *   Shackleton Crater geometry  : LRO LOLA — Zuber et al. 2012, Nature 486
 *   Water ice concentration     : LCROSS — Colaprete et al. 2010, Science 330
 *   Surface frost coverage      : LRO LAMP — Hayne et al. 2015, Icarus 255
 *   Regolith composition        : Clementine UVVIS + LRO — Lucey et al. 2000
 *   Hydrogen distribution       : LRO LEND — Mitrofanov et al. 2010, Science 330
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '..', 'public', 'data', 'geology-baseline.json');
const NTRS_BASE = 'https://ntrs.nasa.gov/api/citations/search';

interface NtrsResult {
  id: string;
  title: string;
  distributionDate?: string;
  authorAffiliations?: { meta: { author: { name: string } } }[];
  subjectCategories?: string[];
}

interface NtrsCitation {
  id: string;
  title: string;
  date: string;
  authors: string[];
  categories: string[];
}

async function fetchNtrs(query: string, limit = 3): Promise<NtrsCitation[]> {
  const url = `${NTRS_BASE}?q=${encodeURIComponent(query)}&sort=relevance&limit=${limit}`;
  console.log(`  NTRS: "${query}"`);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as { stats: { total: number }; results: NtrsResult[] };
    console.log(`    → ${data.stats.total} results, using top ${data.results.length}`);
    return data.results.map((r) => ({
      id: r.id,
      title: r.title,
      date: (r.distributionDate ?? '').substring(0, 10),
      authors: (r.authorAffiliations ?? []).slice(0, 3).map((a) => a.meta.author.name),
      categories: r.subjectCategories ?? [],
    }));
  } catch (err) {
    console.warn(`    Warning: NTRS fetch failed (${err})`);
    return [];
  }
}

async function main(): Promise<void> {
  console.log('ORBY Lunar Geology Dataset Normalizer\n');

  // Fetch sequentially with 1.2s gap to respect NTRS rate limits
  const pause = () => new Promise((r) => setTimeout(r, 1200));
  const lcrossRefs     = await fetchNtrs('LCROSS water ice lunar south pole', 3);
  await pause();
  const shackletonRefs = await fetchNtrs('LRO LOLA Shackleton crater lunar ice', 3);
  await pause();
  const frostRefs      = await fetchNtrs('lunar south pole frost volatile ice LRO LAMP Hayne', 3);
  await pause();
  const viperRefs      = await fetchNtrs('VIPER lunar south pole volatiles mission 2024', 2);

  const today = new Date().toISOString().split('T')[0];

  // Published geological values — all sourced from peer-reviewed NASA mission data
  const dataset = {
    datasetId: `NASA-GEOLOGY-${today}`,
    releaseDate: today,
    sourceDescription: 'Lunar south pole geology baseline — Shackleton Crater region (89.9°S, 0°E)',
    dataSources: {
      craterGeometry: 'LRO LOLA — Zuber et al. (2012) Nature 486, doi:10.1038/nature11216',
      waterIce: 'LCROSS — Colaprete et al. (2010) Science 330, doi:10.1126/science.1186986',
      surfaceFrost: 'LRO LAMP — Hayne et al. (2015) Icarus 255, doi:10.1016/j.icarus.2015.03.032',
      regolithComp: 'Clementine UVVIS — Lucey et al. (2000) JGR Planets 105, E8',
      hydrogenDist: 'LRO LEND — Mitrofanov et al. (2010) Science 330, doi:10.1126/science.1197358',
      ntrsLive: `NASA NTRS API — ${lcrossRefs.length + shackletonRefs.length + frostRefs.length + viperRefs.length} paper citations fetched live`,
    },

    // Shackleton Crater geometry — sourced: LRO LOLA (Zuber et al. 2012)
    craterGeometry: {
      name: 'Shackleton Crater',
      latitude: -89.9,
      longitude: 0.0,
      diameterKm: 21.0,         // sourced: LRO LOLA, 21 km rim-to-rim
      depthM: 4200,              // sourced: LRO LOLA, 4.2 km deep
      rimElevationM: 150,        // sourced: LRO LOLA, rim ~150 m above surroundings
      psrTempKelvin: 90,         // sourced: LRO Diviner, PSR interior ~90 K
      rimSunlightPct: 86,        // sourced: LRO LOLA, rim in sunlight 86% of time
    },

    // Water ice — sourced: LCROSS Colaprete et al. 2010, Science
    waterIce: {
      lcrossIceMassPct: 5.6,          // sourced: Cabeus crater ejecta plume, 5.6% by mass
      lcrossIceSite: 'Cabeus Crater',  // sourced: LCROSS impact Oct 9, 2009
      lcrossH2OKgPerM3: 155,           // sourced: 155 kg/m² ejecta water content
      lampFrostCoveragePct: 20.0,      // sourced: LRO LAMP, ~20% frost area in Shackleton PSR
      miniRfIceSignature: true,        // sourced: LRO Mini-RF anomalous CPR in Shackleton
      volatiles: ['H₂O', 'CO₂', 'CO', 'H₂S', 'SO₂', 'CH₃OH', 'NH₃', 'C₂H₄'],
    },

    // Regolith composition — sourced: Clementine UVVIS (Lucey et al. 2000) + LRO
    regolithComposition: {
      SiO2Pct: 45.0,    // sourced: south pole highlands average
      FeOPct: 8.0,       // sourced: lower than mare (highlands-dominant terrain)
      Al2O3Pct: 22.0,    // sourced: anorthositic highlands
      TiO2Pct: 0.5,      // sourced: low-Ti at south pole (non-mare)
      CaOPct: 14.0,      // sourced: plagioclase-rich highlands
      MgOPct: 7.5,       // sourced: south pole highlands
      maturityIndex: 0.65, // sourced: IS/FeO ratio, moderately mature regolith
    },

    // Research value derived from real ice data
    researchValue: {
      // 1.0 + (iceConcentrationPct / 10) = 1.56 for LCROSS 5.6%
      yieldMultiplier: parseFloat((1.0 + 5.6 / 10).toFixed(2)),
      scientificRationale: 'Ice concentration 5.6% (LCROSS) gives 1.56× research yield vs average lunar site',
      isruPotentialRating: 'HIGH',  // in-situ resource utilization
    },

    // Research discovery schedule (Dr. Rostova's sequential findings)
    // All findings are grounded in real NASA mission data
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

    // Live NASA NTRS paper citations
    ntrsCitations: {
      lcross: lcrossRefs,
      shackleton: shackletonRefs,
      frost: frostRefs,
      viper: viperRefs,
    },
  };

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(dataset, null, 2));

  const totalRefs = lcrossRefs.length + shackletonRefs.length + frostRefs.length + viperRefs.length;
  console.log(`\nOutput: ${OUTPUT_PATH}`);
  console.log(`  Ice concentration  : ${dataset.waterIce.lcrossIceMassPct}% (LCROSS)`);
  console.log(`  Research multiplier: ${dataset.researchValue.yieldMultiplier}×`);
  console.log(`  Discoveries wired  : ${dataset.geologyDiscoveries.length} events (Day 7–70)`);
  console.log(`  NTRS citations     : ${totalRefs} live papers fetched`);
}

main().catch((err) => {
  console.error('normalize-geology failed:', err);
  process.exit(1);
});
