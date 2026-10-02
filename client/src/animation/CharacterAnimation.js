import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class CharacterAnimation {
  constructor(animationManager, character) {
    this.animationManager = animationManager;
    this.character = character;

    this.state = "idle";
    this.previousState = null;

    this.speed = 0;
    this.aiming = false;
    this.crouching = false;
    this.dead = false;

    this.body = character?.body || character;
    this.root = character?.object || character;

    this.bobTime = 0;
    this.recoilTime = 0;
    this.hitTime = 0;

    this.basePosition = new THREE.Vector3();
    this.baseRotation = new THREE.Euler();

    if (this.root) {
      this.basePosition.copy(
        this.root.position
      );

      this.baseRotation.copy(
        this.root.rotation
      );
    }
  }

  setState(state) {
    if (!state) {
      return;
    }

    if (this.state === state) {
      return;
    }

    this.previousState =
      this.state;

    this.state = state;

    this.playStateAnimation();
  }

  playStateAnimation() {
    if (!this.animationManager) {
      return;
    }

    if (!this.body) {
      return;
    }

    const animations = {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      crouch: "Crouch",
      shoot: "Shoot",
      reload: "Reload",
      hit: "Hit",
      death: "Death"
    };

    const animationName =
      animations[this.state];

    if (
      animationName &&
      this.animationManager.hasAnimation(
        this.body,
        animationName
      )
    ) {
      const loop =
        this.state === "death" ||
        this.state === "shoot" ||
        this.state === "reload"
          ? THREE.LoopOnce
          : THREE.LoopRepeat;

      this.animationManager.play(
        this.body,
        animationName,
        {
          loop,
          clampWhenFinished:
            this.state === "death" ||
            this.state === "reload",
          fade: 0.12
        }
      );
    }
  }

  update(
    dt,
    movement = {}
  ) {
    if (!Number.isFinite(dt)) {
      return;
    }

    if (this.dead) {
      return;
    }

    const velocity =
      movement.velocity ||
      new THREE.Vector3();

    this.speed =
      movement.speed ??
      velocity.length();

    this.aiming =
      movement.aiming ??
      false;

    this.crouching =
      movement.crouching ??
      false;

    this.updateState();

    this.updateMovementAnimation(
      dt
    );

    this.updateProceduralMotion(
      dt
    );

    this.updateEffects(
      dt
    );
  }

  updateState() {
    if (this.dead) {
      this.setState(
        "death"
      );
      return;
    }

    if (this.crouching) {
      this.setState(
        "crouch"
      );
      return;
    }

    if (
      this.state === "shoot" ||
      this.state === "reload" ||
      this.state === "hit"
    ) {
      return;
    }

    if (this.speed < 0.15) {
      this.setState(
        "idle"
      );
      return;
    }

    if (this.speed > 3.8) {
      this.setState(
        "run"
      );
      return;
    }

    this.setState(
      "walk"
    );
  }

  updateMovementAnimation(
    dt
  ) {
    if (!this.root) {
      return;
    }

    if (
      this.speed < 0.15 ||
      this.dead
    ) {
      return;
    }

    this.bobTime +=
      dt *
      (
        5 +
        Math.min(
          this.speed,
          6
        ) * 1.8
      );
  }

  updateProceduralMotion(
    dt
  ) {
    if (!this.root) {
      return;
    }

    if (this.dead) {
      return;
    }

    const moving =
      this.speed > 0.15;

    if (moving) {
      const bobAmount =
        this.crouching
          ? 0.018
          : 0.035;

      const side =
        Math.sin(
          this.bobTime
        ) *
        bobAmount;

      const vertical =
        Math.abs(
          Math.cos(
            this.bobTime
          )
        ) *
        bobAmount;

      this.root.position.y +=
        (
          vertical -
          (this.root.position.y -
            this.basePosition.y)
        ) *
        Math.min(
          1,
          dt * 12
        );

      this.root.rotation.z +=
        (
          side * 0.35 -
          this.root.rotation.z
        ) *
        Math.min(
          1,
          dt * 8
        );
    } else {
      this.root.position.y +=
        (
          this.basePosition.y -
          this.root.position.y
        ) *
        Math.min(
          1,
          dt * 8
        );

      this.root.rotation.z +=
        (
          this.baseRotation.z -
          this.root.rotation.z
        ) *
        Math.min(
          1,
          dt * 8
        );
    }
  }

  updateEffects(dt) {
    if (
      this.recoilTime > 0
    ) {
      this.recoilTime -= dt;

      const amount =
        this.recoilTime * 0.08;

      if (this.root) {
        this.root.rotation.x =
          this.baseRotation.x -
          amount;
      }
    }

    if (
      this.hitTime > 0
    ) {
      this.hitTime -= dt;
    }
  }

  shoot() {
    if (this.dead) {
      return;
    }

    this.setState(
      "shoot"
    );

    this.recoilTime =
      0.18;

    this.playOneShot(
      "Shoot"
    );
  }

  reload() {
    if (this.dead) {
      return;
    }

    this.setState(
      "reload"
    );

    this.playOneShot(
      "Reload"
    );
  }

  hit() {
    if (this.dead) {
      return;
    }

    this.hitTime =
      0.25;

    this.setState(
      "hit"
    );

    this.playOneShot(
      "Hit"
    );
  }

  die() {
    if (this.dead) {
      return;
    }

    this.dead = true;

    this.setState(
      "death"
    );

    this.playOneShot(
      "Death"
    );
  }

  revive() {
    this.dead = false;

    this.state =
      "idle";

    this.previousState =
      null;

    this.recoilTime =
      0;

    this.hitTime =
      0;

    if (this.root) {
      this.root.position.copy(
        this.basePosition
      );

      this.root.rotation.copy(
        this.baseRotation
      );
    }

    this.playStateAnimation();
  }

  playOneShot(
    animationName
  ) {
    if (
      !this.animationManager ||
      !this.body
    ) {
      return;
    }

    if (
      !this.animationManager.hasAnimation(
        this.body,
        animationName
      )
    ) {
      return;
    }

    this.animationManager.play(
      this.body,
      animationName,
      {
        loop: THREE.LoopOnce,
        repetitions: 1,
        clampWhenFinished: false,
        fade: 0.08
      }
    );
  }

  setAiming(
    aiming
  ) {
    this.aiming =
      Boolean(aiming);
  }

  setCrouching(
    crouching
  ) {
    this.crouching =
      Boolean(crouching);
  }

  setSpeed(
    speed
  ) {
    this.speed =
      Math.max(
        0,
        speed || 0
      );
  }

  getState() {
    return this.state;
  }

  getPreviousState() {
    return this.previousState;
  }

  isDead() {
    return this.dead;
  }

  reset() {
    this.dead = false;
    this.state = "idle";
    this.previousState = null;

    this.speed = 0;
    this.aiming = false;
    this.crouching = false;

    this.bobTime = 0;
    this.recoilTime = 0;
    this.hitTime = 0;

    if (this.root) {
      this.root.position.copy(
        this.basePosition
      );

      this.root.rotation.copy(
        this.baseRotation
      );
    }

    this.playStateAnimation();
  }

  destroy() {
    if (
      this.animationManager &&
      this.body
    ) {
      this.animationManager.remove(
        this.body
      );
    }

    this.character = null;
    this.body = null;
    this.root = null;
  }
}
