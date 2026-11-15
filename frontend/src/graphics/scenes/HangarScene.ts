/**
 * Project Artemis: Level 1 - Pre-Flight Hangar Bay (LEVEL_HANGAR)
 * High-tech pressurized hangar with 4 ACES astronauts on circular pedestals,
 * interactive central mission loadout console, and gantry spotlights.
 */

import * as THREE from 'three';
import { createAstronautActor, AstronautActor } from '../AstronautBuilder.ts';
import { createHazardStripeTexture } from '../ProceduralTextures.ts';
import { AstronautCrew } from '../../types/game.ts';

export class HangarScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public actors: AstronautActor[] = [];
  public interactiveObjects: THREE.Object3D[] = [];
  public engageButtonMesh: THREE.Mesh | null = null;
  private spotLights: THREE.SpotLight[] = [];
  private targetCamPos = new THREE.Vector3(0, 3.2, 7.8);
  private targetCamLook = new THREE.Vector3(0, 1.2, 0);

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#080b10');
    this.scene.fog = new THREE.FogExp2('#080b10', 0.045);

    this.camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 4.0, 9.5);
    this.camera.lookAt(0, 1.2, 0);

    this.buildLighting();
    this.buildHangarArchitecture();
    this.buildCentralTerminal();
  }

  private buildLighting() {
    // Cool ambient hemisphere fill
    const hemiLight = new THREE.HemisphereLight(0x7090b0, 0x1a202c, 0.7);
    this.scene.add(hemiLight);

    // Warm key spotlight over central deck
    const mainSpot = new THREE.SpotLight(0xfff0dd, 2.5, 30, Math.PI * 0.25, 0.5, 1.5);
    mainSpot.position.set(0, 8.5, 2.5);
    mainSpot.target.position.set(0, 0, 0);
    mainSpot.castShadow = true;
    this.scene.add(mainSpot);
    this.scene.add(mainSpot.target);
    this.spotLights.push(mainSpot);

    // Accent blue rim lights
    const blueRim1 = new THREE.PointLight(0x0088ff, 1.8, 15);
    blueRim1.position.set(-5, 3, -3);
    this.scene.add(blueRim1);

    const blueRim2 = new THREE.PointLight(0x0088ff, 1.8, 15);
    blueRim2.position.set(5, 3, -3);
    this.scene.add(blueRim2);
  }

  private buildHangarArchitecture() {
    // 1. Reinforced Hangar Deck Floor
    const floorGeo = new THREE.PlaneGeometry(35, 35);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x181c24,
      roughness: 0.65,
      metalness: 0.35,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Hazard stripe borders
    const stripeTex = createHazardStripeTexture();
    stripeTex.repeat.set(16, 1);
    const stripeMat = new THREE.MeshBasicMaterial({ map: stripeTex });
    const borderGeo = new THREE.PlaneGeometry(16, 0.4);
    borderGeo.rotateX(-Math.PI / 2);
    const borderFront = new THREE.Mesh(borderGeo, stripeMat);
    borderFront.position.set(0, 0.02, 3.5);
    this.scene.add(borderFront);

    // 2. Structural Steel Beams & Gantry Catwalks
    const beamMat = new THREE.MeshStandardMaterial({
      color: 0x2d3440,
      roughness: 0.5,
      metalness: 0.7,
    });

    for (let x = -8; x <= 8; x += 8) {
      const pillarGeo = new THREE.BoxGeometry(0.6, 9, 0.6);
      const pillar = new THREE.Mesh(pillarGeo, beamMat);
      pillar.position.set(x, 4.5, -4);
      pillar.castShadow = true;
      this.scene.add(pillar);
    }

    // High ceiling truss
    const trussGeo = new THREE.BoxGeometry(22, 0.5, 0.6);
    const truss = new THREE.Mesh(trussGeo, beamMat);
    truss.position.set(0, 8.5, -4);
    this.scene.add(truss);

    // Rear airlock blast door
    const doorGeo = new THREE.BoxGeometry(10, 6, 0.3);
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      roughness: 0.7,
      metalness: 0.5,
    });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 3, -5.5);
    this.scene.add(door);
  }

  private buildCentralTerminal() {
    const terminalGroup = new THREE.Group();
    terminalGroup.position.set(0, 0, 1.8);

    // Hexagonal Pedestal
    const baseGeo = new THREE.CylinderGeometry(0.85, 1.0, 0.9, 6);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x222831,
      roughness: 0.4,
      metalness: 0.6,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.45;
    base.castShadow = true;
    base.name = 'TERMINAL_BASE';
    base.userData = { isTerminal: true };
    terminalGroup.add(base);
    this.interactiveObjects.push(base);

    // Angled Console Display
    const consoleGeo = new THREE.BoxGeometry(1.1, 0.1, 0.6);
    consoleGeo.rotateX(Math.PI * 0.15);
    const consoleMat = new THREE.MeshStandardMaterial({
      color: 0x0f141c,
      roughness: 0.3,
      metalness: 0.8,
    });
    const consoleMesh = new THREE.Mesh(consoleGeo, consoleMat);
    consoleMesh.position.set(0, 0.95, 0);
    consoleMesh.name = 'TERMINAL_CONSOLE';
    consoleMesh.userData = { isTerminal: true };
    terminalGroup.add(consoleMesh);
    this.interactiveObjects.push(consoleMesh);

    // Holographic Screen Quad
    const screenGeo = new THREE.PlaneGeometry(0.85, 0.45);
    screenGeo.rotateX(-Math.PI * 0.35);
    const screenMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 1.02, 0.05);
    screen.name = 'TERMINAL_SCREEN';
    screen.userData = { isTerminal: true };
    terminalGroup.add(screen);
    this.interactiveObjects.push(screen);

    // Illuminated "ENGAGE MISSION" 3D Push Switch
    const switchGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.08, 16);
    switchGeo.rotateX(Math.PI * 0.15);
    const switchMat = new THREE.MeshStandardMaterial({
      color: 0xff3300,
      emissive: 0xff2200,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.5,
    });
    const engageBtn = new THREE.Mesh(switchGeo, switchMat);
    engageBtn.position.set(0, 1.05, -0.12);
    engageBtn.name = 'BTN_ENGAGE_MISSION';
    engageBtn.userData = { isTerminal: true };
    terminalGroup.add(engageBtn);
    this.engageButtonMesh = engageBtn;
    this.interactiveObjects.push(engageBtn);

    this.scene.add(terminalGroup);
  }

  public populateCrew(crewList: AstronautCrew[]) {
    // 4 circular inspection pads
    const padPositions = [
      new THREE.Vector3(-2.6, 0, -0.5), // Sarah Chen
      new THREE.Vector3(-0.9, 0, -1.8), // Marcus Vance
      new THREE.Vector3(0.9, 0, -1.8),  // Elena Rostova
      new THREE.Vector3(2.6, 0, -0.5),  // Tyler Hayes
    ];

    crewList.forEach((c, idx) => {
      const pos = padPositions[idx] || new THREE.Vector3(idx, 0, 0);

      // Circular glowing inspection pedestal
      const padGeo = new THREE.CylinderGeometry(0.65, 0.70, 0.12, 24);
      const padMat = new THREE.MeshStandardMaterial({
        color: 0x28303d,
        roughness: 0.3,
        metalness: 0.8,
      });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.set(pos.x, 0.06, pos.z);
      pad.receiveShadow = true;
      this.scene.add(pad);

      // Cyan neon edge ring
      const ringGeo = new THREE.TorusGeometry(0.66, 0.02, 8, 32);
      ringGeo.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x00d9ff });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(pos.x, 0.12, pos.z);
      this.scene.add(ring);

      // Create 3D ACES Astronaut
      const actor = createAstronautActor(c.id, c.suitColor);
      actor.group.position.set(pos.x, 0.12, pos.z);
      // Turn towards center terminal
      actor.group.lookAt(0, 0.12, 1.8);
      this.scene.add(actor.group);
      this.actors.push(actor);

      // Register interactive child meshes for raycasting
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
      this.targetCamPos.set(0, 3.2, 7.8);
      this.targetCamLook.set(0, 1.2, 0);
      return;
    }
    const actor = this.actors.find((a) => a.id === crewId);
    if (actor) {
      // Smoothly dolly camera to cinematic close-up
      this.targetCamPos.set(
        actor.group.position.x * 0.75,
        1.8,
        actor.group.position.z + 2.5
      );
      this.targetCamLook.set(
        actor.group.position.x,
        1.4,
        actor.group.position.z
      );
    }
  }

  public update(delta: number, activeCrewList: AstronautCrew[]) {
    // Update astronauts
    this.actors.forEach((actor) => {
      const crewData = activeCrewList.find((c) => c.id === actor.id);
      const health = crewData ? crewData.health : 100;
      actor.update(delta, false, health, this.camera.position);
    });
  }
}
