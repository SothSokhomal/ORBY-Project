# ORBY 06: Technical Stack

*Architecture, hackathon plan and AI prompts · Document 6 of 7 · Version 1.1 · November 14, 2026 · Hackathon edition*

| | |
|---|---|
| This document owns | The stack, the architecture rules, the folder structure, the visual upgrades, testing, the two-day plan and the AI prompts. |
| Read it if | You are writing code, setting up the repo, or planning the hackathon hours. |
| It defers to | Rules (03), screens (04), visuals (05), data shapes (07). |

**How the seven documents stay aligned.** Each fact has one owner. If two documents seem to disagree, the document that owns the topic wins. The decision log, requirements, work packages and risks are in the *ORBY Technical Documentation and Project Plan v1.1*, which is the project plan and is not one of the seven.

## Shared facts (identical in all seven documents)

| Topic | Locked fact | Decision |
|---|---|---|
| Product | ORBY is an educational browser 3D survival game for ages 7 to 12. The mission name is ARTEMIS-III. | D-01 |
| Scenario | Four astronauts, 90 Earth days, lunar south pole. Season 01 is Moon only. Mars is shown locked as Season 02. | D-16 |
| Time | The simulation stores hours since landing. One tick is one game hour, 2,160 ticks per mission. The Moon clock reads DAY X / 90. SOL (24.66 h) is used only for Mars. | D-02 |
| Pacing | A full mission is played in 10 minutes at 1x, which is 3.6 game hours per second. The player gives standing orders. Pause is always available. Speeds are 1x, 1.25x, 1.5x, 1.75x and 2x. The game pauses at every event. | D-04 |
| Dark intervals | Mostly sunlit, with dark intervals by difficulty: Cadet 48 h, Pilot 72 h, Commander 100 h. 100 h = 4 days 4 hours = 4.17 Earth days = 4.06 sols. No 14-day night. | D-03 |
| Difficulty | Cadet (Easy), Pilot (Medium, default), Commander (Hard). | D-09 |
| Gear | Twelve modules (Power 3, Life support 4, Safety 3, Systems 2). Payload cap 1,800 kg. Default load 1,300 kg. All twelve weigh 2,470 kg. Nothing is mandatory. | D-06 |
| Radiation | A hydrogen-rich liner is built into the Regolith Storm Shelter Vault. There is no suit-based radiation weave. | D-07 |
| Reactor | The Kilopower Fission Reactor is labeled planned technology. All its numbers are game values. | D-08 |
| Meters | Four lifelines (Oxygen, Water, Food, Power / heat) feed four summary meters (Life Support, Power, Shielding, Crew Health). | D-05 |
| Power shortage | When power is short, the game switches off the least important loads first: science, then rovers, communications and heating. Life support is the last to go. The keep-alive priority, highest first, is life support, heating, communications, rovers, science. | DR-01 |
| Crew | Four astronauts. Names and roles come from the NASA dataset. Placeholders: Sarah Chen (Flight engineer), Marcus Vance (Medical officer), Elena Rostova (Geologist), Tyler Hayes (Pilot). Each role has a main task and a backup task (03, section 3.4). | D-13 |
| Endings | Mission Complete (tasks done, crew alive), Crew Survived (crew alive at the end) or Try again. Minimum survivors to win is a config value, set to 1. Stars are a game assumption. | D-14 |
| Guidance | A What to do now bar, coach marks, an Explain tooltip on every meter, event cards with cost and risk, and a Help key. | D-15 |
| Architecture | Client-only. No backend, no database, no /api route. Rules live in src/game and never import Three.js or React. Data lives in src/config and public/data. | D-10, D-11 |
| Routes | #/landing, #/menu, #/name, #/explore, #/briefing/1-4, #/gear, #/hangar, #/destination, #/launch, #/outpost, #/hab, #/result, #/leaderboard. | D-12 |
| Labels | Every number is labeled Sourced, Calculated, Unverified or Game assumption. A DATA SOURCE tag shows what comes from the NASA dataset. The baseline is inspired by NASA sources, not NASA data. | D-17 |

## The document set

| # | Document | Owns | Read it if |
|---|---|---|---|
| 01 | Research Paper | The science: findings, planning numbers with confidence labels, events and trade-offs, open verification items. | You need to know where a number or a claim comes from, or you are writing science text or an Explain tooltip. |
| 02 | Briefing | The story of the game for players and judges: what ORBY is, how to play, controls, and the demo script. | You are new to the project, you are writing player-facing text, or you are preparing the demo. |
| 03 | GameFlow | Every game rule and number: time and pacing, state, the hourly tick, dependencies, gear, events, difficulty, scoring and endings. | You are building or tuning the simulation, the balance script, the events or the gear data. |
| 04 | AppFlow | The 13 routes, what each screen shows and does, the copy on each screen, app state and the screen build order. | You are building a screen, the router or the state store. |
| 05 | UXUI Design | Look and feel: tokens, type, components, layouts, the two themes, mockups of the key screens, accessibility and plain-language rules. | You are styling, designing assets, or checking that a screen is readable for ages 7 to 12. |
| 06 | Technical Stack | The stack, the architecture rules, the folder structure, the visual upgrades, testing, the two-day plan and the AI prompts. | You are writing code, setting up the repo, or planning the hackathon hours. |
| 07 | Backend Schema | The logical data model, the dataset onboarding steps, the table-to-client mapping and the optional leaderboard server. | The NASA dataset arrives and you must load, validate or map it. |

## 1. Decision summary

**ORBY is a client-only browser game** (D-10). The stack keeps what already works (React, Vite, Tailwind, a custom Three.js engine, a pure TypeScript rules module, procedural audio) and adds the upgrades that make the game look and behave like a professional 3D title: a post-processing pipeline, real GLB models with skeletal animation, a lunar lighting rig, a deterministic simulation and data-driven configuration. The NASA dataset plugs in through a static-file pipeline, not a database (D-11). A backend is optional and only for a shared leaderboard.

**The principle:** do not rebuild what already works. Upgrade what judges see in the first 30 seconds.

## 2. The stack at a glance

