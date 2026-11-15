# Project Artemis: 90 Days on the Lunar Frontier
## NASA Space Apps / Hackathon Master Mission Dossier & System Architecture

> **Notice for Hackathon Judges & Developers:**  
> The game currently runs on a high-fidelity **NASA Artemis Exploration Architecture synthetic baseline** (modeled after NASA AES ECLSS reports, LRO Diviner thermal datasets, and KRUSTY Kilopower telemetry).  
> A dedicated adapter module (`src/game/nasaDatasetAdapter.ts`) is pre-wired to hot-swap these models for **official NASA real-time API endpoints or dropped raw datasets** (JSON, GeoJSON, CSV) during the hackathon.

---

## 1. Executive Summary & Game Concept

- **Title:** *Project Artemis: 90 Days on the Lunar Frontier*
- **Platform:** Full-Screen 3D WebGL / WebGPU Browser Game (Desktop, Tablet, Mobile)
- **Engine Core:** Three.js / React 19 / TypeScript / Vite / Web Audio API
- **Premise:** You command a 4-person crew of NASA ACES astronauts stationed at the Moon's South Pole (Shackleton Crater rim). Over 90 lunar sols, you must balance closed-loop life support (ECLSS), navigate the brutal 28-day lunar day/night cycle (14 days of solar generation followed by 14 days of freezing night powered by a Kilopower fission reactor), manage equipment repairs, and survive coronal mass ejection (CME) solar storms.

---

## 2. Step-by-Step Player Guide ("How to Play")

Designed to ensure players and hackathon judges experience zero confusion:

### Step 1: Pre-Mission Briefing & Gear Selection (`[G]`)
1. On the Title Screen or in the Hangar Bay, type your **Commander Callsign** (e.g. `VALKYRIE-1`).
2. Click **`GEAR LOADOUT [G]`** to configure the 4 mission systems:
   - **ECLSS Life Support:** Choose standard *Bosch Catalytic Scrubber*, *Cryogenic O2 Sublimator* (+25% O2 efficiency), or *Regolith Ice Extractor* (+35% water yield).
   - **Kilopower Grid:** Choose standard 12 kW baseline, *High-Flux Stirling Overdrive* (+6 kW fission electricity), or *Ultra-Capacitive Graphene Bank* (expands battery reserve from 500 kWh to **750 kWh**).
   - **ACES Spacesuits:** Standard Mark-III, *Bismuth Radiation Weave* (blocks 60% solar storm dose), or *Hydraulic Servos* (+50% repair speed).
   - **Science Tool:** *Regolith Radar* (early warning), *Sabatier Compressor*, or *Spirulina Vats* (+35% hydroponic food yield).
3. Click **"COMMENCE MISSION"** (or press `[Space]`/`[Enter]`).

### Step 2: The 5 Playable 3D Levels
- **Level 1 — Hangar Bay:** Click on any of the 4 ACES astronauts to zoom in and inspect their vitals. Click the glowing 3D **"ENGAGE MISSION"** switch in the center.
- **Level 2 — Solar System Orrery:** Orbit the 3D planets (Sun, Earth, Moon, Mars, Jupiter, Saturn). Click **The Moon** to trigger a hyperspace camera dive.
- **Level 3 — Artemis Launch Pad:** Experience the nighttime Cape Canaveral countdown: umbilical swing arm release (T-3s), engine ignition sparks, rocket plume illumination, and liftoff rumble.
- **Level 4 — Lunar Surface Outpost (Main Core):** The primary 90-sol survival game.
- **Level 5 — Habitat Interior:** Switch camera into the pressurized habitat command module at any time using the top viewport bar or hotkeys `[1]`–`[5]`.

### Step 3: Core Gameplay & Daily Actions
- **Rotate the Camera:** Left-click drag to orbit 360°, scroll wheel to zoom, or use `WASD` / arrow keys / on-screen D-Pad.
- **Inspect Crew:** Click any astronaut walking in the 3D world or click their card in the bottom dock to open their **Biometric Dossier**.
- **Assign Tasks:**
  - `EVA Repair`: Repairs damaged habitat domes, solar arrays, and batteries.
  - `Hydroponics`: Boosts food ration production and water recycling.
  - `Power Grid`: Optimizes reactor output and electrical distribution.
  - `Rest & Recovery`: Heals injured astronauts and restores morale.
- **Survive the 28-Day Day/Night Cycle:**
  - **Sunlit Phase (14 Earth days):** Solar arrays generate 30+ kW. Charge your 500–750 kWh battery bank to 100%.
  - **Night Phase (14 Earth days):** Solar generation drops to **0 kW**. The colony survives solely on the Kilopower nuclear reactor and battery storage. Prevent brownouts to keep heating and oxygen active!
