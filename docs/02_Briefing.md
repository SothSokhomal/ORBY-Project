# ORBY 02: Briefing

*Mission briefing and player guide · Document 2 of 7 · Version 1.1 · November 14, 2026 · Hackathon edition*

| | |
|---|---|
| This document owns | The story of the game for players and judges: what ORBY is, how to play, controls, and the demo script. |
| Read it if | You are new to the project, you are writing player-facing text, or you are preparing the demo. |
| It defers to | Rules and numbers (03), screens (04), visuals (05), build details (06, 07). |

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

## 1. What ORBY is

ORBY is a browser game about staying alive on the Moon. The player commands **four astronauts** at the lunar south pole for **90 Earth days**. The crew needs oxygen, water, food and power, and the Moon keeps getting in the way: dust covers the solar panels, the Sun disappears for days, and solar storms send out radiation alerts. The player packs the gear, gives the crew their orders, makes the hard calls when something goes wrong, and tries to bring everyone home.

A full mission is played in **10 minutes**. That is short enough for a classroom, a hackathon demo or one lunch break, and long enough for real trouble to build up. The game is made for ages 7 to 12, so every screen explains itself in plain words, and every number on screen says whether it is real science or a game choice.

**What makes ORBY different**

- **Real problems, not made-up ones.** The dark intervals, the dust, the radiation alerts and the water recycler all come from NASA-style lunar mission research (document 01).
- **Everything is connected.** Dust cuts solar power. Low power stops the water recycler. Less recycled water means less oxygen. The player sees *why* a problem grew, and the result screen replays that chain.
- **Every choice costs something.** No event option is free. Each one shows its cost and its risk in one line before the player chooses.
- **Honest about data.** Numbers are labeled **Sourced**, **Calculated**, **Unverified** or **Game assumption**. A **DATA SOURCE** tag shows when a value comes from the official NASA dataset instead of the game baseline.

## 2. How to play

The game guides the player with a **What to do now** bar, coach marks and **Explain** buttons. Practice mode switches every hint on.

### Step 1: Name, briefing and difficulty

1. On the **Launch Mission** menu choose **Game Start** and type a **callsign** (2 to 16 characters, for example `VALKYRIE-1`).
2. Read the four short briefing steps: **Your mission**, **Stay supplied**, **Plan ahead**, **Get ready**.
3. **Pick a difficulty.** The plain label sits beside each name. The table shows the longest time without sunlight. Difficulty also changes the starting reserves, the hazards and the grace period (document 03).

| Difficulty | Label | Dark intervals |
|---|---|---|
| Cadet | Easy | 48 hours (2 days) |
| **Pilot** (default) | Medium | 72 hours (3 days) |
| Commander | Hard | 100 hours (4 days 4 hours) |

### Step 2: Choose the mission gear

The player packs up to **1,800 kg** from **twelve modules**. The starting load is **1,300 kg**. Nothing is mandatory, but a warning appears if power, water, oxygen or food has nothing packed.

| Category | Module | Mass | Packed at start |
|---|---|---|---|
| Power | Deployable Solar Array | 220 kg | Yes |
| Power | Solid-State Battery Bank | 200 kg | Yes |
| Power | Kilopower Fission Reactor | 600 kg | No |
| Life support | Urine and Condensate Water Recycler | 250 kg | Yes |
| Life support | Water Electrolysis O₂ Generator | 180 kg | Yes |
| Life support | CO₂ Removal and Reduction Unit | 160 kg | Yes |
| Life support | Hydroponic Growth Chamber | 120 kg | No |
| Safety | Regolith Storm Shelter Vault | 200 kg | Yes |
| Safety | Advanced Dosimeter and Solar Warning Array | 50 kg | No |
| Safety | Medical Kit and Treatment Bay | 90 kg | Yes |
| Systems | Modular Avionics Pump Spare Kit | 100 kg | No |
| Systems | Lunar Rover | 300 kg | No |

All twelve weigh 2,470 kg, so the player has to choose. The reactor does not fit with the starting load (1,900 kg), but swapping the solar array for the reactor does (1,680 kg). The masses of the CO₂ unit, the medical kit and the rover, and the 1,800 kg cap, are game assumptions. The reactor's numbers are game values, because NASA's lunar fission system is still a development target.

### Step 3: Meet the crew, pick the Moon, launch

- **Pre-flight hangar:** click any of the four astronauts for a short dossier (name, role, health, one fact). Click the lit **ENGAGE MISSION** switch.
- **Destination:** the Solar System is shown, and **The Moon** is the only choice. Mars is locked until Season 02.
- **Launch pad:** a short cinematic with the swing arm, ignition and liftoff. **Skip** is always visible.

