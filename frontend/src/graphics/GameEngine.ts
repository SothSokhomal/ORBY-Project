/**
 * Project Artemis: Master 3D Game Engine & Scene Director
 * Central WebGL loop, ACES tone-mapping, software-WebGL guards,
 * level state machine transitions, and interactive raycasting.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { HangarScene } from './scenes/HangarScene.ts';
import { OrreryScene } from './scenes/OrreryScene.ts';
import { LaunchPadScene } from './scenes/LaunchPadScene.ts';
import { LunarSurfaceScene } from './scenes/LunarSurfaceScene.ts';
import { HabInteriorScene } from './scenes/HabInteriorScene.ts';
import { OrbitPanControls } from './OrbitPanControls.ts';
import { GameLevel, GameSimulationState } from '../types/game.ts';
import { spatialAudio } from '../audio/SpatialAudioManager.ts';

export class GameEngine {
  public renderer: THREE.WebGLRenderer;
  public isSoftwareGl: boolean = false;
  private container: HTMLDivElement;
  private currentLevel: GameLevel = 'LEVEL_HANGAR';
  private frameId: number = 0;
  private clock: THREE.Clock;
  private raycaster: THREE.Raycaster;
  private pointer: THREE.Vector2;
  public controls: OrbitPanControls;

  // Level Instances
  public hangarScene: HangarScene;
  public orreryScene: OrreryScene;
  public launchPadScene: LaunchPadScene;
  public lunarSurfaceScene: LunarSurfaceScene;
  public habInteriorScene: HabInteriorScene;

  // Interaction Callbacks
  public onSelectCrew?: (crewId: string) => void;
  public onEngageMission?: () => void;
  public onDestinationSelect?: (destName: string) => void;
  public onSelectCelestialTarget?: (target: string) => void;

  constructor(container: HTMLDivElement, initialState: GameSimulationState) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(-999, -999);

    // Software WebGL Guard (per Three.js skill)
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // Mandatory Procedural Studio Environment Reflection
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const roomEnv = new RoomEnvironment();
    const envTexture = pmrem.fromScene(roomEnv, 0.04).texture;
    pmrem.dispose();

    // Initialize scenes
    this.hangarScene = new HangarScene();
    this.hangarScene.scene.environment = envTexture;
    this.hangarScene.populateCrew(initialState.crew);

    this.orreryScene = new OrreryScene();
    this.orreryScene.scene.environment = envTexture;

    this.launchPadScene = new LaunchPadScene();
    this.launchPadScene.scene.environment = envTexture;

    this.lunarSurfaceScene = new LunarSurfaceScene();
    this.lunarSurfaceScene.scene.environment = envTexture;
    this.lunarSurfaceScene.populateCrew(initialState.crew);

    this.habInteriorScene = new HabInteriorScene();
    this.habInteriorScene.scene.environment = envTexture;
    this.habInteriorScene.populateCrew(initialState.crew);

    // Initialize Orbit & Pan Controls
    this.controls = new OrbitPanControls(this.hangarScene.camera, this.renderer.domElement);
    this.setLevel(initialState.level);

    // Event listeners
    window.addEventListener('resize', this.onResize);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
  }

  public setLevel(level: GameLevel) {
    this.currentLevel = level;
    if (level === 'LEVEL_HANGAR') {
      this.controls.camera = this.hangarScene.camera;
      this.controls.minPhi = 0.05;
      this.controls.maxPhi = Math.PI * 0.48;
      this.controls.minRadius = 3.0;
      this.controls.maxRadius = 30.0;
      this.controls.setPreset({
        target: new THREE.Vector3(0, 1.2, 0),
        radius: 9.0,
        theta: 0,
        phi: Math.PI * 0.38,
      });
    } else if (level === 'LEVEL_ORRERY') {
      this.controls.camera = this.orreryScene.camera;
      this.controls.minPhi = 0.01;
      this.controls.maxPhi = Math.PI * 0.98;
      this.controls.minRadius = 6.0;
      this.controls.maxRadius = 150.0;
      this.controls.setPreset({
        target: new THREE.Vector3(0, 0, 0),
        radius: 36.0,
        theta: 0,
        phi: Math.PI * 0.32,
      });
    } else if (level === 'LEVEL_LAUNCH_PAD') {
      this.controls.camera = this.launchPadScene.camera;
      this.controls.minPhi = 0.05;
      this.controls.maxPhi = Math.PI * 0.48;
      this.controls.minRadius = 10.0;
      this.controls.maxRadius = 90.0;
      this.controls.setPreset({
        target: new THREE.Vector3(0, 18.0, 0),
        radius: 42.0,
        theta: 0,
        phi: Math.PI * 0.42,
      });
      this.launchPadScene.launchStage = 'COUNTDOWN';
      this.launchPadScene.countdownTime = 6.0;
      this.launchPadScene.rocketGroup.position.set(0, 2.5, 0);
    } else if (level === 'LEVEL_LUNAR_SURFACE') {
      this.controls.camera = this.lunarSurfaceScene.camera;
      this.controls.minPhi = 0.05;
      this.controls.maxPhi = Math.PI * 0.48;
      this.controls.minRadius = 4.0;
      this.controls.maxRadius = 85.0;
      this.controls.setPreset({
        target: new THREE.Vector3(0, 1.5, 0),
        radius: 24.0,
        theta: 0,
        phi: Math.PI * 0.35,
      });
    } else {
      // LEVEL_HAB_INTERIOR
      this.controls.camera = this.habInteriorScene.camera;
      this.controls.minPhi = 0.1;
      this.controls.maxPhi = Math.PI * 0.48;
      this.controls.minRadius = 2.0;
      this.controls.maxRadius = 8.0;
      this.controls.setPreset({
        target: new THREE.Vector3(0, 1.3, -1.0),
        radius: 4.8,
        theta: 0,
        phi: Math.PI * 0.42,
      });
    }
  }

  public panCameraDirection(direction: 'left' | 'right' | 'up' | 'down' | 'zoom_in' | 'zoom_out' | 'reset') {
    switch (direction) {
      case 'left':
        this.controls.rotate(0.35, 0);
        break;
      case 'right':
        this.controls.rotate(-0.35, 0);
        break;
      case 'up':
        this.controls.rotate(0, -0.22);
        break;
      case 'down':
        this.controls.rotate(0, 0.22);
        break;
      case 'zoom_in':
        this.controls.zoom(-this.controls.radius * 0.2);
        break;
      case 'zoom_out':
        this.controls.zoom(this.controls.radius * 0.25);
        break;
      case 'reset':
        this.controls.reset();
        break;
    }
  }

  private onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);

    const aspect = width / height;
    this.hangarScene.camera.aspect = aspect;
    this.hangarScene.camera.updateProjectionMatrix();

    this.orreryScene.camera.aspect = aspect;
    this.orreryScene.camera.updateProjectionMatrix();

    this.launchPadScene.camera.aspect = aspect;
    this.launchPadScene.camera.updateProjectionMatrix();

    this.lunarSurfaceScene.camera.aspect = aspect;
    this.lunarSurfaceScene.camera.updateProjectionMatrix();

    this.habInteriorScene.camera.aspect = aspect;
    this.habInteriorScene.camera.updateProjectionMatrix();
  };

  private onPointerDown = (e: MouseEvent) => {
    // Only capture primary clicks inside canvas, never from HTML overlay buttons
    if (e.target !== this.renderer.domElement) {
      return;
    }
    this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

    let activeCamera: THREE.Camera;
    let candidates: THREE.Object3D[] = [];

    if (this.currentLevel === 'LEVEL_HANGAR') {
      activeCamera = this.hangarScene.camera;
      candidates = this.hangarScene.interactiveObjects;
    } else if (this.currentLevel === 'LEVEL_ORRERY') {
      activeCamera = this.orreryScene.camera;
      candidates = this.orreryScene.interactiveMeshes;
    } else if (this.currentLevel === 'LEVEL_LUNAR_SURFACE') {
      activeCamera = this.lunarSurfaceScene.camera;
      candidates = this.lunarSurfaceScene.interactiveObjects;
    } else if (this.currentLevel === 'LEVEL_HAB_INTERIOR') {
      activeCamera = this.habInteriorScene.camera;
      candidates = this.habInteriorScene.interactiveObjects;
    } else {
      return;
    }

    this.raycaster.setFromCamera(this.pointer, activeCamera);
    const intersects = this.raycaster.intersectObjects(candidates, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object;

      // Hangar Engage Switch or Console Terminal in front of the 4 crew
      if (
        hit.name === 'BTN_ENGAGE_MISSION' ||
        hit.parent?.name === 'BTN_ENGAGE_MISSION' ||
        hit.userData?.isTerminal ||
        hit.name?.startsWith('TERMINAL_')
      ) {
        spatialAudio.playUiClick(1200);
        this.onEngageMission?.();
        return;
      }

      // Celestial Target in Orrery (Sun, Moon, Earth, Mars, Jupiter, Saturn, Mercury, Venus)
      if (this.currentLevel === 'LEVEL_ORRERY') {
        let celestialTarget: string | null = (hit.userData && hit.userData.celestialId) || null;
        if (!celestialTarget) {
          if (hit.name === 'CELESTIAL_SUN' || hit.name === 'SUN') {
            celestialTarget = 'Sun';
          } else if (hit.name === 'PLANET_MOON' || hit.name === 'CELESTIAL_MOON') {
            celestialTarget = 'Moon (Artemis)';
          } else if (hit.name === 'PLANET_MARS' || hit.name === 'CELESTIAL_MARS') {
            celestialTarget = 'Mars';
          } else if (hit.name.startsWith('CELESTIAL_')) {
            const raw = hit.name.replace('CELESTIAL_', '');
            celestialTarget = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
          }
        }

        if (celestialTarget) {
          spatialAudio.playUiClick(1000);
          this.orreryScene.setFocusedTarget(celestialTarget);
          this.onSelectCelestialTarget?.(celestialTarget);
          return;
        }
      }

      // Check astronaut selection
      let curr: THREE.Object3D | null = hit;
      while (curr) {
        if (curr.userData && curr.userData.crewId) {
          spatialAudio.playRadioSquawk();
          this.onSelectCrew?.(curr.userData.crewId);
          return;
        }
        curr = curr.parent;
      }
    }
  };

  public focusAstronaut(crewId: string | null) {
    if (!crewId) return;
    let actorPos: THREE.Vector3 | null = null;
    if (this.currentLevel === 'LEVEL_HANGAR') {
      const a = this.hangarScene.actors.find((act) => act.id === crewId);
      if (a) actorPos = a.group.position;
    } else if (this.currentLevel === 'LEVEL_LUNAR_SURFACE') {
      const a = this.lunarSurfaceScene.actors.find((act) => act.id === crewId);
      if (a) actorPos = a.group.position;
    } else if (this.currentLevel === 'LEVEL_HAB_INTERIOR') {
      const a = this.habInteriorScene.actors.find((act) => act.id === crewId);
      if (a) actorPos = a.group.position;
    }

    if (actorPos) {
      this.controls.flyTo(
        new THREE.Vector3(actorPos.x, actorPos.y + 1.1, actorPos.z),
        4.6,
        undefined,
        Math.PI * 0.38,
        0.7
      );
    }
  }

  public setOrreryTarget(target: string) {
    this.orreryScene.setFocusedTarget(target);
    if (this.currentLevel === 'LEVEL_ORRERY') {
      const pos = this.orreryScene.getTargetWorldPosition();
      let targetRadius = 4.8;
      let minR = 1.5;
      if (target === 'System View') {
        targetRadius = 38.0;
        minR = 5.0;
      } else if (target === 'Sun') {
        targetRadius = 12.0;
        minR = 4.5;
      } else if (target === 'Jupiter') {
        targetRadius = 7.5;
        minR = 3.0;
      } else if (target === 'Saturn') {
        targetRadius = 8.5;
        minR = 3.5;
      } else if (target === 'Moon (Artemis)') {
        targetRadius = 2.4;
        minR = 0.8;
      } else if (target === 'Mars' || target === 'Mercury' || target === 'Venus') {
        targetRadius = 3.6;
        minR = 1.0;
      }
      this.controls.minRadius = minR;
      this.controls.flyTo(pos, targetRadius, undefined, undefined, 0.8);
    }
  }

  public setOrrerySpeed(speed: number) {
    this.orreryScene.setSpeedMultiplier(speed);
  }

  public render(gameState: GameSimulationState, onAutoTransition?: (nextLevel: GameLevel) => void) {
    const rawDt = this.clock.getDelta();
    const delta = Math.min(rawDt, 0.05);

    let activeScene: THREE.Scene;
    let activeCamera: THREE.Camera;

    if (this.currentLevel === 'LEVEL_HANGAR') {
      this.hangarScene.update(delta, gameState.crew);
      activeScene = this.hangarScene.scene;
      activeCamera = this.hangarScene.camera;
    } else if (this.currentLevel === 'LEVEL_ORRERY') {
      const hyperspaceDone = this.orreryScene.update(delta);
      if (hyperspaceDone) {
        onAutoTransition?.('LEVEL_LAUNCH_PAD');
      }
      // Follow moving celestial target in orbit
      if (this.orreryScene.focusedTarget !== 'System View') {
        const targetWorldPos = this.orreryScene.getTargetWorldPosition();
        this.controls.target.copy(targetWorldPos);
      }
      activeScene = this.orreryScene.scene;
      activeCamera = this.orreryScene.camera;
    } else if (this.currentLevel === 'LEVEL_LAUNCH_PAD') {
      const launchDone = this.launchPadScene.update(delta);
      if (launchDone) {
        onAutoTransition?.('LEVEL_LUNAR_SURFACE');
      }
      // Camera smoothly tracks rising rocket
      if (this.launchPadScene.launchStage === 'LIFTOFF') {
        this.controls.target.y = this.launchPadScene.rocketGroup.position.y + 8;
      }
      activeScene = this.launchPadScene.scene;
      activeCamera = this.launchPadScene.camera;
    } else if (this.currentLevel === 'LEVEL_LUNAR_SURFACE') {
      this.lunarSurfaceScene.update(delta, gameState);
      activeScene = this.lunarSurfaceScene.scene;
      activeCamera = this.lunarSurfaceScene.camera;
    } else {
      // LEVEL_HAB_INTERIOR
      this.habInteriorScene.update(delta, gameState);
      activeScene = this.habInteriorScene.scene;
      activeCamera = this.habInteriorScene.camera;
    }

    // Update orbit/pan controls for active camera
    this.controls.update(delta);

    this.renderer.render(activeScene, activeCamera);
  }

  public dispose() {
    window.removeEventListener('resize', this.onResize);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.controls.dispose();
    cancelAnimationFrame(this.frameId);
    this.renderer.dispose();
  }
}

