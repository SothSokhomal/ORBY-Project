# ORBY 01: Research Paper

*Surviving 90 days on the Moon · Document 1 of 7 · Version 1.1 · November 14, 2026 · Hackathon edition*

| | |
|---|---|
| This document owns | The science: findings, planning numbers with confidence labels, events and trade-offs, open verification items. |
| Read it if | You need to know where a number or a claim comes from, or you are writing science text or an Explain tooltip. |
| It defers to | Game rules (03), screens (04), visuals (05), technology (06), data model (07). |

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

**Abstract.** Four astronauts can survive a 90-day lunar mission only if power, life support, radiation protection and crew health are managed as one connected system, because a failure in one quickly spreads to the others. This paper merges six team research papers into one evidence base for ORBY, an educational survival game for children aged 7 to 12. It presents the scientific findings, one table of planning numbers with a confidence rating for each, the mission events and trade-offs that follow, and the inconsistencies the team must resolve before building. The central design conclusion: ORBY should be a command game in which the player gives standing orders, protects life support first, and treats power as the resource that drives every other system.

**Contributors.** Keo Rany (energy and power), Channet Lor (air and water recycling), Kanchana (radiation and hazards), Visa (life support), plus two papers without a named author (lunar habitat and educational audience; mission planning and systems integration).

> **Status of this copy (version 1.1).** The research findings, planning numbers and sources are unchanged from the paper dated November 11, 2026. This copy updates only what the team has decided since: the status of the open items in section 6, and the development implications in section 7. Decisions are cited as D-xx from the *ORBY Technical Documentation and Project Plan v1.1*. Game rules that use these numbers are in **03 GameFlow**.

## 1. Introduction

The ORBY scenario places four astronauts on the Moon, at the south pole, for 90 days. The Moon has no breathable air, extreme heat and cold, radiation, abrasive dust and few chances for resupply. The player is the mission commander and must manage oxygen, water, food, electricity, shielding and crew health while responding to emergencies. Mars is studied as a comparison because several team papers cover it.

The audience is children aged 7 to 12, so the science must be accurate but easy to follow, and real NASA values must be clearly separated from game values. This paper answers five questions:

1. What do four astronauts need to survive 90 days?
2. How can electricity be generated, stored and managed?
3. Which environmental hazards threaten the crew and equipment, and how are they controlled?
4. How do these systems depend on each other?
5. How should this evidence become gameplay for ages 7 to 12?

## 2. Method and evidence standard

Each team member researched one topic using NASA and U.S. Department of Energy sources, following a shared template (problem, evidence, sources, solutions, gameplay, events, trade-offs, kid-friendly explanation, NASA data, core meter, recommendations). This paper merges the findings by theme, cross-checks numbers between papers, and gives every planning number one of four labels:

- **Sourced:** stated in a NASA or DOE source cited by a team paper.
- **Calculated:** derived from sourced numbers.
- **Unverified:** appears in a paper, but the source was not confirmed. Verify before use.
- **Game assumption:** a design choice, not a NASA value.

Limitations: the source links come from the team papers and were not re-opened for this synthesis, and some figures come from older NASA presentations (for example, a 2017 slide on oxygen recovery).

## 3. Findings

### 3.1 The lunar environment, and how Mars differs

The Moon has no atmosphere and no global magnetic field, so it offers no natural protection from radiation, temperature swings or micrometeoroids. Near the south pole, terrain decides the lighting: some sites receive near-continuous sunlight while nearby permanently shadowed craters never do, and those craters may hold water ice. The table compares the two destinations.