| Layer | Final choice | Why |
|---|---|---|
| Language | TypeScript, strict mode | One language for engine, rules, UI and scripts |
| UI shell | React 19 and Vite | Fast builds, already working |
| Styling | Tailwind CSS v4 and CSS variable tokens (document 05) | Matches the ORBY design system |
| 2D motion | Framer Motion | Screen and modal motion |
| Navigation | A typed screen state machine and hash routes (13 routes, document 04) | No router library needed |
| Player profile | localStorage, key `orby.profile.v1`. Saved run: `orby.run.v1` | No backend needed |
| 3D core | Custom Three.js `GameEngine.ts` (WebGL2), scenes built in code | Full control of the game loop and no React re-render cost |
| Post-processing | `postprocessing` library: bloom, vignette, chromatic aberration, ACES tone mapping, SMAA | The biggest realism upgrade for the least work |
| 3D models | GLB files through GLTFLoader with Draco or Meshopt compression, edited in Blender, optimized with gltf-transform | Real astronauts, habitat and rocket instead of procedural shapes |
| Character animation | Three.js AnimationMixer with skeletal clips (idle, walk, work) | Believable crew movement |
| Materials | PBR textures (albedo, normal, roughness, metallic, emissive), baked AO | Suits, regolith and glass read as real |
| Terrain and scatter | Heightmap terrain, PBR regolith, InstancedMesh rocks and craters | Dense detail at low cost |
| Audio | Procedural Web Audio `SpatialAudioManager` | Zero audio files, 3D panning |
| Game rules | Pure TypeScript `survivalRules` with a seeded random generator (mulberry32) and a fixed time step | Testable, replayable, fair for Compete |
| Configuration | `src/config` modules and JSON files in `public/data` | Every rate and threshold is data, so NASA data can drive it |
| Dataset pipeline | `nasaDatasetAdapter`, Zod validation and a normalize script (tsx and papaparse) | Handles any file shape without touching game code |
| Tests | Node test runner and a balance script over many seeds | Catches AI-introduced regressions |
| Visual QA | Playwright click-through with screenshots | Finds dead buttons and console errors |
| Fonts and icons | `@fontsource` (Unbounded, Inter, JetBrains Mono) and `lucide-react` | Works offline |
| Hosting | Vercel or Netlify (static), plus a local copy | Free link, no server to fail during judging |
| Backend | None. Optional Supabase for a shared leaderboard only (document 07) | Stretch goal |
| Tooling | ESLint, Prettier, git with a tag per gate | Safe rollback during AI-assisted coding |

**Pin the versions** in `package.json` and commit the lock file, so a fresh clone builds the same game.

### Not used, and why

| Not used | Reason |
|---|---|
| react-three-fiber and drei | The custom engine works. Moving means a rewrite, and React re-renders can hurt the game loop. Plain Three.js offers everything ORBY needs. |
| Supabase or Firebase as the game backend | The game is client-side. A document database adds nothing without a backend. Supabase is only for an optional shared leaderboard. |
| A custom API or an `/api` route | The NASA data arrives as files and is read from `public/data` (D-11). |
| React Router and Zustand | The screen state machine does the job. Add a small store only if the app state becomes unmanageable. |
| Howler and audio files | Procedural audio works and has no download cost. |
| WebGPU renderer | Promising, but too risky for two days. Stay on WebGL2. |
| Vitest | The Node test runner already does the same job. |

## 3. Architecture

### 3.1 Layers

```text
 NASA dataset files  -->  normalize script  -->  public/data/*.json
                                                       |
                                           nasaDatasetAdapter (Zod)
                                                       |
                                                       v
   config (src/config) ----------------->  survivalRules (pure rules, seeded)
                                                       |
                                          game state + event log
                                               |              |
                                               v              v
                               GameEngine + scenes (Three.js)   React HUD overlays
                               + post-processing + GLB models   (visor, modals, screens)
                                               |
                                               v
                                        SpatialAudioManager
```

### 3.2 Folder structure

```text
src/
  config/      missionBrief.ts, graphics.ts, assets.ts, difficulty.ts, gearEffects.ts, clock.ts
  game/        survivalRules.ts, hints.ts, nasaDatasetAdapter.ts, profileStore.ts, screenRouter.ts, tests
  graphics/    GameEngine.ts, postfx/, assets/ (loaders), scenes/, terrain/
  audio/       SpatialAudioManager.ts
  components/  screens/, HUD/, common/
  styles/      tokens.css
  types/       game.ts, screens.ts
public/
  models/      *.glb (compressed)
  textures/    regolith, suit, metal maps
  data/        normalized NASA JSON and the game baseline
scripts/       normalize-dataset.ts, optimize-models.sh, balance.ts
```

### 3.3 Architecture rules

Paste these at the start of every AI session. They are the same rules as in the master prompt (section 10).

1. Game rules live only in `src/game` and never import Three.js or React.
2. Scenes and the engine only read game state and draw it. They never decide outcomes.
3. Every rate, threshold and multiplier is named in config or the dataset adapter, never typed inline.
4. Randomness inside rules comes from the seeded generator, never `Math.random`.
5. The simulation stores one counter: hours since landing. One tick is one game hour (document 03).
6. Show DAY X / 90 for the Moon. Use SOL only for Mars (Season 02).
7. Player-facing text lives in `src/config`, never in JSX.
8. Read the existing file before changing it. Do not rewrite working systems.
9. Every change ends with how to run it, how to test it, and what could not be verified.

### 3.4 UI components

MetalButton, GoldButton, GlassPanel, StepPills, ProgressPips, ResourceCard, GearCard, CounterChip, Toast and Modal, built on the tokens in document 05. Onboarding copy and numbers come from `src/config/missionBrief.ts` and match the research paper.

## 4. Making it look professional (in priority order)

The values are starting points to tune by eye. The look they aim for is in document 05, section 8.

### 4.1 Post-processing (about 1.5 hours)

- Use the `postprocessing` library with an EffectComposer: a render pass, then one effect pass combining bloom, vignette, chromatic aberration and ACES tone mapping, then SMAA anti-aliasing.
- Turn the renderer's own tone mapping off and apply it in the effect pass, so it is not applied twice.
- Bloom: moderate intensity (about 0.6 to 0.9) with a high luminance threshold (about 0.85), so only the sun, engine flames, LEDs and emissive screens glow.
- Vignette and chromatic aberration: subtle. Turn off chromatic aberration and shake when the player prefers reduced motion.
- Quality presets (low, medium, high) in `src/config/graphics.ts`, with an automatic downgrade if the frame rate stays under about 45 FPS for a few seconds.

