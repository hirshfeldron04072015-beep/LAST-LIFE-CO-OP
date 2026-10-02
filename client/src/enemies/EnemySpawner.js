import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { Enemy } from "./Enemy.js";

export class EnemySpawner {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;

    this.enemies = [];

    this.maxEnemies = 12;
    this.spawnRadius = 35;
    this.minSpawnDistance = 15;

    this.spawnCooldown = 0;
    this.spawnInterval = 2.5;

    this.wave = 1;
    this.waveSize = 5;
    this.spawnedThisWave = 0;

    this.enabled = true;

    this.spawnPoints = [];

    this.createSpawnPoints();
  }

  createSpawnPoints() {
    this.spawnPoints = [
      new THREE.Vector3(-35, 0, -35),
      new THREE.Vector3(0, 0, -42),
      new THREE.Vector3(35, 0, -35),

      new THREE.Vector3(-42, 0, -5),
      new THREE.Vector3(42, 0, -5),

      new THREE.Vector3(-40, 0, 25),
      new THREE.Vector3(0, 0, 40),
      new THREE.Vector3(40, 0, 25),

      new THREE.Vector3(-25, 0, 35),
      new THREE.Vector3(25, 0, 35)
    ];
  }

  update(dt) {
    if (!this.enabled) return;

    this.cleanupDeadEnemies();

    this.spawnCooldown -= dt;

    if (
      this.spawnCooldown <= 0 &&
      this.enemies.length < this.maxEnemies &&
      this.spawnedThisWave < this.waveSize
    ) {
      const spawned = this.spawnEnemy();

      if (spawned) {
        this.spawnCooldown = this.spawnInterval;
        this.spawnedThisWave++;
      }
    }

    this.updateEnemies(dt);

    if (
      this.spawnedThisWave >= this.waveSize &&
      this.enemies.length === 0
    ) {
      this.startNextWave();
    }
  }

  spawnEnemy(options = {}) {
    const position = this.findSpawnPosition();

    if (!position) {
      return null;
    }

    const enemy = new Enemy(this.scene, {
      health: options.health ?? this.getEnemyHealth(),
      damage: options.damage ?? this.getEnemyDamage(),
      moveSpeed: options.moveSpeed ?? this.getEnemySpeed(),
      attackRange: options.attackRange ?? 18,
      detectionRange: options.detectionRange ?? 35,
      attackCooldown: options.attackCooldown ?? 1.0,

      onAttack: (enemyInstance) => {
        this.handleEnemyAttack(enemyInstance);
      },

      onDeath: (enemyInstance) => {
        this.handleEnemyDeath(enemyInstance);
      }
    });

    enemy.setPosition(position);

    enemy.wave = this.wave;

    this.enemies.push(enemy);

    return enemy;
  }

  findSpawnPosition() {
    if (!this.player) {
      return this.getRandomSpawnPoint();
    }

    const playerPosition = this.player.getPosition
      ? this.player.getPosition()
      : null;

    if (!playerPosition) {
      return this.getRandomSpawnPoint();
    }

    const shuffled = [...this.spawnPoints];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [shuffled[i], shuffled[j]] = [
        shuffled[j],
        shuffled[i]
      ];
    }

    for (const point of shuffled) {
      const distance = point.distanceTo(playerPosition);

      if (distance >= this.minSpawnDistance) {
        return point.clone();
      }
    }

    return null;
  }

  getRandomSpawnPoint() {
    const angle = Math.random() * Math.PI * 2;
    const distance =
      this.spawnRadius +
      Math.random() * 10;

    return new THREE.Vector3(
      Math.cos(angle) * distance,
      0,
      Math.sin(angle) * distance
    );
  }

  updateEnemies(dt) {
    for (const enemy of this.enemies) {
      if (!enemy || !enemy.isAlive()) {
        continue;
      }

      enemy.update(dt, this.player);
    }
  }

  handleEnemyAttack(enemy) {
    if (!this.player) return;

    if (
      typeof this.player.takeDamage === "function"
    ) {
      this.player.takeDamage(enemy.damage || 10);
    }
  }

  handleEnemyDeath(enemy) {
    if (!enemy) return;

    if (
      this.player &&
      typeof this.player.addXP === "function"
    ) {
      this.player.addXP(100);
    }

    if (
      this.player &&
      typeof this.player.addKill === "function"
    ) {
      this.player.addKill();
    }
  }

  cleanupDeadEnemies() {
    this.enemies = this.enemies.filter((enemy) => {
      if (!enemy) {
        return false;
      }

      if (enemy.isAlive()) {
        return true;
      }

      return false;
    });
  }

  startNextWave() {
    this.wave++;

    this.spawnedThisWave = 0;

    this.waveSize =
      4 +
      Math.min(
        10,
        Math.floor(this.wave * 1.5)
      );

    this.maxEnemies =
      Math.min(
        18,
        8 + this.wave
      );

    this.spawnInterval =
      Math.max(
        0.8,
        2.5 - this.wave * 0.08
      );

    this.spawnCooldown = 2;
  }

  getEnemyHealth() {
    return 100 + (this.wave - 1) * 12;
  }

  getEnemyDamage() {
    return 8 + Math.min(12, this.wave - 1);
  }

  getEnemySpeed() {
    return 1.5 + Math.min(1.2, this.wave * 0.05);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  reset() {
    for (const enemy of this.enemies) {
      if (enemy && typeof enemy.destroy === "function") {
        enemy.destroy();
      }
    }

    this.enemies.length = 0;

    this.wave = 1;
    this.waveSize = 5;
    this.spawnedThisWave = 0;

    this.spawnCooldown = 0;

    this.maxEnemies = 12;
    this.spawnInterval = 2.5;
    this.enabled = true;
  }

  getEnemies() {
    return this.enemies;
  }

  getAliveEnemies() {
    return this.enemies.filter(
      (enemy) =>
        enemy &&
        enemy.isAlive()
    );
  }

  getAliveCount() {
    return this.getAliveEnemies().length;
  }

  getWave() {
    return this.wave;
  }

  getWaveProgress() {
    return {
      wave: this.wave,
      spawned: this.spawnedThisWave,
      total: this.waveSize,
      alive: this.getAliveCount()
    };
  }

  destroy() {
    for (const enemy of this.enemies) {
      if (
        enemy &&
        typeof enemy.destroy === "function"
      ) {
        enemy.destroy();
      }
    }

    this.enemies.length = 0;
    this.spawnPoints.length = 0;
  }
}
