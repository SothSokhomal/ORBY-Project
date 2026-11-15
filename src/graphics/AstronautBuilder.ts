/**
 * Project Artemis: 3D Procedural Astronaut Character
 * NASA ACES Spacesuit Model with Dead-Space style LED spine telemetry and microgravity animations.
 */

import * as THREE from 'three';

export interface AstronautActor {
  id: string;
  group: THREE.Group;
  head: THREE.Group;
  visor: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  spineLedMaterial: THREE.MeshBasicMaterial;
  baseY: number;
  walkCycle: number;
  update: (delta: number, isWalking: boolean, health: number, lookTarget?: THREE.Vector3) => void;
}

export function createAstronautActor(
  id: string,
  suitColor = '#ff5500',
  visorColor = '#ffd700'
): AstronautActor {
  const group = new THREE.Group();
  group.name = `astronaut-${id}`;

  // Shared PBR Materials
  const suitMaterial = new THREE.MeshStandardMaterial({
    color: suitColor,
    roughness: 0.72,
    metalness: 0.1,
  });

  const suitJointMaterial = new THREE.MeshStandardMaterial({
    color: '#2a2b2e',
    roughness: 0.85,
    metalness: 0.2,
  });

  const goldVisorMaterial = new THREE.MeshPhysicalMaterial({
    color: visorColor,
    roughness: 0.12,
    metalness: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 1.0,
  });

  const packMaterial = new THREE.MeshStandardMaterial({
    color: '#e0e0e0',
    roughness: 0.4,
    metalness: 0.3,
  });

  const spineLedMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff66, // Green at 100% health
  });

  // 1. Torso (Main Suit Body)
  const torsoGeo = new THREE.CylinderGeometry(0.24, 0.20, 0.65, 12);
  const torso = new THREE.Mesh(torsoGeo, suitMaterial);
  torso.position.y = 0.95;
  torso.castShadow = true;
  torso.receiveShadow = true;
  group.add(torso);

  // Chest telemetry control pack & NASA emblem
  const chestPackGeo = new THREE.BoxGeometry(0.22, 0.18, 0.08);
  const chestPack = new THREE.Mesh(chestPackGeo, packMaterial);
  chestPack.position.set(0, 1.05, 0.18);
  group.add(chestPack);

  // 2. PLSS Backpack (Portable Life Support System)
  const backpackGeo = new THREE.BoxGeometry(0.34, 0.52, 0.18);
  const backpack = new THREE.Mesh(backpackGeo, packMaterial);
  backpack.position.set(0, 1.02, -0.19);
  backpack.castShadow = true;
  group.add(backpack);

  // Dual oxygen cylinders on backpack
  const tankGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.45, 10);
  const tankLeft = new THREE.Mesh(tankGeo, packMaterial);
  tankLeft.position.set(-0.11, 1.02, -0.30);
  const tankRight = new THREE.Mesh(tankGeo, packMaterial);
  tankRight.position.set(0.11, 1.02, -0.30);
  group.add(tankLeft, tankRight);

  // Dead-Space style vertical spine health LED strip (5 segments)
  const spineGeo = new THREE.BoxGeometry(0.04, 0.38, 0.02);
  const spineLed = new THREE.Mesh(spineGeo, spineLedMaterial);
  spineLed.position.set(0, 1.04, -0.29);
  group.add(spineLed);

  // 3. Neck Ring & Helmet
  const neckRingGeo = new THREE.TorusGeometry(0.16, 0.03, 8, 20);
  neckRingGeo.rotateX(Math.PI / 2);
  const neckRing = new THREE.Mesh(neckRingGeo, suitJointMaterial);
  neckRing.position.y = 1.30;
  group.add(neckRing);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.45, 0);

  const helmetSphereGeo = new THREE.SphereGeometry(0.20, 16, 16);
  const helmet = new THREE.Mesh(helmetSphereGeo, suitMaterial);
  helmet.castShadow = true;
  headGroup.add(helmet);

  // Reflective Gold Visor
  const visorGeo = new THREE.SphereGeometry(0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
  visorGeo.rotateX(Math.PI * 0.38);
  const visor = new THREE.Mesh(visorGeo, goldVisorMaterial);
  visor.position.set(0, 0, 0.05);
  headGroup.add(visor);

  group.add(headGroup);

  // 4. Arms (Pivoted at shoulders)
  const armGeo = new THREE.CylinderGeometry(0.07, 0.065, 0.45, 10);
  const gloveGeo = new THREE.SphereGeometry(0.08, 10, 10);

  // Left Arm
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.30, 1.22, 0);
  const leftUpper = new THREE.Mesh(armGeo, suitMaterial);
  leftUpper.position.y = -0.22;
  leftUpper.castShadow = true;
  const leftGlove = new THREE.Mesh(gloveGeo, suitJointMaterial);
  leftGlove.position.y = -0.46;
  leftArm.add(leftUpper, leftGlove);
  group.add(leftArm);

  // Right Arm
  const rightArm = new THREE.Group();
  rightArm.position.set(0.30, 1.22, 0);
  const rightUpper = new THREE.Mesh(armGeo, suitMaterial);
  rightUpper.position.y = -0.22;
  rightUpper.castShadow = true;
  const rightGlove = new THREE.Mesh(gloveGeo, suitJointMaterial);
  rightGlove.position.y = -0.46;
  rightArm.add(rightUpper, rightGlove);
  group.add(rightArm);

  // 5. Utility Belt
  const beltGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.06, 12);
  const belt = new THREE.Mesh(beltGeo, suitJointMaterial);
  belt.position.y = 0.65;
  group.add(belt);

  // 6. Legs (Pivoted at hips)
  const legGeo = new THREE.CylinderGeometry(0.085, 0.075, 0.55, 10);
  const bootGeo = new THREE.BoxGeometry(0.16, 0.12, 0.26);

  // Left Leg
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.13, 0.62, 0);
  const leftThigh = new THREE.Mesh(legGeo, suitMaterial);
  leftThigh.position.y = -0.27;
  leftThigh.castShadow = true;
  const leftBoot = new THREE.Mesh(bootGeo, suitJointMaterial);
  leftBoot.position.set(0, -0.56, 0.04);
  leftBoot.castShadow = true;
  leftLeg.add(leftThigh, leftBoot);
  group.add(leftLeg);

  // Right Leg
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.13, 0.62, 0);
  const rightThigh = new THREE.Mesh(legGeo, suitMaterial);
  rightThigh.position.y = -0.27;
  rightThigh.castShadow = true;
  const rightBoot = new THREE.Mesh(bootGeo, suitJointMaterial);
  rightBoot.position.set(0, -0.56, 0.04);
  rightBoot.castShadow = true;
  rightLeg.add(rightThigh, rightBoot);
  group.add(rightLeg);

  // Contact shadow disc on ground
  const shadowGeo = new THREE.CircleGeometry(0.35, 16);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.position.y = 0.015;
  group.add(contactShadow);

  let walkCycle = 0;
  let idleTime = Math.random() * 10;
  const baseY = 0;

  const actor: AstronautActor = {
    id,
    group,
    head: headGroup,
    visor,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    spineLedMaterial,
    baseY,
    walkCycle: 0,
    update(delta: number, isWalking: boolean, health: number, lookTarget?: THREE.Vector3) {
      idleTime += delta;

      // Update Dead-Space Spine LED color according to health
      if (health > 60) {
        spineLedMaterial.color.setHex(0x00ff66); // Green
      } else if (health > 25) {
        spineLedMaterial.color.setHex(0xffaa00); // Amber
      } else {
        spineLedMaterial.color.setHex(0xff1100); // Red
      }

      if (isWalking) {
        // Lunar 1/6th gravity bouncy gait
        walkCycle += delta * 6.0;
        const hopHeight = Math.abs(Math.sin(walkCycle)) * 0.18;
        group.position.y = baseY + hopHeight;

        leftLeg.rotation.x = Math.sin(walkCycle) * 0.55;
        rightLeg.rotation.x = -Math.sin(walkCycle) * 0.55;

        leftArm.rotation.x = -Math.sin(walkCycle) * 0.45;
        rightArm.rotation.x = Math.sin(walkCycle) * 0.45;
      } else {
        // Micro-gravity subtle idle breathing & weight drift
        const breathe = Math.sin(idleTime * 1.6) * 0.015;
        torso.scale.set(1 + breathe * 0.5, 1 + breathe, 1 + breathe * 0.5);
        group.position.y = baseY + Math.sin(idleTime * 1.2) * 0.025;

        leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, 0.15 + Math.sin(idleTime * 1.1) * 0.05, 4, delta);
        rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, 0.15 + Math.cos(idleTime * 1.1) * 0.05, 4, delta);
        leftLeg.rotation.x = THREE.MathUtils.damp(leftLeg.rotation.x, 0, 5, delta);
        rightLeg.rotation.x = THREE.MathUtils.damp(rightLeg.rotation.x, 0, 5, delta);
      }

      // Smooth head turn if look target is provided
      if (lookTarget) {
        const localTarget = group.worldToLocal(lookTarget.clone());
        const targetYaw = Math.atan2(localTarget.x, localTarget.z);
        headGroup.rotation.y = THREE.MathUtils.damp(
          headGroup.rotation.y,
          THREE.MathUtils.clamp(targetYaw, -Math.PI * 0.35, Math.PI * 0.35),
          5,
          delta
        );
      }
    },
  };

  return actor;
}