### 4.2 Lighting rig (about 1 hour)

- Lunar surface: one hard directional sun with a tuned shadow map, very low ambient light and a faint cool fill for earthshine. No fog on the Moon.
- Sun direction and brightness follow the simulation's light phase: sunlit, or dark during a dark interval.
- Replace the placeholder studio environment with a dark space environment, so reflections on gold visors and metal stay crisp.
- Interiors (hangar and habitat): warm and cool practical lights, spotlights with soft shadows, and a few emissive panels that bloom.

### 4.3 Models and animation (about 3 hours)

Do the hero assets first: the astronaut, the habitat dome and the rocket. Everything else can stay procedural.

- **Source:** free low-poly CC0 packs, NASA's public 3D resources, or models made in Blender. Check the license of every download and record it in `src/config/assets.ts`. NASA insignia and logos have usage rules, so avoid them on models.
- **Pipeline:** Blender export to GLB, then optimize with gltf-transform (Draco or Meshopt compression, texture resize), then load with GLTFLoader.
- **Fallback:** always keep a procedural fallback, so a failed download never blocks the game.
- **Animations:** idle, walk (a low-gravity hop) and work, driven by AnimationMixer.
- **Budgets (tunable):** each hero model under about 2 MB, the first load under about 25 MB, and textures at 1024 or 2048 pixels.

### 4.4 Terrain and materials (about 2 hours)

- Heightmap terrain with craters, a PBR regolith material (normal and roughness maps) and instanced boulders.
- If the NASA dataset includes elevation or terrain data, drive the heightmap from it. That is a strong visible link between real data and the game.
- Dust particles when astronauts move or equipment operates. Dust on the solar panels is visible on the panels themselves.

### 4.5 Visor and HUD effects (about 1 hour)

- Keep the React visor HUD. Add a glass-curvature overlay, scanlines, glare and a short visor-boot animation when the outpost loads.
- Red-out and siren effects during solar storm alerts, with a visible tag such as DATA SOURCE: NASA when an event comes from the dataset.

### 4.6 Performance budget

- Target 60 FPS on the Lunar Outpost on a laptop with a real graphics card.
- Cap the pixel ratio (about 1.75 to 2), use InstancedMesh for repeated objects, dispose geometry, textures and materials when leaving a scene, and load levels lazily. The landing page and menu are DOM and CSS only.
- Add a debug overlay (`?debug=1`) showing frame time, draw calls and triangle count.
- A headless browser cannot confirm the real frame rate. Measure on the demo laptop before the event.

## 5. Simulation engineering rules

The rules themselves are in document 03. These are the engineering rules that keep them trustworthy.

- **Fixed time step.** Advance the simulation in fixed ticks of one game hour with an accumulator, independent of frame rate. Pause and the speeds 1x to 2x change how many ticks run per real second, not what a tick does.
- **Seeded randomness.** One seed per run, so the same choices give the same result. Required for a fair Compete mode and for reproducible bugs.
- **Rules as data.** Difficulty levels, gear effects, hazard tables and dependencies live in config, not in code.
- **Event log with reasons.** Every change records why it happened, so the HUD and the result screen can say why a number fell.
- **Balance script.** Run 90 days over many seeds for each difficulty with three simple bots (idle, sensible, reckless) and report survival rates. The starting targets are tunable: a sensible bot survives on Commander in most seeds, an idle crew fails on Commander, and a reckless bot scores clearly lower. Exit with an error if a target is missed.
- **Tests.** Keep all existing tests passing, and add tests for determinism, the fixed time step, the clock (600 s at 1x equals 2,160 ticks), the dataset adapter and the gear payload rules.

## 6. NASA dataset pipeline

The full onboarding steps and the table-to-client mapping are in document 07. In short:

1. Drop the raw files into a `data-raw` folder (not served).
2. Run `scripts/normalize-dataset.ts`. It reads CSV or JSON, converts units (hours, kg, kW) and writes clean files into `public/data`.
3. `nasaDatasetAdapter` loads the JSON and validates it with Zod. Unknown fields are kept, invalid rows are reported, and every missing value falls back to the built-in baseline, so the game never breaks.
4. The adapter exposes named parameters that the rules and the scenes read: storm frequency, thermal curves, oxygen burn rates, reactor output, dust rate and so on.
5. Show the data source in the visor (the DATA SOURCE tag) and on the debug panel, so judges can see where each number comes from.

Read from `/data/...`. A static Vite app has no `/api` route.

## 7. Testing and quality

| Test | Scope | Tool | Gate |
|---|---|---|---|
| Unit | Rules, dependencies, adapter, router, profile, gear payload, difficulty, clock | Node test runner | Every change |
| Determinism | Same seed and actions give the same result at 30, 60 and 144 FPS | Node test runner | G1 |
| Balance | 90 days, many seeds, three bots, three difficulties | `scripts/balance.ts` | G3 |
| End to end | Landing to result click-through, a screenshot per screen, fail on console errors or dead buttons | Playwright | G3, G4 |
| Performance | Frame time and draw calls with `?debug=1` on the demo laptop | Manual | G4 |
| Science review | Every number and label checked against the research paper | Research leads | G1, G4 |
| Usability | A child-level reading check of all player-facing text | Team | G3 |
| Accessibility | Keyboard, focus, reduced motion | Manual | G3 |

**Definition of Done.** A work package is done when its requirement IDs are met, unit tests pass, the end-to-end route still works, every number on screen has a label, and the change is committed, with a tag at each gate.

**Release acceptance.**

1. A first-time visitor goes from the landing page to the result screen without editing the URL, using hidden shortcuts or turning on dev flags, and never meets a dead end or a dead button.
2. Every claim in the briefing is true in the simulation.
3. The HUD meters match D-05.
4. No day counter or live telemetry appears before launch.
5. A full mission takes 10 minutes at 1x and ends in a win or a Try again screen with guidance. All tests pass, the build succeeds and the Lunar Outpost holds 60 FPS on the demo laptop.

### Security, privacy and licensing

