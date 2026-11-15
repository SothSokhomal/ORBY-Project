/**
 * Project Artemis: Zero-GC Pooled Particle System
 * High-performance particle ring buffer using THREE.Points and Float32Array buffers.
 */

import * as THREE from 'three';

export type ParticleType = 'ROCKET_EXHAUST' | 'PIPE_STEAM' | 'DUST_MOTES' | 'SOLAR_STORM';

export class GameParticleSystem {
  public points: THREE.Points;
  private maxParticles: number;
  private positions: Float32Array;
  private velocities: Float32Array;
  private colors: Float32Array;
  private sizes: Float32Array;
  private lifespans: Float32Array;
  private maxLifespans: Float32Array;
  private geo: THREE.BufferGeometry;

  constructor(maxParticles = 600) {
    this.maxParticles = maxParticles;
    this.positions = new Float32Array(maxParticles * 3);
    this.velocities = new Float32Array(maxParticles * 3);
    this.colors = new Float32Array(maxParticles * 3);
    this.sizes = new Float32Array(maxParticles);
    this.lifespans = new Float32Array(maxParticles);
    this.maxLifespans = new Float32Array(maxParticles);

    // Initialize all as dead (lifespan = 0)
    for (let i = 0; i < maxParticles; i++) {
      this.lifespans[i] = 0;
      this.positions[i * 3 + 1] = -9999; // Offscreen
    }

    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geo.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geo.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));

    // Procedural soft round circular particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.4)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(this.geo, mat);
    this.points.frustumCulled = false;
  }

  /**
   * Spawn a burst of particles from the pool
   */
  public emit(
    type: ParticleType,
    origin: THREE.Vector3,
    count = 10,
    color = new THREE.Color(1, 0.6, 0.2)
  ) {
    let spawned = 0;
    for (let i = 0; i < this.maxParticles && spawned < count; i++) {
      if (this.lifespans[i] <= 0) {
        const idx3 = i * 3;
        this.positions[idx3] = origin.x + (Math.random() - 0.5) * 0.3;
        this.positions[idx3 + 1] = origin.y + (Math.random() - 0.5) * 0.3;
        this.positions[idx3 + 2] = origin.z + (Math.random() - 0.5) * 0.3;

        if (type === 'ROCKET_EXHAUST') {
          this.velocities[idx3] = (Math.random() - 0.5) * 3.5;
          this.velocities[idx3 + 1] = -Math.random() * 8.0 - 2.0; // Rapid downward thrust
          this.velocities[idx3 + 2] = (Math.random() - 0.5) * 3.5;
          this.colors[idx3] = 1.0;
          this.colors[idx3 + 1] = 0.5 + Math.random() * 0.4;
          this.colors[idx3 + 2] = 0.1;
          this.sizes[i] = 1.2 + Math.random() * 1.5;
          this.lifespans[i] = 0.8 + Math.random() * 0.6;
          this.maxLifespans[i] = this.lifespans[i];
        } else if (type === 'PIPE_STEAM') {
          this.velocities[idx3] = (Math.random() - 0.5) * 1.2;
          this.velocities[idx3 + 1] = Math.random() * 2.2 + 0.5;
          this.velocities[idx3 + 2] = (Math.random() - 0.5) * 1.2;
          this.colors[idx3] = 0.85;
          this.colors[idx3 + 1] = 0.92;
          this.colors[idx3 + 2] = 1.0;
          this.sizes[i] = 0.5 + Math.random() * 0.6;
          this.lifespans[i] = 1.2 + Math.random() * 0.5;
          this.maxLifespans[i] = this.lifespans[i];
        } else if (type === 'SOLAR_STORM') {
          this.velocities[idx3] = (Math.random() - 0.5) * 4.0;
          this.velocities[idx3 + 1] = (Math.random() - 0.5) * 4.0;
          this.velocities[idx3 + 2] = (Math.random() - 0.5) * 4.0;
          this.colors[idx3] = 0.3;
          this.colors[idx3 + 1] = 0.95;
          this.colors[idx3 + 2] = 1.0; // Cyan solar radiation
          this.sizes[i] = 0.4;
          this.lifespans[i] = 0.5 + Math.random() * 0.4;
          this.maxLifespans[i] = this.lifespans[i];
        } else {
          // Dust motes
          this.velocities[idx3] = (Math.random() - 0.5) * 0.2;
          this.velocities[idx3 + 1] = (Math.random() - 0.5) * 0.2;
          this.velocities[idx3 + 2] = (Math.random() - 0.5) * 0.2;
          this.colors[idx3] = color.r;
          this.colors[idx3 + 1] = color.g;
          this.colors[idx3 + 2] = color.b;
          this.sizes[i] = 0.2;
          this.lifespans[i] = 3.0 + Math.random() * 2.0;
          this.maxLifespans[i] = this.lifespans[i];
        }

        spawned++;
      }
    }
  }

  /**
   * Update particle positions and lifespans
   */
  public update(delta: number) {
    const posAttr = this.geo.attributes.position as THREE.BufferAttribute;
    const colorAttr = this.geo.attributes.color as THREE.BufferAttribute;
    let hasActive = false;

    for (let i = 0; i < this.maxParticles; i++) {
      if (this.lifespans[i] > 0) {
        hasActive = true;
        this.lifespans[i] -= delta;
        const idx3 = i * 3;

        if (this.lifespans[i] <= 0) {
          // Particle died
          this.positions[idx3 + 1] = -9999;
        } else {
          // Advance physics
          this.positions[idx3] += this.velocities[idx3] * delta;
          this.positions[idx3 + 1] += this.velocities[idx3 + 1] * delta;
          this.positions[idx3 + 2] += this.velocities[idx3 + 2] * delta;

          // Fade out color
          const lifeRatio = this.lifespans[i] / this.maxLifespans[i];
          this.colors[idx3] *= lifeRatio;
          this.colors[idx3 + 1] *= lifeRatio;
          this.colors[idx3 + 2] *= lifeRatio;
        }
      }
    }

    if (hasActive) {
      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
    }
  }
}
