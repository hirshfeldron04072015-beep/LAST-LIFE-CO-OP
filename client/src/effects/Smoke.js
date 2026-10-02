import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export class Smoke {
  constructor(scene) {
    this.scene = scene;
    this.clouds = [];
  }

  create(position, options = {}) {
    const {
      count = 12,
      size = 1,
      duration = 2.5,
      color = 0x555555
    } = options;

    const group = new THREE.Group();
    group.position.copy(position);

    for (let i = 0; i < count; i++) {
      const radius =
        (0.12 + Math.random() * 0.22) * size;

      const geometry = new THREE.SphereGeometry(
        radius,
        10,
        8
      );

      const material = new THREE.MeshStandardMaterial({
        color,
        transparent: true,
        opacity: 0.32 + Math.random() * 0.18,
        roughness: 1,
        metalness: 0,
        depthWrite: false
      });

      const cloud = new THREE.Mesh(
        geometry,
        material
      );

      cloud.position.set(
        (Math.random() - 0.5) * 0.7 * size,
        Math.random() * 0.35 * size,
        (Math.random() - 0.5) * 0.7 * size
      );

      cloud.scale.setScalar(
        0.7 + Math.random() * 0.7
      );

      cloud.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.25,
        0.35 + Math.random() * 0.55,
        (Math.random() - 0.5) * 0.25
      );

      cloud.userData.rotationSpeed =
        (Math.random() - 0.5) * 1.5;

      cloud.userData.growth =
        0.25 + Math.random() * 0.45;

      group.add(cloud);
    }

    this.scene.add(group);

    this.clouds.push({
      group,
      age: 0,
      duration
    });

    return group;
  }

  update(dt) {
    for (let i = this.clouds.length - 1; i >= 0; i--) {
      const cloudSystem = this.clouds[i];

      cloudSystem.age += dt;

      const progress = Math.min(
        cloudSystem.age / cloudSystem.duration,
        1
      );

      cloudSystem.group.children.forEach(
        cloud => {
          const velocity =
            cloud.userData.velocity;

          cloud.position.addScaledVector(
            velocity,
            dt
          );

          cloud.rotation.y +=
            cloud.userData.rotationSpeed * dt;

          const growth =
            1 +
            cloud.userData.growth * dt;

          cloud.scale.multiplyScalar(growth);

          const fadeStart = 0.35;

          if (progress < fadeStart) {
            cloud.material.opacity =
              0.4 * (progress / fadeStart);
          } else {
            cloud.material.opacity =
              0.4 *
              (1 -
                (progress - fadeStart) /
                  (1 - fadeStart));
          }
        }
      );

      if (
        cloudSystem.age >=
        cloudSystem.duration
      ) {
        this.remove(i);
      }
    }
  }

  remove(index) {
    const cloudSystem = this.clouds[index];

    if (!cloudSystem) return;

    this.scene.remove(
      cloudSystem.group
    );

    cloudSystem.group.traverse(
      object => {
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
      }
    );

    this.clouds.splice(index, 1);
  }

  clear() {
    for (
      let i = this.clouds.length - 1;
      i >= 0;
      i--
    ) {
      this.remove(i);
    }
  }

  destroy() {
    this.clear();
    this.scene = null;
  }
}