| Factor | Moon (south pole) | Mars | Game consequence |
|---|---|---|---|
| Sunlight | Varies with terrain. Some sites get near-continuous sunlight, shadowed craters get none. Polar power studies consider up to about 100 hours of darkness. | Less sunlight than Earth. Dust storms can block it. A sol lasts 24 h 39 min 35 s. | Moon: darkness events. Mars: storm events. |
| Dust | Sharp, abrasive and electrically charged. Clings to suits and damages seals and equipment. | Settles on solar panels. Global storms cut sunlight. | Moon: contamination events. Mars: panel cleaning. |
| Radiation | No atmosphere or global magnetic field, so full exposure to solar particle events (SPEs) and galactic cosmic radiation (GCR). | Thin CO₂ atmosphere (about 6 mbar) roughly halves the GCR dose compared with deep space, but SPEs still require shelters. | Shelter and alerts on both. |
| Temperature | About −173 °C in darkness to 127–130 °C in sunlight. | Extreme cold affects equipment and batteries. | Thermal-control events. |
| Oxygen source | Closed loop: water electrolysis plus a Sabatier reactor. Polar water ice is a possible future source. | Mars air is mostly CO₂, so a MOXIE-style electrolysis unit can make oxygen. | Different ECLSS upgrades per destination. |
| Communication delay | About 1.3 seconds one way. | About 4 to 24 minutes one way. | Mars crews must decide more on their own. |

### 3.2 Power and energy

Electricity runs oxygen generation, water recycling, heating, communications, rovers and science equipment. If power runs short, the crew must switch off non-essential equipment to protect the important systems, and a failure can hit several systems at once.

There are two main ways to generate power. Solar panels convert sunlight directly into electricity, but shadows, darkness and dust reduce their output. Nuclear fission could supply electricity continuously, and NASA is working with the U.S. Department of Energy on a lunar surface fission system designed for at least 40 kilowatts. That figure is a development target, not a system already operating on the Moon.

Batteries store energy for darkness, temporary shortages and emergencies, but their capacity is limited, so the crew must manage use and recharge when power is available. A NASA slide cited in the power paper shows how needs grow: about 1 to 5 kW for initial exploration, 10 to 20 kW for early demonstrations and 80 to 100 kW for advanced operations. The same slide lists the largest early users as resource extraction (60 kW or more), then the habitat (20 to 50 kW for a crew of four) and rovers (about 500 W each).

The power paper's mitigation is smart power management: check power daily, prioritise oxygen, water, heating and communications, delay non-essential experiments and keep backup energy for emergencies. Sensors and software can fail, so manual controls remain necessary.

### 3.3 Life support: oxygen, CO₂, water and food

NASA's mass balance, cited by two papers, gives the daily needs of one astronaut: about 0.84 kg of oxygen, 0.62 kg of food solids and 1.62 kg of drinking water, with about 0.35 kg of water made by the body itself. NASA's ECLSS technical brief sets a minimum of 2.5 litres of water per crew member per day and a cabin temperature of 20 to 25 °C. For four crew over 90 days (360 crew-days), that is about 302 kg of oxygen, 583 kg of drinking water and 223 kg of food solids before any recycling.

Recycling is what makes the mission practical. The ISS water recovery system recovers about 98 percent of the station's water, and the urine processor recovers about 85 percent. Oxygen recovery is much lower: a 2017 NASA slide says the ISS Sabatier process recovers 42 percent of the oxygen from CO₂, with a goal above 75 percent.

The loop works like this. Electrolysis splits water into oxygen and hydrogen, the crew breathes the oxygen and exhales CO₂, and a Sabatier reactor combines that CO₂ with the hydrogen to make water and methane. A scrubber must remove the CO₂ that is not converted. If it fails, CO₂ builds up and causes headaches, confusion and loss of consciousness, while oxygen and water run down within hours to days.

On Mars, the MOXIE experiment aboard the Perseverance rover produced up to 10 grams of oxygen per hour at 99.6 percent purity directly from Martian CO₂, using solid oxide electrolysis at about 800 °C. The team estimates that a closed-loop electrolysis and Sabatier system needs roughly 1 to 3 kW of continuous power, which makes life support one of the biggest electricity consumers in the habitat.

There are two ways to cover the supply: recycle, or carry reserves. Recycling needs electricity and spare parts, and ISS recovery rates are not yet proven on the Moon. Reserves add launch mass and eventually run out, so the key pre-launch choice is how much to carry and how much to recycle. Missions longer than 30 days also call for 90 minutes of exercise per person per day, which raises oxygen, water and food use.

