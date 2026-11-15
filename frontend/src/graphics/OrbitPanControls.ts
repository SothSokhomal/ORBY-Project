/**
 * Project Artemis: Orbit & Pan Camera Controls
 * Smooth, realistic camera physics with natural inertia, ground collision avoidance,
 * cinematic flyTo transitions, and intuitive mouse/touch/keyboard navigation.
 */

import * as THREE from 'three';

export interface CameraPreset {
  target: THREE.Vector3;
  radius: number;
  theta: number; // Azimuth angle (horizontal rotation)
  phi: number;   // Polar angle (vertical elevation)
}

export class OrbitPanControls {
  public camera: THREE.PerspectiveCamera;
  public domElement: HTMLElement;

  // Spherical Coordinates & Target
  public target = new THREE.Vector3(0, 1.5, 0);
  public currentTarget = new THREE.Vector3(0, 1.5, 0);
  public radius = 18.0;
  public currentRadius = 18.0;
  public theta = 0; // Horizontal rotation
  public currentTheta = 0;
  public phi = Math.PI * 0.35; // Vertical elevation
  public currentPhi = Math.PI * 0.35;

  // Realistic Constraints
  public minRadius = 2.5;
  public maxRadius = 120.0;
  public minPhi = 0.08;        // High overhead
  public maxPhi = Math.PI * 0.47; // Prevents camera from clipping into the lunar ground

  // Smooth FlyTo Transition State
  private isTransitioning = false;
  private transitionStart = {
    target: new THREE.Vector3(),
    radius: 0,
    theta: 0,
    phi: 0,
  };
  private transitionEnd = {
    target: new THREE.Vector3(),
    radius: 0,
    theta: 0,
    phi: 0,
  };
  private transitionProgress = 0;
  private transitionDuration = 1.0;

  // Pointer & Touch State
  private isPointerDown = false;
  private pointerButton = 0;
  private previousPointerPosition = { x: 0, y: 0 };
  private touchStartDistance = 0;
  private activeKeys = new Set<string>();
  private defaultPreset: CameraPreset;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.defaultPreset = {
      target: this.target.clone(),
      radius: this.radius,
      theta: this.theta,
      phi: this.phi,
    };

