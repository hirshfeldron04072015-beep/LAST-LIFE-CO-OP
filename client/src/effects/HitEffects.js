import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class HitEffects {
  constructor(scene) {
    this.scene = scene;

    this.effects = [];

    this.sparkMaterial =
      new THREE.MeshBasicMaterial({
        color: 0xffd36a,
        transparent: true,
        opacity: 1,
        depthWrite: false
      });

    this.impactMaterial =
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        depthWrite: false
      });

    this.bloodMaterial =
      new THREE.MeshBasicMaterial({
        color: 0x7a1515,
        transparent: true,
        opacity: 0.8,
        depthWrite: false
      });
  }

  createImpact(
    position,
    normal = new THREE.Vector3(0, 1, 0)
  ) {
    if (!position) {
      return null;
    }

    const group =
      new THREE.Group();

    group.position.copy(
      position
    );

    const ring =
      new THREE.Mesh(
        new THREE.RingGeometry(
          0.04,
          0.13,
          12
        ),
        this.impactMaterial.clone()
      );

    ring.lookAt(
      position.clone().add(normal)
    );

    group.add(ring);

    for (
      let i = 0;
      i < 5;
      i++
    ) {
      const spark =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.025,
            0.025,
            0.18
          ),
          this.sparkMaterial.clone()
        );

      spark.position.copy(
        normal
          .clone()
          .multiplyScalar(0.08)
      );

      const direction =
        normal.clone().add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 1.5,
            (Math.random() - 0.5) * 1.5,
            (Math.random() - 0.5) * 1.5
          )
        ).normalize();

      spark.lookAt(
        spark.position
          .clone()
          .add(direction)
      );

      group.add(spark);
    }

    this.scene.add(group);

    const effect = {
      object: group,
      life: 0.22,
      maxLife: 0.22
    };

    this.effects.push(effect);

    return group;
  }

  createBlood(
    position,
    direction = new THREE.Vector3(0, 0, 1)
  ) {
    if (!position) {
      return null;
    }

    const group =
      new THREE.Group();

    group.position.copy(
      position
    );

    for (
      let i = 0;
      i < 9;
      i++
    ) {
      const particle =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.025 +
              Math.random() * 0.025,
            6,
            6
          ),
          this.bloodMaterial.clone()
        );

      particle.position.set(
        0,
        0,
        0
      );

      const velocity =
        direction
          .clone()
          .multiplyScalar(
            1.5 +
              Math.random() * 2.5
          )
          .add(
            new THREE.Vector3(
              (Math.random() - 0.5) * 1.2,
              Math.random() * 1.5,
              (Math.random() - 0.5) * 1.2
            )
          );

      particle.userData.velocity =
        velocity;

      group.add(
        particle
      );
    }

    this.scene.add(group);

    const effect = {
      object: group,
      life: 0.45,
      maxLife: 0.45
    };

    this.effects.push(effect);

    return group;
  }

  createHeadshot(
    position,
    direction
  ) {
    const group =
      this.createBlood(
        position,
        direction
      );

    if (!group) {
      return null;
    }

    group.scale.setScalar(
      1.5
    );

    return group;
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

      effect.life -= dt;

      const progress =
        Math.max(
          0,
          effect.life /
            effect.maxLife
        );

      if (
        effect.object
      ) {
        effect.object
          .traverse(
            (child) => {
              if (
                child.material &&
                child.material
                  .opacity !==
                  undefined
              ) {
                child.material.opacity =
                  progress;
              }

              if (
                child.userData &&
                child.userData
                  .velocity
              ) {
                child.userData.velocity.y -=
                  7 * dt;

                child.position.add(
                  child.userData
                    .velocity
                    .clone()
                    .multiplyScalar(
                      dt
                    )
                );
              }
            }
          );

        effect.object.scale
          .multiplyScalar(
            1 + dt * 1.5
          );
      }

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

  removeEffect(
    effect
  ) {
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

    this.sparkMaterial.dispose();
    this.impactMaterial.dispose();
    this.bloodMaterial.dispose();
  }
}
