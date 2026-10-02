import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class Enemy {
  constructor(scene, options = {}) {
    this.scene = scene;

    // =========================
    // IDENTITY
    // =========================

    this.name =
      options.name || "Enemy";

    this.type =
      options.type || "soldier";

    // =========================
    // STATS
    // =========================

    this.maxHealth =
      options.health ?? 100;

    this.health =
      this.maxHealth;

    this.damage =
      options.damage ?? 10;

    this.moveSpeed =
      options.moveSpeed ?? 1.8;

    this.attackRange =
      options.attackRange ?? 18;

    this.detectionRange =
      options.detectionRange ?? 30;

    this.attackCooldown =
      options.attackCooldown ?? 1.2;

    this.attackTimer = 0;

    // =========================
    // STATE
    // =========================

    this.alive = true;

    this.alerted = false;

    this.target = null;

    this.spawnPosition =
      new THREE.Vector3();

    // =========================
    // OBJECT
    // =========================

    this.object =
      new THREE.Group();

    this.object.name =
      `Enemy_${this.name}`;

    this.scene.add(
      this.object
    );

    // =========================
    // MOVEMENT
    // =========================

    this.velocity =
      new THREE.Vector3();

    this.direction =
      new THREE.Vector3();

    this.toTarget =
      new THREE.Vector3();

    // =========================
    // HIT / DAMAGE
    // =========================

    this.lastDamageTime = 0;

    this.hitFlashTimer = 0;

    // =========================
    // CALLBACKS
    // =========================

    this.onDeath = null;
    this.onDamage = null;
    this.onAttack = null;

    // =========================
    // CREATE CHARACTER
    // =========================

    this.createCharacter();
  }

  // =========================================
  // CHARACTER MODEL
  // =========================================

  createCharacter() {
    /*
     * This is a temporary humanoid character
     * made from multiple meshes.
     *
     * Later this class can load a detailed
     * GLB/GLTF animated soldier model.
     */

    this.model =
      new THREE.Group();

    this.model.name =
      "EnemyCharacter";

    this.object.add(
      this.model
    );

    // -------------------------
    // MATERIALS
    // -------------------------

    const uniformMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x30343a,
        roughness: 0.85,
        metalness: 0.05
      });

    const armorMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x171a1d,
        roughness: 0.65,
        metalness: 0.25
      });

    const skinMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x9b735c,
        roughness: 0.9
      });

    const bootMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x101214,
        roughness: 0.8
      });

    // -------------------------
    // BODY
    // -------------------------

    const torsoGeometry =
      new THREE.CapsuleGeometry(
        0.28,
        0.58,
        6,
        10
      );

    const torso =
      new THREE.Mesh(
        torsoGeometry,
        uniformMaterial
      );

    torso.position.y =
      1.15;

    torso.scale.set(
      1,
      1,
      0.72
    );

    this.model.add(
      torso
    );

    this.torso = torso;

    // -------------------------
    // ARMOR VEST
    // -------------------------

    const vestGeometry =
      new THREE.BoxGeometry(
        0.58,
        0.5,
        0.3
      );

    const vest =
      new THREE.Mesh(
        vestGeometry,
        armorMaterial
      );

    vest.position.set(
      0,
      1.2,
      -0.02
    );

    this.model.add(
      vest
    );

    this.vest = vest;

    // -------------------------
    // HEAD
    // -------------------------

    const headGeometry =
      new THREE.SphereGeometry(
        0.19,
        12,
        10
      );

    const head =
      new THREE.Mesh(
        headGeometry,
        skinMaterial
      );

    head.position.y =
      1.72;

    this.model.add(
      head
    );

    this.head = head;

    // -------------------------
    // HELMET
    // -------------------------

    const helmetGeometry =
      new THREE.SphereGeometry(
        0.22,
        12,
        8,
        0,
        Math.PI * 2,
        0,
        Math.PI * 0.55
      );

    const helmet =
      new THREE.Mesh(
        helmetGeometry,
        armorMaterial
      );

    helmet.position.y =
      1.77;

    this.model.add(
      helmet
    );

    // -------------------------
    // LEGS
    // -------------------------

    const legGeometry =
      new THREE.CapsuleGeometry(
        0.11,
        0.65,
        5,
        8
      );

    this.leftLeg =
      new THREE.Mesh(
        legGeometry,
        uniformMaterial
      );

    this.rightLeg =
      new THREE.Mesh(
        legGeometry,
        uniformMaterial
      );

    this.leftLeg.position.set(
      -0.15,
      0.55,
      0
    );

    this.rightLeg.position.set(
      0.15,
      0.55,
      0
    );

    this.model.add(
      this.leftLeg
    );

    this.model.add(
      this.rightLeg
    );

    // -------------------------
    // BOOTS
    // -------------------------

    const bootGeometry =
      new THREE.BoxGeometry(
        0.18,
        0.14,
        0.32
      );

    this.leftBoot =
      new THREE.Mesh(
        bootGeometry,
        bootMaterial
      );

    this.rightBoot =
      new THREE.Mesh(
        bootGeometry,
        bootMaterial
      );

    this.leftBoot.position.set(
      -0.15,
      0.12,
      -0.06
    );

    this.rightBoot.position.set(
      0.15,
      0.12,
      -0.06
    );

    this.model.add(
      this.leftBoot
    );

    this.model.add(
      this.rightBoot
    );

    // -------------------------
    // ARMS
    // -------------------------

    const armGeometry =
      new THREE.CapsuleGeometry(
        0.09,
        0.48,
        5,
        8
      );

    this.leftArm =
      new THREE.Mesh(
        armGeometry,
        uniformMaterial
      );

    this.rightArm =
      new THREE.Mesh(
        armGeometry,
        uniformMaterial
      );

    this.leftArm.position.set(
      -0.38,
      1.2,
      -0.02
    );

    this.rightArm.position.set(
      0.38,
      1.2,
      -0.02
    );

    this.leftArm.rotation.z =
      -0.18;

    this.rightArm.rotation.z =
      0.18;

    this.model.add(
      this.leftArm
    );

    this.model.add(
      this.rightArm
    );

    // -------------------------
    // WEAPON
    // -------------------------

    const weaponGeometry =
      new THREE.BoxGeometry(
        0.08,
        0.1,
        0.65
      );

    const weaponMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x111316,
        roughness: 0.45,
        metalness: 0.65
      });

    this.weapon =
      new THREE.Mesh(
        weaponGeometry,
        weaponMaterial
      );

    this.weapon.position.set(
      0,
      1.12,
      -0.35
    );

    this.weapon.rotation.x =
      Math.PI / 2;

    this.model.add(
      this.weapon
    );

    // -------------------------
    // HITBOX
    // -------------------------

    const hitboxGeometry =
      new THREE.CapsuleGeometry(
        0.42,
        1.25,
        6,
        10
      );

    const hitboxMaterial =
      new THREE.MeshBasicMaterial({
        visible: false
      });

    this.hitbox =
      new THREE.Mesh(
        hitboxGeometry,
        hitboxMaterial
      );

    this.hitbox.position.y =
      0.95;

    this.hitbox.userData.enemy =
      this;

    this.object.add(
      this.hitbox
    );

    // Register enemy reference on
    // every visible body component.
    this.registerHitTargets(
      this.model
    );
  }

  registerHitTargets(object) {
    object.traverse(
      (child) => {
        child.userData.enemy =
          this;
      }
    );

    this.hitbox.userData.enemy =
      this;
  }

  // =========================================
  // UPDATE
  // =========================================

  update(dt, player) {
    if (!this.alive) {
      return;
    }

    this.attackTimer -= dt;

    this.hitFlashTimer =
      Math.max(
        0,
        this.hitFlashTimer - dt
      );

    if (player) {
      this.updateAI(
        player,
        dt
      );
    }

    this.updateMovement(
      dt
    );

    this.updateAnimation(
      dt
    );
  }

  // =========================================
  // AI
  // =========================================

  updateAI(
    player,
    dt
  ) {
    const playerPosition =
      player.getPosition
        ? player.getPosition()
        : player.position;

    if (!playerPosition) {
      return;
    }

    this.toTarget.subVectors(
      playerPosition,
      this.object.position
    );

    const distance =
      this.toTarget.length();

    if (
      distance <=
      this.detectionRange
    ) {
      this.alerted = true;
      this.target = player;
    }

    if (!this.alerted) {
      this.velocity.set(
        0,
        0,
        0
      );

      return;
    }

    if (
      distance >
      this.attackRange
    ) {
      this.direction
        .copy(this.toTarget)
        .normalize();

      this.velocity.copy(
        this.direction
      );

      this.velocity.multiplyScalar(
        this.moveSpeed
      );

      /*
       * Face the player while moving.
       */
      this.faceTarget(
        playerPosition,
        dt
      );
    } else {
      this.velocity.set(
        0,
        0,
        0
      );

      this.faceTarget(
        playerPosition,
        dt
      );

      this.attack(
        player
      );
    }
  }

  // =========================================
  // MOVEMENT
  // =========================================

  updateMovement(dt) {
    this.object.position.x +=
      this.velocity.x * dt;

    this.object.position.z +=
      this.velocity.z * dt;
  }

  // =========================================
  // FACE TARGET
  // =========================================

  faceTarget(
    targetPosition,
    dt
  ) {
    const dx =
      targetPosition.x -
      this.object.position.x;

    const dz =
      targetPosition.z -
      this.object.position.z;

    const targetRotation =
      Math.atan2(
        dx,
        dz
      );

    let difference =
      targetRotation -
      this.object.rotation.y;

    difference =
      Math.atan2(
        Math.sin(difference),
        Math.cos(difference)
      );

    this.object.rotation.y +=
      difference *
      Math.min(
        1,
        dt * 8
      );
  }

  // =========================================
  // ATTACK
  // =========================================

  attack(player) {
    if (
      this.attackTimer > 0
    ) {
      return;
    }

    this.attackTimer =
      this.attackCooldown;

    if (
      this.onAttack
    ) {
      this.onAttack(
        this,
        player,
        this.damage
      );
    }
  }

  // =========================================
  // DAMAGE
  // =========================================

  takeDamage(
    amount,
    hitPoint = null
  ) {
    if (!this.alive) {
      return;
    }

    const damage =
      Math.max(
        0,
        amount
      );

    this.health -=
      damage;

    this.hitFlashTimer =
      0.08;

    /*
     * Brief visual damage flash.
     */
    this.setHitFlash(
      true
    );

    setTimeout(
      () => {
        if (this.alive) {
          this.setHitFlash(
            false
          );
        }
      },
      80
    );

    if (
      this.onDamage
    ) {
      this.onDamage(
        this,
        damage,
        hitPoint
      );
    }

    if (
      this.health <= 0
    ) {
      this.die();
    }
  }

  // =========================================
  // HIT FLASH
  // =========================================

  setHitFlash(active) {
    const material =
      this.torso?.material;

    if (!material) {
      return;
    }

    if (active) {
      material.emissive.set(
        0x441111
      );

      material.emissiveIntensity =
        0.7;
    } else {
      material.emissive.set(
        0x000000
      );

      material.emissiveIntensity =
        0;
    }
  }

  // =========================================
  // DEATH
  // =========================================

  die() {
    if (!this.alive) {
      return;
    }

    this.alive = false;

    this.velocity.set(
      0,
      0,
      0
    );

    /*
     * Small death animation for now.
     * Later this will be replaced with
     * a proper animated death clip.
     */
    this.model.rotation.x =
      -Math.PI * 0.45;

    if (this.onDeath) {
      this.onDeath(
        this
      );
    }
  }

  // =========================================
  // SPAWN
  // =========================================

  setPosition(
    position
  ) {
    this.object.position.copy(
      position
    );

    this.spawnPosition.copy(
      position
    );
  }

  getPosition() {
    return this.object.position;
  }

  // =========================================
  // STATUS
  // =========================================

  getHealth() {
    return this.health;
  }

  getMaxHealth() {
    return this.maxHealth;
  }

  getHealthPercent() {
    if (
      this.maxHealth <= 0
    ) {
      return 0;
    }

    return THREE.MathUtils.clamp(
      this.health /
        this.maxHealth,
      0,
      1
    );
  }

  isAlive() {
    return this.alive;
  }

  isAlerted() {
    return this.alerted;
  }

  // =========================================
  // RESET
  // =========================================

  reset() {
    this.health =
      this.maxHealth;

    this.alive = true;

    this.alerted = false;

    this.target = null;

    this.attackTimer = 0;

    this.velocity.set(
      0,
      0,
      0
    );

    this.model.rotation.set(
      0,
      0,
      0
    );

    this.object.position.copy(
      this.spawnPosition
    );

    this.setHitFlash(
      false
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

    this.target = null;
    this.scene = null;

    this.onDeath = null;
    this.onDamage = null;
    this.onAttack = null;
  }
}