- The audience is children. ORBY stores only a callsign and game progress in localStorage, uses no real authentication and adds no analytics without team approval.
- Record the license and attribution of every 3D model, texture and image in `src/config/assets.ts`. NASA insignia and logos have usage rules, so do not put them on models or screens.
- Record the dataset license in the manifest, and do not redistribute restricted data.
- Keep secrets out of the client. If a server is added, only the public key may appear in browser code.
- Label every scientific claim as real or game value (REQ-14).

## 8. The two-day plan

The dataset arrives on the day. Build everything that does not depend on it **before** the hackathon, on the game baseline. Do not start the next block until the gate for the current one passes.

### 8.1 Before the hackathon

1. **Run the audit (WP-02, action A-06).** Compare the repository with the Technical Documentation before changing anything. List what is built, partial and missing.
2. **Agree roles (A-07).** Solo: follow the timeline in order. A team of 2 to 4: one person on data and the adapter, one on rules and balance, one or two on front end and 3D, with one person also owning the guidance text and QA.
3. **Save the rules file.** Put the master prompt (section 10) in the repository as `CLAUDE.md` or `.cursorrules`, so every AI session starts with the same rules.
4. **Make a small fake dataset** in two shapes (one CSV and one JSON): 3 bodies, 12 gear modules, 5 events, 4 crew. Use it to test the normalize script and the adapter now, so on the day you only swap the data.
5. **Build the vertical slice on the baseline:** the canonical route from landing to result (document 04, build order B1 to B10), the 12 modules, the 10-minute clock, difficulty, events EV-01 to EV-05, guidance and the Try again screen.
6. **Write the balance script** (prompt Q5), so you can tune quickly when real numbers arrive.
7. **Check the science labels (A-05).** Every number on screen is labeled Sourced, Calculated, Unverified or Game assumption.
8. **Record licenses (A-12)** for every model, texture and image in `src/config/assets.ts`.
9. **Confirm logistics (A-08).** The hackathon date, the dataset format and the judging criteria. Laptops, chargers, accounts, a local build for offline use and a screen recording tool.

### 8.2 Day 1: data, rules and the look

| Time block | Task | Done when |
|---|---|---|
| Hour 0 to 1 | **Dataset recon.** Open every file. List entities, fields, units, id uniqueness and the license. Fill the mapping table (document 07). Decide what the dataset does not provide (usually gear effects and events). Use the checklist in section 9. | The mapping table is written and agreed |
| Hour 1 to 3 | **Normalize and validate.** Run `scripts/normalize-dataset.ts`. Extend the adapter and its Zod schemas (Q4). The names and roles of the four astronauts replace the placeholders (D-13). | Real data loads. **G2 part 1:** adapter tests pass and every parameter is tagged. |
| Hour 3 to 5 | **Author the missing rules as DRAFT rows:** gear effects and event options (prompts P2 and P4). A person reviews every number. | Every gear module has an effect. Every event has at least two options with a cost and a risk. |
| Hour 5 to 7 | **Run the balance script** on Cadet, Pilot and Commander. Tune one parameter at a time. Write down each change and the result. | **G1 and G3 part 1:** a sensible player survives on Commander and an idle crew does not. |
| Hour 7 to 8 | **Make the dataset matter on screen.** At least one visible behavior changes because of NASA data, for example a storm event with the DATA SOURCE tag. | **G2:** at least one behavior driven by real data |
| Evening | Post-processing and quality presets (Q1), lighting rig and hero GLB models (Q2, Q3). Commit and tag. | Bloom, vignette and tone mapping on every scene |

### 8.3 Day 2: polish, verify, ship

| Time block | Task | Done when |
|---|---|---|
| Morning | Terrain, instancing and visor effects (Q3). Player guidance and the Try again flow (P5, P6). The end-to-end flow with Playwright (Q6). | **G3:** landing to result works with no dead ends and no console errors |
| Midday | A performance pass on the demo laptop. Play a full 10-minute mission at 1x. Check the readability of all player text (reading level for ages 7 to 12). | 60 FPS on the outpost. A mission takes about 10 minutes and ends in a win or a Try again screen that explains why. |
| Early afternoon | Demo hardening (P7): demo seeds, README, offline test. Deploy to Vercel or Netlify, test the live link on a second device, and record a backup video. | The live link works on a second device |
| 3 hours before the deadline | **Code freeze (G4).** Bug fixes only. Write the demo script (document 02) and rehearse it twice. | A rehearsed demo and a backup video are ready |

**Cut list, in order:** Compete mode, landing carousel slides, Practice mode, events EV-09 to EV-13, terrain from real elevation data, then secondary models. **Never cut** the science labels, the vertical slice from landing to result, or the dataset moment.

### 8.4 Quality gates

| Gate | Exit criteria |
|---|---|
| **G0 Aligned** | Decisions approved, the as-built audit done, roles and owners assigned |
| **G1 Rules ready** | REQ-01 to REQ-09 met with unit tests, the determinism test passes, the science leads have reviewed the parameters |
| **G2 Data ready** | The dataset is normalized and loaded, every parameter is tagged, adapter tests pass, and at least one visible behavior is driven by real data |
| **G3 Vertical slice** | Landing to result works end to end, balance targets are met, and the usability and accessibility checks have passed |
| **G4 Demo freeze** | Performance is verified on the demo laptop, the hosted build is live and tested on a second device, the backup video is recorded and the code is frozen |

### 8.5 Work packages

The work package (WP) numbers used in this set. Size is a planning assumption: S under half a day, M half to one day, L one to two days. "Must" work is protected by the cut list. The as-built status of each package is confirmed by the audit (WP-02).

