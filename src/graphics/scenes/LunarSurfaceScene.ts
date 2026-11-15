/**
 * Project Artemis: Level 4 - The Lunar Surface Outpost (LEVEL_LUNAR_SURFACE)
 * Core gameplay level: 3D Moon landscape, Earth on horizon, rotating Sun cycle,
 * Artemis Base Camp modules (Hab Dome, Solar Array, Kilopower, Greenhouse, Recycler),
 * deployed ACES astronauts, and crisis visual effects.
 */

import * as THREE from 'three';
import { createAstronautActor, AstronautActor } from '../AstronautBuilder.ts';
import {
  createRegolithTexture,
  createSolarPanelTexture,
  createEarthTexture,
} from '../ProceduralTextures.ts';
import { GameParticleSystem } from '../ParticleSystem.ts';
import { AstronautCrew, GameSimulationState } from '../../types/game.ts';

interface WanderState {
  target: THREE.Vector3;
  basePos: THREE.Vector3;
  timer: number;
}

export class LunarSurfaceScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public particles: GameParticleSystem;
  public actors: AstronautActor[] = [];
  public interactiveObjects: THREE.Object3D[] = [];
  public solarArrayGroup: THREE.Group | null = null;
  public sunLight: THREE.DirectionalLight;
  public sunMesh: THREE.Mesh;
  public earthMesh: THREE.Mesh;
  public alarmLight: THREE.PointLight;
  public steamOrigin: THREE.Vector3 = new THREE.Vector3(4.5, 1.2, -3.0);
  private targetCamPos = new THREE.Vector3(0, 10.0, 22.0);
  private targetCamLook = new THREE.Vector3(0, 1.5, 0);
  private wanderStates = new Map<string, WanderState>();

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#020306');
    this.scene.fog = new THREE.FogExp2('#020306', 0.015);

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.copy(this.targetCamPos);
    this.camera.lookAt(this.targetCamLook);

    this.particles = new GameParticleSystem(600);
    this.scene.add(this.particles.points);

    // Realistic Deep-Space Vacuum (No atmospheric fog on the Moon)
    this.scene.background = new THREE.Color('#010204');
    this.scene.fog = null;

    // Crisp Pin-Point Lunar Starfield (Pin-point distant stars without atmospheric twinkling)
    this.buildStarfield();

    // Directional Sunlight: Brilliant incandescent white with sharp, high-contrast shadows
    this.sunLight = new THREE.DirectionalLight(0xffffff, 3.4);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 160;
    this.sunLight.shadow.camera.left = -32;
    this.sunLight.shadow.camera.right = 32;
    this.sunLight.shadow.camera.top = 32;
    this.sunLight.shadow.camera.bottom = -32;
    this.sunLight.shadow.bias = -0.0001;
    this.scene.add(this.sunLight);

    // Distant radiant Sun in deep space (Brilliant white core with soft solar halo)
    const sunGroup = new THREE.Group();
    const sunGeo = new THREE.SphereGeometry(6.2, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunGroup.add(this.sunMesh);

    const coronaGeo = new THREE.SphereGeometry(7.8, 24, 24);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xfffae0,
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide,
    });
    const corona = new THREE.Mesh(coronaGeo, coronaMat);
    sunGroup.add(corona);
    this.scene.add(sunGroup);

    // Blue Earth hovering on the lunar horizon with realistic atmospheric sheen
    const earthGeo = new THREE.SphereGeometry(7.2, 36, 36);
    const earthMat = new THREE.MeshStandardMaterial({
      map: createEarthTexture(),
      roughness: 0.55,
      metalness: 0.15,
    });
    this.earthMesh = new THREE.Mesh(earthGeo, earthMat);
    this.earthMesh.position.set(-60, 28, -120);
    this.earthMesh.rotation.y = 1.2;
    this.scene.add(this.earthMesh);

    // Subtle Earthshine ambient fill (Cool blue specular bounce on shadows)
    const earthshine = new THREE.AmbientLight(0x0e1828, 0.4);
    this.scene.add(earthshine);

    // Emergency red flashing alarm beacon light
    this.alarmLight = new THREE.PointLight(0xff0000, 0, 35);
    this.alarmLight.position.set(0, 5.5, 0);
    this.scene.add(this.alarmLight);

    this.buildTerrain();
    this.buildBaseModules();
  }

  private buildStarfield() {
    const starCount = 1400;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0) * 0.48; // Upper celestial dome
      const r = Math.random() * 80 + 260;

      positions[i * 3] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 1] = Math.max(6, r * Math.cos(phi));
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.cos(theta);

      // Realistic stellar temperatures (hot blue-white, pure white, warm yellow)
      const roll = Math.random();
      if (roll < 0.68) {
        colors[i * 3] = 0.95;
        colors[i * 3 + 1] = 0.95;
        colors[i * 3 + 2] = 1.0;
      } else if (roll < 0.88) {
        colors[i * 3] = 0.8;
        colors[i * 3 + 1] = 0.88;
        colors[i * 3 + 2] = 1.0;
      } else {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.88;
        colors[i * 3 + 2] = 0.72;
      }
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      sizeAttenuation: false,
    });

    const stars = new THREE.Points(starGeo, starMat);
    this.scene.add(stars);
  }

  private buildTerrain() {
    const regolithTex = createRegolithTexture();
    regolithTex.repeat.set(16, 16);

    const terrainGeo = new THREE.PlaneGeometry(120, 120, 48, 48);
    terrainGeo.rotateX(-Math.PI / 2);

    // Procedural lunar elevation displacement
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Flattish base area in center (radius < 18)
      const distFromCenter = Math.sqrt(x * x + z * z);
      let height = 0;

      if (distFromCenter > 16) {
        // Rolling crater ridges on the perimeter
        height = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 2.8 + Math.sin(x * 0.2) * 1.2;
      }

      pos.setY(i, height);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      map: regolithTex,
      roughness: 0.95,
      metalness: 0.05,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.receiveShadow = true;
    this.scene.add(terrain);

    // Scattered jagged lunar boulders
    const boulderMat = new THREE.MeshStandardMaterial({
      color: 0x5a5d66,
      roughness: 0.9,
    });
    for (let b = 0; b < 24; b++) {
      const bGeo = new THREE.DodecahedronGeometry(Math.random() * 0.8 + 0.4, 1);
      const boulder = new THREE.Mesh(bGeo, boulderMat);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 35 + 12;
      boulder.position.set(Math.cos(angle) * dist, 0.3, Math.sin(angle) * dist);
      boulder.rotation.set(Math.random(), Math.random(), Math.random());
      boulder.castShadow = true;
      this.scene.add(boulder);
    }
  }

  private buildBaseModules() {
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0xd8dee9,
      roughness: 0.35,
      metalness: 0.4,
    });

    // 1. Pressurized Habitation Dome (Command Module)
    const domeGroup = new THREE.Group();
    domeGroup.position.set(0, 0, 0);

    const domeGeo = new THREE.SphereGeometry(4.8, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const dome = new THREE.Mesh(domeGeo, hullMat);
    dome.castShadow = true;
    dome.receiveShadow = true;
    dome.name = 'MODULE_HAB_DOME';
    domeGroup.add(dome);
    this.interactiveObjects.push(dome);

    // Glowing Airlock Entry Tunnel
    const airlockGeo = new THREE.CylinderGeometry(1.1, 1.1, 2.5, 16);
    airlockGeo.rotateZ(Math.PI / 2);
    const airlock = new THREE.Mesh(airlockGeo, hullMat);
    airlock.position.set(0, 1.1, 4.6);
    airlock.castShadow = true;
    domeGroup.add(airlock);

    // Cyan airlock status beacon
    const beaconGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 2.2, 4.6);
    domeGroup.add(beacon);

    this.scene.add(domeGroup);

    // 2. Solar Tracking Array
    this.solarArrayGroup = new THREE.Group();
    this.solarArrayGroup.position.set(-9.5, 0, 5.0);

    const mastGeo = new THREE.CylinderGeometry(0.2, 0.25, 4.5, 12);
    const mast = new THREE.Mesh(mastGeo, hullMat);
    mast.position.y = 2.25;
    this.solarArrayGroup.add(mast);

    const panelTex = createSolarPanelTexture();
    panelTex.repeat.set(4, 2);
    const panelMat = new THREE.MeshStandardMaterial({
      map: panelTex,
      roughness: 0.2,
      metalness: 0.7,
      side: THREE.DoubleSide,
    });
    const panelGeo = new THREE.PlaneGeometry(6.5, 2.8);
    panelGeo.rotateX(Math.PI * 0.25);
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.y = 4.4;
    panel.castShadow = true;
    this.solarArrayGroup.add(panel);
    this.scene.add(this.solarArrayGroup);

    // 3. Kilopower Fission Nuclear Unit
    const kpKiloGroup = new THREE.Group();
    kpKiloGroup.position.set(-8.0, 0, -8.0);

    const kpCoreGeo = new THREE.CylinderGeometry(0.9, 1.1, 2.2, 16);
    const kpCoreMat = new THREE.MeshStandardMaterial({ color: 0x3b4252, roughness: 0.5, metalness: 0.7 });
    const kpCore = new THREE.Mesh(kpCoreGeo, kpCoreMat);
    kpCore.position.y = 1.1;
    kpCore.castShadow = true;
    kpKiloGroup.add(kpCore);

    // Radiator Cooling Fins
    const finMat = new THREE.MeshStandardMaterial({ color: 0x8892b0, roughness: 0.3, metalness: 0.8 });
    for (let f = 0; f < 4; f++) {
      const angle = (f / 4) * Math.PI;
      const finGeo = new THREE.BoxGeometry(0.08, 1.8, 3.2);
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.position.y = 1.8;
      fin.rotation.y = angle;
      kpKiloGroup.add(fin);
    }
    this.scene.add(kpKiloGroup);

    // 4. Closed-Loop ECLSS Recycler & Ice Extractor
    const recyclerGroup = new THREE.Group();
    recyclerGroup.position.set(4.5, 0, -3.0);

    const recyclerGeo = new THREE.BoxGeometry(3.0, 2.2, 2.5);
    const recycler = new THREE.Mesh(recyclerGeo, hullMat);
    recycler.position.y = 1.1;
    recycler.castShadow = true;
    recycler.name = 'MODULE_RECYCLER';
    recyclerGroup.add(recycler);
    this.interactiveObjects.push(recycler);

    // Storage tanks on top
    const waterTankGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.6, 12);
    waterTankGeo.rotateZ(Math.PI / 2);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x4c566a, roughness: 0.4 });
    const waterTank = new THREE.Mesh(waterTankGeo, tankMat);
    waterTank.position.set(0, 2.4, 0);
    recyclerGroup.add(waterTank);
    this.scene.add(recyclerGroup);

    // 5. Hydroponic Lunar Greenhouse Dome
    const greenGroup = new THREE.Group();
    greenGroup.position.set(8.5, 0, 4.0);

    const greenGeo = new THREE.CylinderGeometry(2.0, 2.0, 1.8, 16);
    const greenMat = new THREE.MeshPhysicalMaterial({
      color: 0x88ffaa,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
      metalness: 0.1,
    });
    const greenhouse = new THREE.Mesh(greenGeo, greenMat);
    greenhouse.position.y = 0.9;
    greenhouse.castShadow = true;
    greenGroup.add(greenhouse);

    // Interior grow light (magenta LED glow)
    const growLight = new THREE.PointLight(0xff00bb, 1.8, 8);
    growLight.position.set(0, 1.2, 0);
    greenGroup.add(growLight);
    this.scene.add(greenGroup);
  }

  public populateCrew(crewList: AstronautCrew[]) {
    // 4 crew initial positions on lunar regolith (all 4 in full view from default camera)
    const initialPositions = [
      new THREE.Vector3(-1.8, 0, 6.2), // Cmdr. Sarah Chen (central airlock entrance)
      new THREE.Vector3(5.5, 0, 4.8),  // Dr. Marcus Vance (Hydroponic Greenhouse flank)
      new THREE.Vector3(-4.8, 0, 4.2), // Dr. Elena Rostova (Solar Array / Comms flank)
      new THREE.Vector3(2.2, 0, 6.0),  // Lt. Tyler Hayes (Rover bay / front expedition post)
    ];

    crewList.forEach((c, idx) => {
      const pos = initialPositions[idx] || new THREE.Vector3(idx * 2, 0, 0);
      const actor = createAstronautActor(c.id, c.suitColor);
      actor.group.position.copy(pos);
      this.scene.add(actor.group);
      this.actors.push(actor);

      // Seed wander state so each crew member starts with a unique phase
      this.wanderStates.set(c.id, {
        target: pos.clone(),
        basePos: pos.clone(),
        timer: idx * 1.5 + Math.random() * 2.0,
      });

      actor.group.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.userData = { crewId: c.id, actor };
          this.interactiveObjects.push(child);
        }
      });
    });
  }

  public focusAstronaut(crewId: string | null) {
    if (!crewId) {
      this.targetCamPos.set(0, 10.0, 22.0);
      this.targetCamLook.set(0, 1.5, 0);
      return;
    }
    const actor = this.actors.find((a) => a.id === crewId);
    if (actor) {
      this.targetCamPos.set(
        actor.group.position.x + 1.2,
        actor.group.position.y + 2.0,
        actor.group.position.z + 4.5
      );
      this.targetCamLook.set(
        actor.group.position.x,
        actor.group.position.y + 1.2,
        actor.group.position.z
      );
    }
  }

  public update(delta: number, gameState: GameSimulationState) {
    this.particles.update(delta);

    // 1. Sun Position & Day/Night Solar Lighting
    const sunRad = (gameState.sunAngle * Math.PI) / 180;
    const sunDist = 90;
    const sunX = Math.cos(sunRad) * sunDist;
    const sunY = Math.sin(sunRad) * sunDist;
    const sunZ = Math.sin(sunRad * 0.5) * 35;

    this.sunMesh.position.set(sunX, Math.max(-10, sunY), sunZ);
    this.sunLight.position.set(sunX, Math.max(0.5, sunY), sunZ);
    this.sunLight.target.position.set(0, 0, 0);

    // Dim sunlight at night / penumbra
    if (gameState.lunarPhase === 'NIGHT') {
      this.sunLight.intensity = 0.05;
      this.sunMesh.visible = false;
    } else {
      this.sunLight.intensity = Math.max(0.4, Math.sin(sunRad) * 3.5);
      this.sunMesh.visible = true;
    }

    // 2. Solar Tracking Array servo rotation towards Sun
    if (this.solarArrayGroup && gameState.lunarPhase !== 'NIGHT') {
      const targetAngle = Math.atan2(sunX, sunZ);
      this.solarArrayGroup.rotation.y = THREE.MathUtils.damp(
        this.solarArrayGroup.rotation.y,
        targetAngle,
        2,
        delta
      );
    }

    // 3. Crisis Visual Effects
    if (gameState.activeCrisis && !gameState.activeCrisis.resolved) {
      // Red alarm flashing beacon
      const flash = Math.sin(performance.now() * 0.008) > 0 ? 3.5 : 0;
      this.alarmLight.intensity = flash;

      if (gameState.activeCrisis.type === 'RECYCLER_BURST') {
        // Vent steam particles into vacuum
        this.particles.emit('PIPE_STEAM', this.steamOrigin, 4);
      } else if (gameState.activeCrisis.type === 'SOLAR_STORM') {
        // High-energy radiation sparkles across the sky
        const stormPos = new THREE.Vector3(
          (Math.random() - 0.5) * 30,
          Math.random() * 8 + 2,
          (Math.random() - 0.5) * 30
        );
        this.particles.emit('SOLAR_STORM', stormPos, 3);
      }
    } else {
      this.alarmLight.intensity = 0;
    }

    // 4. Update Astronauts
    this.actors.forEach((actor, idx) => {
      const crewData = gameState.crew.find((c) => c.id === actor.id);
      const health = crewData ? crewData.health : 100;
      // 'let' so wander logic can override the game-state flag
      let isWalking = crewData ? crewData.isWalking : false;

      if (crewData?.task === 'eva_repair') {
        actor.group.position.x = THREE.MathUtils.damp(actor.group.position.x, 4.0, 2, delta);
        actor.group.position.z = THREE.MathUtils.damp(actor.group.position.z, 0.5, 2, delta);
        actor.group.lookAt(4.5, 1.2, -1.0);
        const dx = 4.0 - actor.group.position.x;
        const dz = 0.5 - actor.group.position.z;
        isWalking = Math.sqrt(dx * dx + dz * dz) > 0.4;
      } else if (crewData?.task === 'storm_shelter') {
        const spacing = (idx - 1.5) * 1.1;
        actor.group.position.x = THREE.MathUtils.damp(actor.group.position.x, spacing, 3, delta);
        actor.group.position.z = THREE.MathUtils.damp(actor.group.position.z, 5.6, 3, delta);
        actor.group.lookAt(0, 1.0, 4.6);
        const dx = spacing - actor.group.position.x;
        const dz = 5.6 - actor.group.position.z;
        isWalking = Math.sqrt(dx * dx + dz * dz) > 0.4;
      } else if (crewData?.task === 'hydroponics') {
        actor.group.position.x = THREE.MathUtils.damp(actor.group.position.x, 6.2, 2, delta);
        actor.group.position.z = THREE.MathUtils.damp(actor.group.position.z, 4.8, 2, delta);
        actor.group.lookAt(8.5, 0.9, 4.0);
        const dx = 6.2 - actor.group.position.x;
        const dz = 4.8 - actor.group.position.z;
        isWalking = Math.sqrt(dx * dx + dz * dz) > 0.4;
      } else if (crewData?.task === 'power_grid') {
        actor.group.position.x = THREE.MathUtils.damp(actor.group.position.x, -6.5, 2, delta);
        actor.group.position.z = THREE.MathUtils.damp(actor.group.position.z, 3.2, 2, delta);
        actor.group.lookAt(-9.5, 1.1, 5.0);
        const dx = -6.5 - actor.group.position.x;
        const dz = 3.2 - actor.group.position.z;
        isWalking = Math.sqrt(dx * dx + dz * dz) > 0.4;
      } else if (crewData?.task === 'research') {
        actor.group.position.x = THREE.MathUtils.damp(actor.group.position.x, -3.2, 2, delta);
        actor.group.position.z = THREE.MathUtils.damp(actor.group.position.z, 5.8, 2, delta);
        actor.group.lookAt(-3.2, 0, 10.0);
        const dx = -3.2 - actor.group.position.x;
        const dz = 5.8 - actor.group.position.z;
        isWalking = Math.sqrt(dx * dx + dz * dz) > 0.4;
      } else if (crewData?.task === 'resting') {
        const spacing = (idx - 1.5) * 1.0;
        actor.group.position.x = THREE.MathUtils.damp(actor.group.position.x, spacing, 2, delta);
        actor.group.position.z = THREE.MathUtils.damp(actor.group.position.z, 6.8, 2, delta);
        actor.group.lookAt(0, 0, 0);
        isWalking = false; // Resting — no walking animation
      } else {
        // Idle: gentle procedural wander around the crew member's home position
        const ws = this.wanderStates.get(actor.id);
        if (ws) {
          ws.timer -= delta;
          if (ws.timer <= 0) {
            // Pick a new random destination within a 2.5-unit radius of base position
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.5 + Math.random() * 2.0;
            ws.target.set(
              ws.basePos.x + Math.cos(angle) * radius,
              0,
              ws.basePos.z + Math.sin(angle) * radius,
            );
            // Pause at target for 2–6 s, then wander again
            ws.timer = 2.0 + Math.random() * 4.0;
          }
          const dx = ws.target.x - actor.group.position.x;
          const dz = ws.target.z - actor.group.position.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist > 0.25) {
            // Drift smoothly toward the wander target
            actor.group.position.x = THREE.MathUtils.damp(actor.group.position.x, ws.target.x, 1.4, delta);
            actor.group.position.z = THREE.MathUtils.damp(actor.group.position.z, ws.target.z, 1.4, delta);
            // Face the direction of travel
            actor.group.rotation.y = Math.atan2(dx, dz);
            isWalking = true;
          } else {
            isWalking = false; // Arrived — stand and breathe
          }
        }
      }

      actor.update(delta, isWalking, health);
    });
  }
}
