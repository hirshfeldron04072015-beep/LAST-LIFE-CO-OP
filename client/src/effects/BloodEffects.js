import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class BloodEffects {
  constructor(scene) {
    this.scene = scene;
    this.effects = [];

    this.particleGeometry =
      new THREE.SphereGeometry(
        0.035,
        6,
        6
      );

    this.particleMaterial =
      new THREE.MeshBasicMaterial({
        color: 0x7a1111,
        transparent: true,
        opacity: 0.9,
        depthWrite: false
      });
  }

  burst(
    position,
    direction = new THREE.Vector3(0, 0, 1),
    amount = 12,
    strength = 3
  ) {
    if (!position) {
      return null;
    }

    const group =
      new THREE.Group();

    group.position.copy(position);

    const particles = [];

    for (
      let i = 0;
      i < amount;
      i++
    ) {
      const particle =
        new THREE.Mesh(
          this.particleGeometry,
          this.particleMaterial.clone()
        );

      particle.position.set(
        0,
        0,
        0
      );

      const spread =
        new THREE.Vector3(
          (Math.random() - 0.5) * 1.2,
          (Math.random() - 0.5) * 1.2,
          (Math.random() - 0.5) * 1.2
        );

      const velocity =
        direction
          .clone()
          .normalize()
          .multiplyScalar(
            strength *
              (0.5 + Math.random())
          )
          .add(spread);

      particle.userData.velocity =
        velocity;

      particle.userData.life =
        0.35 +
        Math.random() * 0.45;

      particle.userData.maxLife =
        particle.userData.life;

      group.add(particle);
      particles.push(particle);
    }

    this.scene.add(group);

    const effect = {
      object: group,
      particles
    };

    this.effects.push(effect);

    return effect;
  }

  headshot(
    position,
    direction
  ) {
    return this.burst(
      position,
      direction,
      18,
      4
    );
  }

  bodyHit(
    position,
    direction
  ) {
    return this.burst(
      position,
      direction,
      10,
      2.5
    );
  }

  update(dt) {
    for (
      let i =
        this.effects.length - 1;
      i >= 0;
      i--
    ) {
      const effect =
        this.effects[i];

      let aliveParticles = 0;

      for (
        const particle of
        effect.particles
      ) {
        if (
          particle.userData.life <= 0
        ) {
          continue;
        }

        aliveParticles++;

        particle.userData.life -= dt;

        const velocity =
          particle.userData.velocity;

        velocity.y -=
          8 * dt;

        particle.position.add(
          velocity
            .clone()
            .multiplyScalar(dt)
        );

        const progress =
          Math.max(
            0,
            particle.userData.life /
              particle.userData.maxLife
          );

        particle.scale.setScalar(
          0.5 +
            progress * 0.7
        );

        if (
          particle.material
        ) {
          particle.material.opacity =
            progress * 0.9;
        }
      }

      if (
        aliveParticles === 0
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
    if (
      !effect ||
      !effect.object
    ) {
      return;
    }

    this.scene.remove(
      effect.object
    );

    effect.object.traverse(
      (object) => {
        if (
          object.material &&
          object.material !==
            this.particleMaterial
        ) {
          object.material.dispose();
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

    this.particleGeometry.dispose();
    this.particleMaterial.dispose();
  }
}
