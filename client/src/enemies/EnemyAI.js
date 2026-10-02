import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class EnemyAI {
  constructor(enemy) {
    this.enemy = enemy;

    // Detection
    this.detectionRange = 30;
    this.attackRange = 18;

    // AI state
    this.state = "idle";

    this.target = null;

    // Movement
    this.wanderTarget =
      new THREE.Vector3();

    this.wanderTimer = 0;

    this.wanderInterval = 3;

    // Combat
    this.attackTimer = 0;

    // Thinking interval prevents the AI
    // from recalculating everything every
    // single frame.
    this.thinkTimer = 0;
    this.thinkInterval = 0.12;

    // Reusable vectors
    this.toTarget =
      new THREE.Vector3();

    this.direction =
      new THREE.Vector3();
  }

  update(dt, player) {
    if (
      !this.enemy ||
      !this.enemy.isAlive()
    ) {
      return;
    }

    this.thinkTimer -= dt;
    this.attackTimer -= dt;

    if (this.thinkTimer <= 0) {
      this.thinkTimer =
        this.thinkInterval;

      this.think(player);
    }

    this.updateState(dt);
  }

  // =========================================
  // THINK
  // =========================================

  think(player) {
    if (!player) {
      this.state = "idle";
      this.target = null;
      return;
    }

    const playerPosition =
      player.getPosition
        ? player.getPosition()
        : player.position;

    if (!playerPosition) {
      return;
    }

    this.toTarget.subVectors(
      playerPosition,
      this.enemy.getPosition()
    );

    const distance =
      this.toTarget.length();

    // Already alerted enemies keep
    // their target for a while.
    if (
      distance <=
      this.detectionRange
    ) {
      this.target = player;

      if (
        distance <=
        this.attackRange
      ) {
        this.state = "attack";
      } else {
        this.state = "chase";
      }

      return;
    }

    // If the enemy has lost the player,
    // search around the last known area.
    if (
      this.target &&
      this.state !== "idle"
    ) {
      this.state = "search";
      return;
    }

    this.target = null;

    this.state = "patrol";
  }

  // =========================================
  // STATE UPDATE
  // =========================================

  updateState(dt) {
    switch (this.state) {
      case "idle":
        this.updateIdle(dt);
        break;

      case "patrol":
        this.updatePatrol(dt);
        break;

      case "chase":
        this.updateChase(dt);
        break;

      case "attack":
        this.updateAttack(dt);
        break;

      case "search":
        this.updateSearch(dt);
        break;

      default:
        this.state = "idle";
        break;
    }
  }

  // =========================================
  // IDLE
  // =========================================

  updateIdle(dt) {
    this.enemy.velocity.set(
      0,
      0,
      0
    );
  }

  // =========================================
  // PATROL
  // =========================================

  updatePatrol(dt) {
    this.wanderTimer -= dt;

    if (
      this.wanderTimer <= 0
    ) {
      this.chooseWanderTarget();

      this.wanderTimer =
        this.wanderInterval +
        Math.random() * 2;
    }

    this.moveToward(
      this.wanderTarget,
      this.enemy.moveSpeed * 0.45
    );
  }

  chooseWanderTarget() {
    const origin =
      this.enemy.spawnPosition;

    const angle =
      Math.random() *
      Math.PI *
      2;

    const distance =
      4 +
      Math.random() * 10;

    this.wanderTarget.set(
      origin.x +
        Math.cos(angle) *
        distance,

      0,

      origin.z +
        Math.sin(angle) *
        distance
    );
  }

  // =========================================
  // CHASE
  // =========================================

  updateChase(dt) {
    if (!this.target) {
      this.state = "patrol";
      return;
    }

    const targetPosition =
      this.target.getPosition
        ? this.target.getPosition()
        : this.target.position;

    if (!targetPosition) {
      return;
    }

    this.moveToward(
      targetPosition,
      this.enemy.moveSpeed
    );
  }

  // =========================================
  // ATTACK
  // =========================================

  updateAttack(dt) {
    this.enemy.velocity.set(
      0,
      0,
      0
    );

    if (!this.target) {
      this.state = "patrol";
      return;
    }

    const targetPosition =
      this.target.getPosition
        ? this.target.getPosition()
        : this.target.position;

    if (!targetPosition) {
      return;
    }

    this.faceTarget(
      targetPosition,
      dt
    );

    this.toTarget.subVectors(
      targetPosition,
      this.enemy.getPosition()
    );

    const distance =
      this.toTarget.length();

    /*
     * If the player moves away,
     * go back to chasing.
     */
    if (
      distance >
      this.attackRange * 1.15
    ) {
      this.state = "chase";
      return;
    }

    /*
     * Attack through the enemy's
     * existing attack callback.
     */
    if (
      this.attackTimer <= 0
    ) {
      this.attackTimer =
        this.enemy.attackCooldown;

      this.enemy.attack(
        this.target
      );
    }
  }

  // =========================================
  // SEARCH
  // =========================================

  updateSearch(dt) {
    this.wanderTimer -= dt;

    if (
      this.wanderTimer <= 0
    ) {
      this.wanderTimer = 2.5;

      if (this.target) {
        const targetPosition =
          this.target.getPosition
            ? this.target.getPosition()
            : this.target.position;

        if (targetPosition) {
          this.wanderTarget.copy(
            targetPosition
          );

          /*
           * Search slightly around the
           * player's last known position.
           */
          this.wanderTarget.x +=
            (Math.random() - 0.5) * 8;

          this.wanderTarget.z +=
            (Math.random() - 0.5) * 8;
        }
      }
    }

    this.moveToward(
      this.wanderTarget,
      this.enemy.moveSpeed * 0.7
    );
  }

  // =========================================
  // MOVEMENT
  // =========================================

  moveToward(
    targetPosition,
    speed
  ) {
    if (!targetPosition) {
      return;
    }

    this.direction.subVectors(
      targetPosition,
      this.enemy.getPosition()
    );

    this.direction.y = 0;

    const distance =
      this.direction.length();

    if (distance < 0.25) {
      this.enemy.velocity.set(
        0,
        0,
        0
      );

      return;
    }

    this.direction.normalize();

    this.enemy.velocity.copy(
      this.direction
    );

    this.enemy.velocity.multiplyScalar(
      speed
    );

    this.faceTarget(
      targetPosition,
      0.12
    );
  }

  // =========================================
  // ROTATION
  // =========================================

  faceTarget(
    targetPosition,
    dt
  ) {
    const dx =
      targetPosition.x -
      this.enemy.getPosition().x;

    const dz =
      targetPosition.z -
      this.enemy.getPosition().z;

    const targetRotation =
      Math.atan2(
        dx,
        dz
      );

    let difference =
      targetRotation -
      this.enemy.object.rotation.y;

    difference =
      Math.atan2(
        Math.sin(difference),
        Math.cos(difference)
      );

    this.enemy.object.rotation.y +=
      difference *
      Math.min(
        1,
        dt * 8
      );
  }

  // =========================================
  // FORCE ALERT
  // =========================================

  alert(player) {
    this.target = player;
    this.state = "chase";
  }

  // =========================================
  // FORCE SEARCH
  // =========================================

  search() {
    this.state = "search";
  }

  // =========================================
  // RESET
  // =========================================

  reset() {
    this.state = "idle";

    this.target = null;

    this.wanderTimer = 0;

    this.attackTimer = 0;

    this.thinkTimer = 0;

    this.enemy.velocity.set(
      0,
      0,
      0
    );
  }

  // =========================================
  // GETTERS
  // =========================================

  getState() {
    return this.state;
  }

  getTarget() {
    return this.target;
  }

  isChasing() {
    return this.state === "chase";
  }

  isAttacking() {
    return this.state === "attack";
  }

  isSearching() {
    return this.state === "search";
  }
}