| WP | Package | Delivers | Requirements | Priority | Size |
|---|---|---|---|---|---|
| WP-01 | Decision approval | All decisions recorded and approved | | Must | S |
| WP-02 | Repository audit | As-built report: code versus these documents | | Must | S |
| WP-03 | Shell: router, tokens, profile | Hash routes, shared components | | Must | M |
| WP-04 | Landing, Menu, Enter Name | Three screens | | Must | M |
| WP-05 | Briefing steps 1 to 4 | `missionBrief` config with research-aligned copy | REQ-13 | Must | M |
| WP-06 | Mission gear | Twelve modules, payload meter, effects | REQ-05, 10, 11 | Must | L |
| WP-07 | Simulation core | Hourly tick, 10-minute pacing, seeded random, dependencies, dust, darkness | REQ-01 to 07 | Must | L |
| WP-08 | Events and decisions | EV-01 to EV-05 first, then EV-06 to EV-08 | REQ-08, 09, 12 | Must | L |
| WP-09 | Dataset pipeline | Normalize script, adapter, validation, data tag | REQ-04, 14, 15 | Must | L |
| WP-10 | Pre-flight and visor HUD | HUD split, four meters, Explain tooltips | REQ-02, 13 | Must | M |
| WP-11 | 3D flow wiring | Hangar, destination, launch, outpost, habitat | | Must | M |
| WP-12 | Visual upgrade | Post-processing, lighting, hero models | | Should | L |
| WP-13 | Solar System modes | Explore, ambient, destination | | Should | M |
| WP-14 | Difficulty and balance | Config and balance script | REQ-05 | Should | M |
| WP-15 | Result and leaderboard | Endings per D-14, local top 10 | REQ-16 | Should | M |
| WP-16 | Practice and Compete | Guided 10-day run, seeded ranked run | | Could | M |
| WP-17 | Quality assurance | Unit, end-to-end, performance, accessibility | | Must | M |
| WP-18 | Science review | Sign-off of numbers and labels | REQ-10, 11, 14 | Must | S |
| WP-19 | Demo and release | Hosted build, demo script, backup video | | Must | M |
| WP-20 | Player guidance and Try again flow | What to do now bar, coach marks, Explain tooltips, plain-language event cards, win and Try again screens | REQ-13, REQ-21 | Must | M |
| WP-21 | Mission clock and speed controls | 10-minute pacing, pause, speeds 1x to 2x, automatic pauses at events | REQ-22 | Must | M |

The build steps B1 to B11 in document 04 are the order for the app. The work packages are the units for the team.

## 9. Hackathon-day checklist with checks

The data files are JSON in `public/data`. The `jq` commands assume arrays and the field names shown. Change the names to match your files.

**Step 1. Read the data.** List every file, entity, field, unit and the license. Record them in the dataset manifest. Check: nothing is copied from a source whose license limits sharing (A-12).

**Step 2. Normalize.** Run `npx tsx scripts/normalize-dataset.ts`. Check: it finishes without errors, writes files to `public/data`, and prints counts per entity that match the source files.

**Step 3. Validate.** Start the game with `?debug=1`. Check: the adapter reports zero invalid rows, or each invalid row is explained, and the debug panel shows for every parameter whether it came from the dataset or the baseline. Bad input must never crash the game.

**Step 4. Check the gear data.**

```bash
# 12 modules
jq 'length' public/data/gear.json

# modules with no effect (expect [])
jq -c '[.[] | select((.effects // []) | length == 0) | .name]' public/data/gear.json

# mass of the default loadout (expect 1300)
jq '[.[] | select(.defaultPacked) | .massKg] | add' public/data/gear.json

# mass of all modules (expect 2470)
jq '[.[] | .massKg] | add' public/data/gear.json
```

**Step 5. Check the events.**

```bash
# events with fewer than two options (expect [])
jq -c '[.[] | select((.options // []) | length < 2) | .code]' public/data/events.json

# options missing a cost or a risk (expect 0). REQ-12: every option has both.
jq '[.[] | .options[]? | select((.cost // {}) == {} or .risk == null)] | length' public/data/events.json
```

**Step 6. Tune the balance.** Run `npx tsx scripts/balance.ts`. Never tune by feel alone: change one parameter, re-run, write down what changed. Targets (tunable, the same as document 03, section 13): at least one loadout within 1,800 kg survives 90 days with sensible orders; a sensible bot survives on Commander in most seeds; an idle crew fails on Commander; a reckless crew scores clearly lower than a sensible one. Also check that a typical mission shows about 6 to 12 event cards. Check the dark-period lengths: Cadet 48 h, Pilot 72 h, Commander 100 h.

**Step 7. Play one full mission at 1x.** Check: it takes about 10 minutes (600 seconds, 3.6 game hours per second). Pause does not count. The game stops at every event. At 2x it takes about 5 minutes. It ends in Mission Complete, Crew Survived or a Try again screen with a plain reason.

**Step 8. Check labels and guidance.** Check: every number has its label, the DATA SOURCE tag shows, every meter has an Explain tooltip, the What to do now bar always shows a sensible line, and the Help key `?` works while paused.

## 10. Prompts for AI-assisted coding

Paste the **master prompt** first and keep it as the rules file. Then give the AI **one task prompt at a time**, test, commit and move on. When something breaks, paste the exact error and ask for the smallest fix. Do not let the AI change a data shape silently: ask for the change, then read it.

Prompts **Q1 to Q6** cover graphics, assets, the adapter, determinism and QA. Prompts **P1 to P7** cover the gameplay decisions.

| Prompt | Work package | Decisions |
|---|---|---|
| Q1 Post-processing, Q2 GLB assets, Q3 Lighting and terrain | WP-12 | Section 4 |
| Q4 Dataset adapter, Q5 Deterministic simulation and balance, Q6 Performance and QA | WP-09, WP-07, WP-17 | Sections 5 to 7 |
| P1 Mission clock, pacing and speed | WP-21 | D-02, D-04 |
| P2 Gear modules and payload | WP-06 | D-06, D-07, D-08 |
| P3 Difficulty, dark intervals and dependencies | WP-07, WP-14 | D-03, D-09, DR-01 to DR-07 |
| P4 Events and event cards | WP-08 | REQ-12, EV-01 to EV-14 |
| P5 Player guidance | WP-20 | D-15 |
| P6 Endings, stars and results | WP-15 | D-14 |
| P7 Demo hardening | WP-19 | G4 |

### Master prompt (rules file)