### Step 4: Run the mission

The **Lunar Outpost** is the 90-day mission, played in 10 minutes at normal speed. The player can switch the camera into the **Habitat command hub** at any time.

**Give standing orders.** Each astronaut has a task that continues day after day: **EVA repair**, **Hydroponics** (if packed), **Power grid**, **Research**, **Rest and recovery** or **Storm shelter**. The screen flags an order that needs a second look, for example a tired astronaut. There is no "end the day" button: the clock runs, and the player steps in when needed.

**Watch the clock.** The top left shows **DAY X / 90**, whether it is **SUNLIT** or **DARK**, and when the next dark interval starts and how long it lasts, for example *Dark period in 3 days 6 hours, lasts up to 4 days 4 hours.*

**Survive the dark.**

- **Sunlit:** the solar array makes power. Charge the batteries before the dark interval.
- **Dark:** solar power drops to zero. The crew lives on the battery and, if it was packed, the fission reactor. If power runs short, the game switches off the least important things first: science, then rovers, communications and heating. Life support is the last to go. Without heat the cabin cools and the crew gets sick.

**Handle events.** When something happens, the game pauses and an **event card** appears: what happened, why it matters, and each choice with its **cost and risk**. For example:

- **Solar storm warning during a moonwalk.** Abort to shelter (safe, but it costs time and power), finish the task (risky), or send one astronaut back.
- **Dust on the panels.** A moonwalk clears the dust but costs oxygen and crew time. A rover trip stirs up more dust.
- **The water recycler clogs.** Repair it, swap a spare cartridge, ration water, or use the reserves.

The full list of fourteen events is in document 03.

### Step 5: See how it ended

| Ending | When | What the player sees |
|---|---|---|
| **Mission Complete** | The mission tasks are done and the crew is alive | A win screen with stars and a score |
| **Crew Survived** | The crew is alive when the 10 minutes end, but not every task is done | A win screen with stars and a score |
| **Try again** | The crew is lost, or a lifeline stayed at zero too long | A plain reason (for example, *Power ran out during the dark period, so the recycler stopped*), one thing to try next time, and a **Try again** button |

Stars are a game assumption: three for tasks done with all four astronauts alive, two for all four alive, one for at least one alive.

## 3. Controls

The player can use the mouse, the keyboard or the touch screen. All buttons are at least 44 px so small fingers can tap them. The key map below is a build default that the team can change, not a team decision. It is shown in the Help screen.

