# ORBY 05: UXUI Design

*Visual system and screen mockups · Document 5 of 7 · Version 1.1 · November 14, 2026 · Hackathon edition*

| | |
|---|---|
| This document owns | Look and feel: tokens, type, components, layouts, the two themes, mockups of the key screens, accessibility and plain-language rules. |
| Read it if | You are styling, designing assets, or checking that a screen is readable for ages 7 to 12. |
| It defers to | Behavior and routes (04), rules (03), code structure (06). |

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

## 1. Design goals

1. **Readable at a glance, by a child.** Every screen has one clear thing to do. A child aged 7 to 12 should know what to do next without help.
2. **One product, two themes.** The **ORBY theme** covers the landing page, menu, name, explorer, briefing, gear and result screens. The **Visor HUD theme** covers the pre-flight hangar and the mission. Both use the same tokens (color, type, spacing, radius, blur and focus ring), so they feel like one product.
3. **Never color alone.** Every state has an icon, a word and a color. Charts use line styles as well as colors.
4. **Honest labels.** Every number shows whether it is Sourced, Calculated, Unverified or a Game assumption. A DATA SOURCE tag shows what comes from the NASA dataset.
5. **A pro look in the first 30 seconds.** The first 3D scene the player sees must look finished (goal G3). Flat UI is simple and clean, and the 3D scenes carry the wow.
6. **Fast and offline.** Fonts and icons are self-hosted, sound is generated in the browser, and nothing loads from a network at play time.

This document replaces the earlier UX/UI Design artifact. That one used a different font, six gear items with a 600 kg limit, and an "End day" button, none of which are in the game now.

## 2. Design tokens

All tokens are CSS variables defined once in `src/styles/tokens.css`. Tailwind v4 reads them through `@theme`. The contrast numbers below were calculated with the WCAG formula.

### 2.1 Color

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--bg` | `#0A0F24` | Page background | Text on it: 16.2 to 1 |
| `--bg-glow` | `#1B1550` | Purple glow behind menus | Decoration |
| `--card` | `#171F4D` | Cards and panels | Text on it: 13.3 to 1 |
| `--card-raised` | `#1F2960` | Selected or raised card | Decoration |
| `--hud` | `#0F1530` | HUD panels (at 78% opacity over the scene) | Text on it: 15.3 to 1 |
| `--border` | `#2B3366` | Quiet dividers (1.6 to 1: decoration only) | Not for controls |
| `--border-strong` | `#5A66B0` | Control outlines, bars, focus of inputs | 3.6 to 1 on `--bg` |
| `--text` | `#E8ECFF` | Main text | See above |
| `--muted` | `#A9B3D8` | Supporting text | 9.2 to 1 on `--bg`, 7.6 to 1 on `--card` |
| `--amber` | `#FFB020` | Primary actions, highlights, WARNING | 10.4 to 1 on `--bg` |
| `--on-amber` | `#1A1205` | Text on amber buttons | 10.1 to 1 on amber |
| `--teal` | `#2DD4BF` | OK, success, Sourced | 8.4 to 1 on `--card` |
| `--blue` | `#5AA9FF` | Information, Calculated, focus ring | 6.4 to 1 on `--card` |
| `--orange` | `#FF7A45` | Planned technology, Try again | 6.1 to 1 on `--card` |
| `--red` | `#FF5D5D` | CRITICAL, EMPTY, blocked | 5.2 to 1 on `--card` |
| `--purple` | `#7C5CFF` | Decoration and fills only (3.6 to 1) | Not for text |
| `--purple-light` | `#A592FF` | Game assumption text and outlines | 6.1 to 1 on `--card` |

**Rule.** Text and icons that carry meaning must reach 4.5 to 1 (text) or 3 to 1 (icons and control outlines). `--purple` and `--border` fall short, so they are used only for decoration.

### 2.2 Type

| Role | Font | Weight | Size | Use |
|---|---|---|---|---|
| Display | Unbounded | 700 | 44 to 56 px | Screen titles, DAY counter, result titles |
| Heading | Unbounded | 600 to 700 | 22 to 32 px | Card and event titles |
| Body | Inter | 400 and 600 | 16 to 18 px | Sentences, descriptions, button labels (17 px, 700) |
| Small | Inter | 400 and 600 | 14 px | Supporting lines |
| Tag and chip | Inter | 700, uppercase | 12 px | Labels that repeat what is shown elsewhere |
| Numbers | JetBrains Mono | 500 and 700 | 14 to 44 px | Meters, mass, time, scores |

Fonts are self-hosted from `@fontsource` packages (`unbounded`, `inter`, `jetbrains-mono`), so the game works offline. Text that carries a decision is at least 14 px. A 12 px chip or tag never carries a decision alone.