- **Mitigate Red Alert Crises:**
  - **Solar Storm (CME):** When the warning flashes, click **"SHELTER ALL CREW"** immediately to pull astronauts inside the radiation vault.
  - **Hull Micrometeorite Breach:** Assign an engineer to `EVA Repair` immediately before base integrity drops to 0%.

### Step 4: Sol 90 Victory Condition
Survive all 90 sols with at least 1 living astronaut and base structural integrity > 0% to log your final score on the mission leaderboard.

---

## 3. User Flow & State Machine

```
┌────────────────────────────────────────────────────────┐
│                      TITLE SCREEN                       │
│  - Callsign Input                                      │
│  - Gear Loadout Picker [G]                             │
│  - Flight Manual [?]                                   │
└──────────────────────────┬─────────────────────────────┘
                           │ Click "COMMENCE MISSION"
                           ▼
┌────────────────────────────────────────────────────────┐
│               LEVEL 1: PRE-FLIGHT HANGAR               │
│  - 4 ACES Astronauts in microgravity idle               │
│  - Astronaut Biometric Dossier inspection               │
│  - 3D Cargo Elevator & Gear Bay                         │
└──────────────────────────┬─────────────────────────────┘
                           │ Click 3D "ENGAGE MISSION" switch
                           ▼
┌────────────────────────────────────────────────────────┐
│             LEVEL 2: DEEP-SPACE ORRERY                 │
│  - Real-time 3D planetary orbital mechanics            │
│  - Solar corona lighting & planet hover                │
└──────────────────────────┬─────────────────────────────┘
                           │ Click "The Moon" or "Mars"
                           ▼
┌────────────────────────────────────────────────────────┐
│            LEVEL 3: ARTEMIS LAUNCH PAD                 │
│  - Nighttime Launch Complex 39B                        │
│  - Umbilical arm swing & engine ignition sparks        │
│  - SLS Rocket ascent & staging                         │
└──────────────────────────┬─────────────────────────────┘
                           │ Auto-transitions or Click "SKIP"
                           ▼
┌────────────────────────────────────────────────────────┐
│            LEVEL 4: LUNAR SURFACE OUTPOST              │
│               ★ CORE SURVIVAL LOOP ★                   │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Continuous Game Loop (tickSimulation):           │  │
│  │ 1. Solar Array Tracking & Day/Night Angle        │  │
│  │ 2. Kilopower Fission Core Generation             │  │
│  │ 3. Closed-Loop ECLSS Gas & Water Recovery        │  │
│  │ 4. Astronaut Metabolic Burn & Morale Decay       │  │
│  │ 5. Random Hazard Roll (CME, Breach, Brownout)    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Player Interactions:                                  │
│  - Camera Orbit / Pan / Zoom (Mouse + WASD + D-Pad)    │
│  - Advance Time (+5h, +1 Sol, +5 Sols)                 │
│  - Reassign Astronaut Tasks (EVA, Hydro, Power, Rest)  │
│  - Order Emergency Shelter Protocol                    │
│  - Toggle Viewports [1-5] (Hangar, Orrery, Pad, Outpost, Hab) │
│  - Toggle Gear Loadout [G] & Flight Manual [?]         │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌──────────────────────────┐┌──────────────────────────┐
│      VICTORY SCREEN      ││      DEFEAT SCREEN       │
│ - Reached Sol 90         ││ - All 4 Crew Lost OR     │
│ - Final Score Calculated ││ - Base Integrity = 0%    │
│ - Restart / Return Title ││ - Cause of Death Logged  │
└──────────────────────────┘└──────────────────────────┘
```

---

## 4. UX/UI Flow & Diegetic Interface Architecture

The game uses **zero generic HTML dashboard cards**; all visual elements are diegetic:

1. **Curved Astronaut Helmet Visor Overlay:**
   - Subtle peripheral vignette, spherical curvature, scanline texture, and optical glare mimicking an Apollo/Artemis gold-coated polycarbonate visor.
2. **5-Axis Readiness Telemetry (Upper Left):**
   - Displays Mission Sol (1–90), day/night phase badge (`SUNLIT (+14d)`, `PENUMBRA`, `NIGHT (-14d)`), and quick time advance toggles (`+5 Hrs`, `+1 Sol`, `+5 Sols`).
3. **Consumables Status HUD (Upper Left):**
   - Segmented color-coded bars for **O2 Reserves (kg)**, **H2O Hydro (L)**, **Rations (Meals)**, and **Shield Integrity (%)**.
4. **Camera & Power Telemetry (Upper Right):**
   - D-Pad controls for touch/tablet players.
   - Real-time electrical grid split: Solar Array output (kW), Kilopower Fission output (kW), Base Demand (kW), and Battery Storage gauge (`kWh / Max kWh`).