### 3.4 Radiation, dust and thermal hazards

**Radiation.** Solar particle events cause sudden spikes, while galactic cosmic radiation is a continuous background hazard. Radiation damages cells and DNA and raises the risk of cancer and other health problems. Protection combines shielding, a storm shelter, protective suits, dosimeters and real-time alerts so a crew can stop an EVA and reach shelter quickly.

Hydrogen-rich materials such as water and polyethylene absorb secondary neutrons better than heavy metals like lead or aluminium, which can themselves produce harmful secondary radiation. Compacted regolith placed over habitat modules gives bulk shielding without launching extra mass from Earth. On Mars, the atmosphere halves the GCR dose compared with the cruise phase, but solar particle events still require shelters.

**Dust.** Lunar dust is sharp, abrasive and electrostatically charged, so it clings to spacesuits, damages seals and equipment, enters the habitat and reduces solar panel output. Controls include airlocks, cleaning suits before entry, air filters, dust-resistant materials and electrodynamic dust shields that move dust away with electric fields. One of the papers reports that NASA demonstrated this technology on the Moon during Firefly Aerospace's Blue Ghost Mission 1 in 2025.

**Temperature.** Surface temperatures swing from about −173 °C to about 127–130 °C, so the habitat needs insulation, heating and cooling, and heating depends on power. A thermal control failure during a cold period is a credible mission event.

### 3.5 Habitat and infrastructure

A habitat needs seven connected systems: a pressurised environment, temperature control, radiation shielding, micrometeoroid protection, life support, a power supply and dust control. They depend on one another: a power failure can interrupt air circulation, temperature control and water recycling at the same time.

A four-person, 90-day stay needs ten kinds of facility:

1. Sleeping and private areas.
2. Food preparation and storage.
3. Water storage and recycling.
4. Oxygen supply and air filtration.
5. Medical and emergency equipment.
6. Exercise and hygiene areas.
7. Communication and mission-control equipment.
8. Science and maintenance areas.
9. An airlock.
10. Reliable power with backup.

Spare parts, tools and emergency supplies are also required, and a NASA study of 30 to 90-day four-crew missions notes that stays beyond 30 days need a higher level of medical capability. Local resources can reduce what must be launched: regolith for construction and shielding, polar water ice as a potential source of water, oxygen and propellant, and controlled plant growth to supplement stored food. These uses are potential, not yet proven.

### 3.6 One connected system

The six papers agree that the mission is a chain of dependencies, not a set of separate meters. Electricity runs water recovery and oxygen generation, water feeds oxygen, astronauts breathe oxygen and produce CO₂ that must be removed, and radiation monitoring and shielding need power too. Four cascades appear repeatedly and should be built first:

1. **Power cascade:** dust on panels or a long dark period reduces power, the battery drains, the recycler pauses and oxygen generation slows, water reserves fall, and EVA time is limited.
2. **Water cascade:** a recycler failure speeds up water loss, less water is available for oxygen production, and the crew must cut hygiene water or use reserves.
3. **Air cascade:** a scrubber fails during a brownout, CO₂ rises, crew performance and health fall, and the player must divert power from science.
4. **Radiation cascade:** a solar storm during an EVA forces an abort and a shelter stay, costing science time and shelter resources.

The planning paper adds that the commander needs one dashboard showing oxygen, CO₂, water, food, electricity, temperature, radiation, crew health and equipment status. Its governing rule: life support comes first, mission goals come second.

## 4. Consolidated planning numbers

These are the values the team can use as a starting point for the game, with the confidence of each.