    this.attachEventListeners();
  }

  public setPreset(preset: Partial<CameraPreset>) {
    if (preset.target) this.target.copy(preset.target);
    if (preset.radius !== undefined) this.radius = preset.radius;
    if (preset.theta !== undefined) this.theta = preset.theta;
    if (preset.phi !== undefined) this.phi = preset.phi;

    this.defaultPreset = {
      target: this.target.clone(),
      radius: this.radius,
      theta: this.theta,
      phi: this.phi,
    };
  }

  /**
   * Smoothly fly camera to a new target and framing (Cinematic AAA feel)
   */
  public flyTo(
    newTarget: THREE.Vector3,
    newRadius?: number,
    newTheta?: number,
    newPhi?: number,
    duration = 0.8
  ) {
    this.isTransitioning = true;
    this.transitionProgress = 0;
    this.transitionDuration = Math.max(0.2, duration);

    this.transitionStart = {
      target: this.currentTarget.clone(),
      radius: this.currentRadius,
      theta: this.currentTheta,
      phi: this.currentPhi,
    };

    this.target.copy(newTarget);
    if (newRadius !== undefined) this.radius = THREE.MathUtils.clamp(newRadius, this.minRadius, this.maxRadius);
    if (newTheta !== undefined) this.theta = newTheta;
    if (newPhi !== undefined) this.phi = THREE.MathUtils.clamp(newPhi, this.minPhi, this.maxPhi);

    this.transitionEnd = {
      target: this.target.clone(),
      radius: this.radius,
      theta: this.theta,
      phi: this.phi,
    };
  }

  public reset() {
    this.flyTo(
      this.defaultPreset.target,
      this.defaultPreset.radius,
      this.defaultPreset.theta,
      this.defaultPreset.phi,
      0.7
    );
  }

  public pan(deltaX: number, deltaY: number) {
    this.isTransitioning = false; // User manual control interrupts automated flyTo
    const panSpeed = this.currentRadius * 0.0016;
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, this.camera.up).normalize();

    this.target.addScaledVector(right, -deltaX * panSpeed);
    this.target.y += deltaY * panSpeed;
    this.target.y = Math.max(0.5, this.target.y); // Ground clearance
  }

  public rotate(deltaTheta: number, deltaPhi: number) {
    this.isTransitioning = false;
    this.theta += deltaTheta;
    this.phi += deltaPhi;
    this.phi = THREE.MathUtils.clamp(this.phi, this.minPhi, this.maxPhi);
  }

  public zoom(deltaRadius: number) {
    this.isTransitioning = false;
    this.radius += deltaRadius;
    this.radius = THREE.MathUtils.clamp(this.radius, this.minRadius, this.maxRadius);
  }

  private attachEventListeners() {
    this.domElement.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
    this.domElement.addEventListener('wheel', this.onWheel, { passive: false });

    // Touch Support for mobile and trackpad gestures
    this.domElement.addEventListener('touchstart', this.onTouchStart, { passive: false });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd);

    // Keyboard navigation
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  private onPointerDown = (e: PointerEvent) => {
    // Only capture clicks on the 3D canvas
    if (e.target !== this.domElement && (e.target as HTMLElement).tagName !== 'CANVAS') {
      return;
    }
    this.isPointerDown = true;
    this.pointerButton = e.button;
    this.previousPointerPosition = { x: e.clientX, y: e.clientY };
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isPointerDown) return;

    const deltaX = e.clientX - this.previousPointerPosition.x;
    const deltaY = e.clientY - this.previousPointerPosition.y;
    this.previousPointerPosition = { x: e.clientX, y: e.clientY };

    if (this.pointerButton === 2 || this.pointerButton === 1 || e.shiftKey) {
      // Right-click, Middle-click, or Shift+drag: Pan camera
      this.pan(deltaX, deltaY);
    } else {
      // Left-click: Orbit camera
      const rotSpeed = 0.005;
      this.rotate(-deltaX * rotSpeed, -deltaY * rotSpeed);
    }
  };

  private onPointerUp = () => {
    this.isPointerDown = false;
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    // Realistic exponential zoom
    const zoomFactor = this.currentRadius * 0.0012;
    this.zoom(e.deltaY * zoomFactor);
  };

  private onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      this.isPointerDown = true;
      this.pointerButton = 0;
      this.previousPointerPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      // Pinch to zoom initialization
      this.isPointerDown = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      this.touchStartDistance = Math.sqrt(dx * dx + dy * dy);
    }
  };

  private onTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1 && this.isPointerDown) {
      const deltaX = e.touches[0].clientX - this.previousPointerPosition.x;
      const deltaY = e.touches[0].clientY - this.previousPointerPosition.y;
      this.previousPointerPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      this.rotate(-deltaX * 0.006, -deltaY * 0.006);
    } else if (e.touches.length === 2 && this.touchStartDistance > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      const delta = (this.touchStartDistance - currentDist) * 0.08;
      this.zoom(delta);
      this.touchStartDistance = currentDist;
    }
  };

  private onTouchEnd = () => {
    this.isPointerDown = false;
    this.touchStartDistance = 0;
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

    const key = e.key.toLowerCase();
    if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'w', 'a', 's', 'd', 'q', 'e'].includes(key)) {
      this.activeKeys.add(key);
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.activeKeys.delete(e.key.toLowerCase());
  };

  private onBlur = () => {
    this.activeKeys.clear();
    this.isPointerDown = false;
  };

  public update(delta: number) {
    const keyRotSpeed = delta * 1.8;
    const keyPanSpeed = delta * 12.0;

    if (this.activeKeys.has('arrowleft') || this.activeKeys.has('a')) {
      this.rotate(keyRotSpeed, 0);
    }
    if (this.activeKeys.has('arrowright') || this.activeKeys.has('d')) {
      this.rotate(-keyRotSpeed, 0);
    }
    if (this.activeKeys.has('arrowup') || this.activeKeys.has('w')) {
      this.rotate(0, -keyRotSpeed * 0.7);
    }
    if (this.activeKeys.has('arrowdown') || this.activeKeys.has('s')) {
      this.rotate(0, keyRotSpeed * 0.7);
    }
    if (this.activeKeys.has('q')) {
      this.zoom(-keyPanSpeed);
    }
    if (this.activeKeys.has('e')) {
      this.zoom(keyPanSpeed);
    }

    if (this.isTransitioning) {
      this.transitionProgress += delta / this.transitionDuration;
      if (this.transitionProgress >= 1.0) {
        this.transitionProgress = 1.0;
        this.isTransitioning = false;
      }
      // Smooth cubic ease-out curve
      const t = 1 - Math.pow(1 - this.transitionProgress, 3);

      this.currentTarget.lerpVectors(this.transitionStart.target, this.transitionEnd.target, t);
      this.currentRadius = THREE.MathUtils.lerp(this.transitionStart.radius, this.transitionEnd.radius, t);
      this.currentTheta = THREE.MathUtils.lerp(this.transitionStart.theta, this.transitionEnd.theta, t);
      this.currentPhi = THREE.MathUtils.lerp(this.transitionStart.phi, this.transitionEnd.phi, t);
    } else {
      // Realistic smooth inertia damping
      const dampRate = Math.min(1.0, delta * 9.0);
      this.currentTheta = THREE.MathUtils.damp(this.currentTheta, this.theta, dampRate * 12, delta);
      this.currentPhi = THREE.MathUtils.damp(this.currentPhi, this.phi, dampRate * 12, delta);
      this.currentRadius = THREE.MathUtils.damp(this.currentRadius, this.radius, dampRate * 12, delta);

      this.currentTarget.x = THREE.MathUtils.damp(this.currentTarget.x, this.target.x, dampRate * 10, delta);
      this.currentTarget.y = THREE.MathUtils.damp(this.currentTarget.y, this.target.y, dampRate * 10, delta);
      this.currentTarget.z = THREE.MathUtils.damp(this.currentTarget.z, this.target.z, dampRate * 10, delta);
    }

    // Convert Spherical coordinates to Cartesian camera position
    const sinPhi = Math.sin(this.currentPhi);
    const cosPhi = Math.cos(this.currentPhi);
    const sinTheta = Math.sin(this.currentTheta);
    const cosTheta = Math.cos(this.currentTheta);

    this.camera.position.x = this.currentTarget.x + this.currentRadius * sinPhi * sinTheta;
    this.camera.position.y = this.currentTarget.y + this.currentRadius * cosPhi;
    this.camera.position.z = this.currentTarget.z + this.currentRadius * sinPhi * cosTheta;

    // Ground collision guard
    this.camera.position.y = Math.max(0.6, this.camera.position.y);

    this.camera.lookAt(this.currentTarget);
  }

  public dispose() {
    this.domElement.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    this.domElement.removeEventListener('wheel', this.onWheel);
    this.domElement.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
  }
}