5. **Collapsible Crew Dock (Bottom Center):**
   - Compact status cards for all 4 astronauts showing name, role, live health %, and current assignment with quick minimization toggle for full cinematic view.
6. **3D World Space Interaction:**
   - Raycasting allows clicking directly on 3D meshes (astronaut suits, solar panels, nuclear reactor, habitat dome) to open in-world inspection panels.
7. **Spatial Acoustic Soundscape (Web Audio API):**
   - 3D panned audio nodes for spacesuit radio telemetry beeps, airlock cycling, life-support hum, periodic astronaut breathing cycles, and emergency klaxon sirens.

---

## 5. Technology Stack & Architectural Breakdown

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript | Component state management, UI reactivity, strict type safety |
| **3D Graphics Engine** | Three.js (r182+) | Custom WebGL scenegraph, dynamic PBR lighting, camera controllers |
| **Rendering Pipeline** | ACESFilmicToneMapping | Photorealistic dynamic range, Sun bloom, and lunar regolith contrast |
| **Audio Pipeline** | Web Audio API (`SpatialAudioManager`) | Procedural synthesized soundscapes, 3D spatial panning, zero asset lag |
| **Styling & HUD** | Tailwind CSS v4 | Lightweight responsive styling, dark HUD aesthetics |
| **Icons & Emblems** | Lucide-React + Custom SVG | Scalable vector astronaut telemetry and navigation icons |
| **Build & Tooling** | Vite 8 + TSX | Instantaneous bundling and development server |
| **Test Suite** | Node.js Test Runner (`node:test`) | Unit-tested pure mathematical simulation and survival rules |

### Architectural Decoupling:
- **`src/game/survivalRules.ts`**: A pure, headless simulation engine running independently of Three.js. This ensures deterministic math, 100% testability, and zero frame-rate hitching.
- **`src/graphics/GameEngine.ts`**: The dedicated 3D rendering pipeline handling procedural geometries, animations, camera dolly sequences, and raycasting.
- **`src/audio/SpatialAudioManager.ts`**: Synthesized audio nodes utilizing Web Audio API oscillators, gain nodes, and biquad filters for instant sound without heavy external audio files.

---

## 6. NASA Dataset Integration Guide (Hackathon Day)

On hackathon day, when NASA drops official datasets, the game is built to ingest real data through `src/game/nasaDatasetAdapter.ts`:

### Compatible NASA Open Datasets:
1. **NASA Planetary Data System (PDS) — Lunar Reconnaissance Orbiter (LRO) Diviner:**
   - Real lunar surface temperature curves from Shackleton crater to drive thermal drain and solar array wattage.
2. **NASA DONKI / NOAA Space Weather Prediction Center (SWPC):**
   - Real-time coronal mass ejection (CME) and solar flare feeds (X-class, M-class) to trigger in-game emergency storm alerts.
3. **NASA Advanced Exploration Systems (AES) ECLSS Human Baseline Data:**
   - Real oxygen consumption per EVA metabolic rate (0.84 kg/day nominal vs 1.2 kg/day during high-exertion regolith drilling).
4. **NASA KRUSTY (Kilopower Reactor Using Stirling Technology) Ground Test Data:**
   - Real sodium heat-pipe Stirling engine thermal-to-electric conversion curves.

### How to Ingest Data (Example):
```typescript
import { injectNasaDataset, NasaTelemetryDataset } from './game/nasaDatasetAdapter';

// Example: Fetching live NASA Hackathon data feed
async function loadOfficialNasaData() {
  const response = await fetch('/api/nasa/lunar-telemetry.json');
  const rawNasaData: NasaTelemetryDataset = await response.json();
  
  // Inject directly into game simulation state:
  setGameState(prevState => injectNasaDataset(prevState, rawNasaData));
}
```

---

## 7. Hotkey & Command Reference

| Hotkey | Description |
| :---: | :--- |
| **`[G]`** | Open **Equipment & Gear Loadout Bay** |
| **`[?]`** or **`[/]`** | Open **Step-by-Step Flight Manual** |
| **`[1]` – `[5]`** | Instant Viewport Warp: `1` Hangar, `2` Orrery, `3` Launch Pad, `4` Lunar Outpost, `5` Hab Command |
| **`[WASD]` / Arrows** | Pan & Orbit 3D Camera |
| **`[Space]`** / **`[Enter]`** | Advance Flight Sequence / Start Game |
| **`[P]`** / **`[Esc]`** | Pause Game / Dismiss Open Modal |
| **`[M]`** | Mute / Unmute 3D Spatial Audio |
