/**
 * Project Artemis / ORBY: Solar System Celestial Telemetry & Planetary Dossier Data
 * Authentic NASA planetary physics, atmospheric compositions, and mission directives.
 */

export interface CelestialBodyData {
  id: string;
  name: string;
  tag: string;
  subtitle: string;
  description: string;
  gravity: string;
  temperature: string;
  distance: string;
  hazardLevel: string;
  missionObjective: string;
  color: string;
  isMoon?: boolean;
}

export const SOLAR_SYSTEM_DATA: Record<string, CelestialBodyData> = {
  Sun: {
    id: 'Sun',
    name: 'The Sun (Sol)',
    tag: 'YELLOW DWARF STAR · G2V',
    subtitle: 'Primary Solar System Luminary',
    description:
      'The Sun is the star at the center of the Solar System. It is a nearly perfect sphere of hot plasma, heated to incandescence by nuclear fusion reactions in its core, radiating energy as light and solar wind.',
    gravity: '274.0 m/s² · 28.0g',
    temperature: '5,500°C (Surface) / 15,000,000°C (Core)',
    distance: '1.00 AU · 149.6 million km',
    hazardLevel: 'Extreme Solar Energetic Protons',
    missionObjective:
      'Provides primary electrical photovoltaic power for lunar outposts, while occasionally blasting proton storms monitored by NASA DONKI.',
    color: '#ff8800',
  },
  Mercury: {
    id: 'Mercury',
    name: 'Mercury',
    tag: 'TERRESTRIAL PLANET · INMOST',
    subtitle: 'Extreme Thermal Swing World',
    description:
      'The smallest planet in the Solar System and closest to the Sun. Having almost no atmosphere to retain heat, its surface experiences wild thermal swings between blistering day and cryogenic night.',
    gravity: '3.70 m/s² · 0.38g',
    temperature: '-180°C to +430°C',
    distance: '0.39 AU · 57.9 million km',
    hazardLevel: 'Severe Solar Flux & No Atmosphere',
    missionObjective:
      'Scientific probe target for magnetospheric mapping and high-temperature solar dynamics research.',
    color: '#94a3b8',
  },
  Venus: {
    id: 'Venus',
    name: 'Venus',
    tag: 'TERRESTRIAL PLANET · SISTER WORLD',
    subtitle: 'Runaway Supercritical Greenhouse',
    description:
      'Second planet from the Sun with a crushing carbon dioxide atmosphere and reflective clouds of sulfuric acid. Surface atmospheric pressure reaches 92 times Earth’s sea-level pressure.',
    gravity: '8.87 m/s² · 0.904g',
    temperature: '465°C Uniform Surface',
    distance: '0.72 AU · 108.2 million km',
    hazardLevel: 'Sulfuric Rain & 92 Bar Pressure',
    missionObjective:
      'Comparative planetary climatology for runaway greenhouse feedback and volcanic seismic monitoring.',
    color: '#f59e0b',
  },
  Earth: {
    id: 'Earth',
    name: 'Earth',
    tag: 'TERRESTRIAL PLANET · HOMEWORLD',
    subtitle: 'Only Known Oasis of Life',
    description:
      "Earth is the third planet from the Sun and the only astronomical object known to harbor life. About 29.2% of Earth's surface is land consisting of continents and islands, wrapped in a protective nitrogen-oxygen atmosphere.",
    gravity: '9.807 m/s² · 1.00g',
    temperature: '-88°C to +58°C (15°C Mean)',
    distance: '0.00 AU · Home Origin',
    hazardLevel: 'None · Optimal Biosphere',
    missionObjective:
      'Mission control operations at Kennedy Space Center and continuous Deep Space Network (DSN) uplink relay.',
    color: '#0284c7',
  },
  'Moon (Artemis)': {
    id: 'Moon (Artemis)',
    name: 'The Moon (Luna / Artemis)',
    tag: 'TERRESTRIAL SATELLITE · LUNAR REVOLUTION',
    subtitle: 'Artemis Base Camp Target · Shackleton Crater',
    description:
      "Earth's only natural satellite. Shackleton Crater at the lunar South Pole features peaks of eternal light for solar power and permanently shadowed craters containing water ice deposits vital for human life support.",
    gravity: '1.62 m/s² · 0.166g (1/6th Earth)',
    temperature: '-130°C (Night) / +120°C (Day)',
    distance: '384,400 km · 1.28 Light-Sec',
    hazardLevel: 'Abrasive Regolith & Micrometeorites',
    missionObjective:
      'PRIMARY BASE CAMP: Deploy habitat modules, drill regolith water ice, and establish humanity’s permanent presence on the lunar frontier.',
    color: '#38bdf8',
    isMoon: true,
  },
  Mars: {
    id: 'Mars',
    name: 'Mars',
    tag: 'TERRESTRIAL PLANET · RED PLANET',
    subtitle: 'Next Frontier of Human Habitation',
    description:
      'Fourth planet from the Sun, featuring Olympus Mons, the largest volcano in the Solar System, and ancient river deltas at Jezero Crater. An iron oxide-rich crust gives it its signature reddish hue.',
    gravity: '3.72 m/s² · 0.379g',
    temperature: '-140°C to +20°C (-63°C Mean)',
    distance: '1.52 AU · 227.9 million km',
    hazardLevel: 'Perchlorates & Global Dust Storms',
    missionObjective:
      'Secondary destination for Project Artemis follow-on crewed interplanetary colonization.',
    color: '#ea580c',
  },
  Jupiter: {
    id: 'Jupiter',
    name: 'Jupiter',
    tag: 'GAS GIANT · SYSTEM KING',
    subtitle: 'Massive Magnetosphere & 95 Moons',
    description:
      'The largest planet in the Solar System, more than twice as massive as all other planets combined. Composed predominantly of hydrogen and helium with dynamic atmospheric bands and the centuries-old Great Red Spot.',
    gravity: '24.79 m/s² · 2.528g',
    temperature: '-110°C (Cloud Tops)',
    distance: '5.20 AU · 778.5 million km',
    hazardLevel: 'Lethal Synchrotron Radiation Belts',
    missionObjective:
      'Gravitational slingshot corridor and exploration outpost for the icy ocean worlds Europa and Ganymede.',
    color: '#d97706',
  },
  Saturn: {
    id: 'Saturn',
    name: 'Saturn',
    tag: 'GAS GIANT · RINGED JEWEL',
    subtitle: 'Spectacular Planetary Ring System',
    description:
      'Second-largest planet in the Solar System, adorned with a dazzling system of icy rings spanning thousands of kilometers but only tens of meters thick.',
    gravity: '10.44 m/s² · 1.065g',
    temperature: '-140°C (Mean Cloud Top)',
    distance: '9.58 AU · 1.43 billion km',
    hazardLevel: 'Ring Particle Collisions & Cryo-Vortex',
    missionObjective:
      'Deep-space observation of organic chemistry precursors on Titan and active cryo-geysers on Enceladus.',
    color: '#ca8a04',
  },
};