| Parameter | Value | From | Confidence |
|---|---|---|---|
| Oxygen per person | 0.84 kg/day (1.83 lb) | Life support, ECLSS papers | Sourced |
| Drinking water per person | 1.62 kg/day consumed; 2.5 L/day minimum allocation; 2.5 to 4.5 L/day including hygiene | Life support, ECLSS papers | Sourced, values differ by definition |
| Food solids per person | 0.62 kg/day | Life support | Sourced |
| Metabolic water made by the body | 0.35 kg/day | Life support | Sourced |
| Crew totals before recycling (4 crew, 90 days) | Oxygen about 302 kg, drinking water about 583 kg, food solids about 223 kg | Life support | Calculated |
| CO₂ produced per person | About 1 kg/day | Life support | Unverified |
| Water recovery | About 98% (ISS system); urine processor about 85% | Life support, ECLSS papers | Sourced (ISS, not yet the Moon) |
| Oxygen recovery from CO₂ | 42% (ISS Sabatier, 2017), goal above 75% | Life support | Sourced, dated |
| Cabin temperature | 20 to 25 °C | Life support | Sourced |
| Surface temperature | About −173 °C to 127–130 °C | Radiation, planning papers | Sourced, sources differ slightly |
| Darkness at polar sites | Up to about 100 hours (polar power studies) | Power, planning papers | Sourced |
| Lunar fission power target | At least 40 kW (development target) | Power | Sourced |
| Early lunar power users | Habitat 20 to 50 kW; rovers about 500 W each; resource extraction 60 kW or more | Power | Sourced |
| Life-support power draw | About 1 to 3 kW continuous | ECLSS | Unverified |
| MOXIE oxygen output | Up to 10 g/hour at 99.6% purity | ECLSS | Sourced |
| Communication delay | Moon about 1.3 s; Mars about 4 to 24 min, one way | Power, planning papers | Sourced |
| Exercise on missions over 30 days | 90 minutes per person per day | Life support | Sourced |
| Power meter levels (high, medium, low, critical) | Proposed warning levels | Power | Game assumption |

## 5. Game design implications

### 5.1 Core meters

The papers converge on four meters. **Life Support** covers oxygen, CO₂, water, food, pressure and temperature. **Power** covers generation, battery charge and demand. **Shielding** covers radiation protection and crew dose. **Crew Health** covers the physical condition of the four astronauts, affected by illness, injury, radiation and poor living conditions. Life Support is the primary meter in three papers, Power and Shielding are primary in one each, and Power affects the other three. Meters should use clear icons, colours and visual changes so children can read them at a glance.

The power paper suggests four display levels: high (all systems normal), medium (warning, conserve energy), low (turn off optional equipment) and critical (activate backup power or risk losing essential systems). These are game mechanics, not NASA safety thresholds.

### 5.2 Mission events

| Event | Decision the player faces | Main trade-off | Papers |
|---|---|---|---|
| Long darkness or low sunlight | Reduce heating, delay rover trips, shed optional equipment or use backup power | Battery reserve against activity | Power, planning |
| Dust on solar panels | Send an EVA to clean, wait and conserve, or use backup energy | EVA oxygen and crew time against power | Planning, power |
| Battery critical or failed | Choose which equipment stays on; switch to backup and repair | Essential against optional systems | Power |
| Solar storm during an EVA | Abort to shelter, finish the task, or send one astronaut back | Lost science time against radiation dose | Radiation, planning |
| Lunar dust in the airlock | Automatic dust removal, manual cleaning, or skip cleaning | Power and time against air quality and equipment wear | Radiation, habitat |
| Water recycler clogs or fails | Repair, swap a spare cartridge, ration water or use reserves | Spare parts and crew time against dehydration risk | ECLSS, life support, habitat, planning |
| CO₂ scrubber fails | Swap a spare filter, divert power to reboot it, or cut crew activity | Single-use spares or a day of science against air quality | Life support, ECLSS |
| Oxygen generator trips offline | Use stored oxygen, reduce EVAs, repair | Reserve oxygen against crew time | Planning, life support |
| Thermal control fails in a cold period | Repair and manage power | Delayed activities against safe temperature | Radiation |
| Airlock malfunction | Repair before anyone goes outside or enters | EVA schedule against safety | Habitat |
| Heavy exercise day | Keep or reduce the exercise schedule | Supplies against crew health | Life support |
| Communications draw too much power | Reduce communication or keep full contact | Mission updates against battery | Power |
| Fission backup (only if installed) | Activate backup power | Mass spent before launch | Power |

