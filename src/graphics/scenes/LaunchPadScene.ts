/**
 * Project Artemis: Level 3 - Cape Canaveral Launch Pad (LEVEL_LAUNCH_PAD)
 * Nighttime launch gantry, towering Artemis SLS rocket, swing arms,
 * ignition fireballs, camera rumble, and ascending liftoff.
 */

import * as THREE from 'three';
import { GameParticleSystem } from '../ParticleSystem.ts';
import { spatialAudio } from '../../audio/SpatialAudioManager.ts';

export class LaunchPadScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public particles: GameParticleSystem;
  public rocketGroup: THREE.Group;
  public gantryArm: THREE.Group;
  public launchStage: 'COUNTDOWN' | 'IGNITION' | 'LIFTOFF' | 'COMPLETE' = 'COUNTDOWN';
  public countdownTime: number = 6.0; // T-6 seconds
  private rocketVelocityY: number = 0;
  private engineLight: THREE.PointLight;
  private cameraShake: number = 0;
  private baseCamPos = new THREE.Vector3(0, 8.0, 38.0);

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#03060c');
    this.scene.fog = new THREE.FogExp2('#03060c', 0.018);

    this.camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 800);
    this.camera.position.copy(this.baseCamPos);
    this.camera.lookAt(0, 16.0, 0);

    this.particles = new GameParticleSystem(800);
    this.scene.add(this.particles.points);

    // Engine ignition point light (starts dim)
    this.engineLight = new THREE.PointLight(0xff7700, 0, 150, 1.2);
    this.engineLight.position.set(0, 1.5, 0);
    this.scene.add(this.engineLight);

    this.buildLighting();
    this.buildTerrainAndGantry();
    this.rocketGroup = this.buildRocket();
    this.gantryArm = this.buildGantryArm();
  }

  private buildLighting() {
    // Night ambient
    const ambient = new THREE.AmbientLight(0x0a1424, 0.4);
    this.scene.add(ambient);

    // Towering floodlights illuminating the rocket
    const flood1 = new THREE.SpotLight(0xddeeff, 3.5, 120, Math.PI * 0.28, 0.6, 1.2);
    flood1.position.set(-24, 6, 28);
    flood1.target.position.set(0, 22, 0);
    flood1.castShadow = true;
    this.scene.add(flood1);
    this.scene.add(flood1.target);

    const flood2 = new THREE.SpotLight(0xddeeff, 3.0, 120, Math.PI * 0.28, 0.6, 1.2);
    flood2.position.set(24, 6, 28);
    flood2.target.position.set(0, 22, 0);
    this.scene.add(flood2);
    this.scene.add(flood2.target);
  }

  private buildTerrainAndGantry() {
    // Launch deck concrete base
    const padGeo = new THREE.BoxGeometry(45, 2.5, 45);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x1b2028,
      roughness: 0.9,
      metalness: 0.1,
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.y = 1.25;
    pad.receiveShadow = true;
    this.scene.add(pad);

    // Launch Umbilical Tower (Red Gantry Truss)
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x8b2518, // NASA gantry red
      roughness: 0.6,
      metalness: 0.4,
    });

    const towerGeo = new THREE.BoxGeometry(4.0, 52, 4.0);
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.set(-5.5, 27, 0);
    tower.castShadow = true;
    this.scene.add(tower);

    // Flame Trench Exhaust Deflector
    const trenchGeo = new THREE.BoxGeometry(8, 3, 14);
    const trenchMat = new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.9 });
    const trench = new THREE.Mesh(trenchGeo, trenchMat);
    trench.position.set(0, 0.5, 0);
    this.scene.add(trench);
  }

  private buildGantryArm(): THREE.Group {
    const armGroup = new THREE.Group();
    armGroup.position.set(-3.5, 34, 0);

    const armGeo = new THREE.BoxGeometry(4.5, 1.2, 1.0);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x333b48, roughness: 0.5, metalness: 0.6 });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.x = 2.25;
    armGroup.add(arm);

    this.scene.add(armGroup);
    return armGroup;
  }

  private buildRocket(): THREE.Group {
    const rocket = new THREE.Group();
    rocket.position.set(0, 2.5, 0);

    // 1. Core Stage (Orange Foam Insulation)
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xdd6622,
      roughness: 0.85,
      metalness: 0.05,
    });
    const coreGeo = new THREE.CylinderGeometry(1.6, 1.6, 28, 24);
    const coreStage = new THREE.Mesh(coreGeo, coreMat);
    coreStage.position.y = 15;
    coreStage.castShadow = true;
    rocket.add(coreStage);

    // 2. Twin Solid Rocket Boosters (White SRBs)
    const srbMat = new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      roughness: 0.4,
      metalness: 0.2,
    });
    const srbGeo = new THREE.CylinderGeometry(0.7, 0.7, 24, 16);
    const srbNoseGeo = new THREE.ConeGeometry(0.7, 2.5, 16);

    // Left SRB
    const srbLeft = new THREE.Group();
    srbLeft.position.set(-2.4, 13, 0);
    const srbBodyL = new THREE.Mesh(srbGeo, srbMat);
    const srbConeL = new THREE.Mesh(srbNoseGeo, srbMat);
    srbConeL.position.y = 13.25;
    srbLeft.add(srbBodyL, srbConeL);
    rocket.add(srbLeft);

    // Right SRB
    const srbRight = new THREE.Group();
    srbRight.position.set(2.4, 13, 0);
    const srbBodyR = new THREE.Mesh(srbGeo, srbMat);
    const srbConeR = new THREE.Mesh(srbNoseGeo, srbMat);
    srbConeR.position.y = 13.25;
    srbRight.add(srbBodyR, srbConeR);
    rocket.add(srbRight);

    // 3. Orion Spacecraft Capsule & Service Module
    const capsuleMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.3,
      metalness: 0.8,
    });
    const capsuleGeo = new THREE.ConeGeometry(1.5, 2.8, 20);
    const capsule = new THREE.Mesh(capsuleGeo, capsuleMat);
    capsule.position.y = 30.4;
    rocket.add(capsule);

    // Launch Abort Tower (LAS)
    const lasGeo = new THREE.CylinderGeometry(0.12, 0.12, 4.2, 8);
    const lasMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    const las = new THREE.Mesh(lasGeo, lasMat);
    las.position.y = 33.8;
    rocket.add(las);

    // 4. RS-25 Engine Nozzles
    const bellMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.9, roughness: 0.2 });
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const bellGeo = new THREE.CylinderGeometry(0.35, 0.55, 1.2, 12);
      const bell = new THREE.Mesh(bellGeo, bellMat);
      bell.position.set(Math.cos(angle) * 0.7, 0.4, Math.sin(angle) * 0.7);
      rocket.add(bell);
    }

    this.scene.add(rocket);
    return rocket;
  }

  public update(delta: number): boolean {
    this.particles.update(delta);

    // Sequence progression
    if (this.launchStage === 'COUNTDOWN') {
      this.countdownTime -= delta;

      // T-3s: Swing umbilical arm open
      if (this.countdownTime <= 3.5) {
        this.gantryArm.rotation.y = THREE.MathUtils.damp(this.gantryArm.rotation.y, -Math.PI * 0.45, 3, delta);
      }

      // T-1.5s: Engine ignition
      if (this.countdownTime <= 1.5) {
        this.launchStage = 'IGNITION';
        spatialAudio.playRocketRumble(0, 0, 0, 8.0);
      }
    } else if (this.launchStage === 'IGNITION') {
      this.countdownTime -= delta;
      this.engineLight.intensity = THREE.MathUtils.damp(this.engineLight.intensity, 6.5, 6, delta);
      this.cameraShake = 0.35;

      // Spew massive flame smoke particles
      const exhaustOrigin = new THREE.Vector3(0, 2.0, 0);
      this.particles.emit('ROCKET_EXHAUST', exhaustOrigin, 14);

      if (this.countdownTime <= 0) {
        this.launchStage = 'LIFTOFF';
      }
    } else if (this.launchStage === 'LIFTOFF') {
      this.rocketVelocityY += delta * 12.0;
      this.rocketGroup.position.y += this.rocketVelocityY * delta;

      // Engine light moves with rocket
      this.engineLight.position.y = this.rocketGroup.position.y - 1.0;

      // Emit exhaust from rising rocket base
      const currentExhaustPos = new THREE.Vector3(0, this.rocketGroup.position.y, 0);
      this.particles.emit('ROCKET_EXHAUST', currentExhaustPos, 22);

      // Camera follows rocket upward with heavy rumble
      this.cameraShake = THREE.MathUtils.damp(this.cameraShake, 0.6, 2, delta);
      this.camera.lookAt(0, this.rocketGroup.position.y + 12, 0);

      if (this.rocketGroup.position.y > 90) {
        this.launchStage = 'COMPLETE';
        return true; // Transition to Lunar Surface!
      }
    }

    // Camera rumble / shake applied
    if (this.cameraShake > 0.01) {
      this.camera.position.x = this.baseCamPos.x + (Math.random() - 0.5) * this.cameraShake;
      this.camera.position.y = this.baseCamPos.y + (Math.random() - 0.5) * this.cameraShake;
      this.camera.position.z = this.baseCamPos.z + (Math.random() - 0.5) * this.cameraShake;
    }

    return false;
  }
}
