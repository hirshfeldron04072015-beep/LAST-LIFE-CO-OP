import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class Combat {
  constructor(camera, scene, enemies, weapon) {
    this.camera = camera;
    this.scene = scene;
    this.enemies = enemies;
    this.weapon = weapon;

    this.raycaster = new THREE.Raycaster();
  }

  shoot() {
    if (!this.weapon.fire()) {
      return null;
    }

    this.raycaster.setFromCamera(
      new THREE.Vector2(0, 0),
      this.camera
    );

    const targets =
      this.enemies.enemies.map(e => e.mesh);

    const hits =
      this.raycaster.intersectObjects(
        targets,
        false
      );

    if (hits.length === 0) {
      return {
        hit: false,
        kill: false
      };
    }

    const hit = hits[0];

    const distance =
      this.camera.position.distanceTo(
        hit.point
      );

    if (distance > this.weapon.current.range) {
      return {
        hit: false,
        kill: false
      };
    }

    const headshot =
      hit.point.y >
      hit.object.position.y + 0.55;

    const damage = headshot
      ? this.weapon.current.headDamage
      : this.weapon.current.damage;

    const killed =
      this.enemies.damage(
        hit.object,
        damage
      );

    return {
      hit: true,
      kill: killed,
      headshot
    };
  }
}