```text
You are a senior game engineer with experience in simulation games and deterministic game loops. You are helping me build ORBY, an educational browser 3D space-survival game for ages 7 to 12, in a 2-day hackathon. Speed matters, but correctness of the simulation and of the science labels matters more.

Product: the player commands 4 astronauts for 90 Earth days at the Moon's south pole. A full mission is played in 10 minutes at 1x speed. The player keeps oxygen, water, food and power above zero, handles events, and wins by finishing the mission tasks (Mission Complete) or keeping the crew alive to the end (Crew Survived). Otherwise the game shows Try again with a plain explanation.

Stack: React 19, TypeScript (strict), Vite, Tailwind v4, a custom Three.js engine (src/graphics/GameEngine.ts, WebGL2), procedural Web Audio, Node test runner, Playwright. The game is client-only: no backend, no database and no /api route. Data lives in src/config and public/data.

Architecture rules:
1. Game rules live only in src/game and never import Three.js or React.
2. Scenes and the engine only read game state and draw it. They never decide outcomes.
3. Every rate, threshold and multiplier is named in config or the dataset adapter, never typed inline.
4. Randomness inside rules comes from the seeded generator (mulberry32), never Math.random.
5. The simulation stores ONE counter: hours since landing. One tick is one game hour. A 90-day mission is 2,160 ticks. Use a fixed time step with an accumulator, independent of frame rate.
6. Show DAY X / 90 for the Moon. Use SOL only for Mars (Season 02). HOURS_PER_DAY = 24 and HOURS_PER_SOL = 24.66 live in config. Never call a Moon day a sol.
7. Difficulty is Cadet (Easy), Pilot (Medium, default) and Commander (Hard), with dark intervals of 48, 72 and 100 hours.
8. Gear is 12 modules with a payload cap of 1,800 kg. Gear never soft-locks the game.
9. Every number shown to the player carries a label: Sourced, Calculated, Unverified or Game assumption. Show a DATA SOURCE tag where a value comes from the dataset.
10. Every rule writes a reason into the event log, so the HUD can say why a number changed.
11. All player-facing text uses short sentences and simple words (ages 7 to 12). Copy lives in src/config, never in JSX.
12. Read the existing file before changing it. Do not rewrite working systems. Keep the existing tests passing.
13. If something is ambiguous, pick a sensible default, add a TODO(confirm) comment, and list all TODO(confirm) items at the end.

Reply format for each task: 1) short plan, 2) code, 3) how to run it, 4) how to test it, 5) what could not be verified.
```

### P1: Mission clock, pacing and speed (D-04)

```text
Task: implement the 10-minute mission clock with pause and speed controls. Read src/game and the HUD components first and do not rewrite working systems.

Rules:
- The simulation stores hoursSinceLanding (0 to 2,160). One tick is one game hour, advanced with a fixed time step and an accumulator.
- At 1x the mission clock runs 600 seconds for 2,160 game hours, which is 3.6 game hours per second. Put MISSION_SECONDS = 600 and TOTAL_HOURS = 2160 in config.
- Speeds are a config array [1, 1.25, 1.5, 1.75, 2]. Pause is always available. Paused time, event decisions and the Help screen stop the mission clock.
- The game pauses automatically at every event and decision until the player chooses.
- The HUD shows a mission timer with mission time left (10:00 at the start). At 2x it drops two seconds per real second. Show DAY X / 90 from floor(hours / 24) + 1.
- Remove any "+5 hours", "+1 sol", "+5 sols" or "end day" control. The player gives standing orders to each astronaut, and the HUD flags an order that needs review, for example a tired astronaut.

Acceptance and tests (use a fake clock, not real time):
- 600 simulated seconds at 1x produce 2,160 ticks. At 2x, 300 seconds produce 2,160 ticks. Paused time produces none.
- The same seed and the same orders give an identical result at 30, 60 and 144 FPS.
- 100 hours reads as 4 days 4 hours (4.17 days).
- All existing tests pass and the build succeeds.
```

### P2: Gear modules and payload (D-06, D-07, D-08)

```text
Task: build the Mission Gear screen and data for the twelve modules. Read the current gear code and src/config/gearEffects.ts first.

Data (public/data/gear.json, or the baseline in config until the dataset arrives). Fields: id, category, name, massKg, defaultPacked, coversLifeline, plannedTech, label, effects[] (each with status draft or active):
Power: Deployable Solar Array 220 kg packed; Solid-State Battery Bank 200 kg packed; Kilopower Fission Reactor 600 kg not packed (plannedTech).
Life support: Urine and Condensate Water Recycler 250 kg packed; Water Electrolysis O2 Generator 180 kg packed; CO2 Removal and Reduction Unit 160 kg packed; Hydroponic Growth Chamber 120 kg not packed.
Safety: Regolith Storm Shelter Vault 200 kg packed (hydrogen-rich liner); Advanced Dosimeter and Solar Warning Array 50 kg not packed; Medical Kit and Treatment Bay 90 kg packed.
Systems: Modular Avionics Pump Spare Kit 100 kg not packed; Lunar Rover 300 kg not packed (about 500 W while in use).
The masses of the CO2 unit, medical kit and rover and the 1,800 kg cap are game assumptions: label them so.

Screen: category filter All 12, Power 3, Life support 4, Safety 3, Systems 2. A payload meter "MASS 1,300 / 1,800 kg". Block adding an item over the cap with a plain message. If a lifeline (power, water, oxygen, food) has nothing packed, warn but allow Continue. The reactor shows a "Planned technology" tag. Cards work with keyboard and touch.

Simulation links: the packed modules drive production, consumption and storage in the rules. The CO2 unit stops CO2 rising and returns part of the oxygen (base 42%). The medical kit enables event EV-14. The rover raises dust on panels. The dosimeter gives earlier storm warnings. The reactor gives constant output.

Acceptance and tests: the default loadout is 1,300 kg; all twelve are 2,470 kg; defaults plus the reactor (1,900 kg) are rejected; swapping the solar array for the reactor (1,680 kg) is accepted; leaving out the recycler shows a warning and still continues.
```

### P3: Difficulty, dark intervals and dependencies (D-03, D-09)

