import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export class Explosion {
  constructor(scene) {
    this.scene = scene;
    this.effects = [];
  }

  create(position, options = {}) {
    const {
      size = 1,
      duration = 0.65,
      color = 0xffaa44,
      smoke = true
    } = options;

    const group = new THREE.Group();
    group.position.copy(position);

    // Main flash
    const flashGeometry = new THREE.SphereGeometry(0.35 * size, 12, 8);

    const flashMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 1,
      depthWrite: false
    });

    const flash = new THREE.Mesh(
      flashGeometry,
      flashMaterial
    );

    group.add(flash);

    // Expanding shockwave
    const ringGeometry = new THREE.RingGeometry(
      0.15 * size,
      0.25 * size,
      32
    );

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffcc66,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const ring = new THREE.Mesh(
      ringGeometry,
      ringMaterial
    );

    ring.rotation.x = -Math.PI / 2;
    group.add(ring);

    // Explosion particles
    const particleGroup = new THREE.Group();

    const particleCount = Math.floor(22 * size);

    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.BoxGeometry(
        0.04 * size,
        0.04 * size,
        0.04 * size
      );

      const material = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xffaa33 : 0xff5522,
        transparent: true,
        opacity: 1,
        depthWrite: false
      });

      const particle = new THREE.Mesh(
        geometry,
        material
      );

      particle.position.set(0, 0, 0);

      const direction = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 1.5,
        (Math.random() - 0.5) * 2
      ).normalize();

      particle.userData.velocity = direction.multiplyScalar(
        (2 + Math.random() * 5) * size
      );

      particle.userData.rotationSpeed = new THREE.Vector3(
        Math.random() * 8,
        Math.random() * 8,
        Math.random() * 8
      );

      particleGroup.add(particle);
    }

    group.add(particleGroup);

    // Optional smoke cloud
    let smokeGroup = null;

    if (smoke) {
      smokeGroup = new THREE.Group();

      for (let i = 0; i < 7; i++) {
        const geometry = new THREE.SphereGeometry(
          (0.18 + Math.random() * 0.18) * size,
          10,
          8
        );

        const material = new THREE.MeshBasicMaterial({
          color: 0x555555,
          transparent: true,
          opacity: 0.45,
          depthWrite: false
        });

        const cloud = new THREE.Mesh(
          geometry,
          material
        );

        cloud.position.set(
          (Math.random() - 0.5) * 0.8 * size,
          Math.random() * 0.7 * size,
          (Math.random() - 0.5) * 0.8 * size
        );

        cloud.userData.speed =
          (0.4 + Math.random() * 0.6) * size;

        smokeGroup.add(cloud);
      }

      group.add(smokeGroup);
    }

    this.scene.add(group);

    this.effects.push({
      group,
      flash,
      ring,
      particles: particleGroup,
      smoke: smokeGroup,
      age: 0,
      duration
    });

    return group;
  }

  update(dt) {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const effect = this.effects[i];

      effect.age += dt;

      const progress = Math.min(
        effect.age / effect.duration,
        1
      );

      // Flash expands quickly
      const flashScale =
        1 + progress * 3.5;

      effect.flash.scale.setScalar(
        flashScale
      );

      effect.flash.material.opacity =
        Math.max(0, 1 - progress * 2.5);

      // Shockwave expands
      const ringScale =
        1 + progress * 8;

      effect.ring.scale.setScalar(
        ringScale
      );

      effect.ring.material.opacity =
        Math.max(0, 0.8 - progress);

      // Particle movement
      effect.particles.children.forEach(
        particle => {
          const velocity =
            particle.userData.velocity;

          particle.position.addScaledVector(
            velocity,
            dt
          );

          velocity.y -= 7 * dt;

          particle.rotation.x +=
            particle.userData.rotationSpeed.x * dt;

          particle.rotation.y +=
            particle.userData.rotationSpeed.y * dt;

          particle.rotation.z +=
            particle.userData.rotationSpeed.z * dt;

          particle.material.opacity =
            Math.max(0, 1 - progress * 1.4);
        }
      );

      // Smoke rises and expands
      if (effect.smoke) {
        effect.smoke.children.forEach(
          cloud => {
            cloud.position.y +=
              cloud.userData.speed * dt;

            cloud.scale.multiplyScalar(
              1 + dt * 0.8
            );

            cloud.material.opacity =
              Math.max(
                0,
                0.45 - progress * 0.4
              );
          }
        );
      }

      if (effect.age >= effect.duration) {
        this.removeEffect(i);
      }
    }
  }

  removeEffect(index) {
    const effect = this.effects[index];

    if (!effect) return;

    this.scene.remove(effect.group);

    effect.group.traverse(object => {
      if (object.geometry) {
        object.geometry.dispose();
      }

      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(
            material => material.dispose()
          );
        } else {
          object.material.dispose();
        }
      }
    });

    this.effects.splice(index, 1);
  }

  clear() {
    for (
      let i = this.effects.length - 1;
      i >= 0;
      i--
    ) {
      this.removeEffect(i);
    }
  }

  destroy() {
    this.clear();
    this.scene = null;
  }
}