For a later Mars season, two further events apply: a global dust storm that cuts solar power, and a clogged MOXIE intake that halts oxygen production and forces an EVA or the use of reserves.

### 5.3 Trade-off rules

When resources run short, the player should prioritise in this order, and every fix should create a cost somewhere else so no choice is free:

- Life support over science, and power for life support over optional experiments.
- Drinking water over hygiene water, and oxygen over comfort.
- Heating over comfort activities.
- Battery reserve over rover exploration.
- Crew safety over mission progress, including cutting an EVA short.
- Repairs over exploration when a system is damaged.

The power paper states the rule as: protect essential systems first and use the remaining electricity for exploration.

### 5.4 Designing for children aged 7 to 12

The habitat paper recommends simple language with scientific terms explained when they first appear, icons and colour-coded meters, clear instructions before each challenge, immediate feedback on every decision, learning through action rather than reading, gradual difficulty and positive feedback for solving problems. It reviewed five NASA educational games (Explore Mars, CubeSat Builder, Relay, Helios and DSN Uplink-Downlink) and found that they teach one concept each through clear goals, visual explanations and interactive challenges. ORBY can build on them by connecting several concepts in one 90-day mission.

Each paper also gave a one-sentence explanation for a seven-year-old. The consolidated version: astronauts must carefully share their air, water, food and electricity, because if one thing runs out, the others can stop working too.

### 5.5 Which gameplay to build first

| Paper | Top recommendation |
|---|---|
| Power | Power Manager: 90-Day Mission |
| ECLSS | ECLSS Air and Water Balancer |
| Radiation | Solar Storm Warning |
| Habitat and audience | Lunar Dust Contamination |
| Life support | Water-recycler failure |
| Mission planning | Commander's 90 Days |

These ideas fit together. The core loop should be Commander's 90 Days: a dashboard in which power sits at the centre and life support is protected first. *(v1.1: the team decided the mission is played in 10 minutes with standing orders, pause and speed controls, so the dashboard is live and the commander reviews orders each game day rather than ending each day by hand. See D-04 and 03 GameFlow.)* The first events to build are the Solar Storm Warning, Lunar Dust Contamination and Water Recycling Failure, followed by the CO₂ scrubber failure and the long darkness period.

### 5.6 Real NASA data to connect

The papers name these data sources, which the team can use to ground game values:

- **NASA Technical Reports Server and ECLSS fact sheets:** consumption rates, recycling rates, minimum water, cabin limits and power needs.
- **DONKI space weather database:** solar flare and coronal mass ejection frequency, to trigger solar storm events.
- **Curiosity RAD measurements:** surface radiation dose rates for tuning exposure.
- **Open Science Data Repository (OSDR):** astronaut health studies (OSD-47, OSD-420, OSD-530, OSD-570, OSD-575). Not all directly study radiation, so describe their findings accurately.
- **NASA fission power, Mars dust storm and InSight power pages:** backup power, dust events and battery-saving decisions.

No NASA API for ECLSS telemetry has been verified. The game should always show which numbers are real NASA values and which are simulated game values.

## 6. Inconsistencies and open verification items

Cross-checking the six papers found the issues below. Resolve them before these numbers go into the game or the dataset adapter.

