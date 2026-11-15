# ORBY (ARTEMIS-III) — Cross-Role Architecture

> Owner: docs/CROSS_ROLE_ARCHITECTURE.md  
> See also: docs/08_Pilot-Research-Phase2.md through docs/11_Medical-Officer-Research-Phase2.md  
> All numbers sourced from public/data/*-baseline.json unless marked [Game assumption].

---

## Crew Roster

| Callsign | Role | NASA Dataset Owner |
|---|---|---|
| Tyler Hayes | Pilot / Commander | PIA13720.tif, WAC_POLE_ILL_PCT_SOUTH_100M, DONKI |
| Elena Rostova | Geologist | LOLA Site04 surf.tif / slp.tif, orby_lunar_regional_clean.csv |
| Sarah Chen | Flight Engineer | VSAT/BVAD (NTRS), LROC WAC illumination, OSDR OSD-575 |
| Marcus Vance | Medical Officer | OSD-575 (CMP/EvePanel), OSD-655 (VEG-04), LRO CRaTER |

---

## Dependency Map (4 cross-role chains)

### Chain 1 — Solar Power Availability

```
Tyler Hayes (Pilot)
  Illumination source: LROC WAC_POLE_ILL_PCT_SOUTH_100M (100 m/px, 2009–2011)
  Shackleton Rim: 86 % sunlit  |  Nobile Ridge: 89 % sunlit
         │
         ▼
Sarah Chen (Flight Engineer)
  4 × 10 kW relocatable solar arrays = 40 kW peak (45 kW with margin)
  Array mass: 180 kg each; sun elevation 1.5°; mast height 15 m
  Battery capacity: 50 kWh [Game assumption]
  Charge formula: P_net = P_array × ill_pct − P_load
  SEP solar degradation: −5 % output per SEP event (cumulative)
         │
         ▼
DR-01 Load-Shedding (shed order, engine rule survivalRules.ts)
  1. Science [CUTS FIRST]
  2. Rovers
  3. Communications
  4. Heating
  5. Life Support [SHED LAST]
         │
  ┌──────┴──────────────────┐
  ▼                         ▼
Elena Rostova           Marcus Vance
Science load cut        No heating → crew health penalty
(GM-07 Research         (OSD-575 metabolic deviation rises
 Hydroponics pauses)    if core temp drops)
```

**Key power events wired to this chain:**

| Event | Trigger | Effect |
|---|---|---|
| EV-05 Long Darkness | Illumination drops to 0 % (polar shadow, Pilot difficulty: Cadet 48 h / Pilot 72 h / Commander 100 h) | P_array = 0; battery drain begins |
| EV-08 Battery Critical | Battery < 10 % SoC | Auto-shed to Life Support only; crew morale penalty |
| EV-13 Backup Power Planning | Pre-event warning at battery < 30 % | Player prompted to plan load shedding |
| EV-03 Recycler Fault | Water recycler trips (Sarah Chen) | O2/water supply threatened; Medical Officer alerted |
| EV-07 O2 Generator Trips | Sabatier unit fails | O2 reserve drawn down; MedOff triage |

---

### Chain 2 — Terrain Slope / Rover Range

```
Tyler Hayes (Pilot)
  Terrain source: LOLA Site04 surf.tif + slp.tif
  Supplemented by: orby_lunar_regional_preview_10000.csv
                   orby_lunar_regional_clean.csv
  Coverage: ~−88° to −90° S, 100 m resolution
         │
  Slope threshold (from slp.tif):
    Safe EVA:     ≤ 10°
    Caution EVA:  11–20°
    No-go zone:   > 20° (DR-01 rover cut applies here too)
         │
         ▼
Elena Rostova (Geologist)
  6 NASA Apollo/ALSEP spacewalking tools mapped to slope/terrain:
    1. Drive Tube          — requires flat regolith (slope ≤ 5°)
    2. Extension Handle    — usable on 5–15° slopes
    3. Hammer              — any slope, low risk
    4. Rake                — requires loose regolith (depth from surf.tif)
    5. Scoop               — standard sampling, slope ≤ 20°
    6. Tongs               — precision pick, slope ≤ 25°
  Rover range formula:
    max_range_km = battery_pct × 8.0 × (1 − slope_avg / 90)  [Game assumption]
    (8 km max on flat terrain at full charge)
  Geology discoveries unlock at Days 3 / 10 / 20 / 35 / 55 / 80
         │
         ▼
  Restricted zones block rover moves in src/game/survivalRules.ts
  When DR-01 Rovers shed: all EVA sampling pauses regardless of slope
```

---

### Chain 3 — Space Weather (DONKI) → All Roles

```
NASA/CCMC DONKI API
  FLR  (Solar Flare events)    — 2016 baseline: FLR_2016-01-01.json
  CME  (Coronal Mass Ejections)— 2016 baseline: CME_2016-01-01_to_03.json
  SEP  (Solar Energetic Particles)— 2016 baseline: SEP_2016-01-02.json
         │
  ┌──────┼──────────────────────────────┐
  ▼      ▼                              ▼                    ▼
Tyler   Sarah Chen                  Elena Rostova       Marcus Vance
Hayes   (Flight Eng.)               (Geologist)         (Medical Off.)
  │
EVA     EV-13 Backup Power:         EVA sampling        Radiation triage:
recall  SEP degrades arrays         paused; crew        lunar_radiation.csv
  │     −5 % per event;             recalled to         (LRO CRaTER dose
  │     battery buffer              shelter             rates, mGy/h)
  │     must absorb gap             during SEP          ISS shielding
  │                                                     baseline from
  │                                                     RadLab API
  ▼
Player shown: Risk = High (CME/SEP) | Risk = Med (FLR)
"Storm shelter" standing order auto-assigned to all crew during SEP/CME
```

**DONKI fetch constraints (see src/nasa_api_client.py):**
- Max window per CMEAnalysis request: **60 days**
- Min delay between NTRS sequential fetches: **1.2 s**
- OSDR redirect: `genelab.nasa.gov` → `osdr.nasa.gov` (HTTP 301, follow)

---

### Chain 4 — BVAD Water/O2 → Hydroponics → Crew Health

```
Sarah Chen (Flight Engineer)
  NASA BVAD baselines (from public/data/powereng-baseline.json):
    O2:          0.84 kg/person/day
    Water:       2.5 L/person/day
    Food:        2800 kcal/person/day
    CO2 scrub:   1 kg/person/day
    Sabatier efficiency: 92 %
  Water recycler (EV-03) and O2 generator (EV-07) modeled here
         │
         ▼
Elena Rostova (Geologist) — Hydroponics station
  VEG-04 water consumption from OSD-655_sup_Veg-04-FlightWater.csv
    Measured in mL per day-after-inoculation (DAI 0–35)
    Flight vs. Ground Control batches compared
  Crop yield boosts crew morale +5 % per harvest [Game assumption]
  GM-07: Science power shed pauses hydroponics lighting
         │
         ▼
Marcus Vance (Medical Officer)
  OSD-575 Comprehensive Metabolic Panel (CMP):
    albumin, ALT, AST, creatinine, glucose, electrolytes…
    Deviations tracked per Sample Name (C001_serum_L-*, etc.)
  OSD-575 EvePanel (immune multiplex):
    IL-6, TNF-α, IL-1β, IFN-γ, MCP-1 … (135 cytokine markers)
    Elevated IL-6 / TNF-α = early inflammation flag in game
  LRO CRaTER (lunar_radiation.csv):
    instrument: CRaTER-D1D2 on LRO spacecraft
    absorbed_dose_rate in mGy/h (DATA SOURCE: LRO/CRaTER)
  Medical discoveries unlock at Days 3 / 10 / 25 / 40 / 60 / 75
```

---

## Shared Facts (locked — see CLAUDE.md §2)

| Fact | Value | Source |
|---|---|---|
| Mission duration | 90 Earth days = 2,160 hours | Decision D-02 |
| Time display | DAY X / 90 (never "Sol") | Decision D-03 |
| Peak solar output | 45 kW (4 × 10 kW + margin) | VSAT/NTRS |
| BVAD O2 | 0.84 kg/person/day | NASA BVAD |
| BVAD water | 2.5 L/person/day | NASA BVAD |
| Sabatier efficiency | 92 % | NASA ECLSS |
| SEP degradation | −5 % per event | VSAT/NTRS |
| DR-01 shed order | Science→Rovers→Comms→Heating→LifeSupport | Rule DR-01 |
| Polar shadow (Pilot) | 48 h / 72 h / 100 h (Cadet/Pilot/Commander) | Decision D-04 |
| Rover max range | 8 km @ 100 % battery on flat terrain | [Game assumption] |
| Kilopower reactor | 12 kW electric / 40 kW thermal | NASA (labeled "Planned technology") |

---

## Data Flow: Raw CSV → public/data/ Baseline JSON

```
orby-mission-trainer/data/           scripts/                   public/data/
─────────────────────────────        ──────────────────────      ─────────────────────
LSDS-8_CMP_TRANSFORMED.csv      →   normalize-medical.ts   →   medical-baseline.json
LSDS-8_EvePanel_TRANSFORMED.csv →                              (osd575Cmp, osd655Veg,
OSD-655_*Flight-Mass.csv        →                               radiationDosimetry)
OSD-655_*GroundControl-Mass.csv →
OSD-655_*FlightWater.csv        →
lunar_radiation.csv             →

FY20 ADC Regional Data …3.csv   →   normalize-powereng.ts  →   powereng-baseline.json
orby_lunar_regional_clean.csv   →                              (lrocIllumination,
orby_lunar_regional_preview_…   →                               vsatSpecs, bvadBaselines)

FLR_2016-01-01.json             →   normalize-dataset.ts   →   nasa-baseline.json
CME_2016-01-01_to_03.json       →                              (spaceWeather, eclss,
SEP_2016-01-02.json             →                               kilopower, radlab)

geology-baseline.json           →   normalize-geology.ts   →   geology-baseline.json
```

Large raw CSVs (>100 kB) stay in orby-mission-trainer/data/ and are never copied to public/.

---

## Banned Words in Player-Facing Text (CLAUDE.md rule)

`Sol` (Moon context) · `14-day night` · `End day` · `Command tab` · `radiation weave`