| Input | Action |
|---|---|
| Mouse drag | Orbit the 3D camera |
| Mouse wheel or pinch | Zoom |
| **W A S D** or arrow keys | Pan and orbit |
| On-screen D-pad | The same as the keys, with a center button to recenter |
| Click an astronaut | Open the dossier: health, morale, oxygen, dose, role and task |
| Click machinery | Focus the camera and show what it does |
| **P** | Pause or resume |
| **[** and **]** | Slower and faster (1x, 1.25x, 1.5x, 1.75x, 2x) |
| **?** or **/** | Open Help: the briefing and the controls guide. It works while paused. |
| **Esc** | Close the open window |
| **M** | Mute or unmute the sound |
| **Space** or **Enter** | Confirm and advance the pre-flight sequence |
| **S** on the launch pad | Skip the cinematic |
| **1** to **5** | Jump between scenes. Works only with `?dev=1`. |

## 4. What the player learns

Each game moment is tied to a real fact. The Explain button on the screen shows the fact in one sentence, with the other unit of time where it applies, for example *100 hours is 4.17 Earth days*. The research behind each row is in document 01.

| In the game | The real idea | Research section |
|---|---|---|
| A dark interval empties the battery | The south pole is mostly sunlit, but some places go dark for up to about 100 hours. Spacecraft need stored or nuclear power for that. | 3.1, 3.2 |
| The recycler stops when power is low | Water recovery needs electricity. ISS-style systems recover most water, but not all. | 3.3, 3.6 |
| Oxygen falls after water falls | Oxygen can be made from water, so the two are linked. | 3.3, 3.6 |
| The CO₂ unit | Breathing makes CO₂. It must be removed or it harms the crew. | 3.3 |
| Dust on the panels | Moon dust is sharp, sticks to everything and cuts solar output. | 3.2, 3.4 |
| The storm alert and the shelter vault | Solar storms give off radiation. Crews shelter behind thick material, and hydrogen-rich material blocks radiation well. | 3.4 |
| The medical kit and illness event | Long missions need medical care on site. Exercise and rest keep a crew healthy. | 3.5 |
| The reactor is labeled "planned technology" | NASA's lunar fission system is a goal, not a working power plant yet. | 3.2 |
| The Mars lock | Mars has its own day, the sol, which is about 24.66 hours. It comes in Season 02. | 3.1 |

## 5. The three-minute demo script

Use this for the hackathon judging. It plays a slice of the mission, not all 10 minutes. Rehearse it twice before code freeze (gate G4 in document 06).

**Before the demo:** open the live link and a local copy, load the backup video, and start with the demo flag `?demo=drama` (document 06, prompt P7). The flag is a build default and shows only in `?dev=1`. The drama seed puts a dust storm on day 14 with power already low.

| Time | Screen | Say | Do |
|---|---|---|---|
| 0:00 to 0:20 | Landing, then menu | "Can you keep four astronauts alive for 90 days at the Moon's south pole? ORBY is a 10-minute survival game for ages 7 to 12." | Click **Get started**, then **Game Start**. Type a callsign. |
| 0:20 to 0:50 | Briefing 4 and Gear | "The south pole is mostly sunlit, but it can go dark for up to about 100 hours. Our difficulty changes how long. You can only carry 1,800 kg, so every choice is a trade." | Pick **Pilot**. On the gear screen, add the reactor and show the over-cap warning (1,900 kg). Swap out the solar array (1,680 kg). |
| 0:50 to 1:05 | Hangar and launch | "Four astronauts. Their names and roles will come from the NASA dataset." | Click one astronaut. Click **ENGAGE MISSION**, then **Skip** on the launch pad. |
| 1:05 to 1:55 | Outpost | "Everything is connected. Dust cuts solar power, low power stops the water recycler, and less water means less oxygen." | Point at the four meters, then the dark-period timer. The dust event fires and the game pauses. Read the three options with their cost and risk. Choose one. Set the speed to **2x**. |
| 1:55 to 2:20 | Outpost | "The game never lets a number appear without saying where it came from." | Click **Explain** on a meter. Point at the **DATA SOURCE** tag. |
| 2:20 to 2:45 | Result | "Every ending explains itself. A win shows what saved the crew. Try again says why it failed and what to change." | Use the `?dev=1` jump to a late game hour (document 06), let the mission end, and show the stars, the reason and the NASA fact. |
| 2:45 to 3:00 | Menu | "Plug in NASA's data by dropping files in one folder. The rules never change. Mars is Season 02." | Show `?debug=1`: each parameter with its source. Take questions. |

**If something breaks:** switch to the backup video. Do not debug in front of judges.

## 6. Questions judges may ask

| Question | Short answer |
|---|---|
| Is this real NASA data? | The game runs on a baseline inspired by NASA sources. On hackathon day the official dataset plugs in through one adapter, and every value shows a DATA SOURCE tag. |
| Is the reactor real? | NASA's lunar fission system is a development target. In the game it is labeled planned technology and uses game values. |
| Why 100 hours of darkness? | NASA sources describe dark intervals of up to about 100 hours at some south pole locations. It is 4 days 4 hours, or 4.17 Earth days. We use 48, 72 and 100 hours for Cadet, Pilot and Commander. |
| Why only 10 minutes? | So it fits a classroom or a short play session. The player can pause and speed up, and paused time does not count. |
| Why Day and not Sol? | The Moon has Earth-length days, so the clock reads DAY X / 90. Sols are for Mars, which is Season 02. |
| Is it too hard for a 7-year-old? | Cadet is forgiving, and every screen has a What to do now bar, coach marks and Explain buttons. Practice mode switches every hint on. |
| Does it need a server or internet? | No. It is a static web app with procedural sound and no downloads, so it runs offline from a local copy. |
| What is not finished? | Mars (Season 02), accounts, and a shared online leaderboard. The local top 10 works. |
| How did you make sure the science is right? | Every number carries a label. The science leads review each dataset value before it goes live. Unverified numbers are marked and not shown as fact. |

## 7. Words to know

| Word | Meaning |
|---|---|
| **Callsign** | The name you give yourself as the mission commander. |
| **Lifeline** | One of the four things the crew cannot live without: oxygen, water, food, and power or heat. |
| **Dark interval** | A time when the Sun is not above the horizon at the base, so the solar panels make no power. |
| **EVA** | A moonwalk outside the base, short for extravehicular activity. |
| **Regolith** | Moon dust and loose rock. |
| **Radiation dose** | How much radiation an astronaut has absorbed, in millisieverts (mSv). |
| **Standing order** | A task you give an astronaut that continues until you change it. |
| **Planned technology** | A real project that is not built yet. The game uses made-up numbers for it. |
| **DATA SOURCE tag** | A small label that shows a number came from the NASA dataset. |