```text
Task: implement the three difficulty levels, the dark intervals and the dependency rules. Read src/game/survivalRules.ts and its tests first.

Difficulty config (src/config/difficulty.ts): Cadet (Easy), Pilot (Medium, default), Commander (Hard). Each sets starting reserves, resource burn multiplier, hazard frequency, failure severity, the dark interval length in hours (48, 72, 100) and the grace period in hours before a lifeline at zero ends the run. Use these starting values and keep them tunable: starting reserves 1.25 / 1.0 / 0.8, burn 0.85 / 1.0 / 1.15, hazards 0.7 / 1.0 / 1.4, severity 0.7 / 1.0 / 1.3, grace 48 / 24 / 12.

Light and dark: the south pole is mostly sunlit, with dark intervals of up to the difficulty's length. Put the schedule in config. Sun direction and solar output follow the phase. The HUD shows, for example on Pilot, "Dark period in 3 days 6 hours, lasts up to 3 days", using both units where it helps (100 hours is 4.17 Earth days).

Dependency rules, each writing a reason to the event log:
DR-01 If power is below demand, shed the least important loads first: science, then rovers, communications and heating. Life support is shed last (keep-alive priority, highest first: life support, heating, communications, rovers, science).
DR-02 Water recovery needs power. Without it the recycler pauses and water comes from reserves.
DR-03 Oxygen generation needs power and water. Low water reduces oxygen.
DR-04 CO2 removal needs power. If offline, CO2 rises and crew health falls.
DR-05 Dust on panels lowers solar output. An EVA clears it and costs oxygen, suit energy and crew time.
DR-06 A radiation alert forces crew outside to abort or accept dose. A dosimeter warns earlier.
DR-07 Without heating power the cabin cools and crew health falls.

Acceptance and tests: one test per rule; a 10 kW average load needs 1,000 kWh over 100 hours, 720 kWh over 72 hours and 480 kWh over 48 hours, so a solar-only loadout on Commander must shed load or use the reactor; the briefing claims (dust reduces solar, the recycler pauses on low power, and so on) are true in the simulation.
```

### P4: Events and event cards (REQ-12)

```text
Task: build the event system and the event card. Events live in public/data/events.json (baseline in config until the dataset arrives).

Build EV-01 to EV-05 first: solar storm during an EVA; lunar dust in the airlock; water recycler fails or clogs; dust on solar panels; long darkness up to 100 hours. Then EV-06 to EV-08 and EV-14: CO2 scrubber fails (needs the CO2 unit); oxygen generator trips; battery critical; crew illness or injury (needs the medical kit). EV-09 to EV-13 only if time allows.

Rules: every option has at least one cost and one risk, and the Zod schema rejects an option without them. No option is strictly better than another. An event that needs a module (EV-06, EV-13, EV-14) fires only if that module is packed. Probabilities are per game day, scaled by difficulty. The game pauses when an event fires.

Event card (plain words): what happened, why it matters, and each choice with its cost and risk in one line. Add an Explain button with the real NASA fact. Tag the card with DATA SOURCE when the event comes from the dataset.

Acceptance and tests: determinism (same seed, same events); an event lasting several hours; cascades from an unresolved event; options cannot be created without a cost and a risk.
```

### P5: Player guidance (D-15, REQ-21)

```text
Task: build the player guidance system. The game must be easy to understand and navigate for ages 7 to 12.

Build:
- A "What to do now" bar that always shows one line with the most useful next step, for example "Power is low. Turn off the rover." Put the hint logic in src/game/hints.ts (pure, tested) and all text in src/config/missionBrief.ts.
- Coach marks (arrows and short tips) the first time the player meets the meters, the crew dock, pause and speed, and event cards. Save "seen" in the profile. Practice mode shows them all.
- An Explain tooltip on every meter, event and dark-period timer: one sentence, the real NASA fact, and the other unit of time where it applies.
- A Help button and the ? key that reopen the briefing and a controls guide, and work while paused.
- Visible pause, speed and camera buttons, with keyboard shortcuts listed in Help.
- Plain difficulty labels: Cadet (Easy), Pilot (Medium), Commander (Hard).

Rules: short sentences, familiar words, one idea per message, science terms explained on first use, icons never carry meaning alone, tap targets at least 44 px.

Acceptance and tests: every meter and event has an Explain entry; every low-lifeline state produces a hint; the Playwright click-through finds no dead buttons; reduced motion is respected.
```

### P6: Endings, stars and results (D-14)

```text
Task: build the three endings, the stars and the result screens.

Win: Mission Complete (mission tasks done, crew alive) or Crew Survived (crew alive at the end, tasks not all done). Try again: the whole crew is lost, or a lifeline stays at zero past the grace period. The minimum survivors needed to win is a config value, set to 1.

Stars (game assumption, in config): three for tasks done with all four astronauts alive, two for all four alive, one for at least one alive.

Try again screen: a plain-language reason taken from the event log (for example "Power ran out during the dark period, so the recycler stopped"), one thing to try next time, and a Try again button.

Result screen also shows the five-part score (crew survival, crew health, resource margin, science, objectives), a short chart of the four lifelines, and the real NASA fact that matches the main event. Buttons go to the leaderboard or the menu. The local top 10 stores callsign, difficulty, stars and score, and only Compete and Game Start runs are saved.

Acceptance and tests: one test per ending; the Try again reason always names a logged cause; a refresh mid-mission offers Resume or Menu.
```

### P7: Demo hardening (G4)

```text
Task: prepare the demo.
- Add two demo seeds behind a flag (?demo=good and ?demo=drama): a guaranteed-good run with a sensible loadout, and a dramatic one (a dust storm on day 14 with power already low). Show the flag only in ?dev=1.
- Add a ?dev=1 jump to a chosen game hour for rehearsal. It is disabled in the production build.
- Add npm run demo-check that runs the unit tests, the balance script, the build and the Playwright click-through, and fails on any error.
- Verify the static build runs offline from a local copy (fonts self-hosted, audio procedural).
- Write a one-page README: run, build, test, deploy, reset, demo steps and troubleshooting. Write UX_FLOW.md from the App Flow spec.
Acceptance: from a fresh clone, one command shows a working demo in under 2 minutes, and the live link works on a second device.
```

### Q1: Post-processing pipeline (WP-12)

```text
Task: add a post-processing pipeline to the existing engine. Read src/graphics/GameEngine.ts first and do not rewrite working systems.
Use the postprocessing package (works with plain Three.js). Build an EffectComposer with a render pass, then one effect pass combining bloom, vignette, subtle chromatic aberration and ACES tone mapping, then SMAA. Turn off the renderer's own tone mapping so it is not applied twice.
Put all values in src/config/graphics.ts with low, medium and high presets. Auto-downgrade the preset if frame rate stays under 45 FPS for 3 seconds. Support ?fx=off. Disable chromatic aberration and camera shake when prefers-reduced-motion is set. Dispose everything when a scene is left.
Acceptance: bloom affects only bright emissive objects (sun, flames, LEDs, screens); raycasting and camera controls still work; the build passes; all existing tests pass. Tell me how to tune each value.
```

