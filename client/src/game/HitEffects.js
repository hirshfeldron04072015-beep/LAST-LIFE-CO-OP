import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class HitEffects {
  constructor(scene) {
    this.scene = scene;
    this.effects = [];
  }

  impact(position, headshot = false) {
    const color =
      headshot
        ? 0xffffff
        : 0xffb84d;

    for (let i = 0; i < 6; i++) {
      const mesh =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.025,
            4,
            4
          ),
          new THREE.MeshBasicMaterial({
            color
          })
        );

      mesh.position.copy(
        position
      );

      mesh.userData.life =
        0.2;

      mesh.userData.velocity =
        new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          Math.random() * 2,
          (Math.random() - 0.5) * 3
        );

      this.scene.add(mesh);

      this.effects.push(
        mesh
      );
    }
  }

  update(dt) {
    for (
      let i = this.effects.length - 1;
      i >= 0;
      i--
    ) {
      const effect =
        this.effects[i];

      effect.userData.life -= dt;

      effect.position.addScaledVector(
        effect.userData.velocity,
        dt
      );

      effect.userData.velocity.y -=
        8 * dt;

      if (
        effect.userData.life <= 0
      ) {
        this.scene.remove(
          effect
        );

        effect.geometry.dispose();
        effect.material.dispose();

        this.effects.splice(
          i,
          1
        );
      }
    }
  }
}