| # | Issue | What the papers say | Action | Status in v1.1 |
|---|---|---|---|---|
| 1 | Length of darkness at the south pole | Research: up to about 100 hours of darkness at polar sites, with some sites in near-continuous sun. The current build, according to its own summaries, models a 14-day night in a 28-day cycle. | Decide whether to model polar darkness of about 100 hours as events, or to label the 14-day night as a different scenario. | **Resolved (D-03).** Up to 100 h, used as dark intervals by difficulty: Cadet 48 h, Pilot 72 h, Commander 100 h. The 14-day night is removed. |
| 2 | Water per person | 1.62 kg/day consumed, 2.5 L/day minimum allocation, 2.5 to 4.5 L/day for drinking and hygiene. | Define game water use as drinking, hygiene and food preparation, and state the assumption. | **Adopted.** Game water use is drinking, hygiene and food preparation. Document the value in config. |
| 3 | Maximum surface temperature | 127 °C in NASA Moon Facts, about 130 °C in the NASA lunar power paper. | Use a range or one stated value. | **Adopted.** Use the range −173 °C to 127–130 °C, labeled a game baseline until dataset data arrives. |
| 4 | Total supply mass | The ECLSS paper cites over 1,500 kg of air and water for 90 days. The mass balance gives about 885 kg for oxygen plus drinking water alone (302 + 583), and more with hygiene water. | Treat 1,500 kg as approximate until recalculated with a stated water allowance. | **Open.** Treat 1,500 kg as approximate. The 1,800 kg payload cap (D-06) is a separate game assumption. |
| 5 | Unverified numbers | Life-support power of 1 to 3 kW, CO₂ at about 1 kg per person per day, 3,035 kcal per day. | Confirm in NASA documents before use. | **Open (A-05).** These values carry the label Unverified. |
| 6 | Dated figure | Sabatier oxygen recovery of 42 percent comes from a 2017 presentation. | Look for a newer NASA figure. | **Open (A-05).** The game uses 42% (base) and 75% (upgraded) as game assumptions. |
| 7 | Fission power | The 40 kW system is a development target, not an operating system. | Label any in-game fission module as planned technology and mark its numbers as game values. | **Resolved (D-08).** Planned technology, with game values. |
| 8 | Dust shield demonstration | Reported in the habitat paper (Blue Ghost Mission 1, 2025). | Confirm the NASA source before citing. | **Open (A-05).** Do not cite on screen until confirmed. |
| 9 | OSDR studies | Not all listed studies investigate radiation. | Describe each study accurately. | **Open.** Describe each study accurately if it is used. |
| 10 | Misplaced content in the ECLSS paper | Its research questions and its kid-friendly sentence cover radiation shielding, and one sentence on the Sabatier reaction is garbled. | Shielding content is now in section 3.4. Rewrite the garbled sentence. | **Handled.** Shielding content is in section 3.4. |
| 11 | Formatting artifacts in the planning paper | Stray words such as 'ntrs.nasa' and 'nasa' after sentences, and a garbled definition inside the south pole paragraph. | Clean before reuse. | **Handled** in this paper. |
| 12 | Mars scope | Mars is researched, but the first game season is the Moon. | Keep Mars content for a later season. | **Resolved (D-16).** Mars is locked as Season 02. |
| 13 | NASA data access | No NASA API for ECLSS telemetry has been verified. | Use the papers and static datasets. | **Adopted (D-10, D-11).** Static files in public/data. |

## 7. Implications for development

The research confirms or changes the following for the build and the hackathon dataset work. Details of the current prototype come from the team's own build summaries, not from the code.