### 2.3 Space, shape and effects

| Token | Value |
|---|---|
| Spacing scale | 4, 8, 12, 16, 24, 32, 48 px |
| Radius | Chip 999 px, button 14 px, card and modal 16 px |
| Tap target | At least 44 by 44 px (the mockups use 44 to 48 px) |
| HUD glass | `rgba(15,21,48,.78)`, a 1 px border `rgba(90,169,255,.45)`, a 6 px background blur |
| Focus ring | 3 px `--blue` with a 2 px offset, on every control |
| Primary button | `--amber` fill, a 6 px solid lower edge for a pressable look |
| Hard shadow (menu only) | 6 px by 6 px, no blur, for the pixel-style menu buttons |

A starter block for `tokens.css`:

```css
:root {
  --bg:#0A0F24; --bg-glow:#1B1550; --card:#171F4D; --card-raised:#1F2960; --hud:#0F1530;
  --border:#2B3366; --border-strong:#5A66B0; --text:#E8ECFF; --muted:#A9B3D8;
  --amber:#FFB020; --on-amber:#1A1205; --teal:#2DD4BF; --blue:#5AA9FF;
  --orange:#FF7A45; --red:#FF5D5D; --purple:#7C5CFF; --purple-light:#A592FF;
  --radius-card:16px; --radius-button:14px; --hud-blur:6px;
  --font-display:"Unbounded",sans-serif; --font-body:"Inter",system-ui,sans-serif; --font-mono:"JetBrains Mono",monospace;
}
:focus-visible { outline:3px solid var(--blue); outline-offset:2px; }
```

## 3. Layout

- **Stage.** Design at 1280 by 720 (16:9), and scale to the window. The mockups in this document are 1280 by 720.
- **Safe margins.** 20 to 40 px from the edges on desktop. HUD panels never touch the screen edge on phones with notches.
- **Desktop first, then tablet and phone.** The menu, briefing, gear and result screens must work at phone width, with the cards stacking in one column. The 3D mission needs a tablet or larger for a good experience (document 04, section 5).
- **One primary action per screen,** in amber, at the lower right. **Back** is a secondary button at the lower left.
- **Pre-flight HUD.** A top bar: mission name (ARTEMIS-III), a T-minus or phase chip, a loadout summary (modules and mass), and mute. No day counter and no live telemetry.

### 3.1 Visor HUD zones

The visor HUD sits over the 3D scene. It has a curved vignette and light scanlines, like a gold-coated visor. It starts with a short visor-boot animation. The scene must stay visible in the middle.

| Zone | Content | Position |
|---|---|---|
| Time and light | DAY X / 90, SUNLIT or DARK, next dark period and its length | Top left |
| Summary meters | Life Support, Power, Shielding, Crew Health, each with an Explain button | Top center |
| Clock controls | Mission time left, Pause, speeds 1x to 2x | Top right |
| Power grid | Solar output (with dust loss), fission output (only if packed), demand, battery | Top right, below the clock |
| Lifelines | Oxygen, Water, Food, Power / heat, each with a bar, a percent and a LOW or EMPTY tag | Left |
| What to do now | One line with the most useful next step | Bottom center, above the crew dock |
| Crew dock | One card per astronaut: LED, name, role, health, task. A minimize toggle gives a full cinematic view. | Bottom center |
| Data source and Help | The DATA SOURCE tag and the **?** button | Bottom left |
| Camera | D-pad, recenter and zoom | Bottom right |
| Event banner | A one-line banner when an event is waiting | Below the meters, center |
| Event card | A modal over a dimmed HUD, with the clock paused | Center |

### 3.2 Screens and the mockups

| Screen | Theme | Mockup |
|---|---|---|
| Landing | ORBY | Figure 1 |
| Launch Mission menu | ORBY, pixel style | Figure 2 |
| Briefing step 4, difficulty | ORBY | Figure 3 |
| Mission gear | ORBY | Figure 4 |
| Pre-flight hangar | Visor HUD (pre-flight) | Figure 5 |
| Lunar Outpost HUD | Visor HUD | Figure 6 |
| Event card | Visor HUD | Figure 7 |
| Result: Mission Complete | ORBY | Figure 8 |
| Result: Try again | ORBY | Figure 9 |
| Component sheet | Both | Figure 10 |

## 4. Components

Figure 10 shows the shared components. The rules for each are below.

![Figure 10: component sheet](images/fig10_components.png)

**Buttons.** Primary (amber, one per screen), Secondary (outlined), Ghost (low emphasis) and Disabled. A button that is blocked, such as adding a module over the cap, stays visible and shows a lock plus a plain reason.

**Data labels.** Every number or claim has one chip:

