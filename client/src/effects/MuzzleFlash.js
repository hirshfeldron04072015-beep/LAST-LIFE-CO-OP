import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class MuzzleFlash {
  constructor(scene) {
    this.scene = scene;

    this.effects = [];

    this.material = new THREE.MeshBasicMaterial({
      color: 0xffc36b,
      transparent: true,
      opacity: 0.95,
      depthWrite: false
    });
  }

  create(position, direction) {
    if (!position) {
      return null;
    }

    const flash = new THREE.Group();

    flash.position.copy(position);

    if (direction) {
      flash.lookAt(
        position.clone().add(direction)
      );
    }

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.10,
        8,
        8
      ),
      this.material.clone()
    );

    core.scale.set(
      1,
      1,
      2.2
    );

    flash.add(core);

    const rays = [];

    for (let i = 0; i < 6; i++) {
      const ray = new THREE.Mesh(
        new THREE.ConeGeometry(
          0.035,
          0.45 + Math.random() * 0.3,
          6
        ),
        this.material.clone()
      );

      const angle =
        (Math.PI * 2 * i) / 6;

      ray.position.set(
        Math.cos(angle) * 0.12,
        Math.sin(angle) * 0.12,
        0.12
      );

      ray.rotation.z =
        -angle;

      ray.rotation.x =
        Math.PI / 2;

      flash.add(ray);
      rays.push(ray);
    }

    this.scene.add(flash);

    const effect = {
      object: flash,
      life: 0.055,
      maxLife: 0.055,
      rays
    };

    this.effects.push(effect);

    return flash;
  }

  update(dt) {
    for (
      let i = this.effects.length - 1;
      i >= 0;
      i--
    ) {
      const effect =
        this.effects[i];

      effect.life -= dt;

      const progress =
        Math.max(
          0,
          effect.life /
            effect.maxLife
        );

      effect.object.scale.setScalar(
        0.75 +
        progress * 0.45
      );

      effect.object.traverse(
        (child) => {
          if (
            child.material &&
            child.material.opacity !==
              undefined
          ) {
            child.material.opacity =
              progress;
          }
        }
      );

      if (
        effect.life <= 0
      ) {
        this.removeEffect(
          effect
        );

        this.effects.splice(
          i,
          1
        );
      }
    }
  }

  removeEffect(effect) {
    if (!effect?.object) {
      return;
    }

    this.scene.remove(
      effect.object
    );

    effect.object.traverse(
      (child) => {
        if (
          child.geometry
        ) {
          child.geometry.dispose();
        }

        if (
          child.material
        ) {
          child.material.dispose();
        }
      }
    );
  }

  clear() {
    for (
      const effect of this.effects
    ) {
      this.removeEffect(
        effect
      );
    }

    this.effects.length = 0;
  }

  destroy() {
    this.clear();

    this.material.dispose();
  }
}