1. **Meters.** Show the four research meters: Life Support, Power, Shielding and Crew Health. The onboarding keeps the four child-friendly lifelines (oxygen, water, food, power and heat) as the entry point, and the HUD also shows radiation dose and shelter status clearly (D-05).
2. **Dependencies as data.** Encode the cascades in section 3.6 as rules, not hard-coded logic: power feeds water recovery, oxygen generation and CO₂ removal; water feeds oxygen; dust reduces solar output.
3. **Time model.** *Decided.* Dark intervals last 48, 72 or 100 hours by difficulty (D-03). The simulation uses a one-hour tick, and a full 90-day mission is played in 10 minutes with pause and speed controls (D-04). The Moon clock reads DAY and a Mars clock would read SOL (D-02).
4. **Dataset adapter parameters.** Expose oxygen, water and food use per person; water and oxygen recovery rates; power demand per system (habitat, life support, rovers, communications); battery capacity; darkness duration; dust accumulation rate; solar storm frequency; radiation dose rates; and communication delay. Flag each as a real NASA value or a game value.
5. **First events.** Build the Solar Storm Warning, Lunar Dust Contamination, Water Recycler Failure, CO₂ Scrubber Failure and Long Darkness events, and align the wording and numbers of any that already exist in the prototype with this paper.
6. **Gear.** The research supports packable modules for solar power, batteries, water recycling, oxygen generation, CO₂ removal (section 3.3), a regolith storm shelter with a hydrogen-rich liner (section 3.4), a radiation warning system, medical capability (section 3.5), spare parts and a rover (section 3.2). The team packaged these as twelve modules (D-06). A fission reactor must be presented as planned technology, not an operating system (D-08).
7. **Real versus game values.** Show a visible tag in the interface so players and judges can see which numbers come from NASA and which are simulated.
8. **Reading level.** Write all player-facing text for ages 7 to 12, using the consolidated one-sentence explanations in section 5.4 as the model.
9. **Mars.** Keep the Mars findings in sections 3.1 and 5.2 for a later season.

## 8. Conclusion

Across six papers the same message appears: on the Moon, survival is a systems problem, not a single-resource problem. Electricity runs the machines that make air and water, water feeds oxygen, and radiation, dust and darkness threaten all of them at once. That is why Commander's 90 Days, with power at the centre and life support protected first, is the strongest foundation for ORBY.

The evidence is strong enough to start building. The main gaps are the length of polar darkness, a handful of unverified numbers and the dated oxygen-recovery figure, all listed in section 6. The hackathon dataset from NASA is the best chance to close them.

## 9. Sources

Links are as cited in the team papers and were not re-opened for this synthesis.

