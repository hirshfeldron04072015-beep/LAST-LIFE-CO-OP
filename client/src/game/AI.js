import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class EnemyManager {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.enemies = [];
  }

  spawn(count = 8) {
    for (let i = 0; i < count; i++) {
      this.createEnemy();
    }
  }

  createEnemy() {
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(
        0.45,
        1.0,
        5,
        8
      ),
      new THREE.MeshStandardMaterial({
        color: 0x9c2424
      })
    );

    let x;
    let z;

    do {
      x = (Math.random() - 0.5) * 75;
      z = (Math.random() - 0.5) * 75;
    } while (
      Math.hypot(
        x - this.player.position.x,
        z - this.player.position.z
      ) < 18
    );

    body.position.set(x, 1.2, z);

    body.userData.enemy = true;
    body.userData.health = 100;

    this.scene.add(body);

    this.enemies.push({
      mesh: body,
      health: 100,
      cooldown: Math.random() * 2
    });
  }

  update(dt, onAttack) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      if (!enemy.mesh.parent) {
        this.enemies.splice(i, 1);
        continue;
      }

      const target = this.player.position;

      const direction = new THREE.Vector3(
        target.x - enemy.mesh.position.x,
        0,
        target.z - enemy.mesh.position.z
      );

      const distance = direction.length();

      if (distance > 3) {
        direction.normalize();

        enemy.mesh.position.x +=
          direction.x * dt * 1.7;

        enemy.mesh.position.z +=
          direction.z * dt * 1.7;
      }

      enemy.mesh.lookAt(
        target.x,
        enemy.mesh.position.y,
        target.z
      );

      enemy.cooldown -= dt;

      if (
        distance < 18 &&
        enemy.cooldown <= 0
      ) {
        enemy.cooldown = 1.2 + Math.random();

        onAttack(8 + Math.random() * 8);
      }
    }
  }

  damage(enemyMesh, amount) {
    const enemy = this.enemies.find(
      e => e.mesh === enemyMesh
    );

    if (!enemy) return false;

    enemy.health -= amount;

    if (enemy.health <= 0) {
      this.scene.remove(enemy.mesh);

      const index =
        this.enemies.indexOf(enemy);

      this.enemies.splice(index, 1);

      return true;
    }

    return false;
  }
}