| Chip | Look | Meaning |
|---|---|---|
| **Sourced** | Teal outline, check | A real NASA or published value |
| **Calculated** | Blue outline | Derived from sourced values |
| **Unverified** | Amber dashed outline | Found in the research but not checked. Do not present as fact. |
| **Game assumption** | Purple-light fill, cog | A value chosen by the team |
| **Planned technology** | Orange fill, rocket | A real project that is not built yet (the reactor) |
| **DATA SOURCE** | Gray monospace | Shows whether the value came from the NASA dataset or the game baseline |

**Lifeline bars.** Three states. **OK** (teal) is above the warning threshold. **LOW** (amber, warning icon, LOW tag) is at or below the warning threshold. **EMPTY** (red, X icon, EMPTY tag) starts the grace period, and the screen shows how long is left.

**Summary meters.** Three states with an icon, a word and a color: **OK** (teal, check), **WARNING** (amber, triangle), **CRITICAL** (red, X). Each meter has an **Explain** button. The percent bands (for example OK above 50, WARNING from 25 to 50, CRITICAL below 25) are build defaults for the balance script to tune.

**Risk words.** Event cards show risk as a word: **Low risk** (teal, check), **Medium risk** (amber, triangle) or **High risk** (red, X). The percent bands are in document 03, section 8.

**Event card.** From top to bottom: a chip with EVENT and the category, a PAUSED chip, the title, **What happened**, **Why it matters**, then two to four options. Each option is one row with a radio button, the label, a **Cost** chip and a **risk** chip. Below are an **Explain** button, the line "Costs and risks are game assumptions" and the confirm button. The player must choose, and nothing happens until they confirm.

**Explain tooltip.** One sentence, the real NASA fact (labeled), and the other unit of time where it applies, for example *100 hours is 4.17 Earth days*.

**Coach mark.** An amber bubble with an arrow, one idea, and a step counter such as "1 of 5". It appears the first time the player meets the meters, the crew dock, pause and speed, and event cards. Practice mode shows all of them.

**Crew card.** A status LED (teal for OK, amber for watch), the name, the role, a health bar and the task. Click to change the task. Color is never the only signal: a watch state also shows a warning in the tooltip.

**What to do now bar.** One line, amber outline, an arrow icon. The rules for which hint shows are in document 03, section 12.

**Toast.** A short message at the bottom. **Coming in Season 02** has a lock icon.

**Charts.** Four lines with different dash styles and a legend, plus shaded dark periods. They are readable without color.

## 5. Screen mockups

The mockups are layout illustrations drawn in HTML with the real tokens. They are **not final 3D art**. Names and roles in them are placeholders (D-13), and the numbers are sample values.

### Landing and menu

![Figure 1: landing page](images/fig01_landing.png)

![Figure 2: Launch Mission menu](images/fig02_menu.png)

The landing page is calm: a purple rocket, one headline and one amber button. The menu is retro pixel style with hard shadows, four large buttons and a profile chip with the callsign. Both use the ORBY theme.

### Briefing and gear

![Figure 3: briefing step 4, pick a difficulty](images/fig03_briefing4.png)

![Figure 4: mission gear](images/fig04_gear.png)

Pilot is selected and marked DEFAULT. Each card shows its dark-period length. On the gear screen, the mass meter reads 1,300 / 1,800 kg. The reactor carries the **Planned technology** chip. Adding it would make 1,900 kg, so the Add button is locked and a plain message explains why. The screen shows 8 of the 12 modules, and the rest scroll.

### Pre-flight and mission

![Figure 5: pre-flight hangar](images/fig05_hangar.png)

![Figure 6: Lunar Outpost, visor HUD](images/fig06_hud.png)

![Figure 7: event card over the HUD](images/fig07_event.png)

In the hangar, the player clicks an astronaut for a short dossier and then **ENGAGE MISSION**. The HUD shows DAY 37 / 90, mission time left 5:56 at 1x, the next dark period, four meters, four lifelines, the power grid and the crew dock. The **What to do now** bar says to clean the dust. The event card is the same moment, paused: three options, each with a cost and a risk.

**Checking the sample numbers.** At 1x, DAY 37 hour 14 is hour 878, which is 244 s into the mission, so 5:56 is left. Solar output of 21 kW is 30 kW with 30% dust loss. The Pilot dark period lasts up to 3 days.

### Results

![Figure 8: Mission Complete](images/fig08_complete.png)

![Figure 9: Try again](images/fig09_tryagain.png)

Mission Complete shows stars, the five-part score, a chart of the four lifelines with the dark periods shaded, and a real NASA fact. Try again does not scold. It shows a plain reason, a short cause-and-effect chain from the event log, one thing to try next time, and a large **Try again** button.