| Source | Organization | Used for | Link |
|---|---|---|---|
| Power and Energy for the Lunar Surface | NASA Technical Reports Server | Lunar power needs, darkness, temperatures, batteries | [Link](https://ntrs.nasa.gov/api/citations/20220005893/downloads/Power%20and%20Energy%20for%20the%20Lunar%20Surface.pdf) |
| Fission Surface Power | NASA | 40 kW fission target | [Link](https://www.nasa.gov/exploration-systems-development-mission-directorate/fission-surface-power/) |
| The Lunar South Pole Region | NASA | Sunlight, shadow, water ice | [Link](https://www.nasa.gov/reference/moonbase-environment/) |
| Why Artemis Will Focus on the Lunar South Polar Region | NASA | Lighting and volatiles | [Link](https://www.nasa.gov/wp-content/uploads/2023/10/acr22-wp-why-lunar-south-polar-region.pdf) |
| NASA Technologies Aim to Solve Housekeeping's Biggest Issue: Dust | NASA | Dust interference | [Link](https://www.nasa.gov/directorates/stmd/nasa-technologies-aim-to-solve-housekeeping-s-biggest-issue-dust/) |
| 10 Things: Massive Dust Storm on Mars | NASA Science | Opportunity rover, 2018 storm | [Link](https://science.nasa.gov/solar-system/planets/mars/10-things-massive-dust-storm-on-mars/) |
| InSight Sees Power Levels Stabilize After Dust Storm | NASA / JPL | Panel dust and power | [Link](https://www.nasa.gov/solar-system/nasas-insight-sees-power-levels-stabilize-after-dust-storm/) |
| Mars24: Technical Notes | NASA GISS | Length of a sol | [Link](https://www.giss.nasa.gov/tools/mars24/help/notes.html) |
| Space Communications: 7 Things You Need to Know | NASA | Communication delays | [Link](https://www.nasa.gov/centers-and-facilities/goddard/space-communications-7-things-you-need-to-know/) |
| Space Photovoltaics Basics | U.S. Department of Energy | Solar cells in space | [Link](https://www.energy.gov/cmei/systems/space-photovoltaics-basics) |
| ECLSS fact sheet (2025) | NASA | Water recovery, oxygen loop | [Link](https://www.nasa.gov/wp-content/uploads/2025/08/g-657270-59-hp-environmental-control-and-life-support-system-eclss.pdf) |
| ECLSS fact sheet (2015) | NASA | Oxygen need, water recovery | [Link](https://www.nasa.gov/wp-content/uploads/2015/02/g-583661_smith_cs20.pdf) |
| ECLSS Technical Brief (OCHMO) | NASA | Minimum water, cabin temperature | [Link](https://www.nasa.gov/wp-content/uploads/2023/07/eclss-technical-brief-ochmo.pdf) |
| Human needs and effluents mass balance | NASA Technical Reports Server | Daily consumption per person | [Link](https://ntrs.nasa.gov/api/citations/20090034853/downloads/20090034853.pdf) |
| Mission considerations for habitation systems | NASA Technical Reports Server | Sabatier 42%, urine processor 85% | [Link](https://ntrs.nasa.gov/api/citations/20170005618/downloads/20170005618.pdf) |
| Life support options and metabolic profile | NASA Technical Reports Server | Exercise requirement | [Link](https://ntrs.nasa.gov/api/citations/20190027563/downloads/20190027563.pdf) |
| Aboard Perseverance, MOXIE creates oxygen on Mars | MIT / NASA JPL | Oxygen from Mars CO₂ | [Link](https://news.mit.edu/2021/aboard-nasa-perseverance-mars-rover-moxie-creates-oxygen-0421) |
| Exploration Sabatier Project | NASA TechPort | Water from exhaled CO₂ | [Link](https://techport.nasa.gov/projects/184079) |
| Hazard: Space Radiation | NASA | Radiation risk | [Link](https://www.nasa.gov/hrp/hazard-space-radiation/) |
| Risk of Radiation-Induced Cancers | NASA | Cancer risk | [Link](https://www.nasa.gov/reference/risk-of-radiationinduced-cancers/) |
| Design for Ionizing Radiation Protection (OCHMO-TB-020) | NASA | Shielding, dosimetry, alerts | [Link](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-020-radiation-protection.pdf) |
| Moon Facts | NASA | Surface temperatures | [Link](https://science.nasa.gov/moon/facts/) |
| What Hazards Are Caused by Lunar Regolith? | NASA Science | Dust hazards | [Link](https://science.nasa.gov/biological-physical/what-hazards-are-caused-by-lunar-regolith/) |
| Recommended Crew Systems Capabilities for a 30 to 90-Day Four-Crew Lunar Surface Mission | NASA Technical Reports Server | Crew systems, medical capability | [Link](https://ntrs.nasa.gov/api/citations/20205001680/downloads/FINAL%20-%20Recommended%20Crew%20Systems%20Capabilities%20for%20a%2030-90-Day%20Four-Crew%20Lunar%20Surface%20Mission.pdf) |
| Open Science Data Repository | NASA | Astronaut health datasets | [Link](https://osdr.nasa.gov/) |

The habitat paper also cites NASA's Deep Space Habitation Overview, ECLSS information, Lunar Surface Technology, Leveraging Lunar Regolith to Further Space Exploration, What Hazards Are Caused by Lunar Regolith, Dust Mitigation and the NASA Space Place educational games, without links.

## Appendix: team diagrams

The mission planning paper includes three diagrams that summarise the system.

- [Mission Control Systems Hierarchy](https://www.figma.com/board/ca0h3ZOMBI5YwBYFyGStP4/Mission-Control-Systems-Hierarchy?node-id=0-1&p=f&t=kZornzlwrq5jZvbj-0)
- [Life Support Resource Loops](https://www.figma.com/board/DERoK1VYscXAoI9RpDOUk9/Life-Support-Resource-Loops?node-id=0-1&p=f&t=vKbrLstOsiM7txGR-0)
- [Mission Gameplay Flow](https://www.figma.com/board/SQBMpjYyE1DeSOdWlPRZKy/Mission-Gameplay-Flow?node-id=0-1&p=f&t=uL0NVo6cCfHxCwjO-0)
