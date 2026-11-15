/**
 * Project Artemis: Level 2 - 3D Solar System Flight Deck (LEVEL_ORRERY)
 * SimonDev-Inspired Solar System Simulation:
 * - Animated multi-frequency solar plasma shader & blazing corona
 * - True screen-projected hexagonal lens flare bokeh & rainbow chromatic ring
 * - Radiant glowing red/coral highlighted orbit for selected celestial targets
 * - Realistic PBR planet textures: Earth with glowing Fresnel atmosphere,
 *   turbulent banded Jupiter, Saturn with 3D rings & Cassini division, Mars, Venus, Mercury
 * - Smooth celestial camera tracking with interactive orbit pan controls
 */

import * as THREE from 'three';
import {
  createRegolithTexture,
  createSunShaderMaterial,
  createSunCoronaTexture,
  createRainbowHaloTexture,
  createHexagonFlareTexture,
  createFlareStarburstTexture,
  createEarthTexture,
  createAtmosphereMaterial,
  createJupiterTexture,
  createSaturnTexture,
  createSaturnRingTexture,
  createMarsTexture,
  createVenusTexture,
  createMercuryTexture,
} from '../ProceduralTextures.ts';

export interface PlanetNode {
  id: string;
  name: string;
  mesh: THREE.Mesh;
  group: THREE.Group;
  orbitRadius: number;
  orbitSpeed: number;
  angle: number;
  info: string;
}

interface FlareElement {
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  t: number; // Position along flare line: 0 = Sun, 1 = Center, 2 = Opposite
  scale: number;
  baseOpacity: number;
}

