import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { PlayerController } from "./PlayerController.js";
import { PlayerCamera } from "./PlayerCamera.js";

export class Player {
  constructor(scene, camera, touchControls) {
    this.scene = scene;
    this.camera = camera;
    this.touchControls = touchControls;

    // =========================
    // PLAYER OBJECT
    // =========================

    this.object = new THREE.Group();

    this.object.name = "Player";

    this.scene.add(this.object);

    // =========================
    // CAMERA
    // =========================

    this.cameraController =
      new PlayerCamera(this.camera);

    // =========================
    // CONTROLLER
    // =========================

    this.controller =
      new PlayerController(
        this.scene,
        this.camera,
        this.touchControls,
        this.cameraController
      );

    // =========================
    // PLAYER STATS
    // =========================

    this.level = 1;

    this.xp = 0;

    this.xpToNextLevel = 100;

    this.kills = 0;

    this.deaths = 0;

    // =========================
    // PLAYER STATE
    // =========================

    this.alive = true;

    this.active = true;

    this.spawnPosition =
      new THREE.Vector3(
        0,
        0,
        12
      );

    // =========================
    // EVENTS
    // =========================

    this.onLevelUp = null;
    this.onDeath = null;
    this.onDamage = null;
    this.onRespawn = null;

    // =========================
    // INITIAL POSITION
    // =========================

    this.setSpawnPosition(
      this.spawnPosition
    );
  }

  // =========================================
  // UPDATE
  // =========================================

  update(dt) {
    if (!this.active) {
      return null;
    }

    if (!this.alive) {
      return null;
    }

    const input =
      this.controller.update(dt);

    return input;
  }

  // =========================================
  // DAMAGE
  // =========================================

  takeDamage(amount) {
    if (!this.alive) {
      return;
    }

    const healthBefore =
      this.controller.getHealth();

    this.controller.takeDamage(
      amount
    );

    const healthAfter =
      this.controller.getHealth();

    const actualDamage =
      healthBefore -
      healthAfter;

    if (
      actualDamage > 0 &&
      this.onDamage
    ) {
      this.onDamage(
        actualDamage,
        this.getHealth(),
        this.getArmor()
      );
    }

    if (
      this.controller.isDead()
    ) {
      this.handleDeath();
    }
  }

  // =========================================
  // DEATH
  // =========================================

  handleDeath() {
    if (!this.alive) {
      return;
    }

    this.alive = false;

    this.deaths++;

    if (this.onDeath) {
      this.onDeath(
        this
      );
    }
  }

  // =========================================
  // RESPAWN
  // =========================================

  respawn() {
    this.controller.respawn();

    this.cameraController.reset();

    this.alive = true;

    this.setSpawnPosition(
      this.spawnPosition
    );

    if (this.onRespawn) {
      this.onRespawn(
        this
      );
    }
  }

  // =========================================
  // SPAWN POSITION
  // =========================================

  setSpawnPosition(
    position
  ) {
    if (!position) {
      return;
    }

    this.spawnPosition.copy(
      position
    );

    this.controller.setSpawnPosition(
      position
    );

    this.cameraController.setPosition(
      position
    );
  }

  // =========================================
  // HEALTH
  // =========================================

  getHealth() {
    return this.controller.getHealth();
  }

  getMaxHealth() {
    return this.controller.maxHealth;
  }

  getArmor() {
    return this.controller.getArmor();
  }

  getMaxArmor() {
    return this.controller.maxArmor;
  }

  // =========================================
  // HEAL
  // =========================================

  heal(amount) {
    this.controller.heal(
      amount
    );
  }

  restoreArmor(amount) {
    this.controller.restoreArmor(
      amount
    );
  }

  // =========================================
  // EXPERIENCE
  // =========================================

  addXP(amount) {
    if (amount <= 0) {
      return;
    }

    this.xp += amount;

    /*
     * A single action can give enough
     * XP for multiple levels.
     */
    while (
      this.xp >=
      this.xpToNextLevel
    ) {
      this.xp -=
        this.xpToNextLevel;

      this.levelUp();
    }
  }

  levelUp() {
    this.level++;

    /*
     * XP requirements increase gradually.
     */
    this.xpToNextLevel =
      Math.floor(
        100 *
        Math.pow(
          1.18,
          this.level - 1
        )
      );

    /*
     * Small permanent progression rewards.
     */
    this.controller.maxHealth += 5;

    this.controller.health =
      Math.min(
        this.controller.maxHealth,
        this.controller.health + 5
      );

    if (this.onLevelUp) {
      this.onLevelUp(
        this.level,
        this.xpToNextLevel
      );
    }
  }

  // =========================================
  // KILLS
  // =========================================

  addKill(
    xpReward = 25
  ) {
    this.kills++;

    this.addXP(
      xpReward
    );
  }

  getKills() {
    return this.kills;
  }

  getDeaths() {
    return this.deaths;
  }

  // =========================================
  // XP INFO
  // =========================================

  getLevel() {
    return this.level;
  }

  getXP() {
    return this.xp;
  }

  getXPToNextLevel() {
    return this.xpToNextLevel;
  }

  getXPProgress() {
    if (
      this.xpToNextLevel <= 0
    ) {
      return 0;
    }

    return THREE.MathUtils.clamp(
      this.xp /
        this.xpToNextLevel,
      0,
      1
    );
  }

  // =========================================
  // POSITION
  // =========================================

  getPosition() {
    return this.controller.getPosition();
  }

  getVelocity() {
    return this.controller.getVelocity();
  }

  // =========================================
  // MOVEMENT STATE
  // =========================================

  isMoving() {
    return this.controller.isMoving();
  }

  isGrounded() {
    return this.controller.isGrounded();
  }

  isDead() {
    return !this.alive;
  }

  // =========================================
  // CAMERA
  // =========================================

  getCameraController() {
    return this.cameraController;
  }

  getCamera() {
    return this.camera;
  }

  // =========================================
  // CONTROLLER
  // =========================================

  getController() {
    return this.controller;
  }

  // =========================================
  // ACTIVE STATE
  // =========================================

  setActive(active) {
    this.active = !!active;
  }

  isActive() {
    return this.active;
  }

  // =========================================
  // RESET
  // =========================================

  reset() {
    this.level = 1;

    this.xp = 0;

    this.xpToNextLevel = 100;

    this.kills = 0;

    this.deaths = 0;

    this.alive = true;

    this.active = true;

    this.controller.respawn();

    this.cameraController.reset();

    this.setSpawnPosition(
      this.spawnPosition
    );
  }

  // =========================================
  // DESTROY
  // =========================================

  destroy() {
    if (
      this.object &&
      this.object.parent
    ) {
      this.object.parent.remove(
        this.object
      );
    }

    this.controller = null;
    this.cameraController = null;
    this.touchControls = null;
  }
}
