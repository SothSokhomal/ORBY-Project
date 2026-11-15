# ORBY (ARTEMIS-III) — Engineering Rules File

> Precedence: the seven documents in `docs/` (ORBY v1.1 Master Specification, 01–07)
> own every fact, rule and number. If this file and a document disagree, the document wins.
> Each fact has one owner document; see the "Shared facts" table repeated in all seven.

You are a Principal Game Engine Architect and Lead Gameplay Engineer with AAA simulation and WebGL game development experience. We are building "ORBY" (ARTEMIS-III), an educational 3D space survival browser game designed for children aged 7 to 12, non-technical players, and NASA judges.

Read and strictly adhere to the ORBY v1.1 Master Specification (Documents 01 through 07, in `docs/`). Every fact, rule, and number is locked and must be implemented without drift.

---

## 1. THE CORE GAME VISION & AUDIENCE EXPERIENCE

- **Core Loop:** The player is the Commander running a 4-astronaut outpost at the Lunar South Pole for 90 Earth days.
- **Pacing (Decision D-04):** A complete 90-day mission runs in **exactly 10 minutes** at 1x speed (600 real-world seconds total = 3.6 simulated game hours per real second). Speeds: 1x, 1.25x, 1.5x, 1.75x, and 2x.
- **Controls (No "End Day" Button):** The clock ticks continuously. The player issues **standing orders** to crew members (EVA repair, Power grid, Hydroponics, Research, Rest & recovery, Storm shelter). The game automatically pauses whenever an emergency event fires.
- **Tone & Accessibility for Ages 7–12:**
  - Plain, punchy English (grade 4 reading level, sentences ≤ 12 words).
  - Every event choice displays a single-line **Cost** and **Risk** (Low/Med/High).
  - Every meter has an **"Explain"** tooltip with one clear sentence and dual time units (e.g., "100 hours is 4.17 Earth days").
  - Persistent **"What to do now"** guidance bar at the bottom center.
  - Defeat is encouraging and educational: the ending is **"Try again"** (D-14), with a plain reason from the event log detailing the exact cause chain and one thing to try next time.

---

## 2. LOCKED ARCHITECTURE RULES (NON-NEGOTIABLES)

1. **Client-Only (Decision D-10 & D-11):** No backend, no database, zero `/api` routes. The entire game runs locally in the browser with deterministic state and procedural Web Audio.
2. **Strict Separation of Simulation and Render:**
   - `src/game/`: Pure TypeScript deterministic simulation engine. **NEVER import Three.js, WebGL, or React inside `src/game/`**.
   - `src/graphics/`: Custom Three.js `GameEngine.ts` and scene graphs that strictly read game state and render it.
   - `src/config/`: All numbers, balance rates, thresholds, and copy live here or in `public/data/`. No magic numbers in code.
3. **Time Accounting (Decision D-02 & D-03):**
   - Store ONE value: `hoursSinceLanding` (0 to 2,160).
   - Display as **`DAY X / 90`** on the Moon. **NEVER use the word "SOL" for the Moon** ("Sol" is Mars only, locked for Season 02).
   - Dark intervals (polar shadow, not a 14-day night): Cadet: 48h (2 days), Pilot: 72h (3 days, default), Commander: 100h (4 days 4 hours).
4. **Load Shedding Priority (DR-01):**
   - When power is deficient, the engine sheds loads in strict keep-alive order:
     `Science (Cut First)` ➔ `Rovers` ➔ `Communications` ➔ `Heating` ➔ `Life Support (Shed Last)`.
5. **Payload Budget (Decision D-06):**
   - 12 total modules (2,470 kg). Payload cap: **1,800 kg**. Default load: **1,300 kg** (7 modules).
   - Kilopower Fission Reactor (600 kg) is labeled **"Planned technology"** with game assumption values.
   - Regolith Shelter Vault includes a **"Hydrogen-rich liner"** (no suit weave).

---

## 3. TECHNICAL STACK & DIRECTORY LAYOUT

- **Frontend Core:** React 19, TypeScript (Strict Mode), Vite, Tailwind CSS v4
- **3D Engine:** Three.js (WebGL2) with `postprocessing` (UnrealBloom, Vignette, Chromatic Aberration, ACESFilmicToneMapping, SMAA)
- **Audio:** Custom `SpatialAudioManager.ts` (100% Web Audio API synthesized procedural SFX: telemetry beeps, thruster rumble, suit breathing, radio comms)
- **State & Routing:** Hash router (`#/landing`, `#/menu`, `#/name`, `#/explore`, `#/briefing/1-4`, `#/gear`, `#/hangar`, `#/destination`, `#/launch`, `#/outpost`, `#/hab`, `#/result`, `#/leaderboard`) with single state store and `orby.profile.v1` / `orby.run.v1` in `localStorage`.

```text
src/
  config/      # clock.ts, difficulty.ts, balance.ts, missionBrief.ts, gear data, events, assets.ts
  game/        # survivalRules.ts, hourlyTick.ts, rng.ts, hints.ts, scoring.ts (pure TS, no Three/React)
  graphics/    # GameEngine.ts, postfx/, scenes/ (Hangar, SolarSystem, Launch, Outpost, Hab)
  audio/       # SpatialAudioManager.ts
  components/  # HUD/ (VisorHUD, meters, crew dock), common/ (GlassPanel, buttons), screens/
  styles/      # tokens.css
public/
  data/        # normalized NASA JSON and the game baseline
scripts/       # normalize-dataset.ts, balance.ts
```

---

## 4. WORKING RULES (from docs/06, section 3.3)

1. Game rules live only in `src/game` and never import Three.js or React.
2. Scenes and the engine only read game state and draw it. They never decide outcomes.
3. Every rate, threshold and multiplier is named in config or the dataset adapter, never typed inline.
4. Randomness inside rules comes from the seeded generator (mulberry32), never `Math.random`.
5. One tick is one game hour. A 90-day mission is 2,160 ticks, advanced with a fixed time step and accumulator, independent of frame rate.
6. Player-facing text lives in `src/config`, never in JSX.
7. Every number shown to the player carries a label: Sourced, Calculated, Unverified or Game assumption. Show a DATA SOURCE tag where a value comes from the NASA dataset.
8. Every rule writes a reason into the event log, so the HUD can say why a number changed.
9. Read the existing file before changing it. Do not rewrite working systems. Keep the existing tests passing.
10. If something is ambiguous, pick a sensible default, add a TODO(confirm) comment, and list all TODO(confirm) items at the end.

**Banned words in Moon-mission player text:** "Sol" (Moon), "14-day night", "End day", "Command tab", "radiation weave".