### Q2: GLB asset pipeline (WP-12)

```text
Task: add a GLB loading pipeline with procedural fallbacks.
Create src/graphics/assets/AssetLoader.ts using GLTFLoader with Draco or Meshopt decoding, caching, and a progress callback. Create src/config/assets.ts listing every asset with path, source, license and attribution. If a file is missing or fails, use the existing procedural builder so the game never breaks.
Astronauts: load the GLB, use AnimationMixer with idle, walk and work clips, and keep the existing LED health strip, head tracking and dossier interactions working.
Add scripts/optimize-models.sh using gltf-transform (compress, resize textures). Add a loading screen with a progress bar. Budgets: each hero model under 2 MB, total first load under 25 MB (tunable); warn in the console if exceeded.
Acceptance: with the GLBs removed the game still runs; with them present the astronauts animate and the habitat and rocket use the new models.
```

### Q3: Lunar lighting and terrain (WP-12)

```text
Task: upgrade the Lunar Outpost visuals. Read src/graphics/scenes/LunarSurfaceScene.ts first.
Lighting: one hard directional sun with a tuned shadow map, very low ambient, a faint cool earthshine fill, no fog, a dark space environment map. Sun direction and brightness must follow the simulation's light phase: sunlit, or dark during a dark interval.
Terrain: heightmap terrain with craters, a PBR regolith material (normal and roughness maps), instanced boulders (InstancedMesh), and dust particles when crew move. If the dataset adapter provides an elevation grid, use it for the heightmap; otherwise use a procedural noise heightmap.
Keep all crisis effects (storms, steam, beacons) working. Aim for 60 FPS on a laptop with a real GPU and say clearly what you could not verify.
Acceptance: a dark interval is truly dark and lit only by base lights; shadows are crisp; draw calls stay low (show the count in ?debug=1).
```

### Q4: Dataset adapter (WP-09)

```text
Task: build the dataset pipeline. Read src/game/nasaDatasetAdapter.ts first and keep its interface.
Create scripts/normalize-dataset.ts (tsx, papaparse) that turns raw CSV or JSON files into clean JSON in public/data with units converted in one place (hours, kg, kW). Update the adapter to load from /data/... (not /api), validate with Zod, keep unknown fields, report invalid rows, and fall back to the built-in baseline for anything missing.
Expose every rate as a named parameter used by the rules and the scenes (storm frequency, thermal curve, oxygen burn, reactor output, dust rate). Add a debug panel (?debug=1) listing each parameter and whether its value came from the dataset or the baseline. Show a DATA SOURCE tag in the visor when an event comes from the dataset.
Acceptance: running the normalize script on a sample file changes at least one visible behavior without touching game code; bad input never crashes the game; adapter tests pass.
```

### Q5: Deterministic simulation and balance (WP-07, WP-14)

```text
Task: harden the simulation. Read src/game/survivalRules.ts and its tests first.
Add a seeded random generator (mulberry32 or similar) and a fixed time step with an accumulator, so the same seed and choices always give the same result regardless of frame rate. The simulation stores hours since landing, and one tick is one game hour. Move difficulty, gear effects and hazard tables into src/config. Make every rule write a reason into the event log.
Verify the briefing claims are true in the simulation: dust reduces solar output and an EVA cleans it; the recycler pauses on low power; water reserves drop when recycling stops; a dark interval depends on batteries or the reactor. Fix any missing link minimally.
Write scripts/balance.ts: run 90 days (2,160 ticks) over 200 seeds per difficulty with idle, sensible and reckless bots and print survival rate, median failure day and top failure causes. Exit with code 1 if a target is missed (tunable: a sensible bot survives on Commander in most seeds, an idle crew fails on Commander, a reckless bot scores clearly lower).
Acceptance: all existing tests plus new determinism tests pass.
```

### Q6: Performance and end-to-end QA (WP-17)

```text
Task: performance pass and click-through verification.
Add a ?debug=1 overlay (frame time, draw calls, triangles, texture memory). Check that every scene disposes geometry, textures and materials when left, that levels load lazily, that repeated objects use InstancedMesh, and that the pixel ratio is capped.
Write a Playwright script that walks the full route from Landing to Result, takes a screenshot at each screen, and fails on any console error or dead button. Run npm test and npm run build.
Report honestly: frame rate measured in a headless browser is not real GPU performance, so list what must still be checked on the demo laptop.
```

## 11. Risks and fallbacks

| Risk | What to do |
|---|---|
| **The dataset does not match the plan, or arrives late** (R-01) | The adapter falls back to the baseline and the debug panel shows what is real. Pick one or two datasets to make visibly matter, and author the rest as DRAFT rows (P2, P4). |
| **No effects or event data** | Use the team-authored DRAFT rows, label them as game assumptions on screen, and tune them with the balance script. |
| **A 10-minute mission feels rushed** (R-13, about 6.7 seconds per game day at 1x) | Rely on standing orders and automatic pauses at events, and playtest at 1x. The pacing is a config value. |
| **Players pause for a long time** (R-14) | Pauses stop the mission clock by design. Add an idle reminder. |
| **Post-processing hurts the frame rate** (R-04) | Use the quality presets and `?fx=off`. Lower the bloom resolution first. |
| **Free models look inconsistent or have unclear licenses** (R-11) | Use fewer models, keep the procedural look for the rest, and record every license. |
| **AI edits break working screens** (R-05) | Commit after every task, tag at each gate, and run the tests and the Playwright click-through after every change. |
| **Behind schedule** | Follow the cut list and protect the vertical slice from landing to result. |
| **Venue Wi-Fi or hosting fails** (R-12) | The build is static with self-hosted fonts and procedural audio, so it runs offline from a local copy. Keep the backup video ready. |
| **A scientific error reaches players** (R-03) | Decisions D-02, D-07 and D-08, the labels, and the science review at G1 and G4. |

## 12. What to bring to the first session with the AI tool

The master prompt (section 10), documents 03 and 04 (and 07 for the data work), the Figma screenshots or the mockups in document 05, and the dataset files. Give the AI only what the current task needs, and paste small samples of the dataset, not whole files.
