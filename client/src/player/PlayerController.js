import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class PlayerController {
  constructor(scene, camera, touchControls, cameraController) {
    this.scene = scene;
    this.camera = camera;
    this.controls = touchControls;
    this.cameraController = cameraController;

    // =========================
    // PLAYER POSITION
    // =========================

    this.position = new THREE.Vector3(
      0,
      0,
      12
    );

    this.spawnPosition = new THREE.Vector3(
      0,
      0,
      12
    );

    // =========================
    // MOVEMENT
    // =========================

    this.walkSpeed = 3.2;
    this.sprintSpeed = 5.2;
    this.crouchSpeed = 1.7;

    this.acceleration = 14;
    this.deceleration = 18;

    this.velocity = new THREE.Vector3();

    // =========================
    // JUMP / GRAVITY
    // =========================

    this.verticalVelocity = 0;

    this.gravity = 18;

    this.jumpForce = 6.2;

    this.grounded = true;

    // =========================
    // PLAYER DIMENSIONS
    // =========================

    this.radius = 0.38;

    this.standingHeight = 1.68;
    this.crouchingHeight = 1.05;

    // =========================
    // HEALTH
    // =========================

    this.maxHealth = 100;
    this.health = 100;

    this.maxArmor = 50;
    this.armor = 50;

    this.dead = false;

    // =========================
    // MOVEMENT VECTORS
    // =========================

    this.forward = new THREE.Vector3();
    this.right = new THREE.Vector3();

    this.moveDirection =
      new THREE.Vector3();

    // =========================
    // PLAYER OBJECT
    // =========================

    this.body =
      new THREE.Group();

    this.body.position.copy(
      this.position
    );

    this.scene.add(
      this.body
    );

    /*
     * Temporary hidden body.
     *
     * The actual first-person arms,
     * weapon and character model will
     * be added later.
     */
    this.createDebugBody();
  }

  createDebugBody() {
    const geometry =
      new THREE.CapsuleGeometry(
        0.32,
        1.1,
        8,
        16
      );

    const material =
      new THREE.MeshStandardMaterial({
        color: 0x26313a,
        roughness: 0.8,
        metalness: 0.1
      });

    this.debugBody =
      new THREE.Mesh(
        geometry,
        material
      );

    this.debugBody.position.y =
      0.95;

    // Hidden because this is FPS view.
    this.debugBody.visible = false;

    this.body.add(
      this.debugBody
    );
  }

  update(dt) {
    if (this.dead) {
      return;
    }

    const input =
      this.controls.update();

    this.updateMovement(
      input,
      dt
    );

    this.updateVerticalMovement(
      input,
      dt
    );

    this.updatePosition(
      dt
    );

    this.cameraController.update(
      this.position,
      input,
      dt
    );

    return input;
  }

  // =========================
  // MOVEMENT
  // =========================

  updateMovement(
    input,
    dt
  ) {
    let moveX =
      input.moveX || 0;

    let moveY =
      input.moveY || 0;

    const magnitude =
      Math.sqrt(
        moveX * moveX +
        moveY * moveY
      );

    /*
     * Prevent diagonal movement
     * from becoming faster.
     */
    if (magnitude > 1) {
      moveX /= magnitude;
      moveY /= magnitude;
    }

    /*
     * Get camera-relative
     * forward and right directions.
     */
    this.cameraController.getForwardDirection(
      this.forward
    );

    this.cameraController.getRightDirection(
      this.right
    );

    this.moveDirection.set(
      0,
      0,
      0
    );

    /*
     * Left/right movement.
     */
    this.moveDirection.addScaledVector(
      this.right,
      moveX
    );

    /*
     * Forward/backward movement.
     *
     * moveY is negative when pushing
     * the joystick forward.
     */
    this.moveDirection.addScaledVector(
      this.forward,
      -moveY
    );

    /*
     * Ignore tiny joystick movement.
     */
    if (
      this.moveDirection.lengthSq() <
      0.0025
    ) {
      this.moveDirection.set(
        0,
        0,
        0
      );
    } else {
      this.moveDirection.normalize();
    }

    // =========================
    // SPEED
    // =========================

    let targetSpeed =
      this.walkSpeed;

    if (input.crouching) {
      targetSpeed =
        this.crouchSpeed;
    } else if (
      input.sprinting &&
      magnitude > 0.2
    ) {
      targetSpeed =
        this.sprintSpeed;
    }

    const targetVelocity =
      this.moveDirection.clone()
        .multiplyScalar(
          targetSpeed *
          Math.min(
            1,
            magnitude
          )
        );

    /*
     * Smooth acceleration and
     * deceleration.
     */
    const smoothing =
      magnitude > 0.05
        ? this.acceleration
        : this.deceleration;

    this.velocity.x =
      THREE.MathUtils.damp(
        this.velocity.x,
        targetVelocity.x,
        smoothing,
        dt
      );

    this.velocity.z =
      THREE.MathUtils.damp(
        this.velocity.z,
        targetVelocity.z,
        smoothing,
        dt
      );
  }

  // =========================
  // JUMP / GRAVITY
  // =========================

  updateVerticalMovement(
    input,
    dt
  ) {
    /*
     * Jump.
     */
    if (
      input.jump &&
      this.grounded &&
      !input.crouching
    ) {
      this.verticalVelocity =
        this.jumpForce;

      this.grounded = false;
    }

    /*
     * Gravity.
     */
    if (!this.grounded) {
      this.verticalVelocity -=
        this.gravity * dt;
    }

    /*
     * Ground collision.
     */
    if (
      this.position.y +
      this.verticalVelocity * dt <=
      0
    ) {
      this.position.y = 0;

      this.verticalVelocity = 0;

      this.grounded = true;
    }
  }

  // =========================
  // POSITION
  // =========================

  updatePosition(dt) {
    this.position.x +=
      this.velocity.x * dt;

    this.position.y +=
      this.verticalVelocity * dt;

    this.position.z +=
      this.velocity.z * dt;

    /*
     * Temporary level boundary.
     *
     * Later this will be replaced
     * with proper collision detection.
     */
    const limit = 48;

    this.position.x =
      THREE.MathUtils.clamp(
        this.position.x,
        -limit,
        limit
      );

    this.position.z =
      THREE.MathUtils.clamp(
        this.position.z,
        -limit,
        limit
      );

    this.body.position.copy(
      this.position
    );
  }

  // =========================
  // DAMAGE
  // =========================

  takeDamage(amount) {
    if (this.dead) {
      return;
    }

    let damage =
      Math.max(
        0,
        amount
      );

    /*
     * Armor absorbs 60% of incoming
     * damage until armor is depleted.
     */
    if (this.armor > 0) {
      const absorbed =
        Math.min(
          this.armor,
          damage * 0.6
        );

      this.armor -=
        absorbed;

      damage -=
        absorbed;
    }

    this.health -=
      damage;

    this.health =
      Math.max(
        0,
        this.health
      );

    /*
     * Camera impact effect.
     */
    if (this.cameraController) {
      this.cameraController.addImpact(
        Math.min(
          0.18,
          amount / 100
        )
      );
    }

    if (
      this.health <= 0
    ) {
      this.die();
    }
  }

  // =========================
  // HEALING
  // =========================

  heal(amount) {
    if (this.dead) {
      return;
    }

    this.health =
      Math.min(
        this.maxHealth,
        this.health + amount
      );
  }

  restoreArmor(amount) {
    if (this.dead) {
      return;
    }

    this.armor =
      Math.min(
        this.maxArmor,
        this.armor + amount
      );
  }

  // =========================
  // DEATH
  // =========================

  die() {
    this.dead = true;

    this.velocity.set(
      0,
      0,
      0
    );

    this.verticalVelocity = 0;
  }

  // =========================
  // RESPAWN
  // =========================

  respawn() {
    this.position.copy(
      this.spawnPosition
    );

    this.velocity.set(
      0,
      0,
      0
    );

    this.verticalVelocity = 0;

    this.health =
      this.maxHealth;

    this.armor =
      this.maxArmor;

    this.grounded = true;

    this.dead = false;

    this.body.position.copy(
      this.position
    );

    if (this.cameraController) {
      this.cameraController.reset();

      this.cameraController.setPosition(
        this.position
      );
    }
  }

  // =========================
  // SPAWN
  // =========================

  setSpawnPosition(
    position
  ) {
    this.spawnPosition.copy(
      position
    );

    this.position.copy(
      position
    );

    this.body.position.copy(
      position
    );

    if (this.cameraController) {
      this.cameraController.setPosition(
        position
      );
    }
  }

  // =========================
  // GETTERS
  // =========================

  getPosition() {
    return this.position;
  }

  getVelocity() {
    return this.velocity;
  }

  getHealth() {
    return this.health;
  }

  getArmor() {
    return this.armor;
  }

  isMoving() {
    return (
      this.velocity.lengthSq() >
      0.01
    );
  }

  isGrounded() {
    return this.grounded;
  }

  isDead() {
    return this.dead;
  }
}
