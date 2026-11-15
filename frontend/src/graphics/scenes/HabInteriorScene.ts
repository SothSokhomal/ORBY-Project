/**
 * Project Artemis: Level 5 - Outpost Interior Command Hub (LEVEL_HAB_INTERIOR)
 * Pressurized habitat dome interior with curved 3D holographic consoles,
 * crew bunks, hydroponic plant racks, exercise station, and viewport window.
 */

import * as THREE from 'three';
import { createAstronautActor, AstronautActor } from '../AstronautBuilder.ts';
import { AstronautCrew, GameSimulationState } from '../../types/game.ts';

export class HabInteriorScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public actors: AstronautActor[] = [];
  public interactiveObjects: THREE.Object3D[] = [];
  private targetCamPos = new THREE.Vector3(0, 2.2, 3.8);
  private targetCamLook = new THREE.Vector3(0, 1.4, 0);

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#0a0d14');

    this.camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.copy(this.targetCamPos);
    this.camera.lookAt(this.targetCamLook);

    this.buildInteriorLighting();
    this.buildDomeShell();
    this.buildConsolesAndEquipment();
  }

  private buildInteriorLighting() {
    // Warm hab ambient fill
    const ambient = new THREE.AmbientLight(0x354050, 0.8);
    this.scene.add(ambient);

    // Ceiling soft light
    const ceilingLight = new THREE.PointLight(0xfff5ea, 2.2, 12);
    ceilingLight.position.set(0, 3.5, 0);
    this.scene.add(ceilingLight);

    // Console cyan backlight
    const consoleGlow = new THREE.PointLight(0x00d9ff, 1.5, 6);
    consoleGlow.position.set(0, 1.5, -2.2);
    this.scene.add(consoleGlow);

    // Plant grow light (soft magenta)
    const plantLight = new THREE.PointLight(0xff44aa, 1.2, 5);
    plantLight.position.set(3.2, 1.8, 0);
    this.scene.add(plantLight);
  }

  private buildDomeShell() {
    // Curved Interior Hull Dome
    const domeGeo = new THREE.SphereGeometry(5.0, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0x222a36,
      roughness: 0.6,
      metalness: 0.2,
      side: THREE.BackSide,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    this.scene.add(dome);

    // Modular Floor Plating
    const floorGeo = new THREE.CircleGeometry(5.0, 32);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1b202a,
      roughness: 0.7,
      metalness: 0.3,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = 0.01;
    this.scene.add(floor);

    // Viewport Window looking out onto lunar regolith
    const windowGeo = new THREE.CircleGeometry(1.2, 24);
    const windowMat = new THREE.MeshBasicMaterial({
      color: 0x060c18,
    });
    const win = new THREE.Mesh(windowGeo, windowMat);
    win.position.set(0, 2.0, -4.95);
    this.scene.add(win);
  }

  private buildConsolesAndEquipment() {
    // 1. Curved Central Command Console
    const consoleGroup = new THREE.Group();
    consoleGroup.position.set(0, 0, -2.4);

    const deskGeo = new THREE.BoxGeometry(3.6, 0.9, 0.8);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x2b3342, roughness: 0.4, metalness: 0.6 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.y = 0.45;
    consoleGroup.add(desk);

    // Holographic Display Screens
    for (let s = -1; s <= 1; s++) {
      const screenGeo = new THREE.PlaneGeometry(0.9, 0.5);
      screenGeo.rotateX(-Math.PI * 0.15);
      const screenMat = new THREE.MeshBasicMaterial({
        color: s === 0 ? 0x00ffcc : 0x0099ff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      });
      const scr = new THREE.Mesh(screenGeo, screenMat);
      scr.position.set(s * 1.1, 1.15, 0);
      scr.rotation.y = -s * 0.25;
      consoleGroup.add(scr);
    }
    this.scene.add(consoleGroup);

    // 2. Hydroponic Plant Trays (Right Flank)
    const hydroGroup = new THREE.Group();
    hydroGroup.position.set(3.4, 0, 0);
    hydroGroup.rotation.y = -Math.PI / 2;

    const rackGeo = new THREE.BoxGeometry(2.4, 2.0, 0.6);
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x242c38, roughness: 0.7 });
    const rack = new THREE.Mesh(rackGeo, rackMat);
    rack.position.y = 1.0;
    hydroGroup.add(rack);

    // Green foliage cubes
    for (let row = 0; row < 3; row++) {
      const plantGeo = new THREE.BoxGeometry(2.1, 0.2, 0.4);
      const plantMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.9 });
      const plants = new THREE.Mesh(plantGeo, plantMat);
      plants.position.set(0, 0.4 + row * 0.6, 0.1);
      hydroGroup.add(plants);
    }
    this.scene.add(hydroGroup);

    // 3. Crew Sleep Pods (Left Flank)
    const bunkGroup = new THREE.Group();
    bunkGroup.position.set(-3.4, 0, 0);
    bunkGroup.rotation.y = Math.PI / 2;

    const bunkGeo = new THREE.BoxGeometry(2.4, 2.2, 0.8);
    const bunkMat = new THREE.MeshStandardMaterial({ color: 0x1f242e, roughness: 0.5 });
    const bunk = new THREE.Mesh(bunkGeo, bunkMat);
    bunk.position.y = 1.1;
    bunkGroup.add(bunk);
    this.scene.add(bunkGroup);
  }

  public populateCrew(crewList: AstronautCrew[]) {
    // Place crew in hab: some at console, some at hydro, some in rest
    const habPositions = [
      new THREE.Vector3(-0.8, 0, -1.4), // Commander at console
      new THREE.Vector3(2.2, 0, 0),     // Engineer near hydro
      new THREE.Vector3(0.8, 0, -1.4),  // Comms at console
      new THREE.Vector3(-2.2, 0, 0),    // Specialist at rest berth
    ];

    crewList.forEach((c, idx) => {
      const pos = habPositions[idx] || new THREE.Vector3(0, 0, 0);
      const actor = createAstronautActor(c.id, c.suitColor);
      actor.group.position.copy(pos);
      // Look towards center console
      actor.group.lookAt(0, 0, -2.4);
      this.scene.add(actor.group);
      this.actors.push(actor);

      actor.group.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.userData = { crewId: c.id, actor };
          this.interactiveObjects.push(child);
        }
      });
    });
  }

  public update(delta: number, gameState: GameSimulationState) {
    this.actors.forEach((actor) => {
      const crewData = gameState.crew.find((c) => c.id === actor.id);
      const health = crewData ? crewData.health : 100;
      actor.update(delta, false, health);
    });
  }
}