## 6. Plain-language rules (D-15)

These rules apply to every word the player reads. They support requirement REQ-13 and REQ-21.

| Rule | Example |
|---|---|
| Short sentences, about 12 words or fewer | "Power is low. Turn off the rover." |
| One idea per message | Do not explain dust and radiation in the same card. |
| Familiar words first. Explain a science term the first time. | "Regolith (Moon dust)" |
| Say what to do, not only what is wrong | "Charge the battery before the dark period." |
| Every cost and risk fits on one line | "Cost: 3 crew h, 1.5 kg oxygen. Medium risk." |
| Use both units of time where it helps | "100 hours is 4.17 Earth days." |
| Use words for states, not only colors | LOW, EMPTY, OK, WARNING, CRITICAL |
| Be kind in failure | "Power ran out during the dark period, so the recycler stopped." Then say what to try. |
| Use the same name for the same thing everywhere | Always "Lifeline", "Dark period", "Standing order", "EVA" |
| No jargon in buttons | "Do it", "Explain", "Try again" |

**Reading-level target (build default).** Core interface text is checked against about grade 4. Explain text can reach grade 6. All player-facing text is checked at gate G3.

**Names to use.** Day (never Sol) for the Moon. Dark period or dark interval. Lifeline. Crew dock. Mission gear. Standing order. Planned technology. Do not use "End day", "Command tab", "Veteran" or "14-day night".

## 7. Accessibility

| Area | Rule |
|---|---|
| Contrast | Meaningful text 4.5 to 1 or more, and icons and control outlines 3 to 1 or more (section 2.1). |
| Color | Never the only signal. States use an icon, a word and a color. Chart lines use dash styles. |
| Touch and mouse | Tap targets at least 44 by 44 px. Everything works with a mouse, a touch screen or the keyboard. |
| Keyboard | Every control can be reached with Tab. Pause (**P**), speed (**[** and **]**), Help (**?**), Esc and mute (**M**) work from the keyboard. The key map is in document 02. |
| Focus | A visible 3 px blue focus ring on every control. |
| Motion | Respect the reduced-motion setting: shorter cinematics, no flashing, no camera shake. |
| Screen readers | HUD values have text labels. The event banner is an `aria-live` region. The event card is a dialog that traps focus and returns it when closed. |
| Sound | Every important sound also has a visual cue: a banner for an alert, a flash for a warning. Mute is remembered. |
| Pause | The player can pause at any time, and help works while paused. |
| Photosensitivity | No flashing faster than 3 times a second. |

## 8. 3D and motion art direction

The techniques (bloom, tone mapping, GLB models, lighting) are in document 06. This is the look they aim for.

- **Style.** Clean low-poly with soft materials. Orange-suited astronauts with gold visors. A white dome habitat, dark blue solar panels, a gray lunar surface with craters, and Earth in the sky.
- **Light.** A strong, low Sun for long shadows. A cold blue fill. Warm amber lights on the habitat and the crew, so the crew is always the brightest thing.
- **Dust.** Panels look tan and dull when dusty, and clean when cleared. The player should see the problem before reading about it.
- **Dark period.** The sky and the ground drop to deep blue, the habitat lights glow, and the HUD shows DARK with the time left.
- **Scenes.** Hangar (calm, blue), the Solar System (stylized, scaled sizes), the launch pad (a short cinematic, Skip always visible), the Outpost (the main scene), and the Habitat command hub (an inside view).
- **Motion.** Short and purposeful: visor boot, a pulse on a new event, a gentle float on the landing rocket. Nothing loops loudly.
- **Performance.** 60 FPS on the Outpost on the demo laptop. Limit the glass blur to HUD panels, and drop effects on slow devices.

## 9. Asset list

| Asset | Count | Notes |
|---|---|---|
| Icons | About 30 | `lucide-react` outline icons (document 06): 2 px stroke on a 24 px grid, imported one by one so unused icons are not shipped. |
| Gear module illustrations | 12 | One per GM-01 to GM-12, in the same style |
| Astronauts | 4 | One model, four name tags and suit trims |
| Habitat dome, annex, solar panels, rocket, rover, reactor | 6 | GLB with compressed textures (document 06) |
| Solar System bodies | 9 or more | Sun, planets and the Moon, with stylized sizes |
| Crew portraits (optional) | 4 | For the dossier |
| Sounds | Procedural | No audio files |

## 10. Updating the Figma file

The older Figma frames still show six gear items with a 600 kg limit, an "End day" button and a "Command" tab. Update them to match this document and document 04: twelve modules, the 1,800 kg cap, and the pause, speed and mission timer controls. Rename the frames to match the screen inventory (action A-11).