export class OrreryScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public planets: PlanetNode[] = [];
  public interactiveMeshes: THREE.Mesh[] = [];
  public moonMesh: THREE.Mesh | null = null;
  public marsMesh: THREE.Mesh | null = null;
  public sunLight: THREE.PointLight;
  public isHyperspace: boolean = false;
  private hyperspaceProgress: number = 0;

  public orbitSpeedMultiplier: number = 1.0;
  public focusedTarget: string = 'System View';

  // Sun & Corona Elements
  private sunMesh: THREE.Mesh | null = null;
  private sunShaderMat: THREE.ShaderMaterial | null = null;
  private coronaSprite: THREE.Sprite | null = null;
  private outerCoronaSprite: THREE.Sprite | null = null;
  private rainbowHaloSprite: THREE.Sprite | null = null;

  // Orbit Rings Map
  private orbitLines: Map<string, THREE.Line> = new Map();
  private orbitGlowRings: Map<string, THREE.Mesh> = new Map();

  // Screen-Space Hexagonal Lens Flare System (Attached to Camera)
  private lensFlareContainer: THREE.Group = new THREE.Group();
  private flareElements: FlareElement[] = [];

  // Clouds & Atmospheres
  private earthCloudsMesh: THREE.Mesh | null = null;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#030509');

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1500);
    this.camera.position.set(0, 22, 38);
    this.camera.lookAt(0, 0, 0);

    // Sun Point Light at origin (illuminates all planets from center)
    this.sunLight = new THREE.PointLight(0xfffaea, 4.5, 350, 1.0);
    this.sunLight.position.set(0, 0, 0);
    this.scene.add(this.sunLight);

    // Deep space subtle ambient light (preserves dark shadows on night side)
    const ambient = new THREE.AmbientLight(0x182030, 0.4);
    this.scene.add(ambient);

    this.buildStarfield();
    this.buildSun();
    this.buildPlanetarySystem();
    this.buildLensFlare();
    this.highlightOrbitLine(this.focusedTarget);
  }

  // Realistic deep space starfield with varying star sizes & temperatures
  private buildStarfield() {
    const starCount = 2200;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const tempPalettes = [
      new THREE.Color(0xffffff), // White
      new THREE.Color(0x99ccff), // Blue-white
      new THREE.Color(0xfff0cc), // Warm white
      new THREE.Color(0xffcc88), // Yellow-orange
      new THREE.Color(0x66aaff), // Deep blue
    ];

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      const r = 350 + Math.random() * 250;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPos[idx] = r * Math.sin(phi) * Math.cos(theta);
      starPos[idx + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[idx + 2] = r * Math.cos(phi);

      const color = tempPalettes[Math.floor(Math.random() * tempPalettes.length)];
      starColors[idx] = color.r;
      starColors[idx + 1] = color.g;
      starColors[idx + 2] = color.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });

    const starField = new THREE.Points(starGeo, starMat);
    this.scene.add(starField);
  }

  // SimonDev Glowing Sun with animated plasma shader, corona, and rainbow halo
  private buildSun() {
    // 1. Sun Sphere with animated procedural plasma shader
    const sunGeo = new THREE.SphereGeometry(3.3, 48, 48);
    this.sunShaderMat = createSunShaderMaterial();
    const sun = new THREE.Mesh(sunGeo, this.sunShaderMat);
    sun.name = 'CELESTIAL_SUN';
    sun.userData = { celestialId: 'Sun' };
    this.scene.add(sun);
    this.sunMesh = sun;
    this.interactiveMeshes.push(sun);

    // 2. Soft Corona Edge Glow Sprite (subtle glow hugging the sun perimeter)
    const coronaTex = createSunCoronaTexture();
    const coronaMat = new THREE.SpriteMaterial({
      map: coronaTex,
      color: 0xffddaa,
      transparent: true,
      opacity: 0.40,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const corona = new THREE.Sprite(coronaMat);
    corona.scale.set(8.8, 8.8, 1);
    this.scene.add(corona);
    this.coronaSprite = corona;

    // 3. Wide Atmospheric Warm Solar Glow
    const outerCoronaMat = new THREE.SpriteMaterial({
      map: coronaTex,
      color: 0xff6611,
      transparent: true,
      opacity: 0.20,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const outerCorona = new THREE.Sprite(outerCoronaMat);
    outerCorona.scale.set(14.5, 14.5, 1);
    this.scene.add(outerCorona);
    this.outerCoronaSprite = outerCorona;

    // 4. Circular Rainbow / Chromatic Halo Ring (Matches SimonDev's screenshot!)
    const rainbowTex = createRainbowHaloTexture();
    const rainbowMat = new THREE.SpriteMaterial({
      map: rainbowTex,
      color: 0xffffff,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const rainbowHalo = new THREE.Sprite(rainbowMat);
    rainbowHalo.scale.set(12.0, 12.0, 1);
    this.scene.add(rainbowHalo);
    this.rainbowHaloSprite = rainbowHalo;
  }

  // SimonDev Optical Screen-Projected Hexagonal Lens Flare Bokeh
  private buildLensFlare() {
    this.lensFlareContainer = new THREE.Group();
    // Attach lens flare container directly as child of camera for screen-space tracking
    this.camera.add(this.lensFlareContainer);
    this.scene.add(this.camera);

    const starburstTex = createFlareStarburstTexture();
    const hexTexCyan = createHexagonFlareTexture('rgba(40, 150, 255, 0.12)', 'rgba(90, 195, 255, 0.35)');
    const hexTexBlue = createHexagonFlareTexture('rgba(30, 100, 240, 0.10)', 'rgba(70, 170, 255, 0.30)');
    const hexTexPurple = createHexagonFlareTexture('rgba(100, 60, 230, 0.08)', 'rgba(150, 120, 255, 0.25)');

    // SimonDev optical flare train: subtle, translucent bokeh hexagons
    const elementDefs = [
      { map: starburstTex, t: 0.0,  scale: 0.08, baseOpacity: 0.45 },  // Sun center small glint
      { map: hexTexCyan,   t: 0.35, scale: 0.07, baseOpacity: 0.20 },  // Small cyan hexagon
      { map: hexTexBlue,   t: 0.65, scale: 0.12, baseOpacity: 0.25 },  // Medium blue hexagon
      { map: starburstTex, t: 0.95, scale: 0.04, baseOpacity: 0.35 },  // Subtle center pin
      { map: hexTexCyan,   t: 1.25, scale: 0.10, baseOpacity: 0.22 },  // Secondary cyan hexagon
      { map: hexTexBlue,   t: 1.55, scale: 0.16, baseOpacity: 0.20 },  // Medium blue hexagon
      { map: hexTexPurple, t: 1.90, scale: 0.24, baseOpacity: 0.15 },  // Soft violet hexagon
    ];

    elementDefs.forEach((def) => {
      const geo = new THREE.PlaneGeometry(1, 1);
      const mat = new THREE.MeshBasicMaterial({
        map: def.map,
        transparent: true,
        opacity: def.baseOpacity,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.renderOrder = 9999;
      this.lensFlareContainer.add(mesh);

      this.flareElements.push({
        mesh,
        material: mat,
        t: def.t,
        scale: def.scale,
        baseOpacity: def.baseOpacity,
      });
    });
  }

  // Planetary System with High-Fidelity Textures and Orbit Lines
  private buildPlanetarySystem() {
    // Helper to build orbit line and glowing highlight ring
    const addOrbitLine = (planetId: string, radius: number) => {
      const segments = 180;
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);

      // Base subtle orbital trajectory
      const mat = new THREE.LineBasicMaterial({
        color: 0x3b628f,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
      });
      const line = new THREE.Line(geo, mat);
      line.name = `ORBIT_${planetId}`;
      this.scene.add(line);
      this.orbitLines.set(planetId, line);

      // Glowing SimonDev Highlight Ring (visible when selected)
      const glowGeo = new THREE.RingGeometry(radius - 0.08, radius + 0.08, 128);
      glowGeo.rotateX(Math.PI / 2);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xff4433,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glowRing = new THREE.Mesh(glowGeo, glowMat);
      glowRing.name = `ORBIT_GLOW_${planetId}`;
      this.scene.add(glowRing);
      this.orbitGlowRings.set(planetId, glowRing);
    };

    // 1. Mercury
    const mercGroup = new THREE.Group();
    const mercGeo = new THREE.SphereGeometry(0.42, 32, 32);
    const mercMat = new THREE.MeshStandardMaterial({
      map: createMercuryTexture(),
      roughness: 0.9,
      metalness: 0.1,
    });
    const mercMesh = new THREE.Mesh(mercGeo, mercMat);
    mercMesh.name = 'CELESTIAL_MERCURY';
    mercMesh.userData = { celestialId: 'Mercury' };
    mercGroup.add(mercMesh);
    addOrbitLine('Mercury', 5.6);
    this.planets.push({
      id: 'Mercury',
      name: 'Mercury',
      mesh: mercMesh,
      group: mercGroup,
      orbitRadius: 5.6,
      orbitSpeed: 0.75,
      angle: 0.6,
      info: 'Innermost rocky planet, scorched by solar radiation.',
    });
    this.interactiveMeshes.push(mercMesh);
    this.scene.add(mercGroup);

    // 2. Venus
    const venusGroup = new THREE.Group();
    const venusGeo = new THREE.SphereGeometry(0.78, 32, 32);
    const venusMat = new THREE.MeshStandardMaterial({
      map: createVenusTexture(),
      roughness: 0.5,
      metalness: 0.0,
    });
    const venusMesh = new THREE.Mesh(venusGeo, venusMat);
    venusMesh.name = 'CELESTIAL_VENUS';
    venusMesh.userData = { celestialId: 'Venus' };
    venusGroup.add(venusMesh);
    addOrbitLine('Venus', 8.2);
    this.planets.push({
      id: 'Venus',
      name: 'Venus',
      mesh: venusMesh,
      group: venusGroup,
      orbitRadius: 8.2,
      orbitSpeed: 0.48,
      angle: 2.1,
      info: 'Dense CO2 atmosphere with runaway supercritical greenhouse temperatures.',
    });
    this.interactiveMeshes.push(venusMesh);
    this.scene.add(venusGroup);

    // 3. Earth & Moon System with Glowing Atmosphere
    const earthGroup = new THREE.Group();
    const earthGeo = new THREE.SphereGeometry(0.98, 48, 48);
    const earthMat = new THREE.MeshStandardMaterial({
      map: createEarthTexture(),
      roughness: 0.5,
      metalness: 0.08,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.name = 'CELESTIAL_EARTH';
    earthMesh.userData = { celestialId: 'Earth' };
    earthGroup.add(earthMesh);
    this.interactiveMeshes.push(earthMesh);

    // Earth Glowing Blue Atmospheric Fresnel Rim
    const atmoGeo = new THREE.SphereGeometry(1.025, 48, 48);
    const atmoMat = createAtmosphereMaterial(0x38bdf8);
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    earthGroup.add(atmoMesh);

    // Orbiting Moon (Artemis Target)
    const moonGeo = new THREE.SphereGeometry(0.34, 24, 24);
    const moonMat = new THREE.MeshStandardMaterial({
      map: createRegolithTexture(),
      roughness: 0.9,
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.position.set(2.1, 0.35, 0);
    moonMesh.name = 'PLANET_MOON';
    moonMesh.userData = { celestialId: 'Moon (Artemis)' };
    earthGroup.add(moonMesh);
    this.moonMesh = moonMesh;
    this.interactiveMeshes.push(moonMesh);

    addOrbitLine('Earth', 12.2);
    this.planets.push({
      id: 'Earth',
      name: 'Earth',
      mesh: earthMesh,
      group: earthGroup,
      orbitRadius: 12.2,
      orbitSpeed: 0.35,
      angle: 3.4,
      info: 'Destination: Artemis Base Camp on the Lunar South Pole.',
    });
    this.scene.add(earthGroup);

    // 4. Mars
    const marsGroup = new THREE.Group();
    const marsGeo = new THREE.SphereGeometry(0.62, 32, 32);
    const marsMat = new THREE.MeshStandardMaterial({
      map: createMarsTexture(),
      roughness: 0.85,
    });
    const marsMesh = new THREE.Mesh(marsGeo, marsMat);
    marsMesh.name = 'PLANET_MARS';
    marsMesh.userData = { celestialId: 'Mars' };
    marsGroup.add(marsMesh);
    this.marsMesh = marsMesh;
    this.interactiveMeshes.push(marsMesh);

    // Subtle Martian Red Atmosphere Rim
    const marsAtmoGeo = new THREE.SphereGeometry(0.645, 32, 32);
    const marsAtmoMat = createAtmosphereMaterial(0xff7744);
    marsAtmoMat.uniforms.uColor.value.setHex(0xff6633);
    const marsAtmo = new THREE.Mesh(marsAtmoGeo, marsAtmoMat);
    marsGroup.add(marsAtmo);

    addOrbitLine('Mars', 16.8);
    this.planets.push({
      id: 'Mars',
      name: 'Mars',
      mesh: marsMesh,
      group: marsGroup,
      orbitRadius: 16.8,
      orbitSpeed: 0.24,
      angle: 5.0,
      info: 'Secondary mission target: The Red Planet & Jezero Crater.',
    });
    this.scene.add(marsGroup);

    // 5. Jupiter
    const jupGroup = new THREE.Group();
    const jupGeo = new THREE.SphereGeometry(1.95, 48, 48);
    const jupMat = new THREE.MeshStandardMaterial({
      map: createJupiterTexture(),
      roughness: 0.65,
    });
    const jupMesh = new THREE.Mesh(jupGeo, jupMat);
    jupMesh.name = 'CELESTIAL_JUPITER';
    jupMesh.userData = { celestialId: 'Jupiter' };
    jupGroup.add(jupMesh);
    this.interactiveMeshes.push(jupMesh);

    addOrbitLine('Jupiter', 22.8);
    this.planets.push({
      id: 'Jupiter',
      name: 'Jupiter',
      mesh: jupMesh,
      group: jupGroup,
      orbitRadius: 22.8,
      orbitSpeed: 0.14,
      angle: 1.2,
      info: 'Gas giant with massive radiation belts and Great Red Spot.',
    });
    this.scene.add(jupGroup);

    // 6. Saturn with Realistic 3D Rings
    const satGroup = new THREE.Group();
    const satGeo = new THREE.SphereGeometry(1.55, 48, 48);
    const satMat = new THREE.MeshStandardMaterial({
      map: createSaturnTexture(),
      roughness: 0.7,
    });
    const satMesh = new THREE.Mesh(satGeo, satMat);
    satMesh.name = 'CELESTIAL_SATURN';
    satMesh.userData = { celestialId: 'Saturn' };
    satGroup.add(satMesh);
    this.interactiveMeshes.push(satMesh);

    // 3D Ring Disc with Cassini Division & Axial Tilt
    const ringGeo = new THREE.RingGeometry(2.1, 4.3, 96);
    ringGeo.rotateX(Math.PI * 0.42); // Realistic 26.7 degree axial inclination
    const ringMat = new THREE.MeshStandardMaterial({
      map: createSaturnRingTexture(),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
      roughness: 0.6,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    satGroup.add(ringMesh);

    addOrbitLine('Saturn', 29.2);
    this.planets.push({
      id: 'Saturn',
      name: 'Saturn',
      mesh: satMesh,
      group: satGroup,
      orbitRadius: 29.2,
      orbitSpeed: 0.08,
      angle: 4.4,
      info: 'Ringed jewel of the outer solar system.',
    });
    this.scene.add(satGroup);
  }

  // Highlight Active Selected Orbit in Radiant SimonDev Red/Coral
  public setFocusedTarget(target: string) {
    this.focusedTarget = target;
    this.highlightOrbitLine(target);
  }

  private highlightOrbitLine(target: string) {
    // Reset all orbits to subtle space blue
    this.orbitLines.forEach((line) => {
      const mat = line.material as THREE.LineBasicMaterial;
      mat.color.setHex(0x224466);
      mat.opacity = 0.35;
    });

    this.orbitGlowRings.forEach((glow) => {
      const mat = glow.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.0;
    });

    if (target === 'System View') return;

    // Highlight selected planet orbit
    const lineKey = target === 'Moon (Artemis)' ? 'Earth' : target;
    const selectedLine = this.orbitLines.get(lineKey);
    const selectedGlow = this.orbitGlowRings.get(lineKey);

    if (selectedLine) {
      const mat = selectedLine.material as THREE.LineBasicMaterial;
      mat.color.setHex(0xff4433); // Glowing Coral Red per SimonDev
      mat.opacity = 1.0;
    }
    if (selectedGlow) {
      const mat = selectedGlow.material as THREE.MeshBasicMaterial;
      mat.color.setHex(0xff4433);
      mat.opacity = 0.65;
    }
  }

  public setSpeedMultiplier(mult: number) {
    this.orbitSpeedMultiplier = mult;
  }

  public triggerHyperspace() {
    this.isHyperspace = true;
    this.hyperspaceProgress = 0;
  }

  // Get current world position of focused celestial target for camera tracking
  public getTargetWorldPosition(): THREE.Vector3 {
    if (this.focusedTarget === 'Sun') {
      return new THREE.Vector3(0, 0, 0);
    }
    if (this.focusedTarget === 'Moon (Artemis)' && this.moonMesh) {
      const pos = new THREE.Vector3();
      this.moonMesh.getWorldPosition(pos);
      return pos;
    }
    const found = this.planets.find(
      (p) =>
        p.id.toLowerCase() === this.focusedTarget.toLowerCase() ||
        p.name.toLowerCase().includes(this.focusedTarget.toLowerCase())
    );
    if (found) {
      const pos = new THREE.Vector3();
      found.mesh.getWorldPosition(pos);
      return pos;
    }
    return new THREE.Vector3(0, 0, 0);
  }

  // Master per-frame update loop
  public update(delta: number): boolean {
    const effectiveDelta = delta * this.orbitSpeedMultiplier;
    const elapsed = performance.now() * 0.001;

    // 1. Animate Sun Plasma Shader
    if (this.sunShaderMat) {
      this.sunShaderMat.uniforms.uTime.value = elapsed;
    }

    // 2. Pulse Corona Halo & Face Camera
    if (this.coronaSprite) {
      const s = 8.8 + Math.sin(elapsed * 2.0) * 0.4;
      this.coronaSprite.scale.set(s, s, 1);
    }
    if (this.outerCoronaSprite) {
      const s = 14.5 + Math.cos(elapsed * 1.5) * 0.6;
      this.outerCoronaSprite.scale.set(s, s, 1);
    }
    if (this.rainbowHaloSprite) {
      const s = 12.0 + Math.sin(elapsed * 1.0) * 0.3;
      this.rainbowHaloSprite.scale.set(s, s, 1);
    }

    // 3. Advance Planetary Revolutions & Self-Rotation
    this.planets.forEach((p) => {
      p.angle += p.orbitSpeed * effectiveDelta * 0.35;
      p.group.position.x = Math.cos(p.angle) * p.orbitRadius;
      p.group.position.z = Math.sin(p.angle) * p.orbitRadius;
      p.mesh.rotation.y += effectiveDelta * 0.6;
    });

    // Orbit Moon around Earth
    if (this.moonMesh) {
      const moonAngle = elapsed * 1.2 * this.orbitSpeedMultiplier;
      this.moonMesh.position.x = Math.cos(moonAngle) * 2.1;
      this.moonMesh.position.z = Math.sin(moonAngle) * 2.1;
      this.moonMesh.rotation.y += effectiveDelta * 0.4;
    }

    // 4. Update SimonDev Optical Screen-Projected Hexagonal Lens Flare
    this.updateLensFlare();

    // 5. Hyperspace Warp Transition
    if (this.isHyperspace) {
      this.hyperspaceProgress += delta * 1.5;
      const earthPos = this.planets.find((p) => p.name === 'Earth')?.group.position;
      if (earthPos) {
        this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, earthPos.x + 0.4, 4, delta);
        this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, earthPos.y + 0.3, 4, delta);
        this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, earthPos.z + 1.2, 4, delta);
        this.camera.lookAt(earthPos);
      }
      if (this.hyperspaceProgress >= 2.0) {
        return true;
      }
    }

    return false;
  }

  // Update lens flare elements along Sun-to-Center screen ray
  private updateLensFlare() {
    const sunWorld = new THREE.Vector3(0, 0, 0);
    const sunNDC = sunWorld.clone().project(this.camera);

    // Is Sun behind camera?
    const isBehind = sunNDC.z > 1.0;
    const edge = Math.max(Math.abs(sunNDC.x), Math.abs(sunNDC.y));

    // Distance of Sun from viewport center (0, 0)
    const distFromCenter = Math.sqrt(sunNDC.x * sunNDC.x + sunNDC.y * sunNDC.y);

    // Visibility falls off near viewport boundaries
    let edgeVisibility = 0.0;
    if (!isBehind && edge < 1.35) {
      edgeVisibility = Math.max(0, 1.0 - Math.max(0, edge - 0.75) / 0.6);
    }

    // Ghost elements ONLY appear when the Sun is off-center!
    // When looking straight at the Sun, ghostFactor = 0 so hexagons NEVER form concentric rings!
    const ghostFactor = THREE.MathUtils.smoothstep(distFromCenter, 0.06, 0.35);

    // View plane at z = -1.5 in camera local coordinates
    const viewDist = 1.5;
    const vFovRad = (this.camera.fov * Math.PI) / 180;
    const planeH = 2 * Math.tan(vFovRad / 2) * viewDist;
    const planeW = planeH * this.camera.aspect;

    this.flareElements.forEach((elem) => {
      // Elements with t > 0.05 are secondary ghosts (they require off-center Sun)
      const isGhost = elem.t > 0.05;
      const effectiveVisibility = isGhost ? edgeVisibility * ghostFactor : edgeVisibility * 0.4;

      if (effectiveVisibility <= 0.005) {
        elem.mesh.visible = false;
        return;
      }
      elem.mesh.visible = true;

      // Position along the optical flare line: p = sunNDC * (1 - t)
      const nx = sunNDC.x * (1 - elem.t);
      const ny = sunNDC.y * (1 - elem.t);

      const localX = (nx * planeW) / 2;
      const localY = (ny * planeH) / 2;

      elem.mesh.position.set(localX, localY, -viewDist);

      const s = elem.scale * (viewDist * 0.85);
      elem.mesh.scale.set(s, s, 1);

      // Rotate bokeh hexagons slightly along ray for organic diffraction
      const rayAngle = Math.atan2(sunNDC.y, sunNDC.x);
      elem.mesh.rotation.z = rayAngle + elem.t * 0.3;

      elem.material.opacity = elem.baseOpacity * effectiveVisibility;
    });
  }
}
