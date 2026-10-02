import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class PlayerCamera {
  constructor(camera) {
    this.camera = camera;

    this.yaw = 0;
    this.pitch = 0;

    // Touch sensitivity
    this.sensitivityX = 0.0022;
    this.sensitivityY = 0.0018;

    // Prevent looking completely upside down
    this.maxPitch = THREE.MathUtils.degToRad(82);

    // Smooth camera movement
    this.positionSmoothness = 14;

    // FPS camera height
    this.standHeight = 1.68;
    this.crouchHeight = 1.05;
    this.currentHeight = this.standHeight;

    // Head bob
    this.bobTime = 0;
    this.bobAmount = 0;
    this.bobTarget = 0;

    // Damage/impact camera effect
    this.impact = 0;

    this.targetPosition = new THREE.Vector3();

    this.forward = new THREE.Vector3();
    this.right = new THREE.Vector3();

    this.camera.rotation.order = "YXZ";

    this.applyRotation();
  }

  update(
    playerPosition,
    controls = {},
    dt = 0.016
  ) {
    if (!playerPosition) return;

    const moveX = controls.moveX || 0;
    const moveY = controls.moveY || 0;

    const lookX = controls.lookX || 0;
    const lookY = controls.lookY || 0;

    const crouching = !!controls.crouching;
    const sprinting = !!controls.sprinting;

    // Touch look
    const limitedLookX = THREE.MathUtils.clamp(
      lookX,
      -80,
      80
    );

    const limitedLookY = THREE.MathUtils.clamp(
      lookY,
      -80,
      80
    );

    this.yaw -=
      limitedLookX * this.sensitivityX;

    this.pitch -=
      limitedLookY * this.sensitivityY;

    this.pitch = THREE.MathUtils.clamp(
      this.pitch,
      -this.maxPitch,
      this.maxPitch
    );

    // Crouching camera height
    const targetHeight = crouching
      ? this.crouchHeight
      : this.standHeight;

    this.currentHeight = THREE.MathUtils.damp(
      this.currentHeight,
      targetHeight,
      12,
      dt
    );

    // Movement head bob
    const movementAmount = Math.min(
      1,
      Math.sqrt(
        moveX * moveX +
        moveY * moveY
      )
    );

    if (movementAmount > 0.05) {
      const bobSpeed = sprinting
        ? 13
        : 9;

      this.bobTime +=
        dt *
        bobSpeed *
        movementAmount;

      this.bobTarget = sprinting
        ? 0.035
        : 0.018;
    } else {
      this.bobTarget = 0;
    }

    this.bobAmount = THREE.MathUtils.damp(
      this.bobAmount,
      this.bobTarget,
      10,
      dt
    );

    const bobX =
      Math.sin(this.bobTime * 0.5) *
      this.bobAmount;

    const bobY =
      Math.abs(
        Math.sin(this.bobTime)
      ) *
      this.bobAmount;

    // Impact effect
    this.impact = THREE.MathUtils.damp(
      this.impact,
      0,
      8,
      dt
    );

    const impactOffset =
      Math.sin(
        this.bobTime * 2
      ) *
      this.impact;

    // Target camera position
    this.targetPosition.set(
      playerPosition.x + bobX,
      playerPosition.y +
        this.currentHeight +
        bobY +
        impactOffset,
      playerPosition.z
    );

    // Smooth position
    this.camera.position.lerp(
      this.targetPosition,
      1 -
        Math.exp(
          -this.positionSmoothness * dt
        )
    );

    this.applyRotation();
  }

  applyRotation() {
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
    this.camera.rotation.z = 0;
  }

  getForwardDirection(
    target = this.forward
  ) {
    target.set(
      0,
      0,
      -1
    );

    target.applyEuler(
      this.camera.rotation
    );

    // Movement should stay horizontal
    target.y = 0;

    if (target.lengthSq() > 0) {
      target.normalize();
    }

    return target;
  }

  getLookDirection(
    target = new THREE.Vector3()
  ) {
    target.set(
      0,
      0,
      -1
    );

    target.applyQuaternion(
      this.camera.quaternion
    );

    return target.normalize();
  }

  getRightDirection(
    target = this.right
  ) {
    target.set(
      1,
      0,
      0
    );

    target.applyEuler(
      this.camera.rotation
    );

    target.y = 0;

    if (target.lengthSq() > 0) {
      target.normalize();
    }

    return target;
  }

  setPosition(position) {
    if (!position) return;

    this.camera.position.copy(
      position
    );

    this.camera.position.y +=
      this.currentHeight;
  }

  setRotation(
    yaw,
    pitch = 0
  ) {
    this.yaw = yaw;

    this.pitch = THREE.MathUtils.clamp(
      pitch,
      -this.maxPitch,
      this.maxPitch
    );

    this.applyRotation();
  }

  addImpact(
    amount = 0.08
  ) {
    this.impact += amount;

    this.impact = Math.min(
      this.impact,
      0.25
    );
  }

  reset() {
    this.yaw = 0;
    this.pitch = 0;

    this.bobTime = 0;
    this.bobAmount = 0;
    this.bobTarget = 0;

    this.impact = 0;

    this.currentHeight =
      this.standHeight;

    this.applyRotation();
  }
}
